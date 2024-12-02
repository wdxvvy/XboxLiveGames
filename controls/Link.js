/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {ActionLink: MS.Entertainment.UI.Framework.defineUserControl("Controls/Link.html#linkTemplate", function actionLinkConstructor() {
        this._accessiblePressed = this._accessiblePressed.bind(this)
    }, {
        overrideStyle: null, animateHubOnTransition: false, _actionBindings: null, _buttonEventHandlers: null, _buttonToggleEventAttached: null, _bindings: null, _pressHold: false, _msGesture: null, _networkStatusBinding: null, initialize: function initialize() {
                var style = null;
                var external = false;
                var updateAccessibilityText = this._updateAccessibilityText.bind(this);
                this.bind("action", function() {
                    if (this._actionBindings) {
                        this._actionBindings.cancel();
                        this._actionBindings = null
                    }
                    if (!this.action || this._unloaded)
                        return;
                    if (this.action.disableWhenOffline)
                        this._networkStatusBinding = WinJS.Binding.bind(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState), {networkStatus: this._onNetworkStatusChanged.bind(this)});
                    var external = this.action.isExternalAction;
                    this.action.parameter = this.actionParam || this.action.parameter;
                    this.action.automationId = this.actionAutomationId || this.action.automationId;
                    if (this.action.parameter && this.action.requiresLinkControl)
                        this.action.parameter.linkControl = this;
                    this._actionBindings = WinJS.Binding.bind(this.action, {
                        isEnabled: function actionIsEnabledChanged() {
                            if (this.action)
                                if (this.disabled === this.action.isEnabled)
                                    this.disabled = !this.action.isEnabled
                        }.bind(this), title: function actionTitleChanged() {
                                if (this.action.forceTitleChange || (!this.text && !this.stringId))
                                    this.text = this.action.title
                            }.bind(this), ariaPressed: function actionAriaPressedChanged() {
                                if (this.action.enableAriaPressedOverride)
                                    if (!this._button.hasAttribute("aria-pressed") || (this.action.ariaPressed && this._button.getAttribute("aria-pressed") === "false") || (!this.action.ariaPressed && this._button.getAttribute("aria-pressed") === "true"))
                                        this._button.setAttribute("aria-pressed", this.action.ariaPressed)
                            }.bind(this), icon: function() {
                                if (!this.icon && this.action.icon)
                                    this.icon = this.action.icon
                            }.bind(this)
                    });
                    if (external)
                        WinJS.Utilities.addClass(this._button, "externalActionLink");
                    if (this.action.isToggleAction && !this._unloaded)
                        this._buttonToggleEventAttached = this._button.attachEvent("onpropertychange", this._accessiblePressed);
                    if (this.action.ariaLabelOverride)
                        this.accessibilityText = this.action.ariaLabelOverride
                }.bind(this));
                this.bind("holdAction", function() {
                    if (!this.holdAction || this._unloaded)
                        return;
                    if (this._button) {
                        this._msGesture = new MSGesture;
                        this._buttonEventHandlers = MS.Entertainment.Utilities.addEventHandlers(this._button, {
                            MSPointerDown: this._onPointerDown.bind(this), MSGestureHold: this._buttonHold.bind(this), MSHoldVisual: function(event) {
                                    event.preventDefault()
                                }
                        })
                    }
                }.bind(this));
                this.bind("doClick", function() {
                    if (this.doClick)
                        this.disabled = false
                }.bind(this));
                this._bindings = WinJS.Binding.bind(this, {
                    accessibilityText: updateAccessibilityText, accessibilityStringId: updateAccessibilityText, focusable: this._updateFocusableAttributes.bind(this)
                });
                if (this.overrideStyle)
                    style = this.overrideStyle;
                else
                    style = "internalActionLink";
                if (this._button)
                    WinJS.Utilities.addClass(this._button, style)
            }, _accessiblePressed: function _accessiblePressed() {
                if (this._button && event && event.propertyName === "aria-pressed")
                    if (this.action.ariaPressed && this._button.getAttribute("aria-pressed") === "false")
                        this.onClick();
                    else if (!this.action.ariaPressed && this._button.getAttribute("aria-pressed") === "true")
                        this.onClick()
            }, _onNetworkStatusChanged: function _onNetworkStatusChanged() {
                if (this.action)
                    if (this.action.suppressMessageInNetworkBind) {
                        var offlineMessage = this.action.offlineMessageTitle;
                        this.action.offlineMessageTitle = String.empty;
                        this.action.requeryCanExecute();
                        this.action.offlineMessageTitle = offlineMessage
                    }
                    else
                        this.action.requeryCanExecute()
            }, unload: function unload() {
                if (this._bindings) {
                    this._bindings.cancel();
                    this._bindings = null
                }
                if (this._networkStatusBinding) {
                    this._networkStatusBinding.cancel();
                    this._networkStatusBinding = null
                }
                if (this._actionBindings) {
                    this._actionBindings.cancel();
                    this._actionBindings = null
                }
                if (this._buttonEventHandlers) {
                    this._buttonEventHandlers.cancel();
                    this._buttonEventHandlers = null
                }
                if (this._buttonToggleEventAttached && this._button) {
                    this._button.detachEvent("onpropertychange", this._accessiblePressed);
                    this._buttonToggleEventAttached = false
                }
                MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
            }, onClick: function onLinkClick(onClickArgs) {
                if (this._pressHold)
                    return;
                if (this.doClick) {
                    this.doClick();
                    return
                }
                if (this.action && !this.action.canExecute)
                    return;
                var action = this.action;
                var onClickElement = onClickArgs && onClickArgs.currentTarget;
                if (onClickElement && action && action.useRelativePositioning) {
                    action.referenceContainer = action.referenceContainer || {};
                    action.referenceContainer.relativeOffset = WinJS.Utilities.getPosition(onClickElement)
                }
                var executeFunction = function executeAction() {
                        if (action)
                            action.execute()
                    };
                if (this.animateHubOnTransition) {
                    var panelContentContainer = MS.Entertainment.Utilities.findParentElementByClassName(this._button, "panelContainer");
                    MS.Entertainment.Animations.HubStrip.setupDeclarativeAnimsHubStripPanels(panelContentContainer)
                }
                executeFunction();
                return true
            }, onHold: function onButtonHold() {
                if (this.holdAction && !this.holdAction.canExecute)
                    return;
                if (this.holdAction)
                    this.holdAction.execute();
                return true
            }, _assignPointer: function _assignPointer(event) {
                if (!this._msGesture)
                    return;
                try {
                    this._msGesture.target = event.target
                }
                catch(err) {}
                if (event.target === this._msGesture.target) {
                    this._msGesture.addPointer(event.pointerId);
                    if (event.pointerId && event.target.msSetPointerCapture)
                        event.target.msSetPointerCapture(event.pointerId)
                }
            }, _onPointerDown: function _onPointerDown(event) {
                this._assignPointer(event)
            }, _buttonHold: function _buttonHold(e) {
                if (!this.holdAction)
                    return;
                if ((e.detail & e.MSGESTURE_FLAG_BEGIN) === e.MSGESTURE_FLAG_BEGIN) {
                    this.onHold();
                    this._pressHold = true
                }
                else if ((e.detail & e.MSGESTURE_FLAG_END) === e.MSGESTURE_FLAG_END)
                    WinJS.Promise.timeout().then(function _delay() {
                        this._pressHold = false
                    }.bind(this))
            }, _updateAccessibilityText: function _updateAccessibilityText() {
                var accessibilityText,
                    ariaLabelAttribute;
                if (this.accessibilityText) {
                    MS.Entertainment.UI.Controls.assert(!this.accessibilityStringId, "Mixed usage of raw text and stringId on a accessibility text for the action link.");
                    accessibilityText = this.accessibilityText
                }
                else if (this.accessibilityStringId)
                    accessibilityText = String.load(this.accessibilityStringId);
                MS.Entertainment.Utilities.setAccessibilityText(this._button, accessibilityText)
            }, _updateFocusableAttributes: function _updateFocusableAttributes(newValue, oldValue) {
                if (!this._button)
                    return;
                if (newValue)
                    WinJS.Utilities.addClass(this._button, "win-focusable");
                else
                    WinJS.Utilities.removeClass(this._button, "win-focusable")
            }
    }, {
        actionParam: null, disabled: true, action: null, text: null, stringId: 0, numberOfLines: 0, wrap: false, accessibilityText: null, accessibilityStringId: 0, focusable: false, holdAction: null
    })});
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {PanelActionLink: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.ActionLink, "Controls/Link.html#panelActionLinkTemplate", null, null, {focusable: true})});
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {ImageActionLink: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.ActionLink, "Controls/Link.html#imageActionLinkTemplate", null, {initialize: function initialize() {
            MS.Entertainment.UI.Controls.ActionLink.prototype.initialize.apply(this, arguments);
            if (this.text)
                MS.Entertainment.Utilities.setAccessibilityText(this._button, this.text)
        }}, {imageUrl: null})});
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {FlyOutActionLink: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.ActionLink, null, null, null, {onClick: function onClick() {
            MS.Entertainment.UI.Controls.ActionLink.prototype.onClick.apply(this, arguments);
            var element = this.domElement;
            while (element && !WinJS.Utilities.hasClass(element, "win-flyout"))
                element = element.parentElement;
            if (element && element.winControl)
                element.winControl.hide()
        }})});
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {PersistentFlyOutActionLink: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.ActionLink, null, null, null, {onClick: function onClick() {
            MS.Entertainment.UI.Controls.ActionLink.prototype.onClick.apply(this, arguments)
        }})});
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {PersistentFlyOutActionComboLink: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.ActionLink, "Controls/Link.html#comboLinkTemplate")});
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {ComboLinkContainer: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.ActionLink, "Controls/Link.html#comboLinkContainerTemplate")});
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {PanelHeaderActionLink: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.ActionLink, "Controls/Link.html#panelHeaderLinkTemplate", null, null, {focusable: true})});
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {CloseActionLink: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.ActionLink, "Controls/Link.html#closeLinkTemplate")})
