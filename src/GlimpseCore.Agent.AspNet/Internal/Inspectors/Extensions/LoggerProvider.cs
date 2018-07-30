using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GlimpseCore.Agent.Internal.Inspectors
{
    internal class LoggerProvider : ILoggerProvider
    {
        public LoggerProvider(IGlimpseCoreAgent agent, Func<string, LogLevel, bool> filter)
        {
            Agent = agent;
            Filter = filter;
        }

        private IGlimpseCoreAgent Agent { get; }

        private Func<string, LogLevel, bool> Filter { get; }

        public ILogger CreateLogger(string categoryName)
        {
            return new Logger(categoryName, Agent, Filter);
        }

        public void Dispose()
        {
        }
    }
}
