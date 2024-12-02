/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/debug.js", "/Framework/stringids.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Framework");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Utilities");
(function() {
    if (String['load'])
        throw"String function already has a load function defined";
    else if (String.prototype['format'])
        throw"String prototype already has a format function defined";
    if (!String.empty)
        Object.defineProperty(String, "empty", {
            value: "", writable: false, enumerable: true
        });
    if (!String.isString)
        Object.defineProperty(String, "isString", {
            value: function(value) {
                return typeof value === "string"
            }, writable: false, enumerable: true
        });
    if (!String.nbsp)
        Object.defineProperty(String, "nbsp", {
            value: "\u00A0", writable: false, enumerable: true
        });
    if (!String.ltrm)
        Object.defineProperty(String, "ltrm", {
            value: "\u200E", writable: false, enumerable: true
        });
    if (!String.ltrmCode)
        Object.defineProperty(String, "ltrmCode", {
            value: 0x200E, writable: false, enumerable: true
        });
    if (!String.rtlm)
        Object.defineProperty(String, "rtlm", {
            value: "\u200F", writable: false, enumerable: true
        });
    if (!String.rtlmCode)
        Object.defineProperty(String, "rtlmCode", {
            value: 0x200F, writable: false, enumerable: true
        });
    var resourceLoader;
    try {
        resourceLoader = new Windows.ApplicationModel.Resources.ResourceLoader
    }
    catch(err) {
        MS.Entertainment.fail("Windows.ApplicationModel.Resources.ResourceLoader failed with error: " + err)
    }
    String.load = function loadString(stringId) {
        if (!resourceLoader)
            return String.empty;
        MS.Entertainment.assert(stringId, "Can't find stringId: '" + stringId + "'");
        var loadedString = resourceLoader.getString(stringId);
        MS.Entertainment.assert(loadedString, "String lookup failed: '" + stringId + "'");
        return loadedString
    }
})();
String.prototype.format = function formatString() {
    var argumentList = arguments;
    var matchNum = this.match(/{(\d+)}/g);
    if (!matchNum) {
        MS.Entertainment.assert(false, "string value, '" + this.toString() + "', has no placeholders to allow for replacement");
        return this.toString()
    }
    if (matchNum.length !== argumentList.length) {
        MS.Entertainment.assert(false, "Incorrect number of arguments passed into format function. String: {0} Expected: {1}; Received: {2}".format(this.toString(), matchNum.length, argumentList.length));
        return String.empty
    }
    return this.replace(/{(\d+)}/g, function(placeholder, index) {
            return argumentList[index] !== undefined ? argumentList[index] : placeholder
        })
};
(function() {
    var secondMS = 1000;
    var minuteMS = 60 * secondMS;
    var hourMS = 60 * minuteMS;
    var dayMS = 24 * hourMS;
    Date.minValue = new Date(0);
    Date.getTimeUTC = function toUTC(date) {
        return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())
    },
    Date.subtract = function subtract(date1, date2) {
        var delta = Date.getTimeUTC(date1) - Date.getTimeUTC(date2);
        var result = {
                days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0
            };
        result.days = Math.floor(delta / dayMS);
        delta = delta - (result.days * dayMS);
        result.hours = Math.floor(delta / hourMS);
        delta = delta - (result.hours * hourMS);
        result.minutes = Math.floor(delta / minuteMS);
        delta = delta - (result.minutes * minuteMS);
        result.seconds = Math.floor(delta / secondMS);
        delta = delta - (result.seconds * secondMS);
        result.milliseconds = delta;
        return result
    };
    function getNewConstructorFunction() {
        return function() {
                if (this === window)
                    throw new Error("Need to use 'new' to invoke the constructor");
                this.base()
            }
    }
    WinJS.Namespace.define("MS.Entertainment", {derive: function derive(baseClass, constructor, instanceMembers, staticMembers) {
            if (!constructor)
                constructor = getNewConstructorFunction();
            if (instanceMembers.base)
                throw"Deriving requires that there is no existing 'base' property";
            var localInstanceMembers = MS.Entertainment.UI.Framework.markFunctionsOfObjectAsSupportedForProcessing(instanceMembers);
            var helperConstructor = function(){};
            if (baseClass.prototype._initObservable && !baseClass.prototype._preventObservableInheritance) {
                localInstanceMembers = WinJS.Binding.expandProperties(instanceMembers);
                helperConstructor = function() {
                    MS.Entertainment.assert(this._backingData, "We thought this was observable. It's not, reconsider...");
                    for (var member in instanceMembers)
                        if (instanceMembers.hasOwnProperty(member))
                            this._backingData[member] = instanceMembers[member]
                }
            }
            var baseConstructors = [function() {
                        baseClass.prototype.constructor.apply(this, arguments);
                        helperConstructor.call(this)
                    }];
            if (baseClass.prototype._baseConstructors)
                baseConstructors = baseClass.prototype._baseConstructors.concat(baseConstructors);
            localInstanceMembers._baseConstructors = baseConstructors;
            localInstanceMembers.base = function() {
                if (this._baseConstructors === baseConstructors)
                    this._baseConstructors = this._baseConstructors.concat();
                var baseConstructor = this._baseConstructors.pop();
                if (baseConstructor)
                    baseConstructor.apply(this, arguments)
            };
            return WinJS.Class.derive(baseClass, constructor, localInstanceMembers, MS.Entertainment.UI.Framework.markFunctionsOfObjectAsSupportedForProcessing(staticMembers))
        }})
})();
WinJS.Namespace.define("MS.Entertainment", {defineObservable: function(constructor, instanceMembers, staticMembers) {
        return WinJS.Class.derive(WinJS.Binding.define(instanceMembers), function defineObservableConstructor() {
                this._initObservable(Object.create(MS.Entertainment.UI.Framework.markFunctionsOfObjectAsSupportedForProcessing(instanceMembers)));
                constructor.apply(this, arguments)
            }, null, MS.Entertainment.UI.Framework.markFunctionsOfObjectAsSupportedForProcessing(staticMembers))
    }});
WinJS.Namespace.define("MS.Entertainment", {defineOptionalObservable: function(constructor, instanceMembers, observableMembers, staticMembers) {
        return WinJS.Class.derive(WinJS.Binding.define(observableMembers), function defineOptionalObservableConstructor() {
                if (this === window)
                    throw new Error("Need to use 'new' to invoke the constructor");
                if (observableMembers)
                    this._initObservable(Object.create(observableMembers));
                constructor.apply(this, arguments)
            }, instanceMembers, MS.Entertainment.UI.Framework.markFunctionsOfObjectAsSupportedForProcessing(staticMembers))
    }});
WinJS.Namespace.define("MS.Entertainment", {isCanceled: function(error) {
        return (error && error.name === "Canceled")
    }});
WinJS.Namespace.define("MS.Entertainment.Utilities", {EventSource: WinJS.Class.define(function eventSource() {
        this._eventhandlers = [];
        this._eventSource = new MS.Entertainment.UI.Framework.ObservableBase
    }, {
        _eventSource: null, _eventhandlers: null, addEventHandlers: function addEventHandlers(events) {
                MS.Entertainment.UI.assert(!Array.isArray(events), "Events passed in cannot be an array");
                var eventHandlers;
                eventHandlers = MS.Entertainment.Utilities.addEventHandlers(this._eventSource, events);
                this._eventhandlers.push(eventHandlers);
                return eventHandlers
            }, dispose: function dispose() {
                for (var i = 0; i < this._eventhandlers.length; i++)
                    this._eventhandlers[i].cancel();
                this._eventhandlers = []
            }, dispatchEvent: function dispatchEvent(eventName, parameters) {
                this._eventSource.dispatchEvent(eventName, parameters)
            }
    })});
WinJS.Namespace.define("MS.Entertainment", {ProxyHelpers: WinJS.Class.define(null, {}, {
        proxyObservables: function(outerObject, innerObject, observables) {
            observables.forEach(function(observable) {
                var externalSet = function(v) {
                        var oldValue = outerObject[observable];
                        outerObject.setProperty(observable, v);
                        if (outerObject.dispatchEvent)
                            outerObject.dispatchEvent(observable + "Changed", {
                                newValue: v, oldValue: oldValue
                            })
                    };
                innerObject.bind(observable, externalSet);
                Object.defineProperty(outerObject, observable, {
                    set: function(v) {
                        innerObject[observable] = v
                    }, get: function() {
                            return innerObject[observable]
                        }, enumerable: true, configurable: false
                })
            })
        }, proxyProperties: function(outerObject, innerObject, properties) {
                properties.forEach(function(property) {
                    Object.defineProperty(outerObject, property, {
                        set: function(v) {
                            innerObject[property] = v
                        }, get: function() {
                                return innerObject[property]
                            }, enumerable: true, configurable: false
                    })
                })
            }, delegateFunctions: function(outerObject, innerObject, methods) {
                methods.forEach(function(method) {
                    Object.defineProperty(outerObject, method, {
                        value: function() {
                            return innerObject[method].apply(innerObject, arguments)
                        }, enumerable: true, configurable: false
                    })
                })
            }
    })});
(function() {
    WinJS.Namespace.define("MS.Entertainment.Utilities", {
        bindWorker: MS.Entertainment.UI.Framework.bindWorker, weakElementBindingInitializer: MS.Entertainment.UI.Framework.weakElementBindingInitializer, checkIfInDom: MS.Entertainment.UI.Framework.checkIfInDom, forceFullLayout: MS.Entertainment.UI.Framework.forceFullLayout, thawControlsInSubtree: MS.Entertainment.UI.Framework.thawControlsInSubtree, freezeControlsInSubtree: MS.Entertainment.UI.Framework.freezeControlsInSubtree, empty: MS.Entertainment.UI.Framework.empty, addEventHandlers: MS.Entertainment.UI.Framework.addEventHandlers, removeEvents: MS.Entertainment.UI.Framework.removeEvents
    });
    WinJS.Namespace.define("MS.Entertainment.Utilities", {
        EventInvoker: WinJS.Class.mix(function() {
            this._initObservable()
        }, WinJS.Utilities.eventMixin, WinJS.Binding.mixin), validateIsMemberOrThrow: function validateIsMemberOrThrow(value, object) {
                var member = "";
                for (member in object)
                    if (object.hasOwnProperty(member) && value === object[member])
                        return;
                throw"validateIsMemberOrThrow: Value not found in object.";
            }, loadHtmlPage: function loadHtmlPage(filePath, targetElement, dataContext) {
                MS.Entertainment.Utilities.assert(targetElement, "No destination element was passed");
                var container;
                var load;
                return WinJS.UI.Fragments.renderCopy(filePath).then(function placeHtmlPageInDom(fragment) {
                        var loadName;
                        var loadTags;
                        if (typeof targetElement === "string")
                            container = document.getElementById(targetElement);
                        else
                            container = targetElement;
                        MS.Entertainment.Utilities.assert(container, "Page container supplied couldn't be found");
                        MS.Entertainment.Utilities.empty(container);
                        loadTags = fragment.querySelectorAll("[data-ent-fragmentLoad]");
                        if (loadTags && loadTags.length > 0)
                            for (var i = 0, l = loadTags.length; i < l; i++)
                                if (loadTags[i].nodeName !== "BODY") {
                                    loadName = loadTags[i].getAttribute("data-ent-fragmentLoad");
                                    break
                                }
                        if (loadName) {
                            load = WinJS.Utilities.getMember(loadName);
                            MS.Entertainment.Utilities.assert(load, "Load function was not located: " + loadName)
                        }
                        container.appendChild(fragment)
                    }).then(function waitOnData() {
                        return dataContext
                    }).then(function(data) {
                        dataContext = data;
                        return WinJS.UI.processAll(container)
                    }).then(function() {
                        return WinJS.Binding.processAll(container, dataContext)
                    }).then(function callCallbacks() {
                        if (load)
                            load(container.children[0])
                    })
            }, processAllOnDocumentLoaded: function processAllOnDocumentLoaded(element) {
                return WinJS.Utilities.ready().then(function processAllAfterDocumentReady() {
                        return WinJS.UI.processAll(element)
                    }).then(function bindingProcessAllAfterControlProcessAll() {
                        return WinJS.Binding.processAll(element)
                    })
            }, enterRestrictedBackground: function enterRestrictedBackground() {
                var navigatonService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                navigatonService.clearAllNavigationState();
                WinJS.Promise.timeout(MS.Entertainment.UI.Framework.autoCleanupTimeout + 100).then(function() {
                    MS.Entertainment.UI.Framework.clearCaches();
                    MS.Entertainment.ServiceLocator.cleanupNonCriticalServices();
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isInRestrictedBackground = true
                })
            }, leaveRestrictedBackground: function leaveRestrictedBackground() {
                MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isInRestrictedBackground = false;
                MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigateToDefaultPage()
            }, multiStateToggleClassName: MS.Entertainment.Utilities.weakElementBindingInitializer(function multiStateToggleClassNameHelper(sourceValue, targetElement, cssClassName) {
                if (Array.isArray(cssClassName))
                    cssClassName = cssClassName[0];
                var maxStates = 5;
                for (var i = 1; i < maxStates; i++)
                    WinJS.Utilities.removeClass(targetElement, cssClassName + "_" + i);
                if (sourceValue)
                    WinJS.Utilities.addClass(targetElement, cssClassName + "_" + sourceValue)
            }), toggleTabIndex: MS.Entertainment.Utilities.weakElementBindingInitializer(function toggleTabIndex(sourceValue, targetElement) {
                if (sourceValue)
                    targetElement.setAttribute("tabIndex", 0);
                else
                    targetElement.removeAttribute("tabIndex")
            }), toggleTabIndexNegate: MS.Entertainment.Utilities.weakElementBindingInitializer(function toggleTabIndexNegate(sourceValue, targetElement) {
                if (!sourceValue)
                    targetElement.setAttribute("tabIndex", 0);
                else
                    targetElement.removeAttribute("tabIndex")
            }), toggleClassNameOnObservableArrayLength: MS.Entertainment.Utilities.weakElementBindingInitializer(function toggleClassNameOnObservableArrayLength(sourceValue, targetElement, cssClassName) {
                if (!(sourceValue instanceof MS.Entertainment.ObservableArray))
                    return;
                if (Array.isArray(cssClassName))
                    cssClassName = cssClassName[0];
                var handleArrayChanges = function handleArrayChanges(notification) {
                        if (sourceValue.length === 0)
                            WinJS.Utilities.addClass(targetElement, cssClassName);
                        else
                            WinJS.Utilities.removeClass(targetElement, cssClassName)
                    };
                sourceValue.addChangeListener(handleArrayChanges);
                handleArrayChanges()
            }), toggleClassNameOnObservableArrayLengthNegate: MS.Entertainment.Utilities.weakElementBindingInitializer(function toggleClassNameOnObservableArrayLengthNegate(sourceValue, targetElement, cssClassName) {
                if (!(sourceValue instanceof MS.Entertainment.ObservableArray))
                    return;
                if (Array.isArray(cssClassName))
                    cssClassName = cssClassName[0];
                var handleArrayChanges = function handleArrayChanges(notification) {
                        if (sourceValue.length === 0)
                            WinJS.Utilities.removeClass(targetElement, cssClassName);
                        else
                            WinJS.Utilities.addClass(targetElement, cssClassName)
                    };
                sourceValue.addChangeListener(handleArrayChanges);
                handleArrayChanges()
            }), toggleClassName: MS.Entertainment.Utilities.weakElementBindingInitializer(function toggleClassName(sourceValue, targetElement, cssClassName) {
                if (Array.isArray(cssClassName))
                    cssClassName = cssClassName[0];
                if (sourceValue)
                    WinJS.Utilities.addClass(targetElement, cssClassName);
                else
                    WinJS.Utilities.removeClass(targetElement, cssClassName)
            }), toggleClassNameNegate: MS.Entertainment.Utilities.weakElementBindingInitializer(function toggleClassNameNegate(sourceValue, targetElement, cssClassName) {
                if (Array.isArray(cssClassName))
                    cssClassName = cssClassName[0];
                if (!sourceValue)
                    WinJS.Utilities.addClass(targetElement, cssClassName);
                else
                    WinJS.Utilities.removeClass(targetElement, cssClassName)
            }), toggleClassNameOnEmptyGuid: MS.Entertainment.Utilities.weakElementBindingInitializer(function toggleClassNameOnEmptyGuid(smid, targetElement, cssClassName) {
                if (Array.isArray(cssClassName))
                    cssClassName = cssClassName[0];
                if (!smid || smid === MS.Entertainment.Utilities.EMPTY_GUID)
                    WinJS.Utilities.addClass(targetElement, cssClassName);
                else
                    WinJS.Utilities.removeClass(targetElement, cssClassName)
            }), toggleClassNameOnPositiveNumber: MS.Entertainment.Utilities.weakElementBindingInitializer(function toggleClassNameOnPositiveNumber(sourceValue, targetElement, cssClassName) {
                if (Array.isArray(cssClassName))
                    cssClassName = cssClassName[0];
                if (sourceValue && (typeof(sourceValue) === "number") && sourceValue > 0)
                    WinJS.Utilities.addClass(targetElement, cssClassName);
                else
                    WinJS.Utilities.removeClass(targetElement, cssClassName)
            }), toggleClassNameOnNegativeNumber: MS.Entertainment.Utilities.weakElementBindingInitializer(function toggleClassNameOnPositiveNumber(sourceValue, targetElement, cssClassName) {
                if (Array.isArray(cssClassName))
                    cssClassName = cssClassName[0];
                if (sourceValue && (typeof(sourceValue) === "number") && sourceValue < 0)
                    WinJS.Utilities.addClass(targetElement, cssClassName);
                else
                    WinJS.Utilities.removeClass(targetElement, cssClassName)
            }), toggleClassNameOnEmptyString: MS.Entertainment.Utilities.weakElementBindingInitializer(function toggleClassNameOnEmptyString(sourceValue, targetElement, cssClassName) {
                if (Array.isArray(cssClassName))
                    cssClassName = cssClassName[0];
                if (sourceValue !== null && sourceValue !== undefined)
                    sourceValue += String.empty;
                if (sourceValue && sourceValue.length > 0)
                    WinJS.Utilities.removeClass(targetElement, cssClassName);
                else
                    WinJS.Utilities.addClass(targetElement, cssClassName)
            }), toggleClassNameOnNonEmptyString: MS.Entertainment.Utilities.weakElementBindingInitializer(function toggleClassNameOnNonEmptyString(sourceValue, targetElement, cssClassName) {
                if (Array.isArray(cssClassName))
                    cssClassName = cssClassName[0];
                if (sourceValue !== null && sourceValue !== undefined)
                    sourceValue += String.empty;
                if (sourceValue && sourceValue.length > 0)
                    WinJS.Utilities.addClass(targetElement, cssClassName);
                else
                    WinJS.Utilities.removeClass(targetElement, cssClassName)
            }), appendClassName: MS.Entertainment.Utilities.weakElementBindingInitializer(function appendClassName(sourceValue, targetElement, targetProperty) {
                if (sourceValue && !WinJS.Utilities.hasClass(targetElement, sourceValue))
                    WinJS.Utilities.addClass(targetElement, sourceValue)
            }), removeClassName: MS.Entertainment.Utilities.weakElementBindingInitializer(function removeClassName(sourceValue, targetElement, targetProperty) {
                if (sourceValue && WinJS.Utilities.hasClass(targetElement, sourceValue))
                    WinJS.Utilities.removeClass(targetElement, sourceValue)
            }), appendMediaTypeClassName: MS.Entertainment.Utilities.weakElementBindingInitializer(function appendMediaTypeClassName(sourceValue, targetElement, cssClassName) {
                if (Array.isArray(cssClassName))
                    cssClassName = cssClassName[0];
                if (sourceValue && sourceValue.mediaType) {
                    var mediaTypeString = MS.Entertainment.Data.Factory.Marketplace.edsMediaTypeFromDatabaseType(sourceValue.mediaType);
                    if (mediaTypeString)
                        WinJS.Utilities.addClass(targetElement, (cssClassName + "-" + mediaTypeString).toLowerCase())
                }
            }), toggleBoolean: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function toggleBoolean(sourceValue) {
                return !sourceValue
            })), toggleHideOnElement: WinJS.Utilities.markSupportedForProcessing(function toggleHideOnElement(element, switchToHidden) {
                if (switchToHidden)
                    WinJS.Utilities.addClass(element, "removeFromDisplay");
                else
                    WinJS.Utilities.removeClass(element, "removeFromDisplay")
            }), toggleClassOnElement: WinJS.Utilities.markSupportedForProcessing(function toggleHideOnElement(element, switchOn, className) {
                if (Array.isArray(cssClassName))
                    cssClassName = cssClassName[0];
                if (switchOn)
                    WinJS.Utilities.addClass(element, className);
                else
                    WinJS.Utilities.removeClass(element, className)
            }), createActionFromBind: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function createActionFromBind(value) {
                var action = value;
                if (String.isString(action))
                    action = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).getAction(value);
                return action
            })), bindAndMarkSupportedForProcessing: function(fn, thisPointer) {
                var boundFunction = fn.bind(thisPointer);
                return WinJS.Utilities.markSupportedForProcessing(boundFunction)
            }, findParentElementByClassName: function findParentElementByClassName(childElement, className) {
                var parent = childElement.parentElement;
                while (parent) {
                    if (WinJS.Utilities.hasClass(parent, className))
                        return parent;
                    parent = parent.parentElement
                }
            }, isNumeric: function Utilities_isNumeric(sourceString) {
                if (sourceString === null || sourceString === undefined || typeof sourceString === "object")
                    return false;
                var validChars = "0123456789.";
                for (var i = sourceString.length - 1; i >= 0; i--)
                    if (validChars.indexOf(sourceString.charAt(i)) === -1)
                        return false;
                return true
            }, simpleEscapeHTML: function simpleEscapeHtml(text) {
                if (text.indexOf("<") !== -1)
                    text = text.replace(/</g, "&lt;");
                if (text.indexOf(">") !== -1)
                    text = text.replace(/>/g, "&gt;");
                return text
            }, escapeHTML: (function escapeHTML(text) {
                var element = null;
                return function escapeHTML(text) {
                        if (!element)
                            element = document.createElement("div");
                        element.textContent = text;
                        return element.innerHTML
                    }
            })(), unEscapeHTML: (function unEscapeHTML(html) {
                var element = null;
                return function unEscapeHTML(html) {
                        if (!element)
                            element = document.createElement("div");
                        element.innerHTML = html;
                        return element.textContent
                    }
            })(), getChildControl: function Utilities_getChildControl(dom, name) {
                var element;
                try {
                    element = dom.querySelector("[data-ent-id='" + name + "']");
                    if (element && (element.winControl !== null && element.winControl !== undefined))
                        element = element.winControl
                }
                catch(error) {
                    MS.Entertainment.fail("Exception in getChildControl. error: " + error + " name: " + name);
                    element = null
                }
                return element
            }, _millisecondsToDate: function millisecondsToDate(milliseconds) {
                var seconds = Math.floor(milliseconds / 1000);
                milliseconds = milliseconds % 1000;
                var minutes = Math.floor(seconds / 60);
                seconds = seconds % 60;
                var hours = Math.floor(minutes / 60);
                minutes = minutes % 60;
                return new Date(null, null, null, hours, minutes, seconds, milliseconds)
            }, millisecondsToTimeCode: function millisecondsToTimeCode(duration) {
                var durationType = typeof duration;
                if (durationType === "number")
                    duration = MS.Entertainment.Utilities._millisecondsToDate(duration);
                else if (durationType === "string")
                    duration = MS.Entertainment.Utilities._millisecondsToDate(parseInt(duration));
                else if (!duration)
                    return String.empty;
                var formatter;
                var hoursString;
                var minutesString;
                var secondsString;
                var hours = duration.getHours();
                var minutes = duration.getMinutes();
                var seconds = duration.getSeconds();
                if (isNaN(hours))
                    hours = 0;
                if (isNaN(minutes))
                    minutes = 0;
                if (isNaN(seconds))
                    seconds = 0;
                formatter = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber;
                var timeString;
                if (hours > 0) {
                    hoursString = formatter.format(hours);
                    formatter.integerDigits = 2;
                    minutesString = formatter.format(minutes);
                    secondsString = formatter.format(seconds);
                    timeString = String.load(String.id.IDS_HHMMSS_DURATION).format(hoursString, minutesString, secondsString)
                }
                else {
                    minutesString = formatter.format(minutes);
                    formatter.integerDigits = 2;
                    secondsString = formatter.format(seconds);
                    timeString = String.load(String.id.IDS_MMSS_DURATION).format(minutesString, secondsString)
                }
                formatter.integerDigits = MS.Entertainment.Formatters.DateTimeFormatters.defaultDecimalDigits;
                return timeString
            }, formatTimeString: function formatTimeString(duration) {
                var formatter;
                var hoursString;
                var minutesString;
                var secondsString;
                formatter = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber;
                var timeString = String.empty;
                var hours = 0;
                var minutes = 0;
                var seconds = 0;
                if (typeof duration === "number") {
                    hours = Math.floor(duration / (1000 * 60 * 60));
                    duration = duration - (hours * 1000 * 60 * 60);
                    minutes = Math.floor(duration / (1000 * 60));
                    duration = duration - (minutes * 1000 * 60);
                    seconds = Math.floor(duration / 1000)
                }
                else if (duration) {
                    hours = duration.getHours();
                    minutes = duration.getMinutes();
                    seconds = duration.getSeconds()
                }
                if (hours > 0) {
                    hoursString = formatter.format(hours);
                    minutesString = formatter.format(minutes);
                    timeString = String.load(String.id.IDS_DETAILS_DURATION_HOURS_FORMAT).format(hoursString, minutesString)
                }
                else {
                    minutesString = formatter.format(minutes);
                    secondsString = formatter.format(seconds);
                    timeString = String.load(String.id.IDS_DETAILS_DURATION_MINSEC_FORMAT).format(minutesString, secondsString)
                }
                return timeString
            }, getTotalMinutesFromDate: function getTotalMinutesFromDate(date) {
                var minutes = 0;
                if (date)
                    minutes = date.getHours() * 60 + date.getMinutes();
                return minutes
            }, handleSearchInput: function handleSearchInput(input) {
                if (!input)
                    return null;
                var result = String.empty;
                var trimmed = input.trim();
                if (trimmed)
                    for (var i = 0; i < trimmed.length; i++) {
                        var ch = trimmed[i];
                        switch (ch) {
                            case"%":
                            case";":
                            case"(":
                            case")":
                            case"{":
                            case"}":
                            case"!":
                            case"\r":
                            case"\t":
                            case"\n":
                            case">":
                            case"<":
                            case"+":
                            case"&":
                            case"-":
                                result = result + " ";
                                break;
                            default:
                                result = result + ch;
                                break
                        }
                    }
                return result.trim()
            }, processServiceLinks: function processServiceLinks(text, linkMappings) {
                var ignoreTags = ["<I>", "<i>", "<B>", "<b>", "</I>", "</i>", "</B>", "</b>"];
                var isIgnorableTag = function isIgnoreableTag(tagStart, isClosingTag) {
                        var ignore = false;
                        for (var i = 0; i < ignoreTags.length; i++)
                            if (tagStart.lastIndexOf(ignoreTags[i], 0) === 0) {
                                ignore = true;
                                break
                            }
                        return ignore
                    };
                return MS.Entertainment.Utilities.processServiceTextBlob(text, function handleTag(tagStart, isClosingTag) {
                        var stringFormat;
                        var result = null;
                        tagStart = tagStart || String.empty;
                        var match = /^\<link type\=\"([a-zA-Z0-9]+)\" id\=\"([a-zA-Z0-9\-]+)\">/.exec(tagStart);
                        if (match && match[1] && match[2])
                            stringFormat = linkMappings[match[1]];
                        else if (match)
                            result = String.empty;
                        else if (isIgnorableTag(tagStart))
                            result = String.empty;
                        else if (isClosingTag)
                            result = linkMappings["$close"];
                        if (stringFormat)
                            result = stringFormat.format(match[2]);
                        return result
                    })
            }, processServiceTextBlob: function processServiceTextBlob(textBlob, tagCallback) {
                var buff = "";
                if (textBlob) {
                    var inTag = false;
                    var closeTag = false;
                    for (var i = 0; i < textBlob.length; i++) {
                        var ch = textBlob[i];
                        if (ch === "<")
                            inTag = true;
                        if (!inTag)
                            if (ch === "\n")
                                buff = buff + "<br><br>";
                            else if (ch === ">")
                                buff = buff + "&gt;";
                            else
                                buff = buff + ch;
                        else if (ch === "<" && tagCallback) {
                            closeTag = (textBlob[i + 1] === "/");
                            var append = tagCallback(textBlob.substr(i), closeTag);
                            if (append)
                                buff = buff + append;
                            if (append === null) {
                                inTag = false;
                                buff = buff + "&lt;"
                            }
                        }
                        if (ch === ">")
                            inTag = false
                    }
                }
                return buff
            }, getMediaTypeName: function getMediaTypeName(mediaType, videoType, gameType, downloadTypeText) {
                var name;
                switch (mediaType) {
                    case Microsoft.Entertainment.Queries.ObjectType.video:
                        if (videoType === Microsoft.Entertainment.Queries.VideoType.tvEpisode)
                            name = String.load(String.id.IDS_MEDIATYPE_TVEPISODE);
                        else
                            name = String.load(String.id.IDS_MEDIATYPE_MOVIE);
                        break;
                    case Microsoft.Entertainment.Queries.ObjectType.tvSeries:
                        name = String.load(String.id.IDS_MEDIATYPE_TVSERIES);
                        break;
                    case Microsoft.Entertainment.Queries.ObjectType.tvSeason:
                        name = String.load(String.id.IDS_MEDIATYPE_TVSEASON);
                        break;
                    case Microsoft.Entertainment.Queries.ObjectType.person:
                        name = String.load(String.id.IDS_MEDIATYPE_ARTIST);
                        break;
                    case Microsoft.Entertainment.Queries.ObjectType.album:
                        name = String.load(String.id.IDS_MEDIATYPE_ALBUM);
                        break;
                    case Microsoft.Entertainment.Queries.ObjectType.track:
                        name = String.load(String.id.IDS_MEDIATYPE_SONG);
                        break;
                    case Microsoft.Entertainment.Queries.ObjectType.playlist:
                        name = String.load(String.id.IDS_MEDIATYPE_PLAYLIST);
                        break;
                    case Microsoft.Entertainment.Queries.ObjectType.game:
                        if (gameType === MS.Entertainment.Data.Augmenter.GamePlatform.Modern)
                            name = String.load(String.id.IDS_MEDIATYPE_GAME_WINDOWS);
                        else {
                            name = downloadTypeText;
                            if (!name)
                                name = String.load(String.id.IDS_MEDIATYPE_GAME)
                        }
                        break;
                    default:
                        name = String.load(String.id.IDS_UNKNOWN_VALUE);
                        break
                }
                return name
            }, getMediaTypeNameFromMedia: function getMediaTypeNameFromMedia(media) {
                return MS.Entertainment.Utilities.getMediaTypeName(media.mediaType, media.videoType, media.defaultPlatformType, media.downloadTypeText)
            }, isEDSAuthRequired: function isEDSAuthRequired() {
                var isAuthRequired = false;
                var edsUri = MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_EDSSearch);
                isAuthRequired = edsUri.toLowerCase().substr(0, 8) === "https://";
                return isAuthRequired
            }, isTouchDevicePresent: function isTouchDevicePresent() {
                var touchCapabilities = new Windows.Devices.Input.TouchCapabilities;
                return touchCapabilities && touchCapabilities.touchPresent
            }, isGameItemAvailable: (function isGameItemAvailable(item) {
                return function _isGameItemAvailableWork(item) {
                        var itemAvailable = true;
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        var metroGamesMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.metroGamesMarketplace);
                        var xboxGamesMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.xbox360GamesMarketplace);
                        if (item) {
                            if ((item.defaultPlatformType === MS.Entertainment.Data.Augmenter.GamePlatform.Modern && !metroGamesMarketplaceEnabled) || (item.defaultPlatformType === MS.Entertainment.Data.Augmenter.GamePlatform.Xbox && !xboxGamesMarketplaceEnabled))
                                itemAvailable = false
                        }
                        else
                            itemAvailable = false;
                        return itemAvailable
                    }
            }()), EMPTY_GUID: "00000000-0000-0000-0000-000000000000", isEmptyGuid: function isEmptyGuid(guid) {
                return !guid || guid === MS.Entertainment.Utilities.EMPTY_GUID
            }, isValidGuid: function isValidGuid(guid) {
                return guid && typeof guid === "string" && guid.match(/^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/)
            }, isValidLibraryId: function isValidLibraryId(id) {
                return id > 0
            }, invalidateLibraryId: -1, convertToHexString: function convertToHexString(value) {
                if (!value)
                    value = 0;
                else if (value < 0)
                    value += 0xFFFFFFFF + 1;
                return "0x" + value.toString(16)
            }, getSpotlightItemAugmentation: function getSpotlightItemAugmentation(spotlightType) {
                var augmentation = null;
                switch (spotlightType) {
                    case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.ModernGame:
                    case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.XboxGame:
                        augmentation = MS.Entertainment.Data.Augmenter.Spotlight.SpotlightItem;
                        break;
                    default:
                        var shipAssertProvider = new Microsoft.Entertainment.Infrastructure.ShipAssertProvider;
                        shipAssertProvider.shipAssert("MS.Entertainment.UI.Controls", "getSpotlightItemAugmentation()", MS.Entertainment.UI.Debug.getStackTrace(), "Message: " + "Unsupported spotlight media type.  Could not find augmentation for type: " + spotlightType, "");
                        break
                }
                {};
                return augmentation
            }, getEditorialItemAugmentation: function getEditorialItemAugmentation(editorialType) {
                var augmentation = null;
                switch (editorialType) {
                    case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Game:
                        break;
                    default:
                        MS.Entertainment.UI.Controls.fail("Unsupported editorial media type.  Could not find augmentation for type: " + editorialType);
                        break
                }
                {};
                return augmentation
            }, convertEditorialItem: function convertEditorialItem(mediaItem) {
                var newMediaItem = mediaItem;
                var augmenter;
                if (mediaItem && !mediaItem.mediaType)
                    augmenter = MS.Entertainment.Utilities.getEditorialItemAugmentation(mediaItem && mediaItem.type);
                if (augmenter) {
                    var oldItem = WinJS.Binding.unwrap(mediaItem);
                    newMediaItem = MS.Entertainment.Data.augment(MS.Entertainment.Data.deflate(oldItem), augmenter);
                    if (oldItem.contentNotifications)
                        newMediaItem.contentNotifications = oldItem.contentNotifications
                }
                return newMediaItem
            }, uninitializeChildControls: function disposeChildControls(dom) {
                var element = dom.querySelector("[data-win-control]");
                var controls = dom.querySelectorAll("[data-win-control]");
                if (controls && controls.length > 0)
                    for (var i = 0, l = controls.length; i < l; i++)
                        if (controls[i] && controls[i].winControl && controls[i].winControl.uninitialize)
                            controls[i].winControl.uninitialize()
            }, searchArray: function searchArray(array, predicate) {
                var index = 0;
                var candidate = null;
                for (index = 0; index < array.length; index++) {
                    candidate = array[index];
                    if (predicate(candidate))
                        return candidate
                }
                return null
            }, getPropertyPathFragments: function getPropertyPathFragments(propertyPath) {
                var propertyPathFragments = (propertyPath) ? propertyPath.split(/(?:\]\.)|\.|\[|\]/) : [];
                if (propertyPathFragments[propertyPathFragments.length - 1] === String.empty)
                    propertyPathFragments.pop();
                if (propertyPathFragments[0] === String.empty)
                    propertyPathFragments.splice(0, 1);
                return propertyPathFragments
            }, valueFromPropertyPath: function valueFromPropertyPath(data, propertyPath) {
                return MS.Entertainment.Utilities.valueFromPropertyPathFragments(data, MS.Entertainment.Utilities.getPropertyPathFragments(propertyPath))
            }, valueFromPropertyPathFragments: function valueFromPropertyPathFragments(data, propertyPath, max) {
                var max = isNaN(max) ? propertyPath.length : max;
                for (var i = 0; i < max && data; i++)
                    try {
                        data = data[propertyPath[i]]
                    }
                    catch(e) {
                        MS.Entertainment.fail("Exception in valueFromPropertyPathFragments: " + e.toString() + " Property: " + propertyPath.toString())
                    }
                return data
            }, hasPropertyPath: function hasProperty(data, propertyPath) {
                return MS.Entertainment.Utilities.hasPropertyPathFragments(data, MS.Entertainment.Utilities.getPropertyPathFragments(propertyPath))
            }, hasPropertyPathFragments: function hasPropertyPathFragments(data, propertyPath) {
                var len = propertyPath.length - 1;
                for (var i = 0; i < len && data; i++)
                    data = data[propertyPath[i]];
                return data && (len < 0 || (typeof data === "object" && propertyPath[len] in data))
            }, setFromPropertyPathFragments: function setFromPropertyPathFragments(data, propertyPath, value) {
                for (var i = 0, len = propertyPath.length - 1; i < len && data; i++) {
                    if (!(propertyPath[i] in data))
                        data[propertyPath[i]] = {};
                    data = data[propertyPath[i]]
                }
                data[propertyPath[len]] = value
            }, random: function random(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min
            }, getRelativeOffset: function getRelativeOffset(element, parent) {
                MS.Entertainment.Utilities.assert(element, "No element provided");
                MS.Entertainment.Utilities.assert(parent, "No parent provided");
                if (!element || !parent)
                    return {
                            top: 0, left: 0
                        };
                var left = 0;
                var top = 0;
                var e = element;
                while (e && parent && (e.offsetParent !== parent.offsetParent)) {
                    left += e.offsetLeft;
                    top += e.offsetTop;
                    e = e.offsetParent;
                    if (!e)
                        return {
                                left: left, top: top
                            }
                }
                left += (e.offsetLeft - parent.offsetLeft);
                top += (e.offsetTop - parent.offsetTop);
                return {
                        left: left, top: top
                    }
            }, onRootPage: function onRootPage() {
                var currentPage = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).currentPage;
                return currentPage.iaNode.moniker === MS.Entertainment.UI.Monikers.root
            }, isElementInViewportOfParent: function isElementInViewportOfParent(item, parent) {
                var relativePosition = MS.Entertainment.Utilities.getRelativeOffset(item, parent);
                return MS.Entertainment.Utilities.isElementInHorizontalViewportOfParent(item, parent) && MS.Entertainment.Utilities.isElementInVerticalViewportOfParent(item, parent)
            }, isElementInHorizontalViewportOfParent: function isElementInHorizontalViewportOfParent(item, parent) {
                var relativePosition = MS.Entertainment.Utilities.getRelativeOffset(item, parent);
                if (relativePosition) {
                    var leftEdge = relativePosition.left >= parent.scrollLeft;
                    var rightEdge = (relativePosition.left + item.offsetWidth) <= (parent.offsetWidth + parent.scrollLeft);
                    return leftEdge && rightEdge
                }
                else
                    return false
            }, isElementInVerticalViewportOfParent: function isElementInVerticalViewportOfParent(item, parent) {
                var relativePosition = MS.Entertainment.Utilities.getRelativeOffset(item, parent);
                if (relativePosition) {
                    var topEdge = relativePosition.top >= (parent.scrollTop);
                    var bottomEdge = (relativePosition.top + item.offsetHeight) <= (parent.offsetHeight + parent.scrollTop);
                    return topEdge && bottomEdge
                }
                else
                    return false
            }, getLeftEdgeWithinViewport: function getLeftEdgeWithinViewport(desiredLeftPosition, width, viewportWidth) {
                var left = Math.min(desiredLeftPosition, viewportWidth - width);
                return Math.max(left, 0)
            }, getRightEdgeWithinViewport: function getRightEdgeWithinViewport(desiredRightPosition, width, viewportWidth) {
                var right = Math.max(desiredRightPosition, width);
                return Math.min(right, viewportWidth)
            }, parseVersionString: function parseVersionString(inputString) {
                MS.Entertainment.Utilities.assert(inputString, "Empty input string");
                var versionArray = inputString.split(".");
                MS.Entertainment.Utilities.assert(versionArray.length === 4, "Version string should have four parts");
                return {
                        major: parseInt(versionArray[0]), minor: parseInt(versionArray[1]), build: parseInt(versionArray[2]), revision: parseInt(versionArray[3])
                    }
            }, compareVersions: function compareVersions(ver1, ver2) {
                var properties = ["major", "minor", "build", "revision"];
                MS.Entertainment.Utilities.assert((ver1.major >= 0) && (ver1.minor >= 0) && (ver1.build >= 0) && (ver1.revision >= 0), " Input version1 is invalid");
                MS.Entertainment.Utilities.assert((ver2.major >= 0) && (ver2.minor >= 0) && (ver2.build >= 0) && (ver2.revision >= 0), " Input version2 is invalid");
                for (var i = 0; i < properties.length; i++)
                    if (ver1[properties[i]] < ver2[properties[i]])
                        return -1;
                    else if (ver1[properties[i]] > ver2[properties[i]])
                        return 1;
                return 0
            }, getClientVersionString: function getClientVersionString() {
                var ver = Windows.ApplicationModel.Package.current.id.version;
                return [ver.major, ver.minor, ver.build, ver.revision].join(".")
            }, launchStoreUpdatePage: function launchStoreUpdatePage() {
                var launchInfo = "ms-windows-store:Updates";
                var appAction = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.launchApp);
                appAction.automationId = MS.Entertainment.UI.AutomationIds.launchAppStoreUpgrade;
                appAction.parameter = {
                    uri: launchInfo, appendSource: true, appendGamerTag: false
                };
                appAction.execute()
            }, doesElementSupportKeyboardInput: function doesElementSupportKeyboardInput(element) {
                var result = false;
                if (!element)
                    return result;
                if (element.tagName === "TEXTAREA")
                    result = true;
                else if (element.tagName === "INPUT")
                    switch (element.getAttribute("type")) {
                        case"text":
                        case"password":
                        case"number":
                        case"email":
                        case"tel":
                        case"url":
                        case"search":
                            result = true;
                            break
                    }
                return result
            }, suppressSubtreeKeyboardFocus: function suppressSubtreeKeyboardFocus(element) {
                var suppressed = [];
                if (element) {
                    var elements = element.querySelectorAll("*[tabindex]");
                    if (elements)
                        for (var i = 0; i < elements.length; i++) {
                            var element = elements[i];
                            var tabIndex = element.getAttribute("tabindex");
                            if (tabIndex && tabIndex !== -1) {
                                suppressed.push({
                                    element: element, tabIndex: tabIndex
                                });
                                element.setAttribute("tabindex", -1)
                            }
                        }
                }
                return suppressed
            }, restoreSubtreeKeyboardFocus: function restoreSubtreeKeyboardFocus(suppressedList) {
                if (suppressedList)
                    for (var i = 0; i < suppressedList.length; i++) {
                        var suppressedItem = suppressedList[i];
                        suppressedItem.element.setAttribute("tabindex", suppressedItem.tabIndex)
                    }
            }, getRowCountForResolution: function getRowCountForResolution() {
                var screenHeight = window.outerHeight;
                var rowCount = MS.Entertainment.Utilities.STANDARD_RESOLUTION_ROWS;
                if (screenHeight >= MS.Entertainment.Utilities.VIEW1_VERTICAL_HEIGHT_LIMIT)
                    rowCount = MS.Entertainment.Utilities.HIGH_RESOLUTION_ROWS;
                return rowCount
            }, isGamesApp: {get: function getIsGamesApp() {
                    return MS.Entertainment.appMode === Microsoft.Entertainment.Application.AppMode.games
                }}, isTestApp: {get: function getIsTestApp() {
                    return MS.Entertainment.appMode === Microsoft.Entertainment.Application.AppMode.test
                }}, isApp1: {get: function getIsApp1() {
                    return true
                }}, isApp2: {get: function getIsApp2() {
                    return false
                }}, useModalNowPlaying: {get: function getUseModalNowPlaying() {
                    return false
                }}, getDirectionFromGlobalKeyInput: function getDirectionFromGlobalKeyInput(e) {
                MS.Entertainment.Utilities.assert(e, "Need an event to decide which direction to go in");
                if (!e)
                    return;
                var direction;
                switch (e.keyCode) {
                    case WinJS.Utilities.Key.rGlobal:
                        direction = MS.Entertainment.Utilities.GlobalKeyDirection.right;
                        break;
                    case WinJS.Utilities.Key.lGlobal:
                        direction = MS.Entertainment.Utilities.GlobalKeyDirection.left;
                        break;
                    case WinJS.Utilities.Key.pageUp:
                        if (e.altKey)
                            direction = MS.Entertainment.Utilities.GlobalKeyDirection.right;
                        break;
                    case WinJS.Utilities.Key.pageDown:
                        if (e.altKey)
                            direction = MS.Entertainment.Utilities.GlobalKeyDirection.left;
                        break
                }
                return direction
            }, GlobalKeyDirection: {
                left: "left", right: "right"
            }, defaultClientTypeFromApp: {get: function defaultClientTypeFromApp() {
                    var tuner = MS.Entertainment.ViewModels.SmartBuyStateHandlers.Tuner.Windows;
                    if (MS.Entertainment.Utilities.isApp2)
                        tuner = MS.Entertainment.ViewModels.SmartBuyStateHandlers.Tuner.Xbox360;
                    return tuner
                }}, rightSupportsTuner: function rightSupportsTuner(right, tuner) {
                var foundTuner = false;
                if (right.clientTypes && right.clientTypes.length > 0)
                    for (var k = 0; k < right.clientTypes.length; k++)
                        if (tuner === right.clientTypes[k] || right.clientTypes[k] === MS.Entertainment.ViewModels.SmartBuyStateHandlers.Tuner.All) {
                            foundTuner = true;
                            break
                        }
                return foundTuner
            }, optionsAppTypeTabIndexHelper: {get: function optionsAppTypeTabIndexHelper() {
                    return MS.Entertainment.Utilities.isApp2 ? 0 : -1
                }}, bindingAppTypeTabIndexHelper: WinJS.Utilities.markSupportedForProcessing(function bindingAppTypeTabIndexHelper(source, sourceProperties, destination, destinationProperties) {
                destination.tabIndex = MS.Entertainment.Utilities.optionsAppTypeTabIndexHelper
            }), STANDARD_RESOLUTION_ROWS: 3, HIGH_RESOLUTION_ROWS: {get: function() {
                    if (MS.Entertainment.Utilities.isApp2)
                        return 3;
                    else
                        return 4
                }}, VIEW1_VERTICAL_HEIGHT_LIMIT: 900, popOverDefaultSize: {
                width: 730, height: 530
            }, cardItemSizeWithMargin: {get: function() {
                    if (MS.Entertainment.Utilities.isApp2)
                        return {
                                width: 476, height: 240
                            };
                    else
                        return {
                                width: 300, height: 170
                            }
                }}
    })
})();
WinJS.Namespace.define("MS.Entertainment.Utilities", {User: MS.Entertainment.defineObservable(function user_constructor(userXuidOrNativeUser, gamerTag) {
        if (isNaN(userXuidOrNativeUser))
            this.nativeUserModel = [userXuidOrNativeUser || null];
        else
            this.nativeUserModel = this._createNativeUserModel(userXuidOrNativeUser, gamerTag)
    }, {
        nativeUserModel: null, getIsValid: function getIsValid() {
                return Array.isArray(this.nativeUserModel) && this.nativeUserModel[0]
            }, _createNativeUserModel: function _createNativeUserModel(userXuid, gamerTag) {
                return [MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.xboxLive).createUser(userXuid, gamerTag)]
            }
    })});
WinJS.Namespace.define("MS.Entertainment.Utilities.BindingAgnostic", {
    setProperty: function setProperty(target, property, value) {
        if (!(property in target) && target._backingData)
            target.addProperty(property, value);
        else
            target[property] = value
    }, setProperties: function setProperties(target, source) {
            var key;
            if (source)
                for (key in source)
                    if (key.indexOf("_") !== 0 && key !== "instance" && key !== "constructor")
                        MS.Entertainment.Utilities.BindingAgnostic.setProperty(target, key, source[key])
        }
});
WinJS.Namespace.define("MS.Entertainment.Utilities", {
    showElementNoAnimation: WinJS.Utilities.markSupportedForProcessing(function showElementNoAnimation(element) {
        WinJS.Utilities.removeClass(element, "hideFromDisplay")
    }), showElement: function showElement(element) {
            var result;
            element.hideFromDisplay = false;
            WinJS.Utilities.removeClass(element, "hideFromDisplay");
            result = MS.Entertainment.UI.Framework.beginShowAnimations(element);
            return WinJS.Promise.as(result)
        }, hideElement: function hideElement(element, timeoutMS) {
            var hidePromise = null;
            var timeoutPromise = null;
            if (!element)
                return WinJS.Promise.wrap();
            element.hideFromDisplay = true;
            if (timeoutMS)
                timeoutPromise = WinJS.Promise.timeout(timeoutMS).then(function cancelHide() {
                    if (hidePromise) {
                        hidePromise.cancel();
                        hidePromise = null
                    }
                });
            hidePromise = MS.Entertainment.UI.Framework.beginHideAnimations(element).then(function hideAnimationsComplete() {
                if (timeoutPromise) {
                    timeoutPromise.cancel();
                    timeoutPromise = null
                }
                if (element.hideFromDisplay)
                    WinJS.Utilities.addClass(element, "hideFromDisplay")
            });
            return hidePromise
        }, enterElement: function enterElement(element) {
            var result;
            element.hideFromDisplay = false;
            WinJS.Utilities.removeClass(element, "hideFromDisplay");
            result = MS.Entertainment.UI.Framework.beginEnterAnimations(element);
            return WinJS.Promise.as(result)
        }, exitElement: function exitElement(element) {
            element.hideFromDisplay = true;
            return MS.Entertainment.UI.Framework.beginExitAnimations(element).then(function hideAnimationsComplete() {
                    if (element.hideFromDisplay)
                        WinJS.Utilities.addClass(element, "hideFromDisplay")
                })
        }, appendChild: function appendChild(parent, child, hidden) {
            parent.appendChild(child);
            if (!hidden)
                return MS.Entertainment.Utilities.showElement(child);
            else {
                WinJS.Utilities.addClass(child, "hideFromDisplay");
                return WinJS.Promise.wrap()
            }
        }, insertBefore: function insertBefore(parent, newChild, refChild, hidden) {
            parent.insertBefore(newChild, refChild);
            if (!hidden)
                return MS.Entertainment.Utilities.showElement(newChild);
            else {
                WinJS.Utilities.addClass(newChild, "hideFromDisplay");
                return WinJS.Promise.wrap()
            }
        }, removeChild: function removeChild(parent, child, skipHideElement) {
            var remove = function remove() {
                    if (child.parentElement) {
                        MS.Entertainment.UI.Framework.assert(child.parentElement === parent, "Supplied parent was not childs direct parent");
                        child.parentElement.removeChild(child)
                    }
                };
            if (skipHideElement) {
                remove();
                return WinJS.Promise.wrap()
            }
            else
                return MS.Entertainment.Utilities.hideElement(child).then(function hideElementCompletes() {
                        remove()
                    })
        }, replaceChild: function replaceChild(parent, newChild, oldChild, hidden) {
            return MS.Entertainment.UI.Framework.beginHideAnimations(oldChild).then(function beginHideAnimationsCompletes() {
                    parent.replaceChild(newChild, oldChild);
                    if (!hidden)
                        MS.Entertainment.Utilities.showElement(newChild);
                    else {
                        WinJS.Utilities.addClass(newChild, "hideFromDisplay");
                        return WinJS.Promise.wrap()
                    }
                })
        }, isElementVisible: function isElementVisible(element) {
            var style = window.getComputedStyle(element);
            return !(style.display === "none" || style.visibility === "hidden" || style.opacity === 0.0)
        }, addEvents: function addEvents(element, events, capture) {
            element = (element && element.domElement) ? element.domElement : element;
            return MS.Entertainment.Utilities.addEventHandlers(element, events, capture)
        }, waitForStartedTransitionsToComplete: MS.Entertainment.UI.Framework.waitForStartedTransitionsToComplete, redirectPromise: function redirectPromise(promise, value) {
            return WinJS.Promise.as(promise).then(function redirectPromise() {
                    return value
                })
        }, setAccessibilityTextFromStringId: function setAccessibilityTextFromStringId(element, stringId) {
            MS.Entertainment.Utilities.setAccessibilityText(element, String.load(stringId))
        }, setAccessibilityText: function setAccessibilityText(element, text) {
            element = (element && element.domElement) ? element.domElement : element;
            if (element)
                if (text)
                    element.setAttribute("aria-label", text);
                else
                    element.removeAttribute("aria-label")
        }, setAccessibilityTextFromElement: function setAccessibilityTextFromElement(destinationElement, sourceElement) {
            destinationElement = (destinationElement && destinationElement.domElement) ? destinationElement.domElement : destinationElement;
            sourceElement = (sourceElement && sourceElement.domElement) ? sourceElement.domElement : sourceElement;
            if (destinationElement) {
                MS.Entertainment.Utilities.assert(!sourceElement || sourceElement.id, "A source element was provided, but the element did not have an id. For aria-labelledby to work an id is required.");
                if (sourceElement && sourceElement.id)
                    destinationElement.setAttribute("aria-labelledby", sourceElement.id);
                else
                    destinationElement.removeAttribute("aria-labelledby")
            }
        }, copyAugmentedProperties: function copyAugmentedProperties(from, to) {
            var originalFrom = from;
            var property;
            var propertyDescriptor;
            function copyAugmentedPropertiesEx(from, to) {
                if (from && to) {
                    from = MS.Entertainment.Data.augmentationShape(WinJS.Binding.unwrap(from));
                    Object.getOwnPropertyNames(from).forEach(function(property) {
                        if (property.indexOf("_") !== 0 && property !== "instance")
                            MS.Entertainment.Utilities.BindingAgnostic.setProperty(to, property, originalFrom[property])
                    });
                    to.hydrated = originalFrom.hydrated
                }
            }
            copyAugmentedPropertiesEx(from, to)
        }, uniteObjects: function uniteObjects(lessSignificant, moreSignificant) {
            if (lessSignificant && moreSignificant) {
                var combinedItem = {};
                for (var property in lessSignificant)
                    combinedItem[property] = lessSignificant[property];
                for (property in moreSignificant)
                    combinedItem[property] = moreSignificant[property];
                return combinedItem
            }
            else if (lessSignificant)
                return lessSignificant;
            else if (moreSignificant)
                return moreSignificant;
            else
                return {}
        }, doNothing: WinJS.Utilities.markSupportedForProcessing(function doNothing(){}), getResourceLanguage: function getResourceLanguage() {
            var resourceLanguage;
            try {
                var resourceContext = new Windows.ApplicationModel.Resources.Core.ResourceContext;
                resourceLanguage = resourceContext.languages[0]
            }
            catch(e) {
                MS.Entertainment.UI.Components.Shell.assert(false, "Unexpected error retrieving resource locale")
            }
            if (!resourceLanguage)
                resourceLanguage = "en-US";
            return resourceLanguage
        }, getValueFromCsvList: function getValueFromCsvList(nameValuePairList, name) {
            var value;
            var regularExpression = "(^|,)\\s*" + name + "\\s*=\\s*([^=,\\s]+)";
            var result = new RegExp(regularExpression).exec(nameValuePairList);
            if (result)
                value = result[2];
            return value
        }, getLanguageFromLocale: function getLanguageFromLocale(localeName) {
            var languageCode;
            var lastDashIndex = localeName.lastIndexOf("-");
            if (lastDashIndex >= 0)
                languageCode = localeName.slice(0, lastDashIndex);
            else
                languageCode = localeName;
            return languageCode
        }, instantiateControl: function instantiateControl(control, options, host) {
            options = options || {};
            var UserControlConstructor = control;
            var controlAttribute;
            if (typeof UserControlConstructor === "string") {
                UserControlConstructor = WinJS.Utilities.getMember(control);
                controlAttribute = control
            }
            else
                controlAttribute = "MS.Entertainment.UI.Framework.UserControl";
            if (!options.hasOwnProperty("_skipDefer"))
                options._skipDefer = true;
            MS.Entertainment.UI.Controls.assert(typeof UserControlConstructor === "function", "Overlay: " + control + " is not a function");
            host.setAttribute("data-win-control", controlAttribute);
            return new UserControlConstructor(host, options)
        }
});
WinJS.Namespace.define("MS.Entertainment.Utilities.DateFormatters", {
    formatDay: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatDay(sourceValue) {
        if (sourceValue)
            return sourceValue.getDate();
        else
            return String.empty
    })), formatMonthAbbreviation: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatMonthAbbreviation(sourceValue) {
            if (sourceValue) {
                var superShortMonthPattern = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).abbreviatedMonth;
                return superShortMonthPattern.format(sourceValue)
            }
            else
                return String.empty
        })), formatMonthAbbreviationYear: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatMonthAbbreviationYear(sourceValue) {
            if (sourceValue) {
                var superShortMonthPattern = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).abbreviatedMonthYear;
                return superShortMonthPattern.format(sourceValue)
            }
            else
                return String.empty
        })), formatYearMonthDayLong: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatYearMonthDayLong(sourceValue) {
            if (sourceValue) {
                var longdate = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).dayMonthYear;
                return longdate.format(sourceValue)
            }
            else
                return String.empty
        }))
});
WinJS.Namespace.define("MS.Entertainment.globalControls", {
    GlobalControl: {
        appBar: "BottomAppBar", appInfoNotification: "AppInfoNotification", appCriticalNotification: "AppCriticalNotification", bottomProgressBar: "BottomProgressBar", backButton: "BackButton", immersiveDetails: "ImmersiveDetails", mainHeader: "MainHeader", navigationWrapper: "NavigationWrapper", xboxControls: "xboxControls"
    }, getControl: function getControl(identifier) {
            return MS.Entertainment.Utilities.getChildControl(document.body, identifier)
        }
});
(function() {
    var currentOverlayContainers = [];
    function sortOnTabIndex(a, b) {
        if (a.tabIndex < b.tabIndex) {
            if (a.tabIndex === -1)
                return 1;
            return -1
        }
        else if (a.tabIndex > b.tabIndex)
            return 1;
        else
            return 0
    }
    function excludeNonFocusableElements(element) {
        if (!element.getAttribute)
            return false;
        var disabledAttribute = element.getAttribute("disabled");
        var currentStyle = element.currentStyle;
        var isVisible = currentStyle && currentStyle.visibility !== "hidden" && currentStyle.display !== "none" && disabledAttribute !== "disabled" && disabledAttribute !== "";
        if (!isVisible)
            return false;
        var tagName = element.tagName;
        var isFocusableElementType = /INPUT|SELECT|TEXTAREA|BUTTON|IFRAME/.test(tagName);
        var isFocusableLink = (tagName === "A" && element.href);
        var actuallyHasTabStop = false;
        var tabIndexAttribute = element.getAttribute("tabindex");
        if (tabIndexAttribute && !isNaN(tabIndexAttribute))
            actuallyHasTabStop = (tabIndexAttribute !== "-1");
        else if ((isFocusableElementType || isFocusableLink) && element.tabIndex > -1)
            actuallyHasTabStop = true;
        var isKeyboardNavigationManagerFocusable = WinJS.Utilities.hasClass(element, "win-focusable");
        return (isFocusableElementType && actuallyHasTabStop) || (isFocusableLink && actuallyHasTabStop) || actuallyHasTabStop || isKeyboardNavigationManagerFocusable
    }
    WinJS.Namespace.define("MS.Entertainment.UI.Framework", {
        TabConstrainer: WinJS.Class.define(function(element, options) {
            this.domElement = element;
            var firstDiv = document.createElement("div");
            firstDiv.className = MS.Entertainment.UI.Framework.TabConstrainer.firstDivClass;
            firstDiv.setAttribute("role", "menuitem");
            firstDiv.setAttribute("aria-hidden", "true");
            firstDiv.setAttribute("tabindex", 0);
            firstDiv.addEventListener("focus", this._focusLandsOnFirstElement.bind(this), false);
            element.insertAdjacentElement("AfterBegin", firstDiv);
            var lastDiv = document.createElement("div");
            lastDiv.className = MS.Entertainment.UI.Framework.TabConstrainer.lastDivClass;
            lastDiv.setAttribute("role", "menuitem");
            lastDiv.setAttribute("aria-hidden", "true");
            lastDiv.setAttribute("tabindex", 10000);
            lastDiv.addEventListener("focus", this._focusLandsOnLastElement.bind(this), false);
            element.appendChild(lastDiv);
            this._fixUpLastDivTabIndexes()
        }, {
            _focusLandsOnLastElement: function _focusLandsOnLastElement() {
                if (!WinJS.Utilities.hasClass(document.activeElement, MS.Entertainment.UI.Framework.TabConstrainer.lastDivClass))
                    return;
                var appBar = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar);
                if (this.includeAppBarOnLastTab && appBar.visible)
                    MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar).focusAppBar(this.domElement);
                else
                    MS.Entertainment.UI.Framework.focusFirstInSubTree(this.domElement, this.excludeEndPointElements)
            }, _focusLandsOnFirstElement: function _focusLandsOnFirstElement() {
                    if (document.activeElement)
                        if (!WinJS.Utilities.hasClass(document.activeElement, MS.Entertainment.UI.Framework.TabConstrainer.firstDivClass))
                            return;
                    if (this.domElement)
                        MS.Entertainment.UI.Framework.focusLastInSubTree(this.domElement)
                }, _fixUpLastDivTabIndexes: function _fixUpLastDivTabIndexes() {
                    var otherLastItems = document.querySelectorAll("." + MS.Entertainment.UI.Framework.TabConstrainer.lastDivClass);
                    var nextTabIndex = 10001;
                    if (otherLastItems && otherLastItems.length > 0)
                        Array.prototype.forEach.call(otherLastItems, function(item) {
                            if (this.domElement.lastElementChild === item) {
                                item.tabIndex = 10000;
                                return
                            }
                            item.tabIndex = nextTabIndex;
                            nextTabIndex = item.tabIndex + 10000
                        }.bind(this))
                }, excludeEndPointElements: true, includeAppBarOnLastTab: false
        }, {
            firstDivClass: "ent-firstdiv", lastDivClass: "ent-lastdiv"
        }), focusLastInSubTree: function focusLastInSubTree(element) {
                if (MS.Entertainment.UI.Framework.focusedItemInContainer(element))
                    return;
                var children = element.getElementsByTagName("*");
                var sorted = Array.prototype.filter.call(children, excludeNonFocusableElements).sort(sortOnTabIndex);
                for (var i = (sorted.length - 1); i > -1; i--) {
                    var elementToFocus = sorted[i];
                    if (WinJS.Utilities.hasClass(elementToFocus, MS.Entertainment.UI.Framework.TabConstrainer.firstDivClass) || WinJS.Utilities.hasClass(elementToFocus, MS.Entertainment.UI.Framework.TabConstrainer.lastDivClass))
                        continue;
                    elementToFocus.focus();
                    if (elementToFocus === document.activeElement || MS.Entertainment.UI.Framework.focusedItemInContainer(element))
                        break
                }
            }, focusFirstInSubTree: function focusFirstInSubTree(element, excludeEndpointElements) {
                if (!MS.Entertainment.UI.Framework.canMoveFocus(element))
                    return false;
                if (MS.Entertainment.UI.Framework.focusedItemInContainer(element))
                    return true;
                var successfullyFocused = false;
                var firstDiv = null;
                var children = element.getElementsByTagName("*");
                var sorted = Array.prototype.filter.call(children, excludeNonFocusableElements).sort(sortOnTabIndex);
                for (var i = 0; i < sorted.length; i++) {
                    var elementToFocus = sorted[i];
                    if (excludeEndpointElements)
                        if (WinJS.Utilities.hasClass(elementToFocus, MS.Entertainment.UI.Framework.TabConstrainer.firstDivClass)) {
                            firstDiv = elementToFocus;
                            continue
                        }
                        else if (WinJS.Utilities.hasClass(elementToFocus, MS.Entertainment.UI.Framework.TabConstrainer.lastDivClass))
                            continue;
                    elementToFocus.focus();
                    if (elementToFocus === document.activeElement || MS.Entertainment.UI.Framework.focusedItemInContainer(element)) {
                        successfullyFocused = true;
                        break
                    }
                }
                if (!successfullyFocused)
                    if (firstDiv) {
                        firstDiv.focus();
                        successfullyFocused = (firstDiv === document.activeElement)
                    }
                return successfullyFocused
            }, tryAndFocusElementInSubTreeWithTimer: function tryAndFocusElementInSubTreeWithTimer(tree, timeout) {
                MS.Entertainment.UI.Framework.assert(timeout > -1, "Invalid timeout provided to try and set focus");
                MS.Entertainment.UI.Framework.assert(tree, "Need a valid tree to try and set focus");
                if (timeout < 0)
                    return WinJS.Promise.as();
                if (!tree)
                    return WinJS.Promise.as();
                return WinJS.Promise.timeout(timeout).then(function trySetFocusOnTimeoutComplete() {
                        if (MS.Entertainment.UI.Framework.focusedItemInContainer(tree))
                            return;
                        MS.Entertainment.UI.Framework.focusFirstInSubTree(tree)
                    })
            }, focusedItemInContainer: function focusedItemInContainer(container) {
                if (document.activeElement)
                    if (container.contains(document.activeElement) && !(WinJS.Utilities.hasClass(document.activeElement, MS.Entertainment.UI.Framework.TabConstrainer.firstDivClass) || WinJS.Utilities.hasClass(document.activeElement, MS.Entertainment.UI.Framework.TabConstrainer.lastDivClass)))
                        return true;
                return false
            }, focusFirstFocusableAncestor: function focusFirstFocusableAncestor(element) {
                var ancestor = element;
                do {
                    if (ancestor.domElement)
                        ancestor = ancestor.domElement;
                    if (excludeNonFocusableElements(ancestor)) {
                        ancestor.focus();
                        break
                    }
                    ancestor = ancestor.parentNode
                } while (ancestor)
            }, currentContentContainer: null, currentOverlayContainer: {get: function currentOverlayContainer_get() {
                    var currentIndex = currentOverlayContainers.length - 1;
                    return currentOverlayContainers[currentIndex]
                }}, currentFocusContainer: {get: function currentFocusContainer_get() {
                    return MS.Entertainment.UI.Framework.currentOverlayContainer || MS.Entertainment.UI.Framework.currentContentContainer
                }}, addOverlayContainer: function addOverlayContainer(container) {
                if (MS.Entertainment.UI.Framework.currentOverlayContainer && MS.Entertainment.UI.Framework.currentOverlayContainer.setAttribute)
                    MS.Entertainment.UI.Framework.currentOverlayContainer.setAttribute("aria-hidden", "true");
                currentOverlayContainers.push(container)
            }, removeOverlayContainer: function removeOverlayContainer(container) {
                var indexOfItemToRemove = currentOverlayContainers.indexOf(container);
                if (indexOfItemToRemove < 0)
                    return;
                currentOverlayContainers.splice(indexOfItemToRemove, 1);
                if (MS.Entertainment.UI.Framework.currentOverlayContainer && MS.Entertainment.UI.Framework.currentOverlayContainer.setAttribute)
                    MS.Entertainment.UI.Framework.currentOverlayContainer.setAttribute("aria-hidden", "false")
            }, focusElement: function focusIfShouldMove(elementToFocus) {
                if (!MS.Entertainment.UI.Framework.canMoveFocus(elementToFocus))
                    return;
                elementToFocus.focus()
            }, canMoveFocus: function canMoveFocus(targetContainer) {
                var focusContainer = MS.Entertainment.UI.Framework.currentFocusContainer;
                if (focusContainer && !focusContainer.contains(targetContainer))
                    return false;
                return true
            }, setFocusRoot: function setFocusRoot(prospectiveFocusRoot) {
                var currentContentContainer = MS.Entertainment.UI.Framework.currentContentContainer || document.querySelector(".pageContainer.currentPage");
                if (!prospectiveFocusRoot || !MS.Entertainment.UI.Framework.checkIfInDom(prospectiveFocusRoot) || (currentContentContainer !== prospectiveFocusRoot) || !currentContentContainer.contains(prospectiveFocusRoot))
                    prospectiveFocusRoot = currentContentContainer;
                var overlay = MS.Entertainment.UI.Framework.currentOverlayContainer;
                if (overlay && !overlay.contains(prospectiveFocusRoot))
                    prospectiveFocusRoot = overlay;
                MS.Entertainment.UI.Framework.assert(prospectiveFocusRoot, "Some how, we ended up without a focus root to set");
                if (WinJS.UI.AutomaticFocus)
                    WinJS.UI.AutomaticFocus.focusRoot = prospectiveFocusRoot
            }, resetFocusToTopMostContent: function resetFocusToTopMostContent() {
                var focusTarget = MS.Entertainment.UI.Framework.currentContentContainer;
                if (MS.Entertainment.UI.Framework.currentOverlayContainer)
                    focusTarget = MS.Entertainment.UI.Framework.currentOverlayContainer;
                var currentFocusedElementDetails = "No Focused element";
                if (document.activeElement)
                    currentFocusedElementDetails = "ClassName: " + document.activeElement.className + ", " + "ID: " + document.activeElement.id;
                MS.Entertainment.UI.Framework.fail("User manually reset focus. Focus was in this location: " + currentFocusedElementDetails);
                MS.Entertainment.UI.Framework.focusFirstInSubTree(focusTarget)
            }
    })
})();
WinJS.Namespace.define("MS.Entertainment.Utilities", {VirtualizedDataSource: WinJS.Class.derive(WinJS.UI.VirtualizedDataSource, function(listDataAdapter, options) {
        if (listDataAdapter && listDataAdapter.createListAdaptor)
            listDataAdapter = listDataAdapter.createListAdaptor();
        this._baseDataSourceConstructor(listDataAdapter, options)
    })});
WinJS.Namespace.define("MS.Entertainment.Utilities", {
    wasNavigatedToDashboard: false, assertIfCalledBeforeCriticalWorkCompleted: function assertIfCalledBeforeCriticalWorkCompleted() {
            var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
            MS.Entertainment.UI.Framework.assert(!MS.Entertainment.Utilities.wasNavigatedToDashboard || uiStateService.isHubStripVisible, "Function was called before all start-up critical work has been completed")
        }
});
WinJS.Namespace.define("MS.Entertainment.Utilities", {
    updateHtmlDirectionAttribute: MS.Entertainment.UI.Framework.updateHtmlDirectionAttribute, getTextDirection: MS.Entertainment.UI.Framework.getTextDirection, TextDirections: MS.Entertainment.UI.Framework.TextDirections, trimCharacterDirection: function trimCharacterDirection(string) {
            if (string) {
                var start = 0;
                var end = string.length;
                var firstChar = string.charCodeAt(0);
                var lastChar = string.charCodeAt(end - 1);
                if (firstChar === String.rtlmCode || firstChar === String.ltrmCode)
                    start++;
                if (lastChar === String.rtlmCode || lastChar === String.ltrmCode)
                    end--;
                if (start !== 0 || end !== string.length)
                    string = string.substr(start, end)
            }
            return string
        }, detectCharacterDirection: function detectCharacterDirection(ch) {
            if (ch < 0x249C) {
                if (ch < 0x200E) {
                    if (ch >= 0x0041 && ch <= 0x005A || ch >= 0x0061 && ch <= 0x007A || ch >= 0x00C0 && ch <= 0x02B8 || ch >= 0x0370 && ch <= 0x0589 || ch >= 0x0900 && ch <= 0x1FFC)
                        return MS.Entertainment.Utilities.TextDirections.LeftToRight;
                    else if (ch >= 0x0591 && ch <= 0x085E)
                        return MS.Entertainment.Utilities.TextDirections.RightToLeft
                }
                else if (ch >= 0x2090 && ch <= 0x209C || ch >= 0x210A && ch <= 0x2188 || ch >= 0x2336 && ch <= 0x237A || ch === String.ltrmCode)
                    return MS.Entertainment.Utilities.TextDirections.LeftToRight;
                else if (ch === String.rtlmCode)
                    return MS.Entertainment.Utilities.TextDirections.RightToLeft
            }
            else if (ch < 0xFD50) {
                if (ch <= 0x24E9 || (ch >= 0x2800 && ch <= 0x28FF) || (ch >= 0x2C00 && ch <= 0x2DFF) || (ch >= 0x3021 && ch <= 0x4DB5) || (ch >= 0x4E00 && ch <= 0xFB17))
                    return MS.Entertainment.Utilities.TextDirections.LeftToRight;
                else if (ch >= 0xFB1D && ch <= 0xFD3D)
                    return MS.Entertainment.Utilities.TextDirections.RightToLeft
            }
            else if (ch <= 0xFDFC || (ch >= 0xFE70 && ch <= 0xFEFC))
                return MS.Entertainment.Utilities.TextDirections.RightToLeft;
            else if ((ch >= 0xFF21 && ch <= 0xFF3A) || (ch >= 0xFF41 && ch <= 0xFF5A) || (ch >= 0xFF65 && ch <= 0xFFDC))
                return MS.Entertainment.Utilities.TextDirections.LeftToRight;
            return null
        }, detectStringDirection: function detectStringDirection(value, min, max) {
            var char;
            var characterDirection;
            max = isNaN(max) ? value.length : max;
            for (var i = isNaN(min) ? 0 : min; i < max; i++) {
                char = value.charCodeAt(i);
                if (char !== 0x0020 && char !== 0x0009 && char !== 0x000A && char !== 0x000D) {
                    characterDirection = MS.Entertainment.Utilities.detectCharacterDirection(char);
                    if (characterDirection)
                        return characterDirection
                }
            }
            return MS.Entertainment.Utilities.getTextDirection()
        }, needsNormalizedBaseline: function needsNormalizedBaseline(value, min, max) {
            var char;
            max = isNaN(max) ? value.length : max;
            min = isNaN(min) ? 0 : min;
            for (var i = min; i < max; i++) {
                char = value.charCodeAt(i);
                if ((char < 0xAC00 || char > 0xD7AF) && (char !== 0x0020))
                    return false
            }
            return (max - min) ? true : false
        }, verifyUrl: function verifyUrl(value, requireHttps) {
            var requiredHttpsExpression = /^https:\/\//i;
            var anyHttpExpression = /^http[s]?:\/\//i;
            if (requireHttps)
                return requiredHttpsExpression.test(value);
            else
                return anyHttpExpression.test(value)
        }
});
(function() {
    var uniqueInteger = -1;
    WinJS.Namespace.define("MS.Entertainment.Utilities", {getSessionUniqueInteger: function getSessionUniqueInteger() {
            uniqueInteger++;
            return uniqueInteger
        }})
})();
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Framework", {
        beginShowAnimations: function beginShowAnimations(element) {
            return MS.Entertainment.UI.Framework._beginAnimations(element, "data-ent-hideanimation", "data-ent-showanimation")
        }, beginHideAnimations: function beginHideAnimations(element) {
                return MS.Entertainment.UI.Framework._beginAnimations(element, "data-ent-showanimation", "data-ent-hideanimation")
            }, beginEnterAnimations: function beginShowAnimations(element) {
                return MS.Entertainment.UI.Framework._beginAnimations(element, "data-ent-exitanimation", "data-ent-enteranimation")
            }, beginExitAnimations: function beginHideAnimations(element) {
                return MS.Entertainment.UI.Framework._beginAnimations(element, "data-ent-enteranimation", "data-ent-exitanimation")
            }, _beginAnimations: function _beginAnimations(element, oldSelector, newSelector) {
                var hasAnimations = false;
                var promises = [];
                if (MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).animationsEnabled) {
                    MS.Entertainment.UI.Framework.applyWithSelector(element, "[" + oldSelector + "]", function(subElement) {
                        var animationClasses = subElement.getAttribute(oldSelector);
                        if (animationClasses)
                            animationClasses.split(" ").forEach(function(animationClass) {
                                WinJS.Utilities.removeClass(subElement, animationClass)
                            })
                    }, true);
                    MS.Entertainment.UI.Framework.applyWithSelector(element, "[" + newSelector + "]", function(subElement) {
                        if (MS.Entertainment.Utilities.isElementVisible(subElement)) {
                            var animationClasses = subElement.getAttribute(newSelector);
                            if (animationClasses) {
                                var complete;
                                var promise = new WinJS.Promise(function(c, e, p) {
                                        complete = c
                                    });
                                promises.push(promise);
                                var processAnimationAndComplete = function processAnimationAndComplete(animationName) {
                                        var index = animationNames.indexOf(animationName);
                                        if (index > -1) {
                                            animationNames.splice(index, 1);
                                            if (animationNames.length === 0) {
                                                subElement.removeEventListener("animationend", animationComplete);
                                                complete()
                                            }
                                            return true
                                        }
                                        else
                                            return false
                                    };
                                var animationNames = [];
                                var animationComplete = function animationComplete(event) {
                                        if (event.srcElement !== subElement)
                                            return;
                                        if (!processAnimationAndComplete(event.animationName))
                                            if (subElement.currentStyle && subElement.currentStyle.animationName) {
                                                animationNames = subElement.currentStyle.animationName.split(",").map(function(animationName) {
                                                    return animationName.trim()
                                                });
                                                if (!processAnimationAndComplete(event.animationName));
                                                hasAnimations = true
                                            }
                                    };
                                subElement.addEventListener("animationend", animationComplete);
                                animationClasses.split(" ").forEach(function(animationClass) {
                                    WinJS.Utilities.addClass(subElement, animationClass)
                                });
                                if (!hasAnimations) {
                                    animationNames = subElement.currentStyle.msAnimationName.split(",").map(function(animationName) {
                                        return animationName.trim()
                                    });
                                    if (animationNames.length <= 0 || (animationNames.length === 1 && animationNames[0] === "none")) {
                                        subElement.removeEventListener("animationend", animationComplete);
                                        complete()
                                    }
                                    else
                                        hasAnimations = true
                                }
                                if (!hasAnimations) {
                                    var transitionProperties = subElement.currentStyle.msTransitionProperty.split(",").map(function(transitionProperty) {
                                            return transitionProperty.trim()
                                        });
                                    if (transitionProperties.length > 0) {
                                        var transitionComplete = function transitionComplete(event) {
                                                var index = transitionProperties.indexOf(event.propertyName);
                                                if (index > -1) {
                                                    transitionProperties.splice(index, 1);
                                                    if (transitionProperties.length === 0) {
                                                        subElement.removeEventListener("transitionend", transitionComplete);
                                                        complete()
                                                    }
                                                }
                                            };
                                        subElement.addEventListener("transitionend", transitionComplete);
                                        hasAnimations = true
                                    }
                                }
                            }
                        }
                    }, true)
                }
                if (promises.length)
                    return WinJS.Promise.join(promises);
                else
                    return WinJS.Promise.wrap()
            }
    })
})();
WinJS.Namespace.define("MS.Entertainment.UI.Icon", {
    achievements: "\uE288", actionLinkArrow: "\uE26B", actionLinkArrowRTL: "\uE26C", addToCollection: "\uE2B3", addToNowPlaying: {get: function() {
                if (MS.Entertainment.Utilities.isApp2)
                    return MS.Entertainment.UI.Icon.addToNowPlaying2;
                else
                    return MS.Entertainment.UI.Icon.addToNowPlaying1
            }}, addToNowPlaying1: "\uE2AE", addToNowPlaying2: "\uE2E0", addToPlaylist: "\uE2B1", avatarItem: "\uE27B", cloud: "\uE2C1", cloudNotAvailable: "\uE2BF", cloudSyncing: "\uE2DD", close: "\u2715", colorable: "\uE292", details: "\uE28F", downloading: "\uE2BC", downloadingArrowPart: "\uE2BE", downloadingBasePart: "\uE2BD", downChevron: "\uE0A1", feedback: "\uE2E4", flexhub: "\uE2DE", friend: "\uE287", friendPending: "\uE2DC", friendRespond: "\uE289", friendRemove: "\uE28A", friendAdd: "\uE28B", genericVideo: "\uE29D", genericGame: "\uE29E", genericMusic: "\uE29F", game: "\uE279", gameAddon: "\uE277", gameCompare: "\uE286", gameDemo: "\uE276", gameJoin: "\uE278", home: "\uE274", info: "\uE2B6", inlineAchievements: "\uE2A1", inlineAwarded: "\uE2A2", inlineBeacon: "\uE2A3", inlineColorable: "\uE2A4", inlineFriend: "\uE2A8", inlineGame: "\uE2A5", inlineGamerScore: "\uE2A9", inlineError: "\uE2A6", inlineNotification: "\uE2E2", inlineLink: "\uE2A7", inlineLock: "\uE2A0", inlineNowPlaying: "\uE2B4", inlinePoints: "\uE2AA", inlineStreaming: "\uE2AB", modifierAvatarItem: "\uE295", modifierFriend: "\uE296", modifierXbox: "\uE297", modifierPlaylist: "\uE298", modifierAddRing: "\uE299", modifierAddRingPressed: "\uE29A", modifierRemoveRing: "\uE29B", modifierRemoveRingPressed: "\uE29C", musicInCollection: "\uE2C0", menu: "\uE27C", next: "\uE27D", noSelection: "\uE294", notification: "\uE2E5", nowPlayingNext: "\uE097", nowPlayingPrev: "\uE096", pause: "\uE27A", play: "\uE27F", playlist: "\uE28F", photo: "\uE282", previous: "\uE27E", profile: "\uE285", related: "\uE280", repeat: "\uE290", repeatOnce: "\uE291", screenFull: "\uE272", screenNormal: "\uE273", shop: "\uE275", smartDj: {get: function() {
                if (MS.Entertainment.Utilities.isApp2)
                    return MS.Entertainment.UI.Icon.smartDjNoRing;
                else
                    return MS.Entertainment.UI.Icon.smartDjWithRing
            }}, smartDjPressed: {get: function() {
                if (MS.Entertainment.Utilities.isApp2)
                    return MS.Entertainment.UI.Icon.smartDjNoRing;
                else
                    return MS.Entertainment.UI.Icon.smartDjPressedWithRing
            }}, smartDjPressedWithRing: "\uE283", smartDjWithRing: "\uE284", smartDjPressed: "\uE283", smartDjAppbar: {get: function() {
                if (MS.Entertainment.Utilities.isApp2)
                    return MS.Entertainment.UI.Icon.smartDjNoRing;
                else
                    return MS.Entertainment.UI.Icon.smartDjAppbarWithRing
            }}, smartDjAppbarPressed: {get: function() {
                if (MS.Entertainment.Utilities.isApp2)
                    return MS.Entertainment.UI.Icon.smartDjNoRing;
                else
                    return MS.Entertainment.UI.Icon.smartDjAppbarPressedWithRing
            }}, smartDjAppbarWithRing: "\uE2BB", smartDjAppbarPressedWithRing: "\uE2BA", smartDjNoRing: "\uE2DF", streaming: "\uE2E3", smiley: "\uE293", themes: "\uE281", upChevron: "\uE0A0", sendToXbox: "\uE2AC", sendToXboxAdorner: "\uE2AD", sendToXboxAdornerAppbar: "\uE2B9", takeFromXbox: "\uE2AF", takeFromXboxAdorner: "\uE2B0", takeFromXboxAdornerAppbar: "\uE2B8", xbox: "\uE28C", xboxConnect: "\uE28D", xboxConnected: "\uE28E", xboxXenonLogo: String.ltrm + "\u26DD" + "\uD83C" + "\uDFAE", volumeDisabled: "\uE2E6", joystickUp: "\uE2C2", joystickRight: "\uE2C3", joystickDown: "\uE2C4", joystickLeft: "\uE2C5", triggerRight: "\uE2C6", bumperRight: "\uE2C7", bumperLeft: "\uE2C8", triggerLeft: "\uE2C9", clear: "\uE2CA", webHub: "\uE2CB", swap: "\uE2CC", smartGlassGem: "\uE2B7", smartGlassConsole: "\uE2CD", smartGlassSlate: "\uE2CE", buttonBottomRight: "\uE2CF", buttonBottomLeft: "\uE2D0", buttonTopRight: "\uE2D1", buttonTopLeft: "\uE2D2", dpadLeft: "\uE2D3", dpadDown: "\uE2D4", dpadUp: "\uE2D5", dpadRight: "\uE2D6", keyboard: "\uE2D7", touchGuide: "\uE2D8", onscreenCursor: "\uE2D9", xenon: "\uE2DA"
});
if (WinJS.UI.AppBarIcon.previous.indexOf("ms") !== -1)
    (function() {
        delete WinJS.UI.AppBarIcon;
        WinJS.Namespace.define("WinJS.UI.AppBarIcon", {
            previous: "", next: "", play: "", pause: "", edit: "", save: "", clear: "", "delete": "", remove: "", add: "", cancel: "", accept: "", more: "", redo: "", undo: "", home: "", up: "", forward: "", right: "", back: "", left: "", favorite: "", camera: "", settings: "", video: "", sync: "", download: "", mail: "", find: "", help: "", upload: "", emoji: "", twopage: "", leavechat: "", mailforward: "", clock: "", send: "", crop: "", rotatecamera: "", people: "", closepane: "", openpane: "", world: "", flag: "", previewlink: "", globe: "", trim: "", attachcamera: "", zoomin: "", bookmarks: "", document: "", protecteddocument: "", page: "", bullets: "", comment: "", mail2: "", contactinfo: "", hangup: "", viewall: "", mappin: "", phone: "", videochat: "", "switch": "", contact: "", rename: "", pin: "", musicinfo: "", go: "", keyboard: "", dockleft: "", dockright: "", dockbottom: "", remote: "", refresh: "", rotate: "", shuffle: "", list: "", shop: "", selectall: "", orientation: "", "import": "", importall: "", browsephotos: "", webcam: "", pictures: "", savelocal: "", caption: "", stop: "", showresults: "", volume: "", repair: "", message: "", page2: "", calendarday: "", calendarweek: "", calendar: "", characters: "", mailreplyall: "", read: "", link: "", accounts: "", showbcc: "", hidebcc: "", cut: "", attach: "", paste: "", filter: "", copy: "", emoji2: "", important: "", mailreply: "", slideshow: "", sort: "", manage: "", allapps: "", disconnectdrive: "", mapdrive: "", newwindow: "", openwith: "", contactpresence: "", priority: "", uploadskydrive: "", gototoday: "", font: "", fontcolor: "", contact2: "", folder: "", audio: "", placeholder: "", view: "", setlockscreen: "", settile: "", cc: "", stopslideshow: "", permissions: "", highlight: "", disableupdates: "", unfavorite: "", unpin: "", openlocal: "", mute: "", italic: "", underline: "", bold: "", movetofolder: "", likedislike: "", dislike: "", like: "", alignright: "", aligncenter: "", alignleft: "", zoom: "", zoomout: "", openfile: "", otheruser: "", admin: "", street: "", map: "", clearselection: "", fontdecrease: "", fontincrease: "", fontsize: "", cellphone: "", reshare: "", tag: "", repeatone: "", repeatall: "", outlinestar: "", solidstar: "", calculator: "", directions: "", target: "", library: "", phonebook: "", memo: "", microphone: "", postupdate: "", backtowindow: "", fullscreen: "", newfolder: "", calendarreply: "", unsyncfolder: "", reporthacked: "", syncfolder: "", blockcontact: "", switchapps: "", addfriend: "", touchpointer: "", gotostart: "", zerobars: "", onebar: "", twobars: "", threebars: "", fourbars: ""
        })
    })();
WinJS.Namespace.define("MS.Entertainment.UI", {FWLink: {
        musicLibraries: "http://go.microsoft.com/fwlink/?LinkId=231829", videoLibraries: "http://go.microsoft.com/fwlink/?LinkId=267525", learnMore: "http://go.microsoft.com/fwlink/?LinkId=267489", cloudGrovelLearnMore: "http://go.microsoft.com/fwlink/?LinkId=280203", cloudGrovelPartialMatchLearnMore: "http://go.microsoft.com/fwlink/?LinkId=286257", advertisementReason: "http://go.microsoft.com/fwlink/?LinkID=282137", musicIntro: "http://go.microsoft.com/fwlink/?LinkID=285375"
    }})
