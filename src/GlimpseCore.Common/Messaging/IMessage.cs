using System;
using System.Collections.Generic;

namespace GlimpseCore
{
    public interface IMessage
    {
        Guid Id { get; }

        IEnumerable<string> Types { get; }

        string Payload { get; }

        int Ordinal { get; }

        double Offset { get; }

        MessageContext Context { get; }
        
        IReadOnlyDictionary<string, object> Indices { get; }

        MessageAgent Agent { get; }
    }
}
