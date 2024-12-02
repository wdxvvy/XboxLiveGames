/* Copyright (C) Microsoft Corporation. All rights reserved. */
var __extends = this.__extends || function(d, b) {
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };
var MS;
(function(MS) {
    (function(Entertainment) {
        (function(UI) {
            (function(Framework) {
                var UserControl = (function(_super) {
                        __extends(UserControl, _super);
                        function UserControl(element, options) {
                            _super.call(this)
                        }
                        UserControl.prototype.unload = function(){};
                        return UserControl
                    })(Framework.ObservableBase);
                Framework.UserControl = UserControl
            })(UI.Framework || (UI.Framework = {}));
            var Framework = UI.Framework
        })(Entertainment.UI || (Entertainment.UI = {}));
        var UI = Entertainment.UI
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}));
var MS;
(function(MS) {
    (function(Entertainment) {
        (function(UI) {
            (function(Controls) {
                var Overlay = (function(_super) {
                        __extends(Overlay, _super);
                        function Overlay() {
                            _super.apply(this, arguments)
                        }
                        Overlay.prototype.show = function() {
                            return WinJS.Promise.as()
                        };
                        Overlay.prototype.lightDismiss = function() {
                            return true
                        };
                        return Overlay
                    })(MS.Entertainment.UI.Framework.UserControl);
                Controls.Overlay = Overlay;
                var EditBox = (function(_super) {
                        __extends(EditBox, _super);
                        function EditBox() {
                            _super.apply(this, arguments)
                        }
                        EditBox.prototype.setValue = function(value){};
                        EditBox.prototype.setPlaceholderText = function(watermark){};
                        return EditBox
                    })(MS.Entertainment.UI.Framework.UserControl);
                Controls.EditBox = EditBox
            })(UI.Controls || (UI.Controls = {}));
            var Controls = UI.Controls
        })(Entertainment.UI || (Entertainment.UI = {}));
        var UI = Entertainment.UI
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
