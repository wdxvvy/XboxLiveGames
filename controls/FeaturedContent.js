/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Framework/CoreFX.js", "/Framework/debug.js", "/Framework/utilities.js");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {FeaturedContent: MS.Entertainment.UI.Framework.defineUserControl(null, function FeaturedContent_Constructor(element, options) {
            MS.Entertainment.UI.Controls.assert(this.templates, "no templates supplied declaratively");
            MS.Entertainment.UI.Controls.assert(this.templates.length, "Supplied template array was empty");
            this._refreshView = this._refreshView.bind(this);
            this._view = this._getView()
        }, {
            enableClickEvents: false, _suppressFirstTimeBinds: false, _loadedTemplate: String.empty, _dataPromise: null, _dataComplete: null, _eventHandlers: null, _refreshingView: false, controlName: "FeaturedContent", initialize: function() {
                    this._dataPromise = new WinJS.Promise(function(c, e, p) {
                        this._dataComplete = c
                    }.bind(this));
                    this._suppressFirstTimeBinds = true;
                    this.bind("_view", this._loadViewTemplate.bind(this));
                    this.bind("data", this._dataChanged.bind(this));
                    this.bind("templates", this._loadViewTemplate.bind(this));
                    this._suppressFirstTimeBinds = false;
                    this._loadViewTemplate();
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).addEventListener("windowresize", this._refreshView)
                }, unload: function unload() {
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).removeEventListener("windowresize", this._refreshView);
                    if (this._eventHandlers) {
                        this._eventHandlers.cancel();
                        this._eventHandlers = null
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, _refreshView: function _refreshView() {
                    var newView = this._getView();
                    if (this._view !== newView) {
                        this._refreshingView = true;
                        this._view = newView
                    }
                }, _dataChanged: function _dataChanged() {
                    if (this._suppressFirstTimeBinds)
                        return;
                    if (this.data === null) {
                        MS.Entertainment.UI.Controls.Panel.raisePanelReady(this.domElement, true);
                        return
                    }
                    if (this._dataComplete) {
                        this._dataComplete(this.data);
                        this._dataComplete = null
                    }
                    else {
                        this._dataPromise = WinJS.Promise.as(this.data);
                        this._reloadViewTemplate(this._loadedTemplate)
                    }
                }, _loadViewTemplate: function _loadViewTemplate(newValue, oldValue) {
                    MS.Entertainment.UI.Controls.assert(this._view > -1, "No view set");
                    if (this._suppressFirstTimeBinds) {
                        if (!this._suppressFirstTimeBinds)
                            MS.Entertainment.UI.Controls.Panel.raisePanelReady(this.domElement, true);
                        return
                    }
                    var maxSuppliedTemplateIndex = this.templates.length - 1;
                    var selectedTemplate = this.templates[Math.min(this._view, maxSuppliedTemplateIndex)];
                    if (selectedTemplate !== this._loadedTemplate) {
                        MS.Entertainment.Utilities.empty(this.domElement);
                        if (selectedTemplate)
                            this._reloadViewTemplate(selectedTemplate);
                        else
                            this._loadedTemplate = String.empty
                    }
                }, _reloadViewTemplate: function _reloadViewTemplate(template) {
                    if (!template || !this.domElement)
                        return;
                    MS.Entertainment.Utilities.empty(this.domElement);
                    var container = document.createElement("div");
                    this.domElement.appendChild(container);
                    MS.Entertainment.Utilities.loadHtmlPage(template, container, this._dataPromise).then(function() {
                        if (this._unloaded)
                            return;
                        this._loadedTemplate = template;
                        this._onTemplateLoaded(container)
                    }.bind(this))
                }, _onTemplateLoaded: function _onTemplateLoaded(container) {
                    this._refreshingView = false;
                    MS.Entertainment.UI.Controls.Panel.raisePanelReady(this.domElement);
                    if (this.enableClickEvents)
                        this._eventHandlers = MS.Entertainment.Utilities.addEvents(container, {click: this._onItemClicked.bind(this)})
                }, _onItemClicked: function _onItemClicked(e) {
                    var element = e.srcElement;
                    while (element && element !== this.domElement) {
                        if (element.clickDataContext && element.clickDataContext.doclick) {
                            element.clickDataContext.doclick({target: element.clickDataContext});
                            e.stopPropagation();
                            return
                        }
                        else if (element === this._dashboardNowPlaying && this._nowPlayingControl) {
                            this._nowPlayingControl.nowPlayingClick();
                            e.stopPropagation();
                            return
                        }
                        element = element.parentElement
                    }
                }, _getView: function _getView() {
                    return MS.Entertainment.UI.Controls.FeaturedContent.getViewByResolution()
                }
        }, {
            _view: -1, data: undefined, templates: null
        }, {
            getViewByResolution: function getViewByResolution() {
                var screenHeight = window.outerHeight;
                var view = 0;
                if (screenHeight >= MS.Entertainment.UI.Controls.FeaturedContent.VIEW1_VERTICAL_HEIGHT_LIMIT)
                    view = 1;
                return view
            }, VIEW1_VERTICAL_HEIGHT_LIMIT: 900
        })});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {SpotlightFeaturedContent: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.FeaturedContent, null, null, {
            _nowPlayingBindings: null, _nowPlayingRemoteBindings: null, _upgradeServiceBindings: null, unload: function unload() {
                    if (this._nowPlayingBindings) {
                        this._nowPlayingBindings.cancel();
                        this._nowPlayingBindings = null
                    }
                    if (this._nowPlayingRemoteBindings) {
                        this._nowPlayingRemoteBindings.cancel();
                        this._nowPlayingRemoteBindings = null
                    }
                    if (this._upgradeServiceBindings) {
                        this._upgradeServiceBindings.cancel();
                        this._upgradeServiceBindings = null
                    }
                    MS.Entertainment.UI.Controls.FeaturedContent.prototype.unload.call(this)
                }, initialize: function initialize() {
                    MS.Entertainment.UI.Controls.FeaturedContent.prototype.initialize.call(this);
                    if (!MS.Entertainment.Utilities.isApp2) {
                        var upgradeService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.upgradeReminderDisplayer);
                        this._upgradeServiceBindings = MS.Entertainment.Utilities.addEventHandlers(upgradeService, {upgradeRequiredChanged: this._displayUpgradeMessageIfNeeded.bind(this)})
                    }
                }, _onTemplateLoaded: function _onTemplateLoaded(container) {
                    if (this._nowPlaying) {
                        if (this._nowPlayingBindings) {
                            this._nowPlayingBindings.cancel();
                            this._nowPlayingBindings = null
                        }
                        if (this._nowPlayingRemoteBindings) {
                            this._nowPlayingRemoteBindings.cancel();
                            this._nowPlayingRemoteBindings = null
                        }
                    }
                    MS.Entertainment.UI.Controls.FeaturedContent.prototype._onTemplateLoaded.apply(this, arguments);
                    MS.Entertainment.UI.Framework.processDeclMembers(container, this, true);
                    if (this._nowPlaying)
                        this._nowPlayingBindings = WinJS.Binding.bind(this._nowPlaying, {visible: function bind_nowPlaying() {
                                if (this._nowPlaying.visible)
                                    WinJS.Utilities.addClass(this.domElement.parentElement.parentElement, "nowPlayingTileShowing");
                                else
                                    WinJS.Utilities.removeClass(this.domElement.parentElement.parentElement, "nowPlayingTileShowing")
                            }.bind(this)});
                    if (this._nowPlayingRemote)
                        this._nowPlayingRemoteBindings = WinJS.Binding.bind(this._nowPlayingRemote, {visible: function bind_nowPlayingRemote() {
                                if (this._nowPlayingRemote.visible)
                                    WinJS.Utilities.removeClass(this._nowPlayingRemote.domElement, "removeFromDisplay");
                                else
                                    WinJS.Utilities.addClass(this._nowPlayingRemote.domElement, "removeFromDisplay")
                            }.bind(this)});
                    this._displayUpgradeMessageIfNeeded()
                }, _upgradeTile: null, _displayUpgradeMessageIfNeeded: function _displayUpgradeMessageIfNeeded() {
                    var upgradeService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.upgradeReminderDisplayer);
                    if (!upgradeService.upgradeRequired)
                        return;
                    if (!this._upgradeContainer)
                        return;
                    MS.Entertainment.Utilities.empty(this._upgradeContainer);
                    var host = document.createElement("div");
                    host.className = "fillParent";
                    this._upgradeContainer.appendChild(host);
                    MS.Entertainment.Utilities.toggleHideOnElement(this._upgradeContainer, false);
                    MS.Entertainment.UI.Controls.UpgradeTile.getUpgradeFeedInformation().done(function(data) {
                        this._upgradeTile = new MS.Entertainment.UI.Controls.UpgradeTile(host, data)
                    }.bind(this))
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {NowPlayingFeaturedContent: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.SpotlightFeaturedContent, null, null, {
            controlName: "NowPlayingFeaturedContent", _nowPlayingControl: null, _userEngagementBinding: null, _userEngagementMessage: null, _userEngagementService: null, _uiStateService: {get: function() {
                        return MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState)
                    }}, freeze: function freeze() {
                    this._releaseNowPlayingControl();
                    MS.Entertainment.UI.Controls.SpotlightFeaturedContent.prototype.freeze.call(this)
                }, thaw: function thaw() {
                    MS.Entertainment.UI.Controls.SpotlightFeaturedContent.prototype.thaw.call(this);
                    if (!this._refreshingView)
                        this._reclaimNowPlayingControl()
                }, unload: function unloaded() {
                    this._releaseNowPlayingControl();
                    if (this._userEngagementBinding) {
                        this._userEngagementBinding.cancel();
                        this._userEngagementBinding = null
                    }
                    MS.Entertainment.UI.Controls.SpotlightFeaturedContent.prototype.unload.call(this)
                }, _onTemplateLoaded: function _onTemplateLoaded(container) {
                    MS.Entertainment.UI.Controls.FeaturedContent.prototype._onTemplateLoaded.apply(this, arguments);
                    MS.Entertainment.UI.Framework.processDeclMembers(container, this, true);
                    if (!this._uiStateService.isSnapped)
                        this._reclaimNowPlayingControl();
                    this._displayUpgradeMessageIfNeeded();
                    if (this.outOfBandMessagingContainer) {
                        if (!this._userEngagementService)
                            this._userEngagementService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.userEngagementService);
                        if (this._userEngagementService.userEngagementMessageContent)
                            this._showUserEngagementMessage();
                        this._userEngagementBinding = MS.Entertainment.UI.Framework.addEventHandlers(this._userEngagementService, {
                            displayUserEngagementServiceVisuals: this._showUserEngagementMessage.bind(this), hideUserEngagementServiceVisuals: this._hideUserEngagementMessage.bind(this)
                        })
                    }
                }, _showUserEngagementMessage: function _showUserEngagementMessage() {
                    WinJS.Utilities.removeClass(this.outOfBandMessagingContainer, "removeFromDisplay");
                    if (!this._userEngagementMessage)
                        this._userEngagementMessage = new MS.Entertainment.UI.UserEngagementServiceMessage(this.outOfBandMessagingContainer, {userMessageResponse: this._userEngagementService.userEngagementMessageContent});
                    this._hideSecondColumnItemsFromAccessibility()
                }, _hideSecondColumnItemsFromAccessibility: function _hideSecondColumnItemsFromAccessibility() {
                    if (this.columnTwoFirstItem && this.columnTwoFirstItem.domElement) {
                        WinJS.Utilities.removeClass(this.columnTwoFirstItem.domElement, "win-focusable");
                        this.columnTwoFirstItem.domElement.setAttribute("aria-hidden", "true")
                    }
                    if (this.columnTwoSecondItem && this.columnTwoSecondItem.domElement) {
                        WinJS.Utilities.removeClass(this.columnTwoSecondItem.domElement, "win-focusable");
                        this.columnTwoSecondItem.domElement.setAttribute("aria-hidden", "true")
                    }
                    if (this.columnTwoThirdItem && this.columnTwoThirdItem.domElement) {
                        WinJS.Utilities.removeClass(this.columnTwoThirdItem.domElement, "win-focusable");
                        this.columnTwoThirdItem.domElement.setAttribute("aria-hidden", "true")
                    }
                }, _hideUserEngagementMessage: function _hideUserEngagementMessage() {
                    this._showSecondColumnItemsToAccessibility();
                    WinJS.Utilities.addClass(this.outOfBandMessagingContainer, "removeFromDisplay");
                    MS.Entertainment.Utilities.empty(this.outOfBandMessagingContainer);
                    this._userEngagementMessage = null
                }, _showSecondColumnItemsToAccessibility: function _showSecondColumnItemsToAccessibility() {
                    if (this.columnTwoFirstItem && this.columnTwoFirstItem.domElement) {
                        WinJS.Utilities.addClass(this.columnTwoFirstItem.domElement, "win-focusable");
                        this.columnTwoFirstItem.domElement.setAttribute("aria-hidden", "false")
                    }
                    if (this.columnTwoSecondItem && this.columnTwoSecondItem.domElement) {
                        WinJS.Utilities.addClass(this.columnTwoSecondItem.domElement, "win-focusable");
                        this.columnTwoSecondItem.domElement.setAttribute("aria-hidden", "false")
                    }
                    if (this.columnTwoThirdItem && this.columnTwoThirdItem.domElement) {
                        WinJS.Utilities.addClass(this.columnTwoThirdItem.domElement, "win-focusable");
                        this.columnTwoThirdItem.domElement.setAttribute("aria-hidden", "false")
                    }
                }, _reclaimNowPlayingControl: function _getNowPlayingControl() {
                    if (!this._uiStateService.isSnapped) {
                        this._uiStateService.nowPlayingTileVisible = true;
                        this._nowPlayingControl = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.nowPlayingControlManager).getNowPlayingControl(MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying);
                        if (this._dashboardNowPlaying) {
                            MS.Entertainment.Utilities.empty(this._dashboardNowPlaying);
                            this._dashboardNowPlaying.appendChild(this._nowPlayingControl.domElement)
                        }
                    }
                }, _releaseNowPlayingControl: function _releaseNowPlayingControl() {
                    if (this._nowPlayingControl) {
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.nowPlayingControlManager).releaseNowPlayingControl(MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying);
                        this._nowPlayingControl = null
                    }
                    this._uiStateService.nowPlayingTileVisible = false
                }
        })})
})()
