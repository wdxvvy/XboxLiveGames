/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/debug.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Social");
(function(MSE, undefined) {
    WinJS.Namespace.defineWithParent(MSE, "Social", {ShareHost: WinJS.Class.define(function shareHost() {
            this._shareManager = null;
            this._package = null;
            this._contractActivationContext = null
        }, {
            _shareManager: null, _package: null, getManager: function getManager() {
                    if (!this._shareManager && Microsoft.Entertainment.Share && Microsoft.Entertainment.Share.SharingManager)
                        this._shareManager = new Microsoft.Entertainment.Share.SharingManager;
                    return this._shareManager
                }, getPackage: function getPackage() {
                    if (this._package === null)
                        return this._loadPackage();
                    else
                        return WinJS.Promise.wrap(this._package)
                }, shareCompleted: function shareCompleted() {
                    var that = this;
                    this.getPackage().then(function success(sharePackage) {
                        if (that._contractActivationContext) {
                            that._contractActivationContext.doneTransfer(null);
                            that._contractActivationContext = null;
                            that._package = null
                        }
                    }, function error() {
                        MSE.Social.assert(false, "Failed to compelte share operation")
                    })
                }, _loadPackage: function _loadPackage() {
                    var that = this;
                    return new WinJS.Promise(function promiseInitialization(completed, error) {
                            var activation;
                            var innerException;
                            var timer = null;
                            try {
                                activation = new Windows.Wwa.Activation
                            }
                            catch(exception) {
                                innerException = exception;
                                MSE.Social.assert(false, "Failed to create activate object: " + exception)
                            }
                            if (activation) {
                                activation.onActivated = function onActivate(contractId, contractActivationContext) {
                                    if (contractId === MSE.Social.ShareHost.shareContractId && timer !== null) {
                                        timer.cancel();
                                        timer = null;
                                        if (contractActivationContext) {
                                            that._package = that._createSharePackage(contractActivationContext.sharingData);
                                            that._contractActivationContext = contractActivationContext;
                                            completed(that._package)
                                        }
                                        else
                                            error()
                                    }
                                };
                                timer = WinJS.Promise.timeout(MSE.Social.ShareHost.shareActivateTimeout).then(function timedOut() {
                                    if (timer !== null) {
                                        MSE.Social.assert(true, "Shared activation didn't fire in time");
                                        timer = null;
                                        error();
                                        activation.onActivated = null
                                    }
                                })
                            }
                            else
                                error(innerException)
                        })
                }, _createSharePackage: function _createSharePackage(dataPackage) {
                    var sharePackage = new Microsoft.Entertainment.Share.SharingPackage;
                    sharePackage.mediaTitle = dataPackage.properties.hasKey("MS-Entertaiment-MediaTitle") ? dataPackage.properties.lookup("MS-Entertaiment-MediaTitle").getString() : null;
                    sharePackage.mediaDescription = dataPackage.properties.hasKey("MS-Entertaiment-MediaDescription") ? dataPackage.properties.lookup("MS-Entertaiment-MediaDescription").getString() : null;
                    sharePackage.mediaId = dataPackage.properties.hasKey("MS-Entertaiment-ServiceId") ? dataPackage.properties.lookup("MS-Entertaiment-ServiceId").getString() : null;
                    sharePackage.mediaType = dataPackage.properties.hasKey("MS-Entertaiment-ServiceType") ? dataPackage.properties.lookup("MS-Entertaiment-ServiceType").getString() : null;
                    sharePackage.title = dataPackage.properties.hasKey("Title") ? dataPackage.properties.lookup("Title").getString() : null;
                    sharePackage.description = dataPackage.properties.hasKey("Description") ? dataPackage.properties.lookup("Description").getString() : null;
                    sharePackage.text = dataPackage.text;
                    return sharePackage
                }
        }, {
            shareContractId: "Microsoft.Windows.SharingTarget", shareActivateTimeout: 10000, factory: function factory() {
                    return new MSE.Social.ShareHost
                }
        })});
    MSE.ServiceLocator.register(MSE.Services.shareHost, MSE.Social.ShareHost.factory)
})(WinJS.Namespace.define("MS.Entertainment", null))
