using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GlimpseCore.Initialization;

namespace GlimpseCore.Agent.Internal.Inspectors
{
    public class AgentStartupLoggingProvider : IAgentStartup
    {
        public AgentStartupLoggingProvider(ILoggerFactory factory, IGlimpseCoreAgent agent)
        {
            Factory = factory;
            Agent = agent;
        }

        private ILoggerFactory Factory { get; }

        private IGlimpseCoreAgent Agent { get; }

        public void Run(IStartupOptions options)
        {
            Factory.AddProvider(new LoggerProvider(Agent, (cat, level) => true));
        }
    }
}
