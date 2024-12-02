/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/servicelocator.js");
WinJS.Namespace.define("MS.Entertainment.UI.Shell", {PrimaryNavigationButton: MS.Entertainment.UI.Framework.defineUserControl(null, function PrimaryNavigationButton(){}, {
        controlName: "PrimaryNavigationButton", index: -1, moniker: String.empty, initialize: function initialize() {
                this.domElement.addEventListener("click", function() {
                    if (this.domElement.doClick) {
                        MS.Entertainment.Utilities.Telemetry.logPrimaryNavigationClicked(this.moniker, this.domElement.innerText);
                        this.domElement.doClick.call(this.domElement)
                    }
                }.bind(this))
            }
    }, {})})
