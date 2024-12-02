/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {
        LeaderboardsControl: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.BaseImmersiveSummary, "/Components/Immersive/Games/Leaderboards.html#ImmersiveLeaderboards", function leaderboardsControlConstructor(element, options){}, {
            initialize: function initialize() {
                this.dataContext.viewModel.getPrimaryLeaderboardData()
            }, onItemClicked: function onItemClicked(e) {
                    if (this.dataContext && this.dataContext.viewModel && e.srcElement && e.srcElement.parentElement) {
                        var indexContainer = e.srcElement.parentElement.querySelector(".modifierIndex");
                        if (indexContainer) {
                            this.dataContext.viewModel.defaultSelectionIndex = indexContainer.innerText;
                            this._showLeaderboardsFrame()
                        }
                    }
                }, onKeyDown: function onKeyDown(e) {
                    if (e.keyCode === WinJS.Utilities.Key.enter || e.keyCode === WinJS.Utilities.Key.space)
                        this.onItemClicked(e)
                }, _showLeaderboardsFrame: function _showLeaderboardsFrame() {
                    var viewMore = this.domElement.parentElement.querySelector(".viewMoreRow");
                    if (viewMore && viewMore.children && viewMore.children.length) {
                        MS.Entertainment.UI.Framework.focusElement(viewMore.children[0]);
                        viewMore.children[0].click()
                    }
                }
        }), LeaderControl: MS.Entertainment.UI.Framework.defineUserControl("/Components/Immersive/Games/Leaderboards.html#immersiveLeaderTemplate", function leaderControlConstructor(element, options){}, {
                leaderClicked: function leaderClicked(event) {
                    if (this.leader && this.leader.onClick)
                        this.leader.onClick(this.leader)
                }, leaderKeyDown: function leaderKeyDown(event) {
                        if (event.keyCode === WinJS.Utilities.Key.enter || event.keyCode === WinJS.Utilities.Key.space)
                            this.leaderClicked(event)
                    }
            }, {leader: null})
    })
})()
