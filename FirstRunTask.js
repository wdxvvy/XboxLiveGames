/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    var backgroundTaskInstance = Windows.UI.WebUI.WebUIBackgroundTaskInstance.current;
    if (backgroundTaskInstance.task.name === "OEMPreInstall") {
        var appMode = (new Microsoft.Entertainment.Application.Application).init();
        if (appMode === Microsoft.Entertainment.Application.AppMode.games) {
            var endpointManager = new Microsoft.Entertainment.Util.EndpointManager;
            var url = endpointManager.getEndpointUri(Microsoft.Entertainment.Util.Endpoints.EndpointId.seid_TileNotification) + "/x8/feeds/1.1/Tile-Games";
            var tileUpdater = Windows.UI.Notifications.TileUpdateManager.createTileUpdaterForApplication();
            try {
                tileUpdater.enableNotificationQueue(true);
                tileUpdater.startPeriodicUpdate(new Windows.Foundation.Uri(url), Windows.UI.Notifications.PeriodicUpdateRecurrence.twelveHours)
            }
            catch(e) {}
        }
    }
    Microsoft.Xbox.XboxLIVEService.signInAsync().done(function signInSuccess() {
        var intervalId;
        var intervalCnt = 0;
        var closeTask = function() {
                var pushNotificationManager = Microsoft.Xbox.Foundation.PushNotificationManager;
                var channel = pushNotificationManager.applicationChannel;
                if (channel) {
                    if (intervalId)
                        clearInterval(intervalId);
                    setTimeout(function delay() {
                        close()
                    }, 15 * 1000)
                }
                else if (++intervalCnt > 3) {
                    if (intervalId)
                        clearInterval(intervalId);
                    close()
                }
            };
        intervalId = setInterval(closeTask, 5 * 1000)
    }, function signInError(err) {
        close()
    })
})()
