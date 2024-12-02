/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
WinJS.Namespace.define("MS.Entertainment.ViewModels", {CommandViewModel: WinJS.Class.define(function(caption, isEnabled, clicked)
    {
        this.caption = caption;
        this.isEnabled = isEnabled;
        this.clicked = clicked
    }, {
        caption: null, isEnabled: false, clicked: null
    }, {})})
