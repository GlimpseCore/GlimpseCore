using GlimpseCore.Agent.Configuration;
using Microsoft.Extensions.Options;

namespace GlimpseCore.Agent
{
    public class GlimpseCoreAgentOptionsSetup : ConfigureOptions<GlimpseCoreAgentOptions>
    {
        public GlimpseCoreAgentOptionsSetup() : base(ConfigureGlimpseCoreAgentWebOptions)
        {
        }

        public static void ConfigureGlimpseCoreAgentWebOptions(GlimpseCoreAgentOptions options)
        {
            // Set up IgnoredUris
            options.IgnoredUris.AddCompiled("^/__browserLink/requestData");
            options.IgnoredUris.AddCompiled("^/GlimpseCore"); // TODO: Need to make sure this honor overridden basePath's
            options.IgnoredUris.AddCompiled("^/favicon.ico");
        }
    }
}