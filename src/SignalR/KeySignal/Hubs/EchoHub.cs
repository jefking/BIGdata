using Microsoft.AspNet.SignalR;
using Microsoft.ServiceBus.Messaging;
using System;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KeySignal.Hubs
{
    public class EchoHub : Hub
    {
        const string name = "keyspls";
        private static readonly string connectionString = ConfigurationManager.AppSettings["Microsoft.ServiceBus.ConnectionString"];
        private readonly EventHubClient eventHubClient = EventHubClient.CreateFromConnectionString(connectionString, name);

        public async Task SendStroke(Stroke s)
        {
            var json = Newtonsoft.Json.JsonConvert.SerializeObject(s);
            var data = Encoding.UTF8.GetBytes(json);
            var msg = new EventData(data)
            {
                PartitionKey = "nothing"
            };
            await eventHubClient.SendAsync(msg);

            Clients.All.NewCharacter(s.keyvalue);
        }

        public async Task SendExample(Example e)
        {
            if (e.strokes.All(a => a.action != 3))
                return;

            var flats = from s in e.strokes
                        select Convert(this.Context.ConnectionId, e, s);

            await eventHubClient.SendBatchAsync(flats);

            foreach (var s in e.strokes)
            {
                Clients.All.NewCharacter(s.keyvalue);
            }
        }

        public async Task Register(Example e)
        {

        }

        private static EventData Convert(string id, Example e, Stroke s)
        {
            var flat = new FlatStroke()
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
            var json = Newtonsoft.Json.JsonConvert.SerializeObject(flat);
            var data = Encoding.UTF8.GetBytes(json);
            return new EventData(data)
            {
                PartitionKey = "nothing"
            };
        }
    }
}