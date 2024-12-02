/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/debug.js", "/Framework/shell.js", "/Framework/selectionManager.js");
(function() {
    var modifierAlreadyOpen = false;
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {
        Modifier: MS.Entertainment.UI.Framework.defineUserControl("Controls/Modifier.html#modifierTemplate", function modifierConstructor() {
            this._observableArrayChanged = this._observableArrayChanged.bind(this);
            this.selectionManager = new MS.Entertainment.Framework.SelectionManager
        }, {
            _selectionManagerBindings: null, openPopup: null, minItems: 0, showDescription: true, _tabPanel: null, isBeingDismissed: false, _selectionManager: null, identifier: "", initialize: function initialize() {
                    this.bind("items", this._itemsChanged.bind(this));
                    this.bind("selectedItem", this._selectedItemChanged.bind(this));
                    this.bind("descriptionLabel", this._descriptionLabelChanged.bind(this));
                    this.bind("descriptionLabelText", this._descriptionLabelChanged.bind(this));
                    this.bind("isRoamingSetting", this._settingsChanged.bind(this));
                    this.bind("settingsKey", this._settingsChanged.bind(this))
                }, unload: function unload() {
                    this.isBeingDismissed = true;
                    if (this.openPopup)
                        this.openPopup.hide();
                    if (this._selectionManagerBindings) {
                        this._selectionManagerBindings.cancel();
                        this._selectionManagerBindings = null
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, freeze: function freeze() {
                    this.isBeingDismissed = true;
                    if (this.openPopup)
                        this.openPopup.hide();
                    MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this)
                }, thaw: function thaw() {
                    MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                    this.isBeingDismissed = false
                }, selectionManager: {
                    get: function() {
                        return this._selectionManager
                    }, set: function(value) {
                            if (this._selectionManager !== value) {
                                var oldValue = this._selectionManager;
                                this._selectionManager = value;
                                if (this._selectionManagerBindings) {
                                    this._selectionManagerBindings.cancel();
                                    this._selectionManagerBindings = null
                                }
                                this._selectionManagerBindings = WinJS.Binding.bind(this._selectionManager, {selectedIndex: this._selectionManagerSelectionChanged.bind(this)});
                                this.notify("selectionManager", value, oldValue)
                            }
                        }
                }, _settingsChanged: function settingsChanged() {
                    if (this._selectionManager && this.settingsKey) {
                        this._selectionManager.isRoamingSetting = this.isRoamingSetting;
                        this._selectionManager.settingsKey = this.settingsKey
                    }
                }, _itemsChanged: function _itemsChanged(newValue, oldValue) {
                    if (oldValue && oldValue instanceof MS.Entertainment.ObservableArray)
                        oldValue.removeChangeListener(this._observableArrayChanged);
                    if (newValue && newValue instanceof MS.Entertainment.ObservableArray)
                        newValue.addChangeListener(this._observableArrayChanged);
                    if (this.selectionManager)
                        if (this.selectionManager.dataSource !== this.items) {
                            this.selectionManager.settingsKey = this.settingsKey;
                            this.selectionManager.dataSource = this.items
                        }
                    this._constrainSelectedItem();
                    this._updateArrowVisibility();
                    this._updateControlVisibility();
                    if (!isNaN(this.tabIndex) && this._modifierContainer)
                        if (this.items && this.items.length > 1) {
                            this._modifierContainer.setAttribute("tabindex", this.tabIndex);
                            this._modifierContainer.setAttribute("aria-haspopup", true)
                        }
                        else {
                            this._modifierContainer.setAttribute("tabIndex", -1);
                            this._modifierContainer.removeAttribute("aria-haspopup")
                        }
                }, _observableArrayChanged: function _observableArrayChanged() {
                    this._constrainSelectedItem();
                    this._updateArrowVisibility();
                    this._updateControlVisibility()
                }, _selectedItemChanged: function _selectedItemChanged() {
                    var label;
                    var labelType;
                    this._constrainSelectedItem();
                    if (this.selectionManager)
                        this.selectionManager.selectedItem = this.selectedItem;
                    label = this.selectedItem ? this.selectedItem.label : "";
                    labelType = typeof label;
                    switch (labelType) {
                        case"string":
                            break;
                        case"number":
                            label = String.load(label);
                            break;
                        default:
                            MS.Entertainment.UI.Controls.assert(false, "Unrecognized label type in modifier control.");
                            break
                    }
                    this.labelControl.textContent = label;
                    (new Microsoft.Entertainment.Instrumentation.Providers.Shell).traceModifierControl_SelectionChanged(label, this.identifier)
                }, _selectionManagerSelectionChanged: function _selectionManagerSelectionChanged(newValue, oldValue) {
                    if (oldValue !== undefined && (!this.selectedItem || this.selectedItem !== this.selectionManager.selectedItem))
                        this.selectedItem = this.selectionManager.selectedItem
                }, _descriptionLabelChanged: function _descriptionLabelChanged() {
                    if (!this.showDescription)
                        return;
                    if (this.descriptionLabel) {
                        this.labelDescription.textContent = String.load(this.descriptionLabel);
                        this.descriptionLabelVisible = true
                    }
                    else if (this.descriptionLabelText) {
                        this.labelDescription.textContent = this.descriptionLabelText;
                        this.descriptionLabelVisible = true
                    }
                    else
                        this.descriptionLabelVisible = false
                }, _constrainSelectedItem: function _constrainSelectedItem() {
                    if (!this.items)
                        this.selectedItem = null;
                    else if (this.items.length <= this.minItems)
                        this.selectedItem = null;
                    else if (this.items instanceof MS.Entertainment.ObservableArray) {
                        var found = false;
                        for (var i = 0; i < this.items.length; i++)
                            if (this.items.item(i) === this.selectedItem || this.items.item(i) === WinJS.Binding.unwrap(this.selectedItem)) {
                                found = true;
                                break
                            }
                        if (!found)
                            this.selectedItem = this.selectionManager.selectedItem || this.items.item(0)
                    }
                    else if (this.items.indexOf(WinJS.Binding.unwrap(this.selectedItem)) < 0) {
                        var found = false;
                        for (var i = 0; i < this.items.length; i++)
                            if (this.selectedItem && (this.items[i].label === this.selectedItem.label)) {
                                found = true;
                                break
                            }
                        if (!found)
                            this.selectedItem = this.selectionManager.selectedItem
                    }
                }, _updateControlVisibility: function _updateControlVisibility() {
                    if (!this.items || this.items.length <= this.minItems)
                        WinJS.Utilities.addClass(this.domElement, "removeFromDisplay");
                    else
                        WinJS.Utilities.removeClass(this.domElement, "removeFromDisplay")
                }, _updateArrowVisibility: function _updateArrowVisibility() {
                    if (!this.dropDownArrow)
                        return null;
                    var ControlMode = MS.Entertainment.UI.Controls.Modifier.ControlMode;
                    if (!this.items || this.items.length <= 1)
                        WinJS.Utilities.addClass(this._modifierContainer, "dropDownDisabled");
                    else
                        WinJS.Utilities.removeClass(this._modifierContainer, "dropDownDisabled")
                }, setTabPanel: function setTabPanel(tabPanel) {
                    this._tabPanel = tabPanel
                }, onKeyDown: function onKeyDown(event) {
                    if (event.keyCode === WinJS.Utilities.Key.enter || event.keyCode === WinJS.Utilities.Key.space)
                        this.onClicked()
                }, onClicked: function onClicked() {
                    var boundingRect;
                    if (!this.items || this.items.length <= 1)
                        return;
                    if (!this.openPopup && !modifierAlreadyOpen) {
                        boundingRect = this._modifierContainer.getBoundingClientRect();
                        this.openPopup = MS.Entertainment.UI.Controls.ModifierPopup.createModifierPopup(this.popupStyle, this.selectionManager, {
                            boundingRect: boundingRect, modifierControl: this
                        });
                        if (!this.isBeingDismissed) {
                            modifierAlreadyOpen = true;
                            WinJS.Utilities.addClass(this._modifierContainer, "showingList");
                            this.openPopup.show().then(function traceModifierPopupDismissed() {
                                WinJS.Utilities.removeClass(this._modifierContainer, "showingList");
                                modifierAlreadyOpen = false;
                                this.openPopup = null;
                                (new Microsoft.Entertainment.Instrumentation.Providers.Shell).traceModifierControl_PopupClosed(this.identifier)
                            }.bind(this))
                        }
                    }
                }, getItem: function getItem(index) {
                    var items = WinJS.Binding.unwrap(this.items);
                    if (items instanceof MS.Entertainment.ObservableArray)
                        return items.item(index);
                    else if (Array.isArray(items))
                        return items[index];
                    else
                        MS.Entertainment.UI.Controls.assert(false, "Unrecognized items list type in modifier control.")
                }
        }, {
            tabIndex: 0, items: null, selectedItem: null, descriptionLabel: null, descriptionLabelText: null, descriptionLabelVisible: false, popupStyle: null, settingsKey: null, isRoamingSetting: true
        }), ModifierPopup: MS.Entertainment.UI.Framework.defineUserControl("Controls/Modifier.html#modifierPopupTemplate", function modifierPopupConstructor(){}, {
                modifierControl: null, customStyle: null, topPadding: 0, bottomPadding: 0, selectedItemIndex: 0, _guesstimatedItemHeightPx: 50, _keyboardNavigationManager: null, _eventHandlers: null, descriptionLabel: null, initialize: function initialize() {
                        this._keyboardNavigationManager = new MS.Entertainment.Framework.KeyboardNavigationManager(this.scroller, this.scroller);
                        if (Array.isArray(this.customStyle))
                            this.customStyle.forEach(function(style) {
                                WinJS.Utilities.addClass(this.domElement, style)
                            }, this);
                        else if (this.customStyle)
                            WinJS.Utilities.addClass(this.domElement, this.customStyle);
                        this._eventHandlers = MS.Entertainment.Utilities.addEventHandlers(this.domElement, {
                            keypress: function onKeyPress(event) {
                                if (event.keyCode === WinJS.Utilities.Key.escape)
                                    this.modifierControl.openPopup.hide()
                            }.bind(this), keydown: function onKeyDown(event) {
                                    if (event.keyCode === WinJS.Utilities.Key.dismissButton) {
                                        event.stopPropagation();
                                        this.modifierControl.openPopup.hide()
                                    }
                                }.bind(this)
                        });
                        if (this.modifierControl.descriptionLabel)
                            this.descriptionLabel = String.load(this.modifierControl.descriptionLabel);
                        else if (this.modifierControl.descriptionLabelText)
                            this.descriptionLabel = this.modifierControl.descriptionLabelText;
                        this.buildItems()
                    }, unload: function unload() {
                        if (this._eventHandlers) {
                            this._eventHandlers.cancel();
                            this._eventHandlers = null
                        }
                        MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                    }, hide: function hide() {
                        if (this._overlay)
                            this._overlay.hide()
                    }, setOverlay: function setOverlay(overlay) {
                        overlay.lightDismissEnabled = true
                    }, buildItems: function buildItems() {
                        var items = [];
                        var i;
                        var selectedItem;
                        var indexOfSelectedItem;
                        var entriesLoaded = 0;
                        this.domElement.addEventListener("ModifierPopupEntryLoaded", function entryLoaded(event) {
                            event.stopPropagation();
                            entriesLoaded++;
                            if (entriesLoaded === (indexOfSelectedItem + 1)) {
                                window.requestAnimationFrame(function() {
                                    this.entryList.bringItemIntoView(items[indexOfSelectedItem]);
                                    this._keyboardNavigationManager.setFocusedItem(this.scroller.querySelector(".initialSelectedModifierPopupEntry"))
                                }.bind(this));
                                (new Microsoft.Entertainment.Instrumentation.Providers.Shell).traceModifierControl_PopupOpened(this.modifierControl.identifier)
                            }
                        }.bind(this));
                        if (this.selectionManager.dataSource) {
                            selectedItem = WinJS.Binding.unwrap(this.selectionManager.selectedItem);
                            indexOfSelectedItem = Math.max(this.selectionManager.dataSource.indexOf(selectedItem), 0);
                            this.selectedItemIndex = indexOfSelectedItem;
                            for (i = 0; i < this.selectionManager.dataSource.length; i++) {
                                var item = {
                                        item: this.selectionManager.dataSource.item ? this.selectionManager.dataSource.item(i) : this.selectionManager.dataSource[i], modifierControl: this.modifierControl, selectionManager: this.selectionManager
                                    };
                                if (i === indexOfSelectedItem)
                                    item.isInitialSelected = true;
                                items.push(item)
                            }
                            var screenItems = Math.round(((window.outerHeight - 150) / this._guesstimatedItemHeightPx));
                            this.entryList.longListDeferalItemLimit = screenItems;
                            this.entryList.dataSource = items
                        }
                    }
            }, {items: null}, {createModifierPopup: function createModifierPopup(popupStyle, selectionManager, optionalParameters) {
                    var boundingRect = optionalParameters && optionalParameters.boundingRect;
                    var modifierControl = optionalParameters && optionalParameters.modifierControl;
                    boundingRect = boundingRect || {
                        left: 0, width: 0, right: 0, top: 0, bottom: 0, height: 0
                    };
                    var left;
                    var right;
                    switch (MS.Entertainment.Utilities.getTextDirection()) {
                        case MS.Entertainment.Utilities.TextDirections.LeftToRight:
                            left = Math.round(boundingRect.left) + "px";
                            right = "auto";
                            break;
                        case MS.Entertainment.Utilities.TextDirections.RightToLeft:
                            right = (document.body.clientWidth - Math.round(boundingRect.right)) + "px";
                            left = "auto";
                            break
                    }
                    var top = Math.round(boundingRect.top + boundingRect.height) + "px";
                    var bottom = "auto";
                    var fakeModifierControl = false;
                    if (!modifierControl) {
                        modifierControl = {};
                        fakeModifierControl = true
                    }
                    var openPopup = MS.Entertainment.UI.Shell.createOverlay("MS.Entertainment.UI.Controls.ModifierPopup", {
                            modifierControl: modifierControl, selectionManager: selectionManager, customStyle: popupStyle, topPadding: Math.round(boundingRect.top), bottomPadding: window.outerHeight - Math.round(boundingRect.bottom)
                        }, {
                            left: left, right: right, bottom: bottom, top: top, customStyle: "modifierPopupContainer", autoSetFocus: false, lightDismissEnabled: false, focusPreviouslyFocusedElement: false, showAnimation: function() {
                                    return WinJS.Promise.as()
                                }
                        });
                    if (fakeModifierControl)
                        modifierControl.openPopup = openPopup;
                    return openPopup
                }}), ModifierPopupEntry: MS.Entertainment.UI.Framework.defineUserControl("Controls/Modifier.html#modifierPopupEntryTemplate", null, {
                modifierControl: null, _skipDefer: true, item: null, isInitialSelected: false, preventHideDuringInitialize: true, allowAnimations: false, _gotData: function _gotData(data) {
                        var domEvent;
                        var label = data.item ? data.item.label : "";
                        var labelType = typeof label;
                        switch (labelType) {
                            case"string":
                                this.text.textContent = label;
                                break;
                            case"number":
                                this.text.textContent = String.load(label);
                                break;
                            default:
                                MS.Entertainment.UI.Controls.assert(false, "Unrecognized label type in modifier control popup entry.");
                                break
                        }
                        if (data.isInitialSelected)
                            WinJS.Utilities.addClass(this.background, "initialSelectedModifierPopupEntry");
                        if (data.modifierControl._tabPanel)
                            MS.Entertainment.Framework.AccUtils.createAndAddAriaLink(this.domElement, data.modifierControl._tabPanel, "aria-controls");
                        domEvent = document.createEvent("Event");
                        domEvent.initEvent("ModifierPopupEntryLoaded", true, true);
                        this.domElement.dispatchEvent(domEvent)
                    }, onClicked: function onClicked() {
                        this.data.selectionManager.selectedItem = this.data.item;
                        WinJS.Utilities.addClass(this.background, "selectedModifierPopupEntry");
                        MS.Entertainment.Utilities.Telemetry.logModifierClicked(this.data.item.id, this.text.textContent);
                        if (this.data.modifierControl.openPopup)
                            this.data.modifierControl.openPopup.hide();
                        else
                            this.data.modifierControl.backingData.openPopup.hide()
                    }, _data: null, data: {
                        get: function() {
                            return this._data
                        }, set: function(value) {
                                if (value === this._data)
                                    return;
                                this._data = value;
                                if (!value)
                                    return;
                                this._gotData(value)
                            }
                    }
            })
    })
})()
