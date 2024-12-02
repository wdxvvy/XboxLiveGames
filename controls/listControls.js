/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    scriptValidator("/Framework/debug.js", "/Framework/corefx.js", "/Framework/observablearray.js");
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {ItemsControl: MS.Entertainment.UI.Framework.defineUserControl(null, function itemsControlConstructor(element, options) {
            this._handleChangesInDataSource = this._handleChangesInDataSource.bind(this);
            if (MS.Entertainment.UI.Framework.getTextDirection() === MS.Entertainment.UI.Framework.TextDirections.RightToLeft) {
                var left = this.bringIntoViewLeftMargin;
                var right = this.bringIntoViewRightMargin;
                this.bringIntoViewLeftMargin = right;
                this.bringIntoViewRightMargin = left
            }
        }, {
            keyboardNavigable: false, keyboardNavigationManagerClass: MS.Entertainment.Framework.KeyboardNavigationManager, keyboardNavigationSetTabIndex: false, _keyboardNavigationManager: null, raisePanelReady: false, ignoreChildrenInitialization: true, deferForLongLists: false, longListDeferralItemLimit: 10, _scroller: {get: function() {
                        if (this.useParentAsScrollContainer && this.domElement.parentElement)
                            return this.domElement.parentElement;
                        return this.domElement
                    }}, _itemTemplate: null, _itemTemplateSet: null, itemTemplate: {
                    get: function() {
                        return this._itemTemplate
                    }, set: function(value) {
                            this._itemTemplate = value;
                            if (this._itemTemplate && this._itemTemplateSet) {
                                this._itemTemplateSet(value);
                                this._itemTemplateSet = null
                            }
                        }
                }, containerStyle: null, animateIn: true, readyToRender: false, bringIntoViewRightMargin: 0, bringIntoViewLeftMargin: 0, _itemTemplateProvider: null, _workingDataSource: null, _pendedBringItemIntoViewItem: null, controlName: "ItemsControl", _dataSource: undefined, dataSource: {
                    get: function() {
                        return this._dataSource
                    }, set: function(value) {
                            if (value === this._dataSource)
                                return;
                            var oldValue = this._dataSource;
                            this._dataSource = value;
                            if (this._dataBindingHandler)
                                this._dataBindingHandler(value, oldValue);
                            else
                                this._listChangedHandler(value, oldValue);
                            if (!oldValue && value)
                                this._initializeWithData();
                            this.notify("dataSource", value, oldValue)
                        }
                }, initialize: function initialize() {
                    if (this.dataSource)
                        this._initializeWithData()
                }, unload: function unload() {
                    if (this._workingDataSource) {
                        this._workingDataSource.removeChangeListener(this._handleChangesInDataSource);
                        this._workingDataSource = null
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, _initializeWithData: function _initializeWithData() {
                    this._loadItemTemplateIgnoreErrors();
                    if (this.keyboardNavigable)
                        this._keyboardNavigationManager = new this.keyboardNavigationManagerClass(this.domElement, null, this.keyboardNavigationSetTabIndex)
                }, loadItemTemplate: function loadItemTemplate() {
                    var completePromise;
                    if (!this._itemTemplateProvider)
                        completePromise = this._loadTemplate(this.itemTemplate, null, true);
                    else
                        completePromise = WinJS.Promise.wrap(this._itemTemplateProvider);
                    completePromise = completePromise || WinJS.Promise.wrapError(new Error("No item template provided"));
                    return completePromise.then(function(template) {
                            this._itemTemplateProvider = template;
                            this.readyToRender = true;
                            return template
                        }.bind(this))
                }, _loadItemTemplateIgnoreErrors: function _loadItemTemplateIgnoreErrors() {
                    this.loadItemTemplate().done(null, function(){})
                }, selectTemplate: function(item) {
                    return this.loadItemTemplate().then(function() {
                            return this._itemTemplateProvider
                        }.bind(this))
                }, render: function(sourceChanged) {
                    if (this._workingDataSource && this._workingDataSource.length) {
                        if (this.applyPanelTemplate)
                            this.applyPanelTemplate();
                        this.loadItemTemplate().then(function renderOnceTemplateProviderLoaded() {
                            MS.Entertainment.assert(this.readyToRender, "should have found that the control was marked ready to render");
                            MS.Entertainment.UI.Framework.empty(this.domElement);
                            for (var i = 0; i < this._workingDataSource.length; i++) {
                                if (this.deferForLongLists && (i === this.longListDeferalItemLimit))
                                    break;
                                var item = this.processItemData(this._workingDataSource.item(i), i);
                                this._renderItem(item, i)
                            }
                            if (this.deferForLongLists && i < this._workingDataSource.length)
                                window.requestAnimationFrame(function() {
                                    for (; i < this._workingDataSource.length; i++) {
                                        if ((i % (this.longListDeferalItemLimit * 2)) === 0)
                                            MS.Entertainment.UI.Framework.forceFullLayout();
                                        var item = this.processItemData(this._workingDataSource.item(i), i);
                                        this._renderItem(item)
                                    }
                                }.bind(this));
                            if (this.itemsRendered)
                                this.itemsRendered()
                        }.bind(this))
                    }
                    else if (sourceChanged)
                        MS.Entertainment.UI.Framework.empty(this.domElement)
                }, processItemData: function processItemData(data, index) {
                    return data
                }, bringItemIntoView: function bringItemIntoView(item, options) {
                    options = options || {};
                    MS.Entertainment.UI.Controls.assert(item, "You need an item to bring into view");
                    var itemBroughtIntoView = WinJS.Promise.as();
                    if (!item)
                        return itemBroughtIntoView;
                    if (!this._workingDataSource) {
                        var pendeditem = {
                                item: item, completePromise: null
                            };
                        this._pendedBringItemIntoViewItem = pendeditem;
                        return new WinJS.Promise(function(c) {
                                pendeditem.completePromise = c
                            })
                    }
                    var index = this._workingDataSource ? this._workingDataSource.indexOf(item) : -1;
                    MS.Entertainment.assert(index > -1, "item not found in data source");
                    var element = this.domElement.children[index];
                    if (!element) {
                        var pendeditem = {
                                item: item, completePromise: null
                            };
                        this._pendedBringItemIntoViewItem = pendeditem;
                        return new WinJS.Promise(function(c) {
                                pendeditem.completePromise = c
                            })
                    }
                    if (!options.bringOnMinimally && !options.animated)
                        element.scrollIntoView();
                    else {
                        var targetPosition = this.getScrollPositionToShowItem(item, {
                                bringOnMinimally: options.bringOnMinimally, alwaysAlignLeftEdge: options.alwaysAlignLeftEdge
                            });
                        if (targetPosition != -1)
                            itemBroughtIntoView = this._performScroll(targetPosition, options.animated, options.ignoreMissingStarts)
                    }
                    return itemBroughtIntoView
                }, getScrollPositionToShowItem: function(item, options) {
                    options = options || {};
                    var result = -1;
                    MS.Entertainment.UI.Controls.assert(item, "Required an item");
                    if (!item)
                        return result;
                    var index = this._workingDataSource ? this._workingDataSource.indexOf(item) : -1;
                    MS.Entertainment.assert(index > -1, "item not found in data source");
                    var element = this.domElement.children[index];
                    if (!element)
                        return result;
                    var rightMargin = this.bringIntoViewRightMargin;
                    var leftMargin = this.bringIntoViewLeftMargin;
                    if (!options.bringOnMinimally) {
                        rightMargin = 0;
                        leftMargin = 0
                    }
                    var minRightEdgeOnScreen = (element.offsetLeft + element.clientWidth + rightMargin) - this._scroller.clientWidth;
                    var minLeftEdgeOnScreen = Math.max(0, element.offsetLeft - leftMargin);
                    if (MS.Entertainment.UI.Framework.getTextDirection() === MS.Entertainment.UI.Framework.TextDirections.RightToLeft) {
                        minLeftEdgeOnScreen = (this._scroller.clientWidth - element.offsetLeft - element.clientWidth - rightMargin);
                        minRightEdgeOnScreen = leftMargin - element.offsetLeft
                    }
                    var isRightEdgeOnScreen = this._scroller.scrollLeft >= minRightEdgeOnScreen;
                    var isLeftEdgeOnScreen = this._scroller.scrollLeft <= minLeftEdgeOnScreen;
                    var targetScrollPosition = -1;
                    if (options.alwaysAlignLeftEdge) {
                        minLeftEdgeOnScreen = Math.min(minLeftEdgeOnScreen, Math.max(0, (this._scroller.scrollWidth - this._scroller.clientWidth)));
                        targetScrollPosition = minLeftEdgeOnScreen
                    }
                    else if (!(isRightEdgeOnScreen && isLeftEdgeOnScreen))
                        if (!isRightEdgeOnScreen)
                            targetScrollPosition = minRightEdgeOnScreen;
                        else if (!isLeftEdgeOnScreen)
                            targetScrollPosition = minLeftEdgeOnScreen;
                    return targetScrollPosition
                }, getElementForItem: function getElementForItem(item) {
                    var index = this._workingDataSource ? this._workingDataSource.indexOf(item) : -1;
                    return this.domElement.children[index]
                }, _performScroll: function _performScroll(scrollLeft, animated, ignoreMissingStarts) {
                    if (!animated) {
                        this._scroller.scrollLeft = scrollLeft;
                        return WinJS.Promise.as()
                    }
                    return MS.Entertainment.UI.Framework.scrollIntoViewWithAnimation(this._scroller, scrollLeft, ignoreMissingStarts)
                }, _loadTemplate: function _loadTemplate(template) {
                    var completePromise = WinJS.Promise.as(template);
                    if (!template)
                        completePromise = new WinJS.Promise(function(c, e, p) {
                            this._itemTemplateSet = c
                        }.bind(this));
                    completePromise = completePromise.then(function(validTemplate) {
                        if (typeof validTemplate === "string")
                            return MS.Entertainment.UI.Framework.loadTemplate(validTemplate, null, true);
                        else if (validTemplate)
                            return WinJS.Promise.wrap(validTemplate.winControl)
                    });
                    return completePromise
                }, _listChangedHandler: function _listChangedHandler(newValue, oldValue) {
                    if (this._unloaded)
                        return;
                    if (!newValue) {
                        if (this._workingDataSource) {
                            this._workingDataSource.clear();
                            this._workingDataSource.removeChangeListener(this._handleChangesInDataSource);
                            this._workingDataSource = null
                        }
                        if (newValue === null && this.itemsRendered)
                            this.itemsRendered();
                        return
                    }
                    if (this._workingDataSource)
                        this._workingDataSource.removeChangeListener(this._handleChangesInDataSource);
                    var tempWorkingData = WinJS.Binding.unwrap(newValue);
                    if (!(newValue instanceof MS.Entertainment.ObservableArray))
                        tempWorkingData = new MS.Entertainment.ObservableArray(newValue);
                    if (tempWorkingData)
                        tempWorkingData.addChangeListener(this._handleChangesInDataSource);
                    this._workingDataSource = tempWorkingData;
                    if (this.itemsChanged)
                        this.itemsChanged();
                    if (newValue || oldValue)
                        this.render(newValue && oldValue)
                }, _renderItem: function _renderItemToIndex(item, index) {
                    this.selectTemplate(item).then(function withSelectedTemplate(itemTemplateProvider) {
                        var element;
                        var container = document.createElement(itemTemplateProvider.element.tagName);
                        var that = this;
                        var upperBound = (this._workingDataSource && this._workingDataSource.length - 1) || 0;
                        var end;
                        var start;
                        if (upperBound < 0)
                            upperBound = 0;
                        end = (index >= upperBound) || (index === undefined);
                        start = (index < 1);
                        if (!end || !(end && start) && index)
                            element = this.domElement.children[index];
                        if (end || (end && start) || !element)
                            that.domElement.appendChild(container);
                        else
                            that.domElement.insertBefore(container, element);
                        if (that.containerStyle)
                            WinJS.Utilities.addClass(container, that.containerStyle);
                        itemTemplateProvider.render(item, container).then(function(child) {
                            if (that.applyItemTemplate)
                                container = that.applyItemTemplate(container, item, index);
                            if (that._pendedBringItemIntoViewItem && that._pendedBringItemIntoViewItem.item === item) {
                                var complete = that._pendedBringItemIntoViewItem.completePromise;
                                that._pendedBringItemIntoViewItem = null;
                                that.bringItemIntoView(item, {bringOnMinimally: true}).then(complete)
                            }
                            if (container && that.animateIn && MS.Entertainment.UI.Framework.beginShowAnimations)
                                MS.Entertainment.UI.Framework.beginShowAnimations(container)
                        })
                    }.bind(this))
                }, itemsRendered: function itemsRendered() {
                    if (this.raisePanelReady)
                        MS.Entertainment.UI.Controls.Panel.raisePanelReady(this.domElement)
                }, _handleChangesInDataSource: function _handleChangesInDataSource(notification) {
                    if (this.itemsChanged)
                        this.itemsChanged(notification);
                    switch (notification.type) {
                        case MS.Entertainment.ObservableArray.OperationTypes.add:
                            if (this.readyToRender) {
                                var item = this.processItemData(notification.item, notification.index);
                                this._renderItem(item, notification.index)
                            }
                            break;
                        case MS.Entertainment.ObservableArray.OperationTypes.remove:
                            MS.Entertainment.assert(notification.index < this.domElement.children.length, "Child to remove doesn't exist");
                            var child = this.domElement.children[notification.index];
                            if (child) {
                                this.domElement.removeChild(child);
                                if (this._handleItemRemoved)
                                    this._handleItemRemoved(child)
                            }
                            break;
                        case MS.Entertainment.ObservableArray.OperationTypes.reset:
                            MS.Entertainment.UI.Framework.empty(this.domElement);
                            break;
                        default:
                            MS.Entertainment.assert(false, "unsupported notification type: " + notification.type);
                            break
                    }
                }
        }, null, {ContainerStyles: {
                none: "", horizontalFlow: "horizontalFlow", verticalFlow: "verticalFlow", listFlowLeft: "listFlowLeft"
            }})});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {FlexibleItemsControl: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.ItemsControl, null, function(element, options) {
            WinJS.Utilities.addClass(element, "flexibleItemsControlContainer");
            this.applyPanelTemplate = this.applyPanelTemplate.bind(this);
            this.onItemClicked = this._onItemClicked.bind(this)
        }, {
            dataContext: null, itemTemplates: null, itemSize: null, rowLayout: false, fixedRowCount: null, fixedColumnCount: null, skipSettingWidth: false, skipSettingHeight: false, reflowOnWindowSizeChanged: false, enableClickEvents: false, _loadTemplatePromise: null, applyPanelTemplate: function applyPanelTemplate() {
                    var dataLength = this._workingDataSource ? this._workingDataSource.length : 1;
                    var rowCount;
                    var columnCount;
                    var hasFixedRowCount = typeof this.fixedRowCount === "number";
                    var hasFixedColumnCount = typeof this.fixedColumnCount === "number";
                    if (hasFixedRowCount && !hasFixedColumnCount) {
                        rowCount = this.fixedRowCount;
                        columnCount = Math.max(Math.ceil(dataLength / rowCount), 1)
                    }
                    else if (!hasFixedRowCount && hasFixedColumnCount) {
                        columnCount = this.fixedColumnCount;
                        rowCount = Math.max(Math.ceil(dataLength / columnCount), 1)
                    }
                    else if (hasFixedRowCount && hasFixedColumnCount) {
                        rowCount = this.fixedRowCount;
                        columnCount = this.fixedColumnCount
                    }
                    else {
                        rowCount = MS.Entertainment.Utilities.getRowCountForResolution();
                        columnCount = Math.max(Math.ceil(dataLength / rowCount), 1)
                    }
                    MS.Entertainment.UI.Controls.assert(dataLength <= (rowCount * columnCount), "FlexibleItemsControl_applyPanelTemplate: Items don't fit in the container.");
                    var explicitWidth = (columnCount * this.itemSize.width) + "px";
                    var explicitHeight = (rowCount * this.itemSize.height) + "px";
                    if (!this.skipSettingWidth && this.domElement.style.width !== explicitWidth)
                        this.domElement.style.width = explicitWidth;
                    if (!this.skipSettingHeight && this.domElement.style.height !== explicitHeight)
                        this.domElement.style.height = explicitHeight;
                    if (this.rowLayout)
                        WinJS.Utilities.addClass(this.domElement, "flexRowLayout");
                    var domEvent = document.createEvent("Event");
                    domEvent.initEvent("SizeAdjusted", true, true);
                    this.domElement.dispatchEvent(domEvent)
                }, itemsChanged: function itemsChanged() {
                    this.applyPanelTemplate()
                }, initialize: function initialize() {
                    MS.Entertainment.UI.Controls.ItemsControl.prototype.initialize.apply(this, arguments);
                    if (this.reflowOnWindowSizeChanged)
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).addEventListener("windowresize", this.applyPanelTemplate);
                    if (this.enableClickEvents)
                        this.domElement.addEventListener("click", this.onItemClicked)
                }, thaw: function thaw() {
                    MS.Entertainment.UI.Controls.ItemsControl.prototype.thaw.call(this);
                    if (this.dataContext && this.dataContext.thaw)
                        this.dataContext.thaw()
                }, unload: function unload() {
                    if (this.reflowOnWindowSizeChanged)
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).removeEventListener("windowresize", this.applyPanelTemplate);
                    if (this.enableClickEvents)
                        this.domElement.removeEventListener("click", this.onItemClicked);
                    MS.Entertainment.UI.Controls.ItemsControl.prototype.unload.call(this)
                }, applyItemTemplate: function applyItemTemplate(container) {
                    WinJS.Utilities.addClass(container, "flexibleItemsControlItemContainer");
                    return container
                }, loadItemTemplate: function() {
                    MS.Entertainment.UI.Controls.assert(!this.itemTemplate, "Do not support non-array template");
                    MS.Entertainment.UI.Controls.assert(Array.isArray(this.itemTemplates), "expected an array");
                    if (this._loadTemplatePromise)
                        return this._loadTemplatePromise;
                    var templateLoadPromises = [];
                    var loadedTemplates = {};
                    this.itemTemplates.forEach(function(item) {
                        var promise = MS.Entertainment.UI.Framework.loadTemplate(item.template, null, true).then(function(template) {
                                loadedTemplates[item.value] = template
                            });
                        templateLoadPromises.push(promise)
                    });
                    this._loadTemplatePromise = WinJS.Promise.join(templateLoadPromises).then(function() {
                        this._itemTemplateProviders = loadedTemplates
                    }.bind(this)).then(function() {
                        this.readyToRender = true
                    }.bind(this));
                    return this._loadTemplatePromise
                }, selectTemplate: function selectTemplate(item) {
                    return this.loadItemTemplate().then(function() {
                            var propertyValue = item[this._getPropertyToCheck(item)];
                            MS.Entertainment.UI.Controls.assert(propertyValue, "Couldn't find that property on the data, it was falsey.");
                            var template = this._itemTemplateProviders[propertyValue];
                            MS.Entertainment.UI.Controls.assert(template, "Couldn't find a template for property: " + this.propertyName + " with value: " + propertyValue);
                            return template
                        }.bind(this))
                }, _getPropertyToCheck: function _getPropertyToCheck(item) {
                    if (!Array.isArray(this.propertyName))
                        return this.propertyName;
                    var propertyName;
                    for (var i = 0; i < this.propertyName.length; i++)
                        if (item[this.propertyName[i]]) {
                            propertyName = this.propertyName[i];
                            break
                        }
                    return propertyName
                }, _onItemClicked: function _onItemClicked(e) {
                    var element = e.srcElement;
                    while (element && element !== this.domElement) {
                        if (element.clickDataContext && element.clickDataContext.doclick) {
                            element.clickDataContext.doclick({target: element.clickDataContext});
                            e.stopPropagation();
                            return
                        }
                        element = element.parentElement
                    }
                }
        }, {})});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {ItemsControlWithViewModel: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.ItemsControl, null, function itemsControlWithViewModel(element, options){}, {
            listViewModel: null, controlName: "ItemsControlWithViewModel", processItemData: function processItemData(itemData, index) {
                    return new MS.Entertainment.UI.Controls.ItemsControlViewModel(itemData, this.listViewModel, index)
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {ItemsControlViewModel: WinJS.Class.define(function itemsControlViewModel(data, listViewModel, index) {
            this.data = data;
            this.listViewModel = listViewModel;
            this.index = index
        }, {
            listViewModel: null, data: null, index: -1, instance: {get: function() {
                        return this
                    }}
        })})
})()
