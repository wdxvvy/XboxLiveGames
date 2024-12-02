/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Framework/corefx.js", "/Framework/debug.js", "/Framework/Utilities.js", "/Controls/GalleryControl.js");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {
        AchievementsGalleryControl: MS.Entertainment.UI.Framework.defineUserControl("/Components/Immersive/Games/AchievementsGalleryControl.html#achievementsGalleryTemplate", function compareAchievementsGallery(element, options) {
            this.listViewModel = new MS.Entertainment.ViewModels.AchievementsListViewModel
        }, {
            _bindings: null, _shareOperation: null, initialize: function initialize() {
                    this.listViewModel.showSecondary = this.showSecondary;
                    this._bindings = WinJS.Binding.bind(this, {_galleryControl: {selectedIndex: this._updatePendingShare.bind(this)}})
                }, unload: function unload() {
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null
                    }
                    this._unshareAchievement();
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, _updatePendingShare: function _updatePendingShare() {
                    var selectedIndex = this._galleryControl.selectedIndex;
                    this._galleryControl.getDataObjectAtIndex(this._galleryControl.selectedIndex).then(function objectAtIndex(selectedItem) {
                        if (selectedIndex !== this._galleryControl.selectedIndex)
                            return;
                        this._unshareAchievement();
                        if (selectedItem && selectedItem.media && this.parentDataItem) {
                            var sharePackage = {
                                    socialDataType: MS.Entertainment.Data.Augmenter.XboxLive.SocialDataType.achievement, title: selectedItem.title, description: selectedItem.displayDescription, earned: selectedItem.earned, imageUri: selectedItem.imageUri, webUri: selectedItem.webUri, media: {
                                            titleId: selectedItem.media.titleId, name: this.parentDataItem.name
                                        }, mediaId: selectedItem.titleId
                                };
                            var sender = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.shareSender);
                            this._shareOperation = sender.pendingShare(sharePackage)
                        }
                    }.bind(this), function objectAtIndexError() {
                        this._unshareAchievement()
                    }.bind(this))
                }, _unshareAchievement: function _unshareAchievement() {
                    if (this._shareOperation) {
                        this._shareOperation.cancel();
                        this._shareOperation = null
                    }
                }
        }, {
            showSecondary: false, model: null, achievementsDataSource: null, listViewModel: null
        }), AchievementDetails: MS.Entertainment.UI.Framework.defineUserControl("/Components/Immersive/Games/AchievementsGalleryControl.html#achievementDetailsTemplate", function compareAchievementsPanel() {
                model:{};
                {}
            }, {}, {model: null}), AchievementGamerDetailsSelector: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.TemplateSelector, null, function achievementGamerDetailsSelector(element, options) {
                this.selectors = [this._selectEarnedTemplate.bind(this), this._selectUnearnedTemplate.bind(this)]
            }, {
                controlName: "AchievementGamerDetailsSelector", _selectEarnedTemplate: function _selectPlayedTemplate(model) {
                        if (model && model.earned)
                            return "/Components/Immersive/Games/AchievementsGalleryControl.html#earnedAchievementGamerDetailsTemplate"
                    }, _selectUnearnedTemplate: function _selectUnplayedTemplate(model) {
                        if (!model || !model.earned)
                            return "/Components/Immersive/Games/AchievementsGalleryControl.html#unearnedAchievementGamerDetailsTemplate"
                    }
            })
    })
})()
