/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Components/Playback/Controls/PlaybackControl.js", "/Framework/corefx.js", "/Framework/serviceLocator.js", "/Framework/utilities.js", "/ViewModels/MediaItemModel.js");
(function(undefined) {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {
        Immersive: MS.Entertainment.UI.Framework.defineUserControl("Components/Immersive/Immersive.html#immersiveTemplate", function immersiveConstructor(element, options) {
            this._navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
            this._uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
            this._page = this._navigationService.currentPage;
            if (MS.Entertainment.Utilities.isApp2)
                this._handleScroll = this._handleScroll.bind(this);
            this.options = this._page.options || {};
            this.options.panelOptions = this.options.panelOptions || {};
            this.options.initialFrame = -1;
            var mediaItem = this.options.mediaItem;
            if (mediaItem) {
                if (mediaItem.serviceType === MS.Entertainment.Data.Augmenter.ServiceTypes.editorialItem)
                    mediaItem = MS.Entertainment.Utilities.convertEditorialItem(mediaItem);
                this.mediaItem = Array.isArray(mediaItem) ? mediaItem : MS.Entertainment.ViewModels.MediaItemModel.augment(mediaItem)
            }
            this._uiStateService.nowPlayingInset = !this.options.startFullScreen;
            this._uiStateService.nowPlayingVisible = this.options.startFullScreen || !!this.options.sessionId
        }, {
            _initialized: false, _playbackSessionBindings: null, _bindings: null, _page: null, _playbackSession: null, _initialFocusSet: false, _navigationBindings: null, _selectionEventBindings: null, _galleryEventBindings: null, _selectionManager: null, _hideFirstPivot: false, _navigationService: null, _uiStateService: null, _restorePlaybackState: null, fixedStateTransitionClass: "transition-fixedStates", fixedClass: "fixed", initialize: function initialize() {
                    if (MS.Entertainment.Utilities.isApp2) {
                        this._createPivots();
                        this._scroller.addEventListener("scroll", this._handleScroll)
                    }
                    if (this.mediaItem)
                        this._updateMetaData(this.mediaItem);
                    else if (!this._uiStateService.isSnapped)
                        MS.Entertainment.UI.Controls.assert(false, "Immersive details not supplied with a mediaItem.");
                    this._bindings = WinJS.Binding.bind(this, {
                        _uiStateService: {isSnapped: function isSnappedChanged(newVal, oldVal) {
                                if (newVal) {
                                    this.immersiveControl.domElement.style.overflow = "hidden";
                                    this._scroller.style.overflow = "hidden";
                                    this._bringFrameIntoView(0, true);
                                    this._clearItemControlSelection()
                                }
                                else if (oldVal !== undefined) {
                                    this.immersiveControl.domElement.style.overflow = String.empty;
                                    this._scroller.style.overflow = String.empty
                                }
                            }.bind(this)}, _page: {options: this._pageOptionsChanged.bind(this)}
                    });
                    this._initialized = true
                }, _clearItemControlSelection: function _clearItemControlSelection() {
                    if (this._selectionManager)
                        this._selectionManager.clearSelection()
                }, _detachBindings: function _detachBindings() {
                    this._detachPlaybackSessionBindings();
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null
                    }
                }, _detachPlaybackSessionBindings: function _detachPlaybackSessionBindings() {
                    if (this._playbackSessionBindings) {
                        this._playbackSessionBindings.cancel();
                        this._playbackSessionBindings = null
                    }
                }, unload: function unload() {
                    this._detachBindings();
                    this._unshareMediaItem();
                    if (this.mediaItem) {
                        if (this.mediaItem.liveQuery && this.mediaItem.liveQuery.dispose)
                            this.mediaItem.liveQuery.dispose();
                        this.mediaItem.liveQuery = null
                    }
                    if (this.frameViewModel && this.frameViewModel.dispose)
                        this.frameViewModel.dispose();
                    if (this._selectionManager) {
                        this._selectionManager.dispose();
                        this._selectionManager = null
                    }
                    if (this._galleryEventBindings) {
                        this._galleryEventBindings.cancel();
                        this._galleryEventBindings = null
                    }
                    if (this._navigationBindings) {
                        this._navigationBindings.cancel();
                        this._navigationBindings = null
                    }
                    this._clearItemControlSelection();
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, freeze: function immersive_freeze() {
                    this.frozen = true;
                    if (MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isAppVisible)
                        if (MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).nowPlayingVisible) {
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).nowPlayingVisible = false;
                            MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar).repossessNowPlaying()
                        }
                    if (this.frameViewModel && this.frameViewModel.freeze)
                        this.frameViewModel.freeze();
                    MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this)
                }, thaw: function immersive_thaw() {
                    MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                    this.frozen = false;
                    if (this.frameViewModel && this.frameViewModel.thaw)
                        this.frameViewModel.thaw()
                }, _createPivots: function _createPivots() {
                    var pivotsContainer = document.createElement("div");
                    WinJS.Utilities.addClass(pivotsContainer, "immersivePivots");
                    this._scroller.appendChild(pivotsContainer);
                    this._pivots = pivotsContainer;
                    MS.Entertainment.UI.Framework.loadTemplate("/Components/Immersive/Immersive.html#immersivePivots").then(function(template) {
                        return template.render(this, pivotsContainer)
                    }.bind(this)).done(function() {
                        this._pivotsControl = pivotsContainer.querySelector("[data-win-control='MS.Entertainment.UI.Controls.ImmersivePivotControl']").winControl;
                        this._pivotsControl.hideFirstPivot = this._hideFirstPivot;
                        this._pivotsControl.immersive = this;
                        this._pivotsControl.selectedIndex = 0
                    }.bind(this))
                }, _heroScreenRatio: 0.66, _backButtonSize: 60, _pivotOffset: 40, _cachedOffset: 0, _handleScroll: function _handleScroll() {
                    if (!this._pivots)
                        return;
                    this._updateHeroOffsetCachedPosition();
                    var minScrollLeft = this._cachedOffset;
                    if (this._scroller.scrollLeft < minScrollLeft) {
                        WinJS.Utilities.removeClass(this._pivots, this.fixedClass);
                        return
                    }
                    WinJS.Utilities.addClass(this._pivots, this.fixedClass)
                }, _updateHeroOffsetCachedPosition: function _updateHeroOffsetCachedPosition() {
                    if (!this._cachedOffset) {
                        var heroFrame = null;
                        var offset = 0;
                        if (this.frameViewModel && this.frameViewModel.frames)
                            heroFrame = this.frameViewModel.frames.item(0);
                        if (heroFrame) {
                            var heroElement = this.immersiveControl.getElementForItem(heroFrame);
                            if (heroElement)
                                offset = heroElement.clientWidth - this._pivotOffset
                        }
                        this._cachedOffset = offset
                    }
                }, _updatePivotFixedState: function _updatePivotFixedState(targetScrollLeft) {
                    this._updateHeroOffsetCachedPosition();
                    var minScrollLeft = this._cachedOffset;
                    if ((targetScrollLeft < minScrollLeft) && WinJS.Utilities.hasClass(this._pivots, this.fixedClass))
                        WinJS.Utilities.addClass(this._pivots, this.fixedStateTransitionClass);
                    else if (!WinJS.Utilities.hasClass(this._pivots, this.fixedClass))
                        WinJS.Utilities.addClass(this._pivots, this.fixedStateTransitionClass);
                    else
                        WinJS.Utilities.removeClass(this._pivots, this.fixedStateTransitionClass)
                }, _pageOptionsChanged: function _pageOptionsChanged(newVal, oldVal) {
                    if (oldVal && ((oldVal.mediaItem.isEqual && oldVal.mediaItem.isEqual(newVal.mediaItem)) || (newVal.mediaItem.isChildOf && newVal.mediaItem.isChildOf(oldVal.mediaItem)) || (Array.isArray(newVal.mediaItem) || newVal.mediaItem.execute)))
                        if (this.frameViewModel) {
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).nowPlayingInset = !newVal.startFullScreen;
                            this.frameViewModel.sessionId = newVal.sessionId;
                            WinJS.Promise.timeout(250).then(function _delayLoad() {
                                this._bringFrameIntoView(0, true)
                            }.bind(this))
                        }
                }, _updateMetaData: function _updateMetaData(mediaItem) {
                    var platLog = Microsoft.Entertainment.Platform.Logging;
                    var dataPoint = new platLog.DataPoint(platLog.LoggingLevel.telemetry);
                    this.metadataMediaItem = mediaItem;
                    if (Array.isArray(mediaItem) || mediaItem.execute) {
                        if (Array.isArray(mediaItem) && mediaItem.length > 0)
                            this._updateMetaData(mediaItem[0]);
                        else if (mediaItem.execute) {
                            var queryComplete = function executeSuccess(q) {
                                    if (q.result.items)
                                        q.result.items.toArray().then(function(items) {
                                            this._updateMetaData(items)
                                        }.bind(this))
                                }.bind(this);
                            mediaItem.execute().then(queryComplete.bind(this), function queryFailed(error){})
                        }
                        return
                    }
                    var isNewViewModel = true;
                    switch (mediaItem.mediaType) {
                        case Microsoft.Entertainment.Queries.ObjectType.game:
                            this.frameViewModel = new MS.Entertainment.ViewModels.GamesImmersiveViewModel(this.options, this._bringFrameIntoView.bind(this));
                            break;
                        default:
                            MS.Entertainment.UI.Controls.fail("this is dead code");
                            break
                    }
                    MS.Entertainment.UI.Controls.assert(this.frameViewModel, "Immersive details didn't get a valid viewmodel.");
                    if (!this.frameViewModel || !this.frameViewModel.updateMetaData) {
                        this._navigationService.navigateToDefaultPage();
                        return
                    }
                    var hydratePromise = this.frameViewModel.updateMetaData(mediaItem, this.options.startFullScreen);
                    MS.Entertainment.UI.Controls.assert(this.frameViewModel.frames.length > 0, "Immersive details viewmodel didn't create any frames.");
                    if (!this.frameViewModel.frames.length) {
                        this._navigationService.navigateToDefaultPage();
                        return
                    }
                    this._updateImmersivePivots(this.metadataMediaItem);
                    if (this.frameViewModel.frames.item(0).isFullScreen === undefined)
                        this.frameViewModel.frames.item(0).addProperty("isFullScreen", this.options.startFullScreen);
                    hydratePromise.then(function mediaHydrated(mediaItem) {
                        if (!mediaItem.isFailed) {
                            this._shareMediaItem(mediaItem);
                            this.mediaName = mediaItem.name
                        }
                    }.bind(this));
                    this.frameViewModel.sessionId = this.options.sessionId;
                    if (isNewViewModel)
                        this.frameViewModel.frames.addChangeListener(this._handleFramesChanged.bind(this));
                    this._handleFramesChanged();
                    if (this.options)
                        this.options.mediaItem = mediaItem;
                    dataPoint.appendEventName("ImmersiveDetails");
                    dataPoint.appendParameter("UIPart", "Immersive");
                    dataPoint.appendParameter("UIPath", this._navigationService.getUserLocation());
                    dataPoint.write()
                }, _updateImmersivePivots: function _updateImmersivePivots(mediaItem) {
                    if (this._pivots && mediaItem && !Array.isArray(mediaItem)) {
                        var mediaTypeString = MS.Entertainment.Data.Factory.Marketplace.edsMediaTypeFromDatabaseType(mediaItem.mediaType);
                        if (mediaTypeString)
                            WinJS.Utilities.addClass(this._pivots, "mediatype-" + mediaTypeString.toLowerCase())
                    }
                }, _handleFramesChanged: function _handleFramesChanged() {
                    WinJS.Promise.timeout().then(function() {
                        if (this.options.hub || this.options.initialFrame > 0) {
                            for (var i = 0; i < this.frameViewModel.frames.length; i++)
                                if (this.frameViewModel.frames.item(i).moniker === this.options.hub)
                                    this.options.initialFrame = i;
                            if (this.options.initialFrame > -1 && this.options.initialFrame < this.frameViewModel.frames.length)
                                this._bringFrameIntoView(this.options.initialFrame, true)
                        }
                        else if (!this._initialFocusSet && this.immersiveControl && this.immersiveControl.dataSource && this.frameViewModel.frames.length > 1)
                            if (this._focusFrame(this.frameViewModel.frames.item(0)))
                                this._initialFocusSet = true
                    }.bind(this))
                }, _focusFrame: function _focusFrame(frame, frameIndex) {
                    var element = this.immersiveControl.getElementForItem(frame);
                    if (element)
                        MS.Entertainment.UI.Framework.waitForControlToInitialize(element).then(function() {
                            return WinJS.Promise.timeout(700)
                        }).then(function() {
                            if (!this._scroller.isAnimatingScroll)
                                MS.Entertainment.UI.Framework.focusFirstInSubTree(element);
                            if (frameIndex !== undefined && frameIndex === this.options.initialFrame && this.options.showInitialFrameViewMore && frame.showViewMore)
                                frame.showViewMore()
                        }.bind(this));
                    return element
                }, _bringFrameIntoView: function _bringFrameIntoView(frameIndex, focusAfterScrolling) {
                    if (this.immersiveControl && this.frameViewModel && this.frameViewModel.frames.length > 0)
                        this.immersiveControl.bringItemIntoView(this.frameViewModel.frames.item(frameIndex), {bringOnMinimally: true}).then(function() {
                            if (focusAfterScrolling)
                                this._focusFrame(this.frameViewModel.frames.item(frameIndex), frameIndex)
                        }.bind(this))
                }, _shareMediaItem: function _shareMediaItem(overrideMediaItem) {
                    var sender = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.shareSender);
                    overrideMediaItem = overrideMediaItem || this.mediaItem;
                    if (!this.nowPlayingVisible && overrideMediaItem) {
                        this._unshareMediaItem();
                        this._shareOperation = sender.pendingShare(overrideMediaItem)
                    }
                }, _unshareMediaItem: function _unshareMediaItem() {
                    if (this._shareOperation) {
                        this._shareOperation.cancel();
                        this._shareOperation = null
                    }
                }
        }, {
            frameViewModel: null, options: null, mediaItem: null, metadataMediaItem: null, mediaName: String.empty, frozen: false
        }, {makeFrame: function makeFrame(heading, columnSpan, control, viewMoreContentUrl, moniker) {
                if (!heading && MS.Entertainment.Utilities.isApp2)
                    heading = String.load(String.id.IDS_HOME_PIVOT);
                return WinJS.Binding.as({
                        heading: heading, title: heading, columnSpan: columnSpan, getData: null, viewMoreInfo: {
                                icon: MS.Entertainment.UI.Icon.playlist, title: String.load(String.id.IDS_DETAILS_VIEW_MORE)
                            }, overviewConstructor: control, viewMoreTemplate: viewMoreContentUrl, moniker: moniker
                    })
            }}), ImmersivePivotControl: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.Controls.PivotsControl", null, function(){}, {
                focusItemOnSelectedIndexChanged: false, _hideFirstPivot: false, _currentTargetFrame: null, hideFirstPivot: {
                        get: function() {
                            return this._hideFirstPivot
                        }, set: function(value) {
                                this._hideFirstPivot = value;
                                if (value && this.domElement && this.domElement.firstElementChild)
                                    WinJS.Utilities.addClass(this.domElement.firstElementChild, "removeFromDisplay")
                            }
                    }, applyItemTemplate: function(container, dataContext, index) {
                        var result = MS.Entertainment.Controls.PivotsControl.prototype.applyItemTemplate.apply(this, arguments);
                        if (this.hideFirstPivot && (index === 0))
                            WinJS.Utilities.addClass(result, "removeFromDisplay");
                        if (result.firstElementChild)
                            result.firstElementChild.addEventListener("click", function(e) {
                                var button = e.currentTarget;
                                this.bringFrameIntoView(button.dataSource)
                            }.bind(this));
                        return result
                    }, bringFrameIntoView: function(frame) {
                        var frameToScrollTo = frame;
                        if (this.hideFirstPivot && (frame === this._workingDataSource.item(1)))
                            frameToScrollTo = this._workingDataSource.item(0);
                        if (this.hideFirstPivot && (frame === this._workingDataSource.item(0)))
                            return;
                        this._currentTargetFrame = frame;
                        this.immersive.immersiveControl.currentFrameIndex = this.dataSource.indexOf(frame);
                        var targetScrollPosition = this.immersive.immersiveControl.getScrollPositionToShowItem(frameToScrollTo, {
                                bringOnMinimally: true, alwaysAlignLeftEdge: true
                            });
                        this.immersive._updatePivotFixedState(targetScrollPosition);
                        this.immersive.immersiveControl.bringItemIntoView(frameToScrollTo, {
                            bringOnMinimally: true, animated: true, alwaysAlignLeftEdge: true, ignoreMissingStarts: true
                        }).done(function() {
                            if (!this.domElement.contains(document.activeElement))
                                if (frame === this._currentTargetFrame)
                                    this.immersive._focusFrame(frame)
                        }.bind(this))
                    }
            })
    })
})()
