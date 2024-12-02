/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/debug.js", "/Framework/navigation.js", "/Framework/telemetryUtilities.js", "/Framework/serviceLocator.js");
(function(undefined) {
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Actions");
    WinJS.Namespace.define("MS.Entertainment.UI.Actions", {LaunchApp: MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function launchAppConstructor() {
            this.base()
        }, {
            executed: function executed(param) {
                try {
                    var uri = new Windows.Foundation.Uri(param.uri);
                    var options = new Windows.System.LauncherOptions;
                    options.displayApplicationPicker = false;
                    options.treatAsUntrusted = false;
                    var preferredApplicationPackageFamilyName;
                    var preferredApplicationDisplayName;
                    if (param.familyName && param.displayName) {
                        preferredApplicationPackageFamilyName = param.familyName;
                        preferredApplicationDisplayName = param.displayName
                    }
                    else {
                        var parts = param.uri.split(":");
                        MS.Entertainment.UI.Actions.assert(parts && parts.length > 1, "uri is invalid");
                        if (parts && parts.length > 1)
                            switch (parts[0]) {
                                case"microsoftmusic":
                                    preferredApplicationPackageFamilyName = "Microsoft.ZuneMusic_8wekyb3d8bbwe";
                                    preferredApplicationDisplayName = String.load(String.id.IDS_MUSIC_APP_TITLE);
                                    break;
                                case"xboxsmartglass":
                                    preferredApplicationPackageFamilyName = "Microsoft.XboxCompanion_8wekyb3d8bbwe";
                                    preferredApplicationDisplayName = String.load(String.id.IDS_COMPANION_APP_TITLE);
                                    break;
                                case"xboxgames":
                                    preferredApplicationPackageFamilyName = "Microsoft.XboxLIVEGames_8wekyb3d8bbwe";
                                    preferredApplicationDisplayName = String.load(String.id.IDS_GAMES_APP_TITLE);
                                    break;
                                case"microsoftvideo":
                                    preferredApplicationPackageFamilyName = "Microsoft.ZuneVideo_8wekyb3d8bbwe";
                                    preferredApplicationDisplayName = String.load(String.id.IDS_VIDEO_APP_TITLE);
                                    break
                            }
                    }
                    if (MS.Entertainment.Utilities.Telemetry.isCurrentPageSearchPage())
                        MS.Entertainment.Utilities.Telemetry.logSearchExit(null, false, "LaunchApp");
                    if (param.appendGamerTag) {
                        var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                        if (signIn.isSignedIn) {
                            var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                            if (uri.rawUri.indexOf("?") === -1)
                                uri = new Windows.Foundation.Uri(uri.rawUri + "?gamerTag=" + signedInUser.gamerTag);
                            else
                                uri = new Windows.Foundation.Uri(uri.rawUri + "&gamerTag=" + signedInUser.gamerTag)
                        }
                    }
                    if (param.appendSource)
                        for (appMode in Microsoft.Entertainment.Application.AppMode)
                            if (MS.Entertainment.appMode === Microsoft.Entertainment.Application.AppMode[appMode]) {
                                if (uri.rawUri.indexOf("?") === -1)
                                    uri = new Windows.Foundation.Uri(uri.rawUri + "?source=" + appMode);
                                else
                                    uri = new Windows.Foundation.Uri(uri.rawUri + "&source=" + appMode);
                                break
                            }
                    if (param.useFallback && preferredApplicationPackageFamilyName) {
                        var fallbackUri = new Windows.Foundation.Uri("ms-windows-store:PDP?PFN=" + preferredApplicationPackageFamilyName);
                        try {
                            options.fallbackUri = fallbackUri
                        }
                        catch(e) {}
                    }
                    if (!options.fallbackUri && preferredApplicationPackageFamilyName && preferredApplicationDisplayName) {
                        options.preferredApplicationDisplayName = preferredApplicationDisplayName;
                        options.preferredApplicationPackageFamilyName = preferredApplicationPackageFamilyName
                    }
                    Windows.System.Launcher.launchUriAsync(uri, options).then(function launchSuccess(s){}, function launchFailure(e){})
                }
                catch(error) {
                    MS.Entertainment.UI.Actions.assert(false, error)
                }
            }, canExecute: function canExecute(param) {
                    return (param && param.uri) && typeof param.uri === "string"
                }
        })});
    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.launchApp, function() {
        return new MS.Entertainment.UI.Actions.LaunchApp
    })
})()
