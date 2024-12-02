/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Components/Playback/Controls/PlaybackControl.js", "/Framework/debug.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Platform.Playback");
WinJS.Namespace.define("MS.Entertainment.Platform.Playback", {_getPlayLogTickInterval: (function _getPlayLogTickInterval_Closure() {
        var _playLogTickInterval = {};
        _playLogTickInterval[Microsoft.Entertainment.Application.AppMode.music] = 15000;
        _playLogTickInterval[Microsoft.Entertainment.Application.AppMode.music2] = 15000;
        _playLogTickInterval[Microsoft.Entertainment.Application.AppMode.video] = 120000;
        _playLogTickInterval[Microsoft.Entertainment.Application.AppMode.video2] = 120000;
        _playLogTickInterval[Microsoft.Entertainment.Application.AppMode.games] = -1;
        _playLogTickInterval[Microsoft.Entertainment.Application.AppMode.companion] = -1;
        _playLogTickInterval[Microsoft.Entertainment.Application.AppMode.test] = -1;
        _playLogTickInterval["X8_Test_PlayLog"] = 500;
        return function _getPlayLogTickInterval(appMode) {
                return _playLogTickInterval[appMode]
            }
    })()});
WinJS.Namespace.define("MS.Entertainment.Platform.Playback", {
    _Bookmark: WinJS.Class.define(function _bookmark_constructor(){}, {
        _lastSavePosition: 0, _shouldSaveOnMediaInstance: function _shouldSaveOnMediaInstance(mediaInstance) {
                return false
            }, shouldSaveOnPosition: function shouldSaveOnPosition(mediaInstance, position) {
                var save = false;
                var saveThreshold = MS.Entertainment.Platform.Playback._getPlayLogTickInterval(MS.Entertainment.appMode);
                if (this._shouldSaveOnMediaInstance(mediaInstance))
                    save = (this._lastSavePosition + saveThreshold <= position);
                return save
            }, shouldSaveOnTransportState: function shouldSaveOnTransportState(mediaInstance, transportState) {
                var save = false;
                if (this._shouldSaveOnMediaInstance(mediaInstance))
                    save = (transportState === MS.Entertainment.Platform.Playback.TransportState.paused || transportState === MS.Entertainment.Platform.Playback.TransportState.stopped);
                return save
            }, save: function save(mediaInstance, position) {
                if (mediaInstance) {
                    mediaInstance.bookmark = position;
                    this._lastSavePosition = position
                }
            }, clear: function clear(mediaInstance) {
                this.save(mediaInstance, 0)
            }
    }), _PlayedState: WinJS.Class.define(function _PlayedState_constructor(){}, {
            saved: false, _videoThreshold: 95, _otherMediaThreshold: 90, shouldSaveOnProgress: function shouldSaveOnProgress(mediaInstance, percentage) {
                    var threshold = this._otherMediaThreshold;
                    return (percentage > threshold)
                }, save: function save(mediaInstance) {
                    if (mediaInstance) {
                        mediaInstance.played = true;
                        this.saved = true
                    }
                }
        }), _Playcount: WinJS.Class.define(function _Playcount_constructor(){}, {
            saved: false, _trackThreshold: 20, _otherMediaThreshold: 95, shouldSaveOnProgress: function shouldSaveOnProgress(mediaInstance, percentage) {
                    var threshold = 101;
                    if (mediaInstance)
                        threshold = this._otherMediaThreshold;
                    return (percentage > threshold)
                }, save: function save(mediaInstance) {
                    if (mediaInstance) {
                        mediaInstance.playcount++;
                        this.saved = true
                    }
                }
        }), _PlayLogTimer: WinJS.Class.define(function _PlayLogTimer_constructor(callback) {
            this._timerCallback = callback
        }, {
            _timerId: null, _timerCallback: null, _timerIntervalMsec: null, start: function _PlayLogTimer_start() {
                    if (this._timerId) {
                        this._timerId.cancel();
                        this._timerId = null
                    }
                    this._tick()
                }, stop: function _PlayLogTimer_stop() {
                    if (this._timerId) {
                        this._timerId.cancel();
                        this._timerId = null
                    }
                }, _tick: function _PlayLogTimer_tick() {
                    var tickInterval = MS.Entertainment.Platform.Playback._getPlayLogTickInterval(MS.Entertainment.appMode);
                    if (tickInterval === -1)
                        return;
                    MS.Entertainment.Platform.Playback.assert(!isNaN(tickInterval), "Invalid tickInterval of: " + tickInterval);
                    this._timerId = WinJS.Promise.timeout(tickInterval).then(function _PlayLogTimer_ring_ring() {
                        if (this._timerCallback)
                            this._timerCallback();
                        WinJS.Promise.timeout().then(function _tick_tock() {
                            this._tick()
                        }.bind(this))
                    }.bind(this))
                }
        })
});
WinJS.Namespace.define("MS.Entertainment.Platform.Playback", {PlayLog: WinJS.Class.define(function PlayLog_constructor(playbackControl) {
        this._observe(playbackControl)
    }, {
        _currentMediaInstance: null, _currentPosition: 0, _currentDuration: 0, _bookmark: null, _playedState: null, _playcount: null, _playLogTimer: null, _playbackControl: null, _observe: function PlayLog_observe(playbackControl) {
                this._playbackControl = playbackControl;
                playbackControl.bind("currentMedia", this._onCurrentMediaChanged.bind(this));
                playbackControl.bind("currentTransportState", this._onCurrentTransportStateChanged.bind(this));
                playbackControl.bind("duration", this._onDurationChanged.bind(this));
                playbackControl.bind("seekedPosition", this._onSeekedPositionChanged.bind(this))
            }, _onCurrentMediaChanged: function PlayLog_onCurrentMediaChanged(newMediaInstance) {
                if (newMediaInstance) {
                    this._currentMediaInstance = newMediaInstance;
                    this._currentDuration = 0;
                    this._currentPosition = 0;
                    this._bookmark = new MS.Entertainment.Platform.Playback._Bookmark;
                    this._playedState = new MS.Entertainment.Platform.Playback._PlayedState;
                    this._playcount = new MS.Entertainment.Platform.Playback._Playcount;
                    if (!this._playLogTimer)
                        this._playLogTimer = new MS.Entertainment.Platform.Playback._PlayLogTimer(this._onCurrentPositionChanged.bind(this));
                    if (this._playLogTimer)
                        this._playLogTimer.start()
                }
            }, _onDurationChanged: function PlayLog_onDurationChanged(newDuration) {
                this._currentDuration = newDuration
            }, _onCurrentPositionChanged: function PlayLog_onCurrentPositionChanged() {
                var progress = 0;
                var newPosition = this._playbackControl.forceTimeUpdate();
                this._currentPosition = newPosition;
                if (this._currentMediaInstance && this._currentMediaInstance.playlogEnabled) {
                    if (this._currentDuration !== 0)
                        progress = this._currentPosition * 100 / this._currentDuration;
                    if (!this._playedState.saved && this._bookmark.shouldSaveOnPosition(this._currentMediaInstance, newPosition))
                        this._bookmark.save(this._currentMediaInstance, newPosition);
                    if (!this._playedState.saved && this._playedState.shouldSaveOnProgress(this._currentMediaInstance, progress)) {
                        this._playedState.save(this._currentMediaInstance);
                        this._bookmark.clear(this._currentMediaInstance)
                    }
                    if (progress >= 100)
                        this._bookmark.clear(this._currentMediaInstance);
                    if (!this._playcount.saved && this._playcount.shouldSaveOnProgress(this._currentMediaInstance, progress))
                        this._playcount.save(this._currentMediaInstance)
                }
            }, _onCurrentTransportStateChanged: function PlayLog_onCurrentTransportStateChanged(newTransportState) {
                if (this._currentMediaInstance && this._currentMediaInstance.playlogEnabled) {
                    this._onCurrentPositionChanged();
                    if (!this._playedState.saved && this._bookmark.shouldSaveOnTransportState(this._currentMediaInstance, newTransportState)) {
                        if (newTransportState === MS.Entertainment.Platform.Playback.TransportState.stopped && this._currentMediaInstance && this._currentMediaInstance.stopPosition)
                            this._currentPosition = this._currentMediaInstance.stopPosition;
                        else
                            this._currentPosition = this._playbackControl.forceTimeUpdate();
                        if (this._currentPosition > 0)
                            this._bookmark.save(this._currentMediaInstance, this._currentPosition)
                    }
                    if (newTransportState === MS.Entertainment.Platform.Playback.TransportState.playing)
                        this._playLogTimer.start();
                    else
                        this._playLogTimer.stop()
                }
            }, _onSeekedPositionChanged: function PlayLog_onSeekedPositionChanged() {
                if (this._currentMediaInstance && this._currentMediaInstance.playlogEnabled) {
                    this._onCurrentPositionChanged();
                    if (this._bookmark._shouldSaveOnMediaInstance(this._currentMediaInstance) && this._currentPosition >= 0)
                        this._bookmark.save(this._currentMediaInstance, this._currentPosition)
                }
            }
    }, {})})
