/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/utilities.js");
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {EditBox: MS.Entertainment.UI.Framework.defineUserControl("Controls/EditBox.html#editBoxTemplate", function(element, options){}, {
        autoFocus: false, editType: null, maxLength: 10, textChanged: null, input: null, keyUp: null, keyPress: null, select: null, selectionStart: null, selectionEnd: null, validationFailedStyle: "validationFailed", validationFailedText: String.empty, validationFailedStringId: 0, validationExpression: null, emptyStringIsValid: true, showRemainingChars: false, watermarkText: String.empty, watermarkStringId: null, width: null, _control: null, _validationTimeoutInMS: 250, _validationTimeoutPromise: null, _validationRegEx: null, _decimalFormatter: null, _focusHandlers: null, initialize: function initialize() {
                this.reinitialize()
            }, unload: function unload() {
                this.cancelValidationTimeoutPromise();
                if (this._focusHandlers) {
                    this._focusHandlers.cancel();
                    this._focusHandlers = null
                }
                MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
            }, cancelValidationTimeoutPromise: function cancelValidationTimeoutPromise() {
                if (this._validationTimeoutPromise) {
                    this._validationTimeoutPromise.cancel();
                    this._validationTimeoutPromise = null
                }
            }, reinitialize: function create() {
                this.setValue("");
                var hasInputControl = false,
                    hasTextArea = false;
                for (var i = 0; i < this.container.children.length; i++)
                    if (this.container.children[i] === this.inputControl)
                        hasInputControl = true;
                    else if (this.container.children[i] === this.textArea)
                        hasTextArea = true;
                if (this._focusHandlers) {
                    this._focusHandlers.cancel();
                    this._focusHandlers = null
                }
                if (hasInputControl)
                    this.container.removeChild(this.inputControl);
                if (hasTextArea)
                    this.container.removeChild(this.textArea);
                if (this.editType === MS.Entertainment.UI.Controls.EditBox.EditTypes.multiLine) {
                    this.container.insertBefore(this.textArea, this._errorContainer);
                    this._control = this.textArea
                }
                else {
                    this.container.insertBefore(this.inputControl, this._errorContainer);
                    this._control = this.inputControl;
                    switch (this.editType) {
                        case MS.Entertainment.UI.Controls.EditBox.EditTypes.password:
                            this.inputControl.type = "password";
                            break;
                        case MS.Entertainment.UI.Controls.EditBox.EditTypes.number:
                            this.inputControl.type = "number";
                            break;
                        case MS.Entertainment.UI.Controls.EditBox.EditTypes.url:
                            this.inputControl.type = "url";
                            break;
                        case MS.Entertainment.UI.Controls.EditBox.EditTypes.telephone:
                            this.inputControl.type = "tel";
                            break;
                        case MS.Entertainment.UI.Controls.EditBox.EditTypes.search:
                            this.inputControl.type = "search";
                            break;
                        case MS.Entertainment.UI.Controls.EditBox.EditTypes.email:
                            this.inputControl.type = "email";
                            break;
                        default:
                            this.inputControl.type = "text";
                            break
                    }
                }
                this._focusHandlers = MS.Entertainment.Utilities.addEvents(this._control, {
                    focusout: this._handleBlur.bind(this), focusin: this._handleFocus.bind(this)
                });
                if (this.width)
                    this._control.style.width = this.width;
                var watermarkText = this.watermarkText;
                if (this.watermarkStringId) {
                    MS.Entertainment.UI.Controls.assert(!this.watermarkText, "Mixed usage of raw text and stringId as watermark.");
                    watermarkText = String.load(this.watermarkStringId)
                }
                this.setPlaceholderText(watermarkText);
                this._control.setAttribute("maxlength", this.maxLength);
                if (this.autoFocus)
                    this._control.setAttribute("autofocus", true);
                if (this.defaultStringId)
                    this.setValue(String.load(this.defaultStringId));
                else
                    this.setValue(String.empty);
                if (this.showRemainingChars) {
                    this._updateRemainingCharsLabel();
                    WinJS.Utilities.removeClass(this._remainingCharsLabel.domElement, "hidden")
                }
                this.bind("accessibleName", function _updateAccessibilityName() {
                    if (this.accessibleName)
                        this._control.setAttribute("aria-label", this.accessibleName)
                }.bind(this));
                this.bind("accessibleNameStringId", function _updateAccessibilityName() {
                    if (this.accessibleNameStringId)
                        this._control.setAttribute("aria-label", String.load(this.accessibleNameStringId))
                }.bind(this));
                MS.Entertainment.Framework.AccUtils.createAndAddAriaLink(this._control, this.errorControl, "aria-describedby");
                this.bind("isValid", function _updateAccessibilityValidity() {
                    if (typeof this.isValid === "boolean")
                        this._control.setAttribute("aria-invalid", !this.isValid);
                    else
                        this._control.removeAttribute("aria-invalid")
                }.bind(this));
                if (this.rows > 1)
                    this._control.setAttribute("aria-multiline", true)
            }, _handleBlur: function _handleBlur(e) {
                this.isFocused = false
            }, _handleFocus: function _handleFocus(e) {
                this.isFocused = true
            }, setPlaceholderText: function setPlaceholderText(newText) {
                this._control.setAttribute("placeholder", newText)
            }, getValue: function getValue() {
                return this._control.value
            }, setValue: function setValue(text) {
                if (text || text === String.empty)
                    this.value = text;
                this.validateText(this.value);
                if (this.value) {
                    this._control.value = this.value;
                    this.scratchValue = this.value
                }
                if (this.showRemainingChars)
                    this._updateRemainingCharsLabel()
            }, getSelectionStart: function getSelectionStart() {
                return this._control.selectionStart
            }, getSelectionEnd: function getSelectionEnd() {
                return this._control.selectionEnd
            }, setSelectionRange: function setSelectionRange(start, end) {
                this._control.setSelectionRange(start, end)
            }, clearInput: function clearInput() {
                this.textArea.value = "";
                this.inputControl.value = "";
                if (this.showRemainingChars)
                    this._updateRemainingCharsLabel()
            }, setFocus: function setFocus() {
                if (this._control) {
                    MS.Entertainment.UI.Framework.focusElement(this._control);
                    if (document.activeElement !== this._control)
                        WinJS.Promise.timeout(150).done(function _focusEditBoxAfterWait() {
                            MS.Entertainment.UI.Framework.focusElement(this._control)
                        }.bind(this))
                }
            }, onKeyUp: function onKeyUp(e) {
                if (MS.Entertainment.Utilities.isApp2)
                    if (e.keyCode > 10000) {
                        e.preventDefault();
                        return
                    }
                if (this.keyUp)
                    this.keyUp(e);
                if (e.keyCode === WinJS.Utilities.Key.backspace)
                    this.validateText(this._control.value)
            }, onKeyPress: function onKeyPress(e) {
                if (MS.Entertainment.Utilities.isApp2)
                    if (e.keyCode > 10000) {
                        e.preventDefault();
                        return
                    }
                if (this.editType === MS.Entertainment.UI.Controls.EditBox.EditTypes.number) {
                    if (isNaN(e.char))
                        e.preventDefault()
                }
                else if (this.editType === MS.Entertainment.UI.Controls.EditBox.EditTypes.multiLine)
                    if (this.textArea.textContent.length >= this.maxLength)
                        e.preventDefault();
                this.validateText(this._control.value + e.char);
                if (this.keyPress)
                    this.keyPress(e)
            }, onChanged: function onChanged() {
                this.value = this._control.value;
                this.validateText(this.value);
                if (this.textChanged)
                    this.textChanged(this);
                if (this.showRemainingChars)
                    this._updateRemainingCharsLabel()
            }, onInput: function onInput(e) {
                this.scratchValue = this._control.value;
                this.validateText(this.scratchValue);
                if (this.input)
                    this.input(e);
                if (this.showRemainingChars)
                    this._updateRemainingCharsLabel()
            }, onFocus: function onFocus(e) {
                if (this.selectOnFocus && this._control)
                    try {
                        this._control.select()
                    }
                    catch(err) {}
            }, onSelect: function onSelect(e) {
                if (this.select)
                    this.select(e)
            }, setError: function setError(text) {
                this.isValid = false;
                this.errorControl.textContent = text;
                this.errorControl.setAttribute("aria-live", "off");
                this.errorControl.setAttribute("aria-live", "assertive");
                WinJS.Utilities.addClass(this.container, this.validationFailedStyle)
            }, validateText: function validateText(text) {
                var hasError = false;
                if (this.editType === MS.Entertainment.UI.Controls.EditBox.EditTypes.number && isNaN(text)) {
                    this.isValid = false;
                    this.errorControl.textContent = String.load(String.id.IDS_EDITBOX_ERROR_NUMBER);
                    WinJS.Utilities.addClass(this.container, this.validationFailedStyle);
                    return
                }
                if (this.validationExpression !== null) {
                    if (!this._validationRegEx)
                        this._validationRegEx = new RegExp(this.validationExpression);
                    var result = this._validationRegEx.exec(text);
                    if (result === null || result.length === 0 || result[0] !== text) {
                        this.isValid = false;
                        if (text) {
                            MS.Entertainment.UI.Controls.assert(!(this.validationFailedStringId && this.validationFailedText), "Mixed usage of raw text and stringId as error text.");
                            this.errorControl.textContent = (this.validationFailedText) ? this.validationFailedText : String.load(this.validationFailedStringId);
                            WinJS.Utilities.addClass(this.container, this.validationFailedStyle)
                        }
                        return
                    }
                }
                if (!text && !this.emptyStringIsValid)
                    this.isValid = false;
                else
                    this.isValid = true;
                this.errorControl.textContent = String.empty;
                WinJS.Utilities.removeClass(this.container, this.validationFailedStyle)
            }, _updateRemainingCharsLabel: function _updateRemainingCharsLabel() {
                var currentRemaining = 0;
                var text = "";
                var controlText = null;
                if (this._control === this.textArea)
                    controlText = this.textArea.textContent;
                else
                    controlText = this.inputControl.value;
                if (this._control && this._control.placeholder && controlText === this._control.placeholder)
                    currentRemaining = this.maxLength;
                else
                    currentRemaining = this.maxLength - controlText.length;
                if (currentRemaining === 1)
                    text = String.load(String.id.IDS_EDITBOX_SINGLEREMAINING);
                else if (currentRemaining <= 0)
                    text = String.load(String.id.IDS_EDITBOX_ZEROREMAINING);
                else {
                    if (!this._decimalFormatter) {
                        this._decimalFormatter = new Windows.Globalization.NumberFormatting.DecimalFormatter;
                        this._decimalFormatter.fractionDigits = 0
                    }
                    text = String.load(String.id.IDS_EDITBOX_MULTIPLEREMAINING).format(this._decimalFormatter.format(currentRemaining))
                }
                this._remainingCharsLabel.text = text
            }
    }, {
        rows: 1, columns: 30, value: String.empty, scratchValue: String.empty, defaultStringId: null, isValid: false, isFocused: false, selectOnFocus: true, accessibleName: String.empty, accessibleNameStringId: null
    }, {EditTypes: {
            multiLine: "multiLine", number: "number", password: "password", text: "text", url: "url", telephone: "telephone", email: "email", search: "search"
        }})})
