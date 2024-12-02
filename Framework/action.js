/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/debug.js", "/Framework/utilities.js", "/Framework/actionIdentifiers.js");
(function() {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Actions");
    WinJS.Namespace.define("MS.Entertainment.UI.Actions", {
        ActionArray: WinJS.Class.derive(Array, null, {
            subActions: null, actionsWithSubActions: null, pushSubAction: function addSubAction(actionId, subActionId) {
                    MS.Entertainment.UI.Actions.assert(actionId, "actionId must be defined");
                    MS.Entertainment.UI.Actions.assert(subActionId, "subActionId must be defined");
                    this.actionsWithSubActions = this.actionsWithSubActions || [];
                    this.subActions = this.subActions || {};
                    if (!this.subActions[actionId])
                        this.actionsWithSubActions.push(actionId);
                    this.subActions[actionId] = this.subActions[actionId] || [];
                    this.subActions[actionId].push(subActionId)
                }, hasSubActions: function hasSubActions(actionId) {
                    MS.Entertainment.UI.Actions.assert(actionId, "actionId must be defined");
                    return this.subActions && this.subActions[actionId] && this.subActions[actionId].length > 0
                }
        }, {areSubActionsEqual: function areSubActionsEqual(actionArray1, actionArray2) {
                var arraysAreEqual = true;
                var subActions1 = (actionArray1 && actionArray1.subActions) || {};
                var subActions2 = (actionArray2 && actionArray2.subActions) || {};
                var actionsWithSubActions1 = (actionArray1 && actionArray1.actionsWithSubActions) || [];
                var actionsWithSubActions2 = (actionArray2 && actionArray2.actionsWithSubActions) || [];
                var subActionValues1;
                var subActionValues2;
                if (actionsWithSubActions1.length !== actionsWithSubActions2.length)
                    arraysAreEqual = false;
                else
                    for (var i = 0; arraysAreEqual && i < actionsWithSubActions1.length; i++) {
                        subActionValues1 = subActions1[actionsWithSubActions1[i]];
                        subActionValues2 = subActions1[actionsWithSubActions2[i]];
                        for (var j = 0; j < subActionValues1.length; j++)
                            if (subActionValues1[j] !== subActionValues2[j]) {
                                arraysAreEqual = false;
                                break
                            }
                    }
                return arraysAreEqual
            }}), ExecutionLocation: {
                activity: "activity", canvas: "canvas", engage: "engage", gallery: "gallery", invokeInline: "invokeInline", opportunity: "opportunity", popover: "popover", selection: "selection", nowPlaying: "nowPlaying"
            }, ActionWrapperType: {
                appbarAction: "appbarAction", button: "button"
            }, ActionService: WinJS.Class.define(function actionServiceConstructor() {
                this._actionFactories = {}
            }, {
                _actionFactories: null, register: function register(id, factory) {
                        MS.Entertainment.UI.Actions.assert(MS.Entertainment.UI.Actions.ActionIdentifiers.hasOwnProperty(id), "Identifier wasn't found in action list: " + id);
                        MS.Entertainment.UI.Actions.assert(!this._actionFactories.hasOwnProperty(id), "This action identifier has already been registered: " + id);
                        MS.Entertainment.UI.Actions.assert(typeof factory === "function", "Factory method was not a function");
                        this._actionFactories[id] = factory
                    }, isRegistered: function isRegistered(id) {
                        return this._actionFactories.hasOwnProperty(id)
                    }, getAction: function getAction(id) {
                        if (!this._actionFactories.hasOwnProperty(id))
                            throw"Supplied Action Identifier was not registered: " + id;
                        var newAction = this._actionFactories[id]();
                        newAction.id = id;
                        return newAction
                    }, _unregister: function _unregister(id) {
                        delete this._actionFactories[id]
                    }
            })
    });
    MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.actions, function actionServiceFactory() {
        return new MS.Entertainment.UI.Actions.ActionService
    }, true);
    WinJS.Namespace.define("MS.Entertainment.UI.Actions", {
        Action: MS.Entertainment.defineObservable(function actionConstructor() {
            var that = this;
            var firstCall = true;
            this.bind("parameter", function parameterChanged() {
                if (firstCall) {
                    firstCall = false;
                    return
                }
                that.requeryCanExecute()
            })
        }, {
            parameter: null, isAvailable: true, isEnabled: true, title: null, subActions: null, hasSubActions: false, onComplete: null, onExecuting: null, useRelativePositioning: false, id: null, automationId: null, execute: function execute() {
                    var result;
                    var onExecuting;
                    this.requeryCanExecute();
                    if (this.isEnabled && this.executed) {
                        var eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell;
                        eventProvider.traceAction_Invoked(this.id);
                        onExecuting = this.onExecuting && this.onExecuting();
                        onExecuting = WinJS.Promise.as(onExecuting);
                        result = onExecuting.then(function onExecutingComplete() {
                            return this.executed(this.parameter)
                        }.bind(this))
                    }
                    MS.Entertainment.Utilities.Telemetry.logCommandClicked(this);
                    return WinJS.Promise.as(result).then(function onComplete() {
                            if (this.onComplete)
                                return this.onComplete();
                            else
                                return WinJS.Promise.wrap()
                        }.bind(this))
                }, requeryCanExecute: function requeryCanExecute() {
                    if (!this.executed) {
                        this.isEnabled = false;
                        return
                    }
                    if (this.canExecute)
                        this.isEnabled = !!this.canExecute(this.parameter)
                }, setSubActions: function setSubActions(newSubActions) {
                    this.subActions = newSubActions
                }
        }), extractMediaItemFromParam: function extractMediaItemFromParam(param) {
                var mediaItem;
                if (param && param.mediaItem)
                    mediaItem = param.mediaItem;
                else
                    mediaItem = param;
                return mediaItem
            }
    });
    WinJS.Namespace.define("MS.Entertainment.UI.Actions", {InvokeAction: MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function invokeAction() {
            this.base();
            this.invoker = new MS.Entertainment.Utilities.EventInvoker
        }, {
            invoker: null, invokeEvent: "invoked", executed: function executed(param) {
                    return this.invoker.dispatchEvent(this.invokeEvent, param)
                }, canExecute: function canExecute(param) {
                    return true
                }
        })});
    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).register(MS.Entertainment.UI.Actions.ActionIdentifiers.invoke, function() {
        return new MS.Entertainment.UI.Actions.InvokeAction
    })
})()
