/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/utilities.js");
(function(undefined) {
    "use strict";
    var MSE = WinJS.Namespace.define("MS.Entertainment", null);
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Data");
    var blockAssertValueNotHydrated = function blockAssertValueNotHydrated(){};
    var unblockAssertValueNotHydrated = function unblockAssertValueNotHydrated(){};
    var assertValueNotHydrated = function assertValueNotHydrated(property, propertyPath){};
    WinJS.Namespace.defineWithParent(MSE, "Data", {
        stringParser: {
            dateFromUTC: function(string, delimiter) {
                var date = null;
                if (string && string.constructor === String) {
                    if (delimiter === undefined)
                        delimiter = "-";
                    var pattern = new RegExp("(\\d{4})" + delimiter + "(\\d{2})" + delimiter + "(\\d{2}).(\\d{2}):(\\d{2}):(\\d{2})");
                    var parts = string.match(pattern);
                    MS.Entertainment.Data.assert(parts, "Parsing string dateFromUTC did not match RegExp pattern");
                    if (parts)
                        date = new Date(Date.UTC(parseInt(parts[1]), parseInt(parts[2], 10) - 1, parseInt(parts[3], 10), parseInt(parts[4], 10), parseInt(parts[5], 10), parseInt(parts[6], 10), 0))
                }
                return date
            }, timeSpanFromXmlDuration: function timeSpanFromXmlDuration(data) {
                    var years = 0;
                    var months = 0;
                    var days = 0;
                    var hours = 0;
                    var minutes = 0;
                    var seconds = 0;
                    var regexp,
                        parts;
                    if (data) {
                        regexp = /(-?)P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?/i;
                        parts = data.match(regexp);
                        years = parseInt(parts[2] || 0);
                        months = parseInt(parts[3] || 0);
                        days = parseInt(parts[4] || 0);
                        hours = parseInt(parts[5] || 0);
                        minutes = parseInt(parts[6] || 0);
                        seconds = parseInt(parts[7] || 0)
                    }
                    var timeSpan = new Date(years, months, days, hours, minutes, seconds, 0);
                    return timeSpan
                }
        }, Augmentation: WinJS.Class.derive(MS.Entertainment.UI.Framework.ObservableBase, function augmentation(augmentBackingData) {
                this._cache = {};
                this._backingAugmentation = {};
                this._setAugmentBackingData(augmentBackingData || {})
            }, {
                _hydratePromise: null, _backingAugmentation: null, _preventObservableInheritance: true, _hydrated: false, hydrating: MS.Entertainment.UI.Framework.observableProperty("hydrating", false), isFailed: MS.Entertainment.UI.Framework.observableProperty("isFailed", false), hydrated: {
                        get: function get_hydrated() {
                            return this._hydrated
                        }, set: function set_hydrated(value) {
                                if (value !== this._hydrated) {
                                    var oldValue = this._hydrated;
                                    this._hydrated = value;
                                    if (!value)
                                        this._hydratePromise = null;
                                    this.dispatchChangeAndNotify("hydrated", value, oldValue)
                                }
                            }
                    }, instance: {
                        get: function get_instance() {
                            return this._updatedInstance || this
                        }, set: function set_instance(value) {
                                this._updatedInstance = value
                            }, enumerable: true, configurable: false
                    }, _augmentBackingData: {
                        value: null, writable: true, enumerable: true, configurable: false
                    }, _backingData: {
                        get: function get_backingData() {
                            return this._cache
                        }, enumerable: true, configurable: false
                    }, _cache: {
                        value: null, writable: true, enumerable: true, configurable: false
                    }, _updatedInstance: {
                        value: null, writable: true, enumerable: true, configurable: false
                    }, _setCacheValue: {
                        value: function _setCacheValue(key, value) {
                            if (this._cache)
                                this._cache[key] = value
                        }, enumerable: true
                    }, _getAugmentBackingValue: {
                        value: function _getAugmentBackingValue(key, defaultValue) {
                            return (this._augmentBackingData && key in this._augmentBackingData) ? this._augmentBackingData[key] : defaultValue
                        }, enumerable: true, configurable: false
                    }, _setAugmentBackingValue: {
                        value: function _setAugmentBackingValue(key, newValue) {
                            if (this._augmentBackingData) {
                                var oldValue = this._getAugmentBackingValue(key);
                                this._augmentBackingData[key] = newValue;
                                if (newValue !== oldValue)
                                    this.dispatchChangeAndNotify(key, newValue, oldValue)
                            }
                        }, enumerable: true, configurable: false
                    }, _getCacheValue: {
                        value: function _getCacheValue(key, defaultValue) {
                            return (this._cache && key in this._cache) ? this._cache[key] : defaultValue
                        }, enumerable: true
                    }, _getPropertyValueFromInner: function _getPropertyValueFromInner(key, innerProperty, source) {
                        var cache;
                        var cacheable = innerProperty ? innerProperty.cacheable : false;
                        source = source || this;
                        if (cacheable)
                            cache = this._getCacheValue(key);
                        if (cache === undefined) {
                            if (innerProperty && innerProperty.get)
                                cache = innerProperty.get.call(source, !source._augmentBackingData);
                            else
                                cache = innerProperty;
                            if (cacheable)
                                this._setCacheValue(key, cache)
                        }
                        return cache
                    }, _setPropertyValueFromInner: function _setPropertyValueFromInner(key, innerProperty, newValue) {
                        blockAssertValueNotHydrated();
                        var cacheable = innerProperty ? innerProperty.cacheable : false;
                        var oldValue = this._getPropertyValueFromInner(key, innerProperty);
                        if (cacheable)
                            this._setCacheValue(key, newValue);
                        if (innerProperty && innerProperty.set)
                            innerProperty.set.call(this, newValue);
                        if (newValue !== oldValue)
                            this.dispatchChangeAndNotify(key, newValue, oldValue);
                        unblockAssertValueNotHydrated()
                    }, _getInitializablePropertyValueFromInner: function _getInitializablePropertyValueFromInner(key, innerProperty) {
                        var initialized = this._getCacheValue(key);
                        if (!initialized && innerProperty && innerProperty.initializer) {
                            innerProperty.initializer.call(this);
                            this._setCacheValue(key, true)
                        }
                        if (innerProperty && innerProperty.get)
                            return innerProperty.get.call(this)
                    }, _setInitializablePropertyValueFromInner: function _setInitializablePropertyValueFromInner(key, innerProperty, newValue) {
                        blockAssertValueNotHydrated();
                        var oldValue = this._getInitializablePropertyValueFromInner(key, innerProperty);
                        if (innerProperty && innerProperty.set)
                            innerProperty.set.call(this, newValue);
                        if (newValue !== oldValue)
                            this.dispatchChangeAndNotify(key, newValue, oldValue);
                        unblockAssertValueNotHydrated()
                    }, clone: function clone() {
                        var clone = MS.Entertainment.Data.augment(MS.Entertainment.Data.deflate(this), WinJS.Binding.unwrap(this).constructor);
                        return clone
                    }, hydrate: function hydrate(options) {
                        if (!this._hydratePromise && this.onHydrated) {
                            this.hydrated = false;
                            this.hydrating = true;
                            this.isFailed = false;
                            var hydratePromise = this._hydratePromise = WinJS.Promise.as(this.onHydrated.call(this, this, options));
                            hydratePromise = hydratePromise.then(function hydratedCompleted(values) {
                                if (hydratePromise === this._hydratePromise) {
                                    this.hydrating = false;
                                    if (values) {
                                        this._setHydratedValues(values);
                                        this.hydrated = true
                                    }
                                    else
                                        this._hydratePromise = null
                                }
                            }.bind(this), function hydratedFailed(error) {
                                if (hydratePromise === this._hydratePromise) {
                                    this.hydrating = false;
                                    if (!error || error.message !== "Canceled")
                                        this.isFailed = true;
                                    this._hydratePromise = null
                                }
                            }.bind(this)).then(function hydratedFinally() {
                                return this
                            }.bind(this));
                            if (this._hydratePromise)
                                this._hydratePromise = hydratePromise
                        }
                        return WinJS.Promise.as(this._hydratePromise || this)
                    }, refresh: function refresh(options) {
                        this.hydrated = false;
                        return this.hydrate()
                    }, onHydrated: null, _setAugmentBackingData: function _setAugmentBackingData(data) {
                        var properties;
                        var key;
                        if (!this._augmentBackingData && data) {
                            this._augmentBackingData = data;
                            var addToProperties = function addToProperties(key) {
                                    if (!(key in this) && key !== "backingData") {
                                        properties = properties || {};
                                        properties[key] = MSE.Data.Augmentation.defineAugmentProperty(key)
                                    }
                                }.bind(this);
                            while (data && data !== Object.prototype) {
                                Object.keys(data).forEach(addToProperties);
                                data = Object.getPrototypeOf(data)
                            }
                        }
                        if (properties)
                            Object.defineProperties(this, properties)
                    }, _setHydratedValues: function _setHydratedValues(values) {
                        blockAssertValueNotHydrated();
                        var key,
                            property,
                            propertyValue,
                            override;
                        var augmentationShape = MSE.Data.augmentationShape(this);
                        values = values || {};
                        for (key in augmentationShape) {
                            property = augmentationShape[key];
                            if (property && property.hydrated)
                                if (key in values) {
                                    propertyValue = values[key];
                                    if (property.hydratedComparer)
                                        override = property.hydratedComparer(this[key], values[key]) > 0;
                                    else
                                        override = MS.Entertainment.Data.Comparer.notFalsy(null, values[key]) > 0;
                                    if (override)
                                        this[key] = values[key]
                                }
                                else if (!property.hydratedIfAvailable)
                                    MSE.Data.fail("Expected key missing from hydrated values. Key = " + key)
                        }
                        unblockAssertValueNotHydrated()
                    }, _assertValueNotHydrated: function _assertValueNotHydrated(property, propertyPath) {
                        if (!this.hydrated)
                            assertValueNotHydrated(property, propertyPath)
                    }
            }, {
                isAugmentation: function isAugmentation(object) {
                    return MS.Entertainment.Data.Augmentation.prototype.isPrototypeOf(object)
                }, addProperties: function addProperties(object, innerPropertiesOrValues) {
                        if (object && innerPropertiesOrValues)
                            for (var key in innerPropertiesOrValues)
                                MS.Entertainment.Data.Augmentation.defineProperty(object, key, innerPropertiesOrValues[key]);
                        return object
                    }, addProperty: function addProperty(object, key, innerPropertyOrValue) {
                        if (!object)
                            return object;
                        if (!(key in this)) {
                            innerPropertyOrValue = MS.Entertainment.Data.Augmentation.defineProperty(key, innerPropertyOrValue);
                            if (innerPropertyOrValue.get || innerPropertyOrValue.set)
                                if (!(key in object))
                                    Object.defineProperty(object, key, innerPropertyOrValue)
                        }
                        else if (!innerPropertyOrValue.get && !innerPropertyOrValue.set && innerPropertyOrValue !== "function")
                            object[key] = innerPropertyOrValue;
                        return object
                    }, defineProperty: function defineProperty(key, innerProperty) {
                        var result = innerProperty;
                        var type = typeof innerProperty;
                        var validObject = innerProperty && type === "object";
                        if (validObject && innerProperty.initializer)
                            result = MSE.Data.Augmentation.defineInitializerProperty(key, innerProperty);
                        else if (validObject && (innerProperty.get || innerProperty.set))
                            result = MSE.Data.Augmentation.defineCacheableProperty(key, innerProperty);
                        else if (innerProperty !== "function")
                            result = MSE.Data.Augmentation.defineNotifyProperty(key, innerProperty);
                        return result
                    }, defineAugmentProperty: function defineAugmentProperty(key) {
                        return {
                                get: function() {
                                    return this._getAugmentBackingValue(key)
                                }, set: function(newValue) {
                                        this._setAugmentBackingValue(key, newValue)
                                    }, enumerable: true, configurable: true
                            }
                    }, defineNotifyProperty: function defineNotifyProperty(key, innerValue) {
                        return {
                                get: function() {
                                    return this._getCacheValue(key, innerValue)
                                }, set: function(newValue) {
                                        var oldValue = this._getCacheValue(key, innerValue);
                                        this._setCacheValue(key, newValue);
                                        if (newValue !== oldValue)
                                            this.dispatchChangeAndNotify(key, newValue, oldValue)
                                    }, enumerable: true, configurable: true
                            }
                    }, defineCacheableProperty: function defineCacheableProperty(key, innerProperty) {
                        return {
                                get: function() {
                                    return this._getPropertyValueFromInner(key, innerProperty)
                                }, set: function(value) {
                                        return this._setPropertyValueFromInner(key, innerProperty, value)
                                    }, enumerable: (!innerProperty || innerProperty.enumerable === undefined) ? true : innerProperty.enumerable, configurable: (!innerProperty || innerProperty.configurable === undefined) ? true : innerProperty.configurable
                            }
                    }, defineInitializerProperty: function defineInitializer(key, innerProperty) {
                        return {
                                get: function() {
                                    return this._getInitializablePropertyValueFromInner(key, innerProperty)
                                }, set: function(value) {
                                        return this._setInitializablePropertyValueFromInner(key, innerProperty, value)
                                    }, enumerable: (!innerProperty || innerProperty.enumerable === undefined) ? true : innerProperty.enumerable, configurable: (!innerProperty || innerProperty.configurable === undefined) ? true : innerProperty.configurable
                            }
                    }
            }), mix: (function() {
                function defineMixedProperty(propertyPath, key, innerProperty) {
                    var hasGetter;
                    if (innerProperty && innerProperty.augmented)
                        hasGetter = !!innerProperty.get;
                    if (!hasGetter)
                        return innerProperty;
                    else {
                        var propertyPathFragments = MSE.Data.Property._getPropertyPathFragments(null, propertyPath);
                        return {
                                get: function() {
                                    var result;
                                    var that;
                                    if (hasGetter && MSE.Data.Property._hasPropertyPathFragments(this, propertyPathFragments))
                                        that = MSE.Data.Property._valueFromPropertyPathFragments(this, propertyPathFragments);
                                    if (that && this._getPropertyValueFromInner)
                                        result = this._getPropertyValueFromInner(key, innerProperty, that);
                                    return result
                                }, augmented: true, cacheable: true, enumerable: innerProperty.enumerable, configurable: innerProperty.configurable, hydrated: innerProperty.hydrated, hydratedRequired: innerProperty.hydratedRequired, hydratedComparer: innerProperty.hydratedComparer
                            }
                    }
                }
                {};
                return function mix(augmentations) {
                        var instanceMembers = {};
                        var shape;
                        var property;
                        var key;
                        var shapeKey;
                        var constructors = [];
                        for (key in augmentations) {
                            constructors.push(augmentations[key].prototype.constructor);
                            shape = MSE.Data.augmentationShape(augmentations[key].prototype);
                            for (shapeKey in shape) {
                                property = shape[shapeKey];
                                instanceMembers[shapeKey] = defineMixedProperty(key, shapeKey, shape[shapeKey])
                            }
                        }
                        var mixConstructor = function mixConstructor() {
                                var args = arguments;
                                constructors.forEach(function(constructor) {
                                    constructor.apply(this, args)
                                }, this)
                            };
                        return MSE.Data.define(mixConstructor, instanceMembers)
                    }
            })(), define: function define(constructor, instanceMembers, staticMembers) {
                return MSE.Data.derive(null, constructor, instanceMembers, staticMembers)
            }, derive: (function() {
                return function derive(base, constructor, instanceMembers, staticMembers) {
                        base = base || MSE.Data.Augmentation;
                        if (!constructor)
                            constructor = function defaultConstructor() {
                                this.base.apply(this, arguments)
                            };
                        var adjustedInstanceMembers = {_augmentationShape: instanceMembers};
                        for (var key in instanceMembers)
                            adjustedInstanceMembers[key] = MSE.Data.Augmentation.defineProperty(key, instanceMembers[key]);
                        if (adjustedInstanceMembers._augmentationShape && base && base.prototype)
                            adjustedInstanceMembers._augmentationShape._baseAugmentationShape = base.prototype._augmentationShape;
                        return MS.Entertainment.derive(base, constructor, adjustedInstanceMembers, staticMembers)
                    }
            })(), augment: function augment(data, Augmentation) {
                var result;
                if (data === null)
                    return null;
                if (typeof data !== "object")
                    throw new Error("Can't augment a non-object types. " + (typeof data));
                if (Augmentation) {
                    result = new Augmentation(data);
                    MSE.Data.assert(result._augmentBackingData === data, "During augmentation the the backing data didn't equal the expected value. Are you sure your Augmentation definition is calling the base constructor?")
                }
                else
                    result = data;
                return result
            }, augmentArrayItems: function(data, augmentationOrFactory) {
                if (!Array.isArray(data))
                    throw new Error("Can't call augmentArrayItems a non-array types. " + (typeof data));
                var itemFactory;
                if (!augmentationOrFactory || MSE.Data.Augmentation.prototype.isPrototypeOf(augmentationOrFactory.prototype))
                    itemFactory = MSE.Data.Factory.createAugmentationFactory(augmentationOrFactory);
                else
                    itemFactory = augmentationOrFactory;
                var result = data;
                if (itemFactory) {
                    result = [];
                    for (var i = 0; i < data.length; i++)
                        result[i] = itemFactory(data[i])
                }
                return result
            }, augmentationShape: function augmentationShape(data) {
                var key;
                var result = {};
                var shape = (data && data._augmentationShape) ? data._augmentationShape : (data && data.prototype) ? data.prototype._augmentationShape : null;
                while (shape) {
                    for (key in shape)
                        if (!(key in result))
                            result[key] = shape[key];
                    shape = shape._baseAugmentationShape
                }
                return result
            }, hydratedProperties: function hydratedProperties(data) {
                var key;
                var result = [];
                var augmentationShape = MSE.Data.augmentationShape(data);
                for (key in augmentationShape)
                    if (augmentationShape[key].hydrated)
                        result.push(key);
                return result
            }, deflate: function(data) {
                return data ? WinJS.Binding.unwrap(data)._augmentBackingData || data : data
            }, deflateOrFail: function(data) {
                return WinJS.Binding.unwrap(data)._augmentBackingData
            }
    });
    WinJS.Namespace.define("MS.Entertainment.Data.Merger", {
        defaultMerger: function defaultMerger(item1, item2) {
            return new MSE.Data.Property.MergedItem(item1, item2)
        }, self: function self(item1, item2) {
                return item1 || item2
            }
    });
    WinJS.Namespace.define("MS.Entertainment.Data.Comparer", {
        defaultComparer: function defaultComparer(item1, item2) {
            if (item1 === item2)
                return 0;
            else if (item1 < item2 || item2 === null || item2 === undefined)
                return -1;
            else if (item1 > item2 || item1 === null || item1 === undefined)
                return 1;
            else
                return 0
        }, inverseDefaultComparer: function inverseDefaultComparer(item1, item2) {
                if (item1 === item2)
                    return 0;
                else if (item1 > item2 || item2 === null || item2 === undefined)
                    return -1;
                else if (item1 < item2 || item1 === null || item1 === undefined)
                    return 1;
                else
                    return 0
            }, dateComparer: function dateComparer(date1, date2) {
                var isDate1 = date1 && date1.getTime;
                var isDate2 = date2 && date2.getTime;
                if (isDate1 && isDate2)
                    return MS.Entertainment.Data.Comparer.defaultComparer(date1.getTime(), date2.getTime());
                else if (isDate1 && !isDate2)
                    return -1;
                else if (isDate2 && !isDate1)
                    return 1;
                else
                    return 0
            }, inverseDateComparer: function dateComparer(date1, date2) {
                var isDate1 = date1 && date1.getTime;
                var isDate2 = date2 && date2.getTime;
                if (isDate1 && isDate2)
                    return MS.Entertainment.Data.Comparer.inverseDefaultComparer(date1.getTime(), date2.getTime());
                else if (isDate1 && !isDate2)
                    return -1;
                else if (isDate2 && !isDate1)
                    return 1;
                else
                    return 0
            }, notFalsy: function notFalsy(item1, item2) {
                var emptyOrNull1 = item1 === null || item1 === undefined || item1 === String.empty;
                var emptyOrNull2 = item2 === null || item2 === undefined || item2 === String.empty;
                if (emptyOrNull1 && emptyOrNull2)
                    return NaN;
                else if (emptyOrNull2)
                    return -1;
                else if (emptyOrNull1)
                    return 1;
                else
                    return 0
            }, preferSecond: function preferSecond(item1, item2) {
                return 1
            }, createPropertyComparer: function(propertyPath, innerComparer, secondPropertyPath) {
                innerComparer = innerComparer || MS.Entertainment.Data.Comparer.defaultComparer;
                return function propertyComparer(item1, item2) {
                        var propertyFragments = MSE.Utilities.getPropertyPathFragments(propertyPath);
                        var secondPropertyFragments = (secondPropertyFragments === undefined) ? propertyFragments : MSE.Utilities.getPropertyPathFragments(secondPropertyPath);
                        item1 = MSE.Data.Property._valueFromPropertyPathFragments(item1, propertyFragments);
                        item2 = MSE.Data.Property._valueFromPropertyPathFragments(item2, secondPropertyFragments);
                        return innerComparer(item1, item2)
                    }
            }, createFilterComparer: function(filter) {
                filter = filter || MS.Entertainment.Data.Filter.defaultFilter;
                return function filterComparer(item1, item2) {
                        var item = item1;
                        var result = -1;
                        if ((item1 === null || item1 === undefined) && (item2 !== null && item2 !== undefined)) {
                            item = item2;
                            result = 1
                        }
                        if (filter(item))
                            result = NaN;
                        return result
                    }
            }
    });
    WinJS.Namespace.define("MS.Entertainment.Data.Filter", {
        defaultFilter: function defaultFilter(item) {
            return false
        }, createPropertyFilter: function createPropertyFilter(propertyPath, filterOrValue) {
                if (typeof filterOrValue === "function")
                    return function filter(item) {
                            var propertyFragments = MSE.Utilities.getPropertyPathFragments(propertyPath);
                            item = MSE.Data.Property._valueFromPropertyPathFragments(item, propertyFragments);
                            return filterOrValue(item)
                        };
                else
                    return function filter(item) {
                            var propertyFragments = MSE.Utilities.getPropertyPathFragments(propertyPath);
                            item = MSE.Data.Property._valueFromPropertyPathFragments(item, propertyFragments);
                            return item !== filterOrValue
                        }
            }
    });
    WinJS.Namespace.define("MS.Entertainment.Data.Property", {
        _getArray: function _getArray(original, propertyPathFragments) {
            var data;
            var returnResult = {
                    length: 0, data: []
                };
            if (MSE.Data.Property._hasPropertyPathFragments(original, propertyPathFragments)) {
                data = MSE.Data.Property._valueFromPropertyPathFragments(original, propertyPathFragments);
                if (MSE.Data.VectorViewWrapper.isVectorView(data)) {
                    returnResult.length = MSE.Data.VectorViewWrapper.getLength(data);
                    returnResult.data = data
                }
                else if (Array.isArray(data)) {
                    returnResult.length = data.length;
                    returnResult.data = data
                }
                else {
                    returnResult.length = 1;
                    returnResult.data = [data]
                }
            }
            return returnResult
        }, MergedItem: WinJS.Class.define(function _mergedItem(source1, source2) {
                this.source = [];
                if (source1 !== undefined)
                    this.source[0] = source1;
                if (source2 !== undefined)
                    this.source[1] = source2
            }, {
                source: null, primary: {get: function() {
                            return this.source[0] !== undefined ? this.source[0] : this.source[1]
                        }}
            })
    });
    WinJS.Namespace.define("MS.Entertainment.Data.Property", {
        _getPropertyPathFragments: function _getPropertyPathFragments(source, propertyPath) {
            if (Array.isArray(propertyPath) && source) {
                var propertyPathArray = propertyPath;
                propertyPath = null;
                for (var i = 0; i < propertyPathArray.length; i++) {
                    propertyPath = propertyPathArray[i];
                    if (MSE.Data.Property._hasPropertyPath(source, propertyPath))
                        break
                }
            }
            var result;
            if (Array.isArray(propertyPath)) {
                result = [];
                for (var j = 0; j < propertyPath.length; j++)
                    result.push(MSE.Utilities.getPropertyPathFragments(propertyPath[j]))
            }
            else
                result = MSE.Utilities.getPropertyPathFragments(propertyPath);
            return result
        }, _valueFromPropertyPathFragments: function _valueFromPropertyPathFragments(original, fragments) {
                var result;
                if (Array.isArray(fragments) && Array.isArray(fragments[0])) {
                    result = [];
                    for (var i = 0; i < fragments.length; i++)
                        result.push(MSE.Utilities.valueFromPropertyPathFragments(original, fragments[i]))
                }
                else
                    result = MSE.Utilities.valueFromPropertyPathFragments(original, fragments);
                return result
            }, _setFromPropertyPathFragments: function _setFromPropertyPathFragments(original, fragments, value) {
                if (Array.isArray(fragments) && Array.isArray(fragments[0]))
                    MSE.Utilities.setFromPropertyPathFragments(original, fragments[0], value);
                else
                    MSE.Utilities.setFromPropertyPathFragments(original, fragments, value)
            }, _hasPropertyPath: function _hasPropertyPath(source, propertyPath) {
                var hasPath = false;
                if (Array.isArray(propertyPath)) {
                    for (var i = 0; i < propertyPath.length; i++)
                        if (MSE.Utilities.hasPropertyPath(source, propertyPath[i])) {
                            hasPath = true;
                            break
                        }
                }
                else
                    hasPath = MSE.Utilities.hasPropertyPath(source, propertyPath);
                return hasPath
            }, _hasPropertyPathFragments: function _hasPropertyPathFragments(source, propertyPathFragments) {
                var hasPath = false;
                if (Array.isArray(propertyPathFragments) && Array.isArray(propertyPathFragments[0])) {
                    for (var i = 0; i < propertyPathFragments.length; i++)
                        if (MSE.Utilities.hasPropertyPathFragments(source, propertyPathFragments[i])) {
                            hasPath = true;
                            break
                        }
                }
                else
                    hasPath = MSE.Utilities.hasPropertyPathFragments(source, propertyPathFragments);
                return hasPath
            }, _getDefaultValue: function _getDefaultValue(defaultValue) {
                if (defaultValue && typeof defaultValue === "function")
                    defaultValue = defaultValue();
                return defaultValue
            }, _getFeatureEnabled: function _getFeatureEnabled(options) {
                var featureEnabled = true;
                if (options && options.feature !== undefined) {
                    var feature = options.feature;
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    if (Array.isArray(feature))
                        for (var i = 0; i < feature.length; i++) {
                            featureEnabled = featureEnablement.isEnabled(feature[i]);
                            if (featureEnabled)
                                break
                        }
                    else
                        featureEnabled = featureEnablement.isEnabled(feature)
                }
                return featureEnabled
            }, hydrated: function hydrated(property, overrideComparer) {
                if (!property)
                    throw new Error("Invalid parameter. Property was not defined");
                property.hydrated = true;
                if (overrideComparer)
                    property.hydratedComparer = overrideComparer;
                return property
            }, hydratedRequired: function hydratedRequired(property, overrideComparer) {
                property = MSE.Data.Property.hydrated(property, overrideComparer);
                property.hydratedRequired = true;
                return property
            }, hydratedIfAvailable: function hydratedIfAvailable(property, overrideComparer) {
                property = MSE.Data.Property.hydrated(property, overrideComparer);
                property.hydratedIfAvailable = true;
                return property
            }, copyHydrated: function copyHydrated(destination, source) {
                if (source && destination) {
                    destination.hydrated = source.hydrated;
                    destination.hydratedRequired = source.hydratedRequired;
                    destination.hydratedComparer = source.hydratedComparer
                }
                return destination
            }, value: function value(defaultValue) {
                var property = {
                        get: function() {
                            if (this._assertValueNotHydrated)
                                this._assertValueNotHydrated(property);
                            return MS.Entertainment.Data.Property._getDefaultValue(defaultValue)
                        }, augmented: true, cacheable: true, enumerable: true, configurable: true
                    };
                return property
            }, _alias: function _alias(deflate, source, defaultValue) {
                var property = {
                        get: function() {
                            var byPassDeflate = arguments[0];
                            var original = (deflate && !byPassDeflate) ? MSE.Data.deflateOrFail(this) : this;
                            var fragments = MSE.Data.Property._getPropertyPathFragments(original, source);
                            if (MSE.Data.Property._hasPropertyPathFragments(original, fragments))
                                return MSE.Data.Property._valueFromPropertyPathFragments(original, fragments);
                            else {
                                if (this._assertValueNotHydrated)
                                    this._assertValueNotHydrated(property);
                                return MS.Entertainment.Data.Property._getDefaultValue(defaultValue)
                            }
                        }, set: function(value) {
                                if (this._cache) {
                                    var original = (deflate) ? MSE.Data.deflate(this) : this;
                                    var fragments = MSE.Data.Property._getPropertyPathFragments(original, source);
                                    MSE.Data.Property._setFromPropertyPathFragments(original, fragments, value)
                                }
                            }, augmented: true, enumerable: true, configurable: true
                    };
                return property
            }, alias: function(source, defaultValue) {
                return MSE.Data.Property._alias(true, source, defaultValue)
            }, _convertOriginal: function _convertOriginal(deflate, source, initializerCallback, defaultValue) {
                if (!initializerCallback)
                    throw new Error("Invalid augument to convertOriginal. The given callback was null or undefined. Source = " + source);
                var property = MSE.Data.Property._alias(deflate, source, defaultValue);
                property.initializer = function initializer() {
                    var byPassDeflate = arguments[0];
                    var original = (deflate && !byPassDeflate) ? MSE.Data.deflateOrFail(this) : this;
                    var fragments = MSE.Data.Property._getPropertyPathFragments(original, source);
                    if (MSE.Data.Property._hasPropertyPathFragments(original, fragments))
                        initializerCallback(original, fragments, original, fragments);
                    else if (this._assertValueNotHydrated)
                        this._assertValueNotHydrated(property)
                };
                return property
            }, convertOriginal: function convertOriginal(source, callback, defaultValue) {
                return MSE.Data.Property._convertOriginal(true, source, callback, defaultValue)
            }, convertOriginalNoDeflate: function convertOriginalNoDeflate(source, callback, defaultValue) {
                return MSE.Data.Property._convertOriginal(false, source, callback, defaultValue)
            }, _convert: function _convert(deflate, source, parser, defaultValue, options) {
                if (!parser)
                    throw new Error("Invalid augument. The given parser was null or undefined. Source = " + source);
                var property = {
                        get: function() {
                            var result;
                            var byPassDeflate = arguments[0];
                            var original = (deflate && !byPassDeflate) ? MSE.Data.deflateOrFail(this) : this;
                            var fragments = MSE.Data.Property._getPropertyPathFragments(original, source);
                            var featureEnabled = MSE.Data.Property._getFeatureEnabled(options);
                            if (!featureEnabled)
                                result = MS.Entertainment.Data.Property._getDefaultValue(defaultValue);
                            else if (MSE.Data.Property._hasPropertyPathFragments(original, fragments))
                                result = parser(MSE.Data.Property._valueFromPropertyPathFragments(original, fragments));
                            else {
                                if (this._assertValueNotHydrated)
                                    this._assertValueNotHydrated(property);
                                result = MS.Entertainment.Data.Property._getDefaultValue(defaultValue)
                            }
                            return result
                        }, augmented: true, cacheable: true, enumerable: true, configurable: true
                    };
                return property
            }, convert: function convert(source, parser, defaultValue, options) {
                return MSE.Data.Property._convert(true, source, parser, defaultValue, options)
            }, convertNoDeflate: function(source, parser, defaultValue, options) {
                return MSE.Data.Property._convert(false, source, parser, defaultValue, options)
            }, _augment: function(deflate, source, augmentationOrFactory, defaultValue) {
                if (!augmentationOrFactory)
                    throw new Error("Invalid augument. The given augmentationOrFactory definition was null or undefined. Source = " + source);
                var itemFactory;
                if (!augmentationOrFactory || MSE.Data.Augmentation.prototype.isPrototypeOf(augmentationOrFactory.prototype))
                    itemFactory = MSE.Data.Factory.createAugmentationFactory(augmentationOrFactory);
                else
                    itemFactory = augmentationOrFactory;
                var property = {
                        get: function() {
                            var result;
                            var byPassDeflate = arguments[0];
                            var original = (deflate && !byPassDeflate) ? MSE.Data.deflateOrFail(this) : this;
                            var fragments = MSE.Data.Property._getPropertyPathFragments(original, source);
                            if (MSE.Data.Property._hasPropertyPathFragments(original, fragments)) {
                                original = MSE.Data.Property._valueFromPropertyPathFragments(original, fragments);
                                if (Array.isArray(original))
                                    result = MSE.Data.augmentArrayItems(original, itemFactory);
                                else
                                    result = itemFactory(original)
                            }
                            else {
                                if (this._assertValueNotHydrated)
                                    this._assertValueNotHydrated(property);
                                result = MS.Entertainment.Data.Property._getDefaultValue(defaultValue)
                            }
                            return result
                        }, augmented: true, cacheable: true, enumerable: true, configurable: true, augmentation: MSE.Data.Property._augment, augmentationOptions: {
                                deflate: deflate, source: source, augmentation: augmentationOrFactory, defaultValue: defaultValue
                            }
                    };
                return property
            }, augment: function(source, augmentation, defaultValue) {
                return MSE.Data.Property._augment(true, source, augmentation, defaultValue)
            }, augmentNoDeflate: function(source, augmentation, defaultValue) {
                return MSE.Data.Property._augment(false, source, augmentation, defaultValue)
            }, sortArray: function sortArray(source, comparer, augmentation, defaultValue) {
                var result = MSE.Data.Property.augment(source, augmentation, defaultValue);
                var oldGetter = result.get;
                if (!comparer)
                    throw new Error("Invalid augument. The given comparer was null or undefined. Comparer = " + comparer);
                return {
                        get: function() {
                            var result = oldGetter.apply(this);
                            if (Array.isArray(result))
                                result = result.sort(comparer);
                            return result
                        }, augmented: true, cacheable: true, enumerable: true, configurable: true
                    }
            }, format: function(source, stringId, defaultValue) {
                if (!stringId)
                    throw new Error("Invalid augument. The given stringId was null or undefined. Source = " + source);
                var property = {
                        get: function() {
                            var result = defaultValue;
                            var byPassDeflate = arguments[0];
                            var original = !byPassDeflate ? MSE.Data.deflateOrFail(this) : this;
                            var fragments = MSE.Data.Property._getPropertyPathFragments(original, source);
                            if (source === null)
                                result = String.load(stringId);
                            else if (MSE.Data.Property._hasPropertyPathFragments(original, fragments))
                                result = String.load(stringId).format(MSE.Data.Property._valueFromPropertyPathFragments(original, fragments));
                            else if (this._assertValueNotHydrated)
                                this._assertValueNotHydrated(property);
                            return result
                        }, augmented: true, cacheable: true, enumerable: true, configurable: true
                    };
                return property
            }, _collect: function _collect(deflate, sources, parser) {
                var property = {
                        get: function() {
                            var i,
                                currentParser,
                                fragments;
                            var result = [];
                            var byPassDeflate = arguments[0];
                            var original = (deflate && !byPassDeflate) ? MSE.Data.deflateOrFail(this) : this;
                            if (sources)
                                for (i = 0; i < sources.length; i += 1) {
                                    currentParser = (Array.isArray(parser)) ? parser[i] : parser;
                                    fragments = MSE.Data.Property._getPropertyPathFragments(original, sources[i]);
                                    if (MSE.Data.Property._hasPropertyPathFragments(original, fragments)) {
                                        var item = MSE.Data.Property._valueFromPropertyPathFragments(original, fragments);
                                        if (currentParser)
                                            item = currentParser(item);
                                        result.push(item)
                                    }
                                    else if (this._assertValueNotHydrated)
                                        this._assertValueNotHydrated(property)
                                }
                            return result
                        }, augmented: true, cacheable: true, enumerable: true, configurable: true
                    };
                return property
            }, collect: function collect(sources, parser) {
                return MS.Entertainment.Data.Property._collect(true, sources, parser)
            }, collectNoDeflate: function collectNoDeflate(sources, parser) {
                return MS.Entertainment.Data.Property._collect(false, sources, parser)
            }, filterArray: function filterArray(source, filter, itemAugmentation) {
                var property = MSE.Data.Property._filter(true, source, filter, itemAugmentation);
                property.resultConstructor = Array.prototype.constructor;
                var originalGet = property.get;
                property.get = function get() {
                    MS.Entertainment.Data.Property.copyHydrated(originalGet, property);
                    var list = originalGet.call(this);
                    var array = (list && list.source) ? list.source : [];
                    return MS.Entertainment.Data.augmentArrayItems(array, itemAugmentation)
                };
                return property
            }, _search: function _search(deflate, source, filter, defaultValue) {
                if (!source)
                    throw new Error("Invalid augument. The given source was null or undefined. Source = " + source);
                if (!filter)
                    throw new Error("Invalid augument. The given filter function was null or undefined. Filter = " + filter);
                var property = {
                        get: function() {
                            var i;
                            var result = null;
                            var byPassDeflate = arguments[0];
                            var original = (deflate && !byPassDeflate) ? MSE.Data.deflateOrFail(this) : this;
                            var fragments = MSE.Data.Property._getPropertyPathFragments(original, source);
                            if (MSE.Data.Property._hasPropertyPathFragments(original, fragments)) {
                                var sourceValue = MSE.Data.Property._valueFromPropertyPathFragments(original, fragments);
                                if (Array.isArray(sourceValue)) {
                                    for (i = 0; i < sourceValue.length; i++)
                                        if (!filter(sourceValue[i])) {
                                            result = sourceValue[i];
                                            break
                                        }
                                }
                                else if (!filter(sourceValue))
                                    result = sourceValue
                            }
                            else {
                                if (this._assertValueNotHydrated)
                                    this._assertValueNotHydrated(property);
                                result = MS.Entertainment.Data.Property._getDefaultValue(defaultValue)
                            }
                            return result
                        }, augmented: true, cacheable: true, enumerable: true, configurable: true
                    };
                return property
            }, search: function search(source, filter, defaultValue) {
                return MS.Entertainment.Data.Property._search(true, source, filter, defaultValue)
            }, searchNoDeflate: function search(source, filter, defaultValue) {
                return MS.Entertainment.Data.Property._search(false, source, filter, defaultValue)
            }, isList: function isList(augmentation) {
                return augmentation && augmentation.resultConstructor === MSE.Data.VirtualList.prototype.constructor
            }, createAugmentation: function createAugmentation(original, optionOverrides) {
                var result = null;
                var key;
                var augmentationOptions;
                if (original && original.augmentation && original.augmentationOptions) {
                    optionOverrides = optionOverrides || {};
                    augmentationOptions = [];
                    for (key in original.augmentationOptions)
                        if (key in optionOverrides)
                            augmentationOptions.push(optionOverrides[key]);
                        else
                            augmentationOptions.push(original.augmentationOptions[key]);
                    result = original.augmentation.apply(this, augmentationOptions)
                }
                return result
            }, list: function(source, itemAugmentationOrFactory, defaultValue) {
                var itemFactory;
                if (!itemAugmentationOrFactory || MSE.Data.Augmentation.prototype.isPrototypeOf(itemAugmentationOrFactory.prototype))
                    itemFactory = MSE.Data.Factory.createAugmentationFactory(itemAugmentationOrFactory);
                else
                    itemFactory = itemAugmentationOrFactory;
                var property = {
                        get: function() {
                            var result = MS.Entertainment.Data.Property._getDefaultValue(defaultValue);
                            var byPassDeflate = arguments[0];
                            var original = !byPassDeflate ? MSE.Data.deflateOrFail(this) : this;
                            var fragments = MSE.Data.Property._getPropertyPathFragments(original, source);
                            if (MSE.Data.Property._hasPropertyPathFragments(original, fragments)) {
                                result = MSE.Data.Property._valueFromPropertyPathFragments(original, fragments);
                                result = new MSE.Data.VirtualList(itemFactory, result)
                            }
                            else if (this._assertValueNotHydrated)
                                this._assertValueNotHydrated(property);
                            return result
                        }, augmented: true, cacheable: true, enumerable: true, configurable: true, resultConstructor: MSE.Data.VirtualList.prototype.constructor, augmentation: MSE.Data.Property.list, augmentationOptions: {
                                source: source, itemAugmentationOrFactory: itemAugmentationOrFactory, defaultValue: defaultValue
                            }
                    };
                return property
            }, listWithContext: function listWithContext(source, context, itemAugmentationOrFactory, defaultValue) {
                var innerItemFactory;
                if (!itemAugmentationOrFactory || MSE.Data.Augmentation.prototype.isPrototypeOf(itemAugmentationOrFactory.prototype))
                    innerItemFactory = MSE.Data.Factory.createAugmentationFactory(itemAugmentationOrFactory);
                else
                    innerItemFactory = itemAugmentationOrFactory;
                var property = MSE.Data.Property.list(source, itemAugmentationOrFactory, defaultValue);
                var oldGetter = property.get;
                property.get = function() {
                    var result = oldGetter.apply(this, arguments);
                    var byPassDeflate = arguments[0];
                    var original = !byPassDeflate ? MSE.Data.deflateOrFail(this) : this;
                    var contextFragments = MSE.Data.Property._getPropertyPathFragments(original, context);
                    if (MSE.Data.Property._hasPropertyPathFragments(original, contextFragments)) {
                        var contextValue = MSE.Data.Property._valueFromPropertyPathFragments(original, contextFragments);
                        var itemFactoryWithContext = function itemFactoryWithContext(sourceItem) {
                                return innerItemFactory(sourceItem, contextValue)
                            };
                        itemFactoryWithContext.listItemFactory = innerItemFactory.listItemFactory;
                        result.setItemFactory(itemFactoryWithContext)
                    }
                    return result
                };
                property.augmentation = MSE.Data.Property.listWithContext,
                property.augmentationOptions = {
                    source: source, context: context, itemAugmentationOrFactory: itemAugmentationOrFactory, defaultValue: defaultValue
                };
                return property
            }, _union: function(deflate, source1, source2, comparer, merger, itemAugmentationOrFactory) {
                var itemFactory;
                if (!itemAugmentationOrFactory || MSE.Data.Augmentation.prototype.isPrototypeOf(itemAugmentationOrFactory.prototype))
                    itemFactory = MSE.Data.Factory.createAugmentationFactory(itemAugmentationOrFactory);
                else
                    itemFactory = itemAugmentationOrFactory;
                comparer = comparer || MS.Entertainment.Data.Comparer.defaultComparer;
                merger = merger || MS.Entertainment.Data.Merger.defaultMerger;
                var property = {
                        get: function union() {
                            var byPassDeflate = arguments[0];
                            var original = (deflate && !byPassDeflate) ? MSE.Data.deflateOrFail(this) : this;
                            var fragments1 = MSE.Data.Property._getPropertyPathFragments(original, source1);
                            var fragments2 = MSE.Data.Property._getPropertyPathFragments(original, source2);
                            var array1 = source1 !== undefined ? MSE.Data.Property._getArray(original, fragments1) : [];
                            var array2 = source2 !== undefined ? MSE.Data.Property._getArray(original, fragments2) : [];
                            var array1Length = array1.length;
                            var array2Length = array2.length;
                            var empty,
                                item1,
                                item2;
                            var combinedArray = [];
                            var i = 0,
                                j = 0;
                            array1 = array1.data;
                            array2 = array2.data;
                            while ((i < array1Length || j < array2Length) && (i <= array1Length && j <= array2Length)) {
                                item1 = (i < array1Length) ? array1[i] : empty;
                                item2 = (j < array2Length) ? array2[j] : empty;
                                var compareResult = comparer(item1, item2);
                                var mergedResult = null;
                                if (compareResult === 0) {
                                    mergedResult = merger(item1, item2);
                                    i++;
                                    j++
                                }
                                else if (compareResult < 0) {
                                    mergedResult = merger(item1);
                                    i++
                                }
                                else if (!isNaN(compareResult)) {
                                    mergedResult = merger(empty, item2);
                                    j++
                                }
                                else {
                                    if (i < array1Length)
                                        i++;
                                    {};
                                    if (j < array2Length)
                                        j++;
                                    {}
                                }
                                if (mergedResult !== null && mergedResult !== undefined)
                                    combinedArray.push(mergedResult)
                            }
                            return new MSE.Data.VirtualList(itemFactory, combinedArray)
                        }, augmented: true, cacheable: true, enumerable: true, configurable: true, resultConstructor: MSE.Data.VirtualList.prototype.constructor
                    };
                return property
            }, union: function(source1, source2, comparer, merger, itemAugmentationOrFactory) {
                var result = MSE.Data.Property._union(true, source1, source2, comparer, merger, itemAugmentationOrFactory);
                result.augmentation = MSE.Data.Property.union;
                result.augmentationOptions = {
                    source1: source1, source2: source2, comparer: comparer, merger: merger, itemAugmentationOrFactory: itemAugmentationOrFactory
                };
                return result
            }, unionNoDeflate: function(source1, source2, comparer, merger, itemAugmentationOrFactory) {
                var result = MSE.Data.Property._union(false, source1, source2, comparer, merger, itemAugmentationOrFactory);
                result.augmentation = MSE.Data.Property.unionNoDeflate;
                result.augmentationOptions = {
                    source1: source1, source2: source2, comparer: comparer, merger: merger, itemAugmentationOrFactory: itemAugmentationOrFactory
                };
                return result
            }, intersection: function(source1, source2, comparer, merger, itemAugmentationOrFactory) {
                var itemFactory;
                if (!itemAugmentationOrFactory || MSE.Data.Augmentation.prototype.isPrototypeOf(itemAugmentationOrFactory.prototype))
                    itemFactory = MSE.Data.Factory.createAugmentationFactory(itemAugmentationOrFactory);
                else
                    itemFactory = itemAugmentationOrFactory;
                comparer = comparer || MS.Entertainment.Data.Comparer.defaultComparer;
                merger = merger || MS.Entertainment.Data.Merger.defaultMerger;
                var property = {
                        get: function intersection() {
                            var original = MSE.Data.deflate(this);
                            var fragments1 = MSE.Data.Property._getPropertyPathFragments(original, source1);
                            var fragments2 = MSE.Data.Property._getPropertyPathFragments(original, source2);
                            var array1 = MSE.Data.Property._getArray(original, fragments1);
                            var array2 = MSE.Data.Property._getArray(original, fragments2);
                            var array1Length = array1.length;
                            var array2Length = array2.length;
                            var combinedArray = [];
                            var i = 0,
                                j = 0;
                            var empty,
                                item1,
                                item2;
                            array1 = array1.data;
                            array2 = array2.data;
                            while ((i < array1Length || j < array2Length) && (i <= array1Length && j <= array2Length)) {
                                item1 = (i < array1Length) ? array1[i] : empty;
                                item2 = (j < array2Length) ? array2[j] : empty;
                                var compareResult = comparer(item1, item2);
                                var mergedResult = null;
                                if (compareResult === 0) {
                                    mergedResult = merger(item1, item2);
                                    i++;
                                    j++
                                }
                                else if (compareResult < 0)
                                    i++;
                                else
                                    j++;
                                if (mergedResult !== null && mergedResult !== undefined)
                                    combinedArray.push(mergedResult)
                            }
                            return new MSE.Data.VirtualList(itemFactory, combinedArray)
                        }, augmented: true, cacheable: true, enumerable: true, configurable: true, resultConstructor: MSE.Data.VirtualList.prototype.constructor, augmentation: MSE.Data.Property.list, augmentationOptions: {
                                source1: source1, source2: source2, comparer: comparer, merger: merger, itemAugmentationOrFactory: itemAugmentationOrFactory
                            }
                    };
                return property
            }, _filter: function _filter(deflate, source, filter, itemAugmentationOrFactory) {
                var merger = MS.Entertainment.Data.Merger.self;
                var comparer = MS.Entertainment.Data.Comparer.createFilterComparer(filter);
                var undefinedVariable;
                return MSE.Data.Property._union(deflate, source, undefinedVariable, comparer, merger, itemAugmentationOrFactory)
            }, filter: function filter(source, filter, itemAugmentationOrFactory) {
                var result = MSE.Data.Property._filter(true, source, filter, itemAugmentationOrFactory);
                result.augmentation = MSE.Data.Property.filter;
                result.augmentationOptions = {
                    source: source, filter: filter, itemAugmentationOrFactory: itemAugmentationOrFactory
                };
                return result
            }, filterNoDeflate: function filterNoDeflate(source, filter, itemAugmentationOrFactory) {
                var result = MSE.Data.Property._filter(false, source, filter, itemAugmentationOrFactory);
                result.augmentation = MSE.Data.Property.filterNoDeflate;
                result.augmentationOptions = {
                    source: source, filter: filter, itemAugmentationOrFactory: itemAugmentationOrFactory
                };
                return result
            }, containsRight: function containsRight(right) {
                var property = {
                        get: function() {
                            if (this.rights)
                                for (var i = 0; i < this.rights.length; i++)
                                    if (this.rights[i].licenseRight === right)
                                        return true;
                            return false
                        }, augmented: true, cacheable: true, enumerable: true, configurable: true
                    };
                return property
            }
    });
    WinJS.Namespace.defineWithParent(MSE.Data, "Factory", {
        array: function(data) {
            if (data !== undefined)
                return [data];
            else
                return []
        }, arrayJoin: function arrayJoin(data, seperator) {
                seperator = seperator || "/";
                var result = String.empty;
                if (Array.isArray(data)) {
                    data = data.filter(function removeNullsAndNonStrings(element) {
                        return element !== null && element !== undefined && typeof element === "string"
                    });
                    result = data.join(seperator)
                }
                return result
            }, arrayJoinWithNewLines: function arrayJoinWithNewLines(data) {
                return MSE.Data.Factory.arrayJoin(data, "\n\n")
            }, bool: function bool(data) {
                return (data) ? true : false
            }, not: function not(data) {
                return (!data) ? true : false
            }, boolFromString: function boolFromString(data) {
                var re = /^((t)|(true)|(1)|(y)|(yes))$/i;
                var type = typeof(data);
                if (type === "boolean")
                    return data;
                else
                    return (data && typeof(data) === "string" && data.match(re)) ? true : false
            }, string: function string(data) {
                return (data) ? "" + data : null
            }, stringNoNewLines: function stringNoNewLines(data) {
                if (data) {
                    data = "" + data;
                    data = data.replace(/(\r\n)|(\r)|(\n)/g, " ")
                }
                {};
                return data
            }, stringOrEmpty: function stringOrEmpty(data) {
                if (typeof data === "string")
                    return data;
                else
                    return ""
            }, stringOrUnknown: function stringOrUnknown(data) {
                var result = MS.Entertainment.Data.Factory.string(data);
                return result || String.load(String.id.IDS_UNKNOWN_VALUE)
            }, intNumber: function intNumber(data) {
                return parseInt(data)
            }, formattedIntNumber: function formattedIntNumber(data) {
                var intValue = parseInt(data);
                var formattedNum = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber.format(intValue);
                return formattedNum
            }, floatNumber: function floatNumber(data) {
                return parseFloat(data)
            }, date: function date(data) {
                var returnValue;
                if (!data)
                    returnValue = null;
                else if (data.constructor === Date)
                    returnValue = new Date(data);
                else if (data.constructor === String) {
                    var matches = data.match(/^\/Date\((-{0,1}[0-9]*)(\+|-){0,1}([0-9]{4}){0,1}\)\/$/);
                    if (matches && matches[1]) {
                        returnValue = new Date(parseInt(matches[1]));
                        if (matches[2] && matches[3])
                            if (matches[2] === "+")
                                returnValue.setUTCHours(returnValue.getUTCHours() - parseInt(matches[3]));
                            else
                                returnValue.setUTCHours(returnValue.getUTCHours() + parseInt(matches[3]))
                    }
                    else
                        returnValue = MSE.Data.stringParser.dateFromUTC(data)
                }
                else if (data.universalTime !== undefined)
                    returnValue = new Date(data.universalTime);
                else
                    returnValue = null;
                return returnValue
            }, dateNow: function dateNow() {
                return new Date
            }, databaseDate: function databaseDate(data) {
                var returnValue;
                if (!data || (data.constructor === String && data === "0001-01-01T00:00:00.000Z"))
                    returnValue = null;
                else
                    returnValue = MSE.Data.Factory.date(data);
                return returnValue
            }, secondsToMilliseconds: function secondsToMilliseconds(data) {
                return parseInt(data) * 1000
            }, year: function year(data) {
                var resultValue = null;
                if (!data)
                    resultValue = null;
                else if (data.constructor === Date)
                    resultValue = data.getFullYear();
                else
                    resultValue = data;
                return resultValue
            }, localizedYear: function localizedYear(date) {
                var year = String.empty;
                var yearNumber = NaN;
                if (date && date.constructor !== Date) {
                    if (String.isString(date))
                        yearNumber = parseInt(date);
                    if (isNaN(yearNumber))
                        date = new Date(date);
                    else {
                        date = new Date;
                        date.setFullYear(yearNumber)
                    }
                }
                if (date && !isNaN(date.getTime())) {
                    var formattedYear = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).year;
                    year = formattedYear.format(date)
                }
                return year
            }, randomDate: function randomDate(data) {
                var daysBefore = Math.floor(Math.random() * 9 + 1);
                var daysBeforeMS = daysBefore * 24 * 60 * 60 * 1000;
                var returnValue = new Date((new Date).getTime() - daysBeforeMS);
                returnValue.setMilliseconds(0);
                returnValue.setSeconds(0);
                returnValue.setMinutes(0);
                returnValue.setHours(0);
                return returnValue
            }, timeSpan: function timeSpan(data) {
                var returnValue;
                if (typeof data === "string")
                    returnValue = MSE.Data.stringParser.timeSpanFromXmlDuration(data);
                return returnValue
            }, gamesNextPageParam: function gamesNextPageParam(data) {
                var returnValue;
                if (typeof data === "object" && data.name && data.next)
                    returnValue = data.name + "=" + data.next;
                return returnValue
            }, gamesPreviousPageParam: function gamesPreviousPageParam(data) {
                var returnValue;
                if (typeof data === "object" && data.name && data.previous)
                    returnValue = data.name + "=" + data.previous;
                return returnValue
            }, guid: function guid(data) {
                if (data && data.replace && data.toLowerCase) {
                    data = data.toLowerCase();
                    data = data.replace(/(^http.*%2f)|(^urn:uuid:)|(^\s)|(\s$)/ig, String.empty)
                }
                return data
            }, normalizeSpacing: function normalizeSpacing(source) {
                if (source)
                    source = (source + "").trim().replace(/(\s+)/g, " ");
                return source
            }, normalizeTextDirection: function normalizeTextDirection(source, sourcePropertyPath, destination, destinationPropertyPath) {
                var newString;
                var oldString = MSE.Data.Property._valueFromPropertyPathFragments(source, sourcePropertyPath);
                if (oldString) {
                    var appTextDirection = MSE.Utilities.getTextDirection();
                    var dataTextDirection = MSE.Utilities.detectStringDirection(oldString);
                    if (appTextDirection !== dataTextDirection) {
                        var directionMarkerCharacter = (dataTextDirection === MSE.Utilities.TextDirections.RightToLeft) ? String.rtlm : String.ltrm;
                        var firstCharacterDirection = MSE.Utilities.detectCharacterDirection(oldString.charCodeAt(0));
                        if (!firstCharacterDirection)
                            newString = [directionMarkerCharacter, oldString, directionMarkerCharacter].join(String.empty);
                        else
                            newString = oldString + directionMarkerCharacter
                    }
                }
                if (newString)
                    MSE.Data.Property._setFromPropertyPathFragments(destination, destinationPropertyPath, newString)
            }, oneTimeUseBlob: function oneTimeUseBlob(data) {
                var resultValue = null;
                if (data)
                    resultValue = URL.createObjectURL(data, {oneTimeOnly: true});
                return resultValue
            }, self: function self(data) {
                return data
            }, ListItemWrapper: WinJS.Class.define(function listItemWrapper(source, factory, initializer) {
                Object.defineProperty(this, "_privateDataCache", {
                    value: {
                        source: source, factory: factory, initializer: initializer, group: null, isNonSourceData: false, isHeader: false, itemIndex: -1, groupIndexHint: null, groupKey: null, firstItemDescription: null
                    }, enumerable: false
                })
            }, {
                key: null, data: {get: function() {
                            if (this._privateDataCache.factory) {
                                this._privateDataCache.data = this._privateDataCache.factory(this._privateDataCache.source);
                                if (this._privateDataCache.initializer)
                                    this._privateDataCache.initializer(this._source, this._privateData);
                                this._privateDataCache.initializer = null;
                                this._privateDataCache.source = null;
                                this._privateDataCache.factory = null
                            }
                            return this._privateDataCache.data
                        }}, itemIndex: {
                        get: function() {
                            return this._privateDataCache.itemIndex
                        }, set: function(value) {
                                this._privateDataCache.itemIndex = value
                            }, enumerable: false
                    }, firstItemDescription: {
                        get: function() {
                            return this._privateDataCache.firstItemDescription || {sourceIndexHint: this.data && typeof this.data.firstItemIndexSourceHint === "number" ? this.data.firstItemIndexSourceHint : -1}
                        }, set: function(value) {
                                this._privateDataCache.firstItemDescription = value
                            }, enumerable: false
                    }, groupIndexHint: {
                        get: function() {
                            return this._privateDataCache.groupIndexHint
                        }, set: function(value) {
                                this._privateDataCache.groupIndexHint = value
                            }, enumerable: false
                    }, groupKey: {
                        get: function() {
                            return this._privateDataCache.groupKey || (this.group && this.group.parentKey)
                        }, set: function(value) {
                                this._privateDataCache.groupKey = value
                            }, enumerable: false
                    }, isNonSourceData: {
                        get: function() {
                            return this._privateDataCache.isNonSourceData
                        }, set: function(value) {
                                this._privateDataCache.isNonSourceData = value
                            }, enumerable: false
                    }, isHeader: {
                        get: function() {
                            return this._privateDataCache.isHeader
                        }, set: function(value) {
                                this._privateDataCache.isHeader = value
                            }, enumerable: false
                    }, group: {
                        get: function() {
                            return this._privateDataCache.group
                        }, set: function(value) {
                                this._privateDataCache.group = value
                            }, enumerable: false
                    }, cached: {
                        get: function() {
                            return !!this._privateDataCache.data || !!this._privateDataCache.factory
                        }, enumerable: false
                    }, clearCache: function clearCache() {
                        this._privateDataCache.data = null;
                        this._privateDataCache.initializer = null;
                        this._privateDataCache.source = null;
                        this._privateDataCache.factory = null
                    }
            }, {
                copyData: function copyData(destination, source, factory, initializer) {
                    destination._privateDataCache.data = null;
                    destination._privateDataCache.source = source;
                    destination._privateDataCache.factory = factory;
                    destination._privateDataCache.initializer = initializer;
                    return destination
                }, addFirstItemIndexHint: function addFirstItemIndexHint(item, callback) {
                        if (callback)
                            Object.defineProperty(item, "firstItemIndexHint", {
                                get: function() {
                                    return callback()
                                }, enumerable: false
                            })
                    }
            })
    });
    WinJS.Namespace.defineWithParent(MSE.Data, "Factory", {
        GroupHintWrapper: WinJS.Class.derive(MSE.Data.Factory.ListItemWrapper, function groupHintWrapper(source, factory, initializer) {
            MSE.Data.Factory.ListItemWrapper.prototype.constructor.apply(this, arguments)
        }, {getHashCode: function getHashCode() {
                return this.data && this.data.groupKey
            }}), ListHeaderWrapper: WinJS.Class.derive(MSE.Data.Factory.ListItemWrapper, function listHeaderWrapper(group) {
                MSE.Data.Factory.ListItemWrapper.prototype.constructor.call(this);
                this._privateDataCache.data = group.data;
                this.group = group;
                this.isNonSourceData = true;
                this.isHeader = true
            }, {preventAugmentation: true}), ListActionItemWrapper: WinJS.Class.derive(MSE.Data.Factory.ListItemWrapper, function listHeaderWrapper(data) {
                MSE.Data.Factory.ListItemWrapper.prototype.constructor.call(this);
                this._privateDataCache.data = data;
                this.isNonSourceData = true;
                this.groupKey = MS.Entertainment.Data.emptyGroupKey;
                this.groupIndexHint = 0
            }, {
                isAction: true, preventAugmentation: true
            }), ListNoHeaderItemWrapper: WinJS.Class.derive(MSE.Data.Factory.ListItemWrapper, function listNoHeaderItemWrapper(data) {
                MSE.Data.Factory.ListItemWrapper.prototype.constructor.call(this);
                this._privateDataCache.data = data;
                this.isNonSourceData = true;
                this.groupKey = MS.Entertainment.Data.emptyGroupKey;
                this.groupIndexHint = 0
            }, {
                noHeader: true, preventAugmentation: true
            }), createAugmentationFactory: function createAugmentationFactory(augmentation) {
                return function augmentationFactory(sourceItem) {
                        return MSE.Data.augment(sourceItem, augmentation)
                    }
            }, createDerivedAugmentationOrFactory: function createDerivedAugmentationOrFactory(augmentationOrFactory, definition) {
                var result;
                if (!augmentationOrFactory || MSE.Data.Augmentation.prototype.isPrototypeOf(augmentationOrFactory.prototype))
                    result = MS.Entertainment.Data.derive(augmentationOrFactory || null, null, definition);
                else
                    result = function augmentationFactory(sourceItem) {
                        var value = augmentationOrFactory(sourceItem);
                        return MS.Entertainment.Data.Augmentation.addProperties(value, definition)
                    };
                return result
            }, createListItemAugmentationFactory: function createListItemAugmentationFactory(augmentation, initializer, ListItemWrapperConstructor) {
                return MSE.Data.Factory.createListItemFactory(MSE.Data.Factory.createAugmentationFactory(augmentation), initializer, ListItemWrapperConstructor)
            }, createListItemFactory: function createListItemFactory(innerFactory, initializer, ListItemWrapperConstructor) {
                if (!innerFactory)
                    throw"must provide an inner factory if creating a lazy factory method";
                var factory = function factoryMethod(source, destination) {
                        if (source && source.preventAugmentation)
                            return source;
                        else if (destination)
                            return MS.Entertainment.Data.Factory.ListItemWrapper.copyData(destination, source, innerFactory, initializer);
                        else if (ListItemWrapperConstructor)
                            return new ListItemWrapperConstructor(source, innerFactory, initializer);
                        else
                            return new MS.Entertainment.Data.Factory.ListItemWrapper(source, innerFactory, initializer)
                    };
                factory.listItemFactory = true;
                return factory
            }
    })
})()
