/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/debug.js", "/Framework/action.js", "/Framework/actionidentifiers.js", "/Framework/utilities.js", "/Framework/telemetryUtilities.js", "/Framework/serviceLocator.js");
(function(undefined) {
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Actions");
    WinJS.Namespace.define("MS.Entertainment.UI.Actions", {SearchAutomationIds: {
            search: "search", searchByContext: "searchByContext", resetSearchFilter: "resetSearchFilter"
        }});
    WinJS.Namespace.define("MS.Entertainment.UI.Actions", {
        SearchByContextAction: MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function searchByContextActionConstructor() {
            this.base()
        }, {
            automationId: MS.Entertainment.UI.Actions.SearchAutomationIds.searchByContext, executed: function executed(param) {
                    if (this.canExecute(param)) {
                        var moniker = param.moniker;
                        if (moniker !== MS.Entertainment.UI.Monikers.searchPage)
                            MS.Entertainment.ViewModels.SearchViewModel.SearchCurrentFilter = MS.Entertainment.ViewModels.SearchFilter.all
                    }
                }, canExecute: function canExecute(param) {
                    return param != null && param != undefined && param.moniker != null
                }
        }), SearchAction: MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function searchAction() {
                this.base()
            }, {
                automationId: MS.Entertainment.UI.Actions.SearchAutomationIds.search, executed: function execute(param) {
                        if (param && param.queryText) {
                            MS.Entertainment.ViewModels.SearchContractViewModel.init();
                            MS.Entertainment.ViewModels.SearchContractViewModel.current.searchKeywordSubmitted({queryText: param.queryText})
                        }
                        else
                            MS.Entertainment.UI.Controls.CommandingPopOver.hideCurrentCommandingPopover().done(function searchActionCommandingPopoverHidden() {
                                var existingQuery = String.empty;
                                if (this.startWithExistingQuery) {
                                    var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                                    if (navigationService.checkUserLocation(MS.Entertainment.UI.Monikers.searchPage))
                                        existingQuery = MS.Entertainment.ViewModels.SearchContractViewModel.current.lastSearchedTerm
                                }
                                if (!MS.Entertainment.ViewModels.SearchContractViewModel.showSearchPane())
                                    MS.Entertainment.UI.Controls.TextInputOverlay.getTextInput({
                                        submitText: String.load(String.id.IDS_GLOBAL_COMMAND_SEARCH), watermark: String.load(String.id.IDS_GLOBAL_COMMAND_SEARCH), initialText: existingQuery || null
                                    }).done(function(query) {
                                        MS.Entertainment.ViewModels.SearchContractViewModel.init();
                                        MS.Entertainment.ViewModels.SearchContractViewModel.current.searchKeywordSubmitted({queryText: query})
                                    }, function searchCancelled(){})
                            }.bind(this))
                    }, canExecute: function canExecute() {
                        return true
                    }, startWithExistingQuery: false
            })
    });
    WinJS.Namespace.define("MS.Entertainment.UI.Actions", {ResetSearchFilterAction: MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function resetSearchFilterActionConstructor() {
            this.base()
        }, {
            automationId: MS.Entertainment.UI.Actions.SearchAutomationIds.resetSearchFilter, executed: function executed(param) {
                    if (this.canExecute(param)) {
                        var viewModel = param.viewModel;
                        MS.Entertainment.ViewModels.SearchViewModel.SearchCurrentFilter = MS.Entertainment.ViewModels.SearchFilter.all;
                        viewModel.modifierSelectionManager.selectedIndex = MS.Entertainment.ViewModels.SearchViewModel.SearchCurrentFilter
                    }
                }, canExecute: function canExecute(param) {
                    return param != null && param != undefined && param.viewModel != null
                }
        })});
    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.search, function() {
        return new MS.Entertainment.UI.Actions.SearchAction
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.searchByContext, function() {
        return new MS.Entertainment.UI.Actions.SearchByContextAction
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.resetSearchFilter, function() {
        return new MS.Entertainment.UI.Actions.ResetSearchFilterAction
    })
})()
