/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js");
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {WebHostPurchasePrompt: MS.Entertainment.UI.Framework.defineUserControl("Controls/WebHost.html#webHostPurchasePromptTemplate", function webHostPurchasePromptConstructor(element, options){}, {
        initialize: function initialize() {
            this.promptOnPurchase.title = String.load(String.id.IDS_SETTINGS_PROMPT_TOGGLE_TITLE);
            this.promptOnPurchase.checked = (new Microsoft.Entertainment.Configuration.ConfigurationManager).generalSettings.alwaysPromptOnPurchase
        }, submit: function submit() {
                (new Microsoft.Entertainment.Configuration.ConfigurationManager).generalSettings.alwaysPromptOnPurchase = this.promptOnPurchase.checked
            }
    }, {description: null})});
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {WebHost: MS.Entertainment.UI.Framework.defineUserControl("Controls/WebHost.html#webHostTemplate", function(element, options) {
        this._signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
        this._eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell;
        this.onIFrameLoadHandler = this.onIFrameLoad.bind(this);
        this.onReadyStateChangeHandler = this.onReadyStateChange.bind(this)
    }, {
        _webIFrame: null, _authWithCTP: true, _signIn: null, _eventProvider: null, _loadAuthenticatedUrlOnInitialize: false, _initialized: false, _signInBound: false, _hasValidTicket: false, _signedInOnStart: false, _parentOverlay: null, onIFrameLoadHandler: null, onReadyStateChangeHandler: null, title: null, sourceUrl: null, authenticatedSourceUrl: null, webHostExperienceFactory: null, webHostExperience: null, cancelListener: null, finishedListener: null, errorListener: null, showBackButton: false, showCancelButton: false, isDialog: false, frameWidth: "100%", frameHeight: "100%", signInOverride: false, taskId: String.empty, onMessage: null, timer: null, isSettingsFlow: false, skipPurchasePrompt: false, setOverlay: function setOverlay(instance) {
                this._parentOverlay = instance
            }, onSessionTimeout: function onSessionTimeout() {
                var that = this;
                WinJS.Promise.timeout().then(function() {
                    var buttons = [{
                                title: String.load(String.id.IDS_YES_BUTTON), isEnabled: true, isAvailable: true, execute: function onYes(overlay) {
                                        overlay.hide();
                                        that.loadAuthenticatedUrl()
                                    }
                            }, {
                                title: String.load(String.id.IDS_NO_BUTTON), isEnabled: true, isAvailable: true, execute: function onNo(overlay) {
                                        overlay.hide();
                                        if (that.webHostExperience && that.webHostExperience.cancelReceived)
                                            that.webHostExperience.cancelReceived();
                                        if (that.cancelListener)
                                            that.cancelListener()
                                    }
                            }];
                    MS.Entertainment.UI.Shell.showMessageBox(String.load(String.id.IDS_DIALOG_SESSION_TIMED_OUT_TITLE), String.load(String.id.IDS_DIALOG_SESSION_TIMED_OUT_MESSAGE), {
                        buttons: buttons, defaultButtonIndex: 0, cancelButtonIndex: 1
                    })
                })
            }, onIFrameLoad: function onIFrameLoad() {
                if (this.timer) {
                    window.clearTimeout(this.timer);
                    var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    this.timer = window.setTimeout(this.onTimerHandler.bind(this), configurationManager.shell.webBlendLoadTimeoutMS)
                }
                if (this._webIFrame && this._webIFrame.contentWindow)
                    this._webIFrame.contentWindow.focus()
            }, onReadyStateChange: function onReadyStateChange() {
                var readyStateProperty;
                try {
                    readyStateProperty = this._webIFrame.readyState
                }
                catch(e) {
                    return
                }
                if (readyStateProperty && readyStateProperty === "loading") {
                    if (this._webHostWaitCursor && this._webIFrame) {
                        this._webHostWaitCursor.isBusy = true;
                        WinJS.UI.Animation.fadeOut(this._webIFrame)
                    }
                }
                else if (readyStateProperty && readyStateProperty === "interactive") {
                    window.clearTimeout(this.timer);
                    var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    this.timer = window.setTimeout(this.onTimerHandler.bind(this), configurationManager.shell.webBlendLoadTimeoutMS)
                }
            }, onErrorHandler: function onErrorHandler(errorCode) {
                if (this._unloaded)
                    return;
                if (this._webHostWaitCursor)
                    this._webHostWaitCursor.isBusy = false;
                if (this.timer) {
                    window.clearTimeout(this.timer);
                    this.timer = null
                }
                if (this._eventProvider)
                    this._eventProvider.traceWebExperience_Error(this.currentUrl, errorCode);
                var dataPoint = new Microsoft.Entertainment.Platform.Logging.DataPoint(Microsoft.Entertainment.Platform.Logging.LoggingLevel.telemetry);
                dataPoint.appendEventName("WebBlendError");
                dataPoint.appendParameter("currentPage", this.currentUrl);
                dataPoint.appendParameter("taskId", this.taskId);
                dataPoint.appendParameter("errorCode", errorCode);
                dataPoint.write();
                if (this.webHostExperience && this.webHostExperience.errorReceived)
                    this.webHostExperience.errorReceived(errorCode);
                if (this.errorListener)
                    this.errorListener(errorCode)
            }, onTimerHandler: function onTimerHandler() {
                if (this.timer && this._hasValidTicket) {
                    window.clearTimeout(this.timer);
                    this.timer = null;
                    if (!this._unloaded)
                        this.onErrorHandler(0x80070461)
                }
            }, loadAuthenticatedUrl: function loadAuthenticatedUrl() {
                if (!this._initialized) {
                    this._loadAuthenticatedUrlOnInitialize = true;
                    return
                }
                if (this._webHostWaitCursor)
                    this._webHostWaitCursor.isBusy = true;
                if (this.signInOverride)
                    this._loadAuthenticatedUrlOnSignIn();
                else {
                    this._signedInOnStart = this._signIn.isSignedIn;
                    var container = document.querySelector(".webHostOverlayContainer");
                    if (container)
                        WinJS.Utilities.addClass(container, "hideFromDisplay");
                    this._signIn.signIn().then(function(value) {
                        if (value === MS.Entertainment.Utilities.SignIn.SignInResult.success)
                            this._loadAuthenticatedUrlOnSignIn();
                        else if (value === MS.Entertainment.Utilities.SignIn.SignInResult.cancel) {
                            if (this._webHostWaitCursor)
                                this._webHostWaitCursor.isBusy = false;
                            if (this.cancelListener)
                                this.cancelListener()
                        }
                        else {
                            if (this._webHostWaitCursor)
                                this._webHostWaitCursor.isBusy = false;
                            if (this.cancelListener)
                                this.cancelListener()
                        }
                    }.bind(this), function(err) {
                        if (this._webHostWaitCursor)
                            this._webHostWaitCursor.isBusy = false;
                        if (this.cancelListener)
                            this.cancelListener()
                    }.bind(this))
                }
            }, _loadAuthenticatedUrlOnSignIn: function _loadAuthenticatedUrlOnSignIn() {
                var url = this.authenticatedSourceUrl;
                this._webIFrame.addEventListener("load", this.onIFrameLoadHandler.bind(this));
                this._webIFrame.addEventListener("readystatechange", this.onReadyStateChangeHandler.bind(this));
                WinJS.UI.Animation.fadeOut(this._webIFrame);
                var ticketType = MS.Entertainment.Utilities.SignIn.TicketType.HBI;
                var config = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                if (config.service.enableSecureAuth)
                    ticketType = MS.Entertainment.Utilities.SignIn.TicketType.SA_20MIN;
                var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                var promptType = Microsoft.Entertainment.Util.SignInPromptType.promptIfNeeded;
                var promptedOnSignIn = !this._signedInOnStart && signedInUser.canSignOut;
                if (config.generalSettings.alwaysPromptOnPurchase && !this.isSettingsFlow && !this.skipPurchasePrompt && !promptedOnSignIn && (this.taskId !== MS.Entertainment.UI.Controls.WebHost.TaskId.CREATEACCOUNT) && (this.taskId !== MS.Entertainment.UI.Controls.WebHost.TaskId.TOU))
                    promptType = Microsoft.Entertainment.Util.SignInPromptType.retypeCredentials;
                this._signIn.getPassportTicket(ticketType, MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_PassportTicket), this.signInOverride, promptType).then(function(xboxTicket) {
                    this._firstPromptOnPurchase().then(function complete() {
                        this._hasValidTicket = true;
                        var container = document.querySelector(".webHostOverlayContainer");
                        if (container)
                            WinJS.Utilities.removeClass(container, "hideFromDisplay");
                        window.clearTimeout(this.timer);
                        this.timer = window.setTimeout(this.onTimerHandler.bind(this), config.shell.webBlendResponseTimeoutMS);
                        var skinnedUrl = this._appendWebBlendParams(url);
                        var encodedUrl = encodeURIComponent(skinnedUrl);
                        var authUrl = MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_AuthTransfer) + "/xweb/live/passport/setCookies.ashx?" + xboxTicket;
                        authUrl = this._appendWebBlendParams(authUrl) + "&rru=" + encodedUrl;
                        if (MS.Entertainment.Utilities.verifyUrl(authUrl, true)) {
                            MS.Entertainment.Instrumentation.PerfTrack.setStartTime(MS.Entertainment.Instrumentation.PerfTrack.StartPoints.WebBlendRequest);
                            this._webIFrame.src = authUrl;
                            this.currentUrl = skinnedUrl;
                            if (this._eventProvider)
                                this._eventProvider.traceWebExperience_Start(this.taskId);
                            var dataPoint = new Microsoft.Entertainment.Platform.Logging.DataPoint(Microsoft.Entertainment.Platform.Logging.LoggingLevel.telemetry);
                            dataPoint.appendEventName("WebBlendLaunch");
                            dataPoint.appendParameter("currentPage", this.currentUrl);
                            dataPoint.appendParameter("taskId", this.taskId);
                            dataPoint.write()
                        }
                        else
                            this.onErrorHandler(0x8007000B)
                    }.bind(this))
                }.bind(this), function(err) {
                    if (this._webHostWaitCursor)
                        this._webHostWaitCursor.isBusy = false;
                    if (this.cancelListener)
                        this.cancelListener()
                }.bind(this))
            }, _authenticateWithCTP: function _authenticateWithCTP() {
                if (this.taskId === MS.Entertainment.UI.Controls.WebHost.TaskId.CREATEACCOUNT)
                    return;
                var ticketType = MS.Entertainment.Utilities.SignIn.TicketType.HBI;
                var config = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                if (config.service.enableSecureAuth)
                    ticketType = MS.Entertainment.Utilities.SignIn.TicketType.SA_20MIN;
                this._signIn.getPassportTicket(ticketType, MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_CTPPassport), this.signInOverride).then(function(ctpTicket) {
                    var ctpAuthUrl = MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_CTPAuth) + "/PCSv2/X8/LIVERPS/pcs/onetimeauth?" + ctpTicket;
                    if (MS.Entertainment.Utilities.verifyUrl(ctpAuthUrl, true))
                        this._cptIFrame.src = ctpAuthUrl;
                    else
                        this.onErrorHandler(0x8007000B)
                }.bind(this), function(err) {
                    if (err)
                        this.onErrorHandler(err.number)
                }.bind(this))
            }, _firstPromptOnPurchase: function _firstPromptOnPurchase() {
                var config = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                if (config.generalSettings.promptOnPurchaseFirstRun && config.generalSettings.alwaysPromptOnPurchase && !this.isSettingsFlow && !this.skipPurchasePrompt && !MS.Entertainment.Utilities.isApp2 && (this.taskId !== MS.Entertainment.UI.Controls.WebHost.TaskId.CREATEACCOUNT) && (this.taskId !== MS.Entertainment.UI.Controls.WebHost.TaskId.TOU)) {
                    config.generalSettings.promptOnPurchaseFirstRun = false;
                    return MS.Entertainment.UI.Shell.showDialog(String.load(String.id.IDS_WEBHOST_FIRST_PURCHASE_PROMPT_TITLE), "MS.Entertainment.UI.Controls.WebHostPurchasePrompt", {
                            width: "100%", height: "410px", buttons: [WinJS.Binding.as({
                                        title: String.load(String.id.IDS_WEBHOST_FIRST_PURCHASE_PROMPT_BUTTON_NEXT), execute: function execute_next(dialog) {
                                                dialog.userControlInstance.submit();
                                                dialog.hide()
                                            }
                                    }), WinJS.Binding.as({
                                        title: String.load(String.id.IDS_CANCEL_BUTTON_TC), execute: function execute_cancel(dialog) {
                                                dialog.hide()
                                            }
                                    })], defaultButtonIndex: 0, cancelButtonIndex: 1, userControlOptions: {description: String.load(String.id.IDS_WEBHOST_FIRST_PURCHASE_PROMPT_DESCRIPTION)}
                        })
                }
                else
                    return WinJS.Promise.wrap()
            }, initialize: function initialize() {
                this.debugWebMessages = [];
                if (this.webHostExperienceFactory)
                    this.webHostExperience = this.webHostExperienceFactory();
                if (this.webHostExperience && this.webHostExperience.startListener)
                    this.webHostExperience.startListener();
                this.onMessage = function(event) {
                    if ((event.origin !== MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_AuthTransfer)) && (event.origin !== MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_CTPAuth)) && (event.origin !== "ms-appx://" + Windows.ApplicationModel.Package.current.id.name.toLowerCase()))
                        return;
                    var messageRaw = event.data;
                    if (this.debugWebMessages)
                        this.debugWebMessages.unshift(messageRaw);
                    var messageStruct;
                    var message;
                    MS.Entertainment.UI.Controls.assert(messageRaw.match(/^{/i), "Message received in non-JSON format");
                    try {
                        messageStruct = JSON.parse(messageRaw)
                    }
                    catch(error_1) {
                        return
                    }
                    var ctpMessage = (messageStruct.data && messageStruct.type === "message");
                    if (ctpMessage)
                        try {
                            messageStruct = JSON.parse(messageStruct.data);
                            if (messageStruct.method === "pcs_onsuccess") {
                                var json = JSON.stringify({
                                        message: "AUTH_RESPONSE", result: "SUCCESS"
                                    });
                                this._webIFrame.contentWindow.postMessage(json, MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_AuthTransfer))
                            }
                            else if (messageStruct.method === "pcs_onerror") {
                                var json = JSON.stringify({
                                        message: "AUTH_RESPONSE", result: "ERROR"
                                    });
                                this._webIFrame.contentWindow.postMessage(json, MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_AuthTransfer))
                            }
                            return
                        }
                        catch(error_1) {
                            return
                        }
                    if (messageStruct.Message)
                        messageStruct.message = messageStruct.Message;
                    if (messageStruct.message)
                        messageStruct.message = messageStruct.message.trim();
                    if (!messageStruct.message && !messageStruct.verb)
                        return;
                    this.convertMessage(messageStruct);
                    if (messageStruct.header.taskId !== this.taskId)
                        return;
                    var isValid = MS.Entertainment.UI.Controls.WebHostMessage.validateWebHostMessage(this.taskId, messageStruct);
                    if (!isValid)
                        return;
                    switch (messageStruct.verb) {
                        case"CLOSE_DIALOG":
                            if (messageStruct.reason !== "REJECTION")
                                if (this.timer) {
                                    window.clearTimeout(this.timer);
                                    this.timer = null
                                }
                            if (messageStruct.reason === "SUCCESS") {
                                this._eventProvider.traceWebExperience_Finish(this.title);
                                if (this.webHostExperience && this.webHostExperience.finishedReceived)
                                    this.webHostExperience.finishedReceived();
                                if (this.finishedListener)
                                    this.finishedListener()
                            }
                            else if (messageStruct.reason === "CANCEL") {
                                this._eventProvider.traceWebExperience_Cancel(this.title);
                                if (this.webHostExperience && this.webHostExperience.cancelReceived)
                                    this.webHostExperience.cancelReceived();
                                if (this.cancelListener)
                                    this.cancelListener()
                            }
                            else if (messageStruct.reason === "ERROR")
                                this.onErrorHandler(messageStruct.errorCode);
                            break;
                        case"BEGIN_NAVIGATE":
                            MS.Entertainment.Instrumentation.PerfTrack.setStartTime(MS.Entertainment.Instrumentation.PerfTrack.StartPoints.WebBlendRequest);
                            if (this._webHostWaitCursor && this.currentUrl && this.currentUrl.toLowerCase().indexOf("redeemcode") < 0)
                                this._webHostWaitCursor.isBusy = true;
                            break;
                        case"AUTH_REQUEST":
                            if (messageStruct.domain === "XBOX")
                                this.onSessionTimeout();
                            else if (messageStruct.domain === "BILLING")
                                this._authenticateWithCTP();
                            break;
                        case"NAVIGATION_ERROR":
                            if (this.timer) {
                                window.clearTimeout(this.timer);
                                this.timer = null;
                                if (this._webHostWaitCursor)
                                    this._webHostWaitCursor.isBusy = false
                            }
                            this.onErrorHandler(messageStruct.httpStatus);
                            break;
                        case"CURRENT_PAGE":
                            if (this._parentOverlay)
                                this._parentOverlay.lightDismissEnabled = false;
                            if (this._webHostWaitCursor)
                                this._webHostWaitCursor.isBusy = false;
                            if (this.timer) {
                                WinJS.UI.Animation.fadeIn(this._webIFrame);
                                window.clearTimeout(this.timer);
                                this.timer = null;
                                MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioWebBlendRequestToLoad(messageStruct.uri)
                            }
                            var url = messageStruct.uri;
                            this.currentUrl = url;
                            this._eventProvider.traceWebExperience_PageLoad(url);
                            if (this.webHostExperience && this.webHostExperience.pageLoadReceived)
                                this.webHostExperience.pageLoadReceived(url);
                            if (this._authWithCTP) {
                                this._authenticateWithCTP();
                                this._authWithCTP = false
                            }
                            break
                    }
                    if (this.webHostExperience && this.webHostExperience.messageReceived)
                        this.webHostExperience.messageReceived(messageStruct, this, function(message) {
                            if (this._webIFrame.contentWindow)
                                this._webIFrame.contentWindow.postMessage(message, MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_AuthTransfer))
                        })
                }.bind(this);
                if (this.frameWidth) {
                    this._webIFrame.style.width = this.frameWidth;
                    this._webIFrame.style.marginLeft = "calc((100% - " + this.frameWidth + ") / 2)"
                }
                if (this.frameHeight) {
                    this._webIFrame.style.height = this.frameHeight;
                    this._webIFrame.style.marginTop = "calc((100% - " + this.frameHeight + ") / 2)"
                }
                window.addEventListener("message", this.onMessage, false);
                this._onSignInChange = this._onSignInChange.bind(this);
                this._signIn.bind("isSignedIn", this._onSignInChange);
                this._initialized = true;
                this._signInBound = true;
                if (this.sourceUrl && this.sourceUrl !== "") {
                    var url = MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_XBoxLiveSSL) + "/" + this.sourceUrl;
                    this._webIFrame.src = url;
                    this.currentUrl = url;
                    this._eventProvider.traceWebExperience_Start(this.title)
                }
                else if ((this.authenticatedSourceUrl && this.authenticatedSourceUrl !== "") || (this.taskId === "TOU") || this._loadAuthenticatedUrlOnInitialize)
                    this.loadAuthenticatedUrl()
            }, convertMessage: function convertMessage(messageStruct) {
                MS.Entertainment.UI.assert(messageStruct.header && messageStruct.header.version && messageStruct.header.version.major === "1" && "The server is sending a message with an unknown version");
                if (!messageStruct.header.taskId || messageStruct.header.taskId === "OTHER")
                    messageStruct.header.taskId = this.taskId
            }, _onSignInChange: function _onSignInChange(isSignedIn) {
                if (this._signInBound && !isSignedIn && (this.taskId !== MS.Entertainment.UI.Controls.WebHost.TaskId.CREATEACCOUNT) && (this.taskId !== MS.Entertainment.UI.Controls.WebHost.TaskId.TOU)) {
                    if (this._webHostWaitCursor)
                        this._webHostWaitCursor.isBusy = false;
                    if (this.timer) {
                        window.clearTimeout(this.timer);
                        this.timer = null
                    }
                    if (this.cancelListener)
                        this.cancelListener()
                }
            }, unload: function unload() {
                window.removeEventListener("message", this.onMessage, false);
                if (this._onSignInChange)
                    this._signIn.unbind("isSignedIn", this._onSignInChange);
                this._signIn = null;
                this._eventProvider = null;
                if (this.webHostExperience) {
                    this.webHostExperience.dispose();
                    this.webHostExperience = null
                }
                this.cancelListener = null;
                this.finishedListener = null;
                this.errorListener = null;
                this._webIFrame.removeEventListener("load", this.onIFrameLoadHandler);
                this._webIFrame.removeEventListener("readystatechange", this.onReadyStateChangeHandler);
                this._webIFrame.src = null;
                this._cptIFrame.src = null;
                this._webHostWaitCursor = null;
                this.debugWebMessages = null;
                MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
            }, _appendWebBlendParams: function _appendWebBlendParams(url) {
                var webBlendParams = "skin=x8&client=x8&hev=1.0&clientRelease=X8GA";
                var clientVersionString = MS.Entertainment.Utilities.getClientVersionString();
                if (clientVersionString)
                    webBlendParams = webBlendParams + "&clientVersion=" + clientVersionString;
                var appId = "games";
                if (appId)
                    webBlendParams = webBlendParams + "&appId=" + appId;
                if ((new Microsoft.Entertainment.Configuration.ConfigurationManager).shell.applyBackgroundOnAccountCreation && (this.taskId === MS.Entertainment.UI.Controls.WebHost.TaskId.TOU || this.taskId === MS.Entertainment.UI.Controls.WebHost.TaskId.CREATEACCOUNT))
                    WinJS.Utilities.addClass(this._webIFrame, "webHostDarkBackground");
                if (this.isDialog)
                    webBlendParams = webBlendParams + "&dialog=true";
                else
                    webBlendParams = webBlendParams + "&dialog=false";
                if (url && url.indexOf("?") > -1)
                    url = url + "&" + webBlendParams;
                else
                    url = url + "?" + webBlendParams;
                return url
            }
    }, {
        currentUrl: null, debugWebMessages: []
    }, {TaskId: {
            ACCOUNT: "ACCOUNT", CREATEACCOUNT: "CREATEACCOUNT", GAME: "GAME", MUSIC: "MUSIC", SUBSCRIPTIONSIGNUP: "SUBSCRIPTIONSIGNUP", TOU: "TOU", VIDEO: "VIDEO"
        }})})
