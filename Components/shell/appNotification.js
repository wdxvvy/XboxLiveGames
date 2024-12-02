/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/debug.js", "/Framework/utilities.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI");
WinJS.Namespace.define("MS.Entertainment.UI", {
    Notification: WinJS.Class.define(function notificationConstructor(options) {
        var property;
        for (property in options)
            this[property] = options[property]
    }, {
        notificationType: null, title: "", subTitle: "", subTitleCaret: false, moreDetails: "", icon: null, action: null, actionParams: null, dismissAction: null, secondaryActions: null, category: null, isPersistent: false, iconClassName: "", acknowledged: false, visible: true, tag: null
    }, {Type: {
            Informational: "Informational", Critical: "Critical"
        }}), AppNotificationService: MS.Entertainment.defineObservable(function AppNotificationServiceConstructor() {
            MS.Entertainment.UI.AppNotificationService._instanceCount++;
            MS.Entertainment.Utilities.assert(MS.Entertainment.UI.AppNotificationService._instanceCount === 1, "Use MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appNotification)");
            this.infoNotifications = new WinJS.Binding.List;
            this.criticalNotifications = new WinJS.Binding.List
        }, {
            infoNotifications: null, _infoNotificationContainer: null, criticalNotifications: null, _criticalNotificationContainer: null, send: function send(notification) {
                    if (!notification)
                        return;
                    notification = WinJS.Binding.as(notification);
                    (new Microsoft.Entertainment.Instrumentation.Providers.Shell).traceNotification_NotificationArrived(notification.title);
                    switch (notification.notificationType) {
                        case MS.Entertainment.UI.Notification.Type.Informational:
                            var existingIndex = this._notificationExists(this.infoNotifications, notification);
                            this._beginNotificationEdit(notification.notificationType);
                            if (existingIndex >= 0)
                                if (!notification.isPersistent) {
                                    WinJS.Binding.unwrap(this.infoNotifications).splice(existingIndex, 1);
                                    WinJS.Binding.unwrap(this.infoNotifications).push(notification)
                                }
                                else {
                                    WinJS.Binding.unwrap(this.infoNotifications).getAt(existingIndex).title = notification.title;
                                    WinJS.Binding.unwrap(this.infoNotifications).getAt(existingIndex).subTitle = notification.subTitle
                                }
                            else
                                WinJS.Binding.unwrap(this.infoNotifications).push(notification);
                            this._endNotificationEdit(notification.notificationType);
                            break;
                        case MS.Entertainment.UI.Notification.Type.Critical:
                            var existingIndex = this._notificationExists(this.criticalNotifications, notification);
                            if (existingIndex === -1) {
                                this._beginNotificationEdit(notification.notificationType);
                                WinJS.Binding.unwrap(this.criticalNotifications).push(notification);
                                this._endNotificationEdit(notification.notificationType)
                            }
                            break
                    }
                }, _beginNotificationEdit: function _beginNotificationEdit(type) {
                    var flipView = (type === MS.Entertainment.UI.Notification.Type.Informational) ? this.infoNotificationContainer : this.criticalNotificationContainer;
                    var flipViewControl = flipView && flipView.winControl;
                    if (flipViewControl)
                        flipViewControl.itemDataSource.beginEdits()
                }, _endNotificationEdit: function _endNotificationEdit(type) {
                    var flipView = (type === MS.Entertainment.UI.Notification.Type.Informational) ? this.infoNotificationContainer : this.criticalNotificationContainer;
                    var flipViewControl = flipView && flipView.winControl;
                    if (flipViewControl)
                        flipViewControl.itemDataSource.endEdits()
                }, removeNotificationByCategory: function removeNotificationByCategory(category) {
                    var existingIndex = this._notificationExists(this.criticalNotifications, new MS.Entertainment.UI.Notification({category: category}));
                    if (existingIndex !== -1)
                        WinJS.Binding.unwrap(this.criticalNotifications).splice(existingIndex, 1);
                    existingIndex = this._notificationExists(this.infoNotifications, new MS.Entertainment.UI.Notification({category: category}));
                    if (existingIndex !== -1)
                        WinJS.Binding.unwrap(this.infoNotifications).splice(existingIndex, 1)
                }, _notificationExists: function _notificationExists(queue, notification) {
                    for (var index = 0; index < queue.length; index++) {
                        var currentNotification = WinJS.Binding.unwrap(queue).getItem(index).data;
                        if (notification.category && (currentNotification.category === notification.category))
                            return index
                    }
                    return -1
                }
        }, {
            factory: function factory() {
                var appNotificationService = new MS.Entertainment.UI.AppNotificationService;
                Object.defineProperty(appNotificationService, "infoNotificationContainer", {get: function() {
                        if (!this._infoNotificationContainer)
                            this._infoNotificationContainer = document.querySelector(".infoNotificationContainer");
                        return this._infoNotificationContainer
                    }});
                Object.defineProperty(appNotificationService, "criticalNotificationContainer", {get: function() {
                        if (!this._criticalNotificationContainer)
                            this._criticalNotificationContainer = document.querySelector(".criticalNotificationContainer");
                        return this._criticalNotificationContainer
                    }});
                return appNotificationService
            }, _instanceCount: 0
        })
});
MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.appNotification, MS.Entertainment.UI.AppNotificationService.factory);
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {InfoNotification: MS.Entertainment.UI.Framework.defineUserControl("Components/Shell/appNotification.html#infoNotificationTemplate", function infoNotification(element, options){}, {
        _appNotificationService: null, _navigation: null, _timer: null, _notificationItemTemplate: null, _uiSettings: new Windows.UI.ViewManagement.UISettings, _initialized: false, itemTemplate: "/Components/Shell/appNotification.html#infoNotificationItemTemplate", notificationDataSourcePropertyName: "infoNotifications", initialize: function initialize(){}, delayedInitialize: function delayedInitialize() {
                return MS.Entertainment.UI.Framework.loadTemplate(this.itemTemplate).then(function(templateProvider) {
                        this._notificationItemTemplate = templateProvider.element;
                        this._appNotificationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appNotification);
                        this._navigation = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                        this._onPropertyChange = this._onPropertyChange.bind(this);
                        this._onPageSelected = this._onPageSelected.bind(this);
                        this._onPageCompleted = this._onPageCompleted.bind(this);
                        this._onDataSourceChanged = this._onDataSourceChanged.bind(this);
                        this._onAppResume = this._onAppResume.bind(this);
                        this._navigation.bind("currentPage", this._onPropertyChange);
                        this.domElement.addEventListener("keydown", this.onKeyDown.bind(this));
                        Windows.UI.WebUI.WebUIApplication.addEventListener("resuming", this._onAppResume);
                        this.notificationContainer.itemTemplate = this._notificationItemTemplate;
                        this._appNotificationService[this.notificationDataSourcePropertyName].addEventListener("iteminserted", this._onPropertyChange, false);
                        this._appNotificationService[this.notificationDataSourcePropertyName].addEventListener("itemremoved", this._onPropertyChange, false);
                        this.notificationContainer.addEventListener("pageselected", this._onPageSelected, false);
                        this.notificationContainer.addEventListener("pagecompleted", this._onPageCompleted, false);
                        this.notificationContainer.addEventListener("datasourcecountchanged", this._onDataSourceChanged, false);
                        this._initialized = true;
                        this._onDataSourceChanged()
                    }.bind(this))
            }, onKeyDown: function onKeyDown(event) {
                if (event.keyCode === WinJS.Utilities.Key.enter || event.keyCode === WinJS.Utilities.Key.space)
                    this.onItemClick(event)
            }, _onTimerHandler: function _onTimerHandler() {
                if (this._appNotificationService[this.notificationDataSourcePropertyName].length === 1) {
                    var item = WinJS.Binding.unwrap(this._appNotificationService.infoNotifications).getAt(0);
                    if (item.isPersistent) {
                        this._resetTimer();
                        return
                    }
                }
                var item = WinJS.Binding.unwrap(this._appNotificationService.infoNotifications).shift();
                if (item) {
                    var isPersistent = item.isPersistent;
                    if (isPersistent)
                        this.pushNewItem(item)
                }
            }, _resetTimer: function _restartTimer() {
                window.clearTimeout(this._timer);
                var notificationTimeoutMs = this._uiSettings.messageDuration * 1000;
                this._timer = window.setTimeout(function() {
                    this._onTimerHandler()
                }.bind(this), notificationTimeoutMs)
            }, _onDataSourceChanged: function _onDataSourceChanged() {
                var notificationVisibility = (this._appNotificationService[this.notificationDataSourcePropertyName].length > 0) && this._initialized && this._navigation.currentPage && this._navigation.currentPage.showNotifications;
                this.hideNotifications = !notificationVisibility;
                if (!this.hideNotifications)
                    this.notificationContainer.forceLayout()
            }, unload: function unload() {
                if (this._appNotificationService) {
                    this._appNotificationService[this.notificationDataSourcePropertyName].removeEventListener("iteminserted", this._onPropertyChange, false);
                    this._appNotificationService[this.notificationDataSourcePropertyName].removeEventListener("itemremoved", this._onPropertyChange, false)
                }
                MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
            }, onItemClick: function onItemClick(event) {
                if (WinJS.Utilities.hasClass(event.srcElement, "win-navbutton"))
                    return;
                var currentItem = WinJS.Binding.unwrap(this._appNotificationService.infoNotifications).getItem(0);
                if (currentItem && currentItem.data && currentItem.data.action) {
                    if (currentItem.data.action.execute)
                        currentItem.data.action.execute();
                    else if (typeof currentItem.data.action === "function")
                        currentItem.data.action();
                    return
                }
                if (event.target && event.target.performClick)
                    if (event.target.performClick.execute)
                        event.target.performClick.execute();
                    else
                        event.target.performClick()
            }, _onPropertyChange: function _onPropertyChange() {
                if (this._appNotificationService[this.notificationDataSourcePropertyName]) {
                    var dataSource = WinJS.Binding.unwrap(this._appNotificationService[this.notificationDataSourcePropertyName]).dataSource;
                    if (dataSource !== this.notificationContainer.itemDataSource)
                        this.notificationContainer.itemDataSource = WinJS.Binding.unwrap(this._appNotificationService[this.notificationDataSourcePropertyName]).dataSource
                }
                var notificationVisibility = this._navigation.currentPage && this._navigation.currentPage.showNotifications;
                notificationVisibility = notificationVisibility && (this._appNotificationService[this.notificationDataSourcePropertyName].length > 0);
                this.hideNotifications = !notificationVisibility;
                if (!this.hideNotifications)
                    this.notificationContainer.forceLayout()
            }, _onAppResume: function _onAppResume() {
                if (!this.hideNotifications) {
                    var notification = (this.notificationDataSourcePropertyName === "infoNotifications") ? document.querySelector(".appInfoNotification") : document.querySelector(".appCriticalNotification");
                    if (notification) {
                        notification.style.display = "none";
                        WinJS.Promise.timeout(100).then(function _delay() {
                            notification.style.display = String.empty
                        }.bind(this))
                    }
                }
            }, _onPageSelected: function _onPageSelected() {
                var that = this;
                if (this.notificationContainer.currentPage !== 0) {
                    var item = WinJS.Binding.unwrap(this._appNotificationService.infoNotifications).shift();
                    var isPersistent = item.isPersistent;
                    if (isPersistent)
                        this.pushNewItem(item);
                    (new Microsoft.Entertainment.Instrumentation.Providers.Shell).traceNotification_PageSelected(item.title)
                }
                this._resetTimer()
            }, _onPageCompleted: function _onPageCompleted() {
                if (this._buttonContainer) {
                    var items = this._buttonContainer.querySelectorAll("[aria-selected]");
                    for (var i = 0; i < items.length; i++)
                        if (items[i].getAttribute("aria-selected", "true")) {
                            var item = items[i].querySelector("[aria-hidden]");
                            if (item) {
                                MS.Entertainment.Framework.AccUtils.createAndAddAriaLink(this._buttonContainer, item, "aria-labelledby");
                                if (this._liveRegionContainer && this._buttonContainer) {
                                    this._buttonContainer.removeChild(this._liveRegionContainer);
                                    this._liveRegionContainer = document.createElement("div");
                                    WinJS.Utilities.addClass(this._liveRegionContainer, "removeFromDisplay");
                                    this._liveRegionContainer.setAttribute("role", "tooltip");
                                    this._liveRegionContainer.setAttribute("aria-live", "polite");
                                    this._buttonContainer.appendChild(this._liveRegionContainer);
                                    this._liveRegionContainer.setAttribute("aria-label", item.textContent)
                                }
                            }
                            break
                        }
                }
            }, pushNewItem: function pushNewItem(item) {
                var property;
                var newItem = new MS.Entertainment.UI.Notification;
                for (property in newItem)
                    newItem[property] = item[property];
                newItem = WinJS.Binding.as(newItem);
                this.notificationContainer.itemDataSource.beginEdits();
                WinJS.Binding.unwrap(this._appNotificationService[this.notificationDataSourcePropertyName]).push(newItem);
                this.notificationContainer.itemDataSource.endEdits()
            }
    }, {hideNotifications: true})});
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {CriticalNotification: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.InfoNotification, "Components/Shell/appNotification.html#criticalNotificationTemplate", function criticalNotification(element, options){}, {
        itemTemplate: "/Components/Shell/appNotification.html#criticalNotificationItemTemplate", notificationDataSourcePropertyName: "criticalNotifications", initialize: function initialize() {
                MS.Entertainment.UI.Controls.InfoNotification.prototype.initialize.call(this);
                this.domElement.addEventListener("keypress", this.onKeyPress.bind(this));
                this.domElement.addEventListener("click", this.onItemClick.bind(this))
            }, unload: function unload() {
                MS.Entertainment.UI.Controls.InfoNotification.prototype.unload.call(this)
            }, onKeyPress: function onKeyPress(event) {
                if (event.keyCode === WinJS.Utilities.Key.enter || event.keyCode === WinJS.Utilities.Key.space)
                    this.onItemClick(event)
            }, onItemClick: function onItemClick(event) {
                if (WinJS.Utilities.hasClass(event.srcElement, "win-navbutton"))
                    return;
                var currentItem = WinJS.Binding.unwrap(this._appNotificationService.criticalNotifications).getItem(0);
                if (currentItem && currentItem.data.secondaryActions)
                    WinJS.Utilities.removeClass(this.domElement.querySelector(".criticalNotificationSecActions"), "removeFromDisplay");
                else {
                    var item = WinJS.Binding.unwrap(this._appNotificationService.criticalNotifications).shift();
                    if (item && item.action) {
                        item.action();
                        (new Microsoft.Entertainment.Instrumentation.Providers.Shell).traceNotification_NotificationClicked(item.title)
                    }
                }
                if (WinJS.Utilities.hasClass(event.srcElement, "criticalNotificationSecAction")) {
                    if (event.target && event.target.performClick)
                        event.target.performClick();
                    WinJS.Binding.unwrap(this._appNotificationService.criticalNotifications).shift()
                }
            }, _onPageSelected: function _onPageSelected() {
                if (this.notificationContainer.currentPage !== 0) {
                    var item = WinJS.Binding.unwrap(this._appNotificationService.criticalNotifications).shift();
                    this.pushNewItem(item);
                    (new Microsoft.Entertainment.Instrumentation.Providers.Shell).traceNotification_PageSelected(item.title)
                }
            }
    })})
