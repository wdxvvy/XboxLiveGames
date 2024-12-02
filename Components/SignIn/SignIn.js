/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Utilities");
(function() {
    WinJS.Namespace.define("MS.Entertainment.Utilities", {SignedInUser: MS.Entertainment.derive(MS.Entertainment.Utilities.User, function signedInUser() {
            MS.Entertainment.Utilities.SignedInUser._instanceCount++;
            MS.Entertainment.Utilities.assert(MS.Entertainment.Utilities.SignedInUser._instanceCount === 1, "Use MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser)");
            this.base();
            this.refresh(null, true)
        }, {
            gamerTag: String.empty, xuid: String.empty, locale: String.empty, isParentallyControlled: false, hasExplicitPrivilege: false, hasAvatar: false, pointsBalance: 0, zestAccountType: String.empty, isSubscription: false, membershipLevel: String.empty, avatarManifestVersion: 0, meteringCertificate: String.empty, signInName: String.empty, _userPuid: String.empty, _userAnid: String.empty, canSignOut: false, isTunerActivated: false, isTunerActivatable: false, isGamerTag: function isGamerTag(gamerTag) {
                    return gamerTag && this.gamerTag && this.gamerTag.match(new RegExp("^" + gamerTag + "$", "i")) !== null
                }, isGold: function isGold() {
                    return this.membershipLevel === MS.Entertainment.Utilities.SignedInUser.membershipStringMap.Gold || this.membershipLevel === MS.Entertainment.Utilities.SignedInUser.membershipStringMap.FamilyGold
                }, isSilver: function isSilver() {
                    return this.membershipLevel === MS.Entertainment.Utilities.SignedInUser.membershipStringMap.Silver
                }, getUserAnid: function getUserAnid() {
                    if (this._userAnid)
                        return this.userAnid;
                    if (!this._userPuid)
                        return String.empty;
                    var padding = [];
                    for (var w = 0; w < (MS.Entertainment.Utilities.SignedInUser._initialPuidLength - this._userPuid.length); w++)
                        padding[w] = "0";
                    var puidToUse = padding.join(String.empty).concat(this._userPuid);
                    try {
                        var macAlgorithmProvider = Windows.Security.Cryptography.Core.MacAlgorithmProvider.openAlgorithm("HMAC_MD5");
                        var keyMaterial = Windows.Security.Cryptography.CryptographicBuffer.createFromByteArray([99, 202, 90, 90, 191, 64, 70, 72, 58, 206, 107, 87, 165, 187, 152, 8]);
                        var key = macAlgorithmProvider.createKey(keyMaterial);
                        var encodedPuid = Windows.Security.Cryptography.CryptographicBuffer.convertStringToBinary(puidToUse, Windows.Security.Cryptography.BinaryStringEncoding.utf16LE);
                        var bytes = null;
                        bytes = Windows.Security.Cryptography.CryptographicBuffer.copyToByteArray(encodedPuid);
                        var bytes2 = [];
                        for (var i = 0; i < bytes.length; i++)
                            bytes2[i] = bytes[i];
                        for (var k = bytes.length - 1; k < MS.Entertainment.Utilities.SignedInUser._encodedMaterialLength; k++)
                            bytes2[k] = 0;
                        var finalEncodedPuid = Windows.Security.Cryptography.CryptographicBuffer.createFromByteArray(bytes2);
                        var signatureBuffer = Windows.Security.Cryptography.Core.CryptographicEngine.sign(key, finalEncodedPuid);
                        var signature = Windows.Security.Cryptography.CryptographicBuffer.encodeToHexString(signatureBuffer);
                        var finalString = signature.slice(0, MS.Entertainment.Utilities.SignedInUser._anidSliceLength).concat(MS.Entertainment.Utilities.SignedInUser._paddingForPuidHash);
                        this._userAnid = finalString
                    }
                    catch(e) {
                        MS.Entertainment.Utilities.fail("Failed to hash anid " + e);
                        return null
                    }
                    return finalString
                }, refresh: function refresh(signInProvider, doNotUpdatePropertyCache) {
                    var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    if ((signInProvider || configurationManager.social.useClientData) && MS.Entertainment.Utilities.isGamesApp)
                        this.nativeUserModel = this._createNativeUserModel();
                    else
                        this.nativeUserModel = [null];
                    this._userAnid = null;
                    if (signInProvider) {
                        this.gamerTag = signInProvider.gamerTag;
                        this.xuid = signInProvider.xuid;
                        this.locale = signInProvider.locale;
                        this.isParentallyControlled = signInProvider.parentallyControlled;
                        this.hasExplicitPrivilege = signInProvider.explicitPrivilege;
                        this.pointsBalance = signInProvider.pointsBalance;
                        this.zestAccountType = signInProvider.accountType;
                        this.isSubscription = signInProvider.isSubscription;
                        this.membershipLevel = signInProvider.membershipLevel;
                        this.meteringCertificate = signInProvider.meteringCertificate;
                        this.signInName = signInProvider.signInName;
                        this._userPuid = signInProvider.id;
                        this.canSignOut = signInProvider.canSignOut;
                        this.isTunerActivated = signInProvider.isTunerActivated;
                        this.isTunerActivatable = signInProvider.isTunerActivatable
                    }
                    else {
                        this.gamerTag = String.empty;
                        this.xuid = String.empty;
                        this.locale = String.empty;
                        this.isParentallyControlled = false;
                        this.hasExplicitPrivilege = false;
                        this.pointsBalance = 0;
                        this.zestAccountType = String.empty;
                        this.isSubscription = false;
                        this.membershipLevel = String.empty;
                        this.hasAvatar = false;
                        this.meteringCertificate = String.empty;
                        this.signInName = String.empty;
                        this._userPuid = null;
                        this.canSignOut = false;
                        this.isTunerActivated = false;
                        this.isTunerActivatable = false
                    }
                    this.avatarManifestVersion = 0;
                    if (!doNotUpdatePropertyCache)
                        this.updateLastSignedInUserPropertyCache()
                }, updateLastSignedInUserPropertyCache: function updateLastSignedInUserPropertyCache() {
                    var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    if (!configurationManager.service.enableTimeTravel) {
                        configurationManager.service.lastSignedInUserParentControl = this.isParentallyControlled;
                        configurationManager.service.lastSignedInUserSubscription = this.isSubscription;
                        configurationManager.service.lastSignedInUserMembership = MS.Entertainment.Utilities.SignedInUser.membershipStringMap[this.membershipLevel];
                        configurationManager.service.lastSignedInUserGamerTag = this.gamerTag;
                        configurationManager.service.lastSignedInUserXuid = this.xuid;
                        configurationManager.service.lastSignedInUserSignInName = this.signInName
                    }
                }
        }, {
            factory: function factory() {
                return new MS.Entertainment.Utilities.SignedInUser
            }, _instanceCount: 0, _initialPuidLength: 16, _anidSliceLength: 24, _paddingForPuidHash: "FFFFFFFF", _encodedMaterialLength: 66, membershipStringMap: {
                    None: "None", Silver: "Free", Gold: "Gold", FamilyGold: "FamilyGold"
                }
        })});
    MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.signedInUser, MS.Entertainment.Utilities.SignedInUser.factory, true);
    WinJS.Namespace.define("MS.Entertainment.Utilities", {SignIn: MS.Entertainment.defineObservable(function SignIn_constructor() {
            MS.Entertainment.Utilities.SignIn._instanceCount++;
            MS.Entertainment.Utilities.assert(MS.Entertainment.Utilities.SignIn._instanceCount === 1, "Use MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn)");
            this._signInProvider = new Microsoft.Entertainment.Util.SignIn;
            this._liveIdChangeCompleteHandler = this._liveIdChangeCompleteHandler.bind(this);
            Object.defineProperty(this, "appNotificationService", {get: function _getAppNotificationService() {
                    if (!this._appNotificationService)
                        this._appNotificationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appNotification);
                    return this._appNotificationService
                }.bind(this)})
        }, {
            isSignedIn: false, isSigningIn: false, signInError: 0, isSigningOut: false, isSignInEnabled: true, _appNotificationService: null, _liveIdChangeTaskName: "LiveIdChange", _networkStatusBinding: null, _lastSignedInUserRegion: null, _signInStartTime: null, signIn: function signIn(dontShowErrors, dontShowAccountCreation, dontShowNotifications, dontShowCredUI, dontShowTOS) {
                    var that = this;
                    if (this.isSignedIn)
                        return WinJS.Promise.wrap(MS.Entertainment.Utilities.SignIn.SignInResult.success);
                    else if (this.isSigningIn)
                        return WinJS.Promise.wrap(MS.Entertainment.Utilities.SignIn.SignInResult.signingIn);
                    else if (this.isSigningOut)
                        return WinJS.Promise.wrap(MS.Entertainment.Utilities.SignIn.SignInResult.signingOut);
                    else {
                        this.signInError = 0;
                        this.isSigningIn = true;
                        return this._doSignIn(dontShowErrors, dontShowAccountCreation, dontShowNotifications, dontShowCredUI, dontShowTOS)
                    }
                }, _doSignIn: function _doSignIn(dontShowErrors, dontShowAccountCreation, dontShowNotifications, dontShowCredUI, dontShowTOS) {
                    if ((new Microsoft.Entertainment.Configuration.ConfigurationManager).shell.retailExperience)
                        return WinJS.Promise.as();
                    var that = this;
                    this._signInStartTime = new Date;
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    var isSignInAvailable = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.gamesSignInAvailable);
                    var stateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                    var isSupported = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.upgradeReminderDisplayer).checkAndRunUpgradeReminder(!dontShowErrors);
                    if (!isSupported || !stateService.servicesEnabled) {
                        this.isSignInEnabled = false;
                        return that._onSignInComplete(MS.Entertainment.Utilities.SignInErrors.NS_E_SIGNIN_VERSION_NOT_SUPPORTED, dontShowErrors, dontShowAccountCreation, dontShowNotifications, dontShowTOS)
                    }
                    if (!isSignInAvailable) {
                        this.isSignInEnabled = false;
                        return that._onSignInComplete(MS.Entertainment.Utilities.SignInErrors.NS_E_SIGNIN_NOT_SUPPORTED_REGION, dontShowErrors, dontShowAccountCreation, true, dontShowTOS)
                    }
                    var promptType = Microsoft.Entertainment.Util.SignInPromptType.promptIfNeeded;
                    if (dontShowCredUI)
                        promptType = Microsoft.Entertainment.Util.SignInPromptType.doNotPrompt;
                    var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                    if (uiStateService.networkStatus === MS.Entertainment.UI.NetworkStatusService.NetworkStatus.none || uiStateService.networkStatus === MS.Entertainment.UI.NetworkStatusService.NetworkStatus.localOnly)
                        return that._onSignInComplete(MS.Entertainment.Utilities.SignInErrors.NS_E_WMPIM_USEROFFLINE, dontShowErrors, dontShowAccountCreation, dontShowNotifications, dontShowTOS);
                    var globalizationManager = new Microsoft.Entertainment.Util.GlobalizationManager;
                    this._lastSignedInUserRegion = globalizationManager.getRegion();
                    return that.getPassportTicket(MS.Entertainment.Utilities.SignIn.TicketType.MBI_SSL, MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_Passport), true, promptType).then(function getPassportTicketSuccess(passportTicket) {
                            if (!(Windows.ApplicationModel.Search && MS.Entertainment.Utilities.isApp2))
                                MS.Entertainment.Utilities.assert(passportTicket, "No passport ticket");
                            that.appNotificationService.removeNotificationByCategory(MS.Entertainment.Utilities.SignIn.NotificationCategory.signInError);
                            if (!dontShowNotifications)
                                that.appNotificationService.send(new MS.Entertainment.UI.Notification({
                                    notificationType: MS.Entertainment.UI.Notification.Type.Informational, title: String.load(String.id.IDS_SIGNIN_PROGRESS), subTitle: "", moreDetails: "", icon: WinJS.UI.AppBarIcon.sync, action: null, secondaryActions: null, category: MS.Entertainment.Utilities.SignIn.NotificationCategory.signInInfo, isPersistent: true, iconClassName: MS.Entertainment.Utilities.SignIn.NotificationIconClass
                                }));
                            return that._signInInternal(passportTicket).then(function signInInternalSuccess() {
                                    that._updateAgeAndGender();
                                    if (MS.Entertainment.Utilities.isGamesApp) {
                                        that._updateProfile();
                                        Microsoft.Xbox.XboxLIVEService.refreshTokenAsync()
                                    }
                                    if (!MS.Entertainment.Utilities.isApp2) {
                                        that._unregisterLiveIdChangeEvent();
                                        that._registerLiveIdChangeEvent()
                                    }
                                    return that._onSignInComplete(MS.Entertainment.Utilities.SignIn.SignInResult.success, dontShowErrors, dontShowAccountCreation, dontShowNotifications, dontShowTOS)
                                }, function signInInternalError(err) {
                                    return that._onSignInComplete(err.number, dontShowErrors, dontShowAccountCreation, dontShowNotifications, dontShowTOS)
                                })
                        }, function getPassportTicketError(errTicket) {
                            return that._onSignInComplete(errTicket.number, dontShowErrors, dontShowAccountCreation, dontShowNotifications, dontShowTOS)
                        })
                }, _registerLiveIdChangeEvent: function _registerLiveIdChangeEvent() {
                    var trigger = new Windows.ApplicationModel.Background.SystemTrigger(Windows.ApplicationModel.Background.SystemTriggerType.onlineIdConnectedStateChange, false);
                    var taskBuilder = new Windows.ApplicationModel.Background.BackgroundTaskBuilder;
                    taskBuilder.name = this._liveIdChangeTaskName;
                    taskBuilder.taskEntryPoint = "LiveIdChange.js";
                    taskBuilder.setTrigger(trigger);
                    var task = taskBuilder.register();
                    task.addEventListener("completed", this._liveIdChangeCompleteHandler)
                }, _unregisterLiveIdChangeEvent: function _unregisterLiveIdChangeEvent() {
                    var iterator = Windows.ApplicationModel.Background.BackgroundTaskRegistration.allTasks.first();
                    var hasCurrentTask = iterator.hasCurrent;
                    while (hasCurrentTask) {
                        var currentTask = iterator.current.value;
                        if (currentTask.name === this._liveIdChangeTaskName)
                            currentTask.unregister(true);
                        hasCurrentTask = iterator.moveNext()
                    }
                }, _liveIdChangeCompleteHandler: function _liveIdChangeCompleteHandler() {
                    this.signOut()
                }, signInOnStart: function signInOnStart() {
                    var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    return this.signIn(true, false, false, true, false).then(null, function signInError(){})
                }, signOut: function signOut(forceSignOut, persistUserDB, dontShowNotifications) {
                    var that = this;
                    if (that.isSigningOut)
                        return WinJS.Promise.wrap(MS.Entertainment.Utilities.SignIn.SignInResult.signingOut);
                    that.isSigningOut = true;
                    var signOutComplete = function signOutComplete(signOutResult, dontShowNotifications) {
                            if (that.isSignedIn) {
                                that.isSignedIn = false;
                                that.signInError = MS.Entertainment.Utilities.SignInErrors.ZEST_E_SIGNIN_REQUIRED;
                                that.isSigningIn = false;
                                (new Microsoft.Entertainment.Configuration.ConfigurationManager).generalSettings.alwaysPromptOnPurchase = true;
                                (new Microsoft.Entertainment.Configuration.ConfigurationManager).generalSettings.promptOnPurchaseFirstRun = true;
                                var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                                signedInUser.refresh(null);
                                MS.Entertainment.Utilities.SignIn.dispatchEvent("signOutComplete", true)
                            }
                            that.isSigningOut = false;
                            if (that._refreshSignInPromise) {
                                that._refreshSignInPromise.cancel();
                                that._refreshSignInPromise = null
                            }
                            if (!dontShowNotifications) {
                                var signInAction = WinJS.Utilities.markSupportedForProcessing(function() {
                                        that.signIn()
                                    });
                                that.appNotificationService.send(new MS.Entertainment.UI.Notification({
                                    notificationType: MS.Entertainment.UI.Notification.Type.Critical, title: String.load(String.id.IDS_SIGNIN_NOTIFICATION_SIGNIN_TITLE), subTitle: String.load(String.id.IDS_SIGNIN_NOTIFICATION_SIGNIN_TEXT), moreDetails: null, icon: WinJS.UI.AppBarIcon.sync, action: signInAction, secondaryActions: null, category: MS.Entertainment.Utilities.SignIn.NotificationCategory.signInError, isPersistent: false
                                }))
                            }
                            if (!forceSignOut) {
                                that._lastSignedInUserRegion = null;
                                var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                                configurationManager.service.lastSignInAccountRegion = ""
                            }
                            var signOutResultText = signOutResult;
                            if (typeof signOutResult === "number")
                                signOutResultText = "0x" + (signOutResult + 0xFFFFFFFF + 1).toString(16);
                            var dataPoint = new Microsoft.Entertainment.Platform.Logging.DataPoint(Microsoft.Entertainment.Platform.Logging.LoggingLevel.telemetry);
                            dataPoint.appendEventName("SignOut");
                            dataPoint.appendParameter("signOutResult", signOutResultText);
                            dataPoint.appendParameter("forceSignOut", forceSignOut);
                            dataPoint.write();
                            return signOutResult
                        };
                    if (this.isSignedIn || forceSignOut)
                        return this._signOutInternal(persistUserDB).then(function(signIn) {
                                return signOutComplete(MS.Entertainment.Utilities.SignIn.SignInResult.success, dontShowNotifications)
                            }, function(err) {
                                return signOutComplete(err.number, dontShowNotifications)
                            });
                    else {
                        that.isSigningOut = false;
                        return WinJS.Promise.wrap()
                    }
                }, getPassportTicket: function getPassportTicket(policy, service, ignoreSignInState, promptType) {
                    var upgradeService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.upgradeReminderDisplayer);
                    if ((this.isSignedIn && !upgradeService.upgradeRequired) || ignoreSignInState)
                        return this._getPassportTicketInternal(policy, service, ignoreSignInState, promptType).then(function(passport) {
                                if (passport)
                                    return passport.passportTicket
                            });
                    else
                        return WinJS.Promise.wrapError(null)
                }, getAuthHeader: function getAuthHeader() {
                    var upgradeService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.upgradeReminderDisplayer);
                    if (this.isSignedIn && !upgradeService.upgradeRequired)
                        return this._getAuthHeaderInternal().then(function complete(result) {
                                return result
                            }.bind(this), function error(err) {
                                this._sendXSTSTelemetry(err.number);
                                return WinJS.Promise.wrapError(err)
                            }.bind(this));
                    else
                        return WinJS.Promise.wrapError(null)
                }, setIsSignInSupported: function setIsSignInSupported(isSupported) {
                    this._signInProvider.isSignInSupported = isSupported
                }, _sendXSTSTelemetry: function _sendXSTSTelemetry(result) {
                    var authHeaderResultText = result;
                    if (typeof result === "number")
                        authHeaderResultText = "0x" + (result + 0xFFFFFFFF + 1).toString(16);
                    var dataPoint = new Microsoft.Entertainment.Platform.Logging.DataPoint(Microsoft.Entertainment.Platform.Logging.LoggingLevel.telemetry);
                    dataPoint.appendEventName("AuthHeaderResult");
                    dataPoint.appendParameter("authHeaderResult", authHeaderResultText);
                    dataPoint.write()
                }, refreshSignInState: function refreshSignInState() {
                    return this._doSignIn(true, true, true, true, true)
                }, _onSignInComplete: function _onSignInComplete(signInResult, dontShowErrors, dontShowAccountCreation, dontShowNotifications, dontShowTOS) {
                    this.isSigningIn = false;
                    this.isSignedIn = this._signInProvider.isSignedIn();
                    if (this.isSignedIn) {
                        this.signInError = 0;
                        if (!dontShowNotifications)
                            this.appNotificationService.send(new MS.Entertainment.UI.Notification({
                                notificationType: MS.Entertainment.UI.Notification.Type.Informational, title: String.load(String.id.IDS_SIGNIN_COMPLETE), subTitle: "", moreDetails: null, icon: WinJS.UI.AppBarIcon.contact, action: null, secondaryActions: null, category: MS.Entertainment.Utilities.SignIn.NotificationCategory.signInInfo, isPersistent: false
                            }));
                        this.appNotificationService.removeNotificationByCategory(MS.Entertainment.Utilities.SignIn.NotificationCategory.signInError)
                    }
                    else {
                        this.appNotificationService.removeNotificationByCategory(MS.Entertainment.Utilities.SignIn.NotificationCategory.signInInfo);
                        this.signInError = signInResult
                    }
                    if (this.isSignedIn) {
                        var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                        signedInUser.refresh(this._signInProvider);
                        MS.Entertainment.Utilities.SignIn.dispatchEvent("signInComplete", true)
                    }
                    this._sendTelemetry(signInResult);
                    var that = this;
                    switch (signInResult) {
                        case MS.Entertainment.Utilities.SignIn.SignInResult.success:
                            var globalizationManager = new Microsoft.Entertainment.Util.GlobalizationManager;
                            var userXboxRegion = globalizationManager.getRegion();
                            if (this._lastSignedInUserRegion !== userXboxRegion)
                                if (this._checkUserRegionIsSupported(userXboxRegion))
                                    MS.Entertainment.UI.Shell.showMessageBox(String.load(String.id.IDS_SIGNIN_MIXED_REGION_ERROR_TITLE), String.load(String.id.IDS_SIGNIN_MIXED_REGION_ERROR_DESC));
                                else {
                                    this.appNotificationService.removeNotificationByCategory(MS.Entertainment.Utilities.SignIn.NotificationCategory.signInInfo);
                                    this.signInError = MS.Entertainment.Utilities.SignInErrors.NS_E_SIGNIN_NOT_SUPPORTED_REGION;
                                    this._lastSignedInUserRegion = null;
                                    var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                                    configurationManager.service.lastSignInAccountRegion = String.empty;
                                    if (!dontShowErrors)
                                        return MS.Entertainment.UI.Shell.showError(String.load(String.id.IDS_SIGNIN_ERROR_CAPTION), MS.Entertainment.Utilities.SignInErrors.NS_E_SIGNIN_NOT_SUPPORTED_REGION).then(function showSignInErrorComplete() {
                                                that.signOut(true, true, dontShowNotifications);
                                                return MS.Entertainment.Utilities.SignInErrors.NS_E_SIGNIN_NOT_SUPPORTED_REGION
                                            });
                                    else {
                                        this.signOut(true, true, dontShowNotifications);
                                        return WinJS.Promise.wrapError(MS.Entertainment.Utilities.SignInErrors.NS_E_SIGNIN_NOT_SUPPORTED_REGION)
                                    }
                                }
                            that._refreshSignIn();
                            return WinJS.Promise.wrap(signInResult);
                            break;
                        case MS.Entertainment.Utilities.SignInErrors.XONLINE_E_WCMUSIC_ACCOUNT_NOT_PROVISIONED:
                            if (!dontShowAccountCreation)
                                return MS.Entertainment.Accounts.CreateAccount.doCreateAccount().then(function createAccountComplete() {
                                        return that.signIn(true, true, false, true, true)
                                    });
                            else {
                                this.signOut(true, true, dontShowNotifications);
                                return WinJS.Promise.wrapError(signInResult)
                            }
                            break;
                        case MS.Entertainment.Utilities.SignInErrors.NS_E_SIGNIN_TERMS_OF_SERVICE:
                            if (!dontShowTOS)
                                return MS.Entertainment.Accounts.AcceptTermsOfService.doAcceptTermsOfService().then(function acceptTermsOfServiceComplete() {
                                        return that.signIn(true, true, false, true, true)
                                    });
                            else {
                                this.signOut(true, true);
                                return WinJS.Promise.wrapError(signInResult)
                            }
                            break;
                        case MS.Entertainment.Utilities.SignInErrors.NS_E_SIGNIN_VERSION_NOT_SUPPORTED:
                            break;
                        case MS.Entertainment.Utilities.SignInErrors.NO_CONNECTED_ACCOUNT:
                            var signInAction = WinJS.Utilities.markSupportedForProcessing(function() {
                                    that.signIn()
                                });
                            that.appNotificationService.send(new MS.Entertainment.UI.Notification({
                                notificationType: MS.Entertainment.UI.Notification.Type.Critical, title: String.load(String.id.IDS_SIGNIN_NOTIFICATION_SIGNIN_TITLE), subTitle: String.load(String.id.IDS_SIGNIN_NOTIFICATION_SIGNIN_TEXT), moreDetails: null, icon: WinJS.UI.AppBarIcon.sync, action: signInAction, secondaryActions: null, category: MS.Entertainment.Utilities.SignIn.NotificationCategory.signInError, isPersistent: false
                            }));
                            var persistUserDB = true;
                            var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                            if (configurationManager.service.lastSignedInUserGamerTag && configurationManager.service.lastSignedInUserGamerTag !== String.empty)
                                persistUserDB = false;
                            var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                            signedInUser.refresh(null);
                            this.signOut(true, persistUserDB, true);
                            break;
                        case MS.Entertainment.Utilities.SignInErrors.ERROR_NETWORK_UNREACHABLE:
                        case MS.Entertainment.Utilities.SignInErrors.INET_E_RESOURCE_NOT_FOUND:
                        case MS.Entertainment.Utilities.SignInErrors.NS_E_WMPIM_USEROFFLINE:
                        case MS.Entertainment.Utilities.SignInErrors.INET_E_DOWNLOAD_FAILURE:
                        case MS.Entertainment.Utilities.SignInErrors.INET_E_CONNECTION_TIMEOUT:
                        case MS.Entertainment.Utilities.SignInErrors.XBL_SERVER_CONNECTION_FAILURE:
                            this._networkStatusBinding = WinJS.Binding.bind(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState), {networkStatus: this._onNetworkStatusChanged.bind(this)});
                            if (!dontShowErrors)
                                return MS.Entertainment.UI.Shell.showError(String.load(String.id.IDS_SIGNIN_ERROR_CAPTION), MS.Entertainment.Utilities.SignInErrors.NS_E_WMPIM_USEROFFLINE).then(function showSignInErrorComplete() {
                                        return signInResult
                                    });
                            else
                                return WinJS.Promise.wrapError(signInResult);
                            break;
                        case MS.Entertainment.Utilities.SignInErrors.NS_E_SIGNIN_NOT_SUPPORTED_REGION:
                            if (!dontShowErrors)
                                return MS.Entertainment.UI.Shell.showError(String.load(String.id.IDS_SIGNIN_ERROR_CAPTION), signInResult).then(function showSignInErrorComplete() {
                                        that.signOut(true, true, dontShowNotifications);
                                        return signInResult
                                    });
                            else {
                                this.signOut(true, true, dontShowNotifications);
                                return WinJS.Promise.wrapError(signInResult)
                            }
                            break;
                        case MS.Entertainment.Utilities.SignInErrors.NS_E_INVALID_USERNAME_AND_PASSWORD:
                            return this.signIn();
                            break;
                        case MS.Entertainment.Utilities.SignInErrors.NS_E_NO_ACCOUNT_PROOF:
                        case MS.Entertainment.Utilities.SignInErrors.NS_E_ACCOUNT_PROOF_NOT_VERIFIED:
                            return this.signIn();
                            break;
                        case MS.Entertainment.Utilities.SignInErrors.ZUNE_E_SIGNIN_ERROR_CANCELLED:
                            var that = this;
                            var signInAction = WinJS.Utilities.markSupportedForProcessing(function() {
                                    that.signIn()
                                });
                            this.appNotificationService.send(new MS.Entertainment.UI.Notification({
                                notificationType: MS.Entertainment.UI.Notification.Type.Critical, title: String.load(String.id.IDS_SIGNIN_ERROR), subTitle: String.load(String.id.IDS_SIGNIN_RETRY), moreDetails: null, icon: WinJS.UI.AppBarIcon.sync, action: signInAction, secondaryActions: null, category: MS.Entertainment.Utilities.SignIn.NotificationCategory.signInError, isPersistent: false
                            }));
                            return WinJS.Promise.wrapError(signInResult);
                        default:
                            var that = this;
                            var signInAction = WinJS.Utilities.markSupportedForProcessing(function() {
                                    that.signIn()
                                });
                            this.appNotificationService.send(new MS.Entertainment.UI.Notification({
                                notificationType: MS.Entertainment.UI.Notification.Type.Critical, title: String.load(String.id.IDS_SIGNIN_ERROR), subTitle: String.load(String.id.IDS_SIGNIN_RETRY), moreDetails: null, icon: WinJS.UI.AppBarIcon.sync, action: signInAction, secondaryActions: null, category: MS.Entertainment.Utilities.SignIn.NotificationCategory.signInError, isPersistent: false
                            }));
                            this.signOut(true, true);
                            if (!dontShowErrors)
                                return MS.Entertainment.UI.Shell.showError(String.load(String.id.IDS_SIGNIN_ERROR_CAPTION), signInResult).then(function showSignInErrorComplete() {
                                        return signInResult
                                    });
                            else
                                return WinJS.Promise.wrapError(signInResult);
                            break
                    }
                    return WinJS.Promise.wrapError(signInResult)
                }, _checkUserRegionIsSupported: function _checkUserRegionIsSupported(userRegion) {
                    var config = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    var supportedRegions = config.features.gamesSignInAvailable;
                    var isSignInSupported = true;
                    if (supportedRegions.toLowerCase().indexOf(userRegion.toLowerCase()) < 0)
                        isSignInSupported = false;
                    return isSignInSupported
                }, _onNetworkStatusChanged: function _onNetworkStatusChanged(newValue) {
                    switch (newValue) {
                        case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.unknown:
                        case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.unrestricted:
                        case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.throttled:
                            if (!this.isSignedIn)
                                WinJS.Promise.timeout(400).then(function _delay() {
                                    this.signIn(true, true, false, true, true).done(function success() {
                                        this._networkStatusBinding.cancel()
                                    }.bind(this), function error() {
                                        this._networkStatusBinding.cancel()
                                    }.bind(this))
                                }.bind(this));
                            break
                    }
                }, _launchStore: function _launchStore() {
                    var launchInfo = "ms-windows-store:Updates";
                    var appAction = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.launchApp);
                    appAction.automationId = MS.Entertainment.UI.AutomationIds.launchAppStoreUpgrade;
                    appAction.parameter = {
                        uri: launchInfo, appendSource: true, appendGamerTag: false
                    };
                    appAction.execute()
                }, _updateProfile: function _updateProfile()
                {
                    try {
                        Microsoft.Xbox.XboxLIVEService.invalidateCacheGroup(Microsoft.Xbox.CacheGroup.profile)
                    }
                    catch(e) {}
                    var user = new Microsoft.Xbox.User;
                    user.getProfileAsync().then(function profileComplete(profile) {
                        var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                        signedInUser.hasAvatar = profile.hasAvatar;
                        signedInUser.updateLastSignedInUserPropertyCache()
                    })
                }, _updateAgeAndGender: function _updateAgeAndGender() {
                    var that = this;
                    return this.getPassportTicket(MS.Entertainment.Utilities.SignIn.TicketType.HBI, MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_PassportTicket), true).then(function getPassportTicketSuccess(passportTicket) {
                            MS.Entertainment.Utilities.assert(passportTicket, "No passport ticket");
                            return that._updateAgeAndGenderInternal(passportTicket).then(function complete(model) {
                                    var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                                    signedInUser.membershipLevel = model.membershipLevel;
                                    signedInUser.updateLastSignedInUserPropertyCache();
                                    var dataPoint = new Microsoft.Entertainment.Platform.Logging.DataPoint(Microsoft.Entertainment.Platform.Logging.LoggingLevel.telemetry);
                                    dataPoint.appendEventName("SignIn");
                                    dataPoint.appendParameter("LiveMembershipLevel", signedInUser.membershipLevel);
                                    dataPoint.write()
                                })
                        })
                }, _refreshSignIn: function _refreshSignIn() {
                    var refreshInterval = MS.Entertainment.Utilities.SignIn.SIGNIN_REFRESH_INTERVAL;
                    if (this._refreshSignInPromise) {
                        this._refreshSignInPromise.cancel();
                        this._refreshSignInPromise = null
                    }
                    this._refreshSignInPromise = WinJS.Promise.timeout(refreshInterval).then(function _silentSignIn() {
                        var eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Service;
                        eventProvider.traceServiceRefreshSignInStarted();
                        this._doSignIn(true, true, true, true, true).then(function success() {
                            eventProvider.traceServiceRefreshSignInCompleted();
                            MS.Entertainment.Utilities.SignIn.dispatchEvent("signInRefreshed", true);
                            this._signInProvider.clearTokenMap()
                        }.bind(this), function error(signInResult) {
                            MS.Entertainment.Utilities.assert(false, "Refresh SignIn failed with error result: " + signInResult);
                            this._signInProvider.clearTokenMap();
                            this._networkStatusBinding = WinJS.Binding.bind(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState), {networkStatus: this._onNetworkStatusChanged.bind(this)})
                        }.bind(this))
                    }.bind(this))
                }, _signInInternal: function _signInInternal(passportTicket) {
                    var asyncSignInOp = null;
                    try {
                        asyncSignInOp = this._signInProvider.signInUser(passportTicket)
                    }
                    catch(err) {
                        return WinJS.Promise.wrapError(err)
                    }
                    return asyncSignInOp
                }, _signOutInternal: function _signOutInternal(persistUserDB) {
                    var asyncSignInOp = null;
                    try {
                        asyncSignInOp = this._signInProvider.signOut(persistUserDB || false)
                    }
                    catch(err) {
                        return WinJS.Promise.wrapError(err)
                    }
                    return asyncSignInOp
                }, _getPassportTicketInternal: function _getPassportTicketInternal(policy, service, ignoreSignInState, promptType) {
                    var asyncSignInOp = null;
                    if (!promptType)
                        promptType = Microsoft.Entertainment.Util.SignInPromptType.promptIfNeeded;
                    try {
                        asyncSignInOp = this._signInProvider.getTicket(policy, service, ignoreSignInState, promptType)
                    }
                    catch(err) {
                        return WinJS.Promise.wrapError(err)
                    }
                    return asyncSignInOp
                }, _getAuthHeaderInternal: function _getAuthHeaderInternal() {
                    var asyncAuthHeaderOp = null;
                    try {
                        asyncAuthHeaderOp = this._signInProvider.getAuthHeader()
                    }
                    catch(err) {
                        return WinJS.Promise.wrapError(err)
                    }
                    return asyncAuthHeaderOp
                }, _getAuthDataInternal: function _getAuthDataInternal(url) {
                    var asyncSignInOp = null;
                    try {
                        asyncSignInOp = this._signInProvider.getAuthenticatedUrl(url)
                    }
                    catch(err) {
                        return WinJS.Promise.wrapError(err)
                    }
                    return asyncSignInOp
                }, _updateAgeAndGenderInternal: function _updateAgeAndGenderInternal(passportTicket) {
                    var asyncSignInOp = null;
                    try {
                        asyncSignInOp = this._signInProvider.updateAgeAndGender(passportTicket)
                    }
                    catch(err) {
                        return WinJS.Promise.wrapError(err)
                    }
                    return asyncSignInOp
                }, _sendTelemetry: function _sendTelemetry(signInResult) {
                    var signInResultText = signInResult;
                    if (typeof signInResult === "number")
                        signInResultText = "0x" + (signInResult + 0xFFFFFFFF + 1).toString(16);
                    var eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell;
                    eventProvider.traceSignInResult(signInResultText);
                    var dataPoint = new Microsoft.Entertainment.Platform.Logging.DataPoint(Microsoft.Entertainment.Platform.Logging.LoggingLevel.telemetry);
                    dataPoint.appendEventName("SignIn");
                    dataPoint.appendParameter("SignInResult", signInResultText);
                    switch (signInResult) {
                        case MS.Entertainment.Utilities.SignIn.SignInResult.success:
                            var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                            dataPoint.appendParameter("ZunePass", signedInUser.isSubscription);
                            dataPoint.appendParameter("CanSignOut", signedInUser.canSignOut);
                            break;
                        case MS.Entertainment.Utilities.SignInErrors.NO_CONNECTED_ACCOUNT:
                            dataPoint.appendParameter("NoConnectedAccount", true);
                            break;
                        case MS.Entertainment.Utilities.SignInErrors.XONLINE_E_WCMUSIC_ACCOUNT_NOT_PROVISIONED:
                            dataPoint.appendParameter("CreateAccount", true);
                            break;
                        case MS.Entertainment.Utilities.SignInErrors.NS_E_SIGNIN_TERMS_OF_SERVICE:
                            dataPoint.appendParameter("AcceptTermsOfService", true);
                            break;
                        default:
                            break
                    }
                    var stopTime = new Date;
                    var durationMsec = stopTime.valueOf() - this._signInStartTime.valueOf();
                    dataPoint.appendParameter("SignInDuration", durationMsec.toString());
                    dataPoint.write()
                }
        }, {
            factory: function factory() {
                return new MS.Entertainment.Utilities.SignIn
            }, TicketType: {
                    MBI: "MBI", MBI_SSL: "MBI_SSL", HBI: "HBI", SA_20MIN: "SA_20MIN"
                }, SignInResult: {
                    success: "success", cancel: "cancel", signingIn: "signingIn", signingOut: "signingOut"
                }, NotificationCategory: {
                    signInError: "signInError", signInInfo: "signInInfo"
                }, NotificationIconClass: "rotate360Animation", _instanceCount: 0, listeners: null, SIGNIN_REFRESH_INTERVAL: 3 * 3600 * 1000, addEventListener: function(eventType, listener, capture) {
                    if (MS.Entertainment.Utilities.SignIn.listeners === null) {
                        var ListenerType = WinJS.Class.mix(WinJS.Class.define(null), WinJS.Utilities.eventMixin);
                        MS.Entertainment.Utilities.SignIn.listeners = new ListenerType
                    }
                    MS.Entertainment.Utilities.SignIn.listeners.addEventListener(eventType, listener, capture)
                }, dispatchEvent: function(eventType, details) {
                    if (MS.Entertainment.Utilities.SignIn.listeners !== null)
                        return MS.Entertainment.Utilities.SignIn.listeners.dispatchEvent(eventType, details)
                }, removeEventListener: function(eventType, listener, capture) {
                    MS.Entertainment.Utilities.SignIn.listeners.removeEventListener(eventType, listener, capture)
                }
        })});
    MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.signIn, MS.Entertainment.Utilities.SignIn.factory, true);
    WinJS.Namespace.define("MS.Entertainment.UI.Actions", {signIn: MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function signInAction() {
            this.base()
        }, {
            executed: function executed() {
                var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                return signIn.signIn()
            }, canExecute: function canExecute(param) {
                    return true
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.UI.Actions", {signInRequiredNavigate: MS.Entertainment.derive(MS.Entertainment.UI.Actions.navigate, function signInRequiredNavigate_constructor() {
            this.base();
            MS.Entertainment.Utilities.SignIn.addEventListener("signInComplete", this.requeryCanExecute.bind(this), false);
            MS.Entertainment.Utilities.SignIn.addEventListener("signOutComplete", this.requeryCanExecute.bind(this), false)
        }, {canExecute: function signInRequiredNavigate_canExecute(param) {
                var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                return (signIn.isSignedIn || configurationManager.social.useClientData)
            }})});
    WinJS.Namespace.define("MS.Entertainment.UI.Actions", {signInAndOnlineRequiredNavigate: MS.Entertainment.derive(MS.Entertainment.UI.Actions.signInRequiredNavigate, function signInAndOnlineRequiredNavigate_constructor() {
            this.base();
            this._networkStatusBinding = WinJS.Binding.bind(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState), {networkStatus: this.onNetworkStatusChanged.bind(this)})
        }, {
            _networkStatusBinding: null, _isOnline: null, canExecute: function signInAndOnlineRequiredNavigate_canExecute(param) {
                    var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                    var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    return ((signIn.isSignedIn || configurationManager.social.useClientData) && this._isOnline)
                }, onNetworkStatusChanged: function onNetworkStatusChanged(newValue) {
                    var isOnline = this.isNetworkStatusCodeOnline(newValue);
                    if (isOnline !== this._isOnline)
                        this._isOnline = isOnline
                }, isNetworkStatusCodeOnline: function isNetworkStatusCodeOnline(status) {
                    var isOnline = false;
                    switch (status) {
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
                }
        })});
    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.signIn, function() {
        return new MS.Entertainment.UI.Actions.signIn
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.signInRequiredNavigate, function() {
        return new MS.Entertainment.UI.Actions.signInRequiredNavigate
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.signInAndOnlineRequiredNavigate, function() {
        return new MS.Entertainment.UI.Actions.signInAndOnlineRequiredNavigate
    })
})()
