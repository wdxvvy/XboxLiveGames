/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Controls/Link.js", "/Controls/templateSelector.js", "/Controls/avatarControl.js", "/Controls/hub.js", "/Animations/SocialAnimations.js", "/Framework/corefx.js", "/Framework/imageloader.js", "/Framework/stringids.js", "/Framework/utilities.js", "/Framework/data/queries/modelProperties.js", "/Framework/data/augmenters/xboxLiveAugmenters.js", "/Components/SignIn/SignIn.js", "/ViewModels/social/social.js", "/ViewModels/social/profileHydrator.js", "/Controls/LoadingControl.js");
(function(undefined) {
    WinJS.Namespace.define("MS.Entertainment.Social", {FindFriendsFlyout: MS.Entertainment.UI.Framework.defineUserControl("Components/Social/findFriends.html#findFriendsFlyoutTemplate", function findFriendsFlyoutConstructor() {
            MS.Entertainment.Social.FindFriendsFlyout._instanceCount++;
            MS.Entertainment.Utilities.assert(MS.Entertainment.Social.FindFriendsFlyout._instanceCount === 1, "Use MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.findFriends)")
        }, {
            searchBox: null, waitCursor: null, _bindings: null, _flyoutControl: null, initialize: function initialize() {
                    this._bindings = WinJS.Binding.bind(this, {showSearchProgress: this._onShowSearchProgressChanged.bind(this)})
                }, unload: function unload() {
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null
                    }
                    flyout.removeEventListener("beforehide", this._beforeHide);
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, show: function show(anchor, placement) {
                    var initializePromise;
                    if (this._initialized)
                        initializePromise = WinJS.Promise.wrap();
                    else
                        initializePromise = MS.Entertainment.UI.Framework.waitForControlToInitialize(this.domElement);
                    initializePromise.done(function complete() {
                        this.searchBox.clearInput();
                        this.searchBox.validateText();
                        this.showSearchProgress = false;
                        if (!this._flyoutControl) {
                            var flyoutRoot = document.createElement("div");
                            flyoutRoot.className = "findFriendFlyout";
                            flyoutRoot.appendChild(this.domElement);
                            this._flyoutControl = new WinJS.UI.Flyout(flyoutRoot);
                            document.body.appendChild(flyoutRoot)
                        }
                        MS.Entertainment.UI.Framework.addOverlayContainer(this.domElement);
                        this._flyoutControl.addEventListener("beforehide", this._beforeHide);
                        this._flyoutControl.show(anchor, placement)
                    }.bind(this))
                }, _beforeHide: function _beforeHide() {
                    MS.Entertainment.UI.Framework.removeOverlayContainer(this.domElement)
                }, _onShowSearchProgressChanged: function _onShowSearchProgressChanged(newValue) {
                    this.waitCursor.isBusy = newValue
                }, onSearchBoxKeyDown: function onSearchBoxKeyDown(evt) {
                    if (evt.keyCode === WinJS.Utilities.Key.enter) {
                        this._doSearch();
                        evt.stopPropagation();
                        evt.preventDefault();
                        return false
                    }
                }, onSearchButtonClick: function onSearchButtonClick(evt) {
                    this._doSearch()
                }, _doSearch: function _doSearch() {
                    this.showSearchProgress = true;
                    var searchOperation = null;
                    var gamertagText = this.searchBox.getValue();
                    if (gamertagText) {
                        var gamercardQuery = new MS.Entertainment.Data.Query.gamercardQuery;
                        gamercardQuery.gamertag = gamertagText;
                        gamercardQuery.userModel = MS.Entertainment.Social.Helpers.createUserModel();
                        searchOperation = gamercardQuery.execute()
                    }
                    else
                        searchOperation = WinJS.Promise.wrapError(new Error("Invalid query"));
                    searchOperation.done(function complete(q) {
                        this._showGamercard(q.result)
                    }.bind(this), function error(err) {
                        if (err && err.number === MS.Entertainment.Data.XboxLive.ErrorCodes.httpAuthRequired || err && err.message === "Invalid query")
                            this.searchBox.setError(String.load(String.id.IDS_SOCIAL_ERROR_FRIEND_DOES_NOT_EXIST));
                        else
                            this.searchBox.setError(String.load(String.id.IDS_SOCIAL_ERROR));
                        this.showSearchProgress = false
                    }.bind(this))
                }, _showGamercard: function _showGamercard(model) {
                    var overlay;
                    model.pendingFriendInvite = true;
                    overlay = MS.Entertainment.UI.Shell.createOverlay("MS.Entertainment.Social.GamercardPopOver", {
                        hub: this.hub, data: model, closeOverlay: WinJS.Utilities.markSupportedForProcessing(function closeOverlay(navigate) {
                                overlay.hide();
                                if (navigate)
                                    navigate()
                            })
                    });
                    overlay.customStyle = "profilePopOverOverlay";
                    overlay.domElement.addEventListener("keydown", function onKeyDown(e) {
                        if (e.keyCode !== WinJS.Utilities.Key.escape)
                            return;
                        e.preventDefault();
                        overlay.hide()
                    });
                    overlay.show()
                }
        }, {showSearchProgress: false}, {
            _instanceCount: 0, factory: function factory() {
                    return new MS.Entertainment.Social.FindFriendsFlyout
                }
        })});
    MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.findFriends, MS.Entertainment.Social.FindFriendsFlyout.factory);
    WinJS.Namespace.define("MS.Entertainment.Social", {FindFriendsButton: MS.Entertainment.UI.Framework.defineUserControl("Components/Social/findFriends.html#findFriendsButtonTemplate", null, {
            button: null, initialize: function initialize() {
                    MS.Entertainment.Utilities.setAccessibilityTextFromStringId(this.button, String.id.IDS_SOCIAL_FIND_FRIEND_LABEL)
                }, onButtonClick: function onButtonClick() {
                    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                    var action = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.showFindFriendsFlyout);
                    action.automationId = MS.Entertainment.UI.AutomationIds.gamesShowFindFriendsFlyout;
                    action.parameter = {
                        placement: "right", anchor: this.button
                    };
                    action.execute()
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.UI.Actions", {ShowFindFriendsFlyout: MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function showFindFriendFlyout() {
            this.base()
        }, {
            requiresLinkControl: true, executed: function executed(param) {
                    var anchor = WinJS.Binding.unwrap(param.anchor);
                    if (!anchor)
                        anchor = param.linkControl.modifier;
                    if (MS.Entertainment.Utilities.getTextDirection() === MS.Entertainment.Utilities.TextDirections.RightToLeft)
                        if (param.placement === "right")
                            param.placement = "left";
                        else if (param.placement === "left")
                            param.placement = "right";
                    var flyout = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.findFriends);
                    flyout.show(anchor, param.placement)
                }, canExecute: function canExecute(param) {
                    return param && param.placement && (param.anchor || (param.linkControl && param.linkControl.modifier))
                }
        })});
    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).register(MS.Entertainment.UI.Actions.ActionIdentifiers.showFindFriendsFlyout, function() {
        return new MS.Entertainment.UI.Actions.ShowFindFriendsFlyout
    })
})()
