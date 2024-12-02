/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/utilities.js", "/Framework/data/augmenters/commonAugmenters.js", "/ViewModels/social/shareFactory.js");
(function(undefined) {
    WinJS.Namespace.define("MS.Entertainment.Social", {ShareTemplates: (function() {
            var shareTemplates;
            return {get: function() {
                        if (!shareTemplates)
                            shareTemplates = {
                                game: "<div style='float: left; font-family: \"Segoe UI\", \"Meiryo UI\", \"Microsoft JhengHei UI\", \"Malgun Gothic\", \"Microsoft YaHei UI\"; font-size: 15px; color: #666666; width: 400px; background-color: #ffffff;'>" + "    <div style='float: left; width: 100px; margin-right: 30px;'>" + "       <a href='{0}'><img style='margin: 20px 0px 0px 20px; max-width: 63px; border-style: none;' src='{1}'/></a>" + "       <img style='margin: 15px 0px 20px 10px;' src='http://nxeassets.xbox.com/shaxam/0201/50/2d/502d88f0-6e6e-4e20-8d0b-d24609536e1f.PNG?v=1#game_shadow.PNG' />" + "    </div>" + "    <div style='float: left; vertical-align: top; width: 250px; margin: 20px 20px 20px 0px;'>" + "       <div style='font-family: \"Segoe UI Light\"; font-size: 24px; color: #333333; margin-bottom: 15px;'>{3}</div>" + "       <div style='max-height: 80px; overflow: hidden;'>{4}</div><br/>" + "       <div>{2}</div>" + "    </div>" + "</div>", achievement: "<div style='background-color: #ffffff; float: left; font-family: \"Segoe UI\", \"Meiryo UI\", \"Microsoft JhengHei UI\", \"Malgun Gothic\", \"Microsoft YaHei UI\"; font-size: 15px; color: #666666; width: 400px;'>" + "   <div style='float: left; width: 100px; margin-right: 30px;'>" + "       <a href='{0}'><img style='margin: 20px 0px 0px 20px; max-width: 63px; border-style: none;' src='{1}'/></a>" + "       <img style='margin: 15px 0px 20px 10px;' src='http://nxeassets.xbox.com/shaxam/0201/50/2d/502d88f0-6e6e-4e20-8d0b-d24609536e1f.PNG?v=1#game_shadow.PNG' />" + "   </div>" + "   <div style='float: left; width: 250px; margin: 20px 20px 20px 0px;'>" + "       <div style='float: left; font-family: \"Segoe UI Light\"; font-size: 24px; color: #333333; line-height: 24px;'>{6}</div>" + "       <div style='float: left; vertical-align: top; margin-top: 12px;'>" + "           <img style='float: left; vertical-align: top; margin: 0px 10px 0px 0px; width: 40px; height: 40px' src='{2}'/>" + "           <div style='float: left; width: 200px;'>" + "               <div style='color: #55C105; font-family: \"Segoe UI Semibold\"'>{4}</div>" + "               <div>{5}</div>" + "               <div>{3}</div>" + "           </div>" + "       </div>" + "   </div>" + "</div>", profile: "<div style='background-color: #ffffff; float: left; font-family: \"Segoe UI\",  \"Meiryo UI\", \"Microsoft JhengHei UI\", \"Malgun Gothic\", \"Microsoft YaHei UI\"; font-size: 15px; color: #666666; width: 400px;'>" + "   <div style='float: left; vertical-align: top; width: 135px; margin: 20px 0px 20px 30px; overflow: hidden; white-space: nowrap;'>" + "     <div style='font-family: \"Segoe UI Light\"; font-size: 24px; color: #333333;'>{4}</div>" + "     <div style='float: left; width: 135px; height: 50px;'>" + "       <div style='float: left;'>{5}</div>" + "       <img style='float: left;' src='http://nxeassets.xbox.com/shaxam/0201/10/88/10886c05-8267-48de-af96-aa7b763f1100.PNG?v=1#gamerscore.PNG'/>" + "     </div>" + "     <div>{6}</div>" + "     <div>{7}</div>" + "   </div>" + "   <div style='float: left; margin: 20px 10px 20px 20px; width: 100px; display: {8}'>" + "       <div style='background-color: rgb(51,51,51); color: #ffffff; padding: 6px;'>{3}</div>" + "       <div style='margin-left: 75px;'><img src='http://nxeassets.xbox.com/shaxam/0201/a5/dd/a5dde9b9-dc32-471c-b7a4-0d14caecf746.PNG?v=1#triangle.PNG' /></div>" + "   </div>" + "   <a href='{0}'><img style='float: left; border-style: none; max-height: 200px;' src='{1}'/></a>" + "   <div style='float: left; margin: 0px 0px 20px 20px;'>{2}</div>" + "</div>", leaderBoard: "<div style='background-color: #ffffff; float: left; font-family: \"Segoe UI\", \"Meiryo UI\", \"Microsoft JhengHei UI\", \"Malgun Gothic\", \"Microsoft YaHei UI\"; font-size: 15px; color: #666666; width: 400px'>" + "   <div style='float: left; margin: 20px 30px 20px 0px; width: 100px;'>" + "       <a href='{0}'><img style='max-width: 63px; margin-left: 20px; border-style: none;' src='{1}'/></a>" + "       <div style='margin: 15px 0px 0px 10px'>" + "       <img src='http://nxeassets.xbox.com/shaxam/0201/50/2d/502d88f0-6e6e-4e20-8d0b-d24609536e1f.PNG?v=1#game_shadow.PNG' />" + "       </div>" + "   </div>" + "   <div style='float: left; width: 250px; margin: 20px 20px 20px 0px;'>" + "       <div style='font-family: \"Segoe UI Light\"; font-size: 24px; color: #333333; line-height: 24px; margin-bottom: 8px;'>{3}</div>" + "       <div style='width: 100%;'>{4}</div>" + "       <div style='width: 100%'>{5}</div>" + "       <div>{2}</div>" + "   </div>" + "</div>", leaderBoardItem: "<div>" + "   <div style='display: inline-block; overflow: hidden; white-space: nowrap; width: 20px;'>{0}</div>" + "   <div style='display: inline-block; overflow: hidden; white-space: nowrap; width: 180px;'>{1}</div>" + "   <div style='display: inline-block; overflow: hidden; white-space: nowrap; margin-left: 3px;'>{2}</div>" + "</div>", leaderBoardSelectedItem: "<div style='background-color: #55C105; color: #ffffff;'>" + "   <div style='display: inline-block; overflow: hidden; white-space: nowrap; width: 20px;'>{0}</div>" + "   <div style='display: inline-block; overflow: hidden; white-space: nowrap; width: 180px; '>{1}</div>" + "   <div style='display: inline-block; overflow: hidden; white-space: nowrap; margin-left: 3px;'>{2}</div>" + "</div>", createWebLink: function createWebLink(uri, stringIdOverride) {
                                        var href = "<a style='color: #57B846; font-size: 15px;' href='{0}'>".format(uri);
                                        if (!!stringIdOverride)
                                            return String.load(stringIdOverride).format(href, "</a>");
                                        else
                                            return String.load(String.id.IDS_SHARE_MORE_XBOX_DOT_COM).format(href, "</a>")
                                    }
                            };
                        return shareTemplates
                    }}
        })()});
    WinJS.Namespace.define("MS.Entertainment.Social", {EncoderHelper: {
            encode: function(data, dataAugmentation, html, htmlLines, result) {
                if (dataAugmentation) {
                    var htmlArguments;
                    var augmentedData = MS.Entertainment.Data.augment(WinJS.Binding.unwrap(data), dataAugmentation);
                    result.emptyMessage = augmentedData.emptyMessage;
                    if (!MS.Entertainment.Utilities.isEmptyGuid(augmentedData.mediaId)) {
                        if (Array.isArray(augmentedData.title)) {
                            var newTitle;
                            for (var i = 0; i < augmentedData.title.length; i++)
                                if (augmentedData.title[i] !== "")
                                    if (newTitle)
                                        newTitle = String.load(String.id.IDS_COMMA_SEPARATOR).format(newTitle, augmentedData.title[i]);
                                    else
                                        newTitle = augmentedData.title[i];
                            result.package.title = newTitle || " "
                        }
                        else
                            result.package.title = augmentedData.title || " ";
                        if (Array.isArray(augmentedData.mediaTitle)) {
                            var newMediaTitle;
                            for (var i = 0; i < augmentedData.mediaTitle.length; i++)
                                if (augmentedData.mediaTitle[i] !== "")
                                    if (newMediaTitle)
                                        newMediaTitle = String.load(String.id.IDS_COMMA_SEPARATOR).format(newMediaTitle, augmentedData.mediaTitle[i]);
                                    else
                                        newMediaTitle = augmentedData.mediaTitle[i];
                            result.package.mediaTitle = newMediaTitle
                        }
                        else
                            result.package.mediaTitle = augmentedData.mediaTitle;
                        if (Array.isArray(augmentedData.text)) {
                            var newText;
                            for (var i = 0; i < augmentedData.text.length; i++)
                                if (augmentedData.text[i] !== "")
                                    if (newText)
                                        newText = String.load(String.id.IDS_COMMA_SEPARATOR).format(newText, augmentedData.text[i]);
                                    else
                                        newText = augmentedData.text[i];
                            result.package.text = newText
                        }
                        else
                            result.package.text = augmentedData.text;
                        result.package.description = augmentedData.description || " ";
                        result.package.uri = augmentedData.uri;
                        result.package.mediaType = augmentedData.mediaType;
                        result.package.mediaId = augmentedData.mediaId;
                        if (html) {
                            htmlArguments = [];
                            htmlArguments.push(augmentedData.uri);
                            if (augmentedData.htmlImages)
                                augmentedData.htmlImages.forEach(function(item) {
                                    htmlArguments.push(item)
                                });
                            if (augmentedData.htmlUri !== null && augmentedData.htmlUri !== undefined)
                                htmlArguments.push(MS.Entertainment.Social.ShareTemplates.createWebLink(augmentedData.htmlUri, augmentedData.htmlUriStringId));
                            if (augmentedData.htmlLines)
                                augmentedData.htmlLines.forEach(function(item) {
                                    htmlArguments.push(item || String.empty)
                                });
                            if (htmlLines)
                                htmlLines.forEach(function(item) {
                                    htmlArguments.push(item)
                                });
                            try {
                                result.package.html = html.format.apply(html, htmlArguments)
                            }
                            catch(error) {
                                result.package.html = String.empty
                            }
                        }
                    }
                }
            }, encodeLeaderBoardTable: function encodeLeaderBoardTable(leaderBoardData) {
                    var leadersArray,
                        rowHtml,
                        i,
                        item;
                    var tableHtml = String.empty;
                    if (leaderBoardData.leaders && leaderBoardData.userRow) {
                        if (Array.isArray(leaderBoardData.leaders))
                            leadersArray = leaderBoardData.leaders;
                        else
                            leaderBoardData.leaders.toArray().then(function(array) {
                                leadersArray = array
                            });
                        if (leadersArray)
                            for (i = leadersArray.length - 1; i >= 0; i--) {
                                item = leadersArray[i];
                                if (item.gamerTag === leaderBoardData.userRow.gamerTag)
                                    rowHtml = MS.Entertainment.Social.ShareTemplates.leaderBoardSelectedItem;
                                else
                                    rowHtml = MS.Entertainment.Social.ShareTemplates.leaderBoardItem;
                                tableHtml = rowHtml.format(item.rank, item.gamerTag, item.rating) + tableHtml
                            }
                    }
                    return tableHtml
                }
        }});
    var shareEncoderFactory = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.shareEncoder);
    shareEncoderFactory.register(function canEncode(data) {
        return data && (data.mediaType === Microsoft.Entertainment.Queries.ObjectType.game)
    }, function encode(data, result) {
        var dataAugmentation,
            html;
        if (data.mediaType && data.defaultPlatformType) {
            switch (data.defaultPlatformType) {
                case MS.Entertainment.Data.Augmenter.GamePlatform.Modern:
                    dataAugmentation = MS.Entertainment.Data.Augmenter.Marketplace.MetroGameSharePackage;
                    break;
                default:
                    dataAugmentation = MS.Entertainment.Data.Augmenter.Marketplace.GameSharePackage;
                    break
            }
            html = MS.Entertainment.Social.ShareTemplates.game
        }
        MS.Entertainment.Social.EncoderHelper.encode(data, dataAugmentation, html, null, result);
        return WinJS.Promise.as(result)
    });
    shareEncoderFactory.register(function canEncode(data) {
        return data && MS.Entertainment.Data.Augmenter.XboxLive && MS.Entertainment.Data.Augmenter.XboxLive.SocialDataType && (data.socialDataType === MS.Entertainment.Data.Augmenter.XboxLive.SocialDataType.profile || data.socialDataType === MS.Entertainment.Data.Augmenter.XboxLive.SocialDataType.achievement || data.socialDataType === MS.Entertainment.Data.Augmenter.XboxLive.SocialDataType.activity || data.socialDataType === MS.Entertainment.Data.Augmenter.XboxLive.SocialDataType.leaderBoard)
    }, function encode(data, result) {
        var dataAugmentation,
            html,
            additionalHtmlLines;
        switch (data.socialDataType) {
            case MS.Entertainment.Data.Augmenter.XboxLive.SocialDataType.profile:
                dataAugmentation = MS.Entertainment.Data.Augmenter.XboxLive.ProfileSharePackage;
                html = MS.Entertainment.Social.ShareTemplates.profile;
                break;
            case MS.Entertainment.Data.Augmenter.XboxLive.SocialDataType.achievement:
                dataAugmentation = MS.Entertainment.Data.Augmenter.XboxLive.AchievementSharePackage;
                html = MS.Entertainment.Social.ShareTemplates.achievement;
                break;
            case MS.Entertainment.Data.Augmenter.XboxLive.SocialDataType.activity:
                shareEncoderFactory.encode(data.media, result);
                break;
            case MS.Entertainment.Data.Augmenter.XboxLive.SocialDataType.leaderBoard:
                dataAugmentation = MS.Entertainment.Data.Augmenter.XboxLive.LeaderBoardSharePackage;
                html = MS.Entertainment.Social.ShareTemplates.leaderBoard;
                additionalHtmlLines = [MS.Entertainment.Social.EncoderHelper.encodeLeaderBoardTable(data)];
                break
        }
        MS.Entertainment.Social.EncoderHelper.encode(data, dataAugmentation, html, additionalHtmlLines, result);
        return WinJS.Promise.as(result)
    })
})()
