/* Copyright (C) Microsoft Corporation. All rights reserved. */
function individualize() {
    try {
        if (Microsoft.Media !== undefined && Microsoft.Media.PlayReadyClient !== undefined) {
            var individualizationRequest = new Microsoft.Media.PlayReadyClient.PlayReadyIndividualizationServiceRequest;
            individualizationRequest.beginServiceRequest().then(function individualizationRequest_success() {
                postMessage(true)
            }, function individualizationRequest_failure() {
                postMessage(false)
            })
        }
    }
    catch(ex) {
        postMessage(false)
    }
}
try {
    var securityVersion;
    if (Microsoft && Microsoft.Media && Microsoft.Media.PlayReadyClient && Microsoft.Media.PlayReadyClient.PlayReadyStatics)
        securityVersion = Microsoft.Media.PlayReadyClient.PlayReadyStatics.playReadySecurityVersion;
    postMessage(true)
}
catch(ex) {
    individualize()
}
