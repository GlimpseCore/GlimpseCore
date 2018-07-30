using Microsoft.AspNetCore.Http;

namespace GlimpseCore.Server.Configuration
{
    public interface IAllowClientAccess
    {
        bool AllowUser(HttpContext context);
    }
}