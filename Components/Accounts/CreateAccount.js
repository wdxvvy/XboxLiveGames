/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Controls/WebHostExperience.js", "/Framework/shell.js");
WinJS.Namespace.define("MS.Entertainment.Accounts", {CreateAccount: WinJS.Class.derive(MS.Entertainment.UI.Controls.WebHostExperience, function CreateAccount_constructor() {
        MS.Entertainment.UI.Controls.WebHostExperience.prototype.constructor.call(this)
    }, {
        startListener: function startListener() {
            var trace = "";
            if (!this.disposed)
                this.eventProvider.traceCreateAccount_Start(trace);
            MS.Entertainment.UI.Controls.WebHostExperience.prototype.startListener.apply(this, arguments)
        }, messageReceived: function messageReceived(messageStruct, webHost, sendMessageFunc) {
                if (!this.disposed)
                    switch (messageStruct.verb) {
                        case"CLOSE_DIALOG":
                            if (messageStruct.reason === "SUCCESS")
                                this.eventProvider.traceCreateAccount_Finish(String.empty);
                            else if (messageStruct.reason === "ERROR")
                                this.eventProvider.traceCreateAccount_Error(String.empty, messageStruct.errorCode);
                            else if (messageStruct.reason === "CANCEL")
                                this.eventProvider.traceCreateAccount_Cancel(String.empty);
                            var dataPoint = new Microsoft.Entertainment.Platform.Logging.DataPoint(Microsoft.Entertainment.Platform.Logging.LoggingLevel.telemetry);
                            dataPoint.appendEventName("AccountCreation");
                            dataPoint.appendParameter("Result", messageStruct.reason);
                            dataPoint.appendParameter("ErrorCode", messageStruct.errorCode);
                            dataPoint.write();
                            break
                    }
                MS.Entertainment.UI.Controls.WebHostExperience.prototype.messageReceived.apply(this, arguments)
            }
    }, {doCreateAccount: function doCreateAccount() {
            var url = MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_XBoxLiveSSL) + "/Flows/BeginFlow.ashx?workflow=AccountCreation";
            var experience = new MS.Entertainment.Accounts.CreateAccount;
            return MS.Entertainment.UI.Shell.showWebHostDialog(String.load(String.id.IDS_CREATEACCOUNT_TITLE), {
                    desiredLeft: "0%", desiredTop: "10%", showBackButton: false, showCancelButton: false, desiredZIndex: 1002
                }, {
                    sourceUrl: "", signInOverride: true, authenticatedSourceUrl: url, webHostExperience: experience, taskId: MS.Entertainment.UI.Controls.WebHost.TaskId.CREATEACCOUNT, isDialog: true
                })
        }})})
