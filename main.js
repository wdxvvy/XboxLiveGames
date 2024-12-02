/* Copyright (C) Microsoft Corporation. All rights reserved. */
WinJS.strictProcessing();
WinJS.Binding.optimizeBindingReferences = true;
scriptValidator();
MS.Entertainment.Utilities.updateHtmlDirectionAttribute();
MS.Entertainment.UI.Framework.unblockCriticalPreloading();
MS.Entertainment.UI.Framework.enableAutoControlCleanup();
MS.Entertainment.UI.Framework.enableSetImmediateBatching();
var drmIndividualized = false;
var individualizationWorker = null;
var appDisplayName = "";
(function() {
    var applicationLifetimeManager = null;
    var commonEventProvider = null;
    var tileManager = null;
    var initialized = false;
    var alreadyHandledLaunch = false;
    var stageTwoInitialized = false;
    var stageThreeInitialized = false;
    var stageFourInitialized = false;
    var stageFourDelay = 5000;
    var stageFourTimer = null;
    WinJS.Application.onerror = function(error) {
        try {
            MS.Entertainment.Instrumentation.PerfTrack.disableAllStartupScenarios()
        }
        catch(e) {}
        if (MS.Entertainment.handleError && MS.Entertainment.handleError(error))
            return true;
        else if (error.detail && error.detail.promise) {
            if (error.detail.exception && error.detail.exception.stack)
                MS.Entertainment.fail("Unhandled error in a promise. Error exception was:" + error.detail.exception + "." + "\n Stack: " + error.detail.exception.stack);
            else {
                var detailedErrorInfo;
                if (error.detail.error) {
                    detailedErrorInfo = {
                        errorCode: error.detail.error.errorCode, description: error.detail.error.description
                    };
                    if (error.detail.error.asyncOpSource)
                        detailedErrorInfo.asyncOpSourceStack = error.detail.error.asyncOpSource.stack
                }
                MS.Entertainment.fail("Unhandled error in a promise. Error exception was:" + error.detail.exception + "." + "\n Error was:" + error.detail.error + "." + "\n Detailed Error Info was: " + JSON.stringify(detailedErrorInfo) + ".")
            }
            return true
        }
        return false
    };
    WinJS.Namespace.define("MS.Entertainment.UI.Application", {Activation: WinJS.Class.define(null, null, {
            activated: function activated(e) {
                if (e.arguments === "RetailExperience")
                    (new Microsoft.Entertainment.Configuration.ConfigurationManager).shell.retailExperience = true;
                WinJS.Application.start();
                if (!commonEventProvider)
                    commonEventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Common;
                commonEventProvider.traceProcessInitializeEventStart();
                var startTime = new Date;
                if (!applicationLifetimeManager)
                    applicationLifetimeManager = new Microsoft.Entertainment.ApplicationLifetimeManager;
                applicationLifetimeManager.raiseActivated(e);
                var isFirstRun = !initialized;
                var isSupported = true;
                if (!initialized) {
                    var className;
                    if (MS.Entertainment.UI.FileTransferNotificationHandlers) {
                        MS.Entertainment.UI.fileTransferNotificationHandler = new MS.Entertainment.UI.FileTransferNotificationHandlers;
                        MS.Entertainment.UI.fileTransferNotificationHandler.startTransferListener()
                    }
                    MS.Entertainment.appMode = (new Microsoft.Entertainment.Application.Application).init();
                    var stateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                    var currentPackage = Windows.ApplicationModel.Package.current;
                    var currentVersion = currentPackage.id.version;
                    var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    var minVersionSupported;
                    var minServiceVersionSupported;
                    if (MS.Entertainment.Utilities.isGamesApp) {
                        appDisplayName = String.load(String.id.IDS_MANIFEST_GAMES_APP_NAME);
                        className = "games";
                        stateService.applicationTitle = String.load(String.id.IDS_GAMES_APP_TITLE);
                        minVersionSupported = MS.Entertainment.Utilities.parseVersionString(configurationManager.fue.minGamesAppSupportedVersion);
                        minServiceVersionSupported = MS.Entertainment.Utilities.parseVersionString(configurationManager.service.minGamesServiceSupportedVersion);
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        if (!featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.gamesSignInAvailable))
                            isSupported = false
                    }
                    else if (MS.Entertainment.Utilities.isTestApp) {
                        appDisplayName = "test";
                        className = "test";
                        minVersionSupported = MS.Entertainment.Utilities.parseVersionString("1.0.0.0");
                        minServiceVersionSupported = MS.Entertainment.Utilities.parseVersionString("1.0.0.0")
                    }
                    else
                        className = String.empty;
                    var versionSupported = (MS.Entertainment.Utilities.compareVersions(currentVersion, minVersionSupported) >= 0);
                    stateService.servicesEnabled = (MS.Entertainment.Utilities.compareVersions(currentVersion, minServiceVersionSupported) >= 0);
                    if (!versionSupported) {
                        WinJS.Promise.timeout().then(function _delay() {
                            window.location.href = "UpdateApp.html"
                        });
                        MS.Entertainment.Instrumentation.PerfTrack.disableAllStartupScenarios();
                        return
                    }
                    WinJS.Utilities.addClass(document.body, className);
                    if (MS.Entertainment.Utilities.isApp2)
                        document.body.addEventListener("keydown", function(e) {
                            if (e.keyCode === WinJS.Utilities.Key.invokeButton || (!e.altKey && e.keyCode === WinJS.Utilities.Key.enter && !MS.Entertainment.Utilities.doesElementSupportKeyboardInput(e.target))) {
                                if (document.activeElement && document.activeElement.click && e.target && e.target.tagName) {
                                    document.activeElement.click();
                                    e.stopPropagation();
                                    e.preventDefault()
                                }
                            }
                            else if ((e.keyCode === WinJS.Utilities.Key.resetFocus) || (e.altKey && e.keyCode === WinJS.Utilities.Key.f))
                                MS.Entertainment.UI.Framework.resetFocusToTopMostContent()
                        }, false);
                    initialized = true
                }
                else
                    MS.Entertainment.Instrumentation.PerfTrack.disableAllStartupScenarios();
                var stopTime = new Date;
                var duration = stopTime.valueOf() - startTime.valueOf();
                commonEventProvider.traceProcessInitializeEventStop(duration);
                MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.userTimeTelemetryManager).appActivated();
                var doActivate = function doActivate(evt) {
                        var navigationService;
                        var eventKind;
                        var PlatLog = Microsoft.Entertainment.Platform.Logging;
                        var dataPoint = new PlatLog.DataPoint(PlatLog.LoggingLevel.telemetry, PlatLog.TelemetryAuthMethod.unauthenticated);
                        dataPoint.appendEventName("X8Run");
                        dataPoint.appendParameter("ClientResolution", screen.width + "x" + screen.height);
                        try {
                            eventKind = evt.kind
                        }
                        catch(e) {
                            var error = e && e.detail && e.detail.error;
                            var description = e && e.detail && e.detail.exception;
                            MS.Entertainment.fail("Exception while trying to determine the activation kind. Error exception was:" + description + "." + "\n Error was:" + error);
                            return
                        }
                        if (eventKind === Windows.ApplicationModel.Activation.ActivationKind.launch && !evt.uri && evt.arguments)
                            eventKind = Windows.ApplicationModel.Activation.ActivationKind.protocol;
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).activationKind = eventKind;
                        switch (eventKind) {
                            case Windows.ApplicationModel.Activation.ActivationKind.protocol:
                                MS.Entertainment.UI.Application.Helpers.showExtendedSplashScreen(evt.splashScreen);
                                MS.Entertainment.UI.Application.Activation.activateStageTwo();
                                var appView = Windows.UI.ViewManagement.ApplicationView;
                                var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                                if (uiStateService.isSnapped)
                                    appView.tryUnsnap();
                                MS.Entertainment.UI.Application.Activation.activateStageThree();
                                if (!evt.uri && evt.arguments)
                                    dataPoint.appendParameter("StartedFrom", "Deeplink");
                                else
                                    dataPoint.appendParameter("StartedFrom", "Tile");
                                if (!MS.Entertainment.UI.DeepLink.processProtocol((evt.uri && evt.uri.rawUri), dataPoint, evt.arguments)) {
                                    MS.Entertainment.Instrumentation.PerfTrack.disableAllStartupScenarios();
                                    var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                                    navigationService.clearBackStackOnNextNavigate(false);
                                    if (!navigationService.currentPage)
                                        navigationService.init();
                                    else
                                        MS.Entertainment.UI.Application.Helpers.removeExtendedSplashScreen()
                                }
                                else
                                    MS.Entertainment.UI.Application.Helpers.removeExtendedSplashScreen();
                                break;
                            case Windows.ApplicationModel.Activation.ActivationKind.launch:
                                if (alreadyHandledLaunch)
                                    return;
                                alreadyHandledLaunch = true;
                                MS.Entertainment.UI.Application.Helpers.showExtendedSplashScreen(evt.splashScreen);
                                MS.Entertainment.UI.Application.Activation.activateStageTwo();
                                navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                                navigationService.skipEnterAnimationOnNextNavigation = true;
                                navigationService.init();
                                dataPoint.appendParameter("StartedFrom", "Tile");
                                break;
                            case Windows.ApplicationModel.Activation.ActivationKind.search:
                                MS.Entertainment.UI.Application.Helpers.showExtendedSplashScreen(evt.splashScreen);
                                MS.Entertainment.UI.Application.Activation.activateStageTwo();
                                MS.Entertainment.UI.Application.Activation.activateStageThree();
                                var handled = false;
                                if (evt && evt.queryText) {
                                    MS.Entertainment.ViewModels.SearchContractViewModel.init();
                                    if (MS.Entertainment.ViewModels.SearchContractViewModel.current)
                                        handled = MS.Entertainment.ViewModels.SearchContractViewModel.current.searchKeywordSubmitted(evt)
                                }
                                if (!handled)
                                    if (!MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).currentPage)
                                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).init();
                                dataPoint.appendParameter("StartedFrom", "Deeplink");
                                dataPoint.appendParameter("DeeplinkSource", "Search");
                                break
                        }
                        {};
                        MS.Entertainment.UI.Application.Helpers.activationTelemetryData = dataPoint
                    };
                if (MS.Entertainment.Utilities.isGamesApp && !isSupported) {
                    MS.Entertainment.UI.Application.Helpers.showExtendedSplashScreen(e.splashScreen);
                    MS.Entertainment.FeatureEnablement.initialize();
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    var onFeaturesChanged = function onFeaturesChanged() {
                            isSupported = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.gamesSignInAvailable);
                            MS.Entertainment.FeatureEnablement.setFeaturesChangedCallback(null);
                            if (!isSupported) {
                                window.location.href = "UnsupportedApp.html";
                                return
                            }
                            else
                                doActivate(e)
                        };
                    MS.Entertainment.FeatureEnablement.setFeaturesChangedCallback(onFeaturesChanged);
                    featureEnablement.checkForNewFeatures()
                }
                else
                    doActivate(e)
            }, resuming: function resuming(e) {
                    if (!commonEventProvider)
                        commonEventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Common;
                    commonEventProvider.traceProcessResumeEventStart();
                    var startTime = new Date;
                    if (!applicationLifetimeManager)
                        applicationLifetimeManager = new Microsoft.Entertainment.ApplicationLifetimeManager;
                    applicationLifetimeManager.raiseResuming();
                    if (tileManager)
                        tileManager.updateTile();
                    commonEventProvider.traceProcessResumeTelemetryStart();
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.userTimeTelemetryManager).appResumed();
                    commonEventProvider.traceProcessResumeTelemetryStop();
                    MS.Entertainment.Instrumentation.PerfTrack.onResuming();
                    var stopTime = new Date;
                    var duration = stopTime.valueOf() - startTime.valueOf();
                    commonEventProvider.traceProcessResumeEventStop(duration)
                }, suspending: function suspending(e) {
                    if (!commonEventProvider)
                        commonEventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Common;
                    commonEventProvider.traceProcessSuspendEventStart();
                    var startTime = new Date;
                    if (!applicationLifetimeManager)
                        applicationLifetimeManager = new Microsoft.Entertainment.ApplicationLifetimeManager;
                    applicationLifetimeManager.raiseSuspending();
                    commonEventProvider.traceProcessSuspendTelemetryStart();
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.userTimeTelemetryManager).appSuspended();
                    commonEventProvider.traceProcessSuspendTelemetryStop();
                    MS.Entertainment.Instrumentation.PerfTrack.onSuspending();
                    var stopTime = new Date;
                    var duration = stopTime.valueOf() - startTime.valueOf();
                    commonEventProvider.traceProcessSuspendEventStop(duration)
                }, unload: function unload(e) {
                    var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    if (sessionMgr)
                        sessionMgr.displayRequestRelease();
                    var app = new Microsoft.Entertainment.Application.Application;
                    app.shutdownAsync();
                    window.removeEventListener("unload", MS.Entertainment.UI.Application.Activation.unload)
                }, activateStageTwo: function activateStageTwo() {
                    if (stageTwoInitialized)
                        return;
                    stageTwoInitialized = true;
                    MS.Entertainment.UI.Components.Shell.initializeSnappedMode();
                    var handlers = MS.Entertainment.InformationArchitecture.getIAHandlersForAppId(MS.Entertainment.appMode);
                    var iaService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.informationArchitecture);
                    handlers(iaService);
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.networkStatus);
                    MS.Entertainment.FeatureEnablement.initialize();
                    if (MS.Entertainment.Utilities.isGamesApp) {
                        WinJS.UI.process(MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appInfoNotification)).then(function(control) {
                            control.delayedInitialize()
                        });
                        var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                        signIn.signInOnStart()
                    }
                }, activateStageThree: function activateStageThree() {
                    var _delayTimerMS = 50;
                    if (stageThreeInitialized)
                        return;
                    stageThreeInitialized = true;
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dashboardRefresher).initialize();
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.backButton);
                    document.addEventListener("MSPointerUp", function mouseClickHandler(event) {
                        if (event.button === 3) {
                            var navigateBackAction = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.navigate);
                            navigateBackAction.automationId = MS.Entertainment.UI.AutomationIds.mouseNavigateBack;
                            navigateBackAction.parameter = MS.Entertainment.UI.Actions.navigate.NavigateLocation.back;
                            navigateBackAction.execute()
                        }
                    });
                    MS.Entertainment.ViewModels.SearchContractViewModel.init();
                    if (MS.Entertainment.ViewModels.SearchContractViewModel.current)
                        MS.Entertainment.ViewModels.SearchContractViewModel.current.loadSearchObject();
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.typeToSearch).enableTypeToSearch();
                    MS.Entertainment.Framework.KeyboardInteractionListener.init();
                    MS.Entertainment.UI.Shell.createShellKeyboardShortcuts();
                    var sender = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.shareSender);
                    sender.setDefaultEmptyMessage();
                    MS.Entertainment.UI.PurchaseHistoryService.initialize();
                    WinJS.Promise.timeout(_delayTimerMS).then(function delay1() {
                        return WinJS.UI.process(MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appInfoNotification)).then(function(control) {
                                if (control)
                                    control.delayedInitialize()
                            })
                    }).then(function loadCriticalNotification() {
                        return WinJS.UI.process(MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appCriticalNotification)).then(function(control) {
                                control.delayedInitialize()
                            })
                    }).then(function delay2() {
                        if ((new Microsoft.Entertainment.Configuration.ConfigurationManager).shell.retailExperience)
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appNotification).send(new MS.Entertainment.UI.Notification({
                                notificationType: MS.Entertainment.UI.Notification.Type.Informational, title: String.load(String.id.IDS_DEMO_IN_DEMO_MODE), subTitle: "", moreDetails: "", action: null, secondaryActions: null, category: "demo", isPersistent: true
                            }));
                        return WinJS.Promise.timeout(_delayTimerMS).then(function loadAppBar() {
                                tileManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.tileManager);
                                MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar).deferredInit()
                            }).then(function delay3() {
                                return WinJS.Promise.timeout(_delayTimerMS).then(function signIn() {
                                        if (!MS.Entertainment.Utilities.isGamesApp) {
                                            var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                                            return signIn.signInOnStart()
                                        }
                                        else
                                            return WinJS.Promise.wrap()
                                    })
                            }).then(function delay4() {
                                stageFourTimer = WinJS.Promise.timeout(stageFourDelay).then(MS.Entertainment.UI.Application.Activation.activateStageFour)
                            })
                    })
                }, activateStageFour: function activateStageFour() {
                    if (stageFourInitialized)
                        return;
                    stageFourInitialized = true;
                    MS.Entertainment.UI.Framework.unblockPreloading()
                }
        })});
    Windows.UI.WebUI.WebUIApplication.addEventListener("activated", MS.Entertainment.UI.Application.Activation.activated);
    Windows.UI.WebUI.WebUIApplication.addEventListener("resuming", MS.Entertainment.UI.Application.Activation.resuming);
    Windows.UI.WebUI.WebUIApplication.addEventListener("suspending", MS.Entertainment.UI.Application.Activation.suspending);
    window.addEventListener("unload", MS.Entertainment.UI.Application.Activation.unload, false);
    WinJS.Namespace.define("MS.Entertainment.UI.Application", {Helpers: WinJS.Class.define(null, null, {
            splashScreenCleared: function splashScreenCleared() {
                (new Microsoft.Entertainment.Instrumentation.Providers.Shell).traceSplashScreen_Removed()
            }, activationTelemetryData: null, windowResizeSplashScreenHandler: null, showExtendedSplashScreen: function showExtendedSplashScreen(splashDetails) {
                    var splashScreenImage = document.querySelector(".extendedSplashScreenImage");
                    var splashScreenProgressContainer = document.querySelector(".extendedSplashScreenProgressContainer");
                    if (!splashScreenImage)
                        return;
                    MS.Entertainment.UI.Application.Helpers.windowResizeSplashScreenHandler = function() {
                        try {
                            splashScreenImage.style.top = splashDetails.imageLocation.y + "px";
                            splashScreenImage.style.left = splashDetails.imageLocation.x + "px";
                            splashScreenImage.style.height = splashDetails.imageLocation.height + "px";
                            splashScreenImage.style.width = splashDetails.imageLocation.width + "px";
                            splashScreenProgressContainer.style.marginTop = splashDetails.imageLocation.y + splashDetails.imageLocation.height + 32 + "px"
                        }
                        catch(e) {
                            MS.Entertainment.fail("Exception trying to get splash screen information: " + e.toString())
                        }
                    };
                    MS.Entertainment.UI.Application.Helpers.windowResizeSplashScreenHandler();
                    window.addEventListener("resize", MS.Entertainment.UI.Application.Helpers.windowResizeSplashScreenHandler)
                }, updateExtendedSplashScreenMessage: function updateExtendedSplashScreenMessage(title, message) {
                    var splashScreenTitle = document.querySelector(".extendedSplashScreenTitle");
                    var splashScreenMessage = document.querySelector(".extendedSplashScreenMessage");
                    if (splashScreenTitle)
                        splashScreenTitle.innerText = title;
                    if (splashScreenMessage)
                        splashScreenMessage.innerText = message
                }, waitForDatabaseUpdated: function waitForDatabaseUpdated() {
                    var mediaStore;
                    var promise;
                    if (MS.Entertainment.Utilities.isMusicApp)
                        mediaStore = new Microsoft.Entertainment.Platform.MediaStore;
                    if (mediaStore && mediaStore.databaseNeedsUpgrade) {
                        var query;
                        var waitTitle = String.load(String.id.IDS_APP_UPDATE_SPLASH_TITLE);
                        var waitMessage = String.load(String.id.IDS_APP_UPDATE_SPLASH_SUBTITLE);
                        if (waitTitle.indexOf("{0}") >= 0)
                            waitTitle = waitTitle.format(String.load(String.id.IDS_FEATURE_ENABLEMENT_NOTIFICATION_HEADER));
                        if (waitMessage.indexOf("{0}") >= 0)
                            waitMessage = waitMessage.format(String.load(String.id.IDS_MUSIC_SCAN_MATCH_SONGS_MATCHED_NOTIFICATION_LINE_2));
                        MS.Entertainment.UI.Application.Helpers.updateExtendedSplashScreenMessage(waitTitle, waitMessage);
                        promise = mediaStore.ensureDatabaseOpenedAsync().then(null, function ignoreError(){})
                    }
                    return WinJS.Promise.as(promise)
                }, _inProgressRemoveExtendedSplashScreen: false, removeExtendedSplashScreen: function removeExtendedSplashScreen() {
                    if (MS.Entertainment.UI.Application.Helpers._inProgressRemoveExtendedSplashScreen)
                        return;
                    MS.Entertainment.UI.Application.Helpers._inProgressRemoveExtendedSplashScreen = true;
                    MS.Entertainment.UI.Application.Helpers.waitForDatabaseUpdated().done(function databaseUpdateFinishedOrNotNeeded() {
                        MS.Entertainment.UI.Application.Helpers._inProgressRemoveExtendedSplashScreen = false;
                        var extendedSplashScreen = document.querySelector(".extendedSplashScreen");
                        var configManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        var delayAppShow = MS.Entertainment.Utilities.isMusicApp2 && configManager.music.showWelcomeDialog;
                        if (extendedSplashScreen) {
                            window.removeEventListener("resize", MS.Entertainment.UI.Application.Helpers.windowResizeSplashScreenHandler);
                            MS.Entertainment.UI.Application.Helpers.windowResizeSplashScreenHandler = null;
                            extendedSplashScreen.parentElement.removeChild(extendedSplashScreen);
                            var unsnappedElement = document.getElementById("htmlUnsnapped");
                            var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                            if (unsnappedElement && !uiStateService.isSnapped && !delayAppShow)
                                WinJS.Utilities.removeClass(unsnappedElement, "hideFromDisplay");
                            var currentPage = document.querySelector(".pageContainer.currentPage");
                            if (currentPage) {
                                MS.Entertainment.Utilities.enterElement(currentPage).done(function() {
                                    MS.Entertainment.UI.Framework.setFocusRoot(currentPage)
                                });
                                if (MS.Entertainment.Utilities.isApp2) {
                                    WinJS.Utilities.addClass(document.activeElement, "acc-keyboardFocusTarget");
                                    WinJS.Utilities.addClass(document.documentElement, "showKeyboardFocus")
                                }
                            }
                            else {
                                var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                                navigationService.skipEnterAnimationOnNextNavigation = false
                            }
                            if (delayAppShow)
                                MS.Entertainment.Music.Music2WelcomeDialog.show().done(function onDialogDismissed() {
                                    if (unsnappedElement && !uiStateService.isSnapped) {
                                        WinJS.Utilities.removeClass(unsnappedElement, "hideFromDisplay");
                                        configManager.music.showWelcomeDialog = false;
                                        var dashboardElement = document.querySelector(".currentPage .navigationHost.dashboardHost");
                                        if (dashboardElement && dashboardElement.winControl && dashboardElement.winControl.focusHome)
                                            dashboardElement.winControl.focusHome()
                                    }
                                })
                        }
                    })
                }, visibilityChanged: function visibilityChanged() {
                    var isVisible = !document.hidden;
                    if (!commonEventProvider)
                        commonEventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Common;
                    commonEventProvider.traceAppVisibilityChanged(isVisible);
                    var freezeThawTargets = [];
                    var pageContainer;
                    var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                    uiStateService.isAppVisible = !document.hidden;
                    var freezeThawPageContainer = function freezeThawPageContainer() {
                            pageContainer = document.getElementById("pageContainer");
                            if (pageContainer && pageContainer.childElementCount > 0)
                                (function() {
                                    var target = document.querySelector("#pageContainer .currentPage");
                                    MS.Entertainment.assert(target, "Didn't find the current page to thaw");
                                    if (target)
                                        freezeThawTargets.push(target)
                                })();
                            var overlays = document.querySelectorAll(".overlayAnchor");
                            if (overlays)
                                Array.prototype.forEach.call(overlays, function(overlay) {
                                    freezeThawTargets.push(overlay)
                                })
                        };
                    if (!uiStateService.isSnapped)
                        freezeThawPageContainer();
                    else
                        (function() {
                            var target = document.querySelector("#htmlSnapped");
                            if (WinJS.Utilities.hasClass(target, "hideFromDisplay"))
                                freezeThawPageContainer();
                            else {
                                MS.Entertainment.assert(target, "Didn't find the current page to thaw");
                                freezeThawTargets.push(target)
                            }
                        })();
                    if (freezeThawTargets && freezeThawTargets.length)
                        if (document.hidden)
                            freezeThawTargets.forEach(function(freezeThawTarget) {
                                MS.Entertainment.Utilities.freezeControlsInSubtree(freezeThawTarget)
                            });
                        else
                            freezeThawTargets.forEach(function(freezeThawTarget) {
                                MS.Entertainment.Utilities.thawControlsInSubtree(freezeThawTarget)
                            });
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.userTimeTelemetryManager).appVisibilityChanged();
                    try {
                        var mediaStore = new Microsoft.Entertainment.Platform.MediaStore;
                        mediaStore.prepareDatabaseForSuspend(!isVisible)
                    }
                    catch(e) {}
                }, handleDashboardVisible: function handleDashboardVisible() {
                    MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioAppLaunch();
                    if (!MS.Entertainment.Utilities.isApp2) {
                        var appBar = document.querySelector(".bottomAppBar");
                        WinJS.Utilities.removeClass(appBar, "removeFromDisplay")
                    }
                    document.removeEventListener("HubStripVisible", MS.Entertainment.UI.Application.Helpers.handleDashboardVisible);
                    MS.Entertainment.UI.Application.Helpers.removeExtendedSplashScreen()
                }, handleDashboardReady: function handleDashboardReady() {
                    document.removeEventListener("HubStripReady", MS.Entertainment.UI.Application.Helpers.handleDashboardReady);
                    MS.Entertainment.UI.Framework.setImmediateMode = MS.Entertainment.UI.Framework.setImmediateModes.normal;
                    if (MS.Entertainment.UI.Application.Helpers.activationTelemetryData) {
                        MS.Entertainment.UI.Application.Helpers.activationTelemetryData.write();
                        MS.Entertainment.UI.Application.Helpers.activationTelemetryData = null
                    }
                    WinJS.Promise.timeout().then(function _delayHandleDashboardReady() {
                        MS.Entertainment.UI.Application.Activation.activateStageThree()
                    })
                }, rejectImageDrags: function rejectImageDrags(event) {
                    if (event.target.tagName === "IMG")
                        event.preventDefault()
                }, navigateBack: function navigateBack() {
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigateBack()
                }, reloadNowPlaying: function reloadNowPlaying() {
                    var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    var isSubscription = configurationManager.service.lastSignedInUserSubscription;
                    var firstFreeStringsLaunch = configurationManager.music.firstFreeStringsLaunch && !isSubscription;
                    var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    if (!firstFreeStringsLaunch && MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).activationKind === Windows.ApplicationModel.Activation.ActivationKind.launch && !MS.Entertainment.Platform.PlaybackHelpers.playActionInitiated && (!sessionMgr.nowPlayingSession || sessionMgr.nowPlayingSession.currentMedia === null)) {
                        var query = new MS.Entertainment.Data.Query.libraryPlaylists;
                        query.playlistType = Microsoft.Entertainment.Queries.PlaylistType.nowPlaying;
                        query.chunkSize = 1;
                        query.execute().then(function loadPlaylist(query) {
                            if (query.result.totalCount > 0)
                                query.result.items.toArray(0, 1).then(function playPlaylist(playlist) {
                                    if (playlist.length >= 1 && playlist[0].count > 0 && !MS.Entertainment.Platform.PlaybackHelpers.playActionInitiated && (!sessionMgr.nowPlayingSession || sessionMgr.nowPlayingSession.currentMedia === null)) {
                                        var mediaItemsQuery = new MS.Entertainment.Data.Query.libraryPlaylistMediaItems;
                                        mediaItemsQuery.playlistId = playlist[0].libraryId;
                                        var onPlayerStateChanged = function onPlayerStateChanged(currentPlayerState) {
                                                if (!currentPlayerState)
                                                    return;
                                                if (currentPlayerState === MS.Entertainment.Platform.Playback.PlayerState.notReady) {
                                                    if (!MS.Entertainment.Platform.PlaybackHelpers.playActionInitiated) {
                                                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.adService).skipAudioAdForNextTrack = true;
                                                        MS.Entertainment.Platform.PlaybackHelpers.playMedia2(mediaItemsQuery, {
                                                            autoPlay: true, setOnly: true, saveNowPlaying: false, showAppBar: false, queueMedia: true, showImmersive: false
                                                        })
                                                    }
                                                }
                                                else if (currentPlayerState === MS.Entertainment.Platform.Playback.PlayerState.error)
                                                    MS.Entertainment.UI.Controls.BottomAppBar.suppressNextPlaybackErrorDialog = true;
                                                sessionMgr.primarySession.unbind("playerState", onPlayerStateChanged)
                                            };
                                        var primarySessionIdChanged = function primarySessionIdChanged() {
                                                if (sessionMgr.primarySession) {
                                                    sessionMgr.primarySession.bind("playerState", onPlayerStateChanged);
                                                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).unbind("primarySessionId", primarySessionIdChanged)
                                                }
                                            };
                                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).bind("primarySessionId", primarySessionIdChanged)
                                    }
                                    else
                                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).engageVisible = true
                                });
                            else
                                MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).engageVisible = true
                        })
                    }
                    else
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).engageVisible = true;
                    if (firstFreeStringsLaunch)
                        configurationManager.music.firstFreeStringsLaunch = false
                }
        })});
    Object.defineProperty(window, "helpers", {get: function() {
            return MS.Entertainment.UI.Application.Helpers
        }});
    Object.defineProperty(window, "mnp", {get: function() {
            return MS.Entertainment.UI.Controls.MusicVisualization
        }});
    Object.defineProperty(window, "ccn", {get: function() {
            return MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.collectionChangeNotifier)
        }});
    document.addEventListener("visibilitychange", MS.Entertainment.UI.Application.Helpers.visibilityChanged, false);
    document.addEventListener("HubStripVisible", MS.Entertainment.UI.Application.Helpers.handleDashboardVisible);
    document.addEventListener("HubStripReady", MS.Entertainment.UI.Application.Helpers.handleDashboardReady);
    document.addEventListener("dragstart", MS.Entertainment.UI.Application.Helpers.rejectImageDrags, true);
    MS.Entertainment.Utilities.processAllOnDocumentLoaded().then(function mainLoaded() {
        (new Microsoft.Entertainment.Instrumentation.Providers.Shell).traceFinish_ProcessAll()
    })
})()
