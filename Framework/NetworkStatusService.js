/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI");
WinJS.Namespace.define("MS.Entertainment.UI", {NetworkStatusService: WinJS.Class.derive(MS.Entertainment.UI.Framework.ObservableBase, function NetworkStatusService() {
        this._uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
        if (!(new Microsoft.Entertainment.Configuration.ConfigurationManager).shell.retailExperience)
            this.startListening();
        else
            this._uiStateService.networkStatus = MS.Entertainment.UI.NetworkStatusService.NetworkStatus.none;
        this.initializeNetworkedFeaturesTable()
    }, {
        approachingDataLimit: MS.Entertainment.UI.Framework.observableProperty("approachingDataLimit", false), _overLimit: false, _uiStateService: null, _offlineDelayPromise: null, _offlineDelayTimerInMS: 5000, _networkedFeatureStatusTable: null, _lastNotificationId: -1, startListening: function startListening() {
                Windows.Networking.Connectivity.NetworkInformation.addEventListener("networkstatuschanged", this._onNetworkStatusChanged.bind(this));
                this._updateNetworkStatus(true)
            }, stopListening: function stopListening() {
                Windows.Networking.Connectivity.NetworkInformation.removeEventListener("networkstatuschanged", this._onNetworkStatusChanged)
            }, initializeNetworkedFeaturesTable: function initializeNetworkedFeaturesTable() {
                this._networkedFeatureStatusTable = [];
                var musicMarketplace = [];
                musicMarketplace[MS.Entertainment.UI.NetworkStatusService.NetworkStatus.unknown] = true;
                musicMarketplace[MS.Entertainment.UI.NetworkStatusService.NetworkStatus.unrestricted] = true;
                musicMarketplace[MS.Entertainment.UI.NetworkStatusService.NetworkStatus.throttled] = true;
                musicMarketplace[MS.Entertainment.UI.NetworkStatusService.NetworkStatus.onDemand] = false;
                musicMarketplace[MS.Entertainment.UI.NetworkStatusService.NetworkStatus.localOnly] = false;
                musicMarketplace[MS.Entertainment.UI.NetworkStatusService.NetworkStatus.none] = false;
                this._networkedFeatureStatusTable[MS.Entertainment.UI.NetworkStatusService.NetworkedFeature.musicMarketplace] = musicMarketplace;
                var videoMarketplace = [];
                videoMarketplace[MS.Entertainment.UI.NetworkStatusService.NetworkStatus.unknown] = true;
                videoMarketplace[MS.Entertainment.UI.NetworkStatusService.NetworkStatus.unrestricted] = true;
                videoMarketplace[MS.Entertainment.UI.NetworkStatusService.NetworkStatus.throttled] = true;
                videoMarketplace[MS.Entertainment.UI.NetworkStatusService.NetworkStatus.onDemand] = false;
                videoMarketplace[MS.Entertainment.UI.NetworkStatusService.NetworkStatus.localOnly] = false;
                videoMarketplace[MS.Entertainment.UI.NetworkStatusService.NetworkStatus.none] = false;
                this._networkedFeatureStatusTable[MS.Entertainment.UI.NetworkStatusService.NetworkedFeature.videoMarketplace] = videoMarketplace
            }, isEnabled: function isEnabled(feature) {
                MS.Entertainment.Utilities.validateIsMemberOrThrow(feature, MS.Entertainment.UI.NetworkStatusService.NetworkedFeature);
                var networkStatus = this._uiStateService.networkStatus !== null ? this._uiStateService.networkStatus : MS.Entertainment.UI.NetworkStatusService.NetworkStatus.none;
                var featureStatusArray = this._networkedFeatureStatusTable[feature];
                MS.Entertainment.ViewModels.assert(featureStatusArray, "Unknown feature");
                MS.Entertainment.ViewModels.assert(featureStatusArray[networkStatus] !== null && featureStatusArray[networkStatus] !== undefined, "Unknown network status for this feature");
                return featureStatusArray ? featureStatusArray[networkStatus] : false
            }, _onNetworkStatusChanged: function _onNetworkStatusChanged(sender) {
                this._updateNetworkStatus()
            }, _updateNetworkStatus: function _updateNetworkStatus(immediateStatusUpdate) {
                if (this._offlineDelayPromise) {
                    this._offlineDelayPromise.cancel();
                    this._offlineDelayPromise = null
                }
                var internetProfile = null;
                try {
                    internetProfile = Windows.Networking.Connectivity.NetworkInformation.getInternetConnectionProfile()
                }
                catch(e) {
                    MS.Entertainment.UI.Components.Shell.fail("Exception accessing: NetworkInformation.getInternetConnectionProfile")
                }
                if (!internetProfile) {
                    if (immediateStatusUpdate)
                        this._uiStateService.networkStatus = MS.Entertainment.UI.NetworkStatusService.NetworkStatus.none;
                    else
                        this._offlineDelayPromise = WinJS.Promise.timeout(this._offlineDelayTimerInMS).then(function setOffline() {
                            this._uiStateService.networkStatus = MS.Entertainment.UI.NetworkStatusService.NetworkStatus.none
                        }.bind(this));
                    return
                }
                var stringId = String.id.IDS_NETWORK_STATUS_UNKNOWN;
                var raiseNotification = false;
                var isCritical = false;
                if (MS.Entertainment.Utilities.isApp2)
                    this._uiStateService.networkStatus = MS.Entertainment.UI.NetworkStatusService.NetworkStatus.unrestricted;
                else {
                    try {
                        switch (internetProfile.getNetworkConnectivityLevel()) {
                            case Windows.Networking.Connectivity.NetworkConnectivityLevel.none:
                                this._uiStateService.networkStatus = MS.Entertainment.UI.NetworkStatusService.NetworkStatus.none;
                                break;
                            case Windows.Networking.Connectivity.NetworkConnectivityLevel.localAccess:
                                this._uiStateService.networkStatus = MS.Entertainment.UI.NetworkStatusService.NetworkStatus.localOnly;
                                stringId = String.id.IDS_NETWORK_STATUS_LOCAL_ONLY;
                                raiseNotification = false;
                                break;
                            case Windows.Networking.Connectivity.NetworkConnectivityLevel.constrainedInternetAccess:
                            case Windows.Networking.Connectivity.NetworkConnectivityLevel.internetAccess:
                                var connectionCost = internetProfile.getConnectionCost();
                                try {
                                    this.approachingDataLimit = connectionCost.approachingDataLimit;
                                    switch (connectionCost.networkCostType) {
                                        case Windows.Networking.Connectivity.NetworkCostType.unknown:
                                        case Windows.Networking.Connectivity.NetworkCostType.unrestricted:
                                            this._uiStateService.networkStatus = MS.Entertainment.UI.NetworkStatusService.NetworkStatus.unrestricted;
                                            break;
                                        case Windows.Networking.Connectivity.NetworkCostType.fixed:
                                        case Windows.Networking.Connectivity.NetworkCostType.variable:
                                            if (connectionCost.overDataLimit) {
                                                this._uiStateService.networkStatus = MS.Entertainment.UI.NetworkStatusService.NetworkStatus.onDemand;
                                                stringId = String.id.IDS_NETWORK_STATUS_OVER_THE_LIMIT;
                                                raiseNotification = true;
                                                isCritical = true
                                            }
                                            else if (connectionCost.roaming) {
                                                this._uiStateService.networkStatus = MS.Entertainment.UI.NetworkStatusService.NetworkStatus.onDemand;
                                                stringId = String.id.IDS_NETWORK_STATUS_ROAMING;
                                                raiseNotification = true;
                                                isCritical = true
                                            }
                                            else {
                                                this._uiStateService.networkStatus = MS.Entertainment.UI.NetworkStatusService.NetworkStatus.throttled;
                                                stringId = String.id.IDS_NETWORK_STATUS_THROTTLED;
                                                raiseNotification = true
                                            }
                                            break;
                                        default:
                                            MS.Entertainment.ViewModels.assert(false, "Unknown ConnectivityLevel");
                                            this._uiStateService.networkStatus = MS.Entertainment.UI.NetworkStatusService.NetworkStatus.unknown;
                                            stringId = String.id.IDS_NETWORK_STATUS_UNKNOWN;
                                            break
                                    }
                                }
                                catch(e) {
                                    MS.Entertainment.UI.Components.Shell.fail("Exception accessing: networkCostType");
                                    this._uiStateService.networkStatus = MS.Entertainment.UI.NetworkStatusService.NetworkStatus.unknown;
                                    stringId = String.id.IDS_NETWORK_STATUS_UNKNOWN
                                }
                                break
                        }
                    }
                    catch(e) {
                        MS.Entertainment.UI.Components.Shell.fail("Exception accessing: Windows.Networking.Connectivity.NetworkConnectivityLevel");
                        this._uiStateService.networkStatus = MS.Entertainment.UI.NetworkStatusService.NetworkStatus.none
                    }
                    if (raiseNotification)
                        this._sendNotification(stringId, isCritical);
                    else
                        this._lastNotificationId = stringId
                }
            }, _sendNotification: function _sendNotification(stringId, isCritical) {
                if (stringId === this._lastNotificationId)
                    return;
                var appNotificationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appNotification);
                appNotificationService.removeNotificationByCategory(MS.Entertainment.UI.NetworkStatusService.notificationCategory);
                this._lastNotificationId = stringId;
                appNotificationService.send(new MS.Entertainment.UI.Notification({
                    notificationType: isCritical ? MS.Entertainment.UI.Notification.Type.Critical : MS.Entertainment.UI.Notification.Type.Informational, title: String.load(String.id.IDS_NETWORK_STATUS_HEADER), subTitle: String.load(stringId), moreDetails: null, icon: MS.Entertainment.UI.Icon.inlineStreaming, action: null, secondaryActions: null, category: MS.Entertainment.UI.NetworkStatusService.notificationCategory, isPersistent: false
                }))
            }
    }, {
        isOnline: function isOnline() {
            var isOnline = true;
            switch (MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).networkStatus) {
                case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.unknown:
                case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.unrestricted:
                case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.throttled:
                case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.onDemand:
                    isOnline = true;
                    break;
                case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.localOnly:
                case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.none:
                    isOnline = false;
                    break
            }
            return isOnline
        }, NetworkStatus: {
                unknown: "unknown", unrestricted: "unrestricted", throttled: "throttled", onDemand: "onDemand", localOnly: "localOnly", none: "none"
            }, NetworkedFeature: {
                musicMarketplace: "musicMarketplace", videoMarketplace: "videoMarketplace"
            }, notificationCategory: "networkStatus"
    })});
MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.networkStatus, function NetworkStatusServiceFactory() {
    return new MS.Entertainment.UI.NetworkStatusService
})
