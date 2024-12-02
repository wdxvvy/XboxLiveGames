/* Copyright (C) Microsoft Corporation. All rights reserved. */
WinJS.Namespace.define("MS.Entertainment.ViewModels", {
    InboxAutomationIds: {
        inboxDateSort: "inboxDateSort_modifier", inboxTitleSort: "inboxTitleSort_modifier", inboxGamertagSort: "inboxGamertagSort_modifier"
    }, InboxTemplates: {
            all: {
                emptyGalleryTemplate: "Controls/GalleryControl.html#listViewEmptyGalleryTemplate", emptyGalleryModelOptions: {primaryStringId: String.id.IDS_SOCIAL_INBOX_EMPTY_ALL}, failedGalleryModelOptions: {primaryStringId: String.id.IDS_SOCIAL_INBOX_ALL_ERROR}, layout: MS.Entertainment.UI.Controls.GalleryControl.Layout.list, selectionMode: MS.Entertainment.UI.Controls.GalleryControl.SelectionMode.none, swipeBehavior: MS.Entertainment.UI.Controls.GalleryControl.swipeBehavior.none, invokeBehavior: MS.Entertainment.UI.Controls.GalleryControl.InvokeBehavior.popOver, invokeHelperFactory: MS.Entertainment.UI.Controls.GalleryControlInvocationHelper.create, forceInteractive: false, grouped: false, raisePanelResetEvents: false, modifierFormatterOptions: {
                        emptyName: null, nonEmptyName: String.id.IDS_SORTED_BY
                    }
            }, messages: {
                    emptyGalleryTemplate: "Controls/GalleryControl.html#listViewEmptyGalleryTemplate", emptyGalleryModelOptions: {primaryStringId: String.id.IDS_SOCIAL_INBOX_EMPTY_MESSAGES}, failedGalleryModelOptions: {primaryStringId: String.id.IDS_SOCIAL_INBOX_MESSAGES_ERROR}, layout: MS.Entertainment.UI.Controls.GalleryControl.Layout.list, selectionMode: MS.Entertainment.UI.Controls.GalleryControl.SelectionMode.none, swipeBehavior: MS.Entertainment.UI.Controls.GalleryControl.swipeBehavior.none, invokeBehavior: MS.Entertainment.UI.Controls.GalleryControl.InvokeBehavior.popOver, invokeHelperFactory: MS.Entertainment.UI.Controls.GalleryControlInvocationHelper.create, forceInteractive: false, grouped: false, raisePanelResetEvents: false, modifierFormatterOptions: {
                            emptyName: null, nonEmptyName: String.id.IDS_SORTED_BY
                        }
                }, gameInvites: {
                    emptyGalleryTemplate: "Controls/GalleryControl.html#listViewEmptyGalleryTemplate", emptyGalleryModelOptions: {primaryStringId: String.id.IDS_SOCIAL_INBOX_EMPTY_GAME_ALERTS}, failedGalleryModelOptions: {primaryStringId: String.id.IDS_SOCIAL_INBOX_GAME_ALERTS_ERROR}, layout: MS.Entertainment.UI.Controls.GalleryControl.Layout.list, selectionMode: MS.Entertainment.UI.Controls.GalleryControl.SelectionMode.none, swipeBehavior: MS.Entertainment.UI.Controls.GalleryControl.swipeBehavior.none, invokeBehavior: MS.Entertainment.UI.Controls.GalleryControl.InvokeBehavior.popOver, invokeHelperFactory: MS.Entertainment.UI.Controls.GalleryControlInvocationHelper.create, forceInteractive: false, grouped: false, raisePanelResetEvents: false, modifierFormatterOptions: {
                            emptyName: null, nonEmptyName: String.id.IDS_SORTED_BY
                        }
                }
        }
});
WinJS.Namespace.define("MS.Entertainment.ViewModels", {InboxViewModel: WinJS.Class.derive(MS.Entertainment.ViewModels.QueryViewModel, function inboxViewModelConstructor(view) {
        MS.Entertainment.ViewModels.QueryViewModel.prototype.constructor.apply(this, arguments);
        this.failedPanelModel = new MS.Entertainment.UI.Controls.DefaultFailedPanelModel;
        this.modifierDescriptionFormatter = new MS.Entertainment.Formatters.InboxSortFormatter
    }, {
        _viewModelId: "socialInbox", _messageId: -1, _collectionQueryBindings: null, _updatedLastInboxViewDate: false, totalCount: 0, modifierDescriptionFormatter: null, failedPanelModel: null, _messageIndex: -1, dispose: function dispose() {
                MS.Entertainment.ViewModels.QueryViewModel.prototype.dispose.call(this);
                this._clearQueryBindings()
            }, createActionCells: function createActionCells() {
                return null
            }, getViewDefinition: function(view) {
                return MS.Entertainment.ViewModels.InboxViewModel.Views[view]
            }, getModifierDefinition: function(view) {
                return MS.Entertainment.ViewModels.InboxViewModel.Modifiers[view]
            }, _clearQueryBindings: function _clearQueryBindings() {
                if (this._collectionQueryBindings) {
                    this._collectionQueryBindings.cancel();
                    this._collectionQueryBindings = null
                }
            }, begin: function begin(options) {
                MS.Entertainment.ViewModels.QueryViewModel.prototype.begin.apply(this, arguments);
                this._messageId = options && options.messageId
            }, _onBeginQuery: function _onBeginQuery(query) {
                this._clearQueryBindings();
                var template = this.selectedTemplate;
                this.modifierDescriptionFormatter.totalCount = -1;
                this.modifierDescriptionFormatter.initialize(template.modifierFormatterOptions ? template.modifierFormatterOptions.emptyName : null, template.modifierFormatterOptions ? template.modifierFormatterOptions.nonEmptyName : null)
            }, _onQueryCompleted: function _onQueryCompleted(query) {
                this._clearQueryBindings();
                this._collectionQueryBindings = WinJS.Binding.bind(query, {totalCount: function totalCountChanged(newValue) {
                        this.modifierDescriptionFormatter.totalCount = newValue;
                        this.totalCount = newValue
                    }.bind(this)});
                if (!this._updatedLastInboxViewDate) {
                    WinJS.Promise.timeout(500).done(function complete() {
                        MS.Entertainment.Social.Helpers.lastInboxViewDate = new Date;
                        MS.Entertainment.Social.Helpers.getSignedInUserModel().refresh().done(null, function(){})
                    }.bind(this));
                    this._updatedLastInboxViewDate = true
                }
                if (typeof this._messageId === "number" && query && query.result && query.result.items && query.result.items.forEachAll) {
                    var lookup = [];
                    var popOverParameters = null;
                    var model = MS.Entertainment.Social.Helpers.getSignedInUserModel();
                    lookup.push(model.refresh().then(null, function(){}));
                    lookup.push(query.result.items.forEachAll(function findMessage(args) {
                        if (args && args.item && args.item.data && args.item.data.message && this._messageId === parseInt(args.item.data.message.id)) {
                            var dataContext = {
                                    data: args.item.data, inlineExtraData: {deleteItem: function deleteItem() {
                                                if (this._messageIndex > -1) {
                                                    query.result.items.removeAt(this._messageIndex);
                                                    this.modifierDescriptionFormatter.totalCount--;
                                                    this._messageIndex = -1
                                                }
                                                return WinJS.Promise.wrap()
                                            }.bind(this)}
                                };
                            if (args.item.data.game)
                                popOverParameters = {
                                    itemConstructor: "MS.Entertainment.Social.GameInvitePopover", dataContext: dataContext
                                };
                            else
                                popOverParameters = {
                                    itemConstructor: "MS.Entertainment.Social.TextMessagePopover", dataContext: dataContext
                                };
                            this._messageIndex = args.item.itemIndex;
                            this._messageId = null;
                            args.stop = true
                        }
                    }.bind(this)));
                    var showPopOver = function showPopOver() {
                            if ((model.status === MS.Entertainment.Social.LoadStatus.loaded || model.status === MS.Entertainment.Social.LoadStatus.error) && popOverParameters)
                                MS.Entertainment.UI.Controls.PopOver.showPopOver(popOverParameters)
                        };
                    WinJS.Promise.join(lookup).done(showPopOver, showPopOver)
                }
            }, _handleQueryFailure: function _handleQueryFailure(error) {
                this._pendingQueryExecute = null;
                if (!error || error.name !== "Canceled")
                    if (!this._attemptAnotherQuery()) {
                        if (error && MS.Entertainment.Data.XboxLive.isHttpOfflineError(error.number))
                            this.failedPanelModel.primaryStringId = String.id.IDS_SOCIAL_ERROR;
                        else if (this.selectedTemplate && this.selectedTemplate.failedGalleryModelOptions)
                            this.failedPanelModel.primaryStringId = this.selectedTemplate.failedGalleryModelOptions.primaryStringId;
                        this._setIsFailed(true);
                        this._setItems(null)
                    }
            }, _registerForQueryEvents: function _registerForQueryEvents(query){}
    }, {
        ViewTypes: {
            all: "all", messages: "messages", gameInvites: "gameInvites"
        }, Modifiers: {
                all: {itemFactory: function itemFactory() {
                        return [new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.InboxAutomationIds.inboxDateSort, String.id.IDS_SOCIAL_INBOX_SORT_MODIFIER_DATE, new MS.Entertainment.ViewModels.NodeValues(null, {
                                    sort: MS.Entertainment.Data.Query.Properties.userMessageSort.date, userModel: MS.Entertainment.Social.Helpers.createUserModel()
                                }, {selectedTemplate: MS.Entertainment.ViewModels.InboxTemplates.all})), new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.InboxAutomationIds.inboxGamertagSort, String.id.IDS_SOCIAL_INBOX_SORT_MODIFIER_GAMERTAG, new MS.Entertainment.ViewModels.NodeValues(null, {
                                    sort: MS.Entertainment.Data.Query.Properties.userMessageSort.gamerTag, userModel: MS.Entertainment.Social.Helpers.createUserModel()
                                }, {selectedTemplate: MS.Entertainment.ViewModels.InboxTemplates.all}))]
                    }}, messages: {itemFactory: function itemFactory() {
                            return [new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.InboxAutomationIds.inboxDateSort, String.id.IDS_SOCIAL_INBOX_SORT_MODIFIER_DATE, new MS.Entertainment.ViewModels.NodeValues(null, {
                                        sort: MS.Entertainment.Data.Query.Properties.userMessageSort.date, userModel: MS.Entertainment.Social.Helpers.createUserModel()
                                    }, {selectedTemplate: MS.Entertainment.ViewModels.InboxTemplates.messages})), new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.InboxAutomationIds.inboxGamertagSort, String.id.IDS_SOCIAL_INBOX_SORT_MODIFIER_GAMERTAG, new MS.Entertainment.ViewModels.NodeValues(null, {
                                        sort: MS.Entertainment.Data.Query.Properties.userMessageSort.gamerTag, userModel: MS.Entertainment.Social.Helpers.createUserModel()
                                    }, {selectedTemplate: MS.Entertainment.ViewModels.InboxTemplates.messages}))]
                        }}, gameInvites: {itemFactory: function itemFactory() {
                            return [new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.InboxAutomationIds.inboxDateSort, String.id.IDS_SOCIAL_INBOX_SORT_MODIFIER_DATE, new MS.Entertainment.ViewModels.NodeValues(null, {
                                        sort: MS.Entertainment.Data.Query.Properties.userMessageSort.date, userModel: MS.Entertainment.Social.Helpers.createUserModel()
                                    }, {selectedTemplate: MS.Entertainment.ViewModels.InboxTemplates.gameInvites})), new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.InboxAutomationIds.inboxTitleSort, String.id.IDS_SOCIAL_INBOX_SORT_MODIFIER_TITLE, new MS.Entertainment.ViewModels.NodeValues(null, {
                                        sort: MS.Entertainment.Data.Query.Properties.userMessageSort.gameTitle, userModel: MS.Entertainment.Social.Helpers.createUserModel()
                                    }, {selectedTemplate: MS.Entertainment.ViewModels.InboxTemplates.gameInvites})), new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.InboxAutomationIds.inboxGamertagSort, String.id.IDS_SOCIAL_INBOX_SORT_MODIFIER_GAMERTAG, new MS.Entertainment.ViewModels.NodeValues(null, {
                                        sort: MS.Entertainment.Data.Query.Properties.userMessageSort.gamerTag, userModel: MS.Entertainment.Social.Helpers.createUserModel()
                                    }, {selectedTemplate: MS.Entertainment.ViewModels.InboxTemplates.gameInvites}))]
                        }}
            }, Views: {
                all: new MS.Entertainment.ViewModels.NodeValues(MS.Entertainment.Data.Query.InboxQuery, null, null, null), messages: new MS.Entertainment.ViewModels.NodeValues(MS.Entertainment.Data.Query.MessagesQuery, null, null, null), gameInvites: new MS.Entertainment.ViewModels.NodeValues(MS.Entertainment.Data.Query.GameInvitesQuery, null, null, null)
            }
    })})
