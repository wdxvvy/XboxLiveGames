/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Components/PerfTrack/PerfTrack.js");
(function() {
    var MSEPlatform = WinJS.Namespace.define("MS.Entertainment.Platform", null);
    WinJS.Namespace.defineWithParent(MSEPlatform, "Playback", {Error: {
            LRCSESSION_UNKNOWN_ERROR: {
                name: "LRCSESSION_UNKNOWN_ERROR", code: 0
            }, LRCSESSION_INTERNAL_ERROR: {
                    name: "LRCSESSION_INTERNAL_ERROR", code: 100
                }, LRCSESSION_APP_SIGNIN_FAILED: {
                    name: "LRCSESSION_APP_SIGNIN_FAILED", code: -2147023652
                }, LRC_E_NOXBOXCONNECTED: {
                    name: "LRC_E_NOXBOXCONNECTED", code: -1072767103
                }, LRC_E_EMPTYAUTHTOKEN: {
                    name: "LRC_E_EMPTYAUTHTOKEN", code: -1072767117
                }, LRC_E_TOOMANYCOMPANIONS: {
                    name: "LRC_E_TOOMANYCOMPANIONS", code: -1072767134
                }, LRC_E_RESOURCENOTFOUND: {
                    name: "LRC_E_RESOURCENOTFOUND", code: -2146697211
                }, LRC_E_TIMEOUTSESSIONCONNECTJOINREQUEST: {
                    name: "LRC_E_TIMEOUTSESSIONCONNECTJOINREQUEST", code: -1072767111
                }, LRC_E_SERVICE_NOT_ACTIVE: {
                    name: "LRC_E_SERVICE_NOT_ACTIVE", code: -1072885299
                }, LRC_E_NETWORK_UNREACHABLE: {
                    name: "LRC_E_NETWORK_UNREACHABLE", code: -1072885352
                }, LRC_E_OFFLINE_MODE: {
                    name: "LRC_E_OFFLINE_MODE", code: -1072885466
                }, LRC_E_WSAECONNABORTED: {
                    name: "LRC_E_WSAECONNABORTED", code: -2147014843
                }, NS_E_EXPLICIT_CONTENT_SIGNIN_REQUIRED: {
                    name: "NS_E_EXPLICIT_CONTENT_SIGNIN_REQUIRED", code: (0xC00D1354 - 0xFFFFFFFF - 1)
                }, NS_E_EXPLICIT_CONTENT_BLOCKED: {
                    name: "NS_E_EXPLICIT_CONTENT_BLOCKED", code: (0xC00D1355 - 0xFFFFFFFF - 1)
                }, NS_E_WMP_NETWORK_ERROR: {
                    name: "NS_E_WMP_NETWORK_ERROR", code: 0xC00D11C0
                }, NS_E_SIGNIN_NOT_SUPPORTED_REGION: {
                    name: "NS_E_SIGNIN_NOT_SUPPORTED_REGION", code: 0xC00D1388
                }, NS_E_DRM_NEEDS_INDIVIDUALIZATION: {
                    name: "NS_E_DRM_NEEDS_INDIVIDUALIZATION", code: (0xC00D2728 - 0xFFFFFFFF - 1)
                }, NS_E_WMPIM_USEROFFLINE: {
                    name: "NS_E_WMPIM_USEROFFLINE", code: -1072885466
                }, NS_E_WMP_BAD_DRIVER: {
                    name: "NS_E_WMP_BAD_DRIVER", code: (0xc00d11d1 - 0xFFFFFFFF - 1)
                }, NS_E_WMP_DRM_LICENSE_NOTACQUIRED: {
                    name: "NS_E_WMP_DRM_LICENSE_NOTACQUIRED", code: (0xc00d1204 - 0xFFFFFFFF - 1)
                }, NS_E_COMPRESSED_DIGITAL_AUDIO_PROTECTION_LEVEL_UNSUPPORTED: {
                    name: "NS_E_COMPRESSED_DIGITAL_AUDIO_PROTECTION_LEVEL_UNSUPPORTED", code: (0xC00D2098 - 0xFFFFFFFF - 1)
                }, NS_E_UNCOMPRESSED_DIGITAL_AUDIO_PROTECTION_LEVEL_UNSUPPORTED: {
                    name: "NS_E_UNCOMPRESSED_DIGITAL_AUDIO_PROTECTION_LEVEL_UNSUPPORTED", code: (0xC00D2099 - 0xFFFFFFFF - 1)
                }, NS_E_DRM_DRIVER_AUTH_FAILURE: {
                    name: "NS_E_DRM_DRIVER_AUTH_FAILURE", code: (0xC00D274D - 0xFFFFFFFF - 1)
                }, NS_E_DRM_UNABLE_TO_INITIALIZE: {
                    name: "NS_E_DRM_UNABLE_TO_INITIALIZE", code: (0xC00D271D - 0xFFFFFFFF - 1)
                }, NS_E_WMP_AUDIO_HW_PROBLEM: {
                    name: "NS_E_WMP_AUDIO_HW_PROBLEM", code: (0xC00D11BA - 0xFFFFFFFF - 1)
                }, NS_E_WMP_BAD_DRIVER: {
                    name: "NS_E_WMP_BAD_DRIVER", code: (0xC00D11D1 - 0xFFFFFFFF - 1)
                }, NS_E_WMP_MULTIPLE_ERROR_IN_PLAYLIST: {
                    name: "NS_E_WMP_MULTIPLE_ERROR_IN_PLAYLIST", code: (0xC00D11DF - 0xFFFFFFFF - 1)
                }, ZEST_E_SIGNIN_REQUIRED: {
                    name: "ZEST_E_SIGNIN_REQUIRED", code: (0xC101A24B - 0xFFFFFFFF - 1)
                }, ZEST_E_MW_CONCURRENT_STREAM: {
                    name: "ZEST_E_MW_CONCURRENT_STREAM", code: (0xC101A9CA - 0xFFFFFFFF - 1)
                }, ZEST_E_ASSET_LICENSE_RIGHT_NOT_OWNED: {
                    name: "ZEST_E_ASSET_LICENSE_RIGHT_NOT_OWNED", code: (0xC101A7D4 - 0xFFFFFFFF - 1)
                }, ZEST_E_MULTITUNER_CONCURRENTSTREAMING_DETECTED: {
                    name: "ZEST_E_MULTITUNER_CONCURRENTSTREAMING_DETECTED", code: (0xC101A7D8 - 0xFFFFFFFF - 1)
                }, ZEST_E_MEDIAINSTANCE_STREAMING_OCCUPIED: {
                    name: "ZEST_E_MEDIAINSTANCE_STREAMING_OCCUPIED", code: (0xC101A7E1 - 0xFFFFFFFF - 1)
                }, ZUNE_E_NO_SUBSCRIPTION_DOWNLOAD_RIGHTS: {
                    name: "ZUNE_E_NO_SUBSCRIPTION_DOWNLOAD_RIGHTS", code: (0xC1010029 - 0xFFFFFFFF - 1)
                }, E_MDS_AUTHENTICATED_TRACK_LIMIT: {
                    name: "E_MDS_AUTHENTICATED_TRACK_LIMIT", code: (0xC101AB56 - 0xFFFFFFFF - 1)
                }, E_MDS_INDIVIDUAL_TRACK_LIMIT: {
                    name: "E_MDS_INDIVIDUAL_TRACK_LIMIT", code: (0xC101AB59 - 0xFFFFFFFF - 1)
                }, E_MDS_CANNOT_PLAY: {
                    name: "E_MDS_CANNOT_PLAY", code: (0xC101AB57 - 0xFFFFFFFF - 1)
                }, E_MDS_ROAMING_LIMIT: {
                    name: "E_MDS_ROAMING_LIMIT", code: (0xC101AB58 - 0xFFFFFFFF - 1)
                }, ERROR_GRAPHICS_ONLY_CONSOLE_SESSION_SUPPORTED: {
                    name: "ERROR_GRAPHICS_ONLY_CONSOLE_SESSION_SUPPORTED", code: (0xC0262500 - 0xFFFFFFFF - 1)
                }, X8_E_PLAYBACK_MEDIA_ERR_ABORTED: {
                    name: "X8_E_PLAYBACK_MEDIA_ERR_ABORTED", code: (0xC101008D - 0xFFFFFFFF - 1)
                }, X8_E_PLAYBACK_MEDIA_ERR_NETWORK: {
                    name: "X8_E_PLAYBACK_MEDIA_ERR_NETWORK", code: (0xC101008E - 0xFFFFFFFF - 1)
                }, X8_E_PLAYBACK_MEDIA_ERR_DECODE: {
                    name: "X8_E_PLAYBACK_MEDIA_ERR_DECODE", code: (0xC101008F - 0xFFFFFFFF - 1)
                }, X8_E_PLAYBACK_MEDIA_ERR_SRC_NOT_SUPPORTED: {
                    name: "X8_E_PLAYBACK_MEDIA_ERR_SRC_NOT_SUPPORTED", code: (0xC1010090 - 0xFFFFFFFF - 1)
                }, X8_E_PLAYBACK_MEDIA_GENERIC: {
                    name: "X8_E_PLAYBACK_MEDIA_GENERIC", code: (0xC1010091 - 0xFFFFFFFF - 1)
                }, X8_E_PLAYBACK_MEDIA_CANT_PLAYTO: {
                    name: "X8_E_PLAYBACK_MEDIA_CANT_PLAYTO", code: (0xC1010092 - 0xFFFFFFFF - 1)
                }, X8_E_PLAYBACK_MEDIA_CANT_PLAYTO_PREMIUM: {
                    name: "X8_E_PLAYBACK_MEDIA_CANT_PLAYTO_PREMIUM", code: (0xC1010093 - 0xFFFFFFFF - 1)
                }, X8_E_PLAYBACK_FREESTREAMING_NO_RIGHTS: {
                    name: "X8_E_PLAYBACK_FREESTREAMING_NO_RIGHTS", code: (0xC1010094 - 0xFFFFFFFF - 1)
                }, X8_E_PLAYBACK_PLAYTO_ERR_DECODE: {
                    name: "X8_E_PLAYBACK_PLAYTO_ERR_DECODE", code: (0xC1010095 - 0xFFFFFFFF - 1)
                }, X8_E_PLAYBACK_NO_ASSET_LOCATION: {
                    name: "X8_E_PLAYBACK_NO_ASSET_LOCATION", code: (0xC101010A - 0xFFFFFFFF - 1)
                }, X8_E_PLAYBACK_MEDIA_ERR_NOT_LOCAL: {
                    name: "X8_E_PLAYBACK_MEDIA_ERR_NOT_LOCAL", code: (0xC101FF90 - 0xFFFFFFFF - 1)
                }, X8_E_PLAYBACK_STOPPED_DATA_LIMIT_EXCEEDED: {
                    name: "X8_E_PLAYBACK_STOPPED_DATA_LIMIT_EXCEEDED", code: (0xC10101C2 - 0xFFFFFFFF - 1)
                }, X8_E_PLAYBACK_STOPPED_DATA_LIMIT_APPROACHING: {
                    name: "X8_E_PLAYBACK_STOPPED_DATA_LIMIT_APPROACHING", code: (0xC10101C3 - 0xFFFFFFFF - 1)
                }, X8_E_PLAYBACK_STOPPED_SWITCHED_TO_METERED_NETWORK: {
                    name: "X8_E_PLAYBACK_STOPPED_SWITCHED_TO_METERED_NETWORK", code: (0xC10101C4 - 0xFFFFFFFF - 1)
                }, MF_E_DRM_UNSUPPORTED: {
                    name: "MF_E_DRM_UNSUPPORTED", code: (0xC00D3700 - 0xFFFFFFFF - 1)
                }, MF_E_AUDIO_PLAYBACK_DEVICE_INVALIDATED: {
                    name: "MF_E_AUDIO_PLAYBACK_DEVICE_INVALIDATED", code: (0XC00D4E86 - 0xFFFFFFFF - 1)
                }, MF_E_UNSUPPORTED_CONTENT_PROTECTION_SYSTEM: {
                    name: "MF_E_UNSUPPORTED_CONTENT_PROTECTION_SYSTEM", code: (0xC00d7186 - 0xFFFFFFFF - 1)
                }, MF_E_CANNOT_CREATE_SINK: {
                    name: "MF_E_CANNOT_CREATE_SINK", code: (0xC00D36FA - 0xFFFFFFFF - 1)
                }, MF_E_DEBUGGING_NOT_ALLOWED: {
                    name: "MF_E_DEBUGGING_NOT_ALLOWED", code: (0xC00D715D - 0xFFFFFFFF - 1)
                }, MF_E_HIGH_SECURITY_LEVEL_CONTENT_NOT_ALLOWED: {
                    name: "MF_E_HIGH_SECURITY_LEVEL_CONTENT_NOT_ALLOWED", code: (0xC00D7178 - 0xFFFFFFFF - 1)
                }, INET_E_CONNECTION_TIMEOUT: {
                    name: "INET_E_CONNECTION_TIMEOUT", code: (0x800C000b - 0xFFFFFFFF - 1)
                }, INET_E_DOWNLOAD_FAILURE: {
                    name: "INET_E_DOWNLOAD_FAILURE", code: (0x800C0008 - 0xFFFFFFFF - 1)
                }, INET_E_RESOURCE_NOT_FOUND: {
                    name: "INET_E_RESOURCE_NOT_FOUND", code: (0x800C0005 - 0xFFFFFFFF - 1)
                }, ZUNE_E_NO_SUBSCRIPTION_DOWNLOAD_RIGHTS: {
                    name: "ZUNE_E_NO_SUBSCRIPTION_DOWNLOAD_RIGHTS", code: (0xC1010029 - 0xFFFFFFFF - 1)
                }, ZEST_E_MW_CONTENT_REVOKED_ON_LABEL_TAKEDOWN: {
                    name: "ZEST_E_MW_CONTENT_REVOKED_ON_LABEL_TAKEDOWN", code: (0xC101A9D6 - 0xFFFFFFFF - 1)
                }
        }});
    WinJS.Namespace.define("MS.Entertainment.Platform.Playback", {
        makePlaybackError: function makePlaybackError(error, context) {
            MSEPlatform.Playback.Etw.traceString("+PlaybackError::makePlaybackError InnerError" + ", code = " + (error ? error.code : String.empty) + ", msExtendedCode = " + (error ? error.msExtendedCode : String.empty) + ", context = " + context);
            var playbackError = {};
            var errorCode = 0;
            if (!error) {
                errorCode = MS.Entertainment.Platform.Playback.Error.X8_E_PLAYBACK_MEDIA_GENERIC.code;
                MS.Entertainment.Utilities.Telemetry.logPlaybackErrorConvertedToGeneric(0, 0, "makePlaybackError, error is NULL - " + context)
            }
            else if (typeof(error) === "object")
                if (error.code)
                    errorCode = MS.Entertainment.Platform.Playback._mapMediaElementErrorCodes(error.code, error.msExtendedCode);
                else if (error.number)
                    errorCode = MS.Entertainment.Platform.Playback._mapMediaElementErrorCodes(error.number);
                else if (error.msExtendedCode)
                    errorCode = error.msExtendedCode;
                else
                    try {
                        var s = error.toString();
                        if (s && s !== String.empty) {
                            errorCode = MS.Entertainment.Platform.Playback.Error.X8_E_PLAYBACK_MEDIA_GENERIC.code;
                            MS.Entertainment.Utilities.Telemetry.logPlaybackErrorConvertedToGeneric(0, 0, "makePlaybackError, string object = " + s + " - " + context)
                        }
                    }
                    catch(ex) {}
            else if (typeof(error) === "string") {
                errorCode = MS.Entertainment.Platform.Playback.Error.X8_E_PLAYBACK_MEDIA_GENERIC.code;
                MS.Entertainment.Utilities.Telemetry.logPlaybackErrorConvertedToGeneric(0, 0, "makePlaybackError, string literal = " + error + " - " + context)
            }
            else if (isNaN(error)) {
                errorCode = MS.Entertainment.Platform.Playback.Error.X8_E_PLAYBACK_MEDIA_GENERIC.code;
                MS.Entertainment.Utilities.Telemetry.logPlaybackErrorConvertedToGeneric(0, 0, "makePlaybackError, error isNaN - " + context)
            }
            else
                errorCode = error;
            playbackError.innerError = error;
            playbackError.isCritical = (error && error.isCritical);
            playbackError.code = errorCode;
            playbackError.msExtendedCode = errorCode;
            playbackError.context = context;
            if (error && error.name)
                playbackError[error.name] = errorCode;
            MSEPlatform.Playback.Etw.traceString("-PlaybackError::makePlaybackError OuterError" + ", code = " + errorCode);
            return playbackError
        }, firePlaybackError: function firePlaybackError(callback, error, context, mediaItem) {
                if (callback) {
                    var eventObject = {
                            type: "error", target: {error: {
                                        code: 0, innerError: null, isCritical: false, msExtendedCode: 0, mediaItem: null, context: context
                                    }}
                        };
                    eventObject.target.error = MS.Entertainment.Platform.Playback.makePlaybackError(error, context);
                    if (mediaItem !== undefined)
                        eventObject.target.error.mediaItem = mediaItem;
                    MSEPlatform.Playback.Etw.traceString("PlaybackErrors::firePlaybackError" + ", code = " + eventObject.target.error.code + ", msExtendedCode = " + eventObject.target.error.msExtendedCode + ", context = " + context);
                    WinJS.Promise.timeout().then(function _fire() {
                        callback(eventObject)
                    })
                }
                MS.Entertainment.Instrumentation.PerfTrack.disableAllStartupScenarios();
                MS.Entertainment.Instrumentation.PerfTrack.disableScenarioPlayProtectedInApp();
                MS.Entertainment.Instrumentation.PerfTrack.disableScenarioPlayNonProtectedInApp()
            }, _mapMediaElementErrorCodes: function _mapMediaElementErrorCodes(code, msExtendedCode) {
                var MEDIA_ERR_ABORTED = 1;
                var MEDIA_ERR_NETWORK = 2;
                var MEDIA_ERR_DECODE = 3;
                var MEDIA_ERR_SRC_NOT_SUPPORTED = 4;
                if (code < MEDIA_ERR_ABORTED || code > MEDIA_ERR_SRC_NOT_SUPPORTED)
                    return code;
                var errorCode = MS.Entertainment.Platform.Playback.Error.X8_E_PLAYBACK_MEDIA_GENERIC.code;
                switch (code) {
                    case MEDIA_ERR_ABORTED:
                        if (msExtendedCode)
                            errorCode = msExtendedCode;
                        else
                            errorCode = MS.Entertainment.Platform.Playback.Error.X8_E_PLAYBACK_MEDIA_ERR_ABORTED.code;
                        break;
                    case MEDIA_ERR_NETWORK:
                        if (msExtendedCode)
                            errorCode = msExtendedCode;
                        else
                            errorCode = MS.Entertainment.Platform.Playback.Error.X8_E_PLAYBACK_MEDIA_ERR_NETWORK.code;
                        break;
                    case MEDIA_ERR_DECODE:
                        if (msExtendedCode)
                            errorCode = msExtendedCode;
                        else
                            errorCode = MS.Entertainment.Platform.Playback.Error.X8_E_PLAYBACK_MEDIA_ERR_DECODE.code;
                        break;
                    case MEDIA_ERR_SRC_NOT_SUPPORTED:
                        if (msExtendedCode)
                            if (msExtendedCode === MS.Entertainment.Platform.Playback.Error.MF_E_UNSUPPORTED_CONTENT_PROTECTION_SYSTEM.code)
                                errorCode = MS.Entertainment.Platform.Playback.Error.NS_E_WMP_DRM_LICENSE_NOTACQUIRED.code;
                            else
                                errorCode = msExtendedCode;
                        else
                            errorCode = MS.Entertainment.Platform.Playback.Error.X8_E_PLAYBACK_MEDIA_ERR_SRC_NOT_SUPPORTED.code;
                        break;
                    default:
                        errorCode = MS.Entertainment.Platform.Playback.Error.X8_E_PLAYBACK_MEDIA_GENERIC.code;
                        MS.Entertainment.Utilities.Telemetry.logPlaybackErrorConvertedToGeneric(code, msExtendedCode, "_mapMediaElementErrorCodes");
                        break
                }
                return errorCode
            }
    })
})()
