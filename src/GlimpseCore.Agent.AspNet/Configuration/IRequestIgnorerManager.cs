using Microsoft.AspNetCore.Http;

namespace GlimpseCore.Agent.Configuration
{
    public interface IRequestIgnorerManager
    {
        bool ShouldIgnore();

        bool ShouldIgnore(HttpContext context);
    }
}
