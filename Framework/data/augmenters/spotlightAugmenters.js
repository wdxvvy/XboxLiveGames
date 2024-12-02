/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/Data/factory.js", "/Framework/Data/Augmenters/commonAugmenters.js");
(function(MSE, undefined) {
    var alias = MSE.Data.Property.alias;
    var augment = MSE.Data.Property.augment;
    var convert = MSE.Data.Property.convert;
    var convertNoDeflate = MSE.Data.Property.convertNoDeflate;
    var convertOriginal = MSE.Data.Property.convertOriginal;
    var convertOriginalNoDeflate = MSE.Data.Property.convertOriginalNoDeflate;
    var list = MSE.Data.Property.list;
    var format = MSE.Data.Property.format;
    var collect = MSE.Data.Property.collect;
    WinJS.Namespace.defineWithParent(MSE, "Data.Factory.Spotlight", {createMediaItemFromSpotlightItem: function createMediaItemFromSpotlightItem(spotlightItem) {
            var augmentation = MS.Entertainment.Utilities.getSpotlightItemAugmentation(spotlightItem && spotlightItem.Action && MSE.Data.Augmenter.Spotlight.parseActionType(spotlightItem.Action.type).mediaType);
            return MSE.Data.augment(spotlightItem, augmentation)
        }});
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Spotlight", {ItemType: {
            Ad: "Ad", Media: "Media", VideoMarketplace: "VideoMarketplace", GameMarketplace: "GameMarketplace", WebBlend: "WebBlend"
        }});
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Spotlight", {ActionType: {
            Web: "Web", WebBlend: "WebBlend", FlexHub: "FlexHub", ZuneFlexHub: "ZuneFlexHub"
        }});
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Spotlight", {MediaType: {
            None: -1, Movie: "Movie", Season: "Season", Series: "Series", Artist: "Artist", Album: "Album", ModernGame: "Modern", ModernPDLC: "ModernDLC", WindowsGame: "GFWL", PhoneGame: "Windows Phone", XboxGame: "Xbox", Web: "Web", WebBlend: "WebBlend", FlexHub: "FlexHub", ZuneFlexHub: "ZuneFlexHub", Episode: "Episode"
        }});
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Spotlight", {
        parseActionType: function parseActionType(value) {
            var result = null;
            if (value)
                switch (value) {
                    case MS.Entertainment.Data.Augmenter.Spotlight.ActionType.FlexHub:
                        result = {
                            location: MS.Entertainment.Data.Augmenter.Spotlight.MediaType.FlexHub, mediaType: MS.Entertainment.Data.Augmenter.Spotlight.MediaType.FlexHub
                        };
                        break;
                    case MS.Entertainment.Data.Augmenter.Spotlight.ActionType.ZuneFlexHub:
                        result = {
                            location: MS.Entertainment.Data.Augmenter.Spotlight.MediaType.ZuneFlexHub, mediaType: MS.Entertainment.Data.Augmenter.Spotlight.MediaType.ZuneFlexHub
                        };
                        break;
                    case MS.Entertainment.Data.Augmenter.Spotlight.ActionType.Web:
                        result = {
                            location: MS.Entertainment.Data.Augmenter.Spotlight.MediaType.Web, mediaType: MS.Entertainment.Data.Augmenter.Spotlight.MediaType.Web
                        };
                        break;
                    case MS.Entertainment.Data.Augmenter.Spotlight.ActionType.WebBlend:
                        result = {
                            location: MS.Entertainment.Data.Augmenter.Spotlight.MediaType.WebBlend, mediaType: MS.Entertainment.Data.Augmenter.Spotlight.MediaType.WebBlend
                        };
                        break;
                    default:
                        var elements = value.split("/");
                        result = {
                            location: elements[0], mediaType: (elements.length > 1 && elements[1]) ? elements[1] : MSE.Data.Augmenter.Spotlight.MediaType.None
                        };
                        break
                }
            return result
        }, parseIcon: function parseIcon(actionType) {
                var type = MSE.Data.Augmenter.Spotlight.parseActionType(actionType);
                var icon = null;
                if (type)
                    switch (type.mediaType) {
                        case MSE.Data.Augmenter.Spotlight.MediaType.XboxGame:
                            icon = MS.Entertainment.UI.Icon.smartGlassConsole;
                            break
                    }
                return icon
            }
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Spotlight", {SpotlightItem: MSE.Data.define(null, {
            serviceId: convert("InitData", MSE.Data.Factory.guid, String.empty), zuneId: convert("InitData", MSE.Data.Factory.guid, String.empty), name: convertOriginal("Name", MSE.Data.Factory.normalizeTextDirection, String.empty), title: convertOriginal("Title", MSE.Data.Factory.normalizeTextDirection, String.empty), primaryText: convertOriginal("Title", MSE.Data.Factory.normalizeTextDirection, String.empty), _description: convert("Description", MSE.Data.Factory.string, String.empty), secondaryText: convertOriginalNoDeflate("_description", MSE.Data.Factory.normalizeTextDirection, String.empty), imagePrimaryUrl: alias("ImageUrl", String.empty), actionTarget: alias("Action.Target", String.empty), actionType: convert("Action.type", MSE.Data.Augmenter.Spotlight.parseActionType), icon: convert("Action.type", MSE.Data.Augmenter.Spotlight.parseIcon, null), replaceable: convert("replaceable", MSE.Data.Factory.boolFromString, true), canonicalId: MS.Entertainment.Utilities.EMPTY_GUID, isNotMedia: {get: function get_isNotMedia() {
                        var mediaType = this.actionType && this.actionType.mediaType;
                        return mediaType === MS.Entertainment.Data.Augmenter.Spotlight.MediaType.ZuneFlexHub || mediaType === MS.Entertainment.Data.Augmenter.Spotlight.MediaType.FlexHub || mediaType === MS.Entertainment.Data.Augmenter.Spotlight.MediaType.Web || mediaType === MS.Entertainment.Data.Augmenter.Spotlight.MediaType.WebBlend || mediaType === MS.Entertainment.Data.Augmenter.Spotlight.MediaType.None
                    }}
        })});
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Spotlight", {SpotlightSlot: MSE.Data.define(null, {
            sequenceId: convert("SequenceId", MSE.Data.Factory.intNumber, -1), items: augment("Slot", MSE.Data.Factory.Spotlight.createMediaItemFromSpotlightItem, null)
        })});
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Spotlight", {SpotlightContent: MSE.Data.define(null, {
            entries: list("ContentManifest.Content.SlotGroup", MSE.Data.Augmenter.Spotlight.SpotlightSlot, null), name: convertOriginal("ContentManifest.Name", MSE.Data.Factory.normalizeTextDirection, String.empty)
        })});
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Spotlight", {EditorialOverrideSlot: MSE.Data.derive(MSE.Data.Augmenter.Spotlight.SpotlightSlot, null, {overrideSequenceId: convertOriginal("SequenceId", MSE.Data.Factory.string, String.empty)})});
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Spotlight", {EditorialOverrideContent: MSE.Data.derive(MSE.Data.Augmenter.Spotlight.SpotlightContent, null, {entries: list("ContentManifest.Content.SlotGroup", MSE.Data.Augmenter.Spotlight.EditorialOverrideSlot, null)})})
})(MS.Entertainment)
