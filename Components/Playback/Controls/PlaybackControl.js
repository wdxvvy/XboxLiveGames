/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Platform.Playback");
(function() {
    var MSEPlatform = WinJS.Namespace.define("MS.Entertainment.Platform", null);
    WinJS.Namespace.defineWithParent(MSEPlatform, "Playback", {MediaInstance: WinJS.Class.define(function MediaInstance_constructor(mediaObject) {
            this._initialize(mediaObject)
        }, {
            source: String.empty, alternateSource: null, mediaType: -1, protectionState: MS.Entertainment.Platform.Playback.ProtectionState.unknown, startPosition: 0, cookie: 1, isLocal: false, playlogEnabled: true, trackingId: String.empty, isAudioAd: false, isPreview: false, inCollection: false, fromCollection: false, serviceId: null, duration: null, _bookmark: 0, _played: false, _playcount: 0, _mediaItem: null, _provider: null, _errorDescriptor: null, _initializedPromise: null, _mediaStore: null, _initialize: function MediaInstance_initialize(mediaObject) {
                    var that = this;
                    var playFromBookmark = true;
                    if (mediaObject) {
                        var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        var isSubscription = configurationManager.service.lastSignedInUserSubscription;
                        if (mediaObject.hasOwnProperty("source")) {
                            var source = mediaObject["source"];
                            var manifestHint = /_51.ism\/manifest/i;
                            if (source && source.toString().match(manifestHint)) {
                                this["alternateSource"] = source;
                                this["source"] = source.toString().replace(manifestHint, "_ST.ism/manifest")
                            }
                            else
                                this["source"] = source
                        }
                        if (mediaObject.hasOwnProperty("mediaType"))
                            this["mediaType"] = mediaObject["mediaType"];
                        if (mediaObject.hasOwnProperty("startPosition") && mediaObject["startPosition"]) {
                            this["startPosition"] = mediaObject["startPosition"];
                            playFromBookmark = false
                        }
                        if (mediaObject.hasOwnProperty("cookie"))
                            this["cookie"] = mediaObject["cookie"];
                        this["isPreview"] = false;
                        if (mediaObject.hasOwnProperty("mediaItem")) {
                            this["_mediaItem"] = mediaObject["mediaItem"];
                            if (this._mediaItem && this._mediaItem.data) {
                                if (this._mediaItem.data.libraryId)
                                    this["libraryId"] = this._mediaItem.data.libraryId;
                                if (this._mediaItem.data.playPreviewOnly) {
                                    this["playlogEnabled"] = false;
                                    this["isPreview"] = true
                                }
                                if (this._mediaItem.data.playlistId && this._mediaItem.data.playlistId >= 0) {
                                    this["containerLibraryId"] = this._mediaItem.data.playlistId;
                                    this["containerMediaType"] = Microsoft.Entertainment.Queries.ObjectType.playlist
                                }
                                else if (this._mediaItem.data.albumId) {
                                    this["containerLibraryId"] = this._mediaItem.data.albumId;
                                    this["containerMediaType"] = Microsoft.Entertainment.Queries.ObjectType.album
                                }
                                if (this._mediaItem.data.inCollection)
                                    this["inCollection"] = this._mediaItem.data.inCollection;
                                if (this._mediaItem.data.duration)
                                    this["duration"] = this._mediaItem.data.duration;
                                if (this._mediaItem.data.serviceId)
                                    this["serviceId"] = this._mediaItem.data.serviceId;
                                if (this._mediaItem.data.fromCollection)
                                    this["fromCollection"] = this._mediaItem.data.fromCollection
                            }
                        }
                        if (mediaObject.hasOwnProperty("mediaInstanceId"))
                            this["mediaInstanceId"] = mediaObject["mediaInstanceId"];
                        if (mediaObject.hasOwnProperty("nativeLicenseRight"))
                            this["nativeLicenseRight"] = mediaObject["nativeLicenseRight"];
                        if (mediaObject.hasOwnProperty("offerId"))
                            this["offerId"] = mediaObject["offerId"];
                        if (mediaObject.hasOwnProperty("libraryId"))
                            this["libraryId"] = mediaObject["libraryId"];
                        if (mediaObject.hasOwnProperty("isLocal"))
                            this["isLocal"] = mediaObject["isLocal"];
                        if (mediaObject.hasOwnProperty("error"))
                            this["_errorDescriptor"] = mediaObject["error"];
                        if (mediaObject.hasOwnProperty("trackingId") && !!mediaObject.trackingId)
                            this["trackingId"] = mediaObject["trackingId"];
                        if (mediaObject.hasOwnProperty("isAudioAd"))
                            this["isAudioAd"] = mediaObject["isAudioAd"];
                        if (mediaObject.hasOwnProperty("protectionState"))
                            this["protectionState"] = mediaObject["protectionState"]
                    }
                    this._initializedPromise = WinJS.Promise.wrap(this);
                    this._maxPositionValueHolder = 0
                }, maxPosition: {
                    get: function MediaInstance__position_get() {
                        return this._maxPositionValueHolder
                    }, set: function MediaInstance__position_set(value) {
                            if (value > this._maxPositionValueHolder)
                                this._maxPositionValueHolder = value
                        }
                }, isEqual: function MediaInstance_isEqual(mediaInstance) {
                    var isSame = false;
                    if (mediaInstance && this.source === mediaInstance.source && this.mediaType === mediaInstance.mediaType && this.protectionState === mediaInstance.protectionState && this.startPosition === mediaInstance.startPosition && this.cookie === mediaInstance.cookie)
                        isSame = true;
                    return isSame
                }, toString: function MediaInstance_toString() {
                    var mediaString = this.source + " : " + this.mediaType + " : " + this.protectionState + " : " + this.startPosition + " : " + this.cookie;
                    return mediaString
                }, _getMediaItemProp: function MediaInstance_getMediaItemProp(name, defaultValue, validityCheckFunction) {
                    if (!name || typeof(name) !== "string" || name === String.empty)
                        throw new Error("Invalid property name.");
                    if (!validityCheckFunction || typeof(validityCheckFunction) !== "function")
                        throw new Error("Invalid validity check function.");
                    var result = this[name];
                    if (validityCheckFunction(result))
                        return result;
                    if (this._mediaItem) {
                        var result = this._mediaItem[name];
                        if (validityCheckFunction(result))
                            return result;
                        if (this._mediaItem.data) {
                            var result = this._mediaItem.data[name];
                            if (validityCheckFunction(result))
                                return result
                        }
                    }
                    return defaultValue
                }, isGame: function MediaInstance_isGame() {
                    return (this.mediaType === Microsoft.Entertainment.Queries.ObjectType.game)
                }, bookmark: {
                    set: function MediaInstance_setBookmark(newValue) {
                        this._bookmark = newValue
                    }, get: function MediaInstance_getBookmark() {
                            return this._bookmark
                        }
                }, played: {
                    set: function MediaInstance_setPlayed(newValue) {
                        this._played = newValue
                    }, get: function MediaInstance_getPlayed() {
                            return this._played
                        }
                }, playcount: {
                    set: function MediaInstance_setPlaycount(newValue) {
                        this._playcount = newValue
                    }, get: function MediaInstance_getPlaycount() {
                            return this._playcount
                        }
                }, serviceIdSafe: {get: function MediaInstance_getServiceId() {
                        return this._getMediaItemProp("serviceId", MS.Entertainment.Utilities.EMPTY_GUID, function(value) {
                                return !MS.Entertainment.Utilities.isEmptyGuid(value)
                            })
                    }}, mediaTypeSafe: {get: function MediaInstance_getMediaTypeSafe() {
                        return this._getMediaItemProp("mediaType", -1, function(value) {
                                return value !== -1
                            })
                    }}, shouldLogToDrmDownloadHistory: {get: function MediaInstance_shouldLogToDownloadHistory() {
                        if (this.nativeLicenseRight !== undefined && this.nativeLicenseRight !== null && this.nativeLicenseRight !== Microsoft.Entertainment.Marketplace.MarketplaceMediaRights.unknownMediaRight)
                            return this.nativeLicenseRight !== Microsoft.Entertainment.Marketplace.MarketplaceMediaRights.subscriptionDownload;
                        return this.mediaTypeSafe !== Microsoft.Entertainment.Queries.ObjectType.track
                    }}, fillDownloadSubscriptionInfoAsync: function fillDownloadSubscriptionInfoAsync() {
                    if ((!this.mediaInstanceId || MS.Entertainment.Utilities.isEmptyGuid(this.mediaInstanceId)) && this._mediaItem && this.mediaTypeSafe === Microsoft.Entertainment.Queries.ObjectType.track)
                        return MS.Entertainment.Platform.PurchaseHelpers.queryMediaDetailForCacheItemAsync(this._mediaItem, this.mediaTypeSafe).then(function queryMediaDetailForCacheItemAsync_complete(detail) {
                                if (detail.result && detail.result.item && detail.result.item.rights) {
                                    var right = MS.Entertainment.Platform.PurchaseHelpers.getPreferredRight(detail.result.item.rights, [Microsoft.Entertainment.Marketplace.MarketplaceMediaRights.subscriptionDownload]);
                                    if (right) {
                                        this.mediaInstanceId = right.mediaInstanceId;
                                        this.offerId = right.offerId;
                                        this.nativeLicenseRight = Microsoft.Entertainment.Marketplace.MarketplaceMediaRights.subscriptionDownload
                                    }
                                }
                            }.bind(this));
                    return WinJS.Promise.wrap()
                }
        }, {createInstanceAsync: function MediaInstance_CreateInstanceAsync(itemData) {
                var mediaInstance = new MSEPlatform.Playback.MediaInstance(itemData);
                return mediaInstance._initializedPromise
            }})});
    WinJS.Namespace.defineWithParent(MSEPlatform, "Playback", {IPlaybackObservables: WinJS.Class.derive(MS.Entertainment.UI.Framework.ObservableBase, function IPlaybackObservables_constructor() {
            var eventHandlers = MS.Entertainment.Utilities.addEvents(this, {
                    currentMediaChanged: function currentMediaChanged(e) {
                        var newMedia = e.detail.newValue;
                        var oldMedia = e.detail.oldValue;
                        MSEPlatform.Playback.Etw.traceString("PlaybackControl::currentMediaChanged: ");
                        this._setMedia(newMedia);
                        if (newMedia)
                            this._isVideo = false
                    }.bind(this), nextMediaChanged: function nextMediaChanged(e) {
                            var newMedia = e.detail.newValue;
                            MSEPlatform.Playback.Etw.traceString("PlaybackControl::nextMediaChanged: " + (newMedia ? newMedia.source : "null"));
                            if (!!newMedia)
                                MS.Entertainment.Platform.Playback.Etw.tracePlaylistSetNextMedia(newMedia);
                            this._setNextMedia(newMedia)
                        }.bind(this), playerStateChanged: function playerStateChanged(e) {
                            var newState = e.detail.newValue;
                            var oldState = e.detail.oldValue;
                            if (!oldState)
                                oldState = "undefined";
                            MSEPlatform.Playback.Etw.tracePlayerStateChanged(newState, oldState)
                        }, currentTransportState: function currentTransportStateChanged(e) {
                            var newState = e.detail.newValue;
                            var oldState = e.detail.oldValue;
                            if (!oldState)
                                oldState = "undefined";
                            switch (newState) {
                                case MS.Entertainment.Platform.Playback.TransportState.unInitialize:
                                case MS.Entertainment.Platform.Playback.TransportState.paused:
                                case MS.Entertainment.Platform.Playback.TransportState.stopped:
                                    MS.Entertainment.Instrumentation.PerfTrack.disableScenarioPlayProtectedInApp();
                                    MS.Entertainment.Instrumentation.PerfTrack.disableScenarioPlayNonProtectedInApp();
                                    break
                            }
                            MSEPlatform.Playback.Etw.traceTransportStateChanged(newState, oldState, this._isVideo)
                        }.bind(this)
                })
        }, {
            currentMedia: MS.Entertainment.UI.Framework.observableProperty("currentMedia", null), currentPosition: MS.Entertainment.UI.Framework.observableProperty("currentPosition", 0), currentTransportState: MS.Entertainment.UI.Framework.observableProperty("currentTransportState", MS.Entertainment.Platform.Playback.TransportState.stopped), isAudioAd: MS.Entertainment.UI.Framework.observableProperty("isAudioAd", false), isPreview: MS.Entertainment.UI.Framework.observableProperty("isPreview", false), duration: MS.Entertainment.UI.Framework.observableProperty("duration", 0), errorDescriptor: MS.Entertainment.UI.Framework.observableProperty("errorDescriptor", null), nextMedia: MS.Entertainment.UI.Framework.observableProperty("nextMedia", null), playerState: MS.Entertainment.UI.Framework.observableProperty("playerState", MS.Entertainment.Platform.Playback.PlayerState.notReady), readyForNextMedia: MS.Entertainment.UI.Framework.observableProperty("readyForNextMedia", false), videoWidth: MS.Entertainment.UI.Framework.observableProperty("videoWidth", 0), videoHeight: MS.Entertainment.UI.Framework.observableProperty("videoHeight", 0), playbackRate: MS.Entertainment.UI.Framework.observableProperty("playbackRate", 1), minPlaybackRate: MS.Entertainment.UI.Framework.observableProperty("minPlaybackRate", 0), maxPlaybackRate: MS.Entertainment.UI.Framework.observableProperty("maxPlaybackRate", 0), _isVideo: MS.Entertainment.UI.Framework.observableProperty("_isVideo", false), seekedPosition: MS.Entertainment.UI.Framework.observableProperty("seekedPosition", 0), isRemoteSessionRunning: MS.Entertainment.UI.Framework.observableProperty("isRemoteSessionRunning", false)
        })});
    WinJS.Namespace.defineWithParent(MSEPlatform, "Playback", {IPlayback: WinJS.Class.derive(MSEPlatform.Playback.IPlaybackObservables, function IPlayback_constructor() {
            MSEPlatform.Playback.IPlaybackObservables.prototype.constructor.call(this);
            this._sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
            this.bind("currentTransportState", function onCurrentTransportStateChanged() {
                this._reschedulePrerollCallback()
            }.bind(this))
        }, {
            dispose: function IPlayback_dispose() {
                this.reset();
                this.unbind("currentTransportState");
                if (this._playerEventHandlers) {
                    this._playerEventHandlers.cancel();
                    this._playerEventHandlers = null
                }
                this._player._currentMediaEventsCallback = null
            }, targetTransportState: {
                    get: function IPlayback_targetTransportState_get() {
                        return this._targetTransportState
                    }, set: function IPlayback_targetTransportState_set(value) {
                            if (!this._isPlayerSet())
                                return;
                            MSEPlatform.Playback.Etw.traceTargetTransportStateSet(value, this.currentTransportState);
                            if (this._isPlayerState(MSEPlatform.Playback.PlayerState.ready)) {
                                if ((this._targetTransportState !== value) || (MS.Entertainment.Platform.Playback.TransportState.playing === value && (this.playbackRate > 1 || this.playbackRate < -1)))
                                    this._applyTargetTransportState(value)
                            }
                            else if (this._isPlayerState(MSEPlatform.Playback.PlayerState.error))
                                try {
                                    this._applyTargetTransportState(value)
                                }
                                catch(e) {}
                            else
                                this._targetTransportState = value
                        }
                }, autoPlay: {
                    get: function IPlayback_autoPlay_get() {
                        if (!this._isPlayerSet())
                            return false;
                        return this._player.autoPlay
                    }, set: function IPlayback_autoPlay_set(value) {
                            if (!this._isPlayerSet())
                                return;
                            this._player.autoPlay = value
                        }
                }, muted: {
                    get: function IPlayback_muted_get() {
                        if (!this._isPlayerSet())
                            return false;
                        return this._player.muted
                    }, set: function IPlayback_muted_set(value) {
                            if (!this._isPlayerSet())
                                return;
                            this._player.muted = value
                        }
                }, seekToPosition: function IPlayback_seekToPosition(positionMsec) {
                    if (!this._isPlayerSet())
                        return;
                    if (positionMsec < 0)
                        positionMsec = 0;
                    if (positionMsec > this.duration)
                        positionMsec = this.duration;
                    if (!this._isPlayerState(MSEPlatform.Playback.PlayerState.ready))
                        this._targetPosition = positionMsec;
                    else {
                        if (this.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.playing) {
                            MS.Entertainment.Utilities.Telemetry.logPauseHappened(this, this.forceTimeUpdate());
                            MS.Entertainment.Utilities.Telemetry.logPlayHappened(this, positionMsec)
                        }
                        if (this.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.stopped)
                            this._applyTargetTransportState(MS.Entertainment.Platform.Playback.TransportState.playing);
                        this._player.seekToPosition(positionMsec)
                    }
                }, fastFwd: function IPlayback_fastFwd() {
                    if (!this._isPlayerSet())
                        return;
                    this._player.fastFwd()
                }, fastReverse: function IPlayback_fastReverse() {
                    if (!this._isPlayerSet())
                        return;
                    this._player.rewind()
                }, slowFwd: function IPlayback_slowFwd() {
                    if (!this._isPlayerSet())
                        return;
                    this._player.slowFwd()
                }, slowReverse: function IPlayback_slowReverse() {
                    if (!this._isPlayerSet())
                        return;
                    this._player.slowRewind()
                }, reset: function IPlayback_reset(sendStop) {
                    if (!this._isPlayerSet())
                        return;
                    if (sendStop && this._player && this.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.playing)
                        MS.Entertainment.Utilities.Telemetry.logSkipHappened(this, this.forceTimeUpdate());
                    this._player.reset(false);
                    this._player.reset(true);
                    if (this._prerollMediaItem) {
                        this._prerollMediaItem = null;
                        this._cancelPrerollCallback()
                    }
                    this.currentPosition = 0;
                    this._targetPosition = 0;
                    if (sendStop)
                        this.currentTransportState = MS.Entertainment.Platform.Playback.TransportState.stopped;
                    this._targetTransportState = MS.Entertainment.Platform.Playback.TransportState.unInitialize;
                    this.duration = 0;
                    this.errorDescriptor = null;
                    this.playerState = MS.Entertainment.Platform.Playback.PlayerState.notReady;
                    this.readyForNextMedia = false;
                    this.videoWidth = 0;
                    this.videoHeight = 0;
                    this.playbackRate = 1;
                    this.minPlaybackRate = 0;
                    this.maxPlaybackRate = 0
                }, forceError: function IPlayback_forceError(errorCode) {
                    if (!this._isPlayerSet())
                        return;
                    this.reset(true);
                    MSEPlatform.Playback.firePlaybackError(this._onPlayerEvent.bind(this), errorCode, "forceError")
                }, setPlayer: function IPlayback_setPlayer(player) {
                    if (player) {
                        this._player = player;
                        if (this._playerEventHandlers) {
                            this._playerEventHandlers.cancel();
                            this._playerEventHandlers = null
                        }
                        this._playerEventHandlers = MS.Entertainment.Utilities.addEvents(this._player, {
                            _nextMediaLoadedChanged: function _onNextMediaLoaded(e) {
                                var isLoaded = e.detail.newValue;
                                this._handleNextMediaLoaded(isLoaded, this)
                            }.bind(this), _nextMediaStartedChanged: function _onNextMediaStarted(e) {
                                    var isStarted = e.detail.newValue;
                                    this._handleNextMediaStarted(isStarted, this)
                                }.bind(this), _nextMediaErrorChanged: function _onNextMediaError(e) {
                                    var isError = e.detail.newValue;
                                    this._handleNextMediaError(isError)
                                }.bind(this), isRemoteSessionRunningChanged: function _onRemoteSessionChanged(e) {
                                    var isRemoteSessionRunningValue = e.detail.newValue;
                                    this.isRemoteSessionRunning = isRemoteSessionRunningValue
                                }.bind(this)
                        });
                        this._player._currentMediaEventsCallback = this._onPlayerEvent.bind(this)
                    }
                }, enableTimeUpdate: function IPlayback_enableTimeUpdate() {
                    if (!this._isPlayerSet())
                        return;
                    this._player.enableTimeUpdate();
                    MSEPlatform.Playback.Etw.tracePlaybackEnableTimeUpdate(this.currentPosition)
                }, disableTimeUpdate: function IPlayback_disableTimeUpdate() {
                    if (!this._isPlayerSet())
                        return;
                    this._player.disableTimeUpdate();
                    MSEPlatform.Playback.Etw.tracePlaybackDisableTimeUpdate(this.currentPosition)
                }, forceTimeUpdate: function IPlayback_forceTimeUpdate() {
                    if (this._isPlayerSet() && this._player._currentPlayer) {
                        this.currentPosition = this._player.forceTimeUpdate();
                        MSEPlatform.Playback.Etw.tracePlaybackForceTimeUpdate(this.currentPosition)
                    }
                    return this.currentPosition
                }, isRemoteSession: function IPlayback_isRemoteSession() {
                    if (this._isPlayerSet())
                        return this._player.isRemoteSession();
                    return false
                }, notifyNetworkConnectionChanged: function IPlayback_notifyNetworkConnectionChanged(networkConnection) {
                    WinJS.Promise.timeout().then(this._handleNetworkConnectionChanged(networkConnection))
                }, skipToNextPrerolled: function IPlayback_skipToNextPrerolled(fromSkipButton) {
                    this._reportPrerollErrors();
                    MS.Entertainment.Utilities.Telemetry.logSkipHappened(this, this.forceTimeUpdate());
                    if (this._player._switchPlayer()) {
                        if (this.targetTransportState === MSEPlatform.Playback.TransportState.playing || this.currentTransportState === MSEPlatform.Playback.TransportState.playing || (this.autoPlay && !fromSkipButton))
                            this._applyTargetTransportState(MSEPlatform.Playback.TransportState.playing)
                    }
                    else
                        this._skipButtonPressed = fromSkipButton
                }, hasPrerolledMedia: function IPlayback_hasPrerolledMedia() {
                    return (this._player && this._player._nextPlayer)
                }, prerollMediaItem: function IPlayback_PrerollMediaItem(mediaItem) {
                    var name = (mediaItem && mediaItem.data) ? mediaItem.data.name : String.empty;
                    MSEPlatform.Playback.Etw.traceString("PlaybackControl::prerollMediaItem: Control has been asked to preroll \"" + name + "\"");
                    this._cancelPrerollCallback();
                    this._prerollMediaItem = mediaItem;
                    if (this._prerollMediaItem)
                        this._reschedulePrerollCallback();
                    else
                        this.nextMedia = this._prerollMediaItem
                }, _reschedulePrerollCallback: function _reschedulePrerollCallback() {
                    MSEPlatform.Playback.Etw.traceString("PlaybackControl::reschedulePrerollCallback");
                    this._cancelPrerollCallback();
                    if (!this._prerollMediaItem) {
                        MSEPlatform.Playback.Etw.traceString("PlaybackControl::reschedulePrerollCallback: Control has nothing to preroll. Dropping reschedule request.");
                        return
                    }
                    MSEPlatform.Playback.Etw.traceString("PlaybackControl::reschedulePrerollCallback: Control is scheduling next media.");
                    var myPrerollPromiseOrdinal = this._prerollPromiseOrdinal;
                    this._prerollPromise = this._collectPrerollInformation().then(function onCollectPrerollInformation(prerollInformation) {
                        if (myPrerollPromiseOrdinal !== this._prerollPromiseOrdinal) {
                            MSEPlatform.Playback.Etw.traceString("PlaybackControl::reschedulePrerollCallback: Promise was canceled but completed anyway. Dropping.");
                            return
                        }
                        if (this.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.stopped) {
                            MSEPlatform.Playback.Etw.traceString("PlaybackControl::reschedulePrerollCallback: Control was stopped, prerolling immediately.");
                            prerollInformation.delayTime = 0
                        }
                        if (prerollInformation.delayTime > 0 && this.currentTransportState !== MS.Entertainment.Platform.Playback.TransportState.playing) {
                            MSEPlatform.Playback.Etw.traceString("PlaybackControl::reschedulePrerollCallback: Not scheduling preroll. Determined we should delay but pipeline is not playing");
                            return
                        }
                        MSEPlatform.Playback.Etw.traceString("PlaybackControl::reschedulePrerollCallback: Scheduling preroll for " + (prerollInformation.delayTime / 1000) + " seconds from now");
                        return WinJS.Promise.timeout(prerollInformation.delayTime).then(function onPrerollTimeout() {
                                MSEPlatform.Playback.Etw.traceString("PlaybackControl::reschedulePrerollCallback: Preroll timeout fired at " + (this.currentPosition / 1000) + " seconds into the file. ");
                                return this._requestNetwork().then(function() {
                                        return this._setPrerollItemAsNextInstance()
                                    }.bind(this))
                            }.bind(this), function onPrerollTimeoutError(error) {
                                if (MS.Entertainment.isCanceled(error))
                                    MSEPlatform.Playback.Etw.traceString("PlaybackControl::reschedulePrerollCallback: _prerollPromise canceled.")
                            }.bind(this))
                    }.bind(this), function onCollectPrerollInformationError(error) {
                        if (MS.Entertainment.isCanceled(error))
                            MSEPlatform.Playback.Etw.traceString("PlaybackControl::reschedulePrerollCallback::onCollectPrerollInformationError: _prerollPromise canceled.")
                    })
                }, _cancelPrerollCallback: function PlaylistCore_cancelPrerollCallback() {
                    if (this._prerollPromise) {
                        MSEPlatform.Playback.Etw.traceString("PlaybackControl::cancelPrerollCallback: Canceling scheduled preroll.");
                        this._prerollPromise.cancel();
                        this._prerollPromise = null;
                        this._prerollPromiseOrdinal++
                    }
                }, _collectPrerollInformation: function PlaylistCore_collectPrerollInformation() {
                    return this._hydrateItemForPreroll(this._prerollMediaItem).then(function onHydrateItemForPreroll(result) {
                            var prerollInformation = {
                                    isLocal: null, delayTime: 0
                                };
                            if (result) {
                                prerollInformation.isLocal = result.data.canPlayLocally;
                                MSEPlatform.Playback.Etw.traceString("PlaybackControl::collectPrerollInformation: Preroll item can play locally: " + result.data.canPlayLocally + ".");
                                if (prerollInformation.isLocal === false)
                                    prerollInformation.delayTime = this._calculatePrerollTimeout()
                            }
                            return prerollInformation
                        }.bind(this))
                }, _hydrateItemForPreroll: function _hydrateItemForPreroll(mediaItem) {
                    if (mediaItem && !mediaItem.hydratedForPreroll && mediaItem.data && mediaItem.data.mediaType)
                        return MS.Entertainment.ViewModels.MediaItemModel.hydrateLibraryInfoAsync(mediaItem.data).then(function onHydrateLibraryInfoAsync() {
                                mediaItem.hydratedForPreroll = true;
                                return WinJS.Promise.wrap(mediaItem)
                            });
                    else {
                        if (mediaItem)
                            mediaItem.hydratedForPreroll = true;
                        return WinJS.Promise.wrap(mediaItem)
                    }
                }, _calculatePrerollTimeout: function PlaylistCore_calculatePrerollTimeout() {
                    var currentPosition = this.forceTimeUpdate();
                    var currentDuration = this.duration ? this.duration : 0;
                    var timeout = currentDuration - currentPosition;
                    if (!this._config)
                        this._config = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    timeout = timeout - this._config.playback.streamingPrerollMS;
                    if (timeout < 0)
                        timeout = 0;
                    MSEPlatform.Playback.Etw.traceString("calculatePrerollTimeout: Determining a preroll timeout position: " + currentPosition + " duration: " + currentDuration + " timeout: " + timeout);
                    return timeout
                }, _setPrerollItemAsNextInstance: function _setPrerollItemAsNextInstance() {
                    MSEPlatform.Playback.Etw.traceString("PlaybackControl::_setPrerollItemAsNextInstance: Prerolling at " + (this.currentPosition / 1000) + " seconds into the file.");
                    var onSetComplete = function onSetComplete() {
                            this._prerollMediaItem = null
                        }.bind(this);
                    MS.Entertainment.Platform.Playback.assert(this._prerollMediaItem, "Tried to convert a null preroll item. Dropping.");
                    if (!this._prerollMediaItem) {
                        MSEPlatform.Playback.Etw.traceString("Tried to convert a null preroll item. Dropping.");
                        return
                    }
                    return MS.Entertainment.Platform.Playback.Playlist.PlaylistCore.convertMediaItemToMediaInstance(this._prerollMediaItem, null, MS.Entertainment.Platform.Playback.UsageContext.automatic).then(function onConvertMediaItemToMediaInstance(mediaInstance) {
                            this.nextMedia = mediaInstance;
                            onSetComplete()
                        }.bind(this), function onConvertMediaItemToMediaInstanceError(error) {
                            if (!MS.Entertainment.isCanceled(error))
                                return MSEPlatform.Playback.MediaInstance.createInstanceAsync({
                                        cookie: this._prerollMediaItem.index, error: MSEPlatform.Playback.makePlaybackError(error, "prerollMediaItem error"), mediaItem: this._prerollMediaItem
                                    }).then(function(errorMediaInstance) {
                                        this.nextMedia = errorMediaInstance;
                                        onSetComplete()
                                    }.bind(this));
                            else
                                MSEPlatform.Playback.Etw.traceString("onConvertMediaItemToMediaInstanceError: prerollMediaItem canceled")
                        }.bind(this))
                }, _isPlayerSet: function IPlayback_isPlayerSet() {
                    if (!this._player)
                        MSEPlatform.Playback.Etw.traceString("PlaybackControl::isPlayerSet: No, player is not set yet!");
                    return (this._player ? true : false)
                }, _isPlayerState: function IPlayback_isPlayerState(state) {
                    return (this.playerState === state)
                }, _requestNetwork: function IPlayback_requestNetwork() {
                    var wakeTimeoutMs = 0;
                    return WinJS.Promise.timeout(wakeTimeoutMs)
                }, _releaseNetwork: function IPlayback_releaseNetwork() {
                    MSEPlatform.Playback.Etw.traceString("PlaybackControl::releaseNetwork");
                    if (this._networkUpRequest) {
                        var releaseMeLater = this._networkUpRequest;
                        this._networkUpRequest = null;
                        WinJS.Promise.timeout(5000).then(function() {
                            releaseMeLater.release()
                        })
                    }
                }, _setMedia: function IPlayback_setMedia(mediaInstance) {
                    var name = (mediaInstance && mediaInstance._mediaItem && mediaInstance._mediaItem.data) ? mediaInstance._mediaItem.data.name : String.empty;
                    MSEPlatform.Playback.Etw.traceString("PlaybackControl::_setMedia: name= " + name);
                    if (!mediaInstance) {
                        MS.Entertainment.Utilities.Telemetry.logSkipHappened(this, this.forceTimeUpdate());
                        if (this._canResetOnNullMediaInstance)
                            this.reset(true);
                        else
                            this._canResetOnNullMediaInstance = true;
                        return
                    }
                    if (!this._isPlayerSet())
                        return;
                    if (mediaInstance.isEqual(this._internalCurrentMedia))
                        return;
                    MS.Entertainment.Utilities.Telemetry.logPlaybackAttempted(mediaInstance);
                    if (this._player && ((this.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.playing) || (this.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.paused)))
                        MS.Entertainment.Utilities.Telemetry.logSkipHappened(this, this.forceTimeUpdate());
                    this.isPreview = mediaInstance.isPreview;
                    this._getAudioAd(mediaInstance, false).then(function onGotAd(mediaInstanceAd) {
                        if (mediaInstanceAd) {
                            MSEPlatform.Playback.Etw.traceString("PlaybackControl::_setMedia - play audio ad");
                            this._nextMediaInstanceAfterAd = mediaInstance;
                            mediaInstance = mediaInstanceAd;
                            this.isAudioAd = true
                        }
                        else {
                            this._nextMediaInstanceAfterAd = null;
                            this.isAudioAd = false
                        }
                        MSEPlatform.Playback.Etw.traceSetMedia(mediaInstance);
                        var playbackEventNotifications = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.playbackEventNotifications);
                        playbackEventNotifications.clearErrors();
                        this._erroredMediaInstances = [];
                        this._lastErrorEncountered = null;
                        this._hasSameErrors = true;
                        this._hasPlayedSong = false;
                        this._errorCount = 0;
                        this.reset();
                        var errorCode = this._isParentallyBlocked(mediaInstance);
                        if (errorCode) {
                            var mediaItem = (mediaInstance._mediaItem ? mediaInstance._mediaItem.data : null);
                            MSEPlatform.Playback.firePlaybackError(this._onPlayerEvent.bind(this), errorCode, "_setMedia_isParentallyBlocked", mediaItem);
                            return
                        }
                        if (mediaInstance && mediaInstance._errorDescriptor) {
                            var mediaItem = (mediaInstance._mediaItem ? mediaInstance._mediaItem.data : null);
                            MSEPlatform.Playback.firePlaybackError(this._onPlayerEvent.bind(this), mediaInstance._errorDescriptor, "_setMedia_preexistingCondition", mediaItem);
                            return
                        }
                        if (this.autoPlay)
                            this.currentTransportState = MSEPlatform.Playback.TransportState.starting;
                        this._canResetOnNullMediaInstance = !MS.Entertainment.Platform.Playback.XPlayer.audioTagForFileActivation;
                        this._player.currentMedia = mediaInstance
                    }.bind(this))
                }, _setNextMedia: function IPlayback_setNextMedia(mediaInstance) {
                    if (!this._isPlayerSet())
                        return;
                    var name = (mediaInstance && mediaInstance._mediaItem && mediaInstance._mediaItem.data) ? mediaInstance._mediaItem.data.name : String.empty;
                    MSEPlatform.Playback.Etw.traceString("PlaybackControl::_setNextMedia: name= " + name);
                    if (!mediaInstance) {
                        this._reportPrerollErrors();
                        if (!this._hasPlayedSong && this._lastErrorEncountered) {
                            var displayError = MS.Entertainment.Platform.Playback.Error.NS_E_WMP_MULTIPLE_ERROR_IN_PLAYLIST;
                            if (this._hasSameErrors)
                                displayError = this._lastErrorEncountered;
                            this._fireCriticalPlaybackError(displayError);
                            this._lastErrorEncountered = null
                        }
                        else
                            this._player.reset(true);
                        return
                    }
                    MS.Entertainment.Utilities.Telemetry.logPlaybackAttempted(mediaInstance);
                    MSEPlatform.Playback.Etw.traceSetNextMedia(this.readyForNextMedia, mediaInstance);
                    var errorCode = this._isParentallyBlocked(mediaInstance);
                    if (errorCode) {
                        mediaInstance._errorDescriptor = {msExtendedCode: errorCode.code};
                        this._handleNextMediaError(true, null, mediaInstance);
                        return
                    }
                    if (mediaInstance && mediaInstance._errorDescriptor) {
                        this._handleNextMediaError(true, null, mediaInstance);
                        return
                    }
                    this._player.nextMedia = mediaInstance
                }, _isParentallyBlocked: function _isParentallyBlocked(mediaInstance) {
                    var errorCode = null;
                    if (mediaInstance._mediaItem) {
                        var mediaItem = mediaInstance._mediaItem.data;
                        if (mediaItem)
                            if (mediaItem.isExplicit && !mediaItem.inCollection) {
                                var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                                if (!signedInUser.xuid)
                                    errorCode = MS.Entertainment.Platform.Playback.Error.NS_E_EXPLICIT_CONTENT_SIGNIN_REQUIRED;
                                else if (!signedInUser.hasExplicitPrivilege)
                                    errorCode = MS.Entertainment.Platform.Playback.Error.NS_E_EXPLICIT_CONTENT_BLOCKED
                            }
                    }
                    return errorCode
                }, _onPlayerEvent: function IPlayback_onPlayerEvent(event) {
                    switch (event.type)
                    {
                        case"loadedmetadata":
                            if (event.srcElement.durationOverrideMS)
                                this.duration = event.srcElement.durationOverrideMS;
                            else
                                this.duration = Math.round(event.srcElement.duration * 1000);
                            MSEPlatform.Playback.Etw.traceMediaLoaded(false, this._player._currentMedia, this.duration);
                            this._player._currentMedia.alternateSource = null;
                            this.playerState = MSEPlatform.Playback.PlayerState.ready;
                            if (this._player._currentMedia && !this._player._currentMedia.isAudioAd) {
                                if (!this.hasPrerolledMedia()) {
                                    MSEPlatform.Playback.Etw.traceString("PlaybackControl::onPlayerEvent, loadedmetadata - raising readyForNextMedia");
                                    this.readyForNextMedia = true
                                }
                            }
                            else if (this._nextMediaInstanceAfterAd)
                                this._setNextMedia(this._nextMediaInstanceAfterAd);
                            this.videoWidth = event.srcElement.videoWidth;
                            this.videoHeight = event.srcElement.videoHeight;
                            if (this._targetPosition > 0) {
                                this.seekToPosition(this._targetPosition);
                                this._targetPosition = 0
                            }
                            else if (this._player._currentMedia.startPosition > 0)
                                this.seekToPosition(this._player._currentMedia.startPosition);
                            if (this._targetTransportState !== MSEPlatform.Playback.TransportState.unInitialize && this._targetTransportState !== this.currentTransportState)
                                this._applyTargetTransportState(this._targetTransportState);
                            if (this.autoPlay && this._player)
                                this._player.play();
                            break;
                        case"timeupdate":
                            if (event.srcElement && event.srcElement.currentTime)
                                this.currentPosition = Math.round(event.srcElement.currentTime * 1000);
                            break;
                        case"playing":
                            MSEPlatform.Playback.Etw.traceString("PlaybackControl::onPlayerEvent: Playing");
                            this._targetTransportState = MSEPlatform.Playback.TransportState.playing;
                            this.currentTransportState = MSEPlatform.Playback.TransportState.playing;
                            this._sessionMgr.displayRequestActive();
                            if (this._player && this._player.currentMedia && this._player.currentMedia.protectionState && (this._player.currentMedia.protectionState === MS.Entertainment.Platform.Playback.ProtectionState.drmProtected)) {
                                MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioAppLaunchPlayProtectedContent();
                                MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioPlayProtectedInApp()
                            }
                            else {
                                MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioAppLaunchPlayNonProtectedContent();
                                MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioPlayNonProtectedInApp()
                            }
                            MS.Entertainment.Instrumentation.PerfTrack.disableScenarioPlayProtectedInApp();
                            MS.Entertainment.Instrumentation.PerfTrack.disableScenarioPlayNonProtectedInApp();
                            this._hasPlayedSong = true;
                            MS.Entertainment.Utilities.Telemetry.logPlayHappened(this, this.forceTimeUpdate());
                            break;
                        case"pause":
                            if (this._targetTransportState === MSEPlatform.Playback.TransportState.stopped)
                                this.currentTransportState = MSEPlatform.Playback.TransportState.stopped;
                            else {
                                this._targetTransportState = MSEPlatform.Playback.TransportState.paused;
                                this.currentTransportState = MSEPlatform.Playback.TransportState.paused;
                                MS.Entertainment.Utilities.Telemetry.logPauseHappened(this, this.forceTimeUpdate())
                            }
                            this._sessionMgr.displayRequestRelease();
                            break;
                        case"ended":
                            if (!this.hasPrerolledMedia()) {
                                this.currentTransportState = MSEPlatform.Playback.TransportState.stopped;
                                this._targetTransportState = MSEPlatform.Playback.TransportState.stopped;
                                if (!this.isRemoteSession())
                                    if (this.nextMedia && this.nextMedia._errorDescriptor) {
                                        var nextMediaItem = (this.nextMedia._mediaItem ? this.nextMedia._mediaItem.data : null);
                                        MSEPlatform.Playback.firePlaybackError(this._onPlayerEvent.bind(this), this.nextMedia._errorDescriptor, "PlaybackControl::onPlayerEvent: ended", nextMediaItem)
                                    }
                            }
                            MS.Entertainment.Utilities.Telemetry.logEndHappened(this, this.duration);
                            this.currentPosition = 0;
                            this._sessionMgr.displayRequestRelease();
                            this._reportPrerollErrors();
                            break;
                        case"seeked":
                            this._fireSeekedPositionChanged(this.currentPosition);
                            break;
                        case"error":
                            MS.Entertainment.Instrumentation.PerfTrack.disableAllStartupScenarios();
                            MS.Entertainment.Instrumentation.PerfTrack.disableScenarioPlayProtectedInApp();
                            MS.Entertainment.Instrumentation.PerfTrack.disableScenarioPlayNonProtectedInApp();
                            this._sessionMgr.displayRequestRelease();
                            var currentMediaInstance = this._player ? this._player.currentMedia : null;
                            var name = (currentMediaInstance && currentMediaInstance._mediaItem && currentMediaInstance._mediaItem.data) ? currentMediaInstance._mediaItem.data.name : String.empty;
                            MSEPlatform.Playback.Etw.traceString("PlaybackControl::onPlayerEvent: error: code=" + event.target.error.code + ", msExtendedCode=" + event.target.error.msExtendedCode + ", itemName=" + name);
                            if (currentMediaInstance && currentMediaInstance.alternateSource) {
                                currentMediaInstance.source = currentMediaInstance.alternateSource;
                                currentMediaInstance.alternateSource = null;
                                this._setMedia(currentMediaInstance)
                            }
                            else if (event.srcElement && event.srcElement.fastStartProperties && event.srcElement.error && event.srcElement.error.msExtendedCode === MS.Entertainment.Platform.Playback.Error.MF_E_DRM_UNSUPPORTED.code) {
                                currentMediaInstance.disableFastStart = true;
                                this._setMedia(currentMediaInstance)
                            }
                            else
                                this._handleCurrentMediaError(event.target.error);
                            break
                    }
                }, _fireSeekedPositionChanged: function IPlayback_fireSeekedPositionChanged(currentPosition) {
                    this.seekedPosition = currentPosition;
                    this._reschedulePrerollCallback()
                }, _handleNextMediaLoaded: function IPlayback_handleNextMediaLoaded(isLoaded, iPlayback) {
                    if (isLoaded) {
                        iPlayback.readyForNextMedia = false;
                        MSEPlatform.Playback.Etw.traceMediaLoaded(true, iPlayback._player._nextMedia, iPlayback._player._nextPlayer ? iPlayback._player._nextPlayer.duration * 1000 : 0);
                        if (this._skipButtonPressed || (iPlayback.currentMedia && iPlayback.currentMedia._errorDescriptor)) {
                            this._skipButtonPressed = false;
                            iPlayback.skipToNextPrerolled()
                        }
                    }
                }, _handleNextMediaStarted: function IPlayback_handleNextMediaStarted(isStarted, iPlayback) {
                    if (isStarted) {
                        iPlayback._internalCurrentMedia = iPlayback._player._currentMedia;
                        if (!iPlayback._player._currentMedia.isAudioAd)
                            iPlayback.currentMedia = iPlayback._player._currentMedia;
                        iPlayback.isAudioAd = iPlayback._player._currentMedia.isAudioAd;
                        iPlayback.playerState = MSEPlatform.Playback.PlayerState.ready;
                        iPlayback.duration = Math.round(iPlayback._player._currentPlayer.duration * 1000);
                        if (iPlayback.currentTransportState !== MSEPlatform.Playback.TransportState.playing)
                            iPlayback.currentPosition = 0;
                        if (iPlayback.currentMedia) {
                            MSEPlatform.Playback.Etw.traceNextMediaStarted(iPlayback.currentMedia.source);
                            MS.Entertainment.Utilities.Telemetry.logPlaybackHappened(iPlayback.currentMedia)
                        }
                        this._getAudioAd(iPlayback._player._currentMedia, true).then(function onGotAd(mediaInstanceAd) {
                            if (!mediaInstanceAd) {
                                MSEPlatform.Playback.Etw.traceString("PlaybackControl::_handleNextMediaStarted - raising readyForNextMedia");
                                this._signalForNextMedia()
                            }
                            else {
                                MSEPlatform.Playback.Etw.traceString("PlaybackControl::_handleNextMediaStarted - play audio ad as a next media");
                                this._setNextMedia(mediaInstanceAd)
                            }
                        }.bind(this))
                    }
                }, _handleNextMediaError: function IPlayback_handleNextMediaError(isError, unReferrencedParam, mediaInstance) {
                    if (isError) {
                        var error;
                        if (!mediaInstance)
                            mediaInstance = this._player._nextMedia;
                        if (mediaInstance) {
                            if (!this._shouldIgnoreThisErrorForBlocking(mediaInstance._errorDescriptor.code))
                                this._addErroredMediaInstance(mediaInstance);
                            error = mediaInstance._errorDescriptor;
                            MS.Entertainment.Utilities.Telemetry.logPlaybackError(mediaInstance, error)
                        }
                        this._player.reset(true);
                        this._reportPrerollErrors();
                        if (!this._isCriticalError(error))
                            this._signalForNextMedia()
                    }
                }, _handleCurrentMediaError: function IPlayback_handleCurrentMediaError(error) {
                    if (this.isRemoteSession() && error && error.code === 3)
                        this.errorDescriptor = {msExtendedCode: MS.Entertainment.Platform.Playback.Error.X8_E_PLAYBACK_PLAYTO_ERR_DECODE.code};
                    else {
                        this.errorDescriptor = error;
                        this.errorDescriptor.mediaItem = (this.currentMedia && this.currentMedia._mediaItem) ? this.currentMedia._mediaItem.data : null
                    }
                    this.playerState = MSEPlatform.Playback.PlayerState.error;
                    MSEPlatform.Playback.Etw.tracePlaybackError(error.code, error.msExtendedCode, error.context ? error.context : "IPlayback_handleCurrentMediaError");
                    MS.Entertainment.Utilities.Telemetry.logPlaybackError(this.currentMedia, error);
                    this.currentTransportState = MSEPlatform.Playback.TransportState.stopped
                }, _signalForNextMedia: function IPlayback_signalForNextMedia() {
                    this.readyForNextMedia = false;
                    MSEPlatform.Playback.Etw.traceString("PlaybackControl::signalForNextMedia requested");
                    if (this._signalForNextMediaPromise) {
                        MSEPlatform.Playback.Etw.traceString("PlaybackControl::signalForNextMedia: cancel previous");
                        this._signalForNextMediaPromise.cancel()
                    }
                    this._signalForNextMediaPromise = WinJS.Promise.timeout(10);
                    this._signalForNextMediaPromise.then(function() {
                        MSEPlatform.Playback.Etw.traceString("PlaybackControl::signalForNextMedia: raising readyForNextMedia");
                        this.readyForNextMedia = true;
                        this._signalForNextMediaPromise = null;
                        this._releaseNetwork()
                    }.bind(this))
                }, _isCriticalError: function IPlayback_isCriticalError(error) {
                    if (!error)
                        return false;
                    else if (this._errorCount >= this._maxSequentialErrors)
                        return true;
                    switch (error.msExtendedCode) {
                        case MSEPlatform.Playback.Error.X8_E_PLAYBACK_STOPPED_DATA_LIMIT_APPROACHING.code:
                        case MSEPlatform.Playback.Error.E_MDS_ROAMING_LIMIT.code:
                        case MSEPlatform.Playback.Error.ERROR_GRAPHICS_ONLY_CONSOLE_SESSION_SUPPORTED.code:
                        case MSEPlatform.Playback.Error.MF_E_AUDIO_PLAYBACK_DEVICE_INVALIDATED.code:
                        case MSEPlatform.Playback.Error.MF_E_CANNOT_CREATE_SINK.code:
                        case MSEPlatform.Playback.Error.MF_E_DEBUGGING_NOT_ALLOWED.code:
                        case MSEPlatform.Playback.Error.MF_E_HIGH_SECURITY_LEVEL_CONTENT_NOT_ALLOWED.code:
                        case MSEPlatform.Playback.Error.ZEST_E_MW_CONCURRENT_STREAM.code:
                        case MSEPlatform.Playback.Error.ZEST_E_MEDIAINSTANCE_STREAMING_OCCUPIED.code:
                        case MSEPlatform.Playback.Error.ZEST_E_MULTITUNER_CONCURRENTSTREAMING_DETECTED.code:
                        case MSEPlatform.Playback.Error.NS_E_COMPRESSED_DIGITAL_AUDIO_PROTECTION_LEVEL_UNSUPPORTED.code:
                        case MSEPlatform.Playback.Error.NS_E_UNCOMPRESSED_DIGITAL_AUDIO_PROTECTION_LEVEL_UNSUPPORTED.code:
                        case MSEPlatform.Playback.Error.NS_E_DRM_DRIVER_AUTH_FAILURE.code:
                        case MSEPlatform.Playback.Error.NS_E_DRM_NEEDS_INDIVIDUALIZATION.code:
                        case MSEPlatform.Playback.Error.NS_E_DRM_UNABLE_TO_INITIALIZE.code:
                        case MSEPlatform.Playback.Error.NS_E_WMP_AUDIO_HW_PROBLEM.code:
                        case MSEPlatform.Playback.Error.NS_E_WMP_BAD_DRIVER.code:
                            return true;
                        default:
                            return false
                    }
                }, _fireCriticalPlaybackError: function IPlayback_fireCriticalPlaybackError(error) {
                    var mediaItem = (this.currentMedia && this.currentMedia._mediaItem ? this.currentMedia._mediaItem.data : null);
                    error.isCritical = true;
                    MSEPlatform.Playback.firePlaybackError(this._onPlayerEvent.bind(this), error, "IPlayback_fireCriticalError", mediaItem)
                }, _shouldIgnoreThisErrorForBlocking: function IPlayback_shouldIgnoreThisErrorForBlocking(error) {
                    return (error === MS.Entertainment.Platform.Playback.Error.X8_E_PLAYBACK_MEDIA_ERR_NOT_LOCAL.code)
                }, _addErroredMediaInstance: function IPlayback_addErroredMediaInstance(mediaInstance) {
                    if (!mediaInstance)
                        return;
                    var error = null;
                    var errorCode = null;
                    if (mediaInstance._mediaItem)
                        mediaItem = mediaInstance._mediaItem.data;
                    if (mediaInstance._errorDescriptor) {
                        error = MS.Entertainment.Platform.Playback.makePlaybackError(mediaInstance._errorDescriptor);
                        errorCode = error.msExtendedCode
                    }
                    if (this._hasSameErrors && errorCode && this._lastErrorEncountered && this._lastErrorEncountered.msExtendedCode !== errorCode)
                        this._hasSameErrors = false;
                    this._lastErrorEncountered = error;
                    this._erroredMediaInstances.push(mediaInstance);
                    this._errorCount++;
                    if (this._isCriticalError(error))
                        this._fireCriticalPlaybackError(error)
                }, _reportPrerollErrors: function IPlayback_reportPrerollErrors() {
                    var playbackEventNotifications = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.playbackEventNotifications);
                    while (this._erroredMediaInstances.length > 0) {
                        var mediaInstance = this._erroredMediaInstances.pop();
                        var mediaItem = null;
                        var errorCode = null;
                        if (mediaInstance) {
                            if (mediaInstance._mediaItem)
                                mediaItem = mediaInstance._mediaItem.data;
                            if (mediaInstance._errorDescriptor) {
                                var error = MS.Entertainment.Platform.Playback.makePlaybackError(mediaInstance._errorDescriptor);
                                errorCode = error.msExtendedCode
                            }
                        }
                        if (mediaItem && mediaItem.libraryId && mediaItem.libraryId >= 0)
                            playbackEventNotifications.setError(mediaItem.libraryId, errorCode);
                        else if (mediaItem && mediaItem.serviceId && mediaItem.serviceId !== MS.Entertainment.Utilities.EMPTY_GUID)
                            playbackEventNotifications.setError(mediaItem.serviceId, errorCode);
                        else if (mediaItem && mediaItem.activationFilePath)
                            playbackEventNotifications.setError(mediaItem.activationFilePath, errorCode)
                    }
                }, _handleNetworkConnectionChanged: function IPlayback_handleNetworkConnectionChanged(networkConnection) {
                    switch (networkConnection) {
                        case MS.Entertainment.Platform.NetworkConnection.approachingDataLimit:
                            this._pauseStreamingAndFireError(MSEPlatform.Playback.Error.X8_E_PLAYBACK_STOPPED_DATA_LIMIT_APPROACHING);
                            break;
                        case MS.Entertainment.Platform.NetworkConnection.overDataLimit:
                        case MS.Entertainment.Platform.NetworkConnection.switchedToMetered:
                            break
                    }
                }, _pauseStreamingAndFireError: function IPlayback_pauseStreamingAndFireError(error) {
                    if (!this._isPlayerSet() || this.currentTransportState === MSEPlatform.Playback.TransportState.unInitialize || this.currentTransportState === MSEPlatform.Playback.TransportState.stopped || this.currentTransportState === MSEPlatform.Playback.TransportState.paused)
                        return;
                    if (!this.currentMedia || this.currentMedia.isLocal)
                        return;
                    this._player.pause();
                    this._targetTransportState = MSEPlatform.Playback.TransportState.paused;
                    this._fireCriticalPlaybackError(error)
                }, _applyTargetTransportState: function IPlayback_applyTargetTransportState(value) {
                    this._targetTransportState = value;
                    switch (value)
                    {
                        case MSEPlatform.Playback.TransportState.stopped:
                            if (this.currentTransportState === MSEPlatform.Playback.TransportState.paused)
                                this.currentTransportState = MSEPlatform.Playback.TransportState.stopped;
                            else
                                this._player.stop();
                            break;
                        case MSEPlatform.Playback.TransportState.paused:
                            this._player.pause();
                            this.autoPlay = false;
                            break;
                        case MSEPlatform.Playback.TransportState.playing:
                            if (this.currentTransportState !== MSEPlatform.Playback.TransportState.paused)
                                this.currentTransportState = MSEPlatform.Playback.TransportState.starting;
                            this._player.play();
                            this.autoPlay = true;
                            break;
                        default:
                            throw"IPlayback_applyTargetTransportState: Error! Unsupported state - " + value;
                    }
                }, _getAudioAd: function _getAudioAd(mediaInstance, isNextMediaInstance) {
                    return WinJS.Promise.wrap(null);
                    if (this.isRemoteSession())
                        return WinJS.Promise.wrap(null);
                    var adService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.adService);
                    return adService.isAudioAdRequired(mediaInstance, isNextMediaInstance).then(function onGotAd(item) {
                            if (item) {
                                MSEPlatform.Playback.Etw.traceString("PlaybackControl::_getAudioAd: audio ad required");
                                var mediaItem = {data: item};
                                var itemData = {
                                        source: mediaItem.data.source, isLocal: false, mediaInstanceId: null, nativeLicenseRight: null, offerId: null, cookie: 0, mediaItem: mediaItem, mediaType: Microsoft.Entertainment.Queries.ObjectType.track, protectionState: MS.Entertainment.Platform.Playback.ProtectionState.unprotected, startPosition: 0, isAudioAd: true, inCollection: mediaItem.data.inCollection, fromCollection: mediaItem.data.fromCollection, duration: mediaItem.data.duration, serviceId: mediaItem.data.serviceId
                                    };
                                return MSEPlatform.Playback.MediaInstance.createInstanceAsync(itemData)
                            }
                            else {
                                MSEPlatform.Playback.Etw.traceString("PlaybackControl::_getAudioAd: no audio ad required");
                                return WinJS.Promise.wrap(null)
                            }
                        }.bind(this), function onFail(error) {
                            MSEPlatform.Playback.Etw.traceString("PlaybackControl::_getAudioAd: isAudioAdRequired failed with error: " + error);
                            return WinJS.Promise.wrap(null)
                        })
                }, _internalCurrentMedia: null, _player: null, _targetTransportState: MSEPlatform.Playback.TransportState.unInitialize, _targetPosition: 0, _sessionMgr: null, _erroredMediaInstances: [], _signalForNextMediaPromise: null, _nextMediaInstanceAfterAd: null, _skipButtonPressed: false, _prerollPromise: null, _prerollPromiseOrdinal: 0, _lastErrorEncountered: null, _hasSameErrors: true, _hasPlayedSong: false, _errorCount: 0, _maxSequentialErrors: 25, _canResetOnNullMediaInstance: true
        }, {})});
    WinJS.Namespace.defineWithParent(MSEPlatform, "Playback", {PlaybackControl: MS.Entertainment.UI.Framework.defineUserControl("/Components/Playback/Controls/PlaybackControl.html#playbackControlTemplate", function PlaybackControl_constructor(element, options) {
            MSEPlatform.Playback.Etw.traceString("PlaybackControl::Constructor: ");
            this._playerMode = MSEPlatform.Playback.PlayerMode.local;
            if (options && options.hasOwnProperty("playerMode"))
                switch (options.playerMode) {
                    case MSEPlatform.Playback.PlayerMode.local:
                        this._playerMode = MSEPlatform.Playback.PlayerMode.local;
                        break;
                    case MSEPlatform.Playback.PlayerMode.remote:
                        this._playerMode = MSEPlatform.Playback.PlayerMode.remote;
                        break;
                    default:
                        this._playerMode = MSEPlatform.Playback.PlayerMode.local;
                        break
                }
        }, {
            initialize: function PlaybackControl_initialize() {
                MS.Entertainment.Platform.Playback.Etw.traceString("PlaybackControl::initialize");
                this._iPlayback = new MS.Entertainment.Platform.Playback.IPlayback;
                this._player = MS.Entertainment.Platform.Playback.XPlayer.createInstance(this._playerMode, this._playerContainer);
                if (this._iPlayback === null || this._player === null)
                    throw"PlaybackControl_initialize: Error! failed to create XPlayer";
                this._iPlayback.setPlayer(this._player);
                this.controlInitialized = true;
                MSEPlatform.Playback.Etw.traceControlInitialized();
                this.dispatchEvent("onControlInitialized", {sender: this})
            }, dispose: function PlaybackControl_dispose() {
                    this._iPlayback.dispose();
                    this._iPlayback = null;
                    this._player.dispose();
                    this._player = null
                }, getPlaybackInterface: function PlaybackControl_getPlaybackInterface() {
                    if (this._iPlayback === null)
                        throw"PlaybackControl_getPlaybackInterface: Error! iPlayback is null";
                    return this._iPlayback
                }, getClosedCaptionsContainer: function PlaybackControl_getClosedCaptionsContainer() {
                    return this._closedCaptionsContainer
                }, _iPlayback: null, _player: null, _playerContainer: null, _closedCaptionsContainer: null, _playerMode: null
        }, {controlInitialized: false})})
})()
