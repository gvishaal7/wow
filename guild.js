var fs = require('fs');
var request = require('request');
var async = require('async');
var express = require('express');

var app = express();
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

const warmane_guild_api = "http://armory.warmane.com/api/guild/";
const warmane_character_api = "http://armory.warmane.com/api/character/";
const warmane_character_page = "http://armory.warmane.com/character/";
const server = "/Icecrown/summary";

/*
const default_types = ["Head","Neck","Shoulder","Chest","Back","Shirt","Tabard","Wrist","One-hand","Two-hand",
                        "Off Hand","Main Hand","Ranged","Held In Off-Hand","Relic","Thrown","Hands","Waist",
                        "Legs","Feet","Finger","Trinket"];                    
const item_slots = {
    Back:0.5625,
    Chest:1,
    Feet:0.75,
    Finger:0.5625,
    Hands:0.75,
    Head:1,
    Legs:1,
    MainHand:1,
    Neck:0.5625,
    OffHand:1,
    Ranged:0.3164,
    Shoulders:0.75,
    Trinket:0.5625,
    Waist:0.75,
    Wrist:0.5625,
    TwoHand:2,
    OneHand:1
};

const gs_formula = {
    A : {
        4 : { A : 91.4500, B : 0.6500 },
        3 : { A : 81.3750, B : 0.8125 },
        2 : { A : 73.0000, B : 1.0000 }
    },
    B : {
        4 : { A : 26.0000, B : 1.2000 },
        3 : { A :  0.7500, B : 1.8000 },
        2 : { A :  8.0000, B : 2.0000 },
        1 : { A :  0.0000, B : 2.2500 }
    }
};

const rarity_maping = { 
    Epic : [1,1.8618,gs_formula['A'][4]],
    Rare : [1,1.8618,gs_formula['A'][3]],
    Uncommon : [1,1.8618,gs_formula['A'][2]],
    Legendary : [1.3,1.8618,gs_formula['A'][4]],
    Poor : [0,0,0],
    Common : [0,0,0]
};
*/


const roles = {
    tank : {
        dk : ["Blood","Frost"],
        druid : ["Feral Combat"], //bear
        warrior : ["Protection"],
        paladin : ["Protection"]
        /*
         * dk can tank in all the three specs, but most commonly used specs 
         * are blood and frost
         */
    },
    healer : {
        druid : ["Restoration"],
        shaman : ["Restoration"],
        priest : ["Discipline","Holy"],
        paladin : ["Holy"]
    },
    ranged : {
        druid : ["Balance"],
        priest : ["Shadow"],
        shaman : ["Elemental"],
        mage : ["Arcane","Fire"],
        warlock : ["Demonology","Affliction","Destruction"],
        hunter : ["Marksman","Beast Mastery"]
        /*
         * since we are considering only PvE,
         * we ignore Frost Mage and Survival Hunter
         */
    },
    melee : {
        druid : ["Feral Combat"], //cat
        shaman : ["Enhancement"],
        paladin : ["Retribution"],
        warrior : ["Fury","Arms"],
        dk : ["Blood","Frost","Unholy"],
        rogue : ["Assassination","Combat"]
        /*
         * sinc we are considering only PvE,
         * we ignore Subtlety Rogue
         */
    }
};

/*
 * inc => increased effect for players
 * red => decreased effect for npc
 * taken => increased -ve effect taken by npc
 */


var raid_buffs = {
    inc_melee_haste : [roles.melee.dk[1], roles.melee.shaman[0], roles.tank.dk[0], roles.tank.dk[1]],
    inc_melee_crit : [roles.tank.druid[0], roles.melee.druid[0], roles.melee.warrior[0]],
    inc_melee_power : [roles.tank.dk[0], roles.tank.dk[1], roles.melee.shaman[0], roles.melee.dk[0], roles.ranged.hunter[0]],
    red_spell_hit : [roles.ranged.druid[0], roles.ranged.priest[0]],
    inc_spell_crit : [roles.ranged.druid[0], roles.ranged.shaman[0]],
    inc_spell_haste : [roles.healer.shaman[0], roles.ranged.shaman[0]],
    inc_damage : [roles.ranged.mage[0], roles.melee.paladin[0]],
    inc_crit : [roles.melee.paladin[0], roles.melee.rogue[0]],
    inc_haste : [roles.melee.paladin[0], roles.ranged.druid[0]],
    inc_spell_dmg_taken : [roles.ranged.warlock[0], roles.ranged.warlock[1], roles.ranged.warlock[2], roles.melee.dk[2], roles.ranged.druid[0]],
    red_armor : [roles.tank.warrior[0], roles.melee.warrior[0], roles.melee.warrior[1], roles.melee.rogue[1]],
    inc_melee_dmg : [roles.melee.rogue[1]],
    inc_armor : [roles.tank.paladin[0], roles.ranged.shaman[0], roles.healer.shaman[0], roles.melee.shaman[0]],
    inc_spell_crit_taken : [roles.ranged.warlock[0], roles.ranged.warlock[1], roles.ranged.mage[1]],
    red_phy_dmg : [roles.healer.priest[0], roles.healer.priest[1], roles.healer.shaman[0]],
    red_attack_power : [roles.tank.warrior[0], roles.tank.druid[0], roles.melee.warrior[0], roles.tank.paladin[0]],
    red_attack_speed : [roles.tank.dk[0], roles.tank.dk[1], roles.melee.dk[1], roles.melee.dk[2], roles.tank.druid[0]],
    inc_healing : [roles.healer.druid[0]],
    replenishment : [roles.melee.paladin[0], roles.ranged.priest[0]]
};

var class_buffs = {
    dk : {
        HoW : { //Horn of Winter
            Strength : +155,
            Agility : +155
        }
    },
    druid : {
        GoW : { //gift of the wild
            Armor : 1050,
            Agility : 51,
            Strength : 51,
            Stamina : 51,
            Intellect : 51,
            Spirit : 51,
            Arcane_Resistance : +75,
            Fire_Resistance : +75,
            Nature_Resistance : +75,
            Frost_Resistance : +75,
            Shadow_Resistance : +75
        },
        MoW : { //mark of the wild
            Armor : 1050,
            Agility : 51,
            Strength : 51,
            Stamina : 51,
            Intellect : 51,
            Spirit : 51,
            Arcane_Resistance : +75,
            Fire_Resistance : +75,
            Nature_Resistance : +75,
            Frost_Resistance : +75,
            Shadow_Resistance : +75
        }
    },
    paladin : {
        GBOK : { //greater blessings of kings
            Agility : "10%",
            Strength : "10%",
            Stamina : "10%",
            Intellect : "10%",
            Spirit : "10%"
        },
        GBOW : { //greater blessings of wisdom
            MP5 : 92
        },
        GBOM : { //greater blessings of might
            Attack_Power : +550
        },
        GBOS : { //greater blessings of sanctuary
            Strength : "10%",
            Stamina : "10%"
        }
    },
    priest : {
        fortitude : { //Power Word : Fortitue
            Stamina : +214
        },
        spirit : { //prayer of divine spirit
            Spirit : +80
        },
        shadow : { //prayer of shadow protection
            Shadow_Resistance : +130
        }
    },
    warrior : {
        BS : { //battle shout
            Attack_Power : +550
        },
        CS : { //commanding shout
            Health : 2255
        }
    }
};


var start_time;
var end_time;

function get_comments(player, callback) {
    
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
            console.log(body[0]);
            res.send('success');
            end_time = new Date().getTime() - start_time;
            console.log("time : "+(end_time/1000)+"s");
        });
    });
}

function get_details(url,callback) {
    request({
        url : url,
        method : "GET"
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