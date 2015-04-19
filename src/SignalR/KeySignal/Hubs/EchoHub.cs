using Microsoft.AspNet.SignalR;
using Microsoft.ServiceBus.Messaging;
using System.Configuration;
using System.Linq;
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
            var data = JsonStringToByteArray(json);
            var msg = new EventData(data);
            await eventHubClient.SendAsync(msg);

            if (3 == s.action)
            {
                Clients.All.NewCharacter(s.value);
            }
        }

        public async Task SendExample(Example e)
        {
            var flats = from s in e.strokes
                        select Convert(this.Context.ConnectionId, e, s);

            await eventHubClient.SendBatchAsync(flats);

            foreach (var s in e.strokes.Where(s => s.action == 3))
            {
                Clients.All.NewCharacter(s.value);
            }
        }

        private static EventData Convert(string id, Example e, Stroke s)
        {
            var flat = new FlatStroke()
            {
                time = s.time,
                order = s.order,
                action = s.action,
                guid = s.guid,
                value = s.value,
                interval = s.interval,
                pressinterval = s.pressinterval,
                email = e.email,
                name = e.name,
                uniqueId = e.uniqueId,
            };
            var json = Newtonsoft.Json.JsonConvert.SerializeObject(flat);
            var data = JsonStringToByteArray(json);
            return new EventData(data);
        }

        public static byte[] JsonStringToByteArray(string jsonByteString)
        {
            var bytes = new byte[jsonByteString.Length * sizeof(char)];
            System.Buffer.BlockCopy(jsonByteString.ToCharArray(), 0, bytes, 0, bytes.Length);
            return bytes;
        }
    }
}