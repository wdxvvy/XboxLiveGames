/* Copyright (C) Microsoft Corporation. All rights reserved. */
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {GamesEngageIconButton: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.IconButtonTwoLine, "Controls/Games/GamesEngageIconButton.html#gamesEngageIconButtonTemplate", null, {
        _celebrationBindings: null, _animationPromise: null, initialize: function initialize() {
                MS.Entertainment.UI.Controls.IconButtonTwoLine.prototype.initialize.call(this);
                this._celebrationBindings = WinJS.Binding.bind(this, {
                    subIcon: this._subIconChanged.bind(this), count: this._countChanged.bind(this), celebration: this._celebrationChanged.bind(this)
                })
            }, unload: function unload() {
                if (this._celebrationBindings) {
                    this._celebrationBindings.cancel();
                    this._celebrationBindings = null
                }
                MS.Entertainment.UI.Controls.IconButtonTwoLine.prototype.unload.call(this)
            }, _subIconChanged: function _subIconChanged() {
                if (this.subIcon)
                    this.linkSubIcon.textContent = this.subIcon
            }, _celebrationChanged: function _celebrationChanged() {
                if (this.celebration && this.celebration.title)
                    this._animationPromise = WinJS.Promise.join([this._animationPromise, WinJS.Promise.timeout(this.timeout / 2)]).then(function animateIn() {
                        if (this.celebration && this.celebration.title && this.celebrationLabel && this.celebrationSubLabel) {
                            this.celebrationLabel.textContent = this.celebration.title;
                            this.celebrationSubLabel.textContent = this.celebration.subTitle
                        }
                        var animateTile = WinJS.UI.Animation.createPeekAnimation([this.celebrationTextContainer, this.gamesEngageIconContainer]);
                        return animateTile.execute().then(function animationComplete() {
                                if (this.celebrationTextContainer && this.gamesEngageIconContainer) {
                                    WinJS.Utilities.toggleClass(this.celebrationTextContainer, "animateCelebrationText");
                                    WinJS.Utilities.toggleClass(this.gamesEngageIconContainer, "animategamesEngageIconContainer");
                                    return WinJS.Promise.timeout(this.timeout / 2).then(function animateOut() {
                                            this._animationPromise = null;
                                            if (this.celebrationTextContainer && this.gamesEngageIconContainer) {
                                                WinJS.Utilities.toggleClass(this.celebrationTextContainer, "animateCelebrationText");
                                                WinJS.Utilities.toggleClass(this.gamesEngageIconContainer, "animategamesEngageIconContainer")
                                            }
                                        }.bind(this))
                                }
                                else
                                    this._animationPromise = null
                            }.bind(this))
                    }.bind(this))
            }, _countChanged: function _countChanged() {
                this.countSpan.textContent = this.count || String.empty
            }
    }, {
        subIcon: null, celebration: null, count: 0, timeout: 0
    })})
