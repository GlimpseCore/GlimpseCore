using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace GlimpseCore.Agent.Internal.Inspectors.Mvc.Proxies
{
    public interface IViewContext
    {
        object ActionDescriptor { get; }
        HttpContext HttpContext { get; }
        IRouteData RouteData { get; }
        IDictionary<string, object> TempData { get; }
        IDictionary<string, object> ViewData { get; }
    }
}
