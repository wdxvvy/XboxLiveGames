/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/debug.js", "/Framework/utilities.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {Label: MS.Entertainment.UI.Framework.defineUserControl(null, function labelConstructor(element) {
        MS.Entertainment.Utilities.toggleClassName(this, ["wrap"], this.domElement, "wrap");
        MS.Entertainment.Utilities.toggleClassName(this, ["autoResizeFont"], this.domElement, "autoResizeFont");
        MS.Entertainment.Utilities.toggleClassNameNegate(this, ["clip"], this.domElement, "noClip");
        this.bind("numberOfLines", function setNumberOfLines() {
            if (!this.disableLayoutPass) {
                this._resizeLabel();
                this._beginResizeFont()
            }
        }.bind(this))
    }, {
        controlName: "Label", _displayText: "", _text: null, _stringId: 0, initialize: function initialize() {
                MS.Entertainment.UI.Controls.assert(!this.label, "Label Derivation isn't supported any more")
            }, displayText: {
                get: function() {
                    return this._displayText
                }, set: function(value) {
                        if (this._displayText === value)
                            return;
                        this._displayText = value;
                        if (this.domElement)
                            this.domElement.textContent = value
                    }
            }, text: {
                get: function() {
                    return this._text
                }, set: function(value) {
                        if (this._text === value)
                            return;
                        var oldValue = this._text;
                        this._text = value;
                        this.notify("text", value, oldValue);
                        this._setDisplayTextByText(value)
                    }
            }, _setDisplayTextByText: function _setDisplayTextByText(newValue) {
                if (typeof newValue !== "undefined" && newValue !== null) {
                    MS.Entertainment.UI.Controls.assert(!this.stringId, "Mixed usage of raw text and stringId on a label.");
                    this.displayText = newValue;
                    this._beginResizeFont()
                }
            }, stringId: {
                get: function() {
                    return this._stringId
                }, set: function(value) {
                        if (this._stringId === value)
                            return;
                        var oldValue = this._stringId;
                        this._stringId = value;
                        this.notify("stringId", value, oldValue);
                        this._setDisplayTextByStringId(value)
                    }
            }, _setDisplayTextByStringId: function _setDisplayTextByStringId(newValue) {
                if (newValue) {
                    MS.Entertainment.UI.Controls.assert(!this.text, "Mixed usage of stringId and raw text on a label.");
                    this.displayText = String.load(newValue);
                    this._beginResizeFont()
                }
            }, _resizeLabel: function _resizeLabel() {
                var currentFontSize;
                var currentLineHeight;
                var unitToUse = null;
                var lineSpaceValue = 0;
                var parsedFontSize = null;
                var parsedLineHeight = null;
                var adjustedLineHeightMultiplier = this.lineHeightMultiplier;
                if (this.numberOfLines > 0) {
                    currentFontSize = (this.domElement && this.domElement.currentStyle) ? this.domElement.currentStyle.fontSize : null;
                    if (currentFontSize)
                        parsedFontSize = /^(\d+)\s*(pt|px)$/.exec(currentFontSize);
                    if (parsedFontSize) {
                        currentLineHeight = (this.domElement && this.domElement.currentStyle) ? this.domElement.currentStyle.lineHeight : null;
                        if (currentLineHeight) {
                            parsedLineHeight = /^(\d+)\s*(pt|px)$/.exec(currentLineHeight);
                            if (parsedLineHeight)
                                adjustedLineHeightMultiplier = parsedLineHeight[1] / parsedFontSize[1]
                        }
                        WinJS.Utilities.addClass(this.domElement, "specificLineCount");
                        this.domElement.style.maxHeight = (parsedFontSize[1] * adjustedLineHeightMultiplier * this.numberOfLines).toString() + parsedFontSize[2]
                    }
                }
            }, _beginResizeFont: function _beginResizeFont() {
                if (this.autoResizeFont) {
                    WinJS.Utilities.addClass(this.domElement, "hideFromDisplay");
                    WinJS.Promise.timeout().then(this._resizeFont.bind(this))
                }
            }, _resizeFont: function _resizeFont() {
                var labelDomElement = this.domElement;
                var currentFontSize = this.maxFontSize;
                var containerWidth = this.domElement.clientWidth;
                var containerHeight = this.autoResizeHeight ? this.autoResizeHeight : this.domElement.clientHeight;
                do {
                    labelDomElement.style["font-size"] = currentFontSize + "pt";
                    currentFontSize = currentFontSize - 1
                } while (currentFontSize >= this.minFontSize && (labelDomElement.scrollWidth > containerWidth || labelDomElement.scrollHeight > containerHeight));
                WinJS.Utilities.removeClass(labelDomElement, "hideFromDisplay")
            }
    }, {
        wrap: false, clip: true, autoResizeFont: false, autoResizeHeight: 0, maxFontSize: 10, minFontSize: 10, numberOfLines: 0, lineHeightMultiplier: 1.35, disableLayoutPass: false
    })})
