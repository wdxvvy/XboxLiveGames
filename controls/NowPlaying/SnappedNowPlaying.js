/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Components/Playback/Controls/PlaybackControl.js", "/Framework/corefx.js", "/Framework/utilities.js", "/Framework/servicelocator.js");
    var UnsnapButtonAction = MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function unsnapAction() {
            this.base()
        }, {
            automationId: MS.Entertainment.UI.AutomationIds.unsnapButtonAction, executed: function executed(parameter) {
                    parameter.appIconClick()
                }, canExecute: function canExecute(parameter) {
                    return true
                }
        });
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {SnappedNowPlaying: MS.Entertainment.UI.Framework.defineUserControl("Controls/NowPlaying/SnappedNowPlaying.html#template", function snappedNowPlayingConstructor(element, options) {
            this._bindingsToDetach = [];
            this._unsnapAction = new UnsnapButtonAction;
            this._unsnapAction.parameter = this
        }, {
            _initialized: false, _bindingsToDetach: null, _unsnapAction: null, _deferredUpdateTimer: null, initialize: function initialize() {
                    var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    this.bind("playbackSession", this._playbackSessionChanged.bind(this));
                    this.options = {};
                    this._loadAppIcon();
                    this.appTitleLabel.displayText = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).applicationTitle;
                    this._setUnsnapButtonText();
                    this._snappedDetails.bind("detailsReady", function metadataImageChanged() {
                        WinJS.Promise.timeout().then(function _delay() {
                            this.visible = true;
                            this.appIconVisible = !this.enabled;
                            if (this.appIconVisible) {
                                MS.Entertainment.UI.Framework.focusFirstInSubTree(this.unsnapButton.domElement, true);
                                MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar).hide()
                            }
                            else
                                MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar).show()
                        }.bind(this));
                        this._updateStates()
                    }.bind(this));
                    this.playbackSession = sessionMgr.primarySession;
                    this._nowPlayingMetadata.bind("nowPlayingImageUri", function metadataImageChanged() {
                        this.nowPlayingImageUri = this._nowPlayingMetadata.nowPlayingImageUri
                    }.bind(this));
                    this._nowPlayingMetadata.bind("backgroundImageUri", function metadataBackgroundChanged() {
                        this.backgroundImageUri = this._nowPlayingMetadata.backgroundImageUri
                    }.bind(this));
                    this.repossessNowPlaying();
                    this._initialized = true
                }, _setUnsnapButtonText: function _setUnsnapButtonText() {
                    this.unsnapButton.text = String.load(String.id.IDS_SNAPPED_GAMES_UNSNAP_TEXT)
                }, _loadAppIcon: function _loadAppIcon() {
                    this.currentAppIconClass = "snappedAppIcon snappedGamesAppIcon"
                }, _detachBindings: function _detachBindings() {
                    this._bindingsToDetach.forEach(function(e) {
                        e.source.unbind(e.name, e.action)
                    });
                    this._bindingsToDetach = []
                }, _initializeBinding: function _initializeBinding(source, name, action) {
                    source.bind(name, action);
                    this._bindingsToDetach.push({
                        source: source, name: name, action: action
                    })
                }, unload: function unload() {
                    if (this._deferredUpdateTimer) {
                        this._deferredUpdateTimer.cancel();
                        this._deferredUpdateTimer = null
                    }
                    this._detachBindings();
                    MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar).hide();
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, _playbackSessionChanged: function _playbackSessionChanged() {
                    this._detachBindings();
                    this._snappedDetails.playbackSession = this.playbackSession;
                    if (this.playbackSession) {
                        var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                        this._initializeBinding(uiStateService, "isSnapped", function isSnappedChanged() {
                            if (!MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isSnapped) {
                                this.visible = false;
                                if (this._nowPlayingThumbnail.children.length > 0)
                                    MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar).repossessNowPlaying()
                            }
                        }.bind(this));
                        this._initializeBinding(this.playbackSession, "currentMedia", this._mediaChanged.bind(this));
                        this._initializeBinding(this.playbackSession, "currentTransportState", this._mediaStateChanged.bind(this))
                    }
                }, repossessNowPlaying: function repossessNowPlaying() {
                    var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    sessionMgr.relocateSession(this._nowPlayingThumbnail, false)
                }, _mediaChanged: function _mediaChanged() {
                    this._snappedDetails.updateModelItem(this.playbackSession.currentMedia);
                    this._nowPlayingMetadata.modelItem = this.playbackSession.currentMedia;
                    if (this.visible && this.playbackSession.currentMedia) {
                        this.appIconVisible = false;
                        MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar).show();
                        this.repossessNowPlaying()
                    }
                    else
                        this.unsnapButtonVisible = true
                }, _mediaStateChanged: function _mediaStateChanged() {
                    this._updateStates()
                }, _updateStates: function _updateStates() {
                    if (this._deferredUpdateTimer)
                        return;
                    this._deferredUpdateTimer = WinJS.Promise.timeout(MS.Entertainment.Platform.PlaybackHelpers.deferredUpdateTimeout).then(this._updateStatesDeferred.bind(this))
                }, _updateStatesDeferred: function _updateStatesDeferred() {
                    this._deferredUpdateTimer = null;
                    var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    this.enabled = this.playbackSession && this.playbackSession.currentMedia;
                    this.videoVisible = false;
                    this.artVisible = false;
                    this.toggleButtonVisible = this.playbackSession !== sessionMgr.lrcSession;
                    if (this.playbackSession && this.playbackSession.currentMedia)
                        switch (this.playbackSession.currentMedia.mediaType) {
                            case Microsoft.Entertainment.Queries.ObjectType.game:
                                if (this.playbackSession.canControlMedia) {
                                    this.videoHeight = (this.playbackSession.videoHeight * (320 / this.playbackSession.videoWidth)) + "px";
                                    this.videoVisible = this.playbackSession !== sessionMgr.lrcSession;
                                    this.artVisible = false
                                }
                                break;
                            default:
                                break
                        }
                }
        }, {
            visible: false, enabled: false, playbackSession: null, options: null, appIconVisible: true, unsnapButtonVisible: false, toggleButtonVisible: false, detailsVisible: true, artVisible: false, videoVisible: false, videoHeight: "240px", backgroundVisible: false, nowPlayingImageUri: "", backgroundImageUri: "", currentAppIconClass: "", appIconClick: function appIconClick() {
                    var appView = Windows.UI.ViewManagement.ApplicationView;
                    if (appView && !appView.tryUnsnap());
                }
        })})
})()
