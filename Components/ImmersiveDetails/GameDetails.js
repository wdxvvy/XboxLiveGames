/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
WinJS.Namespace.define("MS.Entertainment.Pages", {GameDetailsOverview: MS.Entertainment.UI.Framework.defineUserControl(String.empty, function gameDetailsOverviewConstructor() {
        this._bindingsToDetach = [];
        this.smartBuyStateEngine = new MS.Entertainment.ViewModels.SmartBuyStateEngine
    }, {
        _bindingsToDetach: null, initialize: function initialize() {
                this.bind("mediaItem", this._modelChanged.bind(this));
                var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                this._initializeBinding(uiStateService, "nowPlayingVisible", function nowPlayingVisibleChanged(newVal, oldVal) {
                    this.nowPlayingVisible = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).nowPlayingVisible
                }.bind(this));
                this._initializeBinding(uiStateService, "nowPlayingInset", function nowPlayingInsetChanged(newVal, oldVal) {
                    this.nowPlayingInset = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).nowPlayingInset
                }.bind(this));
                this.bind("trailersEnabled", this._updatePlayTrailerVisible.bind(this));
                this.bind("featuredInfoVisible", this._updatePlayTrailerVisible.bind(this));
                this.smartBuyStateEngine.initialize(this.mediaItem, MS.Entertainment.ViewModels.SmartBuyButtons.getGameImmersiveDetailsButtons(this.mediaItem, MS.Entertainment.UI.Actions.ExecutionLocation.canvas), MS.Entertainment.ViewModels.SmartBuyStateHandlers.onGameImmersiveDetailsStateChanged);
                this._checkCompanionExperience();
                MS.Entertainment.UI.Controls.Panel.raisePanelReady(this.domElement)
            }, _updatePlayTrailerVisible: function _updatePlayTrailerVisible() {
                this.playTrailerVisible = this.trailersEnabled && this.featuredInfoVisible
            }, _checkCompanionExperience: function _checkCompanionExperience() {
                if (this.sessionId) {
                    var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    var session = sessionMgr.getSession(this.sessionId);
                    this.activities.companionExperience = session.companionExperience;
                    this.activities.bind("isValid", function activitiesValidChanged(newVal) {
                        this.activitiesVisible = newVal;
                        this.overviewVisible = !newVal
                    }.bind(this))
                }
                else {
                    this.activitiesVisible = false;
                    this.overviewVisible = true
                }
            }, _detachBindings: function _detachBindings() {
                this._bindingsToDetach.forEach(function(e) {
                    e.source.unbind(e.name, e.action)
                });
                this._bindingsToDetach = []
            }, _initializeBinding: function _initializeBinding(source, name, action) {
                source.bind(name, action);
                this._bindingsToDetach.push({
                    source: source, name: name, action: action
                })
            }, unload: function unload() {
                if (this.smartBuyStateEngine)
                    this.smartBuyStateEngine.unload();
                this._detachBindings();
                MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
            }, _modelChanged: function modelChanged() {
                if (this.mediaItem && this.backgroundVisible) {
                    if (this.mediaItem.backgroundImageUri)
                        this.backgroundImageUri = this.mediaItem.backgroundImageUri;
                    else
                        this.backgroundImageUri = "/images/immersive_details_background_games.png";
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    if (this.mediaItem.trailerUri && (this.mediaItem.defaultPlatformType === MS.Entertainment.Data.Augmenter.GamePlatform.PC || this.mediaItem.defaultPlatformType === MS.Entertainment.Data.Augmenter.GamePlatform.Modern))
                        this.trailersEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.streamMetroGameTrailers);
                    else if (this.mediaItem.trailerUri && this.mediaItem.defaultPlatformType === MS.Entertainment.Data.Augmenter.GamePlatform.Xbox)
                        this.trailersEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.streamXbox360GameTrailers);
                    else
                        this.trailersEnabled = false
                }
                else
                    this.trailersEnabled = false
            }
    }, {
        mediaItem: null, smartBuyStateEngine: null, backgroundImageUri: null, featuredInfoVisible: true, trailersEnabled: false, playTrailerVisible: false, nowPlayingVisible: false, nowPlayingInset: false, backgroundVisible: false, activitiesVisible: false, overviewVisible: false, sessionId: null, playTrailerClick: function playTrailerClick() {
                MS.Entertainment.Utilities.Telemetry.logPlayPreview(this.mediaItem, false);
                MS.Entertainment.Platform.PlaybackHelpers.playMedia(this.mediaItem)
            }
    })});
WinJS.Namespace.define("MS.Entertainment.Pages", {SnappedGameDetailsOverview: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.Pages.GameDetailsOverview, "Components/ImmersiveDetails/SnappedGameDetails.html#gameDetailsOverviewTemplate")})
