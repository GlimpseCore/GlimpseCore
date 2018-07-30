using System.Threading.Tasks;
using GlimpseCore.Agent.Configuration;
using GlimpseCore.Agent.Inspectors;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace GlimpseCore.Agent
{
    public class GlimpseCoreAgentMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly RequestDelegate _branch;
        private readonly IRequestIgnorerManager _requestIgnorerManager;

        public GlimpseCoreAgentMiddleware(RequestDelegate next, IApplicationBuilder app, IRequestIgnorerManager requestIgnorerManager, IInspectorFunctionManager inspectorFunctionManager)
        {
            _next = next;
            _requestIgnorerManager = requestIgnorerManager;
            _branch = inspectorFunctionManager.BuildInspectorBranch(next, app);
        }
        
        public async Task Invoke(HttpContext context)
        {
            if (!_requestIgnorerManager.ShouldIgnore(context))
            {
                await _branch(context);
            }
            else
            {
                await _next(context);
            }
        }
    }
}
