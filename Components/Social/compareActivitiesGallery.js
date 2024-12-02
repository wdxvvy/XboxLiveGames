/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Controls/Link.js", "/Controls/templateSelector.js", "/Controls/avatarControl.js", "/Controls/hub.js", "/Controls/failedPanel.js", "/Framework/corefx.js", "/Framework/imageloader.js", "/Framework/stringids.js", "/Framework/utilities.js", "/Framework/data/queries/modelProperties.js", "/Framework/data/augmenters/xboxLiveAugmenters.js", "/Components/SignIn/SignIn.js", "/ViewModels/social/profileHydrator.js");
(function(undefined) {
    WinJS.Namespace.define("MS.Entertainment.Social", {
        CompareActivitiesGallery: MS.Entertainment.UI.Framework.defineUserControl("Components/Social/compareActivitiesGallery.html#compareActivitiesGalleryTemplate", function compareActivitiesGallery(element, options) {
            this.model = new MS.Entertainment.Social.ActivityComparer;
            this.listViewModel = {
                primaryProfile: {}, secondaryProfile: {}, secondaryUserXuid: {}, secondaryUserModel: {}
            };
            this.emptyGalleryModel = new MS.Entertainment.UI.Controls.DefaultFailedPanelModel;
            this.emptyGalleryModel.action = MS.Entertainment.Social.Actions.createButtonAction(MS.Entertainment.UI.Actions.ActionIdentifiers.navigate, null, MS.Entertainment.UI.Monikers.gamesWindowsMarketplace, null, MS.Entertainment.UI.AutomationIds.failedPanelNavigateToMarketplace)
        }, {
            _selectActivity: null, _readyInvoked: false, _modelBindings: null, initialize: function initialize() {
                    this.domElement.addEventListener("galleryFirstPageRendered", function galleryFirstPageRendered() {
                        MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioCompareGamesRequestToLoad()
                    });
                    var pageData = new MS.Entertainment.Social.PageData;
                    this.model.primaryUserModel = this.primaryUserModel;
                    this.model.secondaryUserXuid = pageData.userXuid;
                    this.model.secondaryUserGamerTag = pageData.userModel.gamerTag;
                    this.listViewModel.secondaryUserModel = this.secondaryUserModel;
                    this.listViewModel.secondaryUserXuid = pageData.userXuid;
                    this.model.enabled = true;
                    _modelBindings = WinJS.Binding.bind(this.model, {
                        status: this._handleModelStatus.bind(this), activities: this._handleActivitiesChanged.bind(this), primaryProfile: this._handlePrimaryProfileChanged.bind(this), secondaryProfile: this._handleSecondaryProfileChanged.bind(this)
                    });
                    var currentPage = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).currentPage;
                    if (currentPage.options && currentPage.options.selectActivity)
                        this._selectActivity = currentPage.options.selectActivity
                }, unload: function unload() {
                    if (this._modelBindings) {
                        this._modelBindings.cancel();
                        this._modelBindings = null
                    }
                    this.listViewModel = null;
                    this.model.dispose();
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, _handleModelStatus: function _handleModelStatus(status) {
                    var statusValue = MS.Entertainment.Social.LoadStatus;
                    switch (status) {
                        case statusValue.error:
                            this._raisePanelReadyOnce(true, {
                                primaryStringId: String.id.IDS_SOCIAL_ERROR, secondaryText: String.empty
                            });
                            break;
                        case statusValue.offline:
                            this._raisePanelReadyOnce(true, {
                                primaryStringId: String.id.IDS_SOCIAL_ERROR_OFFLINE_COMPARE_GAMES, secondaryText: String.empty
                            });
                            break;
                        case statusValue.loaded:
                            this.emptyGalleryModel.primaryStringId = String.id.IDS_SOCIAL_EMPTY_COMPARE_GAMES_TITLE;
                            this.emptyGalleryModel.secondaryStringId = String.id.IDS_SOCIAL_EMPTY_COMPARE_GAMES_DESC;
                            this._raisePanelReadyOnce(false);
                            break;
                        case statusValue.blocked:
                            this.emptyGalleryModel.primaryStringId = String.id.IDS_SOCIAL_BLOCKED_GAME_HISTORY;
                            this.emptyGalleryModel.secondaryStringId = null;
                            this.activitiesDataSource = new MS.Entertainment.Data.List;
                            this._raisePanelReadyOnce(false);
                            break;
                        default:
                            this.emptyGalleryModel.primaryStringId = null;
                            this.emptyGalleryModel.primaryText = null;
                            this.emptyGalleryModel.secondaryStringId = null;
                            this.emptyGalleryModel.secondaryText = null;
                            break
                    }
                }, _raisePanelReadyOnce: function _raisePanelReadyOnce(error, errorModel) {
                    if (!this._readyInvoked) {
                        this._readyInvoked = true;
                        MS.Entertainment.UI.Controls.Panel.raisePanelReady(this.domElement, error, errorModel)
                    }
                }, _handleActivitiesChanged: function _handleActivitiesChanged(newActivities) {
                    if (!newActivities)
                        this.activitiesDataSource = null;
                    else {
                        this.activitiesDataSource = newActivities;
                        this._applyPendingSelection()
                    }
                }, _handlePrimaryProfileChanged: function _handlePrimaryProfileChanged(newProfile) {
                    this.listViewModel.primaryProfile = newProfile
                }, _handleSecondaryProfileChanged: function _handleSecondaryProfileChanged(newProfile) {
                    this.listViewModel.secondaryProfile = newProfile
                }, _applyPendingSelection: function _applyPendingSelection() {
                    if (this.model.activities && this._selectActivity) {
                        var index = 0;
                        var select = this._selectActivity;
                        this._selectActivity = null;
                        this.model.activities.itemsFromIndex(0).then(function(result) {
                            if (result.items)
                                for (var i = 0; i < result.items.length; i++)
                                    if (this._activitiesEqual(select, result.items[i].data)) {
                                        this.gallery.selectIndex(i);
                                        break
                                    }
                        }.bind(this))
                    }
                }, _activitiesEqual: function _activitiesEqual(activity1, activity2) {
                    return (activity1) && (activity2) && (activity1.media) && (activity2.media) && (activity1.media.titleId === activity2.media.titleId)
                }
        }, {
            isLoaded: false, primaryUserXuid: null, secondaryUserXuid: null, primaryUserModel: null, secondaryUserModel: null, model: null, activitiesDataSource: null, listViewModel: null, emptyGalleryModel: null
        }, {canInvokeForItem: WinJS.Utilities.markSupportedForProcessing(function canInvokeForItem(data) {
                if (data && data.data && data.data.media)
                    return MS.Entertainment.Utilities.isGameItemAvailable(data.data.media);
                else
                    return false
            })}), CompareHeader: MS.Entertainment.UI.Framework.defineUserControl("Components/Social/compareActivitiesGallery.html#compareHeaderTemplate", function compareHeader(element, options) {
                this.primaryProfile = MS.Entertainment.Social.Helpers.emptyProfile;
                this.secondaryProfile = MS.Entertainment.Social.Helpers.emptyProfile
            }, {
                initialize: function initialize() {
                    this.bind("primaryProfile", this._handleProfileChange.bind(this));
                    this.bind("secondaryProfile", this._handleProfileChange.bind(this))
                }, _handleProfileChange: function _handleProfileChange() {
                        if (this.primaryProfile && this.secondaryProfile && this.primaryProfile.gamerTag && this.secondaryProfile.gamerTag)
                            this.hasTwoProfiles = true;
                        else
                            this.hasTwoProfiles = false
                    }
            }, {
                primaryProfile: null, secondaryProfile: null, primaryActivitiesCount: 0, secondaryActivitiesCount: 0, hasTwoProfiles: null
            }), GamerHeaderTile: MS.Entertainment.UI.Framework.defineUserControl("Components/Social/compareActivitiesGallery.html#gamerHeaderTileTemplate", function compareHeaderTile(element, options) {
                this.model = {}
            }, {
                initialize: function initialize() {
                    this.bind("model", this._handleProfileChange.bind(this));
                    this.bind("totalActivities", this._handleProfileChange.bind(this))
                }, _handleProfileChange: function _handleProfileChange() {
                        if (this.model) {
                            if (this.model.gamerScore !== undefined && this.gamerScoreLabel)
                                this.gamerScoreLabel.textContent = String.load(String.id.IDS_SOCIAL_GAMERSCORE_NAR).format(this.model.gamerScore);
                            if (this.totalActivities !== undefined && this.totalActivitiesLabel)
                                this.totalActivitiesLabel.textContent = String.load(String.id.IDS_SOCIAL_GAMESPLAYED_NAR).format(this.totalActivities)
                        }
                    }
            }, {
                model: null, totalActivities: 0
            })
    })
})()
