/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Components/Playback/controls/playbackcontrol.js", "/Framework/corefx.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {TransportControls: MS.Entertainment.UI.Framework.defineUserControl("Controls/TransportControls/TransportControls.html#transportControlsTemplate", function(element, options) {
        if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.volumeService)) {
            var volumeControllerService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.volumeService);
            this._volumeControllerService = volumeControllerService;
            this._volumeStateBinds = WinJS.Binding.bind(volumeControllerService, {
                volume: this._onVolumeValueChange.bind(this), mute: this._onMuteStateChange.bind(this), isAudioEndpointAvailable: this._onAudioEndpointChange.bind(this)
            })
        }
    }, {
        _initialized: false, _messageTimeout: null, _sessionMgr: null, _uiStateService: null, _bindings: null, _eventHandlers: null, _deferredUpdateTimer: null, _isNowPlayingControls: false, _appBarPlaybackOptionsMenu: null, playbackOptionsActions: null, _volumeStateBinds: null, focusPlayOnInitialize: false, _playToStateBinds: null, _volumeControllerService: null, initialize: function initialize() {
                this._sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                this._uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                var localShuffleAction = new MS.Entertainment.UI.ToolbarAction;
                localShuffleAction.id = "appBarTransportControlsShuffle";
                localShuffleAction.automationId = MS.Entertainment.UI.AutomationIds.transportShuffle;
                localShuffleAction.title = String.load(String.id.IDS_TRANSPORT_CONTROLS_SHUFFLE_OFF_BUTTON);
                localShuffleAction.icon = WinJS.UI.AppBarIcon.shuffle;
                localShuffleAction.executed = function shuffleExecuted() {
                    this.shuffleButtonClick()
                }.bind(this);
                localShuffleAction.isPlaybackOption = true;
                localShuffleAction.forceTitleChange = true;
                localShuffleAction.addProperty("isVisible", false);
                localShuffleAction.ariaLabelOverride = String.load(String.id.IDS_TRANSPORT_CONTROLS_SHUFFLE_BUTTON);
                localShuffleAction.enableAriaPressedOverride = true;
                localShuffleAction.addProperty("ariaPressed", false);
                localShuffleAction.isToggleAction = true;
                this._shuffleAction = localShuffleAction;
                var localRepeatAction = new MS.Entertainment.UI.ToolbarAction;
                localRepeatAction.id = "appBarTransportControlsRepeat";
                localRepeatAction.automationId = MS.Entertainment.UI.AutomationIds.transportRepeat;
                localRepeatAction.title = String.load(String.id.IDS_TRANSPORT_CONTROLS_REPEAT_OFF_BUTTON);
                localRepeatAction.icon = WinJS.UI.AppBarIcon.refresh;
                localRepeatAction.executed = function repeatExecuted() {
                    this.repeatButtonClick()
                }.bind(this);
                localRepeatAction.isPlaybackOption = true;
                localRepeatAction.forceTitleChange = true;
                localRepeatAction.addProperty("isVisible", true);
                localRepeatAction.ariaLabelOverride = String.load(String.id.IDS_TRANSPORT_CONTROLS_REPEAT_BUTTON);
                localRepeatAction.enableAriaPressedOverride = true;
                localRepeatAction.addProperty("ariaPressed", false);
                localRepeatAction.isToggleAction = true;
                this._repeatAction = localRepeatAction;
                var localSkipBackAction = new MS.Entertainment.UI.ToolbarAction;
                localSkipBackAction.id = "appBarTransportControlsPrevious";
                localSkipBackAction.automationId = MS.Entertainment.UI.AutomationIds.transportSkipBack;
                localSkipBackAction.title = String.load(String.id.IDS_TRANSPORT_CONTROLS_PREVIOUS_BUTTON);
                localSkipBackAction.icon = WinJS.UI.AppBarIcon.previous;
                localSkipBackAction.executed = function skipBackExecuted() {
                    this.skipBackButtonClick()
                }.bind(this);
                localSkipBackAction.canExecute = function skipBackCanExecute(parameter) {
                    return !this.isDisabled && !this.skipBackDisabled
                }.bind(this);
                this._skipBackAction = localSkipBackAction;
                var localSkipBackHoldAction = new MS.Entertainment.UI.ToolbarAction;
                localSkipBackHoldAction.id = "appBarTransportControlsPreviousHold";
                localSkipBackHoldAction.automationId = MS.Entertainment.UI.AutomationIds.transportSkipBackHold;
                localSkipBackHoldAction.canExecute = function skipBackHoldCanExecute(parameter) {
                    return !this.isDisabled
                }.bind(this);
                localSkipBackHoldAction.executed = this.skipBackButtonHold.bind(this);
                this._skipBackHoldAction = localSkipBackHoldAction;
                var localPlayAction = new MS.Entertainment.UI.ToolbarAction;
                localPlayAction.id = "appBarTransportControlsPlay";
                localPlayAction.automationId = MS.Entertainment.UI.AutomationIds.transportPlay;
                localPlayAction.title = String.load(MS.Entertainment.UI.Controls.TransportControls.playButtonStringId);
                localPlayAction.icon = MS.Entertainment.UI.Icon.play;
                localPlayAction.executed = function playExecuted() {
                    this.playPauseButtonClick()
                }.bind(this);
                localPlayAction.canExecute = function playCanExecute(parameter) {
                    return !this.isDisabled
                }.bind(this);
                this._playAction = localPlayAction;
                var localPauseAction = new MS.Entertainment.UI.ToolbarAction;
                localPauseAction.id = "appBarTransportControlsPause";
                localPauseAction.automationId = MS.Entertainment.UI.AutomationIds.transportPause;
                localPauseAction.title = String.load(String.id.IDS_TRANSPORT_CONTROLS_PAUSE_BUTTON);
                localPauseAction.icon = WinJS.UI.AppBarIcon.pause;
                localPauseAction.executed = function pauseExecuted() {
                    this.pauseButtonClick()
                }.bind(this);
                localPauseAction.canExecute = function pauseCanExecute(parameter) {
                    return !this.isDisabled
                }.bind(this);
                this._pauseAction = localPauseAction;
                this._playPauseAction = this._playAction;
                if (this._playPauseButton)
                    this.bind("playVisible", function _updatePlayPause() {
                        if (this.playVisible) {
                            this._playPauseAction = this._playAction;
                            this._playPauseButton.text = this._playAction.title
                        }
                        else {
                            this._playPauseAction = this._pauseAction;
                            this._playPauseButton.text = this._pauseAction.title
                        }
                    }.bind(this));
                var localSkipForwardAction = new MS.Entertainment.UI.ToolbarAction;
                localSkipForwardAction.id = "appBarTransportControlsForward";
                localSkipForwardAction.automationId = MS.Entertainment.UI.AutomationIds.transportSkipForward;
                localSkipForwardAction.title = String.load(String.id.IDS_TRANSPORT_CONTROLS_NEXT_BUTTON);
                localSkipForwardAction.icon = WinJS.UI.AppBarIcon.next;
                localSkipForwardAction.executed = function skipForwardExecuted() {
                    this.skipForwardButtonClick()
                }.bind(this);
                localSkipForwardAction.canExecute = function skipForwardCanExecute(parameter) {
                    return !this.isDisabled && !this.skipForwardDisabled
                }.bind(this);
                this._skipForwardAction = localSkipForwardAction;
                var localSkipForwardHoldAction = new MS.Entertainment.UI.ToolbarAction;
                localSkipForwardHoldAction.id = "appBarTransportControlsForwardHold";
                localSkipForwardHoldAction.automationId = MS.Entertainment.UI.AutomationIds.transportSkipForwardHold;
                localSkipForwardHoldAction.canExecute = function skipForwardHoldCanExecute(parameter) {
                    return !this.isDisabled
                }.bind(this);
                localSkipForwardHoldAction.executed = this.skipForwardButtonHold.bind(this);
                this._skipForwardHoldAction = localSkipForwardHoldAction;
                this._initializeVolumeAction();
                var localSmartGlassAction = new MS.Entertainment.UI.ToolbarAction;
                localSmartGlassAction.id = "appBarTransportControlsSmartGlass";
                localSmartGlassAction.automationId = MS.Entertainment.UI.AutomationIds.transportSmartGlass;
                localSmartGlassAction.title = String.load(String.id.IDS_TRANSPORT_CONTROLS_XBOX_CONTROLLER_BUTTON);
                localSmartGlassAction.icon = MS.Entertainment.UI.Icon.game;
                localSmartGlassAction.executed = function SmartGlassExecuted() {
                    this.smartGlassButtonClick()
                }.bind(this);
                localSmartGlassAction.canExecute = function SmartGlassCanExecute(parameter) {
                    return !this.smartGlassDisabled
                }.bind(this);
                this._smartGlassAction = localSmartGlassAction;
                var localXboxAction = new MS.Entertainment.UI.ToolbarAction;
                localXboxAction.id = "appBarTransportControlsXbox";
                localXboxAction.automationId = MS.Entertainment.UI.AutomationIds.transportXbox;
                localXboxAction.icon = MS.Entertainment.UI.Icon.takeFromXbox;
                localXboxAction.adornerRing = MS.Entertainment.UI.Icon.takeFromXboxAdornerAppbar;
                localXboxAction.adornerMode = MS.Entertainment.UI.Controls.IconButtonMode.Custom;
                localXboxAction.hideDefaultRing = true;
                localXboxAction.executed = function XboxExecuted() {
                    this.xboxButtonClick()
                }.bind(this);
                localXboxAction.canExecute = function XboxCanExecute(parameter) {
                    return !this.xboxDisabled
                }.bind(this);
                this._xboxAction = localXboxAction;
                var localClosedCaptionAction = new MS.Entertainment.UI.ToolbarAction;
                localClosedCaptionAction.id = "playbackOptionsClosedCaption";
                localClosedCaptionAction.automationId = MS.Entertainment.UI.AutomationIds.transportClosedCaption;
                localClosedCaptionAction.title = String.load(String.id.IDS_TRANSPORT_CONTROLS_CLOSED_CAPTION_LABEL);
                localClosedCaptionAction.icon = MS.Entertainment.UI.Icon.play;
                localClosedCaptionAction.isComboPlaybackOption = true;
                localClosedCaptionAction.addProperty("isComboBoxEnabled", false);
                localClosedCaptionAction.addProperty("availableLanguages", []);
                localClosedCaptionAction.addProperty("selectedIndex", 0);
                localClosedCaptionAction.addProperty("isVisible", false);
                localClosedCaptionAction.currentPlayingMediaInstance = 0;
                this._closedCaptionAction = localClosedCaptionAction;
                if (!this._isNowPlayingControls) {
                    this.playbackOptionsActions = [];
                    this.playbackOptionsActions.unshift({action: this._closedCaptionAction});
                    this.playbackOptionsActions.unshift({action: this._repeatAction});
                    this.playbackOptionsActions.unshift({action: this._shuffleAction});
                    this._createPlaybackOptionsMenu()
                }
                this.bind("playbackSession", this._playbackSessionChanged.bind(this));
                this._initialized = true;
                this._updateStates();
                if (this.focusPlayOnInitialize && this._playPauseButton) {
                    var playPauseIconButton = this._playPauseButton.domElement.querySelector(".iconButton");
                    if (playPauseIconButton)
                        MS.Entertainment.UI.Framework.focusElement(playPauseIconButton);
                    else
                        MS.Entertainment.UI.Controls.fail("Expected an iconButton child beneath playPause control")
                }
            }, _initializeVolumeAction: function _initializeVolumeAction() {
                if (!MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.volumeService))
                    return;
                var localVolumeAction = new MS.Entertainment.UI.ToolbarAction;
                localVolumeAction.id = "appBarTransportControlsVolume";
                localVolumeAction.automationId = MS.Entertainment.UI.AutomationIds.transportVolume;
                if (this._volumeControllerService.isAudioEndpointAvailable) {
                    if (this._volumeControllerService.mute) {
                        localVolumeAction.title = String.load(String.id.IDS_TRANSPORT_CONTROLS_VOLUME_MUTE_BUTTON);
                        localVolumeAction.icon = WinJS.UI.AppBarIcon.mute
                    }
                    else {
                        var formattedValue = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber.format(Math.round(this._volumeControllerService.volume * 100));
                        localVolumeAction.title = String.load(String.id.IDS_TRANSPORT_CONTROLS_VOLUME_BUTTON).format(formattedValue);
                        localVolumeAction.icon = WinJS.UI.AppBarIcon.volume
                    }
                    localVolumeAction.canExecute = function volumeActionCanExecute(parameter) {
                        if (this.playbackSession && this.playbackSession.isRemoteSessionRunning) {
                            this.volumeDisabled = true;
                            return false
                        }
                        else {
                            this.volumeDisabled = false;
                            return true
                        }
                    }.bind(this);
                    localVolumeAction.executed = function volumeButtonExecuted() {
                        this.volumeButtonClick()
                    }.bind(this)
                }
                else {
                    localVolumeAction.title = String.load(String.id.IDS_TRANSPORT_CONTROLS_DISABLED_VOLUME_BUTTON);
                    localVolumeAction.icon = MS.Entertainment.UI.Icon.volumeDisabled;
                    localVolumeAction.canExecute = function volumeActionCanExecute(parameter) {
                        return false
                    }.bind(this)
                }
                this._volumeAction = localVolumeAction;
                var localVolumeHoldAction = new MS.Entertainment.UI.ToolbarAction;
                localVolumeHoldAction.id = "appBarTransportControlsVolumeHold";
                localVolumeHoldAction.automationId = MS.Entertainment.UI.AutomationIds.transportVolumeHold;
                localVolumeHoldAction.canExecute = function volumeHoldCanExecute(parameter) {
                    return true
                }.bind(this);
                localVolumeHoldAction.executed = this.volumeButtonHold.bind(this);
                this._volumeHoldAction = localVolumeHoldAction
            }, _onVolumeValueChange: function volumeValueChange(newValue) {
                var volumeValue = Math.round(newValue * 100);
                if (this._volumeAction && this._volumeControllerService.isAudioEndpointAvailable)
                    this._updateTitleOnVolumeButton(volumeValue)
            }, _onMuteStateChange: function muteStateChange(newState) {
                var muteState = newState;
                if (this._volumeAction && this._volumeControllerService.isAudioEndpointAvailable)
                    if (muteState) {
                        this._volumeButton.icon = WinJS.UI.AppBarIcon.mute;
                        this._volumeAction.title = String.load(String.id.IDS_TRANSPORT_CONTROLS_VOLUME_MUTE_BUTTON)
                    }
                    else {
                        this._volumeButton.icon = WinJS.UI.AppBarIcon.volume;
                        var volumeValue = Math.round(this._volumeControllerService.volume * 100);
                        this._updateTitleOnVolumeButton(volumeValue)
                    }
            }, _playToStateChanged: function _playToStateChanged(newState) {
                if (this._volumeAction)
                    this._volumeAction.requeryCanExecute()
            }, _onAudioEndpointChange: function audioEndpointChange(newState) {
                this._initializeVolumeAction()
            }, _updateTitleOnVolumeButton: function updateTitleOnVolumeButton(volumeValue) {
                var formattedValue = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber.format(volumeValue);
                this._volumeAction.title = String.load(String.id.IDS_TRANSPORT_CONTROLS_VOLUME_BUTTON).format(formattedValue)
            }, isVolumeServiceRequired: function isVolumeServiceRequired() {
                return (MS.Entertainment.Utilities.isApp1)
            }, showMessage: function showMessage(messageTitle, messageText, showDuration, showAppBar) {
                this.messageVisible = true;
                this.messageTitle = messageTitle;
                this.messageSubTitle = messageText;
                if (this._messageTimeout) {
                    this._messageTimeout.cancel();
                    this._messageTimeout = null
                }
                if (showAppBar)
                    MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar).show();
                if (showDuration)
                    this._messageTimeout = WinJS.Promise.timeout(showDuration).then(function _delay() {
                        this.clearMessage()
                    }.bind(this))
            }, clearMessage: function clearMessage() {
                this.messageVisible = false;
                this.messageTitle = "";
                this.messageSubTitle = ""
            }, _detachBindings: function _detachBindings() {
                if (this._bindings) {
                    this._bindings.cancel();
                    this._bindings = null
                }
                if (this._eventHandlers) {
                    this._eventHandlers.cancel();
                    this._eventHandlers = null
                }
            }, unload: function unload() {
                if (this._deferredUpdateTimer) {
                    this._deferredUpdateTimer.cancel();
                    this._deferredUpdateTimer = null
                }
                if (this._volumeStateBinds) {
                    this._volumeStateBinds.cancel();
                    this._volumeStateBinds = null
                }
                this._detachBindings();
                this.unbind("playbackSession");
                this.unbind("volumeAction");
                MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
            }, _createPlaybackOptionsMenu: function _createPlaybackOptionsMenu() {
                var container = document.createElement("div");
                this._appBarPlaybackOptionsMenu = new MS.Entertainment.UI.Controls.PlaybackOptionsList(this._playbackOptionsContainer.appendChild(container), {_overflowTitleOverride: String.load(String.id.IDS_TRANSPORT_CONTROLS_PLAYBACK_OPTIONS_BUTTON)});
                container.setAttribute("data-win-control", "MS.Entertainment.UI.Controls.ActionList");
                this.bind("playbackOptionsActions", function _updateActions() {
                    this._appBarPlaybackOptionsMenu.items = this.playbackOptionsActions
                }.bind(this));
                this._appBarPlaybackOptionsMenu.containerWidth = 100;
                this._appBarPlaybackOptionsMenu._maxItems = 1;
                if (this._appBarPlaybackOptionsMenu._getOverflowAction().action)
                    this._appBarPlaybackOptionsMenu._getOverflowAction().action.executed = this._appBarPlaybackOptionsMenu.executeActionUpdateCombo
            }, _applyBindings: function _applyBindings() {
                if (this._unloaded)
                    return;
                this._detachBindings();
                var mediaStateChanged = this._mediaStateChanged.bind(this);
                var updateStates = this._updateStates.bind(this);
                this._eventHandlers = MS.Entertainment.Utilities.addEvents(this.playbackSession, {
                    currentTitleIdChanged: mediaStateChanged, playerStateChanged: this._playerStateChanged.bind(this), currentMediaChanged: mediaStateChanged, currentTransportStateChanged: mediaStateChanged, shuffleChanged: mediaStateChanged, repeatChanged: mediaStateChanged, canSkipBackwardChanged: mediaStateChanged, canSkipForwardChanged: mediaStateChanged, playbackRateChanged: mediaStateChanged, canControlMediaChanged: mediaStateChanged, canTransferChanged: mediaStateChanged
                });
                this._playerStateChanged();
                this._bindings = WinJS.Binding.bind(this, {
                    _uiStateService: {
                        primarySessionId: mediaStateChanged, isSnapped: updateStates, nowPlayingTileVisible: updateStates
                    }, _sessionMgr: {lrcSession: {sessionState: this._lrcStateChanged.bind(this)}}, playbackSession: {isRemoteSessionRunning: this._playToStateChanged.bind(this)}
                })
            }, _playbackSessionChanged: function _playbackSessionChanged() {
                if (this._unloaded)
                    return;
                if (this.playbackSession)
                    this._applyBindings();
                this._mediaStateChanged()
            }, _playerStateChanged: function _playerStateChanged(e) {
                this._updateStates()
            }, _mediaStateChanged: function _mediaStateChanged(e) {
                this._updateStates()
            }, _lrcStateChanged: function _lrcStateChanged(newVal, oldVal) {
                this._updateStates();
                this._getXboxEventProvider().traceXboxTransportControlsLRCStateChange(newVal, oldVal);
                WinJS.Promise.timeout().then(function transportControls_lrcStateChangedTelemetry() {
                    MS.Entertainment.Utilities.Telemetry.logCompanionTransportControlsStateChange(newVal, oldVal)
                })
            }, _getXboxEventProvider: (function _transportControls_getXboxEventProvider_closure() {
                var eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Xbox;
                return function _transportControls_getXboxEventProvider() {
                        return eventProvider
                    }
            })(), _updateStates: function _updateStates() {
                if (this._deferredUpdateTimer)
                    return;
                this._deferredUpdateTimer = WinJS.Promise.timeout(MS.Entertainment.Platform.PlaybackHelpers.deferredUpdateTimeout).then(this._updateStatesDeferred.bind(this))
            }, _updateStatesDeferred: function _updateStatesDeferred() {
                this._deferredUpdateTimer = null;
                if (this._initialized && this.playbackSession) {
                    var isPlaylist = false;
                    var showNowPlayingSkipAndVolumeButtons = this.playbackSession === this._sessionMgr.lrcSession || (this.playbackSession === this._sessionMgr.nowPlayingSession);
                    this.nowPlayingSkipBackVisible = showNowPlayingSkipAndVolumeButtons;
                    this.nowPlayingSkipForwardVisible = showNowPlayingSkipAndVolumeButtons;
                    this.nowPlayingVolumeVisible = (this.isVolumeServiceRequired && showNowPlayingSkipAndVolumeButtons);
                    var localPlayToXboxFeatureEnabled = MS.Entertainment.Platform.PlaybackHelpers.isPlayToXboxFeatureEnabled(this.playbackSession.currentMedia);
                    if (!this.playbackSession.currentMedia) {
                        this.isDisabled = true;
                        this.playVisible = true;
                        this.skipBackDisabled = true;
                        this.skipForwardDisabled = true;
                        this.playbackLabelId = MS.Entertainment.UI.Controls.TransportControls.playButtonStringId
                    }
                    else {
                        if (this.playbackSession.targetTransportState === MS.Entertainment.Platform.Playback.TransportState.unInitialize || this.playbackSession.targetTransportState === MS.Entertainment.Platform.Playback.TransportState.paused || this.playbackSession.targetTransportState === MS.Entertainment.Platform.Playback.TransportState.stopped || this.playbackSession.targetTransportState === MS.Entertainment.Platform.Playback.TransportState.buffering || (this.playbackSession.targetTransportState === MS.Entertainment.Platform.Playback.TransportState.playing && this.playbackSession.playbackRate !== 1) || this.playbackSession.playerState === MS.Entertainment.Platform.Playback.PlayerState.error) {
                            this.playVisible = true;
                            this.playbackLabelId = MS.Entertainment.UI.Controls.TransportControls.playButtonStringId
                        }
                        else {
                            this.playVisible = false;
                            this.playbackLabelId = String.id.IDS_TRANSPORT_CONTROLS_PAUSE_BUTTON
                        }
                        if (this.playbackSession.targetTransportState !== MS.Entertainment.Platform.Playback.TransportState.unInitialize && this.playbackSession.targetTransportState !== this.playbackSession.currentTransportState && this.playbackSession.playerState !== MS.Entertainment.Platform.Playback.PlayerState.error)
                            this.isDisabled = true;
                        else
                            this.isDisabled = !this.playbackSession.canControlMedia;
                        this.skipBackDisabled = this.isDisabled || (!this.playbackSession.canSkipBackward && isPlaylist);
                        this.skipForwardDisabled = this.isDisabled || (!this.playbackSession.canSkipForward && isPlaylist);
                        var currentPlayingMediaInstance = -1;
                        if (this.playbackSession._iPlayback && this.playbackSession._iPlayback.currentMedia && this.playbackSession._iPlayback.currentMedia.mediaInstanceId)
                            currentPlayingMediaInstance = this.playbackSession._iPlayback.currentMedia.mediaInstanceId;
                        if (!this._isNowPlayingControls && this._closedCaptionAction && this._closedCaptionAction.currentPlayingMediaInstance !== currentPlayingMediaInstance) {
                            this._closedCaptionAction.currentPlayingMediaInstance = currentPlayingMediaInstance;
                            this._closedCaptionAction.availableLanguages = [];
                            this._closedCaptionAction.isComboBoxEnabled = false;
                            if (this.playbackSession.currentMedia.closedCaptionFiles) {
                                var numTotalCaptionFiles = this.playbackSession.currentMedia.closedCaptionFiles.length;
                                var addOffLanguageOption = true;
                                var that = this;
                                this.playbackSession.currentMedia.closedCaptionFiles.forEach(function extractCaptionFiles(file) {
                                    var ccFileMediaInstanceID = ("{" + file.mediaInstanceId + "}").toUpperCase();
                                    if (ccFileMediaInstanceID === currentPlayingMediaInstance) {
                                        if (addOffLanguageOption) {
                                            that._closedCaptionAction.availableLanguages.push({
                                                name: "Off", lcid: 0
                                            });
                                            addOffLanguageOption = false
                                        }
                                        var foundLcid = false;
                                        for (var i = 0; i < that._closedCaptionAction.availableLanguages.length; i++)
                                            if (that._closedCaptionAction.availableLanguages[i].lcid === file.lcid) {
                                                foundLcid = true;
                                                break
                                            }
                                        if (!foundLcid)
                                            that._closedCaptionAction.availableLanguages.push(file)
                                    }
                                });
                                this._closedCaptionAction.isComboBoxEnabled = this._closedCaptionAction.availableLanguages.length > 0 ? true : false;
                                var turnCaptionsOff = true;
                                if (this._closedCaptionAction.isComboBoxEnabled) {
                                    var settingsStorage = Windows.Storage.ApplicationData.current.localSettings;
                                    var foundPreferredLanguage = false;
                                    var englishLcidIndex = 0;
                                    var ENGLISH_LCID = "1033";
                                    if (settingsStorage.values["preferredCaptionLanguage"]) {
                                        for (var i = 0; i < this._closedCaptionAction.availableLanguages.length; i++) {
                                            if (!foundPreferredLanguage && this._closedCaptionAction.availableLanguages[i].lcid === settingsStorage.values["preferredCaptionLanguage"]) {
                                                this.playbackSession.ccLcid = settingsStorage.values["preferredCaptionLanguage"];
                                                this.playbackSession.closedCaptionsOn = true;
                                                foundPreferredLanguage = true;
                                                turnCaptionsOff = false
                                            }
                                            if (!englishLcidIndex && this._closedCaptionAction.availableLanguages[i].lcid === ENGLISH_LCID)
                                                englishLcidIndex = i
                                        }
                                        if (!foundPreferredLanguage && englishLcidIndex) {
                                            this.playbackSession.ccLcid = ENGLISH_LCID;
                                            this.playbackSession.closedCaptionsOn = true;
                                            turnCaptionsOff = false
                                        }
                                    }
                                }
                                if (turnCaptionsOff)
                                    this.playbackSession.closedCaptionsOn = false
                            }
                        }
                    }
                    this.xboxConnected = false;
                    this.xboxJoined = this.xboxConnected && (this.playbackSession === this._sessionMgr.lrcSession);
                    this.dlnaTransferAvailable = (this.playbackSession.currentMedia && !this.playbackSession.currentMedia.hasServiceId);
                    this.xboxTransferAvailable = (this.playbackSession.canTransfer && localPlayToXboxFeatureEnabled);
                    if (this._sessionMgr.primarySession.sessionId === MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.remoteLRC)
                        this._xboxAction.title = String.load(String.id.IDS_TRANSPORT_CONTROLS_PLAY_HERE_BUTTON);
                    else if (this.dlnaTransferAvailable)
                        this._xboxAction.title = String.load(String.id.IDS_XBOX_PLAY_TO_DEVICE);
                    else
                        this._xboxAction.title = String.load(String.id.IDS_TRANSPORT_CONTROLS_PLAY_ON_XBOX_BUTTON)
                }
                this.anyTransferAvailable = this.dlnaTransferAvailable || this.xboxTransferAvailable;
                var companionTransferAvailable = this.anyTransferAvailable;
                this.xboxDisabled = !this.anyTransferAvailable || this.isDisabled;
                this.xboxVisible = false;
                this.smartGlassVisible = false;
                this.smartGlassDisabled = true;
                this.volumeVisible = (this.isVolumeServiceRequired && !MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isSnapped);
                this._updateIcons();
                if (this._appBarPlaybackOptionsMenu && this._appBarPlaybackOptionsMenu._getOverflowAction().action) {
                    this._appBarPlaybackOptionsMenu._getOverflowAction().action.isEnabled = !this.isDisabled;
                    WinJS.Utilities.removeClass(this._playbackOptionsContainer, "removeFromDisplay")
                }
                if (this._appBarPlaybackOptionsMenu && this._appBarPlaybackOptionsMenu._getOverflowAction().action)
                    WinJS.Utilities.addClass(this._playbackOptionsContainer, "removeFromDisplay");
                this._closedCaptionAction.isVisible = false;
                this._shuffleAction.isVisible = false;
                this._repeatAction.isVisible = false;
                if (this._initialized) {
                    this._playAction.requeryCanExecute();
                    this._pauseAction.requeryCanExecute();
                    this._skipBackAction.requeryCanExecute();
                    this._skipForwardAction.requeryCanExecute();
                    this._xboxAction.requeryCanExecute();
                    this._smartGlassAction.requeryCanExecute();
                    if (this._volumeAction)
                        this._volumeAction.requeryCanExecute()
                }
            }, _updateIcons: function _updateIcons() {
                if (this._xboxAction) {
                    if (this.xboxJoined) {
                        this._xboxAction.icon = MS.Entertainment.UI.Icon.takeFromXbox;
                        this._xboxAction.adornerRing = MS.Entertainment.UI.Icon.takeFromXboxAdornerAppbar
                    }
                    else if (this.xboxJoined && this.xboxTransferAvailable) {
                        this._xboxAction.icon = MS.Entertainment.UI.Icon.sendToXbox;
                        this._xboxAction.adornerRing = MS.Entertainment.UI.Icon.sendToXboxAdornerAppbar
                    }
                    else if (this.dlnaTransferAvailable) {
                        this._xboxAction.icon = MS.Entertainment.UI.Icon.sendToXbox;
                        this._xboxAction.adornerRing = MS.Entertainment.UI.Icon.sendToXboxAdornerAppbar;
                        this._xboxAction.title = String.load(String.id.IDS_XBOX_PLAY_TO_DEVICE)
                    }
                    else {
                        this._xboxAction.icon = MS.Entertainment.UI.Icon.sendToXbox;
                        this._xboxAction.adornerRing = MS.Entertainment.UI.Icon.sendToXboxAdornerAppbar;
                        this._xboxAction.title = String.load(String.id.IDS_TRANSPORT_CONTROLS_PLAY_ON_XBOX_BUTTON)
                    }
                    if (this._xboxButton)
                        this._xboxButton._updateAction()
                }
            }, xboxButtonClick: function xboxButtonClick() {
                if (!this.visibility || !this.playbackSession)
                    return;
                if (this.xboxJoined && this.xboxTransferAvailable) {
                    this.playbackSession.targetTransportState = MS.Entertainment.Platform.Playback.TransportState.stopped;
                    MS.Entertainment.Platform.PlaybackHelpers.playFromXbox(this.playbackSession.currentMedia, Math.round(this.playbackSession.currentPosition))
                }
                else if (this.xboxTransferAvailable) {
                    this.playbackSession.targetTransportState = MS.Entertainment.Platform.Playback.TransportState.stopped;
                    MS.Entertainment.Platform.PlaybackHelpers.playToXbox(this.playbackSession.currentMedia, null, Math.round(this.playbackSession.currentPosition))
                }
                else
                    try {
                        Windows.Media.PlayTo.PlayToManager.showPlayToUI()
                    }
                    catch(ex) {
                        MS.Entertainment.UI.Debug.writeLine("Failed to show devices charm (may be disabled?): " + ex)
                    }
            }, smartGlassButtonClick: function smartGlassButtonClick() {
                if (!this.visibility || !this.playbackSession)
                    return;
                this.smartGlassActive = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.xboxControls).visibility;
                if (this.smartGlassActive)
                    MS.Entertainment.UI.Controls.XBoxControls.hide();
                else
                    MS.Entertainment.UI.Controls.XBoxControls.show()
            }, moreButtonClick: function moreButtonClick() {
                this._updateStates()
            }, playButtonClick: function playButtonClick() {
                MS.Entertainment.Utilities.Telemetry.logPlayClicked(this.domElement.className);
                if (this._playPauseButton) {
                    this._playPauseAction = this._pauseAction;
                    this._playPauseButton.text = this._pauseAction.text;
                    this.playVisible = false
                }
                if (this.playbackSession.currentMedia !== null && this.playbackSession.currentOrdinal === null)
                    this.playbackSession.activate(document.createElement("div"));
                else
                    this.playbackSession.targetTransportState = MS.Entertainment.Platform.Playback.TransportState.playing;
                if (this.playbackSession.targetTransportState !== MS.Entertainment.Platform.Playback.TransportState.unInitialize)
                    this._updateStates()
            }, pauseButtonClick: function pauseButtonClick() {
                MS.Entertainment.Utilities.Telemetry.logPauseClicked(this.domElement.className);
                if (this._playPauseButton) {
                    this._playPauseAction = this._playAction;
                    this._playPauseButton.text = this._playAction.text;
                    this.playVisible = true
                }
                this.playbackSession.targetTransportState = MS.Entertainment.Platform.Playback.TransportState.paused;
                this._updateStates()
            }, playPauseButtonClick: function playPauseButtonClick(e) {
                if (!this.visibility || !this.playbackSession)
                    return;
                if (this.playVisible)
                    this.playButtonClick();
                else
                    this.pauseButtonClick()
            }, skipForwardButtonClick: function skipForwardButtonClick(e) {
                if (!this.visibility || this.skipForwardDisabled || !this.playbackSession)
                    return;
                if (this.playbackSession === this._sessionMgr.lrcSession)
                    this.playbackSession.skipFwd();
                else {
                    var positionMs = this.playbackSession.getProperty("currentPosition");
                    this.playbackSession.seekToPosition(positionMs + 29000)
                }
                this._updateStates();
                MS.Entertainment.Utilities.Telemetry.logNextClicked(this.domElement.className)
            }, skipForwardButtonHold: function skipForwardButtonHold() {
                if (this.playbackSession)
                    this.playbackSession.fastFwd()
            }, volumeButtonClick: function volumeButtonClick(e) {
                if (!this._volumeAction.isEnabled)
                    return;
                var appBar = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar);
                appBar.sticky = true;
                var position = WinJS.Utilities.getPosition(this._volumeButton.domElement);
                var distanceFromBottom = (window.outerHeight - position.top);
                var left = (position.left >= 0 && position.width >= 0) ? (position.left + Math.round((0.5 * position.width) - 33)) + "px" : "auto";
                var top = "auto";
                var right = "auto";
                var bottom = distanceFromBottom >= 0 ? distanceFromBottom + "px" : "auto";
                var customStyle = "volumeContainer";
                if (!this._volumeOverlay) {
                    this._volumeClickActionAvailable = false;
                    this._volumeOverlay = MS.Entertainment.UI.Shell.createOverlay("MS.Entertainment.UI.Controls.VolumeBar", {}, {
                        right: right, top: top, left: left, bottom: bottom
                    });
                    this._volumeOverlay.customStyle = customStyle;
                    this._volumeOverlay.enableKeyboardLightDismiss = true;
                    this._volumeOverlay.show().done(function overlayClosed() {
                        this._volumeOverlay = null
                    }.bind(this))
                }
            }, volumeButtonHold: function volumeButtonHold() {
                return
            }, skipBackButtonClick: function skipBackButtonClick(e) {
                if (!this.visibility || this.skipBackDisabled || !this.playbackSession)
                    return;
                if (this.playbackSession === this._sessionMgr.lrcSession)
                    this.playbackSession.skipBack();
                else {
                    var positionMs = this.playbackSession.getProperty("currentPosition");
                    this.playbackSession.seekToPosition(positionMs - 15000)
                }
                this._updateStates();
                MS.Entertainment.Utilities.Telemetry.logPreviousClicked(this.domElement.className)
            }, skipBackButtonHold: function skipBackButtonHold() {
                if (this.playbackSession)
                    this.playbackSession.fastReverse()
            }, repeatButtonClick: function repeatButtonClick() {
                if (this.visibility && this.playbackSession) {
                    this.playbackSession.repeat = !this.playbackSession.repeat;
                    this._updateRepeatButton();
                    this._updateStates()
                }
            }, _updateRepeatButton: function _updateRepeatButton() {
                var sessionRepeat = this.playbackSession && this.playbackSession.repeat;
                this._repeatAction.title = sessionRepeat ? String.load(String.id.IDS_TRANSPORT_CONTROLS_REPEAT_ON_BUTTON) : String.load(String.id.IDS_TRANSPORT_CONTROLS_REPEAT_OFF_BUTTON);
                this._repeatAction.ariaPressed = sessionRepeat
            }, shuffleButtonClick: function shuffleButtonClick() {
                if (this.visibility && this.playbackSession) {
                    this.playbackSession.shuffle = !this.playbackSession.shuffle;
                    this._updateShuffleButton();
                    this._updateStates()
                }
            }, _updateShuffleButton: function _updateShuffleButton() {
                var sessionShuffle = this.playbackSession && this.playbackSession.shuffle;
                this._shuffleAction.title = sessionShuffle ? String.load(String.id.IDS_TRANSPORT_CONTROLS_SHUFFLE_ON_BUTTON) : String.load(String.id.IDS_TRANSPORT_CONTROLS_SHUFFLE_OFF_BUTTON);
                this._shuffleAction.ariaPressed = sessionShuffle
            }
    }, {
        playbackLabelId: null, playbackSession: null, isDisabled: true, playVisible: false, nowPlayingSkipBackVisible: false, nowPlayingSkipForwardVisible: false, nowPlayingVolumeVisible: false, skipBackDisabled: true, skipForwardDisabled: true, messageTitle: "", messageSubTitle: "", messageVisible: false, shuffleEnabled: false, repeatEnabled: false, moreVisible: false, smartGlassVisible: false, smartGlassDisabled: true, smartGlassActive: false, volumeVisible: true, volumeDisabled: false, xboxVisible: false, xboxDisabled: true, xboxConnected: false, xboxJoined: false, xboxTransferAvailable: false, dlnaTransferAvailable: false, anyTransferAvailable: false, _playAction: null, _pauseAction: null, _playPauseAction: null, _skipForwardAction: null, _skipForwardHoldAction: null, _smartGlassAction: null, _skipBackAction: null, _skipBackHoldAction: null, _repeatAction: null, _shuffleAction: null, _xboxAction: null, _volumeAction: null, _volumeHoldAction: null, _volumeOverlay: null, _decimalFormatter: null
    }, {
        applySelectBoxOptionTemplate: function optionTemplate(container, item) {
            container.textContent = item.name;
            container.value = item.lcid
        }, applySelectBoxChanged: function selectThingy() {
                this.domElement.addEventListener("change", function selectionChanged(e) {
                    var sessionManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    var playbackSession = sessionManager.nowPlayingSession;
                    var settingsStorage = Windows.Storage.ApplicationData.current.localSettings;
                    if (playbackSession)
                        if (e.target.selectedIndex) {
                            playbackSession.ccLcid = e.target.options[e.target.selectedIndex].value;
                            playbackSession.closedCaptionsOn = true;
                            settingsStorage.values["preferredCaptionLanguage"] = e.target.options[e.target.selectedIndex].value
                        }
                        else {
                            playbackSession.closedCaptionsOn = false;
                            settingsStorage.values.remove("preferredCaptionLanguage")
                        }
                })
            }, playButtonStringId: {get: function getPlayButtonStringId() {
                    return String.id.IDS_PLAY_BUTTON_VIDEO
                }}
    })})
