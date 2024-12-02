/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/shell.js");
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {WebHostExperienceObservables: MS.Entertainment.defineObservable(function WebHostExperienceObservables_constructor(){}, {})});
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {WebHostExperience: WinJS.Class.derive(MS.Entertainment.UI.Controls.WebHostExperienceObservables, function webHostExperience() {
        MS.Entertainment.UI.Controls.WebHostExperienceObservables.prototype.constructor.call(this);
        this.eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell
    }, {
        disposed: false, onStartEvent: null, onMessageEvent: null, onErrorEvent: null, onFinishedEvent: null, onCancelEvent: null, onPageLoadEvent: null, eventProvider: null, startListener: function startListener() {
                if (!this.disposed)
                    if (this.onStartEvent)
                        this.onStartEvent()
            }, messageReceived: function messageReceived(message, webHost, sendMessageFunc) {
                if (!this.disposed)
                    if (this.onMessageEvent)
                        this.onMessageEvent(message, webHost, sendMessageFunc)
            }, errorReceived: function errorReceived(message) {
                if (!this.disposed) {
                    var hr = 0x80004005;
                    if (message === "400")
                        hr = 0x80190190;
                    else if (message === "401")
                        hr = 0x80190191;
                    else if (message === "403")
                        hr = 0x80190193;
                    else if (message === "404")
                        hr = 0x80190194;
                    else if (message === "410")
                        hr = 0x8019019A;
                    else if (message === "500")
                        hr = 0x801901F4;
                    else if (message === "501")
                        hr = 0x801901F5;
                    else if (message === "502")
                        hr = 0x801901F6;
                    else if (message === "503")
                        hr = 0x801901F7;
                    else if (message === "504")
                        hr = 0x801901F8;
                    else if (message === 0x80070461)
                        hr = 0x80070461;
                    MS.Entertainment.UI.Shell.showError(String.load(String.id.IDS_SERVICE_UNAVAILABLE_CAPTION), hr);
                    if (this.onErrorEvent)
                        this.onErrorEvent(message)
                }
            }, finishedReceived: function finishedReceived() {
                if (!this.disposed)
                    if (this.onFinishedEvent)
                        this.onFinishedEvent()
            }, cancelReceived: function cancelReceived() {
                if (!this.disposed)
                    if (this.onCancelEvent)
                        this.onCancelEvent()
            }, pageLoadReceived: function pageLoadReceived(message) {
                if (!this.disposed)
                    if (this.onPageLoadEvent)
                        this.onPageLoadEvent()
            }, dispose: function dispose() {
                this.disposed = true;
                this.onStartEvent = null;
                this.onMessageEvent = null;
                this.onErrorEvent = null;
                this.onFinishedEvent = null;
                this.onCancelEvent = null;
                this.onPageLoadEvent = null;
                this.eventProvider = null
            }
    })})
