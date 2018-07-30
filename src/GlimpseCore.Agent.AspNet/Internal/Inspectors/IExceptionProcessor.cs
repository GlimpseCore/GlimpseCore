using System;
using System.Collections.Generic;
using GlimpseCore.Agent.Messages;

namespace GlimpseCore.Agent.Internal.Inspectors
{
    public interface IExceptionProcessor
    {
        IEnumerable<ExceptionDetails> GetErrorDetails(Exception ex);
    }
}