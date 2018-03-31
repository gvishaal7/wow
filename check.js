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

const raid_buffs = {
    inc_melee_haste : [roles.melee.dk[1], roles.melee.shaman[0], roles.tank.dk[0], roles.tank.dk[1]],
    inc_melee_crit : [roles.tank.druid[0], roles.melee.druid[0], roles.melee.warrior[0]],
    inc_melee_power : [roles.tank.dk[0], roles.tank.dk[1], roles.melee.shaman[0], roles.melee.dk[0], roles.ranged.hunter[0]],
    red_spell_hit : [roles.ranged.druid[0], roles.ranged.priest[0]],
    inc_spell_crit : [roles.ranged.druid[0], roles.ranged.shaman[0]],
    inc_spell_haste : [roles.healer.shaman[0], roles.ranged.shaman[0]],
    inc_damage : [roles.ranged.mage[0], roles.melee.paladin[0], roles.ranged.hunter[1]],
    inc_crit : [roles.melee.paladin[0], roles.melee.rogue[0]],
    inc_haste : [roles.melee.paladin[0], roles.ranged.druid[0]],
    inc_spell_dmg_taken : [roles.ranged.warlock[0], roles.ranged.warlock[1], roles.ranged.warlock[2], roles.melee.dk[2], roles.ranged.druid[0]],
    red_armor : [roles.tank.warrior[0], roles.melee.warrior[0], roles.melee.warrior[1], roles.melee.rogue[1]],
    inc_melee_dmg : [roles.melee.rogue[1], roles.melee.warrior[1]], 
    inc_armor : [roles.tank.paladin[0], roles.ranged.shaman[0], roles.healer.shaman[0], roles.melee.shaman[0]],
    inc_spell_crit_taken : [roles.ranged.warlock[0], roles.ranged.warlock[1], roles.ranged.mage[1]],
    red_phy_dmg_taken : [roles.healer.priest[0], roles.healer.priest[1], roles.healer.shaman[0]],
    red_attack_power : [roles.tank.warrior[0], roles.tank.druid[0], roles.melee.warrior[0], roles.tank.paladin[0]],
    red_attack_speed : [roles.tank.dk[0], roles.tank.dk[1], roles.melee.dk[1], roles.melee.dk[2], roles.tank.druid[0], roles.tank.warrior[0], roles.tank.paladin[0]],
    inc_healing : [roles.healer.druid[0], roles.tank.paladin[0]],
    replenishment : [roles.melee.paladin[0], roles.ranged.priest[0], roles.ranged.warlock[2]],
    bleed_dmg : [roles.melee.warrior[1], roles.melee.druid[0], roles.tank.druid[0]],
    red_dmg_taken : [roles.tank.paladin[0], roles.healer.priest[0]],
    inc_sp : [roles.ranged.warlock[0], roles.ranged.shaman[0], roles.healer.shaman[0]]
};

const class_buffs = {
    dk : {
        HoW : { //Horn of Winter
            Strength : +155,
            Agility : +155
        }
    },
    druid : {
        GoW : { //gift of the wild
            Armor : +1050,
            Agility : +51,
            Strength : +51,
            Stamina : +51,
            Intellect : +51,
            Spirit : +51,
            Arcane_Resistance : +75,
            Fire_Resistance : +75,
            Nature_Resistance : +75,
            Frost_Resistance : +75,
            Shadow_Resistance : +75
        },
        MoW : { //mark of the wild
            Armor : +1050,
            Agility : +51,
            Strength : +51,
            Stamina : +51,
            Intellect : +51,
            Spirit : +51,
            Arcane_Resistance : +75,
            Fire_Resistance : +75,
            Nature_Resistance : +75,
            Frost_Resistance : +75,
            Shadow_Resistance : +75
        }
    },
    paladin : {
        GBOK : { //greater blessings of kings
            Agility : 0.1,
            Strength : 0.1,
            Stamina : 0.1,
            Intellect : 0.1,
            Spirit : 0.1
        },
        GBOW : { //greater blessings of wisdom
            MP5 : +92
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

