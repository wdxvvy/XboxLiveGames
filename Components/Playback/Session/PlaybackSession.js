/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Platform.Playback");
(function() {
    var MSEPlatform = WinJS.Namespace.define("MS.Entertainment.Platform", null);
    var playbackControlMixin = {
            _playbackControlCreateInstance: function _playbackControlCreateInstance() {
                if (!this._playbackControl) {
                    var parkedPlaybackHost = document.createElement("div");
                    WinJS.Utilities.addClass(parkedPlaybackHost, "removeFromDisplay");
                    document.body.appendChild(parkedPlaybackHost);
                    this._parkedPlaybackHost = parkedPlaybackHost;
                    this._playbackControlContainer = document.createElement("div");
                    this._parkedPlaybackHost.appendChild(this._playbackControlContainer);
                    if (!this._playbackControlContainer)
                        throw"_playbackControlCreateInstance: Error! Cannot create playbackControlContainer. Out of memory?";
                    this._playbackControl = new MSEPlatform.Playback.PlaybackControl(this._playbackControlContainer, {});
                    if (!this._playbackControl)
                        throw"_playbackControlCreateInstance: Error! Cannot create playbackControl. Out of memory?";
                }
            }, _parkedPlaybackHost: null, _playbackControlHost: null, _playbackControlContainer: null, _playbackControl: null, _playbackControlEvents: null, _iPlayback: null
        };
    var playlistMixin = {
            _playlistCreateInstance: function _playlistCreateInstance() {
                if (!this._playlist)
                    this._playlist = new MSEPlatform.Playback.Playlist.PlaylistCore(null, {});
                if (!this._playlist)
                    throw"_playlistCreateInstance: Error! Cannot create playlist. Out of memory?";
                this._playlist.addEventListener("shuffleChanged", function _shuffleChanged(e) {
                    if (e.detail && e.detail.oldValue !== undefined)
                        try {
                            this._saveSessionStateValue("shuffle", e.detail.newValue)
                        }
                        catch(ex) {
                            MSEPlatform.Playback.Etw.traceString("PlaybackSession_shuffleChanged: ignored non-fatal exception: " + e)
                        }
                }.bind(this));
                this._playlist.addEventListener("repeatChanged", function _repeatChanged(e) {
                    if (e.detail && e.detail.oldValue !== undefined)
                        try {
                            this._saveSessionStateValue("repeat", e.detail.newValue)
                        }
                        catch(ex) {
                            MSEPlatform.Playback.Etw.traceString("PlaybackSession_repeatChanged: ignored non-fatal exception: " + ex)
                        }
                }.bind(this))
            }, _playlist: null
        };
    var ccRendererMixin = {
            _ccRendererCreateInstance: function _ccRendererCreateInstance(playbackControl, rendererContainer) {
                if (!this._ccRenderer)
                    this._ccRenderer = new MSEPlatform.Playback.ClosedCaptions.Renderer(playbackControl, rendererContainer)
            }, _ccRenderer: null
        };
    var playbackSessionMixin = {
            sessionId: {get: function PlaybackSession_sessionId_get() {
                    return this._sessionId
                }}, playbackControlDom: {
                    get: function PlaybackSession_playbackControlDom_get() {
                        return this._playbackControlContainer
                    }, set: function PlaybackSession_playbackControlDom_set() {
                            throw"Error! playbackControlDom property is not settable";
                        }
                }, setDataSource: function PlaybackSession_setDataSource(dataSource) {
                    var context = this;
                    this._setDataSourcePromise = this._ensureSession().then(function _setDataSource2() {
                        context._iPlayback.reset(true);
                        return context._playlist.setDataSource(dataSource)
                    });
                    return this._setDataSourcePromise
                }, activate: function PlaybackSession_activate(playbackControlHost, index) {
                    if (!playbackControlHost)
                        return;
                    var context = this;
                    this._ensureSession().then(function _activate2() {
                        playbackControlHost.appendChild(context._playbackControlContainer);
                        context._playbackControlHost = playbackControlHost;
                        switch (context._iPlayback.currentTransportState) {
                            case MSEPlatform.Playback.TransportState.paused:
                                context._iPlayback.targetTransportState = MSEPlatform.Playback.TransportState.playing;
                                break;
                            case MSEPlatform.Playback.TransportState.stopped:
                                context._playlist.activate(index);
                                break;
                            case MSEPlatform.Playback.TransportState.playing:
                                break;
                            default:
                                break
                        }
                    })
                }, deactivate: function PlaybackSession_deactivate(pausePlayback) {
                    if (!this._playbackControlHost)
                        return;
                    var pause = pausePlayback || false;
                    var context = this;
                    this._ensureSession().then(function _deactivate2() {
                        if (pause)
                            context._iPlayback.targetTransportState = MSEPlatform.Playback.TransportState.paused;
                        var control = context._playbackControlHost.children[0];
                        context._playbackControlHost = null;
                        context._parkedPlaybackHost.appendChild(control)
                    })
                }, relocate: function PlaybackSession_relocate(newHost) {
                    if (!newHost)
                        return;
                    if (typeof(newHost) === "object")
                        this._relocateLocal(newHost);
                    else
                        this._relocateToRemote(newHost)
                }, playAt: function PlaybackSession_playAt(index, startTimeMsec, searchFor, maxSearchDistance) {
                    if (index < 0)
                        return;
                    var context = this;
                    this._ensureSession().then(function _playAt2() {
                        context._iPlayback.autoPlay = true;
                        context._playlist.activate(index, startTimeMsec, searchFor, maxSearchDistance)
                    })
                }, isMediaCurrentlyLoaded: function PlaybackSession_isMediaCurrentlyLoaded(media) {
                    var type = typeof media;
                    var match = false;
                    if (this.currentMedia)
                        switch (type) {
                            case"number":
                                match = MS.Entertainment.Utilities.isValidLibraryId(media) && this.currentMedia.libraryId === media;
                                break;
                            case"string":
                                match = !MS.Entertainment.Utilities.isEmptyGuid(media) && (this.currentMedia.zuneId === media || this.currentMedia.canonicalId === media || this.currentMedia.serviceId === media);
                                break;
                            case"object":
                                match = media && this.currentMedia.isEqual(media);
                                break
                        }
                    return match
                }, _relocateLocal: function PlaybackSession_relocateLocal(newHost) {
                    var context = this;
                    this._ensureSession().then(function _relocate2() {
                        newHost.appendChild(context._playbackControlContainer);
                        context._playbackControlHost = newHost
                    })
                }, _relocateToRemote: function PlaybackSession_relocateToRemote(titleId) {
                    var context = this;
                    this._ensureSession().then(function _relocate2() {
                        var remoteSession = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager).lrcSession;
                        if (remoteSession.sessionState !== MSEPlatform.LivingRoomCompanion.SessionState.connected)
                            return;
                        remoteSession.sessionState = MSEPlatform.LivingRoomCompanion.SessionState.transferringToRemote;
                        function onRelocateTimeout() {
                            remoteSession.unbind("currentTitleId", onRemoteTitleChanged);
                            remoteSession.sessionState = MSEPlatform.LivingRoomCompanion.SessionState.error
                        }
                        var relocateTimeoutHandle = WinJS.Promise.timeout(30000).then(function relocateError() {
                                onRelocateTimeout()
                            });
                        function onRemoteTitleChanged(remoteTitle) {
                            if (remoteTitle === titleId) {
                                relocateTimeoutHandle.cancel();
                                remoteSession.unbind("currentTitleId", onRemoteTitleChanged);
                                if (remoteSession.sessionState === MSEPlatform.LivingRoomCompanion.SessionState.transferringToRemote)
                                    remoteSession.sessionState = MSEPlatform.LivingRoomCompanion.SessionState.connected
                            }
                        }
                        remoteSession.bind("currentTitleId", onRemoteTitleChanged);
                        remoteSession.setDataSource(context.currentMedia).then(function relocate2Remote() {
                            remoteSession.playAt(titleId, context.currentPosition)
                        })
                    })
                }, _restoreSessionState: function PlaybackSession_restoreSessionState() {
                    var shuffle = false;
                    var repeat = false;
                    try {
                        var settings = Windows.Storage.ApplicationData.current.localSettings;
                        shuffle = settings.values["shuffle"] || false;
                        repeat = settings.values["repeat"] || false
                    }
                    catch(e) {}
                    this._playlist.shuffle = shuffle;
                    this._playlist.repeat = repeat
                }, _saveSessionStateValue: function PlaybackSession_saveSessionStateValue(key, value) {
                    var settingsStorage = Windows.Storage.ApplicationData.current.localSettings;
                    settingsStorage.values[key] = value
                }, _ensureSession: function PlaybackSession_ensureSession() {
                    if (!this._playbackControl)
                        throw"PlaybackSession_ensureSession: Error! PlaybackControl not created.";
                    return this._sessionInitializedPromise
                }, _onPlaylistMediaChanged: function PlaybackSession_onPlaylistMediaChanged(e) {
                    var newMediaItem = (e && e.detail) ? e.detail.newValue : null;
                    if (!newMediaItem)
                        return;
                    this._updateCurrentMedia();
                    this.canTransfer = false;
                    if (this._canTransferMediaItemPromise) {
                        this._canTransferMediaItemPromise.cancel();
                        this._canTransferMediaItemPromise = null
                    }
                    var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    this._canTransferMediaItemPromise = sessionMgr.canTransferMediaItemAsync(newMediaItem, MSEPlatform.Playback.WellKnownPlaybackSessionId.nowPlaying, MSEPlatform.Playback.WellKnownPlaybackSessionId.remoteLRC);
                    var onPromiseComplete = function canTransferMediaItemAsync_complete(canTransfer) {
                            this.canTransfer = canTransfer;
                            this._canTransferMediaItemPromise = null
                        }.bind(this);
                    this._canTransferMediaItemPromise.then(onPromiseComplete, function canTransferMediaItemAsync_error(e) {
                        onPromiseComplete(false)
                    }.bind(this))
                }, _onAudioAdChanged: function _onAudioAdChanged() {
                    this.canSeek = !this.isAudioAd;
                    this._updateCanSkipBackward();
                    this._updateCanSkipForward();
                    this._updateCurrentMedia()
                }, _updateCanSkipBackward: function _updateCanSkipBackward() {
                    var canSkip = !this._iPlayback.isAudioAd;
                    if (canSkip !== this.canSkipBackward)
                        this.canSkipBackward = canSkip
                }, _updateCanSkipForward: function _updateCanSkipForward() {
                    var canSkip = true;
                    if (canSkip !== this.canSkipForward)
                        this.canSkipForward = canSkip
                }, _updateCurrentMedia: function _updateCurrentMedia() {
                    if (this._iPlayback._player._currentMedia && this._iPlayback._player._currentMedia._mediaItem)
                        this.currentMedia = this._iPlayback._player._currentMedia._mediaItem.data
                }, _onPlayerStateChanged: function _onPlayerStateChanged(){}, companionExperience: {get: function PlaybackSession_companionExperience_get() {
                        return this._companionExperience
                    }}, skipFwd: function PlaybackSession_skipFwd() {
                    MS.Entertainment.Platform.Playback.assert(this.canSkipForward, "skipFwd() should not be called if canSkipForward is false");
                    this._playlist.skipFwd()
                }, skipBack: function PlaybackSession_skipBack() {
                    MS.Entertainment.Platform.Playback.assert(this.canSkipBackward, "skipBack() should not be called if canSkipBackward is false");
                    if (this.currentPosition <= 5000 && this._playlist.canSkipBackward)
                        this._playlist.skipBack();
                    else
                        this._iPlayback.seekToPosition(0)
                }, _sessionId: null, _sessionInitializedPromise: null, _setDataSourcePromise: WinJS.Promise.as(), _companionExperience: null, _canTransferMediaItemPromise: null
        };
    WinJS.Namespace.defineWithParent(MSEPlatform, "Playback", {PlaybackSessionBase: WinJS.Class.mix(function mixConstructor(){}, MS.Entertainment.UI.Framework.EventMixin, MS.Entertainment.UI.Framework.UpdatePropertyMixin, playbackSessionMixin, playbackControlMixin, playlistMixin, ccRendererMixin, WinJS.Binding.mixin)});
    WinJS.Namespace.defineWithParent(MSEPlatform, "Playback", {PlaybackSession: WinJS.Class.derive(MSEPlatform.Playback.PlaybackSessionBase, function playbackSession_constructor(id) {
            var completePromise;
            this._initObservable({});
            this._sessionInitializedPromise = new WinJS.Promise(function(c, e, p) {
                completePromise = c
            });
            this._sessionId = (!id ? MSEPlatform.SessionManager._createSessionId() : id);
            this._playbackControlCreateInstance();
            this._signOutHandlerBound = this._signOutHandler.bind(this);
            var onPlaybackSessionInitialized = function() {
                    var isInitialized;
                    if (this._playbackControlEvents) {
                        this._playbackControlEvents.cancel();
                        this._playbackControlEvents = null;
                        isInitialized = true
                    }
                    if (isInitialized) {
                        this._playlistCreateInstance();
                        this._iPlayback = this._playbackControl.getPlaybackInterface();
                        this._playlist.setPlaybackControl(this._iPlayback);
                        MS.Entertainment.ProxyHelpers.proxyProperties(this, this._iPlayback, ["targetTransportState", "autoPlay", "muted"]);
                        MS.Entertainment.ProxyHelpers.proxyObservables(this, this._iPlayback, ["playerState", "currentTransportState", "isAudioAd", "isPreview", "duration", "currentPosition", "videoWidth", "videoHeight", "errorDescriptor", "playbackRate", "minPlaybackRate", "maxPlaybackRate", "isRemoteSessionRunning"]);
                        MS.Entertainment.ProxyHelpers.delegateFunctions(this, this._iPlayback, ["seekToPosition", "fastFwd", "fastReverse", "slowFwd", "slowReverse", "enableTimeUpdate", "disableTimeUpdate", "forceTimeUpdate", "isRemoteSession", "notifyNetworkConnectionChanged"]);
                        MS.Entertainment.ProxyHelpers.proxyProperties(this, this._playlist, ["first"]);
                        MS.Entertainment.ProxyHelpers.proxyObservables(this, this._playlist, ["shuffle", "repeat", "mediaCollection", "currentOrdinal", "smartDJSeed"]);
                        MS.Entertainment.ProxyHelpers.delegateFunctions(this, this._playlist, ["before", "after", "savePlaylist", "insertAtEnd"]);
                        this._playLog = new MS.Entertainment.Platform.Playback.PlayLog(this._iPlayback);
                        this._concurrentStreamingRestriction = new MS.Entertainment.Platform.Playback.ConcurrentStreamingRestriction(this._iPlayback);
                        this._playlist.addEventListener("currentMediaChanged", this._onPlaylistMediaChanged.bind(this));
                        completePromise();
                        MS.Entertainment.Platform.Playback.Etw.traceSessionInitialized();
                        this._restoreSessionState();
                        this._iPlayback.bind("isAudioAd", this._onAudioAdChanged.bind(this));
                        this._iPlayback.bind("playerState", this._onPlayerStateChanged.bind(this));
                        this._playlist.bind("canSkipBackward", this._updateCanSkipBackward.bind(this));
                        this._playlist.bind("canSkipForward", this._updateCanSkipForward.bind(this))
                    }
                }.bind(this);
            if (this._playbackControl.controlInitialized)
                onPlaybackSessionInitialized();
            else
                this._playbackControlEvents = MS.Entertainment.Utilities.addEventHandlers(this._playbackControl, {onControlInitialized: onPlaybackSessionInitialized})
        }, {
            canShuffle: MS.Entertainment.UI.Framework.observableProperty("canShuffle", true), canRepeat: MS.Entertainment.UI.Framework.observableProperty("canRepeat", false), canTransfer: MS.Entertainment.UI.Framework.observableProperty("canTransfer", false), canControlMedia: MS.Entertainment.UI.Framework.observableProperty("canControlMedia", true), canFastForward: MS.Entertainment.UI.Framework.observableProperty("canFastForward", false), canSlowForward: MS.Entertainment.UI.Framework.observableProperty("canSlowForward", false), canFastReverse: MS.Entertainment.UI.Framework.observableProperty("canFastReverse", false), canSlowReverse: MS.Entertainment.UI.Framework.observableProperty("canSlowReverse", false), canSeek: MS.Entertainment.UI.Framework.observableProperty("canSeek", true), currentMedia: MS.Entertainment.UI.Framework.observableProperty("currentMedia", null), canSkipBackward: MS.Entertainment.UI.Framework.observableProperty("canSkipBackward", true), canSkipForward: MS.Entertainment.UI.Framework.observableProperty("canSkipForward", true), lastPlayedMedia: MS.Entertainment.UI.Framework.observableProperty("lastPlayedMedia", null), lastPlayedDuration: MS.Entertainment.UI.Framework.observableProperty("lastPlayedDuration", 0), lastPlayedPosition: MS.Entertainment.UI.Framework.observableProperty("lastPlayedPosition", 0), _signOutHandlerBound: null, _signInBound: false, _signOutHandler: function _signOutHandler() {
                    var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                    if (!signIn.isSignedIn)
                        this.setLastPlayedMedia(null)
                }, setLastPlayedMedia: function setLastPlayedMedia(media) {
                    var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                    if (media && signIn.isSignedIn) {
                        if (!this._signInBound) {
                            signIn.bind("isSignedIn", this._signOutHandlerBound);
                            this._signInBound = true
                        }
                    }
                    else if (this._signInBound) {
                        signIn.unbind("isSignedIn", this._signOutHandlerBound);
                        this._signInBound = false
                    }
                    MS.Entertainment.Platform.Playback.assert(media === null || media === this.currentMedia, "setLastPlayedMedia called with something other than currentMedia");
                    this.lastPlayedMedia = media;
                    this.lastPlayedDuration = (media === null) ? 0 : this.duration;
                    this.lastPlayedPosition = (media === null) ? 0 : this.currentPosition
                }
        }, {isPlaybackSession: function isPlaybackSession(object) {
                return MS.Entertainment.Platform.Playback.PlaybackSession.prototype.isPrototypeOf(object)
            }})})
})()
