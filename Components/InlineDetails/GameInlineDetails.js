/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/ViewModels/MediaItemModel.js", "/Components/InlineDetails/ActionButtonsControl.js", "/Components/InlineDetails/BaseInlineDetails.js");
(function(undefined) {
    WinJS.Namespace.define("MS.Entertainment.Pages", {GameInlineDetails: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.Pages.BaseMediaInlineDetails, "Components/InlineDetails/GameInlineDetails.html#gameInlineDetailsTemplate", function gameInlineDetails(element, options){}, {
            _buttons: null, _hydratePromise: null, _activity: null, initialize: function initialize() {
                    MS.Entertainment.Pages.BaseMediaInlineDetails.prototype.initialize.apply(this, arguments);
                    this.media = MS.Entertainment.ViewModels.MediaItemModel.augment(this.media);
                    this._showPanel(true);
                    this.isSignedIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn).isSignedIn;
                    this.leaderboardRank.domElement.addEventListener("contentLoaded", this._leaderboardRankContentLoaded.bind(this));
                    if (this.isSignedIn) {
                        var signedInUser = MS.Entertainment.Social.Helpers.getSignedInUserModel();
                        if (signedInUser.loadActivity)
                            this._initPersonalizedInfo(signedInUser.findGameActivity(this.media.titleId));
                        else {
                            signedInUser.loadActivity = true;
                            signedInUser.refresh().then(function refreshed() {
                                this._initPersonalizedInfo(signedInUser.findGameActivity(this.media.titleId))
                            }.bind(this))
                        }
                    }
                    this.allowShare = false;
                    this._hydratePromise = this._hydrateMedia().then(function gameHydrated() {
                        if (!this._unloaded) {
                            this.allowShare = true;
                            this._formatDetailsString();
                            this.smartBuyStateEngine.initialize(this.media, this._getSmartButtons(), MS.Entertainment.ViewModels.SmartBuyStateHandlers.onGameInlineDetailsStateChanged);
                            var binding = WinJS.Binding.bind(this.media, {contentNotifications: function() {
                                        this.notifications.dataSource = this.media.contentNotifications;
                                        this._notificationsLoaded()
                                    }.bind(this)});
                            this.leaderboardRank.mediaItem = this.media;
                            this.mediaBindings.push(binding)
                        }
                    }.bind(this), function gameNotHydrated(){})
                }, _initPersonalizedInfo: function _initPersonalizedInfo(activity) {
                    if (!activity)
                        return;
                    this._activity = activity;
                    this.percentageProgress = this._activity.percentageProgress;
                    this.percentageProgressString = this._activity.percentageProgressString;
                    this.percentageProgressNumber = this._activity.percentageProgressNumber;
                    this.gamerscoreProgressString = this._activity.gamerScoreProgress;
                    this.hasBeenPlayed = !!this._activity
                }, _raiseContentReady: function _raiseContentReady() {
                    this._hydratePromise.then(function populateShare() {
                        if (this.allowShare)
                            this._shareModel();
                        MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioPopoverRequestToLoad("game");
                        WinJS.Promise.timeout(500).then(function ready() {
                            MS.Entertainment.Pages.BaseMediaInlineDetails.prototype._raiseContentReady.call(this)
                        }.bind(this))
                    }.bind(this))
                }, _leaderboardRankContentLoaded: function _leaderboardRankContentLoaded(newVal, oldVal) {
                    WinJS.Promise.timeout(750).then(function() {
                        MS.Entertainment.UI.Animation.expandElement(this.leaderboardRank.domElement, [this.notifications.domElement, this.descriptionText])
                    }.bind(this))
                }, _notificationsLoaded: function _notificationsLoaded() {
                    WinJS.Promise.timeout(750).then(function() {
                        MS.Entertainment.UI.Animation.expandElement(this.notifications.domElement, this.descriptionText)
                    }.bind(this))
                }, _getSmartButtons: function _getSmartButtons() {
                    return MS.Entertainment.ViewModels.SmartBuyButtons.getGameInlineDetailsButtons(this.media, MS.Entertainment.UI.Actions.ExecutionLocation.popover)
                }, _formatDetailsString: function _formatDetailsString() {
                    var values = [];
                    if (this.media.releaseDate) {
                        var formatter = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).year;
                        var date = new Date(this.media.releaseDate);
                        values.push(formatter.format(date))
                    }
                    if (this.media.publisher)
                        values.push(this.media.publisher);
                    if (this.media.primaryGenre)
                        values.push(this.media.primaryGenre);
                    this.detailString = values.join(String.load(String.id.IDS_DETAILS_INFO_SEPERATOR))
                }, onClickProgressContainer: function onClickProgressContainer(e) {
                    var immersiveOptions = {
                            hub: "achievements", showInitialFrameViewMore: true
                        };
                    MS.Entertainment.Platform.PlaybackHelpers.showImmersive(this.media, immersiveOptions)
                }, onKeyDownProgressContainer: function onKeyDownProgressContainer(e) {
                    if (e.keyCode === WinJS.Utilities.Key.enter || e.keyCode === WinJS.Utilities.Key.space)
                        this.onClickProgressContainer(e)
                }, onClickLeaderboardRank: function onClickLeaderboardRank(e) {
                    var immersiveOptions = {
                            hub: "leaderboards", showInitialFrameViewMore: true
                        };
                    MS.Entertainment.Platform.PlaybackHelpers.showImmersive(this.media, immersiveOptions)
                }, onKeyDownLeaderboardRank: function onKeyDownLeaderboardRank(e) {
                    if (e.keyCode === WinJS.Utilities.Key.enter || e.keyCode === WinJS.Utilities.Key.space)
                        this.onClickLeaderboardRank(e)
                }
        }, {
            isSignedIn: false, hasBeenPlayed: false, percentageProgress: String.empty, percentageProgressString: String.empty, percentageProgressNumber: 0.0001, gamerscoreProgressString: String.empty
        })});
    WinJS.Namespace.define("MS.Entertainment.Pages", {CompareGameActivityInlineDetails: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.Pages.GameInlineDetails, "Components/InlineDetails/GameInlineDetails.html#gameInlineDetailsTemplate", function compareGameActivityInlineDetails(element, options) {
            this.media = this.media.media;
            this.compareDetails = {
                userModel: null, userXuid: null
            };
            if (options && options.inlineExtraData) {
                this.compareDetails.userModel = options.inlineExtraData.secondaryUserModel;
                this.compareDetails.userXuid = options.inlineExtraData.secondaryUserXuid
            }
        }, {
            compareDetails: null, blockErrorPanel: true, _getSmartButtons: function _getSmartButtons() {
                    return MS.Entertainment.ViewModels.SmartBuyButtons.getCompareGameActivityInlineDetailsButtons(this.media, this.compareDetails)
                }
        })})
})()
