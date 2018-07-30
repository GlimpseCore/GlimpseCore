using System.Collections.Generic;

namespace GlimpseCore.Agent.Internal.Messaging
{
    public interface IMessageIndexProcessor
    {
        IReadOnlyDictionary<string, object> Derive(object payload);
    }
}