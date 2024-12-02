/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/utilities.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Components.Shell");
WinJS.Namespace.define("MS.Entertainment.UI.Components.Shell", {
    AdControl: MS.Entertainment.UI.Framework.defineUserControl(null, function adControlConstructor() {
        this._eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell
    }, {
        ad: null, applicationId: null, adUnitId: null, countryOrRegion: null, isAutoRefreshEnabled: true, _eventProvider: null, _frozen: false, _errorOccurred: false, initialize: function initialize() {
                WinJS.Promise.timeout(MS.Entertainment.UI.Components.Shell.AdControl._createAdControlDelay).then(function createAdControlDelayComplete() {
                    if (!this._unloaded) {
                        var regionCode;
                        var languageCode;
                        var globalizationManager = new Microsoft.Entertainment.Util.GlobalizationManager;
                        regionCode = globalizationManager.getRegion();
                        var resourceLanguage = MS.Entertainment.Utilities.getResourceLanguage();
                        languageCode = MS.Entertainment.Utilities.getLanguageFromLocale(resourceLanguage);
                        this.countryOrRegion = regionCode;
                        this.applicationId = MS.Entertainment.UI.Components.Shell.AdControl._getAdApplicationId();
                        this.adUnitId = MS.Entertainment.UI.Components.Shell.AdControl._getAdUnitId(this.ad, regionCode, languageCode);
                        if (this.adUnitId && this.applicationId)
                            return MS.Entertainment.UI.Framework.loadTemplate("Components/Shell/AdControl.html#adControlTemplate");
                        else
                            return WinJS.Promise.wrap()
                    }
                    else
                        return WinJS.Promise.wrap()
                }.bind(this)).then(function loadTemplateComplete(templateInstance) {
                    if (!this._unloaded && templateInstance)
                        return templateInstance.render(this, this.domElement);
                    else
                        return WinJS.Promise.wrap()
                }.bind(this)).then(function templateRenderComplete() {
                    if (!this._unloaded) {
                        MS.Entertainment.UI.Framework.processDeclMembers(this.domElement, this);
                        if (this.adControl) {
                            if (this._frozen)
                                this._disableAdControl();
                            this.adControl.onEngagedChanged = function onEngagedChanged() {
                                if (this.adControl.isEngaged)
                                    this._pausePlayback()
                            }.bind(this);
                            this.adControl.onErrorOccurred = function onErrorOccurred(ad, error) {
                                switch (error.errorCode) {
                                    case this.adControl._ERROR_ENUM.ClientConfiguration:
                                    case this.adControl._ERROR_ENUM.ServerSideError:
                                    case this.adControl._ERROR_ENUM.InvalidServerResponse:
                                        MS.Entertainment.UI.Components.Shell.fail("Ad load failure was encountered.\n\tError: {0}\n\tMessage: {1}".format(error.errorCode, error.errorMessage), null, MS.Entertainment.UI.Debug.errorLevel.low);
                                    case this.adControl._ERROR_ENUM.NoAdAvailable:
                                    case this.adControl._ERROR_ENUM.NetworkConnectionFailure:
                                        this.adLoadFailed = true;
                                        break;
                                    case this.adControl._ERROR_ENUM.Other:
                                    case this.adControl._ERROR_ENUM.Unknown:
                                    default:
                                        this._errorOccurred = true;
                                        WinJS.Promise.timeout(1000).done(function _setAdFailureState() {
                                            if (this._errorOccurred)
                                                this.adLoadFailed = true
                                        }.bind(this));
                                        break
                                }
                            }.bind(this);
                            this.adControl.onAdRefreshed = function onAdRefreshed() {
                                this._errorOccurred = false;
                                this.adLoadFailed = false;
                                this._eventProvider.traceAdControl_Refreshed(this.applicationId, this.adUnitId)
                            }.bind(this)
                        }
                    }
                }.bind(this))
            }, unload: function unload() {
                if (this.adControl) {
                    this.adControl.dispose();
                    this.adControl = null
                }
                MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
            }, _pausePlayback: function _pausePlayback() {
                var sessionManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                if (sessionManager && sessionManager.primarySession.sessionId === MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying)
                    switch (sessionManager.primarySession.currentTransportState) {
                        case MS.Entertainment.Platform.Playback.TransportState.playing:
                        case MS.Entertainment.Platform.Playback.TransportState.starting:
                        case MS.Entertainment.Platform.Playback.TransportState.buffering:
                            sessionManager.primarySession.targetTransportState = MS.Entertainment.Platform.Playback.TransportState.paused;
                            break
                    }
            }, _disableAdControl: function _disableAdControl() {
                if (this.adControl) {
                    this.adControl.isAutoRefreshEnabled = false;
                    this.adControl.suspend();
                    if (this.adControl._domElement)
                        WinJS.Utilities.addClass(this.adControl._domElement, "disabledAdControl")
                }
                if (this.domElement)
                    this.domElement.disabled = true
            }, _enableAdControl: function _enableAdControl() {
                if (this.domElement)
                    this.domElement.disabled = false;
                if (this.adControl) {
                    if (this.adControl._domElement)
                        WinJS.Utilities.removeClass(this.adControl._domElement, "disabledAdControl");
                    this.adControl.resume();
                    this.adControl.isAutoRefreshEnabled = true
                }
            }, freeze: function freeze() {
                this._frozen = true;
                this._disableAdControl();
                MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this)
            }, thaw: function thaw() {
                MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                this._frozen = false;
                this._enableAdControl()
            }
    }, {adLoadFailed: false}, {
        _createAdControlDelay: 2000, _getAdApplicationId: function _getAdApplicationId() {
                var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                var adApplicationId = configurationManager.ads.gamesAdApplicationId;
                MS.Entertainment.UI.Components.Shell.assert(adApplicationId, "Ad configuration application id not found.");
                return adApplicationId
            }, _getAdUnitId: function _getAdUnitId(ad, regionCode, languageCode) {
                var adUnitId;
                var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                var adIds = configurationManager.ads[ad];
                MS.Entertainment.UI.Components.Shell.assert(adIds, "Ad configuration unit ids not found: configuration.ads." + ad);
                if (adIds) {
                    adUnitId = MS.Entertainment.Utilities.getValueFromCsvList(adIds, languageCode + "-" + regionCode);
                    if (!adUnitId)
                        adUnitId = MS.Entertainment.Utilities.getValueFromCsvList(adIds, regionCode)
                }
                return adUnitId
            }, AdIds: {
                musicDashboard: "musicDashboardAdUnitIds", musicPopularSidebar: "musicPopularSidebarAdUnitIds", musicSpotlightSidebar: "musicSpotlightSidebarAdUnitIds", videoDashboardMovie: "videoMovieAdUnitIds", videoDashboardTv: "videoTvAdUnitIds", gamesDashboard: "gamesAdUnitIds", smartGlassDashboard: "smartGlassAdUnitIds"
            }
    }), SidebarAdControl: MS.Entertainment.UI.Framework.defineUserControl("Components/Shell/AdControl.html#sidebarAdControl", null, {
            _signInBindings: null, _signedInUserBindings: null, initialize: function initialize() {
                    this._adControl.ad = this.ad;
                    var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                    this._signInBindings = WinJS.Binding.bind(signIn, {isSignedIn: this._updateSubscriptionLinkVisibility.bind(this)});
                    var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                    this._signedInUserBindings = WinJS.Binding.bind(signedInUser, {isSubscription: this._updateSubscriptionLinkVisibility.bind(this)});
                    if (this.showSignupLink)
                        this._subscriptionLink.action.parameter = MS.Entertainment.Music.Freeplay.Events.musicPassUpsellMarketplaceLinkInvoked
                }, unload: function unload() {
                    if (this._signInBindings) {
                        this._signInBindings.cancel();
                        this._signInBindings = null
                    }
                    if (this._signedInUserBindings) {
                        this._signedInUserBindings.cancel();
                        this._signedInUserBindings = null
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, _updateSubscriptionLinkVisibility: function _updateSubscriptionLinkVisibility() {
                    this.showSignupLink = this._subscriptionLink.action.canExecute()
                }
        }, {showSignupLink: false})
})
