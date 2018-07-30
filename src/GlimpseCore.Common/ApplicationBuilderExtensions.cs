using GlimpseCore.Common.Initialization;
using GlimpseCore.Initialization;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace GlimpseCore
{
    public static class ApplicationBuilderExtensions
    {
        public static IApplicationBuilder UseGlimpseCore(this IApplicationBuilder appBuilder)
        {
            var middlewareRegistrations = appBuilder.ApplicationServices.GetService<IExtensionProvider<IRegisterMiddleware>>();

            foreach (var instance in middlewareRegistrations.Instances)
            {
                instance.RegisterMiddleware(appBuilder);
            }

            return appBuilder;
        }
    }
}
