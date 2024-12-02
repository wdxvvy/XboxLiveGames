/* Copyright (C) Microsoft Corporation. All rights reserved. */
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {IconButtonMode: {
        Normal: "normal", Add: "add", Remove: "remove", Custom: "custom"
    }});
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {IconButton: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.ActionLink, "Controls/IconButton.html#iconButtonTemplate", null, {
        tabIndex: 0, automationId: null, hasSubActions: false, _flyoutControl: null, _flyoutMoved: false, _flyoutReattached: false, _flyoutEventHandler: null, _iconButtonBindings: null, initialize: function initialize() {
                MS.Entertainment.UI.Controls.ActionLink.prototype.initialize.call(this);
                this._iconButtonBindings = WinJS.Binding.bind(this, {
                    icon: this._updateIcon.bind(this), iconPressed: this._updateIcon.bind(this), text: this._updateAriaLabel.bind(this), stringId: this._stringIdChanged.bind(this), visibility: this._setVisibility.bind(this), isDisabled: this._setDisabled.bind(this), isChecked: this._setChecked.bind(this), hideDefaultRing: this._hideDefaultRingChanged.bind(this), action: this._setDomElement.bind(this)
                });
                this.iconButtonActionBindings = WinJS.Binding.bind(this.action, {
                    subActions: function updateSubItems(newItems) {
                        if (this._unloaded)
                            return;
                        this.subItems = newItems;
                        this._updateSubActions(newItems)
                    }.bind(this), hasSubActions: function updateHasSubActions(newValue) {
                            this.hasSubActions = newValue
                        }.bind(this)
                });
                if (this._button)
                    this._button.tabIndex = this.tabIndex;
                if (this.automationId && this._button)
                    this._button.setAttribute("data-win-automationid", this.automationId);
                if (this._shouldCreateFlyout) {
                    this.domElement.setAttribute("aria-haspopup", true);
                    this._flyoutElement.setAttribute("data-win-control", "MS.Entertainment.UI.Controls.Flyout");
                    this._flyoutControl = new MS.Entertainment.UI.Controls.Flyout(this._flyoutElement);
                    MS.Entertainment.UI.Framework.waitForControlToInitialize(this._flyoutElement).done(function flyoutInitialized() {
                        if (this._unloaded)
                            return;
                        var flyoutElement = this._flyoutControl.flyout.element;
                        flyoutElement.suppressUnload = true;
                        this._flyoutElement.removeChild(flyoutElement);
                        flyoutElement.suppressUnload = false;
                        this._flyoutMoved = true;
                        this._flyoutEventHandler = MS.Entertainment.Utilities.addEventHandlers(this._flyoutControl.flyout, {
                            aftershow: this._updateFlyoutPosition.bind(this), beforeshow: this._hideFlyout.bind(this)
                        });
                        if (this.action._flyoutClassName)
                            WinJS.Utilities.addClass(flyoutElement, this.action._flyoutClassName)
                    }.bind(this))
                }
                if (this.isToggleButton && this._button) {
                    WinJS.Utilities.addClass(this._button, "toggleButton");
                    if (this.isChecked)
                        this._button.setAttribute("aria-pressed", "true");
                    else
                        this._button.setAttribute("aria-pressed", "false")
                }
            }, unload: function unload() {
                if (this._iconButtonBindings) {
                    this._iconButtonBindings.cancel();
                    this._iconButtonBindings = null
                }
                if (this.iconButtonActionBindings) {
                    this.iconButtonActionBindings.cancel();
                    this.iconButtonActionBindings = null
                }
                if (this.action)
                    this.action.referenceContainer = null;
                if (this._flyoutEventHandler) {
                    this._flyoutEventHandler.cancel();
                    this._flyoutEventHandler = null
                }
                if (this._flyoutControl && this._flyoutControl.flyout) {
                    if (this._flyoutMoved && this._flyoutReattached)
                        document.body.removeChild(this._flyoutControl.flyout.element);
                    this._flyoutControl = null
                }
                MS.Entertainment.UI.Controls.ActionLink.prototype.unload.call(this)
            }, onClickPreProcess: function onClickPreProcess() {
                if (this._flyoutControl) {
                    var executePromise = WinJS.Promise.wrap();
                    if (this._flyoutControl && this._flyoutControl.flyout && this._flyoutControl.flyout.element && !this._flyoutReattached && this._flyoutControl.flyout.element.style.visibility !== "visible") {
                        document.body.appendChild(this._flyoutControl.flyout.element);
                        this._flyoutReattached = true
                    }
                    if (this.action.canExecute())
                        executePromise = WinJS.Promise.as(this.action.execute());
                    executePromise.done(function executed() {
                        this._updateSubActions(this.subItems);
                        WinJS.Promise.timeout().done(function delay() {
                            this._showFlyout()
                        }.bind(this))
                    }.bind(this), function onError(error) {
                        var message = error && error.message;
                        MS.Entertainment.UI.fail("executePromise failed: " + message)
                    })
                }
                else
                    this.onClick()
            }, _shouldCreateFlyout: {get: function _shouldCreateFlyout() {
                    return this.action && this.action.hasSubActions
                }}, _updateSubActions: function _updateSubActions(newActions) {
                if (this._flyoutControl && this._flyoutControl._subItemsList)
                    this._flyoutControl._subItemsList.dataSource = newActions
            }, _showFlyout: function _showFlyout() {
                if (this._flyoutControl && this._flyoutControl.flyout) {
                    var placement = (MS.Entertainment.Utilities.getTextDirection() === MS.Entertainment.Utilities.TextDirections.LeftToRight) ? "right" : "left";
                    var iconElement = this.domElement.querySelector(".win-commandicon");
                    this._flyoutControl.flyout.show(iconElement, placement)
                }
            }, _hideFlyout: function _hideFlyout() {
                var flyoutElement = this._flyoutControl && this._flyoutControl.flyout && this._flyoutControl.flyout.element;
                if (flyoutElement && flyoutElement.style)
                    WinJS.Utilities.addClass(flyoutElement, "hideFromDisplay")
            }, _updateFlyoutPosition: function _updateFlyoutPosition() {
                var flyoutElement = this._flyoutControl && this._flyoutControl.flyout && this._flyoutControl.flyout.element;
                if (flyoutElement && flyoutElement.style) {
                    flyoutElement.style.top = "auto";
                    var iconElement = this.domElement.querySelector(".win-commandicon");
                    var offset = WinJS.Utilities.getPosition(iconElement);
                    offset = Math.max(0, document.body.clientHeight - (flyoutElement.clientHeight + offset.top - 7));
                    flyoutElement.style.bottom = offset + "px";
                    WinJS.Utilities.removeClass(flyoutElement, "hideFromDisplay");
                    this._setFocusInFlyout(flyoutElement, false)
                }
            }, _setFocusInFlyout: function _setFocusInFlyout(flyoutElement, itemsReversed) {
                WinJS.Promise.timeout().done(function setFocus() {
                    var elementToFocus;
                    var flyoutElements = flyoutElement.getElementsByClassName("actionButtonFlyoutButton");
                    for (var i = 0; flyoutElements && i < flyoutElements.length; i++) {
                        elementToFocus = elementToFocus || flyoutElements[i];
                        if (!itemsReversed && elementToFocus.offsetTop > flyoutElements[i].offsetTop)
                            elementToFocus = flyoutElements[i];
                        else if (itemsReversed && elementToFocus.offsetTop < flyoutElements[i].offsetTop)
                            elementToFocus = flyoutElements[i]
                    }
                    if (elementToFocus)
                        elementToFocus.focus()
                })
            }, _setDomElement: function _setDomElement() {
                if (this._unloaded)
                    return;
                if (this.action)
                    this.action.referenceContainer = {
                        flyout: this._flyoutElement, domElement: this.iconSpan
                    }
            }, _setVisibility: function _setVisibility() {
                if (this.visibility)
                    WinJS.Utilities.removeClass(this._button, "removeFromDisplay");
                else
                    WinJS.Utilities.addClass(this._button, "removeFromDisplay")
            }, _setDisabled: function _setDisabled() {
                if (this.isDisabled)
                    this._button.setAttribute("disabled", "disabled");
                else
                    this._button.removeAttribute("disabled")
            }, _setChecked: function _setChecked() {
                if (this.isChecked) {
                    WinJS.Utilities.addClass(this._button, "checked");
                    if (this.isToggleButton && this._button.getAttribute("aria-pressed") === "false")
                        this._button.setAttribute("aria-pressed", "true")
                }
                else {
                    WinJS.Utilities.removeClass(this._button, "checked");
                    if (this.isToggleButton && this._button.getAttribute("aria-pressed") === "true")
                        this._button.setAttribute("aria-pressed", "false")
                }
            }, _updateIcon: function _updateIcon() {
                var iconPressed = (this.iconPressed) ? this.iconPressed : this.icon;
                if (this.iconSpan && this.icon)
                    if (this.icon.length === 1 || this.icon === MS.Entertainment.UI.Icon.xboxXenonLogo) {
                        this.iconSpan.textContent = this.icon;
                        this.iconSpan.style.backgroundImage = "";
                        this.iconSpan.style.msHighContrastAdjust = ""
                    }
                    else {
                        this.iconSpan.textContent = "";
                        this.iconSpan.style.backgroundImage = this.icon;
                        this.iconSpan.style.msHighContrastAdjust = "none"
                    }
                if (this.iconSpanPressed && iconPressed)
                    if (iconPressed.length === 1 || this.icon === MS.Entertainment.UI.Icon.xboxXenonLogo) {
                        this.iconSpanPressed.textContent = iconPressed;
                        this.iconSpanPressed.style.backgroundImage = "";
                        this.iconSpanPressed.style.msHighContrastAdjust = ""
                    }
                    else {
                        this.iconSpanPressed.textContent = "";
                        this.iconSpanPressed.style.backgroundImage = iconPressed;
                        this.iconSpanPressed.style.msHighContrastAdjust = "none"
                    }
                switch (this.adornerMode) {
                    case(MS.Entertainment.UI.Controls.IconButtonMode.Add):
                        this._setAdorners(MS.Entertainment.UI.Icon.modifierAddRing);
                        break;
                    case(MS.Entertainment.UI.Controls.IconButtonMode.Remove):
                        this._setAdorners(MS.Entertainment.UI.Icon.modifierRemoveRing);
                        break;
                    case(MS.Entertainment.UI.Controls.IconButtonMode.Custom):
                        this._setAdorners(this.adornerRing);
                        break;
                    case(MS.Entertainment.UI.Controls.IconButtonMode.Normal):
                    default:
                        break
                }
            }, _setAdorners: function _setAdorners(adorner) {
                this.hideDefaultRing = true;
                this._hideDefaultRingChanged();
                this.modifier.textContent = adorner
            }, _hideDefaultRingChanged: function _hideDefaultRingChanged() {
                if (this.hideDefaultRing || (this.action && this.action.hideDefaultRing))
                    WinJS.Utilities.addClass(this._button, "hideAdorner");
                else
                    WinJS.Utilities.removeClass(this._button, "hideAdorner")
            }, _stringIdChanged: function _stringIdChanged() {
                if (this.stringId) {
                    var string = String.load(this.stringId);
                    this._button.setAttribute("aria-label", string);
                    this.linkLabel.innerText = string
                }
            }, _updateAriaLabel: function _updateAriaLabel() {
                if (this.text) {
                    this._button.setAttribute("aria-label", this.text);
                    this.linkLabel.innerText = this.text
                }
            }
    }, {
        icon: null, iconPressed: null, hideDefaultRing: false, adornerMode: MS.Entertainment.UI.Controls.IconButtonMode.Normal, adornerRing: null, isDisabled: false, isToggleButton: false, isChecked: false, visibility: true, subItems: null, action: null, focusable: true
    })});
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {IconButtonTwoLine: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.IconButton, "Controls/IconButton.html#iconButtonTwoLineTemplate", null, {
        initialize: function initialize() {
            MS.Entertainment.UI.Controls.IconButton.prototype.initialize.call(this);
            this._iconButtonBindings = WinJS.Binding.bind(this, {
                icon: this._updateIcon.bind(this), iconPressed: this._updateIcon.bind(this), text: this._textChanged.bind(this), subText: this._subTextChanged.bind(this), subTextString: this._subTextStringChanged.bind(this), stringId: this._stringIdChanged.bind(this), visibility: this._setVisibility.bind(this), isDisabled: this._setDisabled.bind(this), isChecked: this._setChecked.bind(this), hideDefaultRing: this._hideDefaultRingChanged.bind(this), action: this._setDomElement.bind(this)
            })
        }, _textChanged: function _subTextChanged() {
                if (this.text)
                    this.linkLabel.innerText = this.text;
                this._updateAriaLabel()
            }, _subTextChanged: function _subTextChanged() {
                if (this.subText)
                    this.linkSubLabel.textContent = String.load(this.subText);
                this._updateSubTextVisibility()
            }, _subTextStringChanged: function _subTextStringChanged() {
                if (this.subTextString)
                    this.linkSubLabel.textContent = this.subTextString;
                this._updateSubTextVisibility();
                this._updateAriaLabel()
            }, _updateSubTextVisibility: function _updateSubTextVisibility() {
                this.subTextVisibility = (this.subText || this.subTextString)
            }, _updateAriaLabel: function _updateAriaLabel() {
                var ariaLabel = String.empty;
                if (this.text && this.subTextString)
                    ariaLabel = String.load(String.id.IDS_COMMA_SEPARATOR).format(this.text, this.subTextString);
                else if (this.text)
                    ariaLabel = this.text;
                if (ariaLabel)
                    this._button.setAttribute("aria-label", ariaLabel)
            }
    }, {
        subText: null, subTextString: null, subTextVisibility: false
    })});
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {IconButtonVertical: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.IconButton, "Controls/IconButton.html#iconButtonVerticalTemplate", null, {initialize: function initialize() {
            MS.Entertainment.UI.Controls.IconButton.prototype.initialize.call(this)
        }})})
