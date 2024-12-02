/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/ViewModels/MediaItemModel.js", "/Components/Immersive/Shared/BaseImmersiveSummary.js");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {GameImmersiveOverviewSummary: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.BaseImmersiveOverviewSummary, "/Components/Immersive/Games/GameOverview.html#ImmersiveOverview", function gameImmersiveOverview(){}, {
            _bindings: null, initialize: function initialize() {
                    MS.Entertainment.UI.Controls.BaseImmersiveOverviewSummary.prototype.initialize.apply(this, arguments);
                    this.isSignedIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn).isSignedIn;
                    this.leaderboardRank.domElement.addEventListener("contentLoaded", this._leaderboardRankContentLoaded.bind(this));
                    this._bindings = WinJS.Binding.bind(this.dataContext.mediaItem, {contentNotifications: this._notificationsLoaded.bind(this)});
                    var event = document.createEvent("Event");
                    event.initEvent("contentready", true, false);
                    this.domElement.dispatchEvent(event)
                }, unload: function unload() {
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, _leaderboardRankContentLoaded: function _leaderboardRankContentLoaded(newVal, oldVal) {
                    WinJS.Promise.timeout(750).then(function() {
                        MS.Entertainment.UI.Animation.expandElement(this.leaderboardRank.domElement, [this.notifications.domElement, this.metadataContainer])
                    }.bind(this))
                }, _notificationsLoaded: function _notificationsLoaded() {
                    WinJS.Promise.timeout(500).then(function() {
                        MS.Entertainment.UI.Animation.expandElement(this.notifications.domElement, this.metadataContainer)
                    }.bind(this))
                }
        }, {isSignedIn: false})})
})()
