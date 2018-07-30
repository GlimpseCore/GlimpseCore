using System.Collections.Generic;

namespace GlimpseCore.Agent.Internal.Messaging
{
    public interface IMessageTypeProcessor
    {
        IEnumerable<string> Derive(object payload);
    }
}