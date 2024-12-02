/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI", {UpgradeReminderDisplayer: WinJS.Class.derive(MS.Entertainment.UI.Framework.ObservableBase, function() {
            this._appNotificationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appNotification)
        }, {
            _appNotificationService: null, upgradeRequired: MS.Entertainment.UI.Framework.observableProperty("upgradeRequired", false), forceUpgradeRequired: false, checkAndRunUpgradeReminder: function checkAndRunUpgradeReminder(showDialog) {
                    var versionSupported = this._checkVersionSupported();
                    var stateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                    if (!versionSupported || !stateService.servicesEnabled) {
                        this._showUpgradeNotification();
                        if (showDialog)
                            this.showUpgradeDialog()
                    }
                    if (this.forceUpgradeRequired) {
                        WinJS.Promise.timeout().then(function _delay() {
                            window.location.href = "UpdateApp.html"
                        });
                        MS.Entertainment.Instrumentation.PerfTrack.disableAllStartupScenarios()
                    }
                    return versionSupported
                }, _checkVersionSupported: function _checkVersionSupported() {
                    if (MS.Entertainment.Utilities.isApp2)
                        return true;
                    var currentPackage = Windows.ApplicationModel.Package.current;
                    var currentVersion = currentPackage.id.version;
                    var config = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    var minVersionSupported;
                    var minServiceVersionSupported;
                    var minAppVersionSupported;
                    if (MS.Entertainment.Utilities.isGamesApp) {
                        minVersionSupported = MS.Entertainment.Utilities.parseVersionString(config.service.minGamesSignInSupportedVersion);
                        minAppVersionSupported = MS.Entertainment.Utilities.parseVersionString(config.fue.minGamesAppSupportedVersion);
                        minServiceVersionSupported = MS.Entertainment.Utilities.parseVersionString(config.service.minGamesServiceSupportedVersion)
                    }
                    else {
                        minVersionSupported = MS.Entertainment.Utilities.parseVersionString("1.0.0.0");
                        minAppVersionSupported = MS.Entertainment.Utilities.parseVersionString("1.0.0.0");
                        minServiceVersionSupported = MS.Entertainment.Utilities.parseVersionString("1.0.0.0")
                    }
                    var versionSupported = MS.Entertainment.Utilities.compareVersions(currentVersion, minVersionSupported) >= 0 ? true : false;
                    var stateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                    stateService.servicesEnabled = (MS.Entertainment.Utilities.compareVersions(currentVersion, minServiceVersionSupported) >= 0);
                    this.forceUpgradeRequired = (MS.Entertainment.Utilities.compareVersions(currentVersion, minAppVersionSupported) < 0);
                    this.upgradeRequired = !versionSupported || !stateService.servicesEnabled;
                    var appSignIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                    appSignIn.setIsSignInSupported(!this.upgradeRequired);
                    return versionSupported
                }, _showUpgradeNotification: function _showUpgradeNotification() {
                    var upgradeAction = WinJS.Utilities.markSupportedForProcessing(function() {
                            this.launchStore();
                            this._appNotificationService.removeNotificationByCategory(MS.Entertainment.Utilities.SignIn.NotificationCategory.signInError);
                            this._appNotificationService.send(new MS.Entertainment.UI.Notification({
                                notificationType: MS.Entertainment.UI.Notification.Type.Critical, title: String.load(String.id.IDS_VERSION_CHECK_SERVICE_TITLE), subTitle: String.load(String.id.IDS_VERSION_CHECK_SIGNIN_TEXT), moreDetails: null, icon: WinJS.UI.AppBarIcon.download, action: upgradeAction, secondaryActions: null, category: MS.Entertainment.Utilities.SignIn.NotificationCategory.signInError, isPersistent: false
                            }))
                        }.bind(this));
                    this._appNotificationService.removeNotificationByCategory(MS.Entertainment.Utilities.SignIn.NotificationCategory.signInError);
                    this._appNotificationService.send(new MS.Entertainment.UI.Notification({
                        notificationType: MS.Entertainment.UI.Notification.Type.Critical, title: String.load(String.id.IDS_VERSION_CHECK_SERVICE_TITLE), subTitle: String.load(String.id.IDS_VERSION_CHECK_SIGNIN_TEXT), moreDetails: null, icon: WinJS.UI.AppBarIcon.download, action: upgradeAction, secondaryActions: null, category: MS.Entertainment.Utilities.SignIn.NotificationCategory.signInError, isPersistent: false
                    }))
                }, showUpgradeDialog: function showUpgradeDialog() {
                    var cancelConfirmDialogButtons = [{
                                title: String.load(String.id.IDS_VERSION_CHECK_UPGRADE_LINK), execute: function onOk(overlay) {
                                        this.launchStore();
                                        overlay.hide()
                                    }.bind(this)
                            }, {
                                title: String.load(String.id.IDS_CANCEL_BUTTON), execute: function onCancel(overlay) {
                                        overlay.hide()
                                    }
                            }];
                    MS.Entertainment.UI.Shell.showMessageBox(String.load(String.id.IDS_VERSION_CHECK_SERVICE_TITLE), String.load(String.id.IDS_VERSION_CHECK_SERVICE_FOR_FEATURES_TEXT), {
                        buttons: cancelConfirmDialogButtons, defaultButtonIndex: 0, cancelButtonIndex: 1
                    })
                }, launchStore: function launchStore() {
                    var launchInfo = "ms-windows-store:Updates";
                    var appAction = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.launchApp);
                    appAction.automationId = MS.Entertainment.UI.AutomationIds.launchAppStoreUpgrade;
                    appAction.parameter = {
                        uri: launchInfo, appendSource: true, appendGamerTag: false
                    };
                    appAction.execute()
                }
        })});
    MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.upgradeReminderDisplayer, function createUpgradeReminderDisplayerService() {
        return new MS.Entertainment.UI.UpgradeReminderDisplayer
    })
})()
