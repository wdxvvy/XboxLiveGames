/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/debug.js", "/Framework/servicelocator.js", "/Framework/stringids.js", "/Framework/utilities.js", "/ViewModels/social/sharefactory.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Social");
(function(MSE, undefined) {
    var messageProperties = {
            text: null, recipients: null, metadata: null, errorCode: 0
        };
    WinJS.Namespace.defineWithParent(MSE, "Social", {
        ShareReceiver: WinJS.Class.define(function shareReceiver(){}, {
            _packagePromise: null, initialize: function initialize() {
                    if (!this._packagePromise)
                        this._packagePromise = MSE.ServiceLocator.getService(MSE.Services.shareHost).getPackage()
                }, getMessage: function getMessage() {
                    var that = this;
                    this.initialize();
                    return this._packagePromise.then(function handlePackageSuccess(sharePackage) {
                            var factory = MSE.ServiceLocator.getService(MSE.Services.shareDecoder);
                            var metadata = factory.decode(sharePackage);
                            var message = new MSE.Social.Message(sharePackage, metadata);
                            var messageCompleted = function() {
                                    that._completeShareContract(message)
                                };
                            message.addEventListener("completed", messageCompleted, false);
                            return WinJS.Promise.wrap(message)
                        }, function handlePackageError() {
                            return WinJS.Promise.wrapError()
                        })
                }, _completeShareContract: function() {
                    MSE.ServiceLocator.getService(MSE.Services.shareHost).shareCompleted()
                }
        }, {factory: function factory() {
                return new MSE.Social.ShareReceiver
            }}), TextEntry: WinJS.Binding.define({value: String.empty}), MessageBase: WinJS.Class.mix(function messageBase() {
                this._initObservable(Object.create(messageProperties))
            }, WinJS.Utilities.eventMixin, WinJS.Binding.mixin, WinJS.Binding.expandProperties(messageProperties))
    });
    WinJS.Namespace.defineWithParent(MSE, "Social", {Message: WinJS.Class.derive(MSE.Social.MessageBase, function message(sharePackage, metadata) {
            MSE.Social.MessageBase.prototype.constructor.call(this);
            this.text = new MSE.Social.TextEntry;
            this.recipients = new MSE.Social.TextEntry;
            this.metadata = metadata || new MSE.Social.ShareMetadata;
            this._message = new Microsoft.Entertainment.Share.SharingMessage;
            this._message.package = sharePackage;
            this.bind("metadata", this._onMetadataChanged.bind(this))
        }, {
            _message: null, _sendPromise: null, send: function send() {
                    var haveRecipients = this.recipients.value && this.recipients.value.length;
                    var that = this;
                    MSE.Social.assert(this._message !== null && this._message !== undefined, "Attempting to send nothing");
                    if (this._sendPromise)
                        return this._sendPromise;
                    else if (this._message === null || this._message === undefined || !haveRecipients)
                        return WinJS.Promise.wrapError(this);
                    else {
                        this._message.recipients = this.recipients.value;
                        this._message.text = this.text.value;
                        this._sendPromise = that._message.Send().then(function _sendCompleted() {
                            that.errorCode = 0;
                            that._sendPromise = null;
                            that._onCompleted();
                            return WinJS.Promise.wrap(that)
                        }, function _sendFailed(errorCode) {
                            that.errorCode = errorCode;
                            that._sendPromise = null;
                            return WinJS.Promise.wrapError(that)
                        })
                    }
                }, cancel: function cancel() {
                    if (this._sendPromise)
                        this._sendPromise.cancel();
                    this._message = null;
                    this._onCompleted()
                }, _onMetadataChanged: function _onMetadataChanged() {
                    if (this.metadata)
                        this.text.value = this.metadata.text;
                    else
                        this.text.value = String.empty
                }, _onCompleted: function _onCompleted(sent) {
                    this.dispatchEvent("completed", {})
                }
        })});
    MSE.ServiceLocator.register(MSE.Services.shareReceiver, MSE.Social.ShareReceiver.factory)
})(WinJS.Namespace.define("MS.Entertainment", null))
