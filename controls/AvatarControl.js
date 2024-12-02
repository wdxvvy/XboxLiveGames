/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Components/SignIn/SignIn.js");
(function(MSE, undefined) {
    WinJS.Namespace.defineWithParent(MSE, "UI.Controls", {
        avatarDisplay: {
            any: "any", image: "image", video: "video"
        }, avatarRenderMode: {
                play: "play", pause: "pause"
            }
    });
    WinJS.Namespace.defineWithParent(MSE, "UI.Controls", {AvatarControl: MSE.UI.Framework.defineUserControl("Controls/AvatarControl.html#AvatarControlTemplate", function AvatarControl(element, options) {
            this._renderState = MSE.UI.Controls.AvatarControl.renderState.idle;
            this.generitarGender = Microsoft.Entertainment.Avatar.AvatarGender.male
        }, {
            generitarGender: null, shutdownOnFreeze: true, _renderState: null, _avatarPictureContainer: null, _avatarVideoElement: null, _rendererInstance: null, _videoAvatarLoadPromise: null, _videoFrameGeneratedPromise: null, _preFrozenRenderMode: null, _isFrozen: null, _isSignedInUser: false, _signInHandler: null, _pendingPropAnimation: false, _pendingShowElement: false, _videoCanPlayHandler: null, _videoErrorHandler: null, _lastGamerTag: null, _bindings: null, _uiState: null, _uiBindings: null, _startPaused: false, _qualityCheckInterval: null, _qualityCheckFailCount: 0, _avatarSampleLatencyThresholdMS: 500, _avatarLatencyFailureTimeSec: 5, _startCalled: false, _currentManifestVersion: null, initialize: function AvatarControl_initialize() {
                    this._uiState = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                    this._uiBindings = WinJS.Binding.bind(this._uiState, {isAppVisible: this._appVisibilityChanged.bind(this)});
                    this._videoCanPlayHandler = this._onVideoCanPlay.bind(this);
                    this._videoErrorHandler = this._onVideoError.bind(this);
                    this._renderState = MSE.UI.Controls.AvatarControl.renderState.idle;
                    var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    this._avatarSampleLatencyThresholdMS = configurationManager.social.avatarSampleLatencyThresholdMS;
                    this._avatarLatencyFailureTimeSec = configurationManager.social.avatarLatencyFailureTimeSec;
                    if (this.alwaysAnimate)
                        this.startControl()
                }, startControl: function startControl() {
                    if (this._startCalled)
                        return;
                    this._startCalled = true;
                    if (!this.alwaysAnimate)
                        if (this._uiState && this._uiState.lowEndSystemAvatarMode)
                            this._startPaused = true;
                        else if (!this._qualityCheckInterval)
                            this._qualityCheckInterval = window.setInterval(this._qualityCheck.bind(this), 1000);
                    this._renderState = MSE.UI.Controls.AvatarControl.renderState.idle;
                    this._shutdownRendererInstance();
                    if (!this._bindings)
                        this._bindings = WinJS.Binding.bind(this, {
                            renderMode: this._applyRenderModeChanges.bind(this), userModel: this._handleUserModelChange.bind(this), animation: this.startAnimation.bind(this), allowPropAnimations: this._playPropAnimation.bind(this), alwaysAnimate: this._alwaysAnimateChange.bind(this)
                        });
                    else
                        this._handleUserModelChange(this.userModel);
                    this._updateDisplayState()
                }, _alwaysAnimateChange: function _alwaysAnimateChange(newValue) {
                    if (newValue) {
                        this._startPaused = false;
                        if (this._qualityCheckInterval) {
                            window.clearInterval(this._qualityCheckInterval);
                            this._qualityCheckInterval = null
                        }
                    }
                    else if (!this._qualityCheckInterval && (this._uiState && !this._uiState.lowEndSystemAvatarMode))
                        this._qualityCheckInterval = window.setInterval(this._qualityCheck.bind(this), 1000)
                }, _appVisibilityChanged: function _appVisibilityChanged(newValue) {
                    if (newValue)
                        this.thaw();
                    else
                        this.freeze()
                }, unload: function AvatarControl_unload() {
                    if (this._uiBindings) {
                        this._uiBindings.cancel();
                        this._uiBindings = null
                    }
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null
                    }
                    if (this._qualityCheckInterval) {
                        window.clearInterval(this._qualityCheckInterval);
                        this._qualityCheckInterval = null
                    }
                    if (this._avatarVideoElement) {
                        this._avatarVideoElement.removeEventListener("canplay", this._videoCanPlayHandler);
                        this._avatarVideoElement.removeEventListener("error", this._videoErrorHandler)
                    }
                    this._shutdownRendererInstance();
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, freeze: function freeze() {
                    if (!this._isFrozen) {
                        this._preFrozenRenderMode = this.renderMode;
                        this.renderMode = MSE.UI.Controls.avatarRenderMode.pause;
                        if (this.shutdownOnFreeze)
                            this._shutdownRendererInstance();
                        else
                            this._playOrPauseRendererInstance();
                        this._isFrozen = true;
                        if (this._qualityCheckInterval) {
                            window.clearInterval(this._qualityCheckInterval);
                            this._qualityCheckInterval = null
                        }
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this)
                }, thaw: function thaw() {
                    MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                    if (this._isFrozen) {
                        this.renderMode = this._preFrozenRenderMode;
                        this._isFrozen = false;
                        if (!this._qualityCheckInterval && (this._uiState && !this._uiState.lowEndSystemAvatarMode) && !this.alwaysAnimate)
                            this._qualityCheckInterval = window.setInterval(this._qualityCheck.bind(this), 1000)
                    }
                }, _qualityCheck: function _qualityCheck() {
                    if (this.renderMode === MS.Entertainment.UI.Controls.avatarRenderMode.play && this._rendererInstance) {
                        var latencyInMS = this._rendererInstance.averageSampleLatency * 0.0001;
                        if (latencyInMS > this._avatarSampleLatencyThresholdMS)
                            this._qualityCheckFailCount += 1;
                        else
                            this._qualityCheckFailCount = 0
                    }
                    if (this._qualityCheckFailCount > this._avatarLatencyFailureTimeSec && this._uiState)
                        this._uiState.lowEndSystemAvatarMode = true;
                    if (this._uiState && this._uiState.lowEndSystemAvatarMode)
                        window.clearInterval(this._qualityCheckInterval)
                }, pause: function pause() {
                    this.renderMode = MS.Entertainment.UI.Controls.avatarRenderMode.pause;
                    this._playOrPauseRendererInstance()
                }, play: function play() {
                    this.renderMode = MS.Entertainment.UI.Controls.avatarRenderMode.play;
                    this._playOrPauseRendererInstance()
                }, shutdown: function shutdown() {
                    this._shutdownRendererInstance();
                    this.started = false
                }, getEditorInstance: function AvatarControl_getEditorInstance() {
                    if (this._videoAvatarLoadPromise)
                        return this._videoAvatarLoadPromise.then(function() {
                                if (this._rendererInstance && this._renderState !== MSE.UI.Controls.AvatarControl.renderState.unloaded) {
                                    var editorFactory = new Microsoft.Entertainment.Avatar.Editor.AvatarEditorFactory;
                                    return editorFactory.createEditor(this._rendererInstance)
                                }
                            }.bind(this));
                    else
                        return WinJS.Promise.wrapError("invalid state")
                }, clickEvent: function clickEvent(event) {
                    var handled = false;
                    if (this.action) {
                        this.action.requeryCanExecute();
                        if (this.action.isEnabled) {
                            this.action.execute();
                            handled = true
                        }
                    }
                    if (!handled)
                        this.passThroughMouseEvent(event)
                }, persistManifest: function AvatarControl_persistManifest() {
                    var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                    if (signIn.isSignedIn && this._rendererInstance) {
                        var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                        var signedInGamerTag = signedInUser.gamerTag;
                        var signedInUserXuid = signedInUser.xuid;
                        this._rendererInstance.persistManifest(signedInGamerTag, signedInUserXuid)
                    }
                }, _handleUserModelChange: function AvatarControl_handleUserModelChange(newValue) {
                    this._loadAvatar(this.userModel)
                }, reload: function AvatarControl_reload() {
                    this._lastGamerTag = null;
                    this._loadAvatar(this.userModel)
                }, _loadAvatar: function AvatarControl_loadAvatar(userModel) {
                    if (userModel && userModel.gamerTag) {
                        var text = String.load(String.id.IDS_SOCIAL_AVATAR_TITLE_NAR).format(userModel.gamerTag);
                        MS.Entertainment.Utilities.setAccessibilityText(this._container, text)
                    }
                    if (!userModel || (userModel.gamerTag && userModel.gamerTag !== this._lastGamerTag)) {
                        if (this._videoAvatarLoadPromise) {
                            this._videoAvatarLoadPromise.cancel();
                            this._videoAvatarLoadPromise = null
                        }
                        this._resetRendererInstance();
                        if (userModel) {
                            this._lastGamerTag = userModel.gamerTag;
                            this.imageUri = this._getImageSource(userModel.gamerTag);
                            var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                            this._isSignedInUser = (signedInUser.gamerTag === userModel.gamerTag);
                            if (!this._canCreateRenderInstance())
                                this._onRendererInstanceFailed();
                            else if (this.renderMode === MS.Entertainment.UI.Controls.avatarRenderMode.play)
                                this._videoAvatarLoadPromise = this._doVideoAvatarLoad(userModel).then(this._onRendererInstance.bind(this), this._onRendererInstanceFailed.bind(this));
                            else
                                this._renderState = MSE.UI.Controls.AvatarControl.renderState.unloaded
                        }
                        else if (this.gamerTag === MS.Entertainment.UI.Controls.AvatarControl.genericGamerTag)
                            if (this._canCreateRenderInstance() && this.renderMode === MS.Entertainment.UI.Controls.avatarRenderMode.play)
                                this._videoAvatarLoadPromise = this._doVideoAvatarLoad().then(this._onRendererInstance.bind(this), this._onRendererInstanceFailed.bind(this));
                            else
                                this._renderState = MSE.UI.Controls.AvatarControl.renderState.unloaded
                    }
                }, _getImageSource: function(gamerTag) {
                    var source;
                    if (gamerTag && gamerTag !== MS.Entertainment.UI.Controls.AvatarControl.signedInUserGamerTag && gamerTag !== MS.Entertainment.UI.Controls.AvatarControl.genericGamerTag)
                        source = MSE.UI.Controls.AvatarControl.avatarPictureUrlFormat.format(MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_AvatarImage), gamerTag);
                    return source
                }, _doVideoAvatarLoad: function AvatarControl_doVideoAvatarLoad(userModel) {
                    var rendererFactory = new Microsoft.Entertainment.Avatar.AvatarRendererFactory;
                    var parsedHeight = parseInt(this.height);
                    var parsedWidth = parseInt(this.width);
                    var aspectRatio = parsedWidth / parsedHeight;
                    var correctedWidth;
                    if (this.allowPropAnimations)
                        correctedWidth = parsedHeight * MS.Entertainment.UI.Controls.AvatarControl.videoAspectRatioForProps;
                    else if (aspectRatio < MS.Entertainment.UI.Controls.AvatarControl.videoAspectRatio)
                        correctedWidth = parsedHeight * MS.Entertainment.UI.Controls.AvatarControl.videoAspectRatio;
                    else
                        correctedWidth = parsedWidth;
                    rendererFactory.setRendererAttribute(Microsoft.Entertainment.Avatar.RendererAttribute.height, parsedHeight);
                    rendererFactory.setRendererAttribute(Microsoft.Entertainment.Avatar.RendererAttribute.width, correctedWidth);
                    if (userModel) {
                        var nativeUserModel = userModel.nativeUserModel;
                        if (userModel.userModel)
                            nativeUserModel = userModel.userModel.nativeUserModel || nativeUserModel;
                        if (!userModel.manifest && !userModel.avatarManifest && nativeUserModel)
                            return nativeUserModel[0].getAvatarManifestAsync().then(function(manifest) {
                                    if (manifest)
                                        userModel.manifest = manifest.manifest;
                                    else
                                        userModel.manifest = null;
                                    try {
                                        return rendererFactory.loadAvatar(userModel.gamerTag, userModel.manifest || userModel.avatarManifest)
                                    }
                                    catch(e) {
                                        return WinJS.Promise.wrapError(new Error("Can't load avatar"))
                                    }
                                });
                        else
                            try {
                                return rendererFactory.loadAvatar(userModel.gamerTag, userModel.manifest || userModel.avatarManifest)
                            }
                            catch(e) {
                                return WinJS.Promise.wrapError(new Error("Can't load avatar"))
                            }
                    }
                    var generitarGender = this.generitarGender;
                    return rendererFactory.loadGeneritar(generitarGender)
                }, _canCreateRenderInstance: function AvatarControl_canCreateRenderInstance() {
                    var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    var enable3dAvatars = configurationManager.avatars.featureEnabled;
                    return enable3dAvatars && this.display !== MSE.UI.Controls.avatarDisplay.image && !MSE.UI.Controls.AvatarControl.inSoftwareRenderingMode
                }, _onRendererInstance: function AvatarControl_onRendererInstance(newInstance) {
                    if (this._renderState === MSE.UI.Controls.AvatarControl.renderState.unloaded) {
                        newInstance.shutdown();
                        return
                    }
                    this._rendererInstance = newInstance;
                    this._renderState = MSE.UI.Controls.AvatarControl.renderState.loaded;
                    this._avatarVideoElement.addEventListener("canplay", this._videoCanPlayHandler);
                    this._avatarVideoElement.addEventListener("error", this._videoErrorHandler);
                    this._videoFrameGeneratedPromise = this._rendererInstance.onFrameGenerated().then(function() {
                        if (!this._rendererInstance)
                            return;
                        if (this._rendererInstance.renderingMode === Microsoft.Entertainment.Avatar.RenderMode.software) {
                            MSE.UI.Controls.AvatarControl.inSoftwareRenderingMode = true;
                            if (this._isSignedInUser)
                                this._uiState.isAvatarRenderingUsingD3D = false;
                            WinJS.Promise.timeout().then(this._onRendererInstanceFailed.bind(this))
                        }
                        else
                            WinJS.Promise.timeout(MSE.UI.Controls.AvatarControl.videoDisplayTimeout).then(function() {
                                if (this._isSignedInUser)
                                    this._uiState.isAvatarRenderingUsingD3D = true;
                                if (this.renderMode === MS.Entertainment.UI.Controls.avatarRenderMode.play) {
                                    this._updateDisplayState();
                                    if (this._startPaused)
                                        this.pause()
                                }
                                else
                                    this._pendingShowVideoElement = true;
                                this.started = true
                            }.bind(this))
                    }.bind(this));
                    try {
                        this._avatarVideoElement.src = this._rendererInstance.getSrcId()
                    }
                    catch(error) {
                        this._onVideoError(error)
                    }
                }, _onVideoCanPlay: function AvatarControl_onVideoCanPlay() {
                    if (this._avatarVideoElement) {
                        this._avatarVideoElement.removeEventListener("canplay", this._videoCanPlayHandler);
                        this._avatarVideoElement.removeEventListener("error", this._videoErrorHandler)
                    }
                    this._playOrPauseRendererInstance()
                }, _onVideoError: function AvatarControl_onVideoError(error) {
                    if (error && error.srcElement && error.srcElement.error) {
                        if (this._avatarVideoElement) {
                            this._avatarVideoElement.removeEventListener("canplay", this._videoCanPlayHandler);
                            this._avatarVideoElement.removeEventListener("error", this._videoErrorHandler)
                        }
                        this._onRendererInstanceFailed()
                    }
                }, _onRendererInstanceFailed: function AvatarControl_onRendererInstanceFailed(error) {
                    if (error && error.message === "Canceled")
                        this._renderState = MSE.UI.Controls.AvatarControl.renderState.unloaded;
                    else if (this._renderState !== MSE.UI.Controls.AvatarControl.renderState.unloaded)
                        this._renderState = MSE.UI.Controls.AvatarControl.renderState.failed;
                    this._updateDisplayState();
                    this._clearRendererInstance();
                    this.started = true
                }, _shutdownRendererInstance: function AvatarControl_shutdownRendererInstance() {
                    this._renderState = MSE.UI.Controls.AvatarControl.renderState.unloaded;
                    this._updateDisplayState();
                    this._clearRendererInstance();
                    this._lastGamerTag = null
                }, _resetRendererInstance: function AvatarControl_resetRendererInstance() {
                    this._renderState = MSE.UI.Controls.AvatarControl.renderState.loading;
                    this._updateDisplayState();
                    this._clearRendererInstance()
                }, _playOrPauseRendererInstance: function AvatarControl_playOrPauseRendererInstance() {
                    if (this._renderState === MSE.UI.Controls.AvatarControl.renderState.loaded) {
                        if (this.renderMode === MS.Entertainment.UI.Controls.avatarRenderMode.pause && this._avatarVideoElement && !this._avatarVideoElement.paused)
                            this._avatarVideoElement.pause();
                        else if (this.renderMode === MS.Entertainment.UI.Controls.avatarRenderMode.play && this._avatarVideoElement && this._avatarVideoElement.paused) {
                            this._avatarVideoElement.play();
                            if (this._pendingShowVideoElement) {
                                this._pendingShowVideoElement = false;
                                this._updateDisplayState()
                            }
                            if (this._pendingPropAnimation) {
                                this._pendingPropAnimation = false;
                                this._playPropAnimation()
                            }
                        }
                    }
                    else if (this._renderState === MSE.UI.Controls.AvatarControl.renderState.unloaded && this.renderMode === MS.Entertainment.UI.Controls.avatarRenderMode.play) {
                        this._startCalled = false;
                        this.started = false;
                        this.startControl()
                    }
                }, _clearRendererInstance: function AvatarControl_clearRendererInstance() {
                    if (this._avatarVideoElement)
                        try {
                            this._avatarVideoElement.src = null
                        }
                        catch(e) {}
                    if (this._videoFrameGeneratedPromise) {
                        this._videoFrameGeneratedPromise.cancel();
                        this._videoFrameGeneratedPromise = null
                    }
                    if (this._rendererInstance) {
                        try {
                            this._rendererInstance.shutdown()
                        }
                        catch(e) {}
                        this._rendererInstance = null
                    }
                }, startAnimation: function AvatarControl_startAnimation(animationId, loopAnimation) {
                    if (this._rendererInstance && animationId >= 0)
                        this._rendererInstance.startAnimation(animationId, loopAnimation)
                }, _playPropAnimation: function AvatarControl_playPropAnimation() {
                    if (this.allowPropAnimations) {
                        var variableTimeoutValue = (Math.random() * 20000) + 10000;
                        var that = this;
                        WinJS.Promise.timeout(variableTimeoutValue).then(function() {
                            if (!that.allowPropAnimations)
                                return;
                            if (that.renderMode === MS.Entertainment.UI.Controls.avatarRenderMode.play)
                                that.startAnimation(Microsoft.Entertainment.Avatar.AvatarAnimationId.carryableAnimation, false);
                            else
                                that._pendingPropAnimation = true
                        })
                    }
                }, _applyRenderModeChanges: function AvatarControl_applyRenderModeChanges(newValue, oldValue) {
                    if (oldValue !== undefined)
                        this._playOrPauseRendererInstance()
                }, _updateDisplayState: function AvatarControl_updateDisplayState() {
                    if (this._avatarPictureContainer && this._avatarVideoElement) {
                        var showImage = false;
                        var showVideo = false;
                        switch (this.display) {
                            case MSE.UI.Controls.avatarDisplay.image:
                                showImage = true;
                                break;
                            case MSE.UI.Controls.avatarDisplay.video:
                                showVideo = this._renderState === MSE.UI.Controls.AvatarControl.renderState.loaded;
                                break;
                            default:
                                showVideo = this._renderState === MSE.UI.Controls.AvatarControl.renderState.loaded && this.renderMode === MS.Entertainment.UI.Controls.avatarRenderMode.play;
                                showImage = this._renderState === MSE.UI.Controls.AvatarControl.renderState.failed;
                                break
                        }
                        if (!showImage)
                            WinJS.Utilities.addClass(this._avatarPictureContainer, "removeFromDisplay");
                        if (!showVideo)
                            WinJS.Utilities.addClass(this._avatarVideoContainer, "removeFromDisplay");
                        if (showImage)
                            WinJS.Utilities.removeClass(this._avatarPictureContainer, "removeFromDisplay");
                        if (showVideo)
                            WinJS.Utilities.removeClass(this._avatarVideoContainer, "removeFromDisplay")
                    }
                }, preventEvent: function preventEvent(event) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    return false
                }, passThroughMouseEvent: function passThroughMouseEvent(event) {
                    var newTarget = event.currentTarget;
                    var currentTargets = [];
                    do {
                        currentTargets.push({
                            target: newTarget, visibility: newTarget.style.visibility
                        });
                        newTarget.style.visibility = "hidden";
                        newTarget = document.elementFromPoint(event.clientX, event.clientY)
                    } while (newTarget && newTarget.tagName === "VIDEO");
                    if (newTarget) {
                        var newEvent = document.createEvent("MouseEvent");
                        newEvent.initMouseEvent(event.type, event.bubbles, event.cancelable, event.view, event.detail, event.screenX, event.screenY, event.clientX, event.clientY, event.ctrlKey, event.altKey, event.shiftKey, event.metaKey, event.button, event.relatedTarget);
                        newTarget.dispatchEvent(newEvent)
                    }
                    currentTargets.forEach(function(item) {
                        item.target.style.visibility = item.visibility
                    }, this);
                    return this.preventEvent(event)
                }
        }, {
            display: MSE.UI.Controls.avatarDisplay.any, renderMode: MS.Entertainment.UI.Controls.avatarRenderMode.play, allowPropAnimations: false, userModel: null, width: "270px", height: "500px", animation: Microsoft.Entertainment.Avatar.AvatarAnimationId.idle, imageUri: null, alwaysAnimate: false, started: false
        }, {
            avatarPictureUrlFormat: "{0}/{1}/avatar-body.png", avatarShadowImageFallback: "/Images/avatar-body.png", renderState: {
                    idle: "idle", unloaded: "unloaded", loading: "loading", loaded: "loaded", failed: "failed"
                }, genericGamerTag: "@generic", signedInUserGamerTag: "@signedIn", videoAspectRatioForProps: 1, videoAspectRatio: (4 / 7), videoDisplayTimeout: 50, inSoftwareRenderingMode: false
        })})
})(WinJS.Namespace.define("MS.Entertainment"))
