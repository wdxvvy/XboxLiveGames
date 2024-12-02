/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/debug.js", "/Framework/utilities.js");
(function() {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Platform.PlaybackHelpers");
    WinJS.Namespace.define("MS.Entertainment.Platform", {PlayAction: MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function playAction() {
            this.base()
        }, {
            _executing: false, executed: function executed(param) {
                    if (MS.Entertainment.Utilities.isApp2 && this._executing)
                        return;
                    this._executing = true;
                    this.requeryCanExecute();
                    var mediaQueued = WinJS.Promise.as(this.executedPlay(param));
                    mediaQueued.done(function waitForPlayback(wasMediaQueued) {
                        if (wasMediaQueued)
                            MS.Entertainment.Platform.PlaybackHelpers.waitForTransportState(MS.Entertainment.Platform.Playback.TransportState.playing).then(null, function ignoreError(){}).done(function enableAction() {
                                this._executing = false;
                                this.requeryCanExecute()
                            }.bind(this));
                        else {
                            this._executing = false;
                            this.requeryCanExecute()
                        }
                    }.bind(this), function ignoreError(){});
                    return mediaQueued
                }, executedPlay: function executedPlay(param) {
                    return false
                }, canExecute: function canExecute(param) {
                    return this.canExecutePlay(param) && (MS.Entertainment.Utilities.isApp2 || !this._executing)
                }, canExecutePlay: function canExecutePlay(param) {
                    return false
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.Platform.PlaybackHelpers", {
        _getFeatureEnablement: (function _getFeatureEnablement_closure() {
            var featureEnablement = null;
            return function _getFeatureEnablement_getter() {
                    if (!featureEnablement)
                        featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    return featureEnablement
                }
        })(), waitForTransportState: function waitForTransportState(transportStates) {
                var bindings;
                var completed;
                var failed;
                var promise;
                var playbackSession = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager).nowPlayingSession;
                if (transportStates && !Array.isArray(transportStates))
                    transportStates = [transportStates];
                function onPlaybackChanged() {
                    if (!bindings)
                        return;
                    if (playbackSession.playerState === MS.Entertainment.Platform.Playback.PlayerState.error)
                        failed();
                    else if (transportStates.indexOf(playbackSession.currentTransportState) >= 0)
                        completed()
                }
                if (transportStates)
                    promise = new WinJS.Promise(function initializePromise(c, f) {
                        completed = c;
                        failed = f;
                        bindings = WinJS.Binding.bind(playbackSession, {
                            currentTransportState: onPlaybackChanged, playerState: onPlaybackChanged
                        })
                    }, function canceled(){});
                else
                    promise = WinJS.Promise.wrap();
                promise.then(null, function ignoreError(){}).done(function clearBindings() {
                    if (bindings) {
                        bindings.cancel();
                        bindings = null
                    }
                });
                return promise
            }, getMediaByServiceId: function getMediaByServiceId(serviceId) {
                var featureEnablement = this._getFeatureEnablement();
                return new WinJS.Promise(function(c, e, p) {
                        if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace) || featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.movieTrailersMarketplace) || featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace) || featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace) || featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicVideosMarketplace)) {
                            var contentTypeQuery = new MS.Entertainment.Data.Query.GenericDetails;
                            contentTypeQuery.serviceId = serviceId;
                            contentTypeQuery.idType = MS.Entertainment.Data.Query.edsIdType.zuneCatalog;
                            contentTypeQuery.execute().then(function contentTypeQuerySuccess(query) {
                                var mediaItemQuery = null;
                                if (query.result.item)
                                    switch (query.result.item.contentType) {
                                        case"Movie":
                                            if (query.result.item.type === MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.MovieTrailer) {
                                                if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.movieTrailersMarketplace)) {
                                                    mediaItemQuery = new MS.Entertainment.Data.Query.Video.EdsDetailMovie;
                                                    mediaItemQuery.id = query.result.item.serviceId;
                                                    mediaItemQuery.idType = query.result.item.serviceIdType;
                                                    mediaItemQuery.impressionGuid = query.result.item.impressionGuid
                                                }
                                            }
                                            else if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace)) {
                                                mediaItemQuery = new MS.Entertainment.Data.Query.Video.EdsDetailMovie;
                                                mediaItemQuery.id = query.result.item.serviceId;
                                                mediaItemQuery.idType = query.result.item.serviceIdType;
                                                mediaItemQuery.impressionGuid = query.result.item.impressionGuid
                                            }
                                            break;
                                        case"MovieTrailer":
                                            if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.movieTrailersMarketplace)) {
                                                mediaItemQuery = new MS.Entertainment.Data.Query.Video.EdsDetailMovie;
                                                mediaItemQuery.id = query.result.item.serviceId;
                                                mediaItemQuery.idType = query.result.item.serviceIdType;
                                                mediaItemQuery.impressionGuid = query.result.item.impressionGuid
                                            }
                                            break;
                                        case"Track":
                                            if (MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.networkStatus).isEnabled(MS.Entertainment.UI.NetworkStatusService.NetworkedFeature.musicMarketplace) && featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace)) {
                                                mediaItemQuery = new MS.Entertainment.Data.Query.Music.SongDetails;
                                                mediaItemQuery.id = query.result.item.serviceId;
                                                mediaItemQuery.idType = query.result.item.serviceIdType;
                                                mediaItemQuery.impressionGuid = query.result.item.impressionGuid
                                            }
                                            break;
                                        case"Album":
                                            if (MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.networkStatus).isEnabled(MS.Entertainment.UI.NetworkStatusService.NetworkedFeature.musicMarketplace) && featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace)) {
                                                mediaItemQuery = new MS.Entertainment.Data.Query.Music.AlbumWithTracks;
                                                mediaItemQuery.id = query.result.item.serviceId;
                                                mediaItemQuery.idType = query.result.item.serviceIdType;
                                                mediaItemQuery.impressionGuid = query.result.item.impressionGuid
                                            }
                                            break;
                                        case"Artist":
                                            if (MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.networkStatus).isEnabled(MS.Entertainment.UI.NetworkStatusService.NetworkedFeature.musicMarketplace) && featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace)) {
                                                mediaItemQuery = new MS.Entertainment.Data.Query.Music.ArtistDetails;
                                                mediaItemQuery.id = query.result.item.serviceId;
                                                mediaItemQuery.idType = query.result.item.serviceIdType;
                                                mediaItemQuery.impressionGuid = query.result.item.impressionGuid
                                            }
                                            break;
                                        case"MusicVideo":
                                            if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace)) {
                                                mediaItemQuery = new MS.Entertainment.Data.Query.Music.MusicVideoDetails;
                                                mediaItemQuery.id = query.result.item.serviceId;
                                                mediaItemQuery.idType = query.result.item.serviceIdType;
                                                mediaItemQuery.impressionGuid = query.result.item.impressionGuid
                                            }
                                            break;
                                        case"Episode":
                                            if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace)) {
                                                mediaItemQuery = new MS.Entertainment.Data.Query.Video.EdsDetailTVEpisode;
                                                mediaItemQuery.id = query.result.item.serviceId;
                                                mediaItemQuery.idType = query.result.item.serviceIdType;
                                                mediaItemQuery.impressionGuid = query.result.item.impressionGuid
                                            }
                                            break;
                                        case"Series":
                                            if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace)) {
                                                mediaItemQuery = new MS.Entertainment.Data.Query.Video.EdsDetailTVSeries;
                                                mediaItemQuery.id = query.result.item.serviceId;
                                                mediaItemQuery.idType = query.result.item.serviceIdType;
                                                mediaItemQuery.impressionGuid = query.result.item.impressionGuid
                                            }
                                            break;
                                        case"Season":
                                            if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace)) {
                                                mediaItemQuery = new MS.Entertainment.Data.Query.Video.EdsDetailTVSeason;
                                                mediaItemQuery.id = query.result.item.serviceId;
                                                mediaItemQuery.idType = query.result.item.serviceIdType;
                                                mediaItemQuery.impressionGuid = query.result.item.impressionGuid
                                            }
                                            break;
                                        default:
                                            break
                                    }
                                if (mediaItemQuery)
                                    mediaItemQuery.execute().then(function mediaItemQuerySuccess(query) {
                                        c(query.result.item)
                                    }, function mediaItemQueryError(error) {
                                        e(error.errorCode)
                                    });
                                else
                                    e()
                            }, function contentTypeQueryError(error) {
                                e(error.errorCode)
                            })
                        }
                        else
                            e()
                    })
            }, getMediaByTitleIdAssetId: function getMediaByTitleIdAssetId(titleId, assetId) {
                return new WinJS.Promise(function(c, e, p) {
                        var videoDetailsQuery = new MS.Entertainment.Data.Query.Video.EdsVideoDetailsFromTitleIdAssetId;
                        videoDetailsQuery.assetId = assetId;
                        videoDetailsQuery.titleId = "0x" + titleId.toString(16);
                        var executeQuery = function executeQuery(authHeader) {
                                if (authHeader)
                                    videoDetailsQuery.addHeader(authHeader.key, authHeader.value);
                                videoDetailsQuery.execute().then(function videoDetailsQuerySuccess(query) {
                                    var item = (query.result.items && query.result.items.length > 0) ? query.result.items[0] : query.result.item;
                                    c(item)
                                }, function videoDetailsQueryFailed(error) {
                                    e(error.errorCode)
                                })
                            };
                        if (MS.Entertainment.Utilities.isEDSAuthRequired()) {
                            var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                            if (signIn.isSignedIn)
                                signIn.getAuthHeader().then(function getAuthHeaderSuccess(authHeader) {
                                    executeQuery(authHeader)
                                }, function getAuthHeaderError() {
                                    e()
                                })
                        }
                        else
                            executeQuery(null)
                    })
            }, getGameMediaByTitleId: function getGameMediaByTitleId(titleId) {
                titleId = parseInt(titleId);
                if (!titleId)
                    return WinJS.Promise.wrapError(null);
                var edsMediaItem = MS.Entertainment.Data.augment({TitleId: titleId}, MS.Entertainment.Data.Augmenter.Marketplace.XboxGame);
                MS.Entertainment.ViewModels.MediaItemModel.augment(edsMediaItem);
                if (edsMediaItem.hydrate)
                    return edsMediaItem.hydrate().then(function hydrateSuccess() {
                            return edsMediaItem
                        }, function hydrateFailed() {
                            return edsMediaItem
                        });
                else
                    return WinJS.Promise.wrap(edsMediaItem)
            }, getMusicMediaByServiceId: function _getArtistMediaByServiceId(serviceId, serviceIdType, mediaType) {
                var featureEnablement = this._getFeatureEnablement();
                return new WinJS.Promise(function(c, e, p) {
                        if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace) && MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.networkStatus).isEnabled(MS.Entertainment.UI.NetworkStatusService.NetworkedFeature.musicMarketplace)) {
                            var useCanonicalId = true;
                            if (serviceIdType) {
                                var idType = serviceIdType.toLocaleLowerCase();
                                if (idType === MS.Entertainment.Data.Query.edsIdType.canonical.toLocaleLowerCase())
                                    useCanonicalId = true;
                                else if (idType.toLocaleLowerCase() === MS.Entertainment.Data.Query.edsIdType.zuneCatalog.toLocaleLowerCase())
                                    useCanonicalId = false;
                                else
                                    MS.Entertainment.UI.Components.Shell.fail("Unknown media ID type.")
                            }
                            var item = useCanonicalId ? {ID: serviceId} : {ZuneId: serviceId};
                            item.location = MS.Entertainment.Pages.BaseMediaInlineDetails.Location.marketplace;
                            switch (mediaType.toLocaleLowerCase()) {
                                case MS.Entertainment.Data.Query.edsMediaType.musicArtist.toLocaleLowerCase():
                                    var artist = MS.Entertainment.Data.augment(item, MS.Entertainment.Data.Augmenter.Marketplace.EDSArtist);
                                    if (artist) {
                                        MS.Entertainment.ViewModels.MediaItemModel.augment(artist);
                                        artist.hydrate().done(function completeHydrate(media) {
                                            c(media)
                                        }, function hydrateError(media) {
                                            e(artist)
                                        })
                                    }
                                    else
                                        e(artist);
                                    break;
                                case MS.Entertainment.Data.Query.edsMediaType.album.toLocaleLowerCase():
                                    var album = MS.Entertainment.Data.augment(item, MS.Entertainment.Data.Augmenter.Marketplace.EDSAlbum);
                                    if (album) {
                                        MS.Entertainment.ViewModels.MediaItemModel.augment(album);
                                        album.hydrate().done(c(album), e(album))
                                    }
                                    else
                                        e(album);
                                    break;
                                case MS.Entertainment.Data.Query.edsMediaType.track.toLocaleLowerCase():
                                    var track = MS.Entertainment.Data.augment(item, MS.Entertainment.Data.Augmenter.Marketplace.EDSTrack);
                                    if (track) {
                                        MS.Entertainment.ViewModels.MediaItemModel.augment(track);
                                        track.hydrate({forceUpdate: true}).done(c(track), e(track))
                                    }
                                    else
                                        e(track);
                                    break;
                                default:
                                    MS.Entertainment.UI.Components.Shell.fail("Unknown desired media type.");
                                    break
                            }
                        }
                        else
                            e(null)
                    })
            }, isXboxConsoleAvailableInRegion: function _isXboxConsoleAvailableInRegion() {
                var result = this._getFeatureEnablement().isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.xbox360ConsoleRegions);
                return result
            }, isCompanionAppSignInAvailable: function _isCompanionAppSignInAvailable() {
                return this._getFeatureEnablement().isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.smartGlassSignInAvailable)
            }, isPlayToXboxFeatureEnabled: function _isPlayToXboxFeatureEnabled(mediaItem) {
                var result = this.isXboxConsoleAvailableInRegion();
                return result
            }, isClosedCaptionFeatureEnabled: function _isClosedCaptionFeatureEnabled() {
                return false
            }, playMedia: function playMedia(mediaItem, showDetails, startPositionMsec) {
                this.playMedia2(mediaItem, {
                    sessionId: MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying, autoPlay: true, startPositionMsec: startPositionMsec, showImmersive: true, immersiveOptions: {
                            sessionId: MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying, startFullScreen: !showDetails
                        }
                })
            }, playMediaOnXbox: function playMediaOnXbox(mediaItem, titleId, deepLinkInfo, startPositionMsec) {
                this.playMedia2(mediaItem, {
                    sessionId: MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.remoteLRC, titleId: titleId, autoPlay: true, deepLinkInfo: deepLinkInfo, startPositionMsec: startPositionMsec, showImmersive: true, showSmartGlassActivity: true, showAppBar: false, appBarHideTimeoutMS: MS.Entertainment.UI.Controls.BottomAppBar.defaultCompanionHideTimeoutMS, immersiveOptions: {
                            sessionId: MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.remoteLRC, startFullScreen: false
                        }
                })
            }, showImmersiveDetails: function showImmersiveDetails(mediaItem, showDetails, autoPlay, hub, options, sessionId, completeCallBack, titleId, deepLink, startPositionMsec) {
                var immersiveOptions = {
                        startFullScreen: !showDetails, hub: hub, panelOptions: options, sessionId: sessionId
                    };
                var playOptions = {
                        autoPlay: autoPlay, showImmersive: true, immersiveOptions: immersiveOptions, sessionId: sessionId, titleId: titleId, deepLink: deepLink, startPositionMsec: startPositionMsec
                    };
                if (autoPlay)
                    this.playMedia2(mediaItem, playOptions);
                else
                    this.showImmersive(mediaItem, immersiveOptions)
            }, addToNowPlaying: function addToNowPlaying(mediaItem, collectionFilter) {
                this.playMedia2(mediaItem, {
                    autoPlay: true, showAppBar: true, queueMedia: true, showImmersive: false, preservePlayContext: true, collectionFilter: collectionFilter
                })
            }, waitForTransportStateOrTimeout: function waitForTransportStateOrTimeout(tsToWaitFor, tmoMsec) {
                MS.Entertainment.Platform.Playback.Etw.traceString("+PlaybackHelpers::waitForTransportStateOrTimeout(" + tsToWaitFor + ", " + tmoMsec + ")");
                var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                var playbackSession = sessionMgr.primarySession;
                var uberPromise = new WinJS.Promise(function _uberPromise(c, e, p) {
                        var tmoPromise = null;
                        var tsChanged = function _tsChanged(transportState) {
                                if (transportState === tsToWaitFor) {
                                    MS.Entertainment.Platform.Playback.Etw.traceString("PlaybackHelpers::waitForTransportStateOrTimeout, tsChanged : " + transportState);
                                    playbackSession.unbind("currentTransportState", tsChanged);
                                    if (tmoPromise)
                                        tmoPromise.cancel();
                                    c()
                                }
                                else if (playbackSession.playerState === MS.Entertainment.Platform.Playback.PlayerState.error && playbackSession.errorDescriptor) {
                                    MS.Entertainment.Platform.Playback.Etw.traceString("PlaybackHelpers::waitForTransportStateOrTimeout, playerState error");
                                    playbackSession.unbind("currentTransportState", tsChanged);
                                    if (tmoPromise)
                                        tmoPromise.cancel();
                                    c()
                                }
                            };
                        var tmoExpired = function _tmoExpired() {
                                MS.Entertainment.Platform.Playback.Etw.traceString("PlaybackHelpers::waitForTransportStateOrTimeout, timed out");
                                playbackSession.unbind("currentTransportState", tsChanged);
                                c()
                            };
                        tmoPromise = WinJS.Promise.timeout(tmoMsec).then(tmoExpired);
                        playbackSession.bind("currentTransportState", tsChanged)
                    });
                MS.Entertainment.Platform.Playback.Etw.traceString("-PlaybackHelpers::waitForTransportStateOrTimeout");
                return uberPromise
            }, playMedia2: function playMedia2(mediaItem, options) {
                var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                var playOptions = options || {};
                if (playOptions.playContext) {
                    MS.Entertainment.Platform.PlaybackHelpers.assert(!playOptions.preservePlayContext, "preservePlayContext and playContext both supplied; the session playContext will not be changed.");
                    MS.Entertainment.Platform.PlaybackHelpers.assert(!playOptions.playContext.isSmartDJ || playOptions.playContext.artistSeed, "isSmartDJ parameter is set in the playback context, but no SmartDJ seed was specified.")
                }
                playOptions.autoPlay = (playOptions.autoPlay !== undefined) ? playOptions.autoPlay : true;
                playOptions.showImmersive = (playOptions.showImmersive !== undefined) ? playOptions.showImmersive : false;
                MS.Entertainment.Platform.PlaybackHelpers.playActionInitiated = true;
                MS.Entertainment.Platform.Playback.Etw.traceString("+PlaybackHelpers::playMedia2" + ", autoPlay=" + playOptions.autoPlay + ", showImmersive=" + playOptions.showImmersive + ", showAppbar=" + playOptions.showAppBar + ", preventNavigateToDefault=" + playOptions.preventNavigateToDefault + ", callback=" + (playOptions.completeCallBack ? true : false));
                var immersiveOptions = playOptions.immersiveOptions ? playOptions.immersiveOptions : {};
                if (!playOptions.sessionId)
                    playOptions.sessionId = sessionMgr.primarySession.sessionId;
                if (!playOptions.setOnly && !options.queueMedia && this.forceFullScreenNowPlaying) {
                    playOptions.showImmersive = true;
                    playOptions.showAppBar = false
                }
                if (mediaItem && mediaItem.playPreviewOnly)
                    playOptions.sessionId = MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying;
                immersiveOptions.sessionId = playOptions.sessionId;
                var validateExplicitPrivilege = true;
                var doPlay = function doPlay(userCancelled) {
                        if (userCancelled)
                            return;
                        MS.Entertainment.Platform.Playback.Etw.traceString("+PlaybackHelpers::doPlay");
                        this._validateMediaItem(mediaItem, validateExplicitPrivilege).then(function validateMediaItem_completed() {
                            MS.Entertainment.Platform.PlaybackHelpers._play(mediaItem, playOptions);
                            if (playOptions.showImmersive)
                                MS.Entertainment.Platform.PlaybackHelpers.waitForTransportStateOrTimeout(MS.Entertainment.Platform.Playback.TransportState.starting, 2500).then(function _delayedShowImmersive() {
                                    var playbackSession = sessionMgr.nowPlayingSession;
                                    if (playbackSession.playerState !== MS.Entertainment.Platform.Playback.PlayerState.error)
                                        MS.Entertainment.Platform.PlaybackHelpers.showImmersive(mediaItem, immersiveOptions);
                                    else {
                                        var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                                        if (!navigationService.currentPage)
                                            navigationService.navigateToDefaultPage()
                                    }
                                });
                            else if (!playOptions.preventNavigateToDefault) {
                                var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                                if (!navigationService.currentPage)
                                    navigationService.navigateToDefaultPage()
                            }
                            if (!MS.Entertainment.Utilities.isApp2 && playOptions.showAppBar) {
                                var playbackSession = sessionMgr.nowPlayingSession;
                                var showPromise = null;
                                var appBarShown = false;
                                var showPromiseTimeoutMS = 1200;
                                var onPlaybackStarted = function showAppBarOnPlaybackStart(currentPlaybackState) {
                                        if (currentPlaybackState === MS.Entertainment.Platform.Playback.TransportState.starting || currentPlaybackState === MS.Entertainment.Platform.Playback.TransportState.playing) {
                                            if (showPromise)
                                                showPromise.cancel();
                                            showAppBar()
                                        }
                                        else if (playbackSession.errorDescriptor)
                                            playbackSession.unbind("currentTransportState", onPlaybackStarted)
                                    };
                                var showAppBar = function showAppBar() {
                                        if (appBarShown)
                                            return;
                                        appBarShown = true;
                                        playbackSession.unbind("currentTransportState", onPlaybackStarted);
                                        showPromise = null;
                                        MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar).show((isNaN(playOptions.appBarHideTimeoutMS) ? MS.Entertainment.UI.Controls.BottomAppBar.defaultHideTimeoutMS : playOptions.appBarHideTimeoutMS))
                                    };
                                showPromise = WinJS.Promise.timeout(showPromiseTimeoutMS).done(showAppBar);
                                playbackSession.bind("currentTransportState", onPlaybackStarted)
                            }
                            if (playOptions.completeCallBack)
                                playOptions.completeCallBack();
                            {}
                        }.bind(this));
                        MS.Entertainment.Platform.Playback.Etw.traceString("-PlaybackHelpers::doPlay")
                    }.bind(this);
                if (sessionMgr.lrcSession && playOptions.sessionId === sessionMgr.lrcSession.sessionId) {
                    validateExplicitPrivilege = false;
                    if (!playOptions.titleId)
                        playOptions.titleId = MS.Entertainment.Platform.LivingRoomCompanion.WellKnownTitleId.ze;
                    if (!(sessionMgr.lrcSession && sessionMgr.lrcSession.sessionState === MS.Entertainment.Platform.LivingRoomCompanion.SessionState.connected))
                        this._showConnectionDialog(doPlay);
                    else if (parseInt(playOptions.titleId) === sessionMgr.lrcSession.currentTitleId || sessionMgr.lrcSession.currentTitleId === MS.Entertainment.Platform.LivingRoomCompanion.WellKnownTitleId.dd || sessionMgr.lrcSession.currentTitleId === MS.Entertainment.Platform.LivingRoomCompanion.WellKnownTitleId.bb || sessionMgr.lrcSession.currentTitleId === MS.Entertainment.Platform.LivingRoomCompanion.WellKnownTitleId.ze || sessionMgr.lrcSession.currentTitleId === MS.Entertainment.Platform.LivingRoomCompanion.WellKnownTitleId.mc)
                        doPlay();
                    else {
                        MS.Entertainment.UI.Controls.XBoxControls.hide();
                        this._showConfirmationDialog(doPlay, function handleNoInterrupt() {
                            var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                            if (!navigationService.currentPage)
                                navigationService.navigateToDefaultPage()
                        }.bind(this))
                    }
                }
                else
                    doPlay();
                MS.Entertainment.Platform.Playback.Etw.traceString("-PlaybackHelpers::playMedia2")
            }, showImmersive: function showImmersive(mediaItem, immersiveOptions) {
                var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                immersiveOptions = immersiveOptions ? immersiveOptions : {};
                immersiveOptions.startFullScreen = (immersiveOptions.startFullScreen !== undefined) ? immersiveOptions.startFullScreen : false;
                if (!MS.Entertainment.Data.List.isListOrArray(mediaItem) && !MS.Entertainment.Data.MainQuery.isQuery(mediaItem))
                    immersiveOptions.mediaItem = mediaItem;
                if (immersiveOptions.sessionId) {
                    if (!immersiveOptions.mediaItem) {
                        var playbackSession = sessionMgr.getSession(immersiveOptions.sessionId);
                        immersiveOptions.mediaItem = playbackSession.currentMedia
                    }
                    if (this.useFullScreenNowPlaying || this.forceFullScreenNowPlaying)
                        immersiveOptions.startFullScreen = true
                }
                if (immersiveOptions.mediaItem) {
                    if (immersiveOptions.startFullScreen && (this.useFullScreenNowPlaying || this.forceFullScreenNowPlaying))
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigateTo(MS.Entertainment.UI.Monikers.fullScreenNowPlaying);
                    else {
                        var forcePageChange = true;
                        if (immersiveOptions.overridePageChange !== undefined)
                            forcePageChange = immersiveOptions.overridePageChange;
                        else {
                            var currentLocation = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).getUserLocation();
                            if (currentLocation === MS.Entertainment.UI.Monikers.immersiveDetails) {
                                var currentPage = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).currentPage;
                                if (currentPage.options.mediaItem.isEqual && immersiveOptions.mediaItem.isChildOf && immersiveOptions.mediaItem.sharesParentWith)
                                    forcePageChange = !(currentPage.options.mediaItem.isEqual(immersiveOptions.mediaItem) || immersiveOptions.mediaItem.isChildOf(currentPage.options.mediaItem) || immersiveOptions.mediaItem.sharesParentWith(currentPage.options.mediaItem))
                            }
                        }
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigateTo(MS.Entertainment.UI.Monikers.immersiveDetails, null, null, immersiveOptions, forcePageChange)
                    }
                    if (immersiveOptions.completeCallback)
                        immersiveOptions.completeCallback(true);
                    {}
                }
                else if (immersiveOptions.forceNavigate) {
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigateTo(MS.Entertainment.UI.Monikers.immersiveDetails, null, null, immersiveOptions, forcePageChange);
                    if (immersiveOptions.completeCallback)
                        immersiveOptions.completeCallback(true);
                    {}
                }
                else {
                    var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                    if (!navigationService.currentPage)
                        navigationService.navigateToDefaultPage();
                    if (immersiveOptions.completeCallback)
                        immersiveOptions.completeCallback(false);
                    {}
                }
            }, playToXbox: function playToXbox(mediaItem, provider, startPositionMsec) {
                if (!mediaItem)
                    return;
                var mediaItemModel = mediaItem;
                var _getInfoAndLaunchCompanion = function _getInfoAndLaunchCompanion() {
                        var titleId = provider ? provider.partnerApplicationLaunchInfoList[0].TitleId : MS.Entertainment.Platform.LivingRoomCompanion.WellKnownTitleId.ze;
                        var deepLinkInfo = provider ? provider.partnerApplicationLaunchInfoList[0].deepLinkInfo : null;
                        var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                        var session = sessionMgr.primarySession;
                        if (mediaItemModel.mediaType === Microsoft.Entertainment.Queries.ObjectType.game)
                            titleId = mediaItemModel.titleId;
                        var launchInfo = "xboxsmartglass://launchTitle/?";
                        launchInfo += "titleId=" + titleId + "&mediaType=" + mediaItemModel.mediaType;
                        if (mediaItemModel.hasZuneId)
                            launchInfo += "&serviceId=" + mediaItemModel.zuneId;
                        else if (mediaItemModel.hasServiceId)
                            launchInfo += "&serviceId=" + mediaItemModel.serviceId;
                        if (deepLinkInfo)
                            launchInfo += "&deepLinkInfo=" + encodeURIComponent(deepLinkInfo);
                        if (startPositionMsec)
                            launchInfo += "&startPositionMsec=" + startPositionMsec;
                        launchInfo += "&firstAction=playnow";
                        var appAction = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.launchApp);
                        appAction.automationId = MS.Entertainment.UI.AutomationIds.launchAppPlayToXbox;
                        appAction.parameter = {
                            uri: launchInfo, appendSource: true, appendGamerTag: true
                        };
                        appAction.execute()
                    }.bind(this);
                if (!mediaItem.hydrated) {
                    var mediaItemModel = MS.Entertainment.ViewModels.MediaItemModel.augment(mediaItem);
                    if (mediaItemModel.hydrate)
                        mediaItemModel.hydrate().then(function _hydrated() {
                            _getInfoAndLaunchCompanion()
                        })
                }
                else
                    _getInfoAndLaunchCompanion()
            }, playToXboxPauseLocalPlayback: function _playToXboxPauseLocalPlayback(mediaItem, provider, startPositionMsec) {
                var sessionManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                if (sessionManager && sessionManager.primarySession.sessionId === MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying)
                    switch (sessionManager.primarySession.targetTransportState) {
                        case MS.Entertainment.Platform.Playback.TransportState.playing:
                        case MS.Entertainment.Platform.Playback.TransportState.starting:
                        case MS.Entertainment.Platform.Playback.TransportState.buffering:
                            sessionManager.primarySession.targetTransportState = MS.Entertainment.Platform.Playback.TransportState.paused;
                            break
                    }
                this.playToXbox(mediaItem, provider, startPositionMsec)
            }, playFromXbox: function playFromXbox(mediaItem, startPositionMsec) {
                if (!mediaItem)
                    return;
                MS.Entertainment.Platform.PlaybackHelpers.assert(mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.video, "playFromXbox: only video can be transfered to X8");
                var mediaItemModel = mediaItem;
                function _getInfoAndLaunchX8() {
                    var launchInfo = "microsoftvideo://play/?id=" + mediaItemModel.serviceId;
                    if (startPositionMsec)
                        launchInfo += "&startPositionMsec=" + startPositionMsec;
                    var appAction = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.launchApp);
                    appAction.automationId = MS.Entertainment.UI.AutomationIds.launchAppVideoApp;
                    appAction.parameter = {
                        uri: launchInfo, appendSource: true, appendGamerTag: true
                    };
                    appAction.execute()
                }
                if (!mediaItem.hydrated && !mediaItem.hasServiceId) {
                    var mediaItemModel = MS.Entertainment.ViewModels.MediaItemModel.augment(mediaItem);
                    if (mediaItemModel.hydrate)
                        mediaItemModel.hydrate().then(function _hydrated() {
                            _getInfoAndLaunchX8()
                        })
                }
                else
                    _getInfoAndLaunchX8()
            }, showPlaybackError: function showPlaybackError(error) {
                var title = String.load(String.id.IDS_PLAYBACK_ERROR_MESSAGE_TITLE);
                return MS.Entertainment.UI.Shell.showError(title, error.code)
            }, showItemDetails: function showItemDetails(popOverOptions, immersiveOptions) {
                var mediaItem = null;
                if (popOverOptions && popOverOptions.dataContext)
                    mediaItem = popOverOptions.dataContext.data;
                MS.Entertainment.Platform.PlaybackHelpers.assert(mediaItem, "popOverOptions.dataContext.data required to show item details");
                if (mediaItem)
                    MS.Entertainment.UI.Controls.PopOver.showPopOver(popOverOptions)
            }, _validateMediaItem: function _validateMediaItem(mediaItem, validateExplicitPrivilege) {
                var validateAccountHasExplicitPrivilege = function validateAccountHasExplicitPrivilege() {
                        var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                        if (!validateExplicitPrivilege || signedInUser.hasExplicitPrivilege)
                            return WinJS.Promise.wrap();
                        else
                            return this.showPlaybackError(MS.Entertainment.Platform.Playback.Error.NS_E_EXPLICIT_CONTENT_BLOCKED).then(function() {
                                    return WinJS.Promise.wrapError(error)
                                })
                    }.bind(this);
                var validateGameMediaItem = function validateGameMediaItem() {
                        var signInService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                        if (signInService.isSignedIn)
                            return validateAccountHasExplicitPrivilege();
                        else
                            return signInService.signIn().then(function signin_completed() {
                                    if (signInService.isSignedIn)
                                        return validateAccountHasExplicitPrivilege();
                                    else
                                        return this.showPlaybackError(MS.Entertainment.Platform.Playback.Error.NS_E_EXPLICIT_CONTENT_SIGNIN_REQUIRED).then(function() {
                                                return WinJS.Promise.wrapError(error)
                                            })
                                }.bind(this))
                    }.bind(this);
                if (mediaItem && mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.game)
                    return validateGameMediaItem();
                else
                    return WinJS.Promise.wrap()
            }, _setProperty: function _setProperty(item, propertyName, propertyValue) {
                if (propertyName in item)
                    item[propertyName] = propertyValue;
                else
                    item.addProperty(propertyName, propertyValue)
            }, _setMediaAvailability: function _setMediaAvailability(mediaItem, mediaAvailabilty){}, _play: function _play(mediaItem, options) {
                var trackToSearchFor = options && options.track;
                var compareTrackItem = function compareTrackItem() {
                        return this.data.isEqual(trackToSearchFor)
                    };
                compareTrackItem.track = trackToSearchFor;
                if (options.playPreviewOnly)
                    mediaItem.playPreviewOnly = true;
                MS.Entertainment.Platform.Playback.Etw.traceString("+PlaybackHelpers::_play");
                var ensurePreownedMediaAddedAsyncPromise = WinJS.Promise.wrap();
                if (mediaItem && !mediaItem.playPreviewOnly)
                    ensurePreownedMediaAddedAsyncPromise = MS.Entertainment.Platform.PurchaseHelpers.ensurePreownedMediaAddedAsync(mediaItem);
                MS.Entertainment.Platform.Playback.Etw.traceString("+PlaybackHelpers::ensurePreownedMediaAddedAsyncPromise");
                return ensurePreownedMediaAddedAsyncPromise.then(function ensurePreownedMediaAddedAsync_complete(dbResult) {
                        MS.Entertainment.Platform.Playback.Etw.traceString("-PlaybackHelpers::ensurePreownedMediaAddedAsyncPromise");
                        var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                        var playbackSession = sessionMgr.setPrimarySession(options.sessionId);
                        playbackSession.shuffle = options.shuffle !== undefined ? options.shuffle : playbackSession.shuffle;
                        playbackSession.smartDJSeed = options.smartDJSeed !== undefined ? options.smartDJSeed : null;
                        var startPositionMsec = 0 | options.startPositionMsec;
                        var autoPlay = (typeof options.autoPlay) === "boolean" ? options.autoPlay : playbackSession.autoPlay;
                        playbackSession.autoPlay = autoPlay;
                        if (options.sessionId === MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying) {
                            this._setMediaAvailability(mediaItem, options.collectionFilter);
                            if (options.queueMedia && !options.setOnly) {
                                MS.Entertainment.Platform.Playback.Etw.traceString("PlaybackHelpers queueItem: appending");
                                var getCountPromise = playbackSession.mediaCollection ? playbackSession.mediaCollection.getCount() : WinJS.Promise.wrap(0);
                                getCountPromise.done(function insertNewMedia(currentCount) {
                                    playbackSession.insertAtEnd(null, mediaItem).done(function playIfPaused() {
                                        MS.Entertainment.Platform.Playback.Etw.traceString("PlaybackHelpers queueItem: append complete");
                                        if (options.autoPlay && (playbackSession.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.paused || playbackSession.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.stopped || playbackSession.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.unInitialize))
                                            playbackSession.playAt(currentCount)
                                    })
                                })
                            }
                            else {
                                playbackSession.setDataSource(mediaItem).done(function dataSourceSet(mediaCollection) {
                                    if (!!options.setOnly) {
                                        if (mediaCollection) {
                                            var list = mediaCollection.createListBinding();
                                            list.fromIndex(0).then(function first_in_collection(item) {
                                                if (item) {
                                                    if (!item.data.hydrate) {
                                                        item.data.location = MS.Entertainment.Pages.BaseMediaInlineDetails.Location.marketplace;
                                                        MS.Entertainment.ViewModels.MediaItemModel.augment(item.data)
                                                    }
                                                    if (!item.data.hydrated) {
                                                        var setCurrentMedia = function setCurrentMedia() {
                                                                playbackSession.currentMedia = item.data
                                                            };
                                                        item.data.hydrate({forceUpdate: true}).done(setCurrentMedia, setCurrentMedia)
                                                    }
                                                    else
                                                        playbackSession.currentMedia = item.data
                                                }
                                                list.release()
                                            })
                                        }
                                        return
                                    }
                                    if (typeof(options.offset) !== "number" && options.offset < 0)
                                        options.offset = null;
                                    if (startPositionMsec > 0)
                                        playbackSession.playAt(options.offset || 0, startPositionMsec);
                                    else {
                                        playbackSession.autoPlay = autoPlay;
                                        if (options.offset === null)
                                            playbackSession.activate(document.createElement("div"));
                                        else if (!trackToSearchFor)
                                            playbackSession.playAt(options.offset);
                                        else
                                            playbackSession.playAt(options.offset, 0, compareTrackItem)
                                    }
                                }.bind(this), function dataSourceSetFailed(error){});
                                if (!options.preservePlayContext && !options.queueMedia)
                                    sessionMgr.playContext = options.playContext || {}
                            }
                            var isPlaylist = mediaItem.execute !== undefined || mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.track || mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.album || mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.person || mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.playlist || (Array.isArray(mediaItem) && mediaItem.length > 1) || (MS.Entertainment.Data.List.isList(mediaItem) && mediaItem.count > 0) || (mediaItem.source && mediaItem.source.length > 1);
                            if ((options.saveNowPlaying === undefined || options.saveNowPlaying) && isPlaylist && !options.playPreviewOnly) {
                                if (MS.Entertainment.Platform.PlaybackHelpers._saveNowPlayingPromise) {
                                    MS.Entertainment.Platform.PlaybackHelpers._saveNowPlayingPromise.cancel();
                                    MS.Entertainment.Platform.PlaybackHelpers._saveNowPlayingPromise = null
                                }
                                MS.Entertainment.Platform.PlaybackHelpers._saveNowPlayingPromise = WinJS.Promise.timeout(MS.Entertainment.Platform.PlaybackHelpers._saveNowPlayingTimeout).then(function saveNowPlaying() {
                                    playbackSession.savePlaylist(null, true);
                                    MS.Entertainment.Platform.PlaybackHelpers._saveNowPlayingPromise = null
                                })
                            }
                        }
                        else if (options.sessionId === MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.remoteLRC) {
                            if (!options.titleId)
                                options.titleId = MS.Entertainment.Platform.LivingRoomCompanion.WellKnownTitleId.ze;
                            sessionMgr.nowPlayingSession.targetTransportState = MS.Entertainment.Platform.Playback.TransportState.stopped;
                            MS.Entertainment.UI.Controls.ActivityOverlay.lastAutoLaunchId = null;
                            if (options.queueMedia)
                                playbackSession.insertAtEnd(null, mediaItem);
                            else
                                playbackSession.setDataSource(mediaItem, options.deepLinkInfo).then(function dataSourceSet() {
                                    playbackSession.playAt(options.titleId, startPositionMsec, MS.Entertainment.Platform.LivingRoomCompanion.LaunchFirstAction.playNow)
                                }.bind(this))
                        }
                        MS.Entertainment.Platform.Playback.Etw.traceString("-PlaybackHelpers::_play")
                    }.bind(this), function ensurePreownedMediaAddedAsync_error(e) {
                        MS.Entertainment.UI.Controls.assert(false, "ensurePreownedMediaAddedAsync invoked the error handler.")
                    }.bind(this))
            }, _showConnectionDialog: function _showConnectionDialog(callBack) {
                MS.Entertainment.UI.Controls.ConnectionDialog.showCompanionConnectionDialog(callBack, true, true)
            }, _showConfirmationDialog: function _showConfirmationDialog(yesCallback, noCallback) {
                MS.Entertainment.UI.Shell.showMessageBox(String.load(String.id.IDS_APPBAR_MESSAGE_XBOX_INTERUPTION_TITLE), String.load(String.id.IDS_APPBAR_MESSAGE_XBOX_INTERUPTION_TEXT), {
                    width: "65%", height: "50%", buttons: [{
                                title: String.load(String.id.IDS_YES_BUTTON), execute: function(overlay) {
                                        overlay.hide();
                                        yesCallback()
                                    }, isEnabled: true, isAvailable: true
                            }, {
                                title: String.load(String.id.IDS_NO_BUTTON), execute: function(overlay) {
                                        overlay.hide();
                                        noCallback()
                                    }, isEnabled: true, isAvailable: true
                            }], automationId: "LeaveXboxSessionMessageBox"
                })
            }, isGame: function MediaInstance_isGame(mediaItem) {
                if (mediaItem)
                    return (mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.game)
            }, forceFullScreenNowPlaying: {get: function() {
                    return false
                }}, useFullScreenNowPlaying: {get: function() {
                    return false
                }}, _saveNowPlayingTimeout: 10000, _saveNowPlayingPromise: null, deferredUpdateTimeout: 100, playActionInitiated: false
    });
    WinJS.Namespace.define("MS.Entertainment.UI.Actions", {
        RemoveFromPlaybackSession: MS.Entertainment.derive(MS.Entertainment.UI.ToolbarAction, function RemoveFromPlaybackSession() {
            this.base()
        }, {
            automationId: MS.Entertainment.UI.AutomationIds.playlistRemoveFromNowPlaying, executed: function executed(param) {
                    param = this.transformParameter(param);
                    var keyPromise;
                    var mediaContext = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appToolbar).currentMediaContext;
                    if (param && param.mediaItem && param.mediaItem.mediaCollection)
                        if (param.key)
                            keyPromise = WinJS.Promise.wrap(param.key);
                        else if (param.mediaItem.mediaCollection.itemFromIndex)
                            keyPromise = param.mediaItem.mediaCollection.itemFromIndex(param.offset).then(function gotItem(item) {
                                return item.key
                            });
                    if (keyPromise)
                        keyPromise.then(function gotKey(key) {
                            param.mediaItem.mediaCollection.remove(key)
                        }, function failedToGetKey(error) {
                            MS.Entertainment.Platform.PlaybackHelpers.fail("Failed to remove item from now playing. Error message " + error && error.message)
                        }).done(function onComplete() {
                            if (mediaContext)
                                mediaContext.dispatchEvent(MS.Entertainment.UI.AppBarActions.removeFromNowPlaying)
                        })
                }, transformParameter: function transformParameter(parameter) {
                    return parameter
                }, canExecute: function canExecute(param) {
                    param = this.transformParameter(param);
                    var canExecute = !!param && MS.Entertainment.Platform.Playback.PlaybackSession.isPlaybackSession(param.mediaItem) && !!param.mediaItem.mediaCollection && (!!param.key || (typeof param.offset === "number" & param.offset >= 0));
                    return canExecute
                }
        }), PlayMedia: MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function PlayMedia() {
                this.base()
            }, {
                executed: function executed(param) {
                    var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                    var isImmersive = navigationService.checkUserLocation(MS.Entertainment.UI.Monikers.immersiveDetails);
                    var playContext = {};
                    if (param.playPreviewOnly)
                        param.mediaItem.playPreviewOnly = param.playPreviewOnly;
                    if (MS.Entertainment.Platform.Playback.PlaybackSession.isPlaybackSession(param.mediaItem)) {
                        var playbackEventNotifications = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.playbackEventNotifications);
                        playbackEventNotifications.clearErrors();
                        param.mediaItem.playAt(param.offset || 0)
                    }
                    else {
                        var mediaItem = param.mediaItem;
                        MS.Entertainment.Platform.PlaybackHelpers.playMedia2(mediaItem, {
                            sessionId: MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying, autoPlay: true, saveNowPlaying: true, startPositionMsec: param.startPositionMS, showImmersive: !!param.showImmersive, showAppBar: (!!param.showAppBar && !isImmersive), shuffle: param.shuffle, queueMedia: !!param.queueMedia, immersiveOptions: {
                                    sessionId: MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying, startFullScreen: !param.showDetails, overridePageChange: param.overridePageChange
                                }, offset: param.offset, track: param.track, playContext: playContext, playPreviewOnly: param.playPreviewOnly, preservePlayContext: param.preservePlayContext, collectionFilter: param.collectionFilter
                        })
                    }
                }.bind(this), canExecute: function canExecute(param) {
                        return param && param.mediaItem
                    }
            }), ShuffleNowPlaying: MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function ShuffleNowPlaying() {
                this.base()
            }, {
                forceTitleChange: true, automationId: MS.Entertainment.UI.AutomationIds.transportShuffle, executed: function executed(param) {
                        var playbackSession = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager).nowPlayingSession;
                        playbackSession.shuffle = !playbackSession.shuffle;
                        this.title = playbackSession.shuffle ? String.load(String.id.IDS_TRANSPORT_CONTROLS_SHUFFLE_ON_BUTTON) : String.load(String.id.IDS_TRANSPORT_CONTROLS_SHUFFLE_OFF_BUTTON)
                    }, canExecute: function canExecute(param) {
                        return true
                    }
            }), RepeatNowPlaying: MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function RepeatNowPlaying() {
                this.base()
            }, {
                forceTitleChange: true, automationId: MS.Entertainment.UI.AutomationIds.transportRepeat, executed: function executed(param) {
                        var playbackSession = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager).nowPlayingSession;
                        playbackSession.repeat = !playbackSession.repeat;
                        this.title = playbackSession.repeat ? String.load(String.id.IDS_TRANSPORT_CONTROLS_REPEAT_ON_BUTTON) : String.load(String.id.IDS_TRANSPORT_CONTROLS_REPEAT_OFF_BUTTON)
                    }, canExecute: function canExecute(param) {
                        return true
                    }
            }), ShowItemDetails: MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function showItemDetails() {
                this.base()
            }, {
                automationId: MS.Entertainment.UI.AutomationIds.showItemDetails, executed: function executed(popOverParameters) {
                        MS.Entertainment.Platform.PlaybackHelpers.showItemDetails(popOverParameters)
                    }, canExecute: function canExecute(param) {
                        return true
                    }
            })
    });
    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).register(MS.Entertainment.UI.Actions.ActionIdentifiers.playMedia, function() {
        return new MS.Entertainment.UI.Actions.PlayMedia
    });
    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).register(MS.Entertainment.UI.Actions.ActionIdentifiers.removeFromPlaybackSession, function() {
        return new MS.Entertainment.UI.Actions.RemoveFromPlaybackSession
    });
    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).register(MS.Entertainment.UI.Actions.ActionIdentifiers.shuffleNowPlaying, function() {
        return new MS.Entertainment.UI.Actions.ShuffleNowPlaying
    });
    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).register(MS.Entertainment.UI.Actions.ActionIdentifiers.repeatNowPlaying, function() {
        return new MS.Entertainment.UI.Actions.RepeatNowPlaying
    });
    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).register(MS.Entertainment.UI.Actions.ActionIdentifiers.showItemDetails, function() {
        return new MS.Entertainment.UI.Actions.ShowItemDetails
    })
})()
