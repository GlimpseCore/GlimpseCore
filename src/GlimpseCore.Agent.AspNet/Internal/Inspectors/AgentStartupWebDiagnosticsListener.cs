using System;
using System.Collections.Generic;
using System.Diagnostics;
using GlimpseCore.Agent;
using GlimpseCore.Agent.Configuration;
using GlimpseCore.Initialization;
using Microsoft.Extensions.DependencyInjection;

namespace GlimpseCore.Agent.Internal.Inspectors
{
    public class AgentStartupWebDiagnosticsListener : IAgentStartup
    {
        public AgentStartupWebDiagnosticsListener(IRequestIgnorerManager requestIgnorerManager)
        {
            RequestIgnorerManager = requestIgnorerManager;
        }

        private IRequestIgnorerManager RequestIgnorerManager { get; }

        public void Run(IStartupOptions options)
        {
            var appServices = options.ApplicationServices;
            
            var listenerSubscription = DiagnosticListener.AllListeners.Subscribe(listener =>
            {
                listener.SubscribeWithAdapter(appServices.GetRequiredService<WebDiagnosticsListener>(), IsEnabled);
            });
        }

        private bool IsEnabled(string topic)
        {
            return !RequestIgnorerManager.ShouldIgnore();
        }
    }
}
