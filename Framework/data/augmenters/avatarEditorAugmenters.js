/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/utilities.js", "/Framework/Data/factory.js");
(function(MSE, undefined) {
    var alias = MSE.Data.Property.alias;
    var convert = MSE.Data.Property.convert;
    var list = MSE.Data.Property.list;
    WinJS.Namespace.defineWithParent(MSE, "Data.Factory.AvatarEditor", {
        EditType: {
            asset: "asset", color: "color", remove: "remove"
        }, filterModelData: [{localizedString: String.load(String.id.IDS_AVATAR_EDITOR_FILTER_SKIN)}, {localizedString: String.empty}, {localizedString: String.load(String.id.IDS_AVATAR_EDITOR_FILTER_BODY)}, {localizedString: String.load(String.id.IDS_AVATAR_EDITOR_FILTER_HAIR)}, {localizedString: String.load(String.id.IDS_AVATAR_EDITOR_FILTER_SHIRT)}, {localizedString: String.load(String.id.IDS_AVATAR_EDITOR_FILTER_TROUSERS)}, {localizedString: String.load(String.id.IDS_AVATAR_EDITOR_FILTER_SHOES)}, {localizedString: String.load(String.id.IDS_AVATAR_EDITOR_FILTER_HAT)}, {localizedString: String.load(String.id.IDS_AVATAR_EDITOR_FILTER_GLOVES)}, {localizedString: String.load(String.id.IDS_AVATAR_EDITOR_FILTER_GLASSES)}, {localizedString: String.load(String.id.IDS_AVATAR_EDITOR_FILTER_WRISTWEAR)}, {localizedString: String.load(String.id.IDS_AVATAR_EDITOR_FILTER_EARRINGS)}, {localizedString: String.load(String.id.IDS_AVATAR_EDITOR_FILTER_RING)}, {localizedString: String.load(String.id.IDS_AVATAR_EDITOR_FILTER_EYES)}, {localizedString: String.load(String.id.IDS_AVATAR_EDITOR_FILTER_EYEBROWS)}, {localizedString: String.load(String.id.IDS_AVATAR_EDITOR_FILTER_MOUTH)}, {localizedString: String.load(String.id.IDS_AVATAR_EDITOR_FILTER_FACIALHAIR)}, {localizedString: String.load(String.id.IDS_AVATAR_EDITOR_FILTER_FACIALOTHER)}, {localizedString: String.load(String.id.IDS_AVATAR_EDITOR_FILTER_EYESHADOW)}, {localizedString: String.load(String.id.IDS_AVATAR_EDITOR_FILTER_NOSE)}, {localizedString: String.load(String.id.IDS_AVATAR_EDITOR_FILTER_CHIN)}, {localizedString: String.load(String.id.IDS_AVATAR_EDITOR_FILTER_EARS)}, {localizedString: String.load(String.id.IDS_AVATAR_EDITOR_FILTER_PROPS)}, {localizedString: String.load(String.id.IDS_AVATAR_EDITOR_FILTER_COSTUME)}], assetCategoryIdToFilterData: function assetCategoryIdToFilterData(value) {
                if ((value === 0 || value) && 0 <= value && MSE.Data.Factory.AvatarEditor.filterModelData.length > value)
                    return MSE.Data.Factory.AvatarEditor.filterModelData[value];
                else
                    return {localizedString: String.empty}
            }, assetCategoryToFilter: function assetCategoryToFilter(array) {
                return array.map(function(item) {
                        var filterData = MSE.Data.Factory.AvatarEditor.assetCategoryIdToFilterData(item.id);
                        return {
                                label: filterData.localizedString, id: item.id, isRemovable: item.isRemovable
                            }
                    })
            }, avatarColorToBackgroundColor: function avatarColorToBackgroundColor(avatarColor) {
                return "rgb({0}, {1}, {2})".format(avatarColor.red, avatarColor.green, avatarColor.blue)
            }
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Factory.AvatarEditor", {
        AssetEdit: MSE.Data.define(null, {
            type: MSE.Data.Factory.AvatarEditor.EditType.asset, label: alias("description", String.empty), thumbnailSource: alias("marketplaceUrl", String.empty), isEquipped: alias("isEquipped", false), isMarketplace: alias("wasPurchased", false), isAwardable: alias("wasAwarded", false)
        }), ColorEdit: MSE.Data.define(null, {
                type: MSE.Data.Factory.AvatarEditor.EditType.color, itemColor: convert(String.empty, MSE.Data.Factory.AvatarEditor.avatarColorToBackgroundColor), isEquipped: false
            }), RemoveEdit: MSE.Data.define(null, {
                type: MSE.Data.Factory.AvatarEditor.EditType.remove, isEquipped: false
            })
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.AvatarEditor", {
        CategoryFilters: MSE.Data.define(null, {items: convert(String.empty, MSE.Data.Factory.AvatarEditor.assetCategoryToFilter)}), CategoryAssets: MSE.Data.define(null, {items: list(String.empty, MSE.Data.Factory.AvatarEditor.AssetEdit)}), CategoryColors: MSE.Data.define(null, {items: list(String.empty, MSE.Data.Factory.AvatarEditor.ColorEdit)})
    })
})(WinJS.Namespace.define("MS.Entertainment"))
