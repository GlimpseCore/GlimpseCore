using System.Collections.Generic;

namespace GlimpseCore.Agent.Messages
{
    public interface IActionContentMessage
    {
        IReadOnlyList<BindingData> Binding { get; }
    }
}