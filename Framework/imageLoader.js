/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/debug.js", "/Framework/endpoints.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Shell");
WinJS.Namespace.define("MS.Entertainment.UI.Shell", {
    ImageLoader: WinJS.Class.define(function(imgLoadedCallback) {
        this._imgLoadedCallback = imgLoadedCallback;
        this._imgElement = document.createElement("img");
        this._imgElement.suppressUnload = true;
        this.state = this.states.initial
    }, {
        _imgLoadedCallback: null, _imgElement: null, _imgUrl: null, _loadingDefault: false, states: {
                value: {
                    initial: -1, loading: 0, error: 1, loaded: 2, loadedDefault: 3, loadedFallback: 4
                }, writable: false
            }, loadCatalogImage: function loadCatalogImage(defaultImageUrl, imageId, imageIdType, dimensions, forceImageResize, ignoreZeroLengths, requestedImage, imageChildId, imageContentType) {
                var url = MS.Entertainment.UI.Shell.ImageLoader.makeCatalogImageUri(imageId, imageIdType, dimensions, forceImageResize, ignoreZeroLengths, requestedImage, imageChildId, imageContentType);
                this.loadImage(url, defaultImageUrl)
            }, loadImage: function loadImage(imageUrl, defaultImageUrl, loadingImageUrl) {
                this._loadingDefault = false;
                this.loadImageInternal(imageUrl, defaultImageUrl, loadingImageUrl)
            }, loadImageInternal: function loadImageInternal(imageUrl, defaultImageUrl, loadingImageUrl) {
                this.state = this.states.initial;
                if (loadingImageUrl)
                    this._imgUrl = loadingImageUrl;
                else
                    this._imgUrl = MS.Entertainment.UI.Shell.ImageLoader._commonLoading;
                this._imgElement.setAttribute("src", this._imgUrl);
                if (!imageUrl)
                    if (defaultImageUrl) {
                        this.state = this.states.loadedDefault;
                        this.imgUrl = defaultImageUrl
                    }
                    else {
                        this.state = this.states.loadedFallback;
                        this._loadingDefault = false;
                        this.imgUrl = MS.Entertainment.UI.Shell.ImageLoader._commonDefault
                    }
                else if (imageUrl === MS.Entertainment.UI.Shell.ImageLoader.defaultImage) {
                    this.state = this.states.error;
                    this._loadingDefault = true;
                    this.loadImage(null, defaultImageUrl)
                }
                else if (MS.Entertainment.UI.Shell.ImageLoader.isWebUrl(imageUrl))
                    this._loadImageFromWeb(imageUrl, defaultImageUrl);
                else if (MS.Entertainment.UI.Shell.ImageLoader.isBlobUrl(imageUrl))
                    this._loadImageFromWeb(imageUrl, defaultImageUrl);
                else if (MS.Entertainment.UI.Shell.ImageLoader.isAppDataUrl(imageUrl))
                    this._loadImageFromWeb(imageUrl, defaultImageUrl);
                else if (MS.Entertainment.UI.Shell.ImageLoader.isPackageUrl(imageUrl))
                    this._loadImageFromWeb(imageUrl, defaultImageUrl);
                else
                    this._loadImageFromPath(imageUrl, defaultImageUrl)
            }, state: {
                get: function getState() {
                    return this._state
                }, set: function setState(value) {
                        if (this._state !== value)
                            this._state = value
                    }
            }, imgContainer: {get: function getImgContainer() {
                    return this._imgElement
                }}, imgUrl: {
                get: function getImgUrl() {
                    return this._imgUrl
                }, set: function setImgUrl(value) {
                        if (this._imgUrl !== value) {
                            this._imgUrl = value;
                            this._imgElement.setAttribute("src", this._imgUrl);
                            this._fireImgLoaded(this._imgUrl)
                        }
                    }
            }, _fireImgLoaded: function(imageUrl) {
                if (this._imgLoadedCallback)
                    this._imgLoadedCallback(imageUrl)
            }, _loadImageFromWeb: function(imageUrl, defaultImageUrl) {
                var that = this;
                var remoteImage = new Image;
                remoteImage.addEventListener("load", function imageOnLoad() {
                    if (that._loadingDefault)
                        that.state = that.states.loadedDefault;
                    else
                        that.state = that.states.loaded;
                    that._loadingDefault = false;
                    that.imgUrl = remoteImage.src
                });
                remoteImage.addEventListener("error", function imageOnError() {
                    that.state = that.states.error;
                    that._loadingDefault = true;
                    that.loadImageInternal(null, defaultImageUrl)
                });
                this.state = this.states.loading;
                remoteImage.src = imageUrl
            }, _loadImageFromPath: function(imagePath, defaultImageUrl, imageContainer) {
                var that = this;
                try {
                    Windows.Storage.StorageFile.getFileFromPathAsync(imagePath).then(function(loadedFile) {
                        var url = URL.createObjectURL(loadedFile, {oneTimeOnly: true});
                        if (that._loadingDefault)
                            that.state = that.states.loadedDefault;
                        else
                            that.state = that.states.loaded;
                        that._loadingDefault = false;
                        that.imgUrl = url
                    }, function() {
                        that.state = that.states.error;
                        that._loadingDefault = true;
                        that.loadImageInternal(null, defaultImageUrl)
                    });
                    this.state = this.states.loading
                }
                catch(e) {
                    that.loadImageInternal(null, defaultImageUrl)
                }
            }
    }, {
        _commonDefault: "ms-appx:///Images/img_not_found.png", _commonLoading: "ms-appx:///Images/loading_image.png", _endpointCache: null, _initializeEndpointCache: function _initializeEndpointCache() {
                if (!MS.Entertainment.UI.Shell.ImageLoader._endpointCache)
                    MS.Entertainment.UI.Shell.ImageLoader._endpointCache = {
                        imageCatalog: MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_ImageCatalog), rootCatalog: MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_RootCatalog), socialApi: MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_SocialApi), avatarImage: MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_AvatarImage), xboxTilesFormat: MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_XboxTilesFormat)
                    }
            }, defaultImage: -1, isBlobUrl: function(imageUrl) {
                return (imageUrl && imageUrl.match && imageUrl.match(/^blob*:/i))
            }, isAppDataUrl: function(imageUrl) {
                return (imageUrl && imageUrl.match && imageUrl.match(/^ms\-appdata*:\/\//i))
            }, isPackageUrl: function(imageUrl) {
                return (imageUrl && imageUrl.match && imageUrl.match(/^ms\-appx*:\/\//i))
            }, isWebUrl: function(imageUrl) {
                return (imageUrl && imageUrl.match && imageUrl.match(/^http[s]*:\/\//i))
            }, isStreamingUrl: function(imageUrl) {
                return (imageUrl && imageUrl.match && imageUrl.match(/^zest:/i))
            }, MediaDefaultUrls: {
                track: "ms-appx:///Images/GenericIcons/ico_74x_GenericMusic_Small.png", album: "ms-appx:///Images/GenericIcons/ico_74x_GenericMusic_Small.png", artist: "ms-appx:///Images/GenericIcons/ico_74x_GenericMusic_Small.png", playlist: "ms-appx:///Images/GenericIcons/ico_74x_GenericMusic_Small.png", game: "ms-appx:///Images/GenericIcons/ico_74x_GenericGames_Small.png", movie: "ms-appx:///Images/GenericIcons/ico_74x_GenericVideo_Small.png", musicVideo: "ms-appx:///Images/GenericIcons/ico_74x_GenericVideo_Small.png", otherVideo: "ms-appx:///Images/GenericIcons/ico_74x_GenericVideo_Small.png", tvSeason: "ms-appx:///Images/GenericIcons/ico_74x_GenericVideo_Small.png", tvSeries: "ms-appx:///Images/GenericIcons/ico_74x_GenericVideo_Small.png", tvEpisode: "ms-appx:///Images/GenericIcons/ico_74x_GenericVideo_Small.png", activity: "ms-appx:///Images/GenericIcons/ico_74x_GenericSmartGlass_Small.png"
            }, _defaultImageSize: {
                x: 320, y: 320
            }, _acceptableValues: [{
                    x: 1920, y: 1080
                }, {
                    x: 1366, y: 768
                }, {
                    x: 1280, y: 720
                }, {
                    x: 1012, y: 693
                }, {
                    x: 854, y: 480
                }, {
                    x: 853, y: 480
                }, {
                    x: 480, y: 480
                }, {
                    x: 480, y: 270
                }, {
                    x: 420, y: 320
                }, {
                    x: 395, y: 270
                }, {
                    x: 347, y: 195
                }, {
                    x: 320, y: 320
                }, {
                    x: 285, y: 195
                }, {
                    x: 267, y: 150
                }, {
                    x: 258, y: 258
                }, {
                    x: 258, y: 194
                }, {
                    x: 243, y: 137
                }, {
                    x: 240, y: 240
                }, {
                    x: 234, y: 320
                }, {
                    x: 219, y: 150
                }, {
                    x: 213, y: 120
                }, {
                    x: 175, y: 120
                }, {
                    x: 172, y: 258
                }, {
                    x: 160, y: 160
                }, {
                    x: 160, y: 120
                }, {
                    x: 144, y: 108
                }, {
                    x: 112, y: 84
                }, {
                    x: 108, y: 108
                }, {
                    x: 108, y: 72
                }, {
                    x: 107, y: 160
                }, {
                    x: 100, y: 100
                }, {
                    x: 84, y: 84
                }, {
                    x: 84, y: 56
                }, {
                    x: 80, y: 60
                }, {
                    x: 72, y: 72
                }, {
                    x: 64, y: 64
                }, {
                    x: 64, y: 48
                }, {
                    x: 60, y: 60
                }, {
                    x: 60, y: 45
                }, {
                    x: 60, y: 40
                }, {
                    x: 56, y: 56
                }, {
                    x: 52, y: 52
                }, {
                    x: 50, y: 50
                }, {
                    x: 44, y: 44
                }, {
                    x: 43, y: 64
                }, {
                    x: 40, y: 40
                }], _acceptableWideValues: [{
                    x: 1920, y: 1080
                }, {
                    x: 1366, y: 768
                }, {
                    x: 1280, y: 720
                }, {
                    x: 1012, y: 693
                }, {
                    x: 854, y: 480
                }, {
                    x: 853, y: 480
                }, {
                    x: 480, y: 270
                }, {
                    x: 420, y: 320
                }, {
                    x: 395, y: 270
                }, {
                    x: 347, y: 195
                }, {
                    x: 285, y: 195
                }, {
                    x: 267, y: 150
                }, {
                    x: 258, y: 194
                }, {
                    x: 243, y: 137
                }, {
                    x: 219, y: 150
                }, {
                    x: 213, y: 120
                }, {
                    x: 175, y: 120
                }, {
                    x: 160, y: 120
                }, {
                    x: 144, y: 108
                }, {
                    x: 112, y: 84
                }, {
                    x: 108, y: 72
                }, {
                    x: 84, y: 56
                }, {
                    x: 80, y: 60
                }, {
                    x: 64, y: 48
                }, {
                    x: 60, y: 45
                }, {
                    x: 60, y: 40
                }], _acceptableSquareValues: [{
                    x: 480, y: 480
                }, {
                    x: 320, y: 320
                }, {
                    x: 258, y: 258
                }, {
                    x: 240, y: 240
                }, {
                    x: 160, y: 160
                }, {
                    x: 108, y: 108
                }, {
                    x: 100, y: 100
                }, {
                    x: 84, y: 84
                }, {
                    x: 72, y: 72
                }, {
                    x: 64, y: 64
                }, {
                    x: 60, y: 60
                }, {
                    x: 56, y: 56
                }, {
                    x: 52, y: 52
                }, {
                    x: 50, y: 50
                }, {
                    x: 44, y: 44
                }, {
                    x: 40, y: 40
                }], _acceptableTallValues: [{
                    x: 234, y: 320
                }, {
                    x: 172, y: 258
                }, {
                    x: 107, y: 160
                }, {
                    x: 43, y: 64
                }], _acceptableWidths: [1920, 1366, 1280, 1012, 854, 853, 480, 420, 395, 347, 320, 285, 267, 258, 243, 240, 234, 219, 213, 175, 172, 160, 112, 108, 107, 100, 84, 80, 72, 64, 60, 56, 52, 50, 44, 43, 40], _acceptableHeights: [1080, 768, 720, 693, 480, 320, 270, 258, 240, 195, 194, 160, 150, 137, 120, 108, 100, 84, 72, 64, 60, 56, 52, 50, 48, 45, 44, 40], makeCatalogImageUri: function makeCatalogImageUri(imageId, imageIdType, dimensions, forceImageResize, ignoreZeroLengths, requestedImage, imageChildId, imageContentType) {
                var url = null;
                var idTypes = MS.Entertainment.ImageIdType;
                var verifiedRequestedImage;
                var verifiedDimensions;
                var verifiedImageIdType;
                var paramArray = [];
                if (!imageId)
                    throw"Must specify a valid catalog image guid";
                if (imageContentType === null || imageContentType === undefined)
                    imageContentType = MS.Entertainment.ImageContentType.jpeg;
                if (imageIdType === null || imageIdType === undefined)
                    verifiedImageIdType = MS.Entertainment.ImageIdType.image;
                else {
                    MS.Entertainment.Utilities.validateIsMemberOrThrow(imageIdType, MS.Entertainment.ImageIdType);
                    verifiedImageIdType = imageIdType
                }
                if (!requestedImage)
                    verifiedRequestedImage = this._getStringFromRequestedImage(MS.Entertainment.ImageRequested.primaryImage);
                else {
                    MS.Entertainment.Utilities.validateIsMemberOrThrow(requestedImage, MS.Entertainment.ImageRequested);
                    verifiedRequestedImage = this._getStringFromRequestedImage(requestedImage)
                }
                verifiedDimensions = {
                    x: 0, y: 0
                };
                if (dimensions) {
                    if (dimensions.hasOwnProperty("x") && dimensions.x)
                        verifiedDimensions.x = dimensions.x;
                    if (dimensions.hasOwnProperty("y") && dimensions.y)
                        verifiedDimensions.y = dimensions.y
                }
                try {
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    MS.Entertainment.UI.Shell.ImageLoader._initializeEndpointCache();
                    switch (verifiedImageIdType) {
                        case idTypes.movie:
                        case idTypes.editorialMovie:
                            if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace))
                                url = "{0}/movie/{1}/{2}".format(MS.Entertainment.UI.Shell.ImageLoader._endpointCache.imageCatalog, imageId, verifiedRequestedImage);
                            break;
                        case idTypes.artist:
                        case idTypes.editorialArtist:
                            if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace))
                                url = "{0}/music/artist/{1}/{2}".format(MS.Entertainment.UI.Shell.ImageLoader._endpointCache.imageCatalog, imageId, verifiedRequestedImage);
                            break;
                        case idTypes.album:
                        case idTypes.editorialAlbum:
                            if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace))
                                url = "{0}/music/album/{1}/{2}".format(MS.Entertainment.UI.Shell.ImageLoader._endpointCache.imageCatalog, imageId, verifiedRequestedImage);
                            break;
                        case idTypes.track:
                        case idTypes.editorialTrack:
                            if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace))
                                url = "{0}/music/track/{1}/{2}".format(MS.Entertainment.UI.Shell.ImageLoader._endpointCache.imageCatalog, imageId, verifiedRequestedImage);
                            break;
                        case idTypes.musicVideo:
                            if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicVideosMarketplace))
                                url = "{0}/music/musicvideo/{1}/{2}".format(MS.Entertainment.UI.Shell.ImageLoader._endpointCache.imageCatalog, imageId, verifiedRequestedImage);
                            break;
                        case idTypes.movieTrailer:
                            if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.movieTrailersMarketplace))
                                url = "{0}/movieTrailer/{1}/{2}".format(MS.Entertainment.UI.Shell.ImageLoader._endpointCache.imageCatalog, imageId, verifiedRequestedImage);
                            break;
                        case idTypes.playlist:
                            if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace))
                                url = "{0}/music/playlist/{1}/{2}".format(MS.Entertainment.UI.Shell.ImageLoader._endpointCache.imageCatalog, imageId, verifiedRequestedImage);
                            break;
                        case idTypes.podcast:
                            url = "{0}/podcast/{1}/{2}".format(MS.Entertainment.UI.Shell.ImageLoader._endpointCache.imageCatalog, imageId, verifiedRequestedImage);
                            break;
                        case idTypes.network:
                            if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace))
                                url = "{0}/tv/network/{1}/{2}".format(MS.Entertainment.UI.Shell.ImageLoader._endpointCache.imageCatalog, imageId, verifiedRequestedImage);
                            break;
                        case idTypes.series:
                        case idTypes.editorialSeries:
                            if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace))
                                url = "{0}/tv/series/{1}/{2}".format(MS.Entertainment.UI.Shell.ImageLoader._endpointCache.imageCatalog, imageId, verifiedRequestedImage);
                            break;
                        case idTypes.episode:
                            if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace))
                                url = "{0}/tv/episode/{1}/{2}".format(MS.Entertainment.UI.Shell.ImageLoader._endpointCache.imageCatalog, imageId, verifiedRequestedImage);
                            break;
                        case idTypes.application:
                            url = "{0}/apps/{1}/{2}".format(MS.Entertainment.UI.Shell.ImageLoader._endpointCache.imageCatalog, imageId, verifiedRequestedImage);
                            break;
                        case idTypes.season:
                        case idTypes.editorialSeason:
                            if (typeof imageChildId === "undefined")
                                throw"imageChildId must be specified for seasons";
                            if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace))
                                url = "{0}/tv/series/{1}/seasons/{2}/{3}".format(MS.Entertainment.UI.Shell.ImageLoader._endpointCache.imageCatalog, imageId, imageChildId, verifiedRequestedImage);
                            break;
                        case idTypes.parentalRating:
                            url = "{0}/apps/{1}/ratingImage".format(MS.Entertainment.UI.Shell.ImageLoader._endpointCache.rootCatalog, imageId);
                            imageContentType = MS.Entertainment.ImageContentType.none;
                            break;
                        case idTypes.social:
                            forceImageResize = false;
                            ignoreZeroLengths = true;
                            imageContentType = MS.Entertainment.ImageContentType.none;
                            url = "{0}/members/{1}/usertile".format(MS.Entertainment.UI.Shell.ImageLoader._endpointCache.socialApi, imageId);
                            break;
                        case idTypes.gamer:
                            forceImageResize = false;
                            ignoreZeroLengths = true;
                            imageContentType = MS.Entertainment.ImageContentType.none;
                            url = "{0}/{1}/avatarpic-l.png".format(MS.Entertainment.UI.Shell.ImageLoader._endpointCache.avatarImage, imageId);
                            break;
                        case idTypes.image:
                            url = "{0}/image/{1}".format(MS.Entertainment.UI.Shell.ImageLoader._endpointCache.imageCatalog, imageId);
                            break;
                        case idTypes.studio:
                            if (typeof imageChildId === "undefined")
                                throw"imageChildId must be specified for studios";
                            url = "{0}/{1}/studio/{2}/{3}".format(MS.Entertainment.UI.Shell.ImageLoader._endpointCache.imageCatalog, imageChildId, imageId, verifiedRequestedImage);
                            break;
                        case idTypes.xboxGame:
                            if (requestedImage === MS.Entertainment.ImageRequested.primaryImage) {
                                forceImageResize = false;
                                ignoreZeroLengths = true;
                                imageContentType = MS.Entertainment.ImageContentType.none;
                                url = MS.Entertainment.UI.Shell.ImageLoader._endpointCache.xboxTilesFormat.replace(/%s/i, parseInt(imageId).toString(16));
                                if (verifiedDimensions.x >= 145)
                                    url = url + "/largeboxart.jpg";
                                else
                                    url = url + "/smallboxart.jpg"
                            }
                            break;
                        default:
                            throw"unknown imageidtype";
                    }
                }
                catch(error) {
                    return null
                }
                if (forceImageResize)
                    paramArray.push({
                        name: "resize", value: "true"
                    });
                var scaleFactor;
                switch (Windows.Graphics.Display.DisplayProperties.resolutionScale) {
                    case Windows.Graphics.Display.ResolutionScale.scale140Percent:
                        scaleFactor = 1.4;
                        break;
                    case Windows.Graphics.Display.ResolutionScale.scale180Percent:
                        scaleFactor = 1.8;
                        break;
                    default:
                        scaleFactor = 1.0;
                        break
                }
                var calcSize = this._calculateImageUriSize(verifiedDimensions, scaleFactor);
                if (verifiedDimensions.x > 0 || !ignoreZeroLengths)
                    paramArray.push({
                        name: "width", value: calcSize.x.toString()
                    });
                if (verifiedDimensions.y > 0 || !ignoreZeroLengths)
                    paramArray.push({
                        name: "height", value: calcSize.y.toString()
                    });
                if (imageContentType)
                    paramArray.push({
                        name: "contenttype", value: imageContentType
                    });
                if (url && paramArray.length > 0)
                    url = url + this._generateUrlParamSubstring(paramArray);
                return url
            }, _calculateImageUriSize: function _calculateImageUriSize(size, scaleFactor) {
                var calcSize = {
                        x: size.x, y: size.y
                    };
                if (size.x === 0)
                    if (size.y === 0)
                        calcSize = this._findAcceptableWidthHeight(this._defaultImageSize.x * scaleFactor, this._defaultImageSize.y * scaleFactor);
                    else
                        calcSize = this._findMatchingWidth(size.y * scaleFactor);
                else if (size.y === 0)
                    calcSize = this._findMatchingHeight(size.x * scaleFactor);
                else {
                    var scaledX = size.x * scaleFactor;
                    var scaledY = size.y * scaleFactor;
                    calcSize = this._findAcceptableWidthHeight(scaledX, scaledY)
                }
                return calcSize
            }, _findAcceptableWidthHeight: function _findAcceptableWidthHeight(width, height) {
                var calcSize = {
                        x: -1, y: 0
                    };
                var index = 0;
                var aspectAcceptableValues = [];
                var searchSet = [];
                if (width === height)
                    aspectAcceptableValues = this._acceptableSquareValues;
                else if (width > height)
                    aspectAcceptableValues = this._acceptableWideValues;
                else
                    aspectAcceptableValues = this._acceptableTallValues;
                for (var index = 0; index < aspectAcceptableValues.length; index++)
                    if (calcSize.x > -1)
                        if (calcSize.x === aspectAcceptableValues[index].x)
                            searchSet.push(aspectAcceptableValues[index]);
                        else
                            break;
                    else if (aspectAcceptableValues[index].x <= width) {
                        if ((aspectAcceptableValues[index].x < width) && (index > 0))
                            index--;
                        calcSize.x = aspectAcceptableValues[index].x;
                        searchSet.push(aspectAcceptableValues[index])
                    }
                for (var index = 0; index < searchSet.length; index++)
                    if (searchSet[index].y <= height) {
                        calcSize.y = searchSet[index].y;
                        break
                    }
                if (calcSize.x === -1) {
                    var size = aspectAcceptableValues[aspectAcceptableValues.length - 1];
                    calcSize.x = size.x;
                    calcSize.y = size.y
                }
                if (calcSize.y === 0)
                    calcSize.y = searchSet[searchSet.length - 1].y;
                return calcSize
            }, _findMatchingWidth: function _findMatchingWidth(height) {
                var calcSize = {
                        x: 0, y: height
                    };
                var index = 0;
                while (index < this._acceptableHeights.length - 1 && height < this._acceptableHeights[index])
                    index = index + 1;
                calcSize.y = this._acceptableHeights[index];
                var i;
                for (i = 0; i < this._acceptableValues.length; i++)
                    if (this._acceptableValues[i].y === calcSize.y) {
                        calcSize.x = this._acceptableValues[i].x;
                        break
                    }
                return calcSize
            }, _findMatchingHeight: function _findMatchingHeight(width) {
                var calcSize = {
                        x: width, y: 0
                    };
                var index = 0;
                while (index < this._acceptableWidths.length - 1 && width < this._acceptableWidths[index])
                    index = index + 1;
                calcSize.x = this._acceptableWidths[index];
                var i;
                for (i = 0; i < this._acceptableValues.length; i++)
                    if (this._acceptableValues[i].x === calcSize.x) {
                        calcSize.y = this._acceptableValues[i].y;
                        break
                    }
                return calcSize
            }, _generateUrlParamSubstring: function _generateUrlParamSubstring(params) {
                var paramString = "";
                for (var i = 0; i < params.length; i++) {
                    if (i === 0)
                        paramString = paramString + "?";
                    else
                        paramString = paramString + "&";
                    paramString = paramString + params[i].name.toString();
                    paramString = paramString + "=";
                    paramString = paramString + params[i].value.toString()
                }
                return paramString
            }, _getStringFromRequestedImage: function _getStringFromRequestedImage(requestedImage) {
                for (var k in MS.Entertainment.ImageRequested)
                    if (MS.Entertainment.ImageRequested[k] === requestedImage)
                        return k;
                MS.Entertainment.UI.Shell.assert(false, "Invalid value for ImageRequested");
                return null
            }, imageManager: {get: function getImageManager() {
                    if (!this._imageManager)
                        this._imageManager = new Microsoft.Entertainment.ImageManager;
                    return this._imageManager
                }}, cacheImage: function cacheUrl(url, defaultImage) {
                return this.imageManager.retrieveImageFromUrlAsync(Microsoft.Entertainment.NetworkUsage.normal, url, String.empty, defaultImage)
            }, _getCurrentScaleFactor: function _getCurrentScaleFactor() {
                var scaleFactor = 1.0;
                switch (Windows.Graphics.Display.DisplayProperties.resolutionScale) {
                    case Windows.Graphics.Display.ResolutionScale.scale140Percent:
                        scaleFactor = 1.4;
                        break;
                    case Windows.Graphics.Display.ResolutionScale.scale180Percent:
                        scaleFactor = 1.8;
                        break;
                    case Windows.Graphics.Display.ResolutionScale.scale100Percent:
                        scaleFactor = 1.0;
                        break;
                    default:
                        MS.Entertainment.UI.Shell.assert(false, "Unknown scale size requested");
                        scaleFactor = 1.0;
                        break
                }
                return scaleFactor
            }, getServiceImageRequestSize: function getServiceImageRequestSize(initialSize) {
                var scaleFactor = this._getCurrentScaleFactor();
                return this._calculateImageUriSize(initialSize, scaleFactor)
            }, getServiceImageUrl: function getServiceImageUrl(mediaItem, width, height, requestedImage, imageIdType, defaultImageUri, imageContentType) {
                var resultPromise;
                var imageId = null;
                var data = null;
                var convertedItem = null;
                var verifiedRequestedImage;
                var asyncUri;
                if (!mediaItem)
                    return WinJS.Promise.wrap();
                if (!requestedImage)
                    verifiedRequestedImage = MS.Entertainment.ImageRequested.primaryImage;
                else {
                    MS.Entertainment.Utilities.validateIsMemberOrThrow(requestedImage, MS.Entertainment.ImageRequested);
                    verifiedRequestedImage = requestedImage
                }
                if (mediaItem.serviceType === MS.Entertainment.Data.Augmenter.ServiceTypes.editorialItem) {
                    convertedItem = MS.Entertainment.Utilities.convertEditorialItem(mediaItem);
                    mediaItem.mediaType = convertedItem.mediaType;
                    mediaItem.videoType = convertedItem.videoType;
                    imageIdType = imageIdType || convertedItem.serviceImageType;
                    if (!mediaItem.mediaType && MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Hub)
                        mediaItem.mediaType = Microsoft.Entertainment.Queries.ObjectType.editorial
                }
                if (mediaItem.serviceId && mediaItem.serviceId !== MS.Entertainment.Utilities.EMPTY_GUID)
                    imageId = mediaItem.serviceId;
                var mediaItemDefaultImage = MS.Entertainment.UI.Shell.ImageLoader.defaultImage;
                height = height || MS.Entertainment.UI.Shell.ImageLoader.DefaultThumbnailSizes.defaultWidth;
                imageIdType = imageIdType || mediaItem.serviceImageType;
                switch (mediaItem.mediaType || mediaItem.serviceType) {
                    case Microsoft.Entertainment.Queries.ObjectType.game:
                        mediaItemDefaultImage = MS.Entertainment.UI.Shell.ImageLoader.MediaDefaultUrls.game;
                        if (mediaItem.hexTitleId) {
                            imageId = parseInt(mediaItem.hexTitleId);
                            data = parseInt(mediaItem.hexTitleId);
                            imageIdType = imageIdType || MS.Entertainment.ImageIdType.xboxGame
                        }
                        width = width || 234;
                        break;
                    case Microsoft.Entertainment.Queries.ObjectType.editorial:
                        imageIdType = MS.Entertainment.ImageIdType.image;
                        break;
                    default:
                        MS.Entertainment.UI.Shell.assert(false, "Unknown media type or service type had image requested, MediaType: " + mediaItem.mediaType + " ServiceType: " + mediaItem.serviceType + " ImageIdType: " + imageIdType);
                        width = 240;
                        break
                }
                if (imageIdType === MS.Entertainment.ImageIdType.image && mediaItem.imageId && mediaItem.imageId !== MS.Entertainment.Utilities.EMPTY_GUID)
                    imageId = mediaItem.imageId;
                if (typeof defaultImageUri !== "string")
                    defaultImageUri = mediaItemDefaultImage;
                var scaleFactor = this._getCurrentScaleFactor();
                var size = {
                        x: 0, y: 0
                    };
                if (width)
                    size.x = width;
                if (height)
                    size.y = height;
                var calculatedSize = this._calculateImageUriSize(size, scaleFactor);
                MS.Entertainment.UI.Shell.assert(size.x || (MS.Entertainment.UI.Shell.ImageLoader._acceptableWidths.indexOf(size.x) > -1), "ImageLoader: pixel width is not an acceptable value");
                MS.Entertainment.UI.Shell.assert(size.y || (MS.Entertainment.UI.Shell.ImageLoader._acceptableHeights.indexOf(size.y) > -1), "ImageLoader: pixel height is not an acceptable value");
                if (mediaItem.imageResizeUri)
                    asyncUri = MS.Entertainment.Utilities.UriFactory.appendQuery(mediaItem.imageResizeUri, {
                        contenttype: MS.Entertainment.ImageContentType.jpeg, width: calculatedSize.x, height: calculatedSize.y, resize: true
                    });
                else if (mediaItem.imageUri)
                    asyncUri = mediaItem.imageUri;
                else if (imageIdType !== null && imageIdType !== undefined && imageId && imageId !== MS.Entertainment.Utilities.EMPTY_GUID)
                    asyncUri = this.makeCatalogImageUri(imageId, imageIdType, calculatedSize, true, false, verifiedRequestedImage, data, imageContentType);
                if (asyncUri)
                    if (MS.Entertainment.UI.Shell.ImageLoader.isPackageUrl(asyncUri))
                        resultPromise = WinJS.Promise.wrap(asyncUri);
                    else
                        resultPromise = this.imageManager.retrieveImageFromUrlAsync(Microsoft.Entertainment.NetworkUsage.normal, asyncUri, mediaItem.filePath || String.empty, defaultImageUri);
                else if (mediaItem.filePath && !MS.Entertainment.UI.Shell.ImageLoader.isWebUrl(mediaItem.filePath) && !MS.Entertainment.UI.Shell.ImageLoader.isBlobUrl(mediaItem.filePath) && !MS.Entertainment.UI.Shell.ImageLoader.isStreamingUrl(mediaItem.filePath))
                    resultPromise = this.imageManager.retrieveImageFromUrlAsync(Microsoft.Entertainment.NetworkUsage.normal, String.empty, mediaItem.filePath, defaultImageUri);
                else if (mediaItem.imageUri)
                    if (mediaItem.filePath && MS.Entertainment.UI.Shell.ImageLoader.isBlobUrl(mediaItem.filePath) && MS.Entertainment.UI.Shell.ImageLoader.isBlobUrl(mediaItem.imageUri))
                        resultPromise = WinJS.Promise.wrap(mediaItem.imageUri);
                    else
                        resultPromise = this.imageManager.retrieveImageFromUrlAsync(Microsoft.Entertainment.NetworkUsage.normal, mediaItem.imageUri, mediaItem.filePath || String.empty, defaultImageUri);
                else
                    resultPromise = WinJS.Promise.wrap(defaultImageUri);
                return resultPromise
            }, getMediaItemDefaultImageUrl: function getMediaItemDefaultImageUrl(item) {
                if (!item)
                    return "/Images/img_not_found.png";
                var mediaType = item.mediaType;
                var videoType = Microsoft.Entertainment.Queries.VideoType.other;
                if (item.serviceType === MS.Entertainment.Data.Augmenter.ServiceTypes.editorialItem) {
                    var convertedItem = MS.Entertainment.Utilities.convertEditorialItem(item);
                    mediaType = convertedItem.mediaType;
                    videoType = convertedItem.videoType
                }
                switch (mediaType) {
                    case Microsoft.Entertainment.Queries.ObjectType.game:
                        return MS.Entertainment.UI.Shell.ImageLoader.MediaDefaultUrls.game;
                    default:
                        return "/Images/img_not_found.png"
                }
            }, registerMediaItemImageUrlCallback: function registerMediaItemImageUrlCallback(mediaItem, callback, width, height) {
                if (!mediaItem.mediaItemImageUrlCallback) {
                    var observable = WinJS.Binding.as(mediaItem);
                    var pendingImageUpdate = true;
                    var mediaItemImageUrlCallback = function calculateNewUrl() {
                            if (!pendingImageUpdate) {
                                pendingImageUpdate = true;
                                return MS.Entertainment.UI.Shell.ImageLoader.getServiceImageUrl(mediaItem, width, height).then(function deliverPrimaryUrl(url) {
                                        callback(url);
                                        pendingImageUpdate = false
                                    })
                            }
                        };
                    observable.bind("serviceType", mediaItemImageUrlCallback);
                    observable.bind("mediaType", mediaItemImageUrlCallback);
                    observable.bind("videoType", mediaItemImageUrlCallback);
                    observable.bind("serviceId", mediaItemImageUrlCallback);
                    observable.bind("imageId", mediaItemImageUrlCallback);
                    observable.bind("filePath", mediaItemImageUrlCallback);
                    observable.bind("imageUri", mediaItemImageUrlCallback);
                    pendingImageUpdate = false;
                    WinJS.Promise.timeout().then(function() {
                        mediaItemImageUrlCallback()
                    });
                    return {
                            observable: observable, mediaItemImageUrlCallback: mediaItemImageUrlCallback
                        }
                }
            }, unregisterMediaItemImageUrlCallback: function unregisterMediaItemImageUrlCallback(token) {
                var observable = token.observable;
                var mediaItemImageUrlCallback = token.mediaItemImageUrlCallback;
                observable.unbind("serviceType", mediaItemImageUrlCallback);
                observable.unbind("mediaType", mediaItemImageUrlCallback);
                observable.unbind("videoType", mediaItemImageUrlCallback);
                observable.unbind("serviceId", mediaItemImageUrlCallback);
                observable.unbind("imageId", mediaItemImageUrlCallback);
                observable.unbind("filePath", mediaItemImageUrlCallback);
                observable.unbind("imageUri", mediaItemImageUrlCallback)
            }, DefaultThumbnailSizes: {
                defaultWidth: 320, video: 234
            }
    }), ImageControl: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Framework.ImageControl, null, function(element, options){}, {
            loadImage: function loadImage(target) {
                if (String.isString(target) && MS.Entertainment.UI.Shell.ImageLoader.isWebUrl(target))
                    return MS.Entertainment.UI.Shell.ImageLoader.cacheImage(target, String.empty);
                else if (String.isString(target))
                    return WinJS.Promise.as(target);
                else if (target.overrideItemUseUrl)
                    return MS.Entertainment.UI.Shell.ImageLoader.cacheImage(target.imagePrimaryUrl, String.empty);
                else if (target.mediaType || target.serviceType && target.serviceType === MS.Entertainment.Data.Augmenter.ServiceTypes.editorialItem || target.serviceType && target.serviceType === MS.Entertainment.Data.Augmenter.ServiceTypes.wmis)
                    return this._loadImageFromTarget(target);
                else
                    return WinJS.Promise.as(target)
            }, _handleLoaded: function _handleLoaded(args) {
                    if (this._unloaded)
                        return;
                    var naturalWidth = 0;
                    var naturalHeight = 0;
                    if (args && args.target) {
                        naturalWidth = args.target.naturalWidth;
                        naturalHeight = args.target.naturalHeight
                    }
                    if (naturalWidth > naturalHeight) {
                        WinJS.Utilities.addClass(this.domElement, "wide");
                        WinJS.Utilities.removeClass(this.domElement, "tall")
                    }
                    else if (naturalWidth < naturalHeight) {
                        WinJS.Utilities.addClass(this.domElement, "tall");
                        WinJS.Utilities.removeClass(this.domElement, "wide")
                    }
                    else {
                        WinJS.Utilities.removeClass(this.domElement, "tall");
                        WinJS.Utilities.removeClass(this.domElement, "wide")
                    }
                    MS.Entertainment.UI.Framework.ImageControl.prototype._handleLoaded.apply(this, arguments)
                }, _loadImageFromTarget: function _loadImageFromTarget(target) {
                    MS.Entertainment.UI.Controls.assert(this.desiredImageSize && (this.desiredImageSize.width || this.desiredImageSize.height), "We need a desired size (along at least one axis to ensure the service requests the correct image");
                    return MS.Entertainment.UI.Shell.ImageLoader.getServiceImageUrl(this.target, this.desiredImageSize.width, this.desiredImageSize.height, null, this.imageIdType, this.defaultImagePath)
                }, hide: function hide(element) {
                    MS.Entertainment.Utilities.hideElement(element)
                }, show: function show(element) {
                    MS.Entertainment.Utilities.showElement(element)
                }
        })
})
