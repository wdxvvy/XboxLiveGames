/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/utilities.js", "/Framework/selectionManager.js", "/Controls/pivotControls.js");
(function() {
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Framework");
    WinJS.Namespace.define("MS.Entertainment.Social", {InboxPage: MS.Entertainment.UI.Framework.defineUserControl("Components/Social/InboxPage.html#inboxPageTemplate", function InboxPage(element, options) {
            this._resetPage();
            this._hubsSelectionManager = new MS.Entertainment.Framework.SelectionManager(null, 0);
            this._mainHeader = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.mainHeader)
        }, {
            _hubsSelectionManager: null, _pivotsSourcePath: null, _modifierSourcePath: null, _page: null, _complexBindings: null, _eventHandlers: null, _loadedHub: null, _initialized: false, _pageReadyOnce: false, _pageLoadedOnce: false, _title: null, _loadedOnce: false, _isFailed: false, _isLoading: true, _mainHeader: null, _mainHeaderIndex: null, _skipDefer: true, title: {
                    get: function() {
                        return this._title
                    }, set: function(value) {
                            if (value !== this._title) {
                                var oldValue = this._title;
                                this._title = value;
                                this.notify("title", value, oldValue);
                                if (this._initialized && !this._unloaded)
                                    this._titleContainer.textContent = value
                            }
                        }
                }, loadedOnce: {
                    get: function() {
                        return this._loadedOnce
                    }, set: function(value) {
                            if (value !== this._loadedOnce) {
                                var oldValue = this._loadedOnce;
                                this._loadedOnce = value;
                                this.notify("loadedOnce", value, oldValue);
                                if (this._initialized && !this._unloaded)
                                    this._bodyContainer.visibility = value
                            }
                        }
                }, isFailed: {
                    get: function() {
                        return this._isFailed
                    }, set: function(value) {
                            if (value !== this._isFailed) {
                                var oldValue = this._isFailed;
                                this._isFailed = value;
                                this.notify("isFailed", value, oldValue);
                                this._isFailedChanged(value, oldValue)
                            }
                        }
                }, isLoading: {
                    get: function() {
                        return this._isLoading
                    }, set: function(value) {
                            if (value !== this._isLoading) {
                                var oldValue = this._isLoading;
                                this._isLoading = value;
                                this.notify("isLoading", value, oldValue);
                                this._isLoadingChanged(value, oldValue)
                            }
                        }
                }, currentHub: {get: function() {
                        return (this._hubsSelectionManager && this._hubsSelectionManager.selectedItem) ? this._hubsSelectionManager.selectedItem : MS.Entertainment.Social.InboxPageHub.empty
                    }}, isCurrentHubEmpty: {get: function() {
                        return MS.Entertainment.Social.InboxPageHub.isEmpty(this.currentHub)
                    }}, currentHubId: {get: function() {
                        return this.currentHub.id
                    }}, hideLoadingPanel: {get: function() {
                        return (this.currentHub.dataContext) ? this.currentHub.dataContext.hideLoadingPanel : false
                    }}, hidePivotsOnFailed: {get: function() {
                        return (this.currentHub.dataContext && this.currentHub.dataContext.hidePivotsOnFailed !== undefined) ? this.currentHub.dataContext.hidePivotsOnFailed : false
                    }}, initialize: function initialize() {
                    this._eventHandlers = MS.Entertainment.Utilities.addEventHandlers(this._hubsSelectionManager, {selectedItemChanged: this._onSelectionChanged.bind(this)});
                    this._onSelectionChanged();
                    MS.Entertainment.Framework.AccUtils.createAriaLinkId(this.hubContainer);
                    this._pivotControl.setTabPanelId(this.hubContainer.id);
                    this._initialized = true;
                    this._titleContainer.textContent = this.title;
                    this._bodyContainer.visibility = this.loadedOnce;
                    this._isLoadingChanged(this.isLoading);
                    this._isFailedChanged(this.isFailed)
                }, unload: function unload() {
                    this._resetPage();
                    if (this._hubsSelectionManager && this._hubsSelectionManager.dataSource)
                        this._hubsSelectionManager.dataSource.forEach(function(item) {
                            item.dispose()
                        });
                    if (this._hubsSelectionManager) {
                        this._hubsSelectionManager.dispose();
                        this._hubsSelectionManager = null
                    }
                    if (this._complexBindings) {
                        this._complexBindings.cancel();
                        this._complexBindings = null
                    }
                    if (this._eventHandlers) {
                        this._eventHandlers.cancel();
                        this._eventHandlers = null
                    }
                    if (this._loadedHub && this._loadedHub.dispose) {
                        this._loadedHub.dispose();
                        this._loadedHub = null
                    }
                    if (this.dataContext) {
                        if (this.dataContext.viewModel && this.dataContext.viewModel.dispose)
                            this.dataContext.viewModel.dispose();
                        this.dataContext = null
                    }
                    this._page = null;
                    this.modifierDescriptionFormatter = null;
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, handlePanelReady: function handlePanelReady(event) {
                    var eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell;
                    if (event.failed || (!event.failed && this.isFailed)) {
                        this.failedModel = event.model;
                        this.isFailed = event.failed
                    }
                    event.panelId = this.currentHubId;
                    this.isLoading = false;
                    eventProvider.tracePanel_Ready(this.currentHubId || "");
                    eventProvider.traceHub_Ready(this.currentHubId || "");
                    this._invokePageReadyOnce()
                }, handlePanelReset: function handlePanelReset() {
                    var eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell;
                    if (!this.isLoading) {
                        this.failedModel = null;
                        this.isFailed = false;
                        this.isLoading = true;
                        eventProvider.tracePanel_Load_Start(this.currentHubId || "");
                        eventProvider.traceHub_Load_Start(this.currentHubId || "")
                    }
                }, onNavigateTo: function onNavigateTo(page, hub, panel) {
                    var pageDataContext;
                    var modifierSelectionManager;
                    var pivotSelectionManager;
                    var dataContext;
                    if (this.id !== page.iaNode.moniker && page.iaNode.moniker === MS.Entertainment.UI.Monikers.socialInboxPage) {
                        dataContext = page.getDataContext();
                        this.id = page.iaNode.moniker;
                        this._resetPage();
                        this._page = page;
                        this._hubsSelectionManager.dataSource = null;
                        this._hubsSelectionManager.settingsKey = (dataContext && dataContext.preventHubSelectionSave) ? null : this.id + "_viewSelection";
                        this._hubsSelectionManager.dataSource = this._mapHubs(this._page.hubs);
                        if (this._page.options && typeof this._page.options.messageId === "number")
                            this._hubsSelectionManager.selectedIndex = 0;
                        this.title = page.title;
                        this.dataContext = dataContext;
                        this._invokePageLoadStart()
                    }
                    if (this._page && !this._page.onNavigateAway)
                        this._page.onNavigateAway = this.onNavigateAway.bind(this);
                    if (this._mainHeader && this._mainHeader.domElement) {
                        this._mainHeaderIndex = this._mainHeader.domElement.style.zIndex;
                        this._mainHeader.domElement.style.zIndex = -1
                    }
                }, onNavigateAway: function onNavigateAway() {
                    MS.Entertainment.Social.Helpers.getSignedInUserModel().refresh().done(null, function(){});
                    if (this._mainHeader && this._mainHeader.domElement)
                        this._mainHeader.domElement.style.zIndex = this._mainHeaderIndex;
                    if (this._page && !this._page.onNavigateTo)
                        this._page.onNavigateTo = this.onNavigateTo.bind(this)
                }, _isFailedChanged: function _isFailedChanged(value, oldValue) {
                    if (this._initialized && !this._unloaded)
                        if (value) {
                            MS.Entertainment.Utilities.hideElement(this.loadingControl);
                            MS.Entertainment.Utilities.hideElement(this.hubContainer);
                            MS.Entertainment.Utilities.showElement(this.failedControl);
                            if (!this.failedControl.childElementCount) {
                                var newControl = document.createElement("div");
                                newControl.setAttribute("data-win-control", "MS.Entertainment.UI.Controls.FailedPanel");
                                this.failedControl.appendChild(newControl);
                                WinJS.UI.process(newControl).then(function setModel() {
                                    newControl.winControl.model = this.failedModel
                                }.bind(this))
                            }
                            else
                                this.failedControl.children[0].winControl.model = this.failedModel;
                            if (this.hidePivotsOnFailed) {
                                WinJS.Utilities.addClass(this._modifierControl.domElement, "removeFromDisplay");
                                WinJS.Utilities.addClass(this._pivotControl.domElement, "removeFromDisplay")
                            }
                        }
                        else {
                            MS.Entertainment.Utilities.hideElement(this.failedControl);
                            if (oldValue) {
                                MS.Entertainment.Utilities.showElement(this.hubContainer);
                                MS.Entertainment.Utilities.hideElement(this.loadingControl)
                            }
                            WinJS.Utilities.removeClass(this._modifierControl.domElement, "removeFromDisplay");
                            WinJS.Utilities.removeClass(this._pivotControl.domElement, "removeFromDisplay")
                        }
                }, _isLoadingChanged: function _isLoadingChanged(value, oldValue) {
                    if (this._initialized && !this._unloaded)
                        if (!value || this.hideLoadingPanel) {
                            MS.Entertainment.Utilities.hideElement(this.loadingControl);
                            if (!this.isFailed)
                                MS.Entertainment.Utilities.showElement(this.hubContainer);
                            WinJS.Utilities.removeClass(this.loadingControlRing, "win-ring")
                        }
                        else {
                            MS.Entertainment.Utilities.hideElement(this.hubContainer);
                            MS.Entertainment.Utilities.showElement(this.loadingControl);
                            WinJS.Utilities.addClass(this.loadingControlRing, "win-ring")
                        }
                }, _minModifierItemsChanged: function _minModifierItemsChanged(newValue, oldValue) {
                    if (this._initialized && !this._unloaded)
                        this._modifierControl.minItems = newValue
                }, _modifierDescriptionChanged: function _modifierDescriptionChanged(newValue, oldValue) {
                    if (this._initialized && !this._unloaded)
                        this._modifierControl.descriptionLabelText = newValue
                }, _titleOverrideChanged: function _titleOverrideChanged(newValue, oldValue) {
                    if (newValue !== null && newValue !== undefined)
                        this.title = newValue;
                    else if (this._page)
                        this.title = this._page.title;
                    else
                        this.title = String.empty
                }, _pivotSelectedIndexOverrideChanged: function _pivotSelectedIndexOverrideChanged(newValue, oldValue) {
                    if (this._hubsSelectionManager && newValue !== null && newValue !== undefined)
                        this._hubsSelectionManager.selectedIndex = newValue
                }, _refreshSelectionManagers: function _refreshSelectionManagers() {
                    var modifierSelectionManager;
                    var pivotsSelectionManager;
                    if (this.currentHub && this.currentHub.dataContext && this.currentHub.dataContext.viewModel) {
                        modifierSelectionManager = this.currentHub.dataContext.viewModel.modifierSelectionManager;
                        pivotsSelectionManager = this.currentHub.dataContext.viewModel.pivotsSelectionManager
                    }
                    pivotsSelectionManager = pivotsSelectionManager || this._hubsSelectionManager || MS.Entertainment.Social.InboxPage.empty;
                    modifierSelectionManager = modifierSelectionManager || MS.Entertainment.Social.InboxPage.empty;
                    if (modifierSelectionManager === MS.Entertainment.Social.InboxPage.empty && pivotsSelectionManager !== this._hubsSelectionManager)
                        modifierSelectionManager = this._hubsSelectionManager;
                    this._pivotControl.selectionManager = this.pivotsSelectionManager = pivotsSelectionManager;
                    this._modifierControl.selectionManager = this.modifierSelectionManager = modifierSelectionManager;
                    this._modifierControl.items = modifierSelectionManager.dataSource
                }, _mapHubs: function _mapHubs(hubs) {
                    var result;
                    if (hubs)
                        result = hubs.map(function mapHubToHub(hub) {
                            return new MS.Entertainment.Social.InboxPageHub({
                                    page: this._page, hub: hub
                                })
                        }, this);
                    else
                        result = [];
                    return result
                }, _resetPage: function _resetPage() {
                    this.hubs = [];
                    this.dataContext = {};
                    this.title = null;
                    this._page = {};
                    if (this._loadedHub && this._loadedHub.dispose)
                        this._loadedHub.dispose();
                    this._loadedHub = MS.Entertainment.Social.InboxPageHub.empty
                }, _onSelectionChanged: function _onSelectionChanged(args) {
                    if (this._complexBindings) {
                        this._complexBindings.cancel();
                        this._complexBindings = null
                    }
                    if (this.currentHub)
                        this._loadHub()
                }, _loadHub: function _loadHub() {
                    var currentHub = this.currentHub;
                    var command = {
                            automationId: currentHub.id, title: currentHub.label, parameter: {
                                    page: currentHub.options.page, hub: currentHub.options.hub
                                }
                        };
                    MS.Entertainment.Utilities.Telemetry.logCommandClicked(command);
                    if (MS.Entertainment.Social.InboxPageHub.isEmpty(currentHub) || currentHub === this._loadedHub)
                        return;
                    if (this._loadedHub && this._loadedHub.clearDataContext) {
                        this._loadedHub.clearDataContext();
                        this._loadedHub = null
                    }
                    this.handlePanelReset();
                    this._loadedHub = currentHub;
                    MS.Entertainment.Utilities.empty(this.hubContainer);
                    MS.Entertainment.UI.Framework.assert(!this._complexBindings, "bindings should have been cleared");
                    this._complexBindings = WinJS.Binding.bind(currentHub, {dataContext: {
                            viewModel: {
                                modifierSelectionManager: {dataSource: this._refreshSelectionManagers.bind(this)}, pivotsSelectionManager: {dataSource: this._refreshSelectionManagers.bind(this)}, modifierDescriptionFormatter: {result: this._modifierDescriptionChanged.bind(this)}, titleOverride: this._titleOverrideChanged.bind(this), pivotSelectedIndexOverride: this._pivotSelectedIndexOverrideChanged.bind(this)
                            }, minModifierItems: this._minModifierItemsChanged.bind(this)
                        }});
                    if (currentHub.dataContext.viewModel && currentHub.dataContext.viewModel.begin)
                        if (!this.loadedOnce)
                            currentHub.dataContext.viewModel.begin(currentHub.options && currentHub.options.page && currentHub.options.page.options);
                        else
                            currentHub.dataContext.viewModel.begin();
                    MS.Entertainment.UI.Framework.loadTemplate(currentHub.fragmentUrl).then(function renderHub(controlInstance) {
                        if (this._loadedHub === currentHub)
                            return this._renderHub(controlInstance, currentHub)
                    }.bind(this)).then(function finalizeHub() {
                        this.loadedOnce = true
                    }.bind(this))
                }, _renderHub: function _renderHub(controlInstance, hub) {
                    return controlInstance.render(hub, this.hubContainer).then(function raiseEvent() {
                            if (this._loadedHub !== hub)
                                return;
                            if (hub.id)
                                this.hubContainer.setAttribute("data-win-automationid", hub.id);
                            else
                                this.hubContainer.removeAttribute("data-win-automationid");
                            var domEvent = document.createEvent("Event");
                            domEvent.initEvent("PanelLoadingStarted", true, true);
                            this.hubContainer.dispatchEvent(domEvent);
                            var eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell;
                            eventProvider.tracePanel_Load_End(hub.id || "");
                            eventProvider.traceHub_Load_End(hub.id || "");
                            this._invokePageLoadedOnce();
                            if (!hub || !hub.dataContext || !hub.dataContext.doNotRaisePanelReady)
                                MS.Entertainment.UI.Controls.Panel.raisePanelReady(this.hubContainer)
                        }.bind(this))
                }, _invokePageLoadStart: function _invokePageLoadStart() {
                    var eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell;
                    eventProvider.traceHubStrip_Load_Start(this.id || "");
                    this._pageLoadedOnce = false;
                    this._pageReadyOnce = false
                }, _invokePageLoadedOnce: function _invokePageLoadedOnce() {
                    if (!this._pageLoadedOnce) {
                        this._pageLoadedOnce = true;
                        var eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell;
                        eventProvider.traceHubStrip_Load_End(this.id);
                        var visibleEvent = document.createEvent("Event");
                        visibleEvent.initEvent("HubStripVisible", true, false);
                        this.domElement.dispatchEvent(visibleEvent)
                    }
                }, _invokePageReadyOnce: function _invokePageReadyOnce() {
                    if (!this._pageReadyOnce) {
                        this._pageReadyOnce = true;
                        var eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell;
                        eventProvider.traceHubStrip_Ready(this.id);
                        var readyEvent = document.createEvent("Event");
                        readyEvent.initEvent("HubStripLoaded", true, false);
                        this.domElement.dispatchEvent(readyEvent);
                        var readyEvent = document.createEvent("Event");
                        readyEvent.initEvent("HubStripReady", true, false);
                        this.domElement.dispatchEvent(readyEvent);
                        var uiState = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                        uiState.isHubStripVisible = true
                    }
                }
        }, {
            modifierSelectionManager: null, pivotsSelectionManager: null, dataContext: null, id: null
        }, {empty: {}})});
    WinJS.Namespace.define("MS.Entertainment.Social", {InboxPageHub: MS.Entertainment.defineOptionalObservable(function InboxPageHubInstance(options) {
            this.options = options;
            if (options && options.hub) {
                this.id = options.hub.iaNode.moniker;
                this.fragmentUrl = options.hub.overrideFragmentUrl;
                if (options.hub.titleProviderFactory) {
                    this._titleProvider = options.hub.titleProviderFactory();
                    this._titleProviderBindings = WinJS.Binding.bind(this._titleProvider, {title: this._titleProviderTitleChanged.bind(this)})
                }
                else
                    this.label = options.hub.title
            }
        }, {
            _dataContext: null, _disposed: false, _titleProvider: null, _titleProviderBindings: null, dispose: function dispose() {
                    this._disposed = true;
                    this.clearDataContext();
                    if (this._titleProviderBindings) {
                        this._titleProviderBindings.cancel();
                        this._titleProviderBindings = null
                    }
                    if (this._titleProvider && this._titleProvider.dispose) {
                        this._titleProvider.dispose();
                        this._titleProvider = null
                    }
                }, _titleProviderTitleChanged: function _titleProviderTitleChanged(title) {
                    if (title) {
                        this.label = title;
                        this.isDisabled = false
                    }
                    else {
                        this.label = String.empty;
                        this.isDisabled = true
                    }
                }, clearDataContext: function clearDataContext() {
                    if (this._dataContextBinds) {
                        this._dataContextBinds.cancel();
                        this._dataContextBinds = null
                    }
                    if (this._dataContext) {
                        if (this._dataContext && this._dataContext.viewModel && this._dataContext.viewModel.dispose)
                            this._dataContext.viewModel.dispose();
                        this._dataContext = null
                    }
                    if (this.options && this.options.hub)
                        this.options.hub.clearDataContext()
                }, instance: {get: function() {
                        return this
                    }}, dataContext: {get: function() {
                        var original = this._dataContext;
                        if (!this._disposed) {
                            if (!this._dataContext && this.options && this.options.hub)
                                this._dataContext = this.options.hub.getDataContext();
                            if (!this._dataContext && this.options && this.options.page)
                                this._dataContext = this.options.page.getDataContext()
                        }
                        return this._dataContext
                    }}
        }, {
            id: null, selected: false, label: null, isDisabled: false, titleOverride: null, pivotSelectedIndexOverride: null, fragmentUrl: null, options: null, isRoot: true
        }, {
            empty: {
                dataContext: null, selected: false, id: null, fragmentUrl: null, options: null
            }, isEmpty: function isEmpty(value) {
                    return WinJS.Binding.unwrap(value) === MS.Entertainment.Social.InboxPageHub.empty
                }
        })})
})()
