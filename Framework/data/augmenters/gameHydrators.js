/* Copyright (C) Microsoft Corporation. All rights reserved. */
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Hydrator");
scriptValidator("/Framework/Data/Augmenters/commonAugmenters.js");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.Hydrator", {game: function game(hydrating, options) {
            var result;
            options = options || {};
            if (!hydrating.hasServiceId && !hydrating.hasHexTitleId) {
                MS.Entertainment.Hydrator.fail("No serviceId or hexTitleId supplied to MS.Entertainment.Hydrator.game");
                result = null
            }
            else if (hydrating.defaultPlatformType === MS.Entertainment.Data.Augmenter.GamePlatform.Xbox || hydrating.defaultPlatformType === MS.Entertainment.Data.Augmenter.GamePlatform.Modern) {
                var gameQuery;
                var queryWatcher = new MS.Entertainment.Framework.QueryWatcher("MS.Entertainment.Hydrator.game");
                if (hydrating.defaultPlatformType === MS.Entertainment.Data.Augmenter.GamePlatform.Modern) {
                    gameQuery = new MS.Entertainment.Data.Query.Games.GameMetroDetails;
                    gameQuery.resultAugmentation = hydrating.isGameExtra ? MS.Entertainment.Data.Augmenter.Marketplace.DetailsMetroGameChildResult : gameQuery.resultAugmentation
                }
                else {
                    gameQuery = new MS.Entertainment.Data.Query.Games.XboxGameDetails;
                    gameQuery.resultAugmentation = hydrating.isGameExtra ? MS.Entertainment.Data.Augmenter.Marketplace.DetailsXboxGameChildResult : gameQuery.resultAugmentation
                }
                if (this.hasServiceId) {
                    gameQuery.serviceIds = [hydrating.serviceId];
                    gameQuery.idType = MS.Entertainment.Data.Query.edsIdType.canonical
                }
                else {
                    gameQuery.serviceIds = [hydrating.hexTitleId];
                    gameQuery.mediaGroup = String.empty;
                    gameQuery.idType = MS.Entertainment.Data.Query.edsIdType.xboxHexTitle
                }
                gameQuery.impressionGuid = hydrating.impressionGuid;
                if (hydrating.itemTypeQueryString === MS.Entertainment.Data.Query.edsMediaType.appActivity || hydrating.itemTypeQueryString === MS.Entertainment.Data.Query.edsMediaType.gameActivity || hydrating.itemTypeQueryString === MS.Entertainment.Data.Query.edsMediaType.videoActivity)
                    gameQuery.mediaGroup = MS.Entertainment.Data.Query.edsMediaGroup.enhancedContentType;
                queryWatcher.registerQuery(gameQuery);
                result = gameQuery.execute().then(function gameQueryCompleted(q) {
                    var item = q.result.item || q.result;
                    if (!item || !item.isValid)
                        return WinJS.Promise.wrapError(new Error("Failed to retrieve an game media item from the query."));
                    return item
                })
            }
            else if (hydrating.defaultPlatformType === MS.Entertainment.Data.Augmenter.GamePlatform.PC || hydrating.defaultPlatformType === MS.Entertainment.Data.Augmenter.GamePlatform.Phone || hydrating.defaultPlatformType === MS.Entertainment.Data.Augmenter.GamePlatform.Web) {
                var item = new MS.Entertainment.Data.Augmenter.Marketplace.GameEDS;
                item.serviceId = hydrating.serviceId;
                item.hexTitleId = hydrating.hexTitleId;
                item.titleId = hydrating.titleId;
                item.defaultPlatformType = hydrating.defaultPlatformType;
                result = WinJS.Promise.wrap(item)
            }
            else {
                MS.Entertainment.Hydrator.fail("Unknown game type supplied to MS.Entertainment.Hydrator.game");
                result = null
            }
            if (result)
                result.then(function gotItem(item) {
                    return MS.Entertainment.Hydrator.sanitizeIds(item, hydrating)
                }).then(function idsSanitized(item) {
                    var socialBuzzPromise;
                    if (item.titleId) {
                        var notificationModification = new MS.Entertainment.UI.ContentNotification.NotificationModification(MS.Entertainment.UI.ContentNotification.directResult(), function returnTitleID(game) {
                                return game.titleId
                            });
                        notificationModification.modifyItem(item);
                        var socialBuzz = new MS.Entertainment.UI.SocialBuzz.SocialBuzzSource(notificationModification.createSender());
                        socialBuzzPromise = socialBuzz.execute(item.titleId)
                    }
                    return MS.Entertainment.Utilities.redirectPromise(socialBuzzPromise, item)
                }).then(function socialBuzzFinished(item) {
                    if (!item.imageUri || item.imageUri === MS.Entertainment.UI.Shell.ImageLoader.MediaDefaultUrls.game) {
                        var imageId = null;
                        var size = {x: MS.Entertainment.UI.Shell.ImageLoader.DefaultThumbnailSizes.defaultWidth};
                        if (hydrating.hasServiceId)
                            imageId = item.serviceId;
                        else
                            imageId = parseInt(item.hexTitleId);
                        item.imageUri = MS.Entertainment.UI.Shell.ImageLoader.makeCatalogImageUri(imageId, MS.Entertainment.ImageIdType.xboxGame, size, true, false, MS.Entertainment.ImageRequested.primaryImage, parseInt(item.hexTitleId))
                    }
                    return item
                });
            return WinJS.Promise.as(result)
        }})
})()
