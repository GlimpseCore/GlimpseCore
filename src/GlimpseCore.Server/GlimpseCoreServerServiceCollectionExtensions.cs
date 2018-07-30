using System;
using GlimpseCore.Server;
using Microsoft.Extensions.DependencyInjection;

namespace GlimpseCore
{
    public static class GlimpseCoreServerServiceCollectionExtensions
    {
        public static GlimpseCoreServerServiceCollectionBuilder RunningServerWeb(this GlimpseCoreServiceCollectionBuilder services)
        {
            return services.RunningServerWeb(null);
        }

        public static GlimpseCoreServerServiceCollectionBuilder RunningServerWeb(this GlimpseCoreServiceCollectionBuilder services, Action<GlimpseCoreServerOptions> setupAction)
        {
            if (setupAction != null)
            {
                services.Configure(setupAction);
            }

            return new GlimpseCoreServerServiceCollectionBuilder(services);
        }
    }
}