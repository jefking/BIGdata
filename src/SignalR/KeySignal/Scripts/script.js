/// <reference path="Scripts/jquery-2.1.3.js" />
/// <reference path="Scripts/rx.lite.js" />
/// <reference path="Scripts/rx.jquery.js" />
/// <reference path="Scripts/bufferWithTimeOrCount.js" />
/// <reference path="Scripts/moment.js" />

var hub;
$(function () {
    hub = $.connection.echoHub;

    $.connection.hub.start().done(function () {

        function postMessage(data) {

            var obj = new Object();
            obj.name = $('.textName').val();
            obj.strokes = data;
            obj.email = $('.textEmail').val();

            hub.server.sendExample(obj);
        }

        function formatForTwoLetters(obj) {
            var text = obj.toString();
            if (text.length == 0) {
                return "00";
            } else {
                if (text.length == 1) {
                    return "0" + text;
                } else {
                    return text;
                }
            }
        }

        function getTime(arg) {
            return moment(arg.timeStamp);
        }

        function tryParseInterval(data) {
            if (data.interval !== undefined) {
                var text = formatForTwoLetters(data.interval.hours()) + ":" +
                        formatForTwoLetters(data.interval.minutes()) + ":" +
                        formatForTwoLetters(data.interval.seconds()) + "." + data.interval.milliseconds();
                data.interval = text;
            }

        }

        function parsePressInterval(data) {
            if (typeof data.pressinterval == 'string' || data.pressinterval instanceof String) {
                return;
            }
            var text = formatForTwoLetters(data.pressinterval.hours()) + ":" +
                            formatForTwoLetters(data.pressinterval.minutes()) + ":" +
                            formatForTwoLetters(data.pressinterval.seconds()) + "." + data.pressinterval.milliseconds();
            data.pressinterval = text;
        }

        var subjectCall = new Rx.Subject();
        var order = 0;
        var guid;
        var lastKeyDownTime;
        var lastKeyDownValues = [];
        var lastKeyValue;
        var lastKeyUpValues = [];

        $('.KeyStrokeCounter').keydownAsObservable()
            .map(function (arg) {

                var keycode = arg.keyCode;
                if (!((keycode > 47 && keycode < 58) || // number keys
                        keycode == 32 || keycode == 13 || keycode == 8 || // spacebar & return key(s) (if you want to allow carriage returns)
                        (keycode > 64 && keycode < 91) || // letter keys
                        (keycode > 95 && keycode < 112) || // numpad keys
                        (keycode > 185 && keycode < 193) || // ;=,-./` (in order)
                        (keycode > 218 && keycode < 223))) {

                    return { send: false };
                }

                var previousKeyDown = lastKeyDownTime;
                lastKeyDownTime = getTime(arg);

                var time = getTime(arg);
                var action = 3;
                order = order + 1;

                var data = new Object();
                data.time = time;
                data.order = order;
                data.action = action;
                data.guid = guid;
                data.keyvalue = String.fromCharCode(arg.keyCode);

                if (previousKeyDown !== undefined) {
                    // data.interval = lastKeyDownTime.subtract(previousKeyDown);
                    data.interval = moment.duration(lastKeyDownTime.diff(previousKeyDown));
                }

                if (lastKeyValue !== undefined) {
                    if (data.keyvalue === lastKeyValue) {
                        var regularKeyDown = false;

                        if (lastKeyDownValues.length <= 0)
                            regularKeyDown = true;
                        else
                            for (var number = 0; number < lastKeyDownValues.length; number++) {
                                if (lastKeyDownValues[number].key === data.keyvalue) {

                                    data.pressinterval = moment.duration(time.diff(lastKeyDownValues[number].time));
                                    lastKeyDownValues[number].time = time;
                                    regularKeyDown = false;
                                    break;
                                } else {
                                    regularKeyDown = true;
                                }
                            }

                        if (!regularKeyDown) {
                            tryParseInterval(data);
                            parsePressInterval(data);

                            return { send: true, data: data };
                        }
                    }
                }

                lastKeyValue = data.keyvalue;
                var temp = {
                    time: lastKeyDownTime,
                    key: data.keyvalue,
                    interval: data.interval,
                    order: data.order
                }

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

                return { send: false, data: data };
            })
            .where(function (a) {
                return a.send !== undefined && a.send === true;
            })
            .do(function (arg) {
                subjectCall.onNext(arg.data);
            })
            .subscribe();

        var upOrder = 0;
        $('.KeyStrokeCounter').keyupAsObservable()
            .map(function (arg) {

                var keycode = arg.keyCode;
                if (!((keycode > 47 && keycode < 58) || // number keys
                        keycode == 32 || keycode == 13 || keycode == 8 || // spacebar & return key(s) (if you want to allow carriage returns)
                        (keycode > 64 && keycode < 91) || // letter keys
                        (keycode > 95 && keycode < 112) || // numpad keys
                        (keycode > 185 && keycode < 193) || // ;=,-./` (in order)
                        (keycode > 218 && keycode < 223))) {

                    return { send: false };
                }
                upOrder++;

                var currentOrder = order;
                var time = getTime(arg);
                var action = 3;
                var data = new Object();
                data.time = time;
                data.action = action;
                data.guid = guid;
                data.keyvalue = String.fromCharCode(arg.keyCode);

                var sameKeyDownObj = undefined;
                for (var i = lastKeyDownValues.length - 1; i >= 0; i--) {
                    if (lastKeyDownValues[i].key === data.keyvalue) {
                        sameKeyDownObj = lastKeyDownValues[i];
                        break;
                    }
                }

                if (sameKeyDownObj === undefined) {
                    return { send: false }
                }

                data.pressinterval = moment.duration(time.diff(sameKeyDownObj.time));
                data.interval = sameKeyDownObj.interval;
                data.order = sameKeyDownObj.order;

                parsePressInterval(data);
                tryParseInterval(data);

                var tryToPushInKeyUp = function () {
                    var found = false;
                    for (var j = lastKeyUpValues.length - 1; j >= 0; j--) {
                        if (lastKeyUpValues[j].key === data.keyvalue) {
                            found = true;
                            break;
                        }
                    }

                    if (!found)
                        lastKeyUpValues.push(data);
                }


                if (upOrder >= sameKeyDownObj.order) {
                    if (lastKeyUpValues.length == 0) {
                        var index = lastKeyDownValues.indexOf(sameKeyDownObj);
                        if (index > -1)
                            lastKeyDownValues.splice(index, 1);
                        //console.log(lastKeyDownValues[0]);
                        //console.log(lastKeyDownValues[1]);
                        return { send: true, batch: false, data: data }
                    } else {
                        tryToPushInKeyUp();

                        return { send: true, batch: true, data: data }
                    }
                } else {

                    tryToPushInKeyUp();
                    if (lastKeyUpValues.length <= 10) {
                        return { send: false, data: data }
                    }
                    return { send: true, batch: true, data: data }
                }
                //var copy = lastKeyDownValues.slice();

                //for (var i = copy.length -1; i >= 0; i--) {
                //    if (copy[i].key === data.keyvalue) {
                //        //data.pressinterval = time.subtract(lastKeyDownValues[i].time);
                //        data.pressinterval = moment.duration(time.diff(copy[i].time));
                //        data.interval = copy[i].interval;
                //        data.order = copy[i].order;

                //        parsePressInterval(data);
                //        tryParseInterval(data);

                //        lastKeyUpValues.push(data);
                //        console.log("copy=" + copy[i].order);
                //        if (currentOrder == copy[i].order) {
                //            if (lastKeyUpValues.length == 0) {
                //                lastKeyDownValues.splice(i, 1);
                //                return { send: true, batch: false, data: data }
                //            } else {
                //                return { send: true, batch: true, data: data }
                //            }
                //        } else {
                //            console.log("dif");
                //        }

                //        if (lastKeyUpValues.length <= 10) {
                //            return { send: false, data: data }
                //        }
                //        return { send: true, batch: true, data: data }
                //    }
                //}

                //return { send: true, data: data };
            })
                .where(function (arg) {
                    return arg.send !== undefined && arg.send;
                })
                .do(function (arg) {
                    if (arg.batch !== undefined && arg.batch) {

                        function compare(a, b) {
                            if (a.order < b.order)
                                return -1;
                            if (a.order > b.order)
                                return 1;
                            return 0;
                        }

                        lastKeyUpValues.sort(compare);
                        console.log(lastKeyUpValues);
                        var temp = [];
                        lastKeyUpValues.forEach(function (a) {
                            temp.push(a);
                        });

                        temp.forEach(function (a) {

                            var sameKeyDownObj;
                            var total = lastKeyDownValues.length;
                            var copy = lastKeyDownValues.slice();

                            for (var i = total - 1; i >= 0; i--) {
                                if (copy[i].key === a.keyvalue) {
                                    sameKeyDownObj = copy[i];
                                    break;
                                }
                            }

                            if (sameKeyDownObj !== undefined) {
                                var index = lastKeyDownValues.lastIndexOf(sameKeyDownObj);
                                if (index > -1)
                                    lastKeyDownValues.splice(index, 1);
                            }
                            subjectCall.onNext(a);
                        });
                        lastKeyUpValues = [];

                    } else {
                        console.log(arg.data);
                        subjectCall.onNext(arg.data);
                    }
                }).subscribe();

        subjectCall.windowWithTimeOrCount(100, // time
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
