/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/utilities.js", "/Framework/Data/queries/avatarEditorQueries.js", "/Framework/Data/Augmenters/avatarEditorAugmenters.js");
(function(MSE, undefined) {
    WinJS.Namespace.defineWithParent(MSE, "Social", {AvatarEditorViewModel: MSE.defineObservable(function AvatarEditorViewModel(avatarEditorModel, avatarControl) {
            this._avatarControl = avatarControl;
            this._avatarEditorModel = avatarEditorModel;
            this.isManifestDirty();
            this._stylesFilters = null;
            this._featuresFilters = null;
            this._categoryAssets = []
        }, {
            _isValid: function _isValid() {
                return this._avatarEditorModel && this._avatarControl && this._avatarControl._renderState !== MSE.UI.Controls.AvatarControl.renderState.unloaded
            }, isDirty: false, getStylesFilters: function AvatarEditorViewModel_getStylesFilters() {
                    function cacheStylesFilters(query) {
                        this._stylesFilters = query.result.items;
                        return this._stylesFilters
                    }
                    {};
                    if ((!this._stylesFilters || !this._stylesFilters.count) && this._isValid()) {
                        var categoryQuery = new MSE.Data.Query.AvatarEditor.StyleCategoriesQuery(this._avatarEditorModel);
                        return categoryQuery.execute().then(cacheStylesFilters.bind(this))
                    }
                    return WinJS.Promise.wrap(this._stylesFilters)
                }, getFeaturesFilters: function AvatarEditorViewModel_getFeaturesFilters() {
                    function cacheFeaturesFilters(query) {
                        this._featuresFilters = query.result.items;
                        return this._featuresFilters
                    }
                    {};
                    if ((!this._featuresFilters || !this._featuresFilters.count) && this._isValid()) {
                        var categoryQuery = new MSE.Data.Query.AvatarEditor.FeatureCategoriesQuery(this._avatarEditorModel);
                        return categoryQuery.execute().then(cacheFeaturesFilters.bind(this))
                    }
                    return WinJS.Promise.wrap(this._featuresFilters)
                }, getAssetsForCategory: function AvatarEditorViewModel_getAssetsForCategory(assetCategory) {
                    function onAssetsQueryComplete(query) {
                        function handleMultiAssetsCategory(assets) {
                            function assetToEdit(list) {
                                var viewModel = this;
                                function applyAssetEdit() {
                                    var nativeObject = MS.Entertainment.Data.deflate(this);
                                    if ((nativeObject.customColors && nativeObject.customColors.size) || (nativeObject.equippedColor && nativeObject.supportsColorization)) {
                                        var color = nativeObject.equippedColor || nativeObject.customColors[nativeObject.customColors.size - 1];
                                        return viewModel.applyAssetWithColor(nativeObject, color)
                                    }
                                    else
                                        return viewModel.applyAsset(nativeObject)
                                }
                                {};
                                function getColorsToggle() {
                                    return viewModel.getPickerColors(this)
                                }
                                {};
                                var items = list.items;
                                for (var i = 0; i < items.length; i++) {
                                    var asset = items[i].data;
                                    var isToggleable = asset.supportsColorization || (asset.customColors && asset.customColors.size);
                                    asset.category = assetCategory;
                                    asset.applyEdit = applyAssetEdit.bind(asset);
                                    asset.getToggle = isToggleable ? getColorsToggle.bind(asset) : null
                                }
                            }
                            {};
                            return assets.itemsFromIndex(0).then(assetToEdit.bind(this)).then(function() {
                                    return assets
                                })
                        }
                        {};
                        function handleSingleAssetCategory(selection) {
                            function clearToggle(list) {
                                var items = list.items;
                                for (var i = 0; i < items.length; i++)
                                    items[i].data.getToggle = null
                            }
                            {};
                            function onColors(colors) {
                                return colors.itemsFromIndex(0).then(clearToggle).then(function() {
                                        return colors
                                    })
                            }
                            {};
                            var asset = selection.items[0].data;
                            asset.category = assetCategory;
                            return this.getPickerColors(asset).then(onColors)
                        }
                        {};
                        function cacheCategoryAssets(assets) {
                            this._categoryAssets[assetCategory.id] = assets;
                            return assets
                        }
                        {};
                        function addRemoveItem(assets) {
                            if (assetCategory.isRemovable) {
                                var viewModel = this;
                                var removeItem = {
                                        preventAugmentation: true, key: "removeItem", data: MSE.Data.augment({applyEdit: function() {
                                                    viewModel.removeComponent(assetCategory.id)
                                                }}, MSE.Data.Factory.AvatarEditor.RemoveEdit)
                                    };
                                return assets.insertAt(0, removeItem).then(function() {
                                        return assets
                                    })
                            }
                            else
                                return assets
                        }
                        {};
                        var assetListPromise = null;
                        var items = query.result.items;
                        if (items.count === 1)
                            assetListPromise = items.itemsFromIndex(0).then(handleSingleAssetCategory.bind(this));
                        else
                            assetListPromise = WinJS.Promise.wrap(items).then(handleMultiAssetsCategory.bind(this));
                        return assetListPromise.then(addRemoveItem.bind(this)).then(cacheCategoryAssets.bind(this))
                    }
                    {};
                    var categoryAssets = this._categoryAssets[assetCategory.id];
                    if ((!categoryAssets || !categoryAssets.count) && this._isValid()) {
                        var assetsQuery = new MSE.Data.Query.AvatarEditor.AssetsQuery(this._avatarEditorModel, assetCategory.id);
                        return assetsQuery.execute().then(onAssetsQueryComplete.bind(this))
                    }
                    return WinJS.Promise.wrap(categoryAssets)
                }, getPickerColors: function AvatarEditorViewModel_getPickerColors(asset) {
                    var assetColor = WinJS.Binding.unwrap(asset).equippedColor;
                    function onColorsQueryComplete(query) {
                        var items = query.result.items;
                        function colorToEdit(list) {
                            var viewModel = this;
                            function applyAssetWithColor() {
                                var nativeObject = MS.Entertainment.Data.deflate(this);
                                var assetNativeObject = MS.Entertainment.Data.deflate(asset);
                                return viewModel.applyAssetWithColor(assetNativeObject, nativeObject)
                            }
                            {};
                            function getAssetsToggle() {
                                return viewModel.getAssetsForCategory(asset.category)
                            }
                            {};
                            function isEqualColor(color1, color2) {
                                return color1 && color2 && color1.rgb === color2.rgb
                            }
                            {};
                            var items = list.items;
                            for (var i = 0; i < items.length; i++) {
                                var color = items[i].data;
                                color.isEquipped = isEqualColor(color, assetColor);
                                color.applyEdit = applyAssetWithColor.bind(color);
                                color.getToggle = getAssetsToggle.bind(color)
                            }
                        }
                        {};
                        return items.itemsFromIndex(0).then(colorToEdit.bind(this)).then(function() {
                                return items
                            })
                    }
                    if (asset && (asset.supportsColorization || (asset.customColors && asset.customColors.size))) {
                        var colorsQuery = null;
                        if (asset.customColors && asset.customColors.size)
                            colorsQuery = new MSE.Data.Query.AvatarEditor.CustomColorsQuery(asset);
                        else
                            colorsQuery = new MSE.Data.Query.AvatarEditor.ColorsQuery(this._avatarEditorModel, asset);
                        return colorsQuery.execute().then(onColorsQueryComplete.bind(this))
                    }
                    return WinJS.Promise.wrapError("invalid asset")
                }, applyAsset: function AvatarEditorViewModel_applyAsset(asset) {
                    if (this._avatarEditorModel) {
                        this._avatarEditorModel.applyAsset(asset);
                        this.isManifestDirty()
                    }
                }, applyAssetWithColor: function AvatarEditorViewModel_applyAssetWithColor(asset, color) {
                    if (this._isValid()) {
                        this._avatarEditorModel.applyAssetWithColor(asset, color);
                        asset.equippedColor = color;
                        this.isManifestDirty()
                    }
                }, removeComponent: function AvatarEditorViewModel_removeComponent(componentId) {
                    if (this._isValid()) {
                        this._avatarEditorModel.removeComponent(componentId);
                        this.isManifestDirty()
                    }
                }, isManifestDirty: function AvatarEditorViewModel_isManifestDirty() {
                    if (this._isValid())
                        this.isDirty = this._avatarEditorModel.isManifestDirty();
                    return this.isDirty
                }, saveChanges: function AvatarEditorViewModel_saveChanges() {
                    if (this._isValid())
                        return this._avatarEditorModel.saveManifestChanges().then(this.isManifestDirty.bind(this));
                    else
                        return WinJS.Promise.wrapError("invalid model object")
                }, revertChanges: function AvatarEditorViewModel_revertChanges() {
                    if (this._isValid()) {
                        this._avatarEditorModel.revertManifestChanges();
                        this._categoryAssets = [];
                        this.isDirty = false
                    }
                }, playAnimation: function AvatarEditorViewModel_playAnimation(animationId) {
                    if (this._avatarControl)
                        this._avatarControl.startAnimation(animationId)
                }, persistManifest: function AvatarEditorViewModel_persistManifest() {
                    if (this._avatarControl)
                        this._avatarControl.persistManifest()
                }
        })})
})(WinJS.Namespace.define("MS.Entertainment"))
