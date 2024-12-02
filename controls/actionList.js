/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/utilities.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {ActionList: MS.Entertainment.UI.Framework.defineUserControl("Controls/actionList.html#actionListTemplate", function actionListConstructor() {
        this._traceProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell;
        this.visibleSet = new MS.Entertainment.ObservableArray;
        this.overflowSet = new MS.Entertainment.ObservableArray;
        this.updateActionSets = this.updateActionSets.bind(this);
        this.items = new MS.Entertainment.ObservableArray
    }, {
        _workingVisibleItems: null, _workingOverflowItems: null, _maxItems: 0, _overflowAction: null, _actionListBindings: null, _overflowTitleOverride: String.empty, _items: null, _frozen: false, items: {
                get: function() {
                    return this._items
                }, set: function(v) {
                        if (this._items === v)
                            return;
                        var o = this._items;
                        this._items = v;
                        this._itemsChangedHandler(v);
                        this.notify("items", v, o)
                    }
            }, _getOverflowAction: function _getOverflowAction() {
                if (this._overflowAction)
                    return this._overflowAction;
                var action = new MS.Entertainment.UI.ToolbarAction;
                action.id = "overflowAction";
                action.automationId = MS.Entertainment.UI.AutomationIds.transportPlaybackOptions;
                action.title = this._overflowTitleOverride || String.load(String.id.IDS_DETAILS_MORE_ACTION);
                action._flyoutClassName = this._flyoutClassName;
                action.hasSubActions = true;
                action.subActions = this.overflowSet;
                action.icon = WinJS.UI.AppBarIcon.more;
                action.executed = WinJS.Utilities.markSupportedForProcessing(function executed(){});
                action.currentVisibility = MS.Entertainment.UI.Controls.ActionList.actionListVisibility.none;
                this._overflowAction = {action: action};
                return this._getOverflowAction()
            }, _pendingOverflow: null, updateActionSets: function updateActionSets() {
                if (this._pendingOverflow) {
                    this._pendingOverflow.cancel();
                    this._pendingOverflow = null
                }
                if (this._frozen)
                    return;
                var newSets = this._calculateActionLocations();
                if (newSets.overflowSet.length < 1)
                    this.overflowSet.clear();
                if (newSets.visibleSet.length < 1) {
                    this.visibleSet.clear();
                    return
                }
                var traceProvider = this._traceProvider;
                function mergeNewSetIntoExistingSet(item, index) {
                    if (index < this.length) {
                        if (this.item(index) === item)
                            return;
                        traceProvider.traceActionListControl_ItemRemoved(item && item.action && item.action.title);
                        this.removeAt(index)
                    }
                    traceProvider.traceActionListControl_ItemAdded(item && item.action && item.action.title);
                    this.insert(index, item)
                }
                newSets.visibleSet.forEach(mergeNewSetIntoExistingSet.bind(this.visibleSet));
                if (this.visibleSet.length > newSets.visibleSet.length)
                    for (var k = this.visibleSet.length - 1; this.visibleSet.length !== newSets.visibleSet.length; k--)
                        this.visibleSet.removeAt(k);
                this._pendingOverflow = WinJS.Promise.timeout(500).then(function pendingOverflow() {
                    newSets.overflowSet.forEach(mergeNewSetIntoExistingSet.bind(this.overflowSet));
                    if (this.overflowSet.length > newSets.overflowSet.length)
                        for (var m = this.overflowSet.length - 1; this.overflowSet.length !== newSets.overflowSet.length; m--)
                            this.overflowSet.removeAt(m)
                }.bind(this))
            }, _calculateActionLocations: function _calculateActionLocations() {
                var visibleSet = [];
                var overflowSet = [];
                var cantOverFlow = [];
                var maxItems = this._maxItems;
                if (maxItems < 1 || !this.workingItems)
                    return {
                            visibleSet: [], overflowSet: []
                        };
                if (this.workingItems.length <= maxItems)
                    return {
                            visibleSet: this.workingItems.getArray(), overflowSet: overflowSet
                        };
                for (var i = 0; i < this.workingItems.length; i++)
                    (function(item) {
                        var action = item.action;
                        var canGoInOverflow = !(action.subActions && action.subActions.length);
                        if (visibleSet.length < maxItems) {
                            visibleSet.push(item);
                            return
                        }
                        if (canGoInOverflow) {
                            overflowSet.push(item);
                            return
                        }
                        cantOverFlow.push(item)
                    }.bind(this))(this.workingItems.item(i));
                cantOverFlow.push(this._getOverflowAction());
                MS.Entertainment.UI.Controls.assert(visibleSet.length <= this._maxItems, "Some how ended up with the wrong number of actions in the visible set");
                MS.Entertainment.UI.Controls.assert(cantOverFlow.length < 3, "cantOverFlow set: Only support two items in overflows; actual overflow button, and one other");
                var overage = cantOverFlow.length;
                var candidates = visibleSet.filter(function(item) {
                        var subMenu = item.action.subActions;
                        return !(subMenu && subMenu.length)
                    });
                MS.Entertainment.UI.Controls.assert(overage <= candidates.length, "Some how we dont have enough items to move");
                for (var j = candidates.length - overage; j < candidates.length; j++)
                    (function(item) {
                        overflowSet.unshift(item);
                        var index = visibleSet.indexOf(item);
                        visibleSet.splice(index, 1)
                    })(candidates[j]);
                visibleSet = visibleSet.concat(cantOverFlow);
                MS.Entertainment.UI.Controls.assert(visibleSet.length <= maxItems, "Visible set wasn't correct");
                MS.Entertainment.UI.Controls.assert(visibleSet.indexOf(this._getOverflowAction()) > -1, "Couldn't find overflow");
                return {
                        visibleSet: visibleSet, overflowSet: overflowSet
                    }
            }, initialize: function initialize() {
                this._maxItems = this._calculateMaxVisibleItems();
                this._actionListBindings = WinJS.Binding.bind(this, {containerWidth: this._onResize.bind(this)})
            }, freeze: function freeze() {
                this._frozen = true;
                MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this)
            }, thaw: function thaw() {
                this._frozen = false;
                this.updateActionSets();
                MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this)
            }, unload: function unload() {
                if (this.workingItems) {
                    this.workingItems.removeChangeListener(this.updateActionSets);
                    this.workingItems = null
                }
                if (this._actionListBindings) {
                    this._actionListBindings.cancel();
                    this._actionListBindings = null
                }
                MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
            }, _itemsChangedHandler: function _itemsChangedHandler(newValue) {
                if (this._unloaded)
                    return;
                this._traceProvider.traceActionListControl_ItemsChanged(newValue);
                if (this.workingItems)
                    this.workingItems.removeChangeListener(this.updateActionSets);
                if (!newValue) {
                    this.workingItems = null;
                    this.updateActionSets();
                    this._traceProvider.traceActionListControl_ItemsChanged(newValue);
                    return
                }
                var tempWorkingData = WinJS.Binding.unwrap(newValue);
                if (!(newValue instanceof MS.Entertainment.ObservableArray))
                    tempWorkingData = new MS.Entertainment.ObservableArray(newValue);
                if (tempWorkingData)
                    tempWorkingData.addChangeListener(this.updateActionSets);
                this.workingItems = tempWorkingData;
                WinJS.Utilities.addClass(this.domElement, "removeFromDisplay");
                this.updateActionSets();
                WinJS.Promise.timeout().then(function showButtons() {
                    WinJS.Utilities.removeClass(this.domElement, "removeFromDisplay")
                }.bind(this))
            }, _calculateMaxVisibleItems: function _calculateMaxVisibleItems() {
                return Math.floor(this.containerWidth / this.buttonWidth)
            }, _onResize: function _onResize() {
                if (!MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isSnapped) {
                    this._maxItems = this._calculateMaxVisibleItems();
                    if (!this._maxItems)
                        return;
                    this.updateActionSets()
                }
            }
    }, {
        containerWidth: 0, buttonWidth: 100, visibleSet: null, overflowSet: null, workingItems: null, _flyoutClassName: "actionListFlyoutColors"
    }, {
        actionListVisibility: {
            auto: "auto", visible: "visible", overflow: "overflow", none: "none"
        }, getSeparatorAction: function getSeparatorAction() {
                var action = new MS.Entertainment.UI.ToolbarAction;
                action.id = "separator";
                action.title = "";
                action.executed = WinJS.Utilities.markSupportedForProcessing(function executed(){});
                action.isSeparator = true;
                return {action: action}
            }, overflowTemplateSelector: WinJS.Utilities.markSupportedForProcessing(function overflowTemplateSelector(item) {
                var result;
                function loadItemTemplate(itemTemplate) {
                    return MS.Entertainment.UI.Framework.loadTemplate(itemTemplate, null, true).then(function(templateControl) {
                            return templateControl
                        })
                }
                if (item.action.isSeparator)
                    return loadItemTemplate(this.separatorTemplate);
                else if (item.action.isPlaybackOption)
                    return loadItemTemplate(this.playbackOptionsItemTemplate);
                else if (item.action.isComboPlaybackOption)
                    return loadItemTemplate(this.playbackOptionsComboItemTemplate);
                else
                    return loadItemTemplate(this.itemTemplate)
            })
    })});
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {PlaybackOptionsList: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.ActionList, null, function PlaybackOptionsList_constructor() {
        this._flyoutClassName = "playbackOptionListFlyoutColors"
    }, {executeActionUpdateCombo: WinJS.Utilities.markSupportedForProcessing(function executeActionUpdateCombo() {
            if (this.referenceContainer && this.referenceContainer.flyout && this.referenceContainer.flyout._element) {
                var comboSelect = this.referenceContainer.flyout._element.querySelector(".comboSelect");
                if (comboSelect && !comboSelect.classList.contains("removeFromDisplay")) {
                    var sessionManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    var playbackSession = sessionManager.nowPlayingSession;
                    for (var i = 0; i < comboSelect.options.length; i++)
                        if (playbackSession.closedCaptionsOn && comboSelect.options[i].value === playbackSession.ccLcid) {
                            comboSelect.selectedIndex = i;
                            break
                        }
                }
            }
        })})});
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {ActionListButton: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.IconButton, "Controls/actionList.html#actionListItemTemplate", null, {
        _actionListActionsBinds: null, _actionListBinds: null, _flyoutToAppBarGap: 2, initialize: function initialize() {
                MS.Entertainment.UI.Controls.IconButton.prototype.initialize.call(this);
                this._actionListBinds = WinJS.Binding.bind(this, {action: this._updateAction.bind(this)});
                if (this.isToggleButton && this._button)
                    this._button.attachEvent("onpropertychange", this.accessiblePressed.bind(this))
            }, unload: function unload() {
                if (this._actionListActionsBinds) {
                    this._actionListActionsBinds.cancel();
                    this._actionListActionsBinds = null
                }
                if (this._actionListBinds) {
                    this._actionListBinds.cancel();
                    this._actionListBinds = null
                }
                if (this.isToggleButton && this._button)
                    this._button.detach("onpropertychange", this.accessiblePressed.bind(this));
                MS.Entertainment.UI.Controls.IconButton.prototype.unload.call(this)
            }, _updateFlyoutPosition: function _updateFlyoutPosition() {
                var flyoutElement = this._flyoutControl && this._flyoutControl.flyout && this._flyoutControl.flyout.element;
                if (flyoutElement && flyoutElement.style) {
                    flyoutElement.style.top = "auto";
                    var actionList = document.querySelector(".appBarActionList");
                    var actionListHeight = actionList.clientHeight;
                    flyoutElement.style.bottom = actionListHeight + this._flyoutToAppBarGap + "px";
                    WinJS.Utilities.addClass(this._flyoutControl.flyout.element, "appbarActionFlyout");
                    WinJS.Utilities.removeClass(this._flyoutControl.flyout.element, "hideFromDisplay");
                    this._setFocusInFlyout(flyoutElement, true)
                }
            }, accessiblePressed: function accessiblePressed() {
                if (this._button && event && event.propertyName === "aria-pressed")
                    if (this.isChecked && this._button.getAttribute("aria-pressed") === "false") {
                        this.isChecked = false;
                        this.onClickPreProcess()
                    }
                    else if (!this.isChecked && this._button.getAttribute("aria-pressed") === "true") {
                        this.isChecked = true;
                        this.onClickPreProcess()
                    }
            }, _updateAction: function _updateAction() {
                if (this._actionListActionsBinds) {
                    this._actionListActionsBinds.cancel();
                    this._actionListActionsBinds = null
                }
                if (this.action) {
                    if (!this.text && !this.stringId)
                        this.text = this.action.title;
                    this.icon = this.action.icon;
                    if (this.action.adornerMode)
                        this.adornerMode = this.action.adornerMode;
                    if (this.action.adornerRing)
                        this.adornerRing = this.action.adornerRing;
                    if (this.action.accessibilityText)
                        this.accessibilityText = this.action.accessibilityText;
                    if (this.action.accessibilityStringId)
                        this.accessibilityStringId = this.action.accessibilityStringId;
                    this._button.setAttribute("data-win-automationid", this.action.id);
                    this._actionListActionsBinds = WinJS.Binding.bind(this.action, {
                        title: function updateTitle(newTitle) {
                            this.text = newTitle
                        }.bind(this), isEnabled: function actionIsEnabledChanged() {
                                if (this.isDisabled === this.action.isEnabled) {
                                    if (this.action.hideOnDisable)
                                        if (!this.action.isEnabled)
                                            WinJS.Utilities.addClass(this.domElement, "removeFromDisplay");
                                        else
                                            WinJS.Utilities.removeClass(this.domElement, "removeFromDisplay");
                                    this.isDisabled = !this.action.isEnabled
                                }
                            }.bind(this)
                    })
                }
            }, _showFlyout: function _showFlyout() {
                if (this._flyoutControl && this._flyoutControl.flyout)
                    this._flyoutControl.flyout.show(this.domElement, "top", "left")
            }
    })})
