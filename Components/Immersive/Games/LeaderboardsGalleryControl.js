/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Framework/corefx.js", "/Framework/debug.js", "/Framework/Utilities.js", "/Controls/listControls.js");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {LeaderboardsGalleryControl: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.MoreGalleryControl, "/Components/Immersive/Shared/MoreGalleryControl.html#MoreListControl", null, {
            _shareBindings: null, _shareOperation: null, initialize: function initialize() {
                    MS.Entertainment.UI.Controls.MoreGalleryControl.prototype.initialize.apply(this, arguments);
                    this._shareBindings = WinJS.Binding.bind(this, {dataContext: {currentLeaderboard: this._shareLeaderboard.bind(this)}});
                    MS.Entertainment.UI.Framework.waitForControlToInitialize(this._gallery.domElement).then(function() {
                        return WinJS.Promise.timeout(700)
                    }).then(function() {
                        MS.Entertainment.UI.Framework.focusFirstInSubTree(this._gallery.domElement)
                    }.bind(this))
                }, unload: function unload() {
                    if (this._shareBindings) {
                        this._shareBindings.cancel();
                        this._shareBindings = null
                    }
                    this._unshareLeaderboard();
                    MS.Entertainment.UI.Controls.MoreGalleryControl.prototype.unload.apply(this)
                }, _shareLeaderboard: function _shareLeaderboard() {
                    var sender = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.shareSender);
                    this._unshareLeaderboard();
                    if (this.dataContext.currentLeaderboard)
                        this._shareOperation = sender.pendingShare(this.dataContext.currentLeaderboard)
                }, _unshareLeaderboard: function _unshareLeaderboard() {
                    if (this._shareOperation) {
                        this._shareOperation.cancel();
                        this._shareOperation = null
                    }
                }
        })})
})()
