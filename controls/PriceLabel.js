/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/debug.js", "/Framework/utilities.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {PriceLabel: MS.Entertainment.UI.Framework.defineUserControl("Controls/PriceLabel.html#priceLabelTemplate", function priceLabelConstructor(){}, {
        _xboxPointImage: null, initialize: function initialize() {
                var that = this;
                this.bind("text", function setDisplayTextByText() {
                    if (typeof that.text !== "undefined" && that.text !== null) {
                        var expression = /¤$/i;
                        var containsPoints = expression.test(that.text);
                        that.displayText = that.text.replace(expression, "");
                        if (containsPoints)
                            WinJS.Utilities.removeClass(that._xboxPointImage, "hidden");
                        else
                            WinJS.Utilities.addClass(that._xboxPointImage, "hidden")
                    }
                })
            }
    }, {
        text: null, displayText: ""
    })})
