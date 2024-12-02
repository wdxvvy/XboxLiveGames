/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function() {
    "use strict";
    var MSE = WinJS.Namespace.define("MS.Entertainment", null);
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {SmartBuyStateEngine: MS.Entertainment.defineOptionalObservable(function SmartBuyStateEngineConstructor() {
            this.currentButtons = [];
            this.currentAppbarActions = [];
            this._eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell
        }, {
            buttons: null, appbarActions: null, suspendStateChanges: false, _options: null, _eventProxy: null, _eventProvider: null, _mediaBindings: null, _onStateChanged: null, _uniqueListenerId: null, _updateStateBindingMethod: null, _bindingsComplete: false, _cachedState: null, _lastFireStateChangedPromise: null, _defaultDownloadInfo: null, _currentButtons: null, _unloaded: false, currentButtons: {
                    get: function() {
                        return this._currentButtons
                    }, set: function(value) {
                            if (value !== this._currentButtons) {
                                var oldValue = this._currentButtons;
                                this._currentButtons = value;
                                if (this.media)
                                    this._eventProvider.traceMediaStateEngine_ButtonsChanged(this.media.mediaType, this.media.serviceId, this.media.libraryId);
                                this.notify("currentButtons", value, oldValue);
                                this._fireCurrentButtonsChanged()
                            }
                        }
                }, eventProxy: {
                    get: function() {
                        return this._eventProxy
                    }, set: function(value) {
                            if (this._eventProxy !== value) {
                                this._eventProxy = value;
                                if (this.currentButtons && this.currentButtons.length)
                                    this._fireCurrentButtonsChanged()
                            }
                        }
                }, initialize: function initialize(media, buttons, onStateChanged, options) {
                    if (this.media)
                        throw"State engine already initialized.";
                    else if (!media)
                        throw"A valid media object is required.";
                    this._options = options || {};
                    this.media = media;
                    this._onStateChanged = onStateChanged;
                    this.buttons = buttons;
                    this._updateStateBindingMethod = this.updateState.bind(this);
                    this._mediaBindings = WinJS.Binding.bind(this.media, {
                        serviceId: this._updateStateBindingMethod, hydrated: this._updateStateBindingMethod
                    });
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn).bind("isSignedIn", this._updateStateBindingMethod);
                    if (this._options.updateOnAppVisibilityChange)
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).bind("isAppVisible", this._updateStateBindingMethod);
                    if (this._options.updateOnAppSnappedModeChange)
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).bind("isSnapped", this._updateStateBindingMethod);
                    this._eventProvider.traceMediaStateEngine_Initialized(this.media.mediaType, this.media.serviceId, this.media.libraryId);
                    this.bind("currentAppbarActions", function appbarActionsChanged() {
                        if (!this._bindingsComplete)
                            return;
                        this._eventProvider.traceMediaStateEngine_ActionsChanged(this.media.mediaType, this.media.serviceId, this.media.libraryId)
                    }.bind(this));
                    this._bindingsComplete = true;
                    this.updateState()
                }, unload: function unload() {
                    this._unloaded = true;
                    if (this._updateStateBindingMethod) {
                        if (this._mediaBindings) {
                            this._mediaBindings.cancel();
                            this._mediaBindings = null
                        }
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn).unbind("isSignedIn", this._updateStateBindingMethod);
                        if (this._options.updateOnAppVisibilityChange)
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).unbind("isAppVisible", this._updateStateBindingMethod);
                        if (this._options.updateOnAppSnappedModeChange)
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).unbind("isSnapped", this._updateStateBindingMethod);
                        this._updateStateBindingMethod = null
                    }
                    if (this._uniqueListenerId) {
                        var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                        fileTransferService.unregisterListener(this._uniqueListenerId);
                        this._uniqueListenerId = null
                    }
                    this.currentButtons = null;
                    this.currentAppbarActions = [];
                    this._eventProvider.traceMediaStateEngine_Unloaded(this.media && this.media.mediaType, this.media && this.media.serviceId, this.media && this.media.libraryId)
                }, updateState: function updateState() {
                    if (!this.media || !this._bindingsComplete || this._unloaded || this.suspendStateChanges)
                        return;
                    this._eventProvider.traceMediaStateEngine_UpdateState(this.media.mediaType, this.media.serviceId, this.media.libraryId);
                    this._fireStateChanged()
                }, _fireCurrentButtonsChanged: function _fireCurrentButtonsChanged() {
                    if (this.eventProxy && this.eventProxy.dispatchEvent)
                        this.eventProxy.dispatchEvent("currentButtonsChanged", {
                            sender: this, value: this.currentButtons
                        })
                }, _fireStateChanged: function _fireStateChanged() {
                    var stateChangedPromise = WinJS.Promise.wrap();
                    if (this._onStateChanged)
                        stateChangedPromise = this._onStateChanged(this._cachedState) || stateChangedPromise;
                    var fireStateChangedPromise = function _onStateChanged_complete(requestButtons) {
                            if (this._unloaded)
                                return;
                            var subActionsChanged;
                            var newButtons = (requestButtons && requestButtons.smartButtons) || requestButtons;
                            var newActions = requestButtons && requestButtons.appbarActions;
                            if (this._lastFireStateChangedPromise === fireStateChangedPromise) {
                                if (!newButtons)
                                    this.currentButtons = [];
                                else if (newButtons.length !== this.currentButtons.length)
                                    this.currentButtons = newButtons;
                                else
                                    for (var i = 0; i < newButtons.length; i++)
                                        if (newButtons[i] !== this.currentButtons[i]) {
                                            this.currentButtons = newButtons;
                                            break
                                        }
                                subActionsChanged = !MS.Entertainment.UI.Actions.ActionArray.areSubActionsEqual(newActions, this.currentAppbarActions);
                                if (!newActions)
                                    this.currentAppbarActions = [];
                                else if (newActions.length !== this.currentAppbarActions.length || subActionsChanged)
                                    this.currentAppbarActions = newActions;
                                else
                                    for (var i = 0; i < newActions.length; i++)
                                        if (newActions[i] !== this.currentAppbarActions[i]) {
                                            this.currentAppbarActions = newActions;
                                            break
                                        }
                                if (requestButtons && this.loading)
                                    this.loading = false
                            }
                        }.bind(this);
                    this._lastFireStateChangedPromise = fireStateChangedPromise;
                    stateChangedPromise.then(fireStateChangedPromise)
                }
        }, {
            currentAppbarActions: null, media: null, loading: true
        }, {getSelectionStateFromMediaItem: function getSelectionStateFromMediaItem(mediaItem) {
                return null
            }})})
})()
