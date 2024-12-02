/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Controls/Link.js", "/Controls/templateSelector.js", "/Controls/avatarControl.js", "/Controls/hub.js", "/Animations/SocialAnimations.js", "/Framework/corefx.js", "/Framework/imageloader.js", "/Framework/stringids.js", "/Framework/utilities.js", "/Framework/data/queries/modelProperties.js", "/Framework/data/augmenters/xboxLiveAugmenters.js", "/Components/SignIn/SignIn.js", "/ViewModels/social/social.js", "/ViewModels/social/profileHydrator.js");
(function(undefined) {
    WinJS.Namespace.define("MS.Entertainment.Social", {friendActionType: {
            add: "add", remove: "remove", accept: "accept", decline: "decline", cancel: "cancel"
        }});
    WinJS.Namespace.define("MS.Entertainment.Social", {friendRelationLookupType: {
            none: "none", profileLookup: "profileLookup", friendsLookup: "friendsLookup"
        }});
    WinJS.Namespace.define("MS.Entertainment.Social", {friendButtonType: {
            none: "none", findFriendsButton: "findFriendsButton"
        }});
    WinJS.Namespace.define("MS.Entertainment.Social", {chatBubbleType: {
            onlineActivity: "onlineActivity", online: "online", offlineActivity: "offlineActivity", offline: "offline", activity: "activity", motto: "motto", gamerTag: "gamerTag", friendRequest: "friendRequest"
        }});
    WinJS.Namespace.define("MS.Entertainment.Social", {
        chatBubblePriorityOrder: {
            profile: [MS.Entertainment.Social.chatBubbleType.motto], friend: [MS.Entertainment.Social.chatBubbleType.friendRequest, MS.Entertainment.Social.chatBubbleType.onlineActivity, MS.Entertainment.Social.chatBubbleType.online, MS.Entertainment.Social.chatBubbleType.offlineActivity, MS.Entertainment.Social.chatBubbleType.offline, MS.Entertainment.Social.chatBubbleType.activity, MS.Entertainment.Social.chatBubbleType.gamerTag], selectedFriend: [MS.Entertainment.Social.chatBubbleType.friendRequest, MS.Entertainment.Social.chatBubbleType.motto, MS.Entertainment.Social.chatBubbleType.onlineActivity, MS.Entertainment.Social.chatBubbleType.online, MS.Entertainment.Social.chatBubbleType.offlineActivity, MS.Entertainment.Social.chatBubbleType.offline, MS.Entertainment.Social.chatBubbleType.activity, MS.Entertainment.Social.chatBubbleType.gamerTag], none: []
        }, chatBubbleAugmentations: (function() {
                var type = MS.Entertainment.Social.chatBubbleType;
                var map = {};
                map[type.onlineActivity] = {
                    isValid: function isValid(profile) {
                        return (profile && profile.status && profile.status.media && profile.status.media.titleId && profile.status.isOnline)
                    }, augmentation: MS.Entertainment.Data.Augmenter.XboxLive.ChatBubbleActivity
                };
                map[type.online] = {
                    isValid: function isValid(profile) {
                        return (profile && profile.status && profile.status.isOnline)
                    }, augmentation: MS.Entertainment.Data.Augmenter.XboxLive.ChatBubbleStatus
                };
                map[type.offlineActivity] = {
                    isValid: function isValid(profile) {
                        return (profile && profile.status && profile.status.media && profile.status.media.titleId && !profile.status.isOnline)
                    }, augmentation: MS.Entertainment.Data.Augmenter.XboxLive.ChatBubbleOffline
                };
                map[type.offline] = {
                    isValid: function isValid(profile) {
                        return (profile && profile.status && !profile.status.isOnline)
                    }, augmentation: MS.Entertainment.Data.Augmenter.XboxLive.ChatBubbleOffline
                };
                map[type.activity] = {
                    isValid: function isValid(profile) {
                        return (profile && profile.status && profile.status.media && profile.status.media.titleId)
                    }, augmentation: MS.Entertainment.Data.Augmenter.XboxLive.ChatBubbleActivity
                };
                map[type.motto] = {
                    isValid: function isValid(profile) {
                        return (profile && profile.motto && profile.motto.match(/(^\s+$)/) === null)
                    }, augmentation: MS.Entertainment.Data.Augmenter.XboxLive.ChatBubbleMotto
                };
                map[type.gamerTag] = {
                    isValid: function isValid(profile) {
                        return (profile && profile.gamerTag && profile.gamerTag.match(/(^\s+$)/) === null)
                    }, augmentation: MS.Entertainment.Data.Augmenter.XboxLive.ChatBubbleGamerTag
                };
                map[type.friendRequest] = {
                    isValid: function isValid(profile) {
                        return (profile && profile.status && (profile.status.relation === MS.Entertainment.Data.Augmenter.XboxLive.UserRelation.userRelationFriendRequester || profile.status.relation === MS.Entertainment.Data.Augmenter.XboxLive.UserRelation.userRelationFriendRequestee))
                    }, augmentation: MS.Entertainment.Data.Augmenter.XboxLive.ChatBubbleFriendRequest
                };
                return map
            })(), ProfileAction: {
                addFriend: 0, cancelFriend: 1, acceptFriend: 2, declineFriend: 3, compareGames: 4, viewProfile: 5, sendMessage: 6, editAvatar: 7, createAvatar: 8, editProfile: 9, viewAchievements: 10, shareProfile: 11, removeFriend: 12, changeGamertag: 13
            }
    });
    WinJS.Namespace.define("MS.Entertainment.Social", {
        MiniProfileAvatar: MS.Entertainment.UI.Framework.defineUserControl("Components/Social/miniProfile.html#miniProfileAvatarTemplate", function miniProfileAvatar(element, options) {
            this.model = {}
        }, {
            shutdownOnFreeze: true, _bindings: null, _modelBinding: null, _avatarBinding: null, initialize: function initialize() {
                    MS.Entertainment.Animations.Social.enableChatBubbleFade(this.chatBubble);
                    this.model = this.model || {};
                    this._bindings = WinJS.Binding.bind(this, {
                        model: this._handleModelChanged.bind(this), selected: this._handleSelectionChanged.bind(this), showBubble: this._updateBubbleDisplayState.bind(this)
                    });
                    this._avatarBinding = WinJS.Binding.bind(this.avatarControl, {started: this._handledAvatarStartStop.bind(this)})
                }, unload: function unload() {
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null
                    }
                    if (this._modelBinding) {
                        this._modelBinding.cancel();
                        this._modelBinding = null
                    }
                    if (this._avatarBinding) {
                        this._avatarBinding.cancel();
                        this._avatarBinding = null
                    }
                    this.stop();
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, pause: function pause() {
                    if (this.avatarControl)
                        this.avatarControl.pause();
                    this.avatarRenderMode = MS.Entertainment.UI.Controls.avatarRenderMode.pause
                }, play: function play() {
                    if (this.avatarControl)
                        this.avatarControl.play();
                    this.avatarRenderMode = MS.Entertainment.UI.Controls.avatarRenderMode.play
                }, stop: function stop() {
                    if (this.avatarControl)
                        this.avatarControl.shutdown()
                }, playAnimationById: function DashboardFriendAvatar_playAnimationById(animationId) {
                    this.avatarControl.startAnimation(animationId)
                }, playRightNeighborSelectedAnimation: function DashboardFriendAvatar_playRightNeighborSelectedAnimation() {
                    this.playAnimationById(Microsoft.Entertainment.Avatar.AvatarAnimationId.lookLeft)
                }, playLeftNeighborSelectedAnimation: function DashboardFriendAvatar_playLeftNeighborSelectedAnimation() {
                    this.playAnimationById(Microsoft.Entertainment.Avatar.AvatarAnimationId.lookRight)
                }, playSelectedAnimation: function DashboardFriendAvatar_playSelectedAnimation() {
                    this.selected = true;
                    this.playAnimationById(Microsoft.Entertainment.Avatar.AvatarAnimationId.jumpIn);
                    WinJS.Utilities.addClass(this.container, "selectedAvatar")
                }, playUnselectedAnimation: function DashboardFriendAvatar_playUnexpandedAnimation() {
                    this.selected = false;
                    this.playAnimationById(Microsoft.Entertainment.Avatar.AvatarAnimationId.jumpOut);
                    WinJS.Utilities.removeClass(this.container, "selectedAvatar")
                }, _handledAvatarStartStop: function _handledAvatarStartStop(started) {
                    if (started) {
                        WinJS.Utilities.addClass(this.placeHolder, "removeFromDisplay");
                        WinJS.Utilities.removeClass(this.avatarControl.domElement, "removeFromDisplay");
                        WinJS.UI.Animation.fadeIn(this.avatarControl.domElement);
                        WinJS.UI.Animation.fadeOut(this.placeHolder)
                    }
                    else {
                        WinJS.Utilities.addClass(this.avatarControl.domElement, "removeFromDisplay");
                        WinJS.Utilities.removeClass(this.placeHolder, "removeFromDisplay");
                        WinJS.UI.Animation.fadeOut(this.avatarControl.domElement);
                        WinJS.UI.Animation.fadeIn(this.placeHolder)
                    }
                }, _handleModelChanged: function _handleModelChanged(newValue, oldValue) {
                    if (this.model) {
                        if (this._modelBinding) {
                            this._modelBinding.cancel();
                            this._modelBinding = null
                        }
                        this._modelBinding = WinJS.Binding.bind(this, {model: {gamerTag: this._handleNewGamerTag.bind(this)}});
                        if (this.model.hydrate && !this.model.hydrated)
                            this.model.hydrate().then(function() {
                                this._updateBubbleModel()
                            }.bind(this));
                        else
                            this._updateBubbleModel()
                    }
                }, _handleNewGamerTag: function _handleNewGamerTag(newValue) {
                    this.visible = !!newValue;
                    this.gamerTag = newValue;
                    if (this.gamerTag) {
                        var text = String.load(String.id.IDS_SOCIAL_AVATAR_TITLE_NAR).format(this.gamerTag);
                        MS.Entertainment.Utilities.setAccessibilityText(this.avatarControl, text)
                    }
                }, _handleSelectionChanged: function _handleSelectionChanged(newValue, oldValue) {
                    if (oldValue !== undefined)
                        if (newValue) {
                            this.playSelectedAnimation();
                            if (this.showBubble)
                                MS.Entertainment.Animations.Social.fadeOutContainer(this.chatBubble)
                        }
                        else {
                            this.playUnselectedAnimation();
                            if (this.showBubble)
                                MS.Entertainment.Animations.Social.fadeInContainer(this.chatBubble)
                        }
                }, _updateBubbleModel: function _updateBubbleModel() {
                    if (!this.bubbleModel) {
                        var mapping = this._findAugmentationMapping(this.model, MS.Entertainment.Social.chatBubbleAugmentations);
                        if (mapping)
                            this.bubbleModel = MS.Entertainment.Data.augment(WinJS.Binding.unwrap(this.model), mapping.augmentation)
                    }
                    this._updateBubbleDisplayState()
                }, _findAugmentationMapping: function _findAugmentationMapping(model, augmentation) {
                    var mapping = null;
                    for (var i = 0; this.model && i < this.chatBubblePriority.length; i++) {
                        mapping = augmentation[this.chatBubblePriority[i]];
                        if (mapping && mapping.isValid(this.model))
                            break;
                        mapping = null
                    }
                    return mapping
                }, _updateBubbleDisplayState: function _updateBubbleDisplayState(value) {
                    if (this.showBubble && this.bubbleModel && (this.bubbleModel.primaryText || this.bubbleModel.secondaryText))
                        MS.Entertainment.Animations.Social.fadeInContainer(this.chatBubble);
                    else
                        MS.Entertainment.Animations.Social.fadeOutContainer(this.chatBubble)
                }
        }, {
            model: null, bubbleModel: null, selected: false, chatBubblePriority: MS.Entertainment.Social.chatBubblePriorityOrder.profile, avatarWidth: "270px", avatarHeight: "700px", avatarDisplay: MS.Entertainment.UI.Controls.avatarDisplay.any, avatarRenderMode: MS.Entertainment.UI.Controls.avatarRenderMode.play, allowPropAnimations: false, showAvatar: true, showBubble: false, gamerTag: null, alwaysAnimate: false
        }), MiniProfileFriendsPanel: MS.Entertainment.UI.Framework.defineUserControl("Components/Social/miniProfile.html#miniProfileFriendsPanelTemplate", function miniProfileFriendsPanel() {
                this.pageData = new MS.Entertainment.Social.PageData;
                this.model = this.pageData.userModel || MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser)
            }, {
                _raisePanelReady: true, _bindings: null, _signInBindings: null, _refreshTimer: null, _frozen: false, _pendingRefresh: false, _beenVisible: false, pageData: null, autoRefreshTimeMS: 15 * 60 * 1000, initialize: function initialize() {
                        var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                        this._signInBindings = WinJS.Binding.bind(signIn, {isSignedIn: this._onSignInChanged.bind(this)});
                        this._bindings = WinJS.Binding.bind(this, {
                            pageData: {userModel: this._handlePageDataChanges.bind(this)}, model: {status: this._handleModelStatus.bind(this)}, hub: {isVisible: this._handleHubVisibilityChanges.bind(this)}, friendsGallery: {showEmpty: this._handleEmptyGalleryChanged.bind(this)}
                        });
                        this._setPanelStatus(!signIn.isSignedIn);
                        this._beginRefreshTimer()
                    }, unload: function unload() {
                        this._stopRefreshTimer();
                        if (this.model) {
                            if (this.model.dispose)
                                this.model.dispose();
                            this.model = null
                        }
                        if (this._bindings) {
                            this._bindings.cancel();
                            this._bindings = null
                        }
                        if (this._signInBindings) {
                            this._signInBindings.cancel();
                            this._signInBindings = null
                        }
                        if (this.pageData) {
                            this.pageData.dispose();
                            this.pageData = null
                        }
                        MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                    }, thaw: function thaw() {
                        MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                        this._frozen = false;
                        if (this._pendingRefresh)
                            this._refreshModel()
                    }, freeze: function freeze() {
                        this._frozen = true;
                        MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this)
                    }, _setPanelStatus: function _setPanelStatus(offline) {
                        if (offline) {
                            MS.Entertainment.Utilities.showElement(this.signedOut);
                            MS.Entertainment.Utilities.hideElement(this.signedIn)
                        }
                        else {
                            MS.Entertainment.Utilities.showElement(this.signedIn);
                            MS.Entertainment.Utilities.hideElement(this.signedOut)
                        }
                    }, _onSignInChanged: function _onSignInChanged(newValue) {
                        this._setPanelStatus(!newValue)
                    }, _beginRefreshTimer: function _beginRefreshTimer() {
                        this._stopRefreshTimer();
                        this._refreshTimer = WinJS.Promise.timeout(this.autoRefreshTimeMS).then(this._refreshModel.bind(this))
                    }, _stopRefreshTimer: function _stopRefreshTimer() {
                        if (this._refreshTimer) {
                            this._refreshTimer.cancel();
                            this._refreshTimer = null
                        }
                    }, _refreshModel: function _refreshModel() {
                        if (this._frozen)
                            this._pendingRefresh = true;
                        else if (this.model) {
                            this._pendingRefresh = false;
                            this.friendsGallery.refresh().then(this._beginRefreshTimer.bind(this), this._beginRefreshTimer.bind(this))
                        }
                    }, _handlePageDataChanges: function _handlePageDataChanges() {
                        if (this.model) {
                            this.model.userModel = this.pageData.userModel;
                            this.model.userXuid = this.pageData.userXuid;
                            this.model.enabled = true
                        }
                    }, _raisePanelReadyOnce: function _raisePanelReadyOnce(error, errorModel) {
                        if (this._raisePanelReady) {
                            MS.Entertainment.UI.Controls.Panel.raisePanelReady(this.domElement, error, errorModel);
                            this._raisePanelReady = false
                        }
                    }, _raisePanelResetOnce: function _raisePanelResetOnce() {
                        if (!this._raisePanelReady) {
                            MS.Entertainment.UI.Controls.Panel.raisePanelReset(this.domElement);
                            this._raisePanelReady = true
                        }
                    }, _isSignedInUser: function _isSignedInUser() {
                        return !this.pageData.userModel
                    }, _handleEmptyGalleryChanged: function _handleEmptyGalleryChanged(empty) {
                        if (empty && !this._isSignedInUser())
                            this._raisePanelReadyOnce(true, {primaryStringId: String.id.IDS_SOCIAL_EMPTY_FRIENDS_TITLE})
                    }, _handleModelStatus: function _handleModelStatus(status) {
                        var statusValue = MS.Entertainment.Social.LoadStatus;
                        var raiseReady = false;
                        var offline = false;
                        var error = false;
                        var errorModel = {
                                primaryStringId: null, secondaryText: String.empty
                            };
                        switch (status) {
                            case statusValue.error:
                                raiseReady = true;
                                error = true;
                                errorModel.primaryStringId = String.id.IDS_SOCIAL_ERROR;
                                break;
                            case statusValue.blocked:
                                raiseReady = true;
                                error = true;
                                errorModel.primaryStringId = String.id.IDS_SOCIAL_BLOCKED_FRIENDS;
                                break;
                            case statusValue.offline:
                                offline = true;
                                raiseReady = true;
                                break;
                            case statusValue.loaded:
                                raiseReady = true;
                                if (!this.model.friendsCount) {
                                    error = true;
                                    errorModel.primaryStringId = this._isSignedInUser() ? String.id.IDS_SOCIAL_MY_EMPTY_FRIENDS_TITLE : String.id.IDS_SOCIAL_EMPTY_FRIENDS_TITLE
                                }
                                break;
                            case statusValue.loading:
                                if (this.model.friends === null)
                                    this._raisePanelResetOnce();
                                break
                        }
                        this._setPanelStatus(offline);
                        if (raiseReady)
                            this._raisePanelReadyOnce(error, errorModel)
                    }, _handleHubVisibilityChanges: function _handleHubVisibilityChanges(newIsVisible) {
                        if (newIsVisible) {
                            this._beenVisible = true;
                            this.avatarRenderMode = MS.Entertainment.UI.Controls.avatarRenderMode.play
                        }
                        else if (this._beenVisible)
                            this.avatarRenderMode = MS.Entertainment.UI.Controls.avatarRenderMode.pause
                    }
            }, {
                model: null, hub: null, poppedAvatarClass: "poppedOverAvatarPosition", avatarRenderMode: MS.Entertainment.UI.Controls.avatarRenderMode.play, avatarDisplay: MS.Entertainment.UI.Controls.avatarDisplay.any, currentUserAsFriend: false, friendButtonType: MS.Entertainment.Social.friendButtonType.none, friendButtonTemplate: null
            }), MiniProfileHubPanel: MS.Entertainment.UI.Framework.defineUserControl("Components/Social/miniProfile.html#miniProfileHubPanelTemplate", function miniProfileHubPanel() {
                this.model = new MS.Entertainment.Social.ProfileHydrator;
                this.pageData = new MS.Entertainment.Social.PageData
            }, {
                _bindings: null, _profileBinding: null, _shareOperation: null, _modelBinding: null, _raisePanelReady: true, _refreshTimer: null, _frozen: false, _signIn: null, _isHidden: false, _isSignedInUserCachedValue: null, _panelWidth: null, pageData: null, autoRefreshTimeMS: 15 * 60 * 1000, initialize: function initialize() {
                        this.model.loadActivity = false;
                        this.model.loadAchievements = false;
                        this.model.loadFriends = false;
                        this.model.suppressAchievementErrors = true;
                        this.model.achievementsSort = MS.Entertainment.Data.Query.Properties.achievementSort.achievedDate;
                        this._bindings = WinJS.Binding.bind(this, {
                            model: this._handleModelChanged.bind(this), pageData: {userModel: this._handlePageDataChanges.bind(this)}
                        });
                        this._signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                        var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                        if (navigationService.currentPage.iaNode.moniker === MS.Entertainment.UI.Monikers.root)
                            this._signIn.refreshSignInState().done(function signInStateRefreshed() {
                                this._refreshModel()
                            }.bind(this), function signInStateFailed(){});
                        if (!MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn).isSignedIn)
                            this._handleModelStatus(MS.Entertainment.Social.LoadStatus.offline);
                        var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                        var signInAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.signIn);
                        signInAction.automationId = MS.Entertainment.UI.AutomationIds.miniProfileHubPanelSignIn;
                        if (!this.signedOutPanel.model)
                            this.signedOutPanel.model = new MS.Entertainment.UI.Controls.DefaultFailedPanelModel;
                        this.signedOutPanel.model.details = [{
                                linkStringId: String.id.IDS_SIGNIN_NOTIFICATION_SIGNIN_TITLE, linkAction: signInAction, linkIcon: MS.Entertainment.UI.Icon.friend
                            }];
                        this.avatarControl.avatarControl.startControl();
                        this._beginRefreshTimer()
                    }, freeze: function freeze() {
                        this._frozen = true;
                        MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this)
                    }, thaw: function thaw() {
                        MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                        if (this.avatarControl && this.avatarControl.avatarControl)
                            this.avatarControl.avatarControl.reload();
                        this._frozen = false;
                        this._refreshModel();
                        WinJS.Promise.timeout(1500).then(function _updatePendingShareAfterHydrate() {
                            this._updatePendingShare()
                        }.bind(this))
                    }, _beginRefreshTimer: function _beginRefreshTimer() {
                        this._stopRefreshTimer();
                        this._refreshTimer = WinJS.Promise.timeout(this.autoRefreshTimeMS).then(this._refreshModel.bind(this))
                    }, _stopRefreshTimer: function _stopRefreshTimer() {
                        if (this._refreshTimer) {
                            this._refreshTimer.cancel();
                            this._refreshTimer = null
                        }
                    }, _refreshModel: function _refreshModel() {
                        if (!this._frozen) {
                            this.model.clearProfileCache = true;
                            if (this._isSignedInUser())
                                this.model.loadIdentity = true;
                            this.model.refresh().then(this._beginRefreshTimer.bind(this), this._beginRefreshTimer.bind(this))
                        }
                    }, _handlePageDataChanges: function _handlePageDataChanges() {
                        if (this.model && this.model !== this.pageData.userModel) {
                            this.model.userModel = this.pageData.userModel;
                            this.model.enabled = true
                        }
                    }, _handleModelChanged: function _handleModelChanged() {
                        if (this._modelBinding) {
                            this._modelBinding.cancel();
                            this._modelBinding = null
                        }
                        if (this.model) {
                            if (this.pageData && this.pageData.userModel) {
                                this.model.userModel = this.pageData.userModel;
                                this.model.enabled = true
                            }
                            this._modelBinding = WinJS.Binding.bind(this.model, {
                                status: this._handleModelStatus.bind(this), profile: {gamerTag: this._handleGamerTagChanges.bind(this)}
                            })
                        }
                        this._updatePendingShare()
                    }, _raisePanelReadyOnce: function _raisePanelReadyOnce(error, errorModel) {
                        if (this._raisePanelReady) {
                            MS.Entertainment.UI.Controls.Panel.raisePanelReady(this.domElement, error, errorModel);
                            this._raisePanelReady = false
                        }
                    }, _raisePanelResetOnce: function _raisePanelResetOnce() {
                        if (!this._raisePanelReady) {
                            MS.Entertainment.UI.Controls.Panel.raisePanelReset(this.domElement);
                            this._raisePanelReady = true
                        }
                    }, _raiseSizeAdjusted: function _raiseSizeAdjusted() {
                        var domEvent = document.createEvent("Event");
                        domEvent.initEvent("SizeAdjusted", true, true);
                        this.domElement.dispatchEvent(domEvent)
                    }, unload: function unload() {
                        MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this);
                        this._stopRefreshTimer();
                        this.model.dispose();
                        if (this._bindings) {
                            this._bindings.cancel();
                            this._bindings = null
                        }
                        if (this._profileBinding) {
                            this._profileBinding.cancel();
                            this._profileBinding = null
                        }
                        if (this._modelBinding) {
                            this._modelBinding.cancel();
                            this._modelBinding = null
                        }
                        if (this.pageData) {
                            this.pageData.dispose();
                            this.pageData = null
                        }
                        this._unshare()
                    }, _handleModelStatus: function _handleModelStatus(status) {
                        var statusValue = MS.Entertainment.Social.LoadStatus;
                        var raiseReady = false;
                        var error = false;
                        var offline = false;
                        var errorModel = {
                                primaryStringId: null, secondaryText: String.empty
                            };
                        switch (status) {
                            case statusValue.error:
                                raiseReady = true;
                                error = true;
                                errorModel.primaryStringId = String.id.IDS_SOCIAL_ERROR;
                                break;
                            case statusValue.blocked:
                                raiseReady = true;
                                error = true;
                                errorModel.primaryStringId = String.id.IDS_SOCIAL_BLOCKED_PROFILE;
                                break;
                            case statusValue.offline:
                                offline = true;
                                raiseReady = true;
                                break;
                            case statusValue.loaded:
                                var user = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                                if (this.model.profile.gamerTag === user.gamerTag && !this.model.profile.userModel)
                                    this.model.profile.userModel = user;
                                raiseReady = true;
                                break;
                            case statusValue.loading:
                                this._raisePanelResetOnce();
                                break
                        }
                        if (offline) {
                            var rootElement = MS.Entertainment.Utilities.findParentElementByClassName(this.domElement, "socialMiniProfile");
                            if (rootElement && !this._isHidden)
                                WinJS.UI.Animation.fadeOut(rootElement).done(function panelHidden() {
                                    this._panelWidth = rootElement.style.width === "0px" ? String.empty : rootElement.style.width;
                                    rootElement.style.width = 0;
                                    this._isHidden = true;
                                    this._raiseSizeAdjusted()
                                }.bind(this))
                        }
                        else {
                            var rootElement = MS.Entertainment.Utilities.findParentElementByClassName(this.domElement, "socialMiniProfile");
                            if (rootElement && this._isHidden) {
                                rootElement.style.width = this._panelWidth;
                                this._raiseSizeAdjusted();
                                WinJS.UI.Animation.fadeIn(rootElement).done(function panelShown() {
                                    this._isHidden = false
                                }.bind(this))
                            }
                        }
                        if (raiseReady) {
                            this._updatePendingShare();
                            this._raisePanelReadyOnce(error, errorModel)
                        }
                    }, _handleGamerTagChanges: function _handleGamerTagChanges(newGamerTag) {
                        if (newGamerTag && !MS.Entertainment.Utilities.onRootPage() && this.hub)
                            this.hub.title = String.load(String.id.IDS_SOCIAL_X_PROFILE_TITLE).format(this.model.profile.gamerTag)
                    }, _isSignedInUser: function _isSignedInUser() {
                        if (!this._isSignedInUserCachedValue) {
                            var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                            this._isSignedInUserCachedValue = signedInUser && this.model && this.model.profile && this.model.profile.gamerTag === signedInUser.gamerTag
                        }
                        return this._isSignedInUserCachedValue
                    }, _updatePendingShare: function _updatePendingShare() {
                        var sender = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.shareSender);
                        var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                        this._unshare();
                        if (this.model && this.model.status === MS.Entertainment.Social.LoadStatus.loaded && this.model.profile && this._isSignedInUser())
                            this._shareOperation = sender.pendingShare(this.model.profile)
                    }, _unshare: function _unshare() {
                        if (this._shareOperation) {
                            this._shareOperation.cancel();
                            this._shareOperation = null
                        }
                    }
            }, {
                model: null, hub: null, showAvatar: true, showChatBubble: true, avatarRenderMode: MS.Entertainment.UI.Controls.avatarRenderMode.play, avatarDisplay: MS.Entertainment.UI.Controls.avatarDisplay.any, profilePageView: false
            }), MiniProfileImage: MS.Entertainment.UI.Framework.defineUserControl(null, function miniProfileImage(element, options) {
                this._imageLoader = new MS.Entertainment.UI.Shell.ImageLoader(null);
                MS.Entertainment.Utilities.hideElement(this._imageLoader.imgContainer)
            }, {
                defaultUri: null, loadingUri: null, width: null, height: null, _imageLoader: null, _bindings: null, controlName: "MiniProfileImage", initialize: function MiniProfileImage_initialize() {
                        this.domElement.appendChild(this._imageLoader.imgContainer);
                        if (!this.defaultUri)
                            this.defaultUri = MS.Entertainment.Social.MiniProfileImage.defaultImageFallback;
                        if (this.width)
                            this._imageLoader.imgContainer.style.width = this.width;
                        if (this.height)
                            this._imageLoader.imgContainer.style.height = this.height;
                        this._bindings = WinJS.Binding.bind(this, {uri: this._handleUriChanged.bind(this)})
                    }, unload: function MiniProfileImage_unload() {
                        MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this);
                        if (this._bindings) {
                            this._bindings.cancel();
                            this._bindings = null
                        }
                    }, _handleUriChanged: function MiniProfileImage_handleUriChanged(newUri, oldUri) {
                        if (newUri || (newUri && !oldUri)) {
                            this._imageLoader.loadImage(newUri, this.defaultUri, this.loadingUri);
                            MS.Entertainment.Utilities.showElement(this._imageLoader.imgContainer)
                        }
                    }
            }, {uri: null}, {defaultImageFallback: "/Images/img_not_found.png"}), ProfileActionButton: MS.Entertainment.UI.Framework.defineUserControl("Components/Social/miniProfile.html#profileActionButtonTemplate", null, {
                _binding: null, initialize: function initialize() {
                        this._binding = WinJS.Binding.bind(this, {model: this._dataModelChange.bind(this)})
                    }, unload: function unload() {
                        if (this._binding) {
                            this._binding.cancel();
                            this._binding = null
                        }
                        MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                    }, _dataModelChange: function _dataModelChange() {
                        if (this.model) {
                            if (this.model.className)
                                WinJS.Utilities.addClass(this.domElement.children[0], this.model.className);
                            if (this.model.automationId)
                                this.domElement.parentElement.setAttribute("data-win-automationid", this.model.automationId);
                            if (this.model.containerClassName)
                                WinJS.Utilities.addClass(this.domElement.parentElement, this.model.containerClassName);
                            if (this.model.tabIndex !== null && this.model.tabIndex !== undefined)
                                this.domElement.children[0].winControl._button.tabIndex = this.model.tabIndex
                        }
                    }, execute: function execute() {
                        var control = this.model;
                        MS.Entertainment.Utilities.Telemetry.logCommandClicked(control);
                        if (control.onClick) {
                            if (control.closeOverlay)
                                control.closeOverlay();
                            control.onClick();
                            return
                        }
                        if (control.actionId) {
                            var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                            var action = actionService.getAction(control.actionId);
                            if (control.closeOverlay)
                                control.closeOverlay();
                            action.parameter = control.actionParam;
                            action.execute().then(control.actionComplete);
                            return
                        }
                        var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                        var samePage = navigationService.currentPage.iaNode.moniker === control.page;
                        var sameUser = false;
                        if (navigationService.currentPage.options && control.userModel)
                            sameUser = MS.Entertainment.Social.Helpers.getXuidFromUserModel(navigationService.currentPage.options.userModel) === MS.Entertainment.Social.Helpers.getXuidFromUserModel(control.userModel);
                        if (!(sameUser && samePage)) {
                            switch (control.page) {
                                case MS.Entertainment.UI.Monikers.socialDetails:
                                    MS.Entertainment.Instrumentation.PerfTrack.setStartTime(MS.Entertainment.Instrumentation.PerfTrack.StartPoints.AchievementsRequest);
                                    break;
                                case MS.Entertainment.UI.Monikers.socialAvatarEditorPage:
                                    MS.Entertainment.Instrumentation.PerfTrack.setStartTime(MS.Entertainment.Instrumentation.PerfTrack.StartPoints.UpdateAvatarRequest);
                                    break;
                                case MS.Entertainment.UI.Monikers.socialCompareActivitiesPage:
                                    MS.Entertainment.Instrumentation.PerfTrack.setStartTime(MS.Entertainment.Instrumentation.PerfTrack.StartPoints.CompareGamesRequest);
                                    break
                            }
                            var doNav = function doNav() {
                                    navigationService.navigateTo(control.page, control.hub, null, {
                                        userModel: control.userModel, userXuid: control.userXuid
                                    }, true)
                                };
                            if (control.closeOverlay)
                                control.closeOverlay(doNav);
                            else
                                doNav()
                        }
                        else if (control.closeOverlay)
                            control.closeOverlay()
                    }
            }, {model: null}), ProfileButtonList: MS.Entertainment.UI.Framework.defineUserControl("Components/Social/miniProfile.html#profileButtonListTemplate", function profileButtonList() {
                this.actionButtons = new MS.Entertainment.ObservableArray
            }, {
                _availableActions: [], initialize: function initialize(){}, setAvailableActions: function setAvailableActions(actions) {
                        this._availableActions = actions
                    }, add: function add(priority) {
                        var model = {model: this._availableActions[priority]};
                        if (this.actionButtons.length === 0)
                            this.actionButtons.add(model);
                        else
                            for (var x = 0; x <= this.actionButtons.length; x++) {
                                if (x === this.actionButtons.length) {
                                    this.actionButtons.add(model);
                                    break
                                }
                                var current = this.actionButtons.item(x).model.priority;
                                if (priority === current)
                                    break;
                                if (current > priority) {
                                    this.actionButtons.insert(x, model);
                                    break
                                }
                            }
                    }, remove: function remove(button) {
                        for (var x = 0; x < this.actionButtons.length; x++)
                            if (this.actionButtons.item(x).model.priority === button) {
                                this.actionButtons.removeAt(x);
                                break
                            }
                    }, clear: function clear() {
                        this.actionButtons.clear()
                    }
            }, {actionButtons: null}), AvatarInfoCard: MS.Entertainment.UI.Framework.defineUserControl("Components/Social/miniProfile.html#miniProfileInfoCardTemplate", function avatarInfoCard(element, options){}, {
                profilePageView: false, currentUserAsFriend: false, friendRelationLookupType: MS.Entertainment.Social.friendRelationLookupType.none, _queryWatcher: null, _profileQuery: null, _isSignedInUserCachedValue: null, _signedInUser: null, _signedInUserBindings: null, _uiStateBindings: null, _friendBindings: null, _bindings: null, _inEditingProfile: false, incomingFriendLabel: null, buttons: null, initialize: function initialize() {
                        this.loadingLabel.textContent = String.load(String.id.IDS_LOADING_STATUS_LABEL);
                        this._buildAvailableActions();
                        this._queryWatcher = new MS.Entertainment.Framework.QueryWatcher("profile");
                        this._signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                        this._friendBindings = WinJS.Binding.bind(MS.Entertainment.Social.Helpers.getSignedInUserModel(), {allFriends: this._handleSignedInUserFriendsChanged.bind(this)});
                        var uiState = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                        if (!uiState.isAvatarRenderingUsingD3D)
                            this._uiStateBindings = WinJS.Binding.bind(uiState, {
                                networkStatus: this._onNetworkStatusChanged.bind(this), isAvatarRenderingUsingD3D: this._onAvatarRenderStateChanged.bind(this)
                            });
                        else
                            this._uiStateBindings = WinJS.Binding.bind(uiState, {networkStatus: this._onNetworkStatusChanged.bind(this)});
                        this._getAugmentedModelAsync().done(function complete(model) {
                            if (model !== null)
                                this.model = model;
                            this._bindings = WinJS.Binding.bind(this, {model: this._handleModelChanged.bind(this)});
                            MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioPopoverRequestToLoad("friend")
                        }.bind(this), function error() {
                            this._bindings = WinJS.Binding.bind(this, {model: this._handleModelChanged.bind(this)})
                        }.bind(this))
                    }, unload: function unload() {
                        MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this);
                        if (this._uiStateBindings) {
                            this._uiStateBindings.cancel();
                            this._uiStateBindings = null
                        }
                        if (this._bindings) {
                            this._bindings.cancel();
                            this._bindings = null
                        }
                        if (this._friendBindings) {
                            this._friendBindings.cancel();
                            this._friendBindings = null
                        }
                    }, _buildAvailableActions: function _buildAvailableActions() {
                        var model = this.model;
                        if (this.model.identity)
                            this.model.userModel = MS.Entertainment.Social.Helpers.createUserModel(this.model.identity.xuid, this.model.gamerTag);
                        var pageData = new MS.Entertainment.Social.PageData;
                        var xuid = model.identity ? model.identity.xuid : pageData.userXuid;
                        this.buttons.setAvailableActions([{
                                priority: MS.Entertainment.Social.ProfileAction.addFriend, automationId: "miniProfileAddFriendButton", containerClassName: "addFriendButton", stringId: String.id.IDS_SOCIAL_ADD_FRIEND, icon: WinJS.UI.AppBarIcon.add, onClick: this._onClickAddFriend.bind(this)
                            }, {
                                priority: MS.Entertainment.Social.ProfileAction.cancelFriend, automationId: "miniProfileCancelFriendButton", containerClassName: "cancelFriendButton", stringId: String.id.IDS_CANCEL_BUTTON, icon: WinJS.UI.AppBarIcon.cancel, onClick: this._onClickCancelFriend.bind(this)
                            }, {
                                priority: MS.Entertainment.Social.ProfileAction.acceptFriend, automationId: "miniProfileAcceptFriendButton", stringId: String.id.IDS_SOCIAL_ACCEPT_FRIEND_REQUEST, icon: WinJS.UI.AppBarIcon.accept, onClick: this._onClickAcceptFriend.bind(this)
                            }, {
                                priority: MS.Entertainment.Social.ProfileAction.declineFriend, automationId: "miniProfileDeclineFriendButton", stringId: String.id.IDS_SOCIAL_DECLINE_FRIEND_REQUEST, icon: WinJS.UI.AppBarIcon.cancel, onClick: this._onClickDeclineFriend.bind(this)
                            }, {
                                priority: MS.Entertainment.Social.ProfileAction.compareGames, automationId: "miniProfileCompareGamesButton", stringId: String.id.IDS_SOCIAL_COMPARE_GAMES, icon: MS.Entertainment.UI.Icon.gameCompare, page: "socialCompareActivitiesPage", closeOverlay: this.closeOverlay, userModel: model, userXuid: xuid
                            }, {
                                priority: MS.Entertainment.Social.ProfileAction.viewProfile, automationId: "miniProfileViewProfileButton", stringId: String.id.IDS_SOCIAL_VIEW_PROFILE, icon: MS.Entertainment.UI.Icon.profile, page: "socialProfile", closeOverlay: this.closeOverlay, userModel: model.userModel, userXuid: xuid
                            }, {
                                priority: MS.Entertainment.Social.ProfileAction.sendMessage, automationId: "miniProfileSendMessageButton", stringId: String.id.IDS_SOCIAL_SEND_MESSAGE, icon: WinJS.UI.AppBarIcon.send, onClick: function _onClickSendMessage() {
                                        MS.Entertainment.Social.SendMessage.show(this._signedInUser, {
                                            xuid: xuid, gamerTag: model.gamerTag
                                        })
                                    }.bind(this)
                            }, {
                                priority: MS.Entertainment.Social.ProfileAction.editAvatar, automationId: "miniProfileEditAvatarButton", stringId: String.id.IDS_SOCIAL_EDIT_AVATAR_BUTTON, icon: MS.Entertainment.UI.Icon.avatarItem, page: "socialAvatarEditorPage", hub: "socialAvatarEditorStylesHub", closeOverlay: this.closeOverlay, userModel: model, userXuid: xuid
                            }, {
                                priority: MS.Entertainment.Social.ProfileAction.createAvatar, automationId: "miniProfileCreateAvatarButton", stringId: String.id.IDS_AVATAR_EDITOR_CREATE, icon: WinJS.UI.AppBarIcon.add, page: "socialAvatarSelectionPage", closeOverlay: this.closeOverlay, userModel: model, userXuid: xuid
                            }, {
                                priority: MS.Entertainment.Social.ProfileAction.editProfile, automationId: "miniProfileEditProfileButton", stringId: String.id.IDS_SOCIAL_EDIT_PROFILE, icon: WinJS.UI.AppBarIcon.edit, onClick: this.onClickEditProfile.bind(this)
                            }, {
                                priority: MS.Entertainment.Social.ProfileAction.viewAchievements, automationId: "miniProfileViewAchievementsButton", stringId: String.id.IDS_DETAILS_GAME_ACHIEVEMENTS_MORE, icon: MS.Entertainment.UI.Icon.achievements, page: "socialDetails", hub: "socialAchievements", closeOverlay: this.closeOverlay, userModel: model, userXuid: xuid
                            }, {
                                priority: MS.Entertainment.Social.ProfileAction.shareProfile, automationId: "miniProfileShareProfileButton", stringId: String.id.IDS_SHARE_PROFILE, icon: WinJS.UI.AppBarIcon.postupdate, onClick: this._onClickShareProfile.bind(this)
                            }, {
                                priority: MS.Entertainment.Social.ProfileAction.removeFriend, automationId: "miniProfileRemoveFriendButton", stringId: String.id.IDS_SOCIAL_REMOVE_FRIEND, icon: WinJS.UI.AppBarIcon.remove, onClick: this._onClickRemoveFriend.bind(this)
                            }, {
                                priority: MS.Entertainment.Social.ProfileAction.changeGamertag, automationId: "miniProfileChangeGamertagButton", stringId: String.id.IDS_SOCIAL_PROFILE_CHANGE_GAMERTAG, icon: MS.Entertainment.UI.Icon.friendRemove, onClick: this._onClickChangeGamertag.bind(this)
                            }, ])
                    }, _getAugmentedModelAsync: function _getAugmentedModelAsync() {
                        if (this.model && this.model.socialDataType === MS.Entertainment.Data.Augmenter.XboxLive.SocialDataType.gamercard) {
                            var gamercard = this.model;
                            var signedInUserModel = MS.Entertainment.Social.Helpers.getSignedInUserModel();
                            function findFriend(complete, error) {
                                signedInUserModel.allFriends.forEach(function item(friendItem) {
                                    var friend = friendItem.item.data;
                                    if (friend.gamerTag.match(new RegExp("^" + gamercard.gamerTag + "$", "i"))) {
                                        friendItem.item.stop = true;
                                        complete(friend)
                                    }
                                });
                                complete(null)
                            }
                            function refreshFriendsAndFindFriend(c, e) {
                                signedInUserModel.refresh().then(function complete() {
                                    findFriend(c, e)
                                }, function error(result) {
                                    e(result)
                                })
                            }
                            if (this._signedInUser.gamerTag === gamercard.gamerTag)
                                return WinJS.Promise.wrap(signedInUserModel.profile);
                            else if (signedInUserModel.allFriends)
                                return new WinJS.Promise(findFriend);
                            else
                                return new WinJS.Promise(refreshFriendsAndFindFriend)
                        }
                        else
                            return WinJS.Promise.wrap(null)
                    }, _onAvatarRenderStateChanged: function _onAvatarRenderStateChanged(newValue) {
                        if (newValue)
                            this._enableAvatarButtons(this._isSignedInUser())
                    }, _handleModelChanged: function _handleModelChanged(newValue) {
                        if (newValue && newValue.gamerTag) {
                            this._buildAvailableActions();
                            this.showNewUserPanel = !this.model.hasAvatar && this._isSignedInUser();
                            var profileEmpty = false;
                            if (this._isSignedInUser()) {
                                if (!this.currentUserAsFriend) {
                                    this.buttons.add(MS.Entertainment.Social.ProfileAction.editProfile);
                                    this.buttons.add(MS.Entertainment.Social.ProfileAction.shareProfile);
                                    this.buttons.remove(MS.Entertainment.Social.ProfileAction.viewProfile);
                                    this.buttons.remove(MS.Entertainment.Social.ProfileAction.compareGames);
                                    profileEmpty = !this.model.motto && !this.model.location && !this.model.bio;
                                    this.showEmptyProfileLabel = profileEmpty && !this.showNewUserPanel
                                }
                                else
                                    this.buttons.add(MS.Entertainment.Social.ProfileAction.viewProfile);
                                MS.Entertainment.Utilities.Telemetry.logFirstRunState(this.showNewUserPanel, profileEmpty);
                                this._enableAvatarButtons(!this.currentUserAsFriend)
                            }
                            else {
                                this.buttons.remove(MS.Entertainment.Social.ProfileAction.viewAchievements);
                                this.buttons.remove(MS.Entertainment.Social.ProfileAction.editProfile);
                                this.buttons.remove(MS.Entertainment.Social.ProfileAction.shareProfile);
                                if (!this.profilePageView && newValue.socialDataType !== MS.Entertainment.Data.Augmenter.XboxLive.SocialDataType.gamercard)
                                    this.buttons.add(MS.Entertainment.Social.ProfileAction.viewProfile);
                                else
                                    this.buttons.remove(MS.Entertainment.Social.ProfileAction.viewProfile);
                                if (newValue.socialDataType === MS.Entertainment.Data.Augmenter.XboxLive.SocialDataType.gamercard || (this.model.status && this.model.status.relation && this.model.status.relation !== MS.Entertainment.Data.Augmenter.XboxLive.UserRelation.userRelationMutualFriend && !this._signedInUser.isGold())) {
                                    this.buttons.remove(MS.Entertainment.Social.ProfileAction.compareGames);
                                    this.buttons.remove(MS.Entertainment.Social.ProfileAction.sendMessage)
                                }
                                else {
                                    this.buttons.add(MS.Entertainment.Social.ProfileAction.compareGames);
                                    this.buttons.add(MS.Entertainment.Social.ProfileAction.sendMessage)
                                }
                                this._enableAvatarButtons(false)
                            }
                            this._updateFriendButtonStates();
                            WinJS.Promise.timeout().then(this._doneLoading.bind(this))
                        }
                        else
                            this.buttons.clear()
                    }, _doneLoading: function _doneLoading() {
                        MS.Entertainment.Utilities.hideElement(this.loadingContainer);
                        MS.Entertainment.Utilities.showElement(this.headerContainer.domElement);
                        MS.Entertainment.Utilities.showElement(this.bodyContainer)
                    }, _isSignedInUser: function _isSignedInUser() {
                        if (!this._isSignedInUserCachedValue)
                            this._isSignedInUserCachedValue = this.model && this._signedInUser && this.model.gamerTag === this._signedInUser.gamerTag;
                        return this._isSignedInUserCachedValue
                    }, _handleSignedInUserFriendsChanged: function _handleSignedInUserFriendsChanged() {
                        this._getAugmentedModelAsync().done(function complete(model) {
                            if (model !== null)
                                this.model = model;
                            else
                                this._updateFriendButtonStates()
                        }.bind(this))
                    }, _updateFriendButtonStates: function _updateFriendButtonStates() {
                        this.showIncomingFriendLabel = false;
                        var model = this.model;
                        if (model.gamerTag && !this._isSignedInUser())
                            if (this.friendRelationLookupType === MS.Entertainment.Social.friendRelationLookupType.profileLookup && model.status)
                                this._setFriendButtonsFromRelation(model.status.relation);
                            else
                                this._setFriendButtonsFromFriendsList()
                    }, _setFriendButtonsFromRelation: function _setFriendButtonsFromRelation(relation) {
                        this.buttons.remove(MS.Entertainment.Social.ProfileAction.addFriend);
                        switch (relation) {
                            case Microsoft.Xbox.UserRelation.mutualFriend:
                                this.buttons.add(MS.Entertainment.Social.ProfileAction.removeFriend);
                                this.buttons.remove(MS.Entertainment.Social.ProfileAction.acceptFriend);
                                this.buttons.remove(MS.Entertainment.Social.ProfileAction.declineFriend);
                                this.buttons.remove(MS.Entertainment.Social.ProfileAction.cancelFriend);
                                this.showIncomingFriendLabel = false;
                                break;
                            case Microsoft.Xbox.UserRelation.friendRequester:
                                this.buttons.remove(MS.Entertainment.Social.ProfileAction.removeFriend);
                                this.buttons.add(MS.Entertainment.Social.ProfileAction.acceptFriend);
                                this.buttons.add(MS.Entertainment.Social.ProfileAction.declineFriend);
                                this.buttons.remove(MS.Entertainment.Social.ProfileAction.cancelFriend);
                                this.showIncomingFriendLabel = true;
                                break;
                            case Microsoft.Xbox.UserRelation.friendRequestee:
                                this.buttons.remove(MS.Entertainment.Social.ProfileAction.removeFriend);
                                this.buttons.remove(MS.Entertainment.Social.ProfileAction.acceptFriend);
                                this.buttons.remove(MS.Entertainment.Social.ProfileAction.declineFriend);
                                this.buttons.add(MS.Entertainment.Social.ProfileAction.cancelFriend);
                                this.showIncomingFriendLabel = false;
                                break
                        }
                        if (this.showIncomingFriendLabel && this.incomingFriendLabel)
                            this.incomingFriendLabel.textContent = String.load(String.id.IDS_SOCIAL_FRIEND_REQUEST_INCOMING_SUBTITLE).format(this.model.gamerTag)
                    }, _setFriendButtonsFromFriendsList: function _setFriendButtonsFromFriendsList() {
                        var isFriend = false;
                        if (!this._isSignedInUser()) {
                            var signedInUserModel = MS.Entertainment.Social.Helpers.getSignedInUserModel();
                            var model = this.model;
                            if (signedInUserModel.allFriends)
                                signedInUserModel.allFriends.forEach(function item(friendItem) {
                                    var friend = friendItem.item.data;
                                    if (friend.gamerTag === model.gamerTag) {
                                        isFriend = true;
                                        friendItem.item.stop = true;
                                        this._setFriendButtonsFromRelation(friend.status.relation)
                                    }
                                }.bind(this))
                        }
                        if (!isFriend)
                            this.buttons.add(MS.Entertainment.Social.ProfileAction.addFriend);
                        else
                            this.buttons.remove(MS.Entertainment.Social.ProfileAction.addFriend)
                    }, _onClickAddFriend: function _onClickAddFriend() {
                        this._doFriendAction(MS.Entertainment.Social.friendActionType.add)
                    }, _onClickAcceptFriend: function _onClickAcceptFriend() {
                        this._doFriendAction(MS.Entertainment.Social.friendActionType.accept)
                    }, _onClickDeclineFriend: function _onClickDeclineFriend() {
                        this._doFriendAction(MS.Entertainment.Social.friendActionType.decline)
                    }, _onClickCancelFriend: function _onClickCancelFriend() {
                        this._doFriendAction(MS.Entertainment.Social.friendActionType.cancel)
                    }, _onClickRemoveFriend: function _onClickRemoveFriend() {
                        MS.Entertainment.UI.Shell.showMessageBox(String.load(String.id.IDS_SOCIAL_REMOVE_FRIEND_DIALOG_TITLE), String.load(String.id.IDS_SOCIAL_REMOVE_FRIEND_DIALOG_TEXT).format(this.model.gamerTag), {buttons: [{
                                    title: String.load(String.id.IDS_SOCIAL_REMOVE_FRIEND_DIALOG_REMOVE), execute: function onClickRemove(overlay) {
                                            this._doFriendAction(MS.Entertainment.Social.friendActionType.remove, overlay)
                                        }.bind(this)
                                }, {
                                    title: String.load(String.id.IDS_CANCEL_BUTTON), execute: function onRemove(overlay) {
                                            overlay.hide()
                                        }.bind(this)
                                }]})
                    }, _doFriendAction: function(friendActionType, dialogOverlay) {
                        var signedInUserModel = MS.Entertainment.Social.Helpers.getSignedInUserModel();
                        var nativeUserModel = this._nativeUserModel = signedInUserModel.userModel.nativeUserModel[0];
                        if (nativeUserModel) {
                            var friendOperation = null;
                            var addingFriend = false;
                            switch (friendActionType) {
                                case MS.Entertainment.Social.friendActionType.add:
                                case MS.Entertainment.Social.friendActionType.accept:
                                    friendOperation = nativeUserModel.addFriendAsync(this.model.gamerTag);
                                    addingFriend = true;
                                    break;
                                case MS.Entertainment.Social.friendActionType.remove:
                                case MS.Entertainment.Social.friendActionType.decline:
                                case MS.Entertainment.Social.friendActionType.cancel:
                                    friendOperation = nativeUserModel.removeFriendAsync(this.model.gamerTag);
                                    break
                            }
                            friendOperation.done(function complete() {
                                if (dialogOverlay)
                                    dialogOverlay.hide();
                                if (this.closeOverlay)
                                    this.closeOverlay();
                                else if (!addingFriend)
                                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigateBack();
                                var userModel = MS.Entertainment.Social.Helpers.getSignedInUserModel();
                                userModel.refresh(true).done()
                            }.bind(this), function error(err) {
                                if (dialogOverlay)
                                    dialogOverlay.hide();
                                var errorText = String.empty;
                                if (addingFriend && err.number === MS.Entertainment.Data.XboxLive.ErrorCodes.httpForbidden)
                                    errorText = String.load(String.id.IDS_SOCIAL_ERROR_FRIENDS_FULL_INCOMING);
                                else
                                    switch (friendActionType) {
                                        case MS.Entertainment.Social.friendActionType.add:
                                            errorText = String.load(String.id.IDS_SOCIAL_ERROR_ADD_FRIEND_FAILED);
                                            break;
                                        case MS.Entertainment.Social.friendActionType.accept:
                                            errorText = String.load(String.id.IDS_SOCIAL_ERROR_ACCEPT_FRIEND_FAILED);
                                            break;
                                        case MS.Entertainment.Social.friendActionType.remove:
                                            errorText = String.load(String.id.IDS_SOCIAL_ERROR_REMOVE_FRIEND_FAILED);
                                            break;
                                        case MS.Entertainment.Social.friendActionType.decline:
                                        case MS.Entertainment.Social.friendActionType.cancel:
                                            errorText = String.load(String.id.IDS_SOCIAL_ERROR_DECLINE_FRIEND_FAILED);
                                            break
                                    }
                                MS.Entertainment.UI.Shell.showMessageBox(this.model.gamerTag, errorText, {
                                    buttons: [{
                                            title: String.load(String.id.IDS_OK_BUTTON), execute: function onClickOk(overlay) {
                                                    overlay.hide()
                                                }.bind(this)
                                        }], defaultButtonIndex: 0
                                })
                            }.bind(this))
                        }
                    }, _enableAvatarButtons: function _enableAvatarButtons(enable) {
                        var uiState = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                        var enableAvatarButtons = enable && this.model && uiState.isAvatarRenderingUsingD3D;
                        if (enableAvatarButtons)
                            if (this.model.hasAvatar) {
                                this.buttons.add(MS.Entertainment.Social.ProfileAction.editAvatar);
                                this.buttons.add(MS.Entertainment.Social.ProfileAction.viewAchievements);
                                this.buttons.remove(MS.Entertainment.Social.ProfileAction.createAvatar);
                                this.buttons.remove(MS.Entertainment.Social.ProfileAction.changeGamertag)
                            }
                            else {
                                this.buttons.add(MS.Entertainment.Social.ProfileAction.createAvatar);
                                this.buttons.add(MS.Entertainment.Social.ProfileAction.changeGamertag)
                            }
                        else {
                            this.buttons.remove(MS.Entertainment.Social.ProfileAction.editAvatar);
                            this.buttons.remove(MS.Entertainment.Social.ProfileAction.createAvatar);
                            this.buttons.remove(MS.Entertainment.Social.ProfileAction.changeGamertag)
                        }
                    }, onClickEditProfile: function onClickEditProfile(sheetModel) {
                        var that = this;
                        if (this._inEditingProfile)
                            return;
                        this._inEditingProfile = true;
                        var userModel = MS.Entertainment.Social.Helpers.createUserModel();
                        if (userModel) {
                            this._nativeUserModel = userModel.nativeUserModel[0];
                            if (this._nativeUserModel)
                                this._nativeUserModel.getProfileAsync().then(function success(profile) {
                                    MS.Entertainment.UI.Shell.showDialog(String.load(String.id.IDS_SOCIAL_EDIT_PROFILE), "MS.Entertainment.Social.editProfileDialog", {
                                        userControlOptions: {
                                            userModel: that._signedInUser, profile: {nativeProfile: profile}
                                        }, buttons: []
                                    }).then(function dialogComplete(result) {
                                        that._updateProfile()
                                    })
                                }, function error(q) {
                                    MS.Entertainment.UI.Shell.showMessageBox(String.load(String.id.IDS_SOCIAL_EDIT_PROFILE), String.load(String.id.IDS_SOCIAL_ERROR));
                                    that._inEditingProfile = false
                                })
                        }
                    }, _updateProfile: function _updateProfile() {
                        var that = this;
                        if (!this._profileQuery)
                            this._profileQuery = new MS.Entertainment.Data.Query.profileQuery;
                        this._queryWatcher.registerQuery(this._profileQuery);
                        this._profileQuery.userModel = this._signedInUser;
                        this._profileQuery.execute().then(function success(q) {
                            that.model = q.result;
                            that.model.userModel = that._signedInUser;
                            that._inEditingProfile = false
                        }, function error(error) {
                            that._inEditingProfile = false;
                            return WinJS.Promise.wrapError(error)
                        })
                    }, _onClickShareProfile: function _onClickShareProfile() {
                        try {
                            Windows.ApplicationModel.DataTransfer.DataTransferManager.showShareUI()
                        }
                        catch(e) {}
                    }, _onClickChangeGamertag: function _onClickChangeGamertag() {
                        var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                        var navigateAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.externalNavigate);
                        navigateAction.parameter = MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_AuthTransfer) + "/ChangeGamerTag";
                        {};
                        navigateAction.execute()
                    }, execute: function execute(event) {
                        var control = this;
                        var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                        var samePage = navigationService.currentPage.iaNode.moniker !== control.actionParam.page;
                        var sameUser = false;
                        if (navigationService.currentPage.options && control.actionParam.args)
                            sameUser = MS.Entertainment.Social.Helpers.getXuidFromUserModel(navigationService.currentPage.options.userModel) === MS.Entertainment.Social.Helpers.getXuidFromUserModel(control.actionParam.args.userModel);
                        if (!(sameUser && samePage)) {
                            switch (control.actionParam.page) {
                                case MS.Entertainment.UI.Monikers.socialDetails:
                                    MS.Entertainment.Instrumentation.PerfTrack.setStartTime(MS.Entertainment.Instrumentation.PerfTrack.StartPoints.AchievementsRequest);
                                    break;
                                case MS.Entertainment.UI.Monikers.socialAvatarEditorPage:
                                    MS.Entertainment.Instrumentation.PerfTrack.setStartTime(MS.Entertainment.Instrumentation.PerfTrack.StartPoints.UpdateAvatarRequest);
                                    break;
                                case MS.Entertainment.UI.Monikers.socialCompareActivitiesPage:
                                    MS.Entertainment.Instrumentation.PerfTrack.setStartTime(MS.Entertainment.Instrumentation.PerfTrack.StartPoints.CompareGamesRequest);
                                    break
                            }
                            var doNav = function doNav() {
                                    navigationService.navigateTo(control.actionParam.page, control.actionParam.hub, null, control.actionParam.args, true)
                                };
                            if (control.closeOverlay)
                                control.closeOverlay(doNav);
                            else
                                doNav()
                        }
                        else if (control.closeOverlay)
                            control.closeOverlay()
                    }, _onNetworkStatusChanged: function _onNetworkStatusChanged(newValue) {
                        var isOnline = this._isNetworkStatusCodeOnline(newValue);
                        if (isOnline !== this.isOnline)
                            this.isOnline = isOnline
                    }, _isNetworkStatusCodeOnline: function _isNetworkStatusCodeOnline(status) {
                        var isOnline = false;
                        switch (status) {
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.unknown:
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.unrestricted:
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.throttled:
                                isOnline = true;
                                break;
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.onDemand:
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.localOnly:
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.none:
                                isOnline = false;
                                break
                        }
                        return isOnline
                    }
            }, {
                model: null, isOnline: false, showIncomingFriendLabel: false, showEmptyProfileLabel: false, buttons: null, showNewUserPanel: false
            }), GamercardPopOver: MS.Entertainment.UI.Framework.defineUserControl("Components/Social/miniProfile.html#gamercardPopOverTemplate", function gamercardPopOverConstructor() {
                this._keyboardNavigationManager = new MS.Entertainment.Framework.KeyboardNavigationManager(this.domElement)
            }, {_keyboardNavigationManager: null}, {
                model: null, closeOverlay: null, currentUserAsFriend: false, friendRelationLookupType: MS.Entertainment.Social.friendRelationLookupType.friendsLookup
            }), ProfilePopOver: MS.Entertainment.UI.Framework.defineUserControl("Components/Social/miniProfile.html#profilePopOverTemplate", function profilePopOverConstructor() {
                this._keyboardNavigationManager = new MS.Entertainment.Framework.KeyboardNavigationManager(this.domElement)
            }, {_keyboardNavigationManager: null}, {
                model: null, closeOverlay: null, currentUserAsFriend: false, friendRelationLookupType: MS.Entertainment.Social.friendRelationLookupType.none
            })
    });
    WinJS.Namespace.define("MS.Entertainment.Social", {GamerInfoHeader: MS.Entertainment.UI.Framework.defineUserControl("Components/Social/miniProfile.html#gamerInfoHeaderTemplate", function gamerInfoHeader(element, options){}, {
            _bindings: null, gamerScoreLabel: null, initialize: function initialize() {
                    this._bindings = WinJS.Binding.bind(this, {model: this._updateNarratorText.bind(this)})
                }, _updateNarratorText: function _updateNarratorText() {
                    if (this.gamerScoreLabel)
                        this.gamerScoreLabel.textContent = String.load(String.id.IDS_SOCIAL_GAMERSCORE_NAR).format(this.model.gamerScore)
                }, unload: function unload() {
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this);
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null
                    }
                }
        }, {model: null})});
    WinJS.Namespace.define("MS.Entertainment.Social", {MiniProfileActionImage: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.Social.MiniProfileImage, null, function miniProfileActionImage(element, options){}, {
            action: null, actionParam: null, animateHubOnClick: true, controlName: "MiniProfileActionImage", _events: null, initialize: function initialize() {
                    MS.Entertainment.Social.MiniProfileImage.prototype.initialize.apply(this, arguments);
                    this.action.parameter = this.actionParam || this.action.parameter;
                    this._events = MS.Entertainment.Utilities.addEvents(this.domElement, {click: this._onClick.bind(this)})
                }, unload: function unload() {
                    MS.Entertainment.Social.MiniProfileImage.prototype.unload.call(this);
                    if (this._events) {
                        this._events.cancel();
                        this._events = null
                    }
                }, _onClick: function _onClick(event) {
                    var canExecute = false;
                    if (this.action) {
                        this.action.requeryCanExecute();
                        canExecute = this.action.isEnabled
                    }
                    if (canExecute) {
                        if (this.animateHubOnClick) {
                            var panelContentContainer = MS.Entertainment.Utilities.findParentElementByClassName(this.domElement, MS.Entertainment.Animations.HubStrip.panelContainerClass);
                            MS.Entertainment.Animations.HubStrip.setupDeclarativeAnimsHubStripPanels(panelContentContainer)
                        }
                        this.action.execute();
                        event.stopPropagation()
                    }
                    return canExecute
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.UI.Actions", {ShareAction: MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function shareAction() {
            this.base()
        }, {
            executed: function executed(param) {
                try {
                    Windows.ApplicationModel.DataTransfer.DataTransferManager.showShareUI()
                }
                catch(e) {}
            }, canExecute: function canExecute(param) {
                    return true
                }
        })});
    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).register(MS.Entertainment.UI.Actions.ActionIdentifiers.share, function() {
        return new MS.Entertainment.UI.Actions.ShareAction
    })
})()
