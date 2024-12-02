/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function() {
    "use strict";
    var MSEPlatform = WinJS.Namespace.define("MS.Entertainment.Platform", null);
    WinJS.Namespace.defineWithParent(MSEPlatform, "LivingRoomCompanion", {
        BrowserUrlState: {
            updated: "updated", updating: "updating"
        }, BrowserInputMode: {
                browser: "browser", dpad: "dpad"
            }, SessionState: {
                unInitialize: "unInitialize", disconnecting: "disconnecting", disconnected: "disconnected", connecting: "connecting", connected: "connected", transferringToRemote: "transferringToRemote", transferringToLocal: "transferringToLocal", error: "error", connectedTemporaryError: "connectedTemporaryError"
            }, AppLifetime: {
                none: "none", suspending: "suspending", resuming: "resuming", running: "running", shutdown: "shutdown"
            }, WellKnownTitleId: {
                ze: 1481115739, hu: 810026961, nx: 960956369, dd: 4294838225, mc: 1480918995, bb: 1481115776
            }, LaunchFirstAction: {
                playNow: "PlayNow", addNow: "AddNow"
            }
    });
    WinJS.Namespace.defineWithParent(MSEPlatform, "LivingRoomCompanion", {VideoScrubberObservables: MS.Entertainment.defineObservable(function VideoScrubberObservables_constructor(){}, {
            canScrub: false, scrubActive: false
        })});
    WinJS.Namespace.defineWithParent(MSEPlatform, "LivingRoomCompanion", {VideoScrubber: WinJS.Class.derive(MSEPlatform.LivingRoomCompanion.VideoScrubberObservables, function LRCVideoScrubber_constructor() {
            MSEPlatform.LivingRoomCompanion.VideoScrubberObservables.prototype.constructor.call(this)
        }, {
            pausePlaybackWhileScrubbing: true, minScrubStep: 5000, thumbnailDiv: null, scrubPosition: 0
        }, {})});
    WinJS.Namespace.defineWithParent(MSEPlatform, "LivingRoomCompanion", {ObservablePlaylistShape: MS.Entertainment.defineObservable(function ObservablePlaylistShape_constructor(){}, {
            currentOrdinal: null, canSkipBackward: false, canSkipForward: false, shuffle: false, repeat: false, mediaCollection: null
        })});
    WinJS.Namespace.defineWithParent(MSEPlatform, "LivingRoomCompanion", {Playlist: WinJS.Class.derive(MSEPlatform.LivingRoomCompanion.ObservablePlaylistShape, function LRCPlaylist_constructor() {
            MSEPlatform.LivingRoomCompanion.ObservablePlaylistShape.prototype.constructor.call(this)
        }, {
            first: null, setPlaybackControl: function LRCPlaylist_setPlaybackControl(iPlayback) {
                    this._noop()
                }, before: function LRCPlaylist_before() {
                    this._noop()
                }, after: function LRCPlaylist_after() {
                    this._noop()
                }, savePlaylist: function LRCPlaylist_savePlaylist() {
                    this._noop()
                }, _noop: function LRCPlaylist_noop(){}
        }, {})});
    WinJS.Namespace.defineWithParent(MSEPlatform, "LivingRoomCompanion", {Service: WinJS.Class.define(null, null, {
            getEnvironment: (function _getEnvironmentClosure() {
                var selectedEnvironment = null;
                return function _getEnvironmentWorker() {
                        if (selectedEnvironment === null) {
                            selectedEnvironment = Microsoft.Xbox.LRC.XmediaEnvironment.public;
                            var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                            var lrcEnvironment = configurationManager.playback.xmediaEnvironment.toUpperCase();
                            switch (lrcEnvironment) {
                                case"VINT":
                                    selectedEnvironment = Microsoft.Xbox.LRC.XmediaEnvironment.vint;
                                    break;
                                case"PART":
                                case"PARTNERNET":
                                    selectedEnvironment = Microsoft.Xbox.LRC.XmediaEnvironment.partnerNet;
                                    break;
                                case"PROD":
                                default:
                                    selectedEnvironment = Microsoft.Xbox.LRC.XmediaEnvironment.public;
                                    break
                            }
                        }
                        return selectedEnvironment
                    }
            })(), getEnvironmentString: function _getEnvironmentString() {
                    var result = "";
                    var selectedEnvironment = MS.Entertainment.Platform.LivingRoomCompanion.Service.getEnvironment();
                    switch (selectedEnvironment) {
                        case Microsoft.Xbox.LRC.XmediaEnvironment.vint:
                            result = ".vint";
                            break;
                        case Microsoft.Xbox.LRC.XmediaEnvironment.partnerNet:
                            result = ".part";
                            break;
                        case Microsoft.Xbox.LRC.XmediaEnvironment.public:
                        default:
                            result = "";
                            break
                    }
                    return result
                }, getService: (function _getServiceClosure() {
                    var lrcService = null;
                    return function _getServiceWorker(disableServiceInstantiation) {
                            if (!lrcService && !disableServiceInstantiation) {
                                var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                                var selectedEnvironment = MS.Entertainment.Platform.LivingRoomCompanion.Service.getEnvironment();
                                var selectedTransport = Microsoft.Xbox.LRC.XmediaTransport.cloud;
                                if (configurationManager.playback.allowLRCSubnetTransport)
                                    selectedTransport = Microsoft.Xbox.LRC.XmediaTransport.hybrid;
                                lrcService = Microsoft.Xbox.LRC.XmediaCloudService.create(selectedTransport, selectedEnvironment)
                            }
                            return lrcService
                        }
                })(), isServiceInstantiated: function _isServiceInstantiated() {
                    return !!MS.Entertainment.Platform.LivingRoomCompanion.Service.getService(true)
                }, notifyOnAppLifetimeEvent: function _notifyOnAppLifetimeEvent(appLifeTimeEvent) {
                    switch (appLifeTimeEvent) {
                        case Microsoft.Xbox.LRC.XmediaAppLifetimeEvent.appHidden:
                        case Microsoft.Xbox.LRC.XmediaAppLifetimeEvent.suspend:
                            MSEPlatform.LivingRoomCompanion.Service._lastSuspendTime = Date.now();
                            MSEPlatform.LivingRoomCompanion.Service._appLifetime = MSEPlatform.LivingRoomCompanion.AppLifetime.suspending;
                            MS.Entertainment.UI.Controls.XBoxControls.hide();
                            break;
                        case Microsoft.Xbox.LRC.XmediaAppLifetimeEvent.appVisible:
                        case Microsoft.Xbox.LRC.XmediaAppLifetimeEvent.resume:
                            MSEPlatform.LivingRoomCompanion.Service._lastResumeTime = Date.now();
                            MSEPlatform.LivingRoomCompanion.Service._appLifetime = MSEPlatform.LivingRoomCompanion.AppLifetime.resuming;
                            MS.Entertainment.UI.Controls.XBoxControls.hide();
                            break;
                        case Microsoft.Xbox.LRC.XmediaAppLifetimeEvent.shutdown:
                            MSEPlatform.LivingRoomCompanion.Service._lastShutdownTime = Date.now();
                            MSEPlatform.LivingRoomCompanion.Service._appLifetime = MSEPlatform.LivingRoomCompanion.AppLifetime.shutdown;
                            break
                    }
                    if (MS.Entertainment.Platform.LivingRoomCompanion.Service.isServiceInstantiated())
                        Microsoft.Xbox.LRC.XmediaCloudService.notifyOnAppLifetimeEvent(appLifeTimeEvent)
                }, _appLifetime: MSEPlatform.LivingRoomCompanion.AppLifetime.none, appLifetime: {get: function lrcService_appLifetime_get() {
                        return MSEPlatform.LivingRoomCompanion.Service._appLifetime
                    }}, _lastResumeTime: null, lastResumeTime: {get: function lrcService_lastResumeTime_get() {
                        return MSEPlatform.LivingRoomCompanion.Service._lastResumeTime
                    }}, _lastSuspendTime: null, lastSuspendTime: {get: function lrcService_lastSuspendTime_get() {
                        return MSEPlatform.LivingRoomCompanion.Service._lastSuspendTime
                    }}, _lastShutdownTime: null, lastShutdownTime: {get: function lrcService_lastShutdownTime_get() {
                        return MSEPlatform.LivingRoomCompanion.Service._lastShutdownTime
                    }}
        })});
    var playbackControlMixin = {
            _playbackControlCreateInstance: function _playbackControlCreateInstance() {
                if (!this._playbackControl) {
                    var parkedLrcContainer = document.createElement("div");
                    WinJS.Utilities.addClass(parkedLrcContainer, "removeFromDisplay");
                    document.body.appendChild(parkedLrcContainer);
                    this._playbackControl = new MSEPlatform.Playback.PlaybackControl(parkedLrcContainer.appendChild(document.createElement("div")), {playerMode: MSEPlatform.Playback.PlayerMode.remote})
                }
            }, _playbackControl: null, _iPlayback: null
        };
    var playlistMixin = {
            _playlistCreateInstance: function _playlistCreateInstance() {
                if (!this._playlist)
                    this._playlist = new MSEPlatform.LivingRoomCompanion.Playlist
            }, _playlist: null
        };
    var videoScrubberMixin = {
            _videoScrubberCreateInstance: function _videoScrubberCreateInstance(iPlayback) {
                if (!this._videoScrubber)
                    this._videoScrubber = new MSEPlatform.LivingRoomCompanion.VideoScrubber
            }, _videoScrubber: null
        };
    var lrcSessionMixin = {
            browserModel: {get: function lrcSession_browserModel_get() {
                    return this._browserModel
                }}, streamingMode: {get: function lrcSession_lrcStreamingMode_get() {
                        return this._lrcStreamingMode
                    }}, sessionId: {get: function lrcSession_sessionId_get() {
                        return this._sessionId
                    }}, sessionStats: {get: function lrcSession_sessionStats_get() {
                        var result = null;
                        if (this._remoteLRCSession)
                            try {
                                result = this._remoteLRCSession.stats
                            }
                            catch(e) {
                                result = null
                            }
                        return result
                    }}, connectedDevices: {get: function lrcSession_connectedDevices_get() {
                        var result = null;
                        if (this._remoteLRCSession)
                            try {
                                result = this._remoteLRCSession.getConnectedDevices()
                            }
                            catch(e) {
                                result = null
                            }
                        return result
                    }}, isUsingLocalConnection: function lrcSession_isUsingLocalConnection_get() {
                    var result = null;
                    if (this._remoteLRCSession)
                        try {
                            result = this._remoteLRCSession.isUsingLocalConnection
                        }
                        catch(e) {
                            result = null
                        }
                    return result
                }, _isConnected: function lrcSession_isConnected() {
                    var result = null;
                    try {
                        switch (this.sessionState) {
                            case MSEPlatform.LivingRoomCompanion.SessionState.connected:
                            case MSEPlatform.LivingRoomCompanion.SessionState.connectedTemporaryError:
                                result = true;
                                break;
                            default:
                                result = false;
                                break
                        }
                    }
                    catch(e) {
                        result = null
                    }
                    return result
                }, skipFwd: function LRCPlaylist_skipFwd() {
                    this._ensureSession().then(function skipFwd2() {
                        if (this.sessionState !== MSEPlatform.LivingRoomCompanion.SessionState.connected)
                            return;
                        if (this.currentTitleId === MSEPlatform.LivingRoomCompanion.WellKnownTitleId.nx)
                            this._localLRCPlayer.fastFwd();
                        else
                            this._localLRCPlayer.skipFwd();
                        this._positionExtrapolator.forceNextSync()
                    }.bind(this))
                }, skipBack: function LRCPlaylist_skipBack() {
                    this._ensureSession().then(function skipBack2() {
                        if (this.sessionState !== MSEPlatform.LivingRoomCompanion.SessionState.connected)
                            return;
                        if (this.currentTitleId === MSEPlatform.LivingRoomCompanion.WellKnownTitleId.nx)
                            this._localLRCPlayer.rewind();
                        else
                            this._localLRCPlayer.skipBack();
                        this._positionExtrapolator.forceNextSync()
                    }.bind(this))
                }, insertAtEnd: function lrcSession_insertAtEnd(key, mediaItem) {
                    var mediaInstance = new MSEPlatform.Playback.MediaInstance({
                            source: mediaItem.serviceId, mediaType: mediaItem.mediaType, protectionState: MSEPlatform.Playback.ProtectionState.unknown, mediaItem: mediaItem
                        });
                    this._localLRCPlayer.launchMediaTitle(MSEPlatform.LivingRoomCompanion.WellKnownTitleId.ze, mediaInstance, false, 0, MSEPlatform.LivingRoomCompanion.LaunchFirstAction.addNow)
                }, setDataSource: function lrcSession_setDataSource(mediaItem, deepLinkInfo) {
                    var deepLink = deepLinkInfo ? deepLinkInfo : mediaItem.zestDeepLink;
                    this._setDataSourcePromise = new WinJS.Promise(function setDataSourceInit(c, e, p) {
                        var mediaInstance = null;
                        try {
                            mediaInstance = new MSEPlatform.Playback.MediaInstance({
                                source: deepLink, mediaType: mediaItem.mediaType, protectionState: MSEPlatform.Playback.ProtectionState.unknown, mediaItem: mediaItem
                            })
                        }
                        catch(error) {
                            e(error)
                        }
                        this._useDeepLinkForLaunch = true;
                        if (!deepLink) {
                            if (mediaItem.hasLegacyZuneId)
                                mediaInstance.source = mediaItem.legacyZuneId;
                            else
                                mediaInstance.source = mediaItem.zuneId;
                            this._useDeepLinkForLaunch = false
                        }
                        this._ensureSession().then(function setDataSource2() {
                            this._currentMediaAssetId = 0;
                            var firstCall = true;
                            var onMediaInstanceSet = function lrcSession_onMediaInstanceSet(mediaInstance) {
                                    if (firstCall) {
                                        firstCall = false;
                                        return
                                    }
                                    this._iPlayback.unbind("currentMedia", onMediaInstanceSet);
                                    c(deepLink)
                                }.bind(this);
                            this._iPlayback.bind("currentMedia", onMediaInstanceSet);
                            this._iPlayback.currentMedia = mediaInstance
                        }.bind(this))
                    }.bind(this));
                    return this._setDataSourcePromise
                }, activate: function lrcSession_activate(titleId, startTimeMsec, firstAction) {
                    try {
                        this._getXboxEventProvider().traceXboxLaunchTitleCall(titleId, parseFloat(startTimeMsec), firstAction)
                    }
                    catch(e) {}
                    this._ensureSession().then(function activate2() {
                        if (this.sessionState !== MSEPlatform.LivingRoomCompanion.SessionState.connected && this.sessionState !== MSEPlatform.LivingRoomCompanion.SessionState.transferringToRemote)
                            return;
                        this._localLRCPlayer.launchMediaTitle(titleId, null, this._useDeepLinkForLaunch, startTimeMsec, firstAction)
                    }.bind(this))
                }, deactivate: function lrcSession_deactivate() {
                    this.disconnect()
                }, relocate: function lrcSession_relocate(newHost) {
                    if (this.sessionState !== MSEPlatform.LivingRoomCompanion.SessionState.connected || this.currentMedia === null)
                        return;
                    this.sessionState = MSEPlatform.LivingRoomCompanion.SessionState.transferringToLocal;
                    var onRelocateTimeout = function lrcSession_relocate_onRelocateTimeout() {
                            this.sessionState = MSEPlatform.LivingRoomCompanion.SessionState.error
                        }.bind(this);
                    var relocateTimeoutHandle = WinJS.Promise.timeout(30000).then(function relocateError() {
                            onRelocateTimeout()
                        }.bind(this));
                    var localSession = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager).nowPlayingSession;
                    localSession.setDataSource(this.currentMedia).then(function activateLocal() {
                        localSession.playAt(0, this.currentPosition);
                        localSession.targetTransportState = this.currentTransportState;
                        localSession.relocate(newHost);
                        this.sessionState = MSEPlatform.LivingRoomCompanion.SessionState.connected;
                        relocateTimeoutHandle.cancel()
                    }.bind(this))
                }, playAt: function lrcSession_playAt(titleId, startTimeMsec, firstAction) {
                    this.activate(titleId, startTimeMsec, firstAction)
                }, _checkNetworkStatus: function lrcSession_checkNetworkStatus() {
                    var result = true;
                    var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                    switch (uiStateService.networkStatus) {
                        case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.localOnly:
                        case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.none:
                            result = false;
                            break
                    }
                    return result
                }, connectOnResume: function lrcSession_connectOnResume() {
                    if (this.sessionState === MSEPlatform.LivingRoomCompanion.SessionState.connected) {
                        var connectBinding = WinJS.Binding.bind(this, {sessionState: function onSessionStateChanged() {
                                    if (this.sessionState === MSEPlatform.LivingRoomCompanion.SessionState.disconnected || this.sessionState === MSEPlatform.LivingRoomCompanion.SessionState.error)
                                        if (connectBinding) {
                                            connectBinding.cancel();
                                            connectBinding = null;
                                            this.connect()
                                        }
                                }.bind(this)});
                        WinJS.Promise.timeout(5000).then(function onSessionStateWaitTimeout() {
                            if (connectBinding) {
                                connectBinding.cancel();
                                connectBinding = null
                            }
                        }.bind(this))
                    }
                    else if (this.sessionState !== MSEPlatform.LivingRoomCompanion.SessionState.connecting)
                        this.connect()
                }, connect: function lrcSession_connect(isRetry) {
                    var eventProvider = this._getXboxEventProvider();
                    eventProvider.traceXboxSessionConnectCall(this.sessionState, !!isRetry);
                    if (this.sessionState === MSEPlatform.LivingRoomCompanion.SessionState.connected || this.sessionState === MSEPlatform.LivingRoomCompanion.SessionState.connecting)
                        return;
                    this._reset();
                    var appSignIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                    appSignIn.signIn(false, false, true, false, false);
                    if (!isRetry)
                        this.sessionState = MSEPlatform.LivingRoomCompanion.SessionState.connecting;
                    this._ensureSession().then(function connect2() {
                        var binding = WinJS.Binding.bind(appSignIn, {
                                signInError: function signInErrorChanged() {
                                    if (appSignIn.signInError) {
                                        if (binding) {
                                            binding.cancel();
                                            binding = null
                                        }
                                        eventProvider.traceXboxSigninTMFServiceSignin("lrcSession_appSignIn:'" + " appSignIn.isSignedIn is error" + "'", appSignIn.signInError, null);
                                        this.sessionState = MSEPlatform.LivingRoomCompanion.SessionState.disconnected;
                                        this._localLRCPlayer._firePlaybackError(appSignIn.signInError, "lrcSession_connect")
                                    }
                                }.bind(this), isSignedIn: function isSignInChanged() {
                                        if (appSignIn.isSignedIn) {
                                            if (binding) {
                                                binding.cancel();
                                                binding = null
                                            }
                                            this.getXboxOnlinePresence().then(function success(info) {
                                                if (info.titleId) {
                                                    this.isCurrentMediaFromPresenceService = true;
                                                    if (!isRetry)
                                                        this._connectAndJoinSession();
                                                    this._loadSpecificMedia(info.titleId, info.mediaId)
                                                }
                                                else {
                                                    this.isCurrentMediaFromPresenceService = false;
                                                    this._loadPreviousMedia().then(function previousMediaLoaded() {
                                                        this.sessionState = MSEPlatform.LivingRoomCompanion.SessionState.disconnected
                                                    }.bind(this), function previousMediaLoadFailed(e) {
                                                        this.sessionState = MSEPlatform.LivingRoomCompanion.SessionState.disconnected
                                                    }.bind(this))
                                                }
                                            }.bind(this), function failed(e) {
                                                if (!isRetry)
                                                    this._connectAndJoinSession();
                                                this.isCurrentMediaFromPresenceService = false;
                                                this._loadPreviousMedia()
                                            }.bind(this))
                                        }
                                    }.bind(this)
                            })
                    }.bind(this))
                }, disconnect: function lrcSession_disconnect() {
                    this._unbindAppSignedInChange();
                    if (this.sessionState === MSEPlatform.LivingRoomCompanion.SessionState.disconnecting || this.sessionState === MSEPlatform.LivingRoomCompanion.SessionState.disconnected || this.sessionState === MSEPlatform.LivingRoomCompanion.SessionState.error)
                        return;
                    this._ensureSession().then(function disconnect2() {
                        if (this._remoteLRCSession) {
                            this.sessionState = MSEPlatform.LivingRoomCompanion.SessionState.disconnecting;
                            this._disconnectRemoteLRCSession().then(function disconnected() {
                                this.sessionState = MSEPlatform.LivingRoomCompanion.SessionState.disconnected
                            }.bind(this), function cantDisconnect(errorCode) {
                                this._localLRCPlayer._firePlaybackError(errorCode.number, "lrcSession_disconnect")
                            }.bind(this))
                        }
                    }.bind(this))
                }, sendCommand: function lrcSession_sendCommand(controlKey) {
                    if (this.sessionState !== MSEPlatform.LivingRoomCompanion.SessionState.connected)
                        return WinJS.Promise.wrapError("LRC session is not connected. Session state: " + this.sessionState);
                    var sendPromise = this._ensureSession().then(function sendCommand2() {
                            var result = this._localLRCPlayer._sendCommand(controlKey);
                            return result
                        }.bind(this));
                    return sendPromise
                }, testConnection: function lrcSession_testConnection() {
                    if (!this._remoteLRCSession)
                        return WinJS.Promise.wrapError(0);
                    try {
                        return this._remoteLRCSession.getMediaStateAsync()
                    }
                    catch(error) {
                        return WinJS.Promise.wrapError(error)
                    }
                }, enableTimeUpdate: function LRCPlayer_enableTimeUpdate(){}, disableTimeUpdate: function LRCPlayer_disableTimeUpdate(){}, forceTimeUpdate: function LRCPlayer_forceTimeUpdate() {
                    return this._iPlayback.currentPosition
                }, addCanvasFrame: function lrcSession_addCanvasFrame(activityUrl, canvasFrame, legalLocale, allowedUrls, allowedTitleIds, disallowedTitleIds) {
                    var resultPromise = null;
                    if (!this._remoteLRCSession)
                        resultPromise = WinJS.Promise.wrapError("no LRC session");
                    else
                        try {
                            if (this._lrcCanvasBridge) {
                                this._lrcCanvasBridge.shutdown();
                                this._lrcCanvasBridge = null
                            }
                            this._lrcCanvasBridge = new MS.Entertainment.Platform.LivingRoomCompanion.CanvasBridge(activityUrl);
                            resultPromise = this._lrcCanvasBridge.initialize(this._remoteLRCSession, this._getLRCService(), canvasFrame, legalLocale, allowedUrls, allowedTitleIds, disallowedTitleIds)
                        }
                        catch(error) {
                            resultPromise = WinJS.Promise.wrapError(error)
                        }
                    return resultPromise
                }, removeCanvasFrame: function lrcSession_removeCanvasFrame(canvasId) {
                    if (this._lrcCanvasBridge && this._lrcCanvasBridge.canvasId === canvasId) {
                        this._lrcCanvasBridge.shutdown();
                        this._lrcCanvasBridge = null
                    }
                }, _startXboxRequest: function lrcSession_startXboxRequest(createRequestPromise, beginEventData, successEventData, errorEventData) {
                    var eventProvider = this._getXboxEventProvider();
                    var getPromise = function() {
                            if (!this._remoteLRCSession)
                                return WinJS.Promise.wrapError("no LRC session");
                            try {
                                return createRequestPromise()
                            }
                            catch(error) {
                                return WinJS.Promise.wrapError(error)
                            }
                        }.bind(this);
                    var traceEvent = function(eventInfo) {
                            var eventName = (eventInfo.name || eventInfo);
                            var traceEvent = eventProvider[eventName];
                            if (traceEvent && typeof traceEvent === "function")
                                if (eventInfo.parameters)
                                    eventProvider[eventName].apply(eventProvider, eventInfo.parameters);
                                else
                                    eventProvider[eventName]()
                        }.bind(this);
                    var resultPromise = getPromise();
                    traceEvent(beginEventData);
                    resultPromise.then(function onSuccess() {
                        traceEvent(successEventData)
                    }.bind(this), function onError(error) {
                        if (!errorEventData.parameters)
                            traceEvent({
                                name: (errorEventData.name || errorEventData), parameters: [(error.number || -1), error]
                            });
                        else
                            traceEvent(errorEventData)
                    }.bind(this));
                    return resultPromise
                }, getActiveTitleInformation: function lrcSession_getActiveTitleInformation(forceTitleInformationNetworkRequest) {
                    return this._startXboxRequest(function _createActiveTitleInformationPromise() {
                            return this._remoteLRCSession.getActiveTitleInformationAsync(!!forceTitleInformationNetworkRequest)
                        }.bind(this), "traceXboxGetActiveTitleInformationBegin", "traceXboxGetActiveTitleInformationDone", "traceXboxGetActiveTitleInformationError")
                }, isTitleChannelEstablished: function lrcSession_isTitleChannelEstablished() {
                    var result = false;
                    try {
                        if (this._remoteLRCSession)
                            switch (this._remoteLRCSession.titleChannelStatus) {
                                case Microsoft.Xbox.LRC.XmediaTitleChannelStatus.establishedLocal:
                                case Microsoft.Xbox.LRC.XmediaTitleChannelStatus.establishedOverCloud:
                                    result = true;
                                    break
                            }
                    }
                    catch(e) {
                        this._logStatusMessage("Failed to get titleChannelStatus", e);
                        result = false
                    }
                    return result
                }, isLocalTitleChannelEstablished: function lrcSession_isLocalTitleChannelEstablished() {
                    var result = false;
                    try {
                        if (this._remoteLRCSession)
                            switch (this._remoteLRCSession.titleChannelStatus) {
                                case Microsoft.Xbox.LRC.XmediaTitleChannelStatus.establishedLocal:
                                    result = this._remoteLRCSession.isLocalTitleChannelEstablished;
                                    break
                            }
                    }
                    catch(e) {
                        this._logStatusMessage("Failed to get titleChannelStatus", e);
                        result = false
                    }
                    return result
                }, isTitleChannelEstablishing: function lrcSession_isTitleChannelEstablishing() {
                    var result = false;
                    try {
                        if (this._remoteLRCSession)
                            switch (this._remoteLRCSession.titleChannelStatus) {
                                case Microsoft.Xbox.LRC.XmediaTitleChannelStatus.establishing:
                                    result = true;
                                    break
                            }
                    }
                    catch(e) {
                        this._logStatusMessage("Failed to get titleChannelStatus", e);
                        result = false
                    }
                    return result
                }, establishTitleChannel: function lrcSession_establishTitleChannel(titleId, port) {
                    return this._startXboxRequest(function _createEstablishTitleChannelPromise() {
                            var remoteSession = this._remoteLRCSession;
                            titleId = parseInt(titleId);
                            return new WinJS.Promise(function establishTitleChannelWorker(c, e, p) {
                                    var tempPromise = null;
                                    try {
                                        if (!remoteSession)
                                            tempPromise = WinJS.Promise.wrapError("lrcSession is null or undefined");
                                        else if (remoteSession !== this._remoteLRCSession)
                                            tempPromise = WinJS.Promise.wrapError("lrcSession has been reassigned");
                                        else if (titleId !== remoteSession.activeTitleId)
                                            tempPromise = WinJS.Promise.wrapError("wrong title running");
                                        else if (this.isTitleChannelEstablished())
                                            tempPromise = WinJS.Promise.as();
                                        else if (this.isTitleChannelEstablishing()) {
                                            var eventPredicate = function lrcSession_establishingTitleChannelStatusEventFilter(event) {
                                                    return (event.status !== Microsoft.Xbox.LRC.XmediaTitleChannelStatus.establishing)
                                                }.bind(this);
                                            tempPromise = MS.Entertainment.Platform.LivingRoomCompanion.CanvasBridge.createWaitForEventPromise(remoteSession, "titlechannelstatuschanged", 10000, eventPredicate)
                                        }
                                        else
                                            tempPromise = remoteSession.establishTitleChannelAsync(titleId, port)
                                    }
                                    catch(error) {
                                        tempPromise = WinJS.Promise.wrapError(error)
                                    }
                                    try {
                                        tempPromise.then(function establishTitleChannelSuccess() {
                                            if (!remoteSession) {
                                                this._browserModel.titleChannelEstablished = false;
                                                e("lrcSession is null or undefined")
                                            }
                                            else if (remoteSession !== this._remoteLRCSession) {
                                                this._browserModel.titleChannelEstablished = false;
                                                e("lrcSession has been reassigned")
                                            }
                                            else if (titleId !== remoteSession.activeTitleId) {
                                                this._browserModel.titleChannelEstablished = false;
                                                e("wrong title running")
                                            }
                                            else if (this.isTitleChannelEstablished()) {
                                                this._browserModel.titleChannelEstablished = ((titleId === MSEPlatform.LivingRoomCompanion.WellKnownTitleId.bb) && this.isLocalTitleChannelEstablished());
                                                if (this._browserModel.titleChannelEstablished)
                                                    this._onLocalTitleChannelConnected();
                                                c()
                                            }
                                            else {
                                                this._browserModel.titleChannelEstablished = false;
                                                e("title channel not established")
                                            }
                                        }.bind(this), function establishTitleChannelFailed(error) {
                                            this._browserModel.titleChannelEstablished = false;
                                            this._logStatusMessage("Failed to establish title channel", error);
                                            e(error)
                                        }.bind(this))
                                    }
                                    catch(error) {
                                        this._browserModel.titleChannelEstablished = false;
                                        e(error)
                                    }
                                }.bind(this))
                        }.bind(this), "traceXboxEstablishTitleChannelBegin", "traceXboxEstablishTitleChannelDone", "traceXboxEstablishTitleChannelError")
                }, sendTouchPoints: function lrcSession_sendTouchPoints(date, touchPoints) {
                    return this._startXboxRequest(function _createSendTouchPointsPromise() {
                            return this._remoteLRCSession.sendTouchPointsAsync(date, touchPoints)
                        }.bind(this), "traceXboxSendTouchPointsBegin", "traceXboxSendTouchPointsDone", "traceXboxSendTouchPointsError")
                }, getKeyboard: function lrcSession_getKeyboard() {
                    return this._startXboxRequest(function _createGetKeyboardPromise() {
                            return this._remoteLRCSession.getKeyboardAsync()
                        }.bind(this), "traceXboxGetKeyboardBegin", "traceXboxGetKeyboardDone", "traceXboxGetKeyboardError")
                }, getKeyboardState: function lrcSession_getKeyboardState() {
                    return this._startXboxRequest(function _createGetKeyboardStatePromise() {
                            return this._remoteLRCSession.getKeyboardStateAsync()
                        }.bind(this), "traceXboxGetKeyboardStateBegin", "traceXboxGetKeyboardStateDone", "traceXboxGetKeyboardStateError")
                }, getKeyboardText: function lrcSession_getKeyboardText() {
                    return this._startXboxRequest(function _createGetKeyboardTextPromise() {
                            return this._remoteLRCSession.getKeyboardTextAsync()
                        }.bind(this), "traceXboxGetKeyboardTextBegin", "traceXboxGetKeyboardTextDone", "traceXboxGetKeyboardTextError")
                }, setKeyboardText: function lrcSession_setKeyboardTextAndSelection(text) {
                    var parametersArray = [""];
                    return this._startXboxRequest(function _createSetKeyboardTextPromise() {
                            return this._remoteLRCSession.setKeyboardTextAsync(text)
                        }.bind(this), {
                            name: "traceXboxSetKeyboardTextBegin", parameters: parametersArray
                        }, "traceXboxSetKeyboardTextDone", "traceXboxSetKeyboardTextError")
                }, setKeyboardTextAndSelection: function lrcSession_setKeyboardTextAndSelection(text, selectionStart, selectionLength) {
                    var parametersArray = ["", 0, 0];
                    return this._startXboxRequest(function _createKeyboardTextAndSelectionPromise() {
                            return this._remoteLRCSession.setKeyboardTextAndSelectionAsync(text, selectionStart, selectionLength)
                        }.bind(this), {
                            name: "traceXboxSetKeyboardTextAndSelectionBegin", parameters: parametersArray
                        }, "traceXboxSetKeyboardTextAndSelectionDone", "traceXboxSetKeyboardTextAndSelectionError")
                }, sendTitleMessage: function lrcSession_sendTitleMessage(messageString) {
                    return this._startXboxRequest(function _createSendTitleMessagePromise() {
                            return this._remoteLRCSession.sendTitleMessageAsync(messageString)
                        }.bind(this), "traceXboxSendTitleMessageBegin", "traceXboxSendTitleMessageDone", "traceXboxSendTitleMessageError")
                }, acquireExclusiveMode: function lrcSession_acquireExclusiveMode() {
                    return this._startXboxRequest(function _createAcquireExclusiveModePromise() {
                            if (MSEPlatform.LivingRoomCompanion.Service.appLifetime === MSEPlatform.LivingRoomCompanion.AppLifetime.suspending)
                                return WinJS.Promise.wrapError("can't acquire exclusive mode when App is suspended");
                            else
                                return this._remoteLRCSession.acquireExclusiveModeAsync()
                        }.bind(this), "traceXboxAcquireExclusiveModeBegin", "traceXboxAcquireExclusiveModeDone", "traceXboxAcquireExclusiveModeError")
                }, releaseExclusiveMode: function lrcSession_releaseExclusiveMode() {
                    return this._startXboxRequest(function _createReleaseExclusiveModePromise() {
                            return this._remoteLRCSession.releaseExclusiveModeAsync()
                        }.bind(this), "traceXboxReleaseExclusiveModeBegin", "traceXboxReleaseExclusiveModeDone", "traceXboxReleaseExclusiveModeError")
                }, _signIn: function lrcSession_signIn() {
                    var lrc = this._getLRCService();
                    var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    Microsoft.Xbox.LRC.XmediaCloudService.allowSignInCredentialsPrompt = configurationManager.playback.allowLRCSignInCredentialsPrompt;
                    var signInPromise = new WinJS.Promise(function(c, e, p) {
                            lrc.companionLoginAsync().then(function loginCompleted() {
                                MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager).tmfAuthToken = lrc.getProperty("TMFAuthToken");
                                c(0)
                            }.bind(this), function loginFailed(error) {
                                e(error)
                            }.bind(this))
                        }.bind(this));
                    return signInPromise
                }, _connectAndJoinSession: function lrcSession_connectAndJoinSession() {
                    this._prevMediaState = null;
                    this._lastLoggedRemoteLRCSessionStats = null;
                    var appSignIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                    this.sessionState = MSEPlatform.LivingRoomCompanion.SessionState.connecting;
                    if (!MS.Entertainment.Platform.PlaybackHelpers.isCompanionAppSignInAvailable())
                        WinJS.Promise.timeout().then(function lrcSession_unsupportedRegion() {
                            var errorCode = MSEPlatform.Playback.Error.NS_E_SIGNIN_NOT_SUPPORTED_REGION;
                            this.sessionState = MSEPlatform.LivingRoomCompanion.SessionState.disconnected;
                            this._getXboxEventProvider().traceXboxSigninTMFServiceSignin("lrcSession_connect NS_E_SIGNIN_NOT_SUPPORTED_REGION", errorCode.code, errorCode);
                            this._localLRCPlayer._firePlaybackError(errorCode, "lrcSession_connect")
                        }.bind(this));
                    else
                        this._signIn().then(function lrcSession_successSignIn() {
                            this._joinRemoteSession()
                        }.bind(this), function lrcSession_failedSignInWithOneRetry(errorCode) {
                            MS.Entertainment.Instrumentation.PerfTrack.disableAllStartupScenarios();
                            var failedSignInWorker = function _lrcSession_failedSignInWorker(errorCode, tag) {
                                    var eventProvider = this._getXboxEventProvider();
                                    var errorNumber = (errorCode.number === undefined ? errorCode : errorCode.number);
                                    this.sessionState = MSEPlatform.LivingRoomCompanion.SessionState.disconnected;
                                    if (errorNumber === MSEPlatform.Playback.Error.LRC_E_EMPTYAUTHTOKEN.code)
                                        eventProvider.traceXboxSigninTMFServiceSignin("lrcSession_connect LRC_E_EMPTYAUTHTOKEN Tag:'" + tag + "'", errorNumber, errorCode);
                                    else
                                        eventProvider.traceXboxSigninTMFServiceSignin("lrcSession_connectTag:'" + tag + "'", errorNumber, errorCode);
                                    this._localLRCPlayer._firePlaybackError(errorNumber, "lrcSession_connect")
                                }.bind(this);
                            if (appSignIn.isSignedIn)
                                failedSignInWorker(errorCode, "appSignIn.isSignedIn is true");
                            else if (appSignIn.isSigningIn) {
                                var onAppSigningInChange = function lrcSession_connect_onAppSigningInChange(isSigningIn, isSigningInOld) {
                                        if (isSigningInOld !== undefined && !isSigningIn) {
                                            appSignIn.unbind("isSigningIn", onAppSigningInChange);
                                            if (appSignIn.isSignedIn)
                                                this._signIn().then(function lrcSession_successSignIn2() {
                                                    this._joinRemoteSession()
                                                }.bind(this), function lrcSession_failedSignIn2(errorCode) {
                                                    failedSignInWorker(errorCode, "Second this._signIn() failed")
                                                }.bind(this));
                                            else
                                                failedSignInWorker(appSignIn.signInError, "Second appSignIn.isSignedIn is false")
                                        }
                                    }.bind(this);
                                appSignIn.bind("isSigningIn", onAppSigningInChange)
                            }
                            else
                                failedSignInWorker(errorCode, "appSignIn.isSignedIn and appSignIn.isSigningIn are not true")
                        }.bind(this))
                }, getXboxOnlinePresence: function lrcSession_getXboxOnlinePresence() {
                    if (this._getXboxOnlinePresencePromise)
                        return this._getXboxOnlinePresencePromise;
                    var eventProvider = this._getXboxEventProvider();
                    eventProvider.traceXboxOnlinePresenceBegin();
                    this._getXboxOnlinePresencePromise = new WinJS.Promise(function _xboxOnlinePresenceWorker(c, e, p) {
                        var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                        if (signedInUser) {
                            var xuid = parseInt(signedInUser.xuid);
                            if (xuid) {
                                var environmentString = MS.Entertainment.Platform.LivingRoomCompanion.Service.getEnvironmentString();
                                var uriPath = "https://services" + environmentString + ".xboxlive.com/users/xuid(" + xuid + ")/presence/media";
                                var token = Microsoft.Xbox.XboxLIVEService.serviceClient.token;
                                var requestOptions = {
                                        url: uriPath, headers: {
                                                Authorization: token, Accept: "application/json", "Cache-Control": "no-cache", ETag: "InvalidETagValue", "If-None-Match": "InvalidETagValue"
                                            }
                                    };
                                WinJS.xhr(requestOptions).then(function onRequestSuccess(response) {
                                    if (response.status !== 200)
                                        e("XboxLIVE request failed with HTTP Status: " + response.httpStatus);
                                    else
                                        try {
                                            var responseText = response.responseText;
                                            var jsonResponse = JSON.parse(responseText);
                                            if (jsonResponse.TitleId !== undefined && jsonResponse.MediaId !== undefined) {
                                                var titleId = parseInt(jsonResponse.TitleId);
                                                c({
                                                    titleId: titleId, mediaId: jsonResponse.MediaId, titleBoxArt: jsonResponse.TitleBoxArt, mediaAlbumBoxArt: jsonResponse.MediaAlbumBoxArt
                                                })
                                            }
                                            else
                                                e("invalid response '" + responseText + "'")
                                        }
                                        catch(ex) {
                                            e(ex)
                                        }
                                }.bind(this), function onRequestFailure(error) {
                                    e(error)
                                }.bind(this))
                            }
                            else
                                e("invalid xuid")
                        }
                        else
                            e("user not signed in")
                    }.bind(this));
                    this._getXboxOnlinePresencePromise.done(function promiseDone(info) {
                        this._getXboxOnlinePresencePromise = null;
                        eventProvider.traceXboxOnlinePresenceReceived(info.titleId, info.mediaId)
                    }.bind(this), function promiseError(error) {
                        this._getXboxOnlinePresencePromise = null;
                        eventProvider.traceXboxOnlinePresenceError((error.number || 0), error)
                    }.bind(this));
                    return this._getXboxOnlinePresencePromise
                }, _joinRemoteSession: function lrcSession_joinRemoteSession() {
                    var lrc = this._getLRCService();
                    var appSignIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                    var eventProvider = this._getXboxEventProvider();
                    var handleValidListOfUserSessions = function lrcSession_handleValidListOfUserSessions(sessions) {
                            var remoteSession = sessions.getAt(0);
                            var onAppSignInError = function lrcSession_onAppSignInError(traceTag) {
                                    var err = null;
                                    if (appSignIn.signInError) {
                                        err = appSignIn.signInError;
                                        eventProvider.traceXboxSigninX8AppSignin(traceTag, err.number, err)
                                    }
                                    else {
                                        err = MSEPlatform.Playback.Error.LRCSESSION_APP_SIGNIN_FAILED;
                                        eventProvider.traceXboxSigninX8AppSignin(traceTag, err.code, err)
                                    }
                                    this.sessionState = MSEPlatform.LivingRoomCompanion.SessionState.disconnected;
                                    this._localLRCPlayer._firePlaybackError(err, "lrcSession_joinRemoteSession")
                                }.bind(this);
                            if (appSignIn.isSigningIn || (appSignIn.isSigningIn === undefined) || (appSignIn.isSignedIn === undefined)) {
                                var onAppSigningInChange = function lrcSession_joinRemoteSession_onAppSigningInChange(isSigningIn, isSigningInOld) {
                                        if (isSigningInOld !== undefined && !isSigningIn) {
                                            appSignIn.unbind("isSigningIn", onAppSigningInChange);
                                            if (appSignIn.isSignedIn)
                                                this._connectToRemoteSession(remoteSession);
                                            else
                                                onAppSignInError("AppSignInFailedAfterTMF")
                                        }
                                    }.bind(this);
                                appSignIn.bind("isSigningIn", onAppSigningInChange)
                            }
                            else if (appSignIn.isSignedIn)
                                this._connectToRemoteSession(remoteSession);
                            else
                                onAppSignInError("AppSignInFailedBeforeTMF")
                        }.bind(this);
                    lrc.getUserSessionsAsync().then(function gotUserSessions(sessions) {
                        if (sessions && (sessions.size >= 1))
                            handleValidListOfUserSessions(sessions);
                        else {
                            var oldPollInterval = lrc.userSessionsPollInterval;
                            var foundSessions = false;
                            var finalTimeoutTimer = null;
                            var onUserSessionsUpdated = function lrcSession_onUserSessionsUpdated(sessions) {
                                    if (sessions && (sessions.size >= 1)) {
                                        lrc.removeEventListener("usersessionsupdated", onUserSessionsUpdated);
                                        lrc.userSessionsPollInterval = oldPollInterval;
                                        lrc.trackUserSessions = false;
                                        foundSessions = true;
                                        handleValidListOfUserSessions(sessions);
                                        if (finalTimeoutTimer)
                                            finalTimeoutTimer.cancel()
                                    }
                                }.bind(this);
                            var noUserSessionsCleanup = function lrcSession_noUserSessionsCleanup(traceTag) {
                                    lrc.removeEventListener("usersessionsupdated", onUserSessionsUpdated);
                                    lrc.userSessionsPollInterval = oldPollInterval;
                                    lrc.trackUserSessions = false;
                                    var err = null;
                                    if (appSignIn.signInError) {
                                        err = appSignIn.signInError;
                                        this._getXboxEventProvider().traceXboxSigninX8AppSignin(traceTag, err.number, err)
                                    }
                                    else {
                                        err = MSEPlatform.Playback.Error.LRC_E_NOXBOXCONNECTED;
                                        this._getXboxEventProvider().traceXboxSigninNoUserSessions(traceTag, err.code, err)
                                    }
                                    this._localLRCPlayer._firePlaybackError(err, "lrcSession_joinRemoteSession");
                                    this._updateSessionState(MSEPlatform.LivingRoomCompanion.SessionState.disconnected)
                                }.bind(this);
                            lrc.addEventListener("usersessionsupdated", onUserSessionsUpdated);
                            lrc.userSessionsPollInterval = 500;
                            WinJS.Promise.timeout(1000).then(function lrcSession_trackSessions() {
                                if (appSignIn.signInError)
                                    noUserSessionsCleanup("TrackSessionsTimeout1");
                                else if (!foundSessions) {
                                    lrc.trackUserSessions = true;
                                    finalTimeoutTimer = WinJS.Promise.timeout(9000).then(function lrcSession_onTrackUserSessionsTimeout() {
                                        if (!foundSessions || appSignIn.signInError)
                                            noUserSessionsCleanup("TrackSessionsTimeout2")
                                    }.bind(this))
                                }
                            }.bind(this))
                        }
                    }.bind(this), function noUserSessions(error) {
                        this._getXboxEventProvider().traceXboxSigninNoUserSessions("NoUserSessions", error.number, error);
                        this._localLRCPlayer._firePlaybackError(error, "lrcSession_joinRemoteSession");
                        this._updateSessionState(MSEPlatform.LivingRoomCompanion.SessionState.disconnected)
                    }.bind(this))
                }, _logStatusMessage: function lrcCanvasBridge_logStatusMessage(message, data) {
                    var s = message;
                    if (data)
                        if (typeof data === "object") {
                            for (var f in data)
                                if (typeof data[f] !== "object")
                                    s = s + "\n" + f + ": " + data[f]
                        }
                        else
                            s = s + "\n" + data;
                    if (this.dispatchEvent)
                        this.dispatchEvent("smartglassuxmessage", s);
                    MS.Entertainment.UI.Debug.writeLine(s)
                }, _setConsoleSettings: function lrcSession_setConsoleSettings(consoleSettings) {
                    this._lrcConsoleSettings = consoleSettings;
                    this._logStatusMessage("Xbox settings updated:", consoleSettings)
                }, _updateTitleMessagingConfiguration: function lrcSession_updateTitleMessagingConfiguration(titleMessagingInformation) {
                    this._browserModel.titleChannelEstablished = false;
                    this._lrcTitleMessagingInformation = titleMessagingInformation;
                    this._logStatusMessage("Xbox title messaging information updated:", titleMessagingInformation);
                    if (titleMessagingInformation.enabled)
                        this.establishTitleChannel(titleMessagingInformation.titleId, titleMessagingInformation.port);
                    if (this.dispatchEvent)
                        this.dispatchEvent("titlemessagingconfigchanged", {
                            titleId: titleMessagingInformation.titleId, port: titleMessagingInformation.port, enabled: titleMessagingInformation.enabled
                        })
                }, _updateStreamingMode: function lrcSession_updateStreamingMode(streamingMode) {
                    this._lrcStreamingMode = streamingMode;
                    this._logStatusMessage("Xbox streaming mode updated:", streamingMode);
                    if (this.dispatchEvent)
                        this.dispatchEvent("streamingmodechanged", {
                            clientExclusiveModeStatus: streamingMode.clientExclusiveModeStatus, consoleExclusiveModeStatus: streamingMode.consoleExclusiveModeStatus
                        })
                }, _updateKeyboardState: function lrcSession_updateKeyboardState(keyboardState) {
                    this._lrcKeyboardState = keyboardState;
                    this._logStatusMessage("Xbox keyboard state updated:", keyboardState);
                    if (this.dispatchEvent)
                        this.dispatchEvent("keyboardstatechanged", keyboardState)
                }, _updateKeyboardTextBlock: function lrcSession_updateKeyboardState(textBlock) {
                    this._logStatusMessage("Xbox keyboard text block updated", textBlock)
                }, _updateKeyboard: function lrcSession_updateKeyboard(state) {
                    this._logStatusMessage("Xbox keyboard updated", state);
                    if (this.dispatchEvent)
                        this.dispatchEvent("keyboard", state)
                }, _connectionTestTick: function lrcSession_connectionTestTick(firstRunTimeoutMilliseconds) {
                    if (this._connectionTestTimer)
                        this._connectionTestTimer.cancel();
                    if (!this._remoteLRCSession)
                        return;
                    if (firstRunTimeoutMilliseconds === undefined)
                        firstRunTimeoutMilliseconds = 31991;
                    var originalRemoteLRCSession = this._remoteLRCSession;
                    this._connectionTestTimer = WinJS.Promise.timeout(firstRunTimeoutMilliseconds).then(function lrcSession_checkConnection() {
                        if (this.sessionState === MSEPlatform.LivingRoomCompanion.SessionState.connected) {
                            this.testConnection().then(null, function onTestConnectionFailed(e) {
                                var sessionObjectReassigned = (originalRemoteLRCSession !== this._remoteLRCSession);
                                try {
                                    this._getXboxEventProvider().traceXboxHeartBeatPingError((e.number ? e.number : ((typeof(e) === "number") ? e : -1)), e, this.sessionState, sessionObjectReassigned, !this._remoteLRCSession)
                                }
                                catch(e) {}
                                if (!sessionObjectReassigned)
                                    this._onLRCSessionEvents({
                                        type: "devicedisconnected", deviceType: Microsoft.Xbox.LRC.DeviceType.xbox360
                                    })
                            }.bind(this));
                            if (this._remoteLRCSession) {
                                var newStats = this.sessionStats;
                                if (newStats) {
                                    var prevStats = this._lastLoggedRemoteLRCSessionStats;
                                    if (prevStats === null || (prevStats.duration > newStats.duration) || (prevStats.duration + (30 * 60 * 1000) <= newStats.duration)) {
                                        WinJS.Promise.timeout().then(function lrcSession__connectionTestTickTelemetry() {
                                            MS.Entertainment.Utilities.Telemetry.logCompanionSessionStats(newStats, "Tick")
                                        }.bind(this));
                                        this._lastLoggedRemoteLRCSessionStats = newStats
                                    }
                                }
                            }
                        }
                        WinJS.Promise.timeout().then(function lrcSession_connectionTestTickDeferredInvoke() {
                            this._connectionTestTick()
                        }.bind(this))
                    }.bind(this))
                }, _fixStateOnSeek: function lrcSession_fixStateOnSeek(seekPosition) {
                    if (this._fixStateOnSeekPromise) {
                        this._fixStateOnSeekPromise.cancel();
                        this._fixStateOnSeekPromise = null
                    }
                    this._lastSeekCompletedTime = new Date;
                    this._playbackPositionBeforeLastSeek = (this._prevMediaState ? this._prevMediaState.position : null);
                    this._lastSeekPosition = seekPosition;
                    if (this._prevMediaState && (seekPosition > this._prevMediaState.minimumSeekPosition && seekPosition < this._prevMediaState.maximumSeekPosition)) {
                        var mediaState = {
                                titleId: this._prevMediaState.titleId, mediaAssetId: this._prevMediaState.mediaAssetId, duration: this._prevMediaState.duration, position: seekPosition, minimumSeekPosition: this._prevMediaState.minimumSeekPosition, maximumSeekPosition: this._prevMediaState.maximumSeekPosition, rate: this._prevMediaState.rate, mediaTransportState: this._prevMediaState.mediaTransportState, mediaTransportCapabilities: this._prevMediaState.mediaTransportCapabilities, durationSeconds: this._prevMediaState.durationSeconds, positionSeconds: (seekPosition * 1e-7), minimumSeekPositionSeconds: this._prevMediaState.minimumSeekPositionSeconds, maximumSeekPositionSeconds: this._prevMediaState.maximumSeekPositionSeconds, source: this._prevMediaState.source, responseCode: this._prevMediaState.responseCode
                            };
                        this._updateMediaStates(mediaState)
                    }
                    this._fixStateOnSeekPromise = WinJS.Promise.timeout(5000).then(function lrcSession_deferredFixStateOnSeek() {
                        var timesToRepeat = 3;
                        var onePingAction = null;
                        onePingAction = function lrcSession_deferredFixStateOnSeekOneIteration() {
                            this._connectionTestTick(0);
                            if (timesToRepeat > 0) {
                                --timesToRepeat;
                                this._fixStateOnSeekPromise = WinJS.Promise.timeout(2000).then(onePingAction)
                            }
                            else
                                this._fixStateOnSeekPromise = null
                        }.bind(this);
                        onePingAction()
                    }.bind(this))
                }, _onAppSignedInChangeBound: null, _onAppSignedInChange: function lrcSession_onAppSignedInChange(isSignedIn, isSignedInOld) {
                    if (!isSignedIn && isSignedInOld) {
                        this._unbindAppSignedInChange();
                        this.disconnect()
                    }
                }, _unbindAppSignedInChange: function lrcSession_unbindAppSignedInChange() {
                    if (this._onAppSignedInChangeBound) {
                        var appSignIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                        appSignIn.unbind("isSignedIn", this._onAppSignedInChangeBound);
                        this._onAppSignedInChangeBound = null
                    }
                }, _bindAppSignedInChange: function lrcSession_bindAppSignedInChange() {
                    this._unbindAppSignedInChange();
                    var appSignIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                    this._onAppSignedInChangeBound = this._onAppSignedInChange.bind(this);
                    appSignIn.bind("isSignedIn", this._onAppSignedInChangeBound)
                }, trapErrors: function lrcSession_trapErrors(promise) {
                    if (promise)
                        promise.then(function onSuccess(){}.bind(this), function onError(error) {
                            error = error
                        }.bind(this))
                }, _connectToRemoteSession: function lrcSession_connectToRemoteSession(sessionInfo) {
                    var lrc = this._getLRCService();
                    this._bindAppSignedInChange();
                    lrc.connectToSessionAsync(sessionInfo).then(function connectedToSession(session) {
                        if (session) {
                            this._setRemoteLRCSession(session);
                            this._localLRCPlayer._setRemoteLRCSession(this);
                            if (this._lrcCanvasBridge)
                                this._lrcCanvasBridge.setLRCSession(session);
                            this._connectionTestTick();
                            MS.Entertainment.Utilities.Telemetry.logCompanionConnectedToSession()
                        }
                    }.bind(this), function notConnectedToSession(error) {
                        this._getXboxEventProvider().traceXboxSigninJoinSession("NotConnectedToSession", error.number, error);
                        this._localLRCPlayer._firePlaybackError(error, "lrcSession_connectToRemoteSession");
                        this._updateSessionState(MSEPlatform.LivingRoomCompanion.SessionState.disconnected)
                    }.bind(this))
                }, _getCurrentMediaStates: function lrcSession_getCurrentMediaStates() {
                    if (this._remoteLRCSession) {
                        var startTime = new Date;
                        try {
                            this._remoteLRCSession.getMediaStateAsync().then(function gotMediaState(states) {
                                this._updateMediaStates(states)
                            }.bind(this), function getMediaStateError(error) {
                                var stopTime = new Date;
                                var durationMsec = stopTime.valueOf() - startTime.valueOf();
                                this._getXboxEventProvider().traceXboxGetMediaStateError(durationMsec, error.number)
                            }.bind(this))
                        }
                        catch(e) {
                            var stopTime = new Date;
                            var durationMsec = stopTime.valueOf() - startTime.valueOf();
                            this._getXboxEventProvider().traceXboxGetMediaStateError(durationMsec, -1)
                        }
                    }
                }, _applyRemoteLRCSessionEventsAction: function lrcSession_applyRemoteLRCSessionEventsAction(action) {
                    action("deviceconnected");
                    action("titlechanged");
                    action("keyboard");
                    action("mediastateupdated");
                    action("devicedisconnected");
                    action("statuschanged");
                    action("localtransportstatechanged");
                    action("titlemessage");
                    action("keyboardstatechanged");
                    action("keyboardtextblock");
                    action("titlemessagingconfigchanged");
                    action("streamingmodechanged");
                    action("titlechannelstatuschanged")
                }, _subscribeToRemoteLRCSessionEvents: function lrcSession_subscribeToRemoteLRCSessionEvents(remoteLRCSession) {
                    if (!this._onLRCSessionEventsBound)
                        this._onLRCSessionEventsBound = this._onLRCSessionEvents.bind(this);
                    this._applyRemoteLRCSessionEventsAction(function lrcSession_subscribeToSessionEvent(eventName) {
                        remoteLRCSession.addEventListener(eventName, this._onLRCSessionEventsBound)
                    }.bind(this))
                }, _unsubscribeFromRemoteLRCSessionEvents: function lrcSession_unsubscribeFromRemoteLRCSessionEvents(remoteLRCSession) {
                    if (this._onLRCSessionEventsBound)
                        this._applyRemoteLRCSessionEventsAction(function lrcSession_unsubscribeFromSessionEvent(eventName) {
                            remoteLRCSession.removeEventListener(eventName, this._onLRCSessionEventsBound)
                        }.bind(this))
                }, _onLRCSessionEvents: function lrcSession_onLRCSessionEvents(event) {
                    var eventProvider = this._getXboxEventProvider();
                    switch (event.type) {
                        case"deviceconnected":
                            if (event.deviceType === Microsoft.Xbox.LRC.DeviceType.xbox360) {
                                this.currentMedia = null;
                                this._currentMediaAssetId = 0;
                                this._updateSessionState(MSEPlatform.LivingRoomCompanion.SessionState.connected);
                                this._getCurrentMediaStates();
                                if (this._iPlayback.currentTransportState !== MSEPlatform.Playback.TransportState.unInitialize)
                                    this._updatePlayerState(MSEPlatform.Playback.PlayerState.ready);
                                this._onSessionConnected()
                            }
                            break;
                        case"devicedisconnected":
                            if (event.deviceType === Microsoft.Xbox.LRC.DeviceType.xbox360) {
                                this._updateSessionState(MSEPlatform.LivingRoomCompanion.SessionState.disconnected);
                                this._updatePlayerState(MSEPlatform.Playback.PlayerState.notReady);
                                this._positionExtrapolator.stop()
                            }
                            break;
                        case"titlechanged":
                            eventProvider.traceXboxTitleChanged(event.titleId);
                            MS.Entertainment.UI.Debug.writeLine("titleChanged, titleId = " + event.titleId);
                            this._browserModel.titleChannelEstablished = false;
                            if (event.titleId > 0) {
                                var delayUpdateTitleMsec = 0;
                                if (this.currentMedia && this.currentMedia.mediaType === Microsoft.Entertainment.Queries.ObjectType.track)
                                    delayUpdateTitleMsec = 5000;
                                this._updateTitleId(event.titleId, delayUpdateTitleMsec);
                                this.currentMedia = null;
                                this._currentMediaAssetId = 0;
                                this._positionExtrapolator.stop();
                                this._iPlayback.reset(true);
                                this.canControlMedia = false;
                                this.canTransfer = false;
                                this.canFastForward = false;
                                this.canFastReverse = false;
                                this.canSeek = false
                            }
                            break;
                        case"mediastateupdated":
                            this._connectionTestTick();
                            this._updateMediaStates(event);
                            break;
                        case"titlemessage":
                            this._onTitleMessage(event);
                            break;
                        case"statuschanged":
                            eventProvider.traceXboxSessionStatusChanged(event.sessionStatus);
                            this._connectionTestTick();
                            this._updateSessionState(this._mapToSessionState(event.sessionStatus));
                            if (event.sessionStatus === Microsoft.Xbox.LRC.SessionStatus.disconnected || event.sessionStatus === Microsoft.Xbox.LRC.SessionStatus.faulted)
                                if ((new Date) - this._lastDisconnectedRetry > 30000) {
                                    this._lastDisconnectedRetry = new Date;
                                    this.connect(false)
                                }
                                else
                                    this.connect(true);
                            break;
                        case"localtransportstatechanged":
                            eventProvider.traceXboxLocalTransportStateChanged(event.connected);
                            this._onLocalTransportStateChanged(event);
                            break;
                        case"keyboardstatechanged":
                            this._updateKeyboardState(event);
                            break;
                        case"titlemessagingconfigchanged":
                            eventProvider.traceXboxTitleMessagingConfigChanged(event.titleId, event.port, event.enabled);
                            this._updateTitleMessagingConfiguration(event);
                            break;
                        case"streamingmodechanged":
                            eventProvider.traceXboxStreamingModeChanged(event.clientExclusiveModeStatus, event.consoleExclusiveModeStatus);
                            this._updateStreamingMode(event);
                            break;
                        case"titlechannelstatuschanged":
                            eventProvider.traceXboxTitleChannelStatusChanged(event.status, event.titleId, event.port, event.errorCode);
                            this._onTitleChannelStatusChanged(event);
                            break;
                        case"keyboardtextblock":
                            this._updateKeyboardTextBlock(event);
                            break;
                        case"keyboard":
                            this._updateKeyboard(event);
                            break
                    }
                }, _getLRCService: function lrcSession_getLRCService() {
                    return MS.Entertainment.Platform.LivingRoomCompanion.Service.getService()
                }, _secToMSec: function lrcSession_secToMSec(sec) {
                    return sec * 1000
                }, _mapToSessionState: (function lrcSession_mapToSessionState_closure() {
                    var statusMap = null;
                    return function lrcSession_mapToSessionState(nativeStatus) {
                            if (!statusMap) {
                                statusMap = {};
                                statusMap[Microsoft.Xbox.LRC.SessionStatus.invalid] = MSEPlatform.LivingRoomCompanion.SessionState.unInitialize;
                                statusMap[Microsoft.Xbox.LRC.SessionStatus.connecting] = MSEPlatform.LivingRoomCompanion.SessionState.connecting;
                                statusMap[Microsoft.Xbox.LRC.SessionStatus.connected] = MSEPlatform.LivingRoomCompanion.SessionState.connected;
                                statusMap[Microsoft.Xbox.LRC.SessionStatus.connectedWithTemporaryError] = MSEPlatform.LivingRoomCompanion.SessionState.connectedTemporaryError;
                                statusMap[Microsoft.Xbox.LRC.SessionStatus.disconnecting] = MSEPlatform.LivingRoomCompanion.SessionState.disconnecting;
                                statusMap[Microsoft.Xbox.LRC.SessionStatus.disconnected] = MSEPlatform.LivingRoomCompanion.SessionState.disconnected;
                                statusMap[Microsoft.Xbox.LRC.SessionStatus.faulted] = MSEPlatform.LivingRoomCompanion.SessionState.error
                            }
                            var sessionState = null;
                            if (statusMap.hasOwnProperty(nativeStatus))
                                sessionState = statusMap[nativeStatus];
                            return sessionState
                        }
                })(), _mapLRCTransportToLocalTransport: (function lrcSession_mapLRCTransportToLocalTransport_closure() {
                    var tsmap = null;
                    return function _mapLRCTransportToLocalTransport(lrcTransport) {
                            if (!tsmap) {
                                tsmap = {};
                                tsmap[Microsoft.Xbox.LRC.MediaTransportState.invalid] = MSEPlatform.Playback.TransportState.unInitialize;
                                tsmap[Microsoft.Xbox.LRC.MediaTransportState.stopped] = MSEPlatform.Playback.TransportState.stopped;
                                tsmap[Microsoft.Xbox.LRC.MediaTransportState.starting] = MSEPlatform.Playback.TransportState.starting;
                                tsmap[Microsoft.Xbox.LRC.MediaTransportState.playing] = MSEPlatform.Playback.TransportState.playing;
                                tsmap[Microsoft.Xbox.LRC.MediaTransportState.paused] = MSEPlatform.Playback.TransportState.paused;
                                tsmap[Microsoft.Xbox.LRC.MediaTransportState.buffering] = MSEPlatform.Playback.TransportState.buffering
                            }
                            if (tsmap.hasOwnProperty(lrcTransport))
                                return tsmap[lrcTransport];
                            else
                                return MSEPlatform.Playback.TransportState.unInitialize
                        }
                })(), _mapMediaAssetIdToMediaItemAndFire: function lrcSession_mapMediaAssetIdToMediaItemAndFire(titleId, assetId) {
                    if (!assetId)
                        return;
                    this._cancelTitleIdUpdate();
                    MS.Entertainment.Platform.PlaybackHelpers.getMediaByTitleIdAssetId(titleId, assetId).then(function getMediaByAssetIdSuccess(media) {
                        if (media) {
                            MS.Entertainment.UI.Debug.writeLine("currentMediaChanged (3rd party), " + (media.name ? media.name : "null"));
                            this.currentMedia = media;
                            this._currentMediaAssetId = assetId
                        }
                        else
                            this._mapTitleIdToGameMediaItem(titleId)
                    }.bind(this), function noSuchAssetId(error) {
                        this._mapTitleIdToGameMediaItem(titleId)
                    }.bind(this))
                }, _mapTitleIdToGameMediaItem: function lrcSession_mapTitleIdToGameMediaItem(titleId) {
                    if (titleId <= 0)
                        return;
                    this.currentTitleId = titleId;
                    MS.Entertainment.Platform.PlaybackHelpers.getGameMediaByTitleId(titleId).then(function getGameMediaByTitleIdSuccess(media) {
                        if (media && !MS.Entertainment.Utilities.isEmptyGuid(media.canonicalId)) {
                            media.titleId = media.titleId || titleId;
                            if (!this.currentMedia || media.serviceId !== this._currentMediaAssetId) {
                                MS.Entertainment.UI.Debug.writeLine("currentMediaChanged (Game), " + (media.name ? media.name : "null"));
                                this.currentMedia = media;
                                this._currentMediaAssetId = media.serviceId
                            }
                        }
                        else if (titleId !== 0)
                            this._mapTitleIdToGameMediaItem(MSEPlatform.LivingRoomCompanion.WellKnownTitleId.dd)
                    }.bind(this))
                }, _updateTitleId: function lrcSession_updateTitleId(id, delayMsec) {
                    if (id > 0 && (this.currentTitleId !== id || !this.currentMedia)) {
                        this.currentTitleId = id;
                        this._cancelTitleIdUpdate();
                        var letsUpdateTitleId = function _letsUpdateTitleId() {
                                MS.Entertainment.UI.Debug.writeLine("titleId *updated*, " + this.currentTitleId);
                                this._updateTitleIdPromise = null;
                                this._mapTitleIdToGameMediaItem(this.currentTitleId)
                            }.bind(this);
                        if (delayMsec === 0)
                            letsUpdateTitleId();
                        else
                            this._updateTitleIdPromise = WinJS.Promise.timeout(delayMsec).then(function _reallyUpdateTitleId() {
                                letsUpdateTitleId()
                            }.bind(this));
                        if (this._lrcCanvasBridge)
                            this._lrcCanvasBridge.publishTitleChanged(id)
                    }
                }, _cancelTitleIdUpdate: function lrcSession_cancelTitleIdUpdate() {
                    if (this._updateTitleIdPromise) {
                        MS.Entertainment.UI.Debug.writeLine("titleId *update canceled*");
                        this._updateTitleIdPromise.cancel();
                        this._updateTitleIdPromise = null
                    }
                }, _loadPreviousMedia: function lrcSession_loadPreviousMedia() {
                    this._cancelTitleIdUpdate();
                    var appSignIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                    if (!appSignIn.isSignedIn)
                        return WinJS.Promise.wrapError();
                    try {
                        Microsoft.Xbox.XboxLIVEService.invalidateCacheGroup(Microsoft.Xbox.CacheGroup.titleHistory)
                    }
                    catch(e) {}
                    var gamesQuery = new MS.Entertainment.Data.Query.gamesQuery;
                    gamesQuery.userModel = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                    gamesQuery.chunkSize = MS.Entertainment.Data.XboxLive.MAX_TITLE_ACTIVITY_COUNT;
                    this._updateTitleIdPromise = gamesQuery.execute().then(function querySuccess(q) {
                        if (!q.result.items || !q.result.items.count) {
                            var dummyMediaItem = {
                                    titleId: 0, defaultPlatformType: MS.Entertainment.Data.Augmenter.GamePlatform.Xbox
                                };
                            this.currentMedia = dummyMediaItem;
                            this.currentTitleId = 0;
                            return WinJS.Promise.wrap(dummyMediaItem)
                        }
                        return q.result.items.forEach(function filterGames(args) {
                                var item = args.item.data;
                                if (item.defaultPlatformType === MS.Entertainment.Data.Augmenter.GamePlatform.Xbox) {
                                    this.currentMedia = MS.Entertainment.ViewModels.MediaItemModel.augment(item);
                                    args.stop = true;
                                    return WinJS.Promise.wrap(this.currentMedia)
                                }
                            }.bind(this))
                    }.bind(this));
                    return this._updateTitleIdPromise
                }, _loadSpecificMedia: function lrcSession_loadSpecificMedia(titleId, assetId) {
                    this.currentTitleId = titleId;
                    if (!assetId)
                        this._updateTitleId(titleId, 0);
                    else
                        this._mapMediaAssetIdToMediaItemAndFire(titleId, assetId);
                    return WinJS.Promise.wrap()
                }, _updateSessionState: function lrcSession_updateSessionState(state) {
                    this._getXboxEventProvider().traceXboxSessionStateChange(state, this.sessionState);
                    if (state) {
                        this.sessionState = state;
                        if (this._lrcCanvasBridge)
                            this._lrcCanvasBridge.onConnectionStateChanged(this._isConnected(), this.isUsingLocalConnection());
                        if (state === MSEPlatform.LivingRoomCompanion.SessionState.disconnected || state === MSEPlatform.LivingRoomCompanion.SessionState.error) {
                            var stats = this.sessionStats;
                            this.connect(true);
                            this._updateTransportCaps(0);
                            if (state === MSEPlatform.LivingRoomCompanion.SessionState.error)
                                this._localLRCPlayer._firePlaybackError(MSEPlatform.Playback.Error.LRCSESSION_INTERNAL_ERROR, "lrcSession_SessionState_Error");
                            if (stats)
                                WinJS.Promise.timeout(10).then(function lrcSession_updateSessionStateTelemetry() {
                                    MS.Entertainment.Utilities.Telemetry.logCompanionSessionStats(stats, "SessionState", state);
                                    this._lastLoggedRemoteLRCSessionStats = stats
                                }.bind(this))
                        }
                    }
                }, _onLocalTransportStateChanged: function lrcSession_onLocalTransportStateChanged(event) {
                    this._logStatusMessage("Local transport state changed", event);
                    var localConnection = this.isUsingLocalConnection();
                    if (this._lrcCanvasBridge)
                        this._lrcCanvasBridge.onConnectionStateChanged(this._isConnected(), localConnection);
                    if (localConnection)
                        this.trapErrors(this.getActiveTitleInformationAndEstablishTitleChannel(true))
                }, _onTitleChannelStatusChanged: function lrcSession_onTitleChannelStatusChanged(event) {
                    this._logStatusMessage("Title channel status changed", event);
                    var status = (typeof(event.status) === "number") ? event.status : event.detail.status;
                    var raiseLocalTitleChannelDisconnected = false;
                    switch (status) {
                        case Microsoft.Xbox.LRC.XmediaTitleChannelStatus.disconnectedOnError:
                            {
                                raiseLocalTitleChannelDisconnected = true;
                                if (this._lrcCanvasBridge)
                                    this._lrcCanvasBridge.onTitleChannelStatusChanged(false);
                                this.browserModel.titleChannelEstablished = false
                            }
                            break;
                        case Microsoft.Xbox.LRC.XmediaTitleChannelStatus.establishedLocal:
                        case Microsoft.Xbox.LRC.XmediaTitleChannelStatus.establishedOverCloud:
                            if (this._lrcCanvasBridge)
                                this._lrcCanvasBridge.onTitleChannelStatusChanged(true);
                            this.browserModel.titleChannelEstablished = ((event.titleId === MSEPlatform.LivingRoomCompanion.WellKnownTitleId.bb) && (status === Microsoft.Xbox.LRC.XmediaTitleChannelStatus.establishedLocal));
                            break
                    }
                    if (this.dispatchEvent) {
                        if (raiseLocalTitleChannelDisconnected) {
                            this.browserModel.titleChannelEstablished = false;
                            this.dispatchEvent("localtitlechanneldisconnected", {
                                status: event.status, titleId: event.titleId, port: event.port, errorCode: event.errorCode
                            })
                        }
                        this.dispatchEvent("titlechannelstatuschanged", {
                            status: event.status, titleId: event.titleId, port: event.port, errorCode: event.errorCode
                        })
                    }
                }, getActiveTitleInformationAndEstablishTitleChannel: function lrcSession_getActiveTitleInformationAndEstablishTitleChannel(forceTitleInformationNetworkRequest) {
                    this.getActiveTitleInformation(!!forceTitleInformationNetworkRequest).then(function success(titleInfo) {
                        if (titleInfo.enabled)
                            return this.establishTitleChannel(titleInfo.titleId, titleInfo.port);
                        else
                            return WinJS.Promise.wrapError("title channel is not enabled")
                    }.bind(this), function fail(error) {
                        MS.Entertainment.UI.Debug.writeLine("get active title information failed")
                    })
                }, _onSessionConnected: function _onSessionConnected() {
                    this.trapErrors(this.getActiveTitleInformationAndEstablishTitleChannel(true))
                }, _onLocalTitleChannelConnected: function lrcSession_onLocalTitleChannelConnected() {
                    this._logStatusMessage("Local title channel connected")
                }, _updatePlayerState: function lrcSession_updatePlayerState(state) {
                    this.playerState = state
                }, _updateTransportCaps: function lrcSession_updateTransportCaps(caps) {
                    this._playlist.canSkipForward = (caps & Microsoft.Xbox.LRC.MediaTransportCapabilities.canSkipForward ? true : false);
                    this._playlist.canSkipBackward = (caps & Microsoft.Xbox.LRC.MediaTransportCapabilities.canSkipBackward ? true : false);
                    this.canFastReverse = (caps & Microsoft.Xbox.LRC.MediaTransportCapabilities.canRewind ? true : false);
                    this.canFastForward = (caps & Microsoft.Xbox.LRC.MediaTransportCapabilities.canFastforward ? true : false);
                    this.canSeek = (caps & Microsoft.Xbox.LRC.MediaTransportCapabilities.canSeek ? true : false);
                    this.canControlMedia = (caps > 0) && this._iPlayback.currentTransportState !== MSEPlatform.Playback.TransportState.stopped && this._iPlayback.currentTransportState !== MSEPlatform.Playback.TransportState.unInitialize
                }, _onTitleMessage: function lrcSession_onTitleMessage(titleMessage) {
                    var titleId = titleMessage.titleId;
                    var messageText = titleMessage.messageText;
                    if (this._lrcCanvasBridge)
                        this._lrcCanvasBridge.publishTitleMessage(messageText);
                    if (this.dispatchEvent)
                        this.dispatchEvent("titleMessage", {
                            titleId: titleMessage.titleId, messageText: titleMessage.messageText
                        })
                }, _updateBrowserModel: function lrcSession_updateBrowserModel(messageText) {
                    try {
                        var data = JSON.parse(messageText);
                        if (data && data.notification === "url_changing") {
                            if (data.data && data.data.url && data.data.url.index === 0)
                                this._browserModel.urlState = MSEPlatform.LivingRoomCompanion.BrowserUrlState.updating;
                            this._updateUrl(data)
                        }
                        else if (data && data.notification === "url_changed") {
                            if (data.data && data.data.url && data.data.url.index === 0)
                                this._browserModel.urlState = MSEPlatform.LivingRoomCompanion.BrowserUrlState.updated;
                            this._updateUrl(data)
                        }
                        else if (data && data.notification === "inputstyle")
                            if (data.data && data.data.style)
                                switch (data.data.style) {
                                    case 1:
                                        this._browserModel.inputMode = MSEPlatform.LivingRoomCompanion.BrowserInputMode.browser;
                                        break;
                                    case 2:
                                        this._browserModel.inputMode = MSEPlatform.LivingRoomCompanion.BrowserInputMode.dpad;
                                        break;
                                    default:
                                        this._browserModel.inputMode = MSEPlatform.LivingRoomCompanion.BrowserInputMode.browser;
                                        break
                                }
                    }
                    catch(e) {
                        MS.Entertainment.Framework.assert(false, "Failed to parse titleMessage: " + e.toString())
                    }
                }, _updateUrl: function lrcSession_updateUrl(data) {
                    if (this._currentMessageIndex++ !== data.data.url.index) {
                        MS.Entertainment.Framework.assert(false, "invalid browser title channel message index");
                        this._currentMessageIndex = 0;
                        return
                    }
                    if (data.data.url.index === 0)
                        this._currentUri = "";
                    this._currentUri += data.data.url.data;
                    if (data.data.url.index === data.data.url.size - 1) {
                        this._browserModel.currentBrowserUri = this._currentUri;
                        this._currentMessageIndex = 0
                    }
                }, _updateMediaStates: function lrcSession_updateMediaStates(states) {
                    if (!states || !this._mediaStateChangesSinceLastUpdate(states)) {
                        MS.Entertainment.UI.Debug.writeLine("mediaStateUpdate - no changes");
                        return
                    }
                    if ((states.mediaTransportState === Microsoft.Xbox.LRC.MediaTransportState.playing || states.mediaTransportState === Microsoft.Xbox.LRC.MediaTransportState.buffering) && this._fixStateOnSeekPromise !== null && this._playbackPositionBeforeLastSeek !== null && this._lastSeekPosition !== null && new Date - this._lastSeekCompletedTime < 20000 && states.position >= this._playbackPositionBeforeLastSeek && states.position - this._playbackPositionBeforeLastSeek < 40e7) {
                        var ignore = false;
                        if (this._lastSeekPosition > this._playbackPositionBeforeLastSeek) {
                            if (states.position < this._lastSeekPosition)
                                ignore = true
                        }
                        else if (this._lastSeekPosition < this._playbackPositionBeforeLastSeek)
                            if (states.position >= this._playbackPositionBeforeLastSeek)
                                ignore = true;
                        if (ignore) {
                            this._getXboxEventProvider().traceXboxBogusMediaStateMessageIgnored(states.position, states.mediaTransportState, this._playbackPositionBeforeLastSeek, this._lastSeekPosition);
                            MS.Entertainment.UI.Debug.writeLine("mediaStateUpdate - ignored");
                            return
                        }
                    }
                    this._prevMediaState = states;
                    var durationMsec = this._secToMSec(states.durationSeconds);
                    if (durationMsec > 0 && durationMsec !== this._iPlayback.duration) {
                        this._positionExtrapolator.start(0, this);
                        this._positionExtrapolator.forceNextSync();
                        this._updatePlayerState(MSEPlatform.Playback.PlayerState.ready)
                    }
                    this._iPlayback.duration = durationMsec;
                    this._iPlayback.currentTransportState = this._mapLRCTransportToLocalTransport(states.mediaTransportState);
                    this._updateTransportCaps(states.mediaTransportCapabilities);
                    if (this._iPlayback.currentTransportState !== this._iPlayback._targetTransportState)
                        this._iPlayback._targetTransportState = this._iPlayback.currentTransportState;
                    MS.Entertainment.UI.Debug.writeLine("mediaStateUpdate:" + " ts=" + this._iPlayback.currentTransportState + ", position=" + states.positionSeconds + ", duration=" + states.durationSeconds + ", rate=" + states.rate);
                    this._iPlayback.playbackRate = states.rate;
                    this._positionExtrapolator.sync(this._secToMSec(states.positionSeconds), this._iPlayback.playbackRate);
                    switch (this._iPlayback.currentTransportState) {
                        case MSEPlatform.Playback.TransportState.stopped:
                            this._positionExtrapolator.stop();
                            if (this.currentMedia && this.currentMedia.mediaType !== Microsoft.Entertainment.Queries.ObjectType.track) {
                                this.currentMedia = null;
                                this.currentTitleId = 0;
                                this._currentMediaAssetId = 0
                            }
                            break;
                        case MSEPlatform.Playback.TransportState.playing:
                            if (this._positionExtrapolator.currentPosition === 0)
                                this._positionExtrapolator.currentPosition = 1;
                            this._positionExtrapolator.resume();
                            break;
                        case MSEPlatform.Playback.TransportState.paused:
                        default:
                            this._positionExtrapolator.pause();
                            break
                    }
                    if (!states.mediaAssetId || states.mediaAssetId === "assetId") {
                        MS.Entertainment.UI.Debug.writeLine("titleChanged (from mediaStateChanged), titleId = " + states.titleId);
                        var delayUpdateTitleMsec = 0;
                        if (this.currentMedia && this.currentMedia.mediaType === Microsoft.Entertainment.Queries.ObjectType.track)
                            delayUpdateTitleMsec = 5000;
                        this._updateTitleId(states.titleId, delayUpdateTitleMsec)
                    }
                    else if (states.mediaAssetId !== this._currentMediaAssetId) {
                        if (states.titleId > 0 && this.currentTitleId !== states.titleId)
                            this.currentTitleId = states.titleId;
                        this._mapMediaAssetIdToMediaItemAndFire(states.titleId, states.mediaAssetId)
                    }
                    if (this._lrcCanvasBridge)
                        this._lrcCanvasBridge.publishMediaState(states)
                }, _mediaStateChangesSinceLastUpdate: function lrcSession_mediaStateChangesSinceLastUpdate(states) {
                    if (this._prevMediaState !== null)
                        return (this._prevMediaState.positionSeconds !== states.positionSeconds || this._prevMediaState.durationSeconds !== states.durationSeconds || this._prevMediaState.mediaTransportCapabilities !== states.mediaTransportCapabilities || this._prevMediaState.mediaTransportState !== states.mediaTransportState || this._prevMediaState.rate !== states.rate || this._prevMediaState.mediaAssetId !== states.mediaAssetId || this._prevMediaState.titleId !== states.titleId);
                    else
                        return true
                }, _ensureSession: function lrcSession_ensureSession() {
                    if (!this._playbackControl)
                        throw"lrcSession_ensureSession: Error! PlaybackControl not created.";
                    return this._sessionInitializedPromise
                }, _reset: function lrcSession_reset() {
                    this._updatePlayerState(MSEPlatform.Playback.PlayerState.notReady);
                    this.currentTitleId = 0;
                    this.currentMedia = null;
                    this._currentMediaAssetId = 0;
                    if (this._localLRCPlayer)
                        this._localLRCPlayer._setRemoteLRCSession(null);
                    if (this._positionExtrapolator)
                        this._positionExtrapolator.stop();
                    if (this._iPlayback)
                        this._iPlayback.reset();
                    if (this._lrcCanvasBridge)
                        this._lrcCanvasBridge.setLRCSession(null);
                    this._setRemoteLRCSession(null);
                    this._lastLoggedRemoteLRCSessionStats = null;
                    this._browserModel.titleChannelEstablished = false
                }, _disconnectRemoteLRCSession: function lrcSession_disconnectRemoteLRCSession(shutdownSession) {
                    var session = this._remoteLRCSession;
                    if (session)
                        try {
                            switch (session.sessionStatus) {
                                case Microsoft.Xbox.LRC.SessionStatus.disconnected:
                                case Microsoft.Xbox.LRC.SessionStatus.faulted:
                                    if (shutdownSession)
                                        session.shutdown();
                                    session = null;
                                    return WinJS.Promise.as();
                                default:
                                    return this._startXboxRequest(function _disconnectSession() {
                                            return session.disconnectAsync().then(function disconnected() {
                                                    if (shutdownSession)
                                                        session.shutdown();
                                                    session = null
                                                }.bind(this), function cantDisconnect(errorCode) {
                                                    if (shutdownSession)
                                                        session.shutdown();
                                                    session = null
                                                }.bind(this))
                                        }.bind(this), "traceXboxDisconnectSessionBegin", "traceXboxDisconnectSessionDone", "traceXboxDisconnectSessionError")
                            }
                        }
                        catch(e) {
                            if (shutdownSession)
                                session.shutdown();
                            session = null;
                            return WinJS.Promise.wrapError(e)
                        }
                    else
                        return WinJS.Promise.as()
                }, _setRemoteLRCSession: function lrcSession_setRemoteLRCSession(remoteLRCSession) {
                    if (remoteLRCSession)
                        if (this._remoteLRCSession) {
                            if (this._remoteLRCSession !== remoteLRCSession) {
                                this._unsubscribeFromRemoteLRCSessionEvents(this._remoteLRCSession);
                                this.trapErrors(this._disconnectRemoteLRCSession(true));
                                this._getXboxEventProvider().traceXboxSessionObjectReassigned();
                                this._remoteLRCSession = remoteLRCSession;
                                this._subscribeToRemoteLRCSessionEvents(remoteLRCSession)
                            }
                        }
                        else {
                            this._getXboxEventProvider().traceXboxNewSessionObjectAssigned();
                            this._remoteLRCSession = remoteLRCSession;
                            this._subscribeToRemoteLRCSessionEvents(remoteLRCSession)
                        }
                    else if (this._remoteLRCSession) {
                        this._unsubscribeFromRemoteLRCSessionEvents(this._remoteLRCSession);
                        this.trapErrors(this._disconnectRemoteLRCSession(true));
                        this._getXboxEventProvider().traceXboxSessionObjectResetToNull();
                        this._remoteLRCSession = null
                    }
                }, _onMediaChanged: function lrcSession_onMediaChanged(newMediaItem) {
                    if (!newMediaItem)
                        return;
                    if (this.sessionState !== MSEPlatform.LivingRoomCompanion.SessionState.connected)
                        this.canTransfer = false;
                    else {
                        this.canTransfer = false;
                        if (this._canTransferMediaItemPromise) {
                            this._canTransferMediaItemPromise.cancel();
                            this._canTransferMediaItemPromise = null
                        }
                        var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                        this._canTransferMediaItemPromise = sessionMgr.canTransferMediaItemAsync(newMediaItem, MSEPlatform.Playback.WellKnownPlaybackSessionId.remoteLRC, MSEPlatform.Playback.WellKnownPlaybackSessionId.nowPlaying, this.currentTitleId);
                        var onPromiseComplete = function canTransferMediaItemAsync_complete(canTransfer) {
                                this.canTransfer = canTransfer;
                                this._canTransferMediaItemPromise = null
                            }.bind(this);
                        this._canTransferMediaItemPromise.then(onPromiseComplete, function canTransferMediaItemAsync_error(e) {
                            onPromiseComplete(false)
                        }.bind(this))
                    }
                }, _getXboxEventProvider: (function lrcSession_getXboxEventProvider_closure() {
                    var eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Xbox;
                    return function lrcSession_getXboxEventProvider() {
                            return eventProvider
                        }
                })(), _positionExtrapolator: {
                    currentPosition: 0, paused: false, rate: 1, forceSync: false, start: function _posExtrapolator_start(startingPosition, lrcSession) {
                            if (this._tickPromise) {
                                this._tickPromise.cancel();
                                this._tickPromise = null
                            }
                            this._lrcSession = lrcSession;
                            this.currentPosition = startingPosition;
                            this._lrcSession._iPlayback.currentPosition = startingPosition;
                            this._tick()
                        }, stop: function _posExtrapolator_stop() {
                            if (this._tickPromise)
                                this._tickPromise.cancel();
                            this.currentPosition = 0;
                            this._lastTickTime = null;
                            if (this._lrcSession)
                                this._lrcSession._iPlayback.currentPosition = 0
                        }, pause: function _posExtrapolator_pause() {
                            this.paused = true
                        }, resume: function _posExtrapolator_resume() {
                            this.paused = false
                        }, forceNextSync: function _positionExtrapolator_forceNextSync() {
                            this.forceSync = true
                        }, sync: function _posExtrapolator_sync(newPosition, newRate) {
                            var oldRate = this.rate;
                            this.rate = newRate;
                            if (this.forceSync || oldRate !== newRate) {
                                this.currentPosition = newPosition;
                                this.forceSync = false;
                                return
                            }
                            if (this.rate > 0) {
                                if (this.currentPosition + (this.rate * this._updateInterval) > newPosition) {
                                    if (this.currentPosition - newPosition > this._skipThreshold)
                                        this.currentPosition = newPosition;
                                    return
                                }
                            }
                            else if (this.currentPosition + (this.rate * this._updateInterval) < newPosition) {
                                if (newPosition - this.currentPosition > this._skipThreshold)
                                    this.currentPosition = newPosition;
                                return
                            }
                            this.currentPosition = newPosition
                        }, _updateAndFirePosition: function _posExtrapolator_updateAndFirePosition() {
                            if (this.currentPosition > 0) {
                                var now = new window.Date;
                                if (this._lastTickTime && !this.paused)
                                    this.currentPosition = this.currentPosition + (this.rate * (now - this._lastTickTime));
                                this._lastTickTime = now;
                                if (this._lrcSession)
                                    this._lrcSession._iPlayback.currentPosition = this.currentPosition
                            }
                        }, _tick: function _posExtrapolator_tick() {
                            this._tickPromise = WinJS.Promise.timeout(this._updateInterval).then(function() {
                                this._updateAndFirePosition();
                                WinJS.Promise.timeout().then(function() {
                                    this._tick()
                                }.bind(this))
                            }.bind(this))
                        }, _updateInterval: (1 / 3) * 1000, _lrcSession: null, _lastTickTime: null, _skipThreshold: 30 * 1000
                }, isCurrentMediaFromPresenceService: false, _sessionId: null, _sessionInitializedPromise: null, _remoteLRCSession: null, _lrcConsoleSettings: null, _lrcKeyboardState: null, _lrcStreamingMode: null, _lrcTitleMessagingInformation: null, _lastLoggedRemoteLRCSessionStats: null, _localLRCPlayer: null, _currentMediaAssetId: 0, _setDataSourcePromise: null, _useDeepLinkForLaunch: false, _connectionTestTimer: 0, _updateTitleIdPromise: null, _prevMediaState: null, _canTransferMediaItemPromise: null, _fixStateOnSeekPromise: null, _lastSeekCompletedTime: null, _playbackPositionBeforeLastSeek: null, _lastSeekPosition: null, _lrcCanvasBridge: null, _getXboxOnlinePresencePromise: null, _browserModel: null, _currentUri: "", _currentMessageIndex: 0, _onLRCSessionEventsBound: null, _lastDisconnectedRetry: 0
        };
    WinJS.Namespace.defineWithParent(MSEPlatform, "LivingRoomCompanion", {SessionBase: WinJS.Class.mix(function mixConstructor(){}, MS.Entertainment.UI.Framework.EventMixin, MS.Entertainment.UI.Framework.UpdatePropertyMixin, lrcSessionMixin, playbackControlMixin, playlistMixin, videoScrubberMixin, WinJS.Binding.mixin)});
    WinJS.Namespace.defineWithParent(MSEPlatform, "LivingRoomCompanion", {Session: WinJS.Class.derive(MSEPlatform.LivingRoomCompanion.SessionBase, function lrcSession_constructor(id) {
            var completePromise;
            this._initObservable({});
            this._sessionInitializedPromise = new WinJS.Promise(function(c, e, p)
            {
                completePromise = c
            });
            this._sessionId = (!id ? MSEPlatform.SessionManager._createSessionId() : id);
            this._playbackControlCreateInstance();
            this._playbackControl.bind("controlInitialized", function lrcSession_init(isInitialized) {
                if (isInitialized) {
                    this._playlistCreateInstance();
                    this._iPlayback = this._playbackControl.getPlaybackInterface();
                    this._localLRCPlayer = this._iPlayback._player;
                    this._playlist.setPlaybackControl(this._iPlayback);
                    this._videoScrubberCreateInstance(this._iPlayback);
                    MS.Entertainment.ProxyHelpers.proxyProperties(this, this._iPlayback, ["targetTransportState", "autoPlay", "muted"]);
                    MS.Entertainment.ProxyHelpers.proxyObservables(this, this._iPlayback, ["playerState", "currentTransportState", "duration", "currentPosition", "videoWidth", "videoHeight", "errorDescriptor", "playbackRate", "minPlaybackRate", "maxPlaybackRate"]);
                    MS.Entertainment.ProxyHelpers.delegateFunctions(this, this._iPlayback, ["seekToPosition", "fastFwd", "fastReverse", "slowFwd", "slowReverse", "isRemoteSession", "forceTimeUpdate"]);
                    MS.Entertainment.ProxyHelpers.proxyProperties(this, this._playlist, ["first"]);
                    MS.Entertainment.ProxyHelpers.proxyObservables(this, this._playlist, ["shuffle", "repeat", "canSkipBackward", "canSkipForward", "mediaCollection", "currentOrdinal"]);
                    MS.Entertainment.ProxyHelpers.delegateFunctions(this, this._playlist, ["before", "after", "savePlaylist"]);
                    MS.Entertainment.ProxyHelpers.proxyProperties(this, this._videoScrubber, ["pausePlaybackWhileScrubbing", "minScrubStep", "thumbnailDiv", "scrubPosition"]);
                    MS.Entertainment.ProxyHelpers.proxyObservables(this, this._videoScrubber, ["canScrub", "scrubActive"]);
                    this.bind("currentMedia", this._onMediaChanged.bind(this));
                    completePromise();
                    MS.Entertainment.Platform.Playback.Etw.traceSessionInitialized()
                }
            }.bind(this));
            this._browserModel = WinJS.Binding.as({
                urlState: MSEPlatform.LivingRoomCompanion.BrowserUrlState.updated, currentBrowserUri: "", inputMode: MSEPlatform.LivingRoomCompanion.BrowserInputMode.browser, titleChannelEstablished: false
            })
        }, {
            sessionState: MS.Entertainment.UI.Framework.observableProperty("sessionState", MSEPlatform.LivingRoomCompanion.SessionState.unInitialize), currentTitleId: MS.Entertainment.UI.Framework.observableProperty("currentTitleId", -1), currentMedia: MS.Entertainment.UI.Framework.observableProperty("currentMedia", null), canShuffle: MS.Entertainment.UI.Framework.observableProperty("canShuffle", false), canRepeat: MS.Entertainment.UI.Framework.observableProperty("canRepeat", false), canTransfer: MS.Entertainment.UI.Framework.observableProperty("canTransfer", false), canControlMedia: MS.Entertainment.UI.Framework.observableProperty("canControlMedia", false), canFastForward: MS.Entertainment.UI.Framework.observableProperty("canFastForward", false), canSlowForward: MS.Entertainment.UI.Framework.observableProperty("canSlowForward", false), canFastReverse: MS.Entertainment.UI.Framework.observableProperty("canFastReverse", false), canSlowReverse: MS.Entertainment.UI.Framework.observableProperty("canSlowReverse", false), canSeek: MS.Entertainment.UI.Framework.observableProperty("canSeek", false)
        })})
})()
