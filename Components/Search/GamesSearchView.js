/* Copyright (C) Microsoft Corporation. All rights reserved. */
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Pages");
WinJS.Namespace.define("MS.Entertainment.Pages", {GamesSearchTemplateSelector: WinJS.Class.derive(MS.Entertainment.Pages.SearchTemplateSelector, function gamesSearchTemplateSelector(galleryView) {
        MS.Entertainment.Pages.SearchTemplateSelector.prototype.constructor.apply(this, arguments);
        if (galleryView.headerType === this.headerType === MS.Entertainment.UI.Controls.GalleryControl.HeaderType.inPlace)
            this.addTemplate("header", "Components/Games/GamesSharedTemplates.html#searchGroupHeaderInPlace");
        else
            this.addTemplate("header", "Components/Games/GamesSharedTemplates.html#searchGroupHeader");
        this.addTemplate("windowsGames", "Components/Games/GamesSharedTemplates.html#gameTemplate");
        this.addTemplate("gamesHCR", "Components/Games/GamesSharedTemplates.html#gamesSearchHCRViewTemplate")
    }, {ensureItemTemplatesLoaded: function ensureItemTemplatesLoaded() {
            return this.ensureTemplatesLoaded(["header", "windowsGames", "gamesHCR"])
        }})});
WinJS.Namespace.define("MS.Entertainment.Pages", {GamesSearchTemplateSelectorAll: WinJS.Class.derive(MS.Entertainment.Pages.GamesSearchTemplateSelector, function gamesSearchTemplateSelectorAll() {
        MS.Entertainment.Pages.GamesSearchTemplateSelector.prototype.constructor.apply(this, arguments)
    }, {getPanelTemplatePath: function getPanelTemplatePath(item) {
            return this._getPanelTemplatePath(item, true)
        }})});
WinJS.Namespace.define("MS.Entertainment.Pages", {NewGamesSearch: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.Pages.Search, "Components/Marketplace.html#marketplaceTemplate", function newGamesSearch() {
        this.templateSelectorConstructor = MS.Entertainment.Pages.GamesSearchTemplateSelectorAll
    }, {})})
