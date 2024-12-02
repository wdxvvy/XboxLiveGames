/* Copyright (C) Microsoft Corporation. All rights reserved. */
WinJS.Namespace.define("MS.Entertainment.Pages", {NowPlayingPopover: MS.Entertainment.UI.Framework.defineUserControl("Components/Games/NowPlayingPopover.html#nowPlayingPopoverTemplate", function nowPlayingPopover(element, options) {
        this.uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
        this.playbackSession = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager).getSession(this.sessionId)
    }, {
        _bindings: null, _overlay: null, _overlayEvents: null, _playbackSessionBindings: null, _nowPlayingControl: null, _nowPlayingRemoveTimeout: 5000, frozen: false, mediaItem: null, playbackSession: null, sessionId: null, uiStateService: null, unload: function unload() {
                if (this._overlayEvents) {
                    this._overlayEvents.cancel();
                    this._overlayEvents = null
                }
                if (this.playbackSession)
                    this.playbackSession.currentMedia = null;
                this._detachPlaybackSessionBindings();
                if (this._bindings) {
                    this._bindings.cancel();
                    this._bindings = null
                }
                if (this.uiStateService)
                    this.uiStateService.nowPlayingVisible = false;
                if (this.sessionId)
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.nowPlayingControlManager).releaseNowPlayingControl(this.sessionId);
                MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
            }, freeze: function freeze() {
                this.frozen = true;
                this.uiStateService.nowPlayingVisible = false;
                MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this)
            }, thaw: function thaw() {
                this.frozen = false;
                this.uiStateService.nowPlayingVisible = this._shouldShowNowPlaying();
                if (!this.uiStateService.nowPlayingVisible)
                    this._overlay.hide();
                MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this)
            }, setOverlay: function setOverlay(instance) {
                this._overlay = instance;
                if (this.sessionId)
                    this._createNowPlayingControl();
                this._bindings = WinJS.Binding.bind(this, {
                    playbackSession: this._playbackSessionChanged.bind(this), uiStateService: {nowPlayingVisible: function nowPlayingVisibleChanged(newVal, oldVal) {
                                var showNowPlaying = newVal && !!this.sessionId;
                                if (!this.frozen)
                                    this.nowPlayingControlContainer.visibility = showNowPlaying;
                                if (showNowPlaying)
                                    this._checkNowPlaying();
                                else if (!this.frozen)
                                    this._removeNowPlayingControl()
                            }.bind(this)}
                });
                this.uiStateService.nowPlayingVisible = this._shouldShowNowPlaying()
            }, _playbackSessionChanged: function playbackSessionChanged() {
                this._detachPlaybackSessionBindings();
                if (this.playbackSession)
                    this._playbackSessionBindings = WinJS.Binding.bind(this, {playbackSession: {
                            currentMedia: this._mediaStateChanged.bind(this), currentTransportState: this._mediaStateChanged.bind(this), canControlMedia: this._mediaStateChanged.bind(this), playerState: this._playerStateChanged.bind(this)
                        }});
                else
                    this._removeNowPlayingControl()
            }, _detachPlaybackSessionBindings: function _detachPlaybackSessionBindings() {
                if (this._playbackSessionBindings) {
                    this._playbackSessionBindings.cancel();
                    this._playbackSessionBindings = null
                }
            }, _createNowPlayingControl: function _createNowPlayingControl() {
                if (this._nowPlayingControl || !this.nowPlayingControlContainer)
                    return false;
                this._nowPlayingControl = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.nowPlayingControlManager).getNowPlayingControl(this.sessionId);
                this.nowPlayingControlContainer.domElement.appendChild(this._nowPlayingControl.domElement);
                return true
            }, _removeNowPlayingControl: function _removeNowPlayingControl() {
                if (!this._nowPlayingControl)
                    return;
                if (this.sessionId)
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.nowPlayingControlManager).releaseNowPlayingControl(this.sessionId);
                if (this.nowPlayingControlContainer && this.nowPlayingControlContainer.domElement) {
                    MS.Entertainment.Utilities.empty(this.nowPlayingControlContainer.domElement);
                    WinJS.Utilities.addClass(this.nowPlayingControlContainer.domElement, "hideFromDisplay")
                }
                WinJS.Utilities.addClass(this.immersiveStartingControl, "removeFromDisplay");
                this.uiStateService.nowPlayingVisible = false;
                this._nowPlayingControl = null
            }, _startNowPlaying: function _startNowPlaying() {
                if (this._nowPlayingControl && this._nowPlayingControl.initialized) {
                    this._nowPlayingControl.playbackSession = this.playbackSession;
                    this._nowPlayingControl.repossessNowPlaying();
                    var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    sessionMgr.setPrimarySession(this.sessionId);
                    WinJS.Utilities.removeClass(this.nowPlayingControlContainer.domElement, "hideFromDisplay");
                    WinJS.Utilities.addClass(this.immersiveStartingControl, "removeFromDisplay")
                }
            }, _checkNowPlaying: function _checkNowPlaying() {
                var shouldShowNowPlaying = this._shouldShowNowPlaying();
                if (this.playbackSession && this.playbackSession.playerState !== MS.Entertainment.Platform.Playback.PlayerState.notReady && shouldShowNowPlaying) {
                    this.uiStateService.nowPlayingVisible = true;
                    if (this._createNowPlayingControl() || (this._nowPlayingControl && !this._nowPlayingControl.initialized))
                        this._nowPlayingControl.bind("initialized", function initializedChanged(newVal) {
                            if (newVal)
                                this._startNowPlaying()
                        }.bind(this));
                    else
                        this._startNowPlaying()
                }
                if (this.uiStateService.nowPlayingVisible && !shouldShowNowPlaying)
                    WinJS.Promise.timeout(this._nowPlayingRemoveTimeout).then(function _delay() {
                        if (!this.frozen)
                            this.uiStateService.nowPlayingVisible = this._shouldShowNowPlaying()
                    }.bind(this));
                else
                    this.uiStateService.nowPlayingVisible = shouldShowNowPlaying
            }, _playerStateChanged: function _playerStateChanged(newVal, oldVal) {
                if (!newVal || this.frozen)
                    return;
                if (newVal === MS.Entertainment.Platform.Playback.PlayerState.error && oldVal !== undefined) {
                    if (!this.uiStateService.isSnapped)
                        this.uiStateService.nowPlayingInset = true
                }
                else if (newVal === MS.Entertainment.Platform.Playback.PlayerState.notReady && oldVal !== undefined)
                    WinJS.Promise.timeout(this._nowPlayingRemoveTimeout).then(function _delay() {
                        if (!this.frozen && this.playbackSession && this.playbackSession.playerState === newVal === MS.Entertainment.Platform.Playback.PlayerState.notReady)
                            this._removeNowPlayingControl()
                    }.bind(this));
                else
                    this._checkNowPlaying()
            }, _mediaStateChanged: function _mediaStateChanged(newVal, oldVal) {
                if (!newVal || this.frozen)
                    return;
                if (this.immersiveStartingControl)
                    if (this.playbackSession.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.starting)
                        WinJS.Utilities.removeClass(this.immersiveStartingControl, "removeFromDisplay");
                    else
                        WinJS.Utilities.addClass(this.immersiveStartingControl, "removeFromDisplay");
                if (newVal === MS.Entertainment.Platform.Playback.TransportState.stopped && this._overlay)
                    this._overlay.hide();
                this._checkNowPlaying()
            }, _shouldShowNowPlaying: function _shouldShowNowPlaying() {
                var setNowPlayingVisible = false;
                if (this.playbackSession && this.playbackSession.currentMedia && this.playbackSession.canControlMedia && this.playbackSession.currentMedia.isEqual(this.mediaItem) && this.playbackSession.currentTransportState !== MS.Entertainment.Platform.Playback.TransportState.stopped)
                    setNowPlayingVisible = true;
                return setNowPlayingVisible && !this.frozen
            }
    })})
