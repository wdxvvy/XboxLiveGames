/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Framework/corefx.js", "/Framework/debug.js", "/Framework/navigation.js", "/Framework/utilities.js", "/Controls/Overlay.js");
    var _currentPopOver = null;
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {
        PopOver: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.Overlay, "/Controls/PopOver.html#overlayTemplate", function PopOver_Constructor(element, options) {
            this.domElement.addEventListener("DetailsReady", this._handleDetailsReady.bind(this));
            this._updatePosition = this._updatePosition.bind(this);
            this.domElement.attachEvent("onresize", this._updatePosition);
            this.bind("width", this._updatePosition);
            this.bind("height", this._updatePosition);
            this._bindingsComplete = true;
            if (options && options.presetPreOverlayFocus)
                this._presetPreOverlayFocus = options.presetPreOverlayFocus;
            this._updatePosition()
        }, {
            criticalTemplate: true, dontWaitForContent: true, enableKeyboardLightDismiss: true, setFocusToNavigationService: true, _bindingsComplete: false, _lastWidth: 0, _lastHeight: 0, _lastContainerWidth: 0, _lastContainerHeight: 0, _handleDetailsReady: function _handleDetailsReady() {
                    MS.Entertainment.UI.Framework.focusFirstInSubTree(this.domElement, true)
                }, initialize: function initialize() {
                    MS.Entertainment.UI.Controls.Overlay.prototype.initialize.call(this);
                    this._tabConstrainerHelper.includeAppBarOnLastTab = true
                }, unload: function unload() {
                    this.domElement.detachEvent("onresize", this._updatePosition);
                    MS.Entertainment.UI.Controls.Overlay.prototype.unload.call(this)
                }, _updatePosition: function _updatePosition() {
                    if (!this._bindingsComplete)
                        return;
                    var containerWidth = window.outerWidth;
                    var containerHeight = window.outerHeight;
                    if (this.width && ((this.width !== this._lastWidth) || (containerWidth !== this._lastContainerWidth))) {
                        MS.Entertainment.UI.Controls.assert(typeof this.width === "string", "Dialog 'width' property is not a string");
                        if (this.width.indexOf("%") > 0)
                            this.left = this.right = (100 - parseInt(this.width)) / 2 + "%";
                        else
                            this.left = this.right = (containerWidth - parseInt(this.width)) / 2 + "px";
                        this._lastWidth = this.width;
                        this._lastContainerWidth = containerWidth
                    }
                    if (this.height && ((this.height !== this._lastHeight) || (containerHeight !== this._lastContainerHeight))) {
                        MS.Entertainment.UI.Controls.assert(typeof this.height === "string", "Dialog 'height' property is not a string");
                        if (this.height.indexOf("%") > 0)
                            this.top = this.bottom = (100 - parseInt(this.height)) / 2 + "%";
                        else
                            this.top = this.bottom = (containerHeight - parseInt(this.height)) / 2 + "px";
                        this._lastHeight = this.height;
                        this._lastContainerHeight = containerHeight
                    }
                    var positionCssText = "top: " + this.top + "; left: " + this.left + "; width: " + this.width + "px; height: " + this.height + "px";
                    this.cssPositionText = positionCssText
                }, showAnimation: function showAnimation(element) {
                    return WinJS.Promise.as()
                }
        }, {
            height: "200px", width: "200px", cssPositionText: ""
        }, {
            showPopOver: function showPopOver(data) {
                var result = WinJS.Promise.wrap();
                var appView = Windows.UI.ViewManagement.ApplicationView;
                var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                if (_currentPopOver || (uiStateService.isSnapped && !appView.tryUnsnap()))
                    return result;
                MS.Entertainment.UI.Controls.assert(data, "No data object supplied");
                MS.Entertainment.UI.Controls.assert(data.dataContext, "No data context object supplied");
                MS.Entertainment.UI.Controls.assert(data.dataContext.data, "No data supplied on data context object");
                MS.Entertainment.UI.Controls.assert(data.itemConstructor, "No data Constructor supplied");
                if (!data || !data.dataContext || !data.dataContext.data || !data.itemConstructor)
                    return WinJS.Promise.wrapError("Invalid data to show pop-over");
                var size = (data && data.size) || MS.Entertainment.Utilities.popOverDefaultSize;
                var options = {
                        presetPreOverlayFocus: data.presetPreOverlayFocus, onclose: data.onclose, userControl: data.itemConstructor, userControlOptions: {
                                media: data.dataContext.data, inlineExtraData: data.dataContext.inlineExtraData, originalLocation: data.dataContext.location, collectionFilter: data.dataContext.collectionFilter
                            }, width: size.width ? size.width.toString() : String.empty, height: size.height ? size.height.toString() : String.empty
                    };
                var mediaItem = data.dataContext.data;
                if (mediaItem.serviceType === MS.Entertainment.Data.Augmenter.ServiceTypes.editorialItem)
                    mediaItem = MS.Entertainment.Utilities.convertEditorialItem(mediaItem);
                else {
                    mediaItem.location = data.dataContext.location;
                    mediaItem = MS.Entertainment.ViewModels.MediaItemModel.augment(mediaItem)
                }
                if (mediaItem.hydrate && !mediaItem.hydrated)
                    mediaItem.hydrate().done(null, function error(){});
                MS.Entertainment.Instrumentation.PerfTrack.setStartTime(MS.Entertainment.Instrumentation.PerfTrack.StartPoints.PopoverRequest);
                if (MS.Entertainment.Utilities.isApp2) {
                    var signal = new MS.Entertainment.UI.Framework.Signal;
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigateTo(MS.Entertainment.UI.Monikers.navigationPopover, null, null, {
                        signal: signal, options: options
                    });
                    result = signal.promise
                }
                else {
                    _currentPopOver = new MS.Entertainment.UI.Controls.PopOver(document.createElement("div"), options);
                    result = _currentPopOver.show().then(function() {
                        _currentPopOver = null
                    })
                }
                return result
            }, showNonMediaPopOver: function showNonMediaPopOver(data) {
                    if (_currentPopOver)
                        return WinJS.Promise.wrap();
                    MS.Entertainment.UI.Controls.assert(data, "No data object supplied");
                    MS.Entertainment.UI.Controls.assert(data.itemConstructor, "No data Constructor supplied");
                    var size = (data && data.size) || MS.Entertainment.Utilities.popOverDefaultSize;
                    var options = {
                            presetPreOverlayFocus: data.presetPreOverlayFocus, onclose: data.onclose, userControl: data.itemConstructor, width: size.width ? size.width.toString() : String.empty, height: size.height ? size.height.toString() : String.empty
                        };
                    MS.Entertainment.Instrumentation.PerfTrack.setStartTime(MS.Entertainment.Instrumentation.PerfTrack.StartPoints.PopoverRequest);
                    _currentPopOver = new MS.Entertainment.UI.Controls.PopOver(document.createElement("div"), options);
                    return _currentPopOver.show().then(function() {
                            _currentPopOver = null
                        })
                }, dismissCurrentPopOver: function dismissCurrentPopOver() {
                    if (!_currentPopOver)
                        return WinJS.Promise.wrap();
                    return _currentPopOver.hide()
                }, isPopoverOpen: {get: function get_isPopoverOpen() {
                        return !!_currentPopOver
                    }}
        }), NavigationPopover: MS.Entertainment.UI.Framework.defineUserControl(null, function navigationPopoverConstructor(element, options) {
                var page = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).currentPage;
                this._options = page.options.options;
                this._signal = page.options.signal
            }, {
                _options: null, _signal: null, initialize: function navigationPopoverInitialize() {
                        var childControl = MS.Entertainment.Utilities.instantiateControl(this._options.userControl, this._options.userControlOptions, this._detailsAnchor);
                        if (childControl && childControl.setOverlay)
                            childControl.setOverlay(this)
                    }, unload: function unload() {
                        MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this);
                        this._signal.complete()
                    }, hide: function hide() {
                        var navigateBackAction = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.navigate);
                        navigateBackAction.parameter = MS.Entertainment.UI.Actions.navigate.NavigateLocation.back;
                        navigateBackAction.execute()
                    }, processChildren: true
            }), ShowPopOverAction: MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, null, {
                canExecute: function canExecute() {
                    return this.parameter && this.parameter.itemConstructor && this.parameter.dataContext
                }, executed: function() {
                        MS.Entertainment.UI.Controls.PopOver.showPopOver(this.parameter)
                    }
            })
    });
    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).register(MS.Entertainment.UI.Actions.ActionIdentifiers.showPopOver, function() {
        return new MS.Entertainment.UI.Controls.ShowPopOverAction
    })
})()
