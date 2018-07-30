using System;
using System.Collections.Generic;

namespace GlimpseCore.Agent.Messages
{
    public class ActionViewNotFoundMessage : ActionViewFoundMessage
    {
        public IEnumerable<string> ViewSearchedLocations { get; set; }
    }
}