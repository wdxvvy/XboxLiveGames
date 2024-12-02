/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Controls/GalleryControl.js", "/Framework/corefx.js", "/Framework/Data/Augmenters/avatarEditorAugmenters.js", "/Framework/shell.js", "/Framework/utilities.js");
(function(MSE, undefined) {
    WinJS.Namespace.defineWithParent(MSE, "Social.AvatarEditor", {
        GalleryMode: {
            none: "none", style: "style", color: "color", props: "props"
        }, GalleryIndex: {noSelection: -1}
    });
    WinJS.Namespace.defineWithParent(MSE, "Social", {
        AvatarEditorGallery: MSE.UI.Framework.defineUserControl("Components/Social/avatarEditorGallery.html#avatarEditorGalleryTemplate", function AvatarEditorGallery(element, options){}, {
            currentPage: null, _onFilterChangedCallback: null, _onGalleryItemClickCallback: null, _onIsDirtyChangedCallback: null, _onBackNavigateCallback: null, _galleryExiting: false, _createAvatarFlow: false, _bindings: null, _skippedSaveOnBind: false, _selectedIndex: MSE.Social.AvatarEditor.GalleryIndex.noSelection, _initialSelectIndex: MSE.Social.AvatarEditor.GalleryIndex.noSelection, initialize: function AvatarEditorGallery_initialize() {
                    this.domElement.addEventListener("galleryFirstPageRendered", function galleryFirstPageRendered() {
                        MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioUpdateAvatarRequestToLoad()
                    });
                    this._onFilterChangedCallback = this._onFilterChanged.bind(this);
                    this._onGalleryItemClickCallback = this._onGalleryItemClick.bind(this);
                    this._onIsDirtyChangedCallback = this._onIsDirtyChanged.bind(this);
                    this._onBackNavigateCallback = this._onCancelClick.bind(this);
                    this._bindings = WinJS.Binding.bind(this, {
                        dataContext: this._onDataContext.bind(this), galleryMode: this._onGalleryMode.bind(this)
                    });
                    this._gallery.domElement.addEventListener("iteminvoked", this._onGalleryItemClickCallback, false)
                }, unload: function AvatarEditorGallery_unload() {
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null
                    }
                    if (this.dataContext) {
                        this.dataContext.primaryModifier.unbind("selectedItem", this._onFilterChangedCallback);
                        if (this.dataContext.viewModel)
                            this.dataContext.viewModel.unbind("isDirty", this._onIsDirtyChangedCallback)
                    }
                    if (this._gallery) {
                        if (this._gallery.domElement)
                            this._gallery.domElement.removeEventListener("iteminvoked", this._onGalleryItemClickCallback);
                        this._gallery = null
                    }
                    if (this._bodySizeControl) {
                        this._bodySizeControl.setEditor(null);
                        this._bodySizeControl.setDirtyCallback(null);
                        this._bodySizeControl = null
                    }
                    this._createAvatarFlow = null;
                    if (this._galleryExiting) {
                        if (this.currentPage)
                            this.currentPage.setNavigationCallback(null);
                        if (this.dataContext) {
                            this.dataContext.viewModel = null;
                            this.dataContext = null
                        }
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, thaw: function thaw() {
                    MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                    this.disableSave = true;
                    this._galleryExiting = true;
                    var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                    navigationService.navigateToDefaultPage()
                }, _onDataContext: function AvatarEditorGallery_onDataContext() {
                    if (!this.dataContext)
                        return;
                    if (this.dataContext.primaryModifier)
                        this.dataContext.primaryModifier.bind("selectedItem", this._onFilterChangedCallback);
                    if (this.dataContext.viewModel) {
                        if (this._backingData.dataContext.viewModel._avatarControl && this._backingData.dataContext.viewModel._avatarControl._renderState !== MSE.UI.Controls.AvatarControl.renderState.unloaded) {
                            this._bodySizeControl.setEditor(this._backingData.dataContext.viewModel._avatarEditorModel);
                            this._bodySizeControl.setDirtyCallback(this._onIsDirtyChangedCallback)
                        }
                        this.dataContext.viewModel.bind("isDirty", this._onIsDirtyChangedCallback);
                        if (this.dataContext.getFilters)
                            this.dataContext.getFilters().then(this._onFilters.bind(this))
                    }
                    if (!this.currentPage) {
                        this.currentPage = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).currentPage;
                        if (this.currentPage.iaNode.moniker === MS.Entertainment.UI.Monikers.socialAvatarEditorPage)
                            this.currentPage.setNavigationCallback(this._onBackNavigateCallback);
                        if (this.currentPage.options) {
                            this.isDirty = this.currentPage.options.isDirty;
                            this._onIsDirtyChanged(this.currentPage.options.isDirty);
                            if (this.dataContext.primaryModifier && this.dataContext.primaryModifier.items) {
                                var initialModifierItem;
                                for (var i = 0; i < this.dataContext.primaryModifier.items.length; i++)
                                    if (this.dataContext.primaryModifier.items[i].id === this.currentPage.options.filterId) {
                                        initialModifierItem = this.dataContext.primaryModifier.items[i];
                                        break
                                    }
                                this.dataContext.primaryModifier.selectedItem = initialModifierItem
                            }
                            this._createAvatarFlow = this.currentPage.options.createAvatarFlow
                        }
                    }
                }, _onGalleryMode: function AvatarEditorGallery_onGalleryMode() {
                    var dataObjectPromise = null;
                    if (this._selectedIndex !== MSE.Social.AvatarEditor.GalleryIndex.noSelection)
                        dataObjectPromise = this._getDataObjectFromIndex(this._selectedIndex);
                    this._selectedIndex = MSE.Social.AvatarEditor.GalleryIndex.noSelection;
                    this.canToggle = false;
                    this.galleryDataSource = null;
                    switch (this.galleryMode) {
                        case MSE.Social.AvatarEditor.GalleryMode.color:
                            this.showColorIcon = true;
                            this.showStyleIcon = false;
                            break;
                        case MSE.Social.AvatarEditor.GalleryMode.style:
                            this.showColorIcon = false;
                            this.showStyleIcon = true;
                            break;
                        case MSE.Social.AvatarEditor.GalleryMode.props:
                        case MSE.Social.AvatarEditor.GalleryMode.none:
                            this.showColorIcon = false;
                            this.showStyleIcon = false;
                            break
                    }
                    if (this.galleryMode !== MSE.Social.AvatarEditor.GalleryMode.none)
                        if (dataObjectPromise)
                            dataObjectPromise.then(function doToggle(dataObject) {
                                dataObject.getToggle().then(this._onGalleryData.bind(this))
                            }.bind(this));
                        else {
                            var selectedFilter = this.dataContext.primaryModifier.selectedItem;
                            if (selectedFilter && this.dataContext.viewModel)
                                this.dataContext.viewModel.getAssetsForCategory(selectedFilter).then(this._onGalleryData.bind(this))
                        }
                }, _onFilterChanged: function AvatarEditorGallery_onFilterChanged(newFilter, oldFilter) {
                    if (newFilter) {
                        if (!oldFilter || oldFilter.id !== newFilter.id) {
                            this._selectedIndex = MSE.Social.AvatarEditor.GalleryIndex.noSelection;
                            this.galleryMode = MSE.Social.AvatarEditor.GalleryMode.none;
                            if (newFilter.id !== Microsoft.Entertainment.Avatar.Editor.AssetCategoryId.body) {
                                if (newFilter.id !== Microsoft.Entertainment.Avatar.Editor.AssetCategoryId.carryable) {
                                    this.galleryMode = MSE.Social.AvatarEditor.GalleryMode.style;
                                    if (oldFilter && oldFilter.id === Microsoft.Entertainment.Avatar.Editor.AssetCategoryId.carryable)
                                        this._backingData.dataContext.viewModel.playAnimation(Microsoft.Entertainment.Avatar.AvatarAnimationId.idle)
                                }
                                else {
                                    this.galleryMode = MSE.Social.AvatarEditor.GalleryMode.props;
                                    this._backingData.dataContext.viewModel.playAnimation(Microsoft.Entertainment.Avatar.AvatarAnimationId.carryableAnimationOneShot)
                                }
                                this.showBodyControl = false
                            }
                            else {
                                this.showGallery = false;
                                this.showBodyControl = true
                            }
                        }
                    }
                    else
                        this.galleryMode = MSE.Social.AvatarEditor.GalleryMode.none
                }, _onGalleryItemClick: function AvatarEditorGallery_onGalleryItemClick(event) {
                    if (!this._galleryExiting)
                        this._setSelectedIndex(event.detail.itemIndex)
                }, _setSelectedIndex: function AvatarEditorGallery_setSelectedIndex(newIndex, initialSelection) {
                    if (this._galleryExiting)
                        return;
                    if (initialSelection)
                        this._initialSelectIndex = newIndex;
                    if (this._selectedIndex === newIndex && newIndex !== this._initialSelectIndex)
                        return;
                    if (this._selectedIndex !== MSE.Social.AvatarEditor.GalleryIndex.noSelection) {
                        var oldDataObject = null;
                        this._getDataObjectFromIndex(this._selectedIndex).then(function removeOld(dataObject) {
                            oldDataObject = dataObject;
                            oldDataObject.isEquipped = false;
                            this._getDataObjectFromIndex(newIndex).then(function equipNew(newDataObject) {
                                function trackEquippedColor(objectTo, objectFrom) {
                                    var customColor = (objectTo.customColors && objectTo.customColors.size > 0 && objectTo.customColors[objectTo.customColors.size - 1]);
                                    var equippedColor = WinJS.Binding.unwrap(objectFrom).equippedColor;
                                    var defaultColor = WinJS.Binding.unwrap(objectTo).defaultColor;
                                    var currentColor = customColor || equippedColor || defaultColor;
                                    if (currentColor)
                                        WinJS.Binding.unwrap(objectTo).equippedColor = currentColor
                                }
                                {};
                                trackEquippedColor(newDataObject, oldDataObject);
                                newDataObject.applyEdit();
                                newDataObject.isEquipped = true
                            }.bind(this))
                        }.bind(this))
                    }
                    this._getDataObjectFromIndex(newIndex).then(function setCanToggle(newDataObject) {
                        this.canToggle = newDataObject && newDataObject.getToggle
                    }.bind(this));
                    this._selectedIndex = newIndex
                }, _getDataObjectFromIndex: function AvatarEditorGallery_getDataObjectFromIndex(index) {
                    return this._gallery.getDataObjectAtIndex(index).then(function(data) {
                            return WinJS.Binding.as(data)
                        })
                }, _onFilters: function AvatarEditorGallery_onFilters(filters) {
                    this.dataContext.primaryModifier.items = filters
                }, _onGalleryData: function AvatarEditorGallery_onGalleryData(items) {
                    var initialSelectIndex = 0;
                    function getInitialSelectionIndex(list) {
                        var items = list.items;
                        for (var i = 0; i < items.length; i++)
                            if (items[i].data.isEquipped) {
                                initialSelectIndex = i;
                                break
                            }
                    }
                    {};
                    function setGalleryDataSource() {
                        this.galleryDataSource = items;
                        this.showGallery = true
                    }
                    {};
                    function captureInitialSelection(state) {
                        if (state.readyState === MS.Entertainment.UI.Controls.GalleryControl.ReadyState.complete) {
                            this._setSelectedIndex(initialSelectIndex, true);
                            this._gallery.setReadyStateCallback(null);
                            if (initialSelectIndex >= 0) {
                                this._gallery.scrollTo(initialSelectIndex);
                                this._gallery.setCurrentItem({
                                    index: initialSelectIndex, hasFocus: true, showFocus: true
                                })
                            }
                        }
                    }
                    this._gallery.setReadyStateCallback(captureInitialSelection.bind(this));
                    items.itemsFromIndex(0).then(getInitialSelectionIndex).then(setGalleryDataSource.bind(this))
                }, _onIsDirtyChanged: function AvatarEditorGallery_onIsDirtyChanged(isDirty) {
                    this.disableSave = !isDirty;
                    this.isDirty = isDirty;
                    if (this._skippedSaveOnBind) {
                        var currentPage = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).currentPage;
                        if (currentPage && currentPage.options)
                            currentPage.options.isDirty = isDirty
                    }
                    else
                        this._skippedSaveOnBind = true
                }, _onSaveClick: function AvatarEditorGallery_onSaveClick() {
                    if (this.dataContext && this.dataContext.viewModel && !this._galleryExiting && !this.disableSave) {
                        this._showSavingSpinner(true);
                        this.dataContext.viewModel.saveChanges().then(function doneSave() {
                            this._showSavingSpinner(false);
                            if (this.dataContext.viewModel.isManifestDirty()) {
                                MS.Entertainment.Utilities.Telemetry.logEditAvatar("Manifest dirty error");
                                MS.Entertainment.UI.Shell.showMessageBox(String.load(String.id.IDS_DIALOG_UNEXPECTED_ERROR_CAPTION), String.load(String.id.IDS_AVATAR_EDITOR_SERVICE_ERROR), {
                                    buttons: [{
                                            title: String.load(String.id.IDS_OK_BUTTON), execute: function onOk(overlay) {
                                                    overlay.hide()
                                                }
                                        }], defaultButtonIndex: 0
                                })
                            }
                            else {
                                MS.Entertainment.Utilities.Telemetry.logEditAvatar();
                                var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                                signedInUser.hasAvatar = true;
                                signedInUser.avatarManifestVersion++;
                                this._galleryExiting = true;
                                this.dataContext.viewModel.persistManifest();
                                this.dataContext.viewModel.playAnimation(Microsoft.Entertainment.Avatar.AvatarAnimationId.celebration);
                                this._onIsDirtyChanged(false);
                                WinJS.Promise.timeout(MSE.Social.AvatarEditorGallery.celebrationAnimationDelayMs).then(function() {
                                    var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                                    if (this._createAvatarFlow)
                                        navigationService.navigateToDefaultPage();
                                    else
                                        navigationService.navigateBack()
                                }.bind(this))
                            }
                        }.bind(this), function saveError(error) {
                            this._showSavingSpinner(false);
                            MS.Entertainment.Utilities.Telemetry.logEditAvatar(error ? error.number : "Unknown error");
                            MS.Entertainment.UI.Shell.showMessageBox(String.load(String.id.IDS_DIALOG_UNEXPECTED_ERROR_CAPTION), String.load(String.id.IDS_AVATAR_EDITOR_MANIFEST_SAVE_FAILURE), {
                                buttons: [{
                                        title: String.load(String.id.IDS_OK_BUTTON), execute: function onOk(overlay) {
                                                overlay.hide()
                                            }
                                    }], defaultButtonIndex: 0
                            })
                        }.bind(this))
                    }
                }, _onCancelClick: function AvatarEditorGallery_onCancelClick() {
                    var blockNavigation = false;
                    var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                    if (!signIn.isSignedIn)
                        blockNavigation = false;
                    else if (!this.disableSave) {
                        var cancelConfirmDialogButtons = [{
                                    title: String.load(String.id.IDS_OK_BUTTON), execute: function onOk(overlay) {
                                            overlay.hide();
                                            this._onIsDirtyChanged(false);
                                            this._galleryExiting = true;
                                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigateBack()
                                        }.bind(this)
                                }, {
                                    title: String.load(String.id.IDS_CANCEL_BUTTON), execute: function onCancel(overlay) {
                                            overlay.hide()
                                        }
                                }];
                        MS.Entertainment.UI.Shell.showMessageBox(String.load(String.id.IDS_AVATAR_EDITOR_CANCEL_CONFIRM_TITLE), String.load(String.id.IDS_AVATAR_EDITOR_CANCEL_CONFIRM_MESSAGE), {
                            buttons: cancelConfirmDialogButtons, defaultButtonIndex: 0, cancelButtonIndex: 1
                        });
                        blockNavigation = true
                    }
                    else if (this._galleryExiting)
                        blockNavigation = false;
                    else {
                        this._galleryExiting = true;
                        blockNavigation = true;
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigateBack()
                    }
                    return blockNavigation
                }, _onStyleGalleryToggle: function AvatarEditorGallery_onStyleGalleryToggle() {
                    this.galleryMode = MSE.Social.AvatarEditor.GalleryMode.style
                }, _onColorGalleryToggle: function AvatarEditorGallery_onColorGalleryToggle() {
                    this.galleryMode = MSE.Social.AvatarEditor.GalleryMode.color
                }, _showSavingSpinner: function _showSavingSpinner(show) {
                    this.hideAllButtons = this._waitCursor.isBusy = show
                }
        }, {
            dataContext: null, galleryDataSource: null, disableSave: true, canToggle: false, showGallery: false, showBodyControl: false, galleryMode: MSE.Social.AvatarEditor.GalleryMode.none, showColorIcon: false, showStyleIcon: false, hideAllButtons: false
        }, {
            celebrationAnimationDelayMs: 3500, loadingUri: "/Images/ico_74x_AvatarItem.png"
        }), AvatarEditorGalleryItem: MSE.UI.Framework.defineUserControl("Components/Social/avatarEditorGallery.html#avatarEditorGalleryAssetItemControlTemplate", function AvatarEditorGalleryItem(element, options){}, {
                _onDataObjectCallback: null, _onIsEquippedCallback: null, initialize: function AvatarEditorGalleryItem_initialize() {
                        if (this.dataObject)
                            this._onDataObject();
                        else {
                            this._onDataObjectCallback = this._onDataObject.bind(this);
                            this.bind("dataObject", this._onDataObjectCallback)
                        }
                    }, unload: function AvatarEditorGalleryItem_unload() {
                        if (this._onDataObjectCallback) {
                            this.unbind("dataObject", this._onDataObjectCallback);
                            this._onDataObjectCallback = null
                        }
                        if (this.dataObject)
                            if (this._onIsEquippedCallback) {
                                this.dataObject.unbind("isEquipped", this._onIsEquippedCallback);
                                this._onIsEquippedCallback = null
                            }
                        MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                    }, _onDataObject: function AvatarEditorGalleryItem_onDataObject() {
                        if (this.dataObject) {
                            this._onIsEquippedCallback = this._onIsEquipped.bind(this);
                            this.dataObject.bind("isEquipped", this._onIsEquippedCallback);
                            switch (this.dataObject.type) {
                                case MSE.Data.Factory.AvatarEditor.EditType.asset:
                                    this.thumbnailSource = this.dataObject.thumbnailSource;
                                    this.isColorizable = this.dataObject.getToggle;
                                    this.isMarketplace = this.dataObject.isMarketplace;
                                    this.isAwardable = this.dataObject.isAwardable;
                                    this.isAssetType = true;
                                    this.itemTitle.textContent = this.dataObject.description;
                                    break;
                                case MSE.Data.Factory.AvatarEditor.EditType.color:
                                    this.itemColor = this.dataObject.itemColor;
                                    this.isColorType = true;
                                    var hslColor = this._convertRgbToHsl(this.dataObject.red, this.dataObject.green, this.dataObject.blue);
                                    this.colorString = this._buildHslString(hslColor);
                                    if (this.domElement && this.domElement.parentElement)
                                        this.domElement.parentElement.setAttribute("aria-label", this.colorString);
                                    break;
                                case MSE.Data.Factory.AvatarEditor.EditType.remove:
                                    this.isRemoveType = true;
                                    this.itemTitle.textContent = String.load(String.id.IDS_REMOVE_BUTTON);
                                    break;
                                default:
                                    MSE.Social.assert(false, "Unknown type passed in: " + this.dataObject.type);
                                    break
                            }
                        }
                    }, _onIsEquipped: function AvatarEditorGalleryItem_onIsEquipped() {
                        this.isEquipped = this.dataObject.isEquipped
                    }, _convertRgbToHsl: function AvatarEditorGalleryItem_convertRgbToHsl(red, green, blue) {
                        var hslColor = {
                                h: 0, s: 0, l: 0
                            };
                        var r = red / 255;
                        var g = green / 255;
                        var b = blue / 255;
                        var min = Math.min(r, g, b);
                        var max = Math.max(r, g, b);
                        var delta = max - min;
                        hslColor.l = (max + min) / 2;
                        if (delta === 0) {
                            hslColor.h = 0;
                            hslColor.s = 0
                        }
                        else {
                            if (hslColor.l < 0.5)
                                hslColor.s = delta / (max + min);
                            else
                                hslColor.s = delta / (2 - max - min);
                            var deltaR = (((max - r) / 6) + (max / 2)) / delta;
                            var deltaG = (((max - g) / 6) + (max / 2)) / delta;
                            var deltaB = (((max - b) / 6) + (max / 2)) / delta;
                            if (r === max)
                                hslColor.h = deltaB - deltaG;
                            else if (g === max)
                                hslColor.h = (1 / 3) + deltaR - deltaB;
                            else if (b === max)
                                hslColor.h = (2 / 3) + deltaG - deltaR;
                            if (hslColor.h < 0)
                                hslColor.h = hslColor.h + 1;
                            if (hslColor.h > 1)
                                hslColor.h = hslColor.h - 1;
                            hslColor.h = hslColor.h * 360
                        }
                        return hslColor
                    }, _buildHslString: function AvatarEditorGalleryItem_buildHslString(hslColor) {
                        if (!hslColor && (!hslColor.h || !hslColor.s || !hslColor.l))
                            return String.empty;
                        var hue = String.empty;
                        var saturation = String.empty;
                        var lightness = String.empty;
                        var hslString = String.empty;
                        if (hslColor.h >= 0 && hslColor.h < 15)
                            hue = String.load(String.id.IDS_AVATAR_EDITOR_COLOR_HUE_RED);
                        else if (hslColor.h >= 15 && hslColor.h < 45)
                            hue = String.load(String.id.IDS_AVATAR_EDITOR_COLOR_HUE_ORANGE);
                        else if (hslColor.h >= 45 && hslColor.h < 75)
                            hue = String.load(String.id.IDS_AVATAR_EDITOR_COLOR_HUE_YELLOW);
                        else if (hslColor.h >= 75 && hslColor.h < 165)
                            hue = String.load(String.id.IDS_AVATAR_EDITOR_COLOR_HUE_GREEN);
                        else if (hslColor.h >= 165 && hslColor.h < 195)
                            hue = String.load(String.id.IDS_AVATAR_EDITOR_COLOR_HUE_CYAN);
                        else if (hslColor.h >= 195 && hslColor.h < 255)
                            hue = String.load(String.id.IDS_AVATAR_EDITOR_COLOR_HUE_BLUE);
                        else if (hslColor.h >= 255 && hslColor.h < 285)
                            hue = String.load(String.id.IDS_AVATAR_EDITOR_COLOR_HUE_PURPLE);
                        else if (hslColor.h >= 285 && hslColor.h < 315)
                            hue = String.load(String.id.IDS_AVATAR_EDITOR_COLOR_HUE_MAGENTA);
                        else if (hslColor.h >= 315 && hslColor.h <= 360)
                            hue = String.load(String.id.IDS_AVATAR_EDITOR_COLOR_HUE_PINK);
                        if (hslColor.s <= .25)
                            saturation = String.load(String.id.IDS_AVATAR_EDITOR_COLOR_SATURATION_FADED);
                        else if (hslColor.s >= .75)
                            saturation = String.load(String.id.IDS_AVATAR_EDITOR_COLOR_SATURATION_SOLID);
                        if (hslColor.l < .15)
                            lightness = String.load(String.id.IDS_AVATAR_EDITOR_COLOR_VERY_DARK);
                        else if (hslColor.l >= .15 && hslColor.l < .35)
                            lightness = String.load(String.id.IDS_AVATAR_EDITOR_COLOR_DARK);
                        else if (hslColor.l >= .35 && hslColor.l < .65);
                        else if (hslColor.l >= .65 && hslColor.l < .80)
                            lightness = String.load(String.id.IDS_AVATAR_EDITOR_COLOR_LIGHT);
                        else if (hslColor.l >= .80)
                            lightness = String.load(String.id.IDS_AVATAR_EDITOR_COLOR_VERY_LIGHT);
                        if (hslColor.s < .05) {
                            hue = String.load(String.id.IDS_AVATAR_EDITOR_COLOR_HUE_GRAY);
                            saturation = String.empty
                        }
                        if (hslColor.l < .1) {
                            hue = String.load(String.id.IDS_AVATAR_EDITOR_COLOR_HUE_BLACK);
                            lightness = String.empty;
                            saturation = String.empty
                        }
                        else if (hslColor.l > .90) {
                            hue = String.load(String.id.IDS_AVATAR_EDITOR_COLOR_HUE_WHITE);
                            lightness = String.empty;
                            saturation = String.empty
                        }
                        if (hue && saturation && lightness)
                            hslString = String.load(String.id.IDS_AVATAR_EDITOR_COLOR_ALL_DESCRIPTORS).format(hue, saturation, lightness);
                        else if (hue && saturation)
                            hslString = String.load(String.id.IDS_AVATAR_EDITOR_COLOR_AND_SATURATION).format(hue, saturation);
                        else if (hue && lightness)
                            hslString = String.load(String.id.IDS_AVATAR_EDITOR_COLOR_AND_LIGHTNESS).format(hue, lightness);
                        else if (hue)
                            hslString = hue;
                        return hslString
                    }
            }, {
                dataObject: null, isEquipped: false, thumbnailSource: String.empty, isColorizable: false, isMarketplace: false, isAwardable: false, itemColor: "rgba(0,0,0,0)", colorString: String.empty, isAssetType: false, isColorType: false, isRemoveType: false
            }), AvatarBodySizeControl: MSE.UI.Framework.defineUserControl("Components/Social/avatarEditorGallery.html#avatarBodySizeControlTemplate", function AvatarBodySizeControl(element, options){}, {
                currentWeight: 0, currentHeight: 0, averageSizeReached: false, _internalEditor: null, _onDirtyCallback: null, _keyboardNavigationManager: null, initialize: function AvatarBodySizeControl_initialize() {
                        this._keyboardNavigationManager = new MS.Entertainment.Framework.KeyboardNavigationManager(this._bodyControl);
                        this._updateAccessibilityText()
                    }, unload: function AvatarBodySizeControl_unload() {
                        this._internalEditor = null;
                        this._onDirtyCallback = null;
                        MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                    }, setEditor: function AvatarBodySizeControl_setEditor(editor) {
                        this._internalEditor = editor;
                        if (this._internalEditor)
                            try {
                                this.currentHeight = this._internalEditor.avatarHeight;
                                this.currentWeight = this._internalEditor.avatarWeight;
                                this._updateButtonStates()
                            }
                            catch(e) {}
                    }, setDirtyCallback: function AvatarBodySizeControl_setDirtyCallback(callback) {
                        this._onDirtyCallback = callback
                    }, _onHeightIncrease: function AvatarBodySizeControl_onHeightIncrease() {
                        if (!this.maxHeightReached) {
                            this.currentHeight += MSE.Social.AvatarBodySizeControl.increment;
                            this._updateAvatar();
                            this._updateButtonStates()
                        }
                    }, _onHeightDecrease: function AvatarBodySizeControl_onHeightDecrease() {
                        if (!this.minHeightReached) {
                            this.currentHeight -= MSE.Social.AvatarBodySizeControl.increment;
                            this._updateAvatar();
                            this._updateButtonStates()
                        }
                    }, _onWeightIncrease: function AvatarBodySizeControl_onWidthIncrease() {
                        if (!this.maxWeightReached) {
                            this.currentWeight += MSE.Social.AvatarBodySizeControl.increment;
                            this._updateAvatar();
                            this._updateButtonStates()
                        }
                    }, _onWeightDecrease: function AvatarBodySizeControl_onWidthDecrease() {
                        if (!this.minWeightReached) {
                            this.currentWeight -= MSE.Social.AvatarBodySizeControl.increment;
                            this._updateAvatar();
                            this._updateButtonStates()
                        }
                    }, _onSizeReset: function AvatarBodySizeControl_onSizeReset() {
                        if (!this.averageSizeReached) {
                            this.currentWeight = MSE.Social.AvatarBodySizeControl.midSize;
                            this.currentHeight = MSE.Social.AvatarBodySizeControl.midSize;
                            this._updateAvatar();
                            this._updateButtonStates()
                        }
                    }, _updateAvatar: function AvatarBodyControl_updateAvatar() {
                        if (this._internalEditor)
                            this._internalEditor.setAvatarBodySize(this.currentHeight, this.currentWeight);
                        if (this._onDirtyCallback)
                            this._onDirtyCallback(true)
                    }, _updateAccessibilityText: function AvatarBodySizeControl_updateAccessibilityText() {
                        var setAccessibilityText = MS.Entertainment.Utilities.setAccessibilityText;
                        var accessibilityText = MSE.Social.AvatarBodySizeControl.AccessibilityText;
                        setAccessibilityText(this.buttonAverage, accessibilityText.averageHeightAndWeight);
                        var heightIncreaseValue = this.currentHeight + MSE.Social.AvatarBodySizeControl.increment;
                        setAccessibilityText(this.buttonHeightIncrease, accessibilityText.heights[this.minHeightReached ? -1 * heightIncreaseValue : heightIncreaseValue]);
                        var heightDecreaseValue = this.currentHeight - MSE.Social.AvatarBodySizeControl.increment;
                        setAccessibilityText(this.buttonHeightDecrease, accessibilityText.heights[this.maxHeightReached ? -1 * heightDecreaseValue : heightDecreaseValue]);
                        var weightIncreaseValue = this.currentWeight + MSE.Social.AvatarBodySizeControl.increment;
                        setAccessibilityText(this.buttonWeightIncrease, accessibilityText.weights[this.minWeightReached ? -1 * weightIncreaseValue : weightIncreaseValue]);
                        var weightDecreaseValue = this.currentWeight - MSE.Social.AvatarBodySizeControl.increment;
                        setAccessibilityText(this.buttonWeightDecrease, accessibilityText.weights[this.maxWeightReached ? -1 * weightDecreaseValue : weightDecreaseValue])
                    }, _updateButtonStates: function AvatarBodySizeControl_updateButtonStates() {
                        this.maxHeightReached = this.currentHeight === MSE.Social.AvatarBodySizeControl.maxSize;
                        this.minHeightReached = this.currentHeight === MSE.Social.AvatarBodySizeControl.minSize;
                        this.maxWeightReached = this.currentWeight === MSE.Social.AvatarBodySizeControl.maxSize;
                        this.minWeightReached = this.currentWeight === MSE.Social.AvatarBodySizeControl.minSize;
                        this.averageSizeReached = (this.currentHeight === MSE.Social.AvatarBodySizeControl.midSize && this.currentWeight === MSE.Social.AvatarBodySizeControl.midSize);
                        this._updateAccessibilityText()
                    }
            }, {
                maxHeightReached: false, maxWeightReached: false, minHeightReached: false, minWeightReached: false
            }, {
                minSize: -1.0, midSize: 0.0, maxSize: 1.0, increment: 0.5, AccessibilityText: {
                        averageHeightAndWeight: String.load(String.id.IDS_AVATAR_EDITOR_HEIGHT_WEIGHT_AVERAGE), heights: (function() {
                                var heightStrings = {};
                                heightStrings[-1] = String.load(String.id.IDS_AVATAR_EDITOR_HEIGHT_SHORTEST);
                                heightStrings[-0.5] = String.load(String.id.IDS_AVATAR_EDITOR_HEIGHT_SHORTER);
                                heightStrings[0] = String.load(String.id.IDS_AVATAR_EDITOR_HEIGHT_AVERAGE);
                                heightStrings[0.5] = String.load(String.id.IDS_AVATAR_EDITOR_HEIGHT_TALLER);
                                heightStrings[1] = String.load(String.id.IDS_AVATAR_EDITOR_HEIGHT_TALLEST);
                                return heightStrings
                            })(), weights: (function() {
                                var weightStrings = {};
                                weightStrings[-1] = String.load(String.id.IDS_AVATAR_EDITOR_WEIGHT_SMALLEST);
                                weightStrings[-0.5] = String.load(String.id.IDS_AVATAR_EDITOR_WEIGHT_SMALLER);
                                weightStrings[0] = String.load(String.id.IDS_AVATAR_EDITOR_WEIGHT_AVERAGE);
                                weightStrings[0.5] = String.load(String.id.IDS_AVATAR_EDITOR_WEIGHT_LARGER);
                                weightStrings[1] = String.load(String.id.IDS_AVATAR_EDITOR_WEIGHT_LARGEST);
                                return weightStrings
                            })()
                    }
            })
    })
})(WinJS.Namespace.define("MS.Entertainment"))
