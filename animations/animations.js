/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function() {
    WinJS.Namespace.define("MS.Entertainment.UI.Animation", {
        fadeIn: WinJS.Utilities.markSupportedForProcessing(WinJS.UI.Animation.fadeIn), expandElement: function _expandElement(element, affectedElements) {
                if (!WinJS.Utilities.hasClass(element, "removeFromDisplay")) {
                    var expandAnimation = WinJS.UI.Animation.createExpandAnimation(element, affectedElements);
                    WinJS.Utilities.removeClass(element, "ui-expandable-collapsed");
                    WinJS.Utilities.addClass(element, "ui-expandable-expanded");
                    expandAnimation.execute()
                }
            }, collapseElement: function _collapseElement(element, affectedElements) {
                if (!WinJS.Utilities.hasClass(element, "removeFromDisplay")) {
                    var collapseAnimation = WinJS.UI.Animation.createCollapseAnimation(element, affectedElements);
                    collapseAnimation.execute().done(function() {
                        WinJS.Utilities.removeClass(element, "ui-expandable-collapsed");
                        WinJS.Utilities.addClass(element, "ui-expandable-expanded")
                    })
                }
            }
    })
})()
