/* Copyright (C) Microsoft Corporation. All rights reserved. */
WinJS.Namespace.define("MS.Entertainment.Pages", {PDLCConfirmationDialog: MS.Entertainment.UI.Framework.defineUserControl("Components/Games/GamesConfirmationDialogs.html#pdlcConfirmationDialogTemplate", function pdlcConfirmationDialog(element, options) {
        if (this.media) {
            this.messageText = String.load(String.id.IDS_PDLC_CONFIRM_DIALOG_DESC).format(this.media.parentItemName);
            var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
            if (navigationService && navigationService.currentPage && navigationService.currentPage.iaNode && navigationService.currentPage.iaNode.moniker !== MS.Entertainment.UI.Monikers.immersiveDetails)
                this.webLinkText = String.load(String.id.IDS_DETAILS_VIEW_FULL_GAME)
        }
    }, {
        _parentOverlay: null, setOverlay: function setOverlay(instance) {
                this._parentOverlay = instance;
                var keyboardNavigationManager = new MS.Entertainment.Framework.KeyboardNavigationManager(instance.domElement);
                keyboardNavigationManager.focusFirstItemInContainer(instance.domElement, true)
            }, onGameDetailsClick: function onGameDetailsClick(event) {
                this._parentOverlay.hide();
                MS.Entertainment.Platform.PlaybackHelpers.showImmersive(this.media)
            }, onGameDetailsKeyDown: function onGameDetailsKeyDown(event) {
                if (event.keyCode === WinJS.Utilities.Key.enter || event.keyCode === WinJS.Utilities.Key.space)
                    this.onGameDetailsClick(event)
            }
    }, {
        media: null, messageText: String.empty, webLinkText: String.empty
    }, {showPDLCConfirmationDialog: function showPDLCConfirmationDialog(mediaItem, submitAction, cancelAction) {
            return MS.Entertainment.UI.Shell.showDialog(String.load(String.id.IDS_PDLC_CONFIRM_DIALOG_TITLE), "MS.Entertainment.Pages.PDLCConfirmationDialog", {
                    userControlOptions: {media: mediaItem}, automationId: "PDLCConfirmationDialog", className: "pdlcConfirmationDialog", buttons: [WinJS.Binding.as({
                                title: String.load(String.id.IDS_YES_BUTTON), execute: function execute_submit(dialog) {
                                        dialog.hide();
                                        if (submitAction)
                                            submitAction()
                                    }.bind(this)
                            }), WinJS.Binding.as({
                                title: String.load(String.id.IDS_NO_BUTTON), execute: function execute_cancel(dialog) {
                                        dialog.hide();
                                        if (cancelAction)
                                            cancelAction()
                                    }
                            })], defaultButtonIndex: 0, cancelButtonIndex: 1
                })
        }})})
