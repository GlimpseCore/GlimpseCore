using System.Collections.Generic;

namespace GlimpseCore.Agent.Messages
{
    public class ViewResultData
    {
        // TODO: need make sure that these are serializable 
        public IDictionary<string, object> TempData { get; set; }

        // TODO: need make sure that these are serializable 
        public IDictionary<string, object> ViewData { get; set; }
    }
}