using System;
using Newtonsoft.Json;

namespace GlimpseCore.Server.Resources
{
    public class InvalidJsonProblem : ExceptionProblem
    {
        public InvalidJsonProblem(JsonReaderException exception) : base(exception)
        {
            Extensions["LineNumber"] = exception.LineNumber;
            Extensions["LinePosition"] = exception.LinePosition;
        }

        // TODO: Correct URI
        public override Uri Type => new Uri("http://TODO.com/Docs/Troubleshooting/InvalidJson");
        public override string Title => "Invalid Json";
    }
}
