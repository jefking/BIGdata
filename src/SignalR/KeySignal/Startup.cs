using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(KeySignal.Startup))]
namespace KeySignal
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            app.MapSignalR();
        }
    }
}