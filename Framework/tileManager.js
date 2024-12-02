/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Framework");
WinJS.Namespace.define("MS.Entertainment.Framework", {
    TileManager: WinJS.Class.define(function tileManager() {
        if (MS.Entertainment.Utilities.isApp2)
            return;
        this._bindingsToDetach = [];
        this._recentItemUris = [];
        this._uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
        WinJS.Promise.timeout(2500).then(function _deferredInit() {
            try {
                this._tileUpdater = Windows.UI.Notifications.TileUpdateManager.createTileUpdaterForApplication()
            }
            catch(err) {
                MS.Entertainment.Framework.assert(false, "Failure in calls to TileUpdateManager: " + err)
            }
            this.clearTile();
            this._initialize();
            this._startPolling();
            try {
                if (MS.Entertainment.Utilities.isGamesApp)
                    this.clearTileByTag(this._gameMessagesTag)
            }
            catch(e) {
                MS.Entertainment.Framework.assert(false, "Tile manager failed to clear tile by tag: " + e.toString())
            }
        }.bind(this))
    }, {
        EMPTY_GUID: "00000000-0000-0000-0000-000000000000", gamePDLCTag: "dlc", _playbackSession: null, _bindingsToDetach: null, _nowPlayingImageUri: String.empty, _nowPlayingTitle: String.empty, _nowPlayingSubTitle: String.empty, _nowPlayingTertiaryTitle: String.empty, _nowPlayingQuaternaryTitle: String.empty, _xboxLogo: "\u26dd\ud83c\udfae", _tileUpdateTimer: null, _tilesAvailable: false, _recentItemUris: null, _wideTemplate: null, _widePeekTemplate: null, _wideSquareTemplate: null, _widePosterTemplate: null, _wideNoImageTemplate: null, _squareTemplate: null, _squarePeekTemplate: null, _uiStateService: null, _tileUpdater: null, _musicPausedExpiryTime: 3600, _musicPlayingExpiryTime: 12 * 60, _videoPausedExpiryTime: 3 * 3600, _videoPlayingExpiryTime: 5 * 3600, _clearTileByTagExpiryTime: 15, _companionConnectionDelay: 2500, _gameMessagesTag: "1", _gameActivityTileTag: "2", _gamercardTileTag: "5", _companionXboxSignInTag: "1", _nowPlayingTileTag: "nowplaying", _signInService: null, _applicationChannel: null, _defaultWideTemplate: null, _defaultSquareTemplate: null, _peekImageUri: null, _lastItemTitle: null, _lastSavedThumbnailImage: null, _lastSavedWidePeekImage: null, _lastSavedSquarePeekImage: null, _thumbnailImageFileName: "tileThumbnailImage.png", _peekWideImageFileName: "tileWidePeekImage.png", _peekSquareImageFileName: "tileSquarePeekImage.png", _defaultWideTileWidth: 310, _defaultSquareTileWidth: 150, _defaultTileHeight: 150, _joinedImageUrlPromises: null, _shapeAssets: null, _lastMusicShape: null, _lastMusicColor: null, _lastMusicImage: null, _squareThumbnailDimension: 160, _posterThumbnailHeight: 258, _posterThumbnailWidth: 172, _initialize: function _initialize() {
                this._initializeBinding(this._uiStateService, "isAppVisible", this._visibilityChanged.bind(this));
                var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                this._playbackSession = sessionMgr.primarySession;
                this._initializeBinding(this._playbackSession, "currentMedia", this._mediaChanged.bind(this));
                this._initializeBinding(this._playbackSession, "currentTransportState", this._transportStateChanged.bind(this));
                if (MS.Entertainment.Utilities.isGamesApp) {
                    this._signInService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                    this._initializeBinding(this._signInService, "isSignedIn", this._signInChanged.bind(this))
                }
                this._wideTemplate = Windows.UI.Notifications.TileTemplateType.tileWideSmallImageAndText04;
                this._widePeekTemplate = Windows.UI.Notifications.TileTemplateType.tileWidePeekImage02;
                this._wideSquareTemplate = Windows.UI.Notifications.TileTemplateType.tileWideSmallImageAndText02;
                this._widePosterTemplate = Windows.UI.Notifications.TileTemplateType.tileWideSmallImageAndText05;
                this._wideNoImageTemplate = Windows.UI.Notifications.TileTemplateType.tileWideText01;
                this._squarePeekTemplate = Windows.UI.Notifications.TileTemplateType.tileSquarePeekImageAndText03;
                this._squareTemplate = Windows.UI.Notifications.TileTemplateType.tileSquareText03;
                this._defaultWideTemplate = Windows.UI.Notifications.TileTemplateType.tileWideImage;
                this._defaultSquareTemplate = Windows.UI.Notifications.TileTemplateType.tileSquareImage
            }, _initializeBinding: function _initializeBinding(source, name, action) {
                source.bind(name, action);
                this._bindingsToDetach.push({
                    source: source, name: name, action: action
                })
            }, _initializeShapes: function _initializeShapes() {
                this._shapeAssets = {};
                this._shapeAssets[MS.Entertainment.UI.Controls.ShapeVisualization.ShapeType.Circle] = ["ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_circlepiece01.png", "ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_circlepiece02.png", "ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_circlepiece03.png", "ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_halfcirclerot01.png"];
                this._shapeAssets[MS.Entertainment.UI.Controls.ShapeVisualization.ShapeType.Square] = ["ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_square01rot.png", "ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_square02rot.png"];
                this._shapeAssets[MS.Entertainment.UI.Controls.ShapeVisualization.ShapeType.Triangle] = ["ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_triangle01.png", "ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_triangle02.png", "ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_triangle03.png", "ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_triangle04.png", "ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_triangle05.png", "ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_triangle6rot.png"];
                this._shapeAssets[MS.Entertainment.UI.Controls.ShapeVisualization.ShapeType.Trapezoid] = ["ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_trapezoid01.png", "ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_trapezoid02.png"];
                this._shapeAssets[MS.Entertainment.UI.Controls.ShapeVisualization.ShapeType.Parallelogram] = ["ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_parallelogram01.png", "ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_parallelogram02.png", "ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_parallelogram03rot.png"];
                this._shapeAssets[MS.Entertainment.UI.Controls.ShapeVisualization.ShapeType.Diamond] = ["ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_diamond01.png"]
            }, _detachBindings: function _detachBindings() {
                this._bindingsToDetach.forEach(function(e) {
                    e.source.unbind(e.name, e.action)
                })
            }, _mediaChanged: function _mediaChanged() {
                this._updateMetadata()
            }, _visibilityChanged: function _visibilityChanged() {
                if (!this._uiStateService.isAppVisible)
                    this.updateTile()
            }, _signInChanged: function _signInChanged(isSignedIn) {
                MS.Entertainment.Framework.assert(MS.Entertainment.Utilities.isGamesApp);
                if (isSignedIn)
                    this._startInterceptingNotifications();
                else {
                    this.clearTileByTag(this._gameMessagesTag);
                    this.clearTileByTag(this._gameActivityTileTag);
                    this.clearTileByTag(this._gamercardTileTag);
                    this.clearTileByTag(this.gamePDLCTag)
                }
            }, updateTile: function updateTile() {
                if (MS.Entertainment.Utilities.isApp2)
                    return;
                return
            }, clearTileByTag: function clearTileByTag(tag) {
                if (!this._tilesAvailable)
                    return;
                try {
                    var Notifications = Windows.UI.Notifications;
                    var wideTileXml = Notifications.TileUpdateManager.getTemplateContent(this._defaultWideTemplate);
                    var squareTileXml = Notifications.TileUpdateManager.getTemplateContent(this._defaultSquareTemplate);
                    var wideTileImageAttributes = wideTileXml.getElementsByTagName("image");
                    var squareTileImageAttributes = squareTileXml.getElementsByTagName("image");
                    var genericWideImage = "ms-appx:///images/tiles/XBL_GAMES_310x150_C.png";
                    var genericSquareImage = "ms-appx:///images/tiles/XBL_GAMES_150x150_A.png";
                    wideTileImageAttributes[0].setAttribute("src", genericWideImage);
                    squareTileImageAttributes[0].setAttribute("src", genericSquareImage);
                    wideTileXml.getElementsByTagName("binding")[0].setAttribute("branding", "name");
                    squareTileXml.getElementsByTagName("binding")[0].setAttribute("branding", "name");
                    var squareTileXmlNode = wideTileXml.importNode(squareTileXml.getElementsByTagName("binding")[0], true);
                    wideTileXml.getElementsByTagName("visual")[0].appendChild(squareTileXmlNode);
                    var tileNotification = new Notifications.TileNotification(wideTileXml);
                    tileNotification.tag = tag;
                    var currentTime = new Date;
                    var expiryTime = new Date(currentTime.getTime() + this._clearTileByTagExpiryTime * 1000);
                    tileNotification.expirationTime = expiryTime;
                    if (!this._tileUpdater)
                        this._tileUpdater = Windows.UI.Notifications.TileUpdateManager.createTileUpdaterForApplication();
                    this._tileUpdater.update(tileNotification)
                }
                catch(err) {
                    MS.Entertainment.Framework.assert(false, "Failure in calls to TileUpdateManager: " + err)
                }
            }, clearTile: function clearTile() {
                this._tilesAvailable = true
            }, _startPolling: function _startPolling() {
                if (!MS.Entertainment.Utilities.isGamesApp)
                    return;
                var url = MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_TileNotification) + "/x8/feeds/1.1/Tile-Games";
                var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                var recurrence = Windows.UI.Notifications.PeriodicUpdateRecurrence[configurationManager.engage.tilePollInterval] || Windows.UI.Notifications.PeriodicUpdateRecurrence.twelveHours;
                try {
                    this._tileUpdater.enableNotificationQueue(true);
                    this._tileUpdater.startPeriodicUpdate(new Windows.Foundation.Uri(url), recurrence)
                }
                catch(e) {
                    MS.Entertainment.Framework.fail("Failure in calls to TileUpdateManager: " + e.toString())
                }
            }, _startInterceptingNotifications: function _startInterceptingNotifications() {
                MS.Entertainment.Framework.assert(MS.Entertainment.Utilities.isGamesApp);
                if (!this._applicationChannel) {
                    var pushNotificationManager = Microsoft.Xbox.Foundation.PushNotificationManager;
                    var channel = pushNotificationManager.applicationChannel;
                    this._applicationChannel = channel;
                    if (this._applicationChannel)
                        this._applicationChannel.addEventListener("pushnotificationreceived", function onNotificationReceived(event) {
                            if (event && event.args && event.args.notificationType === Windows.Networking.PushNotifications.PushNotificationType.tile && event.args.tileNotification && MS.Entertainment.Utilities.isGamesApp) {
                                var tag = event.args.tileNotification.tag;
                                try {
                                    if (tag === this._gameMessagesTag) {
                                        Microsoft.Xbox.XboxLIVEService.invalidateCacheGroup(Microsoft.Xbox.CacheGroup.friends);
                                        Microsoft.Xbox.XboxLIVEService.invalidateCacheGroup(Microsoft.Xbox.CacheGroup.userMessages)
                                    }
                                    else if (tag === this._gamercardTileTag) {
                                        Microsoft.Xbox.XboxLIVEService.invalidateCacheGroup(Microsoft.Xbox.CacheGroup.avatarManifestForSignedInUser);
                                        Microsoft.Xbox.XboxLIVEService.invalidateCacheGroup(Microsoft.Xbox.CacheGroup.profile)
                                    }
                                    else if (tag === this._gameActivityTileTag) {
                                        Microsoft.Xbox.XboxLIVEService.invalidateCacheGroup(Microsoft.Xbox.CacheGroup.titleHistory);
                                        Microsoft.Xbox.XboxLIVEService.invalidateCacheGroup(Microsoft.Xbox.CacheGroup.achievements)
                                    }
                                }
                                catch(e) {
                                    MS.Entertainment.Framework.fail(e.message)
                                }
                                MS.Entertainment.Social.Helpers.getSignedInUserModel().refresh(false).done(null, function error(err) {
                                    MS.Entertainment.Framework.assert(false, "Refresh failure in TileManager_startInterceptingNotifications: " + err)
                                })
                            }
                            event.args.cancel = true
                        }.bind(this))
                }
            }, _transportStateChanged: function _transportStateChanged() {
                if (this._playbackSession && this._playbackSession.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.stopped)
                    this.clearTileByTag(this._nowPlayingTileTag);
                else
                    this.updateTile()
            }, _startUpdateTimer: function _startUpdateTimer() {
                return
            }, _doUpdateTile: function _doUpdateTile() {
                if (this._uiStateService.isAppVisible)
                    return;
                this._tileUpdateTimer = null;
                this._setNowPlayingNotification()
            }, _setNowPlayingNotification: function _setNowPlayingNotification() {
                if (!this._tilesAvailable)
                    return;
                var serviceAvailable = true;
                var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                var wideTileXml;
                var squareTileXml;
                try {
                    if (this._playbackSession.currentMedia && this._playbackSession.currentTransportState !== MS.Entertainment.Platform.Playback.TransportState.stopped)
                        this._joinedImageUrlPromises.done(function FinishTiles() {
                            if (this._peekImageUri && serviceAvailable)
                                this._testImageExists(this._peekImageUri, function imageTestSuccess() {
                                    this._createComposedPeekImages(serviceAvailable)
                                }.bind(this), function imageTestFailed() {
                                    this._loadNonPeekTiles(serviceAvailable)
                                }.bind(this));
                            else
                                this._loadNonPeekTiles(serviceAvailable)
                        }.bind(this));
                    else
                        this.clearTileByTag(this._nowPlayingTileTag)
                }
                catch(err) {
                    MS.Entertainment.Framework.assert(false, "Failure in calls to TileUpdateManager: " + err)
                }
            }, _createComposedPeekImages: function _createComposedPeekImages(serviceAvailable) {
                var Notifications = Windows.UI.Notifications;
                var wideTileXml;
                var squareTileXml;
                var promisesToJoin = [];
                promisesToJoin.push(this._createComposedWidePeekImage());
                promisesToJoin.push(this._createComposedSquarePeekImage());
                WinJS.Promise.join(promisesToJoin).then(function setupWideTiles() {
                    if (this._peekImageUri === this._lastSavedWidePeekImage) {
                        wideTileXml = Notifications.TileUpdateManager.getTemplateContent(this._widePeekTemplate);
                        this._nowPlayingQuaternaryTitle = this._loadTextOnAppMode(String.id.IDS_MOGO_NOW_PLAYING_XBOXMUSIC, String.id.IDS_MOGO_NOW_PLAYING_XBOXVIDEO);
                        wideTileImageAttributes = wideTileXml.getElementsByTagName("image");
                        wideTileImageAttributes[0].setAttribute("src", "ms-appdata:///local/" + this._peekWideImageFileName)
                    }
                    if (this._peekImageUri === this._lastSavedSquarePeekImage) {
                        squareTileXml = Notifications.TileUpdateManager.getTemplateContent(this._squarePeekTemplate);
                        squareTileImageAttributes = squareTileXml.getElementsByTagName("image");
                        squareTileImageAttributes[0].setAttribute("src", "ms-appdata:///local/" + this._peekSquareImageFileName)
                    }
                    else
                        squareTileXml = Notifications.TileUpdateManager.getTemplateContent(this._squareTemplate);
                    if (!wideTileXml)
                        this._setupWideTemplate(serviceAvailable).then(function finish(wideTileXml) {
                            this._setupTileTextAndCompleteNotification(wideTileXml, squareTileXml)
                        }.bind(this));
                    else
                        this._setupTileTextAndCompleteNotification(wideTileXml, squareTileXml)
                }.bind(this))
            }, _createComposedWidePeekImage: function _createComposedWidePeekImage() {
                var wideTileImageAttributes;
                var displayFile;
                var completion;
                var returnPromise = new WinJS.Promise(function(c, e, p) {
                        completion = c
                    });
                try {
                    if (this._peekImageUri !== this._lastSavedWidePeekImage) {
                        var canvas = document.createElement("canvas");
                        switch (Windows.Graphics.Display.DisplayProperties.resolutionScale) {
                            case Windows.Graphics.Display.ResolutionScale.scale140Percent:
                                canvas.width = this._defaultWideTileWidth * 1.4;
                                canvas.height = this._defaultTileHeight * 1.4;
                                break;
                            case Windows.Graphics.Display.ResolutionScale.scale180Percent:
                                canvas.width = this._defaultWideTileWidth * 1.8;
                                canvas.height = this._defaultTileHeight * 1.8;
                                break;
                            default:
                                canvas.width = this._defaultWideTileWidth * 1.0;
                                canvas.height = this._defaultTileHeight * 1.0;
                                break
                        }
                        var context = canvas.getContext("2d");
                        context.clearRect(0, 0, canvas.width, canvas.height);
                        context.fillStyle = "#000000";
                        context.fillRect(0, 0, canvas.width, canvas.height);
                        var peekImage = new Image;
                        peekImage.onload = function loadArt() {
                            var ratio = peekImage.naturalWidth / peekImage.naturalHeight;
                            var peekImageHeight = canvas.height;
                            var peekImageWidth = ratio * canvas.height;
                            var peekImageX = canvas.width - peekImageWidth;
                            context.drawImage(peekImage, peekImageX, 0, peekImageWidth, peekImageHeight);
                            var gradient = new Image;
                            var output = null;
                            var input = null;
                            var primaryStream = null;
                            gradient.onload = function loadGradient() {
                                context.drawImage(gradient, 0, 0, canvas.width, canvas.height);
                                var blob = canvas.msToBlob();
                                this._createTileImageFile(this._peekWideImageFileName, blob).then(function completePromise(success) {
                                    if (success)
                                        this._lastSavedWidePeekImage = this._peekImageUri;
                                    completion()
                                }.bind(this))
                            }.bind(this);
                            gradient.src = "ms-appx:///images/tiles/NP_tile_gradient.png"
                        }.bind(this);
                        peekImage.src = this._peekImageUri
                    }
                    else
                        completion()
                }
                catch(exception) {
                    MS.Entertainment.Framework.fail("Failure in tilemanager while creating peek images: " + exception);
                    completion()
                }
                return returnPromise
            }, _getShapeImage: function _getShapeImage(width, height) {
                var completion;
                var returnPromise = new WinJS.Promise(function(c, e, p) {
                        completion = c
                    });
                var canvas = document.createElement("canvas");
                var context = canvas.getContext("2d");
                context.clearRect(0, 0, width, height);
                var shapeImage = new Image;
                shapeImage.onload = function loadShapeImage() {
                    context.drawImage(shapeImage, 0, 0, canvas.width, canvas.height);
                    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                    var data = imageData.data;
                    var currentColor = MS.Entertainment.UI.Controls.MusicVisualization.currentPrimaryColor;
                    if (currentColor)
                        for (var i = 0, n = data.length; i < n; i += 4)
                            if (data[i + 3] > 0 && data[i + 3] < 255) {
                                data[i] = currentColor.r;
                                data[i + 1] = currentColor.g;
                                data[i + 2] = currentColor.b
                            }
                    context.putImageData(imageData, 0, 0);
                    completion(canvas.toDataURL())
                }.bind(this);
                MS.Entertainment.Framework.assert(this._shapeAssets, "Shape assets were not defined");
                MS.Entertainment.Framework.assert(this._shapeAssets[MS.Entertainment.UI.Controls.MusicVisualization.currentShape], "No assets defined for this shape: " + MS.Entertainment.UI.Controls.MusicVisualization.currentShape);
                var shapeOptions = this._shapeAssets[MS.Entertainment.UI.Controls.MusicVisualization.currentShape];
                MS.Entertainment.Framework.assert(shapeOptions.length, "No assets defined for this shape: " + MS.Entertainment.UI.Controls.MusicVisualization.currentShape);
                var index = Math.floor(Math.random() * shapeOptions.length);
                shapeImage.src = shapeOptions[index];
                return returnPromise
            }, _createComposedSquarePeekImage: function _createComposedSquarePeekImage() {
                var wideTileImageAttributes;
                var displayFile;
                var completion;
                var returnPromise = new WinJS.Promise(function(c, e, p) {
                        completion = c
                    });
                try {
                    if (this._peekImageUri !== this._lastSavedWidePeekImage) {
                        var canvas = document.createElement("canvas");
                        switch (Windows.Graphics.Display.DisplayProperties.resolutionScale) {
                            case Windows.Graphics.Display.ResolutionScale.scale140Percent:
                                canvas.width = this._defaultSquareTileWidth * 1.4;
                                canvas.height = this._defaultTileHeight * 1.4;
                                break;
                            case Windows.Graphics.Display.ResolutionScale.scale180Percent:
                                canvas.width = this._defaultSquareTileWidth * 1.8;
                                canvas.height = this._defaultTileHeight * 1.8;
                                break;
                            default:
                                canvas.width = this._defaultSquareTileWidth * 1.0;
                                canvas.height = this._defaultTileHeight * 1.0;
                                break
                        }
                        var context = canvas.getContext("2d");
                        context.clearRect(0, 0, canvas.width, canvas.height);
                        context.fillStyle = "#000000";
                        context.fillRect(0, 0, canvas.width, canvas.height);
                        var peekImage = new Image;
                        peekImage.onload = function loadArt() {
                            var ratio = peekImage.naturalWidth / peekImage.naturalHeight;
                            var peekImageHeight = canvas.height;
                            var peekImageWidth = ratio * canvas.height;
                            var peekImageX = canvas.width - peekImageWidth;
                            context.drawImage(peekImage, peekImageX, 0, peekImageWidth, peekImageHeight);
                            var gradient = new Image;
                            var output = null;
                            var input = null;
                            var primaryStream = null;
                            gradient.onload = function loadGradient() {
                                try {
                                    context.drawImage(gradient, 0, 0, canvas.width, canvas.height);
                                    var blob = canvas.msToBlob();
                                    this._createTileImageFile(this._peekSquareImageFileName, blob).then(function completePromise(success) {
                                        if (success)
                                            this._lastSavedSquarePeekImage = this._peekImageUri;
                                        completion()
                                    }.bind(this))
                                }
                                catch(exception) {
                                    MS.Entertainment.Framework.fail("Failure in tilemanager while creating peek images: " + exception)
                                }
                            }.bind(this);
                            gradient.src = "ms-appx:///images/tiles/NP_tile_gradient_1x1.png"
                        }.bind(this);
                        peekImage.src = this._peekImageUri
                    }
                    else
                        completion()
                }
                catch(exception) {
                    MS.Entertainment.Framework.fail("Failure in tilemanager while creating peek images: " + exception);
                    completion()
                }
                return returnPromise
            }, _createNonPeekImage: function _createNonPeekImage() {
                var wideTileImageAttributes;
                var displayFile;
                var widthToUse = 0;
                var heightToUse = 0;
                var completion;
                var returnPromise = new WinJS.Promise(function(c, e, p) {
                        completion = c
                    });
                widthToUse = this._squareThumbnailDimension;
                heightToUse = this._squareThumbnailDimension;
                try {
                    if (this._nowPlayingImageUri !== this._lastSavedThumbnailImage) {
                        var canvas = document.createElement("canvas");
                        var thumbnailImage = new Image;
                        thumbnailImage.addEventListener("load", function loadArt() {
                            canvas.width = widthToUse;
                            canvas.height = heightToUse;
                            var context = canvas.getContext("2d");
                            context.clearRect(0, 0, widthToUse, heightToUse);
                            context.drawImage(thumbnailImage, 0, 0, widthToUse, heightToUse);
                            var output = null;
                            var input = null;
                            var primaryStream = null;
                            var blob = canvas.msToBlob();
                            this._createTileImageFile(this._thumbnailImageFileName, blob).then(function completePromise(success) {
                                if (success)
                                    this._lastSavedThumbnailImage = this._nowPlayingImageUri;
                                completion()
                            }.bind(this))
                        }.bind(this));
                        thumbnailImage.src = this._nowPlayingImageUri
                    }
                    else
                        completion()
                }
                catch(exception) {
                    MS.Entertainment.Framework.fail("Failure in tilemanager while creating thumbnail images: " + exception);
                    completion()
                }
                return returnPromise
            }, _createTileImageFile: function _createTileImageFile(filename, imageBlob, successCallback) {
                var fileName = filename;
                var output = null;
                var input = null;
                var primaryStream = null;
                return Windows.Storage.ApplicationData.current.localFolder.createFileAsync(fileName, Windows.Storage.CreationCollisionOption.replaceExisting).then(function writeImageToDisk(file) {
                        displayFile = file;
                        return file.openAsync(Windows.Storage.FileAccessMode.readWrite)
                    }.bind(this)).then(function(stream) {
                        primaryStream = stream;
                        output = stream.getOutputStreamAt(0);
                        input = imageBlob.msDetachStream();
                        return Windows.Storage.Streams.RandomAccessStream.copyAsync(input, output)
                    }.bind(this)).then(function finishWritingFile() {
                        return output.flushAsync()
                    }.bind(this)).then(function CloseStreamsAndFinish() {
                        input.close();
                        output.close();
                        primaryStream.close();
                        return true
                    }.bind(this), function errorHandler(e) {
                        this._canvasImageErrorHandler(e, input, output, primaryStream)
                    }.bind(this))
            }, _canvasImageErrorHandler: function _canvasImageErrorHandler(error, input, output, stream) {
                if (input)
                    input.close();
                if (output)
                    output.close();
                if (stream)
                    stream.close();
                MS.Entertainment.Framework.assert(false, "Failure while creating peek image file: " + error)
            }, _loadNonPeekTiles: function _loadNonPeekTiles(serviceAvailable) {
                var Notifications = Windows.UI.Notifications;
                try {
                    var squareTileXml = Notifications.TileUpdateManager.getTemplateContent(this._squareTemplate);
                    this._setupWideTemplate(serviceAvailable).done(function finish(wideTileXml) {
                        this._setupTileTextAndCompleteNotification(wideTileXml, squareTileXml)
                    }.bind(this), function failureToSetupTile() {
                        MS.Entertainment.Framework.fail("Failure in tilemanager while creating non peek images")
                    })
                }
                catch(exception) {
                    MS.Entertainment.Framework.fail("Failure in tilemanager while creating non peek images: " + exception)
                }
            }, _setupWideTemplate: function _setupWideTemplate(serviceAvailable) {
                var wideTileXml;
                var wideTileImageAttributes;
                var Notifications = Windows.UI.Notifications;
                var completion;
                var returnPromise = new WinJS.Promise(function(c, e, p) {
                        completion = c
                    });
                if (this._nowPlayingImageUri !== String.empty && serviceAvailable)
                    this._testImageExists(this._nowPlayingImageUri, function imageTestSuccess() {
                        this._createNonPeekImage().then(function nonPeekImageCreated() {
                            if (this._nowPlayingImageUri === this._lastSavedThumbnailImage) {
                                wideTileXml = Notifications.TileUpdateManager.getTemplateContent(this._wideSquareTemplate);
                                this._nowPlayingQuaternaryTitle = this._loadTextOnAppMode(String.id.IDS_MOGO_XBOX_MUSIC_XENON, String.id.IDS_MOGO_XBOX_VIDEO_XENON).format(this._xboxLogo);
                                wideTileImageAttributes = wideTileXml.getElementsByTagName("image");
                                wideTileImageAttributes[0].setAttribute("src", "ms-appdata:///local/" + this._thumbnailImageFileName);
                                completion(wideTileXml)
                            }
                            else {
                                wideTileXml = Notifications.TileUpdateManager.getTemplateContent(this._wideNoImageTemplate);
                                this._nowPlayingQuaternaryTitle = this._loadTextOnAppMode(String.id.IDS_MOGO_NOW_PLAYING_XBOXMUSIC, String.id.IDS_MOGO_NOW_PLAYING_XBOXVIDEO);
                                wideTileXml = Notifications.TileUpdateManager.getTemplateContent(this._wideNoImageTemplate);
                                completion(wideTileXml)
                            }
                        }.bind(this))
                    }.bind(this), function imageTestFailed() {
                        wideTileXml = Notifications.TileUpdateManager.getTemplateContent(this._wideNoImageTemplate);
                        this._nowPlayingQuaternaryTitle = this._loadTextOnAppMode(String.id.IDS_MOGO_NOW_PLAYING_XBOXMUSIC, String.id.IDS_MOGO_NOW_PLAYING_XBOXVIDEO);
                        wideTileXml = Notifications.TileUpdateManager.getTemplateContent(this._wideNoImageTemplate);
                        completion(wideTileXml)
                    }.bind(this));
                else {
                    wideTileXml = Notifications.TileUpdateManager.getTemplateContent(this._wideNoImageTemplate);
                    if (serviceAvailable)
                        this._nowPlayingQuaternaryTitle = this._loadTextOnAppMode(String.id.IDS_MOGO_NOW_PLAYING_XBOXMUSIC, String.id.IDS_MOGO_NOW_PLAYING_XBOXVIDEO);
                    else {
                        this._nowPlayingTertiaryTitle = String.load(String.id.IDS_MOGO_NOW_PLAYING);
                        this._nowPlayingQuaternaryTitle = String.empty
                    }
                    completion(wideTileXml)
                }
                return returnPromise
            }, _loadTextOnAppMode: function _loadTextOnAppMode(musicString, videoString){}, _setupTileTextAndCompleteNotification: function _setupTileTextAndCompleteNotification(wideTileXml, squareTileXml) {
                try {
                    if (!this._nowPlayingTitle) {
                        if (this._tileUpdater)
                            this._tileUpdater.clear();
                        return
                    }
                    var Notifications = Windows.UI.Notifications;
                    wideTileXml.getElementsByTagName("binding")[0].setAttribute("branding", "name");
                    squareTileXml.getElementsByTagName("binding")[0].setAttribute("branding", "name");
                    var wideTileTextAttributes = wideTileXml.getElementsByTagName("text");
                    var squareTileTextAttributes = squareTileXml.getElementsByTagName("text");
                    squareTileTextAttributes[0].appendChild(squareTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(this._nowPlayingTitle)));
                    squareTileTextAttributes[1].appendChild(squareTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(String.load(String.id.IDS_MOGO_NOW_PLAYING))));
                    wideTileTextAttributes[0].appendChild(wideTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(this._nowPlayingTitle)));
                    wideTileTextAttributes[1].appendChild(wideTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(this._nowPlayingSubTitle)));
                    if (wideTileTextAttributes.length > 2) {
                        wideTileTextAttributes[2].appendChild(wideTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(this._nowPlayingTertiaryTitle)));
                        wideTileTextAttributes[3].appendChild(wideTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(this._nowPlayingQuaternaryTitle)))
                    }
                    var squareTileXmlNode = wideTileXml.importNode(squareTileXml.getElementsByTagName("binding")[0], true);
                    wideTileXml.getElementsByTagName("visual")[0].appendChild(squareTileXmlNode);
                    var tileNotification = new Notifications.TileNotification(wideTileXml);
                    tileNotification.tag = this._nowPlayingTileTag;
                    if (this._tileUpdater)
                        this._tileUpdater.update(tileNotification)
                }
                catch(exception) {
                    MS.Entertainment.Framework.fail("Failure in tilemanager while finishing notification: " + exception)
                }
            }, _testImageExists: function _testImageExists(imageUri, success, failure) {
                var imageLoader = new Image;
                imageLoader.addEventListener("load", function imageLoaded(event) {
                    this._loaded = true;
                    success(imageUri)
                }.bind(this), false);
                imageLoader.addEventListener("error", function imageError(event) {
                    if (failure)
                        failure(imageUri)
                }.bind(this), false);
                imageLoader.setAttribute("src", imageUri)
            }, _updateMetadata: function _updateMetadata(forceUpdate) {
                var promisesToJoin = [];
                if (!this._uiStateService.isAppVisible) {
                    if (this._playbackSession && this._playbackSession.currentMedia) {
                        promisesToJoin.push(this._getBackgroundImage());
                        promisesToJoin.push(MS.Entertainment.UI.Shell.ImageLoader.getServiceImageUrl(this._playbackSession.currentMedia, 160, 160, null, null, null, MS.Entertainment.ImageContentType.png).then(function loadImage(uri) {
                            if (uri !== MS.Entertainment.UI.Shell.ImageLoader.MediaDefaultUrls.movie && uri !== MS.Entertainment.UI.Shell.ImageLoader.MediaDefaultUrls.artist)
                                this._nowPlayingImageUri = uri;
                            else
                                this._nowPlayingImageUri = String.empty
                        }.bind(this)));
                        this._joinedImageUrlPromises = WinJS.Promise.join(promisesToJoin)
                    }
                    else {
                        this._peekImageUri = null;
                        this._nowPlayingImageUri = String.empty;
                        this._joinedImageUrlPromises = WinJS.Promise.as()
                    }
                    if (forceUpdate || this._playbackSession && this._playbackSession.currentMedia && this._playbackSession.currentMedia.name != this._lastItemTitle) {
                        this._startUpdateTimer();
                        this._lastItemTitle = this._playbackSession.currentMedia.name
                    }
                }
                if (this._playbackSession && this._playbackSession.currentMedia) {
                    try {
                        Windows.Media.MediaControl.trackName = this._playbackSession.currentMedia.name;
                        if (this._playbackSession.currentMedia.artistName)
                            Windows.Media.MediaControl.artistName = this._playbackSession.currentMedia.artistName;
                        else
                            Windows.Media.MediaControl.artistName = ""
                    }
                    catch(exception) {}
                    this._setupStrings()
                }
                else {
                    this._nowPlayingTitle = String.empty;
                    try {
                        Windows.Media.MediaControl.artistName = "";
                        Windows.Media.MediaControl.trackName = ""
                    }
                    catch(exception) {}
                }
            }, _getBackgroundImage: function _getBackgroundImage() {
                var convertedMediaItem = null;
                this._peekImageUri = null;
                switch (this._playbackSession.currentMedia.mediaType) {
                    default:
                        convertedMediaItem = this._playbackSession.currentMedia;
                        break
                }
                if (!this._peekImageUri)
                    if (this._playbackSession.currentMedia.backgroundImageUri) {
                        var imageRequestSize = MS.Entertainment.UI.Shell.ImageLoader.getServiceImageRequestSize({
                                x: 267, y: 150
                            });
                        var imageUrl = MS.Entertainment.Utilities.UriFactory.appendQuery(this._playbackSession.currentMedia.backgroundImageUri, {
                                format: MS.Entertainment.ImageFormat.png, width: imageRequestSize.x, height: imageRequestSize.y
                            });
                        MS.Entertainment.UI.Shell.ImageLoader.cacheImage(imageUrl, String.empty).done(function cacheImage(url) {
                            this._peekImageUri = url
                        }.bind(this), function useDefaultImage(error) {
                            this._peekImageUri = String.empty;
                            MS.Entertainment.Framework.fail(error)
                        }.bind(this))
                    }
                return WinJS.Promise.wrap(this._peekImageUri)
            }, _setupStrings: function _setupStrings() {
                this._nowPlayingTitle = String.empty;
                this._nowPlayingSubTitle = String.empty;
                this._nowPlayingTertiaryTitle = String.empty;
                this._nowPlayingQuaternaryTitle = String.empty
            }
    }, {}), initializeTileManager: function initializeTileManager() {
            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.tileManager)
        }
});
MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.tileManager, function TileManagerFactory() {
    return new MS.Entertainment.Framework.TileManager
})
