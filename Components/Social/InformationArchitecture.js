/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/iaservice.js", "/Framework/serviceLocator.js", "/Framework/Data/queries/modelproperties.js", "/Monikers.js", "/ViewModels/social/profilehydrator.js", "/ViewModels/social/actions.js");
(function() {
    function createSocialIa() {
        var ia = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.informationArchitecture);
        var Viewability = MS.Entertainment.InformationArchitecture.Viewability;
        var Node = MS.Entertainment.InformationArchitecture.Node;
        var Monikers = MS.Entertainment.UI.Monikers;
        var Social = MS.Entertainment.Social;
        var demoMode = (new Microsoft.Entertainment.Configuration.ConfigurationManager).shell.retailExperience;
        if (!demoMode) {
            var socialHub = ia.createNode(String.load(String.id.IDS_SOCIAL_PIVOT), Monikers.socialHub);
            var friendsPanel = ia.createNode(String.load(String.id.IDS_FRIENDS_TITLE_LC), Monikers.socialFriendsPanel, "Components/Social/Social.html#dashboardFriendsPanelTemplate");
            friendsPanel.getDataContext = function friendsPanelGetDataContext() {
                var userXuid = Social.Helpers.getNavigationUserXuid();
                var panelAction = MS.Entertainment.Social.PanelActions.createFriendsPanelActionForSignedInUser(userXuid);
                return {panelAction: panelAction}
            };
            friendsPanel.showShadow = false;
            var miniProfilePanel = ia.createNode(String.empty, Monikers.socialMiniProfile, "Components/Social/Social.html#dashboardProfilePanelTemplate");
            miniProfilePanel.getDataContext = function socialGetDataContext() {
                return {doNotRaisePanelReady: true}
            };
            miniProfilePanel.showShadow = false;
            var friendsPage = ia.createNode(String.load(String.id.IDS_SOCIAL_SELF_FRIENDS_TITLE), Monikers.socialFriends, null, {
                    hub: Viewability.hidden, panel: Viewability.hidden
                });
            friendsPage.perfTrackStartPoint = MS.Entertainment.Instrumentation.PerfTrack.StartPoints.FriendsRequest;
            MS.Entertainment.InformationArchitecture.Node.overridePageFragmentUrl(friendsPage, "/Controls/GalleryPage.html");
            friendsPage.useStaticHubStrip = true;
            friendsPage.getDataContext = function friendsPanelGetDataContext() {
                return {
                        userXuid: Social.Helpers.getNavigationUserXuid(), userModel: Social.Helpers.getNavigationUserModel(), doNotRaisePanelReady: true
                    }
            };
            var friendsHub = ia.createNode(String.load(String.id.IDS_FRIENDS_TITLE_LC), Monikers.socialFriendsHub, null, {
                    page: Viewability.hidden, panel: Viewability.hidden
                });
            var friendsGalleryPanel = ia.createNode(String.empty, Monikers.socialFriendsGallery, "Components/Social/friendsPage.html#friendsGalleryPanelTemplate", {
                    page: Viewability.hidden, hub: Viewability.hidden
                });
            friendsGalleryPanel.showShadow = false;
            var pendingFriendsHub = ia.createNode(String.load(String.id.IDS_SOCIAL_PENDING_FRIENDS_TITLE), Monikers.socialPendingFriendsHub, null, {
                    page: Viewability.hidden, panel: Viewability.hidden
                });
            var pendingFriendsGalleryPanel = ia.createNode(String.empty, Monikers.socialPendingFriendsGallery, "Components/Social/friendsPage.html#pendingFriendsGalleryPanelTemplate", {
                    page: Viewability.hidden, hub: Viewability.hidden
                });
            pendingFriendsGalleryPanel.showShadow = false;
            var friendsOfFriendPage = ia.createNode(String.load(String.id.IDS_SOCIAL_SELF_FRIENDS_TITLE), Monikers.socialFriendsOfFriend, null, {
                    hub: Viewability.hidden, panel: Viewability.hidden
                });
            friendsOfFriendPage.useStaticHubStrip = true;
            friendsOfFriendPage.getDataContext = function friendsPanelGetDataContext() {
                return {
                        userXuid: Social.Helpers.getNavigationUserXuid(), userModel: Social.Helpers.getNavigationUserModel(), doNotRaisePanelReady: true
                    }
            };
            var friendsOfFriendHub = ia.createNode(String.load(String.id.IDS_FRIENDS_TITLE_LC), Monikers.socialFriendsOfFriendHub, null, {
                    page: Viewability.hidden, panel: Viewability.hidden
                });
            var friendsOfFriendGalleryPanel = ia.createNode(String.empty, Monikers.socialFriendsOfFriendGallery, "Components/Social/friendsPage.html#friendsOfFriendGalleryPanelTemplate", {
                    page: Viewability.hidden, hub: Viewability.hidden
                });
            friendsOfFriendGalleryPanel.showShadow = false;
            var compareActivitiesPage = ia.createNode(String.load(String.id.IDS_SOCIAL_COMPARE_GAMES_TITLE), Monikers.socialCompareActivitiesPage, null, {
                    hub: Viewability.hidden, panel: Viewability.hidden
                });
            MS.Entertainment.InformationArchitecture.Node.overridePageFragmentUrl(compareActivitiesPage, "/Controls/GalleryPage.html");
            compareActivitiesPage.getDataContext = function friendsPanelGetDataContext() {
                return {
                        userXuid: Social.Helpers.getNavigationUserXuid(), userModel: Social.Helpers.getNavigationUserModel(), doNotRaisePanelReady: true
                    }
            };
            var compareActivitiesHub = ia.createNode(String.load(String.id.IDS_SOCIAL_COMPARE_GAMES_TITLE), Monikers.socialCompareActivitiesHub, null, {
                    page: Viewability.hidden, panel: Viewability.hidden
                });
            var compareActivitiesPanel = ia.createNode(String.empty, Monikers.socialCompareActivitiesPanel, "Components/Social/compareActivitiesGallery.html#compareActivitiesPanelTemplate", {
                    page: Viewability.hidden, hub: Viewability.hidden
                });
            var profilePage = ia.createNode(String.load(String.id.IDS_SOCIAL_PROFILE_TITLE), Monikers.socialProfile, null, {
                    hub: Viewability.hidden, panel: Viewability.hidden
                });
            Node.overridePageFragmentUrl(profilePage, "Components/Social/miniProfileHubStrip.html");
            var profileHub = ia.createNode(String.empty, Monikers.socialProfileHub);
            var profileAvatarPanel = ia.createNode(String.empty, Monikers.socialProfileAvatar, "Components/Social/Social.html#profileDetailsPanelTemplate");
            profileAvatarPanel.getDataContext = function friendsPanelGetDataContext() {
                return {doNotRaisePanelReady: true}
            };
            profileAvatarPanel.showShadow = false;
            var profileFriendsPanel = ia.createNode(String.load(String.id.IDS_FRIENDS_TITLE_LC), Monikers.socialProfileFriendsPanel, "Components/Social/Social.html#profileFriendsPanelTemplate");
            profileFriendsPanel.getDataContext = function friendsPanelGetDataContext() {
                var userXuid = Social.Helpers.getNavigationUserXuid();
                var userModel = Social.Helpers.getNavigationUserModel();
                var panelAction = MS.Entertainment.Social.PanelActions.createFriendsPanelActionForFriend(userXuid, userModel);
                return {
                        panelAction: panelAction, doNotRaisePanelReady: true
                    }
            };
            profileFriendsPanel.showShadow = false;
            var detailsPage = ia.createNode(String.load(String.id.IDS_SOCIAL_ACHIEVEMENTS_PAGE_TITLE), Monikers.socialDetails, null, {
                    hub: Viewability.hidden, panel: Viewability.hidden
                });
            MS.Entertainment.InformationArchitecture.Node.overridePageFragmentUrl(detailsPage, "/Controls/GalleryPage.html");
            detailsPage.useStaticHubStrip = true;
            var achievementsHub = ia.createNode(String.load(String.id.IDS_SOCIAL_ACHIEVEMENTS_PAGE_TITLE), Monikers.socialAchievements, null, {
                    page: Viewability.hidden, panel: Viewability.hidden
                });
            achievementsHub.getDataContext = function socialGetDataContext() {
                var selectAchievement;
                var currentPage = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).currentPage;
                if (currentPage.options && currentPage.options.selectAchievement)
                    selectAchievement = currentPage.options.selectAchievement;
                return {
                        userXuid: Social.Helpers.getNavigationUserXuid(), userModel: Social.Helpers.getNavigationUserModel(), selectAchievement: selectAchievement, doNotRaisePanelReady: true, primaryModifier: WinJS.Binding.as({
                                items: [], selectedItem: null
                            }), secondaryModifier: WinJS.Binding.as({
                                items: [], selectedItem: null
                            }), viewModel: {secondaryModifierLabelOverride: String.id.IDS_MODIFIER_PREFIX_VIEW}
                    }
            };
            var achievementsGalleryPanel = ia.createNode(String.empty, Monikers.socialAchievementsGallery, "Components/Social/achievementPage.html#achievementGalleryTemplate", {
                    page: Viewability.hidden, hub: Viewability.hidden
                });
            var avatarSelectionPage = ia.createNode(String.load(String.id.IDS_AVATAR_EDITOR_SELECT_GENERITAR_TITLE), Monikers.socialAvatarSelectionPage, null, {
                    hub: Viewability.hidden, panel: Viewability.hidden
                });
            var avatarSelectionHub = ia.createNode(String.load(String.id.IDS_AVATAR_EDITOR_SELECT_GENERITAR_TITLE), Monikers.socialAvatarSelectionHub, null, {
                    page: Viewability.hidden, panel: Viewability.hidden
                });
            var avatarSelectionPanel = ia.createNode(String.empty, Monikers.socialAvatarSelectionPanel, "Components/Social/avatarSelectionPage.html#avatarSelectionPageHost", {
                    page: Viewability.hidden, hub: Viewability.hidden
                });
            avatarSelectionPanel.showShadow = false;
            var inboxPage = ia.createNode(String.load(String.id.IDS_SOCIAL_INBOX_TITLE), MS.Entertainment.UI.Monikers.socialInboxPage, null, {
                    hub: Viewability.hidden, panel: Viewability.hidden
                });
            MS.Entertainment.InformationArchitecture.Node.overridePageFragmentUrl(inboxPage, "Components/Social/InboxPageHost.html");
            var inboxAllHub = ia.createNode(String.load(String.id.IDS_SOCIAL_INBOX_PIVOT_ALL), MS.Entertainment.UI.Monikers.socialInboxAllHub, null, {
                    page: Viewability.hidden, panel: Viewability.hidden
                });
            inboxAllHub.getDataContext = function inboxAllGetDataContext() {
                return {viewModel: new MS.Entertainment.ViewModels.InboxViewModel(MS.Entertainment.ViewModels.InboxViewModel.ViewTypes.all)}
            };
            MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(inboxAllHub, "Components/Social/Inbox.html#inboxAllHubTemplate");
            var inboxAllPanel = ia.createNode(String.load(String.id.IDS_SOCIAL_INBOX_PIVOT_ALL), MS.Entertainment.UI.Monikers.socialInboxAllPanel, null, {
                    hub: Viewability.hidden, page: Viewability.hidden
                });
            var inboxMessagesHub = ia.createNode(String.load(String.id.IDS_SOCIAL_INBOX_PIVOT_MESSAGES), MS.Entertainment.UI.Monikers.socialInboxMessagesHub, null, {
                    page: Viewability.hidden, panel: Viewability.hidden
                });
            inboxMessagesHub.getDataContext = function inboxMessagesGetDataContext() {
                return {viewModel: new MS.Entertainment.ViewModels.InboxViewModel(MS.Entertainment.ViewModels.InboxViewModel.ViewTypes.messages)}
            };
            MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(inboxMessagesHub, "Components/Social/Inbox.html#inboxMessagesHubTemplate");
            var inboxMessagesPanel = ia.createNode(String.load(String.id.IDS_SOCIAL_INBOX_PIVOT_MESSAGES), MS.Entertainment.UI.Monikers.socialInboxMessagesPanel, null, {
                    hub: Viewability.hidden, page: Viewability.hidden
                });
            var inboxGameInvitesHub = ia.createNode(String.load(String.id.IDS_SOCIAL_INBOX_PIVOT_GAME_ALERTS), MS.Entertainment.UI.Monikers.socialInboxGameInvitesHub, null, {
                    page: Viewability.hidden, panel: Viewability.hidden
                });
            inboxGameInvitesHub.getDataContext = function inboxGameInvitesGetDataContext() {
                return {viewModel: new MS.Entertainment.ViewModels.InboxViewModel(MS.Entertainment.ViewModels.InboxViewModel.ViewTypes.gameInvites)}
            };
            MS.Entertainment.InformationArchitecture.Node.overrideHubFragmentUrl(inboxGameInvitesHub, "Components/Social/Inbox.html#inboxGameInvitesHubTemplate");
            var inboxGameInvitesPanel = ia.createNode(String.load(String.id.IDS_SOCIAL_INBOX_PIVOT_GAME_ALERTS), MS.Entertainment.UI.Monikers.socialInboxGameInvitesPanel, null, {
                    hub: Viewability.hidden, page: Viewability.hidden
                });
            ia.rootNode.addChild(socialHub);
            socialHub.addChild(miniProfilePanel);
            socialHub.addChild(friendsPanel);
            profilePage.addChild(profileHub);
            profileHub.addChild(profileAvatarPanel);
            profileHub.addChild(profileFriendsPanel);
            friendsPage.addChild(friendsHub);
            friendsHub.addChild(friendsGalleryPanel);
            friendsPage.addChild(pendingFriendsHub);
            pendingFriendsHub.addChild(pendingFriendsGalleryPanel);
            friendsOfFriendPage.addChild(friendsOfFriendHub);
            friendsOfFriendHub.addChild(friendsOfFriendGalleryPanel);
            compareActivitiesPage.addChild(compareActivitiesHub);
            compareActivitiesHub.addChild(compareActivitiesPanel);
            detailsPage.addChild(achievementsHub);
            achievementsHub.addChild(achievementsGalleryPanel);
            avatarSelectionPage.addChild(avatarSelectionHub);
            avatarSelectionHub.addChild(avatarSelectionPanel);
            ia.rootNode.addChild(inboxPage);
            inboxPage.addChild(inboxAllHub);
            inboxAllHub.addChild(inboxAllPanel);
            inboxPage.addChild(inboxMessagesHub);
            inboxMessagesHub.addChild(inboxMessagesPanel);
            inboxPage.addChild(inboxGameInvitesHub);
            inboxGameInvitesHub.addChild(inboxGameInvitesPanel)
        }
        else {
            var socialHubDemo = ia.createNode(String.load(String.id.IDS_SOCIAL_PIVOT), Monikers.socialHub);
            var friendsPanelDemo = ia.createNode(String.load(String.id.IDS_FRIENDS_TITLE_LC), Monikers.socialFriendsPanel, "Components/Social/miniProFileDemo.html#miniProfileFriendsDemoTemplate");
            var miniProfilePanelDemo = ia.createNode(String.empty, Monikers.socialMiniProfile, "Components/Social/miniProFileDemo.html#miniProfileAvatarDemoTemplate");
            ia.rootNode.addChild(socialHubDemo);
            socialHubDemo.addChild(miniProfilePanelDemo);
            socialHubDemo.addChild(friendsPanelDemo)
        }
        (function AvatarEditor_InformationArchitecture(MSE, undefined) {
            if (!(new Microsoft.Entertainment.Configuration.ConfigurationManager).shell.retailExperience) {
                var ia = MSE.ServiceLocator.getService(MSE.Services.informationArchitecture);
                var Monikers = MSE.UI.Monikers;
                var avatarEditorPage = ia.createNode(String.load(String.id.IDS_SOCIAL_EDIT_AVATAR_PAGE_TITLE), Monikers.socialAvatarEditorPage, null, null);
                avatarEditorPage.addChild(ia.createNode(String.empty, Monikers.socialAvatarEditorStylesHub, null, null));
                avatarEditorPage.addChild(ia.createNode(String.empty, Monikers.socialAvatarEditorFeaturesHub, null, null));
                avatarEditorPage.getPage = (function avatarEditorPage_getPage() {
                    var oldGetPage = avatarEditorPage.getPage;
                    var navigateAwayCallback;
                    return function customAvatarEditorGetPage() {
                            var page = oldGetPage.call(this);
                            page.overrideFragmentUrl = "Components/Social/avatarEditorPage.html";
                            page.setNavigationCallback = function avatarEditorSetNavigationCallback(callback) {
                                navigateAwayCallback = callback
                            };
                            page.onNavigateAway = function avatarEditorOnNavigateAway() {
                                if (navigateAwayCallback)
                                    return navigateAwayCallback()
                            };
                            return page
                        }
                })()
            }
        })(WinJS.Namespace.define("MS.Entertainment", null))
    }
    {};
    MS.Entertainment.InformationArchitecture.addIAForAppId(-1, createSocialIa);
    MS.Entertainment.InformationArchitecture.addIAForAppId(Microsoft.Entertainment.Application.AppMode.games, createSocialIa)
})()
