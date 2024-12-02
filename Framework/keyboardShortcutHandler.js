/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/debug.js", "/Framework/serviceLocator.js", "/Framework/shortcutmanager.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Framework");
WinJS.Namespace.define("MS.Entertainment.Framework", {
    KeyboardShortcutModifiers: {
        ctrl: "ctrl", alt: "alt", shift: "shift"
    }, KeyboardShortcutHandler: WinJS.Class.define(function KeyboardShortcutHandler() {
            this._keyModifiers = MS.Entertainment.Framework.KeyboardShortcutModifiers;
            var that = this;
            this._windowEvents = MS.Entertainment.Utilities.addEventHandlers(window, {DOMContentLoaded: function() {
                    if (that._documentEvents) {
                        that._documentEvents.cancel();
                        that._documentEvents = null
                    }
                    that._documentEvents = MS.Entertainment.Utilities.addEventHandlers(document, {keydown: function(event) {
                            var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                            var shortcutManagerService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.shortcutManager);
                            if (!shortcutManagerService.blockKeyboardShortcuts && ((!uiStateService.overlayVisible || event.keyCode === WinJS.Utilities.Key.invokeGlobalCommand) || (MS.Entertainment.Utilities.isApp2 && event.altKey && event.keyCode === WinJS.Utilities.Key.enter))) {
                                var keys = {};
                                if (event.shiftKey)
                                    keys.shift = true;
                                if (event.ctrlKey)
                                    keys.ctrl = true;
                                if (event.altKey)
                                    keys.alt = true;
                                if (event.keyCode)
                                    keys.key = event.keyCode;
                                var index = that._checkShortcutRegistration(keys);
                                if (index > -1) {
                                    var shortcut = that._registeredShortcuts[index];
                                    if (!((MS.Entertainment.Utilities.doesElementSupportKeyboardInput(event.target) || event.target.isContentEditable) && !shortcut.shortcut.allowInEditControls))
                                        shortcut.action.execute()
                                }
                            }
                        }}, false)
                }}, false)
        }, {
            _registeredShortcuts: [], _keyModifiers: null, _windowEvents: null, _documentEvents: null, dispose: function dispose() {
                    if (this._windowEvents) {
                        this._windowEvents.cancel();
                        this._windowEvents = null
                    }
                    if (this._documentEvents) {
                        this._documentEvents.cancel();
                        this._documentEvents = null
                    }
                }, registerShortcut: function registerShortcut(shortcut, action) {
                    if (shortcut && shortcut.key) {
                        var registered = this._checkShortcutRegistration(shortcut);
                        if (registered === -1)
                            this._registeredShortcuts.push({
                                shortcut: shortcut, action: action
                            });
                        else
                            MS.Entertainment.Framework.assert(false, "Shortcut already registered " + shortcut)
                    }
                    else
                        MS.Entertainment.Framework.assert(false, "Invalid shortcut, must not be null and must have a valid key property " + shortcut)
                }, unregisterShortcut: function unregisterShortcut(shortcut) {
                    var index = this._checkShortcutRegistration(shortcut);
                    if (index > -1)
                        this._registeredShortcuts.splice(index, 1)
                }, _checkShortcutRegistration: function _checkShortcutRegistration(shortcut) {
                    var index = -1;
                    var registeredShortcut = null;
                    for (var i = 0; i < this._registeredShortcuts.length; i++) {
                        registeredShortcut = this._registeredShortcuts[i].shortcut;
                        if ((registeredShortcut.alt === shortcut.alt) && (registeredShortcut.ctrl === shortcut.ctrl) && (registeredShortcut.shift === shortcut.shift) && (registeredShortcut.key === shortcut.key)) {
                            index = i;
                            break
                        }
                    }
                    return index
                }
        }, null)
});
(function registerKeyboardShortcutHandler() {
    var shortcutManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.shortcutManager);
    shortcutManager.registerShortcutCategoryHandler(MS.Entertainment.Framework.ShortcutCategory.keyboardShortcut, new MS.Entertainment.Framework.KeyboardShortcutHandler)
})()
