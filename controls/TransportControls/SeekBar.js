/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Components/Playback/controls/playbackcontrol.js", "/Framework/corefx.js");
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {SeekBar: MS.Entertainment.UI.Framework.defineUserControl("Controls/TransportControls/SeekBar.html#seekBarTemplate", function(element, options) {
        this._renderLoop = this._renderLoop.bind(this);
        this._updateSize = this._updateSize.bind(this)
    }, {
        _initialized: false, _uiStateService: MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState), _bindings: null, _cachedValues: {
                _trackWidth: 0, _seekbarPosition: 0, _thumbWidth: 0, msScrollLimitXMax: 0
            }, _scrubValue: 0, _lastAriaSliderUpdate: 0, _musicThumbOffset: 30, initialize: function initialize() {
                this.bind("playbackSession", this._playbackSessionChanged.bind(this));
                this.bind("metadataVisible", this._updateValues.bind(this));
                this.bind("visibility", this._visibilityChanged.bind(this));
                this._track.addEventListener("keydown", this._onKeyEvent.bind(this), true);
                this._scroller.addEventListener("MSPointerDown", this._onMouseEvent.bind(this), true);
                this._scroller.addEventListener("MSPointerUp", this._onMouseEvent.bind(this), true);
                this._scroller.addEventListener("MSPointerMove", this._onMouseEvent.bind(this), true);
                this._scroller.addEventListener("MSManipulationStateChanged", this._onMouseEvent.bind(this), true);
                this._scroller.addEventListener("scroll", this._scrollPositionChanged.bind(this), true);
                this._scroller.addEventListener("MSHoldVisual", function(e) {
                    e.preventDefault()
                });
                this.domElement.attachEvent("onresize", this._updateSize);
                this._initialized = true
            }, _visibilityChanged: function _visibilityChanged(newVal) {
                if (newVal)
                    this._updateSize()
            }, _detachBindings: function _detachBindings() {
                if (this._bindings) {
                    this._bindings.cancel();
                    this._bindings = null
                }
            }, freeze: function seekBar_freeze() {
                if (this.frozen) {
                    MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this);
                    return
                }
                this._detachBindings();
                this.frozen = true;
                MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this)
            }, thaw: function seekBar_thaw() {
                MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                this.frozen = false;
                if (this._initialized)
                    this._playbackSessionChanged();
                this._updateSize()
            }, unload: function unload() {
                this._detachBindings();
                this.domElement.detachEvent("onresize", this._updateSize);
                MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
            }, _updateSize: function _updateSize() {
                if (this._track) {
                    this._cachedValues._seekbarPosition = WinJS.Utilities.getPosition(this._track);
                    this._cachedValues._trackWidth = this._track.clientWidth
                }
                if (this._thumb)
                    this._cachedValues._thumbWidth = this._thumb.clientWidth;
                if (this._scroller) {
                    this._scroller.style.msScrollLimitXMin = "0px";
                    this._scroller.style.msScrollLimitXMax = this._scroller.clientWidth - (this._cachedValues._thumbWidth * 2) + "px";
                    this._cachedValues.msScrollLimitXMax = this._scroller.style.msScrollLimitXMax;
                    var scrollableWidth = parseInt(this._cachedValues.msScrollLimitXMax);
                    if (this._scroller)
                        this._scroller.scrollLeft = (scrollableWidth - (this._millisecondsToDecimal(this.value) * scrollableWidth))
                }
                this._mediaPositionChanged()
            }, _playbackSessionChanged: function _playbackSessionChanged() {
                this._detachBindings();
                if (this.playbackSession)
                    this._bindings = WinJS.Binding.bind(this, {
                        playbackSession: {
                            currentMedia: this._mediaChanged.bind(this), currentPosition: this._mediaPositionChanged.bind(this), currentTransportState: this._playbackStateChanged.bind(this)
                        }, _uiStateService: {
                                isSnapped: this._snappedStateChanged.bind(this), isFullScreenVideo: this._fullScreenVideoChanged.bind(this)
                            }
                    });
                this._updateValues();
                this._updateAriaSliderValues(true)
            }, _playbackStateChanged: function _playbackStateChanged() {
                this._updateAriaSliderValues(true)
            }, _snappedStateChanged: function _snappedStateChanged(newVal) {
                if (!newVal) {
                    this._updatePosition();
                    this._updateAriaSliderValues(true)
                }
            }, _fullScreenVideoChanged: function _fullScreenVideoChanged(isFullScreenVideo) {
                if (!isFullScreenVideo) {
                    this._updatePosition();
                    this._updateAriaSliderValues(true)
                }
            }, _mediaChanged: function _mediaChanged() {
                this._updatePosition();
                this._updateAriaSliderValues();
                this._updateNowPlayingText()
            }, _mediaPositionChanged: function _mediaPositionChanged() {
                if (this._uiStateService.isFullScreenVideo)
                    return;
                this._updatePosition();
                this._updateAriaSliderValues()
            }, _updateNowPlayingText: function _updateNowPlayingText() {
                this.nowPlayingText = String.load(String.id.IDS_HOME_NOW_PLAYING)
            }, _updatePosition: function _updatePosition() {
                if (this.frozen || !this.playbackSession)
                    return;
                var durationMs = this.playbackSession.duration;
                var positionMs = this.playbackSession.currentPosition;
                positionMs = Math.min(durationMs, positionMs);
                this.max = durationMs;
                this.min = 0;
                if (!this.isManipulating) {
                    MS.Entertainment.Framework.AccUtils.setAriaSliderBounds(this._track, this.min, this.max);
                    this.value = positionMs;
                    this._updateValues()
                }
            }, _scrollPositionChanged: function _scrollPositionChanged() {
                var scrollableWidth = parseInt(this._cachedValues.msScrollLimitXMax);
                var percentage = (scrollableWidth - this._scroller.scrollLeft) / scrollableWidth;
                var newPosition = (this.max - this.min) * percentage + this.min;
                this._scrubValue = newPosition;
                this._scrubValue = this._scrubValue < 0 ? 0 : this._scrubValue;
                this._scrubValue = this._scrubValue > this.max ? this.max : this._scrubValue
            }, _captureSeekBarInput: function _captureSeekBarInput(e) {
                if (e.pointerId && e.pointerType === MS.Entertainment.UI.Controls.SeekBar.mousePointerType && this._scroller)
                    this._scroller.msSetPointerCapture(e.pointerId);
                if (!this.isManipulating) {
                    this.metadataVisible = false;
                    this.isManipulating = true;
                    this._engage()
                }
                this._seekBarMouseMove(e)
            }, _releaseSeekBarInput: function _releaseSeekBarInput(e) {
                if (this.isManipulating) {
                    this.isManipulating = false;
                    this.metadataVisible = true;
                    if (e.pointerId && e.pointerType === MS.Entertainment.UI.Controls.SeekBar.touchPointerType)
                        this._scrollPositionChanged();
                    else if (e.pointerId && e.pointerType === MS.Entertainment.UI.Controls.SeekBar.mousePointerType)
                        this._scroller.msReleasePointerCapture(e.pointerId);
                    this._disengage();
                    this._updatePlaybackSession();
                    this._updateValues();
                    this._updateAriaSliderValues(true)
                }
            }, _seekBarMouseMove: function _seekBarMouseMove(e, forceUpdate) {
                if (!this._scroller)
                    return;
                if (forceUpdate || (this.isManipulating && e.eventPhase === e.AT_TARGET && e.pointerType === MS.Entertainment.UI.Controls.SeekBar.mousePointerType))
                    this._scroller.scrollLeft = (parseInt(this._cachedValues.msScrollLimitXMax) - e.x) + 40
            }, _onMouseEvent: function _onMouseEvent(e) {
                switch (e.type) {
                    case"MSManipulationStateChanged":
                        if (e.currentState === e.MS_MANIPULATION_STATE_STOPPED || e.currentState === e.MS_MANIPULATION_STATE_INERTIA) {
                            if (this._scroller)
                                this._scroller.scrollLeft = this._scroller.scrollLeft;
                            this._releaseSeekBarInput(e)
                        }
                        else
                            this._captureSeekBarInput(e);
                        break;
                    case"MSPointerDown":
                        if (!this.playbackSession || !this.playbackSession.canSeek)
                            return;
                        if (e.eventPhase === e.AT_TARGET) {
                            if (this._scroller) {
                                var offset = 0;
                                offset = this._cachedValues._thumbWidth;
                                this._scroller.scrollLeft = (parseInt(this._cachedValues.msScrollLimitXMax) - e.x) + offset
                            }
                            this._scrollPositionChanged();
                            this.value = this._scrubValue;
                            this._updateValues();
                            this._updateAriaSliderValues(true);
                            this._updatePlaybackSession();
                            this._releaseSeekBarInput(e)
                        }
                        else
                            this._captureSeekBarInput(e);
                        break;
                    case"MSPointerUp":
                    case"MSPointerCancel":
                        this._releaseSeekBarInput(e);
                        e.cancelBubble = true;
                        break;
                    case"MSPointerMove":
                        this._seekBarMouseMove(e);
                        e.cancelBubble = true;
                        e.stopImmediatePropagation();
                        break
                }
            }, _onKeyEvent: function _onKeyEvent(e) {
                if (e && this.playbackSession.canSeek) {
                    var newPositionMs = this.value;
                    if (e.keyCode === WinJS.Utilities.Key.leftArrow)
                        if (e.ctrlKey)
                            newPositionMs -= this._percentageToMilliseconds(MS.Entertainment.UI.Controls.SeekBar.ctrlSkipPercentage);
                        else if (e.shiftKey)
                            newPositionMs -= MS.Entertainment.UI.Controls.SeekBar.shiftSkipMs;
                        else
                            newPositionMs -= this._percentageToMilliseconds(MS.Entertainment.UI.Controls.SeekBar.defaultSkipPercentage);
                    else if (e.keyCode === WinJS.Utilities.Key.rightArrow)
                        if (e.ctrlKey)
                            newPositionMs += this._percentageToMilliseconds(MS.Entertainment.UI.Controls.SeekBar.ctrlSkipPercentage);
                        else if (e.shiftKey)
                            newPositionMs += MS.Entertainment.UI.Controls.SeekBar.shiftSkipMs;
                        else
                            newPositionMs += this._percentageToMilliseconds(MS.Entertainment.UI.Controls.SeekBar.defaultSkipPercentage);
                    if (newPositionMs !== this.value) {
                        this.value = newPositionMs;
                        this._updateValues();
                        this._updateAriaSliderValues(true);
                        this._updatePlaybackSession();
                        e.preventDefault()
                    }
                }
            }, _engage: function _engage() {
                WinJS.Utilities.addClass(this._thumb, "seekBarThumbEngaged");
                WinJS.Utilities.addClass(this._thumbText, "seekBarThumbTextEngaged");
                WinJS.Utilities.addClass(this._track, "seekBarTrackEngaged");
                if (Windows.UI.Input.PointerVisualizationSettings) {
                    var pointerVisualizationSettings = Windows.UI.Input.PointerVisualizationSettings.getForCurrentView();
                    pointerVisualizationSettings.isContactFeedbackEnabled = false;
                    pointerVisualizationSettings.isBarrelButtonFeedbackEnabled = false
                }
                window.requestAnimationFrame(this._renderLoop)
            }, _disengage: function _disengage() {
                WinJS.Utilities.removeClass(this._thumb, "seekBarThumbEngaged");
                WinJS.Utilities.removeClass(this._thumbText, "seekBarThumbTextEngaged");
                WinJS.Utilities.removeClass(this._track, "seekBarTrackEngaged");
                if (Windows.UI.Input.PointerVisualizationSettings) {
                    var pointerVisualizationSettings = Windows.UI.Input.PointerVisualizationSettings.getForCurrentView();
                    pointerVisualizationSettings.isContactFeedbackEnabled = true;
                    pointerVisualizationSettings.isBarrelButtonFeedbackEnabled = true
                }
                this.value = this._scrubValue
            }, _percentageToMilliseconds: function _percentageToMilliseconds(percentage) {
                percentage = percentage < 0 ? 0 : percentage;
                percentage = percentage > 100 ? 100 : percentage;
                return this.min + ((percentage * (this.max - this.min)) / 100)
            }, _millisecondsToDecimal: function _millisecondsToDecimal(milliseconds) {
                milliseconds = milliseconds < 0 ? 0 : milliseconds;
                milliseconds = milliseconds > this.max ? this.max : milliseconds;
                var newPosition = (milliseconds - this.min) / (this.max - this.min);
                newPosition = isNaN(newPosition) ? 0 : newPosition;
                return newPosition
            }, _millisecondsToPercentage: function _millisecondsToPercentage(milliseconds) {
                return (this._millisecondsToDecimal(milliseconds) * 100) + "%"
            }, _updatePlaybackSession: function _updatePlaybackSession() {
                if (this.playbackSession !== null)
                    try {
                        this.playbackSession.seekToPosition(this.value)
                    }
                    catch(err) {}
            }, _lastUpdate: 0, _renderLoop: function _renderLoop() {
                if ((new Date) - this._lastUpdate > 20) {
                    this._lastUpdate = new Date;
                    this._updateValues();
                    this._updateAriaSliderValues(true)
                }
                if (this.isManipulating)
                    window.requestAnimationFrame(this._renderLoop)
            }, _updateValues: function _updateValues() {
                if (!this._initialized || this.frozen || !this.playbackSession || !this.playbackSession.currentMedia)
                    return;
                var durationText = MS.Entertainment.Utilities.millisecondsToTimeCode(this.max);
                this.seekBarDurationText = durationText ? "/" + durationText : String.empty;
                if (this.isManipulating) {
                    var scrubValueText = MS.Entertainment.Utilities.millisecondsToTimeCode(this._scrubValue);
                    this._thumbText.textContent = scrubValueText
                }
                else {
                    this.value = this.value < 0 ? 0 : this.value;
                    this.value = this.value > this.max ? this.max : this.value;
                    if (this._cachedValues._trackWidth > 0 && this.seekBarFill)
                        this.seekBarFill.style.msTransform = "scaleX(" + this._millisecondsToDecimal(this.value) + ")";
                    var scrollableWidth = parseInt(this._cachedValues.msScrollLimitXMax);
                    if (this._scroller)
                        this._scroller.scrollLeft = (scrollableWidth - (this._millisecondsToDecimal(this.value) * scrollableWidth));
                    this.seekBarPositionText = MS.Entertainment.Utilities.millisecondsToTimeCode(this.value);
                    this.thumbVisible = (this.metadataVisible || this.isManipulating || this._uiStateService.isSnapped) && this.playbackSession && this.playbackSession.canSeek
                }
                if (this.metadataVisible !== this.isManipulating ? false : this.metadataVisible)
                    this.metadataVisible = this.isManipulating ? false : this.metadataVisible
            }, _updateAriaSliderValues: function _updateAriaSliderValues(alwaysUpdate) {
                if (alwaysUpdate || (new Date) - this._lastAriaSliderUpdate > MS.Entertainment.UI.Controls.SeekBar.ariaUpdateDelayMs) {
                    MS.Entertainment.Framework.AccUtils.setAriaSliderPosition(this._track, this.value, this.seekBarPositionText);
                    this._lastAriaSliderUpdate = new Date
                }
            }
    }, {
        min: 0, max: 100, value: 0, seekBarDurationText: "", seekBarPositionText: "", nowPlayingText: "", isManipulating: false, metadataVisible: true, thumbVisible: true, playbackSession: null, frozen: false
    }, {
        ariaUpdateDelayMs: 5000, shiftSkipMs: 1000, ctrlSkipPercentage: 20, defaultSkipPercentage: 5, touchPointerType: 2, penPointerType: 3, mousePointerType: 4
    })})
