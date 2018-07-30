using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using GlimpseCore.Initialization;
using GlimpseCore.Server.Configuration;
using GlimpseCore.Server.Internal;
using GlimpseCore.Server.Resources;
using Microsoft.Extensions.Options;

namespace GlimpseCore.Server
{
    public class GlimpseCoreServerMiddleware
    {
        private readonly IEnumerable<IAllowClientAccess> _authorizeClients;
        private readonly IEnumerable<IAllowAgentAccess> _authorizeAgents;
        private readonly GlimpseCoreServerOptions _serverOptions;
        private readonly RequestDelegate _next;
        private readonly RequestDelegate _branch;

        public GlimpseCoreServerMiddleware(RequestDelegate next, IApplicationBuilder app, IExtensionProvider<IAllowClientAccess> authorizeClientProvider, IExtensionProvider<IAllowAgentAccess> authorizeAgentProvider, IExtensionProvider<IResourceStartup> resourceStartupsProvider, IExtensionProvider<IResource> resourceProvider, IResourceManager resourceManager, IOptions<GlimpseCoreServerOptions> serverOptions)
        {
            _authorizeClients = authorizeClientProvider.Instances;
            _authorizeAgents = authorizeAgentProvider.Instances;
            _serverOptions = serverOptions.Value;

            _next = next;
            _branch = BuildBranch(app, resourceStartupsProvider.Instances, resourceProvider.Instances, resourceManager);
        }
        
        public async Task Invoke(HttpContext context)
        {
            await _branch(context);
        }

        public RequestDelegate BuildBranch(IApplicationBuilder app, IEnumerable<IResourceStartup> resourceStartups, IEnumerable<IResource> resources, IResourceManager resourceManager)
        {
            var branchApp = app.New();
            branchApp.Map($"/{_serverOptions.BasePath}", glimpseCoreApp =>
            {
                // REGISTER: resource startups
                foreach (var resourceStartup in resourceStartups)
                {
                    var startupApp = glimpseCoreApp.New();

                    var resourceBuilderStartup = new ResourceBuilder(startupApp, resourceManager);
                    resourceStartup.Configure(resourceBuilderStartup);

                    glimpseCoreApp.Use(next =>
                    {
                        startupApp.Run(next);

                        var startupBranch = startupApp.Build();

                        return context =>
                        {
                            if (CanExecute(context, resourceStartup.Type))
                            {
                                return startupBranch(context);
                            }

                            return next(context);
                        };
                    });
                }

                // REGISTER: resources
                var resourceBuilder = new ResourceBuilder(glimpseCoreApp, resourceManager);
                foreach (var resource in resources)
                {
                    resourceBuilder.Run(resource.Name, resource.Parameters?.GenerateUriTemplate(), resource.Type, resource.Invoke);
                }

                glimpseCoreApp.Run(async context =>
                {
                    // RUN: resources
                    var result = resourceManager.Match(context);
                    if (result != null)
                    {
                        if (CanExecute(context, result.Type))
                        {
                            await result.Resource(context, result.Paramaters);
                        }
                        else
                        {
                            // TODO: Review, do we want a 401, 404 or continue users pipeline 
                            context.Response.StatusCode = 401;
                        }
                    }
                });
            });
            branchApp.Use(subNext => { return async ctx => await _next(ctx); });

            return branchApp.Build();
        }

        public bool CanExecute(HttpContext context, ResourceType type)
        {
            return ResourceType.Agent == type ? AllowAgentAccess(context) : AllowClientAccess(context);
        }
        
        private bool AllowClientAccess(HttpContext context)
        {
            foreach (var authorizeClient in _authorizeClients)
            {
                var allowed = authorizeClient.AllowUser(context);
                if (!allowed)
                {
                    return false;
                }
            }

            return true;
        }
        
        private bool AllowAgentAccess(HttpContext context)
        {
            foreach (var authorizeAgent in _authorizeAgents)
            {
                var allowed = authorizeAgent.AllowAgent(context);
                if (!allowed)
                {
                    return false;
                }
            }

            return true;
        }
    }
}