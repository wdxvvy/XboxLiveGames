/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Framework/corefx.js", "/Framework/debug.js", "/Framework/Utilities.js", "/Controls/listControls.js");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {ExtrasControl: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.BaseImmersiveSummary, "/Components/Immersive/Games/Extras.html#ImmersiveExtras", function extrasControlConstructor(element, options){}, {
            onItemClicked: function onItemClicked(e) {
                if (this.dataContext && this.dataContext.viewModel) {
                    var indexContainer = e.srcElement.querySelector(".modifierIndex");
                    if (indexContainer) {
                        this.dataContext.viewModel.defaultSelectionIndex = indexContainer.innerText;
                        this._showExtrasFrame()
                    }
                }
            }, onKeyDown: function onKeyDown(e) {
                    if (e.keyCode === WinJS.Utilities.Key.enter || e.keyCode === WinJS.Utilities.Key.space)
                        this.onItemClicked(e)
                }, _showExtrasFrame: function _showExtrasFrame() {
                    var viewMore = this.domElement.parentElement.querySelector(".viewMoreRow");
                    if (viewMore && viewMore.children && viewMore.children.length) {
                        MS.Entertainment.UI.Framework.focusElement(viewMore.children[0]);
                        viewMore.children[0].click()
                    }
                }
        })})
})()
