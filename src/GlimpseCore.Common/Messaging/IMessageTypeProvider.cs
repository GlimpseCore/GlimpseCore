using System.Collections.Generic;

namespace GlimpseCore.Common.Messaging
{
    public interface IMessageTypeProvider
    {
        IEnumerable<string> Types { get; }
    }
}