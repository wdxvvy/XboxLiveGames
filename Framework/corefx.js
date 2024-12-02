/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    var isInUnitTest = (window.location.pathname === "/bootstrap.html");
    var controlId = 0;
    var pendedControlsWeakRefTable;
    var pendingCleanup = [];
    var pendingCleanupTimer = null;
    var templateCache = {};
    var fragmentCache = {};
    var queuedTemplatesToPreload = [];
    var queuedCriticalTemplatesToPreload = [];
    var currentTextDirection = "";
    var placeholderCssProperties = {
            fontWeight: "font-weight", color: "color", fontSize: "font-size", letterSpacing: "letter-spacing", overflow: "overflow", textOverflow: "-ms-text-overflow", lineHeight: "line-height", whiteSpace: "white-space", backgroundColor: "background-color"
        };
    var bindingElementTargetWeakRefTable;
    function getBindingTargetWeakRefTable() {
        if (!bindingElementTargetWeakRefTable)
            bindingElementTargetWeakRefTable = new MS.Entertainment.UI.Framework.WeakRefTable("about://bindingElementTarget");
        return bindingElementTargetWeakRefTable
    }
    function patchWindowAlert() {
        var alertsToShow = [];
        var dialogVisible = false;
        function showPendingAlerts() {
            if (dialogVisible || !alertsToShow.length)
                return;
            dialogVisible = true;
            new Windows.UI.Popups.MessageDialog(alertsToShow.shift()).showAsync().done(function() {
                dialogVisible = false;
                showPendingAlerts()
            })
        }
        window.alert = function(message) {
            if (window.console && window.console.log)
                window.console.log(message);
            if (!isInUnitTest) {
                alertsToShow.push(message);
                showPendingAlerts()
            }
        }
    }
    if (!window.alert)
        patchWindowAlert();
    var fxassert = function fixupAssertHelper() {
            var existingAssert = WinJS.Utilities.getMember("MS.Entertainment.UI.Framework.assert");
            if (existingAssert)
                fxassert = existingAssert;
            else
                fxassert = localFxassert;
            fxassert.apply(null, arguments)
        };
    function localFxassert(assertion, message) {
        if (assertion)
            return;
        debugger
    }
    {};
    var EventMixinEvent = WinJS.Class.define(function EventMixinEvent_ctor(type, detail, target) {
            this.detail = detail;
            this.target = target;
            this.timeStamp = Date.now();
            this.type = type
        }, {
            bubbles: {
                value: false, writable: false
            }, cancelable: {
                    value: false, writable: false
                }, currentTarget: {get: function() {
                        return this.target
                    }}, defaultPrevented: {get: function() {
                        return this._preventDefaultCalled
                    }}, trusted: {
                    value: false, writable: false
                }, eventPhase: {
                    value: 0, writable: false
                }, target: null, timeStamp: null, type: null, preventDefault: function() {
                    this._preventDefaultCalled = true
                }, stopImmediatePropagation: function() {
                    this._stopImmediatePropagationCalled = true
                }, stopPropagation: function(){}
        }, {supportedForProcessing: false});
    var eventMixin = {
            _eventListeners: null, addEventListener: function(type, listener, useCapture) {
                    useCapture = useCapture || false;
                    this._eventListeners = this._eventListeners || {};
                    var eventListeners = (this._eventListeners[type] = this._eventListeners[type] || []);
                    for (var i = 0, len = eventListeners.length; i < len; i++) {
                        var l = eventListeners[i];
                        if (l.useCapture === useCapture && l.listener === listener)
                            return
                    }
                    eventListeners.push({
                        listener: listener, useCapture: useCapture
                    })
                }, dispatchEvent: function(type, details) {
                    var listeners = this._eventListeners && this._eventListeners[type];
                    if (listeners) {
                        var eventValue = new EventMixinEvent(type, details, this);
                        listeners = listeners.slice(0, listeners.length);
                        for (var i = 0, len = listeners.length; i < len && !eventValue._stopImmediatePropagationCalled; i++)
                            listeners[i].listener(eventValue);
                        return eventValue.defaultPrevented || false
                    }
                    return false
                }, removeEventListener: function(type, listener, useCapture) {
                    useCapture = useCapture || false;
                    var listeners = this._eventListeners && this._eventListeners[type];
                    if (listeners)
                        for (var i = 0, len = listeners.length; i < len; i++) {
                            var l = listeners[i];
                            if (l.listener === listener && l.useCapture === useCapture) {
                                listeners.splice(i, 1);
                                if (listeners.length === 0)
                                    delete this._eventListeners[type];
                                break
                            }
                        }
                }
        };
    var updatePropertyMixin = {
            updateAndNotify: function updateAndNotifyProperty(name, newValue) {
                var storageName = "_" + name;
                var oldValue = this[storageName];
                if (oldValue === newValue)
                    return WinJS.Promise.wrap();
                this[storageName] = newValue;
                return this.dispatchChangeAndNotify(name, newValue, oldValue)
            }, dispatchChangeAndNotify: function dispatchChangeAndNotify(name, newValue, oldValue) {
                    this.dispatchEvent(name + "Changed", {
                        newValue: newValue, oldValue: oldValue
                    });
                    return this.notify(name, newValue, oldValue)
                }
        };
    WinJS.Namespace.define("MS.Entertainment.UI.Framework", {
        RIGHT_MOUSEBUTTON: 2, POINTER_TYPE_TOUCH: 2, flags: {
                attachLargeObjectToUnloadedControl: false, attachCookieToRemovedDomElements: false, dontPendControlUnloadCleanup: false
            }, enableSetImmediateBatching: function enableSetImmediateBatching() {
                var queue = [];
                var originalSetImmediate = window.setImmediate;
                var setImmediateCallback = function setImmediateCallback() {
                        var timeNow = Date.now();
                        do {
                            try {
                                queue[0].callback(queue[0].args)
                            }
                            catch(e) {
                                WinJS.Application.onerror(e)
                            }
                            queue.shift()
                        } while (queue.length && (Date.now() - timeNow) < MS.Entertainment.UI.Framework._setImmediateTimeSlice);
                        if (queue.length)
                            originalSetImmediate(setImmediateCallback)
                    };
                window.setImmediate = function _setImmediate(callback, args) {
                    if (MS.Entertainment.UI.Framework._setImmediateTimeSlice) {
                        queue.push({
                            callback: callback, args: args
                        });
                        if (queue.length === 1)
                            originalSetImmediate(setImmediateCallback)
                    }
                    else
                        originalSetImmediate(callback, args)
                };
                var isInUnitTest = (window.location.pathname === "/bootstrap.html");
                if (!isInUnitTest)
                    MS.Entertainment.UI.Framework.setImmediateMode = MS.Entertainment.UI.Framework.setImmediateModes.startup
            }, setImmediateMode: {set: function setImmediateMode(value) {
                    MS.Entertainment.UI.Framework._setImmediateTimeSlice = value
                }}, setImmediateModes: {
                startup: 300, normal: 100, panning: 0, none: 0
            }, _setImmediateTimeSlice: 0, ObservableBase: WinJS.Class.mix(function observableBaseConstructor(){}, eventMixin, updatePropertyMixin, WinJS.Binding.mixin), EventMixin: eventMixin, UpdatePropertyMixin: updatePropertyMixin, observableProperty: function observableProperty(name, value, makeValueObservable) {
                var storageName = "_" + name;
                return {
                        get: function getter() {
                            if (!(storageName in this))
                                return value;
                            var currentValue = this[storageName];
                            if (makeValueObservable)
                                currentValue = WinJS.Binding.as(currentValue);
                            return currentValue
                        }, set: function setter(newValue) {
                                if (makeValueObservable)
                                    newValue = WinJS.Binding.unwrap(newValue);
                                this.updateAndNotify(name, newValue)
                            }
                    }
            }, derive: function derive(baseClass, constructor, instanceMembers, staticMembers) {
                instanceMembers = instanceMembers || {};
                if (baseClass instanceof Function)
                    instanceMembers.base = function() {
                        var original = this.base;
                        this.base = baseClass.prototype.base;
                        baseClass.apply(this, arguments);
                        this.base = original
                    };
                return WinJS.Class.derive(baseClass, constructor, instanceMembers, staticMembers)
            }, preloadEnabled: false, preloadCriticalEnabled: false, preloadTemplate: function preloadTemplate(template, critical) {
                if (critical && !MS.Entertainment.UI.Framework.preloadCriticalEnabled)
                    queuedCriticalTemplatesToPreload.push(template);
                else if (!critical && !MS.Entertainment.UI.Framework.preloadEnabled)
                    queuedTemplatesToPreload.push(template);
                else
                    MS.Entertainment.UI.Framework.loadTemplate(template, null, true)
            }, unblockCriticalPreloading: function unblockCriticalPreloading() {
                MS.Entertainment.UI.Framework.preloadCriticalEnabled = true;
                var preloads = queuedCriticalTemplatesToPreload;
                queuedCriticalTemplatesToPreload = [];
                preloads.forEach(function(template) {
                    MS.Entertainment.UI.Framework.loadTemplate(template, null, true)
                })
            }, unblockPreloading: function unblockPreloading() {
                MS.Entertainment.UI.Framework.preloadEnabled = true;
                var preloads = queuedTemplatesToPreload;
                queuedTemplatesToPreload = [];
                preloads.forEach(function(template) {
                    MS.Entertainment.UI.Framework.loadTemplate(template, null, true)
                })
            }, parseTemplate: function parseTemplate(templatePath) {
                if (!templatePath)
                    throw new Error("No valid template path supplied");
                var parts = templatePath.split("#", 2);
                var result = {
                        path: parts[0], id: ""
                    };
                if (parts.length > 1)
                    result.id = parts[1];
                return result
            }, loadTemplate: function loadTemplate(templatePath, templateId, skipDefer) {
                var templateParts;
                var templateName;
                var cacheKey;
                if (!templatePath)
                    return WinJS.Promise.as();
                if (!templateId) {
                    templateParts = MS.Entertainment.UI.Framework.parseTemplate(templatePath);
                    templatePath = templateParts.path;
                    templateId = templateParts.id
                }
                if (!templateId)
                    throw new Error("Couldn't find a templateid in the provided path: " + templatePath);
                cacheKey = templatePath + "#" + templateId;
                window.msWriteProfilerMark("corefx:LoadTemplate:" + cacheKey + ",StartTM");
                function getTemplate() {
                    var cachedControl = templateCache[cacheKey];
                    if (cachedControl) {
                        window.msWriteProfilerMark("corefx:LoadTemplate:CompletedFromCache");
                        window.msWriteProfilerMark("corefx:LoadTemplate:" + cacheKey + ",StopTM");
                        return cachedControl
                    }
                    var fragmentPromise = fragmentCache[templatePath];
                    window.msWriteProfilerMark("corefx:LoadTemplate:NotInCache");
                    if (!fragmentPromise) {
                        try {
                            fragmentPromise = WinJS.UI.Fragments.renderCopy(templatePath)
                        }
                        catch(e) {
                            MS.Entertainment.UI.Framework.fail("Failed to renderCopy for " + templatePath + " Error: " + e.toString());
                            return
                        }
                        fragmentCache[templatePath] = fragmentPromise
                    }
                    return fragmentPromise.then(function renderFragment(v) {
                            window.msWriteProfilerMark("corefx:LoadTemplate:FragmentLoaded");
                            var elements = v.querySelectorAll("[data-ent-templateid]");
                            var requestedTemplatePromise;
                            Array.prototype.forEach.call(elements, function instantiateAllTemplatesInFragment(template) {
                                var control = WinJS.UI.process(template);
                                var controlId = template.getAttribute("data-ent-templateid");
                                if (controlId === templateId)
                                    requestedTemplatePromise = control;
                                control.then(function insertTemplateIntoCache(templateInstance) {
                                    return templateCache[templatePath + "#" + controlId] = templateInstance
                                })
                            });
                            if (!requestedTemplatePromise)
                                throw"Could not locate template: " + templateId;
                            window.msWriteProfilerMark("corefx:LoadTemplate:TemplateExtracted");
                            return requestedTemplatePromise
                        }).then(function(processedControl) {
                            fxassert(processedControl, "Template found was not a control");
                            window.msWriteProfilerMark("corefx:LoadTemplate:" + cacheKey + ",StopTM");
                            return (templateCache[cacheKey] = processedControl)
                        })
                }
                if (skipDefer)
                    return WinJS.Promise.as(getTemplate());
                else
                    return WinJS.Promise.timeout().then(getTemplate)
            }, unloadAndAssertIfFails: function unloadAndAssertIfFails(instance) {
                try {
                    instance._unloadBaseCalled = false;
                    instance.unload();
                    fxassert(instance._unloadBaseCalled, "base unload() not called for: " + instance.templateName || instance.itemTemplate || instance.controlName)
                }
                catch(e) {
                    fxassert(false, "Exception unloading control: " + e)
                }
            }, cleanupSingleControl: function cleanupSingleControl(controlToCleanup) {
                if (!controlToCleanup || controlToCleanup._unloaded)
                    return;
                if (controlToCleanup.unload && (controlToCleanup.unload !== MS.Entertainment.UI.Framework._UserControl.prototype.unload))
                    MS.Entertainment.UI.Framework.unloadAndAssertIfFails(controlToCleanup);
                controlToCleanup._unloaded = true;
                if (controlToCleanup._cleanupAttachedEvents)
                    controlToCleanup._cleanupAttachedEvents();
                if (!MS.Entertainment.UI.Framework.flags.dontPendControlUnloadCleanup)
                    pendingCleanup.push(pendedControlsWeakRefTable.set(controlToCleanup))
            }, domElementRemovedHandler: function(evt) {
                if (evt.target.nodeType !== 1)
                    return;
                var element = evt.target;
                if (element.suppressUnload || (element.winControl && (element.winControl instanceof WinJS.UI.AppBar || element.winControl.suppressUnload)) || element.listViewReset || element.listViewItemContainer || (element.firstElementChild && (element.firstElementChild.listViewReset || element.firstElementChild.listViewItemContainer)))
                    return;
                MS.Entertainment.UI.Framework.unloadControlTree(evt.target)
            }, unloadControlTree: function unloadControlTree(element) {
                if (!element)
                    return;
                if (element.firstElementChild)
                    MS.Entertainment.UI.Framework.applyWithSelector(element, "img", function cleanUpImages(item) {
                        if (!(item.winControl && item.winControl.suppressSourceClear)) {
                            item.src = String.empty;
                            item.setAttribute("src", String.empty)
                        }
                    });
                else if (element.tagName && element.tagName === "IMG")
                    if (!(item.winControl && item.winControl.suppressSourceClear)) {
                        element.src = String.empty;
                        element.setAttribute("src", String.empty)
                    }
                var nodes = element.querySelectorAll("[data-win-control]");
                for (var i = nodes.length - 1; i > -1; i--) {
                    var control = nodes[i].winControl;
                    if (!control || control.suppressUnload)
                        continue;
                    MS.Entertainment.UI.Framework.cleanupSingleControl(control)
                }
                if (element.winControl)
                    MS.Entertainment.UI.Framework.cleanupSingleControl(element.winControl);
                if (!MS.Entertainment.UI.Framework.flags.dontPendControlUnloadCleanup) {
                    if (pendingCleanupTimer)
                        clearInterval(pendingCleanupTimer);
                    pendingCleanupTimer = setTimeout(function() {
                        pendingCleanup.forEach(function(item) {
                            var control = pendedControlsWeakRefTable.get(item);
                            if (!control)
                                return;
                            if (control._cleanupSetMembers)
                                control._cleanupSetMembers();
                            control.domElement = null;
                            if (control._parent)
                                control._parent = null
                        });
                        pendingCleanup = []
                    }, MS.Entertainment.UI.Framework.autoCleanupTimeout)
                }
            }, enableAutoControlCleanup: function enableAutoControlCleanup() {
                pendedControlsWeakRefTable = new MS.Entertainment.UI.Framework.WeakRefTable("about://pendingCleanup");
                document.addEventListener("DOMNodeRemoved", MS.Entertainment.UI.Framework.domElementRemovedHandler)
            }, disableAutoControlCleanup: function disableAutoControlCleanup() {
                document.removeEventListener("DOMNodeRemoved", MS.Entertainment.UI.Framework.domElementRemovedHandler)
            }, autoCleanupTimeout: 5000, Placeholder: WinJS.Class.define(function placeholderConstructor(template, replacements) {
                this._template = template;
                this._replacements = replacements
            }, {
                _replacements: null, _template: null, render: function render(container, data) {
                        var renderedPlaceholder = this._replacements.reduce(function replaceTokensInPlaceholder(placeholder, item, index) {
                                var content = WinJS.Utilities.getMember(item, data) || String.empty;
                                if (content)
                                    content = MS.Entertainment.Utilities.simpleEscapeHTML(content);
                                return placeholder.replace("{" + index + "}", content)
                            }, this._template);
                        container.innerHTML = renderedPlaceholder
                    }
            }), getPlaceholderForElement: function getPlaceholderForElement(element) {
                var placeholders = element.querySelectorAll(".placeholderItem");
                if (placeholders.length === 0)
                    return null;
                var template = "<div style='position: relative'>";
                var replacements = [];
                template = Array.prototype.reduce.call(placeholders, function(currentTemplate, item, index) {
                    var style = window.getComputedStyle(item);
                    var pos = MS.Entertainment.Utilities.getRelativeOffset(item, element);
                    var width = WinJS.Utilities.getContentWidth(item);
                    var height = WinJS.Utilities.getContentHeight(item);
                    var memberPath = item.getAttribute("data-ent-placeholderdatapath");
                    var extractedStyles = Object.keys(placeholderCssProperties).reduce(function(styleString, property) {
                            var styleValue = style[property];
                            if (styleValue)
                                styleString += placeholderCssProperties[property] + ": " + styleValue + "; ";
                            return styleString
                        }, String.empty);
                    currentTemplate += "<div style='position: absolute; ";
                    currentTemplate += extractedStyles;
                    currentTemplate += "top: " + (pos.top - 3) + "px; ";
                    currentTemplate += "left: " + (pos.left - 3) + "px; ";
                    currentTemplate += "height: " + height + "px; ";
                    currentTemplate += "width: " + width + "px; ";
                    currentTemplate += "'>";
                    if (memberPath) {
                        currentTemplate += "{" + replacements.length + "}";
                        replacements.push(memberPath)
                    }
                    currentTemplate += "</div>";
                    return currentTemplate
                }, template);
                template += "</div>";
                return new MS.Entertainment.UI.Framework.Placeholder(template, replacements)
            }, WeakRefTable: WinJS.Class.define(function(anchorUri) {
                fxassert(anchorUri, "No anchor URI supplied");
                this._anchor = new Windows.Foundation.Uri(anchorUri)
            }, {
                _anchor: null, _nextKey: 0, set: function set(item, customKey) {
                        var key = customKey || ++this._nextKey;
                        fxassert(item, "Actually need an item to store in the weak ref table");
                        if (!item)
                            return key;
                        if (msSetWeakWinRTProperty)
                            msSetWeakWinRTProperty(this._anchor, key, item);
                        else
                            key = {key: item};
                        return key
                    }, get: function get(key) {
                        fxassert(key, "You need to supply a key");
                        if (!key)
                            return null;
                        if (msGetWeakWinRTProperty)
                            return msGetWeakWinRTProperty(this._anchor, key);
                        return key.item
                    }
            }), ReferenceMap: WinJS.Class.define(function() {
                this._references = [];
                this._values = []
            }, {
                _references: null, _values: null, set: function set(reference, value) {
                        var index = this._references.indexOf(reference);
                        if (index < 0)
                            index = this._references.push(reference) - 1;
                        this._values[index] = value
                    }, get: function get(reference) {
                        var index = this._references.indexOf(reference);
                        if (index < 0)
                            return;
                        {};
                        return this._values[index]
                    }, remove: function remove(reference) {
                        var index = this._references.indexOf(reference);
                        if (index < 0)
                            return;
                        this._references.splice(index, 1);
                        this._values.splice(index, 1)
                    }
            }), bindWorker: function bindWorker(bindable, sourceProperties, handler) {
                if (sourceProperties.length > 1) {
                    var root = {};
                    var current = root;
                    for (var i = 0, length = sourceProperties.length - 1; i < length; i++)
                        current = current[sourceProperties[i]] = {};
                    current[sourceProperties[sourceProperties.length - 1]] = handler;
                    return WinJS.Binding.bind(bindable, root, true)
                }
                else if (sourceProperties.length === 1) {
                    bindable.bind(sourceProperties[0], handler, true);
                    return {cancel: function() {
                                bindable.unbind(sourceProperties[0], handler);
                                this.cancel = function(){}
                            }}
                }
            }, weakElementBindingInitializer: function weakElementBindingInitializer(handler) {
                var elementTargetedHandler = function(source, sourceProperties, dest, destProperties) {
                        var weakRefTable = getBindingTargetWeakRefTable();
                        var id = weakRefTable.set(dest);
                        var propertyPath = destProperties.concat([]);
                        var bindResult;
                        var bindingHandler = function bindingHandler(value) {
                                var targetElement = getBindingTargetWeakRefTable().get(id);
                                if (targetElement)
                                    handler(value, targetElement, propertyPath, source);
                                else if (bindResult) {
                                    bindResult.cancel();
                                    bindResult = null
                                }
                            };
                        bindResult = MS.Entertainment.Utilities.bindWorker(WinJS.Binding.as(source), sourceProperties, bindingHandler);
                        return bindResult
                    };
                return WinJS.Utilities.markSupportedForProcessing(elementTargetedHandler)
            }, thawControlsInSubtree: function thawControlsInSubtree(element) {
                var promisesToWaitOn = [];
                fxassert(element, "No element supplied");
                MS.Entertainment.UI.Framework.applyWithSelector(element, "[data-win-control]", function thawControl(candidateControl) {
                    if (!candidateControl.winControl || !candidateControl.winControl.thaw || (candidateControl.winControl.thaw === MS.Entertainment.UI.Framework._UserControl.prototype.thaw))
                        return;
                    var instance = candidateControl.winControl;
                    instance._thawBaseCalled = false;
                    var thawResult = instance.thaw();
                    fxassert(instance._thawBaseCalled, "base thaw() not called!");
                    if (WinJS.Promise.is(thawResult))
                        promisesToWaitOn.push(thawResult)
                });
                if (promisesToWaitOn.length > 0)
                    return WinJS.Promise.any(promisesToWaitOn);
                else
                    return WinJS.Promise.timeout()
            }, freezeControlsInSubtree: function freezeControlsInSubtree(element) {
                var promises = [];
                fxassert(element, "No element supplied");
                MS.Entertainment.UI.Framework.applyWithSelector(element, "[data-win-control]", function freezeControl(candidateControl) {
                    if (!candidateControl.winControl || !candidateControl.winControl.freeze || (candidateControl.winControl.freeze === MS.Entertainment.UI.Framework._UserControl.prototype.freeze))
                        return;
                    var instance = candidateControl.winControl;
                    instance._freezeBaseCalled = false;
                    var freezeResult = instance.freeze();
                    fxassert(instance._freezeBaseCalled, "base freeze() not called!");
                    if (WinJS.Promise.is(freezeResult))
                        promises.push(freezeResult)
                });
                if (promises.length > 0)
                    return WinJS.Promise.any(promises);
                else
                    return WinJS.Promise.wrap()
            }, applyWithSelector: function(root, query, operation, includeRoot) {
                if (!root || !root.querySelectorAll) {
                    fxassert(false, "No valid root element provided");
                    return
                }
                if (includeRoot)
                    operation(root);
                WinJS.Utilities.query(query, root).forEach(operation)
            }, parseEventAttributes: function parse(input, handlerSource) {
                var pairs;
                var results = [];
                fxassert(input, "No input specified");
                if (!input)
                    return;
                fxassert(handlerSource, "No handler source provided");
                if (!handlerSource)
                    throw"No Handler source provided";
                pairs = input.split(";");
                if (!pairs || pairs.length < 1)
                    return;
                pairs.forEach(function processEventItems(item) {
                    var eventName;
                    var handler;
                    var handlerMember;
                    if (!item)
                        return;
                    var pair = item.split(":");
                    if (!pair || (pair.length !== 2)) {
                        fxassert(false, "Pair couldn't be parsed: " + item);
                        return
                    }
                    handler = pair[1].trim();
                    if (handlerSource) {
                        handlerMember = WinJS.Utilities.getMember(handler, handlerSource);
                        if (handlerMember)
                            handler = handlerMember
                    }
                    eventName = pair[0].trim();
                    results.push({
                        event: eventName, handler: handler
                    })
                });
                return results
            }, processDeclEvents: function processDeclEvents(elementToProcess) {
                fxassert(elementToProcess, "Element was not supplied");
                var control = elementToProcess.winControl;
                if (!control)
                    return;
                var attachedEventsToCleanup = [];
                MS.Entertainment.UI.Framework.applyWithSelector(elementToProcess, "[data-ent-event]", function processDeclEventElement(elementToInspect) {
                    if (elementToInspect.alreadyProcessedForEntEvent)
                        return;
                    var eventAttributeData = elementToInspect.getAttribute("data-ent-event");
                    if (!eventAttributeData)
                        return;
                    elementToInspect.alreadyProcessedForEntEvent = true;
                    var eventsToBind = MS.Entertainment.UI.Framework.parseEventAttributes(eventAttributeData, control);
                    if (!eventsToBind || eventsToBind.length < 1)
                        return;
                    eventsToBind.forEach(function bindEvents(eventInfo) {
                        if (!eventInfo.handler)
                            return;
                        if (typeof eventInfo.handler === "string") {
                            var message = "Unable to find '" + eventInfo.handler + "' on '" + control.toString() + "'";
                            fxassert(false, message);
                            return
                        }
                        var domEventWrapper = function domEventWrapperHandler(evt) {
                                eventInfo.handler.call(control, evt)
                            };
                        elementToInspect.addEventListener(eventInfo.event, domEventWrapper);
                        attachedEventsToCleanup.push({
                            element: elementToInspect, eventName: eventInfo.event, handler: domEventWrapper
                        })
                    })
                });
                if (attachedEventsToCleanup && attachedEventsToCleanup.length)
                    control._attachedEventsToCleanup = attachedEventsToCleanup
            }, processDeclMembers: function(root, target, overwriteExistingMembers) {
                fxassert(target, "No target instance supplied");
                var setMembers = [];
                MS.Entertainment.UI.Framework.applyWithSelector(root, "[data-ent-member]", function processDeclMemberElement(element) {
                    if (element.alreadyProcessedForEntMember)
                        return;
                    var targetMemberName = element.getAttribute("data-ent-member");
                    if (!targetMemberName)
                        return;
                    element.alreadyProcessedForEntMember = true;
                    if (target[targetMemberName] && !overwriteExistingMembers) {
                        fxassert(false, "Target already has a property named '" + targetMemberName + "', skipping");
                        return
                    }
                    var valueToSet = element.winControl || element;
                    target[targetMemberName] = valueToSet;
                    setMembers.push(targetMemberName)
                });
                target._setMembers = setMembers
            }, animationsEnabled: {get: function() {
                    return WinJS.UI.isAnimationEnabled()
                }}, TextDirections: {
                LeftToRight: "ltr", RightToLeft: "rtl"
            }, updateHtmlDirectionAttribute: function updateHtmlDirectionAttribute() {
                var element = document.getElementsByTagName("html")[0];
                fxassert(element, "Where did HTML go? We should have at least one");
                var currentAttributeValue = element.getAttribute("dir");
                var currentStyleValue = element.currentStyle && element.currentStyle.direction;
                if (currentAttributeValue !== currentStyleValue)
                    element.setAttribute("dir", currentStyleValue);
                currentTextDirection = currentStyleValue
            }, getTextDirection: function getTextDirection() {
                return currentTextDirection
            }, markFunctionsOfObjectAsSupportedForProcessing: function markFunctionsOfObjectAsSupportedForProcessing(instance) {
                for (var m in instance)
                    if (instance.hasOwnProperty(m) && (instance[m] instanceof Function))
                        instance[m] = WinJS.Utilities.markSupportedForProcessing(instance[m]);
                return instance
            }, waitForControlToInitialize: function waitForControlToInitialize(elementToWaitOn) {
                var complete;
                var initializedPromise = new WinJS.Promise(function(c, e, p) {
                        complete = c
                    });
                var cleanupAndComplete = function cleanupAndComplete() {
                        elementToWaitOn.removeEventListener("UserControlInitialized", handleControlInitialized);
                        complete()
                    };
                fxassert(elementToWaitOn, "Element needs to be supplied");
                var handleControlInitialized = function handleControlInitialized(event) {
                        if (elementToWaitOn.winControl) {
                            if (elementToWaitOn.winControl === event.userControl)
                                cleanupAndComplete()
                        }
                        else
                            cleanupAndComplete()
                    };
                if (elementToWaitOn.winControl && elementToWaitOn.winControl._initialized)
                    complete();
                else
                    elementToWaitOn.addEventListener("UserControlInitialized", handleControlInitialized);
                return initializedPromise
            }, checkIfInDom: function checkIfInDom(element) {
                var inDom = document.compareDocumentPosition(element) & document.DOCUMENT_POSITION_CONTAINED_BY;
                return !!inDom
            }, forceFullLayout: function forceFullLayout() {
                var forceRelayout = document.body.offsetHeight
            }, empty: function(element) {
                if (!element)
                    return;
                element.innerHTML = String.empty
            }, addEventHandlers: function addEventHandlers(eventSource, events, capture) {
                if (eventSource && events && eventSource.addEventListener)
                    for (var key in events)
                        eventSource.addEventListener(key, events[key], capture || false);
                return {cancel: function() {
                            MS.Entertainment.Utilities.removeEvents(eventSource, events, capture);
                            eventSource = null;
                            events = null
                        }}
            }, removeEvents: function removeEvents(eventSource, events, capture) {
                if (eventSource && events && eventSource.removeEventListener)
                    for (var key in events)
                        eventSource.removeEventListener(key, events[key], capture || false)
            }, scrollIntoViewWithAnimation: function _performScroll(scroller, scrollLeft, ignoreMissingStarts) {
                if (scrollLeft < 0)
                    scrollLeft = 0;
                if (!MS.Entertainment.UI.Framework.animationsEnabled) {
                    scroller.scrollLeft = scrollLeft;
                    return WinJS.Promise.as()
                }
                var scrollLeftDelta = (scroller.scrollLeft - scrollLeft);
                if (MS.Entertainment.UI.Framework.getTextDirection() === MS.Entertainment.UI.Framework.TextDirections.RightToLeft)
                    scrollLeftDelta = -(scroller.scrollLeft - scrollLeft);
                var scrollComplete = scroller.isAnimatingScroll;
                if (!scrollComplete)
                    scrollComplete = MS.Entertainment.UI.Framework.waitForStartedTransitionsToComplete(scroller, ignoreMissingStarts, "scrollAnimation").then(function() {
                        Array.prototype.forEach.call(scroller.children, function(item) {
                            WinJS.Utilities.removeClass(item, "scrollAnimation");
                            item.style.msTransform = ""
                        });
                        scroller.scrollLeft = scroller.targetScrollLeft;
                        scroller.isAnimatingScroll = null
                    }.bind(this));
                else
                    MS.Entertainment.UI.Framework.resetStartedTransitionCount(scroller);
                Array.prototype.forEach.call(scroller.children, function(item) {
                    WinJS.Utilities.addClass(item, "scrollAnimation");
                    if (WinJS.Utilities.hasClass(item, "fixed"))
                        return;
                    var transformStyle = "translateX(" + scrollLeftDelta + "px)";
                    item.style.msTransform = transformStyle
                });
                scroller.targetScrollLeft = scrollLeft;
                scroller.isAnimatingScroll = scrollComplete;
                return scrollComplete
            }, resetStartedTransitionCount: function resetStartedTransitionCount(element) {
                element.startedTransitions = 0
            }, waitForStartedTransitionsToComplete: function waitForStartedTransitionsToComplete(element, ignoreMissingStarts, className) {
                fxassert(element, "Need an element to work with");
                MS.Entertainment.UI.Framework.resetStartedTransitionCount(element);
                var complete;
                var allTransitionsComplete = new WinJS.Promise(function(c, e, p) {
                        complete = c
                    });
                var startHandler = function waitForStartedTransitionsToCompleteStartedHandler(e) {
                        if (className && !WinJS.Utilities.hasClass(e.target, className))
                            return;
                        element.startedTransitions++
                    };
                element.addEventListener("transitionstart", startHandler);
                var endHandler = function waitForStartedTransitionsToCompleteEndedHandler(e) {
                        if (className && !WinJS.Utilities.hasClass(e.target, className))
                            return;
                        if (!ignoreMissingStarts)
                            fxassert(element.startedTransitions, "Expected something to have started before we end");
                        element.startedTransitions--;
                        if (element.startedTransitions > 0)
                            return;
                        element.removeEventListener("transitionstart", startHandler);
                        element.removeEventListener("transitionend", endHandler);
                        complete()
                    };
                element.addEventListener("transitionend", endHandler);
                return allTransitionsComplete
            }, Signal: WinJS.Class.mix(WinJS.Class.define(function() {
                var that = this;
                this._wrappedPromise = new WinJS.Promise(function(c, e, p) {
                    that._complete = c;
                    that._error = e;
                    that._progress = p
                }, this._handleCancelled.bind(this))
            }, {
                _wrappedPromise: null, _complete: null, _completed: false, _error: null, _progress: null, _handleCancelled: function _handleCancelled(e) {
                        this.dispatchEvent("cancelled", {signal: this})
                    }, promise: {get: function() {
                            return this._wrappedPromise
                        }}, complete: function signal_complete(value) {
                        if (this._completed)
                            throw new Error("Cannot complete an already completed promise");
                        this._complete(value);
                        this._completed = true
                    }, error: function signal_error(errorInfo) {
                        this._error(errorInfo)
                    }, progress: function signal_progress(progressInfo) {
                        this._progress(progressInfo)
                    }
            }), WinJS.Utilities.eventMixin), clearCaches: function clearCaches() {
                templateCache = {};
                fragmentCache = {};
                WinJS.UI._disposeControls();
                WinJS.UI.Fragments.clearCache();
                var fakeListView = document.createElement("div");
                fakeListView.style.display = "none";
                fakeListView.id = "fakeListView";
                document.body.appendChild(fakeListView);
                (new WinJS.UI.ListView(fakeListView));
                WinJS.Promise.timeout(1000).done(function() {
                    fakeListView.parentElement.removeChild(fakeListView)
                })
            }
    });
    WinJS.Namespace.define("MS.Entertainment.UI.Framework", {
        _UserControl: WinJS.Class.derive(MS.Entertainment.UI.Framework.ObservableBase, function userControlConstructor(element, options) {
            fxassert(!element.winControl, "This element has already had the control initialized for it. It shouldn't be happening again");
            fxassert(this !== window, "Invoked against global object. Bad");
            this._controlId = ++controlId;
            this.domElement = element;
            this._controlsPendingInitialization = [];
            this._userControlConstructedHandler = this._userControlConstructedHandler.bind(this);
            this.domElement.addEventListener("UserControlConstructed", this._userControlConstructedHandler);
            this._userControlConstructedInitialized = this._userControlConstructedInitialized.bind(this);
            this.domElement.addEventListener("UserControlInitialized", this._userControlConstructedInitialized);
            WinJS.UI.setOptions(this, options);
            element.winControl = this;
            if (this.templateStorage) {
                var domEvent = document.createEvent("Event");
                domEvent.initEvent("UserControlConstructed", true, false);
                domEvent.userControl = this;
                this.domElement.dispatchEvent(domEvent)
            }
        }, {
            _beginInitializeCount: 0, _childControlHandlersAdded: false, _controlId: -1, _controlsPendingInitialization: null, templateStorage: null, templateName: null, domElement: null, _attachedEventsToCleanup: null, _setMembers: null, visibility: {
                    get: function() {
                        if (!this.domElement || !this.domElement.style)
                            return false;
                        var currentStyle = this.domElement.currentStyle;
                        return (currentStyle && currentStyle.visibility !== "hidden" && currentStyle.display !== "none" && currentStyle.opacity !== 0.0)
                    }, set: function(value) {
                            if (!this.domElement)
                                return;
                            var oldValue = this.visibility;
                            if (value)
                                MS.Entertainment.Utilities.showElement(this.domElement);
                            else
                                MS.Entertainment.Utilities.hideElement(this.domElement);
                            if (value !== oldValue)
                                this.notify("visibility", value, oldValue)
                        }, enumerable: true, configurable: false
                }, action: null, _unloadBaseCalled: false, _freezeBaseCalled: false, _thawBaseCalled: false, preventHideDuringInitialize: false, allowAnimations: true, _initialized: false, _unloaded: false, unload: function unload() {
                    this._unloadBaseCalled = true
                }, freeze: function freeze() {
                    this._freezeBaseCalled = true
                }, thaw: function thaw() {
                    this._thawBaseCalled = true
                }, _userControlConstructedHandler: function _userControlConstructedHandler(e) {
                    fxassert(e, "No event args provided to constructor handler");
                    fxassert(e.userControl, "No user control instance provided on event args for control construction");
                    if (e.userControl === this)
                        return;
                    e.stopPropagation();
                    fxassert(!e.userControl._parent, "This control already had a parent set. That doesn't seem right");
                    fxassert(e.userControl !== this, "Why are we hearing about this for ourselves?");
                    e.userControl._parent = this;
                    if (this.ignoreChildrenInitialization)
                        return;
                    fxassert(this._controlsPendingInitialization.indexOf(e.userControl) === -1, "Control was already pending it's initialization");
                    this._controlsPendingInitialization.push(e.userControl)
                }, _userControlConstructedInitialized: function _userControlConstructedInitialized(e) {
                    fxassert(e, "No event args provided to constructor handler");
                    fxassert(e.userControl, "No user control instance provided on event args for control construction");
                    if (e.userControl === this)
                        return;
                    e.stopPropagation();
                    if (this._unloaded)
                        return;
                    if (this.ignoreChildrenInitialization)
                        return;
                    var index = this._controlsPendingInitialization.indexOf(e.userControl);
                    if (index === -1)
                        return;
                    this._controlsPendingInitialization.splice(index, 1);
                    this._completeInitialize()
                }, initialize: function(){}, _completeInitialize: function _completeInitialize() {
                    if ((this._controlsPendingInitialization.length > 0) || (this.templateStorage && !this._templateLoaded))
                        return;
                    if (this._unloaded)
                        return;
                    this.domElement.removeEventListener("UserControlConstructed", this._userControlConstructedHandler);
                    this.domElement.removeEventListener("UserControlInitialized", this._userControlConstructedInitialized);
                    this._initialized = true;
                    var actionName = this.domElement.getAttribute("data-ent-action");
                    if (actionName) {
                        var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                        var action = actionService.getAction(WinJS.Utilities.getMember(actionName));
                        action.bind("isAvailable", function isAvailableChanged(newValue) {
                            var toggleClass = (newValue) ? WinJS.Utilities.removeClass : WinJS.Utilities.addClass;
                            toggleClass(this.domElement, "removeFromDisplay")
                        }.bind(this));
                        this.action = action;
                        this.domElement.removeAttribute("data-ent-action")
                    }
                    if (this.templateStorage || this.processChildren) {
                        MS.Entertainment.UI.Framework.processDeclEvents(this.domElement);
                        MS.Entertainment.UI.Framework.processDeclMembers(this.domElement, this)
                    }
                    if (!this.preventHideDuringInitialize)
                        WinJS.Utilities.removeClass(this.domElement, "hideDuringInitialize");
                    if (this.initialize) {
                        var controlName = ((this.templateStorage && this.templateName) ? this.templateStorage + "#" + this.templateName : this.controlName) + ":" + this._controlId;
                        window.msWriteProfilerMark("corefx:UserControlUserInitialization:" + controlName + ",StartTM");
                        this.initialize();
                        window.msWriteProfilerMark("corefx:UserControlUserInitialization:" + controlName + ",StopTM")
                    }
                    if (this.delayInitialize && !this.enableDelayInitialization)
                        this.delayInitialize();
                    if (this.allowAnimations && MS.Entertainment.UI.Framework.beginShowAnimations)
                        MS.Entertainment.UI.Framework.beginShowAnimations(this.domElement);
                    fxassert(this._controlsPendingInitialization.length === 0, "There were controls pending initialization when this one called it's initializer");
                    var domEvent = document.createEvent("Event");
                    domEvent.initEvent("UserControlInitialized", true, false);
                    domEvent.userControl = this;
                    this.domElement.dispatchEvent(domEvent)
                }, _beginInitialize: function _beginInitialize() {
                    var controlTraceString = (this.controlName || "Non templated control without control name") + ":" + this._controlId;
                    var templateTraceString = this.templateStorage + "#" + this.templateName + ":" + this._controlId;
                    if ((!this.templateStorage) && (this.initialize)) {
                        window.msWriteProfilerMark("corefx:UserControlInitialization: " + controlTraceString + ",StartTM");
                        if (this.deferInitialization) {
                            WinJS.Promise.timeout().then(this._completeInitialize.bind(this));
                            return
                        }
                        this._completeInitialize();
                        window.msWriteProfilerMark("corefx:UserControlInitialization: " + controlTraceString + ",StopTM");
                        return
                    }
                    window.msWriteProfilerMark("corefx:UserControlInitialization: " + controlTraceString + ",StartTM");
                    if (!this.templateStorage)
                        return;
                    window.msWriteProfilerMark("corefx:UserControlInitializationTemplateLoading:" + templateTraceString + ",StartTM");
                    MS.Entertainment.UI.Framework.loadTemplate(this.templateStorage, this.templateName, this._skipDefer).then(function renderControl(controlInstance) {
                        if (this._unloaded)
                            return WinJS.Promise.wrapError({controlUnloaded: true});
                        return controlInstance.render(this, this.domElement)
                    }.bind(this)).then(function appendAndInit(renderedElement) {
                        var targetElement = this.domElement;
                        if (!targetElement.getAttribute("data-win-automationId"))
                            targetElement.setAttribute("data-win-automationId", this.templateName);
                        this._templateLoaded = true;
                        window.msWriteProfilerMark("corefx:UserControlInitializationTemplateLoading:" + templateTraceString + ",StopTM");
                        this._completeInitialize()
                    }.bind(this)).done(null, function error(errorObject) {
                        if (errorObject.controlUnloaded)
                            return;
                        return WinJS.Promise.wrapError(errorObject)
                    }.bind(this))
                }, _cleanupAttachedEvents: function _cleanupAttachedEvents() {
                    if (!this._attachedEventsToCleanup || !this._attachedEventsToCleanup.length)
                        return;
                    this._attachedEventsToCleanup.forEach(function(item) {
                        item.element.removeEventListener(item.eventName, item.handler)
                    });
                    this._attachedEventsToCleanup = []
                }, _cleanupSetMembers: function _cleanupSetMembers() {
                    if (!this._setMembers || !this._setMembers.length)
                        return;
                    this._setMembers.forEach(function(member) {
                        this[member] = null
                    }.bind(this));
                    this._setMembers = []
                }
        }), deriveUserControl: function(userControl, template, constructor, members, observableMembers, statics) {
                var value;
                var templateParts;
                if (template) {
                    templateParts = MS.Entertainment.UI.Framework.parseTemplate(template);
                    members = members || {};
                    if (!members.templateName || !members.templateStorage) {
                        members.templateStorage = templateParts.path;
                        if (templateParts.id)
                            members.templateName = templateParts.id
                    }
                    if (members.templateName)
                        MS.Entertainment.UI.Framework.preloadTemplate(template, members.criticalTemplate)
                }
                return {get: function() {
                            if (!value)
                                value = MS.Entertainment.UI.Framework.deriveUserControlWork(userControl, template, constructor, members, observableMembers, statics);
                            return value
                        }}
            }, deriveUserControlWork: function(userControl, template, constructor, members, observableMembers, statics) {
                if (typeof userControl === "string") {
                    var controlMemberName = userControl;
                    userControl = WinJS.Utilities.getMember(userControl);
                    fxassert(userControl, "Could not resolve user control named " + controlMemberName)
                }
                fxassert(userControl, "User Control was not valid. Can't derive without something to derive from");
                if (members)
                    MS.Entertainment.UI.Framework.markFunctionsOfObjectAsSupportedForProcessing(members);
                if (statics)
                    MS.Entertainment.UI.Framework.markFunctionsOfObjectAsSupportedForProcessing(statics);
                var type = WinJS.Class.derive(userControl, function defineUserControlWrapperConstructor(element, options) {
                        if (this === window)
                            throw new Error("Need to use 'new' to invoke the constructor");
                        element = element || document.createElement("div");
                        if (!this.preventHideDuringInitialize && (!options || !options.preventHideDuringInitialize))
                            WinJS.Utilities.addClass(element, "hideDuringInitialize");
                        if (observableMembers)
                            if (!this._backingData)
                                this._initObservable(Object.create(observableMembers));
                            else {
                                var item;
                                for (item in observableMembers)
                                    if (!(item in this._backingData))
                                        this._backingData[item] = observableMembers[item]
                            }
                        this._beginInitializeCount++;
                        userControl.call(this, element, options);
                        this._beginInitializeCount--;
                        if (typeof constructor === "function") {
                            window.msWriteProfilerMark("corefx:UserControlConstructed:" + (template || this.controlName || "No-template name") + ":" + this._controlId);
                            constructor.call(this, element, options)
                        }
                        if (this._beginInitializeCount === 0)
                            this._beginInitialize()
                    }, members, statics);
                if (observableMembers)
                    type = WinJS.Class.mix(type, WinJS.Binding.expandProperties(observableMembers));
                return type
            }, defineUserControl: function(template, constructor, members, observableMembers, statics) {
                return MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Framework._UserControl, template, constructor, members, observableMembers, statics)
            }
    });
    WinJS.Namespace.define("MS.Entertainment.UI.Framework", {
        BindingBlock: WinJS.Class.define(function(){}, {}, {isDeclarativeControlContainer: true}), UserControl: MS.Entertainment.UI.Framework.defineUserControl(null, function(){}), ImageControl: MS.Entertainment.UI.Framework.defineUserControl(null, function(element, options) {
                this._handleError = this._handleError.bind(this);
                this._handleLoaded = this._handleLoaded.bind(this)
            }, {
                loadDelay: false, _target: null, _loadPromise: null, _handleError: function _handleError(error) {
                        if (!error || error.message !== "Canceled")
                            if (this.domElement) {
                                this.domElement.removeEventListener("error", this._handleError);
                                if (this.errorImage) {
                                    this.domElement.src = this.errorImage;
                                    this.domElement.setAttribute("imageLoaded", String.empty)
                                }
                                else {
                                    this.hide(this.domElement);
                                    this.domElement.removeAttribute("imageLoaded")
                                }
                            }
                    }, _handleLoaded: function _handleLoaded() {
                        if (this.domElement) {
                            this.domElement.removeEventListener("error", this._handleError);
                            this.domElement.removeEventListener("load", this._handleLoaded);
                            this.domElement.setAttribute("imageLoaded", String.empty);
                            this.show(this.domElement)
                        }
                    }, loadImage: function loadImage(target) {
                        return WinJS.Promise.as(target)
                    }, _loadImage: function _loadImage(target) {
                        if (!this._enabled || !this.domElement)
                            return;
                        this.hide(this.domElement);
                        if (!target)
                            return;
                        if (this._loadPromise) {
                            this._loadPromise.cancel();
                            this._loadPromise = null
                        }
                        this._loadPromise = this.loadImage(target).done(function(result) {
                            if (this.domElement) {
                                this.domElement.addEventListener("load", this._handleLoaded);
                                this.domElement.addEventListener("error", this._handleError);
                                this.domElement.src = result
                            }
                            this._loadPromise = null
                        }.bind(this), this._handleError.bind(this))
                    }, hide: function hide(element){}, show: function show(element){}, delayInitialize: function delayInitialize() {
                        if (!this._enabled) {
                            this._enabled = true;
                            this._loadImage(this.target)
                        }
                    }, unload: function unload() {
                        if (this._bindings) {
                            this._bindings.cancel();
                            this._bindings = null
                        }
                        if (this._loadPromise) {
                            this._loadPromise.cancel();
                            this._loadPromise = null
                        }
                        MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                    }, controlName: "ImageControl", desiredImageSize: null, defaultImagePath: null, errorImage: null, imageIdType: null, bindTargetProperties: false, _enabled: false, target: {
                        get: function target_get() {
                            return this._target
                        }, set: function target_set(value) {
                                if (this.target !== value) {
                                    this._target = value;
                                    if (this._bindings) {
                                        this._bindings.cancel();
                                        this._bindings = null
                                    }
                                    if (this._target && this.bindTargetProperties)
                                        this._bindings = WinJS.Binding.bind(this, {target: {imageUri: function() {
                                                    this._loadImage(value)
                                                }.bind(this)}});
                                    else
                                        this._loadImage(value)
                                }
                            }
                    }
            })
    })
})()
