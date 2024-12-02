/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js");
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {SignInControl: MS.Entertainment.UI.Framework.defineUserControl("Controls/SignInControl.html#signInControlTemplate", function signInControl(element, options){}, {
        _signIn: null, _uiState: null, _navigation: null, _propertyChangeHandler: null, _showSignedIn: false, initialize: function initialize() {
                this._signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                this._uiState = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                this._navigation = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                this._propertyChangeHandler = this._onPropertyChange.bind(this);
                this._signIn.bind("isSigningIn", this._propertyChangeHandler);
                this._signIn.bind("signInError", this._propertyChangeHandler);
                this._uiState.bind("isHubStripVisible", this._propertyChangeHandler);
                this._navigation.bind("currentPage", this._propertyChangeHandler)
            }, unload: function unload() {
                if (this._signIn) {
                    this._signIn.unbind("isSigningIn", this._propertyChangeHandler);
                    this._signIn.unbind("signInError", this._propertyChangeHandler)
                }
                if (this._uiState)
                    this._uiState.unbind("isHubStripVisible", this._propertyChangeHandler);
                if (this._navigation)
                    this._navigation.unbind("currentPage", this._propertyChangeHandler);
                MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
            }, onClick: function onClick() {
                if (!this._signIn.isSigningIn)
                    this._signIn.signIn().done(null, function signInError(){})
            }, _onPropertyChange: function _onPropertyChange() {
                var isSigningIn = this._signIn.isSigningIn;
                var signInError = (this._signIn.signInError !== 0);
                var hubStripVisible = this._uiState.isHubStripVisible;
                var showNotifications = this.settings || (this._navigation.currentPage && this._navigation.currentPage.showNotifications);
                if (isSigningIn)
                    this._showSignedIn = true;
                else if (signInError)
                    this._showSignedIn = false;
                var signInNotification = (isSigningIn || signInError || this._showSignedIn);
                this.visibility = signInNotification && (this.settings || hubStripVisible) && showNotifications;
                this.signInError.visibility = signInError;
                this.signInRetry.visibility = signInError;
                this.signInProgress.visibility = isSigningIn;
                if (this._showSignedIn && !signInError && !isSigningIn) {
                    var that = this;
                    this.signInComplete.visibility = true;
                    WinJS.Promise.timeout(2500).then(function() {
                        that.signInComplete.visibility = false;
                        that.visibility = false
                    });
                    this._showSignedIn = false
                }
                else
                    this.signInComplete.visibility = false;
                if (isSigningIn)
                    WinJS.Utilities.addClass(this.signInRetrySpinner, "spinNoticationRetrySpinner");
                else
                    WinJS.Utilities.removeClass(this.signInRetrySpinner, "spinNoticationRetrySpinner")
            }
    }, {settings: false})})
