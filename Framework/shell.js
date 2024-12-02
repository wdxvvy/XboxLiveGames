/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Controls/overlay.js", "/Controls/dialog.js", "/Controls/Webhostdialog.js", "/Framework/corefx.js", "/Framework/debug.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Shell");
WinJS.Namespace.define("MS.Entertainment.UI.Shell", {
    showDialog: function showDialog(title, userControl, options) {
        if (!title)
            throw"showDialog: title parameter is mandatory";
        if (!userControl)
            throw"showDialog: userControl parameter is mandatory";
        options = options ? options : {};
        options.title = title;
        options.userControl = userControl;
        var dialog = new MS.Entertainment.UI.Controls.Dialog(document.createElement("div"), options);
        return dialog.show()
    }, createOverlay: function createOverlay(userControl, userControlOptions, overlayOptions) {
            var options = overlayOptions || {};
            options.userControl = userControl;
            options.userControlOptions = userControlOptions;
            return new MS.Entertainment.UI.Controls.Overlay(document.createElement("div"), options)
        }, showMessageBox: function showMessageBox(title, description, options) {
            if (!title)
                throw"showMessageBox: title parameter is mandatory";
            if (!description)
                throw"showMessageBox: description parameter is mandatory";
            options = options ? options : {};
            options.userControlOptions = {description: description};
            return MS.Entertainment.UI.Shell.showDialog(title, "MS.Entertainment.UI.Controls.MessageBox", options)
        }, showMessageLinkBox: function showMessageLinkBox(title, description, webLink) {
            if (!title)
                throw"showMessageLinkBox: title parameter is mandatory";
            if (!description)
                throw"showMessageLinkBox: description parameter is mandatory";
            if (!webLink)
                throw"showMessageLinkBox: webLink parameter is mandatory";
            var options = {};
            options.userControlOptions = {
                description: description, webLink: webLink
            };
            return MS.Entertainment.UI.Shell.showDialog(title, "MS.Entertainment.UI.Controls.MessageLinkBox", options)
        }, showFeedbackDialog: function showFeedbackDialog() {
            MS.Entertainment.UI.Shell.showDialog(String.load(String.id.IDS_SETTINGS_FEEDBACK_TITLE), "MS.Entertainment.UI.Controls.UserFeedbackDialog", {
                width: null, height: null, buttons: []
            })
        }, showAppUpdateDialog: function showAppUpdateDialog() {
            var cancelConfirmDialogButtons = [{
                        title: String.load(String.id.IDS_VERSION_CHECK_UPGRADE_LINK), execute: function onOk(overlay) {
                                MS.Entertainment.Utilities.launchStoreUpdatePage();
                                overlay.hide()
                            }
                    }, {
                        title: String.load(String.id.IDS_CANCEL_BUTTON), execute: function onCancel(overlay) {
                                overlay.hide()
                            }
                    }];
            return MS.Entertainment.UI.Shell.showMessageBox(String.load(String.id.IDS_VERSION_CHECK_SERVICE_TITLE), String.load(String.id.IDS_VERSION_CHECK_SERVICE_FOR_FEATURES_TEXT), {
                    buttons: cancelConfirmDialogButtons, defaultButtonIndex: 0, cancelButtonIndex: 1
                })
        }, showWebHostDialog: function showWebHostDialog(title, dialogOptions, userControlOptions) {
            var buttons = [];
            dialogOptions.title = title;
            userControlOptions.title = title;
            dialogOptions.userControlOptions = userControlOptions;
            dialogOptions.buttons = buttons;
            dialogOptions.defaultButtonIndex = -1;
            var dialog = new MS.Entertainment.UI.Controls.WebHostDialog(document.createElement("div"), dialogOptions);
            return dialog.show()
        }, showError: (function() {
            "use strict";
            var _displayedErrors = [];
            var displayError = function displayError(caption, description, errorCode, webUrlPromise) {
                    var errorId = description;
                    if (errorCode)
                        errorId = errorCode;
                    var isErrorDisplayed = false;
                    for (var i = 0; i < _displayedErrors.length; i++)
                        if (_displayedErrors[i] === errorId) {
                            isErrorDisplayed = true;
                            break
                        }
                    if (!isErrorDisplayed) {
                        _displayedErrors.push(errorId);
                        var options = {
                                description: description, errorCode: errorCode, webLinkPromise: webUrlPromise
                            };
                        return MS.Entertainment.UI.Shell.showDialog(caption, "MS.Entertainment.UI.Controls.ErrorDialog", {
                                userControlOptions: options, persistOnNavigate: true
                            }).then(function() {
                                for (var i = 0; i < _displayedErrors.length; i++)
                                    if (_displayedErrors[i] === errorId) {
                                        _displayedErrors.splice(i, 1);
                                        break
                                    }
                            })
                    }
                    else
                        return WinJS.Promise.wrap()
                };
            var formatError = function formatError(errorCode, mappedErrorCode, message) {
                    switch (errorCode) {
                        case MS.Entertainment.Utilities.SignInErrors.NS_E_SIGNIN_INVALID_REGION:
                            var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                            var lastAccountRegion = configurationManager.service.lastSignInAccountRegion;
                            if (lastAccountRegion)
                                return message.format((new Windows.Globalization.GeographicRegion(lastAccountRegion)).displayName);
                            else {
                                MS.Entertainment.UI.Shell.assert(false, "lastAccountRegion was not defined");
                                return message
                            }
                            break
                    }
                    {};
                    switch (mappedErrorCode) {
                        case Microsoft.Entertainment.Sync.CollectionSyncError.syncError:
                            return String.load(String.id.IDS_CLOUD_SYNC_ERROR_DIALOG_MESSAGE);
                        case MS.Entertainment.Platform.Playback.Error.X8_E_PLAYBACK_MEDIA_CANT_PLAYTO.code:
                            return String.load(String.id.IDS_MUSIC_PLAY_TO_STREAMING_ERROR_TEXT);
                        case MS.Entertainment.Platform.Playback.Error.X8_E_PLAYBACK_MEDIA_CANT_PLAYTO_PREMIUM.code:
                            return String.load(String.id.IDS_MUSIC_PLAY_TO_PREMIUM_STREAMING_ERROR_TEXT);
                        default:
                            return message
                    }
                };
            var toHexString = function toHexString(value) {
                    if (value < 0)
                        value += 0xFFFFFFFF + 1;
                    return "0x" + value.toString(16)
                };
            return function showError(caption, error) {
                    var errorMapper = new Microsoft.Entertainment.Util.ErrorMapper;
                    var mappedError = errorMapper.getMappedError(error);
                    var hexError = toHexString(mappedError.error) + " (" + toHexString(error) + ")";
                    var errorMessage = formatError(error, mappedError.error, mappedError.description);
                    var originalErrorQuery = new MS.Entertainment.Data.Query.errorCodeWrapperQuery(error);
                    var mappedErrorQueryPromise = function mappedErrorQueryPromise() {
                            var mappedErrorQuery = new MS.Entertainment.Data.Query.errorCodeWrapperQuery(mappedError.error);
                            return mappedErrorQuery.execute().then(function mappedErrorQueryComplete(query) {
                                    if (query && query.result && query.result.exactMatches)
                                        return query.result.errorCodeUrl;
                                    else
                                        return mappedError.webUrl
                                }, function mappedErrorQueryFailed(event) {
                                    if (event && event.message === "Canceled") {
                                        var networkStatus = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).networkStatus;
                                        MS.Entertainment.UI.Shell.fail("Error Code Lookup request canceled.  Network status is: " + networkStatus, null, MS.Entertainment.UI.Debug.errorLevel.low)
                                    }
                                    return mappedError.webUrl
                                })
                        };
                    var errorQuery = originalErrorQuery.execute().then(function originalErrorQueryComplete(query) {
                            if (query && query.result && query.result.exactMatches)
                                return query.result.errorCodeUrl;
                            else
                                return mappedErrorQueryPromise()
                        }, function originalErrorQueryFailed() {
                            return mappedErrorQueryPromise()
                        });
                    return displayError(caption, errorMessage, hexError, errorQuery)
                }
        })()
})
