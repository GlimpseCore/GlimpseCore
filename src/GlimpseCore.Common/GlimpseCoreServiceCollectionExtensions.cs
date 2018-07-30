using GlimpseCore.Common.Initialization;
using GlimpseCore.Initialization;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace GlimpseCore
{
    public static class GlimpseCoreServiceCollectionExtensions
    {
        public static GlimpseCoreServiceCollectionBuilder AddGlimpseCore(this IServiceCollection services)
        {
            services.TryAdd(GlimpseCoreServices.GetDefaultServices());

            var extensionProvider = services.BuildServiceProvider().GetService<IExtensionProvider<IRegisterServices>>();

            var glimpseCoreServiceCollectionBuilder = new GlimpseCoreServiceCollectionBuilder(services);

            foreach (var registration in extensionProvider.Instances)
            {
                registration.RegisterServices(glimpseCoreServiceCollectionBuilder);
            }

            return glimpseCoreServiceCollectionBuilder;
        } 
    }
}