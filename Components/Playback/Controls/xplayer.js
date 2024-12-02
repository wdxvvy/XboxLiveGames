/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/utilities.js", "/Components/Playback/PlaybackTrace.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Platform.Playback");
(function() {
    var MSEPlatform = WinJS.Namespace.define("MS.Entertainment.Platform", null);
    function tackOnTimeAfterExecution(fun, timeInMs, id) {
        return new WinJS.Promise(function init(c) {
                MSEPlatform.Playback.Etw.traceString("XPlayer::_watchTimeSeparated execution of " + id);
                var value = fun();
                return WinJS.Promise.timeout(timeInMs).then(function timeExpired() {
                        c(value)
                    })
            })
    }
    function getPassportTicket() {
        try {
            var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
            return signIn.getPassportTicket(MS.Entertainment.Utilities.SignIn.TicketType.MBI_SSL, MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_Passport))
        }
        catch(err) {
            return WinJS.Promise.wrapError("Error to get passport")
        }
    }
    WinJS.Namespace.defineWithParent(MSEPlatform, "Playback", {_modernPlayerObservables: WinJS.Class.derive(MS.Entertainment.UI.Framework.ObservableBase, function _modernPlayerObservables_constructor(){}, {
            _nextMediaLoaded: MS.Entertainment.UI.Framework.observableProperty("_nextMediaLoaded", false), _nextMediaStarted: MS.Entertainment.UI.Framework.observableProperty("_nextMediaStarted", false), _nextMediaError: MS.Entertainment.UI.Framework.observableProperty("_nextMediaError", false), dmrName: MS.Entertainment.UI.Framework.observableProperty("dmrName", String.empty), isRemoteSessionRunning: MS.Entertainment.UI.Framework.observableProperty("isRemoteSessionRunning", false)
        })});
    WinJS.Namespace.defineWithParent(MSEPlatform, "Playback", {XPlayer: WinJS.Class.define(function XPlayer_constructor() {
            throw"XPlayer only contains 1 static method - createInstance!";
        }, {}, {
            _modernPlayer: WinJS.Class.derive(MSEPlatform.Playback._modernPlayerObservables, function _modernPlayer_constructor(playerContainer) {
                this._playerContainer = playerContainer;
                MSEPlatform.Playback._modernPlayerObservables.prototype.constructor.call(this);
                this._setupDlnaPlayToMgr();
                this._onAppResume = this._onAppResume.bind(this);
                this._onAppSuspending = this._onAppSuspending.bind(this);
                Windows.UI.WebUI.WebUIApplication.addEventListener("resuming", this._onAppResume);
                Windows.UI.WebUI.WebUIApplication.addEventListener("suspending", this._onAppSuspending)
            }, {
                dispose: function _modernPlayer_dispose() {
                    this._cleanupDlnaPlayToMgr();
                    if (MS.Entertainment.Utilities.SignIn)
                        MS.Entertainment.Utilities.SignIn.removeEventListener("signInComplete");
                    Windows.UI.WebUI.WebUIApplication.removeEventListener("resuming", this._onAppResume);
                    Windows.UI.WebUI.WebUIApplication.removeEventListener("suspending", this._onAppSuspending);
                    if (this._volumeControllerBindings) {
                        this._volumeControllerBindings.cancel();
                        this._volumeControllerBindings = null
                    }
                    this._playerContainer = null
                }, autoPlay: {
                        get: function _modernPlayer_autoPlay_get() {
                            return this._autoPlay
                        }, set: function _modernPlayer_autoPlay_set(value) {
                                this._autoPlay = value
                            }
                    }, currentMedia: {
                        get: function _modernPlayer_currentMedia_get() {
                            return this._currentMedia
                        }, set: function _modernPlayer_currentMedia_set(value) {
                                this._setMedia(value)
                            }
                    }, nextMedia: {
                        get: function _modernPlayer_nextMedia_get() {
                            return this._nextMedia
                        }, set: function _modernPlayer_nextMedia_set(value) {
                                this._setNextMedia(value)
                            }
                    }, muted: {
                        get: function _modernPlayer_muted_get() {
                            this._ensurePipeline();
                            return this._currentPlayer.muted
                        }, set: function _modernPlayer_muted_set(value) {
                                this._ensurePipeline();
                                this._currentPlayer.muted = value
                            }
                    }, play: function _modernPlayer_play() {
                        MSEPlatform.Playback.Etw.traceString("XPlayer::Play()");
                        this._ensurePipeline();
                        this._currentPlayer.play()
                    }, pause: function _modernPlayer_pause() {
                        this._ensurePipeline();
                        this._currentPlayer.pause()
                    }, stop: function _modernPlayer_stop() {
                        this.pause();
                        if (this.currentMedia)
                            this.currentMedia.stopPosition = this.forceTimeUpdate()
                    }, seekToPosition: function _modernPlayer_seekToPosition(positionMsec) {
                        this._ensurePipeline();
                        var i = 0;
                        var timeRanges = this._currentPlayer.seekable;
                        for (i = 0; i < timeRanges.length; i++) {
                            var seekStart = timeRanges.start(i);
                            var seekEnd = timeRanges.end(i)
                        }
                        try {
                            var positionSec = positionMsec / 1000;
                            this._currentMedia.maxPosition = this._currentPlayer.currentTime;
                            this._currentPlayer.currentTime = positionSec;
                            this._currentMedia.maxPosition = positionSec
                        }
                        catch(e) {
                            MSEPlatform.Playback.Etw.tracePlaybackError(e.code, e.msExtendedCode, "_modernPlayer_seekToPosition")
                        }
                    }, fastFwd: function _modernPlayer_fastFwd(){}, rewind: function _modernPlayer_rewind(){}, slowFwd: function _modernPlayer_slowFwd(){}, slowRewind: function _modernPlayer_slowRewind(){}, reset: function _modernPlayer_reset(resetNext) {
                        if (resetNext) {
                            if (this._nextPlayer) {
                                this._unhookNextMediaEvents();
                                this._nextMedia = null;
                                this._nextPlayer.removeAttribute("src");
                                this._nextPlayer = null
                            }
                        }
                        else if (this._currentPlayer && !this._isDlnaConnectionPresent()) {
                            this._unhookCurrentMediaEvents();
                            this._currentMedia = null;
                            this._currentPlayer.removeAttribute("src");
                            this._currentPlayer.load();
                            if (this._playerContainer.hasChildNodes())
                                this._playerContainer.removeChild(this._currentPlayer);
                            this._currentPlayer = null
                        }
                    }, enableTimeUpdate: function _modernPlayer_enableTimeUpdate() {
                        if (this._currentMediaEventsCallback && this._currentPlayer) {
                            this._currentPlayer.removeEventListener("timeupdate", this._currentMediaEventsCallback);
                            this._currentPlayer.addEventListener("timeupdate", this._currentMediaEventsCallback, false)
                        }
                    }, disableTimeUpdate: function _modernPlayer_disableTimeUpdate() {
                        if (this._currentMediaEventsCallback && this._currentPlayer)
                            this._currentPlayer.removeEventListener("timeupdate", this._currentMediaEventsCallback)
                    }, forceTimeUpdate: function _modernPlayer_forceTimeUpdate() {
                        if (this._currentPlayer)
                            return this._currentPlayer.currentTime * 1000
                    }, isRemoteSession: function _modernPlayer_isRemoteSession() {
                        return this._isDlnaConnectionPresent()
                    }, _setMedia: function _modernPlayer_setMedia(mediaInstance) {
                        if (!mediaInstance)
                            throw"_modernPlayer_setMedia: null mediaInstance!";
                        var name = (mediaInstance._mediaItem && mediaInstance._mediaItem.data) ? mediaInstance._mediaItem.data.name : String.empty;
                        MS.Entertainment.Platform.Playback.Etw.traceString("XPlayer::_setMedia: name=[" + name + "], source=[" + mediaInstance.source + "]");
                        if (this._isDlnaConnectionPresent()) {
                            var dlnaNextPlayer;
                            if (!this._shouldDisableDlnaPlayTo(mediaInstance)) {
                                this._unhookCurrentMediaEvents();
                                dlnaNextPlayer = this._createHtmlTag(mediaInstance, false);
                                if (!dlnaNextPlayer.msPlayToDisabled) {
                                    this._currentPlayer.msPlayToSource.next = dlnaNextPlayer.msPlayToSource;
                                    this._currentPlayer.msPlayToSource.playNext()
                                }
                                this._currentMedia = null;
                                this._currentPlayer.removeAttribute("src");
                                this._currentPlayer.load();
                                if (this._playerContainer.hasChildNodes())
                                    this._playerContainer.removeChild(this._currentPlayer);
                                this._currentPlayer = dlnaNextPlayer;
                                this._currentMedia = mediaInstance;
                                this._hookupCurrentMediaEvents();
                                this._playerContainer.appendChild(this._currentPlayer)
                            }
                            if (!dlnaNextPlayer || dlnaNextPlayer.msPlayToDisabled)
                                if (this._currentPlayer && this._currentMedia) {
                                    this._nextMedia = mediaInstance;
                                    this._nextMediaLoaded = false;
                                    this._nextMediaStarted = false;
                                    this._nextMediaError = false;
                                    this._fireNextMediaError(MSEPlatform.Playback.Error.X8_E_PLAYBACK_MEDIA_ERR_SRC_NOT_SUPPORTED, "XPlayer::_setMedia, playTo is disabled for media. Current media playing, treat this as next media")
                                }
                                else
                                    this._firePlaybackError(MSEPlatform.Playback.Error.X8_E_PLAYBACK_MEDIA_ERR_SRC_NOT_SUPPORTED, "XPlayer::_setMedia, playTo is disabled for media");
                            dlnaNextPlayer = null
                        }
                        else {
                            if (this._currentPlayer)
                                this.reset(false);
                            this._currentPlayer = this._createHtmlTag(mediaInstance, this._autoPlay);
                            this._hookupCurrentMediaEvents();
                            this._currentMedia = mediaInstance;
                            MS.Entertainment.Platform.Playback.Etw.traceString("XPlayer::_setMedia: audio/video tag appending");
                            this._playerContainer.appendChild(this._currentPlayer)
                        }
                    }, _setNextMedia: function _modernPlayer_setNextMedia(mediaInstance) {
                        if (!mediaInstance)
                            throw"_modernPlayer_setNextMedia: null mediaInstance!";
                        var name = (mediaInstance._mediaItem && mediaInstance._mediaItem.data) ? mediaInstance._mediaItem.data.name : String.empty;
                        MS.Entertainment.Platform.Playback.Etw.traceString("+XPlayer::_setNextMedia: name=[" + name + "], source=[" + mediaInstance.source + "]");
                        var succeeded = true;
                        if (this._nextPlayer)
                            this.reset(true);
                        function finalizeThePlayer() {
                            this._nextMedia = mediaInstance;
                            this._nextMediaLoaded = false;
                            this._nextMediaStarted = false;
                            this._nextMediaError = false;
                            if (this._isDlnaConnectionPresent())
                                if (!this._nextPlayer || this._nextPlayer.msPlayToDisabled) {
                                    this._fireNextMediaError(MSEPlatform.Playback.Error.X8_E_PLAYBACK_MEDIA_ERR_SRC_NOT_SUPPORTED, "XPlayer::_setNextMedia, playTo is disabled for media");
                                    succeeded = false
                                }
                            if (succeeded)
                                this._hookupNextMediaEvents();
                            MS.Entertainment.Platform.Playback.Etw.traceString("-XPlayer::_setNextMedia")
                        }
                        if (!this._isDlnaConnectionPresent() || !this._shouldDisableDlnaPlayTo(mediaInstance))
                            this._watchTimeSeparation(function nextHTML() {
                                this._nextPlayer = this._createHtmlTag(mediaInstance, false);
                                finalizeThePlayer.bind(this)()
                            }.bind(this), "_setNextMedia::_createHtmlTag");
                        else
                            finalizeThePlayer.bind(this)()
                    }, _fireNextMediaError: function XPlayer_fireNextMediaError(error, context) {
                        MSEPlatform.Playback.firePlaybackError(this._handleNextMediaEvents.bind(this), this._remapErrorForPlayTo(error), context)
                    }, _firePlaybackError: function XPlayer_firePlaybackError(error, context) {
                        MSEPlatform.Playback.firePlaybackError(this._currentMediaEventsCallback, this._remapErrorForPlayTo(error), context)
                    }, _remapErrorForPlayTo: function XPlayer_remapErrorForPlayTo(error) {
                        var mappedError = error;
                        if (error && (typeof(error) === "object") && (error.code === MSEPlatform.Playback.Error.X8_E_PLAYBACK_MEDIA_ERR_SRC_NOT_SUPPORTED.code))
                            if (this._isDlnaConnectionPresent()) {
                                mappedError = MSEPlatform.Playback.Error.X8_E_PLAYBACK_MEDIA_CANT_PLAYTO;
                                var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                                if (signedInUser && signedInUser.isSubscription)
                                    mappedError = MSEPlatform.Playback.Error.X8_E_PLAYBACK_MEDIA_CANT_PLAYTO_PREMIUM
                            }
                        return mappedError
                    }, _drmNotifyException: function _modernPlayer_drmNotifyException(ex, source) {
                        var that = this;
                        WinJS.Promise.timeout().then(function notifyDrmException() {
                            that._firePlaybackError(-1072885286, source)
                        })
                    }, _drmNotifyError: function _modernPlayer_drmNotifyError(error, source) {
                        var that = this;
                        var bubbleError = true;
                        function _sendError(code) {
                            WinJS.Promise.timeout().then(function notifyDrmError() {
                                that._firePlaybackError(code, source)
                            })
                        }
                        {};
                        if (!error) {
                            var code;
                            switch (source) {
                                case MS.Entertainment.Platform.Playback.Error.NS_E_DRM_NEEDS_INDIVIDUALIZATION.name:
                                    code = MS.Entertainment.Platform.Playback.Error.NS_E_DRM_NEEDS_INDIVIDUALIZATION.code;
                                    break;
                                case MS.Entertainment.Platform.Playback.Error.NS_E_WMP_BAD_DRIVER.name:
                                    code = MS.Entertainment.Platform.Playback.Error.NS_E_WMP_BAD_DRIVER.code;
                                    break;
                                case MS.Entertainment.Platform.Playback.Error.ZEST_E_SIGNIN_REQUIRED.name:
                                    code = MS.Entertainment.Platform.Playback.Error.ZEST_E_SIGNIN_REQUIRED.code;
                                    break;
                                default:
                                    code = -1072885286;
                                    break
                            }
                            {};
                            _sendError(code)
                        }
                        else {
                            if (error.number === -1056856108)
                                if (this._currentMedia && this._currentMedia._mediaItem && this._currentMedia._mediaItem.data && this._currentMedia._mediaItem.data["playFromXbox"]) {
                                    bubbleError = false;
                                    this._currentMedia._mediaItem.data["playPreviewOnly"] = true;
                                    WinJS.Promise.timeout().then(function tryPreview() {
                                        MS.Entertainment.Platform.PlaybackHelpers.playMedia(that._currentMedia._mediaItem.data, true)
                                    })
                                }
                            if (bubbleError)
                                _sendError(error.number ? error.number : error.code)
                        }
                    }, _createHtmlTag: function _modernPlayer_createHtmlTag(mediaInstance, autoPlay) {
                        MS.Entertainment.Platform.Playback.Etw.traceString("XPlayer::_createHtmlTag: creating audio/video tag");
                        var that = this;
                        var Playback = MS.Entertainment.Platform.Playback;
                        var playerType = ((mediaInstance.mediaType === Microsoft.Entertainment.Queries.ObjectType.video) ? "video" : "audio");
                        var htmlTag = null;
                        var usingFastStart = false;
                        var usePreCreatedAudioTag = false;
                        var audioTagForFileActivation = MS.Entertainment.Platform.Playback.XPlayer.audioTagForFileActivation;
                        if (audioTagForFileActivation)
                            if (audioTagForFileActivation.played && audioTagForFileActivation.duration > 0 && audioTagForFileActivation.played.length > 0 && !audioTagForFileActivation.error) {
                                usePreCreatedAudioTag = true;
                                htmlTag = audioTagForFileActivation;
                                MS.Entertainment.Platform.Playback.XPlayer.audioTagForFileActivation = null
                            }
                        if (!usePreCreatedAudioTag)
                            if (playerType === "audio" && autoPlay && this._fastStartTag && !mediaInstance.isLocal && !mediaInstance.disableFastStart && mediaInstance.protectionState === MS.Entertainment.Platform.Playback.ProtectionState.drmProtected) {
                                MS.Entertainment.Platform.Playback.Etw.traceString("XPlayer::_createHtmlTag: Using FastStart");
                                htmlTag = this._fastStartTag;
                                this._fastStartTag = null;
                                usingFastStart = true
                            }
                            else
                                htmlTag = document.createElement(playerType);
                        if (!htmlTag)
                            throw"_modernPlayer_createHtmlTag: Error! cannot create " + playerType + " tag. Out of memory?";
                        if (playerType === "audio")
                            try {
                                htmlTag.setAttribute("msAudioCategory", "backgroundCapableMedia")
                            }
                            catch(ex) {}
                        else {
                            htmlTag.setAttribute("msAudioCategory", "foregroundOnlyMedia");
                            MS.Entertainment.Platform.Playback.ClosedCaptions.Renderer.loadAndUpdateClosedCaptionStyleSettings()
                        }
                        htmlTag.msPlayToDisabled = this._shouldDisableDlnaPlayTo(mediaInstance);
                        if (mediaInstance.protectionState !== MS.Entertainment.Platform.Playback.ProtectionState.unprotected)
                            this._configureTagForDRM(htmlTag, mediaInstance);
                        htmlTag.autoplay = autoPlay;
                        if (usingFastStart) {
                            htmlTag.fastStartProperties["Url"] = mediaInstance.source;
                            MS.Entertainment.Platform.Playback.assert(!mediaInstance.isLocal, "fast start tag should only be used with streaming content");
                            MS.Entertainment.Platform.Playback.assert(mediaInstance.protectionState === MS.Entertainment.Platform.Playback.ProtectionState.drmProtected, "fast start tag should only be used with protected content");
                            WinJS.Promise.timeout().then(function fastStartSimulateMediaLoaded() {
                                if (!htmlTag.error) {
                                    htmlTag.durationOverrideMS = this._getCurrentMediaDurationMS();
                                    this._currentMediaEventsCallback({
                                        srcElement: htmlTag, type: "loadedmetadata"
                                    })
                                }
                                else {
                                    var target = {error: htmlTag.error};
                                    this._currentMediaEventsCallback({
                                        srcElement: htmlTag, type: "error", target: target
                                    })
                                }
                            }.bind(this));
                            MS.Entertainment.Platform.Playback.assert(autoPlay, "fast start tag should only be used with autoplay");
                            htmlTag.play()
                        }
                        else if (!usePreCreatedAudioTag)
                            htmlTag.src = mediaInstance.source;
                        else
                            WinJS.Promise.timeout().then(function preCreatedHtmlTagSimulateEvents() {
                                if (!htmlTag.error) {
                                    if (this._currentMedia && this._currentMedia._mediaItem && this._currentMedia._mediaItem.data)
                                        if (!this._currentMedia._mediaItem.data.duration || this._currentMedia._mediaItem.data.duration <= 0)
                                            this._currentMedia._mediaItem.data.duration = Math.round(this._currentPlayer.duration * 1000);
                                    this._currentMediaEventsCallback({
                                        srcElement: htmlTag, type: "loadedmetadata"
                                    });
                                    this._currentMediaEventsCallback({
                                        srcElement: htmlTag, type: "playing"
                                    })
                                }
                            }.bind(this));
                        htmlTag.style.width = "100%";
                        htmlTag.style.height = "100%";
                        return htmlTag
                    }, _configureTagForDRM: function _configureTagForDRM(htmlTag, mediaInstance) {
                        var that = this;
                        var Playback = MS.Entertainment.Platform.Playback;
                        var licenseLog = "";
                        var startLicenseAcquisitionTime = new Date;
                        MS.Entertainment.Platform.Playback.assert(mediaInstance, "mediaInstance should not be null");
                        function getKidFromServiceRequest(e) {
                            return e && e.request && e.request.contentHeader ? e.request.contentHeader.keyIdString : String.empty
                        }
                        function serviceRequested(e) {
                            function onPlaySRCompleted(asyncOp) {
                                if (e && e.completion && e.completion.complete)
                                    e.completion.complete(true);
                                MS.Entertainment.Utilities.Telemetry.logReactiveLicenseAcquisitionProgress(mediaInstance, getKidFromServiceRequest(e), "License acquisition succeeded");
                                var elapsedTime = new Date - startLicenseAcquisitionTime;
                                Playback.Etw.traceString("DRM:LA Time Elapsed (ms) : " + elapsedTime);
                                licenseLog = "";
                                if (that._fastStartBlockedOnLA)
                                    that._fastStartBlockedOnLA = false;
                                if (mediaInstance.mediaType === Microsoft.Entertainment.Queries.ObjectType.track && !mediaInstance.trackLeafLicenseAcquired && mediaInstance.isLocal)
                                    mediaInstance.trackLeafLicenseAcquired = true
                            }
                            function onPlaySRError(error) {
                                var errorCode = (error && error.number) ? error.number : "unknown";
                                Playback.Etw.traceString("DRM:onPlaySRError: " + errorCode);
                                MS.Entertainment.Utilities.Telemetry.logReactiveLicenseAcquisitionProgress(mediaInstance, getKidFromServiceRequest(e), "License acquisition failed with error " + errorCode);
                                var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                                if (error && error.number === -1072879848 && signedInUser && signedInUser.isSubscription && mediaInstance.isLocal) {
                                    Playback.Etw.traceString("DRM:onPlaySRError: retry root LA for subscription downloaded content");
                                    getPassportTicket().then(function _gotTicket(ticket) {
                                        MS.Entertainment.Platform.Playback.drmIndividualizationPromise.then(function _doAcquireRootLicense() {
                                            Microsoft.Entertainment.Util.PlayReadyHandler.acquireRootLicense(ticket)
                                        })
                                    }).then(function _rootSucceeded() {
                                        Playback.Etw.traceString("DRM:onPlaySRError: root LA retry SUCCEEDED");
                                        MS.Entertainment.Utilities.Telemetry.logRootLicenseAcquisition("succeeded");
                                        if (e && e.completion && e.completion.complete)
                                            e.completion.complete(true)
                                    }, function _rootFailed(error) {
                                        Playback.Etw.traceString("DRM:onPlaySRError: root LA retry FAILED: " + errorCode);
                                        MS.Entertainment.Utilities.Telemetry.logRootLicenseAcquisition("failed", errorCode);
                                        if (e && e.completion && e.completion.complete)
                                            e.completion.complete(true);
                                        that._drmNotifyError(error, "DRM ServiceRequest Error (Root LA Retry): " + licenseLog)
                                    })
                                }
                                else {
                                    if (e && e.completion && e.completion.complete)
                                        e.completion.complete(true);
                                    that._drmNotifyError(error, "DRM ServiceRequest Error: " + licenseLog)
                                }
                            }
                            function onPlaySRProgress(report) {
                                var elapsedTime = new Date - startLicenseAcquisitionTime;
                                Playback.Etw.traceString("DRM:" + elapsedTime + ":" + report);
                                licenseLog += elapsedTime + " : " + report + "\n"
                            }
                            try {
                                if (mediaInstance === null)
                                    return;
                                if (e.request.type === Microsoft.Media.PlayReadyClient.PlayReadyStatics.individualizationServiceRequestType) {
                                    MS.Entertainment.Utilities.Telemetry.logReactiveLicenseAcquisitionProgress(mediaInstance, String.empty, "Individualization Requested");
                                    e.request.beginServiceRequest().then(function indiv_complete() {
                                        MS.Entertainment.Utilities.Telemetry.logReactiveLicenseAcquisitionProgress(mediaInstance, String.empty, "Individualization Successful");
                                        try {
                                            var next = e.request.nextServiceRequest();
                                            if (next) {
                                                e.request = next;
                                                serviceRequested(e)
                                            }
                                            else
                                                onPlaySRCompleted()
                                        }
                                        catch(ex) {
                                            that._drmNotifyException(ex, "DRM Individualization Service Request")
                                        }
                                    }, function indiv_error() {
                                        MS.Entertainment.Utilities.Telemetry.logReactiveLicenseAcquisitionProgress(mediaInstance, String.empty, "Individualization Failed");
                                        that._drmNotifyError(null, MS.Entertainment.Platform.Playback.Error.NS_E_DRM_NEEDS_INDIVIDUALIZATION.name)
                                    });
                                    return
                                }
                                MS.Entertainment.Utilities.Telemetry.logReactiveLicenseAcquisitionProgress(mediaInstance, getKidFromServiceRequest(e), "License Needed");
                                getPassportTicket().then(function execute_drm_serviceRequest(ticket) {
                                    return mediaInstance.fillDownloadSubscriptionInfoAsync().then(function fillDownloadSubscriptionInfoAsync_complete() {
                                            var handler;
                                            try {
                                                var right = MS.Entertainment.Platform.PurchaseHelpers.LicenseRightMap.toScript(mediaInstance.nativeLicenseRight);
                                                if (!mediaInstance.mediaInstanceId || MS.Entertainment.Utilities.isEmptyGuid(mediaInstance.mediaInstanceId) || !right)
                                                    if (mediaInstance.mediaType === Microsoft.Entertainment.Queries.ObjectType.track) {
                                                        MS.Entertainment.Utilities.Telemetry.logReactiveLicenseAcquisitionProgress(mediaInstance, getKidFromServiceRequest(e), "Track has no MIID or no rights");
                                                        that._drmNotifyError(MS.Entertainment.Platform.Playback.Error.ZUNE_E_NO_SUBSCRIPTION_DOWNLOAD_RIGHTS, "No rights to this content");
                                                        return
                                                    }
                                                    else {
                                                        handler = new Microsoft.Entertainment.Util.PlayReadyHandler(ticket, mediaInstance.shouldLogToDrmDownloadHistory, mediaInstance.serviceIdSafe);
                                                        MS.Entertainment.Utilities.Telemetry.logReactiveLicenseAcquisitionProgress(mediaInstance, getKidFromServiceRequest(e), "Attempting SMID enabler")
                                                    }
                                                else if (mediaInstance.mediaType === Microsoft.Entertainment.Queries.ObjectType.track && mediaInstance.trackLeafLicenseAcquired) {
                                                    Playback.Etw.traceString("DRM:onPlaySRError: retry root LA for subscription downloaded content");
                                                    handler = new Microsoft.Entertainment.Util.PlayReadyHandler(ticket);
                                                    MS.Entertainment.Utilities.Telemetry.logReactiveLicenseAcquisitionProgress(mediaInstance, getKidFromServiceRequest(e), "Attempting root subscription enabler")
                                                }
                                                else {
                                                    handler = new Microsoft.Entertainment.Util.PlayReadyHandler(ticket, right, mediaInstance.shouldLogToDrmDownloadHistory, mediaInstance.offerId ? mediaInstance.offerId : MS.Entertainment.Utilities.EMPTY_GUID, mediaInstance.mediaInstanceId);
                                                    MS.Entertainment.Utilities.Telemetry.logReactiveLicenseAcquisitionProgress(mediaInstance, getKidFromServiceRequest(e), "Attempting MIID+Offer enabler")
                                                }
                                                handler.beginServiceRequest(e.request).then(onPlaySRCompleted, onPlaySRError, onPlaySRProgress)
                                            }
                                            catch(ex) {
                                                MS.Entertainment.Utilities.Telemetry.logReactiveLicenseAcquisitionProgress(mediaInstance, getKidFromServiceRequest(e), "Unexpected exception thrown");
                                                that._drmNotifyException(ex, "License Acquisition Service Request")
                                            }
                                        }, function fillDownloadSubscriptionInfoAsync_error(error) {
                                            MS.Entertainment.Utilities.Telemetry.logReactiveLicenseAcquisitionProgress(mediaInstance, getKidFromServiceRequest(e), "Media Detail Query failed");
                                            that._drmNotifyError(error, "Media Detail Query Failure")
                                        })
                                }, function sign_in_failure(error) {
                                    MS.Entertainment.Utilities.Telemetry.logReactiveLicenseAcquisitionProgress(mediaInstance, getKidFromServiceRequest(e), "Sign in Failed");
                                    that._drmNotifyError(null, MS.Entertainment.Platform.Playback.Error.ZEST_E_SIGNIN_REQUIRED.name)
                                })
                            }
                            catch(ex) {
                                MS.Entertainment.Utilities.Telemetry.logReactiveLicenseAcquisitionProgress(mediaInstance, getKidFromServiceRequest(e), "Unexpected outer exception thrown");
                                that._drmNotifyException(ex, "serviceRequested")
                            }
                        }
                        function componentLoadFailed(e) {
                            var msg = "";
                            try {
                                msg += e.information.items.size + " failed components!\n";
                                msg += "Components:\n";
                                for (var i = 0; i < e.information.items.size; i++)
                                    msg += e.information.items[i].name + "\nReasons=0x" + e.information.items[i].reasons + "\n" + "Renewal Id=" + e.information.items[i].renewalId + "\n";
                                e.completion.complete(true);
                                msg += "Resumed source (false)\n";
                                MSEPlatform.Playback.Etw.traceString(msg);
                                that._drmNotifyError(null, MSEPlatform.Playback.Error.NS_E_WMP_BAD_DRIVER.name)
                            }
                            catch(e) {
                                that._drmNotifyException(e, "componentLoadFailed")
                            }
                        }
                        var mediaProtectionManager = new Windows.Media.Protection.MediaProtectionManager;
                        mediaProtectionManager.addEventListener("componentloadfailed", componentLoadFailed, false);
                        mediaProtectionManager.addEventListener("servicerequested", serviceRequested, false);
                        mediaProtectionManager.properties["Windows.Media.Protection.MediaProtectionSystemId"] = "{F4637010-03C3-42CD-B932-B48ADF3A6A54}";
                        var copyProtectionSystems = new Windows.Foundation.Collections.PropertySet;
                        copyProtectionSystems["{F4637010-03C3-42CD-B932-B48ADF3A6A54}"] = "Microsoft.Media.PlayReadyClient.PlayReadyWinRTTrustedInput";
                        mediaProtectionManager.properties["Windows.Media.Protection.MediaProtectionSystemIdMapping"] = copyProtectionSystems;
                        htmlTag.msSetMediaProtectionManager(mediaProtectionManager)
                    }, _configureFastStartTagForDRM: function _configureFastStartTagForDRM(htmlTag) {
                        var disableFastStart = function disableFastStart(e) {
                                if (this._fastStartTag) {
                                    this._fastStartTag.removeAttribute("src");
                                    this._fastStartTag.load();
                                    this._fastStartTag = null
                                }
                                this._fastStartBlockedOnLA = true
                            }.bind(this);
                        var mediaProtectionManager = new Windows.Media.Protection.MediaProtectionManager;
                        mediaProtectionManager.addEventListener("componentloadfailed", disableFastStart, false);
                        mediaProtectionManager.addEventListener("servicerequested", disableFastStart, false);
                        mediaProtectionManager.properties["Windows.Media.Protection.MediaProtectionSystemId"] = "{F4637010-03C3-42CD-B932-B48ADF3A6A54}";
                        var copyProtectionSystems = new Windows.Foundation.Collections.PropertySet;
                        copyProtectionSystems["{F4637010-03C3-42CD-B932-B48ADF3A6A54}"] = "Microsoft.Media.PlayReadyClient.PlayReadyWinRTTrustedInput";
                        mediaProtectionManager.properties["Windows.Media.Protection.MediaProtectionSystemIdMapping"] = copyProtectionSystems;
                        htmlTag.msSetMediaProtectionManager(mediaProtectionManager)
                    }, _hookupCurrentMediaEvents: function _modernPlayer_hookupCurrentMediaEvents() {
                        if (this._currentMediaEventsCallback) {
                            this._currentPlayer.addEventListener("loadedmetadata", this._currentMediaEventsCallback, false);
                            this._currentPlayer.addEventListener("playing", this._currentMediaEventsCallback, false);
                            this._currentPlayer.addEventListener("ended", this._currentMediaEventsCallback, false);
                            this._currentPlayer.addEventListener("pause", this._currentMediaEventsCallback, false);
                            this._currentPlayer.addEventListener("error", this._currentMediaEventsCallback, false);
                            this._currentPlayer.addEventListener("seeked", this._currentMediaEventsCallback, false)
                        }
                        this.enableTimeUpdate();
                        this._currentPlayer.addEventListener("ended", this._handleCurrentMediaEvents.bind(this), false);
                        this._currentPlayer.addEventListener("playing", this._handleCurrentMediaEvents.bind(this), false);
                        this._currentPlayer.addEventListener("pause", this._handleCurrentMediaEvents.bind(this), false);
                        this._currentPlayer.addEventListener("error", this._handleCurrentMediaEvents.bind(this), false);
                        if (this._currentPlayer && !this._currentPlayer.msPlayToDisabled)
                            try {
                                if (this._currentPlayer.msPlayToSource && this._currentPlayer.msPlayToSource.connection) {
                                    this._currentPlayer.msPlayToSource.connection.addEventListener("error", this._handleDlnaConnectionEvents.bind(this), false);
                                    this._currentPlayer.msPlayToSource.connection.addEventListener("statechanged", this._handleDlnaConnectionEvents.bind(this), false);
                                    this._currentPlayer.msPlayToSource.connection.addEventListener("transferred", this._handleDlnaConnectionEvents.bind(this), false)
                                }
                            }
                            catch(ex) {
                                MS.Entertainment.UI.Debug.writeLine("Failed to hook up DLNA Connection events: " + ex)
                            }
                    }, _unhookCurrentMediaEvents: function _modernPlayer_unhookCurrentMediaEvents() {
                        if (this._currentPlayer) {
                            this._currentPlayer.removeEventListener("ended", this._handleCurrentMediaEvents);
                            if (this._currentMediaEventsCallback) {
                                this._currentPlayer.removeEventListener("loadedmetadata", this._currentMediaEventsCallback);
                                this._currentPlayer.removeEventListener("playing", this._currentMediaEventsCallback);
                                this._currentPlayer.removeEventListener("ended", this._currentMediaEventsCallback);
                                this._currentPlayer.removeEventListener("pause", this._currentMediaEventsCallback);
                                this._currentPlayer.removeEventListener("error", this._currentMediaEventsCallback);
                                this._currentPlayer.removeEventListener("seeked", this._currentMediaEventsCallback)
                            }
                            this.disableTimeUpdate();
                            if (this._currentPlayer && !this._currentPlayer.msPlayToDisabled)
                                try {
                                    if (this._currentPlayer.msPlayToSource && this._currentPlayer.msPlayToSource.connection) {
                                        this._currentPlayer.msPlayToSource.connection.removeEventListener("error", this._handleDlnaConnectionEvents);
                                        this._currentPlayer.msPlayToSource.connection.removeEventListener("statechanged", this._handleDlnaConnectionEvents);
                                        this._currentPlayer.msPlayToSource.connection.removeEventListener("transferred", this._handleDlnaConnectionEvents)
                                    }
                                }
                                catch(ex) {
                                    MS.Entertainment.UI.Debug.writeLine("Failed to unhook DLNA Connection events: " + ex)
                                }
                        }
                    }, _hookupNextMediaEvents: function _modernPlayer_hookupNextMediaEvents() {
                        var handler = this._handleNextMediaEvents.bind(this);
                        var nextPlayer = this._nextPlayer;
                        this._unhookNextMediaEvents();
                        nextPlayer.addEventListener("loadedmetadata", handler, false);
                        nextPlayer.addEventListener("error", handler, false);
                        this._unhookNextMediaEvents = function() {
                            nextPlayer.removeEventListener("loadedmetadata", handler);
                            nextPlayer.removeEventListener("error", handler)
                        }
                    }, _unhookNextMediaEvents: function _modernPlayer_unhookNextMediaEvents(){}, _handleCurrentMediaEvents: function _modernPlayer_handleCurrentMediaEvents(event) {
                        var traceInfo = String.empty;
                        if (event.type === "error" && event.target && event.target.error)
                            traceInfo = "errorCode: " + event.target.error.code;
                        MS.Entertainment.Platform.Playback.Etw.traceString("XPlayer::_handleCurrentMediaEvents event from audio/video tag: " + event.type + " " + traceInfo);
                        if (this._currentMedia) {
                            this._currentMedia.maxPosition = this._currentPlayer.currentTime;
                            this._currentMedia._lastStateChangeEvent = event
                        }
                        switch (event.type) {
                            case"ended":
                                if (this._nextMedia && !this._nextMediaLoaded)
                                    MS.Entertainment.Platform.Playback.Etw.traceString("XPlayer::_handleCurrentMediaEvents : playback ended before preroll completed");
                                else if (this._switchPlayer())
                                    this._currentPlayer.play();
                                break;
                            default:
                                break
                        }
                    }, _handleNextMediaEvents: function _modernPlayer_handleNextMediaEvents(event) {
                        if (this._nextMedia)
                            this._nextMedia._lastStateChangeEvent = event;
                        switch (event.type) {
                            case"loadedmetadata":
                                MS.Entertainment.Platform.Playback.Etw.traceString("XPlayer::_handleNextMediaEvents - loadedmetadata");
                                if (this._nextMedia) {
                                    MS.Entertainment.Platform.Playback.Etw.traceString("XPlayer::_handleNextMediaEvents - loadedmetadata, resetting errorDescriptor");
                                    this._nextMedia._errorDescriptor = null;
                                    this._nextMediaError = false;
                                    this._nextMediaLoaded = true;
                                    if (this._currentPlayer && this._currentPlayer.ended) {
                                        MS.Entertainment.Platform.Playback.Etw.traceString("XPlayer::_handleNextMediaEvents - preroll completed after previous track ended. Calling switchPlayer.");
                                        if (this._switchPlayer())
                                            this._currentPlayer.play()
                                    }
                                }
                                else
                                    MS.Entertainment.Platform.Playback.Etw.traceString("XPlayer::_handleNextMediaEvents - loadedmetadata, nextMedia null?");
                                break;
                            case"error":
                                MS.Entertainment.Platform.Playback.Etw.traceString("XPlayer::_handleNextMediaEvents - error");
                                MS.Entertainment.Platform.Playback.Etw.traceString("XPlayer::_handleNextMediaEvents - error," + " src = " + (event.target.src ? event.target.src : "null") + " currentsrc = " + (event.target.currentSrc ? event.target.currentSrc : "null") + " code = " + (event.target.error.code ? event.target.error.code : "null") + " msExtendedCode = " + (event.target.error.msExtendedCode ? event.target.error.msExtendedCode : "null"));
                                if (this._nextMedia) {
                                    this._nextMedia._errorDescriptor = event.target.error;
                                    this._nextMediaError = true
                                }
                                else
                                    MS.Entertainment.Platform.Playback.Etw.traceString("XPlayer::_handleNextMediaEvents - error, nextMedia null?");
                                break;
                            default:
                                break
                        }
                    }, _handleDlnaConnectionEvents: function _modernPlayer_handleDlnaConnectionEvents(event) {
                        switch (event.type) {
                            case"error":
                                MS.Entertainment.Platform.Playback.Etw.traceString("XPlayer::_handleDlnaConnectionEvents - Error = " + event.code);
                                MS.Entertainment.UI.Debug.writeLine("DLNA ConnectionError: " + event.code);
                                break;
                            case"statechanged":
                                if (this._currentPlayer && !this._currentPlayer.msPlayToDisabled && this._currentPlayer.msPlayToSource && this._currentPlayer.msPlayToSource.connection) {
                                    MS.Entertainment.UI.Debug.writeLine("_currentPlayer connection state: " + this._currentPlayer.msPlayToSource.connection.state);
                                    this._dlnaConnectionState = this._currentPlayer.msPlayToSource.connection.state;
                                    MS.Entertainment.Platform.Playback.Etw.traceString("XPlayer::_handleDlnaConnectionEvents - _currentPlayer Connection StateChanged = " + this._dlnaConnectionState)
                                }
                                else {
                                    MS.Entertainment.UI.Debug.writeLine("DLNA Connection StateChanged: " + event.currentState);
                                    this._dlnaConnectionState = event.currentState;
                                    MS.Entertainment.Platform.Playback.Etw.traceString("XPlayer::_handleDlnaConnectionEvents - DLNA Connection StateChanged = " + this._dlnaConnectionState)
                                }
                                if (this._dlnaConnectionState === Windows.Media.PlayTo.PlayToConnectionState.disconnected) {
                                    this.dmrName = "";
                                    this.isRemoteSessionRunning = false;
                                    if (this._currentPlayer && this._currentPlayer.msPlayToDisabled)
                                        this._firePlaybackError(MSEPlatform.Playback.Error.X8_E_PLAYBACK_MEDIA_ERR_SRC_NOT_SUPPORTED, "DLNA actual device error")
                                }
                                break;
                            case"transferred":
                                MS.Entertainment.Platform.Playback.Etw.traceString("XPlayer::_handleDlnaConnectionEvents - DLNA Connection Transferred");
                                MS.Entertainment.UI.Debug.writeLine("DLNA Connection Transferred");
                                break
                        }
                    }, _isDlnaConnectionPresent: function _modernPlayer_isDlnaConnectionPresent() {
                        return (this._dlnaPlayToMgr && this._dlnaConnectionState !== Windows.Media.PlayTo.PlayToConnectionState.disconnected)
                    }, _shouldDisableDlnaPlayTo: function _modernPlayer_shouldDisableDlnaPlayTo(mediaInstance) {
                        var mediaType = mediaInstance.mediaType;
                        var disable = false;
                        if (mediaType === Microsoft.Entertainment.Queries.ObjectType.video) {
                            if (mediaInstance.protectionState === MS.Entertainment.Platform.Playback.ProtectionState.drmProtected)
                                disable = true
                        }
                        else if (!mediaInstance.isLocal && mediaInstance.protectionState === MS.Entertainment.Platform.Playback.ProtectionState.drmProtected)
                            disable = true;
                        return disable
                    }, _switchPlayer: function _modernPlayer_switchPlayer() {
                        var switchSucceeded = false;
                        if (this._nextPlayer) {
                            MSEPlatform.Playback.Etw.traceSwitchingToNextMedia(this._nextMedia.source);
                            this._unhookCurrentMediaEvents();
                            if (this._isDlnaConnectionPresent()) {
                                if (this._currentPlayer && this._currentPlayer.msPlayToSource)
                                    if (this._currentPlayer.msPlayToSource.next) {
                                        this._currentPlayer.msPlayToSource.playNext();
                                        switchSucceeded = true
                                    }
                                    else if (this._nextPlayer.msPlayToDisabled)
                                        this._fireNextMediaError(MSEPlatform.Playback.Error.X8_E_PLAYBACK_MEDIA_ERR_SRC_NOT_SUPPORTED, "XPlayer::_switchPlayer, playTo is disabled for media");
                                    else
                                        try {
                                            this._currentPlayer.msPlayToSource.next = this._nextPlayer.msPlayToSource;
                                            this._currentPlayer.msPlayToSource.playNext();
                                            switchSucceeded = true
                                        }
                                        catch(ex) {
                                            this._currentPlayer.msPlayToSource = null
                                        }
                            }
                            else
                                switchSucceeded = true
                        }
                        if (switchSucceeded) {
                            this._destroyCurrentAndPromoteNextPlayer();
                            this._nextMediaStarted = true
                        }
                        return switchSucceeded
                    }, _destroyCurrentAndPromoteNextPlayer: function _modernPlayer_destroyCurrentAndPromoteNextPlayer() {
                        MS.Entertainment.Platform.Playback.Etw.traceString("XPlayer:_destroyCurrentAndPromoteNextPlayer");
                        this._currentMedia = null;
                        try {
                            if (this._currentPlayer) {
                                this._currentPlayer.removeAttribute("src");
                                this._currentPlayer.load();
                                if (this._playerContainer.hasChildNodes())
                                    this._playerContainer.removeChild(this._currentPlayer)
                            }
                        }
                        catch(ex) {
                            MS.Entertainment.Platform.Playback.assert(ex, "Error in media tag removal");
                            MS.Entertainment.Utilities.Telemetry.logErrorInMediaTagRemoval(ex)
                        }
                        this._currentPlayer = this._nextPlayer;
                        this._currentMedia = this._nextMedia;
                        this._playerContainer.appendChild(this._currentPlayer);
                        this._hookupCurrentMediaEvents();
                        this._unhookNextMediaEvents();
                        this._nextPlayer = null;
                        this._nextMedia = null
                    }, _onSourceRequested: function _modernPlayer_onSourceRequested(event) {
                        if (this._currentPlayer && this._currentPlayer.msPlayToDisabled)
                            return;
                        try {
                            var sourceRequest = event.sourceRequest;
                            var deferral = sourceRequest.getDeferral();
                            if (this._currentPlayer) {
                                sourceRequest.setSource(this._currentPlayer.msPlayToSource);
                                if (this._nextMedia && this._shouldDisableDlnaPlayTo(this._nextMedia))
                                    this._fireNextMediaError(MSEPlatform.Playback.Error.X8_E_PLAYBACK_MEDIA_ERR_SRC_NOT_SUPPORTED, "XPlayer::_onSourceRequested, playTo is disabled for next media")
                            }
                            else
                                sourceRequest.setSource(null);
                            deferral.complete()
                        }
                        catch(ex) {
                            this._firePlaybackError(ex.number, "DLNA SourceRequested")
                        }
                    }, _onSourceSelected: function _modernPlayer_onSourceSelected(event) {
                        if (event && event.friendlyName) {
                            MS.Entertainment.UI.Debug.writeLine("DLNA SourceSelected: DMR = " + event.friendlyName);
                            this.isRemoteSessionRunning = true;
                            this.dmrName = event.friendlyName
                        }
                    }, _setupDlnaPlayToMgr: function _modernPlayer_setupDlnaPlayToMgr() {
                        this._dlnaConnectionState = Windows.Media.PlayTo.PlayToConnectionState.disconnected;
                        try {
                            this._dlnaPlayToMgr = Windows.Media.PlayTo.PlayToManager.getForCurrentView();
                            if (this._dlnaPlayToMgr) {
                                this._dlnaPlayToMgr.addEventListener("sourcerequested", this._onSourceRequested.bind(this), false);
                                this._dlnaPlayToMgr.addEventListener("sourceselected", this._onSourceSelected.bind(this), false)
                            }
                        }
                        catch(ex) {
                            this._dlnaPlayToMgr = null
                        }
                    }, _cleanupDlnaPlayToMgr: function _modernPlayer_cleanupDlnaPlayToMgr() {
                        if (this._dlnaPlayToMgr) {
                            this._dlnaPlayToMgr.removeEventListener("sourcerequested", this._onSourceRequested);
                            this._dlnaPlayToMgr.removeEventListener("sourceselected", this._onSourceSelected);
                            this._dlnaPlayToMgr = null
                        }
                    }, _getCurrentMediaDurationMS: function _getCurrentMediaDurationMS() {
                        var duration = null;
                        if (this._currentMedia && this._currentMedia._mediaItem && this._currentMedia._mediaItem.data)
                            duration = this._currentMedia._mediaItem.data.duration;
                        if (duration) {
                            if (duration.getMinutes)
                                duration = ((duration.getHours() * 60 * 60) + (duration.getMinutes() * 60) + duration.getSeconds()) * 1000
                        }
                        else
                            duration = 0;
                        return duration
                    }, _ensurePipeline: function _modernPlayer_ensurePipeline() {
                        if (this._currentPlayer === undefined || this._currentPlayer === null)
                            throw"_modernPlayer_ensurePipeline: error! av pipeline not set yet.";
                    }, _onAppResume: function _onAppResume() {
                        if (this._fastStartTag)
                            try {
                                MS.Entertainment.Platform.Playback.Etw.traceString("XPlayer::_onAppResume: Destroying FastStart tag on resume. Windows invalidates inactive DRM pipelines on suspend");
                                this._fastStartTag.removeAttribute("src");
                                this._fastStartTag.load();
                                this._fastStartTag = null
                            }
                            catch(e) {
                                MS.Entertainment.Platform.Playback.assert(false, "failed to destroy fast start tag on resume. exception:" + e)
                            }
                    }, _onAppSuspending: function _modernPlayer__onAppSuspending() {
                        try {
                            MS.Entertainment.Platform.Playback.Etw.traceString("XPlayer::_onAppSuspending: close out tracking items");
                            for (var trackingId in this._trackingIdUsage) {
                                var media = this._mediaByTrackingId(trackingId);
                                this._closeTrackingTransaction(media);
                                delete this._trackingIdUsage[trackingId];
                                this._globalDeleteTrackingIdState[trackingId]
                            }
                        }
                        catch(e) {
                            MS.Entertainment.Platform.Playback.assert(false, "failed to close out tracking items on suspend. exception:" + e)
                        }
                    }, _onGlobalTrackingIdState: function _modernPlayer__onGlobalTrackingIdState(id, state) {
                        if (id) {
                            var trackingIdState = MS.Entertainment.Platform.SessionManager.trackingIdState;
                            MS.Entertainment.Platform.Playback.Etw.traceString("Was: " + trackingIdState[id] + " tracking id: " + id);
                            trackingIdState[id] = state;
                            MS.Entertainment.Platform.Playback.Etw.traceString("Now:" + state + ": " + id)
                        }
                    }, _globalDeleteTrackingIdState: function _modernPlayer__globalDeleteTrackingIdState(id) {
                        if (id) {
                            var trackingIdState = MS.Entertainment.Platform.SessionManager.trackingIdState;
                            MS.Entertainment.Platform.Playback.Etw.traceString("Deleted " + trackingIdState[id] + " tracking id: " + id);
                            delete trackingIdState[id]
                        }
                    }, _mediaByTrackingId: function _modernPlayer__mediaByTrackingId(trackingId) {
                        if (this._trackingIdUsage[trackingId] & MS.Entertainment.Platform.Playback.XPlayer._mediaBitmask.current)
                            return this._currentMedia;
                        if (this._trackingIdUsage[trackingId] & MS.Entertainment.Platform.Playback.XPlayer._mediaBitmask.next)
                            return this._nextMedia;
                        return null
                    }, _releaseTrackingRef: function _modernPlayer__releaseTrackingRef(media, mediaBitmask)
                    {
                        if (media && media.hasOwnProperty("trackingId") && !!media.trackingId) {
                            if (!this._trackingIdUsage[media.trackingId])
                                this._trackingIdUsage[media.trackingId] = 0;
                            this._trackingIdUsage[media.trackingId] &= ~mediaBitmask
                        }
                    }, _addTrackingRef: function _modernPlayer__addTrackingRef(media, mediaBitmask) {
                        if (media && media.hasOwnProperty("trackingId") && !!media.trackingId) {
                            if (!this._trackingIdUsage[media.trackingId])
                                this._trackingIdUsage[media.trackingId] = 0;
                            this._trackingIdUsage[media.trackingId] |= mediaBitmask
                        }
                    }, _checkTracking: function _modernPlayer__checkTracking(media, mediaBitmask)
                    {
                        if (media && media.hasOwnProperty("trackingId") && !!media.trackingId && this._trackingIdUsage[media.trackingId] === 0) {
                            if (!media._lastStateChangeEvent || media._lastStateChangeEvent.type !== "ended") {
                                if (mediaBitmask === MS.Entertainment.Platform.Playback.XPlayer._mediaBitmask.current)
                                    media.maxPosition = this._currentPlayer.currentTime;
                                this._onTrackedMediaOutOfScope(media)
                            }
                            else
                                this._onGlobalTrackingIdState(media.trackingId, "SkipReported");
                            delete this._trackingIdUsage[media.trackingId];
                            this._globalDeleteTrackingIdState(media.trackingId)
                        }
                    }, _onTrackedMediaOutOfScope: function _modernPlayer__onTrackedMediaOutOfScope(media) {
                        this._closeTrackingTransaction(media)
                    }, _closeTrackingTransaction: function _modernPlayer__closeTrackingTransaction(media) {
                        if (!media)
                            return;
                        Microsoft.Entertainment.Marketplace.Marketplace.sendPlaybackDurationAsync(media.trackingId, media.maxPosition);
                        this._onGlobalTrackingIdState(media.trackingId, "Reported");
                        MSEPlatform.Playback.Etw.traceString("_modernPlayer__closeTrackingTransaction(" + media.trackingId + ", " + media.maxPosition + ")")
                    }, _overwriteMediaRefCount: function _modernPlayer__overwriteMediaRefCount(destinationMedia, sourceMedia, mediaBitmask) {
                        this._releaseTrackingRef(destinationMedia, mediaBitmask);
                        this._addTrackingRef(sourceMedia, mediaBitmask);
                        this._checkTracking(destinationMedia, mediaBitmask)
                    }, _overwriteCurrentMedia: function _modernPlayer__overwriteCurrentMedia(value) {
                        if (value)
                            this._onGlobalTrackingIdState(value.trackingId, "Current");
                        this._overwriteMediaRefCount(this._currentMediaValueHolder, value, MS.Entertainment.Platform.Playback.XPlayer._mediaBitmask.current);
                        this._currentMediaValueHolder = value
                    }, _overwriteNextMedia: function _modernPlayer__overwriteNextMedia(value) {
                        if (value)
                            this._onGlobalTrackingIdState(value.trackingId, "Next");
                        this._overwriteMediaRefCount(this._nextMediaValueHolder, value, MS.Entertainment.Platform.Playback.XPlayer._mediaBitmask.next);
                        this._nextMediaValueHolder = value
                    }, _currentMedia: {
                        get: function _modernPlayer_internal_currentMedia_get() {
                            return this._currentMediaValueHolder
                        }, set: function _modernPlayer_internal_currentMedia_set(value) {
                                this._overwriteCurrentMedia(value)
                            }
                    }, _nextMedia: {
                        get: function _modernPlayer_internal_nextMedia_get() {
                            return this._nextMediaValueHolder
                        }, set: function _modernPlayer_internal_nextMedia_set(value) {
                                this._overwriteNextMedia(value)
                            }
                    }, _watchTimeSeparation: function _watchTimeSeparation(fun, id) {
                        if (id !== this._lastTimeSeparationId) {
                            this._lastTimeSeparationId = id;
                            MSEPlatform.Playback.Etw.traceString("XPlayer::_watchTimeSeparation for " + id);
                            return this._tagLock.enter(tackOnTimeAfterExecution.bind(this, fun, 2500, id))
                        }
                        else {
                            MSEPlatform.Playback.Etw.traceString("XPlayer::_watchTimeSeparation: synchronous " + id);
                            return WinJS.Promise.wrap(fun())
                        }
                    }, _playerContainer: null, _currentPlayer: null, _nextPlayer: null, _autoPlay: false, _currentMediaValueHolder: null, _currentMediaEventsCallback: null, _nextMediaValueHolder: null, _dlnaPlayToMgr: null, _dlnaConnectionState: -1, _trackingIdUsage: {}, _volumeController: null, _volumeControllerBindings: null, _lastTimeSeparationId: null
            }, {}), createInstance: function XPlayer_createInstance(playerMode, playerContainer) {
                    var isWWA = true;
                    var player = null;
                    if (isWWA)
                        if (playerMode === MSEPlatform.Playback.PlayerMode.remote)
                            player = new MSEPlatform.Playback.LRCPlayer;
                        else
                            player = new this._modernPlayer(playerContainer);
                    player._tagLock = new MS.Entertainment.Platform.Playback.Playlist.AccessSerializer;
                    return player
                }, _mediaBitmask: {
                    current: 1, next: 2
                }, audioTagForFileActivation: null
        })})
})()
