﻿/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Components/PerfTrack/PerfTrack.js", "/Framework/debug.js", "/Framework/serviceLocator.js", "/Framework/iaservice.js", "/Framework/utilities.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Navigation");
WinJS.Namespace.define("MS.Entertainment.Navigation", {NavigationDirection: {
        forward: "forward", backward: "backward"
    }});
WinJS.Namespace.define("MS.Entertainment.Navigation", {
    BackStack: MS.Entertainment.defineObservable(function backStackConstructor() {
        this._stack = []
    }, {
        StackEntry: WinJS.Class.define(function stackEntryConstructor(page, hub, panel) {
            this.page = page;
            this.hub = hub;
            this.panel = panel
        }, {
            page: null, hub: null, panel: null
        }), _maxSize: 10, _stack: null, canNavigateBack: false, _updateCanNavigateBack: function _updateCanNavigateBack() {
                this.canNavigateBack = this._stack.length > 0
            }, navigateTo: function navigateTo(page, hub, panel) {
                page.clearDataContext();
                this._stack.push(new this.StackEntry(page, hub, panel));
                if (this._stack.length > this._maxSize)
                    this._stack = this._stack.slice(this._stack.length - this._maxSize);
                var appBar = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar);
                if (appBar)
                    appBar.hide();
                this._updateCanNavigateBack()
            }, navigateBack: function navigateBack() {
                var outboundEntry = null;
                if (this.canNavigateBack)
                    outboundEntry = this._stack.pop();
                var appBar = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar);
                if (appBar)
                    appBar.hide();
                this._updateCanNavigateBack();
                return outboundEntry
            }, peekNavigateBack: function peekNavigateBack() {
                var outboundEntry;
                if (this.canNavigateBack && this._stack.length)
                    outboundEntry = this._stack[this._stack.length - 1];
                return outboundEntry
            }, clear: function clear() {
                this._stack = [];
                this._updateCanNavigateBack()
            }, getTestHooks: function getTestHooks() {
                var that = this;
                return {
                        getNavigationHistory: function getNavigationHistory() {
                            return that._stack.slice()
                        }, setMaxSize: function setMaxSize(newMax) {
                                that._maxSize = newMax
                            }, getMaxSize: function getMaxSize() {
                                return that._maxSize
                            }
                    }
            }
    }), Navigation: WinJS.Class.derive(MS.Entertainment.UI.Framework.ObservableBase, function navigationConstructor(ia) {
            this._ia = ia;
            this._backStack = new MS.Entertainment.Navigation.BackStack
        }, {
            _ia: null, _backStack: null, _clearBackStackOnNextNavigate: false, _domUpdatesEnabled: true, canNavigateBack: MS.Entertainment.UI.Framework.observableProperty("canNavigateBack", false), overrideHideBackButton: MS.Entertainment.UI.Framework.observableProperty("overrideHideBackButton", false), navigationDirection: MS.Entertainment.UI.Framework.observableProperty("navigationDirection", MS.Entertainment.Navigation.NavigationDirection.forward), hasBackStack: MS.Entertainment.UI.Framework.observableProperty("hasBackStack", false), currentPage: MS.Entertainment.UI.Framework.observableProperty("currentPage", null, true), currentHub: MS.Entertainment.UI.Framework.observableProperty("currentHub", null), currentPanel: MS.Entertainment.UI.Framework.observableProperty("currentPanel", null), lastNavigationWasPage: MS.Entertainment.UI.Framework.observableProperty("lastNavigationWasPage", false), skipEnterAnimationOnNextNavigation: false, _callOnNavigateAway: function _callOnNavigateAway(previous, next) {
                    if (previous && previous.onNavigateAway)
                        return previous.onNavigateAway(next)
                }, _callOnNavigatingTo: function _callOnNavigatingTo(previous, next) {
                    if (next && next.onNavigatingTo)
                        return next.onNavigatingTo(previous)
                }, _callOnNavigateTo: function _callOnNavigateTo(previous, next) {
                    if (next && next.onNavigateTo)
                        next.onNavigateTo(previous)
                }, _findViewModelSet: function _findViewModelSet(pageNode, hubNode, panelNode, forcePageChange) {
                    var pageViewModel = this._findPageViewModel(pageNode, forcePageChange);
                    var hubViewModel = this._findHubViewModel(pageNode, pageViewModel, hubNode, panelNode);
                    var panelViewModel = this._findPanelViewModel(pageNode, hubNode, hubViewModel, panelNode);
                    return {
                            page: pageViewModel, hub: hubViewModel, panel: panelViewModel
                        }
                }, _findPageViewModel: function _findPageViewModel(pageNode, forcePageChange) {
                    var pageViewModel = null;
                    if (pageNode && (pageNode.alwaysPutOnBackStack || forcePageChange || !this.currentPage || pageNode !== WinJS.Binding.unwrap(this.currentPage).iaNode))
                        pageViewModel = this._ia.getViewFromNode(pageNode);
                    else
                        pageViewModel = WinJS.Binding.unwrap(this.currentPage);
                    MS.Entertainment.Navigation.assert(pageViewModel, "No page was found for the view model set.");
                    return pageViewModel
                }, _findHubViewModel: function _findHubViewModel(pageNode, pageViewModel, hubNode, panelNode) {
                    var hubViewModel = null;
                    if (pageViewModel.hubs && pageViewModel.hubs.length) {
                        if (hubNode) {
                            hubViewModel = MS.Entertainment.Utilities.searchArray(pageViewModel.hubs, function hubMonikerMatch(candidateHub) {
                                return candidateHub.iaNode.moniker === hubNode.moniker
                            });
                            MS.Entertainment.Navigation.assert(hubViewModel, "Mismatched page and hub; that page does not contain that hub.  Ignoring hub parameter…")
                        }
                        if (!hubViewModel)
                            if (pageNode) {
                                if (panelNode) {
                                    hubViewModel = MS.Entertainment.Utilities.searchArray(pageViewModel.hubs, function panelsContainPanel(candidateHub) {
                                        return !!MS.Entertainment.Utilities.searchArray(candidateHub.panels, function panelMonikerMatch(candidatePanel) {
                                                return candidatePanel.iaNode.moniker === panelNode.moniker
                                            })
                                    }.bind(this));
                                    MS.Entertainment.Navigation.assert(hubViewModel, "Mismatched page and panel; that page does not contain that panel.  Ignoring panel parameter…")
                                }
                                if (!hubViewModel && pageViewModel.iaNode.defaultChild)
                                    hubViewModel = MS.Entertainment.Utilities.searchArray(pageViewModel.hubs, function hubMonikerMatch(candidateHub) {
                                        return candidateHub.iaNode.moniker === pageViewModel.iaNode.defaultChild.moniker
                                    });
                                if (!hubViewModel)
                                    hubViewModel = pageViewModel.hubs[0]
                            }
                            else
                                hubViewModel = WinJS.Binding.unwrap(this.currentHub)
                    }
                    return hubViewModel
                }, _findPanelViewModel: function _findPanelViewModel(pageNode, hubNode, hubViewModel, panelNode) {
                    var panelViewModel = null;
                    if (hubViewModel && hubViewModel.panels && hubViewModel.panels.length) {
                        if (panelNode) {
                            panelViewModel = MS.Entertainment.Utilities.searchArray(hubViewModel.panels, function panelMonikerMatch(candidatePanel) {
                                return candidatePanel.iaNode.moniker === panelNode.moniker
                            });
                            MS.Entertainment.Navigation.assert(panelViewModel, "Mismatched hub and panel; that hub does not contain that panel.  Ignoring panel parameter…")
                        }
                        if (!panelViewModel)
                            if (pageNode || hubNode) {
                                if (hubViewModel.iaNode.defaultChild)
                                    panelViewModel = MS.Entertainment.Utilities.searchArray(hubViewModel.panels, function panelMonikerMatch(candidatePanel) {
                                        return candidatePanel.iaNode.moniker === hubViewModel.iaNode.defaultChild.moniker
                                    });
                                if (!panelViewModel)
                                    panelViewModel = hubViewModel.panels[0]
                            }
                            else
                                panelViewModel = WinJS.Binding.unwrap(this.currentPanel)
                    }
                    return panelViewModel
                }, _updateCurrentLocation: function _updateCurrentLocation(cacheOperation, page, hub, panel, args) {
                    var eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell;
                    var oldPage = WinJS.Binding.unwrap(this.currentPage);
                    var pageIsChanging = (page !== oldPage);
                    var oldHub = WinJS.Binding.unwrap(this.currentHub);
                    var hubIsChanging = (hub !== oldHub);
                    var oldPanel = WinJS.Binding.unwrap(this.currentPanel);
                    var panelIsChanging = (panel !== oldPanel);
                    var pageMoniker = page && page.iaNode.moniker;
                    var hubMoniker = hub && hub.iaNode.moniker;
                    var panelMoniker = panel && panel.iaNode.moniker;
                    eventProvider.traceLocation_Changed(pageMoniker || "", hubMoniker || "", panelMoniker || "");
                    if (pageIsChanging && page)
                        eventProvider.traceNavigation_Started(page.iaNode.moniker);
                    this.lastNavigationWasPage = pageIsChanging;
                    if (pageIsChanging)
                        if (this._callOnNavigateAway(oldPage, page))
                            return MS.Entertainment.Navigation.Navigation.MoveResult.leavingBlocked;
                    if (hubIsChanging)
                        if (this._callOnNavigateAway(oldHub, hub))
                            return MS.Entertainment.Navigation.Navigation.MoveResult.leavingBlocked;
                    if (panelIsChanging)
                        if (this._callOnNavigateAway(oldPanel, panel))
                            return MS.Entertainment.Navigation.Navigation.MoveResult.leavingBlocked;
                    if (pageIsChanging) {
                        if (this._callOnNavigatingTo(oldPage, page))
                            return MS.Entertainment.Navigation.Navigation.MoveResult.enteringBlocked;
                        {}
                    }
                    if (hubIsChanging) {
                        if (this._callOnNavigatingTo(oldHub, hub))
                            return MS.Entertainment.Navigation.Navigation.MoveResult.enteringBlocked;
                        {}
                    }
                    if (panelIsChanging) {
                        if (this._callOnNavigatingTo(oldPanel, panel))
                            return MS.Entertainment.Navigation.Navigation.MoveResult.enteringBlocked;
                        {}
                    }
                    if (pageIsChanging)
                        this.currentPage = page;
                    if (hubIsChanging)
                        this.currentHub = hub;
                    if (panelIsChanging)
                        this.currentPanel = panel;
                    if (args)
                        this.currentPage.options = args;
                    if (pageIsChanging || hubIsChanging || panelIsChanging)
                        this._updateDOM(pageIsChanging, cacheOperation, oldPage, page, hub, panel);
                    if (pageIsChanging)
                        this._callOnNavigateTo(oldPage, page);
                    if (hubIsChanging)
                        this._callOnNavigateTo(oldHub, hub);
                    if (panelIsChanging)
                        this._callOnNavigateTo(oldPanel, panel);
                    var PlatLog = Microsoft.Entertainment.Platform.Logging;
                    var dataPoint = new PlatLog.DataPoint(PlatLog.LoggingLevel.telemetry);
                    dataPoint.appendEventName("X8NewPage");
                    dataPoint.appendParameter("PageName", this.getUserLocation());
                    dataPoint.write();
                    return MS.Entertainment.Navigation.Navigation.MoveResult.completed
                }, _updateDOM: (function() {
                    var pageDOMNodeMap = [];
                    var cacheSizeLimit = 5;
                    var currentPageAutomationId = "currentPage";
                    function findCachedPageInformation(page) {
                        var cachedPageInformation;
                        for (var i = 0; i < pageDOMNodeMap.length; i++) {
                            cachedPageInformation = pageDOMNodeMap[i];
                            if (cachedPageInformation.page === page)
                                break;
                            else
                                cachedPageInformation = null
                        }
                        return cachedPageInformation
                    }
                    function insertPageToCache(pageToAdd, currentPage, rootNode, element) {
                        var indexOfPageToRemove;
                        var removedPage;
                        if (pageDOMNodeMap.length >= cacheSizeLimit) {
                            for (var i = 0; i < pageDOMNodeMap.length; i++)
                                if ((pageDOMNodeMap[i].page.iaNode !== rootNode) && (pageDOMNodeMap[i].page !== currentPage)) {
                                    indexOfPageToRemove = i;
                                    break
                                }
                            removedPage = pageDOMNodeMap.splice(indexOfPageToRemove, 1);
                            MS.Entertainment.Navigation.assert(removedPage.length === 1, "While cleaning up the cached navigation state, incorrect items were removed: " + removedPage.length);
                            removedPage[0].element.parentElement.removeChild(removedPage[0].element)
                        }
                        pageDOMNodeMap.push({
                            page: pageToAdd, element: element
                        })
                    }
                    function removePageFromCache(pageToRemove) {
                        MS.Entertainment.Navigation.assert(pageToRemove, "No page was supplied");
                        var indexToRemove = pageDOMNodeMap.indexOf(pageToRemove);
                        MS.Entertainment.Navigation.assert(indexToRemove > -1, "Page wasn't found in DOM cache");
                        pageDOMNodeMap.splice(indexToRemove, 1)
                    }
                    function hideOldPage(oldPageInformation, removeFromCache) {
                        return MS.Entertainment.Utilities.freezeControlsInSubtree(oldPageInformation.element).then(function() {
                                var returnPromise = null;
                                if (removeFromCache)
                                    returnPromise = MS.Entertainment.Utilities.removeChild(oldPageInformation.element.parentElement, oldPageInformation.element, true).then(function afterRemove() {
                                        removePageFromCache(oldPageInformation)
                                    });
                                else {
                                    if (oldPageInformation.page && oldPageInformation.page.specialFocusedElement) {
                                        oldPageInformation.focusedElement = WinJS.Binding.unwrap(oldPageInformation.page).specialFocusedElement;
                                        WinJS.Binding.unwrap(oldPageInformation.page).specialFocusedElement = null
                                    }
                                    else
                                        oldPageInformation.focusedElement = document.activeElement;
                                    if (MS.Entertainment.Utilities.isApp2)
                                        oldPageInformation.blockingInput = MS.Entertainment.UI.Framework.addEventHandlers(oldPageInformation.element, {
                                            keydown: dropInput, keyup: dropInput, keypress: dropInput
                                        }, true);
                                    returnPromise = MS.Entertainment.Utilities.exitElement(oldPageInformation.element)
                                }
                                returnPromise.done(function cleanUpPage() {
                                    oldPageInformation.element.removeAttribute("data-win-automationid");
                                    WinJS.Utilities.removeClass(oldPageInformation.element, currentPageAutomationId)
                                });
                                return returnPromise
                            })
                    }
                    function hideOldPages(cacheOperation, oldPage, newPage) {
                        var completed = WinJS.Promise.as();
                        if (cacheOperation === MS.Entertainment.Navigation.Navigation.DOMCacheOperation.removeAllPages) {
                            var removedPages = [];
                            for (var i = pageDOMNodeMap.length - 1; i >= 0; i--) {
                                var pageInformation = pageDOMNodeMap[i];
                                if (WinJS.Binding.unwrap(pageInformation.page) !== WinJS.Binding.unwrap(newPage))
                                    removedPages.push(hideOldPage(pageInformation, true))
                            }
                            completed = WinJS.Promise.join(removedPages)
                        }
                        else {
                            var oldPageInformation = findCachedPageInformation(oldPage);
                            if (oldPageInformation) {
                                var removeFromCache = (cacheOperation === MS.Entertainment.Navigation.Navigation.DOMCacheOperation.removePage);
                                completed = hideOldPage(oldPageInformation, removeFromCache)
                            }
                        }
                        return completed
                    }
                    function updateClassesOnUnsnapped(oldPage, newPage) {
                        if (!newPage || !oldPage || newPage.iaNode.moniker !== oldPage.iaNode.moniker) {
                            var background = document.getElementById("htmlUnsnapped");
                            if (newPage)
                                WinJS.Utilities.addClass(background, newPage.iaNode.moniker);
                            if (oldPage)
                                WinJS.Utilities.removeClass(background, oldPage.iaNode.moniker)
                        }
                    }
                    function dropInput(e) {
                        switch (e.keyCode) {
                            case WinJS.Utilities.Key.invokeGlobalCommand:
                            case WinJS.Utilities.Key.searchButton:
                            case WinJS.Utilities.Key.dismissButton:
                                return
                        }
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation()
                    }
                    return function _updateDOM(pageIsChanging, cacheOperation, oldPage, newPage, newHub, newPanel) {
                            var hubStrip;
                            var target;
                            var newPageInformation;
                            var oldPageInformation;
                            var oldPageElement;
                            if (this._domUpdatesEnabled)
                                if (pageIsChanging) {
                                    if (WinJS.UI.AutomaticFocus)
                                        WinJS.UI.AutomaticFocus.focusRoot = null;
                                    newPageInformation = findCachedPageInformation(newPage);
                                    if ((cacheOperation === MS.Entertainment.Navigation.Navigation.DOMCacheOperation.removeAllPages) && !newPage) {
                                        hideOldPages(cacheOperation, null, null);
                                        updateClassesOnUnsnapped(oldPage)
                                    }
                                    else if (!newPageInformation) {
                                        target = document.createElement("div");
                                        target.setAttribute("data-win-automationid", currentPageAutomationId);
                                        WinJS.Utilities.addClass(target, "pageContainer currentPage");
                                        document.getElementById("pageContainer").appendChild(target);
                                        MS.Entertainment.Utilities.hideElement(target);
                                        insertPageToCache(newPage, oldPage, this._ia.rootNode, target);
                                        updateClassesOnUnsnapped(oldPage, newPage);
                                        hideOldPages(cacheOperation, oldPage, newPage);
                                        var fragmentUrl = newPage.overrideFragmentUrl || "Components/Shell/GalleryHubStrip.html";
                                        var fragmentCompleted = MS.Entertainment.Utilities.loadHtmlPage(fragmentUrl, target).then(function navigationFragmentLoaded() {
                                                this._updateDOM(false, cacheOperation, oldPage, newPage, newHub, newPanel);
                                                MS.Entertainment.UI.Framework.currentContentContainer = target;
                                                if (this.skipEnterAnimationOnNextNavigation) {
                                                    this.skipEnterAnimationOnNextNavigation = false;
                                                    return
                                                }
                                                return MS.Entertainment.Utilities.enterElement(target).then(function navigationPageEntered() {
                                                        if (!MS.Entertainment.UI.Framework.canMoveFocus(target))
                                                            return;
                                                        MS.Entertainment.UI.Framework.setFocusRoot(target);
                                                        MS.Entertainment.UI.Framework.tryAndFocusElementInSubTreeWithTimer(target, 5000)
                                                    })
                                            }.bind(this))
                                    }
                                    else {
                                        hideOldPages(cacheOperation, oldPage, newPage);
                                        WinJS.Promise.timeout().done(function showNewPage() {
                                            updateClassesOnUnsnapped(oldPage, newPage);
                                            newPageInformation.element.setAttribute("data-win-automationid", currentPageAutomationId);
                                            WinJS.Utilities.addClass(newPageInformation.element, "currentPage");
                                            var screenInteracted = false;
                                            var touchHandler = function touchHandler() {
                                                    screenInteracted = true
                                                };
                                            document.addEventListener("MSManipulationStateChanged", touchHandler, true);
                                            if (newPageInformation.blockingInput) {
                                                newPageInformation.blockingInput.cancel();
                                                newPageInformation.blockingInput = null
                                            }
                                            MS.Entertainment.Utilities.enterElement(newPageInformation.element).done(function afterEnter() {
                                                document.removeEventListener("MSManipulationStateChanged", touchHandler, true);
                                                var focusTarget = newPageInformation.focusedElement;
                                                newPageInformation.focusedElement = null;
                                                MS.Entertainment.UI.Framework.currentContentContainer = newPageInformation.element;
                                                if (!MS.Entertainment.UI.Framework.canMoveFocus(newPageInformation.element))
                                                    return;
                                                MS.Entertainment.UI.Framework.setFocusRoot(newPageInformation.element);
                                                if (focusTarget && !MS.Entertainment.UI.Framework.focusedItemInContainer(newPageInformation.element))
                                                    if (!screenInteracted)
                                                        if (focusTarget.item && focusTarget.listView) {
                                                            if (MS.Entertainment.Framework.KeyboardInteractionListener.showKeyboardFocus)
                                                                focusTarget.item.showFocus = true;
                                                            focusTarget.listView.currentItem = focusTarget.item
                                                        }
                                                        else
                                                            MS.Entertainment.UI.Framework.focusFirstFocusableAncestor(focusTarget)
                                            });
                                            MS.Entertainment.Utilities.thawControlsInSubtree(newPageInformation.element)
                                        }.bind(this))
                                    }
                                }
                                else {
                                    newPageInformation = findCachedPageInformation(newPage);
                                    MS.Entertainment.Navigation.assert(newPageInformation, "No page DOM cache information found");
                                    var hubStripElement = newPageInformation.element.querySelector(".navigationHost");
                                    if (hubStripElement) {
                                        hubStrip = hubStripElement.winControl;
                                        hubStrip.onNavigateTo(newPage, newHub, newPanel)
                                    }
                                }
                        }
                })(), navigateTo: function navigateTo(page, hub, panel, navigationArguments, forcePageChange) {
                    this.navigationDirection = MS.Entertainment.Navigation.NavigationDirection.forward;
                    var viewSet = null;
                    var didFindValidDestination;
                    if (typeof page === "string")
                        page = this._ia.getNode(page);
                    MS.Entertainment.Navigation.assert(!page || page instanceof MS.Entertainment.InformationArchitecture.Node, "The page argument to navigateTo() must be a string, an IA Node, or omitted.");
                    if (typeof hub === "string")
                        hub = this._ia.getNode(hub);
                    MS.Entertainment.Navigation.assert(!hub || hub instanceof MS.Entertainment.InformationArchitecture.Node, "The hub argument to navigateTo() must be a string, an IA Node, or omitted.");
                    if (typeof panel === "string")
                        panel = this._ia.getNode(panel);
                    MS.Entertainment.Navigation.assert(!panel || panel instanceof MS.Entertainment.InformationArchitecture.Node, "The panel argument to navigateTo() must be a string, an IA Node, or omitted.");
                    didFindValidDestination = !!(page || hub || panel);
                    MS.Entertainment.Navigation.assert(didFindValidDestination, "No valid destination found for navigation.");
                    if (!didFindValidDestination)
                        return didFindValidDestination;
                    viewSet = this._findViewModelSet(page, hub, panel, forcePageChange);
                    MS.Entertainment.Navigation.assert(viewSet && viewSet.hasOwnProperty("page") && viewSet.hasOwnProperty("hub") && viewSet.hasOwnProperty("panel"), "Navigation.navigateTo() was unable to find a view model set for the passed-in page, hub, and panel.");
                    if (this.currentPage && viewSet.page !== WinJS.Binding.unwrap(this.currentPage)) {
                        if (viewSet.page.perfTrackStartPoint)
                            MS.Entertainment.Instrumentation.PerfTrack.setStartTime(viewSet.page.perfTrackStartPoint);
                        this._backStack.navigateTo(WinJS.Binding.unwrap(this.currentPage), WinJS.Binding.unwrap(this.currentHub), WinJS.Binding.unwrap(this.currentPanel));
                        this.overrideHideBackButton = ((navigationArguments && navigationArguments.hideBackButtonOnNavigate !== undefined && navigationArguments.hideBackButtonOnNavigate !== null) ? navigationArguments.hideBackButtonOnNavigate : false);
                        this.canNavigateBack = (viewSet.page.iaNode !== WinJS.Binding.unwrap(this._ia).rootNode);
                        if (navigationArguments && navigationArguments.showNotifications !== undefined && navigationArguments.showNotifications !== null)
                            viewSet.page.showNotifications = navigationArguments.showNotifications
                    }
                    else if (!this.currentPage && (viewSet.page.iaNode !== WinJS.Binding.unwrap(this._ia).rootNode))
                        this.canNavigateBack = true;
                    var cacheOperation = MS.Entertainment.Navigation.Navigation.DOMCacheOperation.cachePage;
                    if (this._clearBackStackOnNextNavigate) {
                        this._clearBackStackOnNextNavigate = false;
                        this._backStack.clear();
                        cacheOperation = MS.Entertainment.Navigation.Navigation.DOMCacheOperation.removeAllPages
                    }
                    if (this._updateCurrentLocation(cacheOperation, viewSet.page, viewSet.hub, viewSet.panel, navigationArguments) !== MS.Entertainment.Navigation.Navigation.MoveResult.completed)
                        this._backStack.navigateBack();
                    this.hasBackStack = this._backStack.canNavigateBack;
                    return didFindValidDestination
                }, navigateBack: function navigateBack() {
                    this.navigationDirection = MS.Entertainment.Navigation.NavigationDirection.backward;
                    var stackEntry = null;
                    var result = MS.Entertainment.Navigation.Navigation.MoveResult.enteringBlocked;
                    if (this._backStack.canNavigateBack) {
                        stackEntry = this._backStack.peekNavigateBack();
                        if (WinJS.Binding.unwrap(stackEntry.page).iaNode === this._ia.rootNode)
                            this.canNavigateBack = false;
                        WinJS.Promise.timeout().done(function updateLocation() {
                            result = this._updateCurrentLocation(MS.Entertainment.Navigation.Navigation.DOMCacheOperation.removePage, stackEntry.page, stackEntry.hub, stackEntry.panel);
                            if (result !== MS.Entertainment.Navigation.Navigation.MoveResult.leavingBlocked)
                                this._backStack.navigateBack()
                        }.bind(this))
                    }
                    else if (this.canNavigateBack)
                        this.navigateToDefaultPage();
                    else {
                        var oldPage = WinJS.Binding.unwrap(this.currentPage);
                        this._callOnNavigateAway(oldPage)
                    }
                    this.hasBackStack = this._backStack.canNavigateBack;
                    this._clearBackStackOnNextNavigate = false
                }, clearAllNavigationState: function clearAllNavigationState() {
                    this._updateCurrentLocation(MS.Entertainment.Navigation.Navigation.DOMCacheOperation.removeAllPages);
                    this._backStack.clear();
                    this.hasBackStack = false;
                    this.canNavigateBack = false
                }, navigateToDefaultPage: function navigateToDefaultPage() {
                    var viewSet = this._findViewModelSet(this._ia.rootNode);
                    var result = this._updateCurrentLocation(MS.Entertainment.Navigation.Navigation.DOMCacheOperation.removeAllPages, viewSet.page, viewSet.hub, viewSet.panel);
                    if (result === MS.Entertainment.Navigation.Navigation.MoveResult.completed) {
                        this._backStack.clear();
                        this.hasBackStack = false;
                        this.canNavigateBack = false;
                        this._clearBackStackOnNextNavigate = false
                    }
                }, clearBackStackOnNextNavigate: function clearBackStackOnNextNavigate(clear) {
                    this._clearBackStackOnNextNavigate = clear
                }, init: function init(defaultMoniker) {
                    if (defaultMoniker)
                        this._ia.rootNode = this._ia.getNode(defaultMoniker);
                    if (MS.Entertainment.Utilities.isApp2) {
                        this.navigateToDefaultPage();
                        return
                    }
                    try {
                        var defaultLaunchSetting = Windows.Storage.ApplicationData.current.roamingSettings.values["launchLocation"];
                        var moniker = MS.Entertainment.UI.Monikers[defaultLaunchSetting];
                        MS.Entertainment.Navigation.assert(!defaultLaunchSetting || moniker, "Moniker specified in launch setting does not exist: " + defaultLaunchSetting)
                    }
                    catch(e) {
                        MS.Entertainment.Navigation.fail(e.toString());
                        MS.Entertainment.Utilities.wasNavigatedToDashboard = true;
                        this.navigateToDefaultPage();
                        return
                    }
                    if (defaultLaunchSetting && moniker)
                        this.navigateTo(moniker);
                    else {
                        if ((this._ia.rootNode.moniker !== "videoCollection") && (this._ia.rootNode.moniker !== "musicCollection"))
                            MS.Entertainment.Utilities.wasNavigatedToDashboard = true;
                        this.navigateToDefaultPage()
                    }
                }, checkUserLocation: function checkUserLocation(moniker) {
                    return this.currentPage && this.currentPage.iaNode && this.currentPage.iaNode.moniker === moniker
                }, getUserLocation: function getUserLocation() {
                    var userLocation = null;
                    if (this.currentPage) {
                        userLocation = WinJS.Binding.unwrap(this.currentPage).iaNode.moniker;
                        if (this.currentHub) {
                            userLocation = userLocation.concat("/", WinJS.Binding.unwrap(this.currentHub).iaNode.moniker);
                            if (this.currentPanel)
                                userLocation = userLocation.concat("/", WinJS.Binding.unwrap(this.currentPanel).iaNode.moniker)
                        }
                    }
                    else
                        userLocation = "Unknown";
                    return userLocation
                }, getPreviousLocation: function getPreviousLocation() {
                    var previousLocation;
                    if (this._backStack)
                        previousLocation = this._backStack.peekNavigateBack();
                    return previousLocation
                }, getTestHooks: function getTestHooks() {
                    var hooks = this._backStack.getTestHooks();
                    hooks.setDOMUpdatesEnabled = function setDOMUpdatesEnabled(enabled) {
                        this._domUpdatesEnabled = enabled
                    }.bind(this);
                    return hooks
                }
        }, {
            MoveResult: {
                completed: "completed", leavingBlocked: "leavingBlocked", enteringBlocked: "enteringBlocked"
            }, DOMCacheOperation: {
                    cachePage: "cachePage", removePage: "removePage", removeAllPages: "removeAllPages"
                }
        })
});
MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.navigation, function getNavigationService() {
    var iaService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.informationArchitecture);
    return new MS.Entertainment.Navigation.Navigation(iaService)
}, true)
