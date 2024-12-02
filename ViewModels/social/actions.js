/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/stringids.js", "/Framework/Utilities.js", "/Framework/observablearray.js");
(function(undefined) {
    WinJS.Namespace.define("MS.Entertainment.Social.PanelActions", {createFriendsPanelActionForSignedInUser: function createFriendsPanelActionForSignedInUser(userXuid, userModel) {
            var navigationAction = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.signInAndOnlineRequiredNavigate);
            navigationAction.title = String.load(String.id.IDS_SEE_ALL_BUTTON);
            navigationAction.parameter = {
                page: "socialFriends", args: {
                        userXuid: userXuid, userModel: userModel
                    }
            };
            navigationAction.disableWhenOffline = true;
            navigationAction.disableOnServicesDisabled = true;
            return {action: navigationAction}
        }});
    WinJS.Namespace.define("MS.Entertainment.Social.PanelActions", {createFriendsPanelActionForFriend: function createFriendsPanelActionForFriend(userXuid, userModel) {
            var navigationAction = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.signInAndOnlineRequiredNavigate);
            navigationAction.title = String.load(String.id.IDS_SEE_ALL_BUTTON);
            navigationAction.parameter = {
                page: "socialFriendsOfFriend", args: {
                        userXuid: userXuid, userModel: userModel
                    }
            };
            navigationAction.disableWhenOffline = true;
            navigationAction.disableOnServicesDisabled = true;
            return {action: navigationAction}
        }});
    WinJS.Namespace.define("MS.Entertainment.Social.Actions", {createButtonAction: function createButtonAction(actionId, titleId, parameter, iconInfo, automationId) {
            var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
            var button = actionService.getAction(actionId);
            if (titleId)
                button.title = String.load(titleId);
            if (parameter)
                button.parameter = parameter;
            if (iconInfo)
                button.iconInfo = iconInfo;
            if (automationId)
                button.automationId = automationId;
            return button
        }})
})()
