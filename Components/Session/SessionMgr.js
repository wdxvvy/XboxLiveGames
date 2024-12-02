/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Components/Playback/session/PlaybackSession.js", "/Components/Companion/LRCSession.js", "/Framework/serviceLocator.js", "/Framework/debug.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Platform.SesionManager");
(function() {
    var MSEPlatform = WinJS.Namespace.define("MS.Entertainment.Platform", null);
    WinJS.Namespace.defineWithParent(MS.Entertainment, "Platform", {SessionManager: WinJS.Class.define(function SessionManager_constructor() {
            this._bindMediaControls()
        }, {
            nowPlayingSession: {get: function SessionManager_nowPlayingSession_get() {
                    return this._nowPlayingSession
                }}, lrcSession: {get: function SessionManager_lrcSession_get() {
                        return this._lrcSession
                    }}, primarySession: {get: function SessionManager_primarySession_get() {
                        return this._primarySession
                    }}, setPrimarySession: function SessionManager_setPrimarySession(sessionId) {
                    if (!this.sessions || !sessionId)
                        return null;
                    if (this._stopPromise && sessionId === MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying) {
                        this._stopPromise.cancel();
                        this._stopPromise = null
                    }
                    if (this._primarySession && this._primarySession.sessionId === sessionId)
                        return this._primarySession;
                    if (this._primarySession)
                        if (!MS.Entertainment.Utilities.isApp2) {
                            this._primarySession.unbind("canSkipForward", this._bindMediaControlsNext);
                            this._primarySession.unbind("canSkipBackward", this._bindMediaControlsPrevious)
                        }
                    var activeSession = this.getSession(sessionId);
                    if (activeSession) {
                        this._primarySession = activeSession;
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).primarySessionId = this._primarySession.sessionId;
                        if (!MS.Entertainment.Utilities.isApp2) {
                            activeSession.bind("canSkipForward", this._bindMediaControlsNext);
                            activeSession.bind("canSkipBackward", this._bindMediaControlsPrevious)
                        }
                    }
                    return activeSession
                }, _stopPromise: null, createSession: function SessionManager_createSession() {
                    this.sessions = this.sessions || {};
                    var session = new MSEPlatform.Playback.PlaybackSession;
                    this.sessions[session.sessionId] = session;
                    return session
                }, getSession: function SessionManager_getSession(sessionId) {
                    var session = null;
                    if (sessionId in this.sessions)
                        session = this.sessions[sessionId];
                    return session
                }, activateSession: function SessionManager_activateSession(controlHost, sessionId) {
                    var session = (!sessionId ? this._nowPlayingSession : this.sessions[sessionId]);
                    if (session)
                        WinJS.Promise.join([session._setDataSourcePromise]).then(function() {
                            session.activate(controlHost)
                        })
                }, deactivateSession: function SessionManager_deactivateSession(pausePlayback, sessionId) {
                    var session = (!sessionId ? this._nowPlayingSession : this.sessions[sessionId]);
                    if (session)
                        session.deactivate(pausePlayback)
                }, relocateSession: function SessionManager_relocateSession(newHost, sessionId) {
                    var session = (!sessionId ? this._nowPlayingSession : this.sessions[sessionId]);
                    if (session)
                        session.relocate(newHost)
                }, canTransferMediaItemAsync: function SessionManager_canTransferMediaItem(mediaItem, fromSessionId, toSessionId, currentTitleId) {
                    return WinJS.Promise.wrap(false)
                }, displayRequestActive: function SessionManager_displayRequestActive() {
                    if (this._displayRequest)
                        try {
                            this._displayRequest.requestActive()
                        }
                        catch(e) {}
                }, displayRequestRelease: function SessionManager_displayRequestRelease() {
                    if (this._displayRequest)
                        try {
                            this._displayRequest.requestRelease()
                        }
                        catch(e) {}
                }, _bindMediaControls: function _bindMediaControls() {
                    if (MS.Entertainment.Utilities.isApp2)
                        return;
                    var mediaControls = Windows.Media.MediaControl;
                    try {
                        mediaControls.addEventListener("playpausetogglepressed", function mediaControlPlayPause() {
                            if (this.primarySession.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.playing) {
                                this.primarySession.targetTransportState = MS.Entertainment.Platform.Playback.TransportState.paused;
                                MS.Entertainment.Utilities.Telemetry.logPauseClicked("mediaKey")
                            }
                            else {
                                if (this.primarySession.playerState === MS.Entertainment.Platform.Playback.PlayerState.ready)
                                    this.primarySession.targetTransportState = MS.Entertainment.Platform.Playback.TransportState.playing;
                                else
                                    this.primarySession.playAt(0);
                                MS.Entertainment.Utilities.Telemetry.logPlayClicked("mediaKey")
                            }
                        }.bind(this), false);
                        mediaControls.addEventListener("playpressed", function mediaControlPlay() {
                            this.primarySession.targetTransportState = MS.Entertainment.Platform.Playback.TransportState.playing;
                            MS.Entertainment.Utilities.Telemetry.logPlayClicked("mediaKey")
                        }.bind(this), false);
                        mediaControls.addEventListener("stoppressed", function mediaControlStop() {
                            this.primarySession.targetTransportState = MS.Entertainment.Platform.Playback.TransportState.stopped;
                            MS.Entertainment.Utilities.Telemetry.logStopClicked("mediaKey")
                        }.bind(this), false);
                        mediaControls.addEventListener("pausepressed", function mediaControlPause() {
                            this.primarySession.targetTransportState = MS.Entertainment.Platform.Playback.TransportState.paused;
                            MS.Entertainment.Utilities.Telemetry.logPauseClicked("mediaKey")
                        }.bind(this), false);
                        mediaControls.addEventListener("soundlevelchanged", this._onSoundLevelChanged.bind(this), false)
                    }
                    catch(ex) {
                        MSEPlatform.Playback.Etw.traceString("Non-fatal exception caught in mediaControls.addEventListener: " + ex)
                    }
                    this._mediaControlNext = MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(function SessionManager_mediaControlNext() {
                        if (this.primarySession)
                            if (this.primarySession === this.lrcSession)
                                this.primarySession.skipFwd();
                            else {
                                var positionMs = this.primarySession.forceTimeUpdate();
                                this.primarySession.seekToPosition(positionMs + 29000)
                            }
                        MS.Entertainment.Utilities.Telemetry.logNextClicked("mediaKey")
                    }, this);
                    this._mediaControlPrevious = MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(function SessionManager_mediaControlPrevious() {
                        if (this.primarySession)
                            if (this.primarySession === this.lrcSession)
                                this.primarySession.skipBack();
                            else {
                                var positionMs = this.primarySession.forceTimeUpdate();
                                this.primarySession.seekToPosition(positionMs - 15000)
                            }
                        MS.Entertainment.Utilities.Telemetry.logPreviousClicked("mediaKey")
                    }, this);
                    this._bindMediaControlsNext = MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(function SessionManager_bindMediaControlsNext(canSkipForward) {
                        mediaControls.removeEventListener("nexttrackpressed", this._mediaControlNext);
                        if (canSkipForward)
                            try {
                                mediaControls.addEventListener("nexttrackpressed", this._mediaControlNext, false)
                            }
                            catch(ex) {
                                MSEPlatform.Playback.Etw.traceString("Non-fatal exception caught in addEventListener(nexttrackpressed): " + ex)
                            }
                    }, this);
                    this._bindMediaControlsPrevious = MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(function SessionManager_bindMediaControlsPrevious(canSkipBack) {
                        mediaControls.removeEventListener("previoustrackpressed", this._mediaControlPrevious);
                        if (canSkipBack)
                            try {
                                mediaControls.addEventListener("previoustrackpressed", this._mediaControlPrevious)
                            }
                            catch(ex) {
                                MSEPlatform.Playback.Etw.traceString("Non-fatal exception caught in addEventListener(previoustrackpressed): " + ex)
                            }
                    }, this)
                }, _onSoundLevelChanged: function SessionManager_onSoundLevelChanged() {
                    if (this.primarySession && this.primarySession.isRemoteSession && this.primarySession.isRemoteSession())
                        return;
                    try {
                        var soundLevel = Windows.Media.MediaControl.soundLevel;
                        switch (soundLevel) {
                            case Windows.Media.SoundLevel.full:
                                this._onSoundLevelFull();
                                break;
                            case Windows.Media.SoundLevel.low:
                                this._onSoundLevelLow();
                                break;
                            case Windows.Media.SoundLevel.muted:
                                this._onSoundLevelMuted();
                                break;
                            default:
                                MS.Entertainment.Platform.SesionManager.assert(false, "Unexpected value for soundLevel: " + soundLevel);
                                break
                        }
                    }
                    catch(ex) {}
                }, _onSoundLevelFull: function SessionManager_onSoundLevelFull() {
                    var currentTransportState = MS.Entertainment.Platform.Playback.TransportState.unInitialize;
                    MSEPlatform.Playback.Etw.traceString("+PBM Sound Full");
                    if (this.primarySession) {
                        currentTransportState = this.primarySession.currentTransportState;
                        if (this._transportStateBeforePaused && this._transportStateBeforePaused !== MS.Entertainment.Platform.Playback.TransportState.unInitialize) {
                            if (this._transportStateBeforePaused !== MS.Entertainment.Platform.Playback.TransportState.starting) {
                                MSEPlatform.Playback.Etw.traceString("PBM Sound full. Target TransportState to stored value:", this._transportStateBeforePaused);
                                this.primarySession.targetTransportState = this._transportStateBeforePaused
                            }
                            else {
                                MSEPlatform.Playback.Etw.traceString("PBM Sound full. Target TransportState to playing");
                                this.primarySession.targetTransportState = MS.Entertainment.Platform.Playback.TransportState.playing
                            }
                            this._transportStateBeforePaused = MS.Entertainment.Platform.Playback.TransportState.unInitialize
                        }
                    }
                    MSEPlatform.Playback.Etw.tracePlaybackPBMSoundLevelChanged("full", currentTransportState)
                }, _onSoundLevelLow: function SessionManager_onSoundLevelLow() {
                    var currentTransportState = MS.Entertainment.Platform.Playback.TransportState.unInitialize;
                    MSEPlatform.Playback.Etw.traceString("+PBM Sound Low");
                    if (this.primarySession) {
                        currentTransportState = this.primarySession.currentTransportState;
                        if (currentTransportState !== MS.Entertainment.Platform.Playback.TransportState.stopped) {
                            MSEPlatform.Playback.Etw.traceString("PBM Sound Low pausing from " + this.primarySession.currentTransportState);
                            this._transportStateBeforePaused = this.primarySession.currentTransportState;
                            this.primarySession.targetTransportState = MS.Entertainment.Platform.Playback.TransportState.paused
                        }
                    }
                    MSEPlatform.Playback.Etw.tracePlaybackPBMSoundLevelChanged("low", currentTransportState)
                }, _onSoundLevelMuted: function SessionManager_onSoundLevelMuted() {
                    MSEPlatform.Playback.Etw.traceString("+PBM Sound Muted");
                    if (this.primarySession && this.primarySession.currentTransportState !== MS.Entertainment.Platform.Playback.TransportState.stopped) {
                        this._transportStateBeforePaused = this.primarySession.currentTransportState;
                        this.primarySession.targetTransportState = MS.Entertainment.Platform.Playback.TransportState.paused
                    }
                    MSEPlatform.Playback.Etw.tracePlaybackPBMSoundLevelChanged("muted", this._transportStateBeforePaused)
                }, _rootLicenseRefresh: (function SessionManager_rootLicenseRefresh_closure() {
                    var configurationManager;
                    return function SessionManager_rootLicenseRefresh(signIn) {
                            if (!configurationManager)
                                configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                            var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                            var tunerActivated = (signedInUser && signedInUser.isTunerActivated) ? true : false;
                            var subscription = (signedInUser && signedInUser.isSubscription) ? true : false;
                            MSEPlatform.Playback.Etw.traceDRMRootLicenseRefreshAccount(subscription);
                            if (!(subscription && tunerActivated))
                                return WinJS.Promise.wrap();
                            var now = new Date;
                            var spanMs = configurationManager.drm.timeBetweenRefreshSessionsMins * 60 * 1000;
                            var lastRefresh = configurationManager.drm.lastFullRefresh;
                            MSEPlatform.Playback.Etw.traceDRMRootLicenseRefreshDetails(now, lastRefresh, spanMs);
                            if (now - lastRefresh < spanMs)
                                return WinJS.Promise.wrap();
                            MSEPlatform.Playback.Etw.traceDRMRootLicenseRefreshInvoked();
                            return signIn.getPassportTicket(MS.Entertainment.Utilities.SignIn.TicketType.MBI_SSL, MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_Passport)).then(function gotTicket(ticket) {
                                    return MS.Entertainment.Platform.Playback.drmIndividualizationPromise.then(function _doAcquireRootLicense() {
                                            return Microsoft.Entertainment.Util.PlayReadyHandler.acquireRootLicense(ticket)
                                        })
                                }).then(function succeeded() {
                                    configurationManager.drm.lastFullRefresh = now;
                                    MSEPlatform.Playback.Etw.traceDRMRootLicenseRefreshCompleted("succeeded");
                                    return WinJS.Promise.wrap()
                                }, function failed(error) {
                                    var errorCode = (error && error.number) ? error.number : "unknown";
                                    MSEPlatform.Playback.Etw.traceDRMRootLicenseRefreshCompleted(error + " (error code: " + errorCode + ")");
                                    return WinJS.Promise.wrapError(error)
                                })
                        }
                })(), _reportMetering: function SessionManager_reportMetering(signIn) {
                    var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                    var subscription = (signedInUser && signedInUser.isSubscription) ? true : false;
                    var tunerActivated = (signedInUser && signedInUser.isTunerActivated) ? true : false;
                    var meteringCertificate = (signedInUser) ? signedInUser.meteringCertificate : null;
                    MSEPlatform.Playback.Etw.traceDRMReportMeteringAccount(subscription, tunerActivated, meteringCertificate ? "set" : "not set");
                    if (subscription && tunerActivated) {
                        MSEPlatform.Playback.Etw.traceDRMReportMeteringInvoked();
                        signIn.getPassportTicket(MS.Entertainment.Utilities.SignIn.TicketType.MBI_SSL, MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_Passport)).then(function gotTicket(ticket) {
                            return Microsoft.Entertainment.Util.PlayReadyHandler.reportMetering(ticket, meteringCertificate)
                        }).then(function succeeded() {
                            MSEPlatform.Playback.Etw.traceDRMReportMeteringCompleted("succeeded")
                        }, function failed(error) {
                            var errorCode = (error && error.number) ? error.number : "unknown";
                            MSEPlatform.Playback.Etw.traceDRMReportMeteringCompleted(error + "(error code: " + errorCode + ")")
                        })
                    }
                }, _onApproachingDataLimitChanged: function SessionManager_onApproachingDataLimitChanged(approachingDataLimit) {
                    if (approachingDataLimit)
                        if (this._nowPlayingSession)
                            this._nowPlayingSession.notifyNetworkConnectionChanged(MS.Entertainment.Platform.NetworkConnection.approachingDataLimit)
                }, _initialize: function SessionManager_initialize() {
                    if (MS.Entertainment.Utilities.isTestApp) {
                        this._extensionManager = new Windows.Media.MediaExtensionManager;
                        this._extensionManager.registerByteStreamHandler("Microsoft.Entertainment.Platform.Playback.MBRByteStreamHandler", "", "text/xml")
                    }
                    WinJS.Binding.bind(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.networkStatus), {approachingDataLimit: this._onApproachingDataLimitChanged.bind(this)});
                    this.sessions = this.sessions || {};
                    var sessionId = MSEPlatform.Playback.WellKnownPlaybackSessionId.nowPlaying;
                    this.sessions[sessionId] = new MSEPlatform.Playback.PlaybackSession(sessionId);
                    this._nowPlayingSession = this.sessions[sessionId];
                    this.setPrimarySession(sessionId);
                    if (this._shouldCreateLRCSession()) {
                        sessionId = MSEPlatform.Playback.WellKnownPlaybackSessionId.remoteLRC;
                        this.sessions[sessionId] = new MSEPlatform.LivingRoomCompanion.Session(sessionId);
                        this._lrcSession = this.sessions[sessionId];
                        this.setPrimarySession(sessionId)
                    }
                }, _isLRCEnabled: (function SessionManager_isLRCEnabled() {
                    var configurationManager;
                    return function _isLRCEnabled() {
                            if (!configurationManager)
                                configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                            return configurationManager.playback.enableLRC
                        }
                })(), _shouldCreateLRCSession: (function SessionManager_shouldCreateLRCSession() {
                    var configurationManager;
                    return function _shouldCreateLRCSession() {
                            if (!configurationManager)
                                configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                            return configurationManager.companion.createLRCSession
                        }
                })(), sessions: null, tmfAuthToken: null, _displayRequest: null, _nowPlayingSession: null, _lrcSession: null, _primarySession: null, _extensionManager: null, _transportStateBeforePaused: MS.Entertainment.Platform.Playback.TransportState.unInitialize, _networkKeepAliveTag: null, _networkKeepAliveSettings: null, _networkKeepAliveRefCount: 0
        }, {
            trackingIdState: {}, _createSessionId: (function createSessionId_closure() {
                    var sessionCounter = 0;
                    return function _createSessionId() {
                            sessionCounter++;
                            return ("sessionId_" + sessionCounter)
                        }
                })()
        })});
    WinJS.Namespace.defineWithParent(MSEPlatform, "Playback", {WellKnownPlaybackSessionId: {
            nowPlaying: "nowPlaying", remoteLRC: "remoteLRC"
        }});
    WinJS.Namespace.defineWithParent(MS.Entertainment, "Platform", {NetworkConnection: {
            approachingDataLimit: "approachingDataLimit", overDataLimit: "overDataLimit", switchedToMetered: "switchedToMetered"
        }});
    MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.sessionManager, function sessionManagerFactory() {
        var sessionMgr = new MSEPlatform.SessionManager;
        sessionMgr._initialize();
        return sessionMgr
    }, true)
})()
