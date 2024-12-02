/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/debug.js", "/Framework/utilities.js");
WinJS.Namespace.define("MS.Entertainment.Social", {SendMessage: MS.Entertainment.UI.Framework.defineUserControl("Components/Social/SendMessage.html#SendMessageTemplate", function sendMessageConstructor(element, options) {
        MS.Entertainment.Social.assert(options.sender && options.sender.nativeUserModel, "Must provide a sender to send a message");
        MS.Entertainment.Social.assert(options.recipient, "Must provide a recipient to send a message");
        this.sender = options.sender;
        this.recipient = options.recipient
    }, {
        _overlay: null, initialize: function initialize() {
                this._messageEditBox.input = this._onTextChanged.bind(this)
            }, setOverlay: function setOverlay(instance) {
                this._overlay = instance
            }, _onTextChanged: function _onTextChanged() {
                if (this._overlay)
                    this._overlay.buttons[0].isEnabled = this._messageEditBox.getValue() !== String.empty
            }, send: function send() {
                var sender = this.sender && this.sender.nativeUserModel && this.sender.nativeUserModel[0];
                var xuid = this.recipient.xuid;
                if (!sender || !xuid) {
                    MS.Entertainment.Social.fail("Sender and recipient xuid required to send message.");
                    this.errorText = String.load(String.id.IDS_SOCIAL_ERROR);
                    return
                }
                this._overlay.buttons[0].isEnabled = false;
                var recipient = new Microsoft.Xbox.Recipient(xuid, Microsoft.Xbox.RecipientIdType.xuid);
                sender.postTextMessageAsync([recipient], this._messageEditBox.getValue()).then(function messageSent() {
                    this.messageSent = true;
                    MS.Entertainment.Utilities.Telemetry.logSendMessage();
                    if (MS.Entertainment.Utilities.getTextDirection() === MS.Entertainment.Utilities.TextDirections.RightToLeft)
                        this._avatarControl.playAnimationById(Microsoft.Entertainment.Avatar.AvatarAnimationId.lookRight);
                    else
                        this._avatarControl.playAnimationById(Microsoft.Entertainment.Avatar.AvatarAnimationId.lookLeft);
                    WinJS.Promise.timeout(1500).then(function animationComplete() {
                        if (this._overlay)
                            this._overlay.hide()
                    }.bind(this))
                }.bind(this), function messageSendError(error) {
                    this._overlay.buttons[0].isEnabled = true;
                    MS.Entertainment.Utilities.Telemetry.logSendMessage(error ? error.number : "Unknown error");
                    if (error)
                        if (error.number === MS.Entertainment.Data.XboxLive.ErrorCodes.httpInvalidRequest)
                            this.errorText = String.load(String.id.IDS_SOCIAL_SEND_MESSAGE_POPOVER_ERROR_MAX);
                        else if (MS.Entertainment.Data.XboxLive.isHttpOfflineError(error.number))
                            this.errorText = String.load(String.id.IDS_SOCIAL_ERROR);
                        else
                            this.errorText = String.load(String.id.IDS_SOCIAL_SEND_MESSAGE_POPOVER_ERROR);
                    else
                        this.errorText = String.load(String.id.IDS_SOCIAL_SEND_MESSAGE_POPOVER_ERROR)
                }.bind(this))
            }
    }, {
        sender: null, recipient: null, errorText: String.empty, messageSent: false
    }, {show: function show(sender, recipient) {
            return MS.Entertainment.UI.Shell.showDialog(recipient ? String.load(String.id.IDS_SOCIAL_SEND_MESSAGE_POPOVER_TO_LABEL).format(recipient.gamerTag) : String.empty, "MS.Entertainment.Social.SendMessage", {
                    userControlOptions: {
                        sender: sender, recipient: recipient
                    }, buttons: [WinJS.Binding.as({
                                title: String.load(String.id.IDS_COMPOSE_MESSAGE_SEND), isEnabled: false, execute: function execute_submit(dialog) {
                                        WinJS.Promise.as(dialog.userControlInstance.send()).done(null, function() {
                                            MS.Entertainment.UI.Controls.assert.fail("Send failed in the send message dialog.")
                                        })
                                    }
                            }), WinJS.Binding.as({
                                title: String.load(String.id.IDS_CANCEL_BUTTON), isEnabled: true, execute: function execute_cancel(dialog) {
                                        dialog.hide()
                                    }
                            })], defaultButtonIndex: 0, cancelButtonIndex: 1, autoSetFocus: true
                })
        }})})
