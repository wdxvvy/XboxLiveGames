/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js");
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {TouchPadControls: MS.Entertainment.UI.Framework.defineUserControl("Controls/TransportControls/TouchPadControls.html#TouchPadControlsTemplate", function(element, options) {
        this._bindingsToDetach = [];
        this._renderLoop = this._renderLoop.bind(this)
    }, {
        swipeDistanceThreshold: 20, skipDistanceThresholdSnapped: 200, skipDistanceThresholdUnSnapped: 350, suppressNavigationForFlickTimeSpan: 500, joystickPositionResetTimeSpan: 3000, mouseExperienceAutoHideTimeSpan: 5000, subnetJoystickInterval: 200, cloudJoystickInterval: 300, joystickRangeUnSnapped: 130, joystickRangeSnapped: 100, joystickDeadzoneUnSnapped: 20, joystickDeadzoneSnapped: 10, dragDirectionConfidenceFactor: 1.25, jitterSuppressDistance: 5, xboxControls: null, _sessionMgr: null, _touchX: 0, _touchY: 0, _anchorX: 0, _anchorY: 0, _touchPointWidth: 0, _anchorPointWidth: 0, _timerSuppressNavigation: null, _timerHideMouseExperience: null, _isSuppressingNavigation: false, _listenerKeyDown: null, _listenerKeyUp: null, _timerEnabled: false, _timer: null, _lastTickTime: 0, _isSubnet: false, _uiStateService: null, _lastInputTime: 0, _currentJoystickInterval: 200, _currentDirectionalControlKey: null, _joystickMode: false, _joystickModeEnabled: true, _gestureRecognizer: null, _surfacePointerHandlers: null, _gestureRecognizerHandlers: null, _longSwipesEnabled: true, _bindings: null, _TouchPointerType: 2, _PenPointerType: 3, _MousePointerType: 4, _joystickAnimationDirty: false, _switcherStateChangeHandler: null, initialize: function initialize() {
                var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                this._joystickModeEnabled = configurationManager.companion.enableControllerJoystick;
                this._longSwipesEnabled = configurationManager.companion.enableControllerLongSwipes;
                this._surfacePointerHandlers = MS.Entertainment.Utilities.addEventHandlers(this._surface, {
                    MSPointerDown: this._onPointerDown.bind(this), MSPointerUp: this._onPointerUp.bind(this), MSPointerCancel: this._onPointerUp.bind(this), MSPointerMove: this._onPointerMove.bind(this), MSPointerOver: this._onPointerOver.bind(this), MSPointerOut: this._onPointerOut.bind(this), MSHoldVisual: function(event) {
                            event.preventDefault()
                        }
                }, false);
                this._gestureRecognizer = new Windows.UI.Input.GestureRecognizer;
                this._gestureRecognizer.gestureSettings = Windows.UI.Input.GestureSettings.manipulationTranslateX | Windows.UI.Input.GestureSettings.manipulationTranslateY | Windows.UI.Input.GestureSettings.drag | Windows.UI.Input.GestureSettings.tap;
                this._surfacePointerHandlers = MS.Entertainment.Utilities.addEventHandlers(this._gestureRecognizer, {
                    manipulationstarted: this._onManipulationStarted.bind(this), manipulationupdated: this._onManipulationUpdated.bind(this), manipulationcompleted: this._onManipulationCompleted.bind(this), tapped: this._onTouchTap.bind(this)
                }, false);
                this._initNonTouchThroughButtons(this._btnB);
                this._initNonTouchThroughButtons(this._btnB2);
                this._initNonTouchThroughButtons(this._btnX);
                this._initNonTouchThroughButtons(this._btnY);
                this._initNonTouchThroughButtons(this._btnA);
                this._initNonTouchThroughButtons(this._btnRight);
                this._initNonTouchThroughButtons(this._btnLeft);
                this._initNonTouchThroughButtons(this._btnUp);
                this._initNonTouchThroughButtons(this._btnDown);
                this._uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                this._bindings = WinJS.Binding.bind(this, {
                    visibility: this._visibilityChanged.bind(this), _uiStateService: {
                            isSnapped: this._snappedStateChanged.bind(this), appBarVisible: this._appBarVisibleChanged.bind(this)
                        }
                });
                this._sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                this.playbackSession = this._sessionMgr.lrcSession;
                this._listenerKeyDown = this._onKeyDown.bind(this)
            }, unload: function unload() {
                this._detachBindings();
                this._stopTimer();
                if (this._isSuppressingNavigation) {
                    this._timerSuppressNavigation.cancel();
                    this._timerSuppressNavigation = null;
                    this._isSuppressingNavigation = false
                }
                this._safeCancelHideMouseExperience();
                this._cleanup();
                MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
            }, _switcherStateChange: function _switcherStateChange(newValue) {
                this.isSwitcherActive = newValue
            }, _detachBindings: function _detachBindings() {
                if (this._bindings)
                    this._bindings.cancel();
                if (this._surfacePointerHandlers)
                    this._surfacePointerHandlers.cancel()
            }, _startTimer: function _startTimer() {
                if (!this._timerEnabled) {
                    this._timerEnabled = true;
                    this._timerTick()
                }
            }, _stopTimer: function _startTimer() {
                if (this._timer)
                    this._timer.cancel();
                if (this._timerEnabled)
                    this._timerEnabled = false
            }, _timerTick: function _timerTick() {
                if (this._timer)
                    this._timer.cancel();
                if (!this._timerEnabled)
                    return;
                if (this._currentDirectionalControlKey && !this._isSuppressingNavigation)
                    this._sendCommand(this._currentDirectionalControlKey);
                this._lastTickTime = Date.now();
                this._timer = WinJS.Promise.timeout(this._currentJoystickInterval).then(this._timerTick.bind(this))
            }, _updateTimerInterval: function _updateTimerInterval(newInterval) {
                if (this._timer)
                    this._timer.cancel();
                var now = Date.now();
                var nextTickTime = this._lastTickTime + newInterval;
                var executeNow = nextTickTime < now;
                this._currentJoystickInterval = newInterval;
                this._timer = WinJS.Promise.timeout(executeNow ? 0 : nextTickTime - this._lastTickTime).then(this._timerTick.bind(this))
            }, _initNonTouchThroughButtons: function _initNonTouchThroughButtons(button) {
                button.addEventListener("MSPointerDown", this._onEatEvent.bind(this), true);
                button.addEventListener("MSPointerUp", this._onEatEvent.bind(this), true);
                button.addEventListener("MSPointerMove", this._onEatEvent.bind(this), true);
                button.addEventListener("MSGestureTap", this._onEatEvent.bind(this), true);
                button.addEventListener("MSInertiaStart", this._onEatEvent.bind(this), true)
            }, _onEatEvent: function _onEatEvent(event) {
                event.cancelBubble = true
            }, _detachBindings: function _detachBindings() {
                if (this._uiStateService)
                    this._uiStateService.unbind("appBarVisible", this._appBarVisibleChanged.bind(this))
            }, _appBarVisibleChanged: function _appBarVisibleChanged(newVal) {
                if (this.visibility)
                    if (newVal)
                        WinJS.Utilities.addClass(this._bottomRowButtons.domElement, "bottomRowButtonsAppBarOffsetUp");
                    else
                        WinJS.Utilities.removeClass(this._bottomRowButtons.domElement, "bottomRowButtonsAppBarOffsetUp")
            }, _snappedStateChanged: function _snappedStateChanged(newVal) {
                this._anchorPointWidth = this.touchAnchorPoint.domElement.clientWidth;
                this._touchPointWidth = this.touchPoint.domElement.clientWidth
            }, _visibilityChanged: function _visibilityChanged(newValue, oldValue) {
                if (newValue) {
                    this._surface.setActive();
                    var keyboardNavigationManager = new MS.Entertainment.Framework.KeyboardNavigationManager(this.domElement);
                    keyboardNavigationManager.focusFirstItemInContainer(this.domElement, true);
                    window.addEventListener("keydown", this._listenerKeyDown, false);
                    window.addEventListener("keyup", this._listenerKeyUp, false);
                    this._isSubnet = !!this.playbackSession && !!this.playbackSession.isUsingLocalConnection;
                    if (this._isSubnet && MS.Entertainment.Utilities.isTouchDevicePresent()) {
                        this.showTouchMessage = true;
                        this.showMousePad = false
                    }
                    else {
                        this.showTouchMessage = false;
                        this.showMousePad = true
                    }
                    this._appBarVisibleChanged(this._uiStateService.appBarVisible);
                    if (this.xboxControls) {
                        this._switcherStateChangeHandler = this._switcherStateChange.bind(this);
                        this.xboxControls.bind("isSwitcherActive", this._switcherStateChangeHandler)
                    }
                }
                else {
                    window.removeEventListener("keydown", this._listenerKeyDown, false);
                    window.removeEventListener("keyup", this._listenerKeyUp, false);
                    this._stopTimer();
                    this._cleanup()
                }
                WinJS.Promise.timeout(10).then(function _touchPadControlsVisibilityChangedTelemetry() {
                    if (newValue)
                        MS.Entertainment.Utilities.Telemetry.logCompanionTouchPadShow();
                    else if (oldValue)
                        MS.Entertainment.Utilities.Telemetry.logCompanionTouchPadHide()
                })
            }, _cleanup: function _cleanup() {
                if (this._switcherStateChangeHandler) {
                    this.xboxControls.unbind("isSwitcherActive", this._switcherStateChangeHandler);
                    this._switcherStateChangeHandler = null
                }
            }, _sendCommand: function _sendCommand(controlKey) {
                this.playbackSession.sendCommand(controlKey).then(function _onSendCommandSuccess(){}.bind(this), function _onSendCommandError(error){}.bind(this))
            }, _onKeyDown: function _onKeyDown(event) {
                if (document.activeElement !== this._surface)
                    return;
                switch (event.key) {
                    case"a":
                    case"A":
                    case"Enter":
                    case"Spacebar":
                        this.aButtonClick();
                        event.cancelBubble = true;
                        break;
                    case"b":
                    case"B":
                    case"Backspace":
                        this.bButtonClick();
                        event.cancelBubble = true;
                        break;
                    case"x":
                    case"X":
                        this.xButtonClick();
                        event.cancelBubble = true;
                        break;
                    case"y":
                    case"Y":
                        this.yButtonClick();
                        event.cancelBubble = true;
                        break;
                    case"Left":
                        this.leftButtonClick();
                        event.cancelBubble = true;
                        break;
                    case"Right":
                        this.rightButtonClick();
                        event.cancelBubble = true;
                        break;
                    case"Up":
                        this.upButtonClick();
                        event.cancelBubble = true;
                        break;
                    case"Down":
                        this.downButtonClick();
                        event.cancelBubble = true;
                        break
                }
                {}
            }, aButtonClick: function aButtonClick() {
                if (this._sessionMgr.lrcSession.isInWellKnownTitle(MS.Entertainment.Platform.LivingRoomCompanion.WellKnownTitleId.mc))
                    this._sendCommand(Microsoft.Xbox.LRC.ControlKey.padStart);
                else
                    this._sendCommand(Microsoft.Xbox.LRC.ControlKey.padA)
            }, bButtonClick: function bButtonClick() {
                if (this._sessionMgr.lrcSession.isInWellKnownTitle(MS.Entertainment.Platform.LivingRoomCompanion.WellKnownTitleId.mc))
                    this._sendCommand(Microsoft.Xbox.LRC.ControlKey.padBack);
                else
                    this._sendCommand(Microsoft.Xbox.LRC.ControlKey.padB)
            }, xButtonClick: function xButtonClick() {
                if (this._sessionMgr.lrcSession.isInWellKnownTitle(MS.Entertainment.Platform.LivingRoomCompanion.WellKnownTitleId.mc))
                    this._sendCommand(Microsoft.Xbox.LRC.ControlKey.info);
                else
                    this._sendCommand(Microsoft.Xbox.LRC.ControlKey.padX)
            }, yButtonClick: function yButtonClick() {
                this._sendCommand(Microsoft.Xbox.LRC.ControlKey.padY)
            }, rightButtonClick: function rightButtonClick() {
                this._sendCommand(Microsoft.Xbox.LRC.ControlKey.right)
            }, leftButtonClick: function leftButtonClick() {
                this._sendCommand(Microsoft.Xbox.LRC.ControlKey.left)
            }, upButtonClick: function upButtonClick() {
                this._sendCommand(Microsoft.Xbox.LRC.ControlKey.up)
            }, downButtonClick: function downButtonClick() {
                this._sendCommand(Microsoft.Xbox.LRC.ControlKey.down)
            }, _onPointerOver: function _onPointerOver(event) {
                if (this.visibility && (event.pointerType === this._PenPointerType || event.pointerType === this._MousePointerType)) {
                    this.showTouchMessage = false;
                    this.showMousePad = true
                }
            }, _onPointerOut: function _onPointerOut(event) {
                if (this.visibility && (event.pointerType === this._PenPointerType || event.pointerType === this._MousePointerType)) {
                    this._safeCancelHideMouseExperience();
                    if (this._isSubnet && MS.Entertainment.Utilities.isTouchDevicePresent()) {
                        this.showTouchMessage = true;
                        this.showMousePad = false
                    }
                    this._stopTimer()
                }
                this._lastInputTime = Date.now()
            }, _startJoystickMode: function _startJoystickMode() {
                if (this._timerSuppressNavigation) {
                    this._timerSuppressNavigation.cancel();
                    this._timerSuppressNavigation = null
                }
                this._joystickModeActive = true;
                this._renderLoop();
                this._isSuppressingNavigation = false
            }, _onPointerDown: function _onPointerDown(event) {
                if (this._isSubnet && event.pointerType === this._TouchPointerType) {
                    if (this.showMousePad) {
                        this.showMousePad = false;
                        this._safeCancelHideMouseExperience()
                    }
                    this._surface.msSetPointerCapture(event.pointerId);
                    try {
                        this._gestureRecognizer.processDownEvent(event.getCurrentPoint(this._surface))
                    }
                    catch(error) {
                        if (error.number && error.number === -2143289344);
                        else
                            throw error;
                    }
                    this.showTouchMessage = false
                }
                this._lastInputTime = Date.now()
            }, _onPointerMove: function _onPointerMove(event) {
                if (event.pointerType === this._PenPointerType || event.pointerType === this._MousePointerType) {
                    if (this.showTouchMessage) {
                        this.showTouchMessage = false;
                        this.showMousePad = true
                    }
                    this._safeCancelHideMouseExperience();
                    if (this._isSubnet && MS.Entertainment.Utilities.isTouchDevicePresent())
                        this._timerHideMouseExperience = WinJS.Promise.timeout(this.mouseExperienceAutoHideTimeSpan).then(this._handleAutoHideMouseExperience.bind(this))
                }
                if (this._isSubnet && event.pointerType === this._TouchPointerType) {
                    var intermediatePoints = event.getIntermediatePoints(this._surface);
                    if (intermediatePoints)
                        try {
                            this._gestureRecognizer.processMoveEvents(intermediatePoints)
                        }
                        catch(error) {
                            if (error.number && error.number === -2143289344);
                            else
                                throw error;
                        }
                }
                this._lastInputTime = Date.now()
            }, _onManipulationStarted: function _onManipulationStarted(event) {
                if (this._joystickModeEnabled) {
                    this._isSuppressingNavigation = true;
                    this._timerSuppressNavigation = WinJS.Promise.timeout(this.suppressNavigationForFlickTimeSpan).then(this._startJoystickMode.bind(this));
                    this._touchX = event.position.x;
                    this._touchY = event.position.y;
                    var vectorX = this._touchX - this._anchorX;
                    var vectorY = this._touchY - this._anchorY;
                    var length = Math.sqrt((vectorX * vectorX) + (vectorY * vectorY));
                    var range = (this._uiStateService.isSnapped ? this.joystickRangeSnapped : this.joystickRangeUnSnapped);
                    if (length > range || Date.now() - this._lastInputTime > this.joystickPositionResetTimeSpan) {
                        this._anchorX = event.position.x;
                        this._anchorY = event.position.y
                    }
                    this.touchPoint.domElement.style.msTransitionProperty = "none";
                    this._renderLoop()
                }
            }, _onManipulationUpdated: function _onManipulationUpdated(event) {
                if (this._joystickModeEnabled) {
                    this._touchX = event.position.x;
                    this._touchY = event.position.y;
                    var vectorX = this._touchX - this._anchorX;
                    var vectorY = this._touchY - this._anchorY;
                    var length = Math.sqrt((vectorX * vectorX) + (vectorY * vectorY));
                    var range = (this._uiStateService.isSnapped ? this.joystickRangeSnapped : this.joystickRangeUnSnapped);
                    if (length > range) {
                        var normalX = vectorX / length;
                        var normalY = vectorY / length;
                        var newVectorX = normalX * range;
                        var newVectorY = normalY * range;
                        this._touchX = this._anchorX + newVectorX;
                        this._touchY = this._anchorY + newVectorY
                    }
                }
                if (this._joystickModeActive)
                    this._handleJoystickDragDelta(event.cumulative.translation.x, event.cumulative.translation.y);
                else if (this._joystickModeEnabled) {
                    var length = Math.sqrt((event.delta.translation.x * event.delta.translation.x) + (event.delta.translation.y * event.delta.translation.y));
                    if (length > this.jitterSuppressDistance && this._timerSuppressNavigation) {
                        this._timerSuppressNavigation.cancel();
                        this._timerSuppressNavigation = null;
                        this._timerSuppressNavigation = WinJS.Promise.timeout(this.suppressNavigationForFlickTimeSpan).then(function delayedStart() {
                            this._startJoystickMode();
                            this._handleJoystickDragDelta(event.cumulative.translation.x, event.cumulative.translation.y)
                        }.bind(this))
                    }
                }
            }, _onManipulationCompleted: function _onManipulationCompleted(event) {
                if (this._joystickModeActive)
                    this._joystickModeActive = false;
                else {
                    var pt = event.cumulative.translation;
                    if (Math.abs(pt.x) > Math.abs(pt.y) && pt.x < -this.swipeDistanceThreshold)
                        if (this._longSwipesEnabled && pt.x < -(this._uiStateService.isSnapped ? this.skipDistanceThresholdSnapped : this.skipDistanceThresholdUnSnapped))
                            this._sendCommand(Microsoft.Xbox.LRC.ControlKey.replay);
                        else
                            this._sendCommand(Microsoft.Xbox.LRC.ControlKey.left);
                    else if (Math.abs(pt.x) > Math.abs(pt.y) && pt.x > this.swipeDistanceThreshold)
                        if (this._longSwipesEnabled && pt.x > (this._uiStateService.isSnapped ? this.skipDistanceThresholdSnapped : this.skipDistanceThresholdUnSnapped))
                            this._sendCommand(Microsoft.Xbox.LRC.ControlKey.skip);
                        else
                            this._sendCommand(Microsoft.Xbox.LRC.ControlKey.right);
                    else if (Math.abs(pt.y) > Math.abs(pt.x) && pt.y < -this.swipeDistanceThreshold)
                        this._sendCommand(Microsoft.Xbox.LRC.ControlKey.up);
                    else if (Math.abs(pt.y) > Math.abs(pt.x) && pt.y > this.swipeDistanceThreshold)
                        this._sendCommand(Microsoft.Xbox.LRC.ControlKey.down);
                    this._lastInputTime = Date.now()
                }
                this.touchPoint.domElement.style.msTransitionProperty = "-ms-transform";
                this._touchX = this._anchorX;
                this._touchY = this._anchorY;
                this._joystickAnimationDirty = true
            }, _onPointerUp: function _onPointerUp(event) {
                if (this._isSubnet && event.pointerType === this._TouchPointerType) {
                    this.showXboxButtons = true;
                    this._surface.msReleasePointerCapture(event.pointerId);
                    if (this._timerSuppressNavigation) {
                        this._timerSuppressNavigation.cancel();
                        this._timerSuppressNavigation = null
                    }
                    this._stopTimer();
                    if (event.type === "MSPointerUp")
                        try {
                            this._gestureRecognizer.processUpEvent(event.getCurrentPoint(this._surface))
                        }
                        catch(error) {
                            if (error.number && error.number === -2143289344)
                                this._gestureRecognizer.completeGesture();
                            else
                                throw error;
                        }
                    else
                        this._gestureRecognizer.completeGesture()
                }
            }, _onTouchTap: function _onTouchTap(event) {
                if (!this._joystickModeActive)
                    this.aButtonClick()
            }, _handleJoystickDragDelta: function _handleJoystickDragDelta(deltaX, deltaY) {
                var dragOrientation = 0;
                var totalHorizontalDelta = deltaX;
                var totalVerticalDelta = deltaY;
                var magnitudeX = Math.abs(totalHorizontalDelta);
                var magnitudeY = Math.abs(totalVerticalDelta);
                if (magnitudeX > (this._uiStateService.isSnapped ? this.joystickDeadzoneSnapped : this.joystickDeadzoneUnSnapped) && magnitudeX > magnitudeY * this.dragDirectionConfidenceFactor)
                    dragOrientation = 1;
                else if (magnitudeY > (this._uiStateService.isSnapped ? this.joystickDeadzoneSnapped : this.joystickDeadzoneUnSnapped) && magnitudeY > magnitudeX * this.dragDirectionConfidenceFactor)
                    dragOrientation = 2;
                var hasTriggered = dragOrientation > 0;
                var linearProgressPercentage = 0;
                var newDirectionalControlKey = null;
                if (!dragOrientation) {
                    this._stopTimer();
                    return
                }
                else if (dragOrientation === 1) {
                    var linearProgress = magnitudeX - (this._uiStateService.isSnapped ? this.joystickDeadzoneSnapped : this.joystickDeadzoneUnSnapped);
                    linearProgressPercentage = Math.min(1, linearProgress / (this._uiStateService.isSnapped ? this.joystickRangeSnapped : this.joystickRangeUnSnapped));
                    if (totalHorizontalDelta > 0)
                        newDirectionalControlKey = Microsoft.Xbox.LRC.ControlKey.right;
                    else
                        newDirectionalControlKey = Microsoft.Xbox.LRC.ControlKey.left
                }
                else {
                    var linearProgress = magnitudeY - (this._uiStateService.isSnapped ? this.joystickDeadzoneSnapped : this.joystickDeadzoneUnSnapped);
                    linearProgressPercentage = Math.min(1, linearProgress / (this._uiStateService.isSnapped ? this.joystickRangeSnapped : this.joystickRangeUnSnapped));
                    if (totalVerticalDelta > 0)
                        newDirectionalControlKey = Microsoft.Xbox.LRC.ControlKey.down;
                    else
                        newDirectionalControlKey = Microsoft.Xbox.LRC.ControlKey.up
                }
                var curvedProgress = this._catmulRom(-3, 0, 1, 2, linearProgressPercentage);
                if (curvedProgress === 0) {
                    this._stopTimer();
                    return
                }
                var newInterval = (this._isSubnet ? this.subnetJoystickInterval : this.cloudJoystickInterval) / curvedProgress;
                if (newInterval !== this._currentJoystickInterval)
                    this._updateTimerInterval(newInterval);
                this._currentDirectionalControlKey = newDirectionalControlKey;
                if (!this._timerEnabled)
                    this._startTimer()
            }, _catmulRom: function _catmulRom(control1, point1, point2, control2, amount)
            {
                t2 = amount * amount;
                t3 = t2 * amount;
                p0 = -t3 + (2.0 * t2) - amount;
                p1 = (3.0 * t3) - (5.0 * t2) + 2.0;
                p2 = (-3.0 * t3) + (4.0 * t2) + amount;
                p3 = t3 - t2;
                catmulRom = ((p0 * control1) + (p1 * point1) + (p2 * point2) + (p3 * control2)) * 0.5;
                return catmulRom
            }, _handleAutoHideMouseExperience: function _handleAutoHideMouseExperience() {
                this._timerHideMouseExperience = null;
                this.showTouchMessage = true;
                this.showMousePad = false
            }, _safeCancelHideMouseExperience: function _safeCancelHideMouseExperience() {
                if (this._timerHideMouseExperience !== null) {
                    this._timerHideMouseExperience.cancel();
                    this._timerHideMouseExperience = null
                }
            }, _lastUpdate: 0, _renderLoop: function _renderLoop() {
                if ((new Date) - this._lastUpdate > 20 || this._joystickAnimationDirty) {
                    this._lastUpdate = new Date;
                    this._updateTouchPointUx()
                }
                if (this.showTouchPoints)
                    window.requestAnimationFrame(this._renderLoop)
            }, _updateTouchPointUx: function _updateTouchPointUx() {
                this.touchAnchorPoint.domElement.style.msTransform = "translate(" + (this._anchorX - this._anchorPointWidth / 2) + "px, " + (this._anchorY - this._anchorPointWidth / 2) + "px)";
                this.touchPoint.domElement.style.msTransform = "translate(" + (this._touchX - this._touchPointWidth / 2) + "px, " + (this._touchY - this._touchPointWidth / 2) + "px)";
                this._joystickAnimationDirty = false
            }, reinitialize: function reinitialize() {
                if (!!this._surface)
                    this._surface.setActive()
            }
    }, {
        playbackSession: null, isDisabled: false, showXboxButtons: true, showTouchMessage: true, showMousePad: false, showTouchPoints: false, isSwitcherActive: false
    })})
