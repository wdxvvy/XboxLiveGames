/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Controls/gallerygrouper.js", "/Controls/failedPanel.js", "/Framework/corefx.js", "/Framework/stringids.js", "/Framework/utilities.js", "/Framework/data/queries/modelproperties.js", "/ViewModels/Social/profileHydrator.js");
(function(undefined) {
    WinJS.Namespace.define("MS.Entertainment.Social", {
        AchievementGameGrouper: WinJS.Class.derive(MS.Entertainment.UI.Controls.GalleryGrouper, function achievementGameGrouper() {
            this.keyPropertyName = "titleId";
            this.useKeyAsData = false
        }), AchievementEarnedGrouper: WinJS.Class.derive(MS.Entertainment.UI.Controls.GalleryMonthGrouper, function achievementEarnedGrouper() {
                this.keyPropertyName = "earnedDate";
                this.useKeyAsData = false
            })
    });
    WinJS.Namespace.define("MS.Entertainment.Social", {AchievementGallery: MS.Entertainment.UI.Framework.defineUserControl("Components/Social/achievementGallery.html#achievementGalleryTemplate", function achievementGalleryConstructor(element, options) {
            this.emptyGalleryModel = new MS.Entertainment.UI.Controls.DefaultFailedPanelModel;
            this.emptyGalleryModel.action = MS.Entertainment.Social.Actions.createButtonAction(MS.Entertainment.UI.Actions.ActionIdentifiers.navigate, null, MS.Entertainment.UI.Monikers.gamesWindowsMarketplace);
            this._primaryModifierSelectedItemChangedCallback = this._primaryModifierSelectedItemChanged.bind(this);
            this._secondaryModifierSelectedItemChangedCallback = this._secondaryModifierSelectedItemChanged.bind(this);
            this.model = MS.Entertainment.Social.Helpers.getSignedInUserModel();
            this.model.refreshAchievementsBindings();
            this._statusBinding = WinJS.Binding.bind(this, {model: {status: this._handleModelStatus.bind(this)}});
            this.listViewModel = {model: this.model}
        }, {
            _raisePanelReady: true, _primaryModifierSelectedItemChangedCallback: null, _secondaryModifierSelectedItemChangedCallback: null, _statusBinding: null, _achievementBinding: null, _pendingAchievementSort: null, _pendingAchievementFilter: null, selectAchievement: null, userXuid: null, userModel: null, initialize: function initialize() {
                    this.domElement.addEventListener("galleryFirstPageRendered", function galleryFirstPageRendered() {
                        MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioAchievementsRequestToLoad()
                    });
                    this.model.loadActivity = false;
                    this.model.loadFriends = false;
                    this.model.loadProfile = false;
                    this.model.loadMessages = false;
                    this.model.loadAchievements = true;
                    this.model.clearAchievementsCache = true;
                    this.model.achievementsSort = MS.Entertainment.Data.Query.Properties.achievementSort.game;
                    this.model.achievmentsFilter = MS.Entertainment.Data.Query.Properties.achievementFilter.undefined;
                    this.model.enabled = true;
                    this.model.refresh(false).done();
                    WinJS.Promise.wrap(this._initializeModifiers()).then(this._initializeAchievementsBindings.bind(this));
                    this.galleryView.bind("selectedIndex", this._updatePendingShare.bind(this));
                    this.galleryView.selectionHelperOptions = {allowShare: false};
                    this.galleryView.setReadyStateCallback(this._readyStateChanged.bind(this))
                }, _readyStateChanged: function _readyStateChanged(state) {
                    if (state.readyState === MS.Entertainment.UI.Controls.GalleryControl.ReadyState.complete) {
                        if (this._pendingAchievementSort)
                            this._setPrimaryModifierValue(this._pendingAchievementSort.item, this._pendingAchievementSort.sort);
                        else if (this._pendingAchievementFilter)
                            this._setSecondaryModifierValue(this._pendingAchievementFilter);
                        this._pendingAchievementSort = null;
                        this._pendingAchievementFilter = null
                    }
                }, unload: function unload() {
                    this._uninitializeModifiers();
                    this._uninitializeAchievementsBindings();
                    if (this._statusBinding) {
                        this._statusBinding.cancel();
                        this._statusBinding = null
                    }
                    if (this.achievementsDataSource) {
                        this.achievementsDataSource.dispose();
                        this.achievementsDataSource = null
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, _initializeAchievementsBindings: function _initializeAchievementsBindings() {
                    this._achievementBinding = WinJS.Binding.bind(this, {model: {achievements: this._handleAchievementsChanged.bind(this)}})
                }, _uninitializeAchievementsBindings: function _uninitializeAchievementsBindings() {
                    if (this._achievementBinding) {
                        this._achievementBinding.cancel();
                        this._achievementBinding = null
                    }
                }, _handleAchievementsChanged: function _handleAchievementsChanged(newAchievements) {
                    if (newAchievements) {
                        if (this.achievementsDataSource)
                            this.achievementsDataSource.dispose();
                        this.achievementsDataSource = newAchievements;
                        this._applyPendingSelection();
                        this._updatePendingShare()
                    }
                }, _handleModelStatus: function _handleModelStatus(newValue, oldValue) {
                    var statusValue = MS.Entertainment.Social.LoadStatus;
                    switch (newValue) {
                        case statusValue.error:
                            this._raisePanelReadyOnce(true, {
                                primaryStringId: String.id.IDS_SOCIAL_ERROR, secondaryText: String.empty
                            });
                            if (this.galleryView)
                                MS.Entertainment.Utilities.hideElement(this.galleryView.domElement);
                            break;
                        case statusValue.offline:
                            this._raisePanelReadyOnce(true, {
                                primaryStringId: String.id.IDS_SOCIAL_ERROR_OFFLINE_ACHIEVEMENTS, secondaryText: String.empty
                            });
                            if (this.galleryView)
                                MS.Entertainment.Utilities.hideElement(this.galleryView.domElement);
                            break;
                        case statusValue.loaded:
                            if (this.model.isSignedInUser) {
                                this.emptyGalleryModel.primaryStringId = String.id.IDS_SOCIAL_MY_EMPTY_ACHIEVEMENTS_TITLE;
                                this.emptyGalleryModel.secondaryStringId = String.id.IDS_SOCIAL_MY_EMPTY_ACHIEVEMENTS_DESC
                            }
                            else
                                this.emptyGalleryModel.primaryText = String.load(String.id.IDS_SOCIAL_X_EMPTY_ACHIEVEMENTS_TITLE).format(this.model.profile.gamerTag);
                            this._raisePanelReadyOnce(false);
                            break;
                        case statusValue.loading:
                            this._raisePanelResetOnce();
                            break;
                        case statusValue.blocked:
                            this._raisePanelReadyOnce(true, {
                                primaryStringId: String.id.IDS_SOCIAL_BLOCKED_ACHIEVEMENTS, secondaryText: String.empty
                            });
                            if (this.galleryView)
                                MS.Entertainment.Utilities.hideElement(this.galleryView.domElement);
                            break;
                        default:
                            this.emptyGalleryModel.primaryStringId = null;
                            this.emptyGalleryModel.primaryText = null;
                            this.emptyGalleryModel.secondaryStringId = null;
                            this.emptyGalleryModel.secondaryText = null;
                            break
                    }
                }, _raisePanelReadyOnce: function _raisePanelReadyOnce(error, errorModel) {
                    if (this._raisePanelReady) {
                        this._raisePanelReady = false;
                        MS.Entertainment.UI.Controls.Panel.raisePanelReady(this.domElement, error, errorModel)
                    }
                }, _raisePanelResetOnce: function _raisePanelResetOnce() {
                    if (!this._raisePanelReady) {
                        if (this.galleryView && this.galleryView.domElement)
                            MS.Entertainment.Utilities.empty(this.galleryView.domElement);
                        MS.Entertainment.UI.Controls.Panel.raisePanelReset(this.domElement);
                        this._raisePanelReady = true
                    }
                }, _applyPendingSelection: function _applyPendingSelection() {
                    if (this.model.achievements && this.selectAchievement) {
                        var index = 0;
                        var select = this.selectAchievement;
                        this.selectAchievement = null;
                        this.model.achievements.itemsFromIndex(0).then(function(result) {
                            if (result.items)
                                for (var i = 0; i < result.items.length; i++)
                                    if (this._achievementsEqual(select, result.items[i].data)) {
                                        this.galleryView.selectIndex(i);
                                        break
                                    }
                        }.bind(this))
                    }
                }, _achievementsEqual: function _achievementsEqual(achievement1, achievement2) {
                    return (achievement1) && (achievement2) && (achievement1.title === achievement2.title) && (achievement1.titleId === achievement2.titleId)
                }, _updatePendingShare: function _updatePendingShare() {
                    if (this.galleryView) {
                        var selectedIndex = this.galleryView.selectedIndex;
                        this.galleryView.getDataObjectAtIndex(this.galleryView.selectedIndex).then(function(selectedItem) {
                            if (selectedIndex !== this.galleryView.selectedIndex)
                                return;
                            var sender = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.shareSender);
                            if (selectedItem) {
                                this._addAchievementsGameName(selectedItem);
                                selectedItem.gamerTag = this.model.profile.gamerTag;
                                var sharePackage = {
                                        socialDataType: MS.Entertainment.Data.Augmenter.XboxLive.SocialDataType.achievement, title: selectedItem.name, description: selectedItem.displayDescription, earned: selectedItem.earned, imageUri: selectedItem.imageUri, webUri: selectedItem.webUri, media: {
                                                titleId: selectedItem.media.titleId, name: selectedItem.media.name
                                            }, mediaId: selectedItem.titleId
                                    };
                                sender.pendingShare(sharePackage)
                            }
                            else
                                sender.pendingShare(null)
                        }.bind(this), function(error) {
                            if (selectedIndex !== this.galleryView.selectedIndex)
                                return;
                            var sender = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.shareSender);
                            sender.pendingShare(null)
                        }.bind(this))
                    }
                }, _addAchievementsGameName: function _addAchievementsGameName(achievement) {
                    var activity;
                    if (achievement)
                        activity = this.model.findGameActivity(achievement.titleId);
                    if (activity)
                        achievement.media.name = activity.media.name
                }, _initializeModifiers: function _initializeModifiers() {
                    if (this.primaryModifiers) {
                        this.primaryModifiers.items = MS.Entertainment.Social.ProfileHydrator.achievementSorts;
                        this.primaryModifiers.selectedItem = this._getModifierItem(this.primaryModifiers.items, this.model.achievementsSort);
                        this.primaryModifiers.bind("selectedItem", this._primaryModifierSelectedItemChangedCallback);
                        this._pendingAchievementSort = null;
                        this._pendingAchievementFilter = null;
                        this._setPrimaryModifierValue(this.primaryModifiers.selectedItem, null)
                    }
                    if (this.secondaryModifiers)
                        this.secondaryModifiers.bind("selectedItem", this._secondaryModifierSelectedItemChangedCallback)
                }, _uninitializeModifiers: function _uninitializeModifiers() {
                    if (this.primaryModifiers)
                        this.primaryModifiers.unbind("selectedItem", this._primaryModifierSelectedItemChangedCallback);
                    if (this.secondaryModifiers)
                        this.secondaryModifiers.unbind("selectedItem", this._secondaryModifierSelectedItemChangedCallback)
                }, _getModifierItem: function _getModifierItem(modifierItems, key) {
                    var result;
                    var count = modifierItems ? modifierItems.length : 0;
                    for (var i = 0; i < count; i++)
                        if (modifierItems[i].key === key) {
                            result = modifierItems[i];
                            break
                        }
                    return result
                }, _primaryModifierSelectedItemChanged: function _primaryModifierSelectedItemChanged(selectedItem, oldSelectedItem) {
                    var oldAchievementSort = (oldSelectedItem) ? oldSelectedItem.key : null;
                    if (selectedItem)
                        if (this.galleryView.readyState === MS.Entertainment.UI.Controls.GalleryControl.ReadyState.complete)
                            this._setPrimaryModifierValue(selectedItem, oldAchievementSort);
                        else if (oldSelectedItem)
                            this._pendingAchievementSort = {
                                item: selectedItem, sort: oldAchievementSort
                            }
                }, _setPrimaryModifierValue: function _setPrimaryModifierValue(selectedItem, oldAchievementSort) {
                    this.galleryView.selectedIndex = -1;
                    this.model.achievementsSort = selectedItem.key;
                    this._setItemTemplate(this.model.achievementsSort, oldAchievementSort);
                    this._setGroupTemplate(this.model.achievementsSort, oldAchievementSort);
                    if (this.secondaryModifiers) {
                        this.secondaryModifiers.items = MS.Entertainment.Social.AchievementGallery.secondaryModifies[this.model.achievementsSort];
                        this.secondaryModifiers.selectedItem = this._getModifierItem(this.secondaryModifiers.items, this.model.achievementsFilter)
                    }
                }, _secondaryModifierSelectedItemChanged: function _secondaryModifierSelectedItemChanged(selectedItem, oldSelectedItem) {
                    if (selectedItem)
                        if (this.galleryView.readyState === MS.Entertainment.UI.Controls.GalleryControl.ReadyState.complete)
                            this._setSecondaryModifierValue(selectedItem);
                        else if (oldSelectedItem)
                            this._pendingAchievementFilter = selectedItem
                }, _setSecondaryModifierValue: function _setSecondaryModifierValue(selectedItem) {
                    this.galleryView.selectedIndex = -1;
                    this.model.achievementsFilter = selectedItem.key
                }, _setItemTemplate: function _setItemTemplate(sortId) {
                    if (sortId !== null && sortId !== undefined)
                        this.itemTemplate = MS.Entertainment.Social.AchievementGallery.templates[sortId].item
                }, _setGroupTemplate: function _setGroupTemplate(sortId, oldSortId) {
                    var oldTemplate,
                        newTemplate;
                    if (oldSortId !== null && oldSortId !== undefined)
                        oldTemplate = MS.Entertainment.Social.AchievementGallery.templates[oldSortId];
                    if (sortId !== null && sortId !== undefined) {
                        newTemplate = MS.Entertainment.Social.AchievementGallery.templates[sortId];
                        this.groupTemplate = newTemplate.group;
                        this.grouperType = newTemplate.grouperType
                    }
                }
        }, {
            model: null, achievementsDataSource: null, grouperType: null, groupTemplate: null, itemTemplate: null, primaryModifiers: null, secondaryModifiers: null, listViewModel: null, emptyGalleryModel: null
        }, {
            secondaryModifies: (function() {
                return {get: function() {
                            var value = {};
                            value[MS.Entertainment.Data.Query.Properties.achievementSort.game] = MS.Entertainment.Social.ProfileHydrator.achievementFilters;
                            value[MS.Entertainment.Data.Query.Properties.achievementSort.achievedDate] = [];
                            return value
                        }}
            })(), templates: (function() {
                    var value = {};
                    value[MS.Entertainment.Data.Query.Properties.achievementSort.game] = {
                        item: "Components/Social/SocialTemplates.html#achievementByGameItemTemplate", group: "Components/Social/SocialTemplates.html#achievementsByGameGroupHeaderTemplate", grouperType: MS.Entertainment.Social.AchievementGameGrouper
                    };
                    value[MS.Entertainment.Data.Query.Properties.achievementSort.achievedDate] = {
                        item: "Components/Social/SocialTemplates.html#achievementByDateItemTemplate", group: "Components/Social/SocialTemplates.html#achievementsByDateGroupHeaderTemplate", grouperType: MS.Entertainment.Social.AchievementEarnedGrouper
                    };
                    return value
                })(), extractMediaNameFromAchievement: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function extractMediaNameFromAchievement(sourceValue) {
                    var activity;
                    if (sourceValue && sourceValue.listViewModel && sourceValue.listViewModel.model)
                        activity = sourceValue.listViewModel.model.findGameActivity(sourceValue.data.titleId);
                    if (activity && activity.media && activity.media.name)
                        return activity.media.name;
                    else
                        return String.empty
                })), extractActivityFromAchievement: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function extractActivityFromAchievement(sourceValue) {
                    var activity;
                    if (sourceValue)
                        activity = sourceValue.listViewModel.model.findGameActivity(sourceValue.data.titleId);
                    return activity
                }))
        })});
    WinJS.Namespace.define("MS.Entertainment.Social", {AchievementGameDetails: MS.Entertainment.UI.Framework.defineUserControl("Components/Social/achievementGallery.html#achievementGameDetailsTemplate", function achievementGameDetails() {
            this.activity = {media: {}}
        }, {
            initialize: function initialize() {
                this.bind("activity", function activityChanged() {
                    if (this.activity && this.activity.media)
                        this.detailAvailable = MS.Entertainment.Utilities.isGameItemAvailable(this.activity.media)
                }.bind(this))
            }, onDetailClick: function onDetailClick() {
                    if (this.activity && this.activity.media && MS.Entertainment.Utilities.isGameItemAvailable(this.activity.media))
                        MS.Entertainment.Platform.PlaybackHelpers.showImmersiveDetails(this.activity.media, true, false)
                }
        }, {
            activity: null, detailAvailable: false
        })})
})()
