using Microsoft.Extensions.Options;

namespace GlimpseCore.Server
{
    public class GlimpseCoreServerOptionsSetup : ConfigureOptions<GlimpseCoreServerOptions>
    {
        public GlimpseCoreServerOptionsSetup() : base(ConfigureGlimpseCoreServerWebOptions)
        {
        }

        public static void ConfigureGlimpseCoreServerWebOptions(GlimpseCoreServerOptions options)
        {
            options.AllowRemote = true;  // Temp workaround for kestrel not implementing IHttpConnectionFeature
            options.BasePath = "glimpsecore";
            options.OverrideResources = _ => { };
        }
    }
}