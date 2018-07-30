using Microsoft.AspNetCore.Http;

namespace GlimpseCore.Agent.Inspectors
{
    public interface IInspector
    {
        void Before(HttpContext context);

        void After(HttpContext context);
    }
}
