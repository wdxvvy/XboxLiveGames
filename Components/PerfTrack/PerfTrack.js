/* Copyright (C) Microsoft Corporation. All rights reserved. */
WinJS.Namespace.define("MS.Entertainment.Instrumentation", {PerfTrack: WinJS.Class.define(null, {}, {
        StartPoints: {
            AppLaunch: "AppLaunch", PlayCommand: "PlayCommand", CollectionGalleryRequest: "CollectionGalleryRequest", SearchGalleryRequest: "SearchGalleryRequest", PopoverRequest: "PopoverRequest", MarketplaceGalleryRequest: "MarketplaceGalleryRequest", UpdateAvatarRequest: "UpdateAvatarRequest", GameActivityRequest: "GameActivityRequest", AchievementsRequest: "AchievementsRequest", FriendsRequest: "FriendsRequest", CompareGamesRequest: "CompareGamesRequest", WebBlendRequest: "WebBlendRequest", Xbox360GamesGalleryRequest: "Xbox360GamesGalleryRequest", MetroGamesGalleryRequest: "MetroGamesGalleryRequest"
        }, getLogger: (function _perfTrack_getLoggerClosure() {
                var logger = null;
                return function _perfTrack_getLoggerWorker() {
                        if (!logger)
                            logger = new Microsoft.PerfTrack.PerfTrackLogger(Microsoft.PerfTrack.PerfTrackLogger.windowsDataUploadEnabled);
                        return logger
                    }
            })(), _truncateString: function _perfTrack_truncateString(s) {
                var result = s;
                if (result && typeof(result) === "string" && result.length > 120)
                    result = result.substr(0, 120) + "[...]";
                return result
            }, _getState: (function _perfTrack_getStateClosure() {
                var startedScenarios = {};
                var fireOnceScenarios = {};
                var disabledScenarios = {};
                var disabledScenariosByDefault = {};
                var startTimes = {};
                var applicationStartTime = null;
                disabledScenariosByDefault[1318] = true;
                disabledScenariosByDefault[1319] = true;
                disabledScenariosByDefault[1320] = true;
                disabledScenariosByDefault[1321] = true;
                disabledScenariosByDefault[1322] = true;
                var actions = {
                        isStarted: function _perfTrack_getState_isStarted(scenarioId, matchKey) {
                            var result = true;
                            var result = startedScenarios.hasOwnProperty(scenarioId);
                            if (result && (matchKey !== undefined))
                                result = startedScenarios[scenarioId].hasOwnProperty(matchKey);
                            return result
                        }, onBegin: function _perfTrack_getState_onBegin(scenarioId, matchKey) {
                                if (!startedScenarios[scenarioId])
                                    startedScenarios[scenarioId] = {};
                                if (matchKey !== undefined)
                                    startedScenarios[scenarioId][matchKey] = true
                            }, onEnd: function _perfTrack_getState_onEnd(scenarioId, matchKey) {
                                if (matchKey !== undefined) {
                                    if (startedScenarios[scenarioId])
                                        delete startedScenarios[scenarioId][matchKey]
                                }
                                else
                                    delete startedScenarios[scenarioId]
                            }, isFiredOnce: function _perfTrack_getState_isFiredOnce(scenarioId, matchKey) {
                                var result = true;
                                var result = fireOnceScenarios.hasOwnProperty(scenarioId);
                                if (result && (matchKey !== undefined))
                                    result = fireOnceScenarios[scenarioId].hasOwnProperty(matchKey);
                                return result
                            }, onFiredOnce: function _perfTrack_getState_onFiredOnce(scenarioId, matchKey) {
                                if (matchKey !== undefined) {
                                    if (!fireOnceScenarios[scenarioId])
                                        fireOnceScenarios[scenarioId] = {};
                                    fireOnceScenarios[scenarioId][matchKey] = true
                                }
                                else
                                    fireOnceScenarios[scenarioId] = true
                            }, isDisabled: function _perfTrack_getState_isDisabled(scenarioId, matchKey) {
                                var result = null;
                                if (matchKey !== undefined) {
                                    if (disabledScenarios[scenarioId])
                                        result = disabledScenarios[scenarioId][matchKey]
                                }
                                else
                                    result = disabledScenarios[scenarioId];
                                if (result === null || result === undefined)
                                    result = (disabledScenariosByDefault[scenarioId] || false);
                                return result
                            }, disableScenario: function _perfTrack_getState_disableScenario(scenarioId, matchKey) {
                                if (matchKey !== undefined) {
                                    if (!disabledScenarios[scenarioId])
                                        disabledScenarios[scenarioId] = {};
                                    disabledScenarios[scenarioId][matchKey] = true
                                }
                                else
                                    disabledScenarios[scenarioId] = true
                            }, enableScenario: function _perfTrack_getState_enableScenario(scenarioId, matchKey) {
                                if (matchKey !== undefined) {
                                    if (!disabledScenarios[scenarioId])
                                        disabledScenarios[scenarioId] = {};
                                    disabledScenarios[scenarioId][matchKey] = false
                                }
                                else
                                    disabledScenarios[scenarioId] = false
                            }, cleanupDynamicEnabledDisabledFlag: function _perfTrack_getState_cleanupDynamicEnabledDisabledFlag(scenarioId, matchKey) {
                                if (matchKey !== undefined) {
                                    if (disabledScenarios[scenarioId])
                                        delete disabledScenarios[scenarioId][matchKey]
                                }
                                else
                                    delete disabledScenarios[scenarioId]
                            }, setStartTime: function _perfTrack_getState_setStartTime(startPoint, matchKey) {
                                if (startPoint)
                                    if (matchKey !== undefined) {
                                        if (!startTimes[startPoint])
                                            startTimes[startPoint] = {};
                                        startTimes[startPoint][matchKey] = new Date
                                    }
                                    else
                                        startTimes[startPoint] = new Date
                            }, deleteStartTime: function _perfTrack_getState_deleteStartTime(startPoint, matchKey) {
                                if (startPoint)
                                    if (matchKey !== undefined) {
                                        if (startTimes[startPoint])
                                            delete startTimes[startPoint][matchKey]
                                    }
                                    else
                                        delete startTimes[startPoint]
                            }, getStartTime: function _perfTrack_getState_getStartTime(startPoint, matchKey) {
                                var result = null;
                                if (startPoint) {
                                    if (matchKey !== undefined) {
                                        if (startTimes[startPoint])
                                            result = startTimes[startPoint][matchKey]
                                    }
                                    else
                                        result = startTimes[startPoint];
                                    if (!result)
                                        if (startPoint === "AppLaunch")
                                            if (applicationStartTime)
                                                result = applicationStartTime;
                                            else if (PerfTrack && PerfTrack.LaunchInformation && PerfTrack.LaunchInformation.getStartTime) {
                                                applicationStartTime = PerfTrack.LaunchInformation.getStartTime();
                                                result = applicationStartTime
                                            }
                                }
                                return result
                            }, resetStartPoints: function _perfTrack_resetStartPoints() {
                                startTimes = {}
                            }
                    };
                return function _perfTrack_getStateWorker() {
                        return actions
                    }
            })(), setStartTime: function _perfTrack_setStartTime(startPoint, matchKey) {
                var state = MS.Entertainment.Instrumentation.PerfTrack._getState();
                state.setStartTime(startPoint, matchKey)
            }, getStartTime: function _perfTrack_getStartTime(startPoint, matchKey) {
                var state = MS.Entertainment.Instrumentation.PerfTrack._getState();
                return state.getStartTime(startPoint, matchKey)
            }, getShellEventProvider: (function _perfTrack_getShellEventProviderClosure() {
                var eventProvider = null;
                return function _perfTrack_getShellEventProviderWorker() {
                        if (!eventProvider)
                            eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell;
                        return eventProvider
                    }
            })(), enableScenarioAppLaunch: function _perfTrack_enableScenarioAppLaunch() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().enableScenario(1317)
            }, disableScenarioAppLaunch: function _perfTrack_disableScenarioAppLaunch() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().disableScenario(1317)
            }, triggerScenarioAppLaunch: function _perfTrack_triggerScenarioAppLaunch() {
                var PT = MS.Entertainment.Instrumentation.PerfTrack;
                var state = PT._getState();
                if (!state.isDisabled(1317) && !state.isFiredOnce(1317)) {
                    var stopTime = new Date;
                    var startTime = state.getStartTime("AppLaunch");
                    if (startTime) {
                        PT.getShellEventProvider().tracePerfTrack_Trigger_AppLaunchCompleted();
                        var duration = ((stopTime >= startTime) ? (stopTime - startTime) : 0);
                        PT.getLogger().writeTriggerEvent(1317, "XBLW-AppLaunch", duration);
                        state.deleteStartTime("AppLaunch")
                    }
                    state.onFiredOnce(1317);
                    PT.disableAllStartupScenarios()
                }
            }, enableScenarioAppLaunchToCollection: function _perfTrack_enableScenarioAppLaunchToCollection() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().enableScenario(1318)
            }, disableScenarioAppLaunchToCollection: function _perfTrack_disableScenarioAppLaunchToCollection() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().disableScenario(1318)
            }, triggerScenarioAppLaunchToCollection: function _perfTrack_triggerScenarioAppLaunchToCollection() {
                var PT = MS.Entertainment.Instrumentation.PerfTrack;
                var state = PT._getState();
                if (!state.isDisabled(1318) && !state.isFiredOnce(1318)) {
                    var stopTime = new Date;
                    var startTime = state.getStartTime("AppLaunch");
                    if (startTime) {
                        PT.getShellEventProvider().tracePerfTrack_Trigger_AppLaunchToCollectionCompleted();
                        var duration = ((stopTime >= startTime) ? (stopTime - startTime) : 0);
                        PT.getLogger().writeTriggerEvent(1318, "XBLW-AppLaunchToCollection", duration);
                        state.deleteStartTime("AppLaunch")
                    }
                    state.onFiredOnce(1318);
                    PT.disableAllStartupScenarios()
                }
            }, enableScenarioAppLaunchPlayNonProtectedContent: function _perfTrack_enableScenarioAppLaunchPlayNonProtectedContent() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().enableScenario(1319)
            }, disableScenarioAppLaunchPlayNonProtectedContent: function _perfTrack_disableScenarioAppLaunchPlayNonProtectedContent() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().disableScenario(1319)
            }, triggerScenarioAppLaunchPlayNonProtectedContent: function _perfTrack_triggerScenarioAppLaunchPlayNonProtectedContent() {
                var PT = MS.Entertainment.Instrumentation.PerfTrack;
                var state = PT._getState();
                if (!state.isDisabled(1319) && !state.isFiredOnce(1319)) {
                    var stopTime = new Date;
                    var startTime = state.getStartTime("AppLaunch");
                    if (startTime) {
                        PT.getShellEventProvider().tracePerfTrack_Trigger_AppLaunchPlayNonProtectedContent();
                        var duration = ((stopTime >= startTime) ? (stopTime - startTime) : 0);
                        PT.getLogger().writeTriggerEvent(1319, "XBLW-AppLaunchPlayNonProtectedContent", duration);
                        state.deleteStartTime("AppLaunch")
                    }
                    state.onFiredOnce(1319);
                    PT.disableAllStartupScenarios()
                }
            }, enableScenarioAppLaunchPlayProtectedContent: function _perfTrack_enableScenarioAppLaunchPlayProtectedContent() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().enableScenario(1320)
            }, disableScenarioAppLaunchPlayProtectedContent: function _perfTrack_disableScenarioAppLaunchPlayProtectedContent() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().disableScenario(1320)
            }, triggerScenarioAppLaunchPlayProtectedContent: function _perfTrack_triggerScenarioAppLaunchPlayProtectedContent() {
                var PT = MS.Entertainment.Instrumentation.PerfTrack;
                var state = PT._getState();
                if (!state.isDisabled(1320) && !state.isFiredOnce(1320)) {
                    var stopTime = new Date;
                    var startTime = state.getStartTime("AppLaunch");
                    if (startTime) {
                        PT.getShellEventProvider().tracePerfTrack_Trigger_AppLaunchPlayProtectedContent();
                        var duration = ((stopTime >= startTime) ? (stopTime - startTime) : 0);
                        PT.getLogger().writeTriggerEvent(1320, "XBLW-AppLaunchPlayProtectedContent", duration);
                        state.deleteStartTime("AppLaunch")
                    }
                    state.onFiredOnce(1320);
                    PT.disableAllStartupScenarios()
                }
            }, enableScenarioPlayProtectedInApp: function _perfTrack_enableScenarioPlayProtectedInApp() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().enableScenario(1321)
            }, disableScenarioPlayProtectedInApp: function _perfTrack_disableScenarioPlayProtectedInApp() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().disableScenario(1321)
            }, triggerScenarioPlayProtectedInApp: function _perfTrack_triggerScenarioPlayProtectedInApp() {
                var PT = MS.Entertainment.Instrumentation.PerfTrack;
                var state = PT._getState();
                if (!state.isDisabled(1321)) {
                    var stopTime = new Date;
                    var startTime = state.getStartTime("PlayCommand");
                    if (startTime) {
                        if (stopTime >= startTime) {
                            PT.getShellEventProvider().tracePerfTrack_Trigger_PlayProtectedInAppPlaybackStarted();
                            var duration = ((stopTime >= startTime) ? (stopTime - startTime) : 0);
                            PT.getLogger().writeTriggerEvent(1321, "XBLW-PlayProtectedInApp", duration)
                        }
                        state.deleteStartTime("PlayCommand")
                    }
                }
            }, enableScenarioPlayNonProtectedInApp: function _perfTrack_enableScenarioPlayNonProtectedInApp() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().enableScenario(1322)
            }, disableScenarioPlayNonProtectedInApp: function _perfTrack_disableScenarioPlayNonProtectedInApp() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().disableScenario(1322)
            }, triggerScenarioPlayNonProtectedInApp: function _perfTrack_triggerScenarioPlayNonProtectedInApp() {
                var PT = MS.Entertainment.Instrumentation.PerfTrack;
                var state = PT._getState();
                if (!state.isDisabled(1322)) {
                    var stopTime = new Date;
                    var startTime = state.getStartTime("PlayCommand");
                    if (startTime) {
                        if (stopTime >= startTime) {
                            PT.getShellEventProvider().tracePerfTrack_Trigger_PlayNonProtectedInAppPlaybackStarted();
                            var duration = ((stopTime >= startTime) ? (stopTime - startTime) : 0);
                            PT.getLogger().writeTriggerEvent(1322, "XBLW-PlayNonProtectedInApp", duration)
                        }
                        state.deleteStartTime("PlayCommand")
                    }
                }
            }, enableScenarioCollectionGalleryRequestToLoad: function _perfTrack_enableScenarioCollectionGalleryRequestToLoad() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().enableScenario(1325)
            }, disableScenarioCollectionGalleryRequestToLoad: function _perfTrack_disableScenarioCollectionGalleryRequestToLoad() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().disableScenario(1325)
            }, triggerScenarioCollectionGalleryRequestToLoad: function _perfTrack_triggerScenarioCollectionGalleryRequestToLoad() {
                var PT = MS.Entertainment.Instrumentation.PerfTrack;
                var state = PT._getState();
                if (!state.isDisabled(1325)) {
                    var stopTime = new Date;
                    var startTime = state.getStartTime("CollectionGalleryRequest");
                    if (startTime) {
                        if (stopTime >= startTime) {
                            PT.getShellEventProvider().tracePerfTrack_Trigger_CollectionGalleryRequestToLoad();
                            var duration = ((stopTime >= startTime) ? (stopTime - startTime) : 0);
                            PT.getLogger().writeTriggerEvent(1325, "XBLW-CollectionGalleryRequestToLoad", duration)
                        }
                        state.deleteStartTime("CollectionGalleryRequest")
                    }
                }
            }, enableScenarioSearchGalleryRequestToLoad: function _perfTrack_enableScenarioSearchGalleryRequestToLoad() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().enableScenario(1326)
            }, disableScenarioSearchGalleryRequestToLoad: function _perfTrack_disableScenarioSearchGalleryRequestToLoad() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().disableScenario(1326)
            }, triggerScenarioSearchGalleryRequestToLoad: function _perfTrack_triggerScenarioSearchGalleryRequestToLoad() {
                var PT = MS.Entertainment.Instrumentation.PerfTrack;
                var state = PT._getState();
                if (!state.isDisabled(1326)) {
                    var stopTime = new Date;
                    var startTime = state.getStartTime("SearchGalleryRequest");
                    if (startTime) {
                        if (stopTime >= startTime) {
                            PT.getShellEventProvider().tracePerfTrack_Trigger_SearchGalleryRequestToLoad();
                            var duration = ((stopTime >= startTime) ? (stopTime - startTime) : 0);
                            PT.getLogger().writeTriggerEvent(1326, "XBLW-SearchGalleryRequestToLoad", duration)
                        }
                        state.deleteStartTime("SearchGalleryRequest")
                    }
                }
            }, enableScenarioPopoverRequestToLoad: function _perfTrack_enableScenarioPopoverRequestToLoad() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().enableScenario(1327)
            }, disableScenarioPopoverRequestToLoad: function _perfTrack_disableScenarioPopoverRequestToLoad() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().disableScenario(1327)
            }, triggerScenarioPopoverRequestToLoad: function _perfTrack_triggerScenarioPopoverRequestToLoad(name) {
                var PT = MS.Entertainment.Instrumentation.PerfTrack;
                var state = PT._getState();
                if (!state.isDisabled(1327)) {
                    var stopTime = new Date;
                    var startTime = state.getStartTime("PopoverRequest");
                    if (startTime) {
                        if (stopTime >= startTime) {
                            PT.getShellEventProvider().tracePerfTrack_Trigger_PopoverRequestToLoad(name);
                            var duration = ((stopTime >= startTime) ? (stopTime - startTime) : 0);
                            PT.getLogger().writeTriggerEventWithMetadata(1327, "XBLW-PopoverRequestToLoad", duration, 0, 0, 0, 0, 0, PT._truncateString(name), "")
                        }
                        state.deleteStartTime("PopoverRequest")
                    }
                }
            }, enableScenarioMarketplaceGalleryRequestToLoad: function _perfTrack_enableScenarioMarketplaceGalleryRequestToLoad() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().enableScenario(1333)
            }, disableScenarioMarketplaceGalleryRequestToLoad: function _perfTrack_disableScenarioMarketplaceGalleryRequestToLoad() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().disableScenario(1333)
            }, triggerScenarioMarketplaceGalleryRequestToLoad: function _perfTrack_triggerScenarioMarketplaceGalleryRequestToLoad() {
                var PT = MS.Entertainment.Instrumentation.PerfTrack;
                var state = PT._getState();
                if (!state.isDisabled(1333)) {
                    var stopTime = new Date;
                    var startTime = state.getStartTime("MarketplaceGalleryRequest");
                    if (startTime) {
                        if (stopTime >= startTime) {
                            PT.getShellEventProvider().tracePerfTrack_Trigger_MarketplaceGalleryRequestToLoad();
                            var duration = ((stopTime >= startTime) ? (stopTime - startTime) : 0);
                            PT.getLogger().writeTriggerEvent(1333, "XBLW-MarketplaceGalleryRequestToLoad", duration)
                        }
                        state.deleteStartTime("MarketplaceGalleryRequest")
                    }
                }
            }, enableScenarioUpdateAvatarRequestToLoad: function _perfTrack_enableScenarioUpdateAvatarRequestToLoad() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().enableScenario(1334)
            }, disableScenarioUpdateAvatarRequestToLoad: function _perfTrack_disableScenarioUpdateAvatarRequestToLoad() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().disableScenario(1334)
            }, triggerScenarioUpdateAvatarRequestToLoad: function _perfTrack_triggerScenarioUpdateAvatarRequestToLoad() {
                var PT = MS.Entertainment.Instrumentation.PerfTrack;
                var state = PT._getState();
                if (!state.isDisabled(1334)) {
                    var stopTime = new Date;
                    var startTime = state.getStartTime("UpdateAvatarRequest");
                    if (startTime) {
                        if (stopTime >= startTime) {
                            PT.getShellEventProvider().tracePerfTrack_Trigger_UpdateAvatarRequestToLoad();
                            var duration = ((stopTime >= startTime) ? (stopTime - startTime) : 0);
                            PT.getLogger().writeTriggerEvent(1334, "XBLW-UpdateAvatarRequestToLoad", duration)
                        }
                        state.deleteStartTime("UpdateAvatarRequest")
                    }
                }
            }, enableScenarioGameActivityRequestToLoad: function _perfTrack_enableScenarioGameActivityRequestToLoad() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().enableScenario(1335)
            }, disableScenarioGameActivityRequestToLoad: function _perfTrack_disableScenarioGameActivityRequestToLoad() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().disableScenario(1335)
            }, triggerScenarioGameActivityRequestToLoad: function _perfTrack_triggerScenarioGameActivityRequestToLoad() {
                var PT = MS.Entertainment.Instrumentation.PerfTrack;
                var state = PT._getState();
                if (!state.isDisabled(1335)) {
                    var stopTime = new Date;
                    var startTime = state.getStartTime("GameActivityRequest");
                    if (startTime) {
                        if (stopTime >= startTime) {
                            PT.getShellEventProvider().tracePerfTrack_Trigger_GameActivityRequestToLoad();
                            var duration = ((stopTime >= startTime) ? (stopTime - startTime) : 0);
                            PT.getLogger().writeTriggerEvent(1335, "XBLW-GameActivityRequestToLoad", duration)
                        }
                        state.deleteStartTime("GameActivityRequest")
                    }
                }
            }, enableScenarioAchievementsRequestToLoad: function _perfTrack_enableScenarioAchievementsRequestToLoad() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().enableScenario(1336)
            }, disableScenarioAchievementsRequestToLoad: function _perfTrack_disableScenarioAchievementsRequestToLoad() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().disableScenario(1336)
            }, triggerScenarioAchievementsRequestToLoad: function _perfTrack_triggerScenarioAchievementsRequestToLoad() {
                var PT = MS.Entertainment.Instrumentation.PerfTrack;
                var state = PT._getState();
                if (!state.isDisabled(1336)) {
                    var stopTime = new Date;
                    var startTime = state.getStartTime("AchievementsRequest");
                    if (startTime) {
                        if (stopTime >= startTime) {
                            PT.getShellEventProvider().tracePerfTrack_Trigger_AchievementsRequestToLoad();
                            var duration = ((stopTime >= startTime) ? (stopTime - startTime) : 0);
                            PT.getLogger().writeTriggerEvent(1336, "XBLW-AchievementsRequestToLoad", duration)
                        }
                        state.deleteStartTime("AchievementsRequest")
                    }
                }
            }, enableScenarioFriendsRequestToLoad: function _perfTrack_enableScenarioFriendsRequestToLoad() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().enableScenario(1337)
            }, disableScenarioFriendsRequestToLoad: function _perfTrack_disableScenarioFriendsRequestToLoad() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().disableScenario(1337)
            }, triggerScenarioFriendsRequestToLoad: function _perfTrack_triggerScenarioFriendsRequestToLoad() {
                var PT = MS.Entertainment.Instrumentation.PerfTrack;
                var state = PT._getState();
                if (!state.isDisabled(1337)) {
                    var stopTime = new Date;
                    var startTime = state.getStartTime("FriendsRequest");
                    if (startTime) {
                        if (stopTime >= startTime) {
                            PT.getShellEventProvider().tracePerfTrack_Trigger_FriendsRequestToLoad();
                            var duration = ((stopTime >= startTime) ? (stopTime - startTime) : 0);
                            PT.getLogger().writeTriggerEvent(1337, "XBLW-FriendsRequestToLoad", duration)
                        }
                        state.deleteStartTime("FriendsRequest")
                    }
                }
            }, enableScenarioCompareGamesRequestToLoad: function _perfTrack_enableScenarioCompareGamesRequestToLoad() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().enableScenario(1338)
            }, disableScenarioCompareGamesRequestToLoad: function _perfTrack_disableScenarioCompareGamesRequestToLoad() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().disableScenario(1338)
            }, triggerScenarioCompareGamesRequestToLoad: function _perfTrack_triggerScenarioCompareGamesRequestToLoad() {
                var PT = MS.Entertainment.Instrumentation.PerfTrack;
                var state = PT._getState();
                if (!state.isDisabled(1338)) {
                    var stopTime = new Date;
                    var startTime = state.getStartTime("CompareGamesRequest");
                    if (startTime) {
                        if (stopTime >= startTime) {
                            PT.getShellEventProvider().tracePerfTrack_Trigger_CompareGamesRequestToLoad();
                            var duration = ((stopTime >= startTime) ? (stopTime - startTime) : 0);
                            PT.getLogger().writeTriggerEvent(1338, "XBLW-CompareGamesRequestToLoad", duration)
                        }
                        state.deleteStartTime("CompareGamesRequest")
                    }
                }
            }, enableScenarioWebBlendRequestToLoad: function _perfTrack_enableScenarioWebBlendRequestToLoad() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().enableScenario(1339)
            }, disableScenarioWebBlendRequestToLoad: function _perfTrack_disableScenarioWebBlendRequestToLoad() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().disableScenario(1339)
            }, triggerScenarioWebBlendRequestToLoad: function _perfTrack_triggerScenarioWebBlendRequestToLoad(url) {
                var PT = MS.Entertainment.Instrumentation.PerfTrack;
                var state = PT._getState();
                if (!state.isDisabled(1339)) {
                    var stopTime = new Date;
                    var startTime = state.getStartTime("WebBlendRequest");
                    if (startTime) {
                        if (stopTime >= startTime) {
                            PT.getShellEventProvider().tracePerfTrack_Trigger_WebBlendRequestToLoad(url);
                            var duration = ((stopTime >= startTime) ? (stopTime - startTime) : 0);
                            PT.getLogger().writeTriggerEventWithMetadata(1339, "XBLW-WebBlendRequestToLoad", duration, 0, 0, 0, 0, 0, PT._truncateString(url), "")
                        }
                        state.deleteStartTime("WebBlendRequest")
                    }
                }
            }, enableScenarioXbox360GamesGalleryRequestToLoad: function _perfTrack_enableScenarioXbox360GamesGalleryRequestToLoad() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().enableScenario(1340)
            }, disableScenarioXbox360GamesGalleryRequestToLoad: function _perfTrack_disableScenarioXbox360GamesGalleryRequestToLoad() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().disableScenario(1340)
            }, triggerScenarioXbox360GamesGalleryRequestToLoad: function _perfTrack_triggerScenarioXbox360GamesGalleryRequestToLoad() {
                var PT = MS.Entertainment.Instrumentation.PerfTrack;
                var state = PT._getState();
                if (!state.isDisabled(1340)) {
                    var stopTime = new Date;
                    var startTime = state.getStartTime("Xbox360GamesGalleryRequest");
                    if (startTime) {
                        if (stopTime >= startTime) {
                            PT.getShellEventProvider().tracePerfTrack_Trigger_Xbox360GamesGalleryRequestToLoad();
                            var duration = ((stopTime >= startTime) ? (stopTime - startTime) : 0);
                            PT.getLogger().writeTriggerEvent(1340, "XBLW-Xbox360GamesGalleryRequestToLoad", duration)
                        }
                        state.deleteStartTime("Xbox360GamesGalleryRequest")
                    }
                }
            }, enableScenarioMetroGamesGalleryRequestToLoad: function _perfTrack_enableScenarioMetroGamesGalleryRequestToLoad() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().enableScenario(1341)
            }, disableScenarioMetroGamesGalleryRequestToLoad: function _perfTrack_disableScenarioMetroGamesGalleryRequestToLoad() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().disableScenario(1341)
            }, triggerScenarioMetroGamesGalleryRequestToLoad: function _perfTrack_triggerScenarioMetroGamesGalleryRequestToLoad() {
                var PT = MS.Entertainment.Instrumentation.PerfTrack;
                var state = PT._getState();
                if (!state.isDisabled(1341)) {
                    var stopTime = new Date;
                    var startTime = state.getStartTime("MetroGamesGalleryRequest");
                    if (startTime) {
                        if (stopTime >= startTime) {
                            PT.getShellEventProvider().tracePerfTrack_Trigger_MetroGamesGalleryRequestToLoad();
                            var duration = ((stopTime >= startTime) ? (stopTime - startTime) : 0);
                            PT.getLogger().writeTriggerEvent(1341, "XBLW-MetroGamesGalleryRequestToLoad", duration)
                        }
                        state.deleteStartTime("MetroGamesGalleryRequest")
                    }
                }
            }, disableAllStartupScenarios: function _perfTrack_disableAllStartupScenarios() {
                var PT = MS.Entertainment.Instrumentation.PerfTrack;
                PT.disableScenarioAppLaunch();
                PT.disableScenarioAppLaunchToCollection();
                PT.disableScenarioAppLaunchPlayNonProtectedContent();
                PT.disableScenarioAppLaunchPlayProtectedContent()
            }, onSuspending: function _perfTrack_onSuspending() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().resetStartPoints();
                MS.Entertainment.Instrumentation.PerfTrack.disableAllStartupScenarios()
            }, onResuming: function _perfTrack_onResuming() {
                MS.Entertainment.Instrumentation.PerfTrack._getState().resetStartPoints()
            }
    })})
