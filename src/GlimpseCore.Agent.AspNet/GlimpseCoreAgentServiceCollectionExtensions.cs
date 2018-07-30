using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using System;
using GlimpseCore.Agent;

namespace GlimpseCore
{
    public static class GlimpseCoreAgentServiceCollectionExtensions
    {
        public static GlimpseCoreAgentServiceCollectionBuilder RunningAgentWeb(this GlimpseCoreServiceCollectionBuilder services)
        {
            return services.RunningAgentWeb(null);
        }
         
        public static GlimpseCoreAgentServiceCollectionBuilder RunningAgentWeb(this GlimpseCoreServiceCollectionBuilder services, Action<GlimpseCoreAgentOptions> setupAction)
        {
            if (setupAction != null)
            {
                services.Configure(setupAction);
            }

            return new GlimpseCoreAgentServiceCollectionBuilder(services);
        }
    }
}