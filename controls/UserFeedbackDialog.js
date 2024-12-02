/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/debug.js", "/Framework/utilities.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {UserFeedbackDialog: MS.Entertainment.UI.Framework.defineUserControl("Controls/UserFeedbackDialog.html#userFeedbackDialogTemplate", function UserFeedbackDialog(){}, {
        optionalParameter: null, _overlay: null, _selectedRadioButton: null, _submitted: false, initialize: function initialize() {
                this._playbackOption.setAttribute("label", String.load(String.id.IDS_SETTINGS_FEEDBACK_CONTENT_PLAYBACK));
                this._contentOption.setAttribute("label", String.load(String.id.IDS_SETTINGS_FEEDBACK_CONTENT_CONTENT));
                var settingsFlyout = document.getElementById("SettingsFeedback");
                if (settingsFlyout) {
                    this._setInitialState();
                    settingsFlyout.winControl.addEventListener("beforeshow", this._setInitialState.bind(this))
                }
            }, setOverlay: function setOverlay(instance) {
                this._overlay = instance;
                var that = this;
                this._overlay.buttons = [WinJS.Binding.as({
                        title: String.load(String.id.IDS_SETTINGS_FEEDBACK_SUBMIT), isEnabled: false, execute: function onSubmit() {
                                that._onSubmit()
                            }
                    }), WinJS.Binding.as({
                        title: String.load(String.id.IDS_SETTINGS_FEEDBACK_CANCEL), isEnabled: true, execute: function onCancel() {
                                that._onCancel()
                            }
                    })];
                this._setInitialState();
                WinJS.Utilities.addClass(this._contentContainer, "settingsFeedbackContentDialog");
                WinJS.Utilities.addClass(this._optionsContainer, "settingsFeedbackOptionsDialog");
                WinJS.Utilities.addClass(this._editControl.domElement, "settingsFeedbackCommentBoxDialog");
                WinJS.Utilities.addClass(this._bottomContainer, "settingsFeedbackBottomDialog");
                WinJS.Utilities.addClass(this._connectionError.domElement, "settingsFeedbackPanelContentDialog");
                WinJS.Utilities.addClass(this._commentDescription.domElement, "settingsFeedbackPanelContentDialog");
                WinJS.Utilities.addClass(this._descriptionLabel.domElement, "settingsFeedbackPanelContentDialog");
                WinJS.Utilities.addClass(this._optionDescriptionLabel.domElement, "settingsFeedbackPanelContentDialog");
                WinJS.Utilities.addClass(this._feedbackButtonContainers, "removeFromDisplay")
            }, _enableSubmitButton: function _enableSubmitButton(enable) {
                if (this._overlay)
                    this._overlay.buttons[0].isEnabled = enable;
                else if (enable) {
                    this._submitButton.removeAttribute("disabled");
                    WinJS.Utilities.removeClass(this._submitButton, "disabled")
                }
                else {
                    this._submitButton.setAttribute("disabled", "disabled");
                    WinJS.Utilities.addClass(this._submitButton, "disabled")
                }
            }, _setInitialState: function _setInitialState() {
                var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                var gamerTag = signedInUser.gamerTag;
                if (gamerTag)
                    this._descriptionLabel.text = String.load(String.id.IDS_SETTINGS_FEEDBACK_DESCRIPTION_GAMERTAG).format(gamerTag);
                else
                    this._descriptionLabel.text = String.load(String.id.IDS_SETTINGS_FEEDBACK_DESCRIPTION);
                WinJS.Utilities.addClass(this._contentIssueSelector, "hidden");
                WinJS.Utilities.addClass(this._connectionError.domElement, "hidden");
                this._editControl.clearInput();
                this._enableSubmitButton(false);
                this._setWatermarkText(String.empty);
                if (this._selectedRadioButton)
                    this._selectedRadioButton.checked = false;
                if (MS.Entertainment.UI.Controls.UserFeedbackDialog.errorId) {
                    this._appIssue.checked = true;
                    this._onIssueSelect({target: this._appIssue})
                }
            }, _onSubmit: function _onSubmit() {
                var currentLocation = null;
                var currentContentIssue = null;
                var currentMedia = null;
                var searchHCR = null;
                var platLog = Microsoft.Entertainment.Platform.Logging;
                var dataPoint = null;
                var pageOptions = null;
                var inlineDetailsItem = MS.Entertainment.UI.Controls.UserFeedbackDialog.inlineDetailsItem;
                if (!window.navigator.onLine)
                    WinJS.Utilities.removeClass(this._connectionError.domElement, "hidden");
                else {
                    dataPoint = new platLog.DataPoint(platLog.LoggingLevel.telemetry);
                    dataPoint.appendEventName("Send A Smile");
                    dataPoint.appendParameter("AppMode", MS.Entertainment.appMode);
                    currentLocation = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).getUserLocation();
                    dataPoint.appendUIPath(currentLocation);
                    dataPoint.appendParameter("FeedbackType", this._selectedRadioButton.value);
                    if (this._selectedRadioButton === this._contentIssue)
                        dataPoint.appendParameter("ContentIssueType", this._contentIssueSelector.value);
                    if (currentLocation === MS.Entertainment.UI.Monikers.immersiveDetails) {
                        pageOptions = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).currentPage.options;
                        if (pageOptions && pageOptions.mediaItem) {
                            dataPoint.appendParameter("MediaType", this._getMediaStringFromItem(pageOptions.mediaItem));
                            dataPoint.appendParameter("MediaItem", pageOptions.mediaItem.serviceId);
                            dataPoint.appendParameter("MediaItemInstanceId", pageOptions.mediaItem.id)
                        }
                    }
                    else if (inlineDetailsItem) {
                        var mediaItem = inlineDetailsItem.mediaItem || inlineDetailsItem.media;
                        if (mediaItem) {
                            dataPoint.appendParameter("MediaType", this._getMediaStringFromItem(mediaItem));
                            dataPoint.appendParameter("MediaItem", mediaItem.serviceId);
                            dataPoint.appendParameter("MediaItemInstanceId", mediaItem.id)
                        }
                    }
                    if (MS.Entertainment.UI.Controls.UserFeedbackDialog.errorId) {
                        dataPoint.appendParameter("ErrorId", MS.Entertainment.UI.Controls.UserFeedbackDialog.errorId);
                        dataPoint.appendParameter("ErrorTimestamp", MS.Entertainment.UI.Controls.UserFeedbackDialog.timestamp)
                    }
                    var comment = this._editControl.getValue();
                    if (comment.length <= 1024) {
                        dataPoint.appendParameter("CommentText", comment);
                        dataPoint.write();
                        this._exitFeedback()
                    }
                }
            }, _getMediaStringFromItem: function _getMediaStringFromItem(mediaItem) {
                if (!mediaItem)
                    return "undefined";
                var mediaString = null;
                switch (mediaItem.mediaType) {
                    case Microsoft.Entertainment.Queries.ObjectType.game:
                        mediaString = "game";
                        break;
                    default:
                        mediaString = "undefined";
                        break
                }
                return mediaString
            }, _onCancel: function _onCancel() {
                this._exitFeedback()
            }, _setWatermarkText: function _setWatermarkText(watermarkText) {
                this._editControl.watermarkText = watermarkText;
                var currentTextValue = this._editControl.getValue();
                if (!currentTextValue || currentTextValue.length < 1)
                    this._editControl.reinitialize()
            }, _onIssueSelect: function _onIssueSelect(args) {
                if (args.target === this._contentIssue)
                    WinJS.Utilities.removeClass(this._contentIssueSelector, "hidden");
                else
                    WinJS.Utilities.addClass(this._contentIssueSelector, "hidden");
                this._selectedRadioButton = args.target;
                this._enableSubmitButton(true)
            }, _exitFeedback: function _exitFeedback() {
                if (this._overlay)
                    this._overlay.hide();
                else
                    document.getElementById("SettingsFeedback").winControl.hide();
                MS.Entertainment.UI.Controls.UserFeedbackDialog.errorId = null;
                MS.Entertainment.UI.Controls.UserFeedbackDialog.timestamp = null;
                this.optionalParameter = null
            }
    }, null, {
        errorId: null, timestamp: null, inlineDetailsItem: null
    })})
