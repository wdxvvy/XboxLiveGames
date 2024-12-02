/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
WinJS.Namespace.define("MS.Entertainment.Framework", {
    KeyboardInteractionListener: WinJS.Class.define(function KeyboardInteractionListener() {
        var keyboardHandler = this._onKeyDown.bind(this);
        var mouseHandler = this._onMouseDown.bind(this);
        document.addEventListener("keydown", keyboardHandler, true);
        document.addEventListener("MSPointerDown", mouseHandler, false);
        if (WinJS.Utilities.hasWinRT) {
            var commandUI = Windows.UI.Input.EdgeGesture.getForCurrentView();
            commandUI.addEventListener("completed", this._onAppBarGesture.bind(this))
        }
    }, {
        _keyboardStyleSet: false, _onKeyDown: function KeyboardInteractionListener_onKeyDown(event) {
                if (!this._keyboardStyleSet && MS.Entertainment.Framework.KeyboardInteractionListener._isKeyboardNavigationEvent(event)) {
                    this._keyboardStyleSet = true;
                    WinJS.Utilities.addClass(document.documentElement, MS.Entertainment.Framework.KeyboardInteractionListener.keyboardFocusClassName);
                    MS.Entertainment.Framework.KeyboardInteractionListener.showKeyboardFocus = true
                }
            }, _onAppBarGesture: function _onAppBarGesture(event) {
                if (event && event.kind === Windows.UI.Input.EdgeGestureKind.keyboard) {
                    this._keyboardStyleSet = true;
                    WinJS.Utilities.addClass(document.documentElement, MS.Entertainment.Framework.KeyboardInteractionListener.keyboardFocusClassName);
                    MS.Entertainment.Framework.KeyboardInteractionListener.showKeyboardFocus = true
                }
            }, _onMouseDown: function KeyboardInteractionListener_onMouseDown(event) {
                if (this._keyboardStyleSet) {
                    this._keyboardStyleSet = false;
                    WinJS.Utilities.removeClass(document.documentElement, MS.Entertainment.Framework.KeyboardInteractionListener.keyboardFocusClassName)
                }
                MS.Entertainment.Framework.KeyboardInteractionListener.showKeyboardFocus = false
            }
    }, {
        keyboardFocusClassName: "showKeyboardFocus", showKeyboardFocus: MS.Entertainment.Utilities.isApp2, instance: null, _isKeyboardNavigationEvent: function _isKeyboardNavigationEvent(event) {
                if (event.keyCode === WinJS.Utilities.Key.tab)
                    return true;
                else if (event.keyCode === WinJS.Utilities.Key.leftArrow || event.keyCode === WinJS.Utilities.Key.rightArrow || event.keyCode === WinJS.Utilities.Key.downArrow || event.keyCode === WinJS.Utilities.Key.upArrow || event.keyCode === WinJS.Utilities.Key.home || event.keyCode === WinJS.Utilities.Key.end || event.keyCode === WinJS.Utilities.Key.pageUp || event.keyCode === WinJS.Utilities.Key.pageDown || event.keyCode === WinJS.Utilities.Key.escape || event.keyCode === WinJS.Utilities.Key.backspace)
                    return !MS.Entertainment.Utilities.doesElementSupportKeyboardInput(document.activeElement);
                return false
            }, init: function KeyboardInteractionListener_init() {
                if (!MS.Entertainment.Framework.KeyboardInteractionListener.instance)
                    MS.Entertainment.Framework.KeyboardInteractionListener.instance = new MS.Entertainment.Framework.KeyboardInteractionListener
            }
    }), AccUtils: WinJS.Class.define(null, null, {
            idCounter: 0, createAriaLinkId: function createAriaLinkId(linkedElement) {
                    if (!linkedElement.id) {
                        linkedElement.id = "accid" + MS.Entertainment.Framework.AccUtils.idCounter;
                        MS.Entertainment.Framework.AccUtils.idCounter++
                    }
                }, addAriaLink: function addAriaAttribute(element, linkedElementId, attribute) {
                    element.setAttribute(attribute, linkedElementId)
                }, createAndAddAriaLink: function createAndAddAriaLink(element, linkedElement, attribute) {
                    MS.Entertainment.Framework.AccUtils.createAriaLinkId(linkedElement);
                    MS.Entertainment.Framework.AccUtils.addAriaLink(element, linkedElement.id, attribute)
                }, checkAndSetAriaAttribute: WinJS.Utilities.markSupportedForProcessing(function checkAndSetAriaAttribute(value, targetElement, targetProperty) {
                    targetProperty = "" + targetProperty;
                    switch (targetProperty) {
                        case"label":
                            MS.Entertainment.Utilities.setAccessibilityText(targetElement, value);
                            break;
                        case"role":
                            value ? targetElement.setAttribute("role", value) : targetElement.removeAttribute("role");
                            break;
                        case"level":
                            value ? targetElement.setAttribute("aria-level", value) : targetElement.removeAttribute("aria-level");
                            break;
                        case"expanded":
                            typeof value === "boolean" ? targetElement.setAttribute("aria-expanded", value) : targetElement.removeAttribute("aria-expanded");
                            break;
                        case"selected":
                            typeof value === "boolean" ? targetElement.setAttribute("aria-selected", value) : targetElement.removeAttribute("aria-selected");
                            break;
                        case"controls":
                            value ? targetElement.setAttribute("aria-controls", value) : targetElement.removeAttribute("aria-controls");
                            break;
                        case"owns":
                            Array.isArray(value) && value.length ? targetElement.setAttribute("aria-owns", value.join(" ")) : targetElement.removeAttribute("aria-owns");
                            break;
                        default:
                            MS.Entertainment.Utilities.assert(false, "Attempted to bind to invalid ARIA attribute: " + targetProperty);
                            break
                    }
                }), setAriaAttribute: MS.Entertainment.Utilities.weakElementBindingInitializer(function setAriaAttribute(text, targetElement, targetProperty) {
                    if (Array.isArray(targetProperty))
                        targetProperty = targetProperty[0];
                    MS.Entertainment.Framework.AccUtils.checkAndSetAriaAttribute(text, targetElement, targetProperty)
                }), setAriaAttributeFromStringId: MS.Entertainment.Utilities.weakElementBindingInitializer(function setAriaAttributeFromStringId(stringId, targetElement, targetProperty) {
                    if (Array.isArray(targetProperty))
                        targetProperty = targetProperty[0];
                    MS.Entertainment.Framework.AccUtils.checkAndSetAriaAttribute(stringId && String.load(stringId), targetElement, targetProperty)
                }), setAriaAttributeFromStaticStringId: WinJS.Utilities.markSupportedForProcessing(function setAriaAttributeFromStaticStringId(sourceObject, staticStringId, targetElement, targetProperty) {
                    var len = staticStringId.length;
                    var data = String.id[staticStringId[0]];
                    var result = String.empty;
                    MS.Entertainment.Formatters.assert(typeof data === "number", "Formatters_formatStringId must be passed a valid string id");
                    if (typeof data === "number")
                        MS.Entertainment.Framework.AccUtils.checkAndSetAriaAttribute(String.load(data), targetElement, targetProperty)
                }), setAriaSliderBounds: function setAriaSliderPosition(element, min, max) {
                    if (!element)
                        return;
                    element = element.domElement ? element.domElement : element;
                    if (element) {
                        MS.Entertainment.Utilities.assert(typeof min === "number", "Expected parameter min to be numeric in setAriaSliderBounds.");
                        MS.Entertainment.Utilities.assert(typeof max === "number", "Expected parameter max to be numeric in setAriaSliderBounds.");
                        element.setAttribute("aria-valuemin", min);
                        element.setAttribute("aria-valuemax", max)
                    }
                }, setAriaSliderPosition: function setAriaSliderPosition(element, value, valueText) {
                    if (!element)
                        return;
                    element = element.domElement ? element.domElement : element;
                    if (element) {
                        MS.Entertainment.Utilities.assert(typeof value === "number", "Expected parameter value to be numeric in setAriaSliderPosition.");
                        element.setAttribute("aria-valuenow", value);
                        if (valueText)
                            element.setAttribute("aria-valuetext", valueText)
                    }
                }
        })
})
