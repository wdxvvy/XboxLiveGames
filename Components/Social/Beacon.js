/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/debug.js", "/Framework/utilities.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Social");
WinJS.Namespace.define("MS.Entertainment.Social", {BeaconControl: MS.Entertainment.UI.Framework.defineUserControl("Components/Social/beacon.html#BeaconControlTemplate", function BeaconControl(){}, {
        isBeaconSet: false, beaconText: String.empty, _bindings: null, _nativeUserModel: null, initialize: function initialize() {
                var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                if (!signIn.isSignedIn) {
                    this._setStateHideAll();
                    return
                }
                this._bindings = WinJS.Binding.bind(this, {titleId: this._onTitleIdChanged.bind(this)});
                if (this._commentEditBox && !this._commentEditBox.keyPress)
                    this._commentEditBox.keyPress = this.onKeyPress.bind(this);
                if (this._commentEditBox && this._commentEditBox.inputControl)
                    this._commentEditBox.inputControl.tabIndex = 1
            }, unload: function unload() {
                if (this._bindings) {
                    this._bindings.cancel();
                    this._bindings = null
                }
                MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
            }, onKeyPress: function onKeyPress(e) {
                if (e && e.keyCode && e.keyCode === WinJS.Utilities.Key.enter) {
                    if (this._commentEditBox && this._commentEditBox.onChanged)
                        this._commentEditBox.onChanged();
                    if (this._saveButton && this._saveButton._button)
                        MS.Entertainment.UI.Framework.focusElement(this._saveButton._button);
                    this._onClickSaveButton()
                }
            }, _onTitleIdChanged: function _onTitleIdChanged() {
                if (!this.titleId) {
                    this._setStateHideAll();
                    return
                }
                var userModel = MS.Entertainment.Social.Helpers.createUserModel();
                if (userModel) {
                    this._nativeUserModel = userModel.nativeUserModel[0];
                    if (this._nativeUserModel)
                        this._nativeUserModel.getBeaconAsync(this.titleId).then(function success(beacon) {
                            this.beaconText = beacon.text;
                            this._setStateBeaconIsSet()
                        }.bind(this), function error(error) {
                            if (error.number === MS.Entertainment.Data.XboxLive.ErrorCodes.httpObjectNotFound)
                                this._setStateNeverSet()
                        }.bind(this));
                    else
                        this._setStateNeverSet()
                }
                else
                    this._setStateNeverSet()
            }, _onClickSetBeaconButton: function _onClickSetBeaconButton() {
                if (this._nativeUserModel)
                    this._nativeUserModel.getBeaconsAsync().then(function success(beacons) {
                        if (beacons.items.size === MS.Entertainment.Social.BeaconControl.MAX_BEACONS_COUNT) {
                            this._errorMessage.text = String.load(String.id.IDS_SOCIAL_EXCEEDED_MAXBEACON);
                            this._setStateMessage()
                        }
                        else
                            this._setStateInSetting()
                    }.bind(this), function error(error) {
                        if (error && MS.Entertainment.Data.XboxLive.isHttpOfflineError(error.number))
                            this._errorMessage.text = String.load(String.id.IDS_SOCIAL_ERROR);
                        else
                            this._errorMessage.text = String.load(String.id.IDS_SOCIAL_ERROR_SETBEACON);
                        this._setStateMessage()
                    }.bind(this));
                else {
                    this._errorMessage.text = String.load(String.id.IDS_SOCIAL_ERROR);
                    this._setStateMessage()
                }
            }, _onClickBeaconComment: function _onClickBeaconComment() {
                this._setStateInEditing()
            }, _onClickSaveButton: function _onClickSaveButton() {
                if (!this.titleId) {
                    MS.Entertainment.Social.assert(false, "No titleId to save beacon text");
                    return
                }
                this.beaconText = this._commentEditBox.value;
                if (this._nativeUserModel)
                    this._nativeUserModel.addBeaconAsync(this.titleId, this.beaconText).then(function success() {
                        MS.Entertainment.Utilities.Telemetry.logSetBeacon(this.titleId);
                        this._setStateBeaconIsSet()
                    }.bind(this), function error(error) {
                        if (error) {
                            MS.Entertainment.Utilities.Telemetry.logSetBeacon(this.titleId, error.number);
                            if (MS.Entertainment.Data.XboxLive.isHttpOfflineError(error.number))
                                this._errorMessage.text = String.load(String.id.IDS_SOCIAL_ERROR);
                            else
                                this._errorMessage.text = String.load(String.id.IDS_SOCIAL_ERROR_SETBEACON)
                        }
                        else {
                            MS.Entertainment.Utilities.Telemetry.logSetBeacon(this.titleId, "Unknown error setting beacon");
                            this._errorMessage.text = String.load(String.id.IDS_SOCIAL_ERROR_SETBEACON)
                        }
                        this.hideErrorMessage = false
                    }.bind(this))
            }, _onClickCancelButton: function _onClickCancelButton() {
                if (this.isBeaconSet)
                    this._setStateBeaconIsSet();
                else
                    this._setStateNeverSet()
            }, _onClickRemoveButton: function _onClickRemoveButton() {
                if (!this.titleId) {
                    MS.Entertainment.Social.assert(false, "No titleId to remove beacon text");
                    return
                }
                this._nativeUserModel.deleteBeaconAsync(this.titleId).then(function success() {
                    this._setStateNeverSet()
                }.bind(this), function error(error) {
                    if (error && MS.Entertainment.Data.XboxLive.isHttpOfflineError(error.number))
                        this._errorMessage.text = String.load(String.id.IDS_SOCIAL_ERROR);
                    else
                        this._errorMessage.text = String.load(String.id.IDS_SOCIAL_ERROR_DELETEBEACON);
                    this.hideErrorMessage = false
                }.bind(this))
            }, _onClickOkButton: function _onClickOkButton() {
                this._setStateNeverSet()
            }, _setStateNeverSet: function _setStateNeverSet() {
                this.isBeaconSet = false;
                if (this._nativeUserModel && this.titleId)
                    this._nativeUserModel.getBeaconDefaultTextAsync(this.titleId).then(function complete(beaconDefaultText) {
                        this._setBeaconText(beaconDefaultText.defaultText)
                    }.bind(this), function error(error) {
                        this._setBeaconText("")
                    }.bind(this));
                else
                    this._setBeaconText("")
            }, _setBeaconText: function _setBeaconText(text) {
                this.beaconText = text;
                if (this._commentEditBox)
                    this._commentEditBox.setValue(this.beaconText);
                this.hideSetBeaconButton = false;
                this.hideBeaconComment = true;
                this.hideCommentEditBox = true;
                this.hideButtonsContainer = true;
                this.hideSetBeaconTitle = true;
                this.hideErrorMessage = true
            }, _setStateInSetting: function _setStateInSetting() {
                this.hideCommentEditBox = false;
                if (this._commentEditBox)
                    WinJS.Promise.timeout().done(function complete() {
                        this._commentEditBox.setFocus()
                    }.bind(this));
                this.hideSetBeaconTitle = false;
                if (this._setBeaconTitle)
                    this._setBeaconTitle.textContent = String.load(String.id.IDS_SOCIAL_SET_BEACON);
                this.hideButtonsContainer = false;
                this.hideRemoveButton = true;
                this.hideSetBeaconButton = true;
                this.hideOKButton = true
            }, _setStateInEditing: function _setStateInEditing() {
                this.hideCommentEditBox = false;
                if (this._commentEditBox) {
                    if (this.beaconText)
                        this._commentEditBox.setValue(this.beaconText);
                    else
                        this._commentEditBox.clearInput();
                    WinJS.Promise.timeout().done(function complete() {
                        this._commentEditBox.setFocus()
                    }.bind(this))
                }
                this.hideSetBeaconTitle = false;
                if (this._setBeaconTitle)
                    this._setBeaconTitle.textContent = String.load(String.id.IDS_SOCIAL_EDIT_BEACON);
                this.hideButtonsContainer = false;
                this.hideRemoveButton = false;
                this.hideBeaconComment = true;
                this.hideOKButton = true
            }, _setStateBeaconIsSet: function _setStateBeaconIsSet() {
                if (this.beaconText) {
                    this._beaconCommentLabel.innerText = String.load(String.id.IDS_SOCIAL_BEACONTEXTHEADER_WITHOUTVALUE);
                    this._beaconCommentText.innerText = String.load(String.id.IDS_SOCIAL_BEACONTEXTHEADER_WITHVALUE).format(this.beaconText)
                }
                else {
                    this._beaconCommentLabel.innerText = String.load(String.id.IDS_SOCIAL_BEACONTEXTHEADER_WITHOUTVALUE);
                    this._beaconCommentText.innerText = String.empty
                }
                this.isBeaconSet = true;
                this.hideBeaconComment = false;
                this.hideSetBeaconButton = true;
                this.hideSetBeaconTitle = true;
                this.hideCommentEditBox = true;
                this.hideErrorMessage = true;
                this.hideButtonsContainer = true
            }, _setStateMessage: function _setStateError() {
                this.hideErrorMessage = false;
                this.hideSetBeaconButton = false;
                this.hideButtonsContainer = false;
                this.hideOKButton = false;
                this.hideBeaconComment = true;
                this.hideCommentEditBox = true;
                this.hideSetBeaconTitle = true;
                this.hideSaveButton = true;
                this.hideRemoveButton = true;
                this.hideCancelButton = true
            }, _setStateHideAll: function _setStateHideAll() {
                this.isBeaconSet = false;
                this.hideContainer = true
            }
    }, {
        titleId: null, hideContainer: true, hideSetBeaconButton: true, hideSetBeaconTitle: true, hideBeaconComment: true, hideErrorMessage: true, hideCommentEditBox: true, hideButtonsContainer: true, hideOKButton: false, hideSaveButton: false, hideRemoveButton: false, hideCancelButton: false
    }, {MAX_BEACONS_COUNT: 3})})
