/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Controls/thumbnailbutton.js", "/Controls/mediaItemThumbnail.js", "/Framework/corefx.js", "/Framework/utilities.js", "/Animations/GalleryAnimations.js");
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {GalleryThumbnail: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.MediaItemThumbnail, "Controls/ThumbnailButton.html#thumbnailButtonTemplate", null, {initialize: function galleryThumbnail_initialize() {
            MS.Entertainment.UI.Controls.MediaItemThumbnail.prototype.initialize.apply(this, arguments);
            this.imageLoadAnimation = MS.Entertainment.Animations.Gallery.loadImage
        }})})
