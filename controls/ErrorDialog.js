/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/debug.js", "/Framework/stringids.js", "/Framework/utilities.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {ErrorDialog: MS.Entertainment.UI.Framework.defineUserControl("Controls/ErrorDialog.html#errorDialogTemplate", function messageBoxConstructor(element, options) {
        this.webLinkText = String.load(String.id.IDS_DIALOG_ERROR_MORE_INFO);
        this.feedbackLinkText = String.load(String.id.IDS_DIALOG_ERROR_FEEDBACKLINK)
    }, {
        webLinkPromise: null, _parentOverlay: null, initialize: function initialize() {
                MS.Entertainment.UI.Controls.assert(this.errorDialogErrorCode, "Overlay: Element with data-ent-member='errorDialogErrorCode' not found");
                if (!this.errorCode)
                    this.errorDialogErrorCode.style.visibility = "hidden"
            }, onFeedbackLinkClick: function onFeedbackLinkClick() {
                MS.Entertainment.UI.Controls.UserFeedbackDialog.errorId = this.errorCode;
                MS.Entertainment.UI.Controls.UserFeedbackDialog.timestamp = (new Date).toUTCString();
                this._parentOverlay.hide();
                MS.Entertainment.UI.Shell.showFeedbackDialog()
            }, onWebLinkClick: function onWebLinkClick() {
                var webUrlPromise;
                var onWeblinkPromiseClicked = function onWeblinkPromiseClicked(url) {
                        this._parentOverlay.hide();
                        window.open(url, "_blank")
                    }.bind(this);
                MS.Entertainment.UI.Controls.assert(this.webLinkPromise, "webLinkPromise was null");
                webUrlPromise = WinJS.Promise.as(this.webLinkPromise);
                WinJS.Promise.timeout(500, webUrlPromise).done(onWeblinkPromiseClicked, onWeblinkPromiseClicked)
            }, setOverlay: function setOverlay(instance) {
                this._parentOverlay = instance
            }
    }, {
        description: null, errorCode: null, webLinkText: null, feedbackLinkText: null
    })})
