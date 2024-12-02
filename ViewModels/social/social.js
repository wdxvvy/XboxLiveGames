/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/Utilities.js", "/Framework/Data/xboxLive.js", "/Framework/Data/query.js");
(function() {
    WinJS.Namespace.define("MS.Entertainment.Social", {
        LoadStatus: {
            idle: "idle", loading: "loading", loaded: "loaded", offline: "offline", error: "error", blocked: "blocked", parseXboxLiveError: function parseXboxLiveError(error) {
                    var result;
                    if (error) {
                        error = WinJS.Binding.unwrap(error);
                        if (Error.prototype.isPrototypeOf(error))
                            error = error.number;
                        else if (MS.Entertainment.Data.MainQuery.prototype.isPrototypeOf(error))
                            error = error.errorObject.number;
                        else if (Array.isArray(error))
                            for (var i = 0; i < error.length; i++) {
                                result = MS.Entertainment.Social.LoadStatus.parseXboxLiveError(error[i]);
                                if (result)
                                    break
                            }
                        else if (typeof error === "object")
                            for (var key in error) {
                                result = MS.Entertainment.Social.LoadStatus.parseXboxLiveError(error[key]);
                                if (result)
                                    break
                            }
                    }
                    if (error && !result)
                        switch (error) {
                            case MS.Entertainment.Data.XboxLive.ErrorCodes.httpForbidden:
                                result = MS.Entertainment.Social.LoadStatus.blocked;
                                break;
                            default:
                                result = MS.Entertainment.Social.LoadStatus.error;
                                break
                        }
                    return result
                }
        }, PageData: MS.Entertainment.defineObservable(function pageDataConstructor() {
                var currentPage = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).currentPage;
                if (currentPage)
                    this._bindings = WinJS.Binding.bind(currentPage, {options: this._handleOptionsChanged.bind(this)})
            }, {
                _bindings: null, userModel: null, userXuid: 0, dispose: function dispose() {
                        if (this._bindings) {
                            this._bindings.cancel();
                            this._bindings = null
                        }
                    }, _handleOptionsChanged: function _handleOptionsChanged(newValue) {
                        if (newValue) {
                            this.userModel = newValue.userModel;
                            this.userXuid = newValue.userXuid
                        }
                        else {
                            this.userModel = null;
                            this.userXuid = 0
                        }
                    }
            }), Hydratable: WinJS.Class.define(function hydratable(){}, {
                _hydrateFunction: null, _hydratePromise: null, _keysToCopy: null, instance: {get: function() {
                            return this
                        }}, initializeHydrate: function initializeHydrate(hydrateFunction) {
                        this._hydrateFunction = hydrateFunction;
                        this._keysToCopy = [];
                        this.addPropertyIfNeeded("hydrated", false)
                    }, addPropertyIfNeeded: function addPropertyIfNeeded(name, value) {
                        if (!(name in this)) {
                            this.addProperty(name, value);
                            this._keysToCopy.push(name)
                        }
                    }, hydrate: (function() {
                        function clearHydratePromise() {
                            this._hydratePromise = null
                        }
                        {};
                        return function hydrate() {
                                var promise = this._hydratePromise;
                                if (this.hydrated || !this._hydrateFunction) {
                                    this.hydrated = true;
                                    promise = WinJS.Promise.wrap(this)
                                }
                                else if (!promise) {
                                    promise = this._hydrateFunction(this).then(function hydrateSuccess(result) {
                                        this.copyResult(result);
                                        this.hydrated = true;
                                        return this
                                    }.bind(this));
                                    this._hydratePromise = promise;
                                    this._hydratePromise.then(clearHydratePromise.bind(this), clearHydratePromise.bind(this))
                                }
                                return promise
                            }
                    })(), copyResult: function copyResult(result) {
                        if (result && this._keysToCopy) {
                            result = WinJS.Binding.unwrap(result);
                            this._keysToCopy.forEach(function(key) {
                                if (key in this)
                                    this[key] = result[key]
                            }, this);
                            this._keysToCopy = null
                        }
                    }
            })
    });
    WinJS.Namespace.define("MS.Entertainment.Social", {
        HydratableMixin: (function() {
            return MS.Entertainment.Social.Hydratable.prototype
        })(), createHydratable: function createHydratable(Augmentation, hydrateFunction, source) {
                var key,
                    value,
                    object;
                var result = WinJS.Binding.as(source || {});
                for (key in MS.Entertainment.Social.HydratableMixin) {
                    value = MS.Entertainment.Social.HydratableMixin[key];
                    if (typeof value === "function")
                        result[key] = value;
                    else {
                        value = Object.getOwnPropertyDescriptor(MS.Entertainment.Social.HydratableMixin, key);
                        Object.defineProperty(result, key, value)
                    }
                }
                result.initializeHydrate(hydrateFunction);
                if (Augmentation && Augmentation.prototype)
                    for (key in Augmentation.prototype)
                        result.addPropertyIfNeeded(key, Augmentation.prototype[key]);
                return result
            }
    });
    WinJS.Namespace.define("MS.Entertainment.Social.Hydrators", {hydrateProfile: function hydrateProfile(source) {
            var detailsQuery = new MS.Entertainment.Data.Query.profileQuery;
            detailsQuery.userModel = source.userModel;
            return detailsQuery.execute().then(function(query) {
                    return query.result
                }, function(query) {
                    var error = query.errorObject;
                    var errorType = MS.Entertainment.Social.LoadStatus.parseXboxLiveError(error);
                    if (errorType !== MS.Entertainment.Social.LoadStatus.blocked)
                        throw error;
                })
        }})
})()
