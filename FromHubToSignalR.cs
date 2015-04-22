namespace KeySignal
{
    using King.Service;
    using Microsoft.ServiceBus.Messaging;
    using Newtonsoft.Json;
    using System;
    using System.Collections.Generic;
    using System.Configuration;
    using System.Linq;
    using System.Threading.Tasks;
    using System.Web;

    public class FromHubToSignalR : RecurringTask
    {
        const string name = "keyspls";
        private static readonly string connectionString = ConfigurationManager.AppSettings["Microsoft.ServiceBus.ConnectionString"];
        private readonly EventHubClient eventHubClient = EventHubClient.CreateFromConnectionString(connectionString, name);

        private readonly string partitionId;

        public FromHubToSignalR(string partitionId)
        {
            this.partitionId = partitionId;
        }
        public async Task Dequeue()
        {
            var group = this.eventHubClient.GetDefaultConsumerGroup();
            var r = await group.CreateReceiverAsync(partitionId);
            var data = await r.ReceiveAsync(32);
            foreach (var d in data)
            {
                var json = Convert.ToString(d.GetBytes());
                var stroke = JsonConvert.DeserializeObject<FlatStroke>(json);
            }
        }

    }
}