namespace GlimpseCore
{
    public interface IMessagePublisher
    {
        void PublishMessage(IMessage message);
    }
}