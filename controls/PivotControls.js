/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/utilities.js", "/Controls/listControls.js");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.Controls", {
        PivotsControl: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.ItemsControl, null, function pivotsControlConstructor() {
            this._keyDown = this._keyDown.bind(this);
            this._onGlobalKeyDown = this._onGlobalKeyDown.bind(this);
            this.domElement.addEventListener("keydown", this._keyDown);
            if (MS.Entertainment.Utilities.isApp2)
                this.selectedIndex = 0
        }, {
            _applyItemTemplateCounter: 0, focusItemOnSelectedIndexChanged: true, manageDownNavigation: false, delayListeningForGlobalNavigation: false, _globalHandlerEvents: null, focusOverrideData: {down: '.currentPage .modifierControl:not([tabIndex=\'-1\'])'}, controlName: "PivotsControl", initialize: function initialize() {
                    MS.Entertainment.UI.Controls.ItemsControl.prototype.initialize.call(this, arguments);
                    this.bind("selectedIndex", this._selectedIndexChanged.bind(this));
                    if (!this.delayListeningForGlobalNavigation)
                        this._listenForGlobalNavigation()
                }, applyItemTemplate: function applyItemTemplate(container, dataContext, index) {
                    var child = container.children[0];
                    child.setAttribute("data-win-automationId", (dataContext.moniker || dataContext.title) + "_twist");
                    child.pivotPropertyChangeHandler = this._onPropertyChange.bind(this);
                    child.attachEvent("onpropertychange", child.pivotPropertyChangeHandler);
                    if (MS.Entertainment.Utilities.isApp2 && this.manageDownNavigation && this.focusOverrideData)
                        child.setAttribute("data-win-focus", JSON.stringify(this.focusOverrideData));
                    if (this.selectedIndex === this._applyItemTemplateCounter) {
                        child.setAttribute("tabindex", "0");
                        WinJS.Utilities.addClass(child, "selected");
                        child.setAttribute("aria-selected", true);
                        if (this.focusItemOnSelectedIndexChanged)
                            MS.Entertainment.UI.Framework.focusElement(child)
                    }
                    this._applyItemTemplateCounter++;
                    return container
                }, setTabPanel: function setTabPanel(tabPanel) {
                    for (var i = 0; i < this.domElement.children.length; i++)
                        MS.Entertainment.Framework.AccUtils.createAndAddAriaLink(this._getChildDomElement(i), tabPanel, "aria-controls")
                }, enableGlobalNavigation: function enableGlobalNavigation() {
                    this._listenForGlobalNavigation()
                }, _onPropertyChange: function _onPropertyChange(event) {
                    if (event && event.propertyName === "aria-selected")
                        if (event.srcElement.getAttribute("aria-selected") === "true")
                            if (this.focusItemOnSelectedIndexChanged) {
                                MS.Entertainment.UI.Framework.focusElement(event.srcElement);
                                event.srcElement.click()
                            }
                }, unload: function unload() {
                    for (var i = 0; i < this.domElement.children.length; i++) {
                        var childElement = this._getChildDomElement(i);
                        childElement.detachEvent("onpropertychange", childElement.pivotPropertyChangeHandler);
                        childElement.pivotPropertyChangeHandler = null
                    }
                    this._stopListeningForGlobalNavigation();
                    MS.Entertainment.UI.Controls.ItemsControl.prototype.unload.call(this)
                }, freeze: function freeze() {
                    MS.Entertainment.UI.Controls.ItemsControl.prototype.freeze.call(this);
                    this._stopListeningForGlobalNavigation()
                }, thaw: function thaw() {
                    MS.Entertainment.UI.Controls.ItemsControl.prototype.thaw.call(this);
                    this._listenForGlobalNavigation()
                }, _listenForGlobalNavigation: function _listenForGlobalNavigation() {
                    if (!MS.Entertainment.Utilities.isApp2)
                        return;
                    var currentPage = MS.Entertainment.Utilities.findParentElementByClassName(this.domElement, "currentPage");
                    if (!currentPage)
                        return;
                    this._globalHandlerEvents = MS.Entertainment.Utilities.addEventHandlers(currentPage, {keydown: this._onGlobalKeyDown})
                }, _stopListeningForGlobalNavigation: function _stopListeningForGlobalNavigation() {
                    if (!MS.Entertainment.Utilities.isApp2)
                        return;
                    if (!this._globalHandlerEvents)
                        return;
                    this._globalHandlerEvents.cancel()
                }, focusLogicalRight: function focusLogicalRight() {
                    if (MS.Entertainment.Utilities.getTextDirection() === MS.Entertainment.Utilities.TextDirections.RightToLeft) {
                        this.focusLogicalLeftFunction();
                        return
                    }
                    if (this.selectedIndex < this.domElement.children.length - 1) {
                        var childElement = this._getChildDomElement(this.selectedIndex + 1);
                        if (MS.Entertainment.Utilities.isApp2)
                            childElement.setAttribute("tabindex", 0);
                        if (!MS.Entertainment.Utilities.isApp2 || this.domElement.contains(document.activeElement))
                            MS.Entertainment.UI.Framework.focusElement(childElement);
                        childElement.click()
                    }
                }, focusLogicalLeft: function focusLogicalLeft() {
                    if (MS.Entertainment.Utilities.getTextDirection() === MS.Entertainment.Utilities.TextDirections.RightToLeft)
                        this.focusLogicalRightFunction();
                    if (this.selectedIndex > 0) {
                        var childElement = this._getChildDomElement(this.selectedIndex - 1);
                        if (MS.Entertainment.Utilities.isApp2)
                            childElement.setAttribute("tabindex", 0);
                        if (!MS.Entertainment.Utilities.isApp2 || this.domElement.contains(document.activeElement))
                            MS.Entertainment.UI.Framework.focusElement(childElement);
                        childElement.click()
                    }
                }, _onGlobalKeyDown: function _onGlobalKeyDown(e) {
                    if (MS.Entertainment.Utilities.getDirectionFromGlobalKeyInput(e))
                        this._keyDown(e);
                    return
                }, _keyDown: function _keyDown(e) {
                    if (MS.Entertainment.Utilities.isApp1 && e.altKey)
                        return;
                    switch (e.keyCode) {
                        case WinJS.Utilities.Key.rightArrow:
                        case WinJS.Utilities.Key.rArrow:
                        case WinJS.Utilities.Key.rOtherArrow:
                        case WinJS.Utilities.Key.rGlobal:
                        case WinJS.Utilities.Key.pageDown:
                            this.focusLogicalRight();
                            break;
                        case WinJS.Utilities.Key.leftArrow:
                        case WinJS.Utilities.Key.lArrow:
                        case WinJS.Utilities.Key.lOtherArrow:
                        case WinJS.Utilities.Key.lGlobal:
                        case WinJS.Utilities.Key.pageUp:
                            this.focusLogicalLeft();
                            break;
                        default:
                            return
                    }
                    e.stopPropagation();
                    e.preventDefault()
                }, _selectedIndexChanged: function _selectedIndexChanged(newIndex, oldIndex) {
                    for (var i = 0; i < this.domElement.children.length; i++) {
                        var childElement = this._getChildDomElement(i);
                        WinJS.Utilities.removeClass(childElement, "selected");
                        childElement.setAttribute("tabindex", -1);
                        childElement.setAttribute("aria-selected", false)
                    }
                    var newSelectedChildElement = this._getChildDomElement(newIndex);
                    if (newSelectedChildElement) {
                        WinJS.Utilities.addClass(newSelectedChildElement, "selected");
                        newSelectedChildElement.setAttribute("tabindex", "0");
                        newSelectedChildElement.setAttribute("aria-selected", true);
                        if (this.focusItemOnSelectedIndexChanged)
                            MS.Entertainment.UI.Framework.focusElement(newSelectedChildElement);
                        this.selectedIndex = newIndex
                    }
                }, _getChildDomElement: function _getChildDomElement(index) {
                    if (index >= 0 && index < this.domElement.children.length)
                        return this.domElement.children[index].children[0];
                    return null
                }, _selectedIndex: -1, selectedIndex: {
                    get: function() {
                        return this._selectedIndex
                    }, set: function(val) {
                            if (val === this._selectedIndex)
                                return;
                            var old = this._selectedIndex;
                            this._selectedIndex = val;
                            this.notify("selectedIndex", val, old)
                        }
                }
        }, {}), VerticalPivotControl: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.ItemsControlWithViewModel, null, null, {
                _expandedItems: null, _expandBindings: null, _navigationControlEvents: null, _navigationControlBindings: null, _dividerTemplateProvider: null, _selectionManagerHandlers: null, _selectionManager: null, _tabPanelId: null, keyboardNavigable: true, keyboardNavigationManagerClass: MS.Entertainment.Framework.VerticalKeyboardNavigationManager, keyboardNavigationSetTabIndex: true, focusItemOnSelectedIndexChanged: true, containerStyle: MS.Entertainment.UI.Controls.ItemsControl.ContainerStyles.verticalFlow, itemTemplate: "Controls/PivotControls.html#verticalPivotButtonTemplate", dividerTemplate: "Controls/PivotControls.html#verticalDividerTemplate", initialize: function initialize() {
                        MS.Entertainment.UI.Controls.ItemsControlWithViewModel.prototype.initialize.call(this);
                        this._navigationControlEvents = MS.Entertainment.Utilities.addEvents(this, {
                            click: this._onClick.bind(this), keydown: this._onKeyDown.bind(this)
                        })
                    }, unload: function unload() {
                        if (this._navigationControlBindings) {
                            this._navigationControlBindings.cancel();
                            this._navigationControlBindings = null
                        }
                        if (this._expandBindings) {
                            this._expandBindings.cancel();
                            this._expandBindings = null
                        }
                        if (this._navigationControlEvents) {
                            this._navigationControlEvents.cancel();
                            this._navigationControlEvents = null
                        }
                        for (var i = 0; i < this.domElement.children.length; i++)
                            this._detachItemListeners(this.domElement.children[i]);
                        MS.Entertainment.UI.Controls.ItemsControlWithViewModel.prototype.unload.call(this)
                    }, selectionManager: {
                        get: function() {
                            return this._selectionManager
                        }, set: function(value) {
                                if (this._selectionManager !== value) {
                                    var oldValue = this._selectionManager;
                                    this._selectionManager = value;
                                    if (this._navigationControlBindings) {
                                        this._navigationControlBindings.cancel();
                                        this._navigationControlBindings = null
                                    }
                                    this._navigationControlBindings = WinJS.Binding.bind(this._selectionManager, {
                                        dataSource: this._selectionManagerDataSourceChangeHandler.bind(this), selectedIndex: this._expand.bind(this)
                                    });
                                    this.notify("selectionManager", value, oldValue)
                                }
                            }
                    }, loadItemTemplate: function loadItemTemplate() {
                        var completePromise;
                        if (!this._dividerTemplateProvider)
                            completePromise = this._loadTemplate(this.dividerTemplate);
                        else
                            completePromise = WinJS.Promise.wrap(this._dividerTemplateProvider);
                        return completePromise.then(function baseLoadTemplate(template) {
                                this._dividerTemplateProvider = template;
                                return MS.Entertainment.UI.Controls.ItemsControlWithViewModel.prototype.loadItemTemplate.apply(this)
                            }.bind(this))
                    }, selectTemplate: function(item) {
                        return this.loadItemTemplate().then(function() {
                                if (item && WinJS.Binding.unwrap(item.data) === MS.Entertainment.Controls.VerticalPivotControl.divider)
                                    return this._dividerTemplateProvider;
                                else
                                    return this._itemTemplateProvider
                            }.bind(this))
                    }, applyItemTemplate: function applyItemTemplate(container, dataContext) {
                        var item = this._item(dataContext.index);
                        if (item) {
                            item.tabPanelId = this._tabPanelId;
                            if (container) {
                                var buttonElement = this._getButtonElementFromItem(container);
                                if (buttonElement) {
                                    var automationId = this._getAutomationId(item);
                                    if (automationId)
                                        buttonElement.setAttribute("data-win-automationId", automationId + "_view");
                                    buttonElement.pivotPropertyChangeHandler = this._onPropertyChange.bind(this);
                                    buttonElement.attachEvent("onpropertychange", buttonElement.pivotPropertyChangeHandler);
                                    if (item.selected)
                                        WinJS.Promise.timeout().done(function _setTabIndexOnSelectedItem() {
                                            this._keyboardNavigationManager.setTabIndexedItem(buttonElement)
                                        }.bind(this))
                                }
                            }
                        }
                        return container
                    }, _getButtonElementFromItem: function _getButtonElementFromItem(element) {
                        if (element.firstElementChild)
                            return element.firstElementChild.firstElementChild;
                        return null
                    }, _onPropertyChange: function _onPropertyChange(event) {
                        if (event && event.propertyName === "aria-selected" && event.srcElement.getAttribute("aria-selected") === "true") {
                            if (this.focusItemOnSelectedIndexChanged)
                                MS.Entertainment.UI.Framework.focusElement(event.srcElement);
                            if (event.srcElement.winControl) {
                                var index = this._findIndexFromControl(event.srcElement.winControl);
                                if (index !== this.selectionManager.selectedIndex)
                                    this._selectItemAt(index)
                            }
                        }
                    }, _selectItemAt: function _selectItemAt(index) {
                        if (this.selectionManager && this._isValidIndex(index))
                            if (index !== this.selectionManager.selectedIndex) {
                                var item = this._item(index) || {};
                                if (!item.isDisabled)
                                    this.selectionManager.selectedIndex = index
                            }
                            else if (this._expandedItems && this._expandedItems.indexOf(this._item(index)) < 0)
                                this._unexpand();
                            else
                                this._expand(index)
                    }, _nextValidIndex: function _nextValidIndex(direction) {
                        var newIndex = 0;
                        if (this.selectionManager && this.selectionManager.dataSource) {
                            var newItem = null;
                            var firstIndex = this.selectionManager.selectedIndex;
                            newIndex = firstIndex;
                            do {
                                newIndex += direction;
                                if (this._isValidIndex(newIndex))
                                    newItem = this._item(newIndex);
                                else {
                                    newIndex = firstIndex;
                                    break
                                }
                            } while (!newItem || newItem.isDisabled)
                        }
                        return newIndex
                    }, setTabPanelId: function setTabPanelId(tabPanelId) {
                        this._tabPanelId = tabPanelId
                    }, _onClick: function _onClick(args) {
                        if (args.target && args.target.winControl) {
                            var index = this._findIndexFromControl(args.target.winControl);
                            this._selectItemAt(index)
                        }
                    }, _onKeyDown: function _onKeyDown(e) {
                        if (!this._keyboardNavigationManager)
                            return;
                        if (e.keyCode === WinJS.Utilities.Key.rightArrow) {
                            var focusedItem = this._keyboardNavigationManager.getFocusedItem();
                            var index = focusedItem ? this._findIndexFromControl(focusedItem.winControl) : -1;
                            if (this._isValidIndex(index) && !this._isSubItem(index)) {
                                var item = this._item(index);
                                if (item && "items" in item)
                                    if (!item.expanded) {
                                        if (this.selectionManager.selectedIndex !== index)
                                            this.selectionManager.selectedIndex = index;
                                        this._expand(index)
                                    }
                                    else if (this._expandedItems && this._expandedItems.length) {
                                        var firstChildIndex = index + 2;
                                        this._keyboardNavigationManager.setFocusedItem(this.domElement.children[firstChildIndex], true)
                                    }
                            }
                        }
                        else if (e.keyCode === WinJS.Utilities.Key.leftArrow) {
                            var focusedItem = this._keyboardNavigationManager.getFocusedItem();
                            var index = this._findIndexFromControl(focusedItem.winControl);
                            if (this._isValidIndex(index))
                                if (this._isSubItem(index)) {
                                    var parentIndex = this._indexOf(this._expandedItems[0]) - 1;
                                    this._keyboardNavigationManager.setFocusedItem(this.domElement.children[parentIndex], true)
                                }
                                else {
                                    var item = this._item(index);
                                    if (item && item.expanded) {
                                        if (this.selectionManager.selectedIndex !== index)
                                            this.selectionManager.selectedIndex = index;
                                        this._unexpand()
                                    }
                                }
                        }
                    }, _findIndexFromControl: function _findIndexFromControl(winControl) {
                        var result;
                        if (!winControl)
                            return -1;
                        if (winControl.data)
                            result = this._indexOf(winControl.data);
                        if (!result && !isNaN(winControl.index))
                            result = winControl.index;
                        return result
                    }, _selectionManagerDataSourceChangeHandler: function _selectionManagerDataSourceChangeHandler(newValue, oldValue) {
                        if (newValue)
                            this.dataSource = newValue;
                        else if (this.dataSource === oldValue)
                            this.dataSource = null
                    }, _listChangedHandler: function _listChangedHandler(newValue, oldValue) {
                        if (this.selectionManager && newValue)
                            this.selectionManager.dataSource = newValue;
                        MS.Entertainment.UI.Controls.ItemsControlWithViewModel.prototype._listChangedHandler.apply(this, arguments)
                    }, _detachItemListeners: function _detachItemListeners(element) {
                        var buttonElement = this._getButtonElementFromItem(element);
                        if (buttonElement) {
                            buttonElement.detachEvent("onpropertychange", buttonElement.pivotPropertyChangeHandler);
                            buttonElement.pivotPropertyChangeHandler = null
                        }
                    }, _handleItemRemoved: function _handleItemRemoved(element) {
                        if (element)
                            this._detachItemListeners(element)
                    }, _item: function _item(index) {
                        return this._isValidIndex(index) ? (Array.isArray(this.selectionManager.dataSource) ? this.selectionManager.dataSource[index] : this.selectionManager.dataSource.item(index)) : null
                    }, _isSubItem: function _isChildItem(index) {
                        return this._expandedItems && this._expandedItems.indexOf(this._item(index)) >= 0
                    }, _indexOf: function _indexOf(item) {
                        var result = -1;
                        if (this.selectionManager && this.selectionManager.dataSource) {
                            result = this.selectionManager.dataSource.indexOf(item);
                            if (result < 0)
                                result = this.selectionManager.dataSource.indexOf(WinJS.Binding.as(item))
                        }
                        return result
                    }, _lastIndexOf: function _indexOf(item, fromIndex) {
                        var result = -1;
                        if (this.selectionManager && this.selectionManager.dataSource) {
                            result = this.selectionManager.dataSource.lastIndexOf(item, fromIndex);
                            if (result < 0)
                                result = this.selectionManager.dataSource.lastIndexOf(WinJS.Binding.as(item))
                        }
                        return result
                    }, _expand: function _expand(index, oldIndex, preventBinding) {
                        WinJS.Promise.timeout().done(function _updateTabIndexedItem() {
                            if (index >= 0 && index < this.domElement.children.length) {
                                var child = this.domElement.children[index];
                                if (child)
                                    this._keyboardNavigationManager.setTabIndexedItem(child.querySelector(".win-focusable"))
                            }
                        }.bind(this));
                        var item = this._item(index);
                        if (item && oldIndex !== undefined && !preventBinding) {
                            var telemetryParameters = {
                                    title: this._getAutomationId(item), automationId: MS.Entertainment.UI.AutomationIds.verticalPivotSelected
                                };
                            MS.Entertainment.Utilities.Telemetry.logCommandClicked(telemetryParameters)
                        }
                        if (this._expandedItems && (this._expandedItems.indexOf(this._item(index + 1)) >= 0 || this._expandedItems.indexOf(item) >= 0))
                            return;
                        this._unexpand();
                        if (this._expandBindings) {
                            this._expandBindings.cancel();
                            this._expandBindings = null
                        }
                        if (item && item.items && item.items.length !== 0 && this.selectionManager.selectedIndex === index) {
                            this._expandedItems = this._addExpandedItems(index + 1, item.items);
                            if ("expanded" in item)
                                item.expanded = true
                        }
                        else if (!preventBinding && item && this.selectionManager.selectedIndex === index)
                            this._expandBindings = WinJS.Binding.bind(item, {items: function(newValue, oldValue) {
                                    if (oldValue !== undefined)
                                        this._expand(index, oldIndex, true)
                                }.bind(this)})
                    }, _unexpand: function _unexpand() {
                        var items = this._expandedItems;
                        this._expandedItems = null;
                        if (!items || !items.length || !this.selectionManager || !this.selectionManager.dataSource)
                            return;
                        var startIndex = this._indexOf(items[0]);
                        var endIndex = this._lastIndexOf(items[items.length - 1], startIndex + items.length - 1);
                        var expandedItem = this._item(startIndex - 1);
                        if (startIndex >= 0 && endIndex >= 0 && endIndex >= startIndex)
                            this.selectionManager.dataSource.splice(startIndex, endIndex - startIndex + 1);
                        if (expandedItem) {
                            if ("childIds" in expandedItem)
                                expandedItem.childIds = null;
                            if ("expanded" in expandedItem)
                                expandedItem.expanded = false
                        }
                    }, _addExpandedItems: function _addExpandedItems(index, items) {
                        if (!items || !items.length || !this.selectionManager || !this.selectionManager.dataSource)
                            return null;
                        var parentItem = this._item(index - 1);
                        var divider = MS.Entertainment.Controls.VerticalPivotControl.divider;
                        var result = [divider].concat(items, [divider]);
                        var args = [index, 0].concat(result);
                        this.selectionManager.dataSource.splice.apply(this.selectionManager.dataSource, args);
                        if (parentItem && "childIds" in parentItem) {
                            parentItem.childIds = [];
                            for (var i = index + 1; i < index + items.length + 1; i++) {
                                var childElement = this.domElement.children[i];
                                MS.Entertainment.Framework.AccUtils.createAriaLinkId(childElement);
                                parentItem.childIds.push(childElement.id)
                            }
                        }
                        return result
                    }, _isValidIndex: function _isValidIndex(index) {
                        return this.selectionManager && this.selectionManager.dataSource && this.selectionManager.dataSource.length > index && index >= 0
                    }, _getAutomationId: function _getAutomationId(item) {
                        return item.id || (item.isRoot ? MS.Entertainment.UI.AutomationIds.genrePivot : MS.Entertainment.UI.AutomationIds.subgenrePivot)
                    }
            }, {}, {divider: {divider: true}})
    });
    WinJS.Namespace.define("MS.Entertainment.Controls", {HorizontalPivotControl: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.Controls.VerticalPivotControl, null, function() {
            this._onGlobalKeyDown = this._onGlobalKeyDown.bind(this)
        }, {
            _globalHandlerEvents: null, focusOverrideData: {down: '.currentPage .modifierControl:not([tabIndex=\'-1\'])'}, initialize: function initialize() {
                    MS.Entertainment.Controls.VerticalPivotControl.prototype.initialize.apply(this, arguments);
                    this._listenForGlobalNavigation()
                }, unload: function unload() {
                    this._stopListeningForGlobalNavigation();
                    MS.Entertainment.Controls.VerticalPivotControl.prototype.unload.call(this)
                }, freeze: function freeze() {
                    MS.Entertainment.Controls.VerticalPivotControl.prototype.freeze.call(this);
                    this._stopListeningForGlobalNavigation()
                }, thaw: function thaw() {
                    MS.Entertainment.Controls.VerticalPivotControl.prototype.thaw.call(this);
                    this._listenForGlobalNavigation()
                }, applyItemTemplate: function applyItemTemplate(container, dataContext) {
                    var result = MS.Entertainment.Controls.VerticalPivotControl.prototype.applyItemTemplate.apply(this, arguments);
                    var child = result.querySelector("button");
                    if (child && MS.Entertainment.Utilities.isApp2 && this.focusOverrideData)
                        child.setAttribute("data-win-focus", JSON.stringify(this.focusOverrideData));
                    return result
                }, _listenForGlobalNavigation: function _listenForGlobalNavigation() {
                    if (!MS.Entertainment.Utilities.isApp2)
                        return;
                    var currentPage = MS.Entertainment.Utilities.findParentElementByClassName(this.domElement, "currentPage");
                    if (!currentPage)
                        return;
                    this._globalHandlerEvents = MS.Entertainment.Utilities.addEventHandlers(currentPage, {keydown: this._onGlobalKeyDown})
                }, _stopListeningForGlobalNavigation: function _stopListeningForGlobalNavigation() {
                    if (!MS.Entertainment.Utilities.isApp2)
                        return;
                    if (!this._globalHandlerEvents)
                        return;
                    this._globalHandlerEvents.cancel()
                }, _expand: function _expand(index, oldIndex, preventBinding) {
                    MS.Entertainment.Controls.VerticalPivotControl.prototype._expand.apply(this, arguments);
                    var unselectedItems = WinJS.Utilities.query("button:not(.selected)", this.domElement);
                    unselectedItems.forEach(function(item) {
                        item.tabIndex = -1
                    })
                }, _onGlobalKeyDown: function _onGlobalKeyDown(e) {
                    switch (e.keyCode) {
                        case WinJS.Utilities.Key.rGlobal:
                        case WinJS.Utilities.Key.lGlobal:
                            this._onKeyDown(e);
                            break;
                        case WinJS.Utilities.Key.pageUp:
                        case WinJS.Utilities.Key.pageDown:
                            if (e.altKey)
                                this._onKeyDown(e);
                            break
                    }
                    return
                }, _onKeyDown: function _onKeyDown(e) {
                    if (!this._keyboardNavigationManager)
                        return;
                    if (MS.Entertainment.Utilities.isApp1 && e.altKey)
                        return;
                    switch (e.keyCode) {
                        case WinJS.Utilities.Key.rightArrow:
                        case WinJS.Utilities.Key.rArrow:
                        case WinJS.Utilities.Key.rOtherArrow:
                        case WinJS.Utilities.Key.rGlobal:
                        case WinJS.Utilities.Key.pageDown:
                            this._selectItemAt(this._nextValidIndex(1));
                            break;
                        case WinJS.Utilities.Key.leftArrow:
                        case WinJS.Utilities.Key.lArrow:
                        case WinJS.Utilities.Key.lOtherArrow:
                        case WinJS.Utilities.Key.lGlobal:
                        case WinJS.Utilities.Key.pageUp:
                            this._selectItemAt(this._nextValidIndex(-1));
                            break;
                        default:
                            return
                    }
                    e.stopPropagation()
                }, containerStyle: MS.Entertainment.UI.Controls.ItemsControl.ContainerStyles.horizontalFlow, itemTemplate: "Controls/PivotControls.html#horizontalPivotButtonTemplate", dividerTemplate: "Controls/PivotControls.html#horizontalDividerTemplate"
        })})
})()
