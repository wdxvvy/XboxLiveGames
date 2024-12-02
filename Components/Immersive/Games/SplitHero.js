/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/debug.js", "/Framework/Utilities.js", "/Components/Immersive/Shared/BaseImmersiveSummary.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Framework");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {SplitHero: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.BaseImmersiveSummary, "/Components/Immersive/Games/SplitHero.html#ImmersiveHero", function immersiveHero() {
            this.uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
            if (this.frame.hideViewMoreIfEnoughSpace)
                this.viewMoreButtonVisible = false
        }, {
            _eventHandler: null, _bindings: null, _dataContextHandlers: null, _rotateInterval: null, _rotatorSource: null, _imageElements: null, _currentImage: 0, _imageIndex: 0, _playbackSessionBindings: null, uiStateService: null, pendingImage: null, initialize: function initialize() {
                    MS.Entertainment.UI.Controls.BaseImmersiveSummary.prototype.initialize.call(this);
                    WinJS.Utilities.addClass(this.parent.domElement, "splitHero");
                    this._viewMoreClicked = MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(this._viewMoreClicked, this);
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.backButton).showBackButton();
                    this._bindings = WinJS.Binding.bind(this, {dataContext: {sessionId: this._sessionIdChanged.bind(this)}});
                    this._loadBackgroundImage();
                    this._updateSecondaryText();
                    if (this.dataContext.mediaItem.slideshow) {
                        this.backgroundVisible = false;
                        this.dataContext.mediaItem.slideshow.toArrayAll().then(function done(value) {
                            this._rotatorSource = value;
                            this._setupImageRotator()
                        }.bind(this))
                    }
                    if (this.frame.hideViewMoreIfEnoughSpace)
                        if (this._heroContent.domElement.clientHeight >= this._heroContent.domElement.scrollHeight) {
                            this.viewMoreButtonVisible = false;
                            this._viewMoreClicked = null;
                            this._viewMoreButton.disabled = true
                        }
                        else
                            this.viewMoreButtonVisible = true
                }, freeze: function immersiveHero_freeze() {
                    this.frozen = true;
                    if (this._rotateInterval) {
                        window.clearInterval(this._rotateInterval);
                        this._rotateInterval = null
                    }
                    MS.Entertainment.UI.Controls.BaseImmersiveSummary.prototype.freeze.call(this)
                }, thaw: function immersiveHero_thaw() {
                    MS.Entertainment.UI.Controls.BaseImmersiveSummary.prototype.thaw.call(this);
                    if (this.backgroundImageUri || this.backgroundFallbackImageUri)
                        this.backgroundVisible = true;
                    this.frozen = false;
                    if (!this._rotateInterval && this._rotatorSource)
                        if (!this._rotateInterval)
                            this._rotateInterval = window.setInterval(this._rotateImage.bind(this), this.rotationSpeed)
                }, unload: function unload() {
                    if (this.dataContext.dispose)
                        this.dataContext.dispose();
                    if (this._dataContextHandlers) {
                        this._dataContextHandlers.cancel();
                        this._dataContextHandlers = null
                    }
                    this._detachBindings();
                    if (this._rotateInterval) {
                        window.clearInterval(this._rotateInterval);
                        this._rotateInterval = null
                    }
                    MS.Entertainment.UI.Controls.BaseImmersiveSummary.prototype.unload.call(this)
                }, _viewMoreClicked: function _viewMoreClicked() {
                    if (this._viewMoreOpened)
                        return;
                    this._viewMoreOpened = true;
                    var framePosition = WinJS.Utilities.getPosition(this.domElement);
                    if (this.frame.onShowMore)
                        this.frame.onShowMore();
                    this.frame.columnSpan = 0;
                    this.frame.columnStyle = "splitHero immersiveViewMoreTwoColumn";
                    var result = MS.Entertainment.UI.Controls.ImmersiveViewMore.showPopOver({
                            frame: this.frame, framePosition: framePosition
                        });
                    var events = MS.Entertainment.Utilities.addEventHandlers(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState), {
                            windowresize: function() {
                                framePosition = WinJS.Utilities.getPosition(this.domElement);
                                result.viewMore.framePosition = framePosition
                            }.bind(this), isSnappedChanged: function(e) {
                                    if (e.detail.newValue && result && result.viewMore)
                                        result.viewMore.hide()
                                }
                        });
                    result.completionPromise.done(function() {
                        if (events)
                            events.cancel();
                        if (this.frame.onHideMore)
                            this.frame.onHideMore();
                        this._viewMoreOpened = false
                    }.bind(this))
                }, _setupImageRotator: function _setupImageRotator() {
                    WinJS.Utilities.removeClass(this._imageRotator, "hideFromDisplay");
                    this._imageElements = [this._rotatorImage1, this._rotatorImage2];
                    this._currentImage = 0;
                    this._imageIndex = 0;
                    this._rotatorImage1.src = this._rotatorSource[0].Url;
                    WinJS.UI.Animation.fadeIn(this._rotatorImage1);
                    this._rotateInterval = window.setInterval(this._rotateImage.bind(this), this.rotationSpeed)
                }, _rotateImage: function _rotateImage() {
                    this._currentImage++;
                    if (this._currentImage === this._rotatorSource.length)
                        this._currentImage = 0;
                    var nextIndex = this._imageIndex ? 0 : 1;
                    var outImage = this._imageElements[this._imageIndex];
                    var inImage = this._imageElements[nextIndex];
                    inImage.onload = function onload(event) {
                        WinJS.UI.Animation.fadeOut(outImage);
                        WinJS.UI.Animation.fadeIn(inImage);
                        inImage.onload = null
                    };
                    inImage.src = this._rotatorSource[this._currentImage].Url;
                    this._imageIndex = nextIndex
                }, onImageClick: function onImageClick(event) {
                    event.cancelBubble = true;
                    if (this.dataContext.mediaItem.slideshow) {
                        window.clearInterval(this._rotateInterval);
                        this._rotateInterval = null;
                        var containerWidth = (window.outerWidth - 1040) / 2;
                        var containerHeight = (window.outerHeight - 602) / 2;
                        var overlay = MS.Entertainment.UI.Shell.createOverlay("MS.Entertainment.Pages.ScreenshotPopover", {
                                media: this.dataContext.mediaItem.slideshow, currentPage: this._currentImage
                            }, {
                                autoSetFocus: false, left: containerWidth + "px", right: containerWidth + "px", top: containerHeight + "px", bottom: containerHeight + "px"
                            });
                        overlay.domElement.addEventListener("keydown", function onKeyDown(e) {
                            if (e.keyCode !== WinJS.Utilities.Key.escape)
                                return;
                            e.preventDefault();
                            overlay.hide()
                        });
                        overlay.show().then(function done() {
                            if (!this._rotateInterval)
                                this._rotateInterval = window.setInterval(this._rotateImage.bind(this), this.rotationSpeed)
                        }.bind(this))
                    }
                }, _sessionIdChanged: function _sessionIdChanged(sessionId) {
                    this.playbackSession = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager).getSession(sessionId);
                    if (sessionId) {
                        var containerWidth = (window.outerWidth - 1040) / 2;
                        var containerHeight = (window.outerHeight - 602) / 2;
                        var overlay = MS.Entertainment.UI.Shell.createOverlay("MS.Entertainment.Pages.NowPlayingPopover", {
                                mediaItem: this.dataContext.mediaItem, sessionId: sessionId
                            }, {
                                autoSetFocus: true, left: containerWidth + "px", right: containerWidth + "px", top: containerHeight + "px", bottom: containerHeight + "px"
                            });
                        overlay.domElement.addEventListener("keydown", function onKeyDown(e) {
                            if (e.keyCode !== WinJS.Utilities.Key.escape)
                                return;
                            e.preventDefault();
                            overlay.hide()
                        });
                        overlay.show().done(function done() {
                            if (this.playbackSession) {
                                this._detachPlaybackSessionBindings();
                                this._playbackSessionBindings = WinJS.Binding.bind(this, {playbackSession: {currentMedia: this._mediaStateChanged.bind(this)}})
                            }
                        }.bind(this))
                    }
                }, _mediaStateChanged: function _mediaStateChanged(newVal, oldVal) {
                    if (!newVal || this.frozen)
                        return;
                    if (newVal && this.dataContext && this.dataContext.mediaItem && newVal.titleId === this.dataContext.mediaItem.titleId)
                        this._sessionIdChanged(this.dataContext.sessionId)
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
                }, _loadFallbackLegacyBackgroundImage: function _loadFallbackLegacyBackgroundImage() {
                    MS.Entertainment.UI.Shell.ImageLoader.getServiceImageUrl(this.dataContext.mediaItem, 1024, 768, MS.Entertainment.ImageRequested.backgroundImage).done(function setBackgroundImageUrl(url) {
                        this.backgroundImageUri = null;
                        if (url !== MS.Entertainment.UI.Shell.ImageLoader.MediaDefaultUrls.game && this.dataContext.mediaItem.mediaType !== Microsoft.Entertainment.Queries.ObjectType.game)
                            this.backgroundImageUri = url
                    }.bind(this), function setDefaultBackgroundImageUrl() {
                        this.backgroundImageUri = null
                    }.bind(this))
                }, _loadFallbackBackgroundImage: function _loadFallbackBackgroundImage() {
                    this.backgroundImageUri = null
                }, _loadBackgroundImage: function _loadBackgroundImage() {
                    var promise;
                    if (this.dataContext.mediaItem.hydrate)
                        promise = this.dataContext.mediaItem.hydrate();
                    else
                        promise = WinJS.Promise.as();
                    promise.done(function setBackgroundImage() {
                        if (this.dataContext.mediaItem.backgroundImageUri) {
                            var imageUrl = MS.Entertainment.Utilities.UriFactory.appendQuery(this.dataContext.mediaItem.backgroundImageUri, {format: MS.Entertainment.ImageFormat.png});
                            MS.Entertainment.UI.Shell.ImageLoader.cacheImage(imageUrl, String.empty).done(function cacheImage(url) {
                                this.backgroundImageUri = url
                            }.bind(this), function useDefaultImage(error) {
                                this.backgroundImageUri = String.empty;
                                MS.Entertainment.Framework.fail(error)
                            }.bind(this));
                            if (this.dataContext.mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.game)
                                this.mediaTypeClassName = "mediatype-game";
                            else
                                this.mediaTypeClassName = String.empty
                        }
                        else
                            this._loadFallbackBackgroundImage()
                    }.bind(this), this._loadFallbackBackgroundImage.bind(this))
                }, _updateSecondaryText: function _updateSecondaryText() {
                    if (this.dataContext.mediaItem.primaryGenre)
                        this.secondaryText = this.dataContext.mediaItem.primaryGenre;
                    else if (this.dataContext.mediaItem.genre)
                        this.secondaryText = MS.Entertainment.Formatters.formatGenre(this.dataContext.mediaItem);
                    else
                        this.secondaryText = String.empty
                }
        }, {
            backgroundImageUri: String.empty, backgroundFallbackImageUri: null, backgroundVisible: false, mediaTypeClassName: String.empty, showStartingAnimation: false, secondaryText: "", playbackSession: null, frozen: false, showGenericIcon: false, rotationSpeed: 5000, viewMoreButtonVisible: true
        }, {loadBackgroundImage: MS.Entertainment.Utilities.weakElementBindingInitializer(function loadBackgroundImage(value, destination, destinationProperty, source) {
                if (source.backgroundImageUri === String.empty) {
                    source.backgroundVisible = false;
                    return
                }
                if (source.dataContext.mediaItem.edsMediaItemTypeString === "XboxXnaCommunityGame") {
                    source.backgroundFallbackImageUri = "url(" + source.dataContext.mediaItem.imageUri + ")";
                    source.backgroundVisible = true;
                    return
                }
                MS.Entertainment.Utilities.empty(destination);
                source.pendingImage = new Image;
                var events;
                var doAddImage = function doAddImage(imageUri) {
                        destination.setAttribute("src", imageUri);
                        source.backgroundVisible = true;
                        source.pendingImage = null;
                        events.cancel()
                    };
                var handleFailedImage = function handleFailedImage() {
                        WinJS.Utilities.addClass(destination, "hidden");
                        MS.Entertainment.UI.Shell.ImageLoader.getServiceImageUrl(source.dataContext.mediaItem).then(function getUrl(url) {
                            switch (url) {
                                case MS.Entertainment.UI.Shell.ImageLoader.MediaDefaultUrls.game:
                                    url = "ms-appx:///Images/GenericIcons/ico_GenericGames_L3_Hero.png";
                                    source.showGenericIcon = true;
                                    break;
                                default:
                                    source.showGenericIcon = false;
                                    break
                            }
                            source.backgroundFallbackImageUri = "url(" + url + ")";
                            source.backgroundVisible = true;
                            source.pendingImage = null
                        }.bind(this))
                    };
                var events = MS.Entertainment.Utilities.addEvents(source.pendingImage, {
                        load: function imageLoaded() {
                            if (source.pendingImage.width >= source.pendingImage.height && source.pendingImage.width >= 500)
                                doAddImage(source.pendingImage.src);
                            else
                                handleFailedImage()
                        }, error: function imageFailed() {
                                handleFailedImage()
                            }
                    });
                source.pendingImage.setAttribute("src", source.backgroundImageUri)
            })})})
})()
