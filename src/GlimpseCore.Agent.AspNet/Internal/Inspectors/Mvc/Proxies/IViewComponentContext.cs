
using System.Collections.Generic;

namespace GlimpseCore.Agent.Internal.Inspectors.Mvc.Proxies
{
    public interface IViewComponentContext
    {
        IViewComponentDescriptor ViewComponentDescriptor { get; }

        IDictionary<string, object> Arguments { get; }
    }
}
