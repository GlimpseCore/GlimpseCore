using Microsoft.AspNetCore.Http;

namespace GlimpseCore.Agent.Configuration
{
    public interface IRequestIgnorer
    {
        bool ShouldIgnore(HttpContext context);
    }
}