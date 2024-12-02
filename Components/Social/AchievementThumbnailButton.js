/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Controls/ThumbnailButton.js", "/Framework/corefx.js");
(function(undefined) {
    WinJS.Namespace.defineWithParent(MS.Entertainment, "Social", {AchievementThumbnailButton: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.ThumbnailButton, "Components/Social/achievementThumbnailButton.html#achievementThumbnailButtonTemplate", function achievementThumbnailButtonConstructor(element, options) {
            this.containerHeight = null;
            this.shouldSetChildren = false;
            this.shouldSetContainer = false;
            this.secondaryTextLineCount = 3;
            this.imageLoadAnimation = MS.Entertainment.Animations.Gallery.loadImage
        }, {}, {
            gamerScore: 0, quaternaryText: null
        })})
})()
