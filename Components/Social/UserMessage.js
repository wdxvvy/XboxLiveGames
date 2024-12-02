/* Copyright (C) Microsoft Corporation. All rights reserved. */
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Social");
WinJS.Namespace.define("MS.Entertainment.Social", {
    UserMessagePopover: MS.Entertainment.UI.Framework.defineUserControl(null, function userMessagePopover(element, options) {
        this._keyboardNavigationManager = new MS.Entertainment.Framework.KeyboardNavigationManager(this.domElement);
        this.model = options.media;
        this.inlineExtraData = options.inlineExtraData
    }, {
        _keyboardNavigationManager: null, setOverlay: function setOverlay(instance) {
                this.overlay = instance
            }
    }, {
        model: null, inlineExtraData: null, overlay: null
    }), UserMessageDetails: MS.Entertainment.UI.Framework.defineUserControl(null, function userMessageDetails(element, options) {
            var signedInUserService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
            this._signedInUser = signedInUserService && signedInUserService.nativeUserModel && signedInUserService.nativeUserModel[0];
            this._bindings = WinJS.Binding.bind(this, {overlay: this._onOverlayChanged.bind(this)})
        }, {
            _bindings: null, _overlayEvents: null, _signedInUser: null, initialize: function initialize() {
                    this._buildAvailableActions();
                    this._addButtons()
                }, unload: function unload() {
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null
                    }
                    if (this._overlayEvents) {
                        this._overlayEvents.cancel();
                        this._overlayEvents = null
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, _onOverlayChanged: function _onOverlayChanged() {
                    if (this.overlay) {
                        this._overlayEvents = MS.Entertainment.Utilities.addEventHandlers(this.overlay, {overlayVisible: this._raiseContentReady.bind(this)});
                        if (this.overlay.visible)
                            this._raiseContentReady()
                    }
                }, _buildAvailableActions: function _buildAvailableActions() {
                    MS.Entertainment.Social.fail("Overriding class must implement _buildAvailableActions")
                }, _addButtons: function _addButtons() {
                    MS.Entertainment.Social.fail("Overriding class must implement _addButtons")
                }, _deleteMessage: function _deleteMessage(id) {
                    MS.Entertainment.Social.fail("Overriding class must implement _deleteMessage");
                    throw new Error("_deleteMessage not defined");
                }, _raiseContentReady: function _raiseContentReady() {
                    var readyEvent = document.createEvent("Event");
                    readyEvent.initEvent("DetailsReady", true, true);
                    this.domElement.dispatchEvent(readyEvent)
                }, _dismissOverlay: function _dismissOverlay() {
                    var domEvent = document.createEvent("Event");
                    domEvent.initEvent("dismissoverlay", true, true);
                    this.domElement.dispatchEvent(domEvent)
                }, _onClickMessageDelete: function _onClickMessageDelete() {
                    this._deleteMessage(this.model.message.id).done(function deleteMessage() {
                        if (this.inlineExtraData && this.inlineExtraData.deleteItem)
                            this.inlineExtraData.deleteItem().done(function newItem(item) {
                                if (item) {
                                    item.hasFocus = true;
                                    this.overlay.listViewItemToFocusOnClose = item
                                }
                                this._dismissOverlay()
                            }.bind(this));
                        else
                            this._dismissOverlay()
                    }.bind(this), function deleteFailed(error) {
                        if (error && MS.Entertainment.Data.XboxLive.isHttpOfflineError(error.number))
                            this.errorText = String.load(String.id.IDS_SOCIAL_ERROR);
                        else
                            this.errorText = String.load(String.id.IDS_SOCIAL_DELETE_MESSAGE_ERROR_TEXT)
                    }.bind(this))
                }
        }, {
            model: null, inlineExtraData: null, overlay: null
        })
});
WinJS.Namespace.define("MS.Entertainment.Social", {
    GameInvitePopover: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.Social.UserMessagePopover, "Components/Social/UserMessage.html#gameInvitePopoverTemplate"), GameInviteDetails: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.Social.UserMessageDetails, "Components/Social/UserMessage.html#gameInviteDetailsTemplate", function gameInviteDetailsConstructor(element, options){}, {
            _buildAvailableActions: function _buildAvailableActions() {
                this.buttons.setAvailableActions([{
                        priority: MS.Entertainment.Social.GameInviteDetails.Actions.acceptXboxInvite, automationId: MS.Entertainment.UI.AutomationIds.gameInviteAcceptXboxButton, stringId: String.id.IDS_SOCIAL_MESSAGE_BUTTON_ACCEPT, icon: WinJS.UI.AppBarIcon.accept, actionId: MS.Entertainment.UI.Actions.ActionIdentifiers.playOnXbox, actionParam: {mediaItem: this.model.game}, actionComplete: this._dismissOverlay.bind(this)
                    }, {
                        priority: MS.Entertainment.Social.GameInviteDetails.Actions.acceptMetroInvite, automationId: MS.Entertainment.UI.AutomationIds.gameInviteAcceptMetroButton, stringId: String.id.IDS_SOCIAL_MESSAGE_BUTTON_ACCEPT, icon: WinJS.UI.AppBarIcon.accept, actionId: MS.Entertainment.UI.Actions.ActionIdentifiers.launchApp, actionParam: {
                                uri: this.model.launchUri, familyName: this.model.familyName, displayName: this.model.game.name, mediaItem: this.model.game
                            }, actionComplete: this._dismissOverlay.bind(this)
                    }, {
                        priority: MS.Entertainment.Social.GameInviteDetails.Actions.deleteMessage, automationId: MS.Entertainment.UI.AutomationIds.gameInviteDeleteButton, stringId: String.id.IDS_SOCIAL_MESSAGE_BUTTON_DELETE, icon: WinJS.UI.AppBarIcon.cancel, onClick: this._onClickMessageDelete.bind(this)
                    }, {
                        priority: MS.Entertainment.Social.GameInviteDetails.Actions.gameDetails, automationId: MS.Entertainment.UI.AutomationIds.gameInviteGameDetailsButton, stringId: String.id.IDS_DETAILS_VIEW_FULL_GAME, icon: MS.Entertainment.UI.Icon.details, actionId: MS.Entertainment.UI.Actions.ActionIdentifiers.showImmersiveDetails, actionParam: {
                                mediaItem: this.model.game, showDetails: true, autoPlay: false, dismissOverlayOnExecute: false
                            }
                    }])
            }, _addButtons: function _addButtons() {
                    if (this.model.launchUri) {
                        this.buttons.add(MS.Entertainment.Social.GameInviteDetails.Actions.acceptMetroInvite);
                        this.buttons.add(MS.Entertainment.Social.GameInviteDetails.Actions.deleteMessage)
                    }
                    else if (this.model.game.defaultPlatformType === MS.Entertainment.Data.Augmenter.GamePlatform.Xbox) {
                        this.buttons.add(MS.Entertainment.Social.GameInviteDetails.Actions.acceptXboxInvite);
                        this.buttons.add(MS.Entertainment.Social.GameInviteDetails.Actions.deleteMessage)
                    }
                    this.buttons.add(MS.Entertainment.Social.GameInviteDetails.Actions.gameDetails)
                }, _deleteMessage: function _deleteMessage(id) {
                    return this._signedInUser.deleteUserMessageAsync(id)
                }
        }, {}, {Actions: {
                acceptXboxInvite: 0, acceptMetroInvite: 1, deleteMessage: 2, gameDetails: 3
            }}), TextMessagePopover: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.Social.UserMessagePopover, "Components/Social/UserMessage.html#textMessagePopoverTemplate"), TextMessageDetails: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.Social.UserMessageDetails, "Components/Social/UserMessage.html#textMessageDetailsTemplate", function textMessageDetailsConstructor(element, options){}, {
            initialize: function initialize() {
                MS.Entertainment.Social.UserMessageDetails.prototype.initialize.apply(this, arguments);
                this.hasNonText = this.model.message.hasAudio || this.model.message.hasPhoto;
                this._signedInUser.getTextMessageByIdAsync(this.model.message.id).then(function getMessage(message) {
                    this.messageText = message.messageSummary || this.model.inboxMessageText;
                    this.model.read = true
                }.bind(this), function messageFailed(error) {
                    this.messageText = this.model.inboxMessageText;
                    if (error && MS.Entertainment.Data.XboxLive.isHttpOfflineError(error.number))
                        this.errorText = String.load(String.id.IDS_SOCIAL_ERROR);
                    else
                        this.errorText = String.load(String.id.IDS_SOCIAL_MESSAGE_ERROR_TEXT)
                }.bind(this))
            }, _buildAvailableActions: function _buildAvailableActions() {
                    this.buttons.setAvailableActions([{
                            priority: MS.Entertainment.Social.TextMessageDetails.Actions.reply, automationId: MS.Entertainment.UI.AutomationIds.textMessageReplyButton, stringId: String.id.IDS_SOCIAL_MESSAGE_BUTTON_REPLY, icon: WinJS.UI.AppBarIcon.mailreply, onClick: this._onClickMessageReply.bind(this)
                        }, {
                            priority: MS.Entertainment.Social.TextMessageDetails.Actions.deleteMessage, automationId: MS.Entertainment.UI.AutomationIds.textMessageDeleteButton, stringId: String.id.IDS_SOCIAL_MESSAGE_BUTTON_DELETE, icon: WinJS.UI.AppBarIcon.cancel, onClick: this._onClickMessageDelete.bind(this)
                        }])
                }, _addButtons: function _addButtons() {
                    var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                    var userProfile = MS.Entertainment.Social.Helpers.getSignedInUserModel();
                    var isFriend = false;
                    if (userProfile.friends)
                        userProfile.friends.forEach(function item(friendItem) {
                            var friend = friendItem.item.data;
                            if (friend.gamerTag.match(new RegExp("^" + this.model.sender.gamerTag + "$", "i"))) {
                                isFriend = true;
                                friendItem.item.stop = true
                            }
                        }.bind(this));
                    else
                        isFriend = true;
                    if (isFriend || signedInUser.isGold())
                        this.buttons.add(MS.Entertainment.Social.TextMessageDetails.Actions.reply);
                    this.buttons.add(MS.Entertainment.Social.TextMessageDetails.Actions.deleteMessage)
                }, _deleteMessage: function _deleteMessage(id) {
                    return this._signedInUser.deleteTextMessageAsync(id)
                }, _onClickMessageReply: function _onClickMessageReply() {
                    MS.Entertainment.Social.SendMessage.show(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser), {
                        xuid: this.model.message.senderXuid, gamerTag: this.model.message.senderGamertag
                    });
                    this._dismissOverlay()
                }
        }, {
            messageText: String.empty, errorText: String.empty, hasNonText: false
        }, {Actions: {
                reply: 0, deleteMessage: 1
            }})
})
