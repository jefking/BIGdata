/// <reference path="Scripts/jquery-2.1.3.js" />
/// <reference path="Scripts/rx.lite.js" />
/// <reference path="Scripts/rx.jquery.js" />
/// <reference path="Scripts/bufferWithTimeOrCount.js" />
/// <reference path="Scripts/moment.js" />

$(function () {

    function postMessage(data) {
        var sas = "SharedAccessSignature sr=https%3a%2f%2fkeysaasy.servicebus.windows.net%2fkeyspls%2fpublishers%2fkeypub%2fmessages&sig=cEaIs41nkG3ykOaWxDVVJzMUJwLZMfiwsr5cggs7cbc%3d&se=1429419563&skn=JSSender";

        var serviceNamespace = "keysaasy";
        var hubName = "keyspls";
        var deviceName = "keypub";

        var HttpRequest = new XMLHttpRequest();
        HttpRequest.open("POST", "https://" + serviceNamespace + ".servicebus.windows.net/" + hubName + "/publishers/" + deviceName + "/messages", true);
        HttpRequest.setRequestHeader('Content-Type', "application/json;type=entry;charset=utf-8");
        HttpRequest.setRequestHeader("Authorization", sas);

        var obj = new Object();
        obj.userId = $('#textUser').val();
        obj.strokes = data;
        var value = JSON.stringify(obj);
        //HttpRequest.send(value);
    };

    function getTime(arg) {
        return moment(arg.timeStamp);
    }

    var subjectCall = new Rx.Subject();
    var order = 0;
    var guid;
    var lastKeyDownTime;
    var lastKeyDownValues;

    $('.KeyStrokeCounter').keydownAsObservable()
        .map(function (arg) {
            var previousKeyDown = lastKeyDownTime;
            lastKeyDownTime = getTime(arg);

            var time = getTime(arg);
            // beginTime = time;
            //var action = 3;
            order = order + 1;

            var data = new Object();
            data.time = time;
            data.order = order;
            //data.action = action;
            //data.guid = guid;
            data.value = String.fromCharCode(arg.keyCode);

            if (previousKeyDown !== undefined) {
                data.interval = lastKeyDownTime.subtract(previousKeyDown);
            }

            var temp = {
                time: lastKeyDownTime,
                key: data.value,
                interval : data.interval
            }

            if (lastKeyDownValues === undefined) {
                lastKeyDownValues = [temp];
            } else {

                var found = false;
                for (var i = 0; i < lastKeyDownValues.length; i++) {
                    if (lastKeyDownValues[i].key === temp.key) {
                        lastKeyDownValues[i].time = temp.time;
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    lastKeyDownValues.push(temp);
                    if (lastKeyDownValues.length > 10) {
                       lastKeyDownValues.splice(0, 1);
                    }
                }
            }

            return data;
        })
        //.do(function (arg) {
            //subjectCall.onNext(arg);
        //})
        .subscribe();

    $('.KeyStrokeCounter').keyupAsObservable()
        .map(function (arg) {
            var time = getTime(arg);
            var action = 3;
            order = order + 1;

            var data = new Object();
            data.time = time;
            data.order = order;
            data.action = action;
            data.guid = guid;
            data.value = String.fromCharCode(arg.keyCode);

            if (lastKeyDownValues !== undefined) {

                for (var i = 0; i < lastKeyDownValues.length; i++) {
                    if (lastKeyDownValues[i].key === data.value) {
                        data.pressinterval = time.subtract(lastKeyDownValues[i].time);
                        data.interval = lastKeyDownValues[i].interval;
                        break;
                    }
                }
            }
            
            return data;
        }).do(function (arg) {
            subjectCall.onNext(arg);
        }).subscribe();

    subjectCall.windowWithTimeOrCount(1000, // time
            100,
            Rx.Scheduler.timeout) // count
        .selectMany(function (x) {
            return x.toArray();
        })
        .where(function (x) {
            return x.length > 0;
        })
        .do(function (x) {
            return postMessage(x);
        })
        .subscribe();

    $('.KeyStrokeCounter').focusinAsObservable()
     .map(function (arg) {
         guid = genGuid();
         var time = getTime(arg);
         var action = 1;

         var data = new Object();
         data.time = time;
         data.order = order;
         data.action = action;
         data.guid = guid;
         return data;
     }).do(function (arg) {
         subjectCall.onNext(arg);
     }).subscribe();

    $('.KeyStrokeCounter').focusoutAsObservable()
        .map(function (arg) {
            var time = getTime(arg);
            var action = 2;
            order = order + 1;

            var data = new Object();
            data.time = time;
            data.order = order;
            data.action = action;
            data.guid = guid;
            return data;
        }).do(function (arg) {
            subjectCall.onNext(arg);
        }).subscribe();

});

function genGuid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
}
