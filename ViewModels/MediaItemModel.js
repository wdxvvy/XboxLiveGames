/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/data/factory.js", "/Framework/data/Augmenters/commonAugmenters.js", "/Framework/utilities.js", "/Framework/contentNotification.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Media");
WinJS.Namespace.define("MS.Entertainment.ViewModels", {MediaItemModel: WinJS.Class.define(null, {isFailed: false}, {
        augment: function augment(mediaItem) {
            if (mediaItem && mediaItem.onHydrated)
                return mediaItem;
            var defaultHydrate = false;
            var modelItem = WinJS.Binding.as(mediaItem);
            if ((!modelItem.hydrated) && (!modelItem.hydrate || modelItem.hydrate === MS.Entertainment.Data.Augmentation.prototype.hydrate))
                switch (modelItem.mediaType) {
                    case Microsoft.Entertainment.Queries.ObjectType.video:
                        MS.Entertainment.Media.fail("Videos are no longer hydrated via this old method. Please make sure onHydrated has been set on your video augmentation definition.");
                        break;
                    case Microsoft.Entertainment.Queries.ObjectType.tvSeries:
                        MS.Entertainment.Media.fail("TV serieses are no longer hydrated via this old method. Please make sure onHydrated has been set on your series augmentation definition.");
                        break;
                    case Microsoft.Entertainment.Queries.ObjectType.tvSeason:
                        MS.Entertainment.Media.fail("TV seasons are no longer hydrated via this old method. Please make sure onHydrated has been set on your season augmentation definition.");
                        break;
                    case Microsoft.Entertainment.Queries.ObjectType.person:
                        if (modelItem.personType === Microsoft.Entertainment.Queries.PersonType.artist)
                            MS.Entertainment.Media.fail("Artists are no longer hydrated via this old method. Please make sure onHydrated has been set on your artists augmentation definition.");
                        else
                            defaultHydrate = true;
                        break;
                    case Microsoft.Entertainment.Queries.ObjectType.playlist:
                        MS.Entertainment.Media.fail("Playlists are no longer hydrated via this old method. Please make sure onHydrated has been set on your playlist augmentation definition.");
                        break;
                    case Microsoft.Entertainment.Queries.ObjectType.album:
                        MS.Entertainment.Media.fail("Albums are no longer hydrated via this old method. Please make sure onHydrated has been set on your albums augmentation definition.");
                        break;
                    case Microsoft.Entertainment.Queries.ObjectType.track:
                        MS.Entertainment.Media.fail("Tracks are no longer hydrated via this old method. Please make sure onHydrated has been set on your tracks augmentation definition.");
                        break;
                    case Microsoft.Entertainment.Queries.ObjectType.game:
                        MS.Entertainment.Media.fail("Games are no longer hydrated via this old method. Please make sure onHydrated has been set on your game augmentation definition.");
                        break;
                    default:
                        defaultHydrate = true;
                        break
                }
            if (defaultHydrate) {
                modelItem.hydrate = function hydrate() {
                    return WinJS.Promise.wrap(modelItem)
                };
                modelItem.hydrated = true
            }
            return modelItem
        }, hydrateListLibraryInfoAsync: function hydrateListLibraryInfoAsync(list) {
                var promises = [];
                list = list || [];
                return WinJS.Promise.as(list.forEach(function hydrate(args) {
                        var item = (args && args.item && args.item.data) || args;
                        if (item)
                            promises.push(MS.Entertainment.ViewModels.MediaItemModel.hydrateLibraryInfoAsync(item))
                    })).then(function joinPromises() {
                        return WinJS.Promise.join(promises)
                    }).then(function hideResult(){}, function handleError(error) {
                        MS.Entertainment.Media.fail("Failed to hydrate collection library ids. Error message: " + (error && error.message))
                    })
            }, getLibraryIdAsync: function getLibraryIdAsync(modelItem) {
                var promise;
                var mediaStore;
                if (modelItem && (!modelItem.fromCollection || !modelItem.inCollection) && MS.Entertainment.Utilities.isValidGuid(modelItem.zuneId) && !MS.Entertainment.Utilities.isEmptyGuid(modelItem.zuneId)) {
                    mediaStore = new Microsoft.Entertainment.Platform.MediaStore;
                    switch (modelItem.mediaType) {
                        case Microsoft.Entertainment.Queries.ObjectType.video:
                            promise = mediaStore.videoProvider.getLibraryIdFromMediaIdAsync(modelItem.zuneId);
                            break;
                        case Microsoft.Entertainment.Queries.ObjectType.track:
                            promise = mediaStore.trackProvider.getLibraryIdFromMediaIdAsync(modelItem.zuneId);
                            break;
                        case Microsoft.Entertainment.Queries.ObjectType.album:
                            promise = mediaStore.albumProvider.getLibraryIdFromMediaIdAsync(modelItem.zuneId);
                            break;
                        case Microsoft.Entertainment.Queries.ObjectType.tvSeries:
                            promise = mediaStore.seriesProvider.getLibraryIdFromMediaIdAsync(modelItem.zuneId);
                            break;
                        case Microsoft.Entertainment.Queries.ObjectType.person:
                            promise = mediaStore.artistProvider.getLibraryIdFromMediaIdAsync(modelItem.zuneId);
                            break
                    }
                }
                if (promise)
                    promise = promise.then(function _startBaseInnerExecute(result) {
                        return (result && result.libraryId) ? result.libraryId : -1
                    }.bind(this));
                else
                    promise = WinJS.Promise.as(!modelItem || isNaN(modelItem.libraryId) ? -1 : modelItem.libraryId);
                return promise
            }, hydrateLibraryInfoAsync: function hydrateLibraryInfoAsync(modelItem) {
                if (!modelItem || (modelItem.fromCollection && modelItem.inCollection) || !modelItem.hasZuneId || !MS.Entertainment.Utilities.isValidGuid(modelItem.zuneId))
                    return WinJS.Promise.as(modelItem);
                var mediaStore = new Microsoft.Entertainment.Platform.MediaStore;
                var dataPromise;
                if (MS.Entertainment.Data.List.isListOrArray(modelItem))
                    dataPromise = MS.Entertainment.ViewModels.hydrateListLibraryInfoAsync(modelItem);
                else if (modelItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.track)
                    dataPromise = mediaStore.trackProvider.getLibraryTrackInfoAsync(modelItem.zuneId).then(function getLibraryTrackInfoAsyncComplete(trackInfoJSON) {
                        var trackInfo;
                        try {
                            trackInfo = JSON.parse(trackInfoJSON).result
                        }
                        catch(error) {
                            MS.Entertainment.Music.fail("hydrateLibraryInfoAsync has failed because JSON.parse failed. error message = " + (error && error.message) + " json = " + trackInfoJSON)
                        }
                        if (trackInfo)
                            for (var property in trackInfo)
                                if (property in modelItem)
                                    modelItem[property] = trackInfo[property];
                        return modelItem
                    }, function getLibraryTrackInfoAsyncError(error) {
                        var errorMessage = error && error.message;
                        MS.Entertainment.Media.assert(errorMessage === "Canceled", "Failed to get library track info. Error message: " + errorMessage);
                        return modelItem
                    });
                else
                    dataPromise = MS.Entertainment.ViewModels.MediaItemModel.getLibraryIdAsync(modelItem).then(function gotLibraryId(id) {
                        modelItem.libraryId = id;
                        return modelItem
                    }, function failedLibraryId(error) {
                        var errorMessage = error && error.message;
                        MS.Entertainment.Media.assert(errorMessage === "Canceled", "Failed to get library id. Error message: " + errorMessage);
                        return modelItem
                    });
                return WinJS.Promise.as(dataPromise).then(function gotData(updatedModelItem) {
                        if ("libraryId" in updatedModelItem)
                            updatedModelItem.inCollection = MS.Entertainment.Utilities.isValidLibraryId(updatedModelItem.libraryId);
                        return updatedModelItem
                    })
            }
    })})
