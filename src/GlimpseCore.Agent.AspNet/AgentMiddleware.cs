using GlimpseCore.Common.Initialization;
using GlimpseCore.Initialization;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace GlimpseCore.Agent
{
    public class AgentMiddleware : IRegisterMiddleware
    {
        public void RegisterMiddleware(IApplicationBuilder appBuilder)
        {
            var manager = appBuilder.ApplicationServices.GetRequiredService<IAgentStartupManager>();
            manager.Run(new StartupOptions(appBuilder));

            appBuilder.UseMiddleware<GlimpseCoreAgentMiddleware>(appBuilder);
        }
    }
}