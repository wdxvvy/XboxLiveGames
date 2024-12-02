/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Animations/GalleryAnimations.js");
(function()
{
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");
    var _defaultGrouperItemThreshold = 80;
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {TemplateSelectorBase: WinJS.Class.define(function templateSelectorBase() {
            this._templates = {}
        }, {
            _templates: null, addTemplate: function addTemplate(type, templatePath) {
                    if (!type)
                        throw new Error("Invalid template type given to addTemplate()");
                    var oldTemplate = this._templates[type];
                    if (oldTemplate && oldTemplate.promise && oldTemplate.path !== templatePath) {
                        oldTemplate.promise.cancel();
                        oldTemplate.promise = null;
                        oldTemplate.provider = null;
                        this._templates[type] = null
                    }
                    if (templatePath && (!oldTemplate || oldTemplate.path !== templatePath))
                        this._templates[type] = {
                            path: templatePath, promise: null
                        }
                }, getTemplatePath: function getTemplateProvider(type) {
                    if (!type)
                        throw new Error("Invalid template type given to getTemplatePath()");
                    var path;
                    var template = this._templates[type];
                    if (template)
                        path = template.path;
                    return path
                }, getTemplateProvider: function getTemplateProvider(type) {
                    if (!type)
                        throw new Error("Invalid template type given to getTemplateProvider()");
                    return this._getTemplateProvider(this._templates[type])
                }, _getTemplateProvider: function _getTemplateProvider(template) {
                    MS.Entertainment.UI.Controls.assert(template && template.path, "Template for the given type appears to be invalid");
                    if (template.provider)
                        promise = WinJS.Promise.as(template.provider);
                    else if (!template.promise)
                        promise = template.promise = MS.Entertainment.UI.Framework.loadTemplate(template.path, null, true).then(function(provider) {
                            template.provider = provider;
                            return provider
                        });
                    else
                        promise = template.promise;
                    return promise
                }, selectTemplate: function selectTemplate(item, templateTypeHint) {
                    return this.onSelectTemplate(item, templateTypeHint).then(function(provider) {
                            MS.Entertainment.UI.Controls.assert(provider, "Template for the given item appears to be invalid or undefined");
                            return {
                                    provider: provider, item: item
                                }
                        })
                }, onSelectTemplate: function onSelectTemplate(item, templateTypeHint) {
                    templateTypeHint = templateTypeHint || MS.Entertainment.UI.Controls.TemplateSelectorBase.templateType.item;
                    return this.getTemplateProvider(templateTypeHint)
                }, ensureTemplatesLoaded: function ensureTemplatesLoaded(templates) {
                    var promises = [];
                    var item;
                    if (templates)
                        templates.forEach(function(item) {
                            var template = this._templates[item];
                            var promise;
                            if (template)
                                promise = this._getTemplateProvider(template);
                            if (promise)
                                promises.push(promise)
                        }, this);
                    return WinJS.Promise.join(promises)
                }
        }, {templateType: {
                action: "action", emptyGallery: "emptyGallery", item: "item", header: "header", panel: "panel", zoomedOut: "zoomedOut"
            }})});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {
        GalleryTemplateSelector: WinJS.Class.derive(MS.Entertainment.UI.Controls.TemplateSelectorBase, function galleryTemplateSelector() {
            MS.Entertainment.UI.Controls.TemplateSelectorBase.prototype.constructor.call(this)
        }, {
            ensureItemTemplatesLoaded: function ensureItemTemplatesLoaded() {
                return this.ensureTemplatesLoaded([MS.Entertainment.UI.Controls.TemplateSelectorBase.templateType.item, MS.Entertainment.UI.Controls.TemplateSelectorBase.templateType.header, ])
            }, onSelectTemplate: function onSelectTemplate(item) {
                    if (item.isHeader)
                        return this.getTemplateProvider(MS.Entertainment.UI.Controls.TemplateSelectorBase.templateType.header);
                    else if (item.isAction)
                        return this.getTemplateProvider(MS.Entertainment.UI.Controls.TemplateSelectorBase.templateType.action);
                    else
                        return MS.Entertainment.UI.Controls.TemplateSelectorBase.prototype.onSelectTemplate.apply(this, arguments)
                }, getPanelTemplatePath: function getPanelTemplatePath(item) {
                    MS.Entertainment.UI.Controls.assert(this._templates[MS.Entertainment.UI.Controls.TemplateSelectorBase.templateType.panel], "template not defined");
                    return this._templates[MS.Entertainment.UI.Controls.TemplateSelectorBase.templateType.panel].path
                }
        }), GalleryListDataNotificationHandler: WinJS.Class.define(function galleryListDataNotificationHandler(updateCallback) {
                this._updateCallback = updateCallback
            }, {
                countThreshold: NaN, _updateCallback: null, _updating: false, _pendingChanges: null, _pendingCountChange: null, _panelSelected: false, _minimumListLength: 1, minimumListLength: {
                        get: function get_minimumListLength() {
                            return this._minimumListLength
                        }, set: function set_minimumListLength(value) {
                                if (this._minimumListLength !== value) {
                                    this._minimumListLength = value;
                                    this.countChanged()
                                }
                            }
                    }, _pushChange: function _pushChange(change) {
                        this._pendingChanges = this._pendingChanges || [];
                        if (this._pendingChanges.indexOf(change) < 0)
                            this._pendingChanges.push(change)
                    }, _updateGallery: function _updateGallery() {
                        if (!this._updating && this._pendingChanges && this._pendingChanges.length) {
                            var changes = this._pendingChanges;
                            this._pendingChanges = null;
                            this._pendingCountChange = null;
                            this._updateCallback(changes)
                        }
                    }, dispose: function dispose() {
                        this._updateCallback = null
                    }, beginNotifications: function beginNotifications() {
                        this._updating = true
                    }, inserted: function inserted(itemPromise, previousHandle, nextHandle){}, changed: function changed(newItem, oldItem){}, moved: function moved(itemPromise, previousHandle, nextHandle){}, removed: function removed(handle, mirage){}, countChanged: function countChanged(newCount, oldCount) {
                        if (this._pendingCountChange)
                            this._pendingCountChange.newValue = newCount;
                        else
                            this._pendingCountChange = {
                                type: MS.Entertainment.UI.Controls.GalleryListDataNotificationHandler.UpdateType.countChanged, newValue: newCount, oldValue: oldCount, passedThreshold: false
                            };
                        if (this._passedThreshold(newCount, oldCount, this.minimumListLength) || this._passedThreshold(newCount, oldCount, this.countThreshold))
                            this._pendingCountChange.passedThreshold = true;
                        this._pushChange(this._pendingCountChange);
                        this._updateGallery()
                    }, endNotifications: function endNotifications() {
                        this._updating = false;
                        this._updateGallery()
                    }, _passedThreshold: function(newCount, oldCount, threshold) {
                        return ((newCount >= threshold) && (oldCount < threshold)) || ((oldCount >= threshold) && (newCount < threshold))
                    }
            }, {UpdateType: {countChanged: "countChanged"}}), GalleryControlInvocationHelper: WinJS.Class.derive(MS.Entertainment.UI.Framework.ObservableBase, function galleryControlInvocationHelper(galleryControl) {
                this._galleryControl = galleryControl;
                this._smartButtonCallbacks = [];
                this._createActionExecuteCallbacks()
            }, {
                _smartButtonCallbacks: null, _createActionExecuteCallbacks: function _createActionExecuteCallbacks() {
                        var clearInvocation = this.clearInvocation.bind(this);
                        this.addInvocationHandlers({
                            deleteMedia: clearInvocation, exploreAlbum: clearInvocation
                        })
                    }, _mediaContext: null, _appBarServiceStorage: null, _appBarService: {get: function get_appBarService() {
                            if (!this._appBarServiceStorage)
                                this._appBarServiceStorage = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appToolbar);
                            return this._appBarServiceStorage
                        }}, _galleryControl: null, _invokedItem: null, _shareOperation: null, _smartBuyStateEngine: null, _smartStateEngineBindings: null, _delayedActions: null, _currentInvokePromise: null, _pendingInvokeEvent: null, addInvocationHandlers: function addInvocationHandlers(handlers) {
                        this._smartButtonCallbacks = this._smartButtonCallbacks || [];
                        this._smartButtonCallbacks.push(handlers)
                    }, dispose: function dispose() {
                        this.clearInvocation();
                        this._galleryControl = null
                    }, invokedItem: {get: function() {
                            return this._invokedItem
                        }}, invokedKey: {get: function() {
                            return this.invokedItem ? this.invokedItem.key : null
                        }}, invokedIndex: {get: function() {
                            var result;
                            if (this._galleryControl && this._galleryControl.dataSource && this._galleryControl.dataSource.indexFromKey)
                                result = this._galleryControl.dataSource.indexFromKey(this.invokedKey);
                            else if (this.invokedItem)
                                result = this.invokedItem.itemIndex;
                            if (isNaN(result))
                                result = -1;
                            return result
                        }}, _setInvokedItem: function _setInvokedItem(value) {
                        if (this._invokedItem !== value) {
                            var oldValue = this._invokedItem;
                            this._invokedItem = value;
                            this.dispatchChangeAndNotify("invokedItem", value, oldValue)
                        }
                    }, invokeItem: function invokeItem(invocationEvent, eventData) {
                        this._pendingInvokeEvent = invocationEvent;
                        var getDataObject;
                        var invokedItem = {
                                srcElement: invocationEvent.srcElement, itemIndex: invocationEvent.detail.itemIndex
                            };
                        if (!invocationEvent.detail.rerender && WinJS.Utilities.hasClass(invokedItem.srcElement, "invoked")) {
                            this._clearInvokedAttributes(invokedItem.srcElement);
                            this.clearInvocation()
                        }
                        else {
                            this._setInvokedAttributes(invokedItem.srcElement);
                            if (eventData)
                                getDataObject = WinJS.Promise.wrap(eventData);
                            else if (invocationEvent.detail.itemPromise)
                                getDataObject = invocationEvent.detail.itemPromise;
                            else
                                getDataObject = this._galleryControl.getItemAtIndex(invocationEvent.detail.itemIndex)
                        }
                        if (this._currentInvokePromise) {
                            this._currentInvokePromise.cancel();
                            this._currentInvokePromise = null
                        }
                        if (getDataObject)
                            this._currentInvokePromise = getDataObject.then(function getItemsLibraryId(data) {
                                if (this._pendingInvokeEvent !== invocationEvent)
                                    return;
                                var key = data.key;
                                var itemData = data.data || data;
                                var promise;
                                if (this._clearInvocationIfNeeded(itemData, key)) {
                                    MS.Entertainment.ViewModels.MediaItemModel.augment(itemData);
                                    promise = MS.Entertainment.ViewModels.MediaItemModel.hydrateLibraryInfoAsync(itemData).then(function() {
                                        return data
                                    })
                                }
                                else if (invokedItem.srcElement !== this.invokedItem.srcElement) {
                                    if (this.invokedItem && this.invokedItem.srcElement)
                                        this._clearInvokedAttributes(this.invokedItem.srcElement);
                                    this.invokedItem.srcElement = invokedItem.srcElement
                                }
                                return promise || WinJS.Promise.wrap(data)
                            }.bind(this)).then(function getItemData(data) {
                                if (this._pendingInvokeEvent !== invocationEvent)
                                    return;
                                var key;
                                if (data) {
                                    key = data.key;
                                    data = data.data || data
                                }
                                if (data) {
                                    this._smartBuyStateEngine = new MS.Entertainment.ViewModels.SmartBuyStateEngine;
                                    this._setupSmartButtons(data, invocationEvent.detail.itemIndex, key);
                                    MS.Entertainment.UI.Controls.assert(!data.smartBuyStateEngine, "We do not expect this property to be set already.");
                                    if (data.eventProxy)
                                        this._smartBuyStateEngine.eventProxy = data.eventProxy;
                                    else
                                        data.addProperty("smartBuyStateEngine", this._smartBuyStateEngine);
                                    MS.Entertainment.UI.Controls.UserFeedbackDialog.inlineDetailsItem = data;
                                    this._shareModel(data);
                                    invokedItem.data = data;
                                    invokedItem.key = key;
                                    this._setInvokedItem(invokedItem);
                                    return WinJS.Promise.timeout(MS.Entertainment.UI.Controls.GalleryControlInvocationHelper.actionDelayMs).then(function() {
                                            return data
                                        })
                                }
                            }.bind(this)).then(function delayedActions(data) {
                                if (this._pendingInvokeEvent !== invocationEvent)
                                    return;
                                if (data) {
                                    if (data.hydrate && !data.hydrated) {
                                        var options = {collectionFilter: this._mediaContext && this._mediaContext.collectionFilter};
                                        data.hydrate(options).done(null, function(){})
                                    }
                                    this._smartStateEngineBindings = WinJS.Binding.bind(this._smartBuyStateEngine, {currentAppbarActions: this._setAppbarActions.bind(this)})
                                }
                                this._pendingInvokeEvent = null
                            }.bind(this), function delayedActions_Error() {
                                if (this._pendingInvokeEvent !== invocationEvent)
                                    return;
                                this._pendingInvokeEvent = null
                            })
                    }, _setAppbarActions: function _setAppbarActions(newValue, oldValue) {
                        if ((this._smartStateEngineBindings || (oldValue === undefined && !this._smartStateEngineBindings)) && this._mediaContext)
                            this._mediaContext.setToolbarActions(this._smartBuyStateEngine.currentAppbarActions)
                    }, _toggleOffIfNeeded: function _toggleOffIfNeeded(newKey) {
                        var toggledOff = false;
                        if (this.invokedItem && this.invokedItem.key === newKey && newKey) {
                            this.clearInvocation();
                            toggledOff = true
                        }
                        return toggledOff
                    }, _setInvokedAttributes: function _setInvokedAttributes(element) {
                        WinJS.Utilities.addClass(element, "invoked");
                        WinJS.Promise.timeout(750).done(function updateFocus() {
                            var actionList = element.querySelector(".inPlaceDetailsItemActions");
                            if (actionList && document.activeElement === element) {
                                var firstButton = actionList.querySelector(".iconButton");
                                if (firstButton)
                                    MS.Entertainment.UI.Framework.focusElement(firstButton)
                            }
                        })
                    }, _clearInvokedAttributes: function _clearInvokedAttributes(element) {
                        WinJS.Utilities.removeClass(element, "invoked")
                    }, _clearInvocationIfNeeded: function _clearInvocationIfNeeded(newData, newKey) {
                        var cleared = true;
                        if (this.invokedItem)
                            if (newData && this.invokedItem.data === newData && newKey && this.invokedItem.key === newKey)
                                cleared = false;
                            else
                                this.clearInvocation();
                        return cleared
                    }, clearInvocation: function clearInvocation() {
                        if (this._currentInvokePromise) {
                            this._currentInvokePromise.cancel();
                            this._currentInvokePromise = null
                        }
                        if (this.invokedItem) {
                            this._clearInvokedAttributes(this.invokedItem.srcElement);
                            WinJS.Utilities.removeClass(this.invokedItem.srcElement, "win-pressed");
                            if (this.invokedItem.data) {
                                MS.Entertainment.UI.Controls.UserFeedbackDialog.inlineDetailsItem = null;
                                this.invokedItem.data.smartBuyStateEngine = null
                            }
                            this._setInvokedItem(null)
                        }
                        this._unshareModel();
                        if (this._delayedActions) {
                            this._delayedActions.cancel();
                            this._delayedActions = null
                        }
                        if (this._smartBuyStateEngine) {
                            this._smartBuyStateEngine.unload();
                            this._smartBuyStateEngine = null
                        }
                        if (this._smartStateEngineBindings) {
                            this._smartStateEngineBindings.cancel();
                            this._smartStateEngineBindings = null
                        }
                        if (this._mediaContext) {
                            this._mediaContext.clearContext();
                            this._mediaContext = null
                        }
                    }, _setupSmartButtons: function _setupSmartButtons(mediaItem, index, key) {
                        switch (mediaItem && mediaItem.mediaType) {
                            default:
                                MS.Entertainment.UI.Controls.assert(false, "unexpected mediaType in inline buttons.");
                                return
                        }
                    }, _shareModel: function _shareModel(media) {
                        var sender = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.shareSender);
                        if (media) {
                            this._unshareModel();
                            try {
                                this._shareOperation = sender.pendingShare(media)
                            }
                            catch(e) {
                                this._shareOperation = null
                            }
                        }
                    }, _unshareModel: function _unshareModel() {
                        if (this._shareOperation) {
                            this._shareOperation.cancel();
                            this._shareOperation = null
                        }
                    }
            }, {
                create: WinJS.Utilities.markSupportedForProcessing(function create(galleryControl) {
                    return new MS.Entertainment.UI.Controls.GalleryControlInvocationHelper(galleryControl)
                }), actionDelayMs: 300
            })
    });
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {
        TrackGalleryControlInvocationHelper: WinJS.Class.derive(MS.Entertainment.UI.Controls.GalleryControlInvocationHelper, function trackGalleryControlInvocationHelper(galleryControl) {
            MS.Entertainment.UI.Controls.GalleryControlInvocationHelper.prototype.constructor.apply(this, arguments)
        }, {
            album: null, _setupSmartButtons: function _setupSmartButtons(mediaItem, index, key) {
                    if (mediaItem && this.album && "album" in mediaItem)
                        mediaItem.album = this.album;
                    MS.Entertainment.UI.Controls.GalleryControlInvocationHelper.prototype._setupSmartButtons.apply(this, arguments)
                }
        }, {createTrackHelper: WinJS.Utilities.markSupportedForProcessing(function createTrackHelper(galleryControl) {
                return new MS.Entertainment.UI.Controls.TrackGalleryControlInvocationHelper(galleryControl)
            })}), SmartDJGalleryControlInvocationHelper: WinJS.Class.derive(MS.Entertainment.UI.Controls.GalleryControlInvocationHelper, function SmartDJGalleryControlInvocationHelper(galleryControl) {
                MS.Entertainment.UI.Controls.GalleryControlInvocationHelper.prototype.constructor.apply(this, arguments)
            }, {invokeItem: function invokeItem(invocationEvent, eventData) {
                    var getDataPromise;
                    var invokedItem = {
                            srcElement: invocationEvent.srcElement, itemIndex: invocationEvent.detail.itemIndex
                        };
                    if (eventData)
                        getDataPromise = WinJS.Promise.wrap(eventData);
                    else if (invocationEvent.detail.itemPromise)
                        getDataPromise = invocationEvent.detail.itemPromise;
                    else
                        getDataPromise = this._galleryControl.getItemAtIndex(invocationEvent.detail.itemIndex);
                    MS.Entertainment.UI.Controls.assert(getDataPromise, "cannot obtain invoked object");
                    getDataPromise.done(function getItemData(data) {
                        var key = data.key;
                        data = data.data || data;
                        if (invokedItem.srcElement === invocationEvent.srcElement) {
                            var _actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                            var action = _actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.playSmartDJ);
                            action.automationId = MS.Entertainment.UI.AutomationIds.galleryPlaySmartDJ;
                            action.parameter = {
                                mediaItem: data, showAppBar: true
                            };
                            action.execute()
                        }
                    }.bind(this), function getItemDataFailed() {
                        MS.Entertainment.UI.Controls.assert(getDataPromise, "cannot find invoked data")
                    }.bind(this))
                }}, {createSmartDJHelper: WinJS.Utilities.markSupportedForProcessing(function createSmartDJHelper(galleryControl) {
                    return new MS.Entertainment.UI.Controls.SmartDJGalleryControlInvocationHelper(galleryControl)
                })}), SearchDetailsInvocationHelper: WinJS.Class.derive(MS.Entertainment.UI.Controls.GalleryControlInvocationHelper, function searchDetailsInvocationHelper(galleryControl) {
                MS.Entertainment.UI.Controls.GalleryControlInvocationHelper.prototype.constructor.apply(this, arguments)
            }, {invokeItem: function invokeItem(invocationEvent, eventData) {
                    var invokedItem = eventData.data;
                    if (invokedItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.track)
                        MS.Entertainment.UI.Controls.GalleryControlInvocationHelper.prototype.invokeItem.apply(this, arguments);
                    else {
                        var popOverParameters = this._galleryControl.createPopOverParameters(eventData);
                        MS.Entertainment.Platform.PlaybackHelpers.showItemDetails(popOverParameters)
                    }
                }}, {create: WinJS.Utilities.markSupportedForProcessing(function create(galleryControl) {
                    return new MS.Entertainment.UI.Controls.SearchDetailsInvocationHelper(galleryControl)
                })}), DoNothingSelectionHelper: WinJS.Class.define(null, {
                dispose: function dispose(){}, updateSelectedItems: function updateSelectedItems(newSelection, oldSelection){}
            }), GalleryControlSelectionHelper: WinJS.Class.define(function galleryControlSelectionHelper(galleryControl, options) {
                this._appBarService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appToolbar);
                this._galleryControl = galleryControl;
                this._containingMedia = {
                    playbackItemSource: null, playbackOffset: -1
                };
                this._updateContainingMedia();
                this._mediaContext = this._appBarService.pushMediaContext(this._galleryControl.selectedItems, this._galleryControl.selectionHandlers, [], {
                    galleryControl: this._galleryControl, executeLocation: MS.Entertainment.UI.Actions.ExecutionLocation.selection, containingMedia: this._containingMedia
                });
                this._mediaContext.collectionFilter = galleryControl._mediaContext && galleryControl._mediaContext.collectionFilter;
                if (options)
                    WinJS.UI.setOptions(this, WinJS.Binding.unwrap(options))
            }, {
                actionCallbacks: null, allowShare: true, _mediaContext: null, _containingMedia: null, _appBarService: null, _galleryControl: null, _selectedItemStateEngine: null, _selectedItemBindings: null, _multiSelectItemActions: null, _selectedItemsNum: null, _disposed: false, _shareOperation: null, dispose: function dispose() {
                        MS.Entertainment.UI.Controls.assert(!this._dispose, "dispose already called on gallery selection helper.");
                        if (this._disposed)
                            return;
                        this._disposed = true;
                        if (this._selectedItemBindings) {
                            this._selectedItemBindings.cancel();
                            this._selectedItemBindings = null
                        }
                        if (this._selectedItemStateEngine) {
                            this._selectedItemStateEngine.unload();
                            this._selectedItemStateEngine = null
                        }
                        this._multiSelectItemActions = null;
                        this._galleryControl = null;
                        this._cancelShareMedia();
                        var appBarControl = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar);
                        if (appBarControl)
                            appBarControl.hide(true);
                        if (this._mediaContext) {
                            this._mediaContext.clearContext();
                            this._mediaContext = null
                        }
                    }, updateSelectedItems: function updateSelectedItems(newSelection, oldSelection) {
                        var selectedIndex;
                        if (!newSelection || newSelection.length === 0) {
                            MS.Entertainment.UI.Controls.assert(newSelection.length, "Dispose was expected to be called instead of this function if there are no items selected.");
                            return
                        }
                        this._cancelShareMedia();
                        this._selectedItemsNum = newSelection.length;
                        if (newSelection.length === 1)
                            this._handleGallerySingleSelection(newSelection[0]);
                        else
                            this._handleGalleryMultiSelection(newSelection);
                        this._updateContainingMedia()
                    }, _updateContainingMedia: function _updateContainingMedia() {
                        if (this._containingMedia)
                            if (!this._galleryControl || !this._galleryControl.mediaContext || !this._galleryControl.mediaContext.containingMedia || !this._galleryControl.dataSource) {
                                this._containingMedia.playbackItemSource = null;
                                this._containingMedia.playbackOffset = -1
                            }
                            else
                                this._containingMedia.playbackItemSource = this._galleryControl.mediaContext.containingMedia.playbackItemSource,
                                this._containingMedia.playbackOffset = this._galleryControl.dataSource.indexToSourceIndex ? this._galleryControl.dataSource.indexToSourceIndex(this._galleryControl.selectedIndex) : this._galleryControl.selectedIndex
                    }, _handleGallerySingleSelection: function _handleGallerySingleSelection(selectedIndex) {
                        if (this._selectedItemBindings) {
                            this._selectedItemBindings.cancel();
                            this._selectedItemBindings = null
                        }
                        if (this._selectedItemStateEngine) {
                            this._selectedItemStateEngine.unload();
                            this._selectedItemStateEngine = null
                        }
                        this._multiSelectItemActions = null;
                        this._galleryControl.getDataObjectAtIndex(selectedIndex).then(function getDataObjectAtIndex_Success(item) {
                            if (this._disposed || this._selectedItemsNum !== 1)
                                return;
                            MS.Entertainment.ViewModels.MediaItemModel.augment(item);
                            MS.Entertainment.ViewModels.MediaItemModel.hydrateLibraryInfoAsync(item);
                            if (item.hydrate && !item.hydrated) {
                                var options = {collectionFilter: this._mediaContext && this._mediaContext.collectionFilter};
                                item.hydrate(options).done(function hydrate_Done() {
                                    this._shareMedia(item)
                                }.bind(this), function hydrate_Error() {
                                    this._shareMedia(item)
                                }.bind(this))
                            }
                            else
                                this._shareMedia(item);
                            this._createSelectionStateEngineForMediaItem(item)
                        }.bind(this), function getDataObjectAtIndex_Error(){})
                    }, _handleGalleryMultiSelection: function _handleGalleryMultiSelection(selectedIndex) {
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicShareToPhone))
                            if (this._galleryControl.selectedItems && this._galleryControl.selectedItems.count)
                                this._shareMedia(this._galleryControl.selectedItems);
                        if (this._multiSelectItemActions) {
                            var appBarControl = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar);
                            if (appBarControl)
                                appBarControl.show();
                            return
                        }
                        if (this._selectedItemBindings) {
                            this._selectedItemBindings.cancel();
                            this._selectedItemBindings = null
                        }
                        if (this._selectedItemStateEngine) {
                            this._selectedItemStateEngine.unload();
                            this._selectedItemStateEngine = null
                        }
                        this._multiSelectItemActions = [];
                        this._galleryControl.getDataObjectAtIndex(selectedIndex[0]).then(function getDataObjectAtIndex_Success(mediaItem) {
                            if (this._disposed || this._selectedItemsNum <= 1)
                                return;
                            switch (mediaItem && mediaItem.mediaType) {
                                default:
                                    this._multiSelectItemActions = [];
                                    break
                            }
                            this._updateAppBarActions(this._multiSelectItemActions)
                        }.bind(this), function getDataObjectAtIndex_Error(){})
                    }, _shareMedia: function _shareMedia(media) {
                        var sender = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.shareSender);
                        if (!this._shareOperation && media && this.allowShare)
                            this._shareOperation = sender.pendingShare(media)
                    }, _cancelShareMedia: function _cancelShareMedia() {
                        if (this._shareOperation) {
                            this._shareOperation.cancel();
                            this._shareOperation = null
                        }
                    }, _createSelectionStateEngineForMediaItem: function _createSelectionStateEngineForMediaItem(mediaItem) {
                        var handler;
                        if (this._disposed || this._selectedItemsNum !== 1)
                            return;
                        this._selectedItemStateEngine = MS.Entertainment.ViewModels.SmartBuyStateEngine.getSelectionStateFromMediaItem(mediaItem);
                        if (this._selectedItemStateEngine)
                            this._selectedItemBindings = WinJS.Binding.bind(this._selectedItemStateEngine, {currentAppbarActions: this._setSelectedItemAppbarActions.bind(this)})
                    }, _setSelectedItemAppbarActions: function _setSelectedItemAppbarActions(newValue, oldValue) {
                        if (oldValue !== undefined && this._selectedItemsNum === 1)
                            this._updateAppBarActions(newValue)
                    }, _updateAppBarActions: function _updateAppBarActions(newActions) {
                        if (this._mediaContext)
                            this._mediaContext.setToolbarActions(newActions);
                        if (newActions.length > 0) {
                            appBarControl = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar);
                            if (appBarControl)
                                appBarControl.show()
                        }
                    }
            }), GalleryControl: MS.Entertainment.UI.Framework.defineUserControl(null, function galleryControlConstructor(element, options) {
                window.msWriteProfilerMark("ent:GalleryControl.Constructed");
                this._eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell;
                this._eventProvider.traceGalleryControl_Load_Start();
                this.readyState = MS.Entertainment.UI.Controls.GalleryControl.ReadyState.itemsLoading;
                this._selectionHandlers = [];
                this.selectionHelperFactory = function selectionHelperFactory(galleryControl) {
                    return new MS.Entertainment.UI.Controls.GalleryControlSelectionHelper(galleryControl, this.selectionHelperOptions)
                };
                var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                this._uiStateHandlers = MS.Entertainment.Utilities.addEventHandlers(uiStateService, {
                    isSnappedChanged: this._onSnappedChanged.bind(this), windowresize: this._handleWindowResize.bind(this)
                })
            }, {
                controlName: "GalleryControl", ignoreChildrenInitialization: true, reorderable: false, horizontal: false, maxRows: -1, headerPosition: "top", selectionMode: "none", tap: "none", swipeBehavior: "none", layout: "grid", loadingBehavior: "randomAccess", headerType: "auto", backdropColor: null, panelOptions: null, queryToPause: null, slotSize: null, itemMargin: null, itemSize: null, largeItemSize: null, itemClass: null, headerClass: null, autoSize: false, suppressInvokeBubble: false, forceInteractive: false, handleFocus: false, pagesToLoad: WinJS.UI._DEFAULT_PAGES_TO_LOAD, inlineExtraData: null, raisePanelReadyEvents: true, raisePanelResetEvents: false, emptyGalleryModel: null, initialSelected: -1, initialInvoked: -1, initialVisible: -1, invocationHelper: null, _selectionHandlers: null, focusFirstItemOnPageLoad: false, restoreFocusOnDataChanges: false, multiSize: false, startNewColumnOnHeaders: false, largeItemIndex: -1, selectionHelperFactory: null, selectionHelperOptions: null, allowSelectAll: true, allowHeaders: true, actionOptions: null, _uiStateHandlers: null, _invokeBehavior: "popOver", _invokeHelperFactory: null, _eventProvider: null, _panelContainer: null, _dataSourceHandlers: null, _dataSourceItemChangeHandlers: null, _listView: null, _zoomView: null, _zoomedOutView: null, _readyStateCallback: null, _selectedIndexChangedCallback: null, _itemInvoked: null, _initialItemCount: -1, _notificationHandler: null, _listBinding: null, _navigationBindings: null, _raisedPanelReady: false, _internalDataSource: null, _focusEventHandler: null, _listViewEventHandler: null, _zoomViewEventHandler: null, _listViewEventCaptureHandler: null, _templateSelector: null, _grouperItemThreshold: _defaultGrouperItemThreshold, _minimumListLength: 1, _selectionHelper: null, _mediaContext: null, _mediaContextOwned: true, _dataSource: null, _invocationHelperEvents: null, _updateCount: 0, _templateSelectorConstructor: MS.Entertainment.UI.Controls.GalleryTemplateSelector, _pendingSelectionFromInvoke: -1, _maxSelectionCount: -1, _semanticZoomInitType: null, _firstPageRendered: false, _ignoreNextInteractiveCheck: false, _restoreFocusIndex: -1, allowZoom: false, initialZoomedOut: false, zoomedOutLayout: "auto", maxSelectionCount: {
                        get: function() {
                            return this._maxSelectionCount
                        }, set: function(value) {
                                if (this._maxSelectionCount !== value)
                                    this._maxSelectionCount = typeof value !== "number" ? -1 : value
                            }
                    }, templateSelectorConstructor: {
                        get: function() {
                            return this._templateSelectorConstructor
                        }, set: function(value) {
                                if (value !== this._templateSelectorConstructor) {
                                    this._templateSelectorConstructor = value;
                                    this._templateSelector = null
                                }
                            }
                    }, dataSource: {
                        get: function() {
                            return this._dataSource
                        }, set: function(value) {
                                if (value !== this._dataSource && !this._unloaded) {
                                    var oldValue = this._dataSource;
                                    this._dataSource = value;
                                    this._dataSourceUpdated(this._dataSource, oldValue);
                                    window.msWriteProfilerMark("ent:GalleryControl.GotData");
                                    this.notify("dataSource", this._dataSource, oldValue)
                                }
                            }
                    }, grouperItemThreshold: {
                        get: function() {
                            return this._grouperItemThreshold
                        }, set: function(value) {
                                if (isNaN(value))
                                    value = _defaultGrouperItemThreshold;
                                this._grouperItemThreshold = value
                            }
                    }, minimumListLength: {
                        get: function() {
                            return this._minimumListLength
                        }, set: function(value) {
                                if (isNaN(value))
                                    value = 1;
                                this._minimumListLength = value;
                                if (this._notificationHandler)
                                    this._notificationHandler.minimumListLength = value
                            }
                    }, templateSelector: {get: function() {
                            if (!this._templateSelector)
                                this._templateSelector = new this.templateSelectorConstructor(this);
                            return this._templateSelector
                        }}, itemTemplate: {
                        get: function() {
                            return this.templateSelector.getTemplatePath(MS.Entertainment.UI.Controls.TemplateSelectorBase.templateType.item)
                        }, set: function(value) {
                                this.templateSelector.addTemplate(MS.Entertainment.UI.Controls.TemplateSelectorBase.templateType.item, value)
                            }
                    }, headerTemplate: {
                        get: function() {
                            return this.templateSelector.getTemplatePath(MS.Entertainment.UI.Controls.TemplateSelectorBase.templateType.header)
                        }, set: function(value) {
                                this.templateSelector.addTemplate(MS.Entertainment.UI.Controls.TemplateSelectorBase.templateType.header, value)
                            }
                    }, actionTemplate: {
                        get: function() {
                            return this.templateSelector.getTemplatePath(MS.Entertainment.UI.Controls.TemplateSelectorBase.templateType.action)
                        }, set: function(value) {
                                this.templateSelector.addTemplate(MS.Entertainment.UI.Controls.TemplateSelectorBase.templateType.action, value)
                            }
                    }, zoomedOutTemplate: {
                        get: function() {
                            return this.templateSelector.getTemplatePath(MS.Entertainment.UI.Controls.TemplateSelectorBase.templateType.zoomedOut)
                        }, set: function(value) {
                                this.templateSelector.addTemplate(MS.Entertainment.UI.Controls.TemplateSelectorBase.templateType.zoomedOut, value)
                            }
                    }, emptyGalleryTemplate: {
                        get: function() {
                            return this.templateSelector.getTemplatePath(MS.Entertainment.UI.Controls.TemplateSelectorBase.templateType.emptyGallery)
                        }, set: function(value) {
                                this.templateSelector.addTemplate(MS.Entertainment.UI.Controls.TemplateSelectorBase.templateType.emptyGallery, value)
                            }
                    }, panelTemplate: {
                        get: function() {
                            return this.templateSelector.getTemplatePath(MS.Entertainment.UI.Controls.TemplateSelectorBase.templateType.panel)
                        }, set: function(value) {
                                this.templateSelector.addTemplate(MS.Entertainment.UI.Controls.TemplateSelectorBase.templateType.panel, value)
                            }
                    }, _panelTemplateTypeMappings: null, panelTemplateTypeMappings: {
                        get: function() {
                            return this._panelTemplateTypeMappings
                        }, set: function(value) {
                                if (value !== this._panelTemplateTypeMappings || !this._panelTemplateTypeMappings)
                                    this._panelTemplateTypeMappings = value
                            }
                    }, _grouper: null, grouper: {
                        get: function() {
                            if (!this._grouper && this._grouperType)
                                this._grouper = new this._grouperType;
                            else if (!this._grouperType && this._grouper)
                                this._grouper = null;
                            return this._grouper
                        }, set: function(value) {
                                if (value !== this._goruper) {
                                    this._grouper = value;
                                    if (this._grouper) {
                                        this._grouperType = Object.getPrototypeOf(this._grouper);
                                        this._grouperType = this._grouperType && this._grouperType.constructor
                                    }
                                    this._updateRefreshThreshold()
                                }
                            }
                    }, _grouperType: null, grouperType: {
                        get: function() {
                            return this._grouperType
                        }, set: function(value) {
                                if (value !== this._grouperType) {
                                    this._grouper = null;
                                    this._grouperType = value;
                                    this._updateRefreshThreshold()
                                }
                            }
                    }, invokeBehavior: {
                        get: function() {
                            return this._invokeBehavior
                        }, set: function(value) {
                                if (value !== this._invokeBehavior) {
                                    this._invokeBehavior = value;
                                    this._updateInvokeHelper()
                                }
                            }
                    }, invokeHelperFactory: {
                        get: function() {
                            return this._invokeHelperFactory
                        }, set: function(value) {
                                if (value !== this._invokeHelperFactory) {
                                    this._invokeHelperFactory = value;
                                    this._updateInvokeHelper()
                                }
                            }
                    }, selectionHandlers: {get: function get_selectionHandlers() {
                            return this._selectionHandlers
                        }}, addSelectionHandlers: function addSelectionHandlers(handlers) {
                        this._selectionHandlers = this._selectionHandlers || [];
                        this._selectionHandlers.push(handlers)
                    }, clearSelectionHandlers: function clearSelectionHandlers() {
                        this._selectionHandlers = []
                    }, mediaContext: {
                        get: function() {
                            return this._mediaContext
                        }, set: function(value) {
                                if (value !== this._mediaContext) {
                                    this._releaseMediaContext();
                                    this._mediaContext = value;
                                    this._mediaContextOwned = false
                                }
                            }
                    }, processItemData: function processItemData(itemData) {
                        return itemData
                    }, internalDataSource: {get: function() {
                            return this._internalDataSource
                        }}, selection: {get: function() {
                            return this._listView ? this._listView.selection : null
                        }}, finalZoomedOutLayout: {get: function() {
                            return this.zoomedOutLayout === MS.Entertainment.UI.Controls.GalleryControl.ZoomedOutLayout.auto ? this.layout : this.zoomedOutLayout
                        }}, finalZoomedOutTemplateType: {get: function() {
                            return this.zoomedOutTemplate ? MS.Entertainment.UI.Controls.TemplateSelectorBase.templateType.zoomedOut : MS.Entertainment.UI.Controls.TemplateSelectorBase.templateType.header
                        }}, useInPlaceHeaders: {get: function() {
                            return (this.layout === MS.Entertainment.UI.Controls.GalleryControl.Layout.list && this.headerType !== MS.Entertainment.UI.Controls.GalleryControl.HeaderType.none) || this.headerType === MS.Entertainment.UI.Controls.GalleryControl.HeaderType.inPlace
                        }}, canZoom: {get: function() {
                            return this.allowZoom && !!this.dataSource && !!this.dataSource.hasGroupHints
                        }}, isZoomReady: {get: function() {
                            return this.canZoom && !!this.dataSource.groupHints
                        }}, isZoomedOut: {
                        get: function() {
                            return this._zoomView ? this._zoomView.zoomedOut : false
                        }, set: function(newValue) {
                                var oldValue = this.isZoomedOut;
                                if (this._zoomView && oldValue !== newValue)
                                    this._zoomView.zoomedOut = newValue
                            }
                    }, initialItemCount: {get: function getItemCount() {
                            return this._initialItemCount
                        }}, _activeListView: {get: function() {
                            return this.isZoomedOut ? this._zoomedOutView : this._listView
                        }}, setIndexFocus: function setIndexFocus(index) {
                        if (this._listView)
                            this._listView.currentItem = {index: index}
                    }, ensureVisible: function ensureVisible(index) {
                        if (this._listView)
                            this._listView.ensureVisible(index)
                    }, getElementAtIndex: function getElementAtIndex(index) {
                        if (this._listView)
                            return this._listView.elementFromIndex(index);
                        return null
                    }, _releaseMediaContext: function _releaseMediaContext() {
                        if (this._mediaContext && this._mediaContextOwned) {
                            this._mediaContext.clearContext();
                            this._mediaContext = null
                        }
                    }, getItemAtIndex: function getItemAtIndex(index) {
                        var promise;
                        if (this._listView && index >= 0)
                            return this._listView.itemDataSource.itemFromIndex(index);
                        else
                            promise = WinJS.Promise.wrap(null);
                        return promise
                    }, getDataObjectAtIndex: function getDataObjectAtIndex(index) {
                        var promise;
                        if (this._listView && index >= 0)
                            return this._listView.itemDataSource.itemFromIndex(index).then(function(item) {
                                    return item.data
                                });
                        else
                            promise = WinJS.Promise.wrap(null);
                        return promise
                    }, _groupByGrouper: function groupByGrouper(item) {
                        return this.grouper.execute(item)
                    }, selectIndex: function selectIndex(index) {
                        if (index && this._listView && this._listView.selection) {
                            var currentSelection = this._listView.selection.getIndices();
                            if (currentSelection.length === 0 || index !== currentSelection[currentSelection.length - 1]) {
                                this._listView.selection.set(index);
                                this._listView.ensureVisible(index)
                            }
                        }
                    }, clearSelection: function clearSelection() {
                        if (this._listView && this._listView.selection)
                            this._listView.selection.clear();
                        this._setSelectedIndex(-1)
                    }, clearInvocation: function clearInvocation() {
                        if (this.invocationHelper)
                            this.invocationHelper.clearInvocation();
                        this._pendingSelectionFromInvoke = -1
                    }, scrollTo: function scrollTo(index) {
                        if (this._listView)
                            this._listView.indexOfFirstVisible = index
                    }, initialize: function initialize() {
                        this.bind("autoSizeMin", this.refreshGalleryWidth.bind(this));
                        this._itemInvoked = this.itemInvoked.bind(this);
                        this._notificationHandler = new MS.Entertainment.UI.Controls.GalleryListDataNotificationHandler(this._dataSourceContentsChanged.bind(this));
                        this._updateRefreshThreshold();
                        this.selectedIndices = [];
                        var navigation = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                        this._navigationBindings = WinJS.Binding.bind(navigation, {currentPage: this._pageChanged.bind(this)});
                        var appBarService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appToolbar);
                        if (this._mediaContextOwned)
                            this._mediaContext = appBarService.pushDefaultContext()
                    }, unload: function unload() {
                        if (this._uiStateHandlers) {
                            this._uiStateHandlers.cancel();
                            this._uiStateHandlers = null
                        }
                        if (this._listBinding) {
                            this._listBinding.release();
                            this._listBinding = null
                        }
                        if (this._notificationHandler) {
                            this._notificationHandler.dispose();
                            this._notificationHandler = null
                        }
                        if (this._focusEventHandler) {
                            this._focusEventHandler.cancel();
                            this._focusEventHandler = null
                        }
                        if (this._navigationBindings) {
                            this._navigationBindings.cancel();
                            this._navigationBindings = null
                        }
                        this._clearListViewEvents();
                        this._clearZoomViewEvents();
                        this._listView = null;
                        this._internalDataSource = null;
                        this._internalZoomedOutDataSource = null;
                        this._dataSource = null;
                        this.selectedItems = null;
                        this._clearInvocationHelper();
                        if (this._selectionHelper) {
                            this._selectionHelper.dispose();
                            this._selectionHelper = null
                        }
                        this._selectionHandlers = null;
                        this._releaseMediaContext();
                        MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                    }, freeze: function freeze() {
                        if (this.queryToPause)
                            this.queryToPause.pause();
                        MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this)
                    }, thaw: function thaw() {
                        MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                        if (this.queryToPause)
                            this.queryToPause.unpause();
                        if (this._activeListView && this._activeListView.indexOfFirstVisible >= 0)
                            this.ensureVisible(this._activeListView.indexOfFirstVisible)
                    }, _updateRefreshThreshold: function _updateRefreshThreshold() {
                        if (this._notificationHandler) {
                            if (this.grouper)
                                this._notificationHandler.countThreshold = this.grouperItemThreshold;
                            else
                                this._notificationHandler.countThreshold = NaN;
                            this._notificationHandler.minimumListLength = this.minimumListLength
                        }
                    }, _calculateIndexToFocus: function _calculateIndexToFocus() {
                        if (this.restoreFocusOnDataChanges && this._restoreFocusIndex === -1 && document.activeElement === null)
                            this._restoreFocusIndex = 0
                    }, _clearListViewEvents: function _clearListViewEvents() {
                        if (this._listViewEventHandler) {
                            this._listViewEventHandler.cancel();
                            this._listViewEventHandler = null
                        }
                        if (this._listViewEventCaptureHandler) {
                            this._listViewEventCaptureHandler.cancel();
                            this._listViewEventCaptureHandler = null
                        }
                    }, _clearZoomViewEvents: function _clearZoomViewEvents() {
                        if (this._zoomViewEventHandler) {
                            this._zoomViewEventHandler.cancel();
                            this._zoomViewEventHandler = null
                        }
                    }, _dataSourceUpdated: function _dataSourceUpdated(dataSource, oldDataSource) {
                        this._clearDataSourceHandlers();
                        this.clearSelection();
                        if (this._selectionHelper) {
                            this._selectionHelper.dispose();
                            this._selectionHelper = null
                        }
                        if ((!this._unloaded) && (dataSource || oldDataSource)) {
                            if (dataSource)
                                this._dataSourceHandlers = MS.Entertainment.Utilities.addEvents(dataSource, {groupHintsChanged: this._updateGroupHints.bind(this)});
                            this._updateGroupHints();
                            this._updateDataSourceGrouper(dataSource).then(function finalizeDataSource() {
                                var returnValue = dataSource || [];
                                if (Array.isArray(returnValue))
                                    if (dataSource)
                                        returnValue = MS.Entertainment.Data.VirtualList.wrapArray(dataSource, {cacheSize: 200});
                                return returnValue
                            }).then(function afterNotArrayGuaranteed(notArray) {
                                if ("createListBinding" in notArray)
                                    this._internalDataSource = notArray;
                                else
                                    this._internalDataSource = new MS.Entertainment.Utilities.VirtualizedDataSource(notArray);
                                this._dataSourceContentsChanged()
                            }.bind(this))
                        }
                    }, _updateGroupHints: function _updateGroupHints() {
                        if (this.isZoomReady)
                            this._internalZoomedOutDataSource = new MS.Entertainment.Utilities.VirtualizedDataSource(this.dataSource.groupHints);
                        else {
                            this._internalZoomedOutDataSource = null;
                            this.isZoomedOut = false
                        }
                        if (this._zoomView)
                            this._zoomView.locked = !this.isZoomReady;
                        if (this._zoomedOutView && (!this.isZoomedOut || !this._zoomedOutView.itemDataSource))
                            this._zoomedOutView.itemDataSource = this._internalZoomedOutDataSource
                    }, _bindToDataSource: function _bindToDataSource(source) {
                        if (this._listBinding) {
                            this._listBinding.release();
                            this._listBinding = null
                        }
                        this._listBinding = source.createListBinding(this._notificationHandler)
                    }, _dataSourceContentsChanged: function _dataSourceContentsChanged(events) {
                        window.msWriteProfilerMark("ent.GalleryControl.DataSourceContentsChanged,StartTM");
                        var countChanged = false;
                        var updateGallery = false;
                        if (events)
                            events.forEach(function(event) {
                                if (!event)
                                    return;
                                if (event.type === MS.Entertainment.UI.Controls.GalleryListDataNotificationHandler.UpdateType.countChanged)
                                    countChanged = true;
                                if (event.passedThreshold)
                                    updateGallery = true
                            });
                        else
                            updateGallery = true;
                        if (updateGallery) {
                            this._updateCount++;
                            var updateCount = this._updateCount;
                            this.templateSelector.ensureItemTemplatesLoaded().then(function templatesLoaded() {
                                window.msWriteProfilerMark("ent.GalleryControl.TemplatesLoaded");
                                if (this._internalDataSource && this._updateCount === updateCount)
                                    return this._internalDataSource.getCount();
                                else
                                    return 0
                            }.bind(this)).then(function gotCount(count) {
                                if (this._updateCount === updateCount) {
                                    this._initialItemCount = count;
                                    if (this.invocationHelper)
                                        this.invocationHelper.clearInvocation();
                                    window.msWriteProfilerMark("ent.GalleryControl.DataSourceContentsChanged,StopTM");
                                    this.updateLayout()
                                }
                            }.bind(this), function loadFailed() {
                                MS.Entertainment.UI.Controls.assert(false, "template load failed")
                            }.bind(this))
                        }
                        else if (countChanged)
                            this._validateSelection()
                    }, groupInfo: function getGroupInfo(userData) {
                        return {
                                enableCellSpanning: true, cellWidth: this.slotSize.width, cellHeight: this.slotSize.height
                            }
                    }, itemInfo: function getItemInfo(item) {
                        var size = {};
                        if (item === this.largeItemIndex) {
                            size.width = (this.largeItemSize && this.largeItemSize.width) ? this.largeItemSize.width : this.itemSize.width;
                            size.height = (this.largeItemSize && this.largeItemSize.height) ? this.largeItemSize.height : this._listView._layout.maxRows * this.itemSize.height + (this._listView._layout.maxRows - 1) * (this.itemMargin.top + this.itemMargin.bottom)
                        }
                        else
                            size.width = this.itemSize.width,
                            size.height = this.itemSize.height;
                        if (this.startNewColumnOnHeaders && this.dataSource && this.dataSource.isHeader && this.dataSource.isHeader(item))
                            size.newColumn = true;
                        return size
                    }, _onSnappedChanged: function _onSnappedChanged(args) {
                        if (args && args.detail && !args.detail.newValue && args.detail.oldValue && this._listView && this.dataSource && !this._firstPageRendered)
                            this.updateLayout()
                    }, _handleWindowResize: function _handleWindowResize() {
                        if (this.maxRows !== -1)
                            return;
                        var newRowCount = MS.Entertainment.Utilities.getRowCountForResolution();
                        this._updateMaxRows(this._listView, newRowCount);
                        this._updateMaxRows(this._zoomedOutView, newRowCount)
                    }, _updateMaxRows: function _updateMaxRows(listView, newRowCount) {
                        if (listView && listView.layout instanceof WinJS.UI.GridLayout && listView.layout.maxRows !== newRowCount)
                            listView.layout.maxRows = newRowCount
                    }, getFirstVisibleIndex: function getFirstVisibleIndex() {
                        return this._activeListView ? WinJS.Promise.as(this._activeListView.indexOfFirstVisible) : WinJS.Promise.wrapError(new Error("There is no first item, as there is no active list view"))
                    }, getLastVisibleIndex: function getLastVisibleIndex() {
                        return this._activeListView ? WinJS.Promise.as(this._activeListView.indexOfLastVisible) : WinJS.Promise.wrapError(new Error("There is no last item, as there is no active list view"))
                    }, getSelection: function getSelection() {
                        return this._listView ? this._listView.selection : null
                    }, setFirstVisibleIndex: function setFirstVisibleIndex(index) {
                        if (this._activeListView)
                            this._activeListView.indexOfFirstVisible = index
                    }, setReadyStateCallback: function setReadyStateCallback(callback) {
                        this._readyStateCallback = callback
                    }, setSelectedIndexChangedCallback: function setSelectedIndexChangedCallback(callback) {
                        this._selectedIndexChangedCallback = callback
                    }, getCurrentItem: function getCurrentItem() {
                        if (this._activeListView)
                            return this._activeListView.currentItem;
                        return null
                    }, setCurrentItem: function setCurrentItem(item) {
                        if (this._activeListView)
                            this._activeListView.currentItem = item
                    }, createItemRenderer: function createItemRenderer(templateType) {
                        templateType = templateType || MS.Entertainment.UI.Controls.TemplateSelectorBase.templateType.item;
                        var that = this;
                        var restoreSetImmediateModeTimer = null;
                        var placeholders = new MS.Entertainment.UI.Framework.ReferenceMap;
                        var firstPagedRenderedEventDispatched = false;
                        var visibleItemCount = 0;
                        var renderedItemCount = 0;
                        var isItemRenderer = templateType === MS.Entertainment.UI.Controls.TemplateSelectorBase.templateType.item;
                        var isListLayout = isItemRenderer ? this.layout === MS.Entertainment.UI.Controls.GalleryControl.Layout.list : this.finalZoomedOutLayout === MS.Entertainment.UI.Controls.GalleryControl.Layout.list;
                        return function galleryViewItemRenderer(itemPromise, recycle) {
                                var container = document.createElement("div");
                                var placeholderRendered;
                                var data;
                                var item;
                                var template;
                                container.listViewItemContainer = true;
                                return {
                                        element: container, renderComplete: itemPromise.then(function selectItemTemplate(itemPromise) {
                                                window.msWriteProfilerMark("ent:dataaquired");
                                                item = itemPromise;
                                                data = that.processItemData(item.data || item, item.index);
                                                return that.templateSelector.selectTemplate(item, templateType).then(function(args) {
                                                        template = args.provider
                                                    })
                                            }).then(function renderUsablePlaceholder() {
                                                if (!template) {
                                                    MS.Entertainment.UI.Controls.fail("Template was not found for the given item");
                                                    return item.ready
                                                }
                                                if (isListLayout) {
                                                    var placeholder = placeholders.get(template);
                                                    if (placeholder) {
                                                        window.msWriteProfilerMark("ent:renderingplaceholder");
                                                        placeholderRendered = true;
                                                        placeholder.render(container, data);
                                                        window.msWriteProfilerMark("ent:renderedplaceholder")
                                                    }
                                                }
                                                if (container.parentElement && isItemRenderer)
                                                    WinJS.Utilities.removeClass(container.parentElement, "invoked");
                                                if (isListLayout && placeholderRendered)
                                                    return item.ready
                                            }).then(function renderActualTemplate() {
                                                if (placeholderRendered)
                                                    container.innerHTML = String.empty;
                                                return template.render(data, container).then(function() {
                                                        if (!isListLayout || !placeholderRendered)
                                                            return item.ready
                                                    })
                                            }).then(function delayInitializeControls() {
                                                window.msWriteProfilerMark("ent:templaterendered");
                                                var activeListView = that._activeListView;
                                                that._raisePanelReadyOnce();
                                                if (isListLayout && firstPagedRenderedEventDispatched && container.parentElement && container.parentElement.parentElement) {
                                                    var placeholder = placeholders.get(template);
                                                    if (placeholder === undefined)
                                                        placeholders.set(template, MS.Entertainment.UI.Framework.getPlaceholderForElement(container))
                                                }
                                                if (activeListView) {
                                                    if (!visibleItemCount && activeListView.indexOfLastVisible >= 0 && activeListView.indexOfFirstVisible >= 0)
                                                        visibleItemCount = (activeListView.indexOfLastVisible - activeListView.indexOfFirstVisible) + 1;
                                                    renderedItemCount++;
                                                    if (renderedItemCount === visibleItemCount && !firstPagedRenderedEventDispatched) {
                                                        that._sendFirstPageRenderedEvent();
                                                        firstPagedRenderedEventDispatched = true;
                                                        that._firstPageRendered = true;
                                                        WinJS.Promise.timeout(2500).done(function deferAria() {
                                                            if (container && !container.hasAttribute("role") && activeListView && activeListView._view && activeListView._view.deferAriaSetup)
                                                                activeListView._view.deferAriaSetup(visibleItemCount, 0, visibleItemCount - 1)
                                                        })
                                                    }
                                                }
                                                if (firstPagedRenderedEventDispatched) {
                                                    if (restoreSetImmediateModeTimer) {
                                                        restoreSetImmediateModeTimer.cancel();
                                                        restoreSetImmediateModeTimer = null
                                                    }
                                                    MS.Entertainment.UI.Framework.setImmediateMode = MS.Entertainment.UI.Framework.setImmediateModes.panning;
                                                    restoreSetImmediateModeTimer = WinJS.Promise.timeout(MS.Entertainment.UI.Controls.GalleryControl._restoreSetImmediateModeTime).then(function() {
                                                        MS.Entertainment.UI.Framework.setImmediateMode = MS.Entertainment.UI.Framework.setImmediateModes.normal
                                                    })
                                                }
                                                MS.Entertainment.UI.Framework.applyWithSelector(container, "[data-win-control]", function(element) {
                                                    var currentControl = element.winControl;
                                                    if (currentControl && currentControl.enableDelayInitialization && currentControl.delayInitialize)
                                                        currentControl.delayInitialize()
                                                });
                                                if (that.delayHydrateLibraryId)
                                                    return MS.Entertainment.ViewModels.MediaItemModel.hydrateLibraryInfoAsync(item.data);
                                                else
                                                    return
                                            }).then(function updateInvokedState() {
                                                var eventDetail;
                                                var itemIsInvoked = (that.invokeBehavior === MS.Entertainment.UI.Controls.GalleryControl.InvokeBehavior.inline && that.invocationHelper && that.invocationHelper.invokedKey === item.key) || that.initialInvoked === item.index;
                                                if (itemIsInvoked && isItemRenderer) {
                                                    eventDetail = {
                                                        itemPromise: itemPromise, itemIndex: item.index, rerender: true
                                                    };
                                                    if (!container.parentElement.parentElement) {
                                                        if (that.invocationHelper)
                                                            that.invocationHelper.invokeItem({
                                                                srcElement: container.parentElement, detail: eventDetail
                                                            })
                                                    }
                                                    else {
                                                        var domEvent = document.createEvent("Event");
                                                        domEvent.initEvent("iteminvoked", true, true);
                                                        domEvent.detail = eventDetail;
                                                        container.parentElement.dispatchEvent(domEvent)
                                                    }
                                                    if (that.initialInvoked !== -1)
                                                        that.scrollTo(that.initialInvoked);
                                                    else
                                                        that.initialInvoked = -1
                                                }
                                                return item
                                            })
                                    }
                            }
                    }, createHeaderRenderer: function createHeaderRenderer(templateType) {
                        var that = this;
                        return function galleryViewRenderGroup(groupPromise) {
                                var container = document.createElement("div");
                                var groupData;
                                if (that.headerClass)
                                    WinJS.Utilities.addClass(container, that.headerClass);
                                return {
                                        element: container, renderComplete: groupPromise.then(function selectGroupTemplate(group) {
                                                groupData = group.data;
                                                return that.templateSelector.getTemplateProvider(MS.Entertainment.UI.Controls.TemplateSelectorBase.templateType.header)
                                            }).then(function renderGroupTemplate(args) {
                                                if (!args)
                                                    return;
                                                return args.render(that.processItemData(groupData), container)
                                            })
                                    }
                            }
                    }, updateLayout: function updateLayout() {
                        var that = this;
                        var groupedData = null;
                        var dataSource = this._internalDataSource;
                        var loadingBehavior = this.loadingBehavior;
                        var zoomedInContainer = document.createElement("div");
                        var zoomedOutContainer;
                        var parentContainer;
                        var zoomViewContainer;
                        var emptyTemplateProvider;
                        this._panelContainer = null;
                        this._calculateIndexToFocus();
                        this._clearListViewEvents();
                        this._clearZoomViewEvents();
                        this._zoomView = null;
                        this._listView = null;
                        this._zoomedOutView = null;
                        this._firstPageRendered = false;
                        window.msWriteProfilerMark("ent:GalleryControl.ListViewCreated,StartTM");
                        if (this.selectionStyleFilled)
                            WinJS.Utilities.addClass(zoomedInContainer, "win-selectionstylefilled");
                        if (this.canZoom) {
                            zoomViewContainer = document.createElement("div");
                            zoomedOutContainer = document.createElement("div");
                            zoomViewContainer.appendChild(zoomedInContainer);
                            zoomViewContainer.appendChild(zoomedOutContainer);
                            parentContainer = zoomViewContainer;
                            WinJS.Utilities.addClass(zoomedInContainer, "ent-zoomedin");
                            WinJS.Utilities.addClass(zoomedOutContainer, "ent-zoomedout")
                        }
                        else
                            parentContainer = zoomedInContainer;
                        if (this.domElement) {
                            MS.Entertainment.Utilities.empty(this.domElement);
                            this.domElement.appendChild(parentContainer)
                        }
                        var firstPagedRenderedEventDispatched = false;
                        var visibleItemCount = 0;
                        var renderedItemCount = 0;
                        that._raisePanelResetOnce();
                        if (this.raisePanelResetEvents && this.dataSource === null)
                            return;
                        else if ((this.dataSource === null) || (this._initialItemCount < this.minimumListLength)) {
                            if (this.emptyGalleryTemplate)
                                this.templateSelector.getTemplateProvider(MS.Entertainment.UI.Controls.TemplateSelectorBase.templateType.emptyGallery).then(function renderEmptyTemplate(emptyTemplateProvider) {
                                    if (emptyTemplateProvider)
                                        emptyTemplateProvider.render(that.emptyGalleryModel, parentContainer);
                                    that._raisePanelReadyOnce();
                                    that._raiseGalleryReadyState(MS.Entertainment.UI.Controls.GalleryControl.ReadyState.complete)
                                });
                            else {
                                that._raisePanelReadyOnce();
                                that._raiseGalleryReadyState(MS.Entertainment.UI.Controls.GalleryControl.ReadyState.complete)
                            }
                            if (that.dataSource !== null) {
                                that._bindToDataSource(dataSource);
                                dataSource.invalidateAll()
                            }
                            if (!this._unloaded) {
                                that._sendFirstPageRenderedEvent();
                                firstPagedRenderedEventDispatched = true
                            }
                            return
                        }
                        if (this.grouper && !this.useInPlaceHeaders && this.allowHeaders)
                            if (this.grouperType !== MS.Entertainment.UI.Controls.GalleryAlphaCharGrouper || this._initialItemCount >= this.grouperItemThreshold) {
                                var groupData = function groupData(item) {
                                        return (this.grouper.useKeyAsData) ? {title: this.grouper.createKey(item)} : this.grouper.createData(item)
                                    };
                                var groupKey = function groupKey(item) {
                                        if (this.grouper)
                                            return this.grouper.createKey(item)
                                    };
                                groupedData = WinJS.UI.computeDataSourceGroups(dataSource, groupKey.bind(this), groupData.bind(this));
                                MS.Entertainment.UI.Controls.assert(loadingBehavior === MS.Entertainment.UI.Controls.GalleryControl.LoadingBehavior.randomAccess, "ListView only supports randomAccess loading behavior for grouped views")
                            }
                        this._bindToDataSource(groupedData || dataSource);
                        var options = {
                                horizontal: this.horizontal, groupHeaderPosition: this.headerPosition === "inline" ? "left" : this.headerPosition
                            };
                        if (this.maxRows >= 0)
                            options.maxRows = this.maxRows;
                        else
                            options.maxRows = MS.Entertainment.Utilities.getRowCountForResolution();
                        if (this.multiSize) {
                            options.groupInfo = this.groupInfo.bind(this);
                            options.itemInfo = this.itemInfo.bind(this)
                        }
                        var isListLayout = this.layout === MS.Entertainment.UI.Controls.GalleryControl.Layout.list;
                        var layout = isListLayout ? new WinJS.UI.ListLayout(options) : new WinJS.UI.GridLayout(options);
                        if (this.backdropColor) {
                            layout.backdropColor = this.backdropColor;
                            layout.disableBackdrop = (this.backdropColor === "transparent")
                        }
                        this._listView = new WinJS.UI.ListView(zoomedInContainer, {
                            resetItem: MS.Entertainment.UI.Controls.GalleryControl.resetItem, layout: layout, reorderable: this.reorderable, itemDataSource: groupedData || dataSource, groupDataSource: groupedData ? groupedData.groups : null, selectionMode: this.selectionMode, tapBehavior: this.tap, swipeBehavior: this.swipeBehavior, loadingBehavior: loadingBehavior, pagesToLoad: this.pagesToLoad, groupHeaderTemplate: this.createHeaderRenderer(), itemTemplate: this.createItemRenderer()
                        });
                        zoomedInContainer.setAttribute("data-win-control", "WinJS.UI.ListView");
                        if (zoomedOutContainer) {
                            var isZoomedOutListLayout = this.finalZoomedOutLayout === MS.Entertainment.UI.Controls.GalleryControl.Layout.list;
                            var zoomedOutLayout;
                            var zoomedOutOptions;
                            if (this.backdropColor)
                                zoomedOutOptions = {
                                    backdropColor: this.backdropColor, disableBackdrop: (this.backdropColor === "transparent")
                                };
                            zoomedOutLayout = isZoomedOutListLayout ? new WinJS.UI.ListLayout(zoomedOutOptions) : new WinJS.UI.GridLayout(zoomedOutOptions);
                            this._zoomedOutView = new WinJS.UI.ListView(zoomedOutContainer, {
                                resetItem: MS.Entertainment.UI.Controls.GalleryControl.resetItem, zoomedOut: this.initialZoomedOut, layout: zoomedOutLayout, selectionMode: MS.Entertainment.UI.Controls.GalleryControl.SelectionMode.none, swipeBehavior: MS.Entertainment.UI.Controls.GalleryControl.swipeBehavior.none, reorderable: this.reorderable, itemDataSource: this._internalZoomedOutDataSource, itemTemplate: this.createItemRenderer(this.finalZoomedOutTemplateType)
                            });
                            zoomedOutContainer.setAttribute("data-win-control", "WinJS.UI.ListView")
                        }
                        if (zoomViewContainer) {
                            this._zoomView = new WinJS.UI.SemanticZoom(zoomViewContainer);
                            this._zoomView.locked = !this.isZoomReady;
                            zoomViewContainer.setAttribute("data-win-control", "WinJS.UI.SemanticZoom")
                        }
                        window.msWriteProfilerMark("ent:GalleryControl.ListViewCreated,StopTM");
                        if (this.initialSelected !== -1) {
                            this._listView.selection.set(this.initialSelected);
                            this._setSelectedIndex(this.initialSelected);
                            this.initialSelected = -1
                        }
                        if (this.initialInvoked >= 0) {
                            this.ensureVisible(this.initialInvoked);
                            this.setIndexFocus(this.initialInvoked)
                        }
                        else if (this.initialVisible >= 0) {
                            this.ensureVisible(this.initialVisible);
                            this.setIndexFocus(this.initialVisible)
                        }
                        this.refreshGalleryWidth();
                        if (this.forceInteractive) {
                            var currentMode = this._listView._mode;
                            currentMode.isInteractive = this._isElementInteractive.bind(this)
                        }
                        if (this.handleFocus) {
                            if (!this._focusEventHandler)
                                this._focusEventHandler = MS.Entertainment.Utilities.addEventHandlers(this.domElement, {focusin: this._onFocusin.bind(this)})
                        }
                        else if (this._focusEventHandler) {
                            this._focusEventHandler.cancel();
                            this._focusEventHandler = null
                        }
                        var userSelectedEverything = false;
                        var _cachedSelectedItemsCount = 0;
                        var handleSelectionChanging = function(event) {
                                if (!event || !event.detail || !event.detail.newSelection) {
                                    MS.Entertainment.UI.Controls.fail("Invalid event passed to handlerSelectionChanging");
                                    return
                                }
                                var nonSourceIndices;
                                var oldIndices;
                                var newIndices;
                                var equal;
                                if (event.detail.newSelection.count()) {
                                    if (that.dataSource)
                                        nonSourceIndices = that.dataSource.nonSourceIndices;
                                    userSelectedEverything = that.selectionMode === MS.Entertainment.UI.Controls.GalleryControl.SelectionMode.multi && (event.detail.newSelection.isEverything() || (userSelectedEverything && event.detail.newSelection.count() >= _cachedSelectedItemsCount));
                                    _cachedSelectedItemsCount = event.detail.newSelection.count();
                                    if (nonSourceIndices && nonSourceIndices.length) {
                                        event.detail.newSelection.remove(nonSourceIndices);
                                        oldIndices = that._listView.selection.getIndices();
                                        newIndices = event.detail.newSelection.getIndices()
                                    }
                                    if (that.maxSelectionCount >= 0 && that.maxSelectionCount < _cachedSelectedItemsCount) {
                                        oldIndices = oldIndices || that._listView.selection.getIndices();
                                        newIndices = newIndices || event.detail.newSelection.getIndices();
                                        if (newIndices && newIndices.length > that.maxSelectionCount) {
                                            newIndices = newIndices.slice(0, that.maxSelectionCount);
                                            event.detail.newSelection.set(newIndices)
                                        }
                                    }
                                    if (newIndices && oldIndices && newIndices.length === oldIndices.length) {
                                        equal = true;
                                        for (var index in newIndices)
                                            if (newIndices[index] !== oldIndices[index]) {
                                                equal = false;
                                                break
                                            }
                                    }
                                }
                                if (equal)
                                    event.preventDefault()
                            };
                        var handleSelectionChanged = function(event) {
                                var newSelection;
                                var oldSelection = that.selectedIndices;
                                if (that._listView && that._listView.selection)
                                    newSelection = that._listView.selection.getIndices();
                                if (that.invocationHelper && that.invocationHelper.invokedIndex >= 0) {
                                    var lastInvokedIndex = that.invocationHelper.invokedIndex;
                                    that.invocationHelper.clearInvocation();
                                    if (that.selectionMode === MS.Entertainment.UI.Controls.GalleryControl.SelectionMode.multi)
                                        that._listView.selection.add(lastInvokedIndex)
                                }
                                if (that._pendingSelectionFromInvoke >= 0) {
                                    that._listView.selection.add(that._pendingSelectionFromInvoke);
                                    that._pendingSelectionFromInvoke = -1
                                }
                                if (newSelection && newSelection.length) {
                                    if (!that.selectedItems)
                                        that.selectedItems = new MS.Entertainment.Data.SelectionList;
                                    that.selectedItems.maxCount = that.maxSelectionCount;
                                    that.selectedItems.setSource(that.dataSource, that._listView.selection, userSelectedEverything);
                                    that._setSelectedIndices(newSelection)
                                }
                                else {
                                    that.selectedItems = null;
                                    that._setSelectedIndices([])
                                }
                                if (newSelection.length)
                                    that._setSelectedIndex(newSelection[newSelection.length - 1]);
                                else if (that._selectionHelper) {
                                    that._selectionHelper.dispose();
                                    that._selectionHelper = null
                                }
                                if (newSelection && newSelection.length && oldSelection) {
                                    if (!that._selectionHelper)
                                        that._selectionHelper = that.selectionHelperFactory(that);
                                    that._selectionHelper.updateSelectedItems(newSelection, oldSelection)
                                }
                                if (that.queryToPause)
                                    if (newSelection && newSelection.length) {
                                        if (!oldSelection || !oldSelection.length)
                                            that.queryToPause.pause()
                                    }
                                    else if (oldSelection && oldSelection.length)
                                        that.queryToPause.unpause()
                            };
                        var initializeSelection = true;
                        var handleReadyStateChanged = function(eventObject) {
                                var readyState = that._listView ? that._listView.loadingState : MS.Entertainment.UI.Controls.GalleryControl.ReadyState.itemsLoading;
                                if (readyState === MS.Entertainment.UI.Controls.GalleryControl.ReadyState.complete) {
                                    this._eventProvider.traceGalleryControl_Load_End();
                                    if (initializeSelection) {
                                        initializeSelection = false;
                                        this._raisePanelReadyOnce()
                                    }
                                    if ((this.focusFirstItemOnPageLoad && MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).lastNavigationWasPage) || (this.restoreFocusOnDataChanges && this._restoreFocusIndex !== -1)) {
                                        this.focusFirstItemOnPageLoad = false;
                                        WinJS.Promise.timeout().then(function focusFirstElement() {
                                            if (this._listView) {
                                                var index = this._restoreFocusIndex > 0 ? this._restoreFocusIndex : 0;
                                                this._restoreFocusIndex = -1;
                                                if (MS.Entertainment.UI.Framework.canMoveFocus(this._listView._element))
                                                    this._listView.currentItem = {
                                                        index: index, hasFocus: true, showFocus: MS.Entertainment.Framework.KeyboardInteractionListener.showKeyboardFocus
                                                    }
                                            }
                                        }.bind(this))
                                    }
                                    that.refreshGalleryWidth()
                                }
                                else
                                    this._eventProvider.traceGalleryControl_LoadingState_Changed(readyState);
                                this._raiseGalleryReadyState(readyState, eventObject)
                            }.bind(this);
                        var handleContentAnimating = function(eventObject) {
                                eventObject.preventDefault();
                                WinJS.UI.Animation.enterContent(eventObject.currentTarget)
                            }.bind(this);
                        var handleMouseDown = function handleMouseDown(event) {
                                this._pendingSelectionFromInvoke = -1;
                                var isInteractive = this._listView._mode ? this._listView._mode.isInteractive : null;
                                var downIndex = this._listView.indexOfElement(event.srcElement);
                                var downItemKey;
                                var validIndex = false;
                                if (this.dataSource)
                                    if (this.dataSource.keyFromIndex) {
                                        downItemKey = this.dataSource.keyFromIndex(downIndex);
                                        validIndex = !!downItemKey
                                    }
                                    else
                                        validIndex = true;
                                if (validIndex)
                                    if (!this.isZoomReady && this.dataSource && this.dataSource.isHeader && this.dataSource.isHeader(downIndex))
                                        event.stopPropagation();
                                    else if (downIndex >= 0 && this.invocationHelper && this.invocationHelper.invokedIndex >= 0 && downIndex !== this.invocationHelper.invokedIndex && downItemKey !== this.invocationHelper.invokedKey && (!isInteractive || !isInteractive(event.srcElement))) {
                                        if (this.selectionMode === MS.Entertainment.UI.Controls.GalleryControl.SelectionMode.multi)
                                            this._pendingSelectionFromInvoke = this.invocationHelper.invokedIndex;
                                        this.invocationHelper.clearInvocation()
                                    }
                            }.bind(this);
                        var handleKeyDown = function handleKeyDown(event) {
                                if (!event)
                                    return;
                                if (this.isZoomReady && event.keyCode === WinJS.Utilities.Key.invokeSemanticZoom) {
                                    this.isZoomedOut = !this.isZoomedOut;
                                    this._semanticZoomInitType = MS.Entertainment.UI.Controls.GalleryControl.SemanticZoomSelected.keyDown
                                }
                                else if (event.ctrlKey && !event.altKey && !event.shiftKey && event.keyCode === WinJS.Utilities.Key.a && !this.allowSelectAll)
                                    event.stopPropagation();
                                else if (this._isElementInteractive(event.target) && this.invocationHelper && this._listView.currentItem && this._listView.currentItem.index === this.invocationHelper.invokedIndex && this.layout === MS.Entertainment.UI.Controls.GalleryControl.Layout.list && (event.keyCode === WinJS.Utilities.Key.downArrow || event.keyCode === WinJS.Utilities.Key.upArrow))
                                    this._ignoreNextInteractiveCheck = true
                            }.bind(this);
                        if (this.layout === MS.Entertainment.UI.Controls.GalleryControl.Layout.list) {
                            var originalListViewResize = this._listView._onResize;
                            this._listView._onResize = function onListViewResize() {
                                if (this._listView && this.visibility)
                                    originalListViewResize.apply(this._listView, arguments)
                            }.bind(this)
                        }
                        this._listViewEventHandler = MS.Entertainment.Utilities.addEventHandlers(this._listView, {
                            loadingstatechanged: handleReadyStateChanged, selectionchanged: handleSelectionChanged, selectionchanging: handleSelectionChanging, iteminvoked: this._itemInvoked
                        });
                        if (this._zoomView)
                            this._zoomViewEventHandler = MS.Entertainment.Utilities.addEventHandlers(this._zoomView, {
                                MSPointerDown: this._zoomingIn.bind(this), keydown: this._zoomingIn.bind(this), zoomchanged: this._zoomChanged.bind(this)
                            });
                        this._listView.oncontentanimating = handleContentAnimating;
                        this._listViewEventCaptureHandler = MS.Entertainment.Utilities.addEventHandlers(this._listView, {
                            MSPointerDown: handleMouseDown, keydown: handleKeyDown
                        }, true)
                    }, _isElementInteractive: function _isElementInteractive(element) {
                        var isInteractive = element && !this._ignoreNextInteractiveCheck && this.forceInteractive && ((element.type === "button") || (element.winControl && element.winControl.isInteractive));
                        this._ignoreNextInteractiveCheck = false;
                        return isInteractive
                    }, _zoomingInIndexPromise: null, _zoomingIn: function _zoomingIn(event) {
                        if (this._disposed)
                            return;
                        var downIndex;
                        if (this._zoomedOutView && this._zoomedOutView.itemDataSource && this.isZoomedOut && event && event.srcElement)
                            downIndex = this._zoomedOutView.indexOfElement(event.srcElement);
                        if (downIndex >= 0)
                            this._zoomingInIndexPromise = this._zoomedOutView.itemDataSource.itemFromIndex(downIndex);
                        else
                            this._zoomingInIndexPromise = null;
                        if (WinJS.Utilities.hasClass(event.target, "win-semanticzoom-button"))
                            this._semanticZoomInitType = MS.Entertainment.UI.Controls.GalleryControl.SemanticZoomSelected.minusClick
                    }, _semanticZoomInit: function _semanticZoomInit() {
                        if (!this._semanticZoomInitType)
                            this._semanticZoomInitType = MS.Entertainment.UI.Controls.GalleryControl.SemanticZoomSelected.pinch;
                        MS.Entertainment.Utilities.Telemetry.logSemanticZoom(this._semanticZoomInitType);
                        this._semanticZoomInitType = null
                    }, _zoomChanged: function _zoomChanged(event) {
                        if (this._disposed)
                            return;
                        if (this.isZoomedOut)
                            this._semanticZoomInit();
                        this.clearInvocation();
                        this.clearSelection();
                        if (this.queryToPause)
                            if (this.isZoomedOut)
                                this.queryToPause.pause();
                            else
                                WinJS.Promise.timeout(5000).done(function() {
                                    if (this.queryToPause)
                                        this.queryToPause.unpause()
                                }.bind(this));
                        if (this._zoomedOutView && this._zoomedOutView.itemDataSource !== this._internalZoomedOutDataSource)
                            this._zoomedOutView.itemDataSource = this._internalZoomedOutDataSource;
                        if (this._zoomingInIndexPromise) {
                            this._zoomingInIndexPromise.then(function wait(item) {
                                return MS.Entertainment.Utilities.redirectPromise(WinJS.Promise.timeout(), item)
                            }).done(function zoomedOutItem(item) {
                                if (item && item.firstItemIndexHint >= 0)
                                    this.ensureVisible(item.firstItemIndexHint)
                            }.bind(this), function ignoreError(error) {
                                MS.Entertainment.UI.Controls.fail("Ensure visible failed during a zoom-in. Error message: " + (error && error.message))
                            });
                            this._zoomingInIndexPromise = null
                        }
                    }, _pageChanged: function _pageChanged(newValue, oldValue) {
                        if (this.invocationHelper)
                            this.invocationHelper.clearInvocation();
                        this.clearSelection();
                        if (this._selectionHelper) {
                            this._selectionHelper.dispose();
                            this._selectionHelper = null
                        }
                    }, _sendFirstPageRenderedEvent: function _sendFirstPageRenderedEvent() {
                        var domEvent = document.createEvent("Event");
                        domEvent.initEvent("galleryFirstPageRendered", true, true);
                        this.domElement.dispatchEvent(domEvent)
                    }, refreshGalleryWidth: function refreshGalleryWidth() {
                        if (this.autoSize && this._listView) {
                            var calculatedWidth = this.calculateWidthToShowAllItems();
                            this.domElement.style.width = Math.max(calculatedWidth, this.autoSizeMin, 1) + "px"
                        }
                        else
                            this.domElement.style.width = ""
                    }, calculateWidthToShowAllItems: function calculateWidthToShowAllItems() {
                        return this._listView._canvas.scrollWidth
                    }, _updateInvokeHelper: function _updateInvokeHelper() {
                        this._clearInvocationHelper();
                        if (this.invokeBehavior === MS.Entertainment.UI.Controls.GalleryControl.InvokeBehavior.inline && this.invokeHelperFactory) {
                            this.invocationHelper = this.invokeHelperFactory(this);
                            this._invocationHelperEvents = MS.Entertainment.Utilities.addEventHandlers(this.invocationHelper, {invokedItemChanged: this._invokeItemChanged.bind(this)})
                        }
                    }, _clearInvocationHelper: function _clearInvocationHelper() {
                        if (this._invocationHelperEvents) {
                            this._invocationHelperEvents.cancel();
                            this._invocationHelperEvents = null
                        }
                        if (this.invocationHelper) {
                            this.invocationHelper.dispose();
                            this._invokeItemChanged({detail: {
                                    newValue: null, oldValue: this.invocationHelper.invokedItem
                                }});
                            this.invocationHelper = null
                        }
                    }, _invokeItemChanged: function _invokedItemChanged(args) {
                        if (this.queryToPause && args && args.detail)
                            if (!args.detail.oldValue && args.detail.newValue)
                                this.queryToPause.pause();
                            else if (args.detail.oldValue && !args.detail.newValue)
                                this.queryToPause.unpause()
                    }, canInvokeForItem: function canInvokeForItem(item) {
                        return (!item || !item.isHeader || (this.isZoomReady && !this.isZoomedOut)) && this.canInvokeForItemOverride(item)
                    }, canInvokeForItemOverride: function canInvokeForItemOverride(item) {
                        return true
                    }, canToggleInvokeForItem: function canToggleInvokeForItem(item) {
                        return this._invokeBehavior === MS.Entertainment.UI.Controls.GalleryControl.InvokeBehavior.inline && this.canInvokeForItem(item) && !item.isAction
                    }, itemInvoked: function itemInvoked(event) {
                        if (this.tap === MS.Entertainment.UI.Controls.GalleryControl.Tap.toggleSelect) {
                            MS.Entertainment.UI.Controls.assert(this.invokeBehavior === MS.Entertainment.UI.Controls.GalleryControl.InvokeBehavior.none, "Cannot use tap=toggleSelect and specify an invokeBehavior other than none");
                            return
                        }
                        if (this.suppressInvokeBubble)
                            event.stopPropagation();
                        event.detail.itemPromise.then(function getItemData(data) {
                            if (!data || !data.data) {
                                MS.Entertainment.UI.Controls.fail("Invalid data returned from item promise during handling of an item invoked.");
                                return
                            }
                            if (!this.canInvokeForItem(data))
                                return;
                            if (this.selectedIndices && this.selectedIndices.length > 0)
                                this.clearSelection();
                            if (data && data.isHeader) {
                                this.isZoomedOut = true;
                                this._semanticZoomInitType = MS.Entertainment.UI.Controls.GalleryControl.SemanticZoomSelected.headerClick
                            }
                            else if (data && data.isAction && data.data && data.data.action) {
                                data.data.action.referenceContainer = {domElement: event.target.querySelector("button .win-commandicon") || event.target};
                                var actionPromise = data.data.action.execute();
                                data.data.action.referenceContainer = null;
                                if (actionPromise && data.data.isModifier) {
                                    var itemIndex = this._listView.currentItem.index;
                                    actionPromise.done(function changeIndexOnGalleryLoad(modifierChanged) {
                                        if (this.restoreFocusOnDataChanges && modifierChanged)
                                            this._restoreFocusIndex = itemIndex
                                    }.bind(this))
                                }
                            }
                            else if (this.invokeBehavior === MS.Entertainment.UI.Controls.GalleryControl.InvokeBehavior.popOver) {
                                var popOverParameters = this.createPopOverParameters(data);
                                MS.Entertainment.Platform.PlaybackHelpers.showItemDetails(popOverParameters)
                            }
                            else if (this.invokeBehavior === MS.Entertainment.UI.Controls.GalleryControl.InvokeBehavior.inline) {
                                MS.Entertainment.UI.Controls.assert(this.invocationHelper, "inline behavior requires an invocation helper");
                                this.invocationHelper.invokeItem(event, data)
                            }
                            else if (this.invokeBehavior === MS.Entertainment.UI.Controls.GalleryControl.InvokeBehavior.details) {
                                var popOverParameters = this.createPopOverParameters(data);
                                MS.Entertainment.Platform.PlaybackHelpers.showItemDetails(popOverParameters)
                            }
                            else if (this.invokeBehavior === MS.Entertainment.UI.Controls.GalleryControl.InvokeBehavior.action) {
                                var actionOptions = this.actionOptions || {};
                                var actionParameter = this.actionOptions.parameter || {};
                                actionParameter.data = data.data;
                                var action = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).getAction(actionOptions.id);
                                action.parameter = actionParameter;
                                action.automationId = action.automationId || this.actionOptions.automationId;
                                action.execute().done()
                            }
                        }.bind(this))
                    }, createPopOverParameters: function createPopOverParameters(data) {
                        var panelConstructor;
                        if (this.panelTemplateTypeMappings)
                            for (var x = 0; x < this.panelTemplateTypeMappings.length; x++) {
                                var templateMapping = this.panelTemplateTypeMappings[x];
                                if (data && data.data && data.data[templateMapping.key] === templateMapping.value) {
                                    panelConstructor = templateMapping.panelTemplate;
                                    break
                                }
                            }
                        if (!panelConstructor)
                            panelConstructor = this.templateSelector.getPanelTemplatePath(data);
                        MS.Entertainment.UI.Controls.assert(panelConstructor, "Pop-over behavior requires a panel constructor");
                        var size = this.panelOptions && this.panelOptions.size ? this.panelOptions.size : MS.Entertainment.Utilities.popOverDefaultSize;
                        data.hasFocus = true;
                        var popOverParameters = {
                                itemConstructor: panelConstructor, size: size
                            };
                        this._createItemChangeHandler(data);
                        popOverParameters.onclose = this._onPopOverClosed.bind(this);
                        popOverParameters.presetPreOverlayFocus = {
                            listView: this._listView, item: data
                        };
                        popOverParameters.dataContext = data;
                        popOverParameters.dataContext.inlineExtraData = this.inlineExtraData;
                        popOverParameters.dataContext.location = this.panelOptions && this.panelOptions.location;
                        popOverParameters.dataContext.collectionFilter = this._mediaContext && this._mediaContext.collectionFilter;
                        return popOverParameters
                    }, _onPopOverClosed: function _onPopOverClosed() {
                        this._clearDataSourceHandlers();
                        if (this.queryToPause && this.queryToPause.forceLiveRefresh)
                            this.queryToPause.forceLiveRefresh()
                    }, _createItemChangeHandler: function _createItemChangeHandler(data) {
                        var itemUpdated = function itemUpdated(args) {
                                if (args && args.detail && args.detail.newValue && args.detail.newValue.data && args.detail.newValue.data.libraryId === data.data.libraryId && args.detail.newValue.data.mediaType === data.data.mediaType)
                                    MS.Entertainment.Utilities.copyAugmentedProperties(args.detail.newValue.data, data.data)
                            }.bind(this);
                        this._clearDataItemChangeHandlers();
                        if (data && data.data)
                            this._dataSourceItemChangeHandlers = MS.Entertainment.Utilities.addEvents(this.dataSource, {
                                itemInserted: itemUpdated, itemChanged: itemUpdated
                            })
                    }, _clearDataItemChangeHandlers: function _clearDataItemChangeHandlers() {
                        if (this._dataSourceItemChangeHandlers) {
                            this._dataSourceItemChangeHandlers.cancel();
                            this._dataSourceItemChangeHandlers = null
                        }
                    }, _clearDataSourceHandlers: function _clearDataSourceHandlers() {
                        this._clearDataItemChangeHandlers();
                        if (this._dataSourceHandlers) {
                            this._dataSourceHandlers.cancel();
                            this._dataSourceHandlers = null
                        }
                    }, _onFocusin: function _onFocusin(event) {
                        var currElement = event && event.target;
                        if (currElement) {
                            this._lastFocusedElement = currElement;
                            WinJS.Promise.timeout().then(function() {
                                if (this._lastFocusedElement && !MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).appBarVisible)
                                    MS.Entertainment.UI.Framework.focusElement(this._lastFocusedElement);
                                this._lastFocusedElement = null
                            }.bind(this))
                        }
                    }, _raisePanelReadyOnce: function _raisePanelReadyOnce() {
                        if (!this._raisedPanelReady) {
                            this._raisedPanelReady = true;
                            if (!this._unloaded && this.raisePanelReadyEvents)
                                MS.Entertainment.UI.Controls.Panel.raisePanelReady(this.domElement)
                        }
                    }, _raisePanelResetOnce: function _raisePanelResetOnce() {
                        if (this._raisedPanelReady) {
                            this._raisedPanelReady = false;
                            if (!this._unloaded && this.raisePanelResetEvents)
                                MS.Entertainment.UI.Controls.Panel.raisePanelReset(this.domElement)
                        }
                    }, _raiseGalleryReadyState: function _raiseGalleryReadyState(readyState, event) {
                        this.readyState = readyState;
                        if (this._readyStateCallback)
                            this._readyStateCallback({
                                readyState: this.readyState, scrolling: (event && event.detail) ? event.detail.scrolling : false
                            })
                    }, _setSelectedIndex: function _setSelectedIndex(newIndex, oldIndex) {
                        oldIndex = oldIndex === undefined ? this.selectedIndex : oldIndex;
                        if (oldIndex !== newIndex) {
                            this.selectedIndex = newIndex;
                            if (this._selectedIndexChangedCallback)
                                this._selectedIndexChangedCallback(newIndex, oldIndex)
                        }
                    }, _validateSelection: function _validateSelection() {
                        var indices;
                        var selection = this._listView && this._listView.selection;
                        if (selection && this.maxSelectionCount >= 0) {
                            if (this.maxSelectionCount < selection.count()) {
                                indices = selection.getIndices();
                                if (indices.length > this.maxSelectionCount)
                                    indices = indices.slice(0, this.maxSelectionCount);
                                else
                                    indices = null
                            }
                            else if (selection.isEverything())
                                indices = [{
                                        firstIndex: 0, lastIndex: this.maxSelectionCount - 1
                                    }];
                            if (indices)
                                selection.set(indices)
                        }
                    }, _updateDataSourceGrouper: function _updateDataSourceGrouper(dataSource) {
                        var promise;
                        if (dataSource && dataSource.setGrouper)
                            if (this.useInPlaceHeaders)
                                promise = dataSource.setGrouper(this.grouper);
                            else
                                promise = dataSource.setGrouper(null);
                        return WinJS.Promise.as(promise)
                    }, _setSelectedIndices: function _setSelectedIndices(value) {
                        if (value !== this.selectedIndices) {
                            var oldValue = this.selectedIndices;
                            this.selectedIndices = value;
                            this.dispatchEvent("selectedIndicesChanged", {
                                newValue: value, oldValue: oldValue
                            })
                        }
                    }
            }, {
                selectedIndex: -1, selectedIndices: null, selectedItems: null, readyState: null, autoSizeMin: 1
            }, {
                resetItem: function resetItem(item, element) {
                    element.listViewReset = true;
                    MS.Entertainment.UI.Framework.unloadControlTree(element)
                }, searchAndApply: function searchAndApply(subTree, operation) {
                        if (subTree && operation) {
                            function applyOnGalleryControl(listView) {
                                var galleryControl;
                                if (listView)
                                    galleryControl = listView.parentElement;
                                if (galleryControl && galleryControl.winControl)
                                    operation(galleryControl.winControl)
                            }
                            MS.Entertainment.UI.Framework.applyWithSelector(subTree, ".win-listview", applyOnGalleryControl)
                        }
                    }, defaultGrouperItemThreshold: _defaultGrouperItemThreshold, maxItemRenderTime: 40, _restoreSetImmediateModeTime: 1000, Layout: {
                        grid: "grid", list: "list"
                    }, ZoomedOutLayout: {
                        auto: "auto", grid: "grid", list: "list"
                    }, HeaderPosition: {
                        inline: "inline", left: "left", top: "top"
                    }, HeaderType: {
                        none: "none", auto: "auto", inPlace: "inPlace"
                    }, SelectionMode: {
                        none: "none", single: "single", multi: "multi"
                    }, Tap: {
                        directSelect: "directSelect", toggleSelect: "toggleSelect", invokeOnly: "invokeOnly", none: "none"
                    }, swipeBehavior: {
                        select: "select", none: "none"
                    }, ReadyState: {
                        itemsLoading: "itemsLoading", viewPortLoaded: "viewPortLoaded", itemsLoaded: "itemsLoaded", complete: "complete"
                    }, LoadingBehavior: {
                        incremental: "incremental", randomAccess: "randomAccess"
                    }, InvokeBehavior: {
                        popOver: "popOver", inline: "inline", details: "details", action: "action", none: "none"
                    }, SemanticZoomSelected: {
                        headerClick: "headerClick", minusClick: "minusClick", keyDown: "keyDown", pinch: "pinch"
                    }
            })
    });
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {ListViewModelGalleryControl: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.GalleryControl, null, function listViewModelGalleryControl(element, options){}, {
            listViewModel: null, processItemData: function processItemData(itemData, index) {
                    return new MS.Entertainment.UI.Controls.ListItemData(itemData, this.listViewModel, index)
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {ListItemData: WinJS.Class.define(function listItemData(data, listViewModel, index) {
            this.data = data;
            this.index = index;
            this.listViewModel = listViewModel
        }, {
            listViewModel: null, data: null, index: -1, instance: {get: function() {
                        return this
                    }}
        })})
})()
