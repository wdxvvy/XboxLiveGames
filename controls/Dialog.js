/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Controls/overlay.js", "/Framework/corefx.js", "/Framework/debug.js", "/Framework/stringids.js", "/Framework/utilities.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {Dialog: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.Overlay, "Controls/Dialog.html#dialogTemplate", function dialogConstructor(element, options) {
        this._updatePosition = this._updatePosition.bind(this);
        this.lightDismissEnabled = false;
        this._setInitialButtons();
        this.bind("width", this._updatePosition);
        this.bind("height", this._updatePosition)
    }, {
        _eventHandlers: null, autoSetFocus: false, initialize: function initialize() {
                MS.Entertainment.UI.Controls.Overlay.prototype.initialize.call(this);
                var that = this;
                var onCancel = function onCancel() {
                        var cancelButtonIndex = that.cancelButtonIndex;
                        if (that.cancelButtonIndex === undefined)
                            cancelButtonIndex = that.buttons.length - 1;
                        if (cancelButtonIndex >= 0 && cancelButtonIndex < that.buttons.length) {
                            var cancelButton = that.buttons[cancelButtonIndex];
                            if (cancelButton && cancelButton.isAvailable && cancelButton.isEnabled && cancelButton.doExecute)
                                cancelButton.doExecute()
                        }
                    }.bind(this);
                this._eventHandlers = MS.Entertainment.Utilities.addEventHandlers(this.domElement, {
                    keypress: function onKeyPress(event) {
                        if (event.keyCode === WinJS.Utilities.Key.escape && that.buttons)
                            onCancel()
                    }.bind(this), keydown: function onKeyDown(event) {
                            if (event.keyCode === WinJS.Utilities.Key.dismissButton) {
                                event.stopPropagation();
                                onCancel()
                            }
                        }.bind(this)
                });
                this.domElement.attachEvent("onresize", this._updatePosition);
                this.overlayContainer.setAttribute("aria-label", this.title);
                if (this.automationId)
                    this.overlayContainer.setAttribute("data-win-automationid", this.automationId);
                var updateButtons = this._updateButtons.bind(this);
                this.bind("buttons", updateButtons);
                this.bind("defaultButtonIndex", updateButtons)
            }, unload: function unload() {
                this.domElement.detachEvent("onresize", this._updatePosition);
                if (this._eventHandlers) {
                    this._eventHandlers.cancel();
                    this._eventHandlers = null
                }
                MS.Entertainment.UI.Controls.Overlay.prototype.unload.call(this)
            }, show: function show() {
                var promise = MS.Entertainment.UI.Controls.Overlay.prototype.show.call(this);
                MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.typeToSearch).disableTypeToSearch();
                MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar).hide();
                return promise
            }, hide: function hide() {
                MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.typeToSearch).enableTypeToSearch();
                return MS.Entertainment.UI.Controls.Overlay.prototype.hide.apply(this, arguments)
            }, _setInitialButtons: function _setInitialButtons() {
                if (!this.buttons)
                    this.buttons = [{
                            title: String.load(String.id.IDS_CLOSE_BUTTON), isEnabled: true, isAvailable: true, execute: function onClose(overlay) {
                                    overlay.hide()
                                }
                        }]
            }, _updateButtons: function _updateButtons() {
                if (this.buttons) {
                    var that = this;
                    function nonObservableSetProperty(instance, property, value) {
                        instance[property] = value
                    }
                    function observableSetProperty(instance, property, value) {
                        instance.addProperty(property, value)
                    }
                    this.buttons.forEach(function(item) {
                        var setProperty = nonObservableSetProperty;
                        if (item !== WinJS.Binding.unwrap(item))
                            setProperty = observableSetProperty;
                        MS.Entertainment.UI.Controls.assert(typeof item.title === "string", "Dialog: Button title property is not a string");
                        MS.Entertainment.UI.Controls.assert(typeof item.execute === "function", "Dialog: Button execute property is not a function");
                        if (item.isEnabled === undefined)
                            setProperty(item, "isEnabled", true);
                        if (item.isAvailable === undefined)
                            setProperty(item, "isAvailable", true);
                        if (item !== WinJS.Binding.unwrap(item)) {
                            item.bind("isEnabled", function() {
                                setProperty(item, "isDisabled", !item.isEnabled)
                            });
                            item.bind("isAvailable", function() {
                                setProperty(item, "isHidden", !item.isAvailable)
                            })
                        }
                        else {
                            setProperty(item, "isDisabled", !item.isEnabled);
                            setProperty(item, "isHidden", !item.isAvailable)
                        }
                        setProperty(item, "isDefault", false);
                        setProperty(item, "buttonType", "button");
                        setProperty(item, "doExecute", WinJS.Utilities.markSupportedForProcessing(function onClick() {
                            if (item.isAvailable && item.isEnabled)
                                item.execute(that)
                        }))
                    });
                    var defaultIndex = this.defaultButtonIndex;
                    if (this.defaultButtonIndex === undefined)
                        this.defaultButtonIndex = defaultIndex = 0;
                    if (defaultIndex >= 0 && defaultIndex < that.buttons.length) {
                        var defaultButton = this.buttons[defaultIndex];
                        defaultButton.isDefault = true;
                        defaultButton.buttonType = "submit"
                    }
                }
                if (this._buttonList)
                    this._buttonList.dataSource = this.buttons
            }, _updatePosition: function _updatePosition() {
                if (this.width) {
                    MS.Entertainment.UI.Controls.assert(typeof this.width === "string", "Dialog 'width' property is not a string");
                    if (this.width.indexOf("%") > 0)
                        this.left = this.right = (100 - parseInt(this.width)) / 2 + "%";
                    else
                        this.left = this.right = (window.outerWidth - parseInt(this.width)) / 2 + "px"
                }
                if (this.height) {
                    MS.Entertainment.UI.Controls.assert(typeof this.height === "string", "Dialog 'height' property is not a string");
                    if (this.height.indexOf("%") > 0)
                        this.top = this.bottom = (100 - parseInt(this.height)) / 2 + "%";
                    else
                        this.top = this.bottom = (window.outerHeight - parseInt(this.height)) / 2 + "px"
                }
            }, _handleButtonClick: function _handleButtonClick(e) {
                if (e && e.target && e.target.performClick)
                    e.target.performClick()
            }
    }, {
        title: null, buttons: null, defaultButtonIndex: undefined, cancelButtonIndex: undefined, width: undefined, height: undefined
    }, {
        dialogFormSubmit: function dialogFormSubmit(){}, focusDefaultItemWhenCreated: WinJS.Utilities.markSupportedForProcessing(function(container, item) {
                if (item.isDefault)
                    WinJS.Promise.timeout(100).then(function() {
                        if (container.firstElementChild)
                            MS.Entertainment.UI.Framework.focusElement(container.firstElementChild)
                    })
            })
    })})
