/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Components/Playback/Playbackhelpers.js", "/Framework/data/queries/marketplacequeries.js", "/Framework/querywatcher.js", "/Framework/stringids.js", "/Framework/utilities.js");
(function() {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {Node: MS.Entertainment.defineOptionalObservable(function node(id, label, value) {
            MS.Entertainment.ViewModels.assert(id, "Attempted to construct a Node without an ID.");
            this.id = id;
            this.label = label || String.empty;
            this.value = value || {}
        }, {}, {
            selected: false, isRoot: true, label: null, value: null
        })});
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {
        NodeValues: WinJS.Class.define(function nodeValues(query, queryOptions, modelOptions, modifierOptions, pivotOptions, trackQuery, trackQueryOptions) {
            this.query = query || null;
            this.queryOptions = queryOptions || {};
            this.modelOptions = modelOptions || {};
            this.modifierOptions = modifierOptions || {};
            this.pivotOptions = pivotOptions || {};
            this.trackQuery = trackQuery || null;
            this.trackQueryOptions = trackQueryOptions || {}
        }, {
            query: null, queryOptions: null, modelOptions: null, modifierOptions: null, pivotOptions: null, trackQuery: null, trackQueryOptions: null
        }), ActionCell: WinJS.Class.derive(MS.Entertainment.UI.Framework.ObservableBase, function actionCell(actionId, actionOptions, actionParams) {
                this._actionParams = actionParams;
                this._actionOptions = actionOptions;
                this._actionId = actionId
            }, {
                _actionId: null, _actionOptions: null, _actionParam: null, isAction: true, icon: MS.Entertainment.UI.Framework.observableProperty("icon", null), text: MS.Entertainment.UI.Framework.observableProperty("text", null), stringId: null, hideDefaultRing: false, groupHeader: String.empty, automationId: String.empty, action: {get: function() {
                            if (!this._action)
                                this._initializeAction();
                            return this._action
                        }}, _initializeAction: function _initializeAction() {
                        this._action = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).getAction(this._actionId);
                        if (this._actionOptions)
                            WinJS.UI.setOptions(this._action, this._actionOptions);
                        if (this._actionParams)
                            this._action.parameter = this._actionParams;
                        this._actionOptions = null
                    }
            })
    });
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {ModifierActionCell: WinJS.Class.derive(MS.Entertainment.ViewModels.ActionCell, function modifierActionCell(modifier, groupHeader, modifierTitleId, forcedModifier) {
            var modifierCount = modifier && modifier.dataSource && modifier.dataSource.length;
            if (modifierCount > 1) {
                var originalIndex = modifier.selectedIndex;
                this._action = {
                    execute: function executedPlay(param) {
                        return MS.Entertainment.UI.Controls.ModifierPopup.createModifierPopup("primaryPanelModifierPopup", modifier).show().then(function modifierChanged() {
                                return WinJS.Promise.wrap(originalIndex !== modifier.selectedIndex)
                            })
                    }, canExecute: function canExecutePlay(param) {
                            return true
                        }
                };
                this.enabled = true
            }
            else {
                this._action = {
                    execute: function executedPlay(param) {
                        return WinJS.Promise.wrap(false)
                    }, canExecute: function canExecutePlay(param) {
                            return true
                        }
                };
                this.enabled = false
            }
            if (modifierCount > 0)
                this.text = modifier.selectedItem ? modifier.selectedItem.label : modifier.dataSource.item(0).label;
            else
                this.text = forcedModifier;
            this.icon = null;
            if (modifierTitleId)
                this.title = modifierTitleId;
            if (groupHeader)
                this.groupHeader = groupHeader
        }, {
            title: null, isModifier: true, action: {get: function() {
                        if (!this._action)
                            var action;
                        return this._action
                    }}
        })});
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {NotificationActionCell: WinJS.Class.derive(MS.Entertainment.ViewModels.ActionCell, function notificationActionCell(category, actionId, actionOptions, clearActionId) {
            this.category = category;
            this._clearActionId = clearActionId;
            this._cloudMatchDialogAction = actionOptions && actionOptions.consentDialog ? true : false;
            MS.Entertainment.ViewModels.ActionCell.prototype.constructor.call(this, actionId, actionOptions, {category: this.category});
            this.notificationClass = category.name
        }, {
            _clearActionId: null, _cloudMatchDialogAction: false, category: null, clearIcon: MS.Entertainment.UI.Icon.close, isNotification: true, subText: MS.Entertainment.UI.Framework.observableProperty("subText", null), notificationClass: null, clearAction: {get: function() {
                        if (!this._clearAction)
                            this._initializeClearAction();
                        return this._clearAction
                    }}, _initializeClearAction: function _initializeClearAction() {
                    this._clearAction = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).getAction(this._clearActionId);
                    this._clearAction.title = this.text;
                    this._clearAction.optOut = this._cloudMatchDialogAction;
                    this._clearAction.parameter = {
                        category: this.category, actionType: this.category.name
                    }
                }, setNotification: function setNotification(notification) {
                    this._actionId = notification.action;
                    this._actionOptions = notification.actionParams;
                    this.category = notification.category;
                    this._actionParams = {category: this.category};
                    this._clearActionId = notification.dismissAction;
                    this.icon = notification.icon;
                    this.text = notification.title;
                    this.subText = notification.subTitle;
                    this._cloudMatchDialogAction = !!(this._actionOptions && this._actionOptions.consentDialog);
                    var oldAction = this._action;
                    this._initializeAction();
                    this.notify("action", this._action, oldAction);
                    var oldClearAction = this._clearAction;
                    this._initializeClearAction();
                    this.notify("clearAction", this._clearAction, oldClearAction)
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {queryViewModelBaseMixIn: {
            items: null, modifierSelectionManager: null, secondaryModifierSelectionManager: null, pivotsSelectionManager: null, filterSelectionManager: null, isFailed: false, largeItemIndex: -1, selectedTemplate: null, titleOverride: null, pivotSelectedIndexOverride: null
        }});
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {QueryViewModelBase: WinJS.Class.mix(function observableQuery() {
            this._initObservable(Object.create(MS.Entertainment.ViewModels.queryViewModelBaseMixIn))
        }, WinJS.Utilities.eventMixin, WinJS.Binding.mixin, WinJS.Binding.expandProperties(MS.Entertainment.ViewModels.queryViewModelBaseMixIn))});
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {QueryViewModel: WinJS.Class.derive(MS.Entertainment.ViewModels.QueryViewModelBase, function queryViewModelConstructor(view) {
            MS.Entertainment.ViewModels.QueryViewModelBase.prototype.constructor.call(this);
            this._fileTransferListenerId = "" + Date.now();
            this._fileTransferListenerId = this._viewModelId + this._fileTransferListenerId + "_" + Math.random();
            this._workingModifierSelectionManager = new MS.Entertainment.Framework.SelectionManager(null, this._defaultModifierSelection);
            this._workingSecondaryModifierSelectionManager = new MS.Entertainment.Framework.SelectionManager(null, this._defaultModifierSelection);
            this._workingFilterSelectionManager = new MS.Entertainment.Framework.SelectionManager(null, 0);
            this._workingPivotsSelectionManager = new MS.Entertainment.Framework.SelectionManager(null, 0);
            this.selectedTemplate = {};
            this.initialize();
            this.view = view
        }, {
            _defaultModifierSelection: 0, _viewModelId: null, _queryWatcher: null, _queryWatcherString: "marketplace", _loadingDoneString: "loadingDone", _pendingViewChange: null, _pendingQueryExecute: null, _lastUsedPivotItem: null, _lastUsedModifierItem: null, _lastUsedSecondaryModifierItem: null, _lastUsedFilterItem: null, _lastUsedView: null, _lastUsedQueryType: null, _lastUsedQuery: null, _lastUsedModifierDefinition: null, _lastUsedFilterDefinition: null, _lastUsedPivotDefinition: null, _modifiersTrimmed: false, _workingModifierSelectionManager: null, _workingSecondaryModifierSelectionManager: null, _workingFilterSelectionManager: null, _workingPivotsSelectionManager: null, _recreateQueries: false, _view: null, _enabled: false, _disposed: false, _modifierEvents: null, _secondaryModifierEvents: null, _filterEvents: null, _pivotEvents: null, _refreshing: false, _queryEventHandlers: null, handleQueryChanges: true, autoHideInvalidModifiers: false, failOnEmpty: false, propertyKey: null, taskKeyGetter: null, notifier: null, completedQuery: null, pausableQuery: {get: function() {
                        if (this.getQuery)
                            return this.getQuery;
                        else if (this.completedQuery && this.completedQuery.pause && this.completedQuery.unpause)
                            return this.completedQuery;
                        return null
                    }}, initialize: function initialize() {
                    MS.Entertainment.ViewModels.assert(!this._modifierEvents && !this._pivotEvents && !this._secondaryModifierEvents, "These events shouldn't exist");
                    this._modifierEvents = MS.Entertainment.Utilities.addEventHandlers(this._workingModifierSelectionManager, {selectedItemChanged: this._handleModifierSelectionChanged.bind(this)});
                    this._secondaryModifierEvents = MS.Entertainment.Utilities.addEventHandlers(this._workingSecondaryModifierSelectionManager, {selectedItemChanged: this._handleSecondaryModifierSelectionChanged.bind(this)});
                    this._filterEvents = MS.Entertainment.Utilities.addEventHandlers(this._workingFilterSelectionManager, {selectedItemChanged: this._handleFilterSelectionChanged.bind(this)});
                    this._pivotEvents = MS.Entertainment.Utilities.addEventHandlers(this._workingPivotsSelectionManager, {selectedItemChanged: this._handlePivotSelectionChanged.bind(this)})
                }, dispose: function dispose() {
                    var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                    fileTransferService.unregisterListener(this._fileTransferListenerId);
                    if (this._queryWatcher) {
                        this._queryWatcher.clearQueries();
                        this._queryWatcher = null
                    }
                    if (this._pendingViewChange) {
                        this._pendingViewChange.cancel();
                        this._pendingViewChange = null
                    }
                    if (this._pendingQueryExecute) {
                        this._pendingQueryExecute.cancel();
                        this._pendingQueryExecute = null
                    }
                    if (this._lastUsedQuery && this._lastUsedQuery.dispose) {
                        this._lastUsedQuery.dispose();
                        this._lastUsedQuery = null
                    }
                    if (this._modifierEvents) {
                        this._modifierEvents.cancel();
                        this._modifierEvents = null
                    }
                    if (this._filterEvents) {
                        this._filterEvents.cancel();
                        this._filterEvents = null
                    }
                    if (this._pivotEvents) {
                        this._pivotEvents.cancel();
                        this._pivotEvents = null
                    }
                    if (this._workingModifierSelectionManager) {
                        this._workingModifierSelectionManager.dispose();
                        this._workingModifierSelectionManager = null
                    }
                    if (this._workingSecondaryModifierSelectionManager) {
                        this._workingSecondaryModifierSelectionManager.dispose();
                        this._workingSecondaryModifierSelectionManager = null
                    }
                    if (this._workingFilterSelectionManager) {
                        this._workingFilterSelectionManager.dispose();
                        this._workingFilterSelectionManager = null
                    }
                    if (this._workingPivotsSelectionManager) {
                        this._workingPivotsSelectionManager.dispose();
                        this._workingPivotsSelectionManager = null
                    }
                    this._unregisterForQueryEvents();
                    this.selectedTemplate = {};
                    this._lastUsedPivotItem = null;
                    this._lastUsedModifierItem = null;
                    this._lastUsedSecondaryModifierItem = null;
                    this._lastUsedFilterItem = null;
                    this._disposed = true
                }, view: {
                    get: function() {
                        return this._view
                    }, set: function(value) {
                            if (this._view !== value && !this._disposed) {
                                var oldValue = this._view;
                                this._view = value;
                                this._handleViewChange();
                                this.notify("view", value, oldValue)
                            }
                        }
                }, isCurrentQuery: function isCurrentQuery() {
                    return !this._pendingQueryExecute
                }, getViewDefinition: function(view) {
                    return null
                }, getPivotDefinition: function(view) {
                    return null
                }, getModifierDefinition: function(view) {
                    return null
                }, getFilterDefinition: function(view) {
                    return null
                }, refresh: function refresh() {
                    if (this._disposed)
                        return;
                    this._lastUsedPivotItem = null;
                    this._lastUsedModifierItem = null;
                    this._lastUsedSecondaryModifierItem = null;
                    this._lastUsedFilterItem = null;
                    this._lastUsedView = null;
                    this._enabled = true;
                    this._refresh()
                }, begin: function begin() {
                    var promise;
                    if (!this._enabled) {
                        this._enabled = true;
                        promise = this._refresh()
                    }
                    return WinJS.Promise.as(promise)
                }, _handleModifierSelectionChanged: function _handleModifierSelectionChanged(args) {
                    if (!this.view || args.detail.oldSelection.index < 0 || this._refreshing)
                        return;
                    this._resetSecondaryModifier();
                    this._beginQuery()
                }, _handleSecondaryModifierSelectionChanged: function _handleSecondaryModifierSelectionChanged(args) {
                    if (!this.view || args.detail.oldSelection.index < 0 || this._refreshing)
                        return;
                    this._beginQuery()
                }, _handleFilterSelectionChanged: function _handleFilterSelectionChanged(args) {
                    if (!this.view || args.detail.oldSelection.index < 0 || this._refreshing)
                        return;
                    this._beginQuery()
                }, _handlePivotSelectionChanged: function _handlePivotSelectionChanged(args) {
                    if (!this.view || args.detail.oldSelection.index < 0 || this._refreshing)
                        return;
                    if (args.detail.newSelection.index >= 0 && this._modifiersTrimmed)
                        this._lastUsedModifierDefinition = null;
                    this._refresh().then(function() {
                        if (this._workingPivotsSelectionManager.dataSource) {
                            var newPivot = args.detail.newSelection.index >= 0 ? this._workingPivotsSelectionManager.dataSource.item(args.detail.newSelection.index) : null;
                            this._resetSubItems(newPivot, newPivot)
                        }
                    }.bind(this))
                }, _handleViewChange: function _handleViewChange() {
                    this._setItems(null);
                    this._lastUsedView = null;
                    this._lastUsedPivotDefinition = null;
                    this._lastUsedModifierDefinition = null;
                    this._lastUsedFilterDefinition = null;
                    return this._refresh()
                }, _refresh: function _refresh() {
                    if (!this.view || !this._enabled || this._refreshing || this._disposed)
                        return WinJS.Promise.wrap();
                    this._refreshing = true;
                    if (this._pendingViewChange) {
                        this._pendingViewChange.cancel();
                        this._pendingViewChange = null
                    }
                    var promise = this._pendingViewChange = WinJS.Promise.join({
                            modifier: this._resetModifiers(), pivots: this._resetPivots(), filters: this._resetFilters()
                        }).then(this._viewLoadCompleted.bind(this), this._viewLoadFailed.bind(this));
                    this._refreshing = false;
                    return promise
                }, _resetPivots: function _resetPivots() {
                    var promise;
                    var staticPromise;
                    var queryPromise;
                    var pivotsQuery;
                    var pivots = this.getPivotDefinition(this.view);
                    var workingDataSource;
                    if (pivots !== this._lastUsedPivotDefinition) {
                        this._lastUsedPivotDefinition = pivots;
                        workingDataSource = new MS.Entertainment.ObservableArray;
                        this._lastUsedPivotItem = null;
                        MS.Entertainment.Utilities.BindingAgnostic.setProperties(this._workingPivotsSelectionManager, this.getViewDefinition(this.view).pivotOptions);
                        this.pivotsSelectionManager = this._workingPivotsSelectionManager;
                        if (pivots) {
                            if (pivots.itemFactory) {
                                workingDataSource.spliceArray(workingDataSource.length, 0, pivots.itemFactory());
                                staticPromise = WinJS.Promise.wrap(true)
                            }
                            if (pivots.itemQuery) {
                                pivotsQuery = new pivots.itemQuery;
                                MS.Entertainment.Utilities.BindingAgnostic.setProperties(pivotsQuery, pivots.itemQueryOptions);
                                queryPromise = WinJS.Promise.as(staticPromise).then(function itemsArrayAdded() {
                                    return pivotsQuery.execute()
                                }.bind(this)).then(function queryFinished(q) {
                                    return MS.Entertainment.Data.List.listToArray(q.result.items)
                                }.bind(this), function queryFailed(error) {
                                    if (this._lastUsedPivotDefinition === pivots)
                                        this._lastUsedPivotDefinition = null;
                                    return WinJS.Promise.wrapError(error)
                                }.bind(this)).then(function gotArray(array) {
                                    workingDataSource.spliceArray(workingDataSource.length, 0, array);
                                    return true
                                }.bind(this))
                            }
                        }
                        this._workingPivotsSelectionManager.dataSource = workingDataSource;
                        promise = staticPromise || queryPromise
                    }
                    return WinJS.Promise.as(promise)
                }, _resetSubItems: function _resetSubItems(selectedItem, destinationItem) {
                    if (!selectedItem)
                        return;
                    var subItemQuery;
                    if (selectedItem && !selectedItem.items && selectedItem.value && selectedItem.value.itemQuery) {
                        subItemQuery = new selectedItem.value.itemQuery;
                        this._createSubItemAugmentation(subItemQuery, selectedItem);
                        MS.Entertainment.Utilities.BindingAgnostic.setProperties(subItemQuery, selectedItem.value.itemQueryOptions);
                        subItemQuery.execute().then(function subItemQueryCompleted(q) {
                            if (isNaN(selectedItem.value.minItems) || selectedItem.value.minItems < 0 || selectedItem.value.minItems <= q.result.items.count)
                                return MS.Entertainment.Data.List.listToArray(q.result.items);
                            else
                                return WinJS.Promise.wrapError()
                        }.bind(this)).then(function setSubItems(subItems) {
                            if (destinationItem.items !== undefined)
                                destinationItem.items = subItems;
                            else
                                destinationItem.spliceArray(destinationItem.length, 0, subItems)
                        }, function setEmptySubItems() {
                            if (destinationItem.items !== undefined)
                                destinationItem.items = [];
                            else if (destinationItem.clear)
                                destinationItem.clear()
                        })
                    }
                }, _createSubItemAugmentation: function _createSubItemAugmentation(query, parent) {
                    query.resultAugmentation = MS.Entertainment.Data.AugmentQuery.modifyListResultAugmentation(query.resultAugmentation, {parent: parent})
                }, _resetModifiers: function _resetModifiers() {
                    var promise;
                    var staticPromise;
                    var queryPromise;
                    var modifierQuery;
                    var modifier = this.getModifierDefinition(this.view);
                    var workingDataSource;
                    if (modifier !== this._lastUsedModifierDefinition) {
                        this._lastUsedModifierDefinition = modifier;
                        workingDataSource = new MS.Entertainment.ObservableArray;
                        this._lastUsedModifierItem = null;
                        this._lastUsedSecondaryModifierItem = null;
                        this._modifiersTrimmed = false;
                        MS.Entertainment.Utilities.BindingAgnostic.setProperties(this._workingModifierSelectionManager, this.getViewDefinition(this.view).modifierOptions);
                        this.modifierSelectionManager = this._workingModifierSelectionManager;
                        this.secondaryModifierSelectionManager = this._workingSecondaryModifierSelectionManager;
                        if (modifier) {
                            if (modifier.itemFactory) {
                                workingDataSource.spliceArray(workingDataSource.length, 0, modifier.itemFactory());
                                staticPromise = WinJS.Promise.wrap(true)
                            }
                            if (modifier.itemQuery) {
                                modifierQuery = new modifier.itemQuery;
                                MS.Entertainment.Utilities.BindingAgnostic.setProperties(modifierQuery, modifier.itemQueryOptions);
                                queryPromise = WinJS.Promise.as(staticPromise).then(function itemsArrayAdded() {
                                    return modifierQuery.execute()
                                }.bind(this)).then(function queryFinished(q) {
                                    return MS.Entertainment.Data.List.listToArray(q.result.items)
                                }.bind(this), function queryFailed(error) {
                                    if (this._lastUsedModifierDefinition === modifier)
                                        this._lastUsedModifierDefinition = null;
                                    if (error.name === "Canceled")
                                        return WinJS.Promise.wrapError(error);
                                    else
                                        return MS.Entertainment.Data.List.listToArray(items)
                                }.bind(this)).then(function gotArray(array) {
                                    workingDataSource.spliceArray(workingDataSource.length, 0, array);
                                    this._resetSecondaryModifier();
                                    return true
                                }.bind(this))
                            }
                            promise = staticPromise || queryPromise
                        }
                        this._workingModifierSelectionManager.dataSource = workingDataSource
                    }
                    else
                        this._resetSecondaryModifier();
                    return WinJS.Promise.as(promise)
                }, _resetFilters: function _resetFilters() {
                    var filters = this.getFilterDefinition(this.view);
                    if (filters !== this._lastUsedFilterDefinition) {
                        this._lastUsedFilterDefinition = filters;
                        this._lastUsedFilterItem = null;
                        this._workingFilterSelectionManager.settingsKey = filters ? filters.settingsKey : null;
                        this._workingFilterSelectionManager.dataSource = filters ? filters.options : null;
                        this.filterSelectionManager = this._workingFilterSelectionManager
                    }
                    return WinJS.Promise.as(true)
                }, _resetSecondaryModifier: function _resetSecondaryModifier() {
                    var subWorkingDataSource = new MS.Entertainment.ObservableArray;
                    this._workingSecondaryModifierSelectionManager.dataSource = subWorkingDataSource;
                    var currentPivot = this._workingPivotsSelectionManager.selectedItem;
                    if (currentPivot && currentPivot.value && currentPivot.value.modifierOptions && currentPivot.value.modifierOptions.showSecondaryModifiers)
                        if (this._workingModifierSelectionManager.dataSource) {
                            var modifier = this._workingModifierSelectionManager.selectedItem;
                            if (modifier) {
                                var defaultModifier = [new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.MusicMarketplaceAutomationIds.defaultSubGenre, String.id.IDS_FILTER_ALL, null)];
                                this._workingSecondaryModifierSelectionManager.dataSource.spliceArray(0, 0, defaultModifier);
                                this._workingSecondaryModifierSelectionManager.selectedIndex = 0;
                                this._resetSubItems(modifier, this._workingSecondaryModifierSelectionManager.dataSource)
                            }
                        }
                }, _viewLoadExit: function _viewLoadExit(results) {
                    this._pendingViewChange = null
                }, _viewLoadCompleted: function _viewLoaded(results) {
                    this._viewLoadExit(results);
                    if (results.modifier && (!this._workingModifierSelectionManager.dataSource || !this._workingModifierSelectionManager.dataSource.length))
                        this.modifierSelectionManager = null;
                    if (results.secondaryModifier && (!this._workingSecondaryModifierSelectionManager.dataSource || !this._workingSecondaryModifierSelectionManager.dataSource.length))
                        this.secondaryModifierSelectionManager = null;
                    if (results.filter && (!this._workingFilterSelectionManager.dataSource || !this._workingFilterSelectionManager.dataSource.length))
                        this.filterSelectionManager = null;
                    if (results.pivots && (!this._workingPivotsSelectionManager.dataSource || !this._workingPivotsSelectionManager.dataSource.length))
                        this.pivotsSelectionManager = null;
                    return this._beginQuery()
                }, _viewLoadFailed: function _viewLoadFailed(results) {
                    this._viewLoadExit({
                        modifier: [], pivots: []
                    });
                    this._setItems(null);
                    this._setIsFailed(true)
                }, createActionCells: function createActionCells() {
                    return null
                }, createModifierActionCells: function createModifierActionCells(groupHeader, modifierTitleIds, showIfEmptyModifiers) {
                    var modifiers = [this.modifierSelectionManager, this.secondaryModifierSelectionManager];
                    var actionCells = [];
                    modifiers.forEach(function createModifierCell(modifier, i) {
                        if ((modifier.dataSource && modifier.dataSource.length > 1) || (showIfEmptyModifiers && showIfEmptyModifiers[i])) {
                            var newActionCell = new MS.Entertainment.ViewModels.ModifierActionCell(modifier, groupHeader, modifierTitleIds ? modifierTitleIds[i] : null, showIfEmptyModifiers ? showIfEmptyModifiers[i] : null);
                            actionCells.push(newActionCell)
                        }
                    });
                    return actionCells
                }, cloneCurrentQuery: function cloneCurrentQuery() {
                    return null
                }, _beginQuery: function _beginQuery() {
                    if (this._disposed)
                        return WinJS.Promise.wrap();
                    var pivot;
                    var modifier;
                    var secondaryModifier;
                    var filter;
                    var pivotItem = this._workingPivotsSelectionManager.selectedItem;
                    var modifierItem = this._workingModifierSelectionManager.selectedItem;
                    var secondaryModifierItem = this._workingSecondaryModifierSelectionManager.selectedItem;
                    var filterItem = this._workingFilterSelectionManager.selectedItem;
                    var view = this.getViewDefinition(this.view);
                    if (!view || !this._enabled)
                        return WinJS.Promise.wrap();
                    if (this._lastUsedView === view && this._lastUsedPivotItem === pivotItem && this._lastUsedModifierItem === modifierItem && this._lastUsedSecondaryModifierItem === secondaryModifier && this._lastUsedFilterItem == filterItem)
                        return WinJS.Promise.wrap();
                    pivot = this._workingPivotsSelectionManager.selectedItem;
                    modifier = this._workingModifierSelectionManager.selectedItem;
                    secondaryModifier = this._workingSecondaryModifierSelectionManager.selectedItem;
                    filter = this._workingFilterSelectionManager.selectedItem;
                    this._lastUsedView = view;
                    this._lastUsedPivotItem = pivotItem;
                    this._lastUsedModifierItem = modifierItem;
                    this._lastUsedSecondaryModifierItem = secondaryModifier;
                    this._lastUsedFilterItem = filterItem;
                    pivot = pivot || {value: {}};
                    modifier = modifier || {value: {}};
                    secondaryModifier = secondaryModifier || {value: {}};
                    filter = filter || {value: {}};
                    var options;
                    options = MS.Entertainment.Utilities.uniteObjects(WinJS.Binding.unwrap(pivot.value.modelOptions), WinJS.Binding.unwrap(modifier.value.modelOptions));
                    options = MS.Entertainment.Utilities.uniteObjects(options, WinJS.Binding.unwrap(secondaryModifier.modelOptions));
                    options = MS.Entertainment.Utilities.uniteObjects(options, WinJS.Binding.unwrap(filter.value.modelOptions));
                    options = MS.Entertainment.Utilities.uniteObjects(options, WinJS.Binding.unwrap(view.modelOptions));
                    MS.Entertainment.Utilities.BindingAgnostic.setProperties(this, options);
                    return WinJS.Promise.as(this._handleBeginQuery(view, pivot, modifier, secondaryModifier, filter))
                }, _handleBeginQuery: function _handleBeginQuery(view, pivot, modifier, secondaryModfier, filter) {
                    var options;
                    var sender;
                    var QueryType;
                    var promise;
                    if (this._pendingQueryExecute) {
                        this._pendingQueryExecute.cancel();
                        this._pendingQueryExecute = null
                    }
                    this.completedQuery = null;
                    this._unregisterForQueryEvents();
                    if (view.query)
                        QueryType = view.query;
                    else if (modifier.value.query)
                        QueryType = modifier.value.query;
                    else if (pivot.value.query)
                        QueryType = pivot.value.query;
                    if ((this._lastUsedQueryType !== QueryType || this._recreateQueries) && QueryType) {
                        if (this._lastUsedQuery && this._lastUsedQuery.dispose)
                            this._lastUsedQuery.dispose();
                        if (this._queryWatcher)
                            this._queryWatcher.clearQueries();
                        this._lastUsedQuery = new QueryType;
                        this._lastUsedQueryType = QueryType;
                        this._queryWatcher = new MS.Entertainment.Framework.QueryWatcher(this._queryWatcherString + this.view);
                        this._queryWatcher.registerQuery(this._lastUsedQuery);
                        if (this.taskKeyGetter && this.propertyKey && this.notifier) {
                            var notifications = new MS.Entertainment.UI.ContentNotification.NotificationModification(MS.Entertainment.UI.ContentNotification.listResult(), MS.Entertainment.UI.FileTransferService.keyFromProperty(this.propertyKey, false, true));
                            sender = notifications.createSender();
                            notifications.modifyQuery(this._lastUsedQuery)
                        }
                    }
                    if (this._lastUsedQuery) {
                        options = MS.Entertainment.Utilities.uniteObjects(WinJS.Binding.unwrap(pivot.value.queryOptions), WinJS.Binding.unwrap(modifier.value.queryOptions));
                        options = MS.Entertainment.Utilities.uniteObjects(options, WinJS.Binding.unwrap(secondaryModfier.value.queryOptions));
                        options = MS.Entertainment.Utilities.uniteObjects(options, WinJS.Binding.unwrap(filter.value.queryOptions));
                        options = MS.Entertainment.Utilities.uniteObjects(options, WinJS.Binding.unwrap(view.queryOptions));
                        MS.Entertainment.Utilities.BindingAgnostic.setProperties(this._lastUsedQuery, options);
                        this._onBeginQuery(this._lastUsedQuery);
                        this._setItems(null);
                        promise = this._pendingQueryExecute = this._lastUsedQuery.execute().done(function queryCompleted(q) {
                            if (this.failOnEmpty && this._isEmptyListFromQuery(q))
                                this._handleQueryFailure();
                            else {
                                this._pendingQueryExecute = null;
                                this.completedQuery = q;
                                if (this.completedQuery.autoUpdateProperties && this.completedQuery.autoUpdateProperties.enabled)
                                    this.completedQuery.autoUpdateProperties.enabled = false;
                                this.completedQuery.enabled = true;
                                if (sender) {
                                    var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                                    fileTransferService.registerListener(this._fileTransferListenerId, this.taskKeyGetter, sender, this.notifier)
                                }
                                var eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell;
                                eventProvider.traceNavigable_Loading_Done(this._loadingDoneString);
                                this._onQueryCompleted(q);
                                this._setItemsFromQuery(q);
                                this._registerForQueryEvents(q)
                            }
                        }.bind(this), function queryFailed(error) {
                            if (error.details && error.details.query) {
                                error.details.query.enabled = true;
                                this._registerForQueryEvents(error.details.query);
                                var success = false;
                                if (error.details.query.queries)
                                    for (var i = 0; i < error.details.query.queries.length; i++)
                                        if (error.details.query.queries[i].result) {
                                            success = true;
                                            this._onQueryCompleted(error.details.query.queries[i]);
                                            this._setItemsFromQuery(error.details.query.queries[i]);
                                            this._registerForQueryEvents(error.details.query.queries[i]);
                                            break
                                        }
                                if (!success) {
                                    this._onQueryFailed(error);
                                    this._handleQueryFailure(error)
                                }
                            }
                            else {
                                this._onQueryFailed(error);
                                this._handleQueryFailure(error)
                            }
                        }.bind(this))
                    }
                    else
                        this._setItems(null);
                    return WinJS.Promise.as(promise)
                }, _handleQueryFailure: function _handleQueryFailure(error) {
                    this._pendingQueryExecute = null;
                    if (!error || error.name !== "Canceled")
                        if (!this._attemptAnotherQuery()) {
                            this._setIsFailed(true);
                            this._setItems(null)
                        }
                }, _isEmptyListFromQuery: function _isEmptyListFromQuery(query) {
                    return !query || !query.result || !query.result.items || query.result.items.count <= 0
                }, _setItemsFromQuery: function _setItemsFromQuery(queryOrEvent) {
                    var result;
                    var error;
                    if (queryOrEvent) {
                        result = queryOrEvent.detail ? queryOrEvent.detail.result : queryOrEvent.result;
                        error = queryOrEvent.detail ? queryOrEvent.detail.error : queryOrEvent.error
                    }
                    if (error) {
                        this._onQueryFailed(error);
                        this._setIsFailed(true);
                        this._setItems(null)
                    }
                    else if (result) {
                        if (!result.items)
                            result.items = new MS.Entertainment.Data.VirtualList(null, []);
                        this._setIsFailed(false);
                        this._setItems(result.items)
                    }
                }, _registerForQueryEvents: function _registerForQueryEvents(query) {
                    this._unregisterForQueryEvents();
                    if (query && this.handleQueryChanges)
                        this._queryEventHandlers = MS.Entertainment.Utilities.addEventHandlers(query, {resultChanged: this._setItemsFromQuery.bind(this)})
                }, _unregisterForQueryEvents: function _unregisterForQueryEvents() {
                    if (this._queryEventHandlers) {
                        this._queryEventHandlers.cancel();
                        this._queryEventHandlers = null
                    }
                }, _setIsFailed: function _setIsFailed(value) {
                    if (this.isFailed !== value) {
                        var oldValue = this.isFailed;
                        this.isFailed = value;
                        this.dispatchEvent(MS.Entertainment.ViewModels.QueryViewModel.events.isFailedChanged, {
                            sender: this, newValue: this.isFailed, oldValue: oldValue
                        })
                    }
                }, _setItems: function _setItems(items) {
                    if (this.items !== items) {
                        var action;
                        if (items) {
                            action = this.createActionCells();
                            if (action && !Array.isArray(action))
                                action = [action];
                            if (action && action.length > 0) {
                                action = action.map(function(currentAction) {
                                    return new MS.Entertainment.Data.Factory.ListActionItemWrapper(currentAction)
                                });
                                if (this.addActionCellsAtEnd)
                                    items.insertRangeAtEnd(action);
                                else
                                    items.insertRangeAt(0, action)
                            }
                        }
                        var oldValue = this.items;
                        this.items = items;
                        this.dispatchEvent(MS.Entertainment.ViewModels.QueryViewModel.events.itemsChanged, {
                            sender: this, newValue: this.items, oldValue: oldValue
                        })
                    }
                }, _setLargeItemIndex: function _setLargeItemIndex(value) {
                    if (this.largeItemIndex !== value) {
                        var oldValue = this.largeItemIndex;
                        this.largeItemIndex = value;
                        this.dispatchEvent(MS.Entertainment.ViewModels.QueryViewModel.events.largeItemIndexChanged, {
                            sender: this, newValue: this.largeItemIndex, oldValue: oldValue
                        })
                    }
                }, _onBeginQuery: function _onBeginQuery(query){}, _onQueryFailed: function _onQueryFailed(error){}, _onQueryCompleted: function _onQueryCompleted(query){}, _attemptAnotherQuery: function _attemptAnotherQuery() {
                    var changedModifier = false;
                    var oldDataSource;
                    if (this.autoHideInvalidModifiers && !this._disposed && this._workingModifierSelectionManager) {
                        if (this._workingModifierSelectionManager.dataSource && this._workingModifierSelectionManager.selectedIndex >= 0) {
                            changedModifier = true;
                            this._modifiersTrimmed = true;
                            this._workingModifierSelectionManager.dataSource.removeAt(this._workingModifierSelectionManager.selectedIndex)
                        }
                        if (this._workingModifierSelectionManager.dataSource && this._workingModifierSelectionManager.dataSource.getArray)
                            oldDataSource = WinJS.Binding.unwrap(this._workingModifierSelectionManager.dataSource.getArray());
                        else
                            oldDataSource = [];
                        this._workingModifierSelectionManager.dataSource = new MS.Entertainment.ObservableArray(oldDataSource)
                    }
                    return changedModifier
                }
        }, {events: {
                itemsChanged: "itemsChanged", isFailedChanged: "isFailedChanged", largeItemIndexChanged: "largeItemIndexChanged", modifierClick: "modifierClick", secondaryModifierClick: "secondaryModifierClick"
            }})})
})()
