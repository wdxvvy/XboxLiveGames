/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/data/query.js", "/Framework/uriFactory.js", "/Framework/data/Augmenters/commonAugmenters.js");
(function() {
    var MSE = WinJS.Namespace.define("MS.Entertainment", null);
    var VER_CLIENTTYPE_STR = "PC/Windows";
    var BROWSE_CHUNK_SIZE = 50;
    var BROWSE_TOP_CHUNK_SIZE = 100;
    var SEARCH_CHUNK_SIZE = 20;
    var EXTRAS_CHUNK_SIZE = 30;
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {errorCodeWrapperQuery: MSE.derive(MSE.Data.ServiceWrapperQuery, function errorCodeWrapperQuery(errorCode) {
            this.base();
            if (errorCode < 0)
                errorCode += 0xFFFFFFFF + 1;
            var languageName = MS.Entertainment.Utilities.getResourceLanguage();
            this.postData = {
                contentType: MSE.Data.Query.errorCodeWrapperQuery.contentType, data: MSE.Data.Query.errorCodeWrapperQuery.postDataFormat.format(errorCode.toString(16), languageName)
            };
            this.requestType = MS.Entertainment.Data.ServiceWrapperQuery.RequestTypes.post
        }, {
            createResourceURI: function() {
                return MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_XboxSupport) + "/Services/ErrorCodeLookupService.asmx"
            }, headers: {SOAPAction: "\"ErrorCodeLookup/LookupFullParam\""}, useCache: false, resultAugmentation: MS.Entertainment.Data.Augmenter.Common.ErrorCode
        }, {
            postDataFormat: "<?xml version=\"1.0\" encoding=\"utf-8\"?><soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\"><soap:Body><LookupFullParam xmlns=\"ErrorCodeLookup\"><errorCode>{0}</errorCode><searchMode>ExactOnly</searchMode><locale>{1}</locale></LookupFullParam></soap:Body></soap:Envelope>", contentType: "text/xml; charset=utf-8"
        })});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {
        marketplaceOrderBy: {
            downloadRank: "downloadRank", none: "", playRank: "playRank", releaseDate: "releaseDate", rentalRank: "rentalRank", salesRank: "salesRank", title: "title"
        }, marketplaceWrapperQuery: MSE.derive(MSE.Data.ServiceWrapperQuery, null, {
                getResourceEndpoint: function() {
                    return MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_RootCatalog)
                }, createParameters: function createParameters() {
                        var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        if (configurationManager.service.enableTimeTravel)
                            return {instant: (new Microsoft.Entertainment.Configuration.ConfigurationManager).service.timeTravelStartDate};
                        else
                            return null
                    }
            }, {
                entriesPluralizer: "entry", rightsPluralizer: "rights/right", closedCaptionPluralizer: "closedCaptionFiles/closedCaptionFile", clientTypesPluralizer: "clientTypes/clientType", genresPluralizer: "genres/genre", peerGenresPluralizer: "peerGenres/genre", subGenresPluralizer: "subGenres/genre", categoriesPluralizer: "categories/category", imagesPluralizer: "entry/instances/imageInstance", editorialItemsPluralizer: "editorialItems/editorialItem", featuresPluralizer: "features/feature", albumsPluralizer: "albums/album", paymentTypesPluralizer: "paymentTypes/paymentType"
            })
    });
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {asxQuery: MSE.derive(MSE.Data.ServiceWrapperQuery, null, {
            createResourceURI: function() {
                return this.asxUrl
            }, asxUrl: null, pluralizers: ["entry", "ref"], forceLowercaseJsonProperties: true
        }, {})})
})()
