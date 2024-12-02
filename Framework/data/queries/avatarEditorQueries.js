/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/Data/factory.js", "/Framework/Data/query.js", "/Framework/Data/Augmenters/avatarEditorAugmenters.js");
(function(MSE, undefined) {
    WinJS.Namespace.defineWithParent(MSE, "Data.Query.AvatarEditor", {
        StyleCategoriesQuery: WinJS.Class.derive(MSE.Data.ModelQuery, function StyleCategoriesQuery(model) {
            MSE.Data.ModelQuery.prototype.constructor.apply(this, arguments);
            this._model = model
        }, {
            resultAugmentation: MSE.Data.Augmenter.AvatarEditor.CategoryFilters, createAsyncModel: function StyleCategoriesQuery_createAsyncModel() {
                    var operation = null;
                    if (this._model)
                        try {
                            operation = this._model.getStyleCategories()
                        }
                        catch(e) {
                            operation = WinJS.Promise.wrap([])
                        }
                    return operation
                }
        }), FeatureCategoriesQuery: WinJS.Class.derive(MSE.Data.ModelQuery, function FeatureCategoriesQuery(model) {
                MSE.Data.ModelQuery.prototype.constructor.apply(this, arguments);
                this._model = model
            }, {
                resultAugmentation: MSE.Data.Augmenter.AvatarEditor.CategoryFilters, createAsyncModel: function FeatureCategoriesQuery_createAsyncModel() {
                        var operation = null;
                        if (this._model)
                            try {
                                operation = this._model.getFeatureCategories()
                            }
                            catch(e) {
                                operation = WinJS.Promise.wrap([])
                            }
                        return operation
                    }
            }), AssetsQuery: WinJS.Class.derive(MSE.Data.ModelQuery, function AssetsQuery(model, categoryId) {
                MSE.Data.ModelQuery.prototype.constructor.apply(this, arguments);
                this._model = model;
                this._categoryId = categoryId
            }, {
                resultAugmentation: MSE.Data.Augmenter.AvatarEditor.CategoryAssets, createAsyncModel: function AssetsQuery_createAsyncModel() {
                        var operation = null;
                        if (this._model)
                            try {
                                operation = this._model.getAssetsForCategory(this._categoryId)
                            }
                            catch(e) {
                                operation = WinJS.Promise.wrap(new MS.Entertainment.Data.VirtualList(null, []))
                            }
                        return operation
                    }
            }), ColorsQuery: WinJS.Class.derive(MSE.Data.ModelQuery, function ColorsQuery(model, asset) {
                MSE.Data.ModelQuery.prototype.constructor.apply(this, arguments);
                this._model = model;
                this._asset = asset
            }, {
                resultAugmentation: MSE.Data.Augmenter.AvatarEditor.CategoryColors, createAsyncModel: function ColorsQuery_createAsyncModel() {
                        var operation = null;
                        if (this._model && this._asset)
                            try {
                                operation = this._model.getPickerColorsForCategory(this._asset.categoryId)
                            }
                            catch(e) {
                                operation = WinJS.Promise.wrap(new MS.Entertainment.Data.VirtualList(null, []))
                            }
                        return operation
                    }
            }), CustomColorsQuery: WinJS.Class.derive(MSE.Data.ModelQuery, function CustomColorsQuery(asset) {
                MSE.Data.ModelQuery.prototype.constructor.apply(this, arguments);
                this._asset = asset
            }, {
                resultAugmentation: MSE.Data.Augmenter.AvatarEditor.CategoryColors, createAsyncModel: function CustomColorsQuery_createAsyncModel() {
                        var operation = null;
                        if (this._asset)
                            operation = WinJS.Promise.wrap(this._asset.customColors);
                        return operation
                    }
            })
    })
})(WinJS.Namespace.define("MS.Entertainment"))
