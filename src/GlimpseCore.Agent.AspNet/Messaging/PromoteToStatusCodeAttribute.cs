namespace GlimpseCore.Agent
{
    public class PromoteToStatusCodeAttribute : PromoteToAttribute
    {
        public PromoteToStatusCodeAttribute() : base("request-status-code")
        {
        }
    }
}