﻿/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Controls/WebHostExperience.js", "/Framework/shell.js");
WinJS.Namespace.define("MS.Entertainment.Accounts", {AcceptTermsOfService: WinJS.Class.derive(MS.Entertainment.UI.Controls.WebHostExperience, function AcceptTermsOfService_constructor() {
        MS.Entertainment.UI.Controls.WebHostExperience.prototype.constructor.call(this)
    }, {
        startListener: function startListener() {
            if (!this.disposed)
                this.eventProvider.traceAcceptTermsOfService_Start("");
            MS.Entertainment.UI.Controls.WebHostExperience.prototype.startListener.apply(this, arguments)
        }, messageReceived: function messageReceived(messageStruct, webHost, sendMessageFunc) {
                if (!this.disposed)
                    switch (messageStruct.verb) {
                        case"CLOSE_DIALOG":
                            if (messageStruct.reason === "SUCCESS")
                                this.eventProvider.traceAcceptTermsOfService_Finish("");
                            else if (messageStruct.reason === "CANCEL")
                                this.eventProvider.traceAcceptTermsOfService_Cancel("");
                            break
                    }
                MS.Entertainment.UI.Controls.WebHostExperience.prototype.messageReceived.apply(this, arguments)
            }
    }, {doAcceptTermsOfService: function doAcceptTermsOfService() {
            var url = "";
            var experience = new MS.Entertainment.Accounts.AcceptTermsOfService;
            return MS.Entertainment.UI.Shell.showWebHostDialog(String.load(String.id.IDS_CREATEACCOUNT_TITLE), {
                    desiredLeft: "0%", desiredTop: "10%", showBackButton: false, showCancelButton: false, desiredZIndex: 1002
                }, {
                    sourceUrl: "", signInOverride: true, authenticatedSourceUrl: url, webHostExperience: experience, taskId: MS.Entertainment.UI.Controls.WebHost.TaskId.TOU, isDialog: true
                })
        }})})
