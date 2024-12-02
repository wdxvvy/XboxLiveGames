/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function(undefined) {
    WinJS.Namespace.define("MS.Entertainment.Data.Query.Properties", {
        achievementSort: {
            undefined: "undefined", game: "game", achievedDate: Microsoft && Microsoft.Xbox && Microsoft.Xbox.AchievementSortType && Microsoft.Xbox.AchievementSortType.timeUnlocked
        }, achievementFilter: {
                undefined: "undefined", unachieved: "unachieved"
            }, userMessageSort: {
                none: "none", gameTitle: "gameTitle", gamerTag: "gamerTag", date: "date"
            }, userMessageComparer: {
                none: function noneComparer(a, b) {
                    if (a && a.message)
                        return -1;
                    else if (b && b.message)
                        return 1;
                    return NaN
                }, gameTitle: function gameComparer(a, b) {
                        if (a && a.message && b && b.message) {
                            var compare = a.game.Name.toLocaleLowerCase().localeCompare(b.game.Name.toLocaleLowerCase());
                            if (compare === 0)
                                compare = b.message.sent.getTime() - a.message.sent.getTime();
                            return compare
                        }
                        return MS.Entertainment.Data.Query.Properties.userMessageComparer.none(a, b)
                    }, gamerTag: function gamerTagComparer(a, b) {
                        if (a && a.message && b && b.message) {
                            if (a.message.senderGamertag.toLowerCase() < b.message.senderGamertag.toLowerCase())
                                return -1;
                            else if (a.message.senderGamertag.toLowerCase() > b.message.senderGamertag.toLowerCase())
                                return 1;
                            return 0
                        }
                        return MS.Entertainment.Data.Query.Properties.userMessageComparer.none(a, b)
                    }, date: function dateComparer(a, b) {
                        if (a && a.message && b && b.message)
                            return b.message.sent.getTime() - a.message.sent.getTime();
                        return MS.Entertainment.Data.Query.Properties.userMessageComparer.none(a, b)
                    }
            }
    })
})()
