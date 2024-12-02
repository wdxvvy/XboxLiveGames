/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/observablearray.js", "/Controls/AvatarControl.js");
(function() {
    var Social = WinJS.Namespace.define("MS.Entertainment.Social");
    WinJS.Namespace.define("MS.Entertainment.Social", {GeneritarModelBase: WinJS.Class.mix(function generitarModelBase() {
            this._initObservable()
        }, WinJS.Utilities.eventMixin, WinJS.Binding.mixin)});
    WinJS.Namespace.define("MS.Entertainment.Social", {
        GeneritarModel: MS.Entertainment.derive(MS.Entertainment.Social.GeneritarModelBase, function generitarModel() {
            this.base();
            this.gender = Microsoft.Entertainment.Avatar.AvatarGender.male;
            this.instance = this;
            var updateAccessibilityText = this._updateAccessibilityText.bind(this);
            this._bindings = WinJS.Binding.bind(this, {
                gender: updateAccessibilityText, index: updateAccessibilityText
            })
        }, {
            gender: null, instance: null, canSelect: true, index: 1, accessibilityText: null, accessibilityButtonText: null, _bindings: null, dispose: function dispose() {
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null
                    }
                }, refresh: function refresh() {
                    this.dispatchEvent(Social.GeneritarModel.Events.refresh, {model: this})
                }, committed: function committed() {
                    this.dispatchEvent(Social.GeneritarModel.Events.committed, {model: this})
                }, _updateAccessibilityText: function _updateAccessibilityText() {
                    if (this.gender === Microsoft.Entertainment.Avatar.AvatarGender.male) {
                        this.accessibilityText = MS.Entertainment.Social.GeneritarModel.AccessibilityText.maleAvatar.format(this.index);
                        this.accessibilityButtonText = MS.Entertainment.Social.GeneritarModel.AccessibilityText.selectMaleAvatar.format(this.index)
                    }
                    else {
                        this.accessibilityText = MS.Entertainment.Social.GeneritarModel.AccessibilityText.femaleAvatar.format(this.index);
                        this.accessibilityButtonText = MS.Entertainment.Social.GeneritarModel.AccessibilityText.selectFemaleAvatar.format(this.index)
                    }
                }
        }, {
            Events: {
                refresh: "refresh", committed: "committed"
            }, AccessibilityText: (function() {
                    var text;
                    return {get: function() {
                                if (!text)
                                    text = {
                                        maleAvatar: String.load(String.id.IDS_AVATAR_EDITOR_MALE_AVATAR_X), femaleAvatar: String.load(String.id.IDS_AVATAR_EDITOR_FEMALE_AVATAR_X), selectMaleAvatar: String.load(String.id.IDS_AVATAR_EDITOR_SELECT_MALE_AVATAR_X), selectFemaleAvatar: String.load(String.id.IDS_AVATAR_EDITOR_SELECT_FEMALE_AVATAR_X)
                                    };
                                return text
                            }}
                })()
        }), AvatarSelectionPage: MS.Entertainment.UI.Framework.defineUserControl("Components/Social/avatarSelectionPage.html#avatarSelectionPageTemplate", function avatarSelectionPage() {
                this._handleCommittedCallback = this._handleCommitted.bind(this);
                this._initializeOnce()
            }, {
                _handleCommittedCallback: null, _isRefreshing: false, _initializeOnce: function initializeOnce() {
                        var data;
                        if (!this.generitarModels) {
                            data = this._createGeneritarModels();
                            this.generitarModels = new MS.Entertainment.ObservableArray(data)
                        }
                    }, _handleCommitted: function _handleCommitted() {
                        var i;
                        if (this.generitarModels) {
                            for (i = 0; i < this.generitarModels.length; i++) {
                                var generitar = WinJS.Binding.unwrap(this.generitarModels).item(i);
                                generitar.canSelect = false
                            }
                            {}
                        }
                    }, _clearGeneritarModels: function _clearGeneritarModels() {
                        var i;
                        if (this.generitarModels) {
                            for (i = 0; i < this.generitarModels.length; i++) {
                                var generitar = WinJS.Binding.unwrap(this.generitarModels).item(i);
                                generitar.removeEventListener(Social.GeneritarModel.Events.committed, this._handleCommittedCallback, false);
                                generitar.dispose()
                            }
                            {}
                        }
                    }, _createGeneritarModels: function _createGeneritarModel() {
                        var data = [];
                        var gender,
                            i,
                            generitar,
                            model;
                        if (Math.floor(Math.random() * 2))
                            gender = Microsoft.Entertainment.Avatar.AvatarGender.male;
                        else
                            gender = Microsoft.Entertainment.Avatar.AvatarGender.female;
                        for (i = 0; i < Social.AvatarSelectionPage.totalGeneritars; i++) {
                            model = new Social.GeneritarModel;
                            model.gender = gender;
                            model.index = i + 1;
                            model.addEventListener(Social.GeneritarModel.Events.committed, this._handleCommittedCallback, false);
                            data.push(model);
                            gender = (gender === Microsoft.Entertainment.Avatar.AvatarGender.male) ? Microsoft.Entertainment.Avatar.AvatarGender.female : Microsoft.Entertainment.Avatar.AvatarGender.male
                        }
                        return data
                    }, unload: function unload() {
                        this._clearGeneritarModels();
                        this.generitarModels = null;
                        MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                    }, thaw: function thaw() {
                        MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                        this.refresh()
                    }, refresh: function refresh() {
                        if (!this._isRefreshing) {
                            this._isRefreshing = true;
                            var refreshSpinner = this.domElement.getElementsByClassName("avatarSelectionRefreshButton")[0];
                            WinJS.Utilities.addClass(refreshSpinner, "avatarSelectionRefreshAnimation");
                            this.disableRefresh = true;
                            if (this.generitarModels) {
                                var data = this._createGeneritarModels();
                                var list = WinJS.Binding.unwrap(this.generitarModels);
                                list.clear();
                                data.forEach(function(model) {
                                    list.add(model)
                                }, this)
                            }
                            WinJS.Promise.timeout(Social.AvatarSelectionPage.refreshAnimationTimeout).then(function() {
                                WinJS.Utilities.removeClass(refreshSpinner, "avatarSelectionRefreshAnimation");
                                this._isRefreshing = false;
                                this.disableRefresh = false
                            }.bind(this))
                        }
                    }
            }, {
                disableRefresh: false, generitarModels: null
            }, {
                totalGeneritars: 4, refreshAnimationTimeout: 1000
            }), GeneritarControl: MS.Entertainment.UI.Framework.defineUserControl("Components/Social/avatarSelectionPage.html#generitarControlTemplate", function generitarControl() {
                this.model = {}
            }, {
                _generitarBindings: null, _events: null, _focusEvent: null, initialize: function initialize() {
                        this._updateGender();
                        this._generitarBindings = WinJS.Binding.bind(this, {model: {gender: this._updateGender.bind(this)}});
                        this._focusEvent = MS.Entertainment.Utilities.addEvents(this.domElement, {focusout: this.unselect.bind(this)});
                        this.bind("model", this._handleModelChanges.bind(this))
                    }, unload: function unload() {
                        if (this._generitarBindings) {
                            this._generitarBindings.cancel();
                            this._generitarBindings = null
                        }
                        if (this._events) {
                            this._events.cancel();
                            this._events = null
                        }
                        if (this._focusEvent) {
                            this._focusEvent.cancel();
                            this._focusEvent = null
                        }
                        MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                    }, canSelect: {get: function() {
                            return this.model && this.model.canSelect
                        }}, toggleSelection: function toggleSelection() {
                        if (this.selected)
                            this.unselect();
                        else
                            this.select()
                    }, select: function select() {
                        if (!this.selected)
                            WinJS.Promise.timeout().then(function() {
                                if (!this.selected && this.canSelect) {
                                    this.selected = true;
                                    this.avatar.startAnimation(Microsoft.Entertainment.Avatar.AvatarAnimationId.jumpIn);
                                    MS.Entertainment.UI.Framework.focusElement(this.domElement)
                                }
                            }.bind(this))
                    }, unselect: function unselect(eventArgs) {
                        var relatedTarget;
                        if (eventArgs && eventArgs.relatedTarget)
                            relatedTarget = eventArgs.relatedTarget;
                        if (this.selected && relatedTarget !== this.avatar.domElement && relatedTarget !== this.button.domElement && relatedTarget !== this.button._button)
                            WinJS.Promise.timeout(350).then(function() {
                                if (this.selected) {
                                    this.selected = false;
                                    this.avatar.startAnimation(Microsoft.Entertainment.Avatar.AvatarAnimationId.jumpOut)
                                }
                            }.bind(this))
                    }, commit: function commit() {
                        if (this.selected && this.model) {
                            MS.Entertainment.Utilities.Telemetry.logCreateAvatar();
                            this.model.committed();
                            this.avatar.persistManifest();
                            this.avatar.startAnimation(Microsoft.Entertainment.Avatar.AvatarAnimationId.clap);
                            WinJS.Promise.timeout(Social.GeneritarControl.navigationDelay).then(function() {
                                MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigateTo(MS.Entertainment.UI.Monikers.socialAvatarEditorPage, MS.Entertainment.UI.Monikers.socialAvatarEditorFeaturesHub, null, {
                                    createAvatarFlow: true, isDirty: true, filterId: Microsoft.Entertainment.Avatar.Editor.AssetCategoryId.body
                                })
                            })
                        }
                    }, _handleModelChanges: function _handleModelChanges() {
                        if (this._events) {
                            this._events.cancel();
                            this._events = null
                        }
                        if (this.model)
                            this._events = MS.Entertainment.Utilities.addEvents(this.model, {refresh: this._handleRefresh.bind(this)});
                        this._updateAccessibilityText()
                    }, _handleRefresh: function _handleRefresh() {
                        if (this.model) {
                            this.avatar.generitarGender = this.model.gender;
                            this.avatar.reload()
                        }
                        this._updateAccessibilityText()
                    }, _updateAccessibilityText: function _updateAccessibilityText() {
                        var accessibilityText,
                            accessibilityButtonText;
                        if (this.model) {
                            accessibilityText = this.model.accessibilityText;
                            accessibilityButtonText = this.model.accessibilityButtonText
                        }
                        MS.Entertainment.Utilities.setAccessibilityText(this.avatar, accessibilityText)
                    }, _updateGender: function _updateGender() {
                        if (this.model && this.model.gender !== undefined) {
                            this.avatar.generitarGender = this.model.gender;
                            this.avatar.renderMode = MS.Entertainment.UI.Controls.avatarRenderMode.play
                        }
                    }
            }, {
                model: null, selected: false
            }, {navigationDelay: 2000})
    })
})()
