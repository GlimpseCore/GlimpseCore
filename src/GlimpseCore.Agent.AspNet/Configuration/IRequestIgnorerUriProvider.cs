using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace GlimpseCore.Agent.Configuration
{
    public interface IRequestIgnorerUriProvider
    {
        IReadOnlyList<Regex> IgnoredUris { get; }
    }
}