﻿namespace GlimpseCore.Agent.Internal.Inspectors.Mvc.Proxies
{
    public interface IViewComponentDescriptor
    {
        string Id { get; }
        string FullName { get; }
        string ShortName { get; }
    }
}