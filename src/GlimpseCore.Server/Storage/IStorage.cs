using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GlimpseCore.Server.Storage
{
    public interface IStorage
    {
        void Persist(IMessage message);

        // types is required
        Task<IEnumerable<string>> RetrieveByType(params string[] types);

        Task<IEnumerable<string>> RetrieveByContextId(Guid id);

        // If no typeFilters are passed in, just don't filter
        Task<IEnumerable<string>> RetrieveByContextId(Guid id, params string[] typeFilter);
    }
}