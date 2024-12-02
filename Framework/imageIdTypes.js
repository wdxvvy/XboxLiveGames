/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment", {ImageIdType: {
            undefinedImageIdType: Microsoft.Entertainment.ImageIdType.undefinedImageIdType, application: Microsoft.Entertainment.ImageIdType.application, editorialAlbum: Microsoft.Entertainment.ImageIdType.album, editorialArtist: Microsoft.Entertainment.ImageIdType.artist, editorialMovie: Microsoft.Entertainment.ImageIdType.movie, editorialSeason: Microsoft.Entertainment.ImageIdType.season, editorialSeries: Microsoft.Entertainment.ImageIdType.series, editorialTrack: Microsoft.Entertainment.ImageIdType.track, parentalRating: Microsoft.Entertainment.ImageIdType.parentalRating, social: Microsoft.Entertainment.ImageIdType.social, gamer: Microsoft.Entertainment.ImageIdType.gamer, image: Microsoft.Entertainment.ImageIdType.image, xboxGame: Microsoft.Entertainment.ImageIdType.xboxGame
        }});
    WinJS.Namespace.define("MS.Entertainment", {
        ImageRequested: {
            undefinedRequestedImage: Microsoft.Entertainment.RequestedImageType.undefinedRequestedImage, primaryImage: Microsoft.Entertainment.RequestedImageType.primaryImage, backgroundImage: Microsoft.Entertainment.RequestedImageType.backgroundImage, xboxBackgroundImage: Microsoft.Entertainment.RequestedImageType.xboxBackgroundImage, albumImage: Microsoft.Entertainment.RequestedImageType.albumImage
        }, ImageContentType: {
                none: "", jpeg: "image/jpeg", png: "image/png"
            }, ImageFormat: {
                gif: "gif", jpeg: "jpg", png: "png"
            }
    })
})()
