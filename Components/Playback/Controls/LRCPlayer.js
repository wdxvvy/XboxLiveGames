/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/utilities.js", "/Components/Playback/PlaybackTrace.js");
(function() {
    var MSEPlatform = WinJS.Namespace.define("MS.Entertainment.Platform", null);
    WinJS.Namespace.defineWithParent(MSEPlatform, "Playback", {LRCPlayerObservables: WinJS.Class.derive(MS.Entertainment.UI.Framework.ObservableBase, function LRCPlayerObservables_constructor(){}, {
            _nextMediaLoaded: MS.Entertainment.UI.Framework.observableProperty("_nextMediaLoaded", false), _nextMediaStarted: MS.Entertainment.UI.Framework.observableProperty("_nextMediaStarted", false)
        })});
    WinJS.Namespace.defineWithParent(MSEPlatform, "Playback", {LRCPlayer: WinJS.Class.derive(MSEPlatform.Playback.LRCPlayerObservables, function LRCPlayer_constructor() {
            MSEPlatform.Playback.LRCPlayerObservables.prototype.constructor.call(this)
        }, {
            autoPlay: {
                get: function LRCPlayer_autoPlay_get() {
                    return true
                }, set: function LRCPlayer_autoPlay_set(value) {
                        this._noop()
                    }
            }, currentMedia: {
                    get: function LRCPlayer_currentMedia_get() {
                        return this._currentMedia
                    }, set: function LRCPlayer_currentMedia_set(value) {
                            this._currentMedia = value
                        }
                }, nextMedia: {
                    get: function LRCPlayer_nextMedia_get() {
                        return null
                    }, set: function LRCPlayer_nextMedia_set(value) {
                            this._noop()
                        }
                }, muted: {
                    get: function LRCPlayer_muted_get() {
                        return false
                    }, set: function LRCPlayer_muted_set(value) {
                            this._noop()
                        }
                }, launchMediaTitle: function LRCPlayer_launchMediaTitle(titleId, media, useDeepLink, startTimeMsec, firstAction) {
                    this._ensurePipeline();
                    if (!media)
                        media = this._currentMedia;
                    MS.Entertainment.UI.Controls.assert(media, "LRCPlayer_launchMediaTitle should always have a valid media instance");
                    if (!media)
                        return;
                    var startTimeHns = 0 | startTimeMsec;
                    startTimeHns = startTimeHns * 10000;
                    titleId = parseInt(titleId);
                    var launchParam = media.source || "";
                    var telemetryTitleId = titleId;
                    var telemetryMediaType = "unknown";
                    if (media.isGame()) {
                        launchParam = useDeepLink ? launchParam : "";
                        telemetryMediaType = "Game"
                    }
                    if (media && media._mediaItem && media._mediaItem.overrideLaunchParam)
                        launchParam = media._mediaItem.overrideLaunchParam;
                    var launchTitleWorker = function lrcSession_launchTitleWorker() {
                            if (this._lrcSessionWinRT)
                                this._lrcSessionWinRT.launchTitleAsync(titleId, launchParam || "").then(function titleLaunched() {
                                    MS.Entertainment.Utilities.Telemetry.logCompanionUsed(telemetryTitleId, telemetryMediaType)
                                }, function sorryNoLaunch(error) {
                                    this._firePlaybackError(error, "LRCPlayer_launchMediaTitle_" + titleId)
                                }.bind(this))
                        }.bind(this);
                    if (media.isGame() && !useDeepLink && media._mediaItem && media._mediaItem.titleType !== Microsoft.Xbox.TitleType.application) {
                        var mediaItem = media._mediaItem;
                        var updateGamesLaunchParam = function lrcSession_updateGamesLaunchParam() {
                                if (!mediaItem.offerGold && !mediaItem.offerGold.price && !mediaItem.offerSilver && mediaItem.offerSilver.price && !MS.Entertainment.Utilities.isEmptyGuid(mediaItem.serviceId)) {
                                    titleId = 0;
                                    launchParam = "gamedetails:" + mediaItem.serviceId
                                }
                            }.bind(this);
                        if (mediaItem.serviceId && ((mediaItem.offerSilver && mediaItem.offerSilver.price === undefined) || (mediaItem.offerGold && mediaItem.offerGold.price === undefined))) {
                            mediaItem = MS.Entertainment.ViewModels.MediaItemModel.augment(mediaItem);
                            mediaItem.hydrate().then(function lrcSession_hydrateSuccess() {
                                updateGamesLaunchParam();
                                launchTitleWorker()
                            }, function lrcSession_hydrateError(e) {
                                updateGamesLaunchParam();
                                launchTitleWorker()
                            })
                        }
                        else {
                            updateGamesLaunchParam();
                            launchTitleWorker()
                        }
                    }
                    else {
                        launchParam = "app:" + parseInt(titleId).toString(16) + ":" + launchParam;
                        titleId = 0;
                        launchTitleWorker()
                    }
                }, play: function LRCPlayer_play() {
                    this._ensurePipeline();
                    this._sendCommandIgnoreErrors(Microsoft.Xbox.LRC.ControlKey.play)
                }, pause: function LRCPlayer_pause() {
                    this._ensurePipeline();
                    this._sendCommandIgnoreErrors(Microsoft.Xbox.LRC.ControlKey.pause)
                }, stop: function LRCPlayer_stop() {
                    this._ensurePipeline();
                    this._sendCommandIgnoreErrors(Microsoft.Xbox.LRC.ControlKey.stop)
                }, _seekToPositionWorker: function LRCPlayer_seekToPositionWorker(positionMsec) {
                    var positionHns = positionMsec * 10000;
                    var that = this;
                    if (this._lrcSessionWinRT) {
                        var sendPromise = new WinJS.Promise(function(c, e, p) {
                                var startTime = new Date;
                                try {
                                    that._lrcSessionWinRT.sendSeekControlCommandAsync(positionHns).then(function seekSucceeded(status) {
                                        var stopTime = new Date;
                                        var durationMsec = stopTime.valueOf() - startTime.valueOf();
                                        if (that._lrcSession)
                                            that._lrcSession._fixStateOnSeek(positionHns);
                                        that._getXboxEventProvider().traceXboxControlSeekCommandSent(positionHns, durationMsec);
                                        c(status.responseCode)
                                    }, function sorryCantSeek(error) {
                                        var stopTime = new Date;
                                        var durationMsec = stopTime.valueOf() - startTime.valueOf();
                                        that._firePlaybackError(error, "LRCPlayer_seekToPosition_" + positionMsec);
                                        var errorNumber = (error.number === undefined ? error : error.number);
                                        that._getXboxEventProvider().traceXboxControlSeekCommandError(positionHns, durationMsec, errorNumber);
                                        e(error)
                                    })
                                }
                                catch(exp) {
                                    that._getXboxEventProvider().traceXboxControlSeekCommandError(positionHns, 0, -1);
                                    e(exp)
                                }
                            });
                        return sendPromise
                    }
                    return WinJS.Promise.as(0)
                }, seekToPosition: function LRCPlayer_seekToPosition(positionMsec) {
                    this._trapErrors(this._seekToPositionWorker(positionMsec))
                }, skipFwd: function LRCPlayer_skipFwd() {
                    this._ensurePipeline();
                    this._sendCommandIgnoreErrors(Microsoft.Xbox.LRC.ControlKey.skip)
                }, skipBack: function LRCPlayer_skipBack() {
                    this._ensurePipeline();
                    this._sendCommandIgnoreErrors(Microsoft.Xbox.LRC.ControlKey.replay)
                }, fastFwd: function LRCPlayer_fastFwd() {
                    this._ensurePipeline();
                    this._sendCommandIgnoreErrors(Microsoft.Xbox.LRC.ControlKey.fastForward)
                }, rewind: function LRCPlayer_rewind() {
                    this._ensurePipeline();
                    this._sendCommandIgnoreErrors(Microsoft.Xbox.LRC.ControlKey.rewind)
                }, slowFwd: function LRCPlayer_slowFwd(){}, slowRewind: function LRCPlayer_slowRewind(){}, isRemoteSession: function LRCPlayer_isRemoteSession() {
                    return true
                }, reset: function LRCPlayer_reset() {
                    this._currentMedia = null
                }, _firePlaybackError: function _firePlaybackError(errorNumber, context) {
                    MSEPlatform.Playback.firePlaybackError(this._currentMediaEventsCallback, errorNumber, context)
                }, _fireTransportStateChanged: (function LRCPlayer_fireTransportStateChanged() {
                    var eventObject = {type: ""};
                    return function _fireTransportStateChanged(controlKey) {
                            var state = null;
                            switch (controlKey) {
                                case Microsoft.Xbox.LRC.ControlKey.play:
                                    state = "playing";
                                    break;
                                case Microsoft.Xbox.LRC.ControlKey.pause:
                                    state = "pause";
                                    break;
                                default:
                                    state = null;
                                    break
                            }
                            {};
                            if (state && this._currentMediaEventsCallback) {
                                eventObject.type = state;
                                this._currentMediaEventsCallback(eventObject)
                            }
                        }
                })(), _sendCommand: function LRCPlayer_sendCommand(controlKey) {
                    var that = this;
                    var sendPromise = new WinJS.Promise(function(c, e, p) {
                            try {
                                var startTime = new Date;
                                that._lrcSessionWinRT.sendControlCommandAsync(controlKey).then(function commandSent(status) {
                                    var stopTime = new Date;
                                    var durationMsec = stopTime.valueOf() - startTime.valueOf();
                                    that._getXboxEventProvider().traceXboxControlCommandSent(controlKey, durationMsec);
                                    that._fireTransportStateChanged(controlKey);
                                    c(status.responseCode)
                                }, function sorryCantSendCommand(error) {
                                    var stopTime = new Date;
                                    var durationMsec = stopTime.valueOf() - startTime.valueOf();
                                    that._firePlaybackError(error.number, "LRCPlayer_sendCommand_" + controlKey);
                                    var errorNumber = (error.number === undefined ? error : error.number);
                                    that._getXboxEventProvider().traceXboxControlCommandError(controlKey, durationMsec, errorNumber);
                                    e(error)
                                })
                            }
                            catch(exp) {
                                that._getXboxEventProvider().traceXboxControlCommandError(controlKey, 0, -1);
                                e(exp)
                            }
                        });
                    return sendPromise
                }, _trapErrors: function LRCPlayer_trapErrors(promise) {
                    promise.then(function onSuccess(){}, function onError(error){})
                }, _sendCommandIgnoreErrors: function LRCPlayer_sendCommandIgnoreErrors(controlKey) {
                    this._trapErrors(this._sendCommand(controlKey))
                }, _setRemoteLRCSession: function LRCPlayer_setRemoteLRCSession(session) {
                    this._lrcSession = session;
                    this._lrcSessionWinRT = (session ? session._remoteLRCSession : null)
                }, _ensurePipeline: function LRCPlayer_ensurePipeline() {
                    if (!this._lrcSessionWinRT)
                        throw"LRCPlayer_ensurePipeline: error! remote session not connected yet.";
                }, _noop: function LRCPlayer_noop(){}, _getXboxEventProvider: (function LRCPlayer_getXboxEventProvider_closure() {
                    var eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Xbox;
                    return function lrcSession_getXboxEventProvider() {
                            return eventProvider
                        }
                })(), _currentMedia: null, _lrcSessionWinRT: null, _lrcSession: null, _currentMediaEventsCallback: null
        }, {})})
})()
