using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using System.Linq;
using GlimpseCore.Agent;
using GlimpseCore.Agent.Configuration;
using GlimpseCore.Agent.Inspectors;
using GlimpseCore.Agent.Internal.Inspectors;
using GlimpseCore.Agent.Internal.Messaging;
using GlimpseCore.Common.Initialization;
using GlimpseCore.Initialization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace GlimpseCore
{
    public class AgentServices : IRegisterServices
    {
        public void RegisterServices(GlimpseCoreServiceCollectionBuilder services)
        {
            services.AddOptions();

            RegisterPublisher(services);

            //
            // Common
            //
            services.AddMiddlewareAnalysis();
            services.AddTransient<IGlimpseCoreAgent, GlimpseCoreAgent>();
            services.AddSingleton<IAgentBroker, DefaultAgentBroker>();

            //
            // Options
            //
            services.AddTransient<IConfigureOptions<GlimpseCoreAgentOptions>, GlimpseCoreAgentOptionsSetup>();
            services.AddSingleton<IRequestIgnorerUriProvider, DefaultRequestIgnorerUriProvider>();
            services.AddSingleton<IRequestIgnorerStatusCodeProvider, DefaultRequestIgnorerStatusCodeProvider>();
            services.AddSingleton<IRequestIgnorerContentTypeProvider, DefaultRequestIgnorerContentTypeProvider>();
            services.AddSingleton<IExtensionProvider<IRequestIgnorer>, DefaultExtensionProvider<IRequestIgnorer>>();
            services.AddSingleton<IExtensionProvider<IInspectorFunction>, DefaultExtensionProvider<IInspectorFunction>>();
            services.AddSingleton<IExtensionProvider<IInspector>, DefaultExtensionProvider<IInspector>>();
            services.AddSingleton<IExtensionProvider<IAgentStartup>, DefaultExtensionProvider<IAgentStartup>>();

            //
            // Messages
            //
            services.AddSingleton<IMessageConverter, DefaultMessageConverter>();
            services.AddTransient<IMessagePayloadFormatter, DefaultMessagePayloadFormatter>();
            services.AddTransient<IMessageIndexProcessor, DefaultMessageIndexProcessor>();
            services.AddTransient<IMessageTypeProcessor, DefaultMessageTypeProcessor>();

            //
            // Common
            //
            services.AddTransient<IAgentStartupManager, DefaultAgentStartupManager>();
            services.AddTransient<IRequestIgnorerManager, DefaultRequestIgnorerManager>();
            services.AddTransient<IInspectorFunctionManager, DefaultInspectorFunctionManager>();
            services.AddTransient<IExceptionProcessor, ExceptionProcessor>();
            services.AddTransient<WebDiagnosticsListener>();

            if (!services.Any(s => s.ServiceType == typeof(IResourceOptionsProvider)))
                services.AddSingleton<IResourceOptionsProvider, OptionsResourceOptionsProvider>();
        }

        private void RegisterPublisher(GlimpseCoreServiceCollectionBuilder services)
        {
            var configurationBuilder = new ConfigurationBuilder();
            var fileProvider = configurationBuilder.GetFileProvider();

            if (fileProvider.GetFileInfo("glimpsecore.json").Exists)
            {
                var configuration = configurationBuilder.AddJsonFile("glimpsecore.json").Build();
                var section = configuration.GetSection("resources");
                services.Configure<ResourceOptions>(section);

                services.Replace(new ServiceDescriptor(typeof(IMessagePublisher), typeof(HttpMessagePublisher), ServiceLifetime.Transient));
            }

            // TODO: If I reach this line, than GlimpseCore has no way to send data from point A to B. Should we blow up?
        }
    }
}