/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Components/Playback/Controls/PlaybackControl.js", "/Framework/corefx.js", "/Framework/serviceLocator.js", "/Framework/utilities.js", "/ViewModels/MediaItemModel.js");
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {
    ImmersiveDetails: MS.Entertainment.UI.Framework.defineUserControl("Components/ImmersiveDetails/ImmersiveDetails.html#immersiveDetailsTemplate", function immersiveDetailsConstructor(element, options) {
        this.modelItem = {};
        var nowPlayingContainerReady = function() {
                this.domElement.removeEventListener("NowPlayingContainerReady", nowPlayingContainerReady);
                this.nowPlayingContainerReady()
            }.bind(this);
        this.domElement.addEventListener("NowPlayingContainerReady", nowPlayingContainerReady)
    }, {
        _mainHeader: null, _initialized: false, _mediaContext: null, _nowPlayingControl: null, _sessionMgr: null, _uiStateService: null, _shareOperation: null, _playStartTime: 0, _bindings: null, initialize: function initialize() {
                this._mainHeader = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.mainHeader);
                this._sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                this._uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                this._mediaContext = appBarService.pushDefaultContext();
                var page = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).currentPage;
                page.bind("options", this._pageOptionsChanged.bind(this))
            }, _handleNowPlayingVisibleChanged: function _handleNowPlayingVisibleChanged(newValue, oldValue) {
                if (oldValue !== undefined)
                    this._shareModelItem()
            }, _resetDefaultValues: function _resetDefaultValues() {
                if (this._nowPlayingControl)
                    MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar).repossessNowPlaying();
                this._nowPlayingControl = null;
                this.playbackSession = null;
                this.modelItem = null;
                this.options = null;
                this.nowPlayingVisible = false;
                this.nowPlayingInset = false
            }, _pageOptionsChanged: function _pageOptionsChanged(newVal, oldVal) {
                this.unload();
                this._resetDefaultValues();
                this.options = newVal || {};
                this.options.panelOptions = this.options.panelOptions || {};
                this._setupBindings();
                if (this.options.sessionId && !this.options.mediaItem)
                    this.playbackSession = this._sessionMgr.getSession(this.options.sessionId);
                else if (this.options.mediaItem) {
                    var mediaItem = this.options.mediaItem;
                    if (mediaItem.serviceType === MS.Entertainment.Data.Augmenter.ServiceTypes.editorialItem)
                        mediaItem = MS.Entertainment.Utilities.convertEditorialItem(mediaItem);
                    var nowPlayingSession = this._sessionMgr.getSession(MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying);
                    var isCurrentlyLoaded = false;
                    if (this.options.autoPlay) {
                        if (!this.options.sessionId)
                            this.options.sessionId = MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying;
                        if (Array.isArray(mediaItem))
                            this._play(mediaItem);
                        else {
                            var hydratePromise = this._updateMetaData(MS.Entertainment.ViewModels.MediaItemModel.augment(mediaItem));
                            if (hydratePromise && this.options.sessionId === MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.remoteLRC)
                                hydratePromise.then(function playMediaItem() {
                                    this._play(mediaItem)
                                }.bind(this), function playMediaItem() {
                                    this._play(mediaItem)
                                }.bind(this));
                            else if (!isCurrentlyLoaded || this.playbackSession.currentTransportState !== MSEPlatform.Playback.TransportState.playing)
                                this._play(mediaItem)
                        }
                    }
                    else
                        this._updateMetaData(MS.Entertainment.ViewModels.MediaItemModel.augment(mediaItem))
                }
                else
                    MS.Entertainment.UI.Controls.assert(false, "Immersive details not supplied with a sessionID or a mediaItem.");
                if (this.options.sessionId === MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.remoteLRC) {
                    this._sessionMgr.setPrimarySession(MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.remoteLRC);
                    if (this._sessionMgr.nowPlayingSession)
                        this._sessionMgr.nowPlayingSession.targetTransportState = MS.Entertainment.Platform.Playback.TransportState.stopped
                }
                if (this.options.showDetails)
                    this.showDetails();
                this._setInitialStates();
                this._initialized = true;
                this._updateStates()
            }, _setInitialStates: function _setInitialStates() {
                MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).nowPlayingInset = false;
                MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).nowPlayingVisible = false;
                if (this.options.showDetails)
                    if (this.options.autoPlay || this.playbackSession)
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).nowPlayingInset = true;
                    else {
                        WinJS.Promise.timeout(3000).then(function _delay() {
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).nowPlayingInset = true;
                            this._updateStates()
                        }.bind(this));
                        if (this.options.hub)
                            WinJS.Promise.timeout(4000).then(function _delay() {
                                if (this._hubStrip.defaultIndex !== 0 && this._hubStrip.defaultIndex < this._hubStrip.hubs.length)
                                    this._hubStrip.moveTo(this._hubStrip.defaultIndex, true)
                            }.bind(this))
                    }
            }, _setupBindings: function _setupBindings() {
                this.bind("playbackSession", this._playbackSessionChanged.bind(this))
            }, _canJoinRemote: function _canJoinRemote() {
                return this.playbackSession && this.playbackSession.currentMedia && this.playbackSession.currentMedia.mediaType !== Microsoft.Entertainment.Queries.ObjectType.game
            }, showDetails: function showDetails() {
                MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).nowPlayingInset = true;
                if (this._hubStrip.defaultIndex === 0)
                    this._hubStrip.moveTo(0, true);
                this._updateStates()
            }, hideDetails: function hideDetails() {
                MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).nowPlayingInset = false;
                this._hubStrip.moveTo(0, true);
                this._updateStates()
            }, unload: function unload() {
                this._unshareModelItem();
                this._detachBindings();
                if (this.modelItem && this.modelItem.liveQuery && this.modelItem.liveQuery.dispose) {
                    this.modelItem.liveQuery.dispose();
                    this.modelItem.liveQuery = null
                }
                if (this._mediaContext) {
                    this._mediaContext.clearContext();
                    this._mediaContext = null
                }
                MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
            }, _detachBindings: function _detachBindings() {
                if (this._bindings) {
                    this._bindings.cancel();
                    this._bindings = null
                }
            }, _playbackSessionChanged: function playbackSessionChanged() {
                this._detachBindings();
                if (this.playbackSession)
                    this._bindings = WinJS.Binding.bind(this, {
                        nowPlayingVisible: this._handleNowPlayingVisibleChanged.bind(this), playbackSession: {
                                currentMedia: this._mediaChanged.bind(this), canControlMedia: this._mediaChanged.bind(this)
                            }, _uiStateService: {nowPlayingInset: function nowPlayingInsetChanged(newVal, oldVal) {
                                    this._updateStates()
                                }.bind(this)}
                    })
            }, nowPlayingContainerReady: function nowPlayingContainerReady() {
                this._ensurePlaybackControl()
            }, _ensurePlaybackControl: function _ensurePlaybackControl() {
                var playbackContainer = MS.Entertainment.Utilities.getChildControl(this.domElement, "nowPlayingControlContainer");
                if (!playbackContainer || playbackContainer.domElement.children.length === 0)
                    this._nowPlayingControl = null;
                if (this.playbackSession && this.playbackSession.canControlMedia && playbackContainer && !this._nowPlayingControl && !MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isSnapped) {
                    this._createNowPlayingControl();
                    this._nowPlayingControl.playbackSession = this.playbackSession;
                    this._nowPlayingControl.bind("initialized", function initializedChanged() {
                        if (this._nowPlayingControl && this._nowPlayingControl.initialized)
                            this._nowPlayingControl.repossessNowPlaying()
                    }.bind(this))
                }
                MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).nowPlayingVisible = this.playbackSession && this.playbackSession.canControlMedia
            }, _mediaChanged: function _mediaChanged() {
                if (this.playbackSession && this.playbackSession.currentMedia && (!this.modelItem || (this.playbackSession.currentMedia.serviceId && this.modelItem.serviceId !== this.playbackSession.currentMedia.serviceId) || (this.playbackSession.currentMedia.libraryId && this.modelItem.libraryId !== this.playbackSession.currentMedia.libraryId) || (this.playbackSession.currentMedia.edsId && this.modelItem.edsId !== this.playbackSession.currentMedia.edsId) || (this.playbackSession.currentMedia.titleId && this.modelItem.titleId !== this.playbackSession.currentMedia.titleId)))
                    if (!this.modelItem)
                        this._updateMetaData(MS.Entertainment.ViewModels.MediaItemModel.augment(this.playbackSession.currentMedia));
                this._ensurePlaybackControl()
            }, _createNowPlayingControl: function _createNowPlayingControl() {
                if (this._nowPlayingControl)
                    return;
                var controlElement = document.createElement("div");
                controlElement.setAttribute("data-win-control", "MS.Entertainment.UI.Controls.NowPlaying");
                var nowPlayingControlContainer = MS.Entertainment.Utilities.getChildControl(this.domElement, "nowPlayingControlContainer");
                nowPlayingControlContainer.domElement.appendChild(controlElement);
                this._nowPlayingControl = new MS.Entertainment.UI.Controls.NowPlaying(controlElement, {});
                this._nowPlayingControl.onToggleDetailsVisibilityClicked = this._toggleDetailsVisibility.bind(this);
                this._updateStates()
            }, _toggleDetailsVisibility: function _toggleDetailsVisibility() {
                if (MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).nowPlayingInset)
                    this.hideDetails();
                else {
                    this.showDetails();
                    this.showBackButton()
                }
                if (this._nowPlayingControl)
                    this._nowPlayingControl.hideOverlays()
            }, _play: function play(mediaItem) {
                this._playStartTime = (new Date).getTime();
                if (!this.options.sessionId)
                    this.options.sessionId = MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying;
                if (!mediaItem)
                    mediaItem = this.modelItem;
                var ensurePreownedMediaAddedAsyncPromise = WinJS.Promise.wrap();
                if (mediaItem && !mediaItem.playPreviewOnly)
                    ensurePreownedMediaAddedAsyncPromise = MS.Entertainment.Platform.PurchaseHelpers.ensurePreownedMediaAddedAsync(mediaItem);
                return ensurePreownedMediaAddedAsyncPromise.then(function ensurePreownedMediaAddedAsync_complete(dbResult) {
                        var startPositionMsec = 0 | this.options.startPositionMsec;
                        this.playbackSession = this._sessionMgr.getSession(this.options.sessionId);
                        this.playbackSession.autoPlay = true;
                        this._sessionMgr.setPrimarySession(this.options.sessionId);
                        if (this.options.sessionId === MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying) {
                            this.playbackSession.setDataSource(mediaItem).then(function dataSourceSet() {
                                if (startPositionMsec > 0)
                                    this.playbackSession.playAt(0, startPositionMsec);
                                else
                                    this.playbackSession.activate(document.createElement("div"))
                            }.bind(this));
                            this.hideDetails()
                        }
                        else if (this.options.sessionId === MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.remoteLRC) {
                            if (!this.options.titleId)
                                this.options.titleId = MS.Entertainment.Platform.LivingRoomCompanion.WellKnownTitleId.ze;
                            this.playbackSession.setDataSource(mediaItem, this.options.deepLink).then(function dataSourceSet() {
                                this.playbackSession.playAt(this.options.titleId, startPositionMsec)
                            }.bind(this))
                        }
                    }.bind(this), function ensurePreownedMediaAddedAsync_error(e) {
                        MS.Entertainment.UI.Controls.assert(false, "ensurePreownedMediaAddedAsync invoked the error handler.")
                    }.bind(this))
            }, _playCallback: function _playCallback() {
                this._play();
                this._ensurePlaybackControl()
            }, _convertToTvSeries: function _convertToTvSeries(modelItem) {
                var seriesMediaItem = MS.Entertainment.Data.augment({
                        id: modelItem.seriesId, libraryId: modelItem.seriesLibraryId, title: {$value: modelItem.seriesTitle}
                    }, MS.Entertainment.Data.Augmenter.Marketplace.TVSeries);
                if (!this.modelItem || modelItem.seriesId !== this.modelItem.serviceId)
                    this._updateMetaData(MS.Entertainment.ViewModels.MediaItemModel.augment(seriesMediaItem));
                else if (this._hubStrip.hubs && this._hubStrip.hubs.length > 0 && this._hubStrip.hubs[0].isReady)
                    this.nowPlayingContainerReady()
            }, _convertToArtist: function _convertToArtist(modelItem) {
                var artistMediaItem = MS.Entertainment.Data.augment({
                        id: modelItem.artistServiceId, libraryId: modelItem.artistId, name: modelItem.artistName
                    }, MS.Entertainment.Data.Augmenter.Marketplace.Music.Artist);
                if (!this.modelItem || modelItem.artistServiceId !== this.modelItem.serviceId)
                    this._updateMetaData(MS.Entertainment.ViewModels.MediaItemModel.augment(artistMediaItem));
                else if (this._hubStrip.hubs && this._hubStrip.hubs.length > 0 && this._hubStrip.hubs[0].isReady)
                    this.nowPlayingContainerReady()
            }, _updateMetaData: function _updateMetaData(modelItem) {
                var defaultIndex = 0;
                if (!modelItem || !modelItem.mediaType)
                    return;
                var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                var shrinkToContent = -1;
                var displayWidth = this.domElement.clientWidth;
                var dataContext = {
                        modelItem: modelItem, playCallback: this._playCallback.bind(this), xboxControllerEnabled: false, featuredInfoVisible: !(this.options.sessionId), backgroundVisible: !(this.options.sessionId === MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying), sessionId: this.options.sessionId, showGalleryHeader: false, collectionAutoSizeMin: displayWidth, marketplaceAutoSizeMin: displayWidth, doNotRaisePanelReady: true, hubStrip: this._hubStrip
                    };
                switch (modelItem.mediaType) {
                    case Microsoft.Entertainment.Queries.ObjectType.game:
                        MS.Entertainment.UI.Controls.fail("this is dead code");
                        break;
                    default:
                        throw new Error("mediaType not recognized for immersive details!");
                }
                if (this.options.hub && this._hubStrip.hubs)
                    for (var i = 0; i < this._hubStrip.hubs.length; i++)
                        if (this._hubStrip.hubs[i].id === this.options.hub) {
                            defaultIndex = i;
                            break
                        }
                this._hubStrip.defaultIndex = defaultIndex;
                if (modelItem.hydrate) {
                    var hydratePromise = modelItem.hydrate({listenForDBUpdates: true});
                    hydratePromise.then(function() {
                        this._shareModelItem(modelItem)
                    }.bind(this))
                }
                else
                    this._shareModelItem(modelItem);
                if (this._hubStrip.hubs.length > 0)
                    this._hubStrip.hubs[0].bind("isReady", function panelsReady() {
                        if (this._hubStrip.hubs[0].isReady)
                            this.nowPlayingContainerReady()
                    }.bind(this), false);
                this.modelItem = modelItem;
                return hydratePromise
            }, _updateStates: function _updateStates() {
                this.nowPlayingVisible = this._nowPlayingControl !== null;
                MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).nowPlayingVisible = this.nowPlayingVisible;
                this.nowPlayingInset = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).nowPlayingInset;
                this._mainHeader.visibility = this.nowPlayingInset;
                var hubStripScroller = this._hubStrip._scroller;
                if (this.nowPlayingInset) {
                    WinJS.Utilities.removeClass(hubStripScroller, "immersiveDetailsHubStripNoScroll");
                    hubStripScroller.tabIndex = 0
                }
                else {
                    WinJS.Utilities.addClass(hubStripScroller, "immersiveDetailsHubStripNoScroll");
                    hubStripScroller.tabIndex = -1
                }
                if (this.menuVisible)
                    WinJS.Utilities.removeClass(this._hubStrip.domElement, "immersiveDetailsHubStripOffsetUp");
                else
                    WinJS.Utilities.addClass(this._hubStrip.domElement, "immersiveDetailsHubStripOffsetUp")
            }, _shareModelItem: function _shareModelItem(overrideModelItem) {
                var sender = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.shareSender);
                overrideModelItem = overrideModelItem || this.modelItem;
                if (!this.nowPlayingVisible && overrideModelItem) {
                    this._unshareModelItem();
                    this._shareOperation = sender.pendingShare(overrideModelItem)
                }
            }, _unshareModelItem: function _unshareModelItem() {
                if (this._shareOperation) {
                    this._shareOperation.cancel();
                    this._shareOperation = null
                }
            }
    }, {
        playbackSession: null, modelItem: null, options: null, nowPlayingVisible: false, nowPlayingInset: false, toggleVisible: false, menuVisible: false, toggleMenuClick: function toggleMenuClick() {
                this.menuVisible = !this.menuVisible;
                this._updateStates()
            }
    }, {loadBackgroundImage: WinJS.Utilities.markSupportedForProcessing(function loadBackgroundImage(source, sourceProperty, destination, destinationProperty) {
            MS.Entertainment.UI.Controls.assert(false, "this is dead code")
        })}), NowPlayingContainer: MS.Entertainment.UI.Framework.defineUserControl(null, function nowPlayingContainerConstructor(){}, {
            controlName: "NowPlayingContainer", ignoreChildrenInitialization: true, initialize: function nowPlayingContainerInitialize() {
                    var domEvent = document.createEvent("Event");
                    domEvent.initEvent("NowPlayingContainerReady", true, false);
                    this.domElement.dispatchEvent(domEvent)
                }
        })
})
