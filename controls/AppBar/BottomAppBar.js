﻿/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Components/Playback/Controls/playbackcontrol.js", "/Components/Playback/playbackhelpers.js", "/Framework/corefx.js", "/Framework/imageloader.js", "/Framework/servicelocator.js", "/Framework/utilities.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {
    BottomAppBar: MS.Entertainment.UI.Framework.defineUserControl("Controls/AppBar/BottomAppBar.html#bottomAppBarTemplate", function(element, options) {
        this._handleFocusOnPopoverElement = this._handleFocusOnPopoverElement.bind(this)
    }, {
        hideAppBarOnSoftKeyboard: true, _initialized: false, _appbar: null, _sessionMgr: null, _bindings: null, _uiStateService: null, _inputCurrentView: null, _keyboardNavigationManager: null, _eventHandlers: null, _sessionEventHandlers: null, _hideTimer: null, _sticky: undefined, _programmaticallyShown: false, _appBarActionList: null, _metadataControl: null, _transportControls: null, _upsellControls: null, _upsellPlaybackControls: null, _upsellBindings: null, _pendingDeferredInit: false, _deferredUpdateTimer: null, _errorPromise: null, initialize: function initialize() {
                this._appbar = document.querySelector("[data-win-control='WinJS.UI.AppBar']").winControl;
                this._uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                this._inputCurrentView = Windows.UI.ViewManagement.InputPane.getForCurrentView();
                if (this._sticky !== undefined)
                    this._appbar.stick = this._sticky;
                this._uiStateService.bind("nowPlayingVisible", function _onNowPlayingVisibleChanged() {
                    this._updateStates()
                }.bind(this));
                var appBarBeforeShow = function appBarBeforeShowFn() {
                        this._updateSize();
                        this._onAppBarEvent("beforeshow")
                    }.bind(this);
                var appBarAfterShow = function appBarAfterShowFn() {
                        MS.Entertainment.UI.Framework.addOverlayContainer(this.domElement);
                        if (!this._programmaticallyShown)
                            this._keyboardNavigationManager.focusFirstItemInContainer(this.domElement, true);
                        this._programmaticallyShown = false
                    }.bind(this);
                this._appbar.addEventListener("beforeshow", appBarBeforeShow, false);
                this._appbar.addEventListener("aftershow", appBarAfterShow, false);
                this._appbar.addEventListener("beforehide", function onAppBarBeforeHide() {
                    MS.Entertainment.UI.Framework.removeOverlayContainer(this.domElement);
                    this._cancelHideTimer()
                }.bind(this), false);
                this._appbar.addEventListener("afterhide", function onAppBarAfterHide() {
                    this._onAppBarEvent("afterhide")
                }.bind(this), false);
                window.addEventListener("resize", function onWindowSizeChanged() {
                    this._updateSize()
                }.bind(this));
                this._keyboardNavigationManager = new MS.Entertainment.Framework.KeyboardNavigationManager(this.domElement);
                this._initialized = true;
                this.hide();
                this._updateStates();
                if (this._pendingDeferredInit) {
                    this._pendingDeferredInit = false;
                    this.deferredInit()
                }
                this._eventHandlers = MS.Entertainment.Utilities.addEvents(this, {
                    click: this._onUserInteraction.bind(this), keydown: this._onUserInteraction.bind(this)
                }, true);
                this._popOverFocusHelper.addEventListener("focus", this._handleFocusOnPopoverElement)
            }, _handleFocusOnPopoverElement: function _handleFocusOnPopoverElement() {
                var container = this._containerToRefocusId && document.getElementById(this._containerToRefocusId);
                if (container && this._appbar.sticky)
                    MS.Entertainment.UI.Framework.focusFirstInSubTree(container, true);
                else {
                    this._containerToRefocusId = null;
                    this._keyboardNavigationManager.focusFirstItemInContainer(this.domElement, true)
                }
            }, _containerToRefocusId: null, focusAppBar: function focusAppBar(containerToFocus) {
                if (containerToFocus) {
                    if (!containerToFocus.id)
                        containerToFocus.id = containerToFocus.uniqueID;
                    this._containerToRefocusId = containerToFocus.id;
                    this._popOverFocusHelper.setAttribute("tabindex", 0)
                }
                else
                    this._popOverFocusHelper.setAttribute("tabindex", MS.Entertainment.Utilities.optionsAppTypeTabIndexHelper);
                this._keyboardNavigationManager.focusFirstItemInContainer(this.domElement, true)
            }, deferredInit: function deferredInit() {
                if (!this._initialized) {
                    this._pendingDeferredInit = true;
                    return
                }
                this._sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                this.bind("playbackSession", this._playbackSessionChanged.bind(this));
                this._uiStateService.bind("primarySessionId", function primarySessionIdChanged() {
                    this.playbackSession = this._sessionMgr.primarySession
                }.bind(this));
                this._createActionList();
                this._createMetadataControl();
                this._createTransportControls();
                this._createUpsellControls()
            }, _createActionList: function _createActionList() {
                var container = document.createElement("div");
                MS.Entertainment.UI.Framework.waitForControlToInitialize(container).then(function initAppBarActionList() {
                    var appToolbarService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appToolbar);
                    this._appBarActionList.items = appToolbarService.currentAppbarActions
                }.bind(this));
                this._appBarActionList = new MS.Entertainment.UI.Controls.ActionList(this._actionListContainer.appendChild(container), {});
                container.setAttribute("data-win-control", "MS.Entertainment.UI.Controls.ActionList");
                this._appBarActionList.bind("workingItems", this._updateSize.bind(this))
            }, _createMetadataControl: function _createMetadataControl() {
                var container = document.createElement("div");
                this._metadataControl = new MS.Entertainment.UI.Controls.BottomAppBarNowPlayingMetadata(this._metadataContainer.domElement.appendChild(container), {});
                this._metadataControl.playbackSession = this.playbackSession
            }, _createTransportControls: function _createTransportControls() {
                var container = document.createElement("div");
                WinJS.Utilities.addClass(container, "appBarTransportControls");
                this._transportControls = new MS.Entertainment.UI.Controls.TransportControls(this._transportControlsContainer.appendChild(container), {});
                this._transportControls.playbackSession = this.playbackSession
            }, _createUpsellControls: function _createUpsellControls() {
                return
            }, unload: function unload() {
                if (this._deferredUpdateTimer) {
                    this._deferredUpdateTimer.cancel();
                    this._deferredUpdateTimer = null
                }
                this._cancelHideTimer();
                if (this._upsellBindings) {
                    this._upsellBindings.cancel();
                    this._upsellBindings = null
                }
                MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
            }, sticky: {
                get: function sticky_get() {
                    if (!this._appbar)
                        return this._sticky;
                    else
                        return this._appbar.sticky
                }, set: function sticky_set(value) {
                        if (!this._appbar)
                            this._sticky = value;
                        else
                            this._appbar.sticky = value
                    }
            }, disabled: {
                get: function disabled_get() {
                    if (!MS.Entertainment.Utilities.isGamesApp)
                        return false;
                    if (!this.playbackSession || !this.playbackSession.currentMedia || !this.playbackSession.canControlMedia || this.playbackSession.duration <= 0)
                        return true;
                    return false
                }, set: function disabled_set() {
                        MS.Entertainment.UI.Controls.assert(false, "Cannot set disabled property on BottomAppBar")
                    }
            }, _updateSize: function _updateSize() {
                if (!this._appBarActionList)
                    return;
                var clientWidth = this._actionListContainer.clientWidth;
                if (clientWidth > 0)
                    this._appBarActionList.containerWidth = clientWidth
            }, _detachBindings: function _detachBindings() {
                if (this._bindings) {
                    this._bindings.cancel();
                    this._bindings = null
                }
                if (this._sessionEventHandlers) {
                    this._sessionEventHandlers.cancel();
                    this._sessionEventHandlers = null
                }
                if (this._inputEventHandlers) {
                    this._inputEventHandlers.cancel();
                    this._inputEventHandlers = null
                }
            }, _playbackSessionChanged: function _playbackSessionChanged(newValue, oldValue) {
                if (oldValue === undefined)
                    return;
                this._detachBindings();
                this._sessionEventHandlers = MS.Entertainment.Utilities.addEvents(this.playbackSession, {
                    currentTitleIdChanged: this._titleChanged.bind(this), sessionStateChanged: this._updateStates.bind(this), playerStateChanged: this._playerStateChanged.bind(this), currentMediaChanged: this._mediaChanged.bind(this), currentTransportStateChanged: this._updateStates.bind(this), currentPositionChanged: this._mediaPositionChanged.bind(this), isAudioAdChanged: this._isAudioAdChanged.bind(this), errorDescriptorChanged: this._errorDescriptorChanged.bind(this)
                });
                this._titleChanged();
                this._updateStates();
                this._playerStateChanged({detail: {newValue: this.playbackSession.playerState}});
                this._mediaChanged();
                this._mediaPositionChanged();
                this._isAudioAdChanged({detail: {newValue: this.playbackSession.isAudioAd}});
                this._errorDescriptorChanged({detail: {newValue: this.playbackSession.errorDescriptor}});
                this._bindings = WinJS.Binding.bind(this, {_uiStateService: {
                        primarySessionId: this._updateStates.bind(this), isFullScreenVideo: this._mediaPositionChanged.bind(this), activityOverlayVisible: this._updateStates.bind(this), xboxControllerVisible: this._updateStates.bind(this)
                    }});
                this._inputEventHandlers = MS.Entertainment.Utilities.addEventHandlers(this._inputCurrentView, {
                    showing: function uiStateService_SoftKeyboardShown() {
                        this._onSoftKeyboardOpen(true)
                    }.bind(this), hiding: function uiStateService_SoftKeyboardHiding() {
                            this._onSoftKeyboardOpen(false)
                        }.bind(this)
                });
                if (this._transportControls)
                    this._transportControls.playbackSession = this.playbackSession;
                if (this._metadataControl)
                    this._metadataControl.playbackSession = this.playbackSession;
                this._updateStates()
            }, _onSoftKeyboardOpen: function _onSoftKeyboardOpen(newValue) {
                if (!this._appbar || !this._appbar._element)
                    return;
                if (this.hideAppBarOnSoftKeyboard && newValue)
                    WinJS.Utilities.addClass(this._appbar._element, "removeFromDisplay");
                else
                    WinJS.Utilities.removeClass(this._appbar._element, "removeFromDisplay")
            }, _feedbackButtonClicked: function _feedbackButtonClicked() {
                MS.Entertainment.UI.Shell.showFeedbackDialog()
            }, show: function show(hideTimeoutMS) {
                var allowHide = this._hideTimer || !this.visible;
                this._cancelHideTimer();
                this._programmaticallyShown = true;
                this.sticky = true;
                if (this._appbar) {
                    this._appbar.show();
                    this._updateStates()
                }
                if (!isNaN(hideTimeoutMS) && hideTimeoutMS > 0 && allowHide)
                    this._hideTimer = WinJS.Promise.timeout(hideTimeoutMS).then(this.hide.bind(this))
            }, hide: function hide(suspendActionListChanges) {
                this._cancelHideTimer();
                if (suspendActionListChanges && this.visible)
                    this.suspendActionListChanges();
                if (this._appbar) {
                    this.visible = false;
                    this._appbar.hide();
                    this._updateStates()
                }
                this.sticky = false
            }, repossessNowPlaying: function repossessNowPlaying() {
                if (this._metadataControl)
                    this._metadataControl.repossessNowPlaying()
            }, suspendActionListChanges: function suspendActionListChanges() {
                if (!this._appBarActionList)
                    return;
                this._appBarActionList.freeze()
            }, resumeActionListChanges: function resumeActionListChanges() {
                if (!this._appBarActionList)
                    return;
                this._appBarActionList.thaw()
            }, _onUserInteraction: function _onUserInteraction(e) {
                if (this._uiStateService.isSnapped || (e && e.type === "keydown" && (e.keyCode === WinJS.Utilities.Key.tab || e.keyCode === WinJS.Utilities.Key.enter || e.keyCode === WinJS.Utilities.Key.space)))
                    return;
                this.sticky = false;
                this._cancelHideTimer()
            }, _cancelHideTimer: function _cancelHideTimer() {
                if (this._hideTimer) {
                    this._hideTimer.cancel();
                    this._hideTimer = null
                }
            }, _appBarFocused: function _appBarFocused(e) {
                if (document.activeElement === this.container)
                    WinJS.Promise.timeout().then(function() {
                        this._keyboardNavigationManager.focusFirstItemInContainer(this.domElement, true)
                    }.bind(this))
            }, _onAppBarEvent: function _onAppBarEvent(event) {
                switch (event)
                {
                    case"beforeshow":
                        this.visible = true;
                        this._mediaPositionChanged();
                        this._updateStates();
                        break;
                    case"afterhide":
                        this.resumeActionListChanges();
                        this.visible = false;
                        this._updateStates();
                        break
                }
            }, _titleChanged: function _titleChanged(e) {
                if (!this._initialized)
                    return;
                if (this._metadataControl)
                    this._metadataControl.updateMetadata()
            }, _mediaChanged: function _mediaChanged(e) {
                if (!this._initialized)
                    return;
                if (this._metadataControl)
                    this._metadataControl.updateMetadata()
            }, _mediaPositionChanged: function _mediaPositionChanged() {
                if (!this._initialized || !this.playbackSession || !this.visible || this._uiStateService.isFullScreenVideo)
                    return;
                var durationMs = this.playbackSession.duration;
                var positionMs = parseInt(this.playbackSession.currentPosition);
                var value = Math.min(durationMs, positionMs);
                var max = durationMs;
                this.progressPercent = (value / max * 100) + "%";
                if (this._metadataControl)
                    this._metadataControl.updatePositionDuration(value, max)
            }, _isAudioAdChanged: function _isAudioAdChanged(e) {
                var newVal = e.detail.newValue;
                var oldVal = e.detail.oldValue;
                if (newVal) {
                    WinJS.Utilities.addClass(this._transportControlsContainer, "hideFromDisplay");
                    WinJS.Utilities.removeClass(this._upsellContainer, "hideFromDisplay");
                    this._metadataControl.moreInfoClickUrl = MS.Entertainment.UI.FWLink.advertisementReason;
                    this._metadataControl.moreInfoLinkText = String.load(String.id.IDS_MUSIC_STREAMING_AD_DESC_LINK);
                    this._metadataControl.moreInfoLinkCallback = this._logAudioAdReasonClick.bind(this)
                }
                else {
                    WinJS.Utilities.addClass(this._upsellContainer, "hideFromDisplay");
                    WinJS.Utilities.removeClass(this._transportControlsContainer, "hideFromDisplay");
                    this._metadataControl.moreInfoClickUrl = String.empty;
                    this._metadataControl.moreInfoLinkText = String.empty;
                    this._metadataControl.moreInfoLinkCallback = null
                }
            }, _logAudioAdReasonClick: function _logAudioAdReasonClick() {
                var adService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.adService);
                adService.sendAudioAdReasonClickTelemetryInfo()
            }, _errorDescriptorChanged: function _errorDescriptorChanged(e) {
                var newVal = e.detail.newValue
            }, _playerStateChanged: function _playerStateChanged(e) {
                var newVal = e.detail.newValue;
                if (newVal === MS.Entertainment.Platform.Playback.PlayerState.error)
                    this._handlePlaybackError()
            }, _handlePlaybackError: function _handlePlaybackError() {
                if (this._errorPromise) {
                    this._errorPromise.cancel();
                    this._errorPromise = null
                }
                if (this.playbackSession.sessionId === MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying && this.playbackSession.errorDescriptor) {
                    var error = this.playbackSession.errorDescriptor;
                    var errorCode = MS.Entertainment.Platform.Playback._mapMediaElementErrorCodes(error.code, error.msExtendedCode);
                    if (!MS.Entertainment.UI.Controls.BottomAppBar.suppressNextPlaybackErrorDialog)
                        MS.Entertainment.UI.Shell.showError(String.load(String.id.IDS_PLAYBACK_ERROR_MESSAGE_TITLE), errorCode);
                    MS.Entertainment.UI.Controls.BottomAppBar.suppressNextPlaybackErrorDialog = false
                }
                this._updateStates()
            }, _updateStates: function _updateStates() {
                if (this._deferredUpdateTimer || !this._initialized)
                    return;
                this._appbar.disabled = this.disabled;
                this._deferredUpdateTimer = WinJS.Promise.timeout(MS.Entertainment.Platform.PlaybackHelpers.deferredUpdateTimeout).then(this._updateStatesDeferred.bind(this))
            }, _updateStatesDeferred: function _updateStatesDeferred() {
                this._deferredUpdateTimer = null;
                if (this._uiStateService.appBarVisible !== this.visible)
                    this._uiStateService.appBarVisible = this.visible;
                if (!this._uiStateService.isSnapped && !this._uiStateService.activityOverlayVisible && !this._uiStateService.xboxControllerVisible && (this._uiStateService.nowPlayingVisible || !this.playbackSession)) {
                    this.appBarNowPlayingVisible = false;
                    this.appBarNowPlayingProgressVisible = false;
                    this.appBarTransportControlsContainerVisible = !MS.Entertainment.Utilities.useModalNowPlaying || (this.playbackSession && this.playbackSession.currentMedia && this.playbackSession.canControlMedia && this.playbackSession.duration > 0)
                }
                else if (this.playbackSession) {
                    this.appBarNowPlayingVisible = !!this.playbackSession.currentMedia && !MS.Entertainment.Utilities.useModalNowPlaying;
                    if (this._metadataControl)
                        this._metadataControl.updateStates();
                    var isValidMedia = this.playbackSession && this.playbackSession.currentMedia && this.playbackSession.canControlMedia && this.playbackSession.duration > 0;
                    this.appBarNowPlayingProgressVisible = isValidMedia && !MS.Entertainment.Utilities.useModalNowPlaying;
                    this.appBarTransportControlsContainerVisible = isValidMedia || !MS.Entertainment.Utilities.useModalNowPlaying
                }
            }
    }, {
        visible: false, playbackSession: null, appBarNowPlayingVisible: false, appBarNowPlayingProgressVisible: false, appBarTransportControlsContainerVisible: true, progressPercent: 0
    }, {
        defaultHideTimeoutMS: 10000, defaultCompanionHideTimeoutMS: 5000, suppressNextPlaybackErrorDialog: false
    }), BottomAppBarNowPlayingMetadata: MS.Entertainment.UI.Framework.defineUserControl("Controls/AppBar/BottomAppBar.html#bottomAppBarNowPlayingMetadataTemplate", function(element, options){}, {
            _initialized: false, _sessionMgr: null, _title: String.empty, _metadataArtistAlbumName: String.empty, _metadataSeriesTitle: String.empty, _lastAlbumId: null, moreInfoLinkCallback: null, initialize: function initialize() {
                    this._sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    this.bind("playbackSession", this.updateMetadata.bind(this))
                }, title: {
                    get: function() {
                        return this._title
                    }, set: function(value) {
                            this._title = value;
                            if (this._initialized && !this._unloaded && value !== this._titleText.textContent) {
                                this._titleText.textContent = value;
                                if (value)
                                    WinJS.Utilities.removeClass(this._titleText, "removeFromDisplay");
                                else
                                    WinJS.Utilities.addClass(this._titleText, "removeFromDisplay")
                            }
                        }
                }, metadataArtistAlbumName: {
                    get: function() {
                        return this._metadataArtistAlbumName
                    }, set: function(value) {
                            this._metadataArtistAlbumName = value;
                            if (this._initialized && !this._unloaded && value !== this._metadataArtistAlbumNameText.textContent) {
                                this._metadataArtistAlbumNameText.textContent = value;
                                if (value)
                                    WinJS.Utilities.removeClass(this._metadataArtistAlbumNameText, "removeFromDisplay");
                                else
                                    WinJS.Utilities.addClass(this._metadataArtistAlbumNameText, "removeFromDisplay")
                            }
                        }
                }, metadataSeriesTitle: {
                    get: function() {
                        return this._metadataSeriesTitle
                    }, set: function(value) {
                            this._metadataSeriesTitle = value;
                            if (this._initialized && !this._unloaded && value !== this._metadataSeriesTitleText.textContent) {
                                this._metadataSeriesTitleText.textContent = value;
                                if (value)
                                    WinJS.Utilities.removeClass(this._metadataSeriesTitleText, "removeFromDisplay");
                                else
                                    WinJS.Utilities.addClass(this._metadataSeriesTitleText, "removeFromDisplay")
                            }
                        }
                }, repossessNowPlaying: function repossessNowPlaying() {
                    if (this._sessionMgr)
                        this._sessionMgr.relocateSession(this._nowPlayingThumbnail, false)
                }, updateMetadata: function updateMetadata() {
                    if (!this.playbackSession)
                        return;
                    if (this.playbackSession.currentMedia) {
                        if (!this.playbackSession.currentMedia.sharesDirectParentWith(this.nowPlayingImageMediaItem)) {
                            this.nowPlayingImageMediaItem = this.playbackSession.currentMedia;
                            this._lastAlbumId = this.playbackSession.currentMedia.albumServiceId
                        }
                        this.metadataTitle = this.playbackSession.currentMedia.name;
                        var metadataArtistName = this.playbackSession.currentMedia.artistName;
                        var metadataAlbumName = this.playbackSession.currentMedia.albumName;
                        if (metadataArtistName && metadataAlbumName)
                            this.metadataArtistAlbumName = String.load(String.id.IDS_COMMA_SEPARATOR).format(metadataArtistName, metadataAlbumName);
                        else if (metadataArtistName)
                            this.metadataArtistAlbumName = metadataArtistName;
                        else if (metadataAlbumName)
                            this.metadataArtistAlbumName = metadataAlbumName;
                        else
                            this.metadataArtistAlbumName = String.empty;
                        if (this.playbackSession.currentMedia.seriesTitle)
                            this.metadataSeriesTitle = this.playbackSession.currentMedia.seriesTitle;
                        else
                            this.metadataSeriesTitle = String.empty
                    }
                    else {
                        this.nowPlayingImageMediaItem = null;
                        this.metadataTitle = String.empty
                    }
                    if (!this.metadataTitle && typeof this.metadataTitle !== "string")
                        this.metadataTitle = String.load(String.id.IDS_UNKNOWN_VALUE);
                    this.title = this.metadataTitle;
                    this.updateStates()
                }, updateStates: function updateStates() {
                    if (this._deferredUpdateTimer)
                        return;
                    if (this.playbackSession) {
                        if (this.playbackSession.isRemoteSession && !this.playbackSession.isRemoteSession() && this.playbackSession.currentMedia && this.playbackSession.currentMedia.mediaType === Microsoft.Entertainment.Queries.ObjectType.game && this.playbackSession.canControlMedia) {
                            if (this._appBarNowPlaying)
                                this.nowPlayingWidth = (this.playbackSession.videoWidth * (this._appBarNowPlaying.clientHeight / this.playbackSession.videoHeight)) + "px";
                            this.thumbnailVisible = true;
                            this.artVisible = false
                        }
                        else {
                            this.nowPlayingWidth = this.moreInfoClickUrl ? "400px" : "auto";
                            this.thumbnailVisible = false;
                            this.artVisible = true
                        }
                        this.positionDurationVisible = this.playbackSession && this.playbackSession.currentMedia && this.playbackSession.canControlMedia && this.playbackSession.duration > 0
                    }
                    if (this.playbackSession.sessionId === "nowPlaying")
                        this.nowPlayingText = String.load(String.id.IDS_HOME_NOW_PLAYING);
                    else
                        this.nowPlayingText = String.load(String.id.IDS_HOME_NOW_PLAYING_XBOX)
                }, updatePositionDuration: function updatePositionDuration(value, max) {
                    if (value && max) {
                        this.positionText = MS.Entertainment.Utilities.millisecondsToTimeCode(value);
                        this.durationText = "/" + MS.Entertainment.Utilities.millisecondsToTimeCode(max)
                    }
                }, onMoreInfoClick: function onMoreInfoClick(e) {
                    if (e)
                        e.stopPropagation();
                    if (this.moreInfoLinkCallback)
                        this.moreInfoLinkCallback()
                }, thumbnailClick: function thumbnailClick() {
                    MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar).hide();
                    var navigation = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                    var currentPage = navigation.currentPage;
                    var onSamePage = false;
                    if (currentPage && currentPage.options && currentPage.options.mediaItem && currentPage.options.mediaItem.isEqual)
                        onSamePage = currentPage.options.mediaItem.isEqual(this.playbackSession.currentMedia);
                    var startFullScreen = this.playbackSession.sessionId === MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying;
                    if (startFullScreen && onSamePage) {
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).nowPlayingInset = false;
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).nowPlayingVisible = true
                    }
                    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                    var action = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.showImmersiveDetails);
                    action.parameter = {
                        sessionId: this.playbackSession.sessionId, startFullScreen: startFullScreen, showNowPlaying: true
                    };
                    action.title = action.parameter.sessionId;
                    action.execute();
                    this.updateStates()
                }
        }, {
            playbackSession: null, nowPlayingText: String.empty, thumbnailVisible: false, artVisible: false, nowPlayingWidth: "auto", nowPlayingImageMediaItem: null, nowPlayingImageUri: String.empty, nowPlayingFallbackImageUri: String.empty, positionText: String.empty, durationText: String.empty, positionDurationVisible: false, desiredImageSize: {}, moreInfoClickUrl: String.empty, moreInfoLinkText: String.empty
        })
})
