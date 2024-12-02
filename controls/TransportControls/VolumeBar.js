/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {VolumeBar: MS.Entertainment.UI.Framework.defineUserControl("Controls/TransportControls/VolumeBar.html#volumeControl", function volumeBarConstructor(element, options) {
            if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.volumeService)) {
                this._volumeControllerService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.volumeService);
                this.volumeValue = this._volumeControllerService.volume * 100;
                this.iconType = this._volumeControllerService.mute ? WinJS.UI.AppBarIcon.mute : WinJS.UI.AppBarIcon.volume;
                this._systemVolumeBinding = WinJS.Binding.bind(this._volumeControllerService, {
                    volume: this._onSystemVolumeValueChange.bind(this), mute: this._onSystemMuteStateChange.bind(this)
                });
                this._uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                this._uiStateEventHandlers = MS.Entertainment.Utilities.addEventHandlers(this._uiStateService, {isSnappedChanged: this._onUiStateChange.bind(this)})
            }
            else
                MS.Entertainment.UI.Controls.assert(this._volumeControllerService, "Volume service not registered.")
        }, {
            _volumeControllerService: null, _systemVolumeBinding: null, muteButton: null, _uiStateService: null, _uiStateEventHandlers: null, _onSystemVolumeValueChange: function _onSystemVolumeValueChange() {
                    if (this.volumeValue !== (this._volumeControllerService.volume * 100)) {
                        var oldValue = this.volumeValue;
                        this.volumeValue = this._volumeControllerService.volume * 100;
                        this.notify("volumeValue", this.volumeValue, oldValue)
                    }
                }, _onSystemMuteStateChange: function _onSystemMuteStateChange() {
                    var oldValue = this.iconType;
                    this.iconType = this._volumeControllerService.mute ? WinJS.UI.AppBarIcon.mute : WinJS.UI.AppBarIcon.volume;
                    this.notify("iconType", this.iconType, oldValue)
                }, _onUiStateChange: function _onUiStateChange() {
                    this._closeOverlay()
                }, onValueChange: function onValueChange(args) {
                    if (this._volumeControllerService) {
                        if (this._volumeControllerService.mute)
                            this.onStateChange();
                        this._volumeControllerService.volume = (args.target.value) / 100
                    }
                }, onStateChange: function onStateChange(args) {
                    if (this._volumeControllerService) {
                        this._volumeControllerService.mute = !this._volumeControllerService.mute;
                        var oldValue = this.iconType;
                        this.iconType = this._volumeControllerService.mute ? WinJS.UI.AppBarIcon.mute : WinJS.UI.AppBarIcon.volume;
                        this.notify("iconType", this.iconType, oldValue);
                        this.muteButton.isChecked = this._volumeControllerService.mute;
                        this.muteButton._button.setAttribute("aria-live", "assertive");
                        this.muteButton._button.removeAttribute("aria-live")
                    }
                }, _closeOverlay: function _closeOverlay() {
                    if (this._unloaded)
                        return;
                    var domEvent = document.createEvent("Event");
                    domEvent.initEvent("dismissoverlay", true, true);
                    this.domElement.dispatchEvent(domEvent)
                }, unload: function unload() {
                    if (this._volumeControllerService) {
                        MS.Entertainment.Utilities.Telemetry.logVolumeSelected(this._volumeControllerService.volume);
                        MS.Entertainment.Utilities.Telemetry.logMuteStateSelected(this._volumeControllerService.mute);
                        var appBar = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar);
                        appBar.sticky = false;
                        if (this._systemVolumeBinding) {
                            this._systemVolumeBinding.cancel();
                            this._systemVolumeBinding = null
                        }
                        if (this._uiStateEventHandlers) {
                            this._uiStateEventHandlers.cancel();
                            this._uiStateEventHandlers = null
                        }
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }
        })})
})()
