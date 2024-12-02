/* Copyright (C) Microsoft Corporation. All rights reserved. */
WinJS.Namespace.define("MS.Entertainment.Framework", {KeyboardNavigationManager: WinJS.Class.define(function KeyboardNavigationManager(element, scroller, setTabIndex) {
        this._element = element;
        this._scroller = scroller || element;
        this._setTabIndex = setTabIndex;
        if (!MS.Entertainment.Utilities.isApp2)
            this._element.addEventListener("keydown", this._handleKeyInput.bind(this));
        this._element.addEventListener("focusout", this._handleBlur.bind(this));
        this._element.addEventListener("focusin", this._handleFocus.bind(this))
    }, {
        _element: null, _scroller: null, _focusStyleClass: "acc-keyboardFocusTarget", _setTabIndex: null, _itemWithTabIndex: null, _currentlyFocusedItem: null, _handleKeyInput: function _handleKeyInput(e) {
                if (MS.Entertainment.Framework.KeyboardNavigationManager._validKeys.indexOf(e.keyCode) === -1 || MS.Entertainment.Utilities.doesElementSupportKeyboardInput(document.activeElement))
                    return;
                if (e.keyCode === WinJS.Utilities.Key.enter || e.keyCode === WinJS.Utilities.Key.space) {
                    this._handleClick(e);
                    return
                }
                var initialResults = this._element.querySelectorAll(".win-focusable");
                var results = [];
                var currentInitialItem = null;
                var initialItemAvailable = true;
                for (var j = 0; j < initialResults.length; j++) {
                    currentInitialItem = initialResults[j];
                    if (this._checkItemValidTarget(currentInitialItem))
                        results.push(currentInitialItem)
                }
                if (results.length < 1)
                    return;
                if (!this._currentlyFocusedItem) {
                    initialItemAvailable = false;
                    for (var i = 0; i < results.length; i++)
                        if (MS.Entertainment.Utilities.isElementInHorizontalViewportOfParent(results[i], this._scroller)) {
                            this._currentlyFocusedItem = results[i];
                            break
                        }
                }
                var currentItemOffset = {
                        left: 0, top: 0
                    };
                if (!this._currentlyFocusedItem && (e.keyCode !== WinJS.Utilities.Key.home && e.keyCode !== WinJS.Utilities.Key.end))
                    return;
                else
                    currentItemOffset = MS.Entertainment.Utilities.getRelativeOffset(this._currentlyFocusedItem, this._element);
                var checkElementOffset;
                var checkElementRight;
                var checkElementBottom;
                var currentClosest = null;
                var currentEdge;
                var currentItemCheck = null;
                var currentBestItemCheck = null;
                if ((initialItemAvailable && currentItemOffset) || (e.keyCode === WinJS.Utilities.Key.home) || (e.keyCode === WinJS.Utilities.Key.end))
                    if (results.length === 1 && !e.ctrlKey)
                        currentClosest = {element: results[0]};
                    else if (e.keyCode === WinJS.Utilities.Key.leftArrow && !e.ctrlKey) {
                        for (var i = 0; i < results.length; i++)
                            if (results[i] !== this._currentlyFocusedItem) {
                                checkElementOffset = MS.Entertainment.Utilities.getRelativeOffset(results[i], this._element);
                                if (checkElementOffset) {
                                    checkElementRight = checkElementOffset.left + results[i].clientWidth;
                                    if (currentItemOffset.left > checkElementOffset.left)
                                        if (currentClosest) {
                                            if (currentItemOffset.left - checkElementOffset.left > currentItemOffset.left - currentClosest.left)
                                                continue;
                                            currentItemCheck = Math.abs(checkElementRight - currentItemOffset.left);
                                            currentBestItemCheck = Math.abs(currentClosest.right - currentItemOffset.left);
                                            if (currentItemCheck < currentBestItemCheck)
                                                currentClosest = {
                                                    element: results[i], right: checkElementRight, left: checkElementOffset.left, top: checkElementOffset.top
                                                };
                                            else if (currentItemCheck === currentBestItemCheck)
                                                if (Math.abs(checkElementOffset.top - currentItemOffset.top) <= Math.abs(currentClosest.top - currentItemOffset.top))
                                                    currentClosest = {
                                                        element: results[i], right: checkElementRight, left: checkElementOffset.left, top: checkElementOffset.top
                                                    }
                                        }
                                        else
                                            currentClosest = {
                                                element: results[i], right: checkElementRight, left: checkElementOffset.left, top: checkElementOffset.top
                                            }
                                }
                            }
                    }
                    else if (e.keyCode === WinJS.Utilities.Key.rightArrow && !e.ctrlKey) {
                        currentEdge = this._currentlyFocusedItem.clientWidth + currentItemOffset.left;
                        for (var i = 0; i < results.length; i++)
                            if (results[i] !== this._currentlyFocusedItem) {
                                checkElementOffset = MS.Entertainment.Utilities.getRelativeOffset(results[i], this._element);
                                if (checkElementOffset) {
                                    checkElementRight = checkElementOffset.left + results[i].clientWidth;
                                    if (checkElementOffset.left > currentEdge)
                                        if (currentClosest) {
                                            if (checkElementOffset.left - currentEdge > currentClosest.left - currentEdge)
                                                continue;
                                            currentItemCheck = Math.abs(checkElementOffset.left - currentEdge);
                                            currentBestItemCheck = Math.abs(currentClosest.left - currentEdge);
                                            if (currentItemCheck < currentBestItemCheck)
                                                currentClosest = {
                                                    element: results[i], left: checkElementOffset.left, right: checkElementRight, top: checkElementOffset.top
                                                };
                                            else if (currentItemCheck === currentBestItemCheck)
                                                if (Math.abs(checkElementOffset.top - currentItemOffset.top) <= Math.abs(currentClosest.top - currentItemOffset.top))
                                                    currentClosest = {
                                                        element: results[i], left: checkElementOffset.left, right: checkElementRight, top: checkElementOffset.top
                                                    }
                                        }
                                        else
                                            currentClosest = {
                                                element: results[i], left: checkElementOffset.left, right: checkElementRight, top: checkElementOffset.top
                                            }
                                }
                            }
                    }
                    else if (e.keyCode === WinJS.Utilities.Key.downArrow) {
                        currentEdge = this._currentlyFocusedItem.clientHeight + currentItemOffset.top;
                        for (var i = 0; i < results.length; i++)
                            if (results[i] !== this._currentlyFocusedItem) {
                                checkElementOffset = MS.Entertainment.Utilities.getRelativeOffset(results[i], this._element);
                                if (checkElementOffset) {
                                    checkElementBottom = checkElementOffset.top + results[i].clientHeight;
                                    if (checkElementBottom > currentEdge)
                                        if (currentClosest) {
                                            if (checkElementBottom - currentEdge > currentClosest.bottom - currentEdge)
                                                continue;
                                            if (checkElementOffset.left >= currentItemOffset.left && checkElementOffset.left - currentItemOffset.left < currentClosest.left - currentItemOffset.left)
                                                currentClosest = {
                                                    element: results[i], left: checkElementOffset.left, bottom: checkElementBottom
                                                }
                                        }
                                        else if (checkElementOffset.left >= currentItemOffset.left)
                                            currentClosest = {
                                                element: results[i], left: checkElementOffset.left, bottom: checkElementBottom
                                            }
                                }
                            }
                    }
                    else if (e.keyCode === WinJS.Utilities.Key.upArrow) {
                        for (var i = 0; i < results.length; i++)
                            if (results[i] !== this._currentlyFocusedItem) {
                                checkElementOffset = MS.Entertainment.Utilities.getRelativeOffset(results[i], this._element);
                                if (checkElementOffset && currentItemOffset.top > checkElementOffset.top)
                                    if (currentClosest) {
                                        if (currentItemOffset.top - checkElementOffset.top > currentItemOffset.top - currentClosest.top)
                                            continue;
                                        if (checkElementOffset.left >= currentItemOffset.left && checkElementOffset.left - currentItemOffset.left <= currentClosest.left - currentItemOffset.left)
                                            currentClosest = {
                                                element: results[i], left: checkElementOffset.left, top: checkElementOffset.top
                                            }
                                    }
                                    else if (checkElementOffset.left >= currentItemOffset.left)
                                        currentClosest = {
                                            element: results[i], left: checkElementOffset.left, top: checkElementOffset.top
                                        }
                            }
                    }
                    else if (e.keyCode === WinJS.Utilities.Key.home) {
                        currentClosest = {element: results[0]};
                        if (this._scroller)
                            this._scroller.scrollLeft = 0
                    }
                    else if (e.keyCode === WinJS.Utilities.Key.end) {
                        currentClosest = {element: results[results.length - 1]};
                        if (this._scroller)
                            this._scroller.scrollLeft = this._scroller.scrollWidth
                    }
                    else if (e.keyCode === WinJS.Utilities.Key.pageDown) {
                        currentEdge = this._currentlyFocusedItem.clientWidth + currentItemOffset.left;
                        for (var i = 0; i < results.length; i++)
                            if (results[i] !== this._currentlyFocusedItem) {
                                checkElementOffset = MS.Entertainment.Utilities.getRelativeOffset(results[i], this._element);
                                if (checkElementOffset && checkElementOffset.left - currentEdge >= 0)
                                    if (!MS.Entertainment.Utilities.isElementInHorizontalViewportOfParent(results[i], this._scroller)) {
                                        currentClosest = {element: results[i]};
                                        break
                                    }
                            }
                        if (!currentClosest)
                            currentClosest = {element: results[results.length - 1]}
                    }
                    else if (e.keyCode === WinJS.Utilities.Key.pageUp)
                        for (var i = 0; i < results.length; i++) {
                            if (results[i] !== this._currentlyFocusedItem) {
                                checkElementOffset = MS.Entertainment.Utilities.getRelativeOffset(results[i], this._element);
                                if (checkElementOffset) {
                                    checkElementRight = checkElementOffset.left + results[i].clientWidth;
                                    if (currentItemOffset.left - checkElementRight >= 0)
                                        if (!MS.Entertainment.Utilities.isElementInHorizontalViewportOfParent(results[i], this._scroller)) {
                                            currentClosest = {element: results[i]};
                                            break
                                        }
                                }
                            }
                            if (!currentClosest)
                                currentClosest = {element: results[0]}
                        }
                if (currentClosest && currentClosest.element)
                    this.setFocusedItem(currentClosest.element, true);
                else if (this._currentlyFocusedItem)
                    this.setFocusedItem(this._currentlyFocusedItem, true);
                e.preventDefault()
            }, getFocusedItem: function getFocusedItem() {
                if (!this._currentlyFocusedItem)
                    this.focusFirstItemInContainer(this._element);
                return this._currentlyFocusedItem
            }, setFocusedItem: function setFocusedItem(item, setStyle, skipSettingFocus) {
                if (item) {
                    this._setInternalFocusState(item, setStyle);
                    if (!skipSettingFocus && this._currentlyFocusedItem)
                        MS.Entertainment.UI.Framework.focusElement(this._currentlyFocusedItem)
                }
            }, _setInternalFocusState: function _setInternalFocusState(item, setStyle) {
                if (item) {
                    if (this._currentlyFocusedItem)
                        WinJS.Utilities.removeClass(this._currentlyFocusedItem, this._focusStyleClass);
                    this._currentlyFocusedItem = item;
                    if (this._currentlyFocusedItem && setStyle)
                        WinJS.Utilities.addClass(this._currentlyFocusedItem, this._focusStyleClass);
                    if (this._setTabIndex)
                        this.setTabIndexedItem(this._currentlyFocusedItem)
                }
            }, setTabIndexedItem: function setTabIndexedItem(element) {
                if (this._itemWithTabIndex)
                    this._itemWithTabIndex.setAttribute("tabindex", -1);
                if (element) {
                    element.setAttribute("tabindex", "0");
                    this._itemWithTabIndex = element
                }
            }, focusFirstItemInContainer: function focusFirstItemInContainer(container, setStyle, skipSettingFocus) {
                if (container && MS.Entertainment.UI.Framework.canMoveFocus(container)) {
                    var initialResults = container.querySelectorAll(".win-focusable");
                    var results = [];
                    var currentInitialItem = null;
                    for (var j = 0; j < initialResults.length; j++) {
                        currentInitialItem = initialResults[j];
                        if (this._checkItemValidTarget(currentInitialItem)) {
                            this.setFocusedItem(currentInitialItem, setStyle, skipSettingFocus);
                            break
                        }
                    }
                }
            }, _checkItemValidTarget: function _checkItemValidTarget(item) {
                if (item) {
                    var disabledAttribute = item.getAttribute("disabled");
                    return item.currentStyle && item.currentStyle.visibility !== "hidden" && item.currentStyle.display !== "none" && disabledAttribute !== "disabled" && disabledAttribute !== "" && item.clientHeight !== 0 && item.clientWidth !== 0
                }
                else
                    return false
            }, _handleClick: function _handleClick(e) {
                if (this._currentlyFocusedItem && this._currentlyFocusedItem.click && this._checkItemValidTarget(this._currentlyFocusedItem) && e.target && e.target.tagName && e.target.tagName.toLowerCase() !== "button") {
                    this._currentlyFocusedItem.click();
                    e.stopPropagation();
                    e.preventDefault()
                }
            }, _handleBlur: function _handleBlur(e) {
                if (this._currentlyFocusedItem && document.activeElement !== this._currentlyFocusedItem) {
                    WinJS.Utilities.removeClass(this._currentlyFocusedItem, this._focusStyleClass);
                    this._currentlyFocusedItem = null
                }
            }, _handleFocus: function _handleFocus(e) {
                var tryFocus = this._currentlyFocusedItem !== document.activeElement;
                if (tryFocus) {
                    var listViews = this._element.querySelectorAll(".win-listview");
                    for (var i = 0; i < listViews.length; i++)
                        if (listViews[i].contains(document.activeElement)) {
                            tryFocus = false;
                            break
                        }
                }
                if (tryFocus && document.activeElement.classList.contains("win-focusable"))
                    this._setInternalFocusState(document.activeElement, true)
            }
    }, {_validKeys: [WinJS.Utilities.Key.leftArrow, WinJS.Utilities.Key.rightArrow, WinJS.Utilities.Key.upArrow, WinJS.Utilities.Key.downArrow, WinJS.Utilities.Key.home, WinJS.Utilities.Key.end, WinJS.Utilities.Key.pageDown, WinJS.Utilities.Key.pageUp, WinJS.Utilities.Key.enter, WinJS.Utilities.Key.space, WinJS.Utilities.Key.g]})});
WinJS.Namespace.define("MS.Entertainment.Framework", {VerticalKeyboardNavigationManager: WinJS.Class.derive(MS.Entertainment.Framework.KeyboardNavigationManager, function VerticalKeyboardNavigationManager(element, scroller, setTabIndex) {
        this._element = element;
        this._scroller = scroller || element;
        this._setTabIndex = setTabIndex;
        if (!MS.Entertainment.Utilities.isApp2)
            this._element.addEventListener("keydown", this._handleKeyInput.bind(this));
        this._element.addEventListener("focusout", this._handleBlur.bind(this));
        this._element.addEventListener("focusin", this._handleFocus.bind(this))
    }, {_handleKeyInput: function _handleKeyInput(e) {
            if (MS.Entertainment.Framework.KeyboardNavigationManager._validKeys.indexOf(e.keyCode) === -1 || MS.Entertainment.Utilities.doesElementSupportKeyboardInput(document.activeElement))
                return;
            if (e.keyCode === WinJS.Utilities.Key.enter || e.keyCode === WinJS.Utilities.Key.space) {
                this._handleClick(e);
                return
            }
            var initialResults = this._element.querySelectorAll(".win-focusable");
            var results = [];
            var currentInitialItem = null;
            var initialItemAvailable = true;
            var currentIndex = 0;
            for (var j = 0; j < initialResults.length; j++) {
                currentInitialItem = initialResults[j];
                if (this._checkItemValidTarget(currentInitialItem))
                    results.push(currentInitialItem)
            }
            if (results.length < 1)
                return;
            if (!this._currentlyFocusedItem) {
                initialItemAvailable = false;
                for (var i = 0; i < results.length; i++)
                    if (MS.Entertainment.Utilities.isElementInVerticalViewportOfParent(results[i], this._scroller)) {
                        this._currentlyFocusedItem = results[i];
                        break
                    }
            }
            currentIndex = results.indexOf(this._currentlyFocusedItem);
            if (!this._currentlyFocusedItem && (e.keyCode !== WinJS.Utilities.Key.home && e.keyCode !== WinJS.Utilities.Key.end) || currentIndex < 0)
                return;
            var currentClosest = null;
            if (initialItemAvailable || (e.keyCode === WinJS.Utilities.Key.home) || (e.keyCode === WinJS.Utilities.Key.end))
                if (results.length === 1 && !e.ctrlKey)
                    currentClosest = {element: results[0]};
                else if (e.keyCode === WinJS.Utilities.Key.downArrow) {
                    if (currentIndex < results.length - 1)
                        currentClosest = {element: results[currentIndex + 1]}
                }
                else if (e.keyCode === WinJS.Utilities.Key.upArrow) {
                    if (currentIndex > 0)
                        currentClosest = {element: results[currentIndex - 1]}
                }
                else if (e.keyCode === WinJS.Utilities.Key.home) {
                    currentClosest = {element: results[0]};
                    if (this._scroller)
                        this._scroller.scrollLeft = 0
                }
                else if (e.keyCode === WinJS.Utilities.Key.end) {
                    currentClosest = {element: results[results.length - 1]};
                    if (this._scroller)
                        this._scroller.scrollLeft = this._scroller.scrollWidth
                }
            if (currentClosest && currentClosest.element)
                this.setFocusedItem(currentClosest.element, true);
            else if (this._currentlyFocusedItem)
                this.setFocusedItem(this._currentlyFocusedItem, true);
            e.preventDefault()
        }}, null)});
WinJS.Namespace.define("MS.Entertainment.Framework", {DashboardKeyboardNavigationManager: WinJS.Class.derive(MS.Entertainment.Framework.KeyboardNavigationManager, function DashboardKeyboardNavigationManager(element, scroller, setTabIndex) {
        this._element = element;
        this._scroller = scroller || element;
        this._setTabIndex = setTabIndex;
        if (!MS.Entertainment.Utilities.isApp2)
            this._element.addEventListener("keydown", this._handleKeyInput.bind(this));
        this._element.addEventListener("focusout", this._handleBlur.bind(this));
        this._element.addEventListener("focusin", this._handleFocus.bind(this))
    }, {
        _pivotsFocused: false, _handleKeyInput: function _handleKeyInput(e) {
                if (MS.Entertainment.Framework.KeyboardNavigationManager._validKeys.indexOf(e.keyCode) === -1 || MS.Entertainment.Utilities.doesElementSupportKeyboardInput(document.activeElement))
                    return;
                if (e.ctrlKey && e.altKey && e.keyCode === WinJS.Utilities.Key.g)
                    if (this._currentlyFocusedItem)
                        if (this._currentlyFocusedItem.getAttribute("data-ent-panelHeader") === "true" && this._currentlyFocusedItem.click)
                            this._currentlyFocusedItem.click();
                        else {
                            this._focusNearestPanelHeader(this._currentlyFocusedItem, true);
                            if (this._currentlyFocusedItem.getAttribute("data-ent-panelHeader") === "true")
                                this._handleClick(e)
                        }
                if (e.keyCode === WinJS.Utilities.Key.enter || e.keyCode === WinJS.Utilities.Key.space) {
                    this._handleClick(e);
                    return
                }
                if ((e.keyCode !== WinJS.Utilities.Key.home) && (e.keyCode !== WinJS.Utilities.Key.end) && this._currentlyFocusedItem && this._currentlyFocusedItem.getAttribute("data-ent-panelHeader") === "true")
                    if (e.keyCode === WinJS.Utilities.Key.downArrow)
                        this._focusFirstItemInPanelBody(this._currentlyFocusedItem, true);
                    else {
                        var initialPivotsResults = this._element.querySelectorAll("[data-ent-panelheader='true']");
                        var pivotsResults = [];
                        var initialItemIndex;
                        for (var j = 0; j < initialPivotsResults.length; j++) {
                            currentInitialItem = initialPivotsResults[j];
                            if (this._checkItemValidTarget(currentInitialItem))
                                pivotsResults.push(currentInitialItem)
                        }
                        initialItemIndex = pivotsResults.indexOf(this._currentlyFocusedItem);
                        if (pivotsResults.length > 0 && initialItemIndex >= 0)
                            if (e.keyCode === WinJS.Utilities.Key.leftArrow && !e.ctrlKey) {
                                if (initialItemIndex > 0)
                                    this.setFocusedItem(pivotsResults[initialItemIndex - 1], true)
                            }
                            else if (e.keyCode === WinJS.Utilities.Key.rightArrow && !e.ctrlKey)
                                if (initialItemIndex < pivotsResults.length - 1)
                                    this.setFocusedItem(pivotsResults[initialItemIndex + 1], true)
                    }
                else {
                    var initialResults = this._element.querySelectorAll(".win-focusable");
                    var results = [];
                    var currentInitialItem = null;
                    var initialItemAvailable = true;
                    for (var j = 0; j < initialResults.length; j++) {
                        currentInitialItem = initialResults[j];
                        if (this._checkItemValidTargetNoPivot(currentInitialItem))
                            results.push(currentInitialItem)
                    }
                    if (results.length < 1)
                        return;
                    if (!this._currentlyFocusedItem) {
                        initialItemAvailable = false;
                        for (var i = 0; i < results.length; i++)
                            if (MS.Entertainment.Utilities.isElementInHorizontalViewportOfParent(results[i], this._scroller)) {
                                this._currentlyFocusedItem = results[i];
                                break
                            }
                    }
                    var currentItemOffset = {
                            left: 0, top: 0
                        };
                    if (!this._currentlyFocusedItem && (e.keyCode !== WinJS.Utilities.Key.home && e.keyCode !== WinJS.Utilities.Key.end))
                        return;
                    else
                        currentItemOffset = MS.Entertainment.Utilities.getRelativeOffset(this._currentlyFocusedItem, this._element);
                    var checkElementOffset;
                    var checkElementRight;
                    var checkElementBottom;
                    var currentClosest = null;
                    var currentEdge;
                    var currentItemCheck = null;
                    var currentBestItemCheck = null;
                    var goingUp = false;
                    if ((initialItemAvailable && currentItemOffset) || (e.keyCode === WinJS.Utilities.Key.home) || (e.keyCode === WinJS.Utilities.Key.end))
                        if (results.length === 1 && !e.ctrlKey)
                            currentClosest = {element: results[0]};
                        else if (e.keyCode === WinJS.Utilities.Key.leftArrow && !e.ctrlKey) {
                            for (var i = 0; i < results.length; i++)
                                if (results[i] !== this._currentlyFocusedItem) {
                                    checkElementOffset = MS.Entertainment.Utilities.getRelativeOffset(results[i], this._element);
                                    if (checkElementOffset) {
                                        checkElementRight = checkElementOffset.left + results[i].clientWidth;
                                        if (currentItemOffset.left > checkElementOffset.left)
                                            if (currentClosest) {
                                                if (currentItemOffset.left - checkElementOffset.left > currentItemOffset.left - currentClosest.left)
                                                    continue;
                                                currentItemCheck = Math.abs(checkElementRight - currentItemOffset.left);
                                                currentBestItemCheck = Math.abs(currentClosest.right - currentItemOffset.left);
                                                if (currentItemCheck < currentBestItemCheck)
                                                    currentClosest = {
                                                        element: results[i], right: checkElementRight, left: checkElementOffset.left, top: checkElementOffset.top
                                                    };
                                                else if (currentItemCheck === currentBestItemCheck)
                                                    if (Math.abs(checkElementOffset.top - currentItemOffset.top) <= Math.abs(currentClosest.top - currentItemOffset.top))
                                                        currentClosest = {
                                                            element: results[i], right: checkElementRight, left: checkElementOffset.left, top: checkElementOffset.top
                                                        }
                                            }
                                            else
                                                currentClosest = {
                                                    element: results[i], right: checkElementRight, left: checkElementOffset.left, top: checkElementOffset.top
                                                }
                                    }
                                }
                        }
                        else if (e.keyCode === WinJS.Utilities.Key.rightArrow && !e.ctrlKey) {
                            currentEdge = this._currentlyFocusedItem.clientWidth + currentItemOffset.left;
                            for (var i = 0; i < results.length; i++)
                                if (results[i] !== this._currentlyFocusedItem) {
                                    checkElementOffset = MS.Entertainment.Utilities.getRelativeOffset(results[i], this._element);
                                    if (checkElementOffset) {
                                        checkElementRight = checkElementOffset.left + results[i].clientWidth;
                                        if (checkElementOffset.left > currentEdge)
                                            if (currentClosest) {
                                                if (checkElementOffset.left - currentEdge > currentClosest.left - currentEdge)
                                                    continue;
                                                currentItemCheck = Math.abs(checkElementOffset.left - currentEdge);
                                                currentBestItemCheck = Math.abs(currentClosest.left - currentEdge);
                                                if (currentItemCheck < currentBestItemCheck)
                                                    currentClosest = {
                                                        element: results[i], left: checkElementOffset.left, right: checkElementRight, top: checkElementOffset.top
                                                    };
                                                else if (currentItemCheck === currentBestItemCheck)
                                                    if (Math.abs(checkElementOffset.top - currentItemOffset.top) <= Math.abs(currentClosest.top - currentItemOffset.top))
                                                        currentClosest = {
                                                            element: results[i], left: checkElementOffset.left, right: checkElementRight, top: checkElementOffset.top
                                                        }
                                            }
                                            else
                                                currentClosest = {
                                                    element: results[i], left: checkElementOffset.left, right: checkElementRight, top: checkElementOffset.top
                                                }
                                    }
                                }
                        }
                        else if (e.keyCode === WinJS.Utilities.Key.downArrow) {
                            currentEdge = this._currentlyFocusedItem.clientHeight + currentItemOffset.top;
                            for (var i = 0; i < results.length; i++)
                                if (results[i] !== this._currentlyFocusedItem) {
                                    checkElementOffset = MS.Entertainment.Utilities.getRelativeOffset(results[i], this._element);
                                    if (checkElementOffset) {
                                        checkElementBottom = checkElementOffset.top + results[i].clientHeight;
                                        if (checkElementBottom > currentEdge)
                                            if (currentClosest) {
                                                if (checkElementBottom - currentEdge > currentClosest.bottom - currentEdge)
                                                    continue;
                                                if (checkElementOffset.left >= currentItemOffset.left && checkElementOffset.left - currentItemOffset.left < currentClosest.left - currentItemOffset.left)
                                                    currentClosest = {
                                                        element: results[i], left: checkElementOffset.left, bottom: checkElementBottom
                                                    }
                                            }
                                            else if (checkElementOffset.left >= currentItemOffset.left)
                                                currentClosest = {
                                                    element: results[i], left: checkElementOffset.left, bottom: checkElementBottom
                                                }
                                    }
                                }
                        }
                        else if (e.keyCode === WinJS.Utilities.Key.upArrow) {
                            goingUp = true;
                            for (var i = 0; i < results.length; i++)
                                if (results[i] !== this._currentlyFocusedItem) {
                                    checkElementOffset = MS.Entertainment.Utilities.getRelativeOffset(results[i], this._element);
                                    if (checkElementOffset && currentItemOffset.top > checkElementOffset.top)
                                        if (currentClosest) {
                                            if (currentItemOffset.top - checkElementOffset.top > currentItemOffset.top - currentClosest.top)
                                                continue;
                                            if (checkElementOffset.left >= currentItemOffset.left && checkElementOffset.left - currentItemOffset.left <= currentClosest.left - currentItemOffset.left)
                                                currentClosest = {
                                                    element: results[i], left: checkElementOffset.left, top: checkElementOffset.top
                                                }
                                        }
                                        else if (checkElementOffset.left >= currentItemOffset.left)
                                            currentClosest = {
                                                element: results[i], left: checkElementOffset.left, top: checkElementOffset.top
                                            }
                                }
                        }
                        else if (e.keyCode === WinJS.Utilities.Key.home) {
                            currentClosest = {element: results[0]};
                            if (this._scroller)
                                this._scroller.scrollLeft = 0
                        }
                        else if (e.keyCode === WinJS.Utilities.Key.end) {
                            currentClosest = {element: results[results.length - 1]};
                            if (this._scroller)
                                this._scroller.scrollLeft = this._scroller.scrollWidth
                        }
                        else if (e.keyCode === WinJS.Utilities.Key.pageDown) {
                            currentEdge = this._currentlyFocusedItem.clientWidth + currentItemOffset.left;
                            for (var i = 0; i < results.length; i++)
                                if (results[i] !== this._currentlyFocusedItem) {
                                    checkElementOffset = MS.Entertainment.Utilities.getRelativeOffset(results[i], this._element);
                                    if (checkElementOffset && checkElementOffset.left - currentEdge >= 0)
                                        if (!MS.Entertainment.Utilities.isElementInHorizontalViewportOfParent(results[i], this._scroller)) {
                                            currentClosest = {element: results[i]};
                                            break
                                        }
                                }
                            if (!currentClosest)
                                currentClosest = {element: results[results.length - 1]}
                        }
                        else if (e.keyCode === WinJS.Utilities.Key.pageUp)
                            for (var i = 0; i < results.length; i++) {
                                if (results[i] !== this._currentlyFocusedItem) {
                                    checkElementOffset = MS.Entertainment.Utilities.getRelativeOffset(results[i], this._element);
                                    if (checkElementOffset) {
                                        checkElementRight = checkElementOffset.left + results[i].clientWidth;
                                        if (currentItemOffset.left - checkElementRight >= 0)
                                            if (!MS.Entertainment.Utilities.isElementInHorizontalViewportOfParent(results[i], this._scroller)) {
                                                currentClosest = {element: results[i]};
                                                break
                                            }
                                    }
                                }
                                if (!currentClosest)
                                    currentClosest = {element: results[0]}
                            }
                }
                if (currentClosest && currentClosest.element)
                    this.setFocusedItem(currentClosest.element, true);
                else if (goingUp)
                    this._focusNearestPanelHeader(this._currentlyFocusedItem, true);
                else if (this._currentlyFocusedItem)
                    this.setFocusedItem(this._currentlyFocusedItem, true);
                e.preventDefault()
            }, _findParentContainer: function _findParentContainer(item) {
                var ancestor = item;
                var container = null;
                do {
                    if (ancestor.domElement)
                        ancestor = ancestor.domElement;
                    if (ancestor.getAttribute("data-ent-dashboardpanel") === "true") {
                        container = ancestor;
                        break
                    }
                    ancestor = ancestor.parentNode
                } while (ancestor);
                return container
            }, _focusNearestPanelHeader: function _focusNearestPanelHeader(item, setStyle) {
                var container = this._findParentContainer(item);
                var panelHeader;
                if (container)
                    this.focusFirstItemInContainer(container.querySelector(".panelTitle"), setStyle)
            }, _focusFirstItemInPanelBody: function _focusFirstItemInPanelBody(item, setStyle) {
                var container = this._findParentContainer(item);
                var panelHeader;
                if (container)
                    this.focusFirstItemInContainer(container.querySelector(".panelContainer"), setStyle)
            }, _checkItemValidTargetNoPivot: function _checkItemValidTargetNoPivot(item) {
                if (item) {
                    var disabledAttribute = item.getAttribute("disabled");
                    var pivotAttribute = item.getAttribute("data-ent-panelheader");
                    return item.currentStyle && pivotAttribute !== "true" && item.currentStyle.visibility !== "hidden" && item.currentStyle.display !== "none" && disabledAttribute !== "disabled" && disabledAttribute !== "" && item.clientHeight !== 0 && item.clientWidth !== 0
                }
                else
                    return false
            }
    }, null)})
