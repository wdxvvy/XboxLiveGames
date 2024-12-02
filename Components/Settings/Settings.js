/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Controls/WebHostExperience.js", "/Framework/corefx.js");
WinJS.Namespace.define("MS.Entertainment.Utilities.Settings", {
    onShow: function onShow(sender, id) {
        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.typeToSearch).disableTypeToSearch();
        var eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell;
        switch (id) {
            case"SettingsAccount":
                eventProvider.traceSettingsAccount_Launch(id);
                break;
            case"SettingsAbout":
                eventProvider.traceSettingsAbout_Launch(id);
                break;
            case"SettingsPreferences":
                eventProvider.traceSettingsPreferences_Launch(id);
                break;
            case"SettingsFeedback":
                eventProvider.traceSettingsFeedback_Launch(id);
                break;
            case"SettingsCaptions":
                eventProvider.traceSettingsCaptions_Launch(id);
                break
        }
    }, onShowComplete: function onShowComplete(sender, id) {
            var uiState = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
            uiState.isSettingsCharmVisible = true;
            var eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell;
            switch (sender.currentTarget.id) {
                case"SettingsAccount":
                    eventProvider.traceSettingsAccount_LaunchComplete(sender.currentTarget.id);
                    break;
                case"SettingsAbout":
                    eventProvider.traceSettingsAbout_LaunchComplete(sender.currentTarget.id);
                    break;
                case"SettingsPreferences":
                    eventProvider.traceSettingsPreferences_LaunchComplete(sender.currentTarget.id);
                    break;
                case"SettingsFeedback":
                    eventProvider.traceSettingsFeedback_LaunchComplete(sender.currentTarget.id);
                    break;
                case"SettingsCaptions":
                    eventProvider.traceSettingsCaptions_LaunchComplete(sender.currentTarget.id);
                    break
            }
        }
});
WinJS.Namespace.define("MS.Entertainment.Utilities", {SettingsWrapper: MS.Entertainment.UI.Framework.defineUserControl(null, function(element, options) {
        MS.Entertainment.Utilities.Settings.onShow(null, element.parentElement.id)
    }, {
        processChildren: true, deferInitialization: true, ignoreChildrenInitialization: true, controlName: "SettingsWrapper", initialize: function initialize() {
                this.domElement.parentElement.addEventListener("aftershow", MS.Entertainment.Utilities.Settings.onShowComplete, false);
                this.domElement.parentElement.addEventListener("afterhide", this.onHideComplete, false);
                if (this._backButton)
                    this._backButton.setAttribute("aria-label", String.load(String.id.IDS_ACC_BACK_BUTTON))
            }, backToSettings: function backToSettings() {
                try {
                    WinJS.UI.SettingsFlyout.show()
                }
                catch(ex) {
                    MS.Entertainment.Utilities.fail(false, "WinJS.UI.SettingsFlyout.show() fails: " + ex.toString())
                }
                var eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell;
                eventProvider.traceSettings_BackToHome("")
            }, onHideComplete: function onHideComplete(sender, id) {
                MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.typeToSearch).enableTypeToSearch();
                var uiState = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                uiState.isSettingsCharmVisible = false
            }
    })});
WinJS.Namespace.define("MS.Entertainment.Utilities", {PreferenceSettingsWrapper: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.Utilities.SettingsWrapper, null, function(element, options){}, {
        _displayingCredUI: false, initialize: function initialize() {
                MS.Entertainment.Utilities.SettingsWrapper.prototype.initialize.call(this);
                var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                this._initializeSignedInSetting(signIn);
                this._initializePromptOnPurchaseSetting(signIn);
                this._initializePurchasesSetting()
            }, forgetMe: function forgetMe() {
                var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                signIn.signOut();
                this.backToSettings()
            }, restorePurchases: function restorePurchases() {
                var service = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.purchaseHistory);
                service.grovel(true)
            }, promptToggleChange: function promptToggleChange(event) {
                if (this.promptOnPurchase.checked)
                    (new Microsoft.Entertainment.Configuration.ConfigurationManager).generalSettings.alwaysPromptOnPurchase = this.promptOnPurchase.checked;
                else if (this._displayingCredUI)
                    return;
                else {
                    this._displayingCredUI = true;
                    var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                    signIn.getPassportTicket(MS.Entertainment.Utilities.SignIn.TicketType.MBI_SSL, MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_PassportTicket), false, Microsoft.Entertainment.Util.SignInPromptType.retypeCredentials).then(function success(t) {
                        (new Microsoft.Entertainment.Configuration.ConfigurationManager).generalSettings.alwaysPromptOnPurchase = false;
                        WinJS.UI.SettingsFlyout.showSettings("SettingsPreferences", "/Components/Settings/SettingsPreferences.html")
                    }.bind(this), function getPassportTicketError(errTicket) {
                        MS.Entertainment.Utilities.assert(false, "Toggling prompt preferences fails with error code: " + errTicket.number)
                    })
                }
            }, _initializeSignedInSetting: function _initializeSignedInSetting(signIn) {
                var config = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                if (signIn.isSignedIn && config.shell.showRemoveInPreferences) {
                    var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                    this.currentUserId.text = String.load(String.id.IDS_SETTINGS_ACCOUNT_CURRENT_USER).format(signedInUser.signInName);
                    if (!signedInUser.canSignOut) {
                        this._hideElement(this.forgetMeButton);
                        this._hideElement(this.forgetMeDesc)
                    }
                }
                else
                    this._hideElement(this.switchUserContainer)
            }, _initializePromptOnPurchaseSetting: function _initializePromptOnPurchaseSetting(signIn) {
                if (signIn.isSignedIn) {
                    this.promptOnPurchase.title = String.load(String.id.IDS_SETTINGS_PROMPT_TOGGLE_TITLE);
                    this.promptOnPurchase.checked = (new Microsoft.Entertainment.Configuration.ConfigurationManager).generalSettings.alwaysPromptOnPurchase
                }
                else
                    this._hideElement(this.promptOnPurchaseContainer)
            }, _initializePurchasesSetting: function _initializePurchasesSetting() {
                this._hideElement(this.purchasesContainer)
            }, unload: function unload() {
                MS.Entertainment.Utilities.SettingsWrapper.prototype.unload.call(this)
            }, _showElement: function _showElement(element) {
                if (element.domElement)
                    element = element.domElement;
                WinJS.Utilities.removeClass(element, "removeFromDisplay")
            }, _hideElement: function _hideElement(element) {
                if (element.domElement)
                    element = element.domElement;
                WinJS.Utilities.addClass(element, "removeFromDisplay")
            }
    }, null, {})});
WinJS.Namespace.define("MS.Entertainment.Utilities", {AboutSettingsWrapper: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.Utilities.SettingsWrapper, null, function aboutSettingsWrapperConstructor(element, options){}, {initialize: function initialize() {
            MS.Entertainment.Utilities.SettingsWrapper.prototype.initialize.call(this);
            this.helpLink.domElement.setAttribute("href", "http://go.microsoft.com/fwlink/p/?LinkId=255545")
        }})});
WinJS.Namespace.define("MS.Entertainment.Utilities", {SettingsVersion: MS.Entertainment.UI.Framework.defineUserControl(null, function SettingsVersionConstructor(element) {
        this.versionPromise = WinJS.xhr({url: "version.json"}).then(function(data) {
            var versionInformation = JSON.parse(data.responseText);
            return versionInformation.version
        })
    }, {
        controlName: "SettingsVersion", versionPromise: null, initialize: function initialize() {
                MS.Entertainment.Utilities.assert(this.versionPromise, "Promise to load the version string hasn't been set");
                this.versionPromise.then(function(v) {
                    this.domElement.textContent = v
                }.bind(this))
            }
    })});
WinJS.Namespace.define("MS.Entertainment.Utilities", {
    AccountSettingsWrapper: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.Utilities.SettingsWrapper, null, function AccountSettingsWrapper_constructor(){}, {
        _signInHandler: null, _signIn: null, initialize: function initialize() {
                MS.Entertainment.Utilities.SettingsWrapper.prototype.initialize.call(this);
                this.domElement.parentElement.addEventListener("aftershow", MS.Entertainment.Utilities.Settings.onShowComplete, false);
                this.domElement.parentElement.addEventListener("beforehide", this.onAccountPanelHide, false);
                this._signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                this.onAccountShow();
                if (this._backButton)
                    this._backButton.setAttribute("aria-label", String.load(String.id.IDS_ACC_BACK_BUTTON))
            }, unload: function unload() {
                if (this._signInHandler)
                    this._signIn.unbind("isSignedIn", this._signInHandler);
                MS.Entertainment.Utilities.SettingsWrapper.prototype.unload.call(this)
            }, onAccountShow: function onAccountShow() {
                if (!this._signIn.isSignedIn) {
                    document.getElementById("accountWebHost").style.visibility = "collapse";
                    document.getElementById("offLineAccountPanel").style.visibility = "visible";
                    WinJS.Utilities.addClass(this.accountPanelHeader, "settingsPanelHeaderBackground");
                    this._signInHandler = this._onSignInChange.bind(this);
                    this._signIn.bind("isSignedIn", this._signInHandler)
                }
                else
                    this._loadXboxAccountSummaryPage()
            }, onAccountPanelHide: function onAccountPanelHide(sender, id) {
                var uiState = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                uiState.isSettingsCharmVisible = false;
                var accountPanel = sender.currentTarget;
                if (accountPanel) {
                    MS.Entertainment.UI.assert(accountPanel.winControl._dismiss, "accountPanel.winControl._dismiss missing");
                    accountPanel.winControl._dismiss()
                }
                if (MS.Entertainment.Utilities.Settings._signInHandler) {
                    this._signIn.unbind("isSignedIn", this._signInHandler);
                    this._signInHandler = null
                }
            }, _loadXboxAccountSummaryPage: function _loadXboxAccountSummaryPage() {
                var config = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                var ticketType = MS.Entertainment.Utilities.SignIn.TicketType.HBI;
                if (config.service.enableSecureAuth)
                    ticketType = MS.Entertainment.Utilities.SignIn.TicketType.SA_20MIN;
                this._signIn.getPassportTicket(ticketType, MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_PassportTicket)).then(function success(t) {
                    var webHost = document.getElementById("accountWebHost");
                    if (webHost) {
                        document.getElementById("offLineAccountPanel").style.visibility = "collapse";
                        webHost.style.visibility = "visible";
                        var control = webHost.winControl;
                        var url = MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_XBoxLiveSSL) + "/Account?xboxMusic=true";
                        var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                        if (signedInUser.canSignOut && !config.shell.showRemoveInPreferences)
                            url = url + "&showsignout=true";
                        control.authenticatedSourceUrl = url;
                        control.isSettingsFlow = true;
                        control.loadAuthenticatedUrl()
                    }
                    else
                        WinJS.UI.SettingsFlyout.showSettings("SettingsAccount", "/Components/Settings/SettingsAccount.html")
                }, function error(){})
            }, _onSignInChange: function _onSignInChange(isSignedIn) {
                if (isSignedIn)
                    this._loadXboxAccountSummaryPage()
            }, _overlayOnLostFocus: function _overlayOnLostFocus(){}
    }, null, null), SettingsExperience: WinJS.Class.derive(MS.Entertainment.UI.Controls.WebHostExperience, function SettingsExperience_constructor() {
            MS.Entertainment.UI.Controls.WebHostExperience.prototype.constructor.call(this)
        }, {
            messageReceived: function messageReceived(messageStruct, webHost, sendMessageFunc) {
                var errorCode = String.empty;
                if (!this.disposed)
                    switch (messageStruct.verb) {
                        case"CLOSE_DIALOG":
                            if (messageStruct.reason === "SUCCESS")
                                this.eventProvider.traceSettingsHome_Finish(messageStruct.taskId);
                            else if (messageStruct.reason === "ERROR")
                                this.eventProvider.traceSettingsAccount_Error(messageStruct.errorCode);
                            else if (messageStruct.reason === "CANCEL") {
                                try {
                                    WinJS.UI.SettingsFlyout.show()
                                }
                                catch(ex) {
                                    MS.Entertainment.Utilities.fail(false, "WinJS.UI.SettingsFlyout.show() fails: " + ex.toString())
                                }
                                this.eventProvider.traceSettings_BackToHome("")
                            }
                            break;
                        case"OPEN_DIALOG":
                            switch (messageStruct.reason) {
                                case"xblmembership":
                                case"redeemcode":
                                case"zunepass":
                                    MS.Entertainment.UI.Shell.showWebHostDialog(null, {
                                        desiredLeft: "0%", desiredTop: "10%", showBackButton: false, showCancelButton: false
                                    }, {
                                        sourceUrl: "", authenticatedSourceUrl: messageStruct.targetUrl, webHostExperienceFactory: MS.Entertainment.Utilities.SettingsExperience.factory, taskId: MS.Entertainment.UI.Controls.WebHost.TaskId.ACCOUNT, isDialog: true
                                    });
                                    break
                            }
                            break;
                        case"UPGRADE_MEMBERSHIP":
                        case"UPGRADE_MEMBERSHIP ":
                            this.eventProvider.traceSubscriptionSignup_Start(String.empty);
                            break;
                        case"MEMBERSHIP_UPGRADE_SUCESSFUL":
                        case"MEMBERSHIP_UPGRADE_SUCCESSFUL":
                        case"MEMBERSHIP_UPGRADE_SUCESSFUL ":
                            var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                            signIn.refreshSignInState();
                            this.eventProvider.traceSubscriptionSignup_Finish(String.empty);
                            break;
                        case"TOKEN_REDEMPTION_SUCCESSFUL":
                            var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                            signIn.refreshSignInState();
                            break;
                        case"SIGNOUT_CLICKED":
                            var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                            signIn.signOut();
                            try {
                                WinJS.UI.SettingsFlyout.show()
                            }
                            catch(ex) {
                                MS.Entertainment.Utilities.fail(false, "WinJS.UI.SettingsFlyout.show() fails: " + ex.toString())
                            }
                            break
                    }
                MS.Entertainment.UI.Controls.WebHostExperience.prototype.messageReceived.apply(this, arguments)
            }, errorReceived: function errorReceived(errorCode) {
                    MS.Entertainment.UI.Controls.WebHostExperience.prototype.errorReceived.apply(this, arguments)
                }
        }, {factory: WinJS.Utilities.markSupportedForProcessing(function factory() {
                return new MS.Entertainment.Utilities.SettingsExperience
            })})
});
(function() {
    WinJS.Application.onsettings = function onSettings(e) {
        var eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell;
        eventProvider.traceSettingsPopulate_Start("");
        if (!(new Microsoft.Entertainment.Configuration.ConfigurationManager).shell.retailExperience) {
            var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
            var hasPreferences = signIn.isSignedIn;
            var hasCaptions = MS.Entertainment.Platform.PlaybackHelpers.isClosedCaptionFeatureEnabled();
            e.detail.applicationcommands = {};
            if (signIn.isSignInEnabled)
                e.detail.applicationcommands.SettingsAccount = {
                    href: "/Components/Settings/SettingsAccount.html", title: String.load(String.id.IDS_SETTINGS_ACCOUNT_TITLE)
                };
            if (hasPreferences)
                e.detail.applicationcommands.SettingsPreferences = {
                    href: "/Components/Settings/SettingsPreferences.html", title: String.load(String.id.IDS_SETTINGS_PREFERENCE_TITLE)
                };
            if (hasCaptions)
                e.detail.applicationcommands.SettingsCaptions = {
                    href: "/Components/Settings/SettingsCaptions.html", title: String.load(String.id.IDS_SETTINGS_CAPTIONS_TITLE)
                };
            e.detail.applicationcommands.SettingsAbout = {
                href: "/Components/Settings/SettingsAbout.html", title: String.load(String.id.IDS_SETTINGS_ABOUT_TITLE)
            };
            e.detail.applicationcommands.SettingsFeedback = {
                href: "/Components/Settings/SettingsFeedback.html", title: String.load(String.id.IDS_SETTINGS_FEEDBACK_TITLE)
            }
        }
        var appBar = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar);
        appBar.hide();
        eventProvider.traceSettingsWinJSPopulate_Start("");
        WinJS.UI.SettingsFlyout.populateSettings(e);
        eventProvider.traceSettingsPopulate_End("")
    }
})()
