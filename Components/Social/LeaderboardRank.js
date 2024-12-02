/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.Social", {LeaderboardRank: MS.Entertainment.UI.Framework.defineUserControl("Components/Social/LeaderboardRank.html#leaderboardRankTemplate", function leaderboardRankControl(){}, {
            _bindings: null, initialize: function initialize() {
                    this._bindings = WinJS.Binding.bind(this, {mediaItem: this._onMediaItemChanged.bind(this)})
                }, unload: function unload() {
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, _onMediaItemChanged: function _onMediaItemChanged() {
                    var signedInUser = MS.Entertainment.Social.Helpers.getSignedInUserModel();
                    if (this.mediaItem && signedInUser) {
                        var leaderboardViewModel = new MS.Entertainment.Social.GameLeaderboardViewModel(this.mediaItem);
                        leaderboardViewModel.getPrimaryLeaderboardData().then(function getUserRank() {
                            if (leaderboardViewModel.primaryLeaderboard) {
                                var signedInGamertag = MS.Entertainment.Social.Helpers.getGamerTagFromUserModel(signedInUser.userModel);
                                MS.Entertainment.Social.GameLeaderboardViewModel.getLeaderboardPositionByGamertag(signedInGamertag, leaderboardViewModel.primaryLeaderboard).then(function leaderboardPosition(position) {
                                    if (position && position.rank && position.total > 1 && leaderboardViewModel.primaryLeaderboard.label) {
                                        this.leaderboardPosition = position;
                                        this.leaderboardLabel = leaderboardViewModel.primaryLeaderboard.label;
                                        var domEvent = document.createEvent("Event");
                                        domEvent.initEvent("contentLoaded", true, false);
                                        domEvent.userControl = this;
                                        this.domElement.dispatchEvent(domEvent)
                                    }
                                }.bind(this))
                            }
                        }.bind(this))
                    }
                }
        }, {
            mediaItem: null, leaderboardPosition: null, leaderboardLabel: String.empty
        })})
})()
