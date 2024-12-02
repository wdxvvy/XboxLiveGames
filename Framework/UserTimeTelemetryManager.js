/* Copyright (C) Microsoft Corporation. All rights reserved. */
WinJS.Namespace.define("MS.Entertainment.Framework", {
    UserTimeTelemetryManager: WinJS.Class.define(function UserTimeTelemetryManager() {
        this._musicPlaybackTimeTracker = new MS.Entertainment.Framework.PlaybackTimeTracker("Music");
        this._videoPlaybackTimeTracker = new MS.Entertainment.Framework.PlaybackTimeTracker("Video");
        var now = Date.now();
        this._totalTimeCounterStart = now;
        this._snappedModeTimeCounterStart = now;
        this._unsnappedModeTimeCounterStart = now
    }, {
        _totalTimeCounterStart: 0, _accumulatedTotalTime: 0, _snappedModeTimeCounterStart: 0, _accumulatedSnappedTime: 0, _unsnappedModeTimeCounterStart: 0, _accumulatedUnsnappedTime: 0, _musicPlaybackTimeTracker: null, _videoPlaybackTimeTracker: null, _configuration: null, _startedSnapped: false, _viewModeSwitched: false, _sendDataPoint: function _sendDataPoint() {
                if (!this._configuration)
                    this._configuration = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                if (this._configuration.telemetry.timeSpent) {
                    var PlatLog = Microsoft.Entertainment.Platform.Logging;
                    var dataPoint = new PlatLog.DataPoint(PlatLog.LoggingLevel.telemetry);
                    dataPoint.appendEventName("X8UsageTime");
                    dataPoint.appendParameter("TimeSpent", this._configuration.telemetry.timeSpent);
                    dataPoint.appendParameter("SnappedMode", this._configuration.telemetry.snappedMode);
                    dataPoint.appendParameter("NotSnapped", this._configuration.telemetry.notSnapped);
                    dataPoint.appendParameter("MusicPlaybackBackground", this._configuration.telemetry.musicPlaybackBackground);
                    dataPoint.appendParameter("MusicPlaybackSnapped", this._configuration.telemetry.musicPlaybackSnapped);
                    dataPoint.appendParameter("MusicPlaybackUnsnapped", this._configuration.telemetry.musicPlaybackUnsnapped);
                    dataPoint.appendParameter("VideoPlaybackBackground", this._configuration.telemetry.videoPlaybackBackground);
                    dataPoint.appendParameter("VideoPlaybackSnapped", this._configuration.telemetry.videoPlaybackSnapped);
                    dataPoint.appendParameter("VideoPlaybackUnsnapped", this._configuration.telemetry.videoPlaybackUnsnapped);
                    dataPoint.appendParameter("SyncBlockedItems", this._configuration.telemetry.syncBlockedItems);
                    dataPoint.write();
                    this._configuration.telemetry.timeSpent = 0;
                    this._configuration.telemetry.snappedMode = 0;
                    this._configuration.telemetry.notSnapped = 0;
                    this._configuration.telemetry.musicPlaybackBackground = 0;
                    this._configuration.telemetry.musicPlaybackSnapped = 0;
                    this._configuration.telemetry.musicPlaybackUnsnapped = 0;
                    this._configuration.telemetry.videoPlaybackBackground = 0;
                    this._configuration.telemetry.videoPlaybackSnapped = 0;
                    this._configuration.telemetry.videoPlaybackUnsnapped = 0;
                    this._configuration.telemetry.syncBlockedItems = 0
                }
            }, appActivated: function appActivated() {
                this._sendDataPoint();
                this._startedSnapped = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isSnapped
            }, appResumed: function appResumed() {
                var now = Date.now();
                this._sendDataPoint();
                this._totalTimeCounterStart = now;
                this._accumulatedTotalTime = 0;
                this._snappedModeTimeCounterStart = now;
                this._accumulatedSnappedTime = 0;
                this._unsnappedModeTimeCounterStart = now;
                this._accumulatedUnsnappedTime = 0;
                this._viewModeSwitched = false;
                this._startedSnapped = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isSnapped
            }, appSuspended: function appSuspended() {
                if (!this._configuration)
                    this._configuration = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                var backgroundTime = 0;
                this._musicPlaybackTimeTracker.playbackStop();
                this._videoPlaybackTimeTracker.playbackStop();
                this._musicPlaybackTimeTracker.dumpDataPoints();
                this._videoPlaybackTimeTracker.dumpDataPoints();
                this._accumulatedTotalTime += Date.now() - this._totalTimeCounterStart;
                this._accumulatedUnsnappedTime += backgroundTime;
                this._configuration.telemetry.timeSpent = this._accumulatedTotalTime / 1000;
                if (this._viewModeSwitched) {
                    this._fixCurrentAccumulatedTime();
                    this._configuration.telemetry.snappedMode = this._accumulatedSnappedTime;
                    this._configuration.telemetry.notSnapped = this._accumulatedUnsnappedTime
                }
                else if (this._startedSnapped) {
                    this._configuration.telemetry.snappedMode = this._accumulatedTotalTime / 1000;
                    this._configuration.telemetry.notSnapped = "0"
                }
                else {
                    this._configuration.telemetry.snappedMode = "0";
                    this._configuration.telemetry.notSnapped = this._accumulatedTotalTime / 1000
                }
            }, _fixCurrentAccumulatedTime: function _fixCurrentAccumulatedTime() {
                var now = Date.now();
                if (MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isSnapped)
                    this._accumulatedSnappedTime += (now - this._snappedModeTimeCounterStart) / 1000;
                else
                    this._accumulatedUnsnappedTime += (now - this._unsnappedModeTimeCounterStart) / 1000
            }, switchedToSnappedMode: function switchedToSnappedMode() {
                var now = Date.now();
                this._accumulatedUnsnappedTime += (now - this._unsnappedModeTimeCounterStart) / 1000;
                this._unsnappedModeTimeCounterStart = now;
                this._snappedModeTimeCounterStart = now;
                this._musicPlaybackTimeTracker.snappedModeChanged();
                this._videoPlaybackTimeTracker.snappedModeChanged();
                this._viewModeSwitched = true
            }, switchedToUnsnappedMode: function switchedToUnsnappedMode() {
                var now = Date.now();
                this._accumulatedSnappedTime += (now - this._snappedModeTimeCounterStart) / 1000;
                this._snappedModeTimeCounterStart = now;
                this._unsnappedModeTimeCounterStart = now;
                this._musicPlaybackTimeTracker.snappedModeChanged();
                this._videoPlaybackTimeTracker.snappedModeChanged();
                this._viewModeSwitched = true
            }, appVisibilityChanged: function appVisibilityChanged() {
                if (!MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isAppVisible) {
                    this._accumulatedTotalTime += Date.now() - this._totalTimeCounterStart;
                    if (this._viewModeSwitched)
                        this._fixCurrentAccumulatedTime()
                }
                else {
                    var now = Date.now();
                    this._snappedModeTimeCounterStart = now;
                    this._unsnappedModeTimeCounterStart = now;
                    this._totalTimeCounterStart = now
                }
                this._musicPlaybackTimeTracker.appVisibilityChanged();
                this._videoPlaybackTimeTracker.appVisibilityChanged()
            }, musicPlaybackStart: function musicPlaybackStart() {
                this._musicPlaybackTimeTracker.playbackStart()
            }, videoPlaybackStart: function videoPlaybackStart() {
                this._videoPlaybackTimeTracker.playbackStart()
            }, musicPlaybackStop: function musicPlaybackStop() {
                this._musicPlaybackTimeTracker.playbackStop()
            }, videoPlaybackStop: function videoPlaybackStop() {
                this._videoPlaybackTimeTracker.playbackStop()
            }
    }, null), PlaybackTimeTracker: WinJS.Class.define(function PlaybackTimeTracker(name) {
            this._name = name
        }, {
            accumulatedUnsnappedPlaybackTime: 0, accumulatedSnappedPlaybackTime: 0, accumulatedBackgroundPlaybackTime: 0, _playbackTimeCounterStart: 0, _isSnapped: false, _isVisible: false, _name: "", _configuration: null, _accumulatedBackgroundConfig: null, _accumulatedSnappedConfig: null, _accumulatedUnsnappedConfig: null, lastStateChange: 0, currentlyPlaying: false, _sleepTimeFudgeFactor: 1500000, snappedModeChanged: function switchedSnappedMode() {
                    if (this._playbackTimeCounterStart !== 0)
                        if (MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isSnapped !== this._isSnapped) {
                            this.playbackStop();
                            this.playbackStart()
                        }
                }, appVisibilityChanged: function appVisibilityChanged() {
                    if (this._playbackTimeCounterStart !== 0)
                        if (MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isAppVisible !== this._isVisible) {
                            this.playbackStop();
                            this.playbackStart()
                        }
                }, playbackStart: function playbackStart() {
                    this.playbackStop();
                    this._playbackTimeCounterStart = Date.now();
                    this._isSnapped = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isSnapped;
                    this._isVisible = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isAppVisible
                }, playbackStop: function playbackStop() {
                    var now = Date.now();
                    if (this._playbackTimeCounterStart !== 0) {
                        if (this._isVisible)
                            if (this._isSnapped)
                                this.accumulatedSnappedPlaybackTime += (now - this._playbackTimeCounterStart) / 1000;
                            else
                                this.accumulatedUnsnappedPlaybackTime += (now - this._playbackTimeCounterStart) / 1000;
                        else if (this._name === "Music") {
                            if (now - this.lastStateChange <= this._sleepTimeFudgeFactor)
                                this.accumulatedBackgroundPlaybackTime += (now - this._playbackTimeCounterStart) / 1000
                        }
                        else
                            this.accumulatedBackgroundPlaybackTime += (now - this._playbackTimeCounterStart) / 1000;
                        this._playbackTimeCounterStart = 0;
                        this.lastStateChange = now
                    }
                }, dumpDataPoints: function dumpDataPoints(dataPoint) {
                    try {
                        if (!this._configuration)
                            this._configuration = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        if (this._name === "Music") {
                            this._configuration.telemetry.musicPlaybackBackground = this.accumulatedBackgroundPlaybackTime;
                            this._configuration.telemetry.musicPlaybackSnapped = this.accumulatedSnappedPlaybackTime;
                            this._configuration.telemetry.musicPlaybackUnsnapped = this.accumulatedUnsnappedPlaybackTime;
                            this._configuration.telemetry.syncBlockedItems = this._configuration.sync.syncBlockedItems
                        }
                        else if (this._name === "Video") {
                            this._configuration.telemetry.videoPlaybackBackground = this.accumulatedBackgroundPlaybackTime;
                            this._configuration.telemetry.videoPlaybackSnapped = this.accumulatedSnappedPlaybackTime;
                            this._configuration.telemetry.videoPlaybackUnsnapped = this.accumulatedUnsnappedPlaybackTime
                        }
                        this.accumulatedBackgroundPlaybackTime = 0;
                        this.accumulatedSnappedPlaybackTime = 0;
                        this.accumulatedUnsnappedPlaybackTime = 0
                    }
                    catch(error) {}
                }
        }, null)
});
MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.userTimeTelemetryManager, function getUserTimeTelemetryManager() {
    return new MS.Entertainment.Framework.UserTimeTelemetryManager
}, true);
(function initializeUserTimeTelemetryManager() {
    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.userTimeTelemetryManager)
})()
