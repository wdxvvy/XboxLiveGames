/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Components/Playback/Controls/PlaybackControl.js", "/Framework/utilities.js");
(function() {
    var MSEPlatform = WinJS.Namespace.define("MS.Entertainment.Platform", null);
    WinJS.Namespace.defineWithParent(MS.Entertainment.Platform.Playback, "ClosedCaptions", {RendererObservables: MS.Entertainment.defineObservable(function RendererObservables_ctor(){}, {ccLcid: 0})});
    WinJS.Namespace.defineWithParent(MS.Entertainment.Platform.Playback, "ClosedCaptions", {Renderer: WinJS.Class.derive(MSEPlatform.Playback.ClosedCaptions.RendererObservables, function Renderer_ctor(playbackControl, rendererContainer) {
            if (!playbackControl || !rendererContainer)
                return;
            MSEPlatform.Playback.ClosedCaptions.RendererObservables.prototype.constructor.call(this);
            WinJS.Utilities.addClass(rendererContainer, "hideFromDisplay");
            this._iPlaybackControl = playbackControl;
            this._ccContainer = rendererContainer;
            this._initialize(rendererContainer)
        }, {
            closedCaptionsOn: {
                set: function Renderer_closedCaptionsOn_set(value) {
                    MSEPlatform.Playback.Etw.traceClosedCaptionsOn(value);
                    if (value !== this._closedCaptionsOn)
                        this._onToggleCC(value)
                }, get: function Renderer_closedCaptionsOn_get() {
                        return this._closedCaptionsOn
                    }
            }, _closedCaptionsOn: false, _iPlaybackControl: null, _ccPresenter: null, _ttmlProcessor: null, _ccContainer: null, _ttmlFilepath: String.empty, _ttmlFileLoaded: false, _currentMedia: null, _currentMediaInstance: null, _renderingPaused: true, _processorLeadTime: 100, _currentGeneratedAt: 0, _currentValidUntil: 0, _initialize: function Renderer_initialize(rendererContainer) {
                    if (!this._iPlaybackControl)
                        return;
                    this._closedCaptionsOn = false
                }, _bindToPlaybackControl: function Renderer_bindToPlaybackControl() {
                    this._iPlaybackControl.bind("currentMedia", this._onMediaChanged.bind(this));
                    this._iPlaybackControl.bind("currentPosition", this._onPositionChanged.bind(this));
                    this._iPlaybackControl.bind("currentTransportState", this._onTransportStateChanged.bind(this));
                    this._iPlaybackControl.bind("seekedPosition", this._onSeeked.bind(this));
                    this._ccContainer.onresize = this._setupRenderingSurface.bind(this)
                }, _unbindFromPlaybackControl: function Renderer_unbindFromPlaybackControl() {
                    this._iPlaybackControl.unbind("currentMedia", this._onMediaChanged);
                    this._iPlaybackControl.unbind("currentPosition", this._onPositionChanged);
                    this._iPlaybackControl.unbind("currentTransportState", this._onTransportStateChanged);
                    this._iPlaybackControl.unbind("seekedPosition", this._onSeeked);
                    this._ccContainer.onresize = null
                }, _reset: function Renderer_reset() {
                    this._ttmlFileLoaded = false;
                    this._ccPresenter.flush();
                    this._invalidateRenderingTimeWindow()
                }, _onToggleCC: function Renderer_onToggleCC(activate) {
                    this._closedCaptionsOn = activate;
                    if (activate) {
                        WinJS.Utilities.removeClass(this._ccContainer, "hideFromDisplay");
                        this._iPlaybackControl.enableTimeUpdate();
                        this._bindToPlaybackControl()
                    }
                    else {
                        WinJS.Utilities.addClass(this._ccContainer, "hideFromDisplay");
                        this._stopRendering();
                        this._unbindFromPlaybackControl()
                    }
                }, _onLcidChanged: function Renderer_onLcidChanged(newLcid, oldLcid) {
                    if (!oldLcid || !newLcid || !this._closedCaptionsOn)
                        return;
                    var currentMediaInstance = this._currentMediaInstance;
                    if (currentMediaInstance) {
                        this._ttmlFileLoaded = false;
                        this._onMediaChanged(currentMediaInstance)
                    }
                }, _onMediaChanged: function Renderer_onMediaChanged(newMedia) {
                    if (!newMedia)
                        return;
                    if (!this._closedCaptionsOn)
                        return;
                    if (newMedia.isEqual(this._currentMediaInstance) && this._ttmlFileLoaded) {
                        this._invalidateRenderingTimeWindow();
                        this._startRendering()
                    }
                    else {
                        this._reset();
                        this._currentMediaInstance = newMedia;
                        this._currentMedia = null;
                        if (newMedia._mediaItem)
                            this._currentMedia = newMedia._mediaItem.data;
                        this._getTTMLFilepath().then(function _gotTTMLFile(filePath) {
                            this._loadTTMLFile(filePath).then(function _loadedTTMLFile() {
                                this._startRendering()
                            }.bind(this), function _cantLoadTTMLFile(error){}.bind(this))
                        }.bind(this), function _noTTMLFile(error){}.bind(this))
                    }
                    this._setupRenderingSurface()
                }, _onPositionChanged: function Renderer_onPositionChanged(playbackPosition) {
                    if (!this._closedCaptionsOn || !this._ttmlFileLoaded)
                        return;
                    this._checkAndProcessNextClosedCaptionsBlob(playbackPosition)
                }, _onTransportStateChanged: function Renderer_onTransportStateChanged(newTS) {
                    if (!this._closedCaptionsOn || !this._ttmlFileLoaded)
                        return;
                    switch (newTS) {
                        case MSEPlatform.Playback.TransportState.playing:
                            this._startRendering();
                            break;
                        case MSEPlatform.Playback.TransportState.paused:
                            this._stopRendering();
                            break;
                        case MSEPlatform.Playback.TransportState.stopped:
                            this._stopRendering();
                            break
                    }
                }, _onSeeked: function Renderer_onSeeked(newPosition) {
                    if (!this._closedCaptionsOn || !this._ttmlFileLoaded)
                        return;
                    this._ccPresenter.flush();
                    this._invalidateRenderingTimeWindow()
                }, _setupRenderingSurface: function _setupRenderingSurface() {
                    var surfaceHeight = 0;
                    var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                    if (this._iPlaybackControl.videoWidth && this._iPlaybackControl.videoHeight) {
                        surfaceHeight = Math.floor(this._iPlaybackControl.videoHeight * (this._ccContainer.clientWidth / this._iPlaybackControl.videoWidth));
                        if (surfaceHeight && this._ccContainer.parentElement && this._ccContainer.parentElement.clientHeight) {
                            surfaceHeight = Math.min(surfaceHeight, this._ccContainer.parentElement.clientHeight);
                            this._ccContainer.style.height = surfaceHeight + "px";
                            this._ccContainer.style.top = ((this._ccContainer.parentElement.clientHeight - surfaceHeight) >> 1) + "px";
                            this._ccContainer.style.fontSize = Math.floor(surfaceHeight * 0.05) + "px"
                        }
                    }
                    if (uiStateService.isSnapped || surfaceHeight < 240) {
                        this._stopRendering();
                        this._ccPresenter.flush()
                    }
                    else
                        this._startRendering()
                }, _invalidateRenderingTimeWindow: function Renderer_invalidateRenderingTimeWindow() {
                    this._currentGeneratedAt = 0;
                    this._currentValidUntil = 0
                }, _findClosedCaptionsUrl: function Renderer_findClosedCaptionsUrl(miid) {
                    var ccInfo = null;
                    if (miid && this._currentMedia && this._currentMedia.closedCaptionFiles) {
                        var ccFiles = this._currentMedia.closedCaptionFiles;
                        var mediaInstanceId = null;
                        var lcid = null;
                        miid = miid.replace(/{/g, '');
                        miid = miid.replace(/}/g, '');
                        for (i = 0; i < ccFiles.length; i++) {
                            mediaInstanceId = ccFiles[i].mediaInstanceId;
                            lcid = ccFiles[i].lcid;
                            if (mediaInstanceId) {
                                mediaInstanceId = mediaInstanceId.replace(/{/g, '');
                                mediaInstanceId = mediaInstanceId.replace(/}/g, '');
                                if (mediaInstanceId.toLowerCase() === miid && lcid === this.ccLcid.toString()) {
                                    ccInfo = {
                                        url: ccFiles[i].fileUri, name: ccFiles[i].name
                                    };
                                    break
                                }
                            }
                        }
                    }
                    return ccInfo
                }, _getTTMLFilepath: function Renderer_getTTMLFilepath() {
                    var smid = (this._currentMedia ? this._currentMedia.ServiceMediaId || this._currentMedia.serviceId : null);
                    var miid = (this._currentMediaInstance ? (this._currentMediaInstance.mediaInstanceId ? this._currentMediaInstance.mediaInstanceId.toLowerCase() : null) : null);
                    var url = String.empty;
                    var name = String.empty;
                    var ccInfo = this._findClosedCaptionsUrl(miid);
                    if (ccInfo) {
                        url = ccInfo.url;
                        name = ccInfo.name
                    }
                    MSEPlatform.Playback.Etw.traceCCRendererGetTTMLFilepath("begin", smid, miid, this.ccLcid, url);
                    if (smid && miid && url && name)
                        return new WinJS.Promise(function _getTTMLFilePromise(c, e, p) {
                                Microsoft.Entertainment.ClosedCaptionDownloader.getClosedCaptionFileAsync(url, smid, miid, name, this.ccLcid).then(function _getTTMLFile_success(path) {
                                    MSEPlatform.Playback.Etw.traceCCRendererGetTTMLFilepath("end", smid, miid, this.ccLcid, path);
                                    c(path)
                                }.bind(this), function _getTTMLFile_failed(error) {
                                    MSEPlatform.Playback.Etw.traceCCRendererGetTTMLFilepath("failed: " + error, smid, miid, this.ccLcid, url);
                                    e(error)
                                }.bind(this))
                            }.bind(this));
                    else {
                        MSEPlatform.Playback.Etw.traceCCRendererGetTTMLFilepath("failed: E_INVALIDARGS", smid, miid, this.ccLcid, url);
                        return WinJS.Promise.wrapError("E_INVALIDARGS")
                    }
                }, _loadTTMLFile: function Renderer_loadTTMLFile(filePath) {
                    if (!filePath)
                        return WinJS.Promise.wrapError("Renderer_loadTTMLFile: Error! Empty filePath.");
                    MSEPlatform.Playback.Etw.traceCCRendererLoadTTMLFile("begin", filePath);
                    return new WinJS.Promise(function _loadTTMLPromise(c, e, p) {
                            try {
                                Windows.Storage.StorageFile.getFileFromPathAsync(filePath).then(function _gotFile(storageFile) {
                                    this._ttmlProcessor.loadFromStorageFile(storageFile).then(function _loadTTMLFile_success() {
                                        MSEPlatform.Playback.Etw.traceCCRendererLoadTTMLFile("end", filePath);
                                        this._ttmlFilepath = filePath;
                                        this._ttmlFileLoaded = true;
                                        c()
                                    }.bind(this), function _loadTTMLFile_failed(errorFromLoad) {
                                        MSEPlatform.Playback.Etw.traceCCRendererLoadTTMLFile("failed: " + errorFromLoad, filePath);
                                        e(errorFromLoad)
                                    }.bind(this), function _loadTTMLFile_progress(progress) {
                                        MSEPlatform.Playback.Etw.traceCCRendererLoadTTMLFile("progress : " + progress, filePath)
                                    }.bind(this))
                                }.bind(this), function _noFileFromStorage(errorFromStorage) {
                                    MSEPlatform.Playback.Etw.traceCCRendererLoadTTMLFile("failed: " + errorFromStorage, filePath);
                                    e(errorFromStorage)
                                }.bind(this))
                            }
                            catch(ex) {
                                MSEPlatform.Playback.Etw.traceCCRendererLoadTTMLFile("failed: " + ex, filePath);
                                e(ex)
                            }
                        }.bind(this))
                }, _getHtmlBlob: function Renderer_getHtmlBlob(msecPosition) {
                    var ttmlOutput = null;
                    try {
                        ttmlOutput = this._ttmlProcessor.renderAt(msecPosition)
                    }
                    catch(ex) {}
                    return (ttmlOutput ? JSON.parse(ttmlOutput) : null)
                }, _applyUserSettings: function Renderer_applyUserSettings(htmlBlob) {
                    return htmlBlob
                }, _startRendering: function Renderer_startRendering() {
                    if (this._renderingPaused) {
                        MSEPlatform.Playback.Etw.traceCCEnterRenderingLoop(this._iPlaybackControl.currentPosition, this._iPlaybackControl.currentTransportState);
                        this._renderingPaused = false;
                        this._ccPresenter.start();
                        this._checkAndProcessNextClosedCaptionsBlob(this._iPlaybackControl.currentPosition)
                    }
                }, _stopRendering: function Renderer_stopRendering() {
                    MSEPlatform.Playback.Etw.traceCCExitRenderingLoop(this._iPlaybackControl.currentPosition, this._iPlaybackControl.currentTransportState, this._closedCaptionsOn);
                    this._renderingPaused = true;
                    this._ccPresenter.stop()
                }, _checkAndProcessNextClosedCaptionsBlob: function Renderer_checkAndProcessNextClosedCaptionsBlob(currentPlaybackPosition) {
                    if (this._ttmlFileLoaded && !this._renderingPaused)
                        if (currentPlaybackPosition + this._processorLeadTime >= this._currentValidUntil) {
                            var requestTime = (this._currentValidUntil === 0 ? currentPlaybackPosition : currentPlaybackPosition + this._processorLeadTime);
                            var blob = this._getHtmlBlob(requestTime);
                            if (blob) {
                                this._currentGeneratedAt = blob.generatedAt;
                                this._currentValidUntil = blob.validUntil;
                                var finalHtml = this._applyUserSettings(blob.html);
                                this._ccPresenter.presentAt(this._currentGeneratedAt, this._currentValidUntil, finalHtml)
                            }
                        }
                }
        }, {
            _closedCaptionsStyleSheetId: "CCStyleSheet", _fontUsedForSmallCaps: "trebuchet ms", _regionBodyCssName: ".cc_regionBody", _textCssName: ".cc_text", _regionBodyCssNamePreview: ".cc_regionBodyPreview", _textCssNamePreview: ".cc_textPreview", loadAndUpdateClosedCaptionStyleSettings: function loadAndUpdateClosedCaptionStyleSettings() {
                    var ccSettings = this.loadClosedCaptionStyleSettings();
                    if (ccSettings)
                        this.updateClosedCaptionStyleSettings(ccSettings)
                }, loadClosedCaptionStyleSettings: function loadAndUpdateClosedCaptionStyleSettings() {
                    var settingsStorage = Windows.Storage.ApplicationData.current.roamingSettings;
                    if (settingsStorage)
                        return {
                                regionBackgroundColor: settingsStorage.values["CC_REGION_background-color"], regionOpacity: settingsStorage.values["CC_REGION_opacity"], textFontFamily: settingsStorage.values["CC_TEXT_font-family"], textFontSize: settingsStorage.values["CC_TEXT_font-size"], textEdgeAttribute: settingsStorage.values["CC_TEXT_edge-attribute"], textColor: settingsStorage.values["CC_TEXT_color"], textOpacity: settingsStorage.values["CC_TEXT_opacity"], textBackgroundColor: settingsStorage.values["CC_TEXT_background-color"], textBackgroundOpacity: settingsStorage.values["CC_TEXT_background-opacity"]
                            };
                    else
                        return null
                }, saveClosedCaptionStyleSettings: function saveClosedCaptionStyleSettings(ccSettings) {
                    if (!ccSettings)
                        return;
                    var settingsStorage = Windows.Storage.ApplicationData.current.roamingSettings;
                    if (ccSettings.hasOwnProperty("regionBackgroundColor"))
                        settingsStorage.values["CC_REGION_background-color"] = ccSettings["regionBackgroundColor"];
                    if (ccSettings.hasOwnProperty("regionOpacity"))
                        settingsStorage.values["CC_REGION_opacity"] = ccSettings["regionOpacity"];
                    if (ccSettings.hasOwnProperty("textFontFamily"))
                        settingsStorage.values["CC_TEXT_font-family"] = ccSettings["textFontFamily"];
                    if (ccSettings.hasOwnProperty("textFontSize"))
                        settingsStorage.values["CC_TEXT_font-size"] = ccSettings["textFontSize"];
                    if (ccSettings.hasOwnProperty("textEdgeAttribute"))
                        settingsStorage.values["CC_TEXT_edge-attribute"] = ccSettings["textEdgeAttribute"];
                    if (ccSettings.hasOwnProperty("textColor"))
                        settingsStorage.values["CC_TEXT_color"] = ccSettings["textColor"];
                    if (ccSettings.hasOwnProperty("textOpacity"))
                        settingsStorage.values["CC_TEXT_opacity"] = ccSettings["textOpacity"];
                    if (ccSettings.hasOwnProperty("textBackgroundColor"))
                        settingsStorage.values["CC_TEXT_background-color"] = ccSettings["textBackgroundColor"];
                    if (ccSettings.hasOwnProperty("textBackgroundOpacity"))
                        settingsStorage.values["CC_TEXT_background-opacity"] = ccSettings["textBackgroundOpacity"]
                }, updateClosedCaptionStyleSettings: function updateClosedCaptionStyleSettings(ccSettings, isPreviewOnly) {
                    if (!ccSettings)
                        return;
                    var ccStyleElement = this._getCCStyleElement();
                    var regionBodyCss = this._getCSSRule(ccStyleElement, isPreviewOnly ? this._regionBodyCssNamePreview : this._regionBodyCssName);
                    var textCss = this._getCSSRule(ccStyleElement, isPreviewOnly ? this._textCssNamePreview : this._textCssName);
                    var regionCssOverrides = String.empty;
                    var regionOpacity = 1.0;
                    if (ccSettings.hasOwnProperty("regionOpacity") && ccSettings["regionOpacity"])
                        regionOpacity = ccSettings["regionOpacity"];
                    if (ccSettings.hasOwnProperty("regionBackgroundColor") && ccSettings["regionBackgroundColor"])
                        regionCssOverrides = "background-color: rgba(" + ccSettings["regionBackgroundColor"] + "," + regionOpacity + ") !important;";
                    if (ccSettings.hasOwnProperty("textFontSize") && ccSettings["textFontSize"])
                        regionCssOverrides += ("font-size: " + ccSettings["textFontSize"] + " !important;");
                    if (regionCssOverrides)
                        regionBodyCss.style.cssText = regionCssOverrides;
                    else
                        regionBodyCss.style.cssText = "";
                    var textCssOverrides = String.empty;
                    if (ccSettings.hasOwnProperty("textFontFamily") && ccSettings["textFontFamily"]) {
                        textCssOverrides += ("font-family: " + ccSettings["textFontFamily"] + " !important;");
                        if (ccSettings["textFontFamily"] === this._fontUsedForSmallCaps)
                            textCssOverrides += ("font-variant: small-caps !important;")
                    }
                    var textOpacity = 1.0;
                    if (ccSettings.hasOwnProperty("textOpacity") && ccSettings["textOpacity"])
                        textOpacity = ccSettings["textOpacity"];
                    if (ccSettings.hasOwnProperty("textColor") && ccSettings["textColor"])
                        textCssOverrides += ("color: rgba(" + ccSettings["textColor"] + "," + textOpacity + ") !important;");
                    var textBackgroundOpacity = 1.0;
                    if (ccSettings.hasOwnProperty("textBackgroundOpacity") && ccSettings["textBackgroundOpacity"])
                        textBackgroundOpacity = ccSettings["textBackgroundOpacity"];
                    if (ccSettings.hasOwnProperty("textBackgroundColor") && ccSettings["textBackgroundColor"])
                        textCssOverrides += ("background-color: rgba(" + ccSettings["textBackgroundColor"] + "," + textBackgroundOpacity + ") !important;");
                    if (textCssOverrides)
                        textCss.style.cssText = textCssOverrides;
                    else
                        textCss.style.cssText = ""
                }, _getCCStyleElement: function Renderer_getCCStyleElement() {
                    var ccStyleElement = document.getElementById(this._closedCaptionsStyleSheetId);
                    if (!ccStyleElement) {
                        ccStyleElement = document.createElement("STYLE");
                        document.documentElement.firstChild.appendChild(ccStyleElement);
                        ccStyleElement.id = this._closedCaptionsStyleSheetId
                    }
                    return ccStyleElement
                }, _getCSSRule: function Renderer_getCSSRule(ccStyleElement, cssRuleName) {
                    var cssRule;
                    var tempCssRule;
                    if (ccStyleElement && ccStyleElement.styleSheet && ccStyleElement.styleSheet.rules) {
                        for (i = 0; i < ccStyleElement.styleSheet.rules.length; i++) {
                            tempCssRule = ccStyleElement.styleSheet.rules.item(i);
                            if (tempCssRule && tempCssRule.selectorText === cssRuleName) {
                                cssRule = ccStyleElement.styleSheet.rules.item(i);
                                break
                            }
                        }
                        if (!cssRule) {
                            ccStyleElement.styleSheet.insertRule(cssRuleName + "{}", 0);
                            cssRule = ccStyleElement.styleSheet.rules.item(0)
                        }
                        return cssRule
                    }
                }
        })})
})()
