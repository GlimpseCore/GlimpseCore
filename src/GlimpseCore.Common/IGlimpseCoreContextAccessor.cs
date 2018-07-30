using System;

namespace GlimpseCore.Common
{
    public interface IGlimpseCoreContextAccessor
    {
        Guid RequestId { get; }
    }
}
