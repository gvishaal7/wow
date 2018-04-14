var fs = require('fs');
var request = require('request');
var async = require('async');
var express = require('express');
var mysql = require('mysql');

var app = express();
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "wow"
});

const warmane_guild_api = "http://armory.warmane.com/api/guild/";
const warmane_character_api = "http://armory.warmane.com/api/character/";
const warmane_character_page = "http://armory.warmane.com/character/";
const server = "/Icecrown/summary";

const roles = {  
    'Druid' : {
        'Feral Combat' : ["Tank","Melee"],
        'Balance' : ["Ranged"],
        'Restoration' : ["Healer"]
    },
    'Death Knight' : {
        'Blood' : ["Tank","Melee"],
        'Frost' : ["Tank","Melee"],
        'Unholy' : ["Melee"]
    },
    'Hunter' : {
        'Marksman' : ["Ranged"],
        'Beast Mastery' : ["Ranged"]
    },
    'Mage' : {
        'Arcane' : ["Ranged"],
        'Fire' : ["Ranged"]
    },
    'Paladin' : {
        'Protection' : ["Tank"],
        'Holy' : ["Healer"],
        'Retribution' : ["Melee"]
    },
    'Priest' : {
        'Discipline' : ["Healer"],
        'Holy' : ["Healer"],
        'Shadow' : ["Ranged"]
    },
    'Rogue' : {
        'Assassination' : ["Melee"],
        'Combat' : ["Melee"]
    },
    'Shaman' : {
        'Restoration' : ["Healer"],
        'Elemental' : ["Ranged"],
        'Enhancement' : ["Melee"]
    },
    'Warrior' : {
        'Protection' : ["Tank"],
        'Fury' : ["Melee"],
        'Arms' : ["Melee"]
    },
    'Warlock' : {
        'Affliction' : ["Ranged"],
        'Demonology' : ["Ranged"],
        'Destruction' : ["Ranged"]
    }
};

//const roles = {
//    tank : {
//        dk : ["Blood","Frost"],
//        druid : ["Feral Combat"], //bear
//        warrior : ["Protection"],
//        paladin : ["Protection"]
//        /*
//         * dk can tank in all the three specs, but most commonly used specs 
//         * are blood and frost
//         */
//    },
//    healer : {
//        druid : ["Restoration"],
//        shaman : ["Restoration"],
//        priest : ["Discipline","Holy"],
//        paladin : ["Holy"]
//    },
//    ranged : {
//        druid : ["Balance"],
//        priest : ["Shadow"],
//        shaman : ["Elemental"],
//        mage : ["Arcane","Fire"],
//        warlock : ["Demonology","Affliction","Destruction"],
//        hunter : ["Marksman","Beast Mastery"]
//        /*
//         * since we are considering only PvE,
//         * we ignore Frost Mage and Survival Hunter
//         */
//    },
//    melee : {
//        druid : ["Feral Combat"], //cat
//        shaman : ["Enhancement"],
//        paladin : ["Retribution"],
//        warrior : ["Fury","Arms"],
//        dk : ["Blood","Frost","Unholy"],
//        rogue : ["Assassination","Combat"]
//        /*
//         * sinc we are considering only PvE,
//         * we ignore Subtlety Rogue
//         */
//    }
//};

/*
 * inc => increased effect for players +
 * red => decreased effect for npc - 
 * taken => increased -ve effect taken by npc -
 */

var start_time;
var end_time;

function get_roles(talent, cls) {
    var raid_roles = [];
    if(talent[0] !== undefined && talent[0]['tree'] !== undefined && roles[cls][talent[0]['tree']] !== undefined) {
        raid_roles = raid_roles.concat(roles[cls][talent[0]['tree']]);
    }
    if(talent[1] !== undefined && talent[1]['tree'] !== undefined && roles[cls][talent[1]['tree']] !== undefined) {
        raid_roles = raid_roles.concat(roles[cls][talent[1]['tree']]);
    }
    if(raid_roles.length === 0 || raid_roles[0] === undefined) {
        raid_roles = ["PvP"];
    }
    return raid_roles;
}

function get_profs(profs) {
    var profs_name = [];
    if(profs[0] !== undefined && profs[0]['name'] !== undefined) {
        profs_name.push(profs[0]['name']);
    }
    if(profs[1] !== undefined && profs[1]['name'] !== undefined) {
        profs_name.push(profs[1]['name']);
    }
    return profs_name;
}

function get_comments(player, callback) {
    var equip = player['equip'];
    var prof = player['prof'] = get_profs(player['prof']);    
    var talents = player['talents'];
    var name = player['name'];
    var item_ids = [];
    for(var i in equip) {
        item_ids.push(equip[i]['item']);
    }
    var query = "SELECT id,name,slot,type,sockets,gs,p_type FROM items WHERE id IN ?";
    var total_gs = 0;
    con.query(query,[[item_ids]], function(error, response) {
        if(error) throw error;
        if(response !== undefined && response.length > 0) {            
            player['equip'] = response;
            equip = response;
        }
        for(var i in response) {
            total_gs += response[i]['gs'];
        }
        player['gs'] = total_gs;
        player['roles'] = get_roles(talents,player['class']);
        const armory_page = warmane_character_page+name+server;
        request({
            url : armory_page,
            method : "GET",
            family : 4
        }, function(error, response, body) {
            var comments = "";
            if(error) throw error;
            body = body.toString();
            var pvp_flag = false;
            for(var i in equip) {
                var slot = equip[i]['slot'];
                var p_type = equip[i]['p_type'];
                var type = equip[i]['type'];
                if(p_type === "PvP") {
                    pvp_flag = true;
                }
                if(slot !== "Trinket") {
                    var id = equip[i]['id'];               
                    var start_index = body.search('rel="item='+id);
                    var end_index = body.indexOf(">",start_index);
                    var trimmed_body = body.substring(start_index+16,end_index);
                    //console.log(trimmed_body);
                    if(slot !== "Neck") {
                        
                    }
                }
            } 
            if(pvp_flag === true) {
                comments = "The player has equiped PvP items.|";
            }
            player['comment'] = comments;
            //console.log(player);
            callback(error,player);
        });
    });
}

function get_player_details(ppl,res) {
    var urls = [];
    for(var i in ppl) {
        urls.push(warmane_character_api+ppl[i]+server);
    } 
    async.map(urls, get_details, function(error,body) {
        if(error) throw error;
        var players = [];
        for(var i in body) {
            var temp = JSON.parse(body[i]);
            var player = {};
            player['name'] = temp['name'];
            player['class'] = temp['class'];
            player['equip'] = temp['equipment'];
            player['prof'] = temp['professions'];
            player['achiv'] = temp['achievementpoints'];
            player['talents'] = temp['talents'];
            players.push(player);
        }
        async.map(players,get_comments,function(error,body) {
            if(error) throw error;
            //console.log(body[0]);
            res.send('success');
            end_time = new Date().getTime() - start_time;
            console.log("time : "+(end_time/1000)+"s");
        });
    });
}

function get_details(url,callback) {
    request({
        url : url,
        method : "GET",
        family : 4
    },function(error, response, body){
        if(error) throw error;
        callback(error,body);
    });
}

function get_guild_list(guild_name,res) {
    var guild_page = [warmane_guild_api+guild_name+server];
    async.map(guild_page,get_details,function(error,body) {
        if(error) throw error;
        body = JSON.parse(body);
        if(body['error'] === undefined) {
            var roster = body['roster'];
            var ppl_online = [];
            for(var i in roster) {
                if(roster[i]['online'] === true) {
                    ppl_online.push(roster[i]['name']);
                }
            }
            get_player_details(ppl_online,res);
        }
        else {
            res.send("Guild does not exist");
        }
    });
}

app.get('/myForm',function(req,res) {
    start_time = new Date().getTime();
    var guild_name = req.query.name.toString();
    get_guild_list(guild_name,res);
});

app.listen(8123, function(){
    console.log("listening to port 8123");
});