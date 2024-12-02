/* Copyright (C) Microsoft Corporation. All rights reserved. */
WinJS.Namespace.define("MS.Entertainment.Utilities.Ratings", {
    RatingValue: {
        esrbEarlyChildhood: "0", esrbEveryone: "10", esrbEveryone10: "20", esrbRatingPending10: "25", esrbTeen: "30", esrbMature: "40", esrbAdultOriented: "50", esrbRatingPending: "60", ceroAllAges: "100", ceroB: "110", ceroC: "120", ceroD: "130", ceroZ: "140", ceroRatingPending: "150", pegiFI3: "4001", pegiFI7: "4002", pegiFI12: "4003", pegiFI16: "4004", pegiFI18: "4005", pegiFIAge3: "14001", pegiFIAge7: "14002", pegiFIAge12: "14003", pegiFIAge16: "14004", pegiFIAge18: "14005", pegiPTAge4: "5001", pegiPTAge6: "5002", pegiPTAge12: "5003", pegiPTAge16: "5004", pegiPTAge18: "5005", uskAllAges: "7001", uskAge6: "7002", uskAge12: "7003", uskAge16: "7004", uskNoYouth: "7005", uskRatingPending: "7006", oflcAUG: "8001", oflcAUG8: "8002", oflcAUM15: "8003", oflcAUMA15: "8004", oflcAURC: "8005", oflcAUExempt: "8006", oflcAUGeneral: "8007", oflcAUParentalGuidance: "8008", oflcAUMature: "8009", oflcAUMature15: "8010", oflcAURestricted: "8011", oflcAUX18: "8012", oflcNZGeneral: "9001", oflcNZParentalGuidance: "9002", oflcNZMature: "9003", oflcNZRestricted13: "9006", oflcNZRestricted15: "9004", oflcNZRestricted16: "9007", oflcNZRestricted18: "9008", oflcNZRestricted: "9005", grbAllAges: "11001", grbAge12: "11002", grbAge15: "11003", grbAge18: "11004", djctqERI: "12006", djctqL: "12001", djctqAge10: "12007", djctqAge12: "12002", djctqAge14: "12003", djctqAge16: "12004", djctqAge18: "12005", isfpbAllAges: "13001", isfpbPG: "13002", isfpbAge10: "13003", isfpbAge13: "13004", isfpbAge16: "13005", isfpbAge18: "13006", isfpb10M: "13007", isfpb13M: "13008", taiwanGeneral: "17001", taiwanProtected: "17002", taiwanParentalGuidance: "17003", taiwanParentalGuidance15: "17004", taiwanRestricted18: "17005", singaporeGeneral: "18001", singaporeAgeAdvisory: "18002", singaporeMature: "18003", russianAge0: "19001", russianAge6: "19002", russianAge12: "19003", russianAge16: "19004", russianAge18: "19005"
    }, RatingDescriptor: {
            esrbAlcohol: "0", esrbAnimatedBlood: "1", esrbBlood: "2", esrbBloodAndGore: "3", esrbCartoonHumor: "4", esrbComicMischief: "5", esrbCrudeHumor: "6", esrbDrugReference: "7", esrbEdutainment: "8", esrbFantasyViolence: "9", esrbInformational: "10", esrbIntenseViolence: "11", esrbLanguage: "12", esrbLyrics: "13", esrbMatureHumor: "14", esrbMildViolence: "15", esrbNudity: "16", esrbPartialNudity: "17", esrbRealGambling: "18", esrbSexualThemes: "19", esrbSexualViolence: "20", esrbSimulatedGambling: "21", esrbAdultAssistance: "22", esrbStrongLanguage: "23", esrbStrongLyrics: "24", esrbStrongSexualContent: "25", esrbSuggestiveThemes: "26", esrbTobaccoReference: "27", esrbUseOfDrugs: "28", esrbUseOfAlcohol: "29", esrbUseOfTobacco: "30", esrbViolence: "31", esrbSexualContent: "32", esrbMildAlcoholReference: "33", esrbMildAnimatedBlood: "34", esrbMildBlood: "35", esrbMildBloodAndGore: "36", esrbMildCartoonViolence: "37", esrbMildComicMischief: "38", esrbMildCrudeHumor: "39", esrbMildDrugReference: "40", esrbMildFantasyViolence: "41", esrbMildLanguage: "42", esrbMildLyrics: "43", esrbMildMatureHumor: "44", esrbMildNudity: "45", esrbMildPartialNudity: "46", esrbMildRealGambling: "47", esrbMildSexualThemes: "48", esrbMildSexualViolence: "49", esrbMildSimulatedGambling: "50", esrbMildSuggestiveThemes: "51", esrbMildTobaccoReference: "52", esrbMildUseOfDrugs: "53", esrbMildUseOfAlcohol: "54", esrbMildUseOfTobacco: "55", esrbMildViolenceAlternate: "56", esrbMildSexualContent: "57", esrbViolentReferences: "58", esrbMildViolenceReferences: "59", esrbUseOfDrugsAndAlcohol: "60", esrbUseOfAlcoholAndTobacco: "61", esrbAlcoholAndTobaccoReference: "62", esrbAnimatedViolence: "63", esrbMildAnimatedViolence: "64", esrbAnimatedBloodAndGore: "65", esrbGore: "66", esrbMildUseOfDrugsAndAlcohol: "67", esrbMildUseOfDrugsAndTobacco: "68", esrbMildUseOfAlcoholAndTobacco: "69", esrbMildUseOfDrugsAlcoholAndTobacco: "70", esrbDrugAndAlcoholReference: "71", esrbMildDrugAndAlcoholReference: "72", esrbDrugAndTobaccoReference: "73", esrbMildDrugAndTobaccoReference: "74", esrbDrugAlcoholAndTobaccoReference: "75", esrbMildDrugAlcoholAndTobaccoReference: "76", ceroRomance: "100", ceroSexual: "101", ceroViolence: "102", ceroFear: "103", ceroGambling: "104", ceroCrime: "105", ceroAlcohol: "106", ceroTobacco: "107", ceroNarcotics: "108", ceroLanguage: "109", ceroSmokingAndDrinking: "110", pegiFIBadLanguage: "14000", pegiFIDiscrimination: "14001", pegiFIDrugs: "14002", pegiFIFear: "14003", pegiFISex: "14004", pegiFIViolence: "14005", pegiFIGambling: "14006", pegiFIOnlineGameplay: "14007", pegiPTBadLanguage: "5000", pegiPTDiscrimination: "5001", pegiPTDrugs: "5002", pegiPTFear: "5003", pegiPTSex: "5004", pegiPTViolence: "5005", pegiPTGambling: "5006", pegiPTOnlineGameplay: "5007", grbSexuality: "11000", grbDrugs: "11001", grbViolence: "11002", grbCrime: "11003", grbHorror: "11004", grbGambling: "11005", grbLanguage: "11006", taiwanSex: "17001", taiwanViolence: "17002", taiwanHorror: "17003", taiwanDrug: "17004", taiwanTobaccoAndAlcohol: "17005", taiwanLanguage: "17006", taiwanAntiSocial: "17007", taiwanGambling: "17008", taiwanLoveAffairs: "17009", taiwanInappropriateContent: "17010", russianHealth: "19000", russianIllegalSubstance: "19001", russianIllegalBehavior: "19002", russianObscenities: "19003", russianViolence: "19004", russianAntiSocial: "19005", russianDisrespect: "19006", russianSexual: "19007", russianAgitation: "19008"
        }, SystemID: {
            esrb: "0", cero: "1", pegiFI: "14", pegiPT: "5", usk: "7", oflcAU: "8", oflcNZ: "9", grb: "11", djctq: "12", isfpb: "13", taiwan: "17", singapore: "18", russia: "19"
        }
});
WinJS.Namespace.define("MS.Entertainment.Utilities.Ratings", {legacyRatingIdMappings: (function() {
        var mapping = {};
        mapping[MS.Entertainment.Utilities.Ratings.RatingValue.esrbRatingPending10] = MS.Entertainment.Utilities.Ratings.RatingValue.esrbRatingPending;
        mapping[MS.Entertainment.Utilities.Ratings.RatingValue.oflcAUG] = MS.Entertainment.Utilities.Ratings.RatingValue.oflcAUGeneral;
        mapping[MS.Entertainment.Utilities.Ratings.RatingValue.oflcAUG8] = MS.Entertainment.Utilities.Ratings.RatingValue.oflcAUParentalGuidance;
        mapping[MS.Entertainment.Utilities.Ratings.RatingValue.oflcAUM15] = MS.Entertainment.Utilities.Ratings.RatingValue.oflcAUMature;
        mapping[MS.Entertainment.Utilities.Ratings.RatingValue.oflcAUMA15] = MS.Entertainment.Utilities.Ratings.RatingValue.oflcAUMature15;
        mapping[MS.Entertainment.Utilities.Ratings.RatingValue.oflcAURC] = MS.Entertainment.Utilities.Ratings.RatingValue.oflcAURestricted;
        mapping[MS.Entertainment.Utilities.Ratings.RatingValue.oflcAUX18] = MS.Entertainment.Utilities.Ratings.RatingValue.oflcAURestricted;
        mapping[MS.Entertainment.Utilities.Ratings.RatingValue.pegiFI3] = MS.Entertainment.Utilities.Ratings.RatingValue.pegiFIAge3;
        mapping[MS.Entertainment.Utilities.Ratings.RatingValue.pegiFI7] = MS.Entertainment.Utilities.Ratings.RatingValue.pegiFIAge7;
        mapping[MS.Entertainment.Utilities.Ratings.RatingValue.pegiFI12] = MS.Entertainment.Utilities.Ratings.RatingValue.pegiFIAge12;
        mapping[MS.Entertainment.Utilities.Ratings.RatingValue.pegiFI16] = MS.Entertainment.Utilities.Ratings.RatingValue.pegiFIAge16;
        mapping[MS.Entertainment.Utilities.Ratings.RatingValue.pegiFI18] = MS.Entertainment.Utilities.Ratings.RatingValue.pegiFIAge18;
        return mapping
    })()});
WinJS.Namespace.define("MS.Entertainment.Utilities.Ratings", {
    getSystemIDFromRating: function getSystemIDFromRating(ratingValue) {
        if (!ratingValue && typeof(ratingValue) !== "number")
            return;
        if (ratingValue in MS.Entertainment.Utilities.Ratings.legacyRatingIdMappings)
            ratingValue = MS.Entertainment.Utilities.Ratings.legacyRatingIdMappings[ratingValue];
        var systemID;
        if (ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.esrbEarlyChildhood || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.esrbEveryone || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.esrbEveryone10 || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.esrbTeen || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.esrbMature || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.esrbAdultOriented || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.esrbRatingPending)
            systemID = MS.Entertainment.Utilities.Ratings.SystemID.esrb;
        else if (ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.ceroAllAges || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.ceroB || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.ceroC || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.ceroD || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.ceroZ || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.ceroRatingPending)
            systemID = MS.Entertainment.Utilities.Ratings.SystemID.cero;
        else if (ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.pegiFIAge3 || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.pegiFIAge7 || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.pegiFIAge12 || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.pegiFIAge16 || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.pegiFIAge18)
            systemID = MS.Entertainment.Utilities.Ratings.SystemID.pegiFI;
        else if (ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.pegiPTAge4 || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.pegiPTAge6 || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.pegiPTAge12 || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.pegiPTAge16 || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.pegiPTAge18)
            systemID = MS.Entertainment.Utilities.Ratings.SystemID.pegiPT;
        else if (ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.uskAllAges || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.uskAge6 || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.uskAge12 || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.uskAge16 || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.uskNoYouth || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.uskRatingPending)
            systemID = MS.Entertainment.Utilities.Ratings.SystemID.usk;
        else if (ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.oflcAUExempt || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.oflcAUGeneral || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.oflcAUParentalGuidance || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.oflcAUMature || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.oflcAUMature15 || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.oflcAURestricted)
            systemID = MS.Entertainment.Utilities.Ratings.SystemID.oflcAU;
        else if (ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.oflcNZGeneral || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.oflcNZParentalGuidance || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.oflcNZMature || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.oflcNZRestricted13 || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.oflcNZRestricted15 || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.oflcNZRestricted16 || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.oflcNZRestricted18 || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.oflcNZRestricted)
            systemID = MS.Entertainment.Utilities.Ratings.SystemID.oflcNZ;
        else if (ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.grbAllAges || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.grbAge12 || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.grbAge15 || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.grbAge18)
            systemID = MS.Entertainment.Utilities.Ratings.SystemID.grb;
        else if (ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.djctqERI || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.djctqL || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.djctqAge10 || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.djctqAge12 || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.djctqAge14 || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.djctqAge16 || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.djctqAge18)
            systemID = MS.Entertainment.Utilities.Ratings.SystemID.djctq;
        else if (ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.isfpbAllAges || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.isfpbPG || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.isfpbAge10 || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.isfpbAge13 || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.isfpbAge16 || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.isfpbAge18 || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.isfpb10M || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.isfpb13M)
            systemID = MS.Entertainment.Utilities.Ratings.SystemID.isfpb;
        else if (ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.taiwanGeneral || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.taiwanProtected || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.taiwanParentalGuidance || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.taiwanParentalGuidance15 || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.taiwanRestricted18)
            systemID = MS.Entertainment.Utilities.Ratings.SystemID.taiwan;
        else if (ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.singaporeGeneral || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.singaporeAgeAdvisory || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.singaporeMature)
            systemID = MS.Entertainment.Utilities.Ratings.SystemID.singapore;
        else if (ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.russianAge0 || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.russianAge6 || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.russianAge12 || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.russianAge16 || ratingValue === MS.Entertainment.Utilities.Ratings.RatingValue.russianAge18)
            systemID = MS.Entertainment.Utilities.Ratings.SystemID.russia;
        return systemID
    }, getRatingString: function getRatingString(ratingValue) {
            if (!ratingValue && typeof(ratingValue) !== "number")
                return;
            if (ratingValue in MS.Entertainment.Utilities.Ratings.legacyRatingIdMappings)
                ratingValue = MS.Entertainment.Utilities.Ratings.legacyRatingIdMappings[ratingValue];
            var ratingString;
            switch (ratingValue) {
                case MS.Entertainment.Utilities.Ratings.RatingValue.esrbEarlyChildhood:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_0);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.esrbEveryone:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_10);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.esrbEveryone10:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_20);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.esrbTeen:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_30);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.esrbMature:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_40);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.esrbAdultOriented:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_50);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.esrbRatingPending:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_60);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.ceroAllAges:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_100);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.ceroB:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_110);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.ceroC:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_120);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.ceroD:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_130);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.ceroZ:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_140);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.ceroRatingPending:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_150);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.pegiFIAge3:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_14001);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.pegiFIAge7:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_14002);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.pegiFIAge12:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_14003);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.pegiFIAge16:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_14004);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.pegiFIAge18:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_14005);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.pegiPTAge4:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_5001);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.pegiPTAge6:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_5002);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.pegiPTAge12:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_5003);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.pegiPTAge16:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_5004);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.pegiPTAge18:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_5005);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.uskAllAges:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_7001);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.uskAge6:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_7002);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.uskAge12:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_7003);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.uskAge16:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_7004);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.uskNoYouth:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_7005);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.uskRatingPending:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_7006);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.oflcAUExempt:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_8006);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.oflcAUGeneral:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_8007);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.oflcAUParentalGuidance:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_8008);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.oflcAUMature:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_8009);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.oflcAUMature15:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_8010);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.oflcAURestricted:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_8011);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.oflcAUX18:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_8012);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.oflcNZGeneral:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_9001);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.oflcNZParentalGuidance:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_9002);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.oflcNZMature:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_9003);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.oflcNZRestricted13:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_9006);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.oflcNZRestricted15:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_9004);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.oflcNZRestricted16:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_9007);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.oflcNZRestricted18:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_9008);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.oflcNZRestricted:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_9005);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.grbAllAges:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_1101);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.grbAge12:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_1102);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.grbAge15:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_1103);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.grbAge18:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_1104);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.djctqERI:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_12006);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.djctqL:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_12001);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.djctqAge10:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_12007);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.djctqAge12:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_12002);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.djctqAge14:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_12003);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.djctqAge16:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_12004);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.djctqAge18:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_12005);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.isfpbAllAges:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_13001);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.isfpbPG:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_13002);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.isfpbAge10:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_13003);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.isfpbAge13:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_13004);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.isfpbAge16:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_13005);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.isfpbAge18:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_13006);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.isfpb10M:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_13007);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.isfpb13M:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_13008);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.taiwanGeneral:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_17001);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.taiwanProtected:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_17002);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.taiwanParentalGuidance:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_17003);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.taiwanParentalGuidance15:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_17005);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.taiwanRestricted18:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_17004);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.singaporeGeneral:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_18001);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.singaporeAgeAdvisory:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_18002);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.singaporeMature:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_18003);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.russianAge0:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_19001);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.russianAge6:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_19002);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.russianAge12:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_19003);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.russianAge16:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_19004);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingValue.russianAge18:
                    ratingString = String.load(String.id.IDS_GAMES_RATING_19005);
                    break;
                default:
                    break
            }
            return ratingString
        }, getRatingDescriptorString: function getRatingDescriptorString(ratingID) {
            if (!ratingID && typeof(ratingID) !== "number")
                return;
            var descriptorString;
            switch (ratingID) {
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbAlcohol:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_0);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbAnimatedBlood:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_1);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbBlood:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_2);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbBloodAndGore:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_3);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbCartoonHumor:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_4);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbComicMischief:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_5);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbCrudeHumor:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_6);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbDrugReference:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_7);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbEdutainment:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_8);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbFantasyViolence:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_9);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbInformational:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_10);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbIntenseViolence:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_11);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbLanguage:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_12);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbLyrics:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_13);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMatureHumor:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_14);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildViolence:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_15);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbNudity:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_16);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbPartialNudity:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_17);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbRealGambling:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_18);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbSexualThemes:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_19);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbSexualViolence:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_20);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbSimulatedGambling:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_21);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbAdultAssistance:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_22);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbStrongLanguage:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_23);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbStrongLyrics:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_24);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbStrongSexualContent:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_25);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbSuggestiveThemes:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_26);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbTobaccoReference:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_27);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbUseOfDrugs:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_28);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbUseOfAlcohol:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_29);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbUseOfTobacco:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_30);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbViolence:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_31);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbSexualContent:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_32);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildAlcoholReference:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_33);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildAnimatedBlood:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_34);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildBlood:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_35);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildBloodAndGore:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_36);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildCartoonViolence:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_37);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildComicMischief:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_38);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildCrudeHumor:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_39);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildDrugReference:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_40);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildFantasyViolence:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_41);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildLanguage:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_42);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildLyrics:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_43);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildMatureHumor:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_44);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildNudity:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_45);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildPartialNudity:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_46);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildRealGambling:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_47);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildSexualThemes:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_48);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildSexualViolence:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_49);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildSimulatedGambling:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_50);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildSuggestiveThemes:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_51);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildTobaccoReference:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_52);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildUseOfDrugs:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_53);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildUseOfAlcohol:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_54);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildUseOfTobacco:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_55);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildViolenceAlternate:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_56);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildSexualContent:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_57);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbViolentReferences:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_58);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildViolenceReferences:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_59);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbUseOfDrugsAndAlcohol:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_60);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbUseOfAlcoholAndTobacco:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_61);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbAlcoholAndTobaccoReference:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_62);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbAnimatedViolence:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_63);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildAnimatedViolence:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_64);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbAnimatedBloodAndGore:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_65);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbGore:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_66);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildUseOfDrugsAndAlcohol:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_67);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildUseOfDrugsAndTobacco:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_68);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildUseOfAlcoholAndTobacco:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_69);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildUseOfDrugsAlcoholAndTobacco:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_70);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbDrugAndAlcoholReference:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_71);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildDrugAndAlcoholReference:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_72);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbDrugAndTobaccoReference:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_73);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildDrugAndTobaccoReference:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_74);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbDrugAlcoholAndTobaccoReference:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_75);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.esrbMildDrugAlcoholAndTobaccoReference:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_76);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.ceroRomance:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_100);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.ceroSexual:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_101);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.ceroViolence:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_102);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.ceroFear:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_103);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.ceroGambling:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_104);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.ceroCrime:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_105);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.ceroAlcohol:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_106);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.ceroTobacco:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_107);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.ceroNarcotics:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_108);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.ceroLanguage:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_109);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.ceroSmokingAndDrinking:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_110);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.pegiFIBadLanguage:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_14000);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.pegiFIDiscrimination:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_14001);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.pegiFIDrugs:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_14002);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.pegiFIFear:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_14003);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.pegiFISex:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_14004);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.pegiFIViolence:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_14005);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.pegiFIGambling:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_14006);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.pegiFIOnlineGameplay:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_14007);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.pegiPTBadLanguage:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_5000);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.pegiPTDiscrimination:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_5001);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.pegiPTDrugs:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_5002);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.pegiPTFear:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_5003);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.pegiPTSex:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_5004);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.pegiPTViolence:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_5005);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.pegiPTGambling:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_5006);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.pegiPTOnlineGameplay:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_14007);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.grbSexuality:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_11000);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.grbDrugs:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_14002);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.grbViolence:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_14005);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.grbCrime:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_105);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.grbHorror:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_103);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.grbGambling:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_104);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.grbLanguage:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_109);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.taiwanSex:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_17001);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.taiwanViolence:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_17002);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.taiwanHorror:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_17003);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.taiwanDrug:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_17004);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.taiwanTobaccoAndAlcohol:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_17005);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.taiwanLanguage:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_17006);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.taiwanAntiSocial:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_17007);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.taiwanGambling:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_17008);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.taiwanLoveAffairs:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_17009);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.taiwanInappropriateContent:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_17010);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.russianHealth:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_19000);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.russianIllegalSubstance:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_19001);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.russianIllegalBehavior:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_19002);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.russianObscenities:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_19003);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.russianViolence:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_19004);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.russianAntiSocial:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_19005);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.russianDisrespect:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_19006);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.russianSexual:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_19007);
                    break;
                case MS.Entertainment.Utilities.Ratings.RatingDescriptor.russianAgitation:
                    descriptorString = String.load(String.id.IDS_GAMES_RATINGDESCRIPTOR_19008);
                    break;
                default:
                    break
            }
            return descriptorString
        }, hasLocaleInImagePath: function hasLocaleInImagePath(systemID) {
            if (!systemID && typeof(systemID) !== "number")
                return;
            if (systemID === MS.Entertainment.Utilities.Ratings.SystemID.esrb)
                return true;
            else
                return false
        }, getRatingImagePath: function getRatingImagePath(ratingValue) {
            if (!ratingValue && typeof(ratingValue) !== "number")
                return;
            if (ratingValue in MS.Entertainment.Utilities.Ratings.legacyRatingIdMappings)
                ratingValue = MS.Entertainment.Utilities.Ratings.legacyRatingIdMappings[ratingValue];
            var imagePath = String.empty;
            var systemID = MS.Entertainment.Utilities.Ratings.getSystemIDFromRating(ratingValue);
            if (systemID) {
                imagePath = MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_XboxAssets);
                imagePath += "vm_ems/DetailsPages/RatingSystemID/" + systemID;
                if (MS.Entertainment.Utilities.Ratings.hasLocaleInImagePath(systemID)) {
                    var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                    if (signedInUser && signedInUser.locale !== String.empty)
                        imagePath += "/" + signedInUser.locale;
                    else
                        imagePath += "/default"
                }
                else
                    imagePath += "/default";
                imagePath += "/Values/" + ratingValue + ".png"
            }
            return imagePath
        }
})
