/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/debug.js", "/Framework/utilities.js");
WinJS.Namespace.define("MS.Entertainment.Social", {editProfileDialog: MS.Entertainment.UI.Framework.defineUserControl("Components/Social/editProfileDialog.html#editProfileDialogTemplate", function editProfileDialog() {
        this.changeGamertagLinkText = String.load(String.id.IDS_SOCIAL_PROFILE_CHANGE_GAMERTAG_LINK)
    }, {
        userModel: null, profile: null, changeGamertagLinkText: String.empty, _nativeUserModel: null, _profile: null, _overlay: null, initialize: function initialize() {
                var that = this;
                this._profile = WinJS.Binding.unwrap(this.profile).nativeProfile;
                if (this.userModel) {
                    if (this.userModel.nativeUserModel)
                        this._nativeUserModel = this.userModel.nativeUserModel[0];
                    this._nameEditBox.setValue(this._profile.name);
                    this._mottoEditBox.setValue(this._profile.motto);
                    this._locationEditBox.setValue(this._profile.location);
                    this._bioEditBox.setValue(this._profile.bio);
                    var changeGamertagUrl = MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_AuthTransfer) + "/ChangeGamerTag";
                    this._changeGamerTagLink.href = changeGamertagUrl;
                    this._changeGamerTagLink.target = "_blank"
                }
            }, setOverlay: function setOverlay(instance) {
                this._overlay = instance;
                var that = this;
                this._overlay.buttons = [WinJS.Binding.as({
                        title: String.load(String.id.IDS_SAVE_BUTTON), isEnabled: true, execute: function _onSave() {
                                that._onSave()
                            }
                    }), WinJS.Binding.as({
                        title: String.load(String.id.IDS_CANCEL_BUTTON), isEnabled: true, execute: function onCancel() {
                                that._onCancel()
                            }
                    })]
            }, _enableSaveButton: function _enableSubmitButton(enable) {
                if (this._overlay)
                    this._overlay.buttons[0].isEnabled = enable
            }, _enableCancelButton: function _enableCancelButton(enable) {
                if (this._overlay)
                    this._overlay.buttons[1].isEnabled = enable
            }, _onSave: function _onSave() {
                var that = this;
                if (this._nativeUserModel) {
                    this._waitCursor.isBusy = true;
                    this._profile.name = this._nameEditBox.getValue();
                    this._profile.motto = this._mottoEditBox.getValue();
                    this._profile.location = this._locationEditBox.getValue();
                    this._profile.bio = this._bioEditBox.getValue();
                    this._enableSaveButton(false);
                    this._enableCancelButton(false);
                    this._nativeUserModel.setProfileAsync(this._profile).then(function success(profile) {
                        that._waitCursor.isBusy = false;
                        MS.Entertainment.Utilities.Telemetry.logEditProfile();
                        that._hideDialog()
                    }, function error(error) {
                        that._waitCursor.isBusy = false;
                        MS.Entertainment.Utilities.Telemetry.logEditProfile(error ? error.number : "Unknown error");
                        if (error && MS.Entertainment.Data.XboxLive.isHttpOfflineError(error.number))
                            that._errorMessage.text = String.load(String.id.IDS_SOCIAL_ERROR);
                        else
                            that._errorMessage.text = String.load(String.id.IDS_SOCIAL_ERROR_EDITPROFILE);
                        that._errorIcon.text = MS.Entertainment.UI.Icon.inlineError;
                        that._enableSaveButton(true);
                        that._enableCancelButton(true)
                    })
                }
            }, _onCancel: function _onCancel() {
                this._hideDialog()
            }, _onChangeGamertag: function _onChangeGamertag() {
                MS.Entertainment.Utilities.Telemetry.logChangeGamertag()
            }, _hideDialog: function _hideDialog() {
                if (this._overlay)
                    this._overlay.hide()
            }
    })})
