using Microsoft.AspNetCore.Http;

namespace GlimpseCore.Server.Configuration
{
    public interface IAllowAgentAccess
    {
        bool AllowAgent(HttpContext context);
    }
}
