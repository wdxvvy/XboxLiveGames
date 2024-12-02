/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {
        GamesImmersiveViewModel: WinJS.Class.define(function gamesImmersiveViewModel(options, bringFrameIntoView) {
            this.frames = new MS.Entertainment.ObservableArray;
            this._options = options || {};
            this._options.panelOptions = this._options.panelOptions || {};
            this._bringFrameIntoView = bringFrameIntoView
        }, {
            deferredFrameLoadTimeout: 2500, nonDeferredFrameLoadTimeout: 250, frames: null, sessionId: null, _options: null, _mediaItem: null, _extrasViewModel: null, _achievementsViewModel: null, _achievementsFrameIndex: -1, _leaderboardsViewModel: null, _relatedViewModel: null, _titleTypePromise: null, _bringFrameIntoView: null, dispose: function dispose() {
                    if (this._achievementsViewModel) {
                        this._achievementsViewModel.dispose();
                        this._achievementsViewModel = null
                    }
                }, updateMetaData: function updateMetaData(mediaItem, deferAdditionalFrames) {
                    this._mediaItem = mediaItem;
                    if (mediaItem.hydrate)
                        var hydratePromise = mediaItem.hydrate({listenForDBUpdates: true}).then(function mediaHydrated() {
                                this._mediaItem = mediaItem;
                                return mediaItem
                            }.bind(this));
                    else
                        hydratePromise = WinJS.Promise.wrap(mediaItem);
                    this.frames = this.buildHeroFrame(hydratePromise);
                    WinJS.Promise.timeout(deferAdditionalFrames ? this.deferredFrameLoadTimeout : this.nonDeferredFrameLoadTimeout).then(function _delayed() {
                        this.loadAdditionalFrames(hydratePromise)
                    }.bind(this));
                    return hydratePromise
                }, buildHeroFrame: function buildHeroFrame(mediaHydratePromise) {
                    var heroControl = MS.Entertainment.UI.Controls.SplitHero;
                    var frames = new MS.Entertainment.ObservableArray([function makeHeroFrame() {
                                var frame = MS.Entertainment.UI.Controls.Immersive.makeFrame(String.empty, 2, heroControl, "Components/Immersive/Games/SplitHeroMore.html", MS.Entertainment.ViewModels.GamesImmersiveViewModel.Monikers.hero);
                                frame.hideViewMoreIfEnoughSpace = true;
                                frame.viewMoreInfo = {
                                    icon: MS.Entertainment.UI.Icon.playlist, title: String.load(String.id.IDS_DETAILS_GAME_OVERVIEW_MORE)
                                };
                                frame.getData = function frameGetData() {
                                    return mediaHydratePromise.then(function mediaHydrateComplete(value) {
                                            var dataContext = new MS.Entertainment.ViewModels.GameHeroViewModel(value);
                                            this.bind("sessionId", function sessionIdChanged(newVal) {
                                                dataContext.sessionId = newVal
                                            }.bind(this));
                                            return WinJS.Promise.wrap(dataContext)
                                        }.bind(this))
                                }.bind(this);
                                return frame
                            }.bind(this)()]);
                    return frames
                }, shouldShowButtons: function shouldShowButtons(mediaItem) {
                    var showButtons = true;
                    return showButtons
                }, loadAdditionalFrames: function loadAdditionalFrames(mediaHydratePromise) {
                    var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                    this.loadOverviewFrame(mediaHydratePromise).then(function addOverviewFrame(overviewFrame) {
                        if (overviewFrame)
                            this.frames.push(overviewFrame)
                    }.bind(this)).then(function() {
                        return this.loadExtrasFrame(mediaHydratePromise).then(function addExtrasFrame(extrasFrame) {
                                if (extrasFrame)
                                    this.frames.push(extrasFrame)
                            }.bind(this))
                    }.bind(this)).then(function() {
                        if (signIn.isSignedIn)
                            return this.loadAchievementsFrame().then(function addAchievementsFrame(achievementsFrame) {
                                    if (achievementsFrame) {
                                        this._achievementsFrameIndex = this.frames.length;
                                        this.frames.push(achievementsFrame)
                                    }
                                }.bind(this))
                    }.bind(this)).then(function() {
                        if (signIn.isSignedIn)
                            return this.loadLeaderboardsFrame().then(function addLeaderboardsFrame(leaderboardsFrame) {
                                    if (leaderboardsFrame)
                                        this.frames.push(leaderboardsFrame)
                                }.bind(this))
                    }.bind(this)).then(function() {
                        if (signIn.isSignedIn)
                            return this.loadRelatedFrame().then(function addRelatedFrame(relatedFrame) {
                                    if (relatedFrame)
                                        this.frames.push(relatedFrame)
                                }.bind(this))
                    }.bind(this))
                }, loadOverviewFrame: function loadOverviewFrame(mediaHydratePromise) {
                    var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                    var overviewControl = MS.Entertainment.UI.Controls.GameImmersiveOverviewSummary;
                    var frame = MS.Entertainment.UI.Controls.Immersive.makeFrame(String.load(String.id.IDS_DETAILS_OVERVIEW), 1, overviewControl, "Components/Immersive/Games/GameOverviewMore.html", MS.Entertainment.ViewModels.GamesImmersiveViewModel.Monikers.overview);
                    frame.hideViewMoreIfEnoughSpace = false;
                    frame.getData = function frameGetData() {
                        return mediaHydratePromise.then(function mediaHydrateComplete(value) {
                                return WinJS.Promise.wrap({
                                        mediaItem: value, isSignedIn: signIn.isSignedIn
                                    })
                            }.bind(this))
                    }.bind(this);
                    return WinJS.Promise.wrap(frame)
                }, loadExtrasFrame: function loadExtrasFrame(mediaHydratePromise) {
                    return mediaHydratePromise.then(function mediaHydrateComplete(value) {
                            if (!this._extrasViewModel)
                                this._extrasViewModel = new MS.Entertainment.ViewModels.ExtrasViewModel(value);
                            if (this._mediaItem.defaultPlatformType === MS.Entertainment.Data.Augmenter.GamePlatform.Modern)
                                return this._extrasViewModel.getItems().then(function extrasSuccess(items) {
                                        if (items && items.count)
                                            return items.toArray().then(function gotItems(items) {
                                                    var frame = MS.Entertainment.UI.Controls.Immersive.makeFrame(String.load(String.id.IDS_DETAILS_GAME_EXTRAS), 1, MS.Entertainment.UI.Controls.ModernExtrasControl, "/Components/Immersive/Games/ModernExtrasMore.html", MS.Entertainment.ViewModels.GamesImmersiveViewModel.Monikers.extras);
                                                    frame.hideViewMoreIfEnoughSpace = false;
                                                    frame.viewMoreInfo = {
                                                        icon: MS.Entertainment.UI.Icon.playlist, title: String.load(String.id.IDS_DETAILS_GAME_EXTRAS_MORE)
                                                    };
                                                    var newExtras = items.slice(0, 3);
                                                    var viewModel = {getItems: function getItems() {
                                                                return this._extrasViewModel.appendLastPurchaseDate(items)
                                                            }.bind(this)};
                                                    return this._extrasViewModel.appendLastPurchaseDate(newExtras).then(function success(newExtras) {
                                                            frame.getData = function extrasGetData() {
                                                                return WinJS.Promise.wrap({
                                                                        newExtras: newExtras, viewModel: viewModel, mediaItem: this._mediaItem
                                                                    })
                                                            }.bind(this);
                                                            return frame
                                                        }.bind(this), function failed() {
                                                            return this.buildErrorFrame.bind(this)(null, String.load(String.id.IDS_DETAILS_GAME_EXTRAS))
                                                        }.bind(this))
                                                }.bind(this))
                                    }.bind(this), function extrasError(e) {
                                        return this.buildErrorFrame.bind(this)(e, String.load(String.id.IDS_DETAILS_GAME_EXTRAS))
                                    }.bind(this));
                            else
                                return this._extrasViewModel.getExtrasTypes().then(function extrasSuccess(types) {
                                        if (types && types.length) {
                                            var frame = MS.Entertainment.UI.Controls.Immersive.makeFrame(String.load(String.id.IDS_DETAILS_GAME_EXTRAS), 1, MS.Entertainment.UI.Controls.ExtrasControl, "/Components/Immersive/Games/ExtrasMore.html", MS.Entertainment.ViewModels.GamesImmersiveViewModel.Monikers.extras);
                                            frame.hideViewMoreIfEnoughSpace = false;
                                            frame.viewMoreInfo = {
                                                icon: MS.Entertainment.UI.Icon.playlist, title: String.load(String.id.IDS_DETAILS_GAME_EXTRAS_MORE)
                                            };
                                            frame.getData = function extrasGetData() {
                                                return WinJS.Promise.wrap({
                                                        extrasTypes: types, viewModel: this._extrasViewModel, mediaItem: this._mediaItem
                                                    })
                                            }.bind(this);
                                            return frame
                                        }
                                    }.bind(this), function extrasError(e) {
                                        return this.buildErrorFrame.bind(this)(e, String.load(String.id.IDS_DETAILS_GAME_EXTRAS))
                                    }.bind(this))
                        }.bind(this))
                }, loadAchievementsFrame: function loadAchievementsFrame() {
                    return this.loadTitleType().then(function loadAchievements() {
                            if (this._mediaItem.isGame) {
                                if (!this._achievementsViewModel)
                                    this._achievementsViewModel = new MS.Entertainment.ViewModels.CompareAchievementsViewModel(this._mediaItem, this._options.panelOptions);
                                return this._achievementsViewModel.begin().then(function achievementsSuccess(hasAchievements) {
                                        if (hasAchievements) {
                                            var frame = MS.Entertainment.UI.Controls.Immersive.makeFrame(String.load(String.id.IDS_SOCIAL_ACHIEVEMENTS_PAGE_TITLE), 2, MS.Entertainment.UI.Controls.AchievementsControl, "/Components/Immersive/Games/AchievementsMore.html", MS.Entertainment.ViewModels.GamesImmersiveViewModel.Monikers.achievements);
                                            frame.hideViewMoreIfEnoughSpace = false;
                                            frame.viewMoreInfo = {
                                                icon: MS.Entertainment.UI.Icon.playlist, title: String.load(String.id.IDS_DETAILS_GAME_ACHIEVEMENTS_MORE)
                                            };
                                            frame.getData = function achievementsGetData() {
                                                return WinJS.Promise.wrap(this._achievementsViewModel)
                                            }.bind(this);
                                            return frame
                                        }
                                    }.bind(this), function achievementsError(e) {
                                        return this.buildErrorFrame.bind(this)(e, String.load(String.id.IDS_SOCIAL_ACHIEVEMENTS_PAGE_TITLE))
                                    }.bind(this))
                            }
                        }.bind(this))
                }, loadLeaderboardsFrame: function loadLeaderboardsFrame() {
                    return this.loadTitleType().then(function loadLeaderboards() {
                            if (this._mediaItem.isGame) {
                                if (!this._leaderboardsViewModel) {
                                    this._leaderboardsViewModel = new MS.Entertainment.Social.GameLeaderboardViewModel(this._mediaItem);
                                    this._leaderboardsViewModel.leaderAction = MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(this.refreshAchievementsFrame, this)
                                }
                                return this._leaderboardsViewModel.getLeaderboards().then(function leaderboardsSuccess(leaderboards) {
                                        if (leaderboards && leaderboards.length) {
                                            var frame = MS.Entertainment.UI.Controls.Immersive.makeFrame(String.load(String.id.IDS_SOCIAL_LEADERBOARD_PAGE_TITLE), 1, MS.Entertainment.UI.Controls.LeaderboardsControl, "/Components/Immersive/Games/LeaderboardsMore.html", MS.Entertainment.ViewModels.GamesImmersiveViewModel.Monikers.leaderboards);
                                            frame.hideViewMoreIfEnoughSpace = false;
                                            frame.viewMoreInfo = {
                                                icon: MS.Entertainment.UI.Icon.playlist, title: String.load(String.id.IDS_DETAILS_GAME_LEADERBOARDS_MORE)
                                            };
                                            frame.getData = function leaderboardsGetData() {
                                                return WinJS.Promise.wrap({viewModel: this._leaderboardsViewModel})
                                            }.bind(this);
                                            return frame
                                        }
                                    }.bind(this), function leaderboardsError(e) {
                                        return this.buildErrorFrame.bind(this)(e, String.load(String.id.IDS_SOCIAL_LEADERBOARD_PAGE_TITLE))
                                    }.bind(this))
                            }
                        }.bind(this))
                }, loadRelatedFrame: function loadRelatedFrame() {
                    if (this._mediaItem.defaultPlatformType !== MS.Entertainment.Data.Augmenter.GamePlatform.Xbox)
                        return WinJS.Promise.wrap();
                    if (!this._relatedViewModel)
                        this._relatedViewModel = new MS.Entertainment.ViewModels.GamesRelatedViewModel(this._mediaItem);
                    return this._relatedViewModel.getItems().then(function relatedSuccess(relatedItems) {
                            if (relatedItems && relatedItems.length) {
                                var frame = MS.Entertainment.UI.Controls.Immersive.makeFrame(String.load(String.id.IDS_DETAILS_GAME_HUB_RELATED), 2, MS.Entertainment.UI.Controls.GamesImmersiveRelatedItems, "/Components/Immersive/Games/RelatedMore.html", MS.Entertainment.ViewModels.GamesImmersiveViewModel.Monikers.related);
                                frame.hideViewMoreIfEnoughSpace = relatedItems.length <= this._relatedViewModel.maxItems;
                                frame.viewMoreInfo = {
                                    icon: MS.Entertainment.UI.Icon.playlist, title: String.load(String.id.IDS_DETAILS_GAME_HUB_RELATED_MORE)
                                };
                                frame.getData = function relatedGetData() {
                                    return WinJS.Promise.wrap(this._relatedViewModel)
                                }.bind(this);
                                return frame
                            }
                        }.bind(this), function relatedError(e) {
                            return this.buildErrorFrame.bind(this)(e, String.load(String.id.IDS_DETAILS_GAME_HUB_RELATED))
                        }.bind(this))
                }, buildErrorFrame: function buildErrorFrame(error, headerText) {
                    var frame = MS.Entertainment.UI.Controls.Immersive.makeFrame(headerText, 1, MS.Entertainment.UI.Controls.BaseImmersiveSummary);
                    frame.hideViewMoreIfEnoughSpace = true;
                    frame.getData = function errorGetData() {
                        return WinJS.Promise.wrapError({message: error})
                    };
                    return frame
                }, loadTitleType: function loadTitleType() {
                    if (!this._mediaItem.titleType) {
                        if (this._titleTypePromise)
                            return this._titleTypePromise;
                        if (!MS.Entertainment.Utilities.isEmptyGuid(this._mediaItem.titleId)) {
                            var query = new MS.Entertainment.Data.Query.titleActivityQuery;
                            query.userModel = MS.Entertainment.Social.Helpers.createUserModel();
                            query.titleId = this._mediaItem.titleId;
                            this._titleTypePromise = query.execute().then(function querySuccess() {
                                if (query.result && query.result.media) {
                                    this._mediaItem.isGame = query.result.media.isGame;
                                    this._mediaItem.titleType = query.result.media.titleType
                                }
                            }.bind(this));
                            return this._titleTypePromise
                        }
                        else
                            return WinJS.Promise.wrapError("titleType cannot be obtained without a title id")
                    }
                    else
                        return WinJS.Promise.wrap()
                }, refreshAchievementsFrame: function refreshAchievementsFrame(user) {
                    var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                    if (user && !signedInUser.isGamerTag(user.gamerTag) && this._achievementsFrameIndex !== -1) {
                        if (this._achievementsViewModel) {
                            if (this._achievementsViewModel.model && this._achievementsViewModel.model.secondaryProfile && user.gamerTag.match(new RegExp("^" + this._achievementsViewModel.model.secondaryProfile.gamertag + "$", "i")) !== null)
                                return;
                            this._achievementsViewModel.dispose();
                            this._achievementsViewModel = null
                        }
                        var userModel = MS.Entertainment.Social.Helpers.createUserModel(user.userXuid, user.gamerTag);
                        if (userModel.nativeUserModel && userModel.nativeUserModel[0])
                            userModel = MS.Entertainment.Data.augment(userModel.nativeUserModel[0], MS.Entertainment.Data.Augmenter.XboxLive.FriendProfile);
                        this._options.panelOptions.userModel = userModel;
                        this.loadAchievementsFrame().then(function addAchievementsFrame(achievementsFrame) {
                            if (achievementsFrame) {
                                var event = document.createEvent("Event");
                                event.initEvent("dismissoverlay", true, false);
                                document.activeElement.dispatchEvent(event);
                                this.frames.splice(this._achievementsFrameIndex, 1, achievementsFrame);
                                this._bringFrameIntoView(this._achievementsFrameIndex)
                            }
                        }.bind(this))
                    }
                }
        }, {Monikers: {
                hero: "hero", overview: "overview", activities: "activities", extras: "extras", achievements: "achievements", leaderboards: "leaderboards", related: "related"
            }}), GameHeroViewModel: MS.Entertainment.derive(MS.Entertainment.ViewModels.BaseHeroViewModel, function gameHeroViewModel(mediaItem) {
                this.base(mediaItem);
                this._initialize()
            }, {_initialize: function _initialize() {
                    if (this.buttons)
                        this.buttons.clear();
                    var smartBuyStateEngine = new MS.Entertainment.ViewModels.SmartBuyStateEngine;
                    smartBuyStateEngine.initialize(this.mediaItem, MS.Entertainment.ViewModels.SmartBuyButtons.getGameImmersiveDetailsButtons(this.mediaItem), MS.Entertainment.ViewModels.SmartBuyStateHandlers.onGameImmersiveDetailsStateChanged);
                    this._addButtons(smartBuyStateEngine.currentButtons);
                    var trailerEnabled = false;
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    if (this.mediaItem.trailerUri && (this.mediaItem.defaultPlatformType === MS.Entertainment.Data.Augmenter.GamePlatform.PC || this.mediaItem.defaultPlatformType === MS.Entertainment.Data.Augmenter.GamePlatform.Modern))
                        trailerEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.streamMetroGameTrailers);
                    else if (this.mediaItem.trailerUri && this.mediaItem.defaultPlatformType === MS.Entertainment.Data.Augmenter.GamePlatform.Xbox)
                        trailerEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.streamXbox360GameTrailers);
                    if (trailerEnabled) {
                        var buttons = MS.Entertainment.ViewModels.SmartBuyButtons.getGameImmersiveDetailsHeroButtons(this.mediaItem);
                        this.actionDescription = String.load(String.id.IDS_DETAILS_FEATURED_TRAILER_TITLE);
                        this._addButtons(buttons)
                    }
                }})
    })
})()
