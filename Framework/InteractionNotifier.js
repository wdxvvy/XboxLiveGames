/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/debug.js", "/Framework/serviceLocator.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Components.Shell");
WinJS.Namespace.define("MS.Entertainment.Framework", {InteractionNotifier: WinJS.Class.define(function InteractionNotifier() {
        this._listenerFunctions = [];
        var that = this;
        var handler = this._notifyListeners.bind(this);
        document.body.addEventListener("keydown", handler, false);
        document.body.addEventListener("mousewheel", handler, false);
        document.body.addEventListener("MSPointerDown", handler, false);
        document.body.addEventListener("MSPointerMove", handler, false)
    }, {
        _listenerFunctions: null, _notifyListeners: function _notifyListeners() {
                for (var i = 0; i < this._listenerFunctions.length; i++)
                    try {
                        this._listenerFunctions[i]()
                    }
                    catch(exception) {
                        MS.Entertainment.UI.Components.Shell.assert(false, "Interaction listener failed " + this._listenerFunctions[i].toString() + "\r\nException: " + exception.toString())
                    }
            }, addInteractionListener: function addInteractionListener(listenerFunction) {
                this._listenerFunctions.push(listenerFunction)
            }, removeInteractionListener: function removeInteractionListener(listenerFunction) {
                var index = this._listenerFunctions.indexOf(listenerFunction);
                if (index > -1)
                    this._listenerFunctions.splice(index, 1)
            }
    }, null)});
MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.interactionNotifier, function InteractionNotifierFactory() {
    return new MS.Entertainment.Framework.InteractionNotifier
})
