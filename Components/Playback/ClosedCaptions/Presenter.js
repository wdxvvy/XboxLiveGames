/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Components/Playback/Controls/PlaybackControl.js", "/Framework/utilities.js");
(function() {
    var MSEPlatform = WinJS.Namespace.define("MS.Entertainment.Platform", null);
    WinJS.Namespace.defineWithParent(MS.Entertainment.Platform.Playback, "ClosedCaptions", {PresenterObservables: MS.Entertainment.defineObservable(function PresenterObservables_ctor(){}, {})});
    WinJS.Namespace.defineWithParent(MS.Entertainment.Platform.Playback, "ClosedCaptions", {Presenter: WinJS.Class.derive(MSEPlatform.Playback.ClosedCaptions.PresenterObservables, function Presenter_ctor(renderer, rendererContainer) {
            if (!renderer || !rendererContainer)
                throw"Need to pass in a Renderer!";
            MSEPlatform.Playback.ClosedCaptions.PresenterObservables.prototype.constructor.call(this);
            this._ccRenderer = renderer;
            this._iPlaybackControl = renderer._iPlaybackControl;
            this._ccContainer = rendererContainer
        }, {
            flush: function Presenter_flush() {
                this._presenterQueue = [];
                this._ccContainer.innerHTML = ""
            }, start: function Presenter_start() {
                    if (!this._ccContainer)
                        return;
                    if (this._animationFrameHandle)
                        window.cancelAnimationFrame(this._animationFrameHandle);
                    this._animationFrameHandle = window.requestAnimationFrame(this._presenterLoop.bind(this))
                }, stop: function Presenter_stop() {
                    if (this._animationFrameHandle) {
                        window.cancelAnimationFrame(this._animationFrameHandle);
                        this._animationFrameHandle = 0
                    }
                }, presentAt: function Presenter_present(dataGeneratedAt, dataValidUntil, htmlBlob) {
                    if (this._presenterQueue.length >= this._maxPresenterQueueSize) {
                        var droppedFrame = this._presenterQueue.shift();
                        MSEPlatform.Playback.Etw.traceCCDroppedFrame(droppedFrame.dataGeneratedAt, droppedFrame.dataValidUntil, this._currentPosition)
                    }
                    this._presenterQueue.push({
                        dataGeneratedAt: dataGeneratedAt, dataValidUntil: dataValidUntil, htmlBlob: htmlBlob
                    })
                }, _ccRenderer: null, _iPlaybackControl: null, _ccContainer: null, _presenterQueue: [], _maxPresenterQueueSize: 5, _animationFrameHandle: 0, _currentPosition: 0, _lateToleranceMsec: 100, _scheduleAnimationCallback: function Presenter_scheduleAnimationCallback() {
                    this._animationFrameHandle = window.requestAnimationFrame(this._presenterLoop.bind(this))
                }, _presenterLoop: function Presenter_presenterLoop() {
                    if (this._presenterQueue.length === 0) {
                        this._scheduleAnimationCallback();
                        return
                    }
                    var frameToBePresented = null;
                    this._currentPosition = this._iPlaybackControl.currentPosition;
                    do {
                        frameToBePresented = this._presenterQueue[0];
                        if (this._currentPosition < frameToBePresented.dataGeneratedAt) {
                            frameToBePresented = null;
                            break
                        }
                        if (this._currentPosition > frameToBePresented.dataValidUntil + this._lateToleranceMsec) {
                            frameToBePresented = null;
                            var droppedFrame = this._presenterQueue.shift();
                            MSEPlatform.Playback.Etw.traceCCDroppedFrame(droppedFrame.dataGeneratedAt, droppedFrame.dataValidUntil, this._currentPosition)
                        }
                        else {
                            frameToBePresented = this._presenterQueue.shift();
                            break
                        }
                    } while (this._presenterQueue.length > 0);
                    if (frameToBePresented)
                        try {
                            this._ccContainer.innerHTML = frameToBePresented.htmlBlob
                        }
                        catch(ex) {
                            var msg = "CC Error: Malformed HTML ignored @(" + frameToBePresented.dataGeneratedAt + ") : " + frameToBePresented.htmlBlob;
                            MSEPlatform.Playback.Etw.traceString(msg);
                            var mediaId,
                                source;
                            try {
                                mediaId = this._iPlaybackControl.currentMedia.mediaInstanceId
                            }
                            catch(ex) {
                                {}
                            }
                            try {
                                source = this._iPlaybackControl.currentMedia.source
                            }
                            catch(ex) {
                                {}
                            }
                            if (!source)
                                source = "unknownSource";
                            if (!mediaId)
                                mediaId = "unknownMediaId";
                            MS.Entertainment.Platform.Playback.assert(false, msg, this._iPlaybackControl.currentMedia.serviceIdSafe + "/" + mediaId + " " + source)
                        }
                    this._scheduleAnimationCallback()
                }
        }, {})})
})()
