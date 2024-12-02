/* Copyright (C) Microsoft Corporation. All rights reserved. */
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Media");
(function() {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Hydrator");
    WinJS.Namespace.define("MS.Entertainment.Hydrator", {
        prepareDetailsQuery: function prepareDetailsQuery(query, queryWatcher, hydrating) {
            if (query) {
                if (hydrating.hasCanonicalId) {
                    query.id = hydrating.canonicalId;
                    query.idType = MS.Entertainment.Data.Query.edsIdType.canonical
                }
                else {
                    query.id = hydrating.serviceId;
                    query.idType = hydrating.serviceIdType
                }
                query.impressionGuid = hydrating.impressionGuid;
                if (queryWatcher)
                    queryWatcher.registerQuery(query)
            }
            return query
        }, sanitizeIds: function sanitizeIds(data, hydrating) {
                var result = data;
                if (data) {
                    if (MS.Entertainment.Utilities.isValidLibraryId(hydrating.libraryId))
                        data.libraryId = hydrating.libraryId;
                    result = MS.Entertainment.ViewModels.MediaItemModel.getLibraryIdAsync(data).then(function gotLibraryId(libraryId) {
                        data.libraryId = libraryId;
                        if (!MS.Entertainment.Utilities.isEmptyGuid(hydrating.zuneId) || MS.Entertainment.Utilities.isEmptyGuid(data.zuneId))
                            data.zuneId = null;
                        if (MS.Entertainment.Utilities.isEmptyGuid(data.canonicalId))
                            data.canonicalId = null;
                        if (MS.Entertainment.Utilities.isEmptyGuid(data.serviceId)) {
                            data.serviceId = null;
                            data.serviceIdType = null
                        }
                    }, function ignoreError(){}).then(function finallyBlock() {
                        return data
                    })
                }
                return WinJS.Promise.as(result)
            }
    })
})()
