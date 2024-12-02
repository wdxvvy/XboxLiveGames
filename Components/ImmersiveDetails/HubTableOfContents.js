/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Controls/listControls.js", "/Framework/telemetryUtilities.js");
(function(undefined) {
    WinJS.Namespace.define("MS.Entertainment.Pages", {HubTableOfContentsControl: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.ItemsControl, null, function hubTableOfContentsControl() {
            this.hubStrip = []
        }, {
            initialize: function initialize() {
                this._hubsChanged = this._hubsChanged.bind(this);
                this.bind("hubStrip.hubs", this._hubsChanged);
                if (!this.itemTemplate)
                    this.itemTemplate = "/Components/ImmersiveDetails/HubTableOfContents.html#hubLinkTemplate";
                MS.Entertainment.UI.Controls.ItemsControl.prototype.initialize.apply(this, arguments)
            }, unload: function unload() {
                    this.unbind("hubStrip.hubs", this._hubsChanged);
                    MS.Entertainment.UI.Controls.ItemsControl.prototype.unload.call(this)
                }, _hubsChanged: function hubsChanged() {
                    var ignoreTitle = String.load(String.id.IDS_DETAILS_OVERVIEW);
                    if (this.hubStrip && this.hubStrip.hubs) {
                        var that = this;
                        var hubLinks = [];
                        for (var x = 0; x < this.hubStrip.hubs.length; x++) {
                            var currentHub = this.hubStrip.hubs[x];
                            currentHub.index = x;
                            if (currentHub.title && currentHub.title !== ignoreTitle) {
                                currentHub.execute = function goToHub() {
                                    if (that.hubStrip)
                                        that.hubStrip.moveTo(this.index, true)
                                }.bind(currentHub);
                                hubLinks.push(currentHub)
                            }
                        }
                        this.dataSource = hubLinks
                    }
                }
        }, {hubStrip: null})})
})()
