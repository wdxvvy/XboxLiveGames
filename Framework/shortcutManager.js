/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/debug.js", "/Framework/servicelocator.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Framework");
WinJS.Namespace.define("MS.Entertainment.Framework", {
    ShortcutCategory: {keyboardShortcut: "keyboardShortcut"}, ShortcutManager: WinJS.Class.define(null, {
            _registeredHandlers: [], _registeredShortcuts: [], blockKeyboardShortcuts: false, registerShortcutCategoryHandler: function registerShortcutCategoryHandler(shortcutCategory, handler) {
                    if (MS.Entertainment.Framework.ShortcutCategory.hasOwnProperty(shortcutCategory)) {
                        var registered = this._getCategoryRegistrationIndex(shortcutCategory);
                        if (registered === -1)
                            if (handler && handler.registerShortcut && handler.unregisterShortcut)
                                this._registeredHandlers.push({
                                    shortcutCategory: shortcutCategory, handler: handler
                                });
                            else
                                MS.Entertainment.Framework.assert(false, "Shortcut Handler does not meet contract");
                        else
                            MS.Entertainment.Framework.assert(false, "Already registered Handler for " + shortcutCategory)
                    }
                    else
                        MS.Entertainment.Framework.assert(false, "Unrecognized shortcut category " + shortcutCategory)
                }, unregisterShortcutCategoryHandler: function unregisterShortcutCategoryHandler(shortcutCategory) {
                    var removed;
                    var index = this._getCategoryRegistrationIndex(shortcutCategory);
                    if (index > -1)
                        removed = this._registeredHandlers.splice(index, 1);
                    if (removed && removed[0] && removed[0].handler && removed[0].handler.dispose)
                        removed[0].handler.dispose()
                }, registerShortcut: function registerShortcut(shortcutCategory, shortcut, action) {
                    if (MS.Entertainment.Framework.ShortcutCategory.hasOwnProperty(shortcutCategory)) {
                        var index = this._getCategoryRegistrationIndex(shortcutCategory);
                        if (index > -1)
                            this._registeredHandlers[index].handler.registerShortcut(shortcut, action);
                        else
                            MS.Entertainment.Framework.assert(false, "No registered Handler for " + shortcutCategory)
                    }
                    else
                        MS.Entertainment.Framework.assert(false, "Unrecognized shortcut category " + shortcutCategory)
                }, unregisterShortcut: function unregisterShortcut(shortcutCategory, shortcut) {
                    var handlerIndex = this._getCategoryRegistrationIndex(shortcutCategory);
                    if (index > -1)
                        var success = this._registeredHandlers[index].handler.unregisterShortcut(shortcut)
                }, _getCategoryRegistrationIndex: function _getCategoryRegistrationIndex(shortcutCategory) {
                    var index = -1;
                    for (var i = 0; i < this._registeredHandlers.length; i++)
                        if (this._registeredHandlers[i].shortcutCategory === shortcutCategory) {
                            index = i;
                            break
                        }
                    return index
                }
        }, null)
});
MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.shortcutManager, function ShortcutManagerFactory() {
    return new MS.Entertainment.Framework.ShortcutManager
})
