using System.Collections.Generic;

namespace GlimpseCore.Agent.Configuration
{
    public interface IRequestIgnorerStatusCodeProvider
    {
        IReadOnlyList<int> StatusCodes { get; }
    }
}