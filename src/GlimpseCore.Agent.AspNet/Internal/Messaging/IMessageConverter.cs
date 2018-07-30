using System;

namespace GlimpseCore.Agent.Internal.Messaging
{
    public interface IMessageConverter
    {
        IMessage ConvertMessage(object payload, MessageContext context, int ordinal, TimeSpan offset);
    }
}