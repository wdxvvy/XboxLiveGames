/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Components/Playback/playbackhelpers.js", "/Framework/actionidentifiers.js", "/Framework/action.js", "/Framework/debug.js", "/Framework/Navigation.js", "/Framework/servicelocator.js", "/Framework/Utilities.js", "/Monikers.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Components.Shell");
(function() {
    var testIaPath = "/Test/InformationArchitecture.js";
    WinJS.Namespace.define("MS.Entertainment.UI.Components.Shell", {
        DeepLinkLocationAction: MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function() {
            this.base()
        }, {executed: function executed(params) {
                MS.Entertainment.UI.Components.Shell.assert(params.id, "DeepLinkLocationAction: params.id not defined");
                var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                var navigationSuccessful = false;
                var moniker = MS.Entertainment.UI.Monikers[params.id];
                if (moniker) {
                    var mapping = {
                            homeHub: MS.Entertainment.UI.Monikers.root, movieMarketplaceNewReleases: MS.Entertainment.UI.Monikers.movieMarketplace, movieMarketplaceFeatured: MS.Entertainment.UI.Monikers.movieMarketplace, tvMarketplaceNewReleases: MS.Entertainment.UI.Monikers.tvMarketplace, tvMarketplaceFeatured: MS.Entertainment.UI.Monikers.tvMarketplace, musicMarketplaceFeatured: MS.Entertainment.UI.Monikers.musicMarketplace
                        };
                    var mappedMoniker = mapping[params.id];
                    if (mappedMoniker)
                        navigationSuccessful = navigationService.navigateTo(mappedMoniker, moniker, null, null);
                    else
                        navigationSuccessful = navigationService.navigateTo(moniker, null, null, null)
                }
                if (!navigationSuccessful && !navigationService.currentPage)
                    navigationService.navigateToDefaultPage();
                else if (!params.dialogOnly) {
                    navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                    navigationService.clearBackStackOnNextNavigate(true)
                }
            }}), DeepLinkDetailsAction: MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function() {
                this.base()
            }, {
                executed: function executed(params) {
                    var navigationPromise;
                    var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                    if (!params.dialogOnly)
                        navigationService.clearBackStackOnNextNavigate(true);
                    else if (!navigationService.currentPage) {
                        navigationService.navigateToDefaultPage();
                        navigationPromise = WinJS.Promise.timeout()
                    }
                    WinJS.Promise.as(navigationPromise).then(function executeNaviation() {
                        if (MS.Entertainment.Utilities.isGamesApp)
                            return this._executeGameDetails(params);
                        else
                            return this._executeUnknownMediaTypeDetails(params)
                    }.bind(this)).done(null, function handleDeeplinkFailed() {
                        if (!params.dialogOnly)
                            navigationService.navigateToDefaultPage()
                    })
                }, _executeGameDetails: function _executeGameDetails(params) {
                        var navigationPromise;
                        if (params.id || params.titleId) {
                            var item = {
                                    ID: params.id, TitleId: params.titleId
                                };
                            var augmenter = MS.Entertainment.Data.Augmenter.Marketplace.MetroGame;
                            var media = MS.Entertainment.Data.augment(item, augmenter);
                            if (media) {
                                var immersiveOptions = {
                                        startFullScreen: false, overridePageChange: params.forceNavigate
                                    };
                                MS.Entertainment.Platform.PlaybackHelpers.showImmersive(media, immersiveOptions)
                            }
                            else
                                navigationPromise = WinJS.Promise.wrapError(new Error("Invalid media. Cannot excute to game details deeplink."))
                        }
                        else {
                            MS.Entertainment.UI.Components.Shell.assert(gameId, "DeepLinkDetailsAction: params.id or params.titleId not defined");
                            navigationPromise = WinJS.Promise.wrapError(new Error("Invalid id. Cannot excute to game details deeplink."))
                        }
                        return navigationPromise
                    }, _executeUnknownMediaTypeDetails: function _executeUnknownMediaTypeDetails(params) {
                        MS.Entertainment.UI.Components.Shell.assert(params.id, "DeepLinkDetailsAction: params.id not defined");
                        MS.Entertainment.Platform.PlaybackHelpers.getMediaByServiceId(params.id).then(function getMediaByServiceIdSuccess(media) {
                            MS.Entertainment.Platform.PlaybackHelpers.showImmersive(media)
                        }.bind(this), function getMediaByServiceIdError(errorCode) {
                            if (errorCode)
                                MS.Entertainment.UI.Shell.showError(String.load(String.id.IDS_MEDIA_ERROR_CAPTION), errorCode);
                            var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                            navigationService.navigateToDefaultPage()
                        })
                    }, _showPopover: function _showPopover(mediaItem, popoverConstructor) {
                        MS.Entertainment.UI.Controls.PopOver.dismissCurrentPopOver();
                        var popOverParameters = {
                                itemConstructor: popoverConstructor, dataContext: {
                                        data: mediaItem, location: MS.Entertainment.Pages.BaseMediaInlineDetails.Location.marketplace
                                    }
                            };
                        MS.Entertainment.UI.Controls.PopOver.showPopOver(popOverParameters)
                    }, _showImmersiveAndPopover: function _showImmersiveAndPopover(popOverMediaItem, immersiveMediaItem, popoverConstructor) {
                        if (!popOverMediaItem || !popOverMediaItem.hasServiceId || !popOverMediaItem.hasArtistServiceId || !immersiveMediaItem)
                            return WinJS.Promise.wrapError(new Error("Invalid media object or id. Cannot excute to navigate to immersive details and show a pop-over."));
                        var navigationPromise;
                        MS.Entertainment.ViewModels.MediaItemModel.augment(immersiveMediaItem);
                        navigationPromise = immersiveMediaItem.hydrate().then(MS.Entertainment.UI.Controls.PopOver.dismissCurrentPopOver).then(function _onHydrated() {
                            return new WinJS.Promise(function initializePromise(complete) {
                                    var immersiveOptions = {
                                            startFullScreen: false, completeCallback: complete
                                        };
                                    MS.Entertainment.Platform.PlaybackHelpers.showImmersive(immersiveMediaItem, immersiveOptions)
                                })
                        }).then(function _waitForImmersive() {
                            return WinJS.Promise.timeout()
                        }).then(function _showMediaPopover() {
                            this._showPopover(popOverMediaItem, popoverConstructor)
                        }.bind(this));
                        return navigationPromise
                    }
            }), DeepLinkSearchAction: MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function() {
                this.base()
            }, {executed: function executed(params) {
                    MS.Entertainment.UI.Components.Shell.assert(params.query, "DeepLinkSearchAction: params.query not defined");
                    MS.Entertainment.ViewModels.SearchContractViewModel._navigateToSearchPage({keyword: params.query})
                }}), DeepLinkPurchasePDLCAction: MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function() {
                this.base()
            }, {executed: function executed(params) {
                    MS.Entertainment.UI.Components.Shell.assert(params.offerId, "DeepLinkPurchasePDLCAction: params.offerId not defined");
                    MS.Entertainment.UI.Components.Shell.assert(params.gamerTag, "DeepLinkLocationAction: params.gamerTag not defined");
                    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                    var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                    var navigateHomeAndReturnToAppOnFailure = function navigateHomeAndReturnToAppOnFailure() {
                            navigationService.navigateToDefaultPage();
                            var returnUri = params.returnUri ? params.returnUri + "&purchaseresult=Failed" : String.empty;
                            var service = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                            var action = service.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.launchApp);
                            action.automationId = MS.Entertainment.UI.AutomationIds.launchAppDeepLinkPurchasePDLC;
                            action.parameter = {
                                uri: returnUri, appendSource: false, appendGamerTag: false
                            };
                            action.execute()
                        };
                    var showSignInErrorDialog = function showSignInErrorDialog() {
                            return MS.Entertainment.UI.Shell.showMessageBox(String.load(String.id.IDS_SIGNIN_ERROR), String.load(String.id.IDS_SMARTDJ_OFFINE_ERROR_DESC))
                        };
                    var doPurchaseSignIn = function doPurchaseSignIn() {
                            if (pageChangedBindings) {
                                pageChangedBindings.cancel();
                                pageChangedBindings = null
                            }
                            var item = {
                                    serviceId: params.offerId, mediaType: Microsoft.Entertainment.Queries.ObjectType.game, type: MS.Entertainment.Platform.PurchaseHelpers.PDLC_TYPE
                                };
                            var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                            signIn.signIn(true).then(function complete(result) {
                                if (result === MS.Entertainment.Utilities.SignIn.SignInResult.success)
                                    MS.Entertainment.Platform.PurchaseHelpers.launchPurchaseFlow(item, null, null, null, params.offerId, params.returnUri, params.gamerTag);
                                else if (result === MS.Entertainment.Utilities.SignIn.SignInResult.signingIn) {
                                    signIn.bind("isSigningIn", onAppSigningInChange);
                                    function onAppSigningInChange(isSigningIn, isSigningInOld) {
                                        if (isSigningInOld !== undefined && !isSigningIn) {
                                            signIn.unbind("isSigningIn", onAppSigningInChange);
                                            if (signIn.isSignedIn)
                                                MS.Entertainment.Platform.PurchaseHelpers.launchPurchaseFlow(item, null, null, null, params.offerId, params.returnUri, params.gamerTag);
                                            else
                                                showSignInErrorDialog().then(navigateHomeAndReturnToAppOnFailure)
                                        }
                                    }
                                }
                                else
                                    showSignInErrorDialog().then(navigateHomeAndReturnToAppOnFailure)
                            })
                        };
                    var pageChangedBindings = WinJS.Binding.bind(navigationService, {currentPage: function pageChanged() {
                                if (navigationService.currentPage && pageChangedBindings)
                                    doPurchaseSignIn()
                            }});
                    if (actionService.isRegistered(MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkDetails)) {
                        var action = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkDetails);
                        var parameter = params || {};
                        parameter.forceNavigate = true;
                        action.parameter = parameter;
                        action.execute()
                    }
                    else
                        navigationService.navigateToDefaultPage()
                }}), DeepLinkLaunchTitleAction: MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function() {
                this.base()
            }, {executed: function executed(params) {
                    MS.Entertainment.UI.Components.Shell.assert(params.titleId, "DeepLinkLaunchTitleAction: params.titleId not defined");
                    MS.Entertainment.UI.Components.Shell.assert(params.mediaType, "DeepLinkLaunchTitleAction: params.mediaType not defined");
                    var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    var session = sessionMgr.lrcSession;
                    var titleId = params.titleId;
                    var serviceId = params.serviceId;
                    var serviceIdType = params.serviceIdType || MS.Entertainment.Data.Query.edsIdType.zuneCatalog;
                    var mediaType = params.mediaType;
                    var startPositionMsec = params.startPositionMsec;
                    var deepLinkInfo = params.deepLinkInfo;
                    var getMediaItem = null;
                    if (deepLinkInfo)
                        deepLinkInfo = decodeURIComponent(deepLinkInfo);
                    switch (mediaType) {
                        case Microsoft.Entertainment.Queries.ObjectType.game:
                            getMediaItem = MS.Entertainment.Platform.PlaybackHelpers.getGameMediaByTitleId(titleId);
                            break;
                        default:
                            if (serviceId)
                                getMediaItem = MS.Entertainment.Platform.PlaybackHelpers.getMediaByServiceId(serviceId);
                            else if (titleId)
                                getMediaItem = MS.Entertainment.Platform.PlaybackHelpers.getGameMediaByTitleId(titleId);
                            break
                    }
                    getMediaItem.then(function getMediaItemSuccess(media) {
                        MS.Entertainment.Platform.PlaybackHelpers.playMediaOnXbox(media, titleId, deepLinkInfo, startPositionMsec)
                    }, function getMediaItemFailed(errorCode) {
                        if (mediaType === Microsoft.Entertainment.Queries.ObjectType.video && titleId && deepLinkInfo) {
                            var fakeMedia = new MS.Entertainment.Data.Augmenter.Marketplace.VideoBase;
                            MS.Entertainment.Platform.PlaybackHelpers.playMediaOnXbox(fakeMedia, titleId, deepLinkInfo, startPositionMsec)
                        }
                        else {
                            if (errorCode)
                                MS.Entertainment.UI.Shell.showError(String.load(String.id.IDS_MEDIA_ERROR_CAPTION), errorCode);
                            var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                            navigationService.navigateToDefaultPage()
                        }
                    })
                }}), DeepLinkInboxAction: MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function() {
                this.base()
            }, {
                automationId: "deepLinkInbox", executed: function executed(params) {
                        MS.Entertainment.UI.Components.Shell.assert(params.messageID, "DeepLinkInboxAction: params.messageID not defined");
                        var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                        var navigateToInbox = function navigateToInbox() {
                                var navigationSuccessful = navigationService.navigateTo(MS.Entertainment.UI.Monikers.socialInboxPage, MS.Entertainment.UI.Monikers.socialInboxAllHub, null, {messageId: params.messageID});
                                if (!navigationSuccessful && !navigationService.currentPage)
                                    navigationService.navigateToDefaultPage()
                            };
                        var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                        signIn.signIn(true).done(function complete(result) {
                            if (result === MS.Entertainment.Utilities.SignIn.SignInResult.success)
                                navigateToInbox();
                            else if (result === MS.Entertainment.Utilities.SignIn.SignInResult.signingIn) {
                                signIn.bind("isSigningIn", onAppSigningInChange);
                                function onAppSigningInChange(isSigningIn, isSigningInOld) {
                                    if (isSigningInOld !== undefined && !isSigningIn) {
                                        signIn.unbind("isSigningIn", onAppSigningInChange);
                                        if (signIn.isSignedIn)
                                            navigateToInbox();
                                        else
                                            navigationService.navigateToDefaultPage()
                                    }
                                }
                            }
                            else
                                navigationService.navigateToDefaultPage()
                        })
                    }
            })
    });
    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkLocation, function() {
        return new MS.Entertainment.UI.Components.Shell.DeepLinkLocationAction
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkDetails, function() {
        return new MS.Entertainment.UI.Components.Shell.DeepLinkDetailsAction
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkSearch, function() {
        return new MS.Entertainment.UI.Components.Shell.DeepLinkSearchAction
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkLaunchTitle, function() {
        return new MS.Entertainment.UI.Components.Shell.DeepLinkLaunchTitleAction
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkPurchasePDLC, function() {
        return new MS.Entertainment.UI.Components.Shell.DeepLinkPurchasePDLCAction
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkInbox, function() {
        return new MS.Entertainment.UI.Components.Shell.DeepLinkInboxAction
    })
})()
