using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace KeySignal
{
    public class Stroke
    {
        public DateTime time { get; set; }
        public int order { get; set; }
        public int action { get; set; }
        public string guid { get; set; }
        public string value { get; set; }
        public TimeSpan interval { get; set; }
    }

    public class Example
    {
        public string userId { get; set; }
        public string uniqueId { get; set; }
        public IList<Stroke> strokes { get; set; }
    }
}