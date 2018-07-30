using System.Collections.Generic;

namespace GlimpseCore.Agent.Configuration
{
    public interface IRequestIgnorerContentTypeProvider
    {
        IReadOnlyList<string> ContentTypes { get; }
    }
}