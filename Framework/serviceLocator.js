/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function() {
    var ServiceEntry = WinJS.Class.define(function(factory, isCritical) {
            this._factory = factory;
            this.isCritical = isCritical
        }, {
            isCritical: false, _factory: null, _cache: null, service: function service() {
                    if (!this._cache)
                        this._cache = this._factory();
                    return this._cache
                }, reset: function reset() {
                    if (this._cache && this._cache.dispose)
                        this._cache.dispose();
                    this._cache = null
                }
        });
    WinJS.Namespace.define("MS.Entertainment", {ServiceLocator: WinJS.Class.define(function() {
            throw"ServiceLocator contains only static methods.";
        }, {}, {
            _serviceTable: {}, _validateIdentifierOrThrow: function _validateIdentifierOrThrow(candidateIdentifier) {
                    if (!MS.Entertainment.Services.hasOwnProperty(candidateIdentifier))
                        throw"Unknown service identifier passed into Service Locator: " + candidateIdentifier;
                }, getService: function getService(identifier) {
                    var serviceTable = this._serviceTable;
                    var serviceEntry = null;
                    this._validateIdentifierOrThrow(identifier);
                    if (!serviceTable.hasOwnProperty(identifier))
                        throw"Attempt to retrieve a service that has not been registered: " + identifier;
                    serviceEntry = serviceTable[identifier];
                    return serviceEntry.service()
                }, isServiceRegistered: function isServiceRegistered(identifier) {
                    return !!this._serviceTable.hasOwnProperty(identifier)
                }, register: function register(identifier, factory, isCritical) {
                    var serviceTable = this._serviceTable;
                    this._validateIdentifierOrThrow(identifier);
                    if (serviceTable.hasOwnProperty(identifier))
                        throw"Attempt to register a second service for an already registered service identifier: " + identifier;
                    if (typeof factory !== "function")
                        throw"Attempt to register something besides a function as a service factory: " + identifier;
                    serviceTable[identifier] = new ServiceEntry(factory, isCritical)
                }, unregister: function unregister(identifier) {
                    var serviceEntry;
                    var serviceTable = this._serviceTable;
                    this._validateIdentifierOrThrow(identifier);
                    serviceEntry = serviceTable[identifier];
                    if (serviceEntry)
                        serviceEntry.reset();
                    delete serviceTable[identifier]
                }, cleanupNonCriticalServices: function cleanupNonCriticalServices() {
                    var serviceTable = this._serviceTable;
                    for (var id in serviceTable) {
                        if (serviceTable[id].isCritical)
                            continue;
                        serviceTable[id].reset()
                    }
                }, getTestHooks: function getTestHooks() {
                    var that = this;
                    var testHooks = null;
                    testHooks = {getServiceTable: function getServiceTable() {
                            return that._serviceTable
                        }};
                    return testHooks
                }
        })});
    WinJS.Namespace.define("MS.Entertainment", {Services: {
            actions: "actions", adService: "adService", appNotification: "appNotification", appToolbar: "appToolbar", assetDetails: "assetDetails", backButton: "backButton", cloudCollection: "cloudCollection", collectionChangeNotifier: "collectionChangeNotifier", dashboardRefresher: "dashboardRefresher", dateTimeFormatters: "dateTimeFormatters", findFriends: "findFriends", fileTransfer: "fileTransfer", fileTransferNotifications: "fileTransferNotifications", freePlayLimits: "freePlayLimits", gamesPurchaseHistory: "gamesPurchaseHistory", informationArchitecture: "informationArchitecture", interactionNotifier: "interactionNotifier", listNotification: "listNotification", navigation: "navigation", networkStatus: "networkStatus", nowPlayingControlManager: "nowPlayingControlManager", mediaDeleted: "mediaDeleted", playbackEventNotifications: "playbackEventNotifications", progressNotification: "progressNotification", purchaseFlowProvider: "purchaseFlowProvider", purchaseHistory: "purchaseHistory", sessionManager: "sessionManager", searchResultCounts: "searchResultCounts", shareDecoder: "shareDecoder", shareEncoder: "shareEncoder", shareHost: "shareHost", shareSender: "shareSender", shareReceiver: "shareReceiver", shortcutManager: "shortcutManager", signedInUser: "signedInUser", signIn: "signIn", smartDJList: "smartDJList", tileManager: "tileManager", typeToSearch: "typeToSearch", uiState: "uiState", upgradeReminderDisplayer: "upgradeReminderDisplayer", userEngagementService: "userEngagementService", userTimeTelemetryManager: "userTimeTelemetryManager", volumeService: "volumeService", xboxLive: "xboxLive", xhr: "xhr"
        }})
})()
