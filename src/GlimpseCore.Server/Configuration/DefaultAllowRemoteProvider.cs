using GlimpseCore.Server;
using Microsoft.Extensions.Options;

namespace GlimpseCore.Server.Configuration
{
    public class DefaultAllowRemoteProvider : IAllowRemoteProvider
    {
        public DefaultAllowRemoteProvider(IOptions<GlimpseCoreServerOptions> optionsAccessor)
        {
            AllowRemote = optionsAccessor.Value.AllowRemote; 
        }
        
        public bool AllowRemote { get; }
    }
}