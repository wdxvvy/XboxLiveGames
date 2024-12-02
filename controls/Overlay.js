/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/debug.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {Overlay: MS.Entertainment.UI.Framework.defineUserControl("Controls/Overlay.html#overlayTemplate", function overlayConstructor(element, options) {
        this._handleLightDismissChanged = this._handleLightDismissChanged.bind(this);
        WinJS.Utilities.addClass(this.domElement, "removeFromDisplay");
        this.domElement.addEventListener("keydown", this.keyDown.bind(this));
        WinJS.Utilities.addClass(this.domElement, "overlayAnchor");
        document.body.appendChild(this.domElement);
        this.bind("customStyle", function applyCustomStyle(newValue, oldValue) {
            if (oldValue)
                WinJS.Utilities.removeClass(this.domElement, oldValue);
            if (newValue)
                WinJS.Utilities.addClass(this.domElement, newValue)
        }.bind(this));
        if (!this.persistOnNavigate) {
            var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
            this._eventHandlers = MS.Entertainment.Utilities.addEvents(navigationService, {currentPageChanged: this._dismissOnNavigate.bind(this)});
            this._bindings = WinJS.Binding.bind(navigationService, {currentPage: {options: this._dismissOnNavigate.bind(this)}});
            this._firstBindOnDismiss = false
        }
        if (this.dontWaitForContent)
            this._contentInitialized = true
    }, {
        criticalTemplate: true, _eventHandlers: null, _bindings: null, _skipDefer: true, _presentedToUser: false, _focusSuppressedElements: null, _navigating: false, _contentDismiss: false, _currentPage: null, _presetPreOverlayFocus: null, setFocusToNavigationService: false, _oldFocusRoot: null, result: null, visible: false, userControlInstance: null, resolvedUserControlConstructor: null, ignoreChildrenInitialization: true, autoSetFocus: true, excludeEndpointElements: true, focusPreviouslyFocusedElement: true, userControlOptions: undefined, dontWaitForContent: false, enableKeyboardLightDismiss: false, listViewItemToFocusOnClose: null, initialize: function initialize() {
                this._tabConstrainerHelper = new MS.Entertainment.UI.Framework.TabConstrainer(this.domElement);
                MS.Entertainment.UI.Controls.assert(this.overlayBackground, "Overlay: Element with data-ent-member='overlayBackground' not found");
                MS.Entertainment.UI.Controls.assert(this.overlayContainer, "Overlay: Element with data-ent-member='overlayContainer' not found");
                MS.Entertainment.UI.Controls.assert(this.overlayContent, "Overlay: Element with data-ent-member='overlayContent' not found");
                if (this.setFocusToNavigationService)
                    this._currentPage = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).currentPage;
                this.bind("lightDismissEnabled", this._handleLightDismissChanged);
                var that = this;
                this.overlayContent.addEventListener("UserControlInitialized", function userControlInitialized(event) {
                    if (event.userControl instanceof that.resolvedUserControlConstructor) {
                        if (event.userControl && event.userControl.setOverlay)
                            event.userControl.setOverlay(that);
                        that._contentInitialized = true;
                        if (that.visible)
                            that._show()
                    }
                });
                var UserControlConstructor = this.userControl;
                var controlAttribute;
                if (typeof UserControlConstructor === "string") {
                    UserControlConstructor = WinJS.Utilities.getMember(this.userControl);
                    controlAttribute = this.userControl
                }
                else
                    controlAttribute = "MS.Entertainment.UI.Framework.UserControl";
                this.resolvedUserControlConstructor = UserControlConstructor;
                if (this.userControlOptions)
                    this.userControlOptions._skipDefer = true;
                MS.Entertainment.UI.Controls.assert(typeof UserControlConstructor === "function", "Overlay: " + this.userControl + " is not a function");
                this.userControlInstance = new UserControlConstructor(this.overlayContent, this.userControlOptions);
                this.overlayContent.setAttribute("data-win-control", controlAttribute);
                this.overlayBackground.addEventListener("click", this.lightDismiss.bind(this))
            }, unload: function unload() {
                if (this._eventHandlers) {
                    this._eventHandlers.cancel();
                    this._eventHandlers = null
                }
                if (this._bindings) {
                    this._bindings.cancel();
                    this._bindings = null
                }
                if (this._focusSuppressedElements) {
                    MS.Entertainment.Utilities.restoreSubtreeKeyboardFocus(this._focusSuppressedElements);
                    this._focusSuppressedElements = null
                }
                MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
            }, lightDismiss: function lightDismiss() {
                if (this.lightDismissEnabled && this.visible) {
                    this.hide();
                    return true
                }
                return false
            }, keyDown: function(e) {
                if (!this.enableKeyboardLightDismiss)
                    return;
                if (e.keyCode !== WinJS.Utilities.Key.escape && e.keyCode !== WinJS.Utilities.Key.dismissButton)
                    return;
                if (this.lightDismiss()) {
                    e.stopPropagation();
                    e.preventDefault()
                }
            }, _handleLightDismissChanged: function _handleLightDismissChanged(newValue, oldValue) {
                if (oldValue && !newValue) {
                    MS.Entertainment.Utilities.setAccessibilityText(this.overlayBackground, null);
                    this.overlayBackground.removeAttribute("tabindex");
                    MS.Entertainment.Framework.AccUtils.checkAndSetAriaAttribute(null, this.overlayBackground, "role")
                }
                else if (!oldValue && newValue) {
                    MS.Entertainment.Utilities.setAccessibilityTextFromStringId(this.overlayBackground, String.id.IDS_CLOSE_BUTTON);
                    this.overlayBackground.setAttribute("tabindex", -1);
                    MS.Entertainment.Framework.AccUtils.checkAndSetAriaAttribute("button", this.overlayBackground, "role")
                }
            }, show: function show() {
                if (this.visible)
                    throw"Dialog.show error - dialog is already visible!";
                if (this._showCancelled)
                    return WinJS.Promise.wrap();
                this.visible = true;
                this._navigating = false;
                var eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell;
                eventProvider.traceOverlay_Shown("Title: [" + this.title + "], UserControl: [" + this.userControl + "]");
                var pageContainer = document.getElementById("pageContainer");
                pageContainer.setAttribute("aria-hidden", "true");
                if (this._contentInitialized)
                    this._show();
                this._hideCompletePromise = new WinJS.Promise(function(c, e, p) {
                    this._hideComplete = c
                }.bind(this));
                return this._hideCompletePromise
            }, hide: function hide() {
                var completePromise = WinJS.Promise.wrap();
                if (!this._contentInitialized && !this.visible) {
                    this._showCancelled = true;
                    return completePromise
                }
                if (!this._navigating && !this._contentDismiss && this._currentPage)
                    WinJS.Binding.unwrap(this._currentPage).specialFocusedElement = null;
                if (this.visible) {
                    var eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell;
                    eventProvider.traceOverlay_Dismissed("Title: [" + this.title + "], UserControl: [" + this.userControl + "]");
                    MS.Entertainment.UI.Framework.removeOverlayContainer(this.domElement);
                    this.hideAnimation(this.overlayContainer, null).done(function() {
                        var focusInOverlay = MS.Entertainment.UI.Framework.focusedItemInContainer(this.domElement);
                        document.body.removeChild(this.domElement);
                        MS.Entertainment.UI.Framework.setFocusRoot(this._oldFocusRoot);
                        this._restorePreviouslyFocusedItem(focusInOverlay);
                        var pageContainer = document.getElementById("pageContainer");
                        pageContainer.removeAttribute("aria-hidden");
                        if (this._hideComplete)
                            this._hideComplete(this)
                    }.bind(this));
                    this.dispatchEvent("close", {sender: this});
                    completePromise = this._hideCompletePromise;
                    MS.Entertainment.UI.Controls.Overlay._visibleCount--;
                    if (MS.Entertainment.UI.Controls.Overlay._visibleCount === 0)
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).overlayVisible = false
                }
                else
                    this._showCancelled = true;
                this.visible = false;
                return completePromise
            }, _dismissOnNavigate: function _dismissOnNavigate(newVal, oldVal) {
                if (!this._firstBindOnDismiss && !this._navigating) {
                    if (MS.Entertainment.Utilities.isGamesApp && newVal.mediaItem && oldVal.mediaItem && newVal.mediaItem.isEqual(oldVal.mediaItem))
                        return;
                    this._navigating = true;
                    if (this.dismissOnNavigateDelay)
                        WinJS.Promise.timeout(this.dismissOnNavigateDelay).done(this.hide.bind(this));
                    else
                        this.hide()
                }
            }, showAnimation: function showAnimation(element) {
                return WinJS.UI.Animation.showPopup(element)
            }, hideAnimation: function hideAnimation(element) {
                if (this.overlayContainer && this.overlayContainer.style)
                    this.overlayContainer.style.opacity = 0;
                if (this._navigating)
                    return WinJS.Promise.as();
                else
                    return WinJS.UI.Animation.hidePopup(element)
            }, setAccessibilityTitle: function setAccessibilityTitle(title) {
                MS.Entertainment.Utilities.setAccessibilityText(this.overlayContainer, title)
            }, _show: function _show() {
                if (this._presentedToUser)
                    return;
                this._presentedToUser = true;
                this._saveCurrentFocusedItem();
                MS.Entertainment.UI.Controls.Overlay._visibleCount++;
                if (MS.Entertainment.UI.Controls.Overlay._visibleCount > 0)
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).overlayVisible = true;
                WinJS.Utilities.removeClass(this.domElement, "removeFromDisplay");
                if (WinJS.UI.AutomaticFocus) {
                    this._oldFocusRoot = WinJS.UI.AutomaticFocus.focusRoot;
                    WinJS.UI.AutomaticFocus.focusRoot = null
                }
                MS.Entertainment.UI.Framework.addOverlayContainer(this.domElement);
                this.showAnimation(this.overlayContainer, null).then(function complete() {
                    MS.Entertainment.UI.Framework.setFocusRoot(this.domElement);
                    if (this.autoSetFocus)
                        MS.Entertainment.UI.Framework.focusFirstInSubTree(this.domElement, this.excludeEndpointElements);
                    if (MS.Entertainment.Utilities.isGamesApp)
                        this._focusSuppressedElements = MS.Entertainment.Utilities.suppressSubtreeKeyboardFocus(document.getElementsByClassName("root")[0]);
                    this.dispatchEvent(this.events.overlayVisible, {sender: this})
                }.bind(this));
                this.domElement.addEventListener("dismissoverlay", function() {
                    this._contentDismiss = true;
                    this.hide()
                }.bind(this))
            }, _saveCurrentFocusedItem: function _saveCurrentFocusedItem() {
                if (this._presetPreOverlayFocus)
                    this._itemWithFocusBeforeOverlayShown = this._presetPreOverlayFocus;
                else {
                    this._itemWithFocusBeforeOverlayShown = document.activeElement;
                    var containingListView;
                    var listViews = document.querySelectorAll(".win-listview");
                    for (var i = 0; i < listViews.length; i++)
                        if (listViews[i].contains(this._itemWithFocusBeforeOverlayShown))
                            containingListView = listViews[i].winControl;
                    if (containingListView)
                        this._itemWithFocusBeforeOverlayShown = {
                            listView: containingListView, item: containingListView.currentItem
                        }
                }
                if (this._currentPage)
                    WinJS.Binding.unwrap(this._currentPage).specialFocusedElement = this._itemWithFocusBeforeOverlayShown;
                if (!containingListView && this.autoSetFocus && this._itemWithFocusBeforeOverlayShown && this.focusPreviouslyFocusedElement)
                    MS.Entertainment.UI.Framework.focusFirstFocusableAncestor(this._itemWithFocusBeforeOverlayShown)
            }, _restorePreviouslyFocusedItem: function _restorePreviouslyFocusedItem(focusInOverlay) {
                var focusFirstInSubTree = false;
                var previousItem = this._itemWithFocusBeforeOverlayShown;
                if ((!previousItem || !focusInOverlay) && MS.Entertainment.Utilities.isApp1)
                    return;
                var target = previousItem;
                if (target && target.listView)
                    target = target.listView._element;
                if (!MS.Entertainment.UI.Framework.canMoveFocus(target)) {
                    if (MS.Entertainment.UI.Framework.currentFocusContainer !== MS.Entertainment.UI.Framework.currentContentContainer)
                        return;
                    target = null
                }
                if (!target) {
                    previousItem = target = MS.Entertainment.UI.Framework.currentFocusContainer;
                    focusFirstInSubTree = true
                }
                var listViewItem = this.listViewItemToFocusOnClose || previousItem.item;
                if (previousItem.listView && listViewItem) {
                    if (!this._navigating)
                        WinJS.Promise.timeout(100).then(function() {
                            if (MS.Entertainment.Framework.KeyboardInteractionListener.showKeyboardFocus)
                                listViewItem.showFocus = true;
                            previousItem.listView.currentItem = listViewItem
                        })
                }
                else if (!focusFirstInSubTree)
                    MS.Entertainment.UI.Framework.focusFirstFocusableAncestor(previousItem);
                else
                    MS.Entertainment.UI.Framework.tryAndFocusElementInSubTreeWithTimer(previousItem, 0)
            }, _tabConstrainerHelper: null, _itemWithFocusBeforeOverlayShown: null, _fadedElements: null, _hideComplete: null, _hideCompletePromise: null, _contentInitialized: false, _showCancelled: false, _firstBindOnDismiss: true
    }, {
        top: "20%", left: "20%", bottom: "20%", right: "20%", userControl: null, lightDismissEnabled: true, customStyle: null, showContainerAnimationClass: "animShowOverlayContainer", hideContainerAnimationClass: "animHideOverlayContainer", showBackgroundAnimationClass: "animShowOverlayBackground", hideBackgroundAnimationClass: "animHideOverlayBackground", events: {overlayVisible: "overlayVisible"}
    }, {
        anyVisible: function anyVisible() {
            return MS.Entertainment.UI.Controls.Overlay._visibleCount > 0
        }, _visibleCount: 0
    })})
