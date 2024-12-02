/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    WinJS.Namespace.define("MS.Entertainment.UI.Application", {updatePage: function updatePage() {
            updateAppTitle.textContent = WinJS.Resources.getString('33574').value;
            updateAppDescription.textContent = WinJS.Resources.getString('33575').value;
            launchStoreLink.textContent = WinJS.Resources.getString('33576').value;
            var launchInfo = "ms-windows-store:Updates";
            launchStoreLink.href = launchInfo
        }})
})()
