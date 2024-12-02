/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/data/factory.js");
(function(MSE, undefined) {
    var alias = MSE.Data.Property.alias;
    var augment = MSE.Data.Property.augment;
    var convert = MSE.Data.Property.convert;
    var convertNoDeflate = MSE.Data.Property.convertNoDeflate;
    var list = MSE.Data.Property.list;
    var collect = MSE.Data.Property.collect;
    var union = MSE.Data.Property.union;
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Tmf", {Activity: MSE.Data.define(null, {
            title: alias("Title", String.empty), subTitle: alias("SubTitle", String.empty), imageUrl: alias("ImageUrl", String.empty), url: alias("Url", String.empty)
        })});
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Tmf", {ActivityList: MSE.Data.define(null, {activities: list("Activity", MSE.Data.Augmenter.Tmf.Activity, null)})});
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Tmf", {ActivityData: MSE.Data.define(null, {itemActivities: list("ActivityData.ItemActivities", MSE.Data.Augmenter.Tmf.ActivityList, null)})})
})(WinJS.Namespace.define("MS.Entertainment", null))
