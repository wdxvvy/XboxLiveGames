/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/debug.js", "/Framework/action.js", "/Framework/actionidentifiers.js", "/Framework/utilities.js", "/Framework/telemetryUtilities.js", "/Framework/serviceLocator.js");
(function(undefined) {
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Actions");
    WinJS.Namespace.define("MS.Entertainment.UI.Actions", {externalNavigateAction: MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function externalNavigateActionConstructor() {
            this.base();
            this.isExternalAction = true
        }, {
            executed: function executed(param) {
                var link = this._extractLink(param);
                if (MS.Entertainment.Utilities.Telemetry.isCurrentPageSearchPage())
                    MS.Entertainment.Utilities.Telemetry.logSearchExit(null, false, "LearnMore", link);
                window.navigate(link)
            }, canExecute: function canExecute(param) {
                    var link = this._extractLink(param);
                    return (link) && (typeof link === "string")
                }, _extractLink: function _extractLink(param) {
                    var url = null;
                    MS.Entertainment.UI.Actions.assert(param, "External navigation action requires a valid link.");
                    if (param && param.link)
                        url = param.link;
                    else if (typeof param === "string")
                        url = param;
                    return url
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.UI.Actions", {externalAdNavigateAction: MS.Entertainment.derive(MS.Entertainment.UI.Actions.externalNavigateAction, function externalAdNavigateActionConstructor() {
            this.base()
        }, {executed: function executed(param) {
                var link = this._extractLink(param);
                MS.Entertainment.Utilities.Telemetry.logAdClicked(link);
                if (MS.Entertainment.Utilities.Telemetry.isCurrentPageSearchPage())
                    MS.Entertainment.Utilities.Telemetry.logSearchExit(null, false, "LearnMore", link);
                Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(link)).done(function launchSuccess(s){}, function launchFailure(e){})
            }})});
    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.externalNavigate, function() {
        return new MS.Entertainment.UI.Actions.externalNavigateAction
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.externalAdNavigate, function() {
        return new MS.Entertainment.UI.Actions.externalAdNavigateAction
    })
})()
