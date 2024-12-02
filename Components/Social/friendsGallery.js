/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Controls/hub.js", "/Controls/failedPanel.js", "/Framework/corefx.js", "/Framework/data/augmenters/xboxLiveAugmenters.js", "/ViewModels/Social/social.js", "/ViewModels/Social/profileHydrator.js", "/Controls/Overlay.js", "/Components/Social/miniProfile.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Social");
(function(undefined) {
    WinJS.Namespace.define("MS.Entertainment.Social", {friendGalleryType: {
            mutual: "mutual", pending: "pending"
        }});
    WinJS.Namespace.define("MS.Entertainment.Social", {FriendsGallery: MS.Entertainment.UI.Framework.defineUserControl("Components/Social/friendsGallery.html#friendsGalleryTemplate", function friendsGallery(element, options) {
            var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
            this.maxPlayCount = configurationManager.social.animatedFriendsCount;
            this._playingAvatars = [];
            this._pausedAvatars = [];
            this.friendsDataSource = new MS.Entertainment.ObservableArray;
            document.body.addEventListener("HubStripLoaded", this._onHubStripLoaded.bind(this), true)
        }, {
            _modelBindings: null, _model: null, _disposeModel: true, _signedInUser: null, _hidden: true, _popupContainer: null, _playingAvatars: null, _pausedAvatars: null, _viewPortScrollHandler: null, _viewPortScrollingTimer: null, _keyboardNavigationManager: null, _itemInvokedHandler: null, _controlInitHandler: null, _initializedCount: 0, _scrollOutTimeout: 500, _scrollInTimeout: 50, _selectionAnimationTimeout: 1000, _pausing: false, _readyInvoked: false, _avatarSelected: false, _lastClicked: -1, _itemsCount: 0, _friendsCount: 0, _firstItemReady: false, _pendingFriends: null, _loadingPaused: false, _loadAheadCount: 1, _networkStatusBinding: null, _isOnline: null, _uiState: null, _stateBindings: null, _rtlPanelOffset: 400, _rtlAvatarOffset: 100, _chunkSize: 3, _friendButton: null, _pendingFriendsHub: null, _unloaded: false, _minAvatarLoads: 5, maxFriends: -1, userXuid: null, userModel: null, hub: null, maxPlayCount: 2, detailPanelWidth: -1, detailPanelEdgePadding: -1, poppedAvatarClass: "poppedOverAvatarPosition", popOverClass: "profilePopOverOverlay", scrollHubStrip: false, currentUserAsFriend: false, friendGalleryType: MS.Entertainment.Social.friendGalleryType.mutual, friendButtonType: MS.Entertainment.Social.friendButtonType.none, friendButtonTemplate: null, inDashboard: false, navigating: null, initialize: function initialize() {
                    var signedInUserModel = MS.Entertainment.Social.Helpers.getSignedInUserModel();
                    if (this.userModel && !this.userModel.isGamerTag) {
                        this._model = new MS.Entertainment.Social.ProfileHydrator;
                        if (!this.userModel.userModel && this.userModel.identity)
                            this.userModel.userModel = MS.Entertainment.Social.Helpers.createUserModel(this.userModel.identity.xuid, this.userModel.gamerTag);
                        this._model.userModel = this.userModel;
                        this._model.loadAchievements = false;
                        this._model.loadActivity = false;
                        this._disposeModel = true
                    }
                    else {
                        this._model = signedInUserModel;
                        this._disposeModel = false
                    }
                    this._itemInvokedHandler = this._handleSelectedIndexChanged.bind(this);
                    this._controlInitHandler = this._userControlInitialized.bind(this);
                    this._model.loadFriends = true;
                    this._model.enabled = true;
                    this._signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                    this._signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                    var addModelBindings = function addModelBinding() {
                            if (this._unloaded)
                                return;
                            this._modelBindings = WinJS.Binding.bind(this._model, {
                                status: this._handleModelStatus.bind(this), friends: this._handleMutualFriendsChanged.bind(this), pendingFriends: this._handlePendingFriendsChanged.bind(this), incomingFriends: this._handleIncomingFriendsChanged.bind(this), profile: this._handleProfileChanged.bind(this)
                            })
                        }.bind(this);
                    if (this._signIn.isSignedIn)
                        this._model.refresh().done(addModelBindings);
                    else
                        addModelBindings();
                    this._uiState = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                    this._networkStatusBinding = WinJS.Binding.bind(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState), {networkStatus: this._onNetworkStatusChanged.bind(this)});
                    this._stateBindings = WinJS.Binding.bind(this._uiState, {lowEndSystemAvatarMode: this._handleLowEndSystem.bind(this)});
                    this._getViewPort().addEventListener("UserControlInitialized", this._controlInitHandler);
                    this._keyboardNavigationManager = new MS.Entertainment.Framework.KeyboardNavigationManager(this.itemList);
                    this.showFindFriendsButton = this.friendButtonType === MS.Entertainment.Social.friendButtonType.findFriendsButton;
                    if (!MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn).isSignedIn)
                        this._handleModelStatus(MS.Entertainment.Social.LoadStatus.offline);
                    if (this.inDashboard)
                        this._raisePanelReadyOnce(false)
                }, unload: function unload() {
                    this._unloaded = true;
                    if (this._viewPortScrollingTimer) {
                        this._viewPortScrollingTimer.cancel();
                        this._viewPortScrollingTimer = null
                    }
                    if (this._modelBindings) {
                        this._modelBindings.cancel();
                        this._modelBindings = null
                    }
                    if (this._stateBindings) {
                        this._stateBindings.cancel();
                        this._stateBindings = null
                    }
                    if (this._networkStatusBinding) {
                        this._networkStatusBinding.cancel();
                        this._networkStatusBinding = null
                    }
                    if (this._itemInvokedHandler)
                        this._itemInvokedHandler = null;
                    if (this._pendingFriendsHub)
                        this._pendingFriendsHub = null;
                    this._playingAvatars = null;
                    this._pausedAvatars = null;
                    this._pendingFriends = null;
                    this._keyboardNavigationManager = null;
                    this.friendsDataSource = null;
                    this._removeViewPortEvents();
                    this._getViewPort().removeEventListener("UserControlInitialized", this._controlInitHandler);
                    this.hub = null;
                    this._tryRemoveFriendButton();
                    if (this._disposeModel) {
                        this._model.dispose();
                        this._model = null
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, freeze: function freeze() {
                    this._loadingPaused = true;
                    this._pauseAvatars();
                    this._hidden = true;
                    MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this)
                }, thaw: function thaw() {
                    MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                    this._hidden = false;
                    this._loadingPaused = false;
                    this._continueLoading();
                    if (this._firstItemReady) {
                        this._calculateViewPortSize();
                        this._playVisibleAvatars()
                    }
                }, refresh: function refresh() {
                    return this._model.refresh()
                }, _handleLowEndSystem: function _handleLowEndSystem(value) {
                    if (value)
                        this._pauseAvatars(true)
                }, _continueLoading: function _continueLoading(skipPlay) {
                    if (!this._loadingPaused) {
                        if (this._pendingFriends && this._pendingFriends.length) {
                            var upperLimit = this.domElement.scrollLeft + this._panelWidth + (this._itemWidth * this._loadAheadCount);
                            var current = (this.friendsDataSource.length + 1) * this._itemWidth;
                            if (!this._firstItemReady || upperLimit >= current) {
                                var count = Math.min(this._chunkSize, this._pendingFriends.length);
                                for (var x = 0; x < count; x++)
                                    WinJS.Binding.unwrap(this.friendsDataSource).push(this._pendingFriends[x]);
                                this._pendingFriends = this._pendingFriends.slice(count);
                                return
                            }
                            else {
                                if (!this._viewPortScrollingTimer && !skipPlay)
                                    WinJS.Promise.timeout().then(this._playVisibleAvatars.bind(this));
                                this._loadingPaused = true
                            }
                        }
                        else {
                            if (!this._viewPortScrollingTimer && !skipPlay)
                                WinJS.Promise.timeout().then(this._playVisibleAvatars.bind(this));
                            this._pendingFriends = null
                        }
                        MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioFriendsRequestToLoad()
                    }
                }, _getViewPort: function _getViewPort() {
                    return this.itemList.domElement
                }, _userControlInitialized: function userControlInitialized(event) {
                    if (event.userControl instanceof MS.Entertainment.Social.MiniProfileAvatar) {
                        this._initializedCount++;
                        var element = event.userControl.domElement;
                        WinJS.Utilities.removeClass(element.parentElement, "avatarLoading");
                        if (!this._firstItemReady) {
                            this._firstItemReady = true;
                            this._itemWidth = element.clientWidth;
                            this._calculateViewPortSize();
                            this._initializeViewPortEvents();
                            if (!this.inDashboard)
                                this._raisePanelReadyOnce(false);
                            this._hidden = false
                        }
                        element.tabIndex = "0";
                        element.addEventListener("click", this._itemInvokedHandler, false);
                        element.addEventListener("keydown", this._itemInvokedHandler, false);
                        if (element.offsetLeft + this._itemWidth > this.domElement.scrollLeft && (this._initializedCount === this._itemsPerScreen || this._initializedCount === this._friendsCount || this._initializedCount === this._maxFriends))
                            this._playVisibleAvatars();
                        this._continueLoading(true)
                    }
                }, _updateFriendButton: function _updateFriendButton() {
                    if (this.friendButtonType === MS.Entertainment.Social.friendButtonType.findFriendsButton)
                        this._tryInsertFriendButton()
                }, _tryInsertFriendButton: function _tryInsertFriendButton() {
                    MS.Entertainment.Social.assert(this.friendButtonTemplate !== null, "Missing button template");
                    if (!this._friendButton)
                        MS.Entertainment.UI.Framework.loadTemplate(this.friendButtonTemplate, null, true).then(function templateLoaded(control) {
                            var container = document.createElement(control.element.tagName);
                            if (this.itemList.domElement.firstChild)
                                this.itemList.domElement.insertBefore(container, this.itemList.domElement.firstChild);
                            else
                                this.itemList.domElement.appendChild(container);
                            this._friendButton = this.itemList.domElement.firstChild;
                            control.render(null, container)
                        }.bind(this))
                }, _tryRemoveFriendButton: function _tryRemoveFriendButton() {
                    if (this._friendButton) {
                        if (this.itemList.domElement.children.length)
                            this.itemList.domElement.removeChild(this._friendButton);
                        this._friendButton = null
                    }
                }, _onHubStripLoaded: function _onHubStripLoaded(event) {
                    var hubStrip = event.srcElement.winControl;
                    var hubs = hubStrip.hubs;
                    if (hubs)
                        hubs.forEach(function forEach(hub) {
                            if (hub.moniker === MS.Entertainment.UI.Monikers.socialPendingFriendsHub)
                                this._pendingFriendsHub = hub
                        }.bind(this))
                }, _initializeViewPortEvents: function _initializeViewPortEvents() {
                    if (!this._viewPortScrollHandler) {
                        this._viewPortScrollHandler = this._handleViewPortScroll.bind(this);
                        this.domElement.addEventListener("scroll", this._viewPortScrollHandler, false)
                    }
                }, _removeViewPortEvents: function _removeViewPortEvents() {
                    if (this._viewPortScrollHandler) {
                        this.domElement.removeEventListener("scroll", this._viewPortScrollHandler, false);
                        this._viewPortScrollHandler = null
                    }
                }, _calculateViewPortSize: function _calculateViewPortSize() {
                    this._panelWidth = window.screen.width;
                    this._itemsPerScreen = Math.ceil(this._panelWidth / this._itemWidth);
                    this._getViewPort().style.width = this._itemWidth * this._itemsCount + "px";
                    var rendererFactory = new Microsoft.Entertainment.Avatar.AvatarRendererFactory;
                    rendererFactory.setMaxConcurrentAvatarLoads(Math.max(this._itemsPerScreen + 1, this._minAvatarLoads) || this._minAvatarLoads)
                }, _handleSelectedIndexChanged: function _handleSelectedIndexChanged(event) {
                    if (this._unloaded)
                        return;
                    var that = this;
                    if (!this._avatarSelected && !this._viewPortScrollingTimer && this._isOnline && this._playingAvatars && (event.type === "click" || (event.type === "keydown" && event.keyCode === WinJS.Utilities.Key.enter))) {
                        var focusedElement = document.activeElement;
                        this._pauseVisibleAvatars();
                        this._loadingPaused = true;
                        this._avatarSelected = true;
                        var newValue = -1;
                        var list = this._getViewPort().children;
                        for (var i = 0; i < list.length; i++)
                            if (list[i] === event.currentTarget.parentElement) {
                                newValue = i;
                                break
                            }
                        var control = this._getAvatarControlAtIndex(newValue);
                        var element = control.domElement;
                        var adjustedIndex = newValue - (this._hasFriendButton() ? 1 : 0);
                        var model = WinJS.Binding.unwrap(this.friendsDataSource).item(adjustedIndex);
                        var friendRelationLookupType = this._model.isSignedInUser ? MS.Entertainment.Social.friendRelationLookupType.profileLookup : MS.Entertainment.Social.friendRelationLookupType.friendsLookup;
                        var scrollArea = null;
                        if (this.scrollHubStrip) {
                            var panelContentContainer = MS.Entertainment.Utilities.findParentElementByClassName(this.domElement, "dashboardContent");
                            if (panelContentContainer)
                                scrollArea = panelContentContainer;
                            else
                                scrollArea = MS.Entertainment.Utilities.findParentElementByClassName(this.domElement, "hubStripScroller")
                        }
                        else
                            scrollArea = this.domElement;
                        scrollArea.style.overflow = "hidden";
                        var rtl = MS.Entertainment.Utilities.getTextDirection() === MS.Entertainment.Utilities.TextDirections.RightToLeft;
                        var box = element.getBoundingClientRect();
                        var edge = box.left + scrollArea.scrollLeft - (rtl ? this._rtlPanelOffset : 0);
                        var screen = scrollArea.scrollLeft;
                        var width = scrollArea.clientWidth;
                        var delta = (edge + this.detailPanelWidth) - (screen + width);
                        var overlayLeft = 0;
                        var previousScrollPosition = 0;
                        var previousContainerWidth = this.domElement.clientWidth;
                        if (rtl)
                            if (delta > 0) {
                                var adjust = delta + this.detailPanelEdgePadding * 2;
                                scrollArea.scrollLeft -= adjust;
                                overlayLeft = edge - screen - adjust + "px"
                            }
                            else {
                                var adjust = -(delta) - this.detailPanelWidth + (this.detailPanelEdgePadding * 4);
                                var scrollValue = scrollArea.scrollLeft + adjust;
                                var scrollSize = scrollValue - (scrollArea.scrollWidth - width);
                                overlayLeft = (edge - (screen + delta) - this.detailPanelEdgePadding - this._rtlAvatarOffset - this._rtlPanelOffset) + "px";
                                if (scrollSize > 0) {
                                    var sizeDelta = scrollSize - delta + (this.detailPanelEdgePadding * 4);
                                    var adjustedGalleryWidth = (this._itemWidth * this._itemsCount) + sizeDelta;
                                    this._getViewPort().style.width = adjustedGalleryWidth + "px";
                                    if (this.maxFriends !== -1)
                                        this.domElement.style.width = adjustedGalleryWidth + "px";
                                    previousScrollPosition = scrollArea.scrollLeft;
                                    scrollArea.scrollLeft = scrollValue
                                }
                                else {
                                    adjust = -(delta) - this.detailPanelWidth + (this.detailPanelEdgePadding * 2);
                                    if (adjust > 0) {
                                        scrollArea.scrollLeft += adjust;
                                        overlayLeft = edge - screen + adjust + this.detailPanelEdgePadding + "px"
                                    }
                                    else
                                        overlayLeft = edge - screen + this.detailPanelEdgePadding + "px"
                                }
                            }
                        else if (delta > 0) {
                            var scrollValue = scrollArea.scrollLeft + (delta + (this.detailPanelEdgePadding * 2));
                            var scrollSize = scrollValue - (scrollArea.scrollWidth - width);
                            overlayLeft = (edge - (screen + delta) - (this.detailPanelEdgePadding * 2)) + "px";
                            if (scrollSize > 0) {
                                var sizeDelta = scrollSize + delta + (this.detailPanelEdgePadding * 2);
                                var adjustedGalleryWidth = (this._itemWidth * this._itemsCount) + sizeDelta;
                                this._getViewPort().style.width = adjustedGalleryWidth + "px";
                                if (this.maxFriends !== -1)
                                    this.domElement.style.width = adjustedGalleryWidth + "px";
                                previousScrollPosition = scrollArea.scrollLeft
                            }
                            scrollArea.scrollLeft = scrollValue
                        }
                        else if ((edge - screen) < this.detailPanelEdgePadding) {
                            overlayLeft = this.detailPanelEdgePadding + "px";
                            scrollArea.scrollLeft -= screen - edge + this.detailPanelEdgePadding
                        }
                        else
                            overlayLeft = edge - screen + "px";
                        var overlay = MS.Entertainment.UI.Shell.createOverlay("MS.Entertainment.Social.ProfilePopOver", {
                                hub: this.hub, data: model, currentUserAsFriend: this.currentUserAsFriend, friendRelationLookupType: friendRelationLookupType, closeOverlay: WinJS.Utilities.markSupportedForProcessing(function hide(nav) {
                                        this.navigating = nav;
                                        overlay.hide()
                                    }.bind(this))
                            }, {
                                left: overlayLeft, right: null, top: null, autoSetFocus: true, excludeEndpointElements: true, customStyle: this.popOverClass
                            });
                        overlay.domElement.addEventListener("keydown", function onKeyDown(e) {
                            if (e.keyCode !== WinJS.Utilities.Key.escape)
                                return;
                            e.preventDefault();
                            overlay.hide()
                        });
                        WinJS.Promise.timeout(this._scrollOutTimeout).then(function afterScroll() {
                            WinJS.Utilities.addClass(control.chatBubble, "hideFromDisplay");
                            control.showBubble = false;
                            var previousParent = element.parentElement;
                            box = element.getBoundingClientRect();
                            element.winControl.suppressUnload = true;
                            document.body.appendChild(element);
                            element.winControl.suppressUnload = false;
                            WinJS.Utilities.addClass(element, this.poppedAvatarClass);
                            element.tabIndex = -1;
                            element.style.left = box.left + (rtl ? this._rtlAvatarOffset : 0) + "px";
                            element.style.position = "absolute";
                            if (control.avatarControl.renderMode === MS.Entertainment.UI.Controls.avatarRenderMode.pause) {
                                control.avatarControl.alwaysAnimate = true;
                                control.play()
                            }
                            control.selected = true;
                            element.removeEventListener("click", this._itemInvokedHandler, false);
                            MS.Entertainment.Instrumentation.PerfTrack.setStartTime(MS.Entertainment.Instrumentation.PerfTrack.StartPoints.PopoverRequest);
                            overlay.show().then(function panelClosed() {
                                scrollArea.style.overflow = "";
                                this._avatarSelected = false;
                                element.winControl.suppressUnload = true;
                                previousParent.appendChild(element);
                                element.winControl.suppressUnload = false;
                                WinJS.Utilities.removeClass(element, this.poppedAvatarClass);
                                element.style.position = "";
                                element.tabIndex = 0;
                                if (previousScrollPosition) {
                                    scrollArea.scrollLeft = previousScrollPosition;
                                    previousScrollPosition = 0
                                }
                                control.selected = false;
                                WinJS.Promise.timeout(this._selectionAnimationTimeout).then(function() {
                                    this._getViewPort().style.width = this._itemWidth * this._itemsCount + "px";
                                    this.domElement.style.width = previousContainerWidth + "px";
                                    this._loadingPaused = false;
                                    this._continueLoading();
                                    control.showBubble = true;
                                    if (focusedElement)
                                        MS.Entertainment.UI.Framework.focusFirstFocusableAncestor(focusedElement);
                                    if (this._uiState.lowEndSystemAvatarMode) {
                                        control.pause();
                                        control.avatarControl.alwaysAnimate = false
                                    }
                                    else
                                        this._playVisibleAvatars();
                                    element.addEventListener("click", this._itemInvokedHandler, false);
                                    if (this.navigating) {
                                        this.navigating();
                                        this.navigating = null
                                    }
                                }.bind(this))
                            }.bind(this))
                        }.bind(this))
                    }
                }, _handleViewPortScroll: function _handleViewPortScroll(event) {
                    if (this._unloaded)
                        return;
                    if (this._viewPortScrollingTimer) {
                        this._viewPortScrollingTimer.cancel();
                        this._viewPortScrollingTimer = null
                    }
                    if (this._avatarSelected)
                        return;
                    if (!this._pausing) {
                        this._pausing = true;
                        WinJS.Promise.timeout(this._scrollInTimeout).then(this._pauseVisibleAvatars.bind(this))
                    }
                    this._viewPortScrollingTimer = WinJS.Promise.timeout(this._scrollOutTimeout).then(function play() {
                        this._playVisibleAvatars(true);
                        this._viewPortScrollingTimer = null
                    }.bind(this));
                    this._loadingPaused = false;
                    this._continueLoading()
                }, _handleModelStatus: function _handleModelStatus(status) {
                    if (this._unloaded)
                        return;
                    var statusValue = MS.Entertainment.Social.LoadStatus;
                    switch (status) {
                        case statusValue.error:
                            if (this._model.errorResult && this._model.errorResult.friendsPromise)
                                this._raisePanelReadyOnce(true, {primaryStringId: String.id.IDS_SOCIAL_ERROR});
                            else
                                this._raisePanelReadyOnce(false);
                            break;
                        case statusValue.blocked:
                            if (this._model.errorResult && this._model.errorResult.friendsPromise)
                                this._raisePanelReadyOnce(true, {primaryStringId: String.id.IDS_SOCIAL_BLOCKED_FRIENDS});
                            else
                                this._raisePanelReadyOnce(false);
                            break;
                        case statusValue.offline:
                            this._raisePanelReadyOnce(false);
                            break;
                        case statusValue.loaded:
                            this._raisePanelReadyOnce(false);
                            break
                    }
                }, _raisePanelReadyOnce: function _raisePanelReadyOnce(error, errorModel) {
                    if (!this._readyInvoked || error) {
                        this._readyInvoked = true;
                        MS.Entertainment.UI.Controls.Panel.raisePanelReady(this.domElement, error, errorModel)
                    }
                }, _handleMutualFriendsChanged: function _handleMutualFriendsChanged(newFriends) {
                    if (this._unloaded)
                        return;
                    if (this.friendGalleryType === MS.Entertainment.Social.friendGalleryType.mutual)
                        this._handleFriendsChanged(newFriends)
                }, _handlePendingFriendsChanged: function _handlePendingFriendsChanged(newFriends) {
                    if (this._unloaded)
                        return;
                    if (this.friendGalleryType === MS.Entertainment.Social.friendGalleryType.pending)
                        this._handleFriendsChanged(newFriends)
                }, _handleIncomingFriendsChanged: function _handleIncomingFriendsChanged() {
                    if (this._unloaded)
                        return;
                    this._updateHubTitles();
                    this._updateFriendButton()
                }, _handleFriendsChanged: function _handleFriendsChanged(newFriends) {
                    if (this._unloaded)
                        return;
                    this._updateEmptyPanelDetails();
                    this.friendsDataSource.clear();
                    this._pendingFriends = null;
                    this._playingAvatars = [];
                    this._pausedAvatars = [];
                    this._firstItemReady = false;
                    this._initializedCount = 0;
                    if (newFriends) {
                        this._friendButton = null;
                        this._updateFriendButton();
                        if (newFriends.count !== 0) {
                            this._loadingPaused = this._hidden && this._firstItemReady;
                            this.showLoading = false;
                            this.showEmpty = false;
                            this.showGallery = true;
                            newFriends.itemsFromIndex(0).then(function newFriendsList(result) {
                                var newList = [];
                                var length = result.items.length;
                                var buttonCount = this._hasFriendButton() ? 1 : 0;
                                if (this.maxFriends > -1) {
                                    length = Math.min(this.maxFriends, length);
                                    if (buttonCount && length === this.maxFriends)
                                        length--
                                }
                                for (var i = 0; i < length; i++)
                                    newList.push(result.items[i].data);
                                this._itemsCount = newList.length + buttonCount;
                                this._friendsCount = newList.length;
                                this._pendingFriends = newList;
                                this._calculateViewPortSize();
                                this._continueLoading()
                            }.bind(this))
                        }
                        else {
                            this.showLoading = false;
                            this.showEmpty = true;
                            this.showGallery = false;
                            this._itemsCount = 0;
                            this._friendsCount = 0
                        }
                    }
                }, _handleProfileChanged: function _handleProfileChanged(newProfile) {
                    if (this._unloaded)
                        return;
                    this.gamerTag = newProfile ? newProfile.gamerTag : String.empty;
                    this._updateHubTitles()
                }, _hasFriendButton: function _hasFriendButton() {
                    return this.showFindFriendsButton
                }, _updateHubTitles: function _updateHubTitles() {
                    if (this._signedInUser && this._signedInUser.gamerTag !== this.gamerTag && this.hub && this.gamerTag)
                        this.hub.title = String.load(String.id.IDS_SOCIAL_FRIEND_FRIENDS_TITLE).format(this.gamerTag);
                    else if (this._pendingFriendsHub)
                        if (this._model && this._model.incomingFriends)
                            if (this._model.incomingFriends.count > 0)
                                this._pendingFriendsHub.title = String.load(String.id.IDS_SOCIAL_PENDING_FRIENDS_TITLE_N).format(this._model.incomingFriends.count);
                            else
                                this._pendingFriendsHub.title = String.load(String.id.IDS_SOCIAL_PENDING_FRIENDS_TITLE)
                }, _updateEmptyPanelDetails: function _updateEmptyPanelDetails() {
                    var buttons = [];
                    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                    if (this.inDashboard) {
                        var incomingFriendCount = this._model && this._model.incomingFriends && this._model.incomingFriends.count >= 0 ? this._model.incomingFriends.count : 0;
                        if (incomingFriendCount > 0) {
                            var linkText = null;
                            if (incomingFriendCount === 1)
                                linkText = String.load(String.id.IDS_SOCIAL_VIEW_1_FRIEND_REQUEST);
                            else
                                linkText = String.load(String.id.IDS_SOCIAL_VIEW_X_FRIEND_REQUESTS).format(incomingFriendCount);
                            var showPendingFriendsAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.navigate);
                            showPendingFriendsAction.parameter = {
                                page: MS.Entertainment.UI.Monikers.socialFriends, hub: MS.Entertainment.UI.Monikers.socialPendingFriendsHub
                            };
                            buttons.push({
                                stringId: null, linkText: linkText, linkAction: showPendingFriendsAction, linkIcon: MS.Entertainment.UI.Icon.friendPending
                            })
                        }
                    }
                    var addFriendAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.showFindFriendsFlyout);
                    addFriendAction.automationId = MS.Entertainment.UI.AutomationIds.gamesShowFindFriendsFlyout;
                    addFriendAction.parameter = {placement: "right"};
                    buttons.push({
                        stringId: null, linkStringId: String.id.IDS_SOCIAL_ADD_FRIEND, linkAction: addFriendAction, linkIcon: WinJS.UI.AppBarIcon.add
                    });
                    var shareAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.share);
                    shareAction.automationId = MS.Entertainment.UI.AutomationIds.gamesShareProfileEmptyFriends;
                    buttons.push({
                        linkStringId: String.id.IDS_SHARE_PROFILE, linkIcon: WinJS.UI.AppBarIcon.postupdate, linkAction: shareAction
                    });
                    this._updatePendingShare();
                    this.failedPanel.details = buttons;
                    if (this.friendGalleryType === MS.Entertainment.Social.friendGalleryType.pending)
                        this.failedPanel.primaryStringId = String.id.IDS_SOCIAL_EMPTY_PENDING_FRIENDS_TITLE
                }, _pauseAvatars: function _pauseAvatars(resetAnimations) {
                    while (this._playingAvatars.length) {
                        var control = this._playingAvatars.shift();
                        if (resetAnimations)
                            control.avatarControl.startAnimation(Microsoft.Entertainment.Avatar.AvatarAnimationId.idle);
                        control.pause();
                        if (this._pausedAvatars.indexOf(control) === -1)
                            this._pausedAvatars.push(control)
                    }
                }, _playAvatars: function _playAvatars(playAvatars) {
                    this._playingAvatars = [];
                    while (playAvatars.length) {
                        var control = playAvatars.shift();
                        if (control) {
                            if (control.avatarControl && !control.avatarControl.started)
                                control.avatarControl.startControl();
                            control.play();
                            this._playingAvatars.push(control)
                        }
                    }
                }, _shutdownAvatars: function _shutdownAvatars(shutdownAvatars) {
                    while (shutdownAvatars.length) {
                        var control = shutdownAvatars.shift();
                        control.stop()
                    }
                }, _pauseVisibleAvatars: function _pauseVisibleAvatars() {
                    this._pausing = false;
                    this._pauseAvatars()
                }, _getFirstVisibleIndex: function _getFirstVisibleIndex() {
                    return Math.floor(this.domElement.scrollLeft / this._itemWidth)
                }, _playVisibleAvatars: function _playVisibleAvatars() {
                    if (!this._itemsCount || !this._firstItemReady || this._unloaded)
                        return;
                    var count = this._itemsPerScreen;
                    var first = this._getFirstVisibleIndex();
                    var visibleAvatars = [];
                    for (var x = first; x < (first + count); x++) {
                        var control = this._getAvatarControlAtIndex(x);
                        if (!control)
                            continue;
                        visibleAvatars.push(control);
                        var index = this._pausedAvatars.indexOf(control);
                        if (index !== -1)
                            this._pausedAvatars.splice(index, 1);
                        index = this._playingAvatars.indexOf(control);
                        if (index !== -1)
                            this._playingAvatars.splice(index, 1)
                    }
                    this._shutdownAvatars(this._pausedAvatars.concat(this._playingAvatars));
                    this._pausedAvatars = [];
                    this._playAvatars(visibleAvatars)
                }, _getAvatarControlAtIndex: function _getAvatarControlAtIndex(index) {
                    var element = this._getViewPort().children[index];
                    if (element && element.firstElementChild && element.firstElementChild.winControl && element.firstElementChild.winControl.pause && element.firstElementChild.winControl.play)
                        return element.firstElementChild.winControl;
                    else
                        return null
                }, _onNetworkStatusChanged: function _onNetworkStatusChanged(newValue) {
                    var isOnline = this._isNetworkStatusCodeOnline(newValue);
                    if (isOnline !== this._isOnline)
                        this._isOnline = isOnline
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
                }, _updatePendingShare: function _updatePendingShare() {
                    var sender = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.shareSender);
                    var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                    this._unshare();
                    if (this._model && this._model.status === MS.Entertainment.Social.LoadStatus.loaded && this._model.profile && signedInUser.isGamerTag(this._model.profile.gamerTag))
                        this._shareOperation = sender.pendingShare(this._model.profile)
                }, _unshare: function _unshare() {
                    if (this._shareOperation) {
                        this._shareOperation.cancel();
                        this._shareOperation = null
                    }
                }
        }, {
            friendsDataSource: null, gamerTag: String.empty, showLoading: false, showEmpty: false, showGallery: false, showFindFriendsButton: false
        }, {itemContainerCreated: function itemContainerCreated(container, context) {
                WinJS.Utilities.addClass(container, "avatarLoading")
            }})})
})()
