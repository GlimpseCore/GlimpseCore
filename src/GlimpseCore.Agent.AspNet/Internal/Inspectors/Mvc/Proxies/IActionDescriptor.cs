using System;
using System.Reflection;

namespace GlimpseCore.Agent.Internal.Inspectors.Mvc.Proxies
{
    public interface IActionDescriptor
    {
        string Id { get; }
        string DisplayName { get; }
        string ActionName { get; }
        string ControllerName { get; }
        Type ControllerTypeInfo { get; }
        MethodInfo MethodInfo { get; }
    }
}
