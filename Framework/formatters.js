/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/stringids.js", "/Framework/utilities.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Formatters");
WinJS.Namespace.define("MS.Entertainment.Formatters", {DateTimeFormatters: WinJS.Class.define(function dateTimeFormatters(){}, {
        _year: null, _abbreviatedMonthYear: null, _abbreviatedMonth: null, _dayMonthYear: null, _shortDate: null, _dayMonthYear: null, _decimalNumber: null, _groupedDecimalNumber: null, _percentNumber: null, year: {get: function() {
                    if (!this._year)
                        try {
                            this._year = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("year")
                        }
                        catch(e) {
                            var error = e && e.message;
                            MS.Entertainment.Formatters.fail("Could not instantiate new DateTimeFormatter(\"year\") object.  Error: " + error);
                            this._year = this._defaultFormatter
                        }
                    return this._year
                }}, abbreviatedMonthYear: {get: function() {
                    if (!this._abbreviatedMonthYear)
                        try {
                            this._abbreviatedMonthYear = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("month.abbreviated year")
                        }
                        catch(e) {
                            var error = e && e.message;
                            MS.Entertainment.Formatters.fail("Could not instantiate new DateTimeFormatter(\"month.abbreviated year\") object.  Error: " + error);
                            this._abbreviatedMonthYear = this._defaultFormatter
                        }
                    return this._abbreviatedMonthYear
                }}, abbreviatedMonth: {get: function() {
                    if (!this._abbreviatedMonth)
                        try {
                            this._abbreviatedMonth = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("month.abbreviated")
                        }
                        catch(e) {
                            var error = e && e.message;
                            MS.Entertainment.Formatters.fail("Could not instantiate new DateTimeFormatter(\"month.abbreviated\") object.  Error: " + error);
                            this._abbreviatedMonth = this._defaultFormatter
                        }
                    return this._abbreviatedMonth
                }}, shortDate: {get: function() {
                    if (!this._shortDate)
                        try {
                            this._shortDate = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("shortdate")
                        }
                        catch(e) {
                            var error = e && e.message;
                            MS.Entertainment.Formatters.fail("Could not instantiate new DateTimeFormatter(\"shortdate\") object.  Error: " + error);
                            this._shortDate = this._defaultFormatter
                        }
                    return this._shortDate
                }}, dayMonthYear: {get: function() {
                    if (!this._dayMonthYear)
                        try {
                            this._dayMonthYear = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("day month year")
                        }
                        catch(e) {
                            var error = e && e.message;
                            MS.Entertainment.Formatters.fail("Could not instantiate new DateTimeFormatter(\"day month year\") object.  Error: " + error);
                            this._dayMonthYear = this._defaultFormatter
                        }
                    return this._dayMonthYear
                }}, decimalNumber: {get: function() {
                    if (!this._decimalNumber) {
                        this._decimalNumber = new Windows.Globalization.NumberFormatting.DecimalFormatter;
                        this._decimalNumber.fractionDigits = 0;
                        this._decimalNumber.isGrouped = false;
                        this._decimalNumber.integerDigits = MS.Entertainment.Formatters.DateTimeFormatters.defaultDecimalDigits
                    }
                    return this._decimalNumber
                }}, groupedDecimalNumber: {get: function() {
                    if (!this._groupedDecimalNumber) {
                        this._groupedDecimalNumber = new Windows.Globalization.NumberFormatting.DecimalFormatter;
                        this._groupedDecimalNumber.fractionDigits = 0;
                        this._groupedDecimalNumber.isGrouped = true;
                        this._groupedDecimalNumber.integerDigits = MS.Entertainment.Formatters.DateTimeFormatters.defaultDecimalDigits
                    }
                    return this._groupedDecimalNumber
                }}, percentNumber: {get: function() {
                    if (!this._percentNumber) {
                        this._percentNumber = new Windows.Globalization.NumberFormatting.PercentFormatter;
                        this._percentNumber.fractionDigits = 0;
                        this._percentNumber.integerDigits = 0;
                        this._percentNumber.isDecimalPointAlwaysDisplayed = false;
                        this._percentNumber.isGrouped = true
                    }
                    return this._percentNumber
                }}, _defaultFormatter: {get: function() {
                    return {format: function format() {
                                return String.empty
                            }}
                }}
    }, {
        create: function create() {
            return new MS.Entertainment.Formatters.DateTimeFormatters
        }, defaultDecimalDigits: 1
    })});
MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.dateTimeFormatters, MS.Entertainment.Formatters.DateTimeFormatters.create);
WinJS.Namespace.define("MS.Entertainment.Formatters", {
    MediaSortFormatter: MS.Entertainment.defineOptionalObservable(function mediaSortFormatter() {
        this.bind("totalCount", this._updateResult.bind(this))
    }, {
        _emptyStringId: null, _singularStringId: null, _pluralStringId: null, _unknownStringId: null, _countOnly: null, _filter: null, initialize: function initialize(emptyStringId, singularStringId, pluralStringId, unknownStringId, countOnly, filter) {
                this._emptyStringId = emptyStringId;
                this._singularStringId = singularStringId;
                this._pluralStringId = pluralStringId;
                this._unknownStringId = unknownStringId;
                this._countOnly = countOnly;
                this._filter = filter;
                this._updateResult()
            }, _updateResult: function _updateResult() {
                var countFormatter;
                var mediaStringIdWithCount;
                var mediaStringIdWithoutCount;
                if (this.totalCount === 0)
                    mediaStringIdWithCount = this._emptyStringId;
                else if (this.totalCount === 1)
                    mediaStringIdWithCount = this._singularStringId;
                else if (this.totalCount > 0)
                    mediaStringIdWithCount = this._pluralStringId;
                else
                    mediaStringIdWithoutCount = this._unknownStringId;
                if (mediaStringIdWithCount) {
                    countFormatter = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber;
                    countFormatter.isGrouped = true;
                    this.result = String.load(this._filter ? String.id.IDS_N_FILTER_IN : String.id.IDS_N_SORTED_BY).format(countFormatter.format(this.totalCount), String.load(mediaStringIdWithCount));
                    countFormatter.isGrouped = false
                }
                else if (mediaStringIdWithoutCount)
                    this.result = String.load(this._filter ? String.id.IDS_FILTER_IN : String.id.IDS_SORTED_BY).format(String.load(mediaStringIdWithoutCount));
                else if (this._countOnly) {
                    countFormatter = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber;
                    this.result = countFormatter.format(this.totalCount)
                }
                else
                    this.result = null
            }
    }, {
        totalCount: 0, result: null
    }), InboxSortFormatter: MS.Entertainment.defineOptionalObservable(function inboxSortFormatter(){}, {
            _emptyStringId: null, _nonEmptyStringId: null, _totalCount: -1, initialize: function initialize(emptyStringId, nonEmptyStringId) {
                    this._emptyStringId = emptyStringId;
                    this._nonEmptyStringId = nonEmptyStringId;
                    this._updateResult()
                }, totalCount: {
                    get: function get() {
                        return this._totalCount
                    }, set: function set(value) {
                            this._totalCount = value;
                            this._updateResult()
                        }
                }, _updateResult: function _updateResult() {
                    var countFormatter;
                    var sortStringId = null;
                    if (this.totalCount === 0)
                        sortStringId = this._emptyStringId;
                    else if (this.totalCount > 0)
                        sortStringId = this._nonEmptyStringId;
                    if (sortStringId) {
                        countFormatter = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber;
                        countFormatter.isGrouped = true;
                        this.result = String.load(sortStringId).format(countFormatter.format(this.totalCount));
                        countFormatter.isGrouped = false
                    }
                    else
                        this.result = null
                }
        }, {result: null}), formatDestinationHelper: WinJS.Utilities.markSupportedForProcessing(function formatHelper(destination, destinationProperty, value) {
            if (destinationProperty.length > 1) {
                var prop = destination[destinationProperty[0]];
                for (var x = 1; x < destinationProperty.length - 1; x++)
                    prop = prop[destinationProperty[x]];
                prop[destinationProperty[x]] = value
            }
            else
                destination[destinationProperty] = value
        }), formatSourceHelper: WinJS.Utilities.markSupportedForProcessing(function formatSourceHelper(source, sourceProperty) {
            var sourceData;
            if (Array.isArray(sourceProperty)) {
                sourceData = source[sourceProperty[0]];
                for (var i = 1; i < sourceProperty.length; i++)
                    sourceData = sourceData[sourceProperty[i]]
            }
            else
                sourceData = source[sourceProperty];
            return sourceData
        }), formatStringOrStringId: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function(value) {
            var sourceDataType = typeof value;
            var result = String.empty;
            switch (sourceDataType) {
                case"string":
                    result = value;
                    break;
                case"number":
                    result = String.load(value);
                    break;
                default:
                    if (value)
                        MS.Entertainment.Formatters.assert(false, "Unrecognized string type in formatter.");
                    break
            }
            return result
        })), formatStringId: WinJS.Utilities.markSupportedForProcessing(function formatStringOrStringId(source, sourceProperty, destination, destinationProperty) {
            MS.Entertainment.Formatters.assert(sourceProperty[0] === "String", "Formatters_formatStringId must be passed a valid string id");
            var len = sourceProperty.length;
            var data = String;
            for (var i = 1; i < len && data; i++)
                data = data[sourceProperty[i]];
            var result = String.empty;
            MS.Entertainment.Formatters.assert(typeof data === "number", "Formatters_formatStringId must be passed a valid string id");
            if (typeof data === "number")
                result = String.load(data);
            MS.Entertainment.Formatters.formatDestinationHelper(destination, destinationProperty, result)
        }), formatYearFromDate: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatReleaseYear(sourceData) {
            var date = null;
            var year = null;
            if (sourceData) {
                date = new Date(sourceData);
                if (date) {
                    var formattedYear = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).year;
                    year = formattedYear.format(date)
                }
            }
            return year || String.empty
        })), formatAlbumAndArtist: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function(sourceValue) {
            return MS.Entertainment.Formatters.formatAlbumAndArtistHelper(sourceValue)
        })), formatAlbumAndArtistHelper: function formatAlbumAndArtistHelper(sourceValue, showArtistIfDifferent) {
            var value = String.empty;
            if (sourceValue) {
                var artistName = (!showArtistIfDifferent || sourceValue.hasNonAlbumArtistName) ? sourceValue.artistName : String.empty;
                if (artistName && sourceValue.albumName)
                    value = String.load(String.id.IDS_MUSIC_ALBUM_BY_ARTIST).format(sourceValue.albumName, artistName);
                else if (artistName)
                    value = String.load(String.id.IDS_MUSIC_BY_ARTIST).format(artistName);
                else if (sourceValue.albumName)
                    value = sourceValue.albumName
            }
            return value
        }, formatShortDate: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatYearMonthDate(sourceValue) {
            if (sourceValue) {
                var dateFormat = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).shortDate;
                sourceValue = dateFormat.format(sourceValue)
            }
            return sourceValue || String.empty
        })), formatDurationFromDate: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatDurationFromDate(sourceData) {
            return MS.Entertainment.Formatters.formatDurationFromDateNonConverter(sourceData)
        })), formatDurationFromDateNonConverter: function formatDurationFromDateNonConverter(sourceData) {
            var date = sourceData;
            if (typeof sourceData !== "number")
                date = new Date(sourceData);
            var duration = MS.Entertainment.Utilities.formatTimeString(date);
            return duration
        }, formatDurationGreaterThanZeroFromDate: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatDurationGreaterThanZeroFromDate(sourceData) {
            return MS.Entertainment.Formatters.formatDurationGreaterThanZeroFromDateNonConverter(sourceData)
        })), formatDurationGreaterThanZeroFromDateNonConverter: function formatDurationGreaterThanZeroFromDateNonConverter(sourceData) {
            var date = null;
            var forceEmptyString = false;
            if (typeof sourceData === "number")
                if (sourceData > 0)
                    date = MS.Entertainment.Utilities._millisecondsToDate(sourceData);
                else
                    forceEmptyString = true;
            else
                date = new Date(sourceData);
            var duration = sourceData && !forceEmptyString ? MS.Entertainment.Utilities.formatTimeString(date) : String.empty;
            return duration
        }, milliSecondsFromTimeSpan: function milliSecondsFromTimeSpan(days, hours, minutes, seconds, milliseconds) {
            return ((((days ? days : 0) * 24 + (hours ? hours : 0)) * 60 + (minutes ? minutes : 0)) * 60 + (seconds ? seconds : 0)) * 1000 + (milliseconds ? milliseconds : 0)
        }, formatRentalExpirationFromSpanInt: function formatRentalExpirationFromSpanInt(milliSeconds) {
            var message;
            var seconds = Math.floor(milliSeconds / 1000);
            var minutes = Math.floor(seconds / 60);
            var minutesNormalized = minutes % 60;
            var hours = Math.floor(minutes / 60);
            var hoursNormalized = hours % 24;
            var days = Math.floor(hours / 24);
            if (milliSeconds < 0)
                message = String.load(String.id.IDS_VIDEO_RENTAL_EXPIRED_ONLY);
            else if (milliSeconds >= MS.Entertainment.Formatters.milliSecondsFromTimeSpan(2))
                if (hoursNormalized === 0)
                    message = String.load(String.id.IDS_VIDEO_RENTAL_EXPIRES_DAYS).format(days);
                else if (hoursNormalized === 1)
                    message = String.load(String.id.IDS_VIDEO_RENTAL_EXPIRES_DAYS_HR).format(days);
                else
                    message = String.load(String.id.IDS_VIDEO_RENTAL_EXPIRES_DAYS_HRS).format(days, hoursNormalized);
            else if (milliSeconds >= MS.Entertainment.Formatters.milliSecondsFromTimeSpan(1, 1))
                if (hoursNormalized === 1)
                    message = String.load(String.id.IDS_VIDEO_RENTAL_EXPIRES_DAY_HR);
                else
                    message = String.load(String.id.IDS_VIDEO_RENTAL_EXPIRES_DAY_HRS).format(hoursNormalized);
            else if (milliSeconds >= MS.Entertainment.Formatters.milliSecondsFromTimeSpan(1))
                message = String.load(String.id.IDS_VIDEO_RENTAL_EXPIRES_DAY);
            else if (hoursNormalized > 1)
                if (minutesNormalized === 0)
                    message = String.load(String.id.IDS_VIDEO_RENTAL_EXPIRES_HRS).format(hoursNormalized);
                else if (minutesNormalized === 1)
                    message = String.load(String.id.IDS_VIDEO_RENTAL_EXPIRES_HRS_MIN).format(hoursNormalized);
                else
                    message = String.load(String.id.IDS_VIDEO_RENTAL_EXPIRES_HRS_MINS).format(hoursNormalized, minutesNormalized);
            else if (hoursNormalized === 1)
                if (minutesNormalized === 0)
                    message = String.load(String.id.IDS_VIDEO_RENTAL_EXPIRES_HR);
                else if (minutesNormalized === 1)
                    message = String.load(String.id.IDS_VIDEO_RENTAL_EXPIRES_HR_MIN);
                else
                    message = String.load(String.id.IDS_VIDEO_RENTAL_EXPIRES_HR_MINS).format(minutesNormalized);
            else if (hoursNormalized === 0)
                if (minutesNormalized === 0)
                    message = String.load(String.id.IDS_VIDEO_RENTAL_EXPIRES_LESS_THAN_MIN);
                else if (minutesNormalized === 1)
                    message = String.load(String.id.IDS_VIDEO_RENTAL_EXPIRES_MIN);
                else
                    message = String.load(String.id.IDS_VIDEO_RENTAL_EXPIRES_MINS).format(minutesNormalized);
            return message
        }, formatRentalExpirationFromSpan: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatRentalExpirationFromSpan(sourceData) {
            return MS.Entertainment.Formatters.formatRentalExpirationFromSpanInt(sourceData)
        })), formatSeason: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatSeason(value) {
            return MS.Entertainment.Formatters.formatCount(value, MS.Entertainment.Formatters.seasonCountText)
        })), seasonCountText: function seasonCountText(count) {
            return MS.Entertainment.Formatters.countText(count, String.id.IDS_TV_NOSEASONS_LABEL, String.id.IDS_TV_SEASON_LABEL, String.id.IDS_TV_SEASONS_LABEL)
        }, formatArtist: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatArtist(count) {
            return MS.Entertainment.Formatters.formatCount(count, MS.Entertainment.Formatters.artistCountText)
        })), formatTracks: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatTracks(count) {
            return MS.Entertainment.Formatters.formatCount(count, MS.Entertainment.Formatters.trackCountText)
        })), formatTracksOneTime: WinJS.Utilities.markSupportedForProcessing(function formatTracksOneTime(source, sourceProperties, dest, destProperties) {
            var count = MS.Entertainment.Utilities.valueFromPropertyPathFragments(source, sourceProperties);
            count = MS.Entertainment.Formatters.formatCount(count, MS.Entertainment.Formatters.trackCountText);
            MS.Entertainment.Utilities.setFromPropertyPathFragments(dest, destProperties, count)
        }), formatAlbumCount: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatAlbumCount(count) {
            return MS.Entertainment.Formatters.formatCount(count, MS.Entertainment.Formatters.albumCountText)
        })), formatAlbumCountOneTime: WinJS.Utilities.markSupportedForProcessing(function formatAlbumCountOneTime(source, sourceProperties, dest, destProperties) {
            var count = MS.Entertainment.Utilities.valueFromPropertyPathFragments(source, sourceProperties);
            count = MS.Entertainment.Formatters.formatCount(count, MS.Entertainment.Formatters.albumCountText);
            MS.Entertainment.Utilities.setFromPropertyPathFragments(dest, destProperties, count)
        }), formatTrackAndAlbumCount: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatTrackAndAlbumCount(artist) {
            if (artist) {
                var details = [];
                var formatter = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber;
                var albumCountFormatted;
                var tracksCountFormatted;
                if (artist.totalAlbumsCount === 1)
                    details.push(String.load(String.id.IDS_DETAILS_COLLECTION_ALBUM_COUNT));
                else if (artist.totalAlbumsCount > 1) {
                    albumCountFormatted = formatter.format(artist.totalAlbumsCount);
                    details.push(String.load(String.id.IDS_DETAILS_COLLECTION_ALBUMS_COUNT).format(albumCountFormatted))
                }
                if (artist.totalTracksCount === 1)
                    details.push(String.load(String.id.IDS_DETAILS_COLLECTION_SONG_COUNT));
                else if (artist.totalTracksCount > 1) {
                    tracksCountFormatted = formatter.format(artist.totalTracksCount);
                    details.push(String.load(String.id.IDS_DETAILS_COLLECTION_SONGS_COUNT).format(tracksCountFormatted))
                }
                return details.join(String.load(String.id.IDS_DETAILS_INFO_SEPERATOR))
            }
            else
                return String.empty
        })), trackCountText: function trackCountText(count) {
            return MS.Entertainment.Formatters.countText(count, String.id.IDS_MUSIC_NOTRACKS_LABEL, String.id.IDS_MUSIC_TRACK_LABEL, String.id.IDS_MUSIC_TRACKS_LABEL)
        }, artistCountText: function artistCountText(count) {
            return MS.Entertainment.Formatters.countTextWithoutOrderFormat(count, String.id.IDS_MUSIC_TYPE_ARTIST_0, String.id.IDS_MUSIC_TYPE_ARTIST_1, String.id.IDS_MUSIC_TYPE_ARTIST_N)
        }, albumCountText: function albumCountText(count) {
            return MS.Entertainment.Formatters.countTextWithoutOrderFormat(count, String.id.IDS_MUSIC_TYPE_ALBUM_0, String.id.IDS_MUSIC_TYPE_ALBUM_1, String.id.IDS_MUSIC_TYPE_ALBUM_N)
        }, playlistCountText: function playlistCountText(count) {
            return MS.Entertainment.Formatters.countTextWithoutOrderFormat(count, String.id.IDS_MUSIC_TYPE_PLAYLIST_0, String.id.IDS_MUSIC_TYPE_PLAYLIST_1, String.id.IDS_MUSIC_TYPE_PLAYLIST_N)
        }, playlistsAddedCountText: function playlistsAddedCountText(count) {
            return MS.Entertainment.Formatters.countText(count, String.id.IDS_PLAYLIST_0_PLAYLISTS_ADDED, String.id.IDS_PLAYLIST_1_PLAYLISTS_ADDED, String.id.IDS_PLAYLIST_N_PLAYLISTS_ADDED)
        }, formatCount: function formatCount(count, countTextFunction) {
            if (count === undefined || count === -1)
                return String.empty;
            return countTextFunction(count)
        }, countText: function countText(count, zeroLabel, singleLabel, pluralLabel) {
            var numberFormatter = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber;
            var formattedCount = numberFormatter.format(count);
            if (count === 0)
                return String.load(zeroLabel).format(formattedCount);
            else if (count === 1)
                return String.load(singleLabel).format(formattedCount);
            else
                return String.load(pluralLabel).format(formattedCount)
        }, countTextWithoutOrderFormat: function countTextWithoutOrderFormat(count, zeroLabel, singleLabel, pluralLabel) {
            var formatString = String.load(String.id.IDS_MUSIC_RELATED_PANEL_FORMAT);
            var formattedCount = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber.format(count);
            var countLabel;
            if (count === 0)
                countLabel = String.load(zeroLabel);
            else if (count === 1)
                countLabel = String.load(singleLabel);
            else
                countLabel = String.load(pluralLabel);
            return formatString.format(formattedCount, countLabel)
        }, formatNumberOfRatings: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatNumberOfRatings(number) {
            if (!number)
                return String.empty;
            var groupedNumber = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).groupedDecimalNumber.format(number);
            return String.load(String.id.IDS_DETAILS_RATING_NUMBEROFRATINGS).format(groupedNumber)
        })), formatNumberOfReviews: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatNumberOfReviews(number) {
            if (!number)
                return String.empty;
            var groupedNumber = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).groupedDecimalNumber.format(number);
            return String.load(String.id.IDS_VIDEO_REVIEW_COUNT).format(groupedNumber)
        })), formatPercentage: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatPercentage(number) {
            number = Number(number);
            if (!number)
                return String.empty;
            number = number / 100;
            var percentNumber = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).percentNumber.format(number);
            return percentNumber
        })), formatTVEpisode: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatTVEpisode(episodeCount) {
            var formattedCount;
            if (episodeCount === undefined || episodeCount < 0)
                return String.empty;
            formattedCount = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber.format(episodeCount);
            var result = String.empty;
            if (episodeCount === 0)
                result = String.load(String.id.IDS_TV_NOEPISODES_LABEL).format(formattedCount);
            if (episodeCount === 1)
                result = String.load(String.id.IDS_TV_EPISODE_LABEL).format(formattedCount);
            else
                result = String.load(String.id.IDS_TV_EPISODES_LABEL).format(formattedCount);
            return result
        })), formatTVSeasonNumberInt: function formatTVSeasonNumberInt(seasonNumber) {
            var formattedNumber;
            if (seasonNumber === undefined)
                return String.empty;
            formattedNumber = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber.format(seasonNumber);
            var result = (seasonNumber <= 0) ? String.load(String.id.IDS_TV_SEASON_0_NAME) : String.load(String.id.IDS_TV_SEASON_NAME).format(formattedNumber);
            return result
        }, formatTVSeasonNumber: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatTVSeasonNumber(sourceValue) {
            return MS.Entertainment.Formatters.formatTVSeasonNumberInt(sourceValue)
        })), formatTVSeasonEpisodeNumberInt: function formatTVSeasonEpisodeNumberInt(sourceValue) {
            var result = String.empty;
            var formattedEpisodeNumber;
            var formattedSeasonNumber;
            var numberFormatter;
            if (sourceValue === undefined || sourceValue === null)
                return String.emtpy;
            if ((sourceValue.seriesTitle && sourceValue.seasonNumber !== undefined && sourceValue.episodeNumber !== undefined) || (sourceValue.contentType === "TVEpisode")) {
                numberFormatter = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber;
                var seasonNumber = sourceValue.seasonNumber;
                if (sourceValue.season && sourceValue.season.number)
                    seasonNumber = sourceValue.season.number;
                formattedSeasonNumber = numberFormatter.format(seasonNumber);
                var seasonNumber = (seasonNumber <= 0) ? String.load(String.id.IDS_TV_SEASON_0_NAME) : String.load(String.id.IDS_TV_SEASON_NAME).format(formattedSeasonNumber);
                var episodeNumber;
                if (sourceValue.episodeNumber > 0) {
                    formattedEpisodeNumber = numberFormatter.format(sourceValue.episodeNumber);
                    episodeNumber = String.load(String.id.IDS_TV_NUMBERED_EPISODE_NAME).format(formattedEpisodeNumber)
                }
                else
                    episodeNumber = String.load(String.id.IDS_TV_NUMBERED_EPISODE_0_NAME);
                if (seasonNumber !== 0 || episodeNumber !== 0)
                    result = String.load(String.id.IDS_COMMA_SEPARATOR).format(seasonNumber, episodeNumber);
                else
                    result = episodeNumber
            }
            return result
        }, formatTVSeasonEpisodeNumber: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatTVSeasonEpisodeNumber(sourceValue) {
            return MS.Entertainment.Formatters.formatTVSeasonEpisodeNumberInt(sourceValue)
        })), formatEpisodeSeriesTitleSeasonEpisodeNumberFileSize: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatVideoDownloadMovieDescription(sourceValue) {
            var result = String.empty;
            if (sourceValue === undefined || sourceValue === null)
                return String.emtpy;
            if (sourceValue.seriesTitle)
                result = sourceValue.seriesTitle;
            var seasonEpisodeNumber = MS.Entertainment.Formatters.formatTVSeasonEpisodeNumberInt(sourceValue);
            if (seasonEpisodeNumber)
                if (result.length > 0)
                    result = String.load(String.id.IDS_COMMA_SEPARATOR).format(result, seasonEpisodeNumber);
                else
                    result = seasonEpisodeNumber;
            return result
        })), formatMovieGenreReleaseYear: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatMovieGenreReleaseYear(sourceValue) {
            var result = String.empty;
            if (sourceValue === undefined || sourceValue === null)
                return String.emtpy;
            if (sourceValue.genreName)
                result = sourceValue.genreName;
            if (sourceValue.releaseDate) {
                var dateFormat = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).year;
                var year = dateFormat.format(sourceValue.releaseDate);
                if (result.length > 0)
                    result = String.load(String.id.IDS_COMMA_SEPARATOR).format(result, year);
                else
                    result = year
            }
            return result
        })), formatMovieReleaseYearRatingDuration: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatMovieReleaseYearRatingDuration(sourceValue) {
            var result = String.empty;
            if (sourceValue) {
                var parts = [];
                if (sourceValue.releaseDate) {
                    var dateFormat = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).year;
                    var year = dateFormat.format(sourceValue.releaseDate);
                    parts.push(year)
                }
                if (sourceValue.rating)
                    parts.push(sourceValue.rating);
                if (sourceValue.duration)
                    parts.push(MS.Entertainment.Formatters.formatDurationFromDateNonConverter(sourceValue.duration));
                result = parts.join(String.load(String.id.IDS_DETAILS_INFO_SEPERATOR))
            }
            return result
        })), formatGenresList: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatGenresList(genres) {
            return MS.Entertainment.Formatters.formatGenresListNonConverter(genres)
        })), formatGenresListNonConverter: function formatGenresListNonConverter(genres) {
            if (!genres)
                return String.empty;
            var genreNames = [];
            if (Array.isArray(genres)) {
                genres.forEach(function forEachGenresList(genre) {
                    if (genre)
                        genreNames.push(genre.name)
                });
                return genreNames.join(String.load(String.id.IDS_DETAILS_INFO_SEPERATOR))
            }
            else if (typeof genres !== "string" && genres.forEach) {
                MS.Entertainment.Formatters.assert(false, "Supplied with virtual list. Don't know how to handle this. Don't think it's used any more");
                return String.empty
            }
            else if (typeof genres === "string")
                return genres
        }, formatContentRatingsList: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatContentRatingsList(contentIncludes) {
            if (!contentIncludes)
                return Stirng.empty;
            if (typeof contentIncludes !== "string") {
                var contentFeatures = [];
                contentIncludes.forEach(function forEachContentIncludes(contentIncludes) {
                    contentFeatures.push(contentIncludes.label)
                });
                return contentFeatures.join(String.load(String.id.IDS_DETAILS_INFO_SEPERATOR))
            }
            else
                return contentIncludes
        })), formatStringOrUnknown: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatStringOrUnknown(result) {
            if (!result || result === "null")
                result = String.load(String.id.IDS_UNKNOWN_VALUE);
            return result
        })), formatStringOrEmpty: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatStringOrEmpty(result) {
            if (!result || result === "null")
                result = String.empty;
            return result
        })), formatStringOrEmptyOneTime: WinJS.Utilities.markSupportedForProcessing(function formatStringOrEmptyOneTime(source, sourceProperties, dest, destProperties) {
            var result = MS.Entertainment.Utilities.valueFromPropertyPathFragments(source, sourceProperties);
            if (!result || result === "null")
                result = String.empty;
            MS.Entertainment.Utilities.setFromPropertyPathFragments(dest, destProperties, result)
        }), formatDecimalNumber: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatDecimalNumber(num) {
            var formattedNum;
            formattedNum = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber.format(num);
            return formattedNum
        })), formatTrackNumber: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatTrackNumber(num) {
            var formattedNum = String.empty;
            if (num)
                formattedNum = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber.format(num);
            return formattedNum
        })), formatTrackDuration: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatTrackDuration(duration) {
            if (duration)
                duration = MS.Entertainment.Utilities.millisecondsToTimeCode(duration);
            else
                duration = String.empty;
            return duration
        })), formatGamePlatformString: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatGamePlatformString(type) {
            return MS.Entertainment.Data.Factory.Marketplace.gamePlatformTypeToString(type)
        })), formatGameExtrasDownloadTypeAndReleaseDate: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatGameExtrasDownloadTypeAndReleaseDate(sourceValue) {
            var result = String.empty;
            var dateFormatter = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).shortDate;
            var formattedReleaseDate;
            if (sourceValue === undefined || sourceValue === null)
                return String.emtpy;
            if (sourceValue.releaseDate) {
                formattedReleaseDate = dateFormatter.format(sourceValue.releaseDate);
                if (sourceValue.downloadTypeString)
                    result = String.load(String.id.IDS_COMMA_SEPARATOR).format(sourceValue.downloadTypeString, formattedReleaseDate);
                else
                    result = formattedReleaseDate
            }
            else if (sourceValue.downloadTypeString)
                result = sourceValue.downloadTypeString;
            return result
        })), formatGameExtrasDownloadTypeAndGameTitle: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatGameExtrasDownloadTypeAndGameTitle(sourceValue) {
            var result = String.empty;
            if (sourceValue === undefined || sourceValue === null)
                return String.emtpy;
            if (sourceValue.parentItemName && sourceValue.downloadTypeString)
                result = String.load(String.id.IDS_DETAILS_EXTRA_FOR_GAME).format(sourceValue.downloadTypeString, sourceValue.parentItemName);
            else if (sourceValue.downloadTypeString)
                result = sourceValue.downloadTypeString;
            return result
        })), formatGameExtrasGenreAndPlatformType: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatGameExtrasGenreAndPlatformType(sourceValue) {
            var result = String.empty;
            if (sourceValue === undefined || sourceValue === null)
                return String.emtpy;
            if (sourceValue.defaultPlatformType) {
                var platformString = MS.Entertainment.Data.Factory.Marketplace.gamePlatformTypeToString(sourceValue.defaultPlatformType);
                if (sourceValue.primaryGenre)
                    result = String.load(String.id.IDS_COMMA_SEPARATOR).format(sourceValue.primaryGenre, platformString);
                else
                    result = platformString
            }
            else
                result = sourceValue.primaryGenre;
            return result
        })), formatGamePriceAndPurchaseHistory: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatGameExtrasGenreAndPlatformType(sourceValue) {
            var result = String.empty;
            if (sourceValue === undefined || sourceValue === null)
                return String.emtpy;
            var signedInUserService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
            var offer = signedInUserService.isGold() ? sourceValue.offerGold : sourceValue.offerSilver;
            if (offer)
                if (sourceValue.purchaseDate) {
                    var formatter = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).shortDate;
                    if (sourceValue.itemTypeQueryString === MS.Entertainment.Data.Query.edsMediaType.metroGameConsumable)
                        result = String.load(String.id.IDS_DETAILS_EXTRA_LAST_PURCHASE_ON_LABEL).format(offer.displayPrice, formatter.format(sourceValue.purchaseDate));
                    else if (sourceValue.itemTypeQueryString === MS.Entertainment.Data.Query.edsMediaType.metroGameContent)
                        result = String.load(String.id.IDS_DETAILS_EXTRA_PRICE_PURCHASE_ON).format(offer.displayPrice, formatter.format(sourceValue.purchaseDate))
                }
                else
                    result = offer.displayPrice;
            return result
        })), formatLeaderboardPosition: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatGameExtrasGenreAndPlatformType(sourceValue) {
            var result = String.empty;
            if (sourceValue === undefined || sourceValue === null || !sourceValue.rank || !sourceValue.total)
                return String.empty;
            else
                result = String.load(String.id.IDS_SOCIAL_LEADERBOARD_RANK).format(sourceValue.rank, sourceValue.total);
            return result
        })), formatLeaderboardName: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatGameExtrasGenreAndPlatformType(sourceValue) {
            var result = String.empty;
            if (!sourceValue)
                return String.empty;
            else
                result = String.load(String.id.IDS_SOCIAL_LEADERBOARD_NAME).format(sourceValue);
            return result
        })), formatIcon: WinJS.Utilities.markSupportedForProcessing(function formatIcon(source, sourceProperty, destination, destinationProperty) {
            var icon = MS.Entertainment.Utilities.valueFromPropertyPathFragments(WinJS.Utilities.getMember(sourceProperty[0]), sourceProperty.slice(1));
            MS.Entertainment.Formatters.formatDestinationHelper(destination, destinationProperty, icon)
        }), formatGenre: function formatGenre(sourceValue) {
            var result = String.Empty;
            if (sourceValue.genre)
                if (Array.isArray(sourceValue.genre)) {
                    var genreNames = [];
                    sourceValue.genre.forEach(function(genre) {
                        if (genre)
                            genreNames.push(genre.name)
                    });
                    result = genreNames.join(String.load(String.id.IDS_DETAILS_INFO_SEPERATOR))
                }
                else if (sourceValue.genre.name)
                    result = sourceValue.genre.name;
                else
                    result = sourceValue.genre;
            return result
        }, formatPublisherAndReleaseDate: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatPublisherAndReleaseDate(source) {
            var formatter = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).year;
            var releaseDate;
            var releaseYear;
            var values = [];
            if (source.publisher)
                values.push(source.publisher);
            if (source.releaseDate) {
                releaseDate = new Date(source.releaseDate);
                releaseYear = formatter.format(releaseDate);
                values.push(releaseYear)
            }
            return values.join(String.load(String.id.IDS_DETAILS_INFO_SEPERATOR))
        })), formatActivityPrice: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatActivityPrice(mediaItem) {
            var signedInUserService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
            var isGold = signedInUserService.isGold();
            var isSilver = signedInUserService.isSilver();
            var priceString = String.empty;
            if ((isSilver && mediaItem.offerSilver && !mediaItem.offerSilver.price) || (isGold && mediaItem.offerGold && !mediaItem.offerGold.price))
                priceString = String.load(String.id.IDS_COMPANION_ACTIVITY_FREE_PRICE);
            else if (isSilver && mediaItem.requiresGold)
                priceString = String.load(String.id.IDS_COMPANION_ACTIVITY_FREE_GOLD_PRICE);
            else if ((mediaItem.offerSilver && mediaItem.offerSilver.price) || (mediaItem.offerGold && mediaItem.offerGold.price))
                priceString = isSilver ? mediaItem.offerSilver.displayPrice : mediaItem.offerGold.displayPrice;
            return priceString
        })), formatIsDownloaded: WinJS.Binding.converter(WinJS.Utilities.markSupportedForProcessing(function formatCanPlayLocally(source) {
            var result = String.empty;
            if (!source && MS.Entertainment.Utilities.isApp1)
                result = MS.Entertainment.UI.Icon.inlineStreaming;
            return result
        }))
})
