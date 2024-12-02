/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Controls/thumbnailbutton.js", "/Controls/mediaItemThumbnail.js", "/Framework/corefx.js", "/Framework/utilities.js");
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {GameThumbnail: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.GalleryThumbnail, "Components/Games/GamesSharedTemplates.html#gameThumbnailButtonTemplate")});
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {GameListItem: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.GalleryThumbnail, "Components/Games/GamesSharedTemplates.html#gameListItemButtonTemplate", function gameListItem(element, options) {
        this._focusTarget = options.focusTarget
    }, {
        _focusTarget: false, initialize: function initialize() {
                MS.Entertainment.UI.Controls.GalleryThumbnail.prototype.initialize.apply(this, arguments);
                if (this._focusTarget && this.thumbnailButton)
                    WinJS.Utilities.addClass(this.thumbnailButton, "win-focusable")
            }
    }, {showImage: true})})
