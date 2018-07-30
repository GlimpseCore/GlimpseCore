using GlimpseCore.Common.Initialization;
using Microsoft.AspNetCore.Builder;

namespace GlimpseCore.Server
{
    public class ServerMiddleware : IRegisterMiddleware
    {
        public void RegisterMiddleware(IApplicationBuilder appBuilder)
        {
            appBuilder.UseMiddleware<GlimpseCoreServerMiddleware>(appBuilder);
        }
    }
}