/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI", {DashboardRefresherService: WinJS.Class.derive(MS.Entertainment.UI.Framework.ObservableBase, function(){}, {
            initialize: function initialize() {
                WinJS.Promise.timeout(this._getCurrentTimeout()).done(this.dashboardRefreshTimeout.bind(this))
            }, dashboardRefreshTimeout: function dashboardRefreshTimeout() {
                    this.dispatchEvent("refreshDashboard");
                    WinJS.Promise.timeout(this._getCurrentTimeout()).done(this.dashboardRefreshTimeout.bind(this))
                }, _getCurrentTimeout: function _getCurrentTimeout() {
                    if (!this._configuration)
                        this._configuration = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    var timeout = 43200000;
                    switch (MS.Entertainment.appMode) {
                        case Microsoft.Entertainment.Application.AppMode.games:
                            timeout = this._configuration.shell.gamesDashboardRefreshTimer;
                            break;
                        case Microsoft.Entertainment.Application.AppMode.music:
                            timeout = this._configuration.shell.musicDashboardRefreshTimer;
                            break;
                        case Microsoft.Entertainment.Application.AppMode.music2:
                            timeout = this._configuration.shell.music2DashboardRefreshTimer;
                            break;
                        case Microsoft.Entertainment.Application.AppMode.video:
                            timeout = this._configuration.shell.videoDashboardRefreshTimer;
                            break;
                        case Microsoft.Entertainment.Application.AppMode.video2:
                            timeout = this._configuration.shell.video2DashboardRefreshTimer;
                            break
                    }
                    if (!timeout)
                        timeout = 43200000;
                    return timeout
                }, _configuration: null, refreshDashboard: MS.Entertainment.UI.Framework.observableProperty("refreshDashboard", false)
        }, {refreshDelayTime: 3000})});
    MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.dashboardRefresher, function createDashboardRefresherService() {
        return new MS.Entertainment.UI.DashboardRefresherService
    })
})()
