/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function(undefined) {
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {GalleryGroupHeader: MS.Entertainment.UI.Framework.defineUserControl(null, function galleryGroupHeader(){}, {controlName: "GalleryGroupHeader"}, {model: null})});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {DateAbbreviationGroupHeader: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.GalleryGroupHeader, "Controls/galleryGroupHeader.html#dateAbbreviationGroupHeaderTemplate", function dateAbbreviationGroupHeader(){})});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {AchievementDateAbbreviationGroupHeader: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.GalleryGroupHeader, "Controls/galleryGroupHeader.html#achievementDateAbbreviationGroupHeaderTemplate", function achievementDateAbbreviationGroupHeader(){}, {
            _bindings: null, initialize: function initialize() {
                    this._bindings = WinJS.Binding.bind(this, {model: this._handleModelChanges.bind(this)})
                }, unload: function unload() {
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null
                    }
                    MS.Entertainment.UI.Controls.GalleryGroupHeader.prototype.unload.call(this)
                }, _handleModelChanges: function _handleModelChanges(newValue, oldValue) {
                    if (newValue) {
                        this.date = newValue.unlockedOnline ? newValue.earnedDate : null;
                        this.text = !newValue.unlockedOnline ? String.load(String.id.IDS_SOCIAL_ACHIEVEMENT_EARNED_OFFLINE) : String.empty
                    }
                    else {
                        this.date = null;
                        this.text = String.empty
                    }
                }
        }, {
            date: null, text: String.empty
        })})
}())
