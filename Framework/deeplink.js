/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/action.js", "/Framework/actionidentifiers.js", "/Framework/servicelocator.js", "/Framework/debug.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.DeepLink");
WinJS.Namespace.define("MS.Entertainment.UI.DeepLink", {
    _deepLinksFactories: {}, registerDeepLinksFactory: function registerDeepLinksFactory(appMode, factory) {
            MS.Entertainment.UI.DeepLink._deepLinksFactories[appMode] = factory
        }, getTestHooks: function getTestHooks() {
            return {getRegisteredDeepLinksFactory: function getRegisteredDeepLinksFactory() {
                        return MS.Entertainment.UI.DeepLink._deepLinksFactories
                    }}
        }, ParamType: {
            identifier: /^[_a-zA-Z][_a-zA-Z0-9]*$/g, guid: /^(\{{0,1}([0-9a-fA-F]){8}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){12}\}{0,1})$/g, boolean: /^true|false$/gi, integer: /^[-+]?[0-9]+$/g, string: /.+/g
        }, processDeepLink: (function processDeepLink(command, params) {
            var _deepLinks = null;
            return function processDeepLink(command, params) {
                    if (!command)
                        throw"processDeepLink: command parameter is mandatory";
                    if (!params)
                        throw"processDeepLink: command parameter is mandatory";
                    if (!_deepLinks) {
                        var factory = MS.Entertainment.UI.DeepLink._deepLinksFactories[MS.Entertainment.appMode];
                        if (factory)
                            _deepLinks = factory();
                        if (!_deepLinks)
                            return false;
                        for (var name in _deepLinks) {
                            var deepLink = _deepLinks[name];
                            MS.Entertainment.UI.DeepLink.assert(deepLink.actionId, "DeepLink definition: 'actionId' field not specified");
                            MS.Entertainment.UI.DeepLink.assert(deepLink.params, "DeepLink definition: 'params' field not specified");
                            for (var paramName in deepLink.params) {
                                var param = deepLink.params[paramName];
                                MS.Entertainment.UI.DeepLink.assert(typeof param.required === "boolean", "DeepLink definition: 'required' field not specified");
                                MS.Entertainment.UI.DeepLink.assert(param.type, "DeepLink definition: 'type' field not specified")
                            }
                        }
                    }
                    deepLink = _deepLinks[command];
                    if (!deepLink)
                        return false;
                    for (name in deepLink.params)
                        if (deepLink.params[name].required && !params[name])
                            return false;
                    for (name in params) {
                        var parameterInfo = deepLink.params[name];
                        if (!parameterInfo)
                            return false;
                        parameterInfo.type.lastIndex = 0;
                        if (!parameterInfo.type.test(params[name]))
                            return false;
                        if (parameterInfo.values)
                            if (parameterInfo.caseInsensitive) {
                                var parameterValue = params[name].toLocaleLowerCase();
                                var validValue = false;
                                for (var i = 0; i < parameterInfo.values.length; i++)
                                    if (parameterInfo.values[i].toLocaleLowerCase() === parameterValue) {
                                        validValue = true;
                                        break
                                    }
                                if (!validValue)
                                    return false
                            }
                            else if (deepLink.params[name].values.indexOf(params[name]) === -1)
                                return false
                    }
                    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                    if (!actionService.isRegistered(deepLink.actionId))
                        return false;
                    var action = actionService.getAction(deepLink.actionId);
                    if (!action.automationId)
                        action.automationId = MS.Entertainment.UI.AutomationIds.deepLink;
                    var type = MS.Entertainment.UI.DeepLink.ParamType;
                    var actionParams = {};
                    for (name in params)
                        switch (deepLink.params[name].type) {
                            case type.identifier:
                            case type.string:
                            case type.guid:
                                actionParams[name] = params[name];
                                break;
                            case type.boolean:
                                actionParams[name] = (params[name].toLowerCase() === "true");
                                break;
                            case type.integer:
                                actionParams[name] = parseInt(params[name]);
                                break;
                            default:
                                MS.Entertainment.UI.DeepLink.assert(false, "Should not get here!");
                                return false
                        }
                    action.parameter = actionParams;
                    action.execute();
                    return true
                }
        })(), processProtocol: function processProtocol(url, dataPoint, arguments) {
            var decodedUrl = decodeURI(url);
            var match = /^[a-zA-Z]+:\/\/([a-zA-Z]+)\/\?(.*)$/g.exec(decodedUrl);
            if (!match && arguments) {
                match = arguments.split("?");
                if (match)
                    match.unshift("")
            }
            if (!match || !match[1])
                return false;
            var command = match[1];
            var isValid = true;
            var params = {};
            if (match[2]) {
                var nameValuePairs = match[2].split("&");
                for (var i = 0; i < nameValuePairs.length; i++) {
                    var nameValuePair = nameValuePairs[i];
                    match = /([_a-zA-Z][_a-zA-Z0-9]*)=(.*)$/g.exec(nameValuePair);
                    if (match && match[1] && match[2] && !params[match[1]])
                        if (dataPoint && match[1] === "source")
                            dataPoint.appendParameter("DeeplinkSource", match[2]);
                        else
                            params[match[1]] = match[2];
                    else {
                        isValid = false;
                        break
                    }
                }
            }
            if (isValid)
                isValid = this.processDeepLink(command, params);
            var eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell;
            if (isValid)
                eventProvider.traceDeepLink_Protocol_Invoked(url);
            else
                eventProvider.traceDeepLink_Protocol_Failed(url);
            return isValid
        }, processTile: function processTile(tileArgs) {
            if (typeof tileArgs.command !== "string")
                return false;
            var command = tileArgs.command;
            var params = {};
            for (var name in tileArgs)
                if (name !== "command" && typeof tileArgs[name] === "string")
                    params[name] = tileArgs[name];
            var isValid = this.processDeepLink(command, params);
            var argumentsAsText = "command=" + command;
            for (name in params)
                argumentsAsText = argumentsAsText + ", " + name + "=" + params[name];
            var eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell;
            if (isValid)
                eventProvider.traceDeepLink_Tile_Invoked(argumentsAsText);
            else
                eventProvider.traceDeepLink_Tile_Failed(argumentsAsText);
            return isValid
        }
});
MS.Entertainment.UI.DeepLink.registerDeepLinksFactory(Microsoft.Entertainment.Application.AppMode.music, function() {
    var type = MS.Entertainment.UI.DeepLink.ParamType;
    return {
            location: {
                actionId: MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkLocation, params: {
                        id: {
                            type: type.identifier, required: true, values: [MS.Entertainment.UI.Monikers.homeHub, MS.Entertainment.UI.Monikers.musicMarketplaceFeatured, ]
                        }, gamerTag: {
                                type: type.string, required: false
                            }
                    }
            }, details: {
                    actionId: MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkDetails, params: {
                            id: {
                                type: type.guid, required: true
                            }, dialogOnly: {
                                    type: type.boolean, required: false
                                }, desiredMediaItemType: {
                                    type: type.identifier, required: false, values: [MS.Entertainment.Data.Query.edsMediaType.album, MS.Entertainment.Data.Query.edsMediaType.musicArtist, MS.Entertainment.Data.Query.edsMediaType.track], caseInsensitive: true
                                }, idType: {
                                    type: type.identifier, required: false, values: [MS.Entertainment.Data.Query.edsIdType.canonical, MS.Entertainment.Data.Query.edsIdType.zuneCatalog, ], caseInsensitive: true
                                }
                        }
                }, play: {
                    actionId: MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkPlay, params: {
                            id: {
                                type: type.guid, required: true
                            }, startIndex: {
                                    type: type.integer, required: false
                                }, desiredMediaItemType: {
                                    type: type.identifier, required: false, values: [MS.Entertainment.Data.Query.edsMediaType.album, MS.Entertainment.Data.Query.edsMediaType.musicArtist, MS.Entertainment.Data.Query.edsMediaType.track], caseInsensitive: true
                                }, idType: {
                                    type: type.identifier, required: false, values: [MS.Entertainment.Data.Query.edsIdType.canonical, MS.Entertainment.Data.Query.edsIdType.zuneCatalog, ], caseInsensitive: true
                                }, gamerTag: {
                                    type: type.string, required: false
                                }
                        }
                }
        }
});
MS.Entertainment.UI.DeepLink.registerDeepLinksFactory(Microsoft.Entertainment.Application.AppMode.music2, function() {
    var type = MS.Entertainment.UI.DeepLink.ParamType;
    return {
            location: {
                actionId: MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkLocation, params: {
                        id: {
                            type: type.identifier, required: true, values: [MS.Entertainment.UI.Monikers.homeHub, MS.Entertainment.UI.Monikers.musicMarketplaceFeatured, ]
                        }, gamerTag: {
                                type: type.string, required: false
                            }
                    }
            }, details: {
                    actionId: MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkDetails, params: {
                            id: {
                                type: type.guid, required: true
                            }, desiredMediaItemType: {
                                    type: type.identifier, required: false, values: [MS.Entertainment.Data.Query.edsMediaType.album, MS.Entertainment.Data.Query.edsMediaType.musicArtist, MS.Entertainment.Data.Query.edsMediaType.track], caseInsensitive: true
                                }, idType: {
                                    type: type.identifier, required: false, values: [MS.Entertainment.Data.Query.edsIdType.canonical, MS.Entertainment.Data.Query.edsIdType.zuneCatalog, ], caseInsensitive: true
                                }
                        }
                }, play: {
                    actionId: MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkPlay, params: {
                            id: {
                                type: type.guid, required: true
                            }, startIndex: {
                                    type: type.integer, required: false
                                }, desiredMediaItemType: {
                                    type: type.identifier, required: false, values: [MS.Entertainment.Data.Query.edsMediaType.album, MS.Entertainment.Data.Query.edsMediaType.musicArtist, MS.Entertainment.Data.Query.edsMediaType.track], caseInsensitive: true
                                }, idType: {
                                    type: type.identifier, required: false, values: [MS.Entertainment.Data.Query.edsIdType.canonical, MS.Entertainment.Data.Query.edsIdType.zuneCatalog, ], caseInsensitive: true
                                }, gamerTag: {
                                    type: type.string, required: false
                                }
                        }
                }
        }
});
MS.Entertainment.UI.DeepLink.registerDeepLinksFactory(Microsoft.Entertainment.Application.AppMode.video, function() {
    var type = MS.Entertainment.UI.DeepLink.ParamType;
    return {
            location: {
                actionId: MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkLocation, params: {
                        id: {
                            type: type.identifier, required: true, values: [MS.Entertainment.UI.Monikers.homeHub, MS.Entertainment.UI.Monikers.movieMarketplaceFeatured, MS.Entertainment.UI.Monikers.movieMarketplaceNewReleases, MS.Entertainment.UI.Monikers.tvMarketplaceFeatured, MS.Entertainment.UI.Monikers.tvMarketplaceNewReleases, ]
                        }, gamerTag: {
                                type: type.string, required: false
                            }
                    }
            }, details: {
                    actionId: MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkDetails, params: {
                            id: {
                                type: type.guid, required: true
                            }, autoPlayPreview: {
                                    type: type.boolean, required: false
                                }, autoPlay: {
                                    type: type.boolean, required: false
                                }, startPositionMsec: {
                                    type: type.integer, required: false
                                }, desiredMediaItemType: {
                                    type: type.identifier, required: false, values: [MS.Entertainment.Data.Query.edsMediaType.movie, MS.Entertainment.Data.Query.edsMediaType.tvSeries, MS.Entertainment.Data.Query.edsMediaType.tvSeason, MS.Entertainment.Data.Query.edsMediaType.tvEpisode, ], caseInsensitive: true
                                }, idType: {
                                    type: type.identifier, required: false, values: [MS.Entertainment.Data.Query.edsIdType.canonical, MS.Entertainment.Data.Query.edsIdType.zuneCatalog, ], caseInsensitive: true
                                }
                        }
                }, play: {
                    actionId: MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkPlay, params: {
                            id: {
                                type: type.guid, required: true
                            }, startPositionMsec: {
                                    type: type.integer, required: false
                                }, gamerTag: {
                                    type: type.string, required: false
                                }
                        }
                }
        }
});
MS.Entertainment.UI.DeepLink.registerDeepLinksFactory(Microsoft.Entertainment.Application.AppMode.video2, function() {
    var type = MS.Entertainment.UI.DeepLink.ParamType;
    return {
            location: {
                actionId: MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkLocation, params: {
                        id: {
                            type: type.identifier, required: true, values: [MS.Entertainment.UI.Monikers.homeHub, MS.Entertainment.UI.Monikers.movieMarketplaceFeatured, MS.Entertainment.UI.Monikers.movieMarketplaceNewReleases, MS.Entertainment.UI.Monikers.tvMarketplaceFeatured, MS.Entertainment.UI.Monikers.tvMarketplaceNewReleases, ]
                        }, gamerTag: {
                                type: type.string, required: false
                            }
                    }
            }, details: {
                    actionId: MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkDetails, params: {
                            id: {
                                type: type.guid, required: true
                            }, autoPlayPreview: {
                                    type: type.boolean, required: false
                                }, autoPlay: {
                                    type: type.boolean, required: false
                                }, startPositionMsec: {
                                    type: type.integer, required: false
                                }, desiredMediaItemType: {
                                    type: type.identifier, required: false, values: [MS.Entertainment.Data.Query.edsMediaType.movie, MS.Entertainment.Data.Query.edsMediaType.tvSeries, MS.Entertainment.Data.Query.edsMediaType.tvSeason, MS.Entertainment.Data.Query.edsMediaType.tvEpisode, ], caseInsensitive: true
                                }, idType: {
                                    type: type.identifier, required: false, values: [MS.Entertainment.Data.Query.edsIdType.canonical, MS.Entertainment.Data.Query.edsIdType.zuneCatalog, ], caseInsensitive: true
                                }
                        }
                }, play: {
                    actionId: MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkPlay, params: {
                            id: {
                                type: type.guid, required: true
                            }, startPositionMsec: {
                                    type: type.integer, required: false
                                }, gamerTag: {
                                    type: type.string, required: false
                                }
                        }
                }
        }
});
MS.Entertainment.UI.DeepLink.registerDeepLinksFactory(Microsoft.Entertainment.Application.AppMode.games, function() {
    var type = MS.Entertainment.UI.DeepLink.ParamType;
    return {
            location: {
                actionId: MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkLocation, params: {
                        id: {
                            type: type.identifier, required: true, values: [MS.Entertainment.UI.Monikers.homeHub]
                        }, gamerTag: {
                                type: type.string, required: false
                            }
                    }
            }, details: {
                    actionId: MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkDetails, params: {
                            id: {
                                type: type.guid, required: false
                            }, titleId: {
                                    type: type.integer, required: false
                                }, platformType: {
                                    type: type.string, required: false
                                }
                        }
                }, purchase: {
                    actionId: MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkPurchasePDLC, params: {
                            offerId: {
                                type: type.guid, required: true
                            }, titleId: {
                                    type: type.integer, required: true
                                }, returnUri: {
                                    type: type.string, required: true
                                }, source: {
                                    type: type.string, required: false
                                }, gamerTag: {
                                    type: type.string, required: true
                                }
                        }
                }, newmessage: {
                    actionId: MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkInbox, params: {messageID: {
                                type: type.integer, required: false
                            }}
                }
        }
});
MS.Entertainment.UI.DeepLink.registerDeepLinksFactory(Microsoft.Entertainment.Application.AppMode.companion, function() {
    var type = MS.Entertainment.UI.DeepLink.ParamType;
    return {
            location: {
                actionId: MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkLocation, params: {id: {
                            type: type.identifier, required: true, values: [MS.Entertainment.UI.Monikers.homeHub]
                        }}
            }, launchTitle: {
                    actionId: MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkLaunchTitle, params: {
                            titleId: {
                                type: type.string, required: true
                            }, mediaType: {
                                    type: type.integer, required: true
                                }, serviceId: {
                                    type: type.guid, required: false
                                }, serviceIdType: {
                                    type: type.string, required: false
                                }, startPositionMsec: {
                                    type: type.integer, required: false
                                }, firstAction: {
                                    type: type.string, required: false
                                }, deepLinkInfo: {
                                    type: type.string, required: false
                                }, gamerTag: {
                                    type: type.string, required: false
                                }
                        }
                }
        }
})
