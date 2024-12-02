/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js");
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {DPadControls: MS.Entertainment.UI.Framework.defineUserControl("Controls/TransportControls/DPadControls.html#DPadControlsTemplate", function(element, options) {
        this._bindingsToDetach = []
    }, {
        _initialized: false, _bindingsToDetach: null, _sessionMgr: null, initialize: function initialize() {
                this.bind("playbackSession", this._playbackSessionChanged.bind(this));
                this._sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                this.playbackSession = this._sessionMgr.lrcSession;
                this._initialized = true;
                this._updateStates()
            }, _detachBindings: function _detachBindings() {
                this._bindingsToDetach.forEach(function(e) {
                    e.source.unbind(e.name, e.action)
                });
                this._bindingsToDetach = []
            }, _initializeBinding: function _initializeBinding(source, name, action) {
                source.bind(name, action);
                this._bindingsToDetach.push({
                    source: source, name: name, action: action
                })
            }, unload: function unload() {
                this._detachBindings()
            }, _playbackSessionChanged: function _playbackSessionChanged() {
                this._detachBindings();
                if (this.playbackSession)
                    this._initializeBinding(this._sessionMgr.lrcSession, "sessionState", this._lrcStateChanged.bind(this));
                this._updateStates()
            }, _lrcStateChanged: function _lrcStateChanged(newVal, oldVal) {
                this._updateStates()
            }, _updateStates: function _updateStates() {
                this.isDisabled = !(this.playbackSession && this.playbackSession.sessionState === MS.Entertainment.Platform.LivingRoomCompanion.SessionState.connected)
            }, dpadLeftClick: function dpadLeftClick() {
                this.playbackSession.sendCommand(Microsoft.Xbox.LRC.ControlKey.left)
            }, dpadRightClick: function dpadRightClick() {
                this.playbackSession.sendCommand(Microsoft.Xbox.LRC.ControlKey.right)
            }, dpadUpClick: function dpadUpClick() {
                this.playbackSession.sendCommand(Microsoft.Xbox.LRC.ControlKey.up)
            }, dpadDownClick: function dpadDownClick() {
                this.playbackSession.sendCommand(Microsoft.Xbox.LRC.ControlKey.down)
            }, aButtonClick: function aButtonClick() {
                this.playbackSession.sendCommand(Microsoft.Xbox.LRC.ControlKey.padA)
            }, bButtonClick: function bButtonClick() {
                this.playbackSession.sendCommand(Microsoft.Xbox.LRC.ControlKey.padB)
            }, xButtonClick: function xButtonClick() {
                this.playbackSession.sendCommand(Microsoft.Xbox.LRC.ControlKey.padX)
            }, yButtonClick: function yButtonClick() {
                this.playbackSession.sendCommand(Microsoft.Xbox.LRC.ControlKey.padY)
            }
    }, {
        playbackSession: null, isDisabled: false
    })})
