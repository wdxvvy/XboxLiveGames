﻿/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
WinJS.Namespace.define("MS.Entertainment.UI", {Monikers: {
        allVideoCollection: "allVideoCollection", allVideoCollectionPanel: "allVideoCollectionPanel", artistAlbums: "artistAlbums", artistAlbumsCollection: "artistAlbumsCollection", artistAlbumsMarketplace: "artistAlbumsMarketplace", artistSearchAction: "artistSearchAction", artistSearchActionPivot: "artistSearchActionPivot", companionFeatured: "companionFeatured", companionFeaturedGamesPanel: "companionFeaturedGamesPanel", companionFeaturedMusicPanel: "companionFeaturedMusicPanel", companionFeaturedMoviesPanel: "companionFeaturedMoviesPanel", companionFeaturedTVPanel: "companionFeaturedTVPanel", companionNowPlaying: "companionNowPlaying", companionNowPlayingPanel: "companionNowPlayingPanel", companionQuickplay: "companionQuickplay", companionQuickplayPanel: "companionQuickplayPanel", companionSearch: "companionSearch", companionSearchPanel: "companionSearchPanel", fullScreenNowPlaying: "fullScreenNowPlaying", homeHub: "homeHub", homeSpotlight: "homeSpotlight", gamesHub: "gamesHub", gamesActivityHub: "gamesActivityHub", gamesActivityPanel: "gamesActivityPanel", gamesCollection: "gamesCollection", gamesCollectionHub: "gamesCollectionHub", gamesCollectionAllPanel: "gamesCollectionAllPanel", gamesMarketplace: "gamesMarketplace", gamesWindowsHub: "gamesWindowsHub", gamesWindowsPanel: "gamesWindowsPanel", gamesWindowsMarketplace: "gamesWindowsMarketplace", gamesWindowsMarketplaceNewReleases: "gamesWindowsMarketplaceNewReleases", gamesWindowsMarketplaceNewReleasesPanel: "gamesWindowsMarketplaceNewReleasesPanel", gamesWindowsMarketplaceGenre: "gamesWindowsMarketplaceGenre", gamesWindowsMarketplaceGenrePanel: "gamesWindowsMarketplaceGenrePanel", gamesWindowsMarketplaceGames: "gamesWindowsMarketplaceGames", gamesWindowsMarketplaceGamesPanel: "gamesWindowsMarketplaceGamesPanel", gamesWindowsMarketplaceFeatured: "gamesWindowsMarketplaceFeatured", gamesWindowsMarketplaceFeaturedPanel: "gamesWindowsMarketplaceFeaturedPanel", filteredMovieMarketplace: "filteredMovieMarketplace", filteredTvMarketplace: "filteredTvMarketplace", filteredMovieMarketplaceSingleStudio: "filteredMovieMarketplaceSingleStudio", filteredMovieMarketplaceSingleStudioPanel: "filteredMovieMarketplaceSingleStudioPanel", filteredTvMarketplaceSingleNetwork: "filteredTvMarketplaceSingleNetwork", filteredTvMarketplaceSingleNetworkPanel: "filteredTvMarketplaceSingleNetworkPanel", immersiveDetails: "immersiveDetails", albumsSearch: "albumsSearch", allGamesSearch: "allGamesSearch", allGamesSearchPanel: "allGamesSearchPanel", allMusicSearch: "allMusicSearch", allVideoSearch: "allVideoSearch", allVideoSearchPanel: "allVideoSearchPanel", artistsSearch: "artistsSearch", searchPage: "searchPage", playlistsSearch: "playlistsSearch", tracksSearch: "tracksSearch", movieCollection: "movieCollection", movieCollectionPanel: "movieCollectionPanel", movieMarketplace: "movieMarketplace", movieMarketplaceFeatured: "movieMarketplaceFeatured", movieMarketplaceFeaturedPanel: "movieMarketplaceFeaturedPanel", movieMarketplaceNewReleases: "movieMarketplaceNewReleases", movieMarketplaceNewReleasesPanel: "movieMarketplaceNewReleasesPanel", movieMarketplaceTopSelling: "movieMarketplaceTopSelling", movieMarketplaceTopSellingPanel: "movieMarketplaceTopSellingPanel", movieMarketplaceGenres: "movieMarketplaceGenres", movieMarketplaceGenresPanel: "movieMarketplaceGenresPanel", movieMarketplaceHub: "movieMarketplaceHub", movieMarketplacePanel: "movieMarketplacePanel", movieMarketplaceStudios: "movieMarketplaceStudios", movieMarketplaceStudiosPanel: "movieMarketplaceStudiosPanel", movieTrailerBrowse: "movieTrailerBrowse", musicHub: "musicHub", musicCollection: "musicCollection", musicCollectionHub: "musicCollectionHub", musicCollectionPanel: "musicCollectionPanel", musicMarketplace: "musicMarketplace", musicMarketplaceAlbums: "musicMarketplaceAlbums", musicMarketplaceAlbumsPanel: "musicMarketplaceAlbumsPanel", musicMarketplaceArtists: "musicMarketplaceArtists", musicMarketplaceArtistsPanel: "musicMarketplaceArtistsPanel", musicMarketplaceFeatured: "musicMarketplaceFeatured", musicMarketplaceFeaturedPanel: "musicMarketplaceFeaturedPanel", musicMarketplaceGenres: "musicMarketplaceGenres", musicMarketplaceGenresPanel: "musicMarketplaceGenresPanel", musicMarketplaceHub: "musicMarketplaceHub", musicMarketplacePanel: "musicMarketplacePanel", musicCollectionByAlbum: "musicCollectionByAlbum", musicCollectionByAlbumPanel: "musicCollectionByAlbumPanel", musicCollectionByArtist: "musicCollectionByArtist", musicCollectionByArtistPanel: "musicCollectionByArtistPanel", musicCollectionSmartDJs: "musicCollectionSmartDJs", musicCollectionBySong: "musicCollectionBySong", musicCollectionBySongPanel: "musicCollectionBySongPanel", musicCollectionPlaylists: "musicCollectionPlaylists", musicCollectionPlaylistsPanel: "musicCollectionPlaylistsPanel", musicNewReleases: "musicNewReleases", musicNewReleasesPanel: "musicNewReleasesPanel", musicNewReleasesGallery: "musicNewReleasesGallery", musicPopularGallery: "musicPopularGallery", musicTopMusic: "musicTopMusic", musicTopArtistsPanel: "musicTopArtistsPanel", musicTopAlbumsPanel: "musicTopAlbumsPanel", musicVideoCollection: "musicVideoCollection", musicVideoCollectionPanel: "musicVideoCollectionPanel", navigationPopover: "navigationPopover", otherVideoCollection: "otherVideoCollection", otherVideoCollectionPanel: "otherVideoCollectionPanel", root: "root", searchHub: "searchHub", selectPlaylist: "selectPlaylist", selectPlaylistPivot: "selectPlaylistPivot", socialAchievements: "socialAchievements", socialAchievementsGallery: "socialAchievementsGallery", socialAchievementsSummary: "socialAchievementsSummary", socialActivitiesSummaryPanel: "socialActivitiesSummaryPanel", socialAvatar: "socialAvatar", socialAvatarEditorPage: "socialAvatarEditorPage", socialAvatarEditorStylesHub: "socialAvatarEditorStylesHub", socialAvatarEditorFeaturesHub: "socialAvatarEditorFeaturesHub", socialAvatarSelectionPage: "socialAvatarSelectionPage", socialAvatarSelectionHub: "socialAvatarSelectionHub", socialAvatarSelectionPanel: "socialAvatarSelectionPanel", socialCompareActivitiesPanel: "socialCompareActivitiesPanel", socialCompareActivitiesPage: "socialCompareActivitiesPage", socialCompareActivitiesHub: "socialCompareActivitiesHub", socialDetails: "socialDetails", socialFriendsPanel: "socialFriendsPanel", socialFriends: "socialFriends", socialFriendsOfFriend: "socialFriendsOfFriend", socialFriendsGallery: "socialFriendsGallery", socialFriendsOfFriendGallery: "socialFriendsOfFriendGallery", socialFriendsHub: "socialFriendsHub", socialFriendsOfFriendHub: "socialFriendsOfFriendHub", socialInboxPage: "socialInboxPage", socialInboxAllHub: "socialInboxAllHub", socialInboxAllPanel: "socialInboxAllPanel", socialInboxMessagesHub: "socialInboxMessagesHub", socialInboxMessagesPanel: "socialInboxMessagesPanel", socialInboxGameInvitesHub: "socialInboxGameInvitesHub", socialInboxGameInvitesPanel: "socialInboxGameInvitesPanel", socialPendingFriendsGallery: "socialPendingFriendsGallery", socialPendingFriendsHub: "socialPendingFriendsHub", socialHub: "socialHub", socialMe: "socialMe", socialMiniProfile: "socialMiniProfile", socialProfile: "socialProfile", socialProfileHub: "socialProfileHub", socialProfileFriendsPanel: "socialProfileFriendsPanel", socialProfileAvatar: "socialProfileAvatar", tempGamesPanel: "tempGamesPanel", tempMusicPanel: "tempMusicPanel", tempSocialPanel: "tempSocialPanel", tempVideoPanel: "tempVideoPanel", tvCollection: "tvCollection", tvCollectionPanel: "tvCollectionPanel", tvMarketplace: "tvMarketplace", tvMarketplaceFeatured: "tvMarketplaceFeatured", tvMarketplaceFeaturedPanel: "tvMarketplaceFeaturedPanel", tvMarketplaceNewReleases: "tvMarketplaceNewReleases", tvMarketplaceNewReleasesPanel: "tvMarketplaceNewReleasesPanel", tvMarketplaceLastNight: "tvMarketplaceLastNight", tvMarketplaceLastNightPanel: "tvMarketplaceLastNightPanel", tvMarketplaceTopSelling: "tvMarketplaceTopSelling", tvMarketplaceTopSellingPanel: "tvMarketplaceTopSellingPanel", tvMarketplaceGenres: "tvMarketplaceGenres", tvMarketplaceGenresPanel: "tvMarketplaceGenresPanel", tvMarketplaceHub: "tvMarketplaceHub", tvMarketplaceNetworks: "tvMarketplaceNetworks", tvMarketplaceNetworksPanel: "tvMarketplaceNetworksPanel", tvMarketplacePanel: "tvMarketplacePanel", videoHub: "videoHub", videoHubIsolated: "videoHubIsolated", videoCollection: "videoCollection", videoCollectionHub: "videoCollectionHub", videoCollectionPanel: "videoCollectionPanel", videoMarketplace: "videoMarketplace", welcomeHub: "welcomeHub", welcomePanel: "welcomePanel", flexHubPage: "flexHubPage", flexHub: "flexHub", flexHubPanel: "flexHubPanel"
    }})