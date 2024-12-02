/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function() {
    var e = WinJS.Promise.wrapError();
    var d = Object.getPrototypeOf(e).done;
    Object.getPrototypeOf(e).done = function(c, e, p) {
        e = e || function(v) {
            if (!(v instanceof Error)) {
                var description;
                try {
                    description = JSON.stringify(v)
                }
                catch(e) {
                    description = "[unknown]"
                }
                v = {
                    number: 0, stack: "", description: description
                }
            }
            debugger;
            MSApp.terminateApp(v)
        };
        d.call(this, c, e, p)
    };
    var c = WinJS.Promise.wrap();
    Object.getPrototypeOf(c).done = function(c) {
        this.then(c).then(null, function(v) {
            if (!(v instanceof Error)) {
                var description;
                try {
                    description = JSON.stringify(v)
                }
                catch(e) {
                    description = "[unknown]"
                }
                v = {
                    number: 0, stack: "", description: description
                }
            }
            debugger;
            MSApp.terminateApp(v)
        })
    };
    var isInUnitTest = (window.location.pathname === "/bootstrap.html");
    var alertsToShow = [];
    var dialogVisible = false;
    function showPendingAlerts() {
        if (dialogVisible || !alertsToShow.length)
            return;
        dialogVisible = true;
        if (!MS.Entertainment.Utilities.isApp2)
            new Windows.UI.Popups.MessageDialog(alertsToShow.shift()).showAsync().done(function() {
                dialogVisible = false;
                showPendingAlerts()
            })
    }
    window.alert = function(message) {
        if (window.console && window.console.log)
            window.console.log(message);
        if (!isInUnitTest) {
            alertsToShow.push(message);
            showPendingAlerts()
        }
    }
})();
WinJS.Namespace.define("MS.Entertainment.UI.Debug", {
    write: (function() {
        var debugUtility = null;
        var console = window.console;
        return function write(text) {
                text = (new Date).toLocaleTimeString() + ": " + text;
                if (console && console.log)
                    console.log(text);
                if (!debugUtility)
                    debugUtility = new Microsoft.Entertainment.Util.Debug;
                debugUtility.outputDebugString(text)
            }
    })(), writeLine: function writeLine(text) {
            MS.Entertainment.UI.Debug.write(text + "\n")
        }, defineAssert: function defineAssert(ns) {
            var resolvedNamespace = WinJS.Utilities.getMember(ns);
            if (resolvedNamespace && resolvedNamespace.assert)
                return;
            WinJS.Namespace.define(ns, {
                assert: function assert(condition, message, optional_parameter, optional_errorLevel) {
                    optional_errorLevel = optional_errorLevel || MS.Entertainment.UI.Debug.errorLevel.high;
                    return MS.Entertainment.UI.Debug._doAssert(condition, ns, message, optional_parameter, optional_errorLevel)
                }, fail: function fail(message, optional_parameter, optional_errorLevel) {
                        WinJS.Utilities.getMember(ns).assert(false, message, optional_parameter, optional_errorLevel)
                    }
            })
        }, errorLevel: {
            high: 0, low: 10
        }, getStackTrace: function getStackTrace() {
            var stackTrace = "";
            try {
                throw new Error;
            }
            catch(e) {
                stackTrace = e.stack
            }
            return stackTrace
        }, _doAssert: (function() {
            var shipAssertProvider;
            return function _doAssert(condition, area, message, parameter, errorLevel) {
                    if (!(condition) && (!MS.Entertainment.UI.Debug.handleAssert || !MS.Entertainment.UI.Debug.handleAssert(condition, area, message, parameter, errorLevel))) {
                        var stack = MS.Entertainment.UI.Debug.getStackTrace();
                        var signature = MS.Entertainment.UI.Debug._getFunctionSignature(stack);
                        if (!shipAssertProvider)
                            shipAssertProvider = new Microsoft.Entertainment.Infrastructure.ShipAssertProvider;
                        shipAssertProvider.shipAssert(area, signature, stack, message, parameter)
                    }
                }
        })(), _getFunctionSignature: function _getFunctionSignature(stackTrace) {
            var fnString = stackTrace.split("\n")[4];
            var signature = fnString.substring(fnString.indexOf("at ") + 3, fnString.indexOf("(") - 1).trim();
            return signature
        }
});
(function() {
    if (console && console.msIsIndependentlyComposed) {
        function dumpElementInformation(message, element) {
            console.log(message + element.id + ", classes: " + element.className + ", independent: " + console.msIsIndependentlyComposed(element) + ", control: " + element.getAttribute("data-win-control"))
        }
        {};
        function dumpHiddenInfo(element) {
            var computedStyle;
            var workingElement = element;
            while (workingElement) {
                computedStyle = window.getComputedStyle(workingElement);
                if (workingElement.className.indexOf && workingElement.className.indexOf("hideFromDisplay") >= 0)
                    dumpElementInformation("Element has the 'hideFromDisplay' class applied. ID:", workingElement);
                else if (workingElement.currentStyle && workingElement.currentStyle.visibility && workingElement.currentStyle.visibility === "hidden")
                    dumpElementInformation("Element has visibility set directly. visibility: " + workingElement.currentStyle.visibility + " ID:", workingElement);
                else if (computedStyle["visibility"] && computedStyle["visibility"] === "hidden")
                    dumpElementInformation("Element, or parent is hidden. visibility: " + workingElement.style.visibility + " ID:", workingElement);
                else if (computedStyle["display"] === "none")
                    dumpElementInformation("Element, or parent is display: none. ID:", workingElement);
                if (computedStyle["opacity"] === 0)
                    dumpElementInformation("Element, or parent has an opacity of 0. ID:", workingElement);
                if (computedStyle["z-index"] < 0)
                    dumpElementInformation("Element, or parent has a negative z-index. ID:", workingElement);
                workingElement = workingElement.parentElement
            }
        }
        {};
        window.addEventListener("animationstart", function animationsStartedTracing(e) {
            if (!console.msIsIndependentlyComposed(e.srcElement)) {
                dumpElementInformation("****animation not independently composed:" + e.animationName + ", ", e.srcElement);
                dumpHiddenInfo(e.srcElement);
                MS.Entertainment.UI.Application.Helpers.failedAnimations++
            }
            {};
            MS.Entertainment.UI.Application.Helpers.animationsRunning++
        });
        window.addEventListener("animationend", function animationsStartedTracing(e) {
            MS.Entertainment.UI.Application.Helpers.animationsRunning--
        });
        window.addEventListener("transitionstart", function transitionsStartedTracing(e) {
            if (!console.msIsIndependentlyComposed(e.srcElement)) {
                dumpElementInformation("****transition not independently composed:" + e.propertyName + ", ", e.srcElement);
                dumpHiddenInfo(e.srcElement);
                MS.Entertainment.UI.Application.Helpers.failedAnimations++
            }
            {}
        })
    }
})()
