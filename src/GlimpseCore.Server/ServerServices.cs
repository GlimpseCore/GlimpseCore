using System.Linq;
using GlimpseCore.Common.Initialization;
using GlimpseCore.Initialization;
using GlimpseCore.Server;
using GlimpseCore.Server.Configuration;
using GlimpseCore.Server.Internal;
using GlimpseCore.Server.Resources;
using GlimpseCore.Server.Storage;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;

namespace GlimpseCore
{
    public class ServerServices : IRegisterServices
    {
        public void RegisterServices(GlimpseCoreServiceCollectionBuilder services)
        {
            services.AddOptions();

            //
            // Common
            //
            services.AddSingleton<IServerBroker, DefaultServerBroker>();
            services.AddSingleton<IStorage, InMemoryStorage>();
            services.AddSingleton<IResourceManager, ResourceManager>();

            //
            // Options
            //
            services.AddTransient<IConfigureOptions<GlimpseCoreServerOptions>, GlimpseCoreServerOptionsSetup>();
            services.AddTransient<IExtensionProvider<IAllowClientAccess>, DefaultExtensionProvider<IAllowClientAccess>>();
            services.AddTransient<IExtensionProvider<IAllowAgentAccess>, DefaultExtensionProvider<IAllowAgentAccess>>();
            services.AddTransient<IExtensionProvider<IResource>, DefaultExtensionProvider<IResource>>();
            services.AddTransient<IExtensionProvider<IResourceStartup>, DefaultExtensionProvider<IResourceStartup>>();
            services.AddSingleton<IAllowRemoteProvider, DefaultAllowRemoteProvider>();
            services.AddSingleton<IMetadataProvider, DefaultMetadataProvider>();

            if (!services.Any(s => s.ServiceType == typeof(IMessagePublisher)))
            {
                services.AddSingleton<IMessagePublisher, InProcessPublisher>();
            }


            if (services.Any(s => s.ServiceType == typeof(IResourceOptionsProvider)))
            {
                services.Replace(new ServiceDescriptor(
                    typeof(IResourceOptionsProvider),
                    typeof(DefaultResourceOptionsProvider),
                    ServiceLifetime.Singleton));
            }
            else
            {
                services.AddSingleton<IResourceOptionsProvider, DefaultResourceOptionsProvider>();
            }
        }
    }
}