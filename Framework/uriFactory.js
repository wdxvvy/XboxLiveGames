/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/endpoints.js", "/Framework/utilities.js");
(function() {
    WinJS.Namespace.define("MS.Entertainment.Utilities", {UriFactory: WinJS.Class.define(function uriFactory() {
            throw new Error("UriFactory is a static class");
        }, {}, {
            create: function create(endpointId, suffixes, queryArguments) {
                if (!endpointId)
                    throw new Error("No endpoint was supplied");
                var separator = "/";
                var uri = String.isString(endpointId) ? endpointId : MS.Entertainment.Endpoint.load(endpointId);
                if (Array.isArray(suffixes))
                    suffixes.forEach(function(uriComponent) {
                        uri = uri + separator + window.encodeURIComponent(uriComponent)
                    });
                else if (suffixes)
                    uri = uri + separator + window.encodeURI(suffixes);
                return MS.Entertainment.Utilities.UriFactory.appendQuery(uri, queryArguments)
            }, appendQuery: function appendQuery(uri, queryArguments) {
                    if (!uri)
                        throw new Error("No uri was supplied");
                    if (queryArguments) {
                        var key;
                        var separator = uri.indexOf("?") >= 0 ? "&" : "?";
                        for (key in queryArguments)
                            if (queryArguments.hasOwnProperty(key)) {
                                uri = uri + separator + window.encodeURIComponent(key) + "=" + window.encodeURIComponent(queryArguments[key]);
                                separator = "&"
                            }
                    }
                    return uri
                }
        })})
})()
