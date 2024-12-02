/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/debug.js", "/Framework/utilities.js");
(function() {
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI");
    WinJS.Namespace.define("MS.Entertainment.UI", {PurchaseHistoryService: MS.Entertainment.defineObservable(function PurchaseHistoryServiceConstructor() {
            this._reattemptGrovelTimer = null;
            this._sessionPurchaseFlowActivityCount = 0
        }, {
            inPurchaseFlow: false, isGroveling: false, _delayBeforeGrovelReattemptMS: 5 * 60 * 1000, _reattemptGrovelTimer: null, _sessionPurchaseFlowActivityCount: null, grovel: function grovel(resetLastUpdateDateTime) {
                    if (this.isGroveling || !MS.Entertainment.UI.PurchaseHistoryService.isFeatureEnabled)
                        return;
                    this._stopReattemptGrovelTimer()
                }, _startReattemptGrovelTimer: function _startReattemptGrovelTimer() {
                    this._stopReattemptGrovelTimer();
                    this._reattemptGrovelTimer = WinJS.Promise.timeout(this._delayBeforeGrovelReattemptMS).then(this.grovel.bind(this))
                }, _stopReattemptGrovelTimer: function _stopReattemptGrovelTimer() {
                    if (this._reattemptGrovelTimer) {
                        var timer = WinJS.Binding.unwrap(this._reattemptGrovelTimer);
                        if (timer)
                            timer.cancel();
                        this._reattemptGrovelTimer = null
                    }
                }
        }, {
            isFeatureEnabled: {get: function isFeatureEnabled() {
                    return false
                }}, enterPurchaseFlowActivity: function enterPurchaseFlowActivity() {
                    if (!MS.Entertainment.UI.PurchaseHistoryService.isFeatureEnabled)
                        return;
                    var service = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.purchaseHistory);
                    service._stopReattemptGrovelTimer.apply(service);
                    if (++service._sessionPurchaseFlowActivityCount === 1) {
                        service.inPurchaseFlow = true;
                        var config = MS.Entertainment.UI.PurchaseHistoryService._getConfig();
                        MS.Entertainment.UI.PurchaseHistoryService._setConfig(config.lastUpdateDateTime, config.incompletePurchaseFlows + 1)
                    }
                }, leavePurchaseFlowActivity: function leavePurchaseFlowActivity(failureOccurred) {
                    if (!MS.Entertainment.UI.PurchaseHistoryService.isFeatureEnabled)
                        return;
                    var service = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.purchaseHistory);
                    service._stopReattemptGrovelTimer.apply(service);
                    var purchaseFlowSessionClosed = (service._sessionPurchaseFlowActivityCount !== 0 && --service._sessionPurchaseFlowActivityCount === 0);
                    if (failureOccurred) {
                        var config = MS.Entertainment.UI.PurchaseHistoryService._getConfig();
                        MS.Entertainment.UI.PurchaseHistoryService._setConfig(config.lastUpdateDateTime, config.incompletePurchaseFlows + 1)
                    }
                    if (purchaseFlowSessionClosed) {
                        service.inPurchaseFlow = false;
                        var config = MS.Entertainment.UI.PurchaseHistoryService._getConfig();
                        if (config.incompletePurchaseFlows !== 0)
                            MS.Entertainment.UI.PurchaseHistoryService._setConfig(config.lastUpdateDateTime, config.incompletePurchaseFlows - 1);
                        service.grovel.apply(service)
                    }
                }, initialize: function initialize() {
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn).bind("isSignedIn", MS.Entertainment.UI.PurchaseHistoryService._onSignInChange);
                    MS.Entertainment.Utilities.SignIn.addEventListener("signInRefreshed", function _onSignInRefreshed() {
                        MS.Entertainment.UI.PurchaseHistoryService._onSignInChange(true)
                    })
                }, _onSignInChange: function _onSignInChange(isSignedIn) {
                    if (!MS.Entertainment.UI.PurchaseHistoryService.isFeatureEnabled)
                        return;
                    var service = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.purchaseHistory);
                    if (isSignedIn)
                        service.grovel.apply(service);
                    else
                        service._stopReattemptGrovelTimer.apply(service)
                }, _resetLastUpdateDateTime: function _resetLastUpdateDateTime() {
                    var config = this._getConfig();
                    MS.Entertainment.UI.PurchaseHistoryService._setConfig(null, config.incompletePurchaseFlows);
                    return config
                }, _getConfig: function _getConfig() {
                    var configuration = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    var configString = configuration.service.pastPurchaseData;
                    var config = configString ? JSON.parse(configString) : {};
                    if (!config.lastUpdateDateTime) {
                        config.lastUpdateDateTime = null;
                        config.incompletePurchaseFlows = 1
                    }
                    if (!config.incompletePurchaseFlows && !(typeof config.incompletePurchaseFlows === "number"))
                        config.incompletePurchaseFlows = 1;
                    return config
                }, _setConfig: function _setConfig(lastUpdateDateTime, incompletePurchaseFlows) {
                    var config = {
                            lastUpdateDateTime: lastUpdateDateTime, incompletePurchaseFlows: incompletePurchaseFlows
                        };
                    var configuration = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    configuration.service.pastPurchaseData = JSON.stringify(config)
                }, _incrementMarketplaceDate: function _incrementMarketplaceDate(dateString) {
                    var maxFractionDigits = 7;
                    var re = /^(.+?)(\.(\d+)?)?Z$/;
                    var fraction = null;
                    var matches = dateString.match(re);
                    if (!matches)
                        return null;
                    var dateStringNoZ = matches[1];
                    var fraction = matches[3];
                    if (!fraction)
                        fraction = "";
                    else
                        fraction = fraction.substr(0, maxFractionDigits);
                    if (fraction.length === maxFractionDigits) {
                        var newFraction = (parseInt(fraction) + 1).toString();
                        if (newFraction.length > maxFractionDigits) {
                            var date = new Date(dateStringNoZ + "Z");
                            date.setUTCSeconds(date.getUTCSeconds() + 1);
                            return date.toISOString()
                        }
                        else {
                            var prefixFraction = new Array(fraction.length - newFraction.length + 1).join("0");
                            return dateStringNoZ + "." + prefixFraction + newFraction + "Z"
                        }
                    }
                    else {
                        var concatFraction = new Array(maxFractionDigits - fraction.length).join("0") + "1";
                        return dateStringNoZ + "." + fraction + concatFraction + "Z"
                    }
                }
        })});
    MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.purchaseHistory, function PurchaseHistoryServiceFactory() {
        return new MS.Entertainment.UI.PurchaseHistoryService
    })
})()
