using Microsoft.AspNetCore.Http;

namespace GlimpseCore.Agent.Internal.Inspectors.Mvc.Proxies
{
    public interface IActionContext
    {
        object ActionDescriptor { get; }
        HttpContext HttpContext { get; }
        IRouteData RouteData { get; }
    }
}
