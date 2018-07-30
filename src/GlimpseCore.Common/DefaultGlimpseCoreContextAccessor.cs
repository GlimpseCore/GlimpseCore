using System;
using GlimpseCore.Internal;

namespace GlimpseCore.Common
{
    public class DefaultGlimpseCoreContextAccessor : IGlimpseCoreContextAccessor
    {
        private readonly IContextData<MessageContext> _context;
        public DefaultGlimpseCoreContextAccessor(IContextData<MessageContext> context)
        {
            _context = context;
        }

        public Guid RequestId => _context.Value.Id;
    }
}