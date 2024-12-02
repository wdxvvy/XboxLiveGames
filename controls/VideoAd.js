/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/utilities.js");
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {VideoAd: MS.Entertainment.UI.Framework.defineUserControl("Controls/VideoAd.html#videoAdTemplate", function videoAdConstructor(element, options) {
        this._eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell;
        this._playText = String.load(String.id.IDS_PLAY_BUTTON_VIDEO);
        this._pauseText = String.load(String.id.IDS_TRANSPORT_CONTROLS_PAUSE_BUTTON);
        this.adReasonClickUrl = MS.Entertainment.UI.FWLink.advertisementReason
    }, {
        adClickUrl: null, adReasonClickUrl: null, adVideoUrl: null, adClickCallback: null, adCompleted: false, adErrorOccurred: false, playbackStartedCallback: null, _mediaContext: null, _eventProvider: null, _container: null, _resumePlayOnThaw: false, _overlayTimer: null, _playbackCheckTimer: null, _uiSettings: new Windows.UI.ViewManagement.UISettings, _lastTimeDuration: null, initialize: function initialize() {
                this._updateState();
                this.overlay.domElement.setAttribute("aria-label", String.load(String.id.IDS_MUSIC_STREAMING_AD_LABEL));
                this._playbackCheckTimer = WinJS.Promise.timeout(MS.Entertainment.UI.Controls.VideoAd._playbackCheckTimeoutMS).then(function _playbackCheckTimeout() {
                    if (!this.playing)
                        this.onPlaybackError()
                }.bind(this));
                var appBarService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appToolbar);
                this._mediaContext = appBarService.pushDefaultContext([]);
                MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar).hide()
            }, unload: function unload() {
                if (this._playbackCheckTimer) {
                    this._playbackCheckTimer.cancel();
                    this._playbackCheckTimer = null
                }
                if (this._mediaContext) {
                    this._mediaContext.clearContext();
                    this._mediaContext = null
                }
                if (this.playbackStartedCallback)
                    this.playbackStartedCallback = null;
                this._clearOverlayTimer();
                MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
            }, freeze: function freeze() {
                if (this._initialized) {
                    this._hideOverlay();
                    this._resumePlayOnThaw = !this.video.paused;
                    if (this._resumePlayOnThaw)
                        this.video.pause()
                }
                MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this)
            }, thaw: function thaw() {
                MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                if (this._initialized) {
                    this._showOverlay();
                    if (this._resumePlayOnThaw)
                        this.video.play()
                }
            }, setOverlay: function setOverlay(container) {
                WinJS.Utilities.addClass(container.domElement, "videoAdContainer");
                this._container = container
            }, onPointerDown: function onPointerDown() {
                if (!this.overlay.visibility)
                    this._showOverlay();
                else
                    this._hideOverlay()
            }, onKeyDown: function onKeyDown(e) {
                if (e.keyCode === WinJS.Utilities.Key.escape)
                    this._hideOverlay();
                else
                    this._showOverlay()
            }, onPointerMove: function onPointerMove(e) {
                if (e.pointerType !== e.MSPOINTER_TYPE_TOUCH)
                    this._showOverlay()
            }, onPlayPauseClick: function onPlayPauseClick(event) {
                if (this.video.paused)
                    this.video.play();
                else
                    this.video.pause();
                this._updateState();
                this._showOverlay();
                event.cancelBubble = true
            }, onPlaybackTimeUpdate: function onPlaybackTimeUpdate() {
                this._updateState()
            }, onPlaybackPlaying: function onPlaybackPlaying() {
                if (!this.playing) {
                    this.playing = true;
                    if (this._playbackCheckTimer) {
                        this._playbackCheckTimer.cancel();
                        this._playbackCheckTimer = null
                    }
                    if (this.playbackStartedCallback) {
                        this.playbackStartedCallback();
                        this.playbackStartedCallback = null
                    }
                    MS.Entertainment.Music.Freeplay.sendTelemetryEvent(MS.Entertainment.Music.Freeplay.Events.videoAdStart);
                    this._eventProvider.traceVideo_Ad_Started(this.adVideoUrl, this.adClickUrl)
                }
                this._showOverlay()
            }, onPlaybackEnded: function onPlaybackEnded() {
                this.adCompleted = true;
                this._container.hide();
                MS.Entertainment.Music.Freeplay.sendTelemetryEvent(MS.Entertainment.Music.Freeplay.Events.videoAdComplete);
                this._eventProvider.traceVideo_Ad_Completed(this.adVideoUrl, this.adClickUrl)
            }, onPlaybackError: function onPlaybackError() {
                this.adCompleted = true;
                this.adErrorOccurred = true;
                this._container.hide();
                MS.Entertainment.Music.Freeplay.sendTelemetryEvent(MS.Entertainment.Music.Freeplay.Events.videoAdError);
                this._eventProvider.traceVideo_Ad_Error(this.adVideoUrl, this.adClickUrl)
            }, onCloseClick: function onCloseClick() {
                this.adCompleted = false;
                this._container.hide();
                MS.Entertainment.Music.Freeplay.sendTelemetryEvent(MS.Entertainment.Music.Freeplay.Events.videoAdClosed);
                this._eventProvider.traceVideo_Ad_Skipped(this.adVideoUrl, this.adClickUrl)
            }, onClickLearnMore: function onClickLearnMore() {
                if (this.adClickCallback) {
                    MS.Entertainment.Music.Freeplay.sendTelemetryEvent(MS.Entertainment.Music.Freeplay.Events.videoAdClickThru);
                    this.adClickCallback()
                }
            }, onKeyDownLearnMore: function onKeyDownLearnMore(event) {
                if (event.keyCode === WinJS.Utilities.Key.enter || event.keyCode === WinJS.Utilities.Key.space)
                    this.onClickLearnMore()
            }, onClickAdReason: function onClickAdReason() {
                var adService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.adService);
                adService.sendVideoAdReasonClickTelemetryInfo()
            }, onClickUpSell: function onClickUpSell() {
                this.video.pause();
                this._updateState();
                this._hideOverlay();
                this._eventProvider.traceVideo_Ad_UpSell(this.adVideoUrl, this.adClickUrl);
                MS.Entertainment.Music.Freeplay.sendTelemetryEvent(MS.Entertainment.Music.Freeplay.Events.musicPassUpsellVideoAdInvoked);
                MS.Entertainment.Music.SubscriptionSignup.doSubscriptionSignup().then(function signUpComplete() {
                    var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                    if (signedInUser.isSubscription) {
                        this.adCompleted = true;
                        this._container.hide()
                    }
                    else {
                        this._showOverlay();
                        MS.Entertainment.UI.Framework.tryAndFocusElementInSubTreeWithTimer(this.upsellButton.domElement, 0)
                    }
                }.bind(this), function signUpError(){}.bind(this))
            }, _updateState: function _updateState() {
                if (this.video.duration > 0) {
                    var secondsRemaining = Math.max(1, Math.ceil(this.video.duration - this.video.currentTime));
                    if (this._lastTimeDuration !== secondsRemaining) {
                        this.timeRemaining = String.load(String.id.IDS_VIDEO_AD_PROGRESS).format(secondsRemaining);
                        this.timeLabel.setAttribute("aria-label", this.timeRemaining);
                        this._lastTimeDuration = secondsRemaining
                    }
                }
                this.paused = this.video.paused;
                this.playPauseButton.text = this.paused ? this._playText : this._pauseText
            }, _clearOverlayTimer: function _clearOverlayTimer() {
                if (this._overlayTimer) {
                    window.clearTimeout(this._overlayTimer);
                    this._overlayTimer = null
                }
            }, _hideOverlay: function _hideOverlay() {
                this.overlay.visibility = false;
                this._clearOverlayTimer()
            }, _showOverlay: function _showOverlay() {
                this.overlay.visibility = true;
                this._clearOverlayTimer();
                this._overlayTimer = window.setTimeout(function() {
                    if (!this._unloaded) {
                        this.overlay.visibility = false;
                        this._overlayTimer = null
                    }
                }.bind(this), this._uiSettings.messageDuration * 1000)
            }
    }, {
        timeRemaining: null, playing: false, paused: false
    }, {
        showVideoAd: function showVideoAd(adVideoUrl, adClickUrl, adClickCallback, playbackStartedCallback) {
            if (!adVideoUrl)
                throw"showVideoAd: adUrl parameter is mandatory";
            var videoAdOverlay = MS.Entertainment.UI.Shell.createOverlay("MS.Entertainment.UI.Controls.VideoAd", {
                    adVideoUrl: adVideoUrl, adClickUrl: adClickUrl, adClickCallback: adClickCallback, playbackStartedCallback: playbackStartedCallback
                }, {
                    left: "0px", top: "0px", right: "0px", bottom: "0px"
                });
            return videoAdOverlay.show()
        }, _playbackCheckTimeoutMS: 10000
    })})
