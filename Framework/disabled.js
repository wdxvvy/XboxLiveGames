/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/debug.js", "/Framework/shell.js", "/Framework/serviceLocator.js");
(function(undefined) {
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Actions");
    WinJS.Namespace.define("MS.Entertainment.UI.Actions", {disabled: MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function disabledConstructor() {
            this.base()
        }, {
            executed: function executed(param){}, canExecute: function canExecute(param) {
                    return false
                }, isEnabled: false
        })});
    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.disabled, function() {
        return new MS.Entertainment.UI.Actions.disabled
    })
})()
