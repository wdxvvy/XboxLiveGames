/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/stringids.js");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {VolumeService: WinJS.Class.derive(MS.Entertainment.UI.Framework.ObservableBase, function VolumeServiceConstructor() {
            this._volumeManager = new Microsoft.Entertainment.AppVolumeManager.AppVolume;
            this._volumeManager.addEventListener("systemvolumestatechanged", this._systemVolumeStateChanged.bind(this));
            this._volumeManager.addEventListener("audioendpointchanged", this._audioEndpointChanged.bind(this));
            this._initializeStates()
        }, {
            _musicSettingsVolumeValue: "musicVolumeValue", _musicSettingsMuteState: "musicMuteState", _systemVolumeStateChangedBindingMethod: null, _volumeManager: null, _volume: 0.80, _mute: false, _isAudioEndpointAvailable: true, volume: {
                    get: function getVolume() {
                        return this._volume
                    }, set: function setVolume(newValue) {
                            this._volumeManager.setVolumeLevelAsync(newValue);
                            if (this._volume !== newValue)
                                this.updateAndNotify("volume", newValue)
                        }
                }, mute: {
                    get: function getMute() {
                        return this._mute
                    }, set: function setMute(newValue) {
                            this._volumeManager.setMutedAsync(newValue);
                            if (this._mute !== newValue)
                                this.updateAndNotify("mute", newValue)
                        }
                }, isAudioEndpointAvailable: {
                    get: function getIsAudioEndpointAvailable() {
                        return this._isAudioEndpointAvailable
                    }, set: function setIsAudioEndpointAvailable(newState) {
                            this.updateAndNotify("isAudioEndpointAvailable", newValue)
                        }
                }, _systemVolumeStateChanged: function systemVolumeStateChanged() {
                    this._updateSystemVolumeStates()
                }, _initializeStates: function initializeStates() {
                    this._updateSystemVolumeStates()
                }, _updateSystemVolumeStates: function updateSystemVolumeStates() {
                    this._volumeManager.getVolumeLevelAsync().done(function getVolumeLevelAsync_complete(volume) {
                        if (this._volume !== volume.value)
                            this.updateAndNotify("volume", volume.value)
                    }.bind(this));
                    this._volumeManager.getMutedAsync().done(function getMutedAsync_complete(muteState) {
                        if (this._mute !== muteState.value)
                            this.updateAndNotify("mute", muteState.value)
                    }.bind(this))
                }, _audioEndpointChanged: function _audioEndpointChanged(newState) {
                    if (newState.detail.length > 0)
                        if (newState.detail[0] === 1) {
                            this.updateAndNotify("isAudioEndpointAvailable", true);
                            this._updateSystemVolumeStates()
                        }
                        else
                            this.updateAndNotify("isAudioEndpointAvailable", false)
                }
        }, {factory: function factory() {
                return new MS.Entertainment.UI.Controls.VolumeService
            }})});
    MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.volumeService, MS.Entertainment.UI.Controls.VolumeService.factory)
})()
