/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Controls/failedPanel.js", "/Framework/corefx.js", "/Framework/stringids.js", "/Framework/utilities.js", "/ViewModels/Social/profileComparer.js");
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {
        CompareAchievementsViewModel: WinJS.Class.define(function compareAchievementsViewModelConstructor(mediaItem, secondary) {
            MS.Entertainment.ViewModels.assert(mediaItem, "Need mediaItem to compare achievements for");
            this._mediaItem = mediaItem;
            var secondaryUserModel = secondary ? secondary.userModel : null;
            this.activity = {media: {imageUri: null}};
            this.model = new MS.Entertainment.Social.AchievementComparer;
            if (secondaryUserModel && secondaryUserModel.identity) {
                this.model.secondaryUserXuid = secondaryUserModel.identity.xuid;
                this.model.secondaryUserGamerTag = secondaryUserModel.identity.gamerTag
            }
            else if (secondaryUserModel && secondary.userXuid) {
                this.model.secondaryUserXuid = secondary.userXuid;
                this.model.secondaryUserGamerTag = secondaryUserModel.gamerTag
            }
            else
                this.model.secondaryUserModel = secondaryUserModel;
            this.model.loadTitleHistory = false;
            this.model.titleId = this._mediaItem.titleId;
            this._activityComparer = new MS.Entertainment.Social.ActivityComparer;
            if (secondaryUserModel && secondaryUserModel.identity) {
                this._activityComparer.secondaryUserXuid = secondaryUserModel.identity.xuid;
                this._activityComparer.secondaryUserGamerTag = secondaryUserModel.identity.gamerTag
            }
            else if (secondaryUserModel && secondary.userXuid) {
                this._activityComparer.secondaryUserXuid = secondary.userXuid;
                this._activityComparer.secondaryUserGamerTag = secondaryUserModel.gamerTag
            }
            else
                this._activityComparer.secondaryUserModel = secondaryUserModel;
            this._activityComparer.titleSearchId = this._mediaItem.titleId;
            this.showSecondary = (!!this._activityComparer.secondaryUserModel) || (!!this._activityComparer.secondaryUserXuid);
            this._bindings = WinJS.Binding.bind(this.model, {
                status: this._handleModelStatus.bind(this), achievements: this._handleAchievementsChanged.bind(this)
            });
            this._activityComparer.bind("status", this._handleModelStatus.bind(this));
            this._activityComparer.bind("titleSearchResult", this._handleTitleSearchResultChanged.bind(this))
        }, {
            model: null, activity: null, achievementsDataSource: null, showSecondary: false, _mediaItem: null, _activityComparer: null, _completion: null, _error: null, _bindings: null, dispose: function dispose() {
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null
                    }
                    this.model.dispose();
                    this._activityComparer.dispose()
                }, begin: function begin() {
                    try {
                        Microsoft.Xbox.XboxLIVEService.invalidateCacheGroup(Microsoft.Xbox.CacheGroup.achievements)
                    }
                    catch(e) {}
                    this.model.enabled = true;
                    this._activityComparer.enabled = true;
                    var promise = new WinJS.Promise(function(c, e, p) {
                            this._completion = c;
                            this._error = e
                        }.bind(this));
                    return promise
                }, _handleModelStatus: function _handleModelStatus(status) {
                    if (this.model.status === MS.Entertainment.Social.LoadStatus.offline || this._activityComparer.status === MS.Entertainment.Social.LoadStatus.offline)
                        this._error(String.load(String.id.IDS_SOCIAL_ERROR_OFFLINE_ACHIEVEMENTS));
                    else if (this.model.status === MS.Entertainment.Social.LoadStatus.error || this._activityComparer.status === MS.Entertainment.Social.LoadStatus.error)
                        this._error(String.load(String.id.IDS_SOCIAL_ERROR));
                    else if (this.model.status === MS.Entertainment.Social.LoadStatus.blocked || this._activityComparer.status === MS.Entertainment.Social.LoadStatus.blocked)
                        this._error(String.load(String.id.IDS_SOCIAL_BLOCKED_ACHIEVEMENTS))
                }, _handleAchievementsChanged: function _handleAchievementsChanged(newAchievements) {
                    if (this.model.status === MS.Entertainment.Social.LoadStatus.loaded || this._activityComparer.status === MS.Entertainment.Social.LoadStatus.loaded) {
                        if (newAchievements)
                            this.achievementsDataSource = newAchievements;
                        else
                            this.achievementsDataSource = [];
                        this._completion(this.model.hasAchievements)
                    }
                }, _handleTitleSearchResultChanged: function _handleTitleSearchResultChanged(newTitleActivity) {
                    this.activity = newTitleActivity
                }
        }), AchievementsListViewModel: MS.Entertainment.defineObservable(function compareAchievementsListViewModel(){}, {showSecondary: true})
    })
})()
