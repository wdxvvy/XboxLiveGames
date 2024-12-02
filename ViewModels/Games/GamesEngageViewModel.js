/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/ViewModels/Social/CompareAchievements.js", "/ViewModels/Social/LeaderboardViewModel.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");
WinJS.Namespace.define("MS.Entertainment.ViewModels", {
    GamesEngageViewModel: WinJS.Class.derive(MS.Entertainment.ViewModels.SpotlightViewModel, function gamesEngageViewModelConstructor(query, socialHelper) {
        MS.Entertainment.ViewModels.SpotlightViewModel.prototype.constructor.call(this, query);
        this._socialHelper = socialHelper;
        this._telemetryTimer = WinJS.Promise.timeout(30000).done(function startTelemetry() {
            this._logTelemetry = function logTelemetry() {
                MS.Entertainment.Utilities.Telemetry.logEngagementState(this._signedInUser, this.engagedGame, this._celebrations, this._contentTiles)
            }.bind(this);
            this._logTelemetry()
        }.bind(this));
        this._initializeFeaturedObject();
        var signInHandler = function signInHandler() {
                var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                if (this._signedInBindings) {
                    this._signedInBindings.cancel();
                    this._signedInBindings = null
                }
                if (!signIn.isSignedIn) {
                    this._signedInUser = null;
                    if (this._logTelemetry)
                        this._logTelemetry()
                }
                else {
                    this._signedInUser = MS.Entertainment.Social.Helpers.getSignedInUserModel();
                    this._signedInUser.refresh().done(null, function(){});
                    this._signedInBindings = WinJS.Binding.bind(this, {_signedInUser: {status: this._updateActionButtons.bind(this)}})
                }
                if (this.featuredObject)
                    this.featuredObject.signedIn = signIn.isSignedIn
            }.bind(this);
        this._eventHandlers = MS.Entertainment.Utilities.addEvents(MS.Entertainment.Utilities.SignIn, {
            signInComplete: signInHandler, signOutComplete: signInHandler
        });
        signInHandler();
        this._loadEngagedState();
        if (this._socialHelper)
            MS.Entertainment.Utilities.addEventHandlers(this._socialHelper, {dataChanged: this._loadEngagedState.bind(this)});
        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).addEventListener("windowresize", this._createFeaturedObject.bind(this))
    }, {
        _socialHelper: null, _signedInUser: null, _signedInBindings: null, _featuredObjectAnchor: null, _contentTiles: null, _signedIn: false, _logTelemetry: null, _tileUpdate: null, _celebrations: null, _celebrationPromise: null, _maxCelebrations: 3, _heroTimeout: 5000, _heroTimer: null, _achievementsTimer: null, _messagesTimer: null, _friendsTimer: null, _telemetryTimer: null, _heroCelebrationDiv: null, _arcProgressDiv: null, _actionButtons: null, actionButtons: {get: function get_actionButtons() {
                    if (!this._actionButtons) {
                        var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                        var achievementsButton = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.navigate);
                        achievementsButton.title = String.load(String.id.IDS_SOCIAL_ENGAGE_ACHIEVEMENTS);
                        achievementsButton.automationId = MS.Entertainment.UI.AutomationIds.gamesEngageAchievements;
                        achievementsButton.parameter = {
                            page: MS.Entertainment.UI.Monikers.socialDetails, hub: MS.Entertainment.UI.Monikers.socialAchievements
                        };
                        achievementsButton.iconInfo = {
                            icon: MS.Entertainment.UI.Icon.achievements, subIcon: MS.Entertainment.UI.Icon.inlineGamerScore, hideDefaultRing: true
                        };
                        achievementsButton.addProperty("subTextString", String.empty);
                        achievementsButton.addProperty("celebration", null);
                        achievementsButton.addProperty("count", 0);
                        achievementsButton.addProperty("timeout", MS.Entertainment.ViewModels.GamesEngageViewModel.ActionButtons.achievements.timeout);
                        achievementsButton.celebrationOptions = [];
                        var messagesButton = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.navigate);
                        messagesButton.title = String.load(String.id.IDS_SOCIAL_ENGAGE_MESSAGES);
                        messagesButton.automationId = MS.Entertainment.UI.AutomationIds.gamesEngageMessages;
                        messagesButton.parameter = {
                            page: MS.Entertainment.UI.Monikers.socialInboxPage, hub: MS.Entertainment.UI.Monikers.socialInboxAllHub
                        };
                        messagesButton.iconInfo = {
                            icon: WinJS.UI.AppBarIcon.mail, hideDefaultRing: true
                        };
                        messagesButton.addProperty("subTextString", String.empty);
                        messagesButton.addProperty("celebration", null);
                        messagesButton.addProperty("count", 0);
                        messagesButton.addProperty("timeout", MS.Entertainment.ViewModels.GamesEngageViewModel.ActionButtons.messages.timeout);
                        messagesButton.celebrationOptions = [];
                        var friendsButton = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.navigate);
                        friendsButton.title = String.load(String.id.IDS_SOCIAL_ENGAGE_FRIENDS);
                        friendsButton.automationId = MS.Entertainment.UI.AutomationIds.gamesEngageFriends;
                        friendsButton.parameter = {
                            page: MS.Entertainment.UI.Monikers.socialFriends, hub: MS.Entertainment.UI.Monikers.socialFriendsHub
                        };
                        friendsButton.iconInfo = {
                            icon: MS.Entertainment.UI.Icon.friend, hideDefaultRing: true
                        };
                        friendsButton.addProperty("subTextString", String.empty);
                        friendsButton.addProperty("celebration", null);
                        friendsButton.addProperty("count", 0);
                        friendsButton.addProperty("timeout", MS.Entertainment.ViewModels.GamesEngageViewModel.ActionButtons.friends.timeout);
                        friendsButton.celebrationOptions = [];
                        this._actionButtons = [achievementsButton, messagesButton, friendsButton]
                    }
                    return this._actionButtons
                }}, _playGame: null, playGame: {
                get: function get_playGame() {
                    if (!this._playGame)
                        this._playGame = new MS.Entertainment.ViewModels.PlayGameAction(this._playGameClicked);
                    return this._playGame
                }, set: function set_playGame(value) {
                        if (value) {
                            this._playGame = new MS.Entertainment.ViewModels.PlayGameAction(value.doclick ? value : this._playGameClicked);
                            this._playGame.title = value.primaryText;
                            this._playGame.imageUri = value.imagePrimaryUrl
                        }
                        if (this.featuredObject)
                            this.featuredObject.playGame = this.playGame
                    }
            }, _engagedGame: null, _engagedGamePromise: null, engagedGame: {
                get: function get_engagedGame() {
                    return this._engagedGame
                }, set: function(value) {
                        if (!value) {
                            this._engagedGame = null;
                            this._extras = null;
                            this._clearHeroCelebrations();
                            this._clearProgress();
                            this._sendTileUpdate(null);
                            if (this.featuredObject) {
                                this.featuredObject.engagedGame = null;
                                this.featuredObject.heroCelebration = null
                            }
                            this._createFeaturedObject();
                            if (this._logTelemetry)
                                this._logTelemetry()
                        }
                        else {
                            this._engagedGame = value;
                            this._engagedGame.doclick = this.engagedGameClicked;
                            this._engagedGame.queryId = MS.Entertainment.UI.AutomationIds.gamesEngage;
                            this._extras = null;
                            if (this._engagedGamePromise) {
                                this._engagedGamePromise.cancel();
                                this._engagedGamePromise = null
                            }
                            this._engagedGamePromise = this._engagedGame.hydrate().then(function hydrateSucceeded() {
                                return this._loadExtras(value).then(function extrasLoaded() {
                                        gameLoaded();
                                        this._engagedGamePromise = null
                                    }.bind(this), function extrasFailed(error) {
                                        if (!error || error.name !== 'Canceled') {
                                            gameLoaded();
                                            this._engagedGamePromise = null
                                        }
                                    }.bind(this))
                            }.bind(this), function hydrateFailed() {
                                if (!error || error.name !== 'Canceled') {
                                    gameLoaded();
                                    this._engagedGamePromise = null
                                }
                            }.bind(this));
                            var gameLoaded = function gameLoaded() {
                                    this._setHeroCelebrations();
                                    if (this.featuredObject)
                                        this.featuredObject.engagedGame = WinJS.Binding.as(this._engagedGame);
                                    this._createFeaturedObject();
                                    WinJS.Promise.as(this._celebrationPromise).done(function logNewGame() {
                                        if (this._logTelemetry)
                                            this._logTelemetry()
                                    }.bind(this))
                                }.bind(this)
                        }
                    }
            }, _percentageProgressNumber: 0, percentageProgressNumber: {
                get: function get_percentageProgressNumber() {
                    return this._percentageProgressNumber
                }, set: function set_percentageProgressNumber(value) {
                        if (this._percentageProgressNumber !== value) {
                            this._percentageProgressNumber = value;
                            if (!this._arcProgressDiv)
                                this._arcProgressDiv = document.querySelector(".heroItemContainer .arcContainer #arcProgressControl");
                            if (this._arcProgressDiv && this._arcProgressDiv.winControl)
                                this._arcProgressDiv.winControl.progress = this._percentageProgressNumber
                        }
                    }
            }, _clearHeroCelebrations: function _clearHeroCelebrations() {
                if (this._heroTimer) {
                    this._heroTimer.cancel();
                    this._heroTimer = null
                }
                this._celebrations = [];
                if (this.featuredObject)
                    this.featuredObject.heroCelebration = null
            }, _clearProgress: function _clearProgress() {
                this.percentageProgressNumber = 0;
                if (this.featuredObject)
                    this.featuredObject.percentageProgress = null
            }, _setHeroCelebrations: function _setHeroCelebrations() {
                var promises = [];
                if (!this._engagedGame) {
                    MS.Entertainment.ViewModels.fail("No game to celebrate in GamesEngageViewModel");
                    return
                }
                if (this._celebrationPromise)
                    return;
                this._clearHeroCelebrations();
                try {
                    Microsoft.Xbox.XboxLIVEService.invalidateCacheGroup(Microsoft.Xbox.CacheGroup.achievements);
                    Microsoft.Xbox.XboxLIVEService.invalidateCacheGroup(Microsoft.Xbox.CacheGroup.leaderboards)
                }
                catch(e) {}
                var leaderboardViewModel = new MS.Entertainment.Social.GameLeaderboardViewModel(this._engagedGame);
                promises.push(leaderboardViewModel.getPrimaryLeaderboardData().then(function getUserRank() {
                    if (this._signedInUser && leaderboardViewModel.primaryLeaderboard) {
                        var signedInGamertag = MS.Entertainment.Social.Helpers.getGamerTagFromUserModel(this._signedInUser.userModel);
                        return MS.Entertainment.Social.GameLeaderboardViewModel.getLeaderboardPositionByGamertag(signedInGamertag, leaderboardViewModel.primaryLeaderboard).then(function leaderboardPosition(position) {
                                if (position && position.rank === 1 && position.total > 1 && leaderboardViewModel.primaryLeaderboard.label)
                                    return {
                                            index: 0, text: String.load(String.id.IDS_SOCIAL_ENGAGE_TOP_LEADERBOARD).format(leaderboardViewModel.primaryLeaderboard.label), id: MS.Entertainment.UI.AutomationIds.gamesEngageGameTopLeaderboard
                                        }
                            }.bind(this))
                    }
                }.bind(this), function userRankError(error) {
                    MS.Entertainment.ViewModels.fail("Error in getting the user rank in GamesEngageViewModel: " + error)
                }));
                var achievementsQuery = new MS.Entertainment.Data.Query.titleAchievementsQuery;
                achievementsQuery.userModel = this._signedInUser.userModel;
                achievementsQuery.titleId = this._engagedGame.titleId;
                achievementsQuery.sort = MS.Entertainment.Data.Query.Properties.achievementSort.achievedDate;
                promises.push(achievementsQuery.execute().then(function achievementsSuccess(q) {
                    if (q && q.result && q.result.items)
                        return q.result.items.toArray().then(function getItems(earnedAchievements) {
                                var celebration = null;
                                var activity = {
                                        totalAchievements: this._engagedGame.totalAchievements, currentAchievements: earnedAchievements.length
                                    };
                                this.percentageProgressNumber = MS.Entertainment.Data.Factory.XboxLive.gameGamePercentageNumber(activity);
                                this.featuredObject.percentageProgress = WinJS.Binding.as(MS.Entertainment.Data.Factory.XboxLive.gameGamePercentageString(activity));
                                if (activity.currentAchievements === 1)
                                    celebration = {
                                        index: 0, text: String.load(String.id.IDS_SOCIAL_ENGAGE_FIRST_ACHIEVEMENT), id: MS.Entertainment.UI.AutomationIds.gamesEngageGameFirstAchievement
                                    };
                                else if (activity.currentAchievements === activity.totalAchievements)
                                    celebration = {
                                        index: 0, text: String.load(String.id.IDS_SOCIAL_ENGAGE_ALL_ACHIEVEMENTS), id: MS.Entertainment.UI.AutomationIds.gamesEngageGameAllAchievements
                                    };
                                else if (activity.currentAchievements > 0 && earnedAchievements[0]) {
                                    var compareDate = new Date;
                                    compareDate.setDate(compareDate.getDate() - 3);
                                    if (earnedAchievements[0].timeUnlocked > compareDate)
                                        celebration = {
                                            index: 0, text: String.load(String.id.IDS_SOCIAL_ENGAGE_RECENT_ACHIEVEMENT).format(earnedAchievements[0].name), id: MS.Entertainment.UI.AutomationIds.gamesEngageGameRecentAchievement
                                        }
                                }
                                return celebration
                            }.bind(this));
                    else
                        this._clearProgress()
                }.bind(this), function achievementsError(error) {
                    this._clearProgress();
                    MS.Entertainment.ViewModels.fail("Error in getting the recent achievements in GamesEngageViewModel: " + (error))
                }.bind(this)));
                this._celebrationPromise = WinJS.Promise.join(promises).then(function joinCelebrations(celebrations) {
                    for (var i = 0; i < celebrations.length; i++)
                        if (celebrations[i]) {
                            celebrations[i].index = this._celebrations.length;
                            this._celebrations.push(celebrations[i])
                        }
                    this._celebrations.push({
                        index: this._celebrations.length, text: this._engagedGame.lastPlayedString, id: this._engagedGame.lastPlayed
                    });
                    this._updateHeroCelebration();
                    this._celebrationPromise = null
                }.bind(this), function joinCelebrationsError(error) {
                    MS.Entertainment.ViewModels.fail("Error in updating hero celebrations in GamesEngageViewModel: " + (error && error.message));
                    this._celebrationPromise = null
                })
            }, _updateHeroCelebration: function _updateHeroCelebration() {
                if (this._heroTimer) {
                    this._heroTimer.cancel();
                    this._heroTimer = null
                }
                if (!this.featuredObject)
                    return;
                var currentIndex = this.featuredObject.heroCelebration ? this.featuredObject.heroCelebration.index : this._celebrations.length - 1;
                var nextIndex = (currentIndex === this._celebrations.length - 1) ? 0 : currentIndex + 1;
                if (!this._heroCelebrationDiv)
                    this._heroCelebrationDiv = document.querySelector(".label.engagedLastPlayed");
                if (this._heroCelebrationDiv)
                    WinJS.UI.Animation.fadeOut(this._heroCelebrationDiv).done(function animationComplete() {
                        this.featuredObject.heroCelebration = this._celebrations[nextIndex];
                        WinJS.UI.Animation.fadeIn(this._heroCelebrationDiv)
                    }.bind(this));
                else
                    this.featuredObject.heroCelebration = this._celebrations[nextIndex];
                if (this._celebrations.length > 1)
                    this._heroTimer = WinJS.Promise.timeout(this._heroTimeout).then(function heroTick() {
                        this._updateHeroCelebration()
                    }.bind(this))
            }, _initializeFeaturedObject: function _initializeFeaturedObject() {
                var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                var signInAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.signIn);
                signInAction.automationId = MS.Entertainment.UI.AutomationIds.gamesEngageSignIn;
                var panelModel = new MS.Entertainment.UI.Controls.DefaultFailedPanelModel;
                panelModel.primaryStringId = String.id.IDS_SOCIAL_ENGAGE_WELCOME_TITLE;
                panelModel.secondaryStringId = String.id.IDS_SOCIAL_ENGAGE_WELCOME_DESC;
                panelModel.linkIcon = WinJS.UI.AppBarIcon.contact;
                panelModel.details = [{
                        linkStringId: String.id.IDS_SIGNIN_NOTIFICATION_SIGNIN_TEXT, linkAction: signInAction
                    }];
                this._featuredObjectAnchor = WinJS.Binding.as({
                    items: null, contentTiles: null, engagedGame: null, heroCelebration: null, percentageProgress: null, signedIn: false, signedOutPanelModel: panelModel, actionButtons: this.actionButtons, playGame: this.playGame
                });
                this.featuredObject = this._featuredObjectAnchor
            }, _loadEngagedState: function _loadEngagedState() {
                if (this._socialHelper && this._socialHelper.userTitles && this._socialHelper.userTitles.length) {
                    var compareDate = new Date;
                    compareDate.setDate(compareDate.getDate() - 7);
                    for (var i = 0; i < this._socialHelper.userTitles.length; i++) {
                        var title = this._socialHelper.userTitles[i];
                        if (title.lastPlayed < compareDate) {
                            this.engagedGame = null;
                            break
                        }
                        if (title.defaultPlatformType === MS.Entertainment.Data.Augmenter.GamePlatform.Modern) {
                            this.engagedGame = Object.create(title);
                            break
                        }
                    }
                }
                else
                    this.engagedGame = null
            }, _loadExtras: function _loadExtras(title) {
                var childrenQuery = new MS.Entertainment.Data.Query.Games.GameMetroChildren;
                childrenQuery.serviceId = title.serviceId;
                childrenQuery.idType = MS.Entertainment.Data.Query.edsIdType.canonical;
                childrenQuery.impressionGuid = title.impressionGuid;
                childrenQuery.mediaItemType = title.itemTypeQueryString;
                childrenQuery.queryId = MS.Entertainment.UI.Monikers.homeSpotlight;
                return childrenQuery.execute().then(function querySuccess(q) {
                        if (q.result && q.result.items && q.result.items.count > 0)
                            return q.result.items.toArray().then(function extrasArray(extras) {
                                    if (extras && this._signedInUser) {
                                        var purchases = [];
                                        var purchaseHistoryService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.gamesPurchaseHistory);
                                        extras.forEach(function eachExtra(extra) {
                                            var offer = (this._signedInUser.userModel && this._signedInUser.userModel.isGold()) ? extra.offerGold : extra.offerSilver;
                                            purchases.push(purchaseHistoryService.getPurchaseHistoryForOfferId(extra.titleId, offer.offerId).then(function purchaseHistory(receipt) {
                                                return receipt
                                            }))
                                        }.bind(this));
                                        return WinJS.Promise.join(purchases).then(function addExtras(receipts) {
                                                if (receipts) {
                                                    this._extras = {
                                                        durables: [], consumables: [], purchasedConsumables: []
                                                    };
                                                    var settings = Windows.Storage.ApplicationData.current.roamingSettings;
                                                    var oldTileUpdate = settings.values[MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.tileManager).gamePDLCTag];
                                                    var setTileUpdate = function setTileUpdate(e) {
                                                            if (oldTileUpdate === extras[r].serviceId) {
                                                                this._tileUpdate = extras[r];
                                                                return true
                                                            }
                                                            return false
                                                        }.bind(this);
                                                    for (var r = 0; r < receipts.length; r++) {
                                                        var receipt = receipts[r];
                                                        if (extras[r].hasPriceInCurrency)
                                                            if (receipt) {
                                                                if (extras[r].itemTypeQueryString === MS.Entertainment.Data.Query.edsMediaType.metroGameConsumable)
                                                                    if (!setTileUpdate(extras[r]))
                                                                        this._extras.purchasedConsumables.push(extras[r])
                                                            }
                                                            else if (extras[r].itemTypeQueryString === MS.Entertainment.Data.Query.edsMediaType.metroGameConsumable) {
                                                                if (!setTileUpdate(extras[r]))
                                                                    this._extras.consumables.push(extras[r])
                                                            }
                                                            else if (extras[r].itemTypeQueryString === MS.Entertainment.Data.Query.edsMediaType.metroGameContent)
                                                                if (!setTileUpdate(extras[r]))
                                                                    this._extras.durables.push(extras[r])
                                                    }
                                                }
                                            }.bind(this))
                                    }
                                }.bind(this))
                    }.bind(this))
            }, _createFeaturedObject: function _createFeaturedObject() {
                if (!this._featuredObjectAnchor)
                    return;
                var maxItemsForResolution = MS.Entertainment.Utilities.getRowCountForResolution();
                var extras = [];
                if (!this._contentTiles)
                    this._contentTiles = new MS.Entertainment.ObservableArray;
                if (this._extras) {
                    var buckets = Object.getOwnPropertyNames(this._extras);
                    var indices = [];
                    var extrasCount = 0;
                    var bucket = null;
                    var index = 0;
                    var gameChanged = !this._tileUpdate || (this._tileUpdate.parentItem && this.engagedGame && this.engagedGame.serviceId !== this._tileUpdate.parentItem.serviceId);
                    var addExtra = function addExtra(e) {
                            var extra = e;
                            extra.contentType = MS.Entertainment.ViewModels.GamesEngageViewModel.ContentType.GameExtra.id;
                            extra.doclick = this.extraClicked.bind(this);
                            extras.push(extra)
                        }.bind(this);
                    if (!gameChanged)
                        addExtra(this._tileUpdate);
                    for (var b = 0; b < buckets.length; b++) {
                        extrasCount += this._extras[buckets[b]].length;
                        indices.push([])
                    }
                    if (extrasCount > 0)
                        for (var i = 0; i < buckets.length; i++) {
                            bucket = buckets[i];
                            if (indices[i].length < this._extras[bucket].length) {
                                do
                                    index = Math.floor(Math.random() * this._extras[bucket].length);
                                while (indices[i].indexOf(index) !== -1);
                                indices[i].push(index);
                                addExtra(this._extras[bucket][index]);
                                extrasCount--;
                                if (extras.length >= maxItemsForResolution || extrasCount <= 0)
                                    break
                            }
                            if (i === buckets.length - 1)
                                i = -1
                        }
                    else
                        this._sendTileUpdate(null)
                }
                if (this.items && this.items.length) {
                    if (this.items.item(0).sequenceId === 1)
                        this.playGame = this.items.shift();
                    var updateTileOnce = true;
                    var newItem = null;
                    for (var j = 0; j < this.items.length && j < maxItemsForResolution; j++) {
                        var item = this.items.item(j);
                        if (!item.replaceable || !extras.length) {
                            if (item.imagePrimaryUrl) {
                                item.contentType = MS.Entertainment.ViewModels.GamesEngageViewModel.ContentType.FullBleedProgram.id;
                                if (item.actionType && item.actionType.mediaType === MS.Entertainment.Data.Augmenter.Spotlight.MediaType.ModernPDLC)
                                    item.hydrate()
                            }
                            else {
                                item.contentType = MS.Entertainment.ViewModels.GamesEngageViewModel.ContentType.BoxArtProgram.id;
                                if (item.defaultPlatformType !== MS.Entertainment.Data.Augmenter.GamePlatform.Unknown)
                                    item.hydrate()
                            }
                            newItem = item
                        }
                        else {
                            newItem = extras.shift();
                            if (updateTileOnce) {
                                updateTileOnce = false;
                                this._sendTileUpdate(newItem)
                            }
                        }
                        if (this._contentTiles.length > j && this._contentTiles.item(j) !== newItem)
                            this._contentTiles.splice(j, 1, newItem);
                        else if (this._contentTiles.length <= j)
                            this._contentTiles.push(newItem)
                    }
                }
                else
                    for (var k = 0; k < extras.length; k++)
                        this._contentTiles.push(extra[k]);
                this._featuredObjectAnchor.items = this._contentTiles;
                return this._featuredObjectAnchor
            }, _hasValidMediaTarget: function(spotlightItem) {
                if (spotlightItem)
                    if (spotlightItem.sequenceId === 1 && !spotlightItem.actionTarget)
                        return true;
                    else if (spotlightItem.actionTarget)
                        return spotlightItem.isFlexHub || (!MS.Entertainment.Utilities.isEmptyGuid(spotlightItem.actionTarget) && MS.Entertainment.Utilities.isValidGuid(spotlightItem.actionTarget));
                return false
            }, _canDisplayMediaType: function _canDisplayMediaType(item) {
                var canDisplayMediaType = false;
                if (item)
                    if (item.sequenceId === 1)
                        canDisplayMediaType = true;
                    else if (item.actionType && item.actionType.mediaType)
                        if (item.isFlexHub)
                            canDisplayMediaType = true;
                        else
                            switch (item.actionType.mediaType) {
                                case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.ModernGame:
                                case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.ModernPDLC:
                                case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.PhoneGame:
                                case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.WindowsGame:
                                case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.XboxGame:
                                    canDisplayMediaType = true;
                                    break
                            }
                return canDisplayMediaType
            }, extraClicked: function extraClicked(data) {
                if (!data || !data.target)
                    return;
                var popOverConstructor;
                var item = data.target;
                if (item.defaultPlatformType === MS.Entertainment.Data.Augmenter.GamePlatform.Modern)
                    popOverConstructor = "MS.Entertainment.Pages.ModernGameExtraInlineDetails";
                else
                    popOverConstructor = "MS.Entertainment.Pages.XboxGameExtraInlineDetails";
                var popOverParameters = {
                        itemConstructor: popOverConstructor, dataContext: {
                                data: item, inlineExtraData: this.engagedGame
                            }, location: MS.Entertainment.Pages.BaseMediaInlineDetails.Location.marketplace
                    };
                MS.Entertainment.UI.Controls.PopOver.showPopOver(popOverParameters)
            }, _updateActionButtons: function _updateActionButtons(status) {
                var buttons = MS.Entertainment.ViewModels.GamesEngageViewModel.ActionButtons;
                if ((status === MS.Entertainment.Social.LoadStatus.loaded || status === MS.Entertainment.Social.LoadStatus.error) && this.featuredObject && this.featuredObject.actionButtons && this._signedInUser) {
                    buttons.achievements.update.call(this);
                    buttons.messages.update.call(this);
                    buttons.friends.update.call(this)
                }
                else
                    this._clearCelebrations()
            }, _crossedThreshold: function _crossedThreshold(key, value, parameters) {
                var crossed = false;
                var settings = Windows.Storage.ApplicationData.current.roamingSettings;
                var oldValue = settings.values[key];
                oldValue = (oldValue === undefined) ? 0 : oldValue;
                var thresholds = parameters.thresholds;
                var increment = parameters.maxIncrement;
                if (value < thresholds[thresholds.length - 1]) {
                    for (var i = thresholds.length - 1; i >= 0; i--)
                        if (oldValue < thresholds[i] && value >= thresholds[i]) {
                            crossed = true;
                            break
                        }
                }
                else
                    for (var threshold = thresholds[thresholds.length - 1]; value > threshold; threshold += increment)
                        if (oldValue < threshold && value >= threshold) {
                            crossed = true;
                            break
                        }
                settings.values[key] = value;
                if (crossed)
                    settings.values[key + "_date"] = new Date;
                else {
                    var oldDate = settings.values[key + "_date"];
                    if (oldDate) {
                        var compareDate = new Date;
                        compareDate.setHours(compareDate.getHours() - 24);
                        if (oldDate >= compareDate)
                            crossed = true
                    }
                }
                return crossed
            }, _clearCelebrations: function _clearCelebrations() {
                var buttons = MS.Entertainment.ViewModels.GamesEngageViewModel.ActionButtons;
                if (this._achievementsTimer) {
                    this._achievementsTimer.cancel();
                    this._achievementsTimer = null
                }
                if (this._messagesTimer) {
                    this._messagesTimer.cancel();
                    this._messagesTimer = null
                }
                if (this._friendsTimer) {
                    this._friendsTimer.cancel();
                    this._friendsTimer = null
                }
                if (this.featuredObject && this.featuredObject.actionButtons) {
                    this.featuredObject.actionButtons[buttons.achievements.index].celebrationOptions = [];
                    this.featuredObject.actionButtons[buttons.achievements.index].subTextString = String.empty;
                    this.featuredObject.actionButtons[buttons.achievements.index].celebration = null;
                    this.featuredObject.actionButtons[buttons.achievements.index].count = 0;
                    this.featuredObject.actionButtons[buttons.messages.index].celebrationOptions = [];
                    this.featuredObject.actionButtons[buttons.messages.index].subTextString = String.empty;
                    this.featuredObject.actionButtons[buttons.messages.index].celebration = null;
                    this.featuredObject.actionButtons[buttons.messages.index].count = null;
                    this.featuredObject.actionButtons[buttons.friends.index].celebrationOptions = [];
                    this.featuredObject.actionButtons[buttons.friends.index].subTextString = String.empty;
                    this.featuredObject.actionButtons[buttons.friends.index].celebration = null;
                    this.featuredObject.actionButtons[buttons.friends.index].count = 0
                }
            }, _playGameClicked: WinJS.Utilities.markSupportedForProcessing(function _playGameClicked() {
                var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                navigationService.navigateTo(MS.Entertainment.UI.Monikers.gamesWindowsMarketplace, MS.Entertainment.UI.Monikers.gamesWindowsMarketplaceFeatured)
            }), engagedGameClicked: WinJS.Utilities.markSupportedForProcessing(function engagedGameClicked(item) {
                MS.Entertainment.ViewModels.assert(item, "No item for pop-over");
                if (item) {
                    var popOverParameters = {
                            itemConstructor: "MS.Entertainment.Pages.GameInlineDetails", dataContext: {
                                    data: item.target, location: MS.Entertainment.Pages.BaseMediaInlineDetails.Location.collection
                                }
                        };
                    MS.Entertainment.UI.Controls.PopOver.showPopOver(popOverParameters)
                }
            }), _sendTileUpdate: function _sendTileUpdate(promo) {
                var notifications = Windows.UI.Notifications;
                var tileManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.tileManager);
                var settings = Windows.Storage.ApplicationData.current.roamingSettings;
                if (this._tileUpdate === promo)
                    return;
                if (!promo || !promo.name || !promo.parentItemName) {
                    tileManager.clearTileByTag(tileManager.gamePDLCTag);
                    settings.values[tileManager.gamePDLCTag] = null;
                    return
                }
                settings.values[tileManager.gamePDLCTag] = promo.serviceId;
                var text = String.load(String.id.IDS_SOCIAL_PDLC_TILE_NOTIFICATION_TEXT).format(promo.name, promo.parentItemName);
                var image = promo.extraImage && promo.extraImage.resizeUrl;
                var wideTemplate = notifications.TileTemplateType.tileWideSmallImageAndText03;
                var tileXml = notifications.TileUpdateManager.getTemplateContent(wideTemplate);
                var wideTileTextAttributes = tileXml.getElementsByTagName("text");
                wideTileTextAttributes[0].appendChild(tileXml.createTextNode(text));
                var wideTileImageAttributes = tileXml.getElementsByTagName("image");
                wideTileImageAttributes[0].setAttribute("src", image);
                var squareTemplate = notifications.TileTemplateType.tileSquarePeekImageAndText04;
                var squareTileXml = notifications.TileUpdateManager.getTemplateContent(squareTemplate);
                var squareTileTextAttributes = squareTileXml.getElementsByTagName("text");
                squareTileTextAttributes[0].appendChild(squareTileXml.createTextNode(text));
                var squareTileImageAttributes = squareTileXml.getElementsByTagName("image");
                squareTileImageAttributes[0].setAttribute("src", image);
                var node = tileXml.importNode(squareTileXml.getElementsByTagName("binding").item(0), true);
                tileXml.getElementsByTagName("visual").item(0).appendChild(node);
                var tileNotification = new notifications.TileNotification(tileXml);
                tileNotification.tag = tileManager.gamePDLCTag;
                var currentTime = new Date;
                var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                var expiration = (configurationManager.engage.tileLocalExpiration || 2 * 24 * 60 * 60) * 1000;
                tileNotification.expirationTime = new Date(currentTime.getTime() + expiration);
                notifications.TileUpdateManager.createTileUpdaterForApplication().update(tileNotification)
            }
    }, {
        ContentType: (function() {
            var contentType = null;
            if (!contentType) {
                contentType = {
                    FullBleedProgram: {
                        id: "fullBleedProgram", template: "/Components/Games/GamesSharedTemplates.html#dashboardFullBleedTemplate"
                    }, BoxArtProgram: {
                            id: "boxArtProgram", template: "/Components/Games/GamesSharedTemplates.html#dashboardBoxArtTemplate"
                        }, GameExtra: {
                            id: "gameExtra", template: "/Components/Games/GamesSharedTemplates.html#dashboardGameExtraTemplate"
                        }
                };
                Object.getOwnPropertyNames(contentType).forEach(function types(property) {
                    MS.Entertainment.UI.Framework.preloadTemplate(contentType[property].template)
                })
            }
            return contentType
        })(), ActionButtons: {
                achievements: {
                    index: 0, timeout: 18000, gamesPlayed: {
                            thresholds: [5, 10, 25, 50], maxIncrement: 50
                        }, gamerscore: {
                            thresholds: [100, 250, 500, 1000, 2000, 5000, 10000, 25000, 50000, 100000], maxIncrement: 50000
                        }, update: function _updateAchievementsButton() {
                            if (!this.featuredObject || !this.featuredObject.actionButtons)
                                return;
                            var buttons = MS.Entertainment.ViewModels.GamesEngageViewModel.ActionButtons;
                            var button = this.featuredObject.actionButtons[buttons.achievements.index];
                            var achievementOptions = button.celebrationOptions = [];
                            button.subTextString = this._signedInUser.profile && this._signedInUser.profile.gamerscore;
                            button.celebration = null;
                            if (this._socialHelper && this._socialHelper.userTitles && this._socialHelper.userTitles.length && this._signedInUser.profile && this._signedInUser.profile.gamerscore !== undefined) {
                                if (this._signedInUser.userModel && this._crossedThreshold("XboxLiveGamesPlayed-" + this._signedInUser.userModel.xuid, this._socialHelper.userTitles.length, buttons.achievements.gamesPlayed))
                                    if (this._socialHelper.userTitles.length === 1)
                                        achievementOptions.push({
                                            title: String.load(String.id.IDS_SOCIAL_ENGAGE_GAMES_PLAYED_TITLE_1), subTitle: String.load(String.id.IDS_SOCIAL_ENGAGE_GAMES_PLAYED_SUBTITLE), index: achievementOptions.length
                                        });
                                    else
                                        achievementOptions.push({
                                            title: String.load(String.id.IDS_SOCIAL_ENGAGE_GAMES_PLAYED_TITLE).format(this._socialHelper.userTitles.length), subTitle: String.load(String.id.IDS_SOCIAL_ENGAGE_GAMES_PLAYED_SUBTITLE), index: achievementOptions.length
                                        });
                                var gamerscoreThreshold = this._crossedThreshold("XboxLiveGamerscore-" + this._signedInUser.userModel.xuid, this._signedInUser.profile.gamerscore, buttons.achievements.gamerscore);
                                if (gamerscoreThreshold) {
                                    var subTitle = String.empty;
                                    if (gamerscoreThreshold <= 1000)
                                        subTitle = String.load(String.id.IDS_SOCIAL_ENGAGE_GAMERSCORE_SUBTITLE1);
                                    else if (gamerscoreThreshold <= 10000)
                                        subTitle = String.load(String.id.IDS_SOCIAL_ENGAGE_GAMERSCORE_SUBTITLE2);
                                    else if (gamerscoreThreshold <= 100000)
                                        subTitle = String.load(String.id.IDS_SOCIAL_ENGAGE_GAMERSCORE_SUBTITLE3);
                                    else
                                        subTitle = String.load(String.id.IDS_SOCIAL_ENGAGE_GAMERSCORE_SUBTITLE4);
                                    achievementOptions.push({
                                        title: String.load(String.id.IDS_SOCIAL_ENGAGE_GAMERSCORE_TITLE).format(this._signedInUser.profile.gamerscore), subTitle: subTitle, index: achievementOptions.length
                                    })
                                }
                                if (achievementOptions.length) {
                                    button.automationId = MS.Entertainment.UI.AutomationIds.gamesEngageAchievementsCelebration;
                                    var updateAchievementsCelebration = function updateAchievementsCelebration() {
                                            if (this._achievementsTimer) {
                                                this._achievementsTimer.cancel();
                                                this._achievementsTimer = null
                                            }
                                            if (button.celebrationOptions.length) {
                                                var currentIndex = button.celebration ? button.celebration.index : button.celebrationOptions.length - 1;
                                                var nextIndex = (currentIndex === button.celebrationOptions.length - 1) ? 0 : currentIndex + 1;
                                                if (button.celebrationOptions.length === 1)
                                                    button.celebration = Object.create(button.celebrationOptions[nextIndex]);
                                                else
                                                    button.celebration = button.celebrationOptions[nextIndex];
                                                this._achievementsTimer = WinJS.Promise.timeout(buttons.achievements.timeout).then(function achievementsTick() {
                                                    updateAchievementsCelebration()
                                                }.bind(this))
                                            }
                                        };
                                    updateAchievementsCelebration()
                                }
                                else
                                    button.automationId = MS.Entertainment.UI.AutomationIds.gamesEngageAchievements
                            }
                        }
                }, messages: {
                        index: 1, timeout: 14000, update: function _updateMessagesButton() {
                                if (!this.featuredObject || !this.featuredObject.actionButtons)
                                    return;
                                var buttons = MS.Entertainment.ViewModels.GamesEngageViewModel.ActionButtons;
                                var button = this.featuredObject.actionButtons[buttons.messages.index];
                                var options = button.celebrationOptions = [];
                                var c = 0;
                                var p = null;
                                var count = this._signedInUser.unreadMessageCount || 0;
                                button.count = count;
                                button.celebration = null;
                                if (this._signedInUser.messages && count > 0) {
                                    p = this._signedInUser.messages.forEachAll(function eachMessage(args) {
                                        var message = args && args.item && args.item.data;
                                        if (message && message.sender && !message.read) {
                                            options.push({
                                                title: (message.game) ? message.sender.gamertag : String.load(String.id.IDS_SOCIAL_ENGAGE_TEXT_MESSAGE).format(message.sender.gamertag), subTitle: message.alertMessageText, index: options.length
                                            });
                                            c++;
                                            args.stop = (c >= this._maxCelebrations)
                                        }
                                    }.bind(this));
                                    p.then(function startTimer() {
                                        if (button.celebrationOptions.length) {
                                            button.automationId = MS.Entertainment.UI.AutomationIds.gamesEngageMessagesCelebration;
                                            var updateMessagesCelebration = function updateMessagesCelebration() {
                                                    if (this._messagesTimer) {
                                                        this._messagesTimer.cancel();
                                                        this._messagesTimer = null
                                                    }
                                                    if (button.celebrationOptions.length) {
                                                        var currentIndex = button.celebration ? button.celebration.index : button.celebrationOptions.length - 1;
                                                        var nextIndex = (currentIndex === button.celebrationOptions.length - 1) ? 0 : currentIndex + 1;
                                                        if (button.celebrationOptions.length === 1)
                                                            button.celebration = Object.create(button.celebrationOptions[nextIndex]);
                                                        else
                                                            button.celebration = button.celebrationOptions[nextIndex];
                                                        this._messagesTimer = WinJS.Promise.timeout(buttons.messages.timeout).then(function messagesTick() {
                                                            updateMessagesCelebration()
                                                        }.bind(this))
                                                    }
                                                };
                                            updateMessagesCelebration()
                                        }
                                        else
                                            button.automationId = MS.Entertainment.UI.AutomationIds.gamesEngageMessages
                                    }.bind(this))
                                }
                                else
                                    button.automationId = MS.Entertainment.UI.AutomationIds.gamesEngageMessages
                            }
                    }, friends: {
                        index: 2, timeout: 10000, update: function _updateFriendsButton() {
                                if (!this.featuredObject || !this.featuredObject.actionButtons)
                                    return;
                                var buttons = MS.Entertainment.ViewModels.GamesEngageViewModel.ActionButtons;
                                var button = this.featuredObject.actionButtons[buttons.friends.index];
                                var options = button.celebrationOptions = [];
                                var c = 0;
                                var p = null;
                                var count = (this._signedInUser.incomingFriends && this._signedInUser.incomingFriends.count) || 0;
                                button.count = count;
                                button.celebration = null;
                                if (count > 0) {
                                    this.featuredObject.actionButtons[buttons.friends.index].parameter = {
                                        page: MS.Entertainment.UI.Monikers.socialFriends, hub: MS.Entertainment.UI.Monikers.socialPendingFriendsHub
                                    };
                                    p = this._signedInUser.incomingFriends.forEachAll(function eachRequest(args) {
                                        var request = args && args.item && args.item.data;
                                        if (request && request.gamertag) {
                                            options.push({
                                                title: request.gamertag, subTitle: String.load(String.id.IDS_SOCIAL_ENGAGE_FRIEND_INVITE), index: options.length
                                            });
                                            c++;
                                            args.stop = (c >= this._maxCelebrations)
                                        }
                                    }.bind(this));
                                    p.then(function startTimer() {
                                        if (button.celebrationOptions.length) {
                                            button.automationId = MS.Entertainment.UI.AutomationIds.gamesEngageFriendsCelebration;
                                            var updateFriendsCelebration = function updateFriendsCelebration() {
                                                    if (this._friendsTimer) {
                                                        this._friendsTimer.cancel();
                                                        this._friendsTimer = null
                                                    }
                                                    var currentIndex = button.celebration ? button.celebration.index : button.celebrationOptions.length - 1;
                                                    var nextIndex = (currentIndex === button.celebrationOptions.length - 1) ? 0 : currentIndex + 1;
                                                    if (button.celebrationOptions.length === 1)
                                                        button.celebration = Object.create(button.celebrationOptions[nextIndex]);
                                                    else
                                                        button.celebration = button.celebrationOptions[nextIndex];
                                                    this._friendsTimer = WinJS.Promise.timeout(buttons.friends.timeout).then(function friendsTick() {
                                                        updateFriendsCelebration()
                                                    }.bind(this))
                                                };
                                            updateFriendsCelebration()
                                        }
                                        else
                                            button.automationId = MS.Entertainment.UI.AutomationIds.gamesEngageFriends
                                    }.bind(this))
                                }
                                else
                                    button.automationId = MS.Entertainment.UI.AutomationIds.gamesEngageFriends
                            }
                    }
            }
    }), PlayGameAction: WinJS.Class.define(function playGameAction(clickHandler) {
            if (!clickHandler)
                throw new Error("PlayGameAction requires a click handler");
            this._clickDataContext = clickHandler.doclick ? clickHandler : {doclick: clickHandler}
        }, {
            _clickDataContext: null, _title: String.empty, _imageUri: null, clickDataContext: {
                    get: function get_clickDataContext() {
                        return this._clickDataContext
                    }, set: function set_clickDataContext(value) {
                            throw new Error("Cannot set clickDataContext");
                        }
                }, title: {
                    get: function get_title() {
                        return this._title
                    }, set: function set_title(value) {
                            this._title = value || String.load(String.id.IDS_SOCIAL_ENGAGE_PLAY_TITLE)
                        }
                }, imageUri: {
                    get: function get_imageUri() {
                        return this._imageUri
                    }, set: function set_imageUri(value) {
                            this._imageUri = value || MS.Entertainment.ViewModels.PlayGameAction.defaultImage
                        }
                }
        }, {defaultImage: "/Images/games_dash_engage.png"})
})
