/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");
(function() {
    "use strict";
    var _actionService;
    var _createBasicButton = function _createBasicButton(actionId, titleId, parameter, iconInfo) {
            if (!_actionService)
                _actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
            var button = _actionService.getAction(actionId);
            button.title = String.load(titleId);
            if (parameter) {
                button.parameter = parameter;
                button.parameter.actionType = MS.Entertainment.UI.Actions.ActionWrapperType.button
            }
            if (iconInfo)
                button.iconInfo = iconInfo;
            if (button.parameter && button.parameter.automationId)
                button.automationId = button.parameter.automationId;
            return button
        };
    var _createButton = function createButton(actionId, titleId, parameter, iconInfo) {
            var button = _createBasicButton(actionId, titleId, parameter, iconInfo);
            if (button.parameter && button.parameter.dismissOverlayOnExecute) {
                var oldExecuted = button.executed.bind(button);
                button.executed = WinJS.Utilities.markSupportedForProcessing(function executed(actionData) {
                    var domEvent = document.createEvent("Event");
                    domEvent.initEvent("dismissoverlay", true, true);
                    var popover = document.querySelector(".overlayAnchor .popOver");
                    if (popover)
                        popover.dispatchEvent(domEvent);
                    oldExecuted(actionData)
                })
            }
            var mediaContext = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appToolbar).currentMediaContext;
            if (mediaContext.collectionFilter) {
                var previousExecuted = button.executed.bind(button);
                button.executed = WinJS.Utilities.markSupportedForProcessing(function executed(actionData) {
                    actionData.collectionFilter = mediaContext.collectionFilter;
                    previousExecuted(actionData)
                })
            }
            if (button.parameter && button.parameter.preRollVideoAdIfNeeded) {
                var lastExecuted = button.executed.bind(button);
                button.executed = WinJS.Utilities.markSupportedForProcessing(function executed(actionData) {
                    var collectionFilter = mediaContext.collectionFilter;
                    if (collectionFilter === Microsoft.Entertainment.Queries.MediaAvailability.availableOffline)
                        lastExecuted(actionData);
                    else {
                        var containingMedia = mediaContext.options && mediaContext.options.containingMedia;
                        var invokedMedia = (containingMedia && actionData.mediaItem === containingMedia.playbackItemSource) ? mediaContext.mediaItem : actionData.mediaItem;
                        var adService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.adService);
                        adService.checkForForSignInNeeded(invokedMedia).done(function checkForForSignInNeeded_complete(signInNeeded) {
                            var promise;
                            var dialogDismissed;
                            promise = new WinJS.Promise(function(c, e, p) {
                                dialogDismissed = c
                            }).then(function dialogDismissed() {
                                var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                                return (!signInNeeded || signIn.isSignedIn) ? adService.playVideoAdIfRequired(invokedMedia) : false
                            }).done(function playVideoAdIfRequired_complete(adPlayedIfNeeded) {
                                if (adPlayedIfNeeded)
                                    lastExecuted(actionData)
                            }, function playVideoAdIfRequired_failed(error) {
                                MS.Entertainment.ViewModels.fail("playVideoAdIfRequired_failed: " + (error && error.message));
                                lastExecuted(actionData)
                            });
                            if (signInNeeded)
                                MS.Entertainment.Music.MusicBrandDialog.show(String.load(String.id.IDS_MUSIC_STREAMING_SIGN_IN_TITLE), String.load(String.id.IDS_MUSIC_STREAMING_SIGN_IN_DESC), null, [MS.Entertainment.Music.MusicBrandDialog.dialogButtonIds.signUp, MS.Entertainment.Music.MusicBrandDialog.dialogButtonIds.cancel], dialogDismissed);
                            else
                                dialogDismissed()
                        }, function checkForForSignInNeeded_failed(error) {
                            MS.Entertainment.ViewModels.fail("checkForForSigninNeeded_failed: " + (error && error.message))
                        })
                    }
                })
            }
            return button
        };
    var _isFreeUser = function _isFreeUser() {
            var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
            var isSubscription = configurationManager.service.lastSignedInUserSubscription;
            return !isSubscription
        };
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {SmartBuyButtons: {
            createButtonPlayGameTrailer: function createButtonPlayGameTrailer(media, executeLocation) {
                var button = _createButton(MS.Entertainment.UI.Actions.ActionIdentifiers.showImmersiveDetails, String.id.IDS_DETAILS_WATCH_TRAILER_LABEL, {
                        mediaItem: media, showDetails: true, autoPlay: true, playPreviewOnly: true, executeLocation: executeLocation, automationId: MS.Entertainment.UI.AutomationIds.smartButtonPlayGameTrailer, dismissOverlayOnExecute: true
                    }, {icon: MS.Entertainment.UI.Icon.play});
                var oldExecuted = button.executed.bind(button);
                button.executed = WinJS.Utilities.markSupportedForProcessing(function executed(actionData) {
                    this._extractMediaItem(actionData).isMarketplace = true;
                    oldExecuted(actionData)
                });
                return button
            }, createButtonPlayOnXbox: function createButtonPlayOnXbox(media, executeLocation) {
                    return _createButton(MS.Entertainment.UI.Actions.ActionIdentifiers.playOnXbox, MS.Entertainment.Utilities.isGamesApp ? String.id.IDS_DETAILS_PLAY_ON_XBOX_GAMES_LABEL : String.id.IDS_DETAILS_PLAY_ON_XBOX_LABEL, {
                            mediaItem: media, executeLocation: executeLocation, automationId: MS.Entertainment.UI.AutomationIds.smartButtonPlayOnXbox, dismissOverlayOnExecute: true
                        }, {
                            icon: MS.Entertainment.UI.Icon.sendToXbox, adornerMode: MS.Entertainment.UI.Controls.IconButtonMode.Custom, adornerRing: MS.Entertainment.UI.Icon.sendToXboxAdorner, className: "enablePressedState"
                        })
                }, createButtonGameDetails: function createButtonGameDetails(media, executeLocation) {
                    var button = _createButton(MS.Entertainment.UI.Actions.ActionIdentifiers.showImmersiveDetails, media.isGame ? String.id.IDS_DETAILS_VIEW_FULL_GAME : String.id.IDS_DETAILS_VIEW_FULL_APP, {
                            mediaItem: media, showDetails: true, autoPlay: false, executeLocation: executeLocation, automationId: MS.Entertainment.UI.AutomationIds.smartButtonGameDetails, dismissOverlayOnExecute: true
                        }, {icon: MS.Entertainment.UI.Icon.details});
                    var oldExecuted = button.executed.bind(button);
                    button.executed = WinJS.Utilities.markSupportedForProcessing(function executed(actionData) {
                        this._extractMediaItem(actionData).isMarketplace = true;
                        oldExecuted(actionData)
                    });
                    return button
                }, createButtonCompareGameActivityDetails: function createButtonCompareGameActivityDetails(media, compareDetails, executeLocation) {
                    var button = _createButton(MS.Entertainment.UI.Actions.ActionIdentifiers.showImmersiveDetails, String.id.IDS_SOCIAL_COMPARE_ACHIEVEMENTS, {
                            mediaItem: media, showDetails: true, autoPlay: false, hub: "achievements", options: {
                                    userXuid: compareDetails ? compareDetails.userXuid : 0, userModel: compareDetails ? compareDetails.userModel : null
                                }, executeLocation: executeLocation, automationId: MS.Entertainment.UI.AutomationIds.smartButtonCompareGameActivities, dismissOverlayOnExecute: true
                        }, {icon: MS.Entertainment.UI.Icon.gameCompare});
                    var oldExecuted = button.executed.bind(button);
                    button.executed = WinJS.Utilities.markSupportedForProcessing(function executed(actionData) {
                        this._extractMediaItem(actionData).isMarketplace = true;
                        oldExecuted(actionData)
                    });
                    return button
                }, createButtonGamePlayOnPC: function createButtonGamePlayOnPC(media, executeLocation) {
                    var button = _createButton(MS.Entertainment.UI.Actions.ActionIdentifiers.launchApp, String.id.IDS_PLAY_BUTTON_GAMES, {
                            mediaItem: media, uri: media.launchUri, familyName: media.familyName, displayName: media.name, executeLocation: executeLocation, automationId: MS.Entertainment.UI.AutomationIds.smartButtonPlayOnPc, useFallback: true
                        }, {icon: WinJS.UI.AppBarIcon.slideshow});
                    button.extendedClassNames = "externalLinkBackground";
                    var oldExecuted = button.executed.bind(button);
                    button.executed = WinJS.Utilities.markSupportedForProcessing(function executed(actionData) {
                        var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                        var signedInUser = MS.Entertainment.Social.Helpers.getSignedInUserModel();
                        var activityPromise = WinJS.Promise.wrap();
                        var gameActivity = null;
                        if (signIn.isSignedIn)
                            if (signedInUser.loadActivity)
                                gameActivity = signedInUser.findGameActivity(actionData.mediaItem.titleId);
                            else {
                                signedInUser.loadActivity = true;
                                activityPromise = signedInUser.refresh().then(function refreshed() {
                                    gameActivity = signedInUser.findGameActivity(actionData.mediaItem.titleId)
                                }.bind(this))
                            }
                        return activityPromise.then(function gameActivityUpdate() {
                                MS.Entertainment.Utilities.Telemetry.logPlayGameClicked(actionData.mediaItem, gameActivity, signIn.isSignedIn);
                                oldExecuted(actionData)
                            })
                    });
                    return button
                }, createButtonBuyExtra: function createButtonBuyExtra(media, parentMedia, executeLocation) {
                    if (!parentMedia || parentMedia.defaultPlatformType !== MS.Entertainment.Data.Augmenter.GamePlatform.Modern || parentMedia.supportsCurrentArchitecture) {
                        var button = _createButton(MS.Entertainment.UI.Actions.ActionIdentifiers.purchase, String.id.IDS_DETAILS_BUY_EXTRA, {
                                mediaItem: media, executeLocation: executeLocation, automationId: MS.Entertainment.UI.AutomationIds.smartButtonBuyExtra, subTitle: String.empty, itemTemplate: "/Components/InlineDetails/ActionButtonsControl.html#actionButtonTemplateWithSubtext"
                            }, {icon: MS.Entertainment.UI.Icon.shop});
                        var oldExecuted = button.executed.bind(button);
                        button.executed = WinJS.Utilities.markSupportedForProcessing(function executed(actionData) {
                            var buyExtra = function buyExtra() {
                                    oldExecuted(actionData)
                                }.bind(this);
                            var showConfirmationDialog = function showConfirmationDialog() {
                                    var signedInUser = MS.Entertainment.Social.Helpers.getSignedInUserModel();
                                    var activityPromise = WinJS.Promise.wrap();
                                    var gameActivity = null;
                                    if (signedInUser.loadActivity)
                                        gameActivity = signedInUser.findGameActivity(actionData.mediaItem.titleId);
                                    else {
                                        signedInUser.loadActivity = true;
                                        signedInUser._uninitializeSignInHandlers();
                                        activityPromise = signedInUser.refresh().then(function refreshed() {
                                            gameActivity = signedInUser.findGameActivity(actionData.mediaItem.titleId);
                                            signedInUser._initializeSignInHandlers()
                                        }.bind(this))
                                    }
                                    return activityPromise.then(function gameActivityUpdate() {
                                            if (!!gameActivity)
                                                buyExtra();
                                            else
                                                MS.Entertainment.Pages.PDLCConfirmationDialog.showPDLCConfirmationDialog(actionData.mediaItem, buyExtra)
                                        }.bind(this))
                                };
                            var refreshSignedInUser = function refreshSignedInUser() {
                                    var signedInUser = MS.Entertainment.Social.Helpers.getSignedInUserModel();
                                    signedInUser.loadActivity = false;
                                    return showConfirmationDialog()
                                };
                            var signInService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                            if (signInService.isSignedIn)
                                return showConfirmationDialog();
                            else
                                return signInService.signIn().then(refreshSignedInUser, function(){})
                        });
                        return button
                    }
                    else
                        return null
                }, createButtonExtraPurchasedDisabled: function createButtonExtraPurchasedDisabled(executeLocation) {
                    return _createButton(MS.Entertainment.UI.Actions.ActionIdentifiers.disabled, String.id.IDS_DETAILS_BUY_EXTRA, {
                            executeLocation: executeLocation, automationId: MS.Entertainment.UI.AutomationIds.smartButtonExtraPurchasedDisabled, subTitle: String.empty, itemTemplate: "/Components/InlineDetails/ActionButtonsControl.html#actionButtonTemplateWithSubtext"
                        }, {icon: MS.Entertainment.UI.Icon.shop})
                }, getExtraImmersiveDetailsButtons: function getExtraImmersiveDetailsButtons(media, parentMedia, executeLocation) {
                    var location = executeLocation || MS.Entertainment.UI.Actions.ExecutionLocation.canvas;
                    var buttons = {
                            extraPurchased: this.createButtonExtraPurchasedDisabled(location), buyExtra: this.createButtonBuyExtra(media, parentMedia, location)
                        };
                    if (parentMedia)
                        buttons.gameDetails = this.createButtonGameDetails(parentMedia, location);
                    return buttons
                }, getGameImmersiveDetailsButtons: function getGameImmersiveDetailsButtons(media, executeLocation) {
                    var location = executeLocation || MS.Entertainment.UI.Actions.ExecutionLocation.canvas;
                    return {
                            playOnXbox: this.createButtonPlayOnXbox(media, location), playOnPC: this.createButtonGamePlayOnPC(media, location)
                        }
                }, getGameInlineDetailsButtons: function getGameInlineDetailsButtons(media, executeLocation) {
                    var location = executeLocation || MS.Entertainment.UI.Actions.ExecutionLocation.popover;
                    return {
                            gameDetails: this.createButtonGameDetails(media, location), playGameTrailer: this.createButtonPlayGameTrailer(media, location), buyExtra: this.createButtonBuyExtra(media, location), playOnXbox: this.createButtonPlayOnXbox(media, location), playOnPC: this.createButtonGamePlayOnPC(media, location)
                        }
                }, getCompareGameActivityInlineDetailsButtons: function getCompareGameActivityInlineDetailsButtons(media, compareDetails, executeLocation) {
                    var location = executeLocation || MS.Entertainment.UI.Actions.ExecutionLocation.popover;
                    var buttons = MS.Entertainment.ViewModels.SmartBuyButtons.getGameInlineDetailsButtons(media);
                    buttons.gameDetails = this.createButtonCompareGameActivityDetails(media, compareDetails, location);
                    return buttons
                }, getGameImmersiveDetailsHeroButtons: function getGameImmersiveDetailsHeroButtons(media, executeLocation) {
                    var location = executeLocation || MS.Entertainment.UI.Actions.ExecutionLocation.canvas;
                    return {playGameTrailer: this.createButtonPlayGameTrailer(media, location)}
                }, smartBuyButtonTemplateSelector: WinJS.Utilities.markSupportedForProcessing(function smartBuyButtonTemplateSelector(item) {
                    var result;
                    function loadItemTemplate(itemTemplate) {
                        return MS.Entertainment.UI.Framework.loadTemplate(itemTemplate, null, true).then(function(templateControl) {
                                return templateControl
                            })
                    }
                    if (item.parameter && item.parameter.itemTemplate)
                        return loadItemTemplate(item.parameter.itemTemplate);
                    else
                        return loadItemTemplate(this._itemTemplate)
                })
        }})
})()
