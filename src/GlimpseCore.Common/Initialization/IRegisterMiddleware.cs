using Microsoft.AspNetCore.Builder;

namespace GlimpseCore.Common.Initialization
{
    public interface IRegisterMiddleware
    {
        void RegisterMiddleware(IApplicationBuilder appBuilder);
    }
}
