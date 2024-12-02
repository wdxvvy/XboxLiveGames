/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Components/Playback/Controls/PlaybackControl.js", "/Framework/debug.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Platform.Playback");
WinJS.Namespace.define("MS.Entertainment.Platform.Playback", {ConcurrentStreamingRestriction: WinJS.Class.define(function ConcurrentStreamingRestriction_constructor(playbackControl) {
        this._playbackControl = playbackControl;
        this._observe(playbackControl)
    }, {
        _playbackControl: null, _transportState: null, _currentMedia: null, _concurrentStreamingRestrictionModel: null, _mapStartToResume: false, _getPassportTicketPromise: null, _observe: function observe(playbackControl) {
                var that = this;
                this._playbackControl = playbackControl;
                playbackControl.bind("currentMedia", function(newMediaInstance) {
                    that._onCurrentMediaChanged(newMediaInstance)
                });
                playbackControl.bind("currentTransportState", function(newTransportState) {
                    that._onCurrentTransportStateChanged(newTransportState)
                })
            }, _onCurrentMediaChanged: function onCurrentMediaChanged(newMediaInstance) {
                this._concurrentStreamingRestrictionModel = null;
                this._transportState = null;
                this._currentMedia = null;
                this._mapStartToResume = false;
                var that = this;
                if (this._getPassportTicketPromise) {
                    this._getPassportTicketPromise.cancel();
                    this._getPassportTicketPromise = null
                }
                function onBlockStreaming(error) {
                    that._blockStreaming(that, error)
                }
                if (newMediaInstance) {
                    this._currentMedia = newMediaInstance;
                    if (this._shouldEnforceVideoConcurrentStreamingRestriction(newMediaInstance)) {
                        this._concurrentStreamingRestrictionModel = new Microsoft.Entertainment.Util.ConcurrentStreamingRestriction;
                        this._concurrentStreamingRestrictionModel.addEventListener("blockstreaming", onBlockStreaming);
                        var signInProvider = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                        this._getPassportTicketPromise = signInProvider.getPassportTicket(MS.Entertainment.Utilities.SignIn.TicketType.HBI, MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_Passport)).then(function getPassportTicketComplete(ticket) {
                            that._concurrentStreamingRestrictionModel.initialize(ticket);
                            if (that._transportState !== null)
                                that._reportStreamingState();
                            that._getPassportTicketPromise = null
                        }, function getPassportTicketError(error) {
                            that._blockStreaming(that, error);
                            that._getPassportTicketPromise = null
                        })
                    }
                }
            }, _onCurrentTransportStateChanged: function onCurrentTransportStateChanged(newTransportState) {
                this._transportState = newTransportState;
                this._reportStreamingState()
            }, _reportStreamingState: function reportStreamingState() {
                var reportState = null;
                if (this._concurrentStreamingRestrictionModel) {
                    switch (this._transportState) {
                        case MS.Entertainment.Platform.Playback.TransportState.playing:
                            if (this._mapStartToResume)
                                reportState = Microsoft.Entertainment.Util.EStreamingActionType.eStreamingActionTypeResume;
                            else {
                                reportState = Microsoft.Entertainment.Util.EStreamingActionType.eStreamingActionTypeStart;
                                this._mapStartToResume = true
                            }
                            break;
                        case MS.Entertainment.Platform.Playback.TransportState.paused:
                            reportState = Microsoft.Entertainment.Util.EStreamingActionType.eStreamingActionTypePause;
                            break;
                        case MS.Entertainment.Platform.Playback.TransportState.stopped:
                            reportState = Microsoft.Entertainment.Util.EStreamingActionType.eStreamingActionTypeStop;
                            break;
                        default:
                            break
                    }
                    if (reportState !== null) {
                        var reportGuid = MS.Entertainment.Utilities.EMPTY_GUID;
                        if (this._currentMedia.hasOwnProperty("mediaInstanceId"))
                            reportGuid = this._currentMedia.mediaInstanceId;
                        this._concurrentStreamingRestrictionModel.reportStreamingAction(reportState, reportGuid)
                    }
                }
            }, _blockStreaming: function _blockStreaming(context, errorCode)
            {
                var error = {
                        code: parseInt(errorCode), innerError: errorCode
                    };
                if (isNaN(error.code))
                    error = errorCode;
                context._playbackControl.forceError(error)
            }, _shouldEnforceVideoConcurrentStreamingRestriction: function _shouldEnforceVideoConcurrentStreamingRestriction(mediaInstance) {
                if (mediaInstance.isVideo() && mediaInstance.hasOwnProperty("protectionState") && mediaInstance.protectionState === MS.Entertainment.Platform.Playback.ProtectionState.drmProtected) {
                    var uri = new Windows.Foundation.Uri(mediaInstance.source);
                    if (uri.schemeName.toLocaleLowerCase() === "http" || uri.schemeName.toLocaleLowerCase() === "https")
                        if (mediaInstance.hasOwnProperty("mediaInstanceId") && mediaInstance.mediaInstanceId !== null && mediaInstance.mediaInstanceId !== undefined)
                            return true;
                        else {
                            MS.Entertainment.Platform.Playback.assert(false, "drmProtected content must have a media instance id");
                            this._blockStreaming(this, -1072885538);
                            return true
                        }
                }
                return false
            }
    }, {})})
