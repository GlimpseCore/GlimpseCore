using System;
using System.Net;

namespace GlimpseCore.Server.Resources
{
    public class MissingParameterProblem : Problem
    {
        private readonly string _parameterName;
        public MissingParameterProblem(string parameterName)
        {
            _parameterName = parameterName;
        }

        // TODO: Correct URI
        public override Uri Type => new Uri("http://TODO.com/Docs/Troubleshooting/MissingParameter");

        public override string Title => "Missing Required Parameter";

        public override string Details => $"Required parameter '{_parameterName}' is missing.";

        public override int StatusCode => (int) HttpStatusCode.NotFound;
    }
}