/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.harvester');
 * mod.thing == 'a thing'; // true
 */

let harvesterRole = {
    /** @param {Creep} creep **/
    run: (creep) => {
        let harvestersInRoom = _.sum(Game.creeps, (c) => c.memory.role === 'harvester' && c.room === creep.room);

        if (harvestersInRoom >= 5) {
            let possibleExit = _.sortBy(creep.room.find(FIND_EXIT), (room) => room.find(FIND_MY_CREEPS, 'memory.role').length);
            creep.moveTo(possibleExit[0]);
            return;
        }

        if (creep.store.getFreeCapacity() > 0) {
            let sources = creep.room.find(FIND_SOURCES);

            if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {
                    visualizePathStyle: {
                        stroke: '#FF0000',
                    }
                });
            }

            return;
        }

        /** {Structure} targetStructures **/
        let targetStructures = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return [STRUCTURE_EXTENSION, STRUCTURE_SPAWN, STRUCTURE_TOWER].includes(structure.structureType)
                    && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            }
        });

        if (targetStructures.length == 0) return;

        if (creep.transfer(targetStructures[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targetStructures[0], {
                visualizePathStyle: {
                    stroke: '#00FFFF'
                }
            });
        }
    },
};

module.exports = harvesterRole;