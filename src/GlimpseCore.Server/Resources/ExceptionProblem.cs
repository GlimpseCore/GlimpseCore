using System;

namespace GlimpseCore.Server.Resources
{
    public class ExceptionProblem : Problem
    {
        private readonly Exception _exception;
        public ExceptionProblem(Exception exception)
        {
            _exception = exception;
            Extensions["StackTrace"] = _exception.StackTrace;
        }

        // TODO: Correct URI
        public override Uri Type => new Uri("http://TODO.com/Docs/Troubleshooting/Exception");
        public override string Title => "Server Exception";
        public override string Details => _exception.Message;
        public override int StatusCode => 500;
    }
}
