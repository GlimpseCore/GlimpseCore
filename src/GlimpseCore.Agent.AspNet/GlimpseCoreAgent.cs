using GlimpseCore.Agent.Configuration;

namespace GlimpseCore.Agent
{
    public class GlimpseCoreAgent : IGlimpseCoreAgent
    {
        public GlimpseCoreAgent(IAgentBroker broker, IRequestIgnorerManager requestIgnorerManager)
        {
            Broker = broker;
            RequestIgnorerManager = requestIgnorerManager;
        }

        private IRequestIgnorerManager RequestIgnorerManager { get; }

        public IAgentBroker Broker { get; }

        public bool IsEnabled()
        {
            return !RequestIgnorerManager.ShouldIgnore();
        }
    }
}
