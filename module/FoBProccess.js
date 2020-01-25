const events = require('events');
const FoBCore = require("./FoBCore");

let NeighborDict = [];
let FriendsDict = [];
let ClanMemberDict = [];

function GetNeighbor(data) {
    //NeighborDict = [];
    for (let i = 0; i < data.length; i++) {
        const resData = data[i];
        if (resData["requestClass"] === "OtherPlayerService" && resData["requestMethod"] === "getNeighborList") {
            let Neighbors = resData["responseData"];
            for (let x = 0; x < Neighbors.length; x++) {
                const neighbor = Neighbors[x];
                if (neighbor["is_self"] !== true) {
                    NeighborDict.push({
                        key: neighbor["player_id"],
                        canMotivate: (undefined === neighbor["next_interaction_in"] ? true : false),
                        item: neighbor
                    });
                }
            }
        }
    }
    return NeighborDict;
}

function GetFriends(data) {
    //FriendsDict = [];
    for (let i = 0; i < data.length; i++) {
        const resData = data[i];
        if (resData["requestClass"] === "OtherPlayerService" && resData["requestMethod"] === "getFriendsList") {
            let Friends = resData["responseData"];
            for (let x = 0; x < Friends.length; x++) {
                const friend = Friends[x];
                if (friend["is_self"] !== true) {
                    FriendsDict.push({
                        key: friend["player_id"],
                        canMotivate: (undefined === friend["next_interaction_in"] ? true : false),
                        taverninfo: [],
                        item: friend
                    });
                }
            }
        }
    }
    return FriendsDict;
}

function GetClanMember(data) {
    //ClanMemberDict = [];
    for (let i = 0; i < data.length; i++) {
        const resData = data[i];
        if (resData["requestClass"] === "OtherPlayerService" && resData["requestMethod"] === "getClanMemberList") {
            let ClanMember = resData["responseData"];
            for (let x = 0; x < ClanMember.length; x++) {
                const Member = ClanMember[x];
                if (Member["is_self"] !== true) {
                    ClanMemberDict.push({
                        key: Member["player_id"],
                        canMotivate: (undefined === Member["next_interaction_in"] ? true : false),
                        item: Member
                    });
                }
            }
        }
    }
    return ClanMemberDict;
}

function GetMotivateResult(data) {
    var reward = 0;
    var result = "";
    for (let i = 0; i < data.length; i++) {
        const resData = data[i];
        if (resData["requestClass"] === "OtherPlayerService" && resData["requestMethod"] === "rewardResources") {
            let rew = resData["responseData"]["resources"];
            reward = rew['money'];
        }
        if (resData["requestClass"] === "OtherPlayerService" && resData["requestMethod"] === "polivateRandomBuilding") {
            result = resData["responseData"]["action"];
        }
    }
    return { result: result, reward: reward };
}

function GetTavernInfo(data) {
    for (let i = 0; i < data.length; i++) {
        const resData = data[i];
        if (resData["requestClass"] === "FriendsTavernService" && resData["requestMethod"] === "getOtherTavernStates") {
            let TavernInfo = resData["responseData"];
            for (let x = 0; x < TavernInfo.length; x++) {
                const Tavern = TavernInfo[x];
                if (FriendsDict.length > 0) {
                    for (let i = 0; i < FriendsDict.length; i++) {
                        const friend = FriendsDict[i];
                        if (friend.key === Tavern["ownerId"])
                            friend.taverninfo = Tavern;
                    }
                }
            }
        }
    }
}

function GetTavernResult(data) {
    for (let i = 0; i < data.length; i++) {
        const resData = data[i];
        if (resData["requestClass"] === "FriendsTavernService" && resData["requestMethod"] === "getOtherTavern") {
            let TavernResult = resData["responseData"];
            return TavernResult;
        }
    }
}

function GetVisitableTavern(FriendsList) {
    return FriendsList.filter(friend => {
        return (undefined !== friend.taverninfo && undefined === friend.taverninfo["state"] && friend.taverninfo["sittingPlayerCount"] < friend.taverninfo["unlockedChairCount"])
    });
}
function GetTavernReward(data) {
    var result = "";
    if (typeof(data["rewardResources"]["resources"]) === "object") {
        if (undefined !== data["rewardResources"]["resources"]["tavern_silver"])
            result += `${data["rewardResources"]["resources"]["tavern_silver"]} Silver `;
        if (undefined !== data["rewardResources"]["resources"]["strategy_points"])
            result += `${data["rewardResources"]["resources"]["strategy_points"]} FPs `;
    }
    else {
        return "none"
    }
    return result;
}

function GetLGResult(data, ArcBonus) {
    let PossibleLGDict = [];
    for (let i = 0; i < data.length; i++) {
        const resData = data[i];
        if (resData["requestClass"] === "GreatBuildingsService" && resData["requestMethod"] === "getOtherPlayerOverview") {
            let LGData = resData["responseData"];
            let _PlayerName = LGData[0]["player"]["name"];
            let _PlayerID = LGData[0]["player"]["player_id"];
            for (let x = 0; x < LGData.length; x++) {
                const LG = LGData[x];
                let EntityID = LG["entity_id"],
                    CityEntityID = LG["city_entity_id"],
                    Name = LG["name"],
                    Level = LG["level"],
                    CurrentProgress = LG["current_progress"],
                    MaxProgress = LG["max_progress"],
                    Rank = LG["rank"];

                let Gewinn = undefined;
                let UnderScorePos = CityEntityID.indexOf('_');
                let AgeString = CityEntityID.substring(UnderScorePos + 1);
                UnderScorePos = AgeString.indexOf('_');
                AgeString = AgeString.substring(0, UnderScorePos);
                if (CurrentProgress === undefined)
                    CurrentProgress = 0;
                let P1 = FoBCore.GetP1(AgeString, Level);
                ArcBonus = (ArcBonus === 0 ? 1 : ArcBonus);
                if (Rank === undefined && P1 * ArcBonus >= (MaxProgress - CurrentProgress) / 2) {
                    if (Gewinn === undefined || Gewinn >= 0) {
                        let GewinnString = undefined,
                            KursString = "";

                        if (CurrentProgress === 0) {
                            GewinnString = Math.round(P1 * arc) - Math.ceil((MaxProgress - CurrentProgress) / 2);
                            KursString = FormatKurs(Math.round(MaxProgress / P1 / 2 * 1000) / 10);
                        }
                        else if (Gewinn === undefined) {
                            GewinnString = '???';
                            KursString = '???%';
                        }
                        else {
                            GewinnString = Gewinn;
                        }
                        PossibleLGDict.push({
                            PlayerID: _PlayerID,
                            PlayerName: _PlayerName,
                            EntityID: EntityID,
                            Name: Name,
                            Level: Level,
                            string: GewinnString,
                            short: KursString,
                            LG: LG,
                        });
                    }
                }
            }
        }
    }
    return PossibleLGDict;
}
function GetArcBonus(data) {
    for (let i = 0; i < data.length; i++) {
        const resData = data[i];
        if (resData["requestClass"] === "BonusService" && resData["requestMethod"] === "getLimitedBonuses") {
            let x = resData["responseData"];
            let ArcBonus = 0;
            for (let j in x) {
                if (x[j].type === 'contribution_boost') {
                    ArcBonus += x[j].value;
                }
            }
            return ArcBonus;
        }
    }
}
function clearLists() {
    NeighborDict = [];
    FriendsDict = [];
    ClanMemberDict = [];
}
function FormatKurs(k) {
    if (Kurs === 0)
        return '-';
    else
        return Kurs + '%';
}

exports.GetNeighbor = GetNeighbor;
exports.GetClanMember = GetClanMember;
exports.GetFriends = GetFriends;
exports.GetTavernInfo = GetTavernInfo;
exports.GetVisitableTavern = GetVisitableTavern;
exports.GetLGResult = GetLGResult;
exports.GetArcBonus = GetArcBonus;
exports.GetTavernReward = GetTavernReward;
exports.GetMotivateResult = GetMotivateResult;
exports.GetTavernResult = GetTavernResult;
exports.ClanMemberDict = ClanMemberDict;
exports.FriendsDict = FriendsDict;
exports.NeighborDict = NeighborDict;
exports.clearLists = clearLists;