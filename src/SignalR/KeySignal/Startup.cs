using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(KeySignal.Startup))]

namespace KeySignal
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
        }
    }
}