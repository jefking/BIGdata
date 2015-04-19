using System;
using System.Collections.Generic;

namespace KeySignal
{
    public class Stroke
    {
        public DateTime time { get; set; }
        public int order { get; set; }
        public int action { get; set; }
        public string guid { get; set; }
        public string keyvalue { get; set; }
        public TimeSpan interval { get; set; }
        public TimeSpan pressinterval{ get; set; }
    }

    public class Example
    {
        public string email { get; set; }
        public string name { get; set; }
        public string uniqueId { get; set; }
        public IList<Stroke> strokes { get; set; }
    }

    public class FlatStroke : Stroke
    {
        public string uniqueId { get; set; }
        public string email { get; set; }
        public string name { get; set; }
    }
}