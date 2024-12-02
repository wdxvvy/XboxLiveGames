/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/data/query.js");
WinJS.Namespace.define("MS.Entertainment.Framework", {QueryWatcher: MS.Entertainment.defineObservable(function QueryWatcher(moniker) {
        this._moniker = moniker;
        this._queries = []
    }, {
        _firstQueryLogged: false, _moniker: null, _queries: null, autoClear: true, lowestStatus: MS.Entertainment.Data.queryStatus.idle, registerQuery: function registerQuery(query) {
                if (query !== null) {
                    this._checkAndFireInitialEvent();
                    var that = this;
                    var callback = function statusChangeCallback(status) {
                            var i;
                            var currentStatus;
                            var newLowestStatus = MS.Entertainment.Data.queryStatus.max;
                            var fireCompletedEvent = true;
                            for (i = 0; i < that._queries.length; i++) {
                                currentStatus = that._queries[i].savedQuery.status;
                                if (currentStatus < newLowestStatus)
                                    newLowestStatus = currentStatus;
                                if (currentStatus < MS.Entertainment.Data.queryStatus.completed)
                                    fireCompletedEvent = false
                            }
                            that.lowestStatus = newLowestStatus;
                            if (fireCompletedEvent) {
                                var eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell;
                                eventProvider.traceQueries_Complete(that._moniker);
                                if (that.autoClear)
                                    that.clearQueries()
                            }
                        };
                    this._queries.push({
                        savedQuery: query, savedCallback: callback
                    });
                    query.bind("status", callback)
                }
            }, _checkAndFireInitialEvent: function _checkAndFireInitialEvent() {
                if (!this._firstQueryLogged) {
                    this._firstQueryLogged = true;
                    var eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell;
                    eventProvider.traceQueries_Begin(this._moniker)
                }
            }, clearQueries: function clearQueries() {
                var i = this._queries.length;
                for (i = 0; i < this._queries.length; i++)
                    this._queries[i].savedQuery.unbind("status", this._queries[i].savedCallback);
                this._queries.length = 0;
                this._firstQueryLogged = false
            }
    }, null)})
