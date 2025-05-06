let harvesting = require('role.harvester');
let upgrading = require('role.upgrader');
let building = require('role.builder');

const ROLE_MAPPINGS = {
    "harvester": harvesting,
    "upgrader": upgrading,
    "builder": building
}

const REQUIREMENTS = {
    "harvester": {
        "amount": 4,
        "build": [MOVE, WORK, CARRY, MOVE]
    },
    "upgrader": {
        "amount": 1,
        "build": [MOVE, MOVE, WORK, CARRY],
    },
    "builder": {
        "amount": 1,
        "build": [MOVE, MOVE, WORK, CARRY]
    },

}

var spawner = {
    run: function() {
        for (var name in Memory.screeps) {
            if (!(Game.creeps[name])) {
                delete Memory.creeps[name];
            }
        }

        for (let name in Game.creeps) {
            let creep = Game.creeps[name];
            console.log('hi');
            console.log(creep.memory.role)
            ROLE_MAPPINGS[creep.memory.role].run(creep);
        }

        for (let botType of Object.keys(REQUIREMENTS)) {
            var entity = _.filter(Game.creeps, (creep) => creep.memory.role == botType);

            if (entity.length < REQUIREMENTS[botType].amount) {
                Game.spawns['Spawn1'].spawnCreep(REQUIREMENTS[botType].build, `Stagiair #${Game.time}`, {
                    memory: {
                        role: botType
                    }
                });
            }
        }

        if (Game.spawns['Spawn1'].spawning) {
            let spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
            Game.spawns['Spawn1'].room.visual.text('🛠️' + spawningCreep.memory.role, Game.spawns['Spawn1'].pos.x + 1, Game.spawns['Spawn1'].pos.y, {align: 'left', opacity: 0.8})
        }
    }
};

module.exports = spawner;