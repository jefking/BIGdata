using King.Azure.Data;
using Microsoft.AspNet.SignalR;
using Microsoft.ServiceBus.Messaging;
using System;
using System.Collections.Concurrent;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using King.Mapper;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Reactive.Linq;
using Microsoft.AspNet.SignalR.Hubs;

namespace KeySignal.Hubs
{
    public class ComputateData
    {
        public double[] LivePressInterval { get; set; }
        public double[] LiveInterval { get; set; }
    }

    public class Stats
    {
        public ComputateData Computated { get; set; }
    }

    public class SampleArgs : EventArgs
    {
        public Example Data { get; set; }
    }

    public class EchoHub : Hub
    {
        private static ConcurrentDictionary<string, IDisposable> _forward = new ConcurrentDictionary<string, IDisposable>();
        private static EventHandler<SampleArgs> _sampleArgs = (s, e) => { };

        public override Task OnConnected()
        {
            var current = this.Context.ConnectionId;
            var obs = Observable.FromEventPattern<SampleArgs>(add => _sampleArgs += add, rem => _sampleArgs -= rem);
            var other = obs.SelectMany(a => a.EventArgs.Data.strokes.OrderBy(b => b.order).Select(b => b.interval))
                        .Scan(ImmutableList<TimeSpan>.Empty, (a, b) =>
                        {
                            var data = a.Add(b).OrderBy(c => c.TotalMilliseconds);
                            var res = data.ToImmutableList();
                            return res;
                        })
                        .Select(ordered =>
                        {
                            double median;
                            if ((ordered.Count % 2) != 0)
                            {
                                median = ordered.ElementAt(ordered.Count / 2).TotalMilliseconds;
                            }
                            else
                            {
                                median =
                                    ((ordered.ElementAt(ordered.Count / 2) +
                                      ordered.ElementAt((ordered.Count - 1) / 2)).TotalMilliseconds) / 2;
                            }

                            return median;
                        });

            var sx = other
                .Buffer(TimeSpan.FromMilliseconds(1000))
                .Where(a => a.Count > 0)
                .DistinctUntilChanged(a => a.Count)
                .Do(a =>
            {
                //var context = GlobalHost.ConnectionManager.GetHubContext<EchoHub>();
                var res = a.ToArray();
                keystats.Save("something.json", new Stats { Computated = new ComputateData { LiveInterval = res } }).Wait();

            });

            var subs = sx.Subscribe();
            _forward[this.Context.ConnectionId] = subs;
            return base.OnConnected();
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            IDisposable dis;
            if (_forward.TryGetValue(this.Context.ConnectionId, out dis))
            {
                dis.Dispose();
                _forward.TryRemove(this.Context.ConnectionId, out dis);
                dis.Dispose();
            }
            return base.OnDisconnected(stopCalled);
        }

        const string name = "keyspls";
        private static readonly string connectionString = ConfigurationManager.AppSettings["Microsoft.ServiceBus.ConnectionString"];
        private readonly EventHubClient eventHubClient = EventHubClient.CreateFromConnectionString(connectionString, name);

        private Container container = new Container("keystrokes", ConfigurationManager.AppSettings["blobstorage"]);
        private Container keystats = new Container("keystats", ConfigurationManager.AppSettings["blobstorage"]);

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

            _sampleArgs(this, new SampleArgs { Data = e });
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