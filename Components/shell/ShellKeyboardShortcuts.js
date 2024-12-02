/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/serviceLocator.js", "/Framework/action.js", "/Framework/actionidentifiers.js", "/Framework/shortcutmanager.js", "/Monikers.js");
WinJS.Namespace.define("MS.Entertainment.UI.Shell", {createShellKeyboardShortcuts: function createShellKeyboardShortcuts() {
        var shortcutManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.shortcutManager);
        var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
        var monikers = MS.Entertainment.UI.Monikers;
        var navigateBackAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.navigate);
        navigateBackAction.automationId = "keyboardNavigateBack";
        navigateBackAction.parameter = MS.Entertainment.UI.Actions.navigate.NavigateLocation.back;
        if (MS.Entertainment.Utilities.isApp2) {
            var invokeGlobalCommandAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.invokeGlobalCommand);
            var startSearch = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.search);
            startSearch.startWithExistingQuery = true;
            shortcutManager.registerShortcut(MS.Entertainment.Framework.ShortcutCategory.keyboardShortcut, {
                key: WinJS.Utilities.Key.dismissButton, allowInEditControls: false
            }, navigateBackAction);
            shortcutManager.registerShortcut(MS.Entertainment.Framework.ShortcutCategory.keyboardShortcut, {
                key: WinJS.Utilities.Key.invokeGlobalCommand, allowInEditControls: false
            }, invokeGlobalCommandAction);
            shortcutManager.registerShortcut(MS.Entertainment.Framework.ShortcutCategory.keyboardShortcut, {
                alt: true, key: WinJS.Utilities.Key.enter, allowInEditControls: false
            }, invokeGlobalCommandAction);
            shortcutManager.registerShortcut(MS.Entertainment.Framework.ShortcutCategory.keyboardShortcut, {
                key: WinJS.Utilities.Key.searchButton, allowInEditControls: false
            }, startSearch);
            shortcutManager.registerShortcut(MS.Entertainment.Framework.ShortcutCategory.keyboardShortcut, {
                alt: true, key: WinJS.Utilities.Key.y, allowInEditControls: false
            }, startSearch)
        }
        shortcutManager.registerShortcut(MS.Entertainment.Framework.ShortcutCategory.keyboardShortcut, {
            ctrl: true, key: WinJS.Utilities.Key.b, allowInEditControls: false
        }, navigateBackAction);
        shortcutManager.registerShortcut(MS.Entertainment.Framework.ShortcutCategory.keyboardShortcut, {
            key: WinJS.Utilities.Key.backspace, allowInEditControls: false
        }, navigateBackAction);
        shortcutManager.registerShortcut(MS.Entertainment.Framework.ShortcutCategory.keyboardShortcut, {
            alt: true, key: WinJS.Utilities.Key.leftArrow, allowInEditControls: false
        }, navigateBackAction);
        shortcutManager.registerShortcut(MS.Entertainment.Framework.ShortcutCategory.keyboardShortcut, {
            key: WinJS.Utilities.Key.browserBack, allowInEditControls: false
        }, navigateBackAction)
    }})
