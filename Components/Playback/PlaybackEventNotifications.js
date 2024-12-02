/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Framework/debug.js", "/Framework/utilities.js");
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Platform.Playback");
    WinJS.Namespace.define("MS.Entertainment.Platform.Playback", {PlaybackEventNotifications: WinJS.Class.define(function playbackEventNotifierConstructor(){}, {
            _listeners: {}, _listenerCount: 0, _errors: {}, _nowPlayingLibraryId: 0, _nowPlayingServiceId: String.empty, _nowPlayingActivationFilePath: String.empty, _bindings: null, setError: function setError(mediaId, errorCode) {
                    MS.Entertainment.Platform.Playback.assert(this._isValidMediaId(mediaId), "invalid mediaId param");
                    MS.Entertainment.Platform.Playback.assert(errorCode < 0, "invalid errorCode param");
                    if (errorCode === 0)
                        delete this._errors[mediaId];
                    else
                        this._errors[mediaId] = errorCode;
                    this._sendEvent(mediaId, MS.Entertainment.Platform.Playback.PlaybackEventNotifications.Event.error, errorCode)
                }, clearErrors: function clearErrors() {
                    for (var mediaId in this._errors)
                        this._sendEvent(mediaId, MS.Entertainment.Platform.Playback.PlaybackEventNotifications.Event.error, 0);
                    this._errors = {}
                }, attachListener: function attachListener(mediaId, listener) {
                    MS.Entertainment.Platform.Playback.assert(this._isValidMediaId(mediaId), "invalid mediaId param");
                    MS.Entertainment.Platform.Playback.assert(listener instanceof Function, "listener param is not a function");
                    if (this._listenerCount === 0) {
                        var sessionManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                        this._bindings = WinJS.Binding.bind(sessionManager, {nowPlayingSession: {currentMedia: this._handleCurrentMediaChange.bind(this)}})
                    }
                    this._listenerCount++;
                    var listeners = this._listeners[mediaId];
                    if (!listeners)
                        this._listeners[mediaId] = [listener];
                    else
                        listeners.push(listener);
                    var errorCode = this._errors[mediaId];
                    if (errorCode && !this._shouldIgnoreError(errorCode))
                        listener(mediaId, MS.Entertainment.Platform.Playback.PlaybackEventNotifications.Event.error, errorCode);
                    if ((this._isValidMediaId(mediaId)) && (mediaId === this._nowPlayingLibraryId || mediaId === this._nowPlayingServiceId || mediaId === this._nowPlayingActivationFilePath))
                        listener(mediaId, MS.Entertainment.Platform.Playback.PlaybackEventNotifications.Event.nowPlaying, true)
                }, detachListener: function detachListener(mediaId, listener) {
                    MS.Entertainment.Platform.Playback.assert(this._isValidMediaId(mediaId), "invalid mediaId param");
                    MS.Entertainment.Platform.Playback.assert(listener instanceof Function, "listener param is not a function");
                    var listeners = this._listeners[mediaId];
                    if (listeners)
                        if (listeners.length === 1) {
                            MS.Entertainment.Platform.Playback.assert(listeners[0] === listener, "listener not attached");
                            if (listeners[0] === listener)
                                delete this._listeners[mediaId]
                        }
                        else {
                            var index = listeners.indexOf(listener);
                            MS.Entertainment.Platform.Playback.assert(index >= 0, "listener not attached");
                            if (index >= 0)
                                listeners.splice(index, 1)
                        }
                    this._listenerCount--;
                    this._listenerCount = Math.max(0, this._listenerCount);
                    if (this._listenerCount === 0 && this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null
                    }
                }, _handleCurrentMediaChange: function _handleCurrentMediaChange(newMedia, oldMedia) {
                    if (oldMedia)
                        this._setNowPlaying(oldMedia, false);
                    if (newMedia)
                        this._setNowPlaying(newMedia, true)
                }, _setNowPlaying: function _sendNowPlayingEvent(media, isNowPlaying) {
                    if (media.libraryId) {
                        this._sendEvent(media.libraryId, MS.Entertainment.Platform.Playback.PlaybackEventNotifications.Event.nowPlaying, isNowPlaying);
                        this._nowPlayingLibraryId = (isNowPlaying) ? media.libraryId : 0
                    }
                    if (media.serviceId && media.serviceId !== MS.Entertainment.Utilities.EMPTY_GUID) {
                        this._sendEvent(media.serviceId, MS.Entertainment.Platform.Playback.PlaybackEventNotifications.Event.nowPlaying, isNowPlaying);
                        this._nowPlayingServiceId = (isNowPlaying) ? media.serviceId : String.empty
                    }
                    if (media.activationFilePath) {
                        this._sendEvent(media.activationFilePath, MS.Entertainment.Platform.Playback.PlaybackEventNotifications.Event.nowPlaying, isNowPlaying);
                        this._nowPlayingActivationFilePath = (isNowPlaying) ? media.activationFilePath : String.empty
                    }
                }, _sendEvent: function _sendEvent(mediaId, event, value) {
                    var listeners = this._listeners[mediaId];
                    if (listeners && !this._shouldIgnoreError(value))
                        listeners.forEach(function(listener) {
                            listener(mediaId, event, value)
                        })
                }, _isValidMediaId: function _isValidMediaId(mediaId) {
                    return ((typeof mediaId === "number" && mediaId >= 0) || (typeof mediaId === "string" && !MS.Entertainment.Utilities.isEmptyGuid(mediaId)))
                }, _shouldIgnoreError: function _shouldIgnoreError(errorCode) {
                    return (errorCode === MS.Entertainment.Platform.Playback.Error.X8_E_PLAYBACK_MEDIA_ERR_NOT_LOCAL.code)
                }
        }, {Event: {
                error: "error", nowPlaying: "nowPlaying"
            }})});
    MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.playbackEventNotifications, function playbackEventNotifierFactory() {
        return new MS.Entertainment.Platform.Playback.PlaybackEventNotifications
    }, true)
})()
