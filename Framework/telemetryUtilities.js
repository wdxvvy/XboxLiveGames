/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/debug.js", "/Framework/stringids.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Utilities");
WinJS.Namespace.define("MS.Entertainment.Utilities.Telemetry", {
    _adsClicked: [], _previewsPlayed: [], _enableLogging: false, _totalTimeCounterStart: 0, _somethingPlaying: false, openDataPoint: function openDataPoint() {
            var platLog = Microsoft.Entertainment.Platform.Logging;
            var dataPoint = new platLog.DataPoint(platLog.LoggingLevel.telemetry);
            return dataPoint
        }, closeDataPoint: function closeDataPoint(dataPoint) {
            dataPoint.write()
        }, appendUIPath: function appendUIPath(dataPoint) {
            var currentLocation = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).getUserLocation();
            dataPoint.appendParameter("UIPath", currentLocation)
        }, appendLastUIPath: function appendLastUIPath(dataPoint) {
            var service = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
            if (service.canNavigateBack) {
                var backStack = service._backStack;
                var lastPage = backStack._stack[backStack._stack.length - 1];
                var lastLocation = "None";
                if (lastPage)
                    lastLocation = lastPage.page.iaNode.moniker;
                dataPoint.appendParameter("LastUIPath", lastLocation)
            }
        }, isCurrentPageSearchPage: function isCurrentPageSearchPage() {
            var currentPage = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).currentPage;
            if (currentPage && currentPage.overrideFragmentUrl)
                if (MS.Entertainment.Utilities.isGamesApp)
                    return currentPage.iaNode && currentPage.iaNode.moniker === MS.Entertainment.UI.Monikers.searchPage;
                else
                    return currentPage.overrideFragmentUrl.match(/SearchNavStub.html$/i);
            return false
        }, licenseRightFromMedia: function licenseRightFromMedia(media, offerId) {
            var licenseRight = false;
            var i;
            if ((media.mediaType === Microsoft.Entertainment.Queries.ObjectType.video || media.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeason) && offerId)
                if (media.rights)
                    for (i = 0; i < media.rights.length; i++)
                        if (media.rights[i].offerId) {
                            var offerMatch = new RegExp(offerId + "$", "i");
                            if (media.rights[i].offerId.match(offerMatch)) {
                                licenseRight = media.rights[i].licenseRight;
                                break
                            }
                        }
            return licenseRight
        }, priceFromMedia: function priceFromMedia(media, offerId) {
            var price = String.empty;
            var i,
                j;
            if (media.mediaType === Microsoft.Entertainment.Queries.ObjectType.video && offerId)
                if (media.rights)
                    for (i = 0; i < media.rights.length; i++) {
                        var offerMatch = new RegExp(offerId + "$", "i");
                        if (media.rights[i].offerId && media.rights[i].offerId.match(offerMatch) && media.rights[i].price || media.rights[i].price === 0) {
                            price = media.rights[i].price + " " + media.rights[i].priceCurrencyCode;
                            break
                        }
                    }
            if (media.mediaType === Microsoft.Entertainment.Queries.ObjectType.game) {
                var gold = MS.Entertainment.Data.Factory.Marketplace.xboxSubscriptionLevel.gold.toLowerCase();
                if (media.offers)
                    for (i = 0; i < media.offers.length && !price; i++) {
                        var offer = media.offers[i];
                        if (offer.SubscriptionLevels)
                            for (j = 0; j < offer.SubscriptionLevels.length; j++)
                                if (offer.SubscriptionLevels[j].toLowerCase() === gold && offer.PaymentType === 1) {
                                    price = offer.Price;
                                    break
                                }
                    }
            }
            if (media.mediaType === Microsoft.Entertainment.Queries.ObjectType.album || media.mediaType === Microsoft.Entertainment.Queries.ObjectType.track)
                if (media.rights && offerId)
                    for (i = 0; i < media.rights.length; i++) {
                        var offerMatch = new RegExp(offerId + "$", "i");
                        if (media.rights[i].offerId && media.rights[i].offerId.match(offerMatch) && media.rights[i].price || media.rights[i].price === 0) {
                            price = media.rights[i].price + " " + media.rights[i].priceCurrencyCode;
                            break
                        }
                    }
            if (media.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeason)
                if (media.rights)
                    if (media.rights[0])
                        for (i = 0; i < media.rights.length; i++) {
                            var offerMatch = new RegExp(offerId + "$", "i");
                            if (media.rights[i].offerId && media.rights[i].offerId.match(offerMatch) && media.rights[i].price || media.rights[i].price === 0) {
                                price = media.rights[i].price + " " + media.rights[i].priceCurrencyCode;
                                break
                            }
                        }
                    else if (media.rights.right)
                        for (i = 0; i < media.rights.right.length; i++) {
                            var offerMatch = new RegExp(offerId + "$", "i");
                            if (media.rights.right[i].offerId && media.rights.right[i].offerId.match(offerMatch) && media.rights.right[i].price || media.rights.right[i].price === 0) {
                                price = media.rights.right[i].price + " " + media.rights.right[i].priceCurrencyCode;
                                break
                            }
                        }
            return price
        }, mediaTypeNameForTelemetry: function mediaTypeNameForTelemetry(media) {
            var name;
            var mediaType = media && media.mediaType;
            var defaultPlatformType = (media && media.defaultPlatformType) || String.empty;
            var downloadType = media && media.downloadType;
            switch (mediaType) {
                case Microsoft.Entertainment.Queries.ObjectType.game:
                    if (defaultPlatformType)
                        name = defaultPlatformType + " Game";
                    else
                        name = downloadType || "Game";
                    break;
                default:
                    name = "unknown";
                    break
            }
            return name
        }, hcrMedia: null, logTelemetryEvent: function logTelemetryEvent(event) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName(event);
            for (var i = 1; i < arguments.length - 1; i += 2) {
                var key = arguments[i];
                var value = arguments[i + 1];
                if (key && value !== undefined)
                    dataPoint.appendParameter(key, value)
            }
            this.closeDataPoint(dataPoint)
        }, logSearchEnter: function logSearchEnter(hcrMedia) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("SearchEnter");
            this.appendUIPath(dataPoint);
            this.appendLastUIPath(dataPoint);
            dataPoint.appendParameter("EDSSearch", true);
            var typeName = "";
            var mediaName = "";
            if (hcrMedia) {
                mediaName = hcrMedia.name;
                typeName = this.mediaTypeNameForTelemetry(hcrMedia)
            }
            MS.Entertainment.Utilities.Telemetry.hcrMedia = hcrMedia;
            dataPoint.appendParameter("SearchHCRMediaName", mediaName);
            dataPoint.appendParameter("SearchHCRMediaType", typeName);
            this.closeDataPoint(dataPoint)
        }, logSearchExit: function logSearchExit(media, hcr, destination, url) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("SearchExit");
            this.appendUIPath(dataPoint);
            if (media) {
                dataPoint.appendParameter("MediaName", media.name);
                dataPoint.appendParameter("MediaType", this.mediaTypeNameForTelemetry(media))
            }
            var isHCR = !!(media && media.isEqual && media.isEqual(MS.Entertainment.Utilities.Telemetry.hcrMedia));
            dataPoint.appendParameter("HCR", isHCR);
            dataPoint.appendParameter("SearchDestination", destination);
            if (url)
                dataPoint.appendParameter("ExternalLink", url);
            this.closeDataPoint(dataPoint)
        }, logSearchWordWheelEnter: function logSearchWordWheel(title, mediaType, videoType) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("SearchWordWheelEnter");
            this.appendUIPath(dataPoint);
            this.appendLastUIPath(dataPoint);
            dataPoint.appendParameter("SelectedItemTitle", title);
            var typeName = MS.Entertainment.Utilities.getMediaTypeName(mediaType, videoType);
            dataPoint.appendParameter("SelectedItemMediaType", typeName);
            this.closeDataPoint(dataPoint)
        }, logPlayPreview: function logPlayPreview(media, fromAd) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("PreviewPlayed");
            this.appendUIPath(dataPoint);
            var typeName = this.mediaTypeNameForTelemetry(media);
            dataPoint.appendParameter("MediaName", media.name);
            dataPoint.appendParameter("MediaType", typeName);
            dataPoint.appendParameter("FromAd", fromAd);
            if (fromAd)
                this._adsClicked.push(media.serviceId);
            this._previewsPlayed.push(media.serviceId);
            this.closeDataPoint(dataPoint)
        }, logPreviewFallback: function logPreviewFallback(media, errorCode, context) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("PreviewFallback");
            this.appendUIPath(dataPoint);
            if (media) {
                var typeName = this.mediaTypeNameForTelemetry(media);
                dataPoint.appendParameter("MediaName", media.name);
                dataPoint.appendParameter("MediaType", typeName)
            }
            dataPoint.appendParameter("ErrorCode", errorCode);
            dataPoint.appendParameter("Context", context);
            this.closeDataPoint(dataPoint)
        }, logPurchaseMade: function logPurchaseMade(media, offerId) {
            this.logPurchaseHappened(media, offerId);
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("PurchaseMade");
            this.appendUIPath(dataPoint);
            var typeName = this.mediaTypeNameForTelemetry(media);
            dataPoint.appendParameter("MediaType", typeName);
            if (media.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeason) {
                dataPoint.appendParameter("MediaName", media.seriesTitle + " " + media.name);
                dataPoint.appendParameter("SMID", media.seasonServiceId)
            }
            else {
                dataPoint.appendParameter("MediaName", media.name);
                dataPoint.appendParameter("SMID", media.serviceId)
            }
            var price = this.priceFromMedia(media, offerId);
            if (price)
                dataPoint.appendParameter("Price", price);
            if (media.mediaType === Microsoft.Entertainment.Queries.ObjectType.video || media.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeason) {
                var licenseRight = this.licenseRightFromMedia(media, offerId);
                dataPoint.appendParameter("licenseRight", licenseRight)
            }
            var fromAd = false;
            var fromPreview = false;
            var i;
            for (i = 0; i < this._adsClicked.length; i++)
                if (this._adsClicked[i] === media.serviceId) {
                    fromAd = true;
                    break
                }
            dataPoint.appendParameter("FromAd", fromAd);
            for (i = 0; i < this._previewsPlayed.length; i++)
                if (this._previewsPlayed[i] === media.serviceId) {
                    fromPreview = true;
                    break
                }
            dataPoint.appendParameter("FromPreview", fromPreview);
            this.closeDataPoint(dataPoint)
        }, logCreateAvatar: function logCreateAvatar() {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("CreateAvatar");
            this.appendUIPath(dataPoint);
            this.closeDataPoint(dataPoint)
        }, logEditProfile: function logEditProfile(error) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("EditProfile");
            if (error)
                dataPoint.appendParameter("ErrorOccurred", typeof error !== "string" ? MS.Entertainment.Utilities.convertToHexString(error) : error);
            this.appendUIPath(dataPoint);
            this.closeDataPoint(dataPoint)
        }, logEditAvatar: function logEditAvatar(error) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("EditAvatar");
            if (error)
                dataPoint.appendParameter("ErrorOccurred", typeof error !== "string" ? MS.Entertainment.Utilities.convertToHexString(error) : error);
            this.appendUIPath(dataPoint);
            this.closeDataPoint(dataPoint)
        }, logChangeGamertag: function logChangeGamertag() {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("ChangeGamertag");
            this.appendUIPath(dataPoint);
            this.closeDataPoint(dataPoint)
        }, logSetBeacon: function logSetBeacon(titleId, error) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("SetBeacon");
            dataPoint.appendParameter("titleId", titleId);
            if (error)
                dataPoint.appendParameter("ErrorOccurred", typeof error !== "string" ? MS.Entertainment.Utilities.convertToHexString(error) : error);
            this.appendUIPath(dataPoint);
            this.closeDataPoint(dataPoint)
        }, logSendMessage: function logSendMessage(error) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("SendMessage");
            if (error)
                dataPoint.appendParameter("ErrorOccurred", typeof error !== "string" ? MS.Entertainment.Utilities.convertToHexString(error) : error);
            this.appendUIPath(dataPoint);
            this.closeDataPoint(dataPoint)
        }, logViewGameNotifications: function logViewGameNotifications(notificationText) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("ViewGameNotifications");
            dataPoint.appendParameter("NotificationText", notificationText);
            this.closeDataPoint(dataPoint)
        }, logPlayGameClicked: function logPlayGameClicked(mediaItem, gameActivity, isSignedIn) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("PlayGame");
            dataPoint.appendParameter("mediaType", mediaItem.mediaType);
            dataPoint.appendParameter("serviceId", mediaItem.serviceId);
            dataPoint.appendParameter("titleType", mediaItem.titleType);
            dataPoint.appendParameter("titleId", mediaItem.titleId);
            if (mediaItem.name)
                dataPoint.appendParameter("mediaName", mediaItem.name);
            if (mediaItem.queryId)
                dataPoint.appendParameter("queryId", mediaItem.queryId);
            dataPoint.appendParameter("gamePlayed", !!gameActivity);
            dataPoint.appendParameter("isSignedIn", isSignedIn);
            this.closeDataPoint(dataPoint)
        }, logFirstRunState: function logFirstRunState(noAvatar, emptyProfile) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("FirstRunState");
            dataPoint.appendParameter("noAvatar", noAvatar);
            dataPoint.appendParameter("emptyProfile", emptyProfile);
            this.closeDataPoint(dataPoint)
        }, logEngagementState: function logEngagementState(signedIn, engagedTitle, celebrations, tiles) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("EngagementState");
            dataPoint.appendParameter("SignedIn", !!signedIn);
            if (signedIn) {
                dataPoint.appendParameter("Engaged", !!engagedTitle);
                if (engagedTitle) {
                    dataPoint.appendParameter("name", engagedTitle.name);
                    dataPoint.appendParameter("titleId", engagedTitle.titleId);
                    if (celebrations)
                        for (var i = 0; i < celebrations.length; i++)
                            if (celebrations[i] && celebrations[i].id)
                                dataPoint.appendParameter("celebration", celebrations[i].id);
                    if (tiles) {
                        var pdlcCount = 0,
                            programCount = 0;
                        for (var j = 0; j < tiles.length; j++) {
                            var tile = tiles.item(j);
                            if (tile)
                                if (tile.actionTarget) {
                                    programCount++;
                                    dataPoint.appendParameter("programmedTile", tile.actionTarget)
                                }
                                else {
                                    pdlcCount++;
                                    dataPoint.appendParameter("pdlcTile", tile.serviceId)
                                }
                        }
                        dataPoint.appendParameter("PDLC-count", pdlcCount);
                        dataPoint.appendParameter("programmed-count", programCount)
                    }
                }
            }
            this.closeDataPoint(dataPoint)
        }, logTitleActivityState: function logTitleActivityState(counts) {
            var count;
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("TitleActivityState");
            for (count in counts)
                if (counts.hasOwnProperty(count) && typeof counts[count] !== "function")
                    dataPoint.appendParameter(count, counts[count]);
            this.closeDataPoint(dataPoint)
        }, logFriendState: function logFriendState(friendType, friendCount) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("FriendState");
            dataPoint.appendParameter("FriendType", friendType);
            dataPoint.appendParameter("FriendCount", friendCount);
            this.closeDataPoint(dataPoint)
        }, logMessagesState: function logMessagesState(messageType, messageCount) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("MessagesState");
            dataPoint.appendParameter("MessageType", messageType);
            dataPoint.appendParameter("MessageType", messageCount);
            this.closeDataPoint(dataPoint)
        }, logShare: function logShare(sharePackage) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("ShareCharm");
            if (sharePackage && sharePackage.package) {
                dataPoint.appendParameter("ShareTitle", sharePackage.package.title);
                dataPoint.appendParameter("ShareUri", sharePackage.package.uri);
                dataPoint.appendParameter("MediaId", sharePackage.package.mediaId);
                dataPoint.appendParameter("MediaType", this.mediaTypeNameForTelemetry(sharePackage.package));
                dataPoint.appendParameter("MediaName", sharePackage.package.mediaTitle)
            }
            this.appendUIPath(dataPoint);
            this.closeDataPoint(dataPoint)
        }, logAdClicked: function logAdClicked(adInfo) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("X8AdClicked");
            dataPoint.appendParameter("AdInfo", adInfo);
            this.appendUIPath(dataPoint);
            this.closeDataPoint(dataPoint)
        }, logAudioAdServiceEvent: function logAudioAdServiceEvent(event, mediaInstance, isNextMediaInstance) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName(event);
            this.appendUIPath(dataPoint);
            MS.Entertainment.UI.Music.assert(!!mediaInstance, "mediaInstance not defined, cannot log audio ad service telemetry");
            if (!mediaInstance)
                return;
            dataPoint.appendParameter("IsStream", mediaInstance.isLocal ? "false" : "true");
            dataPoint.appendParameter("InCollection", mediaInstance.inCollection ? "true" : "false");
            dataPoint.appendParameter("FromCollection", mediaInstance.fromCollection ? "true" : "false");
            dataPoint.appendParameter("IsPreview", mediaInstance.isPreview ? "true" : "false");
            dataPoint.appendParameter("ProtectionState", mediaInstance.protectionState);
            dataPoint.appendParameter("Extension", this._getFileExtensionFromMediaInstance(mediaInstance));
            dataPoint.appendParameter("ContentType", this.mediaUsageContentTypeName(mediaInstance));
            dataPoint.appendParameter("LicenseRight", mediaInstance.nativeLicenseRight);
            dataPoint.appendParameter("ServiceId", mediaInstance.serviceId);
            dataPoint.appendParameter("Duration", mediaInstance.duration);
            var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
            dataPoint.appendParameter("TotalAudioAdImpressions", configurationManager.music.totalAudioAdImpressions);
            dataPoint.appendParameter("TotalVideoAdImpressions", configurationManager.music.totalVideoAdImpressions);
            if (isNextMediaInstance)
                dataPoint.appendParameter("IsNextMediaInstance", isNextMediaInstance);
            this.closeDataPoint(dataPoint)
        }, logVideoAdServiceEvent: function logVideoAdServiceEvent(event, mediaProperties) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName(event);
            MS.Entertainment.UI.Music.assert(!!mediaProperties, "mediaItem not defined, cannot log video ad service telemetry");
            if (!mediaProperties)
                return;
            dataPoint.appendParameter("ContentType", this.mediaUsageContentTypeName(mediaProperties));
            dataPoint.appendParameter("InCollection", mediaProperties.inCollection ? "true" : "false");
            dataPoint.appendParameter("HasLocalContent", mediaProperties.hasLocalContent ? "true" : "false");
            dataPoint.appendParameter("IsLibraryQuery", mediaProperties.isLibraryQuery);
            dataPoint.appendParameter("PlayabilityLocalCounts", mediaProperties.localOnly);
            dataPoint.appendParameter("PlayabilityCloudCounts", mediaProperties.cloudOnly);
            dataPoint.appendParameter("HasPurchasedCount", mediaProperties.hasPurchasedCount);
            dataPoint.appendParameter("TrackCount", mediaProperties.trackCount);
            var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
            dataPoint.appendParameter("TotalAudioAdImpressions", configurationManager.music.totalAudioAdImpressions);
            dataPoint.appendParameter("TotalVideoAdImpressions", configurationManager.music.totalVideoAdImpressions);
            this.closeDataPoint(dataPoint)
        }, _logPlaybackControl: function _logPlaybackControl(controlUsed, whereUsed) {
            var dataPoint = this.openDataPoint();
            this.appendUIPath(dataPoint);
            dataPoint.appendEventName("PlaybackControl");
            dataPoint.appendParameter("ControlUsed", controlUsed);
            var whereUsedMapped = "Unknown";
            if (whereUsed.indexOf("nowPlayingTransportControls") !== -1)
                whereUsedMapped = "NowPlaying";
            else if (whereUsed.indexOf("globalTransportControls") !== -1)
                whereUsedMapped = "GlobalAppbar";
            else if (whereUsed.indexOf("appBarTransportControls") !== -1)
                whereUsedMapped = "AppBar";
            else if (whereUsed.indexOf("homeHubNowPlayingTile") !== -1)
                whereUsedMapped = "HomeNPTile";
            else if (whereUsed.indexOf("snappedTransportControls") !== -1)
                whereUsedMapped = "SnappedAppBar";
            else if (whereUsed.indexOf("mediaKey") !== -1)
                whereUsedMapped = "MediaKey";
            else
                MS.Entertainment.Utilities.assert(false, "unrecognised location for playback control telemetry");
            dataPoint.appendParameter("WhereUsed", whereUsedMapped);
            this.closeDataPoint(dataPoint)
        }, logPlayClicked: function logPlayClicked(whereUsed) {
            this._logPlaybackControl("Play", whereUsed)
        }, logPauseClicked: function logPauseClicked(whereUsed) {
            this._logPlaybackControl("Pause", whereUsed)
        }, logStopClicked: function logStopClicked(whereUsed) {
            this._logPlaybackControl("Stop", whereUsed)
        }, logPreviousClicked: function logPreviousClicked(whereUsed) {
            this._logPlaybackControl("Previous", whereUsed)
        }, logNextClicked: function logNextClicked(whereUsed) {
            this._logPlaybackControl("Next", whereUsed)
        }, logCompanionUsed: function logCompanionUsed(titleId, mediaType) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("CompanionUsed");
            dataPoint.appendParameter("TitleId", titleId);
            dataPoint.appendParameter("MediaType", mediaType);
            this.closeDataPoint(dataPoint)
        }, logCompanionConnectedToSession: function logCompanionConnectedToSession() {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("CompanionConnectedToSession");
            this.closeDataPoint(dataPoint)
        }, logCompanionTransportControlsStateChange: function logTransportControlsStateChange(newState, oldState) {
            if (newState || oldState) {
                var dataPoint = this.openDataPoint();
                dataPoint.appendEventName("CompanionTransportControlsStateChange");
                dataPoint.appendParameter("NewState", newState);
                dataPoint.appendParameter("OldState", oldState);
                this.closeDataPoint(dataPoint)
            }
        }, logCompanionTouchPadShow: function logTouchPadShown() {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("CompanionTouchPadShown");
            this.closeDataPoint(dataPoint)
        }, logCompanionTouchPadHide: function logTouchPadHide() {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("CompanionTouchPadHide");
            this.closeDataPoint(dataPoint)
        }, logCompanionSessionStats: function logCompanionSessionStats(stats, context, context2) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("CompanionSessionStats");
            dataPoint.appendParameter("Context", context);
            dataPoint.appendParameter("Context2", (context2 !== undefined ? context2 : ""));
            dataPoint.appendParameter("Duration", stats.duration);
            dataPoint.appendParameter("SuspendResumeCount", stats.appSuspendResumeCount);
            dataPoint.appendParameter("Local", stats.localTransportActive);
            dataPoint.appendParameter("Cloud", stats.cloudTransportActive);
            dataPoint.appendParameter("LRS", stats.localRequestsSent);
            dataPoint.appendParameter("LRR", stats.localResponsesReceived);
            dataPoint.appendParameter("LNR", stats.localNotificationsReceived);
            dataPoint.appendParameter("LPR", stats.localPresenceMessagesReceived);
            dataPoint.appendParameter("CRS", stats.cloudRequestsSent);
            dataPoint.appendParameter("CRR", stats.cloudResponsesReceived);
            dataPoint.appendParameter("CNR", stats.cloudNotificationsReceived);
            dataPoint.appendParameter("CPR", stats.cloudPresenceMessagesReceived);
            this.closeDataPoint(dataPoint)
        }, logCompanionAutoLaunchChanged: function logCompanionAutoLaunchChanged(isEnabled) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("CompanionAutoLaunchChanged");
            dataPoint.appendParameter("IsEnabled", isEnabled ? "true" : "false");
            this.closeDataPoint(dataPoint)
        }, logCompanionActivityLaunched: function logCompanionActivityLaunched(activity, isAutoLaunched) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("CompanionActivityLaunched");
            if (activity) {
                dataPoint.appendParameter("Name", activity.name);
                dataPoint.appendParameter("CanonicalId", activity.canonicalId)
            }
            dataPoint.appendParameter("IsAutoLaunched", isAutoLaunched ? "true" : "false");
            this.closeDataPoint(dataPoint)
        }, logPlaybackAttempted: function logPlaybackAttempted(mediaInstance) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("PlaybackAttempted");
            this._appendPlaybackCommonDataToDataPoint(mediaInstance, dataPoint);
            this.closeDataPoint(dataPoint)
        }, logGetPreferredStreamSucceeded: function logGetPreferredStreamSucceeded(retries) {
            this.logGetPreferredStreamResult(true, null, retries)
        }, logGetPreferredStreamFailed: function logGetPreferredStreamFailed(reason, retries) {
            this.logGetPreferredStreamResult(false, reason, retries)
        }, logGetPreferredStreamResult: function logGetPreferredStreamResult(success, reason, retries) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("GetPreferredStreamResult");
            dataPoint.appendParameter("Success", success);
            if (reason)
                if (reason.number)
                    dataPoint.appendParameter("Reason", reason.number);
                else
                    dataPoint.appendParameter("Reason", "unknown");
            else
                dataPoint.appendParameter("Reason", "unknown");
            dataPoint.appendParameter("Retries", retries ? retries : 0);
            this.closeDataPoint(dataPoint)
        }, logSemanticZoom: function logSemanticZoom(initMethod) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("SemanticZoom");
            this.appendUIPath(dataPoint);
            dataPoint.appendParameter("MethodInitiated", initMethod);
            this.closeDataPoint(dataPoint)
        }, logVolumeSelected: function logVolumeSelected(value) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("VolumeSelected");
            this.appendUIPath(dataPoint);
            dataPoint.appendParameter("VolumeValue", value);
            this.closeDataPoint(dataPoint)
        }, logMuteStateSelected: function logMuteStateSelected(state) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("MuteStateSelected");
            this.appendUIPath(dataPoint);
            dataPoint.appendParameter("MuteState", state);
            this.closeDataPoint(dataPoint)
        }, _getFileExtensionFromMediaInstance: function getFileExtensionFromMediaInstance(mediaInstance)
        {
            var extension = "unknown";
            MS.Entertainment.Platform.Playback.assert(mediaInstance, "tried to determine path for undefined mediaInstance");
            try {
                if (mediaInstance) {
                    var path = String.empty;
                    if (mediaInstance.isLocal) {
                        if (mediaInstance._mediaItem && mediaInstance._mediaItem.data)
                            if (mediaInstance._mediaItem.data.FilePath)
                                path = mediaInstance._mediaItem.data.FilePath;
                            else if (mediaInstance._mediaItem.data.fileItem && mediaInstance._mediaItem.data.fileItem.path)
                                path = mediaInstance._mediaItem.data.fileItem.path
                    }
                    else if (mediaInstance.source)
                        path = mediaInstance.source;
                    if (path.length > 0)
                        extension = Windows.Foundation.Uri(path).extension
                }
            }
            catch(e) {
                MS.Entertainment.Platform.Playback.assert(false, "failed to determine extension for path")
            }
            return extension
        }, _getIsDrmFromMediaInstance: function _getDrmStateFromMediaInstance(mediaInstance) {
            var isDRM = "unknown";
            if (mediaInstance)
                switch (mediaInstance.protectionState) {
                    case MS.Entertainment.Platform.Playback.ProtectionState.drmProtected:
                        isDRM = "true";
                        break;
                    case MS.Entertainment.Platform.Playback.ProtectionState.unprotected:
                        isDRM = "false";
                        break;
                    case MS.Entertainment.Platform.Playback.ProtectionState.unknown:
                        isDRM = "unknown";
                        break;
                    default:
                        MS.Entertainment.Platform.Playback.assert(false, "unknown protection state in logging");
                        break
                }
            return isDRM
        }, _getIdFromMediaInstance: function _getIdFromMediaInstance(mediaInstance) {
            var id = 0;
            if (mediaInstance)
                id = (mediaInstance.mediaInstanceId ? mediaInstance.mediaInstanceId : mediaInstance.libraryId);
            return id
        }, _getSmidFromMediaInstance: function _getSmidFromMediaInstance(mediaInstance) {
            var id = "unknown";
            if (mediaInstance && mediaInstance._mediaItem && mediaInstance._mediaItem.data && mediaInstance._mediaItem.data.ServiceMediaId)
                id = mediaInstance._mediaItem.data.ServiceMediaId;
            return id
        }, _appendPlaybackCommonDataToDataPoint: function _appendPlaybackCommonDataToDataPoint(mediaInstance, dataPoint) {
            var media = mediaInstance;
            if (mediaInstance && mediaInstance._mediaItem && mediaInstance._mediaItem.data)
                media = mediaInstance._mediaItem.data;
            var typeName = this.mediaTypeNameForTelemetry(media);
            dataPoint.appendParameter("MediaType", typeName);
            dataPoint.appendParameter("IsDRM", this._getIsDrmFromMediaInstance(mediaInstance));
            dataPoint.appendParameter("IsStream", mediaInstance.isLocal ? "false" : "true");
            dataPoint.appendParameter("Id", this._getIdFromMediaInstance(mediaInstance));
            dataPoint.appendParameter("Smid", this._getSmidFromMediaInstance(mediaInstance));
            dataPoint.appendParameter("Extension", this._getFileExtensionFromMediaInstance(mediaInstance))
        }, logPlaybackHappened: function logPlaybackHappened(mediaInstance) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("PlaybackHappened");
            this._appendPlaybackCommonDataToDataPoint(mediaInstance, dataPoint);
            var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
            var playLocation = "unknown";
            if (uiStateService.isAppVisible) {
                if (uiStateService.isSnapped)
                    playLocation = "snapped";
                else if (uiStateService.nowPlayingVisible || uiStateService.nowPlayingInset)
                    playLocation = "nowplaying"
            }
            else
                playLocation = "background";
            dataPoint.appendParameter("PlayLocation", playLocation);
            this.closeDataPoint(dataPoint)
        }, logPlaybackError: function logPlaybackError(mediaInstance, error) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("PlaybackError");
            this._appendPlaybackCommonDataToDataPoint(mediaInstance, dataPoint);
            dataPoint.appendParameter("ErrorCode", (error && error.code ? error.code : 0));
            dataPoint.appendParameter("ExtendedCode", (error && error.msExtendedCode ? error.msExtendedCode : 0));
            this.closeDataPoint(dataPoint)
        }, logCommandClicked: function logCommandClicked(commandAction) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("CommandUsage");
            this.appendUIPath(dataPoint);
            MS.Entertainment.Utilities.assert(!!commandAction.automationId, "commandAction.automationId is null or undefined, commandAction.id = " + commandAction.id);
            dataPoint.appendParameter("commandId", commandAction.automationId);
            if (commandAction.title)
                dataPoint.appendParameter("commandLabel", commandAction.title);
            if (commandAction.parameter) {
                if (commandAction.parameter.mediaItem) {
                    if (commandAction.parameter.mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.game) {
                        dataPoint.appendParameter("mediaType", commandAction.parameter.mediaItem.mediaType);
                        dataPoint.appendParameter("serviceId", commandAction.parameter.mediaItem.serviceId);
                        dataPoint.appendParameter("titleType", commandAction.parameter.mediaItem.titleType);
                        dataPoint.appendParameter("titleId", commandAction.parameter.mediaItem.titleId);
                        dataPoint.appendParameter("defaultPlatformType", commandAction.parameter.mediaItem.defaultPlatformType)
                    }
                    if (commandAction.parameter.mediaItem.name)
                        dataPoint.appendParameter("mediaName", commandAction.parameter.mediaItem.name);
                    if (commandAction.parameter.mediaItem.queryId)
                        dataPoint.appendParameter("queryId", commandAction.parameter.mediaItem.queryId)
                }
                else if (commandAction.parameter.hub || commandAction.parameter.page) {
                    if (commandAction.parameter.hub)
                        dataPoint.appendParameter("hub", commandAction.parameter.hub);
                    if (commandAction.parameter.page)
                        dataPoint.appendParameter("page", commandAction.parameter.page);
                    if (commandAction.parameter.queryId)
                        dataPoint.appendParameter("queryId", commandAction.parameter.queryId)
                }
                if (commandAction.parameter.actionType)
                    dataPoint.appendParameter("actionType", commandAction.parameter.actionType);
                if (commandAction.parameter.executeLocation)
                    dataPoint.appendParameter("executeLocation", commandAction.parameter.executeLocation)
            }
            else if (commandAction.userModel)
                dataPoint.appendParameter("secondaryGamerTag", commandAction.userModel.gamerTag);
            this.closeDataPoint(dataPoint)
        }, logPopoverShown: function logPopoverShown(commandId, mediaItem) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("PopoverDisplay");
            dataPoint.appendParameter("UIPart", "Popover");
            this.appendUIPath(dataPoint);
            if (commandId)
                dataPoint.appendParameter("commandId", commandId);
            if (mediaItem) {
                dataPoint.appendParameter("mediaType", mediaItem.mediaType);
                if (mediaItem.serviceId)
                    dataPoint.appendParameter("serviceId", mediaItem.serviceId);
                if (mediaItem.seriesId)
                    dataPoint.appendParameter("seriesId", mediaItem.seriesId);
                if (mediaItem.titleId)
                    dataPoint.appendParameter("titleId", mediaItem.titleId);
                if (mediaItem.queryId)
                    dataPoint.appendParameter("queryId", mediaItem.queryId);
                if (mediaItem.name)
                    dataPoint.appendParameter("name", mediaItem.name);
                if (mediaItem.itemTypeQueryString)
                    dataPoint.appendParameter("itemTypeQueryString", mediaItem.itemTypeQueryString)
            }
            this.closeDataPoint(dataPoint)
        }, logModifierClicked: function logModifierClicked(id, label) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("ModifierUsage");
            this.appendUIPath(dataPoint);
            dataPoint.appendParameter("Label", label);
            dataPoint.appendParameter("Id", id);
            this.closeDataPoint(dataPoint)
        }, logPrimaryNavigationClicked: function logPrimaryNavigationClicked(moniker, label) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("TwistUsage");
            this.appendUIPath(dataPoint);
            dataPoint.appendParameter("Moniker", moniker);
            dataPoint.appendParameter("Label", label);
            this.closeDataPoint(dataPoint)
        }, logNotification: function logNotification(notification, isNewNotification) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("NotificationUsage");
            this.appendUIPath(dataPoint);
            MS.Entertainment.Utilities.assert(notification, "notification is null or undefined");
            dataPoint.appendParameter("NotificationTitle", notification.title);
            dataPoint.appendParameter("NotificationCategory", notification.category.name);
            dataPoint.appendParameter("IsNewNotification", isNewNotification ? "Yes" : "No");
            this.closeDataPoint(dataPoint)
        }, mediaUsageContentTypeName: function mediaUsageContentTypeName(media) {
            var name;
            name = media.edsMediaItemTypeString;
            if (!name) {
                var mediaType = media.mediaType;
                switch (mediaType) {
                    case Microsoft.Entertainment.Queries.ObjectType.video:
                        if (media.videoType === Microsoft.Entertainment.Queries.VideoType.tvEpisode)
                            name = MS.Entertainment.Data.Query.edsMediaType.tvEpisode;
                        else if (media.videoType === Microsoft.Entertainment.Queries.VideoType.musicVideo)
                            name = MS.Entertainment.Data.Query.edsMediaType.musicVideo;
                        else if (media.videoType === Microsoft.Entertainment.Queries.VideoType.movie)
                            name = MS.Entertainment.Data.Query.edsMediaType.movie;
                        else
                            name = String.empty;
                        break;
                    case Microsoft.Entertainment.Queries.ObjectType.tvSeries:
                        name = MS.Entertainment.Data.Query.edsMediaType.tvSeries;
                        break;
                    case Microsoft.Entertainment.Queries.ObjectType.tvSeason:
                        name = MS.Entertainment.Data.Query.edsMediaType.tvSeason;
                        break;
                    case Microsoft.Entertainment.Queries.ObjectType.person:
                        name = MS.Entertainment.Data.Query.edsMediaType.musicArtist;
                        break;
                    case Microsoft.Entertainment.Queries.ObjectType.album:
                        name = MS.Entertainment.Data.Query.edsMediaType.album;
                        break;
                    case Microsoft.Entertainment.Queries.ObjectType.track:
                        name = MS.Entertainment.Data.Query.edsMediaType.track;
                        break;
                    default:
                        name = String.empty;
                        break
                }
            }
            return name
        }, logMediaUsageHappened: function logMediaUsageHappened(playbackControl, position, eventType, isStartEvent) {
            if (!playbackControl)
                return;
            var mediaInstance = playbackControl.currentMedia;
            if (playbackControl._player && playbackControl._player._currentMedia)
                mediaInstance = playbackControl._player._currentMedia;
            var media = null;
            if (mediaInstance && mediaInstance._mediaItem && mediaInstance._mediaItem.data)
                media = mediaInstance._mediaItem.data;
            if (!media)
                return;
            var contentType = this.mediaUsageContentTypeName(media);
            if (!contentType)
                return;
            if (contentType === MS.Entertainment.Data.Query.edsMediaType.track && mediaInstance) {
                if (mediaInstance.isAudioAd)
                    contentType = "MusicAd";
                else if (mediaInstance.isPreview)
                    contentType = "MusicPreview"
            }
            else if (contentType === MS.Entertainment.Data.Query.edsMediaType.movie && mediaInstance && mediaInstance.isPreview)
                contentType = "VideoPreview";
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("MediaUsageEvent");
            dataPoint.appendDestination(Microsoft.Entertainment.Platform.Logging.TelemetryListener.mediaUsage);
            dataPoint.appendParameter("EventType", eventType);
            if (position)
                position = (position | 0);
            if (position !== this.badPositionMs)
                dataPoint.appendParameter("Position", position);
            else {
                MS.Entertainment.Utilities.assert(false, "playback position is 604800000(7days), duration is " + playbackControl.duration);
                dataPoint.appendParameter("Position", String.empty)
            }
            if (!MS.Entertainment.Utilities.isEmptyGuid(media.canonicalId))
                dataPoint.appendParameter("BingMediaId", media.canonicalId);
            if (!MS.Entertainment.Utilities.isEmptyGuid(media.zuneId))
                dataPoint.appendParameter("ProviderMediaId", media.zuneId);
            if (MS.Entertainment.Utilities.isEmptyGuid(media.canonicalId) && MS.Entertainment.Utilities.isEmptyGuid(media.zuneId)) {
                dataPoint.appendParameter("BingMediaId", String.empty);
                dataPoint.appendParameter("ProviderMediaId", String.empty)
            }
            dataPoint.appendParameter("ContentType", contentType);
            dataPoint.appendParameter("IsStream", mediaInstance.isLocal ? "false" : "true");
            var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
            if (uiStateService.isAppVisible)
                if (uiStateService.isSnapped)
                    dataPoint.appendParameter("ScreenSize", "Docked");
                else
                    dataPoint.appendParameter("ScreenSize", "Full");
            else
                dataPoint.appendParameter("ScreenSize", "Minimized");
            dataPoint.appendParameter("IsDrm", this._getIsDrmFromMediaInstance(mediaInstance));
            var playbackDuration = 0;
            if (isStartEvent) {
                var now = Date.now();
                this._totalTimeCounterStart = now
            }
            else if (this._totalTimeCounterStart !== 0) {
                playbackDuration = Date.now() - this._totalTimeCounterStart;
                this._totalTimeCounterStart = 0
            }
            dataPoint.appendParameter("PlaybackDurationMs", playbackDuration);
            dataPoint.appendParameter("ProviderMediaInstanceId", mediaInstance && mediaInstance.mediaInstanceId ? mediaInstance.mediaInstanceId : String.empty);
            if (playbackControl.duration && playbackControl.duration > 0)
                dataPoint.appendParameter("MediaLengthMs", playbackControl.duration);
            else
                dataPoint.appendParameter("MediaLengthMs", mediaInstance && mediaInstance.duration ? mediaInstance.duration : String.empty);
            this.closeDataPoint(dataPoint)
        }, logPlayHappened: function logPlayHappened(playbackControl, position) {
            if (this._somethingPlaying)
                this.logMediaUsageHappened(playbackControl, position, "Resume", true);
            else
                this.logMediaUsageHappened(playbackControl, position, "Play", true);
            this._somethingPlaying = true
        }, logPauseHappened: function logPauseHappened(playbackControl, position) {
            if (this._somethingPlaying)
                this.logMediaUsageHappened(playbackControl, position, "Pause", false)
        }, logEndHappened: function logEndHappened(playbackControl, position) {
            if (this._somethingPlaying)
                this.logMediaUsageHappened(playbackControl, position, "End", false);
            this._somethingPlaying = false
        }, logSkipHappened: function logSkipHappened(playbackControl, position) {
            if (this._somethingPlaying)
                this.logMediaUsageHappened(playbackControl, position, "Skip", false);
            this._somethingPlaying = false
        }, logPurchaseHappened: function logPurchaseHappened(media, offerId) {
            if (!media)
                return;
            var serviceIdToUse = null;
            if (media.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeason)
                serviceIdToUse = media.seasonServiceId;
            else
                serviceIdToUse = media.canonicalId;
            if (MS.Entertainment.Utilities.isEmptyGuid(media.zuneId) && MS.Entertainment.Utilities.isEmptyGuid(serviceIdToUse))
                return;
            var contentType = this.mediaUsageContentTypeName(media);
            if (!contentType)
                return;
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("MediaUsageEvent");
            dataPoint.appendDestination(Microsoft.Entertainment.Platform.Logging.TelemetryListener.mediaUsage);
            dataPoint.appendParameter("EventType", "Purchase");
            dataPoint.appendParameter("Position", 0);
            dataPoint.appendParameter("ContentType", contentType);
            if (!MS.Entertainment.Utilities.isEmptyGuid(serviceIdToUse))
                dataPoint.appendParameter("BingMediaId", serviceIdToUse);
            if (!MS.Entertainment.Utilities.isEmptyGuid(media.zuneId))
                dataPoint.appendParameter("ProviderMediaId", media.zuneId);
            var acquisitionType = "Purchase";
            if (media.mediaType === Microsoft.Entertainment.Queries.ObjectType.video) {
                var licenseRight = this.licenseRightFromMedia(media, offerId);
                if (licenseRight === MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.Rent || licenseRight === MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.RentStream)
                    acquisitionType = "Rental"
            }
            dataPoint.appendParameter("AcquisitionType", acquisitionType);
            var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
            if (uiStateService.isAppVisible)
                if (uiStateService.isSnapped)
                    dataPoint.appendParameter("ScreenSize", "Docked");
                else
                    dataPoint.appendParameter("ScreenSize", "Full");
            else
                dataPoint.appendParameter("ScreenSize", "Minimized");
            this.closeDataPoint(dataPoint)
        }, logDownloadHappened: function logDownloadHappened(media) {
            if (!media)
                return;
            if (MS.Entertainment.Utilities.isEmptyGuid(media.zuneId) && MS.Entertainment.Utilities.isEmptyGuid(media.canonicalId))
                return;
            var contentType = this.mediaUsageContentTypeName(media);
            if (!contentType)
                return;
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("MediaUsageEvent");
            dataPoint.appendDestination(Microsoft.Entertainment.Platform.Logging.TelemetryListener.mediaUsage);
            dataPoint.appendParameter("EventType", "Download");
            dataPoint.appendParameter("Position", 0);
            dataPoint.appendParameter("ContentType", contentType);
            if (!MS.Entertainment.Utilities.isEmptyGuid(media.canonicalId))
                dataPoint.appendParameter("BingMediaId", media.canonicalId);
            if (!MS.Entertainment.Utilities.isEmptyGuid(media.zuneId))
                dataPoint.appendParameter("ProviderMediaId", media.zuneId);
            var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
            if (uiStateService.isAppVisible)
                if (uiStateService.isSnapped)
                    dataPoint.appendParameter("ScreenSize", "Docked");
                else
                    dataPoint.appendParameter("ScreenSize", "Full");
            else
                dataPoint.appendParameter("ScreenSize", "Minimized");
            this.closeDataPoint(dataPoint)
        }, logInvalidExclusiveModeState: function logInvalidExclusiveModeState() {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("InvalidExclusiveModeState");
            this.appendUIPath(dataPoint);
            this.closeDataPoint(dataPoint)
        }, logAcquiredExclusiveMode: function logAcquiredExclusiveMode() {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("AcquiredExclusiveMode");
            this.appendUIPath(dataPoint);
            this.closeDataPoint(dataPoint)
        }, logPlaybackErrorConvertedToGeneric: function logPlaybackErrorConvertedToGeneric(originalCode, originalExtendedCode, context) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("PlaybackErrorConvertedToGeneric");
            dataPoint.appendParameter("ErrorCode", (originalCode ? originalCode : 0));
            dataPoint.appendParameter("ExtendedCode", (originalExtendedCode ? originalExtendedCode : 0));
            dataPoint.appendParameter("Context", (context ? context : ""));
            this.closeDataPoint(dataPoint)
        }, logRootLicenseAcquisition: function logRootLicenseAcquisition(status, errorCode) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("RootLicenseAcquisition");
            dataPoint.appendParameter("Status", status);
            dataPoint.appendParameter("ErrorCode", (errorCode ? errorCode : 0));
            this.closeDataPoint(dataPoint)
        }, logReactiveLicenseAcquisitionProgress: function logReactiveLicenseAcquisitionProgress(mediaInstance, kid, state) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("ReactiveLicenseAcquisition");
            this._appendPlaybackCommonDataToDataPoint(mediaInstance, dataPoint);
            dataPoint.appendParameter("State", state);
            dataPoint.appendParameter("Kid", kid ? kid : "unknown");
            dataPoint.appendParameter("Miid", mediaInstance && mediaInstance.mediaInstanceId ? mediaInstance.mediaInstanceId : "unknown");
            this.closeDataPoint(dataPoint)
        }, logWelcomePanelDismissed: function logWelcomePanelDismissed() {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("WelcomePanelDismissed");
            this.appendUIPath(dataPoint);
            this.closeDataPoint(dataPoint)
        }, logWelcomePanelStartButton: function logWelcomePanelStartButton() {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("WelcomePanelStartButtonClicked");
            this.appendUIPath(dataPoint);
            this.closeDataPoint(dataPoint)
        }, logSignInWelcomePanel: function logSignInWelcomePanel() {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("SignInWelcomePanel");
            this.appendUIPath(dataPoint);
            this.closeDataPoint(dataPoint)
        }, logErrorInMediaTagRemoval: function logErrorInMediaTagRemoval(error) {
            var dataPoint = this.openDataPoint();
            dataPoint.appendEventName("ErrorInMediaTagRemoval");
            dataPoint.appendParameter("Error", error);
            this.closeDataPoint(dataPoint)
        }, badPositionMs: 604800000, Events: {CloudMatchStateChangeMethod: "CloudMatchEnabledStateChangeMethod"}, StateChangeMethodValues: {
            dialog: "dialog", toggle: "toggle", notification: "notification"
        }
})
