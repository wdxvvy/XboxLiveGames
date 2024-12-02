/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/debug.js", "/Framework/utilities.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI", {
        AppToolbarService: WinJS.Class.define(function AppToolbarServiceConstructor() {
            MS.Entertainment.Utilities.assertIfCalledBeforeCriticalWorkCompleted();
            MS.Entertainment.UI.assert(MS.Entertainment.ViewModels.SmartAppbarActions, "No Smartaction files have been loaded");
            this._availableActions = MS.Entertainment.ViewModels.SmartAppbarActions && MS.Entertainment.ViewModels.SmartAppbarActions.getAppbarActions ? MS.Entertainment.ViewModels.SmartAppbarActions.getAppbarActions() : [];
            this.currentAppbarActions = new MS.Entertainment.ObservableArray;
            this._mediaContextStack = [];
            this.pushDefaultContext()
        }, {
            _availableActions: null, currentAppbarActions: null, _mediaContextStack: null, _resetActionWithSubActions: function _resetActionWithSubActions(action) {
                    if (!action || !action.hasSubActions)
                        return;
                    action.parameter = {};
                    if (action.setSubActions)
                        action.setSubActions([])
                }, pushDefaultContext: function pushDefaultContext(actions) {
                    var actionIds = actions || MS.Entertainment.ViewModels.SmartAppbarActions.defaultActions || [];
                    var mediaContext = this.pushMediaContext(null, null, actionIds, null, 0);
                    return mediaContext
                }, currentMediaContext: {get: function() {
                        MS.Entertainment.UI.assert(this._mediaContextStack.length > 0, "currentMediaContext called when we have no stored mediaContext");
                        return this._mediaContextStack[this._mediaContextStack.length - 1]
                    }}, _setToolbarActions: function _setToolbarActions(actionIds, cookie) {
                    MS.Entertainment.UI.assert(actionIds, "Set called without a valid actionIds array");
                    var mediaContext;
                    var isActiveMediaContent = true;
                    for (var i = this._mediaContextStack.length - 1; i >= 0; i--) {
                        if (this._mediaContextStack[i].cookie === cookie) {
                            mediaContext = this._mediaContextStack[i];
                            break
                        }
                        isActiveMediaContent = false
                    }
                    if (mediaContext)
                        mediaContext.actionIds = actionIds;
                    else
                        MS.Entertainment.UI.fail("Couldn't find mediaContext with cookie: " + cookie);
                    if (isActiveMediaContent) {
                        var i;
                        var enabledActions = {};
                        actionIds.forEach(function addId(id) {
                            MS.Entertainment.UI.assert(id, "Missing action Id");
                            enabledActions[id] = true
                        });
                        for (i = (this.currentAppbarActions.length - 1); i >= 0; i--) {
                            var action = this.currentAppbarActions.item(i).action;
                            if (!enabledActions[action.id]) {
                                this.currentAppbarActions.removeAt(i);
                                this._resetActionWithSubActions(action);
                                if (action.wrappedAction)
                                    this._resetActionWithSubActions(action.wrappedAction)
                            }
                        }
                        var action;
                        var currentIndex = 0;
                        var actionLength = this._availableActions.length;
                        for (i = 0; i < actionLength; i++) {
                            action = this._availableActions[i].action;
                            if (enabledActions[action.id]) {
                                if (this.currentAppbarActions.length <= currentIndex)
                                    this.currentAppbarActions.push({action: action});
                                else if (this.currentAppbarActions.item(currentIndex).action.id !== action.id)
                                    this.currentAppbarActions.insert(currentIndex, {action: action});
                                currentIndex++
                            }
                        }
                        for (i = 0; i < this.currentAppbarActions.length; i++) {
                            var action = this.currentAppbarActions.item(i);
                            action = (action && action.action) || {};
                            var unwrappedAction;
                            if (action.requeryCanExecute)
                                action.requeryCanExecute();
                            unwrappedAction = action.wrappedAction || action;
                            if (mediaContext.actionIds.hasSubActions && mediaContext.actionIds.hasSubActions(action.id))
                                unwrappedAction.setSubActions(mediaContext.actionIds.subActions[action.id])
                        }
                    }
                }, getToolbarAction: function getToolbarAction(id) {
                    var action;
                    var toolbarActions = this._availableActions;
                    for (var key in toolbarActions)
                        if (toolbarActions.hasOwnProperty(key)) {
                            action = toolbarActions[key];
                            if (action.action)
                                action = action.action;
                            if (action.id === id)
                                return action
                        }
                    return null
                }, pushMediaContext: function pushMediaContext(mediaItem, eventHandlers, initialActionIds, options, stackPriority) {
                    var mediaContext;
                    var contextCookie = MS.Entertainment.Utilities.getSessionUniqueInteger();
                    var eventSource = new MS.Entertainment.Utilities.EventSource;
                    if (eventHandlers) {
                        eventHandlers = Array.isArray(eventHandlers) ? eventHandlers : [eventHandlers];
                        for (var i = 0; i < eventHandlers.length; i++)
                            eventSource.addEventHandlers(eventHandlers[i])
                    }
                    MS.Entertainment.UI.assert(!stackPriority || stackPriority >= 0, "Negative stackPriorities are not allowed");
                    MS.Entertainment.UI.assert(!stackPriority, "stack priorities are currently only enabled in companion");
                    mediaContext = {
                        mediaItem: mediaItem || {}, collectionFilter: Microsoft.Entertainment.Queries.MediaAvailability.available, actionIds: initialActionIds || MS.Entertainment.ViewModels.SmartAppbarActions.defaultActions || [], options: options || {executeLocation: MS.Entertainment.UI.Actions.ExecutionLocation.canvas}, stackPriority: stackPriority || 0, _contextRemoved: false, setToolbarActions: function setToolbarActions(actionIds) {
                                this._setToolbarActions(actionIds, mediaContext.cookie)
                            }.bind(this), clearToolbarActions: function clearToolbarActions() {
                                this._setToolbarActions([], mediaContext.cookie)
                            }.bind(this), updateMediaItem: function updateMediaItem(newMediaItem) {
                                mediaContext.mediaItem = newMediaItem
                            }, addEventHandlers: function addEventHandlers(events) {
                                MS.Entertainment.UI.assert(!Array.isArray(events), "Events passed in cannot be an array");
                                return eventSource.addEventHandlers(events)
                            }, dispatchEvent: function dispatchEvent(event, parameters) {
                                MS.Entertainment.UI.assert(event, "event must be defined");
                                eventSource.dispatchEvent(event, parameters)
                            }, clearContext: function clearContext() {
                                if (mediaContext._contextRemoved) {
                                    MS.Entertainment.UI.fail("clearContext called on mediaContext which has already been cleared");
                                    return
                                }
                                MS.Entertainment.UI.assert(this._mediaContextStack.length > 0, "clearContext called when we have no stored mediaContexts");
                                var topRemoved = true;
                                for (var i = this._mediaContextStack.length - 1; i >= 0; i--) {
                                    if (this._mediaContextStack[i].cookie === mediaContext.cookie) {
                                        this._mediaContextStack.splice(i, 1);
                                        mediaContext._contextRemoved = true;
                                        break
                                    }
                                    topRemoved = false
                                }
                                if (topRemoved) {
                                    var newTop = this._mediaContextStack[this._mediaContextStack.length - 1];
                                    newTop.setToolbarActions(newTop.actionIds)
                                }
                                eventSource.dispose()
                            }.bind(this)
                    };
                    Object.defineProperty(mediaContext, "cookie", {get: function() {
                            return contextCookie
                        }});
                    var topItem = this._mediaContextStack[this._mediaContextStack.length - 1] || {stackPriority: 0};
                    if (mediaContext.stackPriority >= topItem.stackPriority)
                        this._mediaContextStack.push(mediaContext);
                    else
                        for (var i = this._mediaContextStack.length - 1; i >= 0; i--)
                            if (mediaContext.stackPriority >= this._mediaContextStack[i].stackPriority) {
                                this._mediaContextStack.splice(i - 1, 0, mediaContext);
                                break
                            }
                    mediaContext.setToolbarActions(mediaContext.actionIds);
                    return mediaContext
                }
        }), ToolbarAction: MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function toolbarActionConstructor() {
                this.base();
                this.isEnabled = true
            }, {
                icon: null, hideOnDisable: false, visibility: null, canExecute: function canExecute(parameter) {
                        return true
                    }
            })
    });
    MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.appToolbar, function AppToolbarServiceFactory() {
        return new MS.Entertainment.UI.AppToolbarService
    })
})()
