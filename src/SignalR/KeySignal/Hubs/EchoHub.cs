using King.Azure.Data;
using Microsoft.AspNet.SignalR;
using Microsoft.ServiceBus.Messaging;
using System;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using King.Mapper;
using System.Collections.Generic;

namespace KeySignal.Hubs
{
    public class EchoHub : Hub
    {
        const string name = "keyspls";
        private static readonly string connectionString = ConfigurationManager.AppSettings["Microsoft.ServiceBus.ConnectionString"];
        private readonly EventHubClient eventHubClient = EventHubClient.CreateFromConnectionString(connectionString, name);

        private Container container = new Container("keystrokes", ConfigurationManager.AppSettings["blobstorage"]);

        private TableStorage table = new TableStorage("keystrokes", ConfigurationManager.AppSettings["blobstorage"]);

        public async Task SendStroke(Stroke s)
        {
            Clients.All.NewCharacter(s.keyvalue);

            var json = Newtonsoft.Json.JsonConvert.SerializeObject(s);
            var data = Encoding.UTF8.GetBytes(json);
            var msg = new EventData(data)
            {
                PartitionKey = "nothing"
            };

            await eventHubClient.SendAsync(msg);
        }

        public async Task SendExample(Example e)
        {
            if (e.strokes.All(a => a.action != 3))
                return;

            foreach (var s in e.strokes)
            {
                Clients.All.NewCharacter(s.keyvalue);
            }
            
            e.uniqueId = this.Context.ConnectionId;

            
            var flats = from s in e.strokes.OrderBy(a => a.order)
                        select Convert(e, s);

            var dics = new List<IDictionary<string, object>>();

            foreach (var f in flats)
            {
                var d = f.ToDictionary();
                d[TableStorage.PartitionKey] = f.uniqueId;
                d[TableStorage.RowKey] = f.order;
                d["intervalms"] = f.interval.TotalMilliseconds;
                d["pressintervalms"] = f.pressinterval.TotalMilliseconds;
                d["timeticks"] = f.time.Ticks;
                dics.Add(d);
            }

            var events = from f in flats
                        select Convert(f);

            var t1 = container.Save(string.Format("{0}-{1}.json", e.uniqueId, Guid.NewGuid()), e);
            var t2 = table.Insert(dics);
            var t3 = eventHubClient.SendBatchAsync(events);

            await Task.WhenAll(t1, t2, t3);
        }

        public async Task Register(Example e)
        {

        }

        private static FlatStroke Convert(Example e, Stroke s)
        {
            return new FlatStroke()
            {
                time = s.time,
                order = s.order,
                action = s.action,
                guid = s.guid,
                keyvalue = s.keyvalue,
                interval = s.interval,
                pressinterval = s.pressinterval,
                email = e.email,
                name = e.name,
                uniqueId = e.uniqueId,
            };
        }

        private static EventData Convert(FlatStroke flat)
        {
            var json = Newtonsoft.Json.JsonConvert.SerializeObject(flat);
            var data = Encoding.UTF8.GetBytes(json);
            return new EventData(data)
            {
                PartitionKey = "nothing"
            };
        }
    }
}