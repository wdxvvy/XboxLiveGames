/* Copyright (C) Microsoft Corporation. All rights reserved. */
var __extends = this.__extends || function(d, b) {
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };
this.scriptValidator();
var MS;
(function(MS) {
    (function(Entertainment) {
        (function(UI) {
            (function(Actions) {
                var ListNotificationAutomationIds = (function() {
                        function ListNotificationAutomationIds(){}
                        ListNotificationAutomationIds.clearAction = "clearAction";
                        ListNotificationAutomationIds.localContentAction = "localContentAction";
                        ListNotificationAutomationIds.partialContentAction = "partialContentAction";
                        ListNotificationAutomationIds.cloudContentAction = "cloudContentAction";
                        return ListNotificationAutomationIds
                    })();
                Actions.ListNotificationAutomationIds = ListNotificationAutomationIds;
                (function(ListNotificationActions) {
                    var ClearAction = (function(_super) {
                            __extends(ClearAction, _super);
                            function ClearAction() {
                                _super.call(this);
                                this.automationId = ListNotificationAutomationIds.clearAction;
                                this.optOut = false
                            }
                            ClearAction.prototype.canExecute = function(param) {
                                return param != null && param != undefined && param.category != null
                            };
                            ClearAction.prototype.executed = function(param) {
                                if (this.canExecute(param)) {
                                    var listNotificationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.listNotification);
                                    if (this.optOut) {
                                        (MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.cloudCollection)).setCloudMatchOptIn(false);
                                        MS.Entertainment.Utilities.Telemetry.logTelemetryEvent(MS.Entertainment.Utilities.PreferenceSettingsWrapper.TelemetryEvents.CloudMatchEnabledStateChanged, MS.Entertainment.Utilities.PreferenceSettingsWrapper.States.CloudMatchEnabledState, false, MS.Entertainment.Utilities.Telemetry.Events.CloudMatchStateChangeMethod, MS.Entertainment.Utilities.Telemetry.StateChangeMethodValues.notification);
                                        listNotificationService.clear(param.category, true)
                                    }
                                    else
                                        listNotificationService.clear(param.category)
                                }
                            };
                            return ClearAction
                        })(Actions.Action);
                    ListNotificationActions.ClearAction = ClearAction;
                    var LocalContentAction = (function(_super) {
                            __extends(LocalContentAction, _super);
                            function LocalContentAction() {
                                _super.call(this);
                                this.automationId = ListNotificationAutomationIds.localContentAction
                            }
                            LocalContentAction.prototype.canExecute = function(param) {
                                return true
                            };
                            LocalContentAction.prototype.executed = function(param) {
                                MS.Entertainment.Music.localGrovelInfoDialog.show()
                            };
                            return LocalContentAction
                        })(Actions.Action);
                    ListNotificationActions.LocalContentAction = LocalContentAction;
                    var PartialContentAction = (function(_super) {
                            __extends(PartialContentAction, _super);
                            function PartialContentAction() {
                                _super.call(this);
                                this.automationId = ListNotificationAutomationIds.partialContentAction
                            }
                            PartialContentAction.prototype.canExecute = function(param) {
                                return true
                            };
                            PartialContentAction.prototype.executed = function(param) {
                                var supportUri = new Windows.Foundation.Uri(MS.Entertainment.UI.FWLink.cloudGrovelPartialMatchLearnMore);
                                Windows.System.Launcher.launchUriAsync(supportUri).then(null, function launchFailure(onFailed) {
                                    if (onFailed)
                                        MS.Entertainment.UI.Actions.assert(false, "Failed to launch help topic for the partial content notification with the following failure '" + onFailed + "'");
                                    else
                                        MS.Entertainment.UI.Actions.assert(false, "Failed to launch help topic for the partial content notification")
                                })
                            };
                            return PartialContentAction
                        })(Actions.Action);
                    ListNotificationActions.PartialContentAction = PartialContentAction;
                    var CloudContentAction = (function(_super) {
                            __extends(CloudContentAction, _super);
                            function CloudContentAction() {
                                _super.call(this);
                                this.automationId = ListNotificationAutomationIds.cloudContentAction;
                                this.consentDialog = false;
                                this.matchingDialog = false;
                                this._consentDialogAutomationTitle = "consentDialog";
                                this._matchingDialogAutomationTitle = "matchingDialog";
                                this._infoDialogAutomationTitle = "infoDialog"
                            }
                            CloudContentAction.prototype.canExecute = function(param) {
                                return true
                            };
                            CloudContentAction.prototype.executed = function(param) {
                                if (this.consentDialog) {
                                    this.title = this._consentDialogAutomationTitle;
                                    MS.Entertainment.UI.assert(param.category, "Cannot execute cloud opt-in dialog without category.");
                                    var consentDialogCallback = function onCloudMatchOptInDialogClose(dialogResult) {
                                            if (dialogResult && dialogResult === MS.Entertainment.Music.CloudMatchOptIn.DialogResult.optIn) {
                                                var listNotificationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.listNotification);
                                                var optInCloudNotification = listNotificationService.getNotificationByCategory(UI.NotificationCategoryEnum.cloudContent);
                                                if (optInCloudNotification && optInCloudNotification.tag)
                                                    listNotificationService.send(optInCloudNotification.tag);
                                                else
                                                    listNotificationService.clear(param.category, true)
                                            }
                                        };
                                    var signInService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                                    if (signInService && signInService.isSignedIn)
                                        MS.Entertainment.Music.cloudMatchOptInDialog.show(consentDialogCallback);
                                    else
                                        signInService.signIn().then(function onSignIn() {
                                            MS.Entertainment.Music.cloudMatchOptInDialog.show(consentDialogCallback)
                                        })
                                }
                                else if (this.matchingDialog) {
                                    this.title = this._matchingDialogAutomationTitle;
                                    MS.Entertainment.Music.cloudMatchIconDialog.show()
                                }
                                else {
                                    this.title = this._infoDialogAutomationTitle;
                                    MS.Entertainment.Music.cloudGrovelInfoDialog.show()
                                }
                            };
                            return CloudContentAction
                        })(Actions.Action);
                    ListNotificationActions.CloudContentAction = CloudContentAction
                })(Actions.ListNotificationActions || (Actions.ListNotificationActions = {}));
                var ListNotificationActions = Actions.ListNotificationActions
            })(UI.Actions || (UI.Actions = {}));
            var Actions = UI.Actions
        })(Entertainment.UI || (Entertainment.UI = {}));
        var UI = Entertainment.UI
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}));
(function() {
    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.notificationClear, function() {
        return new MS.Entertainment.UI.Actions.ListNotificationActions.ClearAction
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.notificationLocalContent, function() {
        return new MS.Entertainment.UI.Actions.ListNotificationActions.LocalContentAction
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.notificationPartialContent, function() {
        return new MS.Entertainment.UI.Actions.ListNotificationActions.PartialContentAction
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.notificationCloudContent, function() {
        return new MS.Entertainment.UI.Actions.ListNotificationActions.CloudContentAction
    })
})()
