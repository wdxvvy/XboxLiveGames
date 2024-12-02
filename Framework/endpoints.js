/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
WinJS.Namespace.define("MS.Entertainment", {Endpoint: {
        id: Microsoft.Entertainment.Util.Endpoints.EndpointId, load: function load(endpointId) {
                var endpointManager = new Microsoft.Entertainment.Util.EndpointManager;
                return endpointManager.getEndpointUri(endpointId)
            }
    }})
