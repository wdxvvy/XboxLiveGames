/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Framework/corefx.js", "/Framework/debug.js", "/Framework/Utilities.js", "/Controls/listControls.js");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {AchievementsControl: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.BaseImmersiveSummary, "/Components/Immersive/Games/Achievements.html#ImmersiveAchievements", function achievementsControlConstructor(element, options){}, {
            _achievementsInView: 8, initialize: function initialize() {
                    var data = this.dataContext.achievementsDataSource;
                    var numberFormatter;
                    data.toArray().then(function dataArray(array) {
                        this.achievements = array.slice(0, this._achievementsInView)
                    }.bind(this));
                    var activity = this.dataContext.activity;
                    if (activity) {
                        var totalGamerscore = 0;
                        if (activity.primaryUserActivity && activity.primaryUserActivity.totalGamerscore)
                            totalGamerscore = activity.primaryUserActivity.totalGamerscore;
                        else if (activity.secondaryUserActivity && activity.secondaryUserActivity.totalGamerscore)
                            totalGamerscore = activity.secondaryUserActivity.totalGamerscore;
                        numberFormatter = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber;
                        if (activity.primaryUserActivity.percentageProgress) {
                            var currentPrimaryAchievements = numberFormatter.format(activity.primaryUserActivity.currentAchievements);
                            var totalPrimaryAchievements = numberFormatter.format(activity.primaryUserActivity.totalAchievements);
                            this.primaryProgress = activity.primaryUserActivity.percentageProgressString;
                            this.primaryPercentage = activity.primaryUserActivity.percentageProgress;
                            this.primaryPercentageNumber = activity.primaryUserActivity.percentageProgressNumber;
                            this.primaryGamerscoreProgressString = activity.primaryUserActivity.gamerScoreProgress
                        }
                        else {
                            this.primaryProgress = this._zeroProgress();
                            this.primaryPercentage = this._zeroPercent();
                            this.primaryGamerscoreProgressString = this._zeroGamerscore(totalGamerscore)
                        }
                        if (this.dataContext.showSecondary) {
                            this.showSecondary = true;
                            this.arcStrokeThickness = 24;
                            this.secondaryHeader = String.load(String.id.IDS_DETAILS_GAME_ACHIEVEMENTS_OTHER_PROG).format(this.dataContext.model.secondaryProfile.gamertag);
                            if (activity.secondaryUserActivity.percentageProgress) {
                                var currentSecondaryAchievements = numberFormatter.format(activity.secondaryUserActivity.currentAchievements);
                                var totalSecondaryAchievements = numberFormatter.format(activity.secondaryUserActivity.totalAchievements);
                                this.secondaryProgress = activity.secondaryUserActivity.percentageProgressString;
                                this.secondaryPercentage = activity.secondaryUserActivity.percentageProgress;
                                this.secondaryPercentageNumber = activity.secondaryUserActivity.percentageProgressNumber;
                                this.secondaryGamerscoreProgressString = activity.secondaryUserActivity.gamerScoreProgress
                            }
                            else {
                                this.secondaryProgress = this._zeroProgress();
                                this.secondaryPercentage = this._zeroPercent();
                                this.secondaryGamerscoreProgressString = this._zeroGamerscore(totalGamerscore)
                            }
                            var userModel = this.dataContext.model.secondaryUserModel;
                            if (!userModel)
                                userModel = MS.Entertainment.Social.Helpers.createUserModel(this.dataContext.model.secondaryUserXuid, this.dataContext.model.secondaryUserGamerTag);
                            var userXuid = this.dataContext.model.secondaryUserXuid;
                            if (!userXuid && userModel)
                                userXuid = MS.Entertainment.Social.Helpers.getXuidFromUserModel(userModel);
                            this.secondaryAction = MS.Entertainment.Social.Actions.createButtonAction(MS.Entertainment.UI.Actions.ActionIdentifiers.navigate, String.empty, {
                                page: "socialProfile", args: {
                                        userXuid: userXuid, userModel: userModel
                                    }
                            });
                            this.secondaryAction.canExecute = function socialProfileCanExecute() {
                                return MS.Entertainment.Utilities.isGamesApp
                            }
                        }
                        else
                            this.showPrimary = true
                    }
                    else {
                        this.showPrimary = true;
                        this.primaryProgress = this._zeroProgress();
                        this.primaryPercentage = this._zeroPercent();
                        this.primaryGamerscoreProgressString = this._zeroGamerscore()
                    }
                }, _zeroProgress: function _zeroProgress() {
                    return String.load(String.id.IDS_DETAILS_GAME_ACHIEVEMENTS_EARNED).format(0, this.dataContext.achievementsDataSource.count)
                }, _zeroPercent: function _zeroPercent() {
                    return String.load(String.id.IDS_SOCIAL_GAME_PERCENTAGE).format(0)
                }, _zeroGamerscore: function _zeroPercent(totalGamerscore) {
                    if (!totalGamerscore)
                        return String.empty;
                    else
                        return String.load(String.id.IDS_SOCIAL_GAMER_SCORE_PROGRESS).format(0, totalGamerscore)
                }
        }, {
            primaryProgress: String.empty, primaryPercentage: String.empty, primaryPercentageNumber: 0.0001, primaryGamerscoreProgressString: String.empty, secondaryHeader: String.empty, secondaryProgress: String.empty, secondaryPercentage: String.empty, secondaryPercentageNumber: 0.0001, secondaryGamerscoreProgressString: String.empty, achievements: null, showPrimary: false, showSecondary: false, secondaryAction: null, arcStrokeThickness: 42
        })})
})()
