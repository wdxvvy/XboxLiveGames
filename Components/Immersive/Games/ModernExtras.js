/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Framework/corefx.js", "/Framework/debug.js", "/Framework/Utilities.js", "/Controls/listControls.js");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {ModernExtrasControl: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.BaseImmersiveSummary, "/Components/Immersive/Games/ModernExtras.html#ModernImmersiveExtras", function extrasControlConstructor(element, options){}, {
            onItemClicked: function onItemClicked(e) {
                var element = e.srcElement;
                while (element && element !== this.domElement) {
                    if (element.clickDataContext) {
                        var popOverParameters = {
                                itemConstructor: "MS.Entertainment.Pages.ModernGameExtraInlineDetails", dataContext: {data: element.clickDataContext}, location: MS.Entertainment.Pages.BaseMediaInlineDetails.Location.marketplace
                            };
                        MS.Entertainment.UI.Controls.PopOver.showPopOver(popOverParameters);
                        e.stopPropagation();
                        return
                    }
                    element = element.parentElement
                }
            }, onKeyDown: function onKeyDown(e) {
                    if (e.keyCode === WinJS.Utilities.Key.enter || e.keyCode === WinJS.Utilities.Key.space)
                        this.onItemClicked(e)
                }
        })})
})()
