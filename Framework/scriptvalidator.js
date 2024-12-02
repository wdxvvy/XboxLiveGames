/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    var baseLength = (window.location.protocol + "//" + window.location.host).length;
    var isInUnitTest = (window.location.pathname === "/bootstrap.html");
    var existingScripts = [];
    var skipValidation = true;
    function getCurrentScripts() {
        if (skipValidation)
            return [];
        var scripts = [];
        Array.prototype.forEach.call(document.scripts, function(existingScript) {
            if (!existingScript.src)
                return;
            scripts.push(existingScript.src.substr(baseLength).toLowerCase())
        });
        return scripts
    }
    var scriptValidator = function scriptValidator(files) {
            if (isInUnitTest || skipValidation)
                return;
            var scriptsToCheck = Array.prototype.map.call(arguments, function(item) {
                    return item.toLowerCase()
                });
            scriptsToCheck.forEach(function(path) {
                var isAbsolute = (path.charAt(0) === "/");
                if (!isAbsolute)
                    fail("File: " + path + " was not an absolute path");
                validateScriptIncluded(path, existingScripts);
                if (existingScripts.indexOf(path) < 0)
                    existingScripts.push(path)
            });
            existingScripts.push(document.scripts[document.scripts.length - 1].src.substr(baseLength).toLowerCase())
        };
    Object.defineProperty(window, "scriptValidator", {
        value: scriptValidator, writable: false, enumerable: true, configurable: false
    });
    window.scriptValidator.getUnreferencedScripts = function getUnreferencedScripts() {
        var unreferencedScripts = [];
        getCurrentScripts().forEach(function(item) {
            if (existingScripts.indexOf(item) < 0)
                unreferencedScripts.push(item)
        });
        return unreferencedScripts
    };
    function validateScriptIncluded(script, currentScripts) {
        var foundAt = currentScripts.indexOf(script);
        if (foundAt < 0) {
            fail("Script: " + script + " was not found in the script tags");
            return
        }
    }
    function fail(message) {
        if (MS && MS.Entertainment && MS.Entertainment.assert)
            MS.Entertainment.assert(false, message);
        else {
            alert(message);
            debugger
        }
    }
})()
