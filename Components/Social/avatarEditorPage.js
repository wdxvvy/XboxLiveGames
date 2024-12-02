/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Components/Social/avatarEditorGallery.js", "/Controls/AvatarControl.js", "/Controls/HubStrip.js", "/Framework/corefx.js", "/Framework/navigation.js", "/Framework/serviceLocator.js", "/ViewModels/Social/avatarEditor.js", "/ViewModels/Social/profileHydrator.js");
(function(MSE, undefined) {
    WinJS.Namespace.defineWithParent(MSE, "Pages", {AvatarEditorPage: MSE.UI.Framework.defineUserControl("Components/Social/avatarEditorPage.html#avatarEditorPageTemplate", function AvatarEditorPage(element, options){}, {
            _hubStrip: null, _avatarControl: null, _viewModel: null, initialize: function AvatarEditorPage_initialize() {
                    MS.Entertainment.Social.Helpers.shareProfile();
                    this._getSignedInUser().then(this._waitForAvatarEditorModel.bind(this)).then(this._createViewModel.bind(this)).then(this._onViewModelInstance.bind(this)).then(this._buildHubStrip.bind(this), this._onAvatarEditorCreationError.bind(this))
                }, unload: function AvatarEditorPage_unload() {
                    if (this._hubStrip)
                        this._hubStrip.hubs = null;
                    this._avatarControl = null;
                    this._viewModel = null;
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, _getSignedInUser: function AvatarEditorPage_getSignedInUser() {
                    if (this._avatarControl) {
                        this._avatarControl.avatarDisplay = MSE.UI.Controls.avatarDisplay.video;
                        var signedInUser = MS.Entertainment.Social.Helpers.getSignedInUserModel();
                        signedInUser.gamerTag = signedInUser.userModel.gamerTag;
                        this._avatarControl.userModel = signedInUser;
                        return WinJS.Promise.timeout()
                    }
                    return WinJS.Promise.wrapError(MSE.Pages.AvatarEditorPage.noAvatarControlError)
                }, _onAvatarEditorCreationError: function AvatarEditorPage_onAvatarEditorCreationError() {
                    var currentPage = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).currentPage;
                    var dialogContentStringId = String.id.IDS_AVATAR_EDITOR_OFFLINE_USER_ERROR;
                    if (currentPage.options && currentPage.options.createAvatarFlow)
                        dialogContentStringId = String.id.IDS_AVATAR_EDITOR_OFFLINE_AVATAR_CREATE;
                    MS.Entertainment.UI.Shell.showMessageBox(String.load(String.id.IDS_DIALOG_UNEXPECTED_ERROR_CAPTION), String.load(dialogContentStringId), {
                        buttons: [{
                                title: String.load(String.id.IDS_OK_BUTTON), execute: function onOk(overlay) {
                                        overlay.hide();
                                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigateBack()
                                    }
                            }], defaultButtonIndex: 0
                    })
                }, _waitForAvatarEditorModel: function AvatarEditorPage_waitForAvatarEditorModel() {
                    if (this._avatarControl)
                        return this._avatarControl.getEditorInstance();
                    return WinJS.Promise.wrapError(MSE.Pages.AvatarEditorPage.noAvatarControlError)
                }, _createViewModel: function AvatarEditorPage_createViewModel(avatarEditorModel) {
                    return new MSE.Social.AvatarEditorViewModel(avatarEditorModel, this._avatarControl)
                }, _onViewModelInstance: function AvatarEditorPage_onViewModelInstance(viewModelInstance) {
                    this._viewModel = viewModelInstance;
                    return this._viewModel
                }, _buildHubStrip: function AvatarEditorPage_buildHubStrip() {
                    if (this._hubStrip && this._viewModel) {
                        var Controls = MSE.UI.Controls;
                        var Monikers = MSE.UI.Monikers;
                        var PanelViewModel = function PanelViewModel(viewModelInstance, viewModelGetFilters) {
                                this.viewModel = viewModelInstance;
                                this.getFilters = viewModelGetFilters.bind(viewModelInstance);
                                this.primaryModifier = {
                                    items: [], selectedItem: null
                                }
                            };
                        var stylesHub = new Controls.HubStrip.Hub(Monikers.socialAvatarEditorStylesHub, MS.Entertainment.Pages.AvatarEditorPage.myStylesHubTitle, null);
                        WinJS.Binding.unwrap(stylesHub.panels).push(new Controls.HubStrip.Panel(MSE.Pages.AvatarEditorPage.panelIdStyles, String.empty, MSE.Pages.AvatarEditorPage.panelTemplateStyles, new PanelViewModel(this._viewModel, this._viewModel.getStylesFilters)));
                        var featuresHub = new Controls.HubStrip.Hub(Monikers.socialAvatarEditorFeaturesHub, MS.Entertainment.Pages.AvatarEditorPage.myFeaturesHubTitle, null);
                        WinJS.Binding.unwrap(featuresHub.panels).push(new Controls.HubStrip.Panel(MSE.Pages.AvatarEditorPage.panelIdFeatures, String.empty, MSE.Pages.AvatarEditorPage.panelTemplateFeatures, new PanelViewModel(this._viewModel, this._viewModel.getFeaturesFilters)));
                        var defaultIndex = 0;
                        var hubs = [stylesHub, featuresHub];
                        var activeHub = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).currentHub;
                        if (activeHub && activeHub.iaNode)
                            for (var iHub = 0; iHub < hubs.length; iHub++)
                                if (hubs[iHub].id === activeHub.iaNode.moniker) {
                                    defaultIndex = iHub;
                                    break
                                }
                        this._hubStrip.isolateHubs = true;
                        this._hubStrip.defaultIndex = defaultIndex;
                        this._hubStrip.hubs = hubs
                    }
                }
        }, {}, {
            myStylesHubTitle: String.load(String.id.IDS_AVATAR_EDITOR_STYLES_HUB_TITLE), myFeaturesHubTitle: String.load(String.id.IDS_AVATAR_EDITOR_FEATURES_HUB_TITLE), noAvatarControlError: "this._avatarControl is not available", panelIdStyles: "socialAvatarEditorStylesPanel", panelIdFeatures: "socialAvatarEditorFeaturesPanel", panelTemplateStyles: "Components/Social/avatarEditorPage.html#avatarEditorStylesGalleryTemplate", panelTemplateFeatures: "Components/Social/avatarEditorPage.html#avatarEditorFeaturesGalleryTemplate"
        })})
})(WinJS.Namespace.define("MS.Entertainment"))
