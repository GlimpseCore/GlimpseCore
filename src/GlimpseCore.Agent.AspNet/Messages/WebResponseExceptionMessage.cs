using System.Collections.Generic;

namespace GlimpseCore.Agent.Messages
{
    public class WebResponseExceptionMessage : WebResponseMessage, IExceptionMessage
    {
        public bool ExceptionIsHandelled { get; set; }

        public string ExceptionTypeName { get; set; }

        public string ExceptionMessage { get; set; }

        public IEnumerable<ExceptionDetails> ExceptionDetails { get; set; }
    }
}
