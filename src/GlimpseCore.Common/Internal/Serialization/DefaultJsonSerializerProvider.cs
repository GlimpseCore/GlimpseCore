using GlimpseCore.Internal.Extensions;
using Newtonsoft.Json;

namespace GlimpseCore.Common.Internal.Serialization
{
    public class DefaultJsonSerializerProvider : IJsonSerializerProvider
    {
        private readonly JsonSerializer _jsonSerializer;
        public DefaultJsonSerializerProvider(JsonSerializer jsonSerializer)
        {
            jsonSerializer.Configure();
            _jsonSerializer = jsonSerializer;
        }

        public JsonSerializer GetJsonSerializer() => _jsonSerializer;
    }
}