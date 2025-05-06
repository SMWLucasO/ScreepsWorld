const DEFAULT_BEHAVIOUR = 0
const UPGRADE_BEHAVIOUR = 1
const BUILD_BEHAVIOUR = 2
const FIND_NEW_ROOM_BEHAVIOUR = 4;
const RETURN_TO_STORE_BEHAVIOUR = 8;

const DefaultBehaviour = {
    /** {Creep} creep **/
    assertBehaviourChange: (creep) => {
        let creeps = creep.room.find(FIND_MY_CREEPS, {
            filter: (c) => c.name !== creep.name
        });

        if ((creeps.length - Memory.migrators) > 6) {
            creep.memory.behaviour = RETURN_TO_STORE_BEHAVIOUR;
            return FindNewRoomBehaviour;
        }

        if (creep.store.getFreeCapacity() !== 0) return DefaultBehaviour;
        if ((Memory.builders + Memory.upgraders + 1) >= Object.values(Game.creeps).length - 2) return DefaultBehaviour;

        if (Memory.upgraders < 2) {
            if (!Memory.upgraders) Memory.upgraders = 0;
            Memory.upgraders += 1;

            creep.memory.behaviour = UPGRADE_BEHAVIOUR;
            return UpgradeBehaviour;
        }

        if (Memory.builders < 2) {
            if (!Memory.builders) Memory.builders = 0;
            Memory.builders += 1;

            creep.memory.behaviour = BUILD_BEHAVIOUR;
            return BuildBehaviour;
        }


        return DefaultBehaviour;
    },
    /** {Creep} creep **/
    run: (creep) => {
        if (creep.store.getFreeCapacity() === 0) {
            /** {Structure} targetStructures **/
            let targetStructures = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return [STRUCTURE_EXTENSION, STRUCTURE_SPAWN, STRUCTURE_TOWER].includes(structure.structureType)
                        && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                }
            });

            if (targetStructures.length === 0) return;
            if (creep.transfer(targetStructures[0], RESOURCE_ENERGY) !== ERR_NOT_IN_RANGE) return;
            creep.moveTo(targetStructures[0], { visualizePathStyle: { stroke: '#FF7700' } })
            return;
        }

        let sources = creep.room.find(FIND_SOURCES);
        if (creep.harvest(sources[0]) !== ERR_NOT_IN_RANGE) return;
        creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#00FF00' } })
    }
}

const UpgradeBehaviour = {
    /** {Creep} creep **/
    assertBehaviourChange: (creep) => {
        if (creep.store.getFreeCapacity() === 50) {
            creep.memory.behaviour = DEFAULT_BEHAVIOUR;
            Memory.upgraders -= 1;
            return DefaultBehaviour;
        }

        return UpgradeBehaviour;
    },
    /** {Creep} creep **/
    run: (creep) => {
        if (creep.upgradeController(creep.room.controller) !== ERR_NOT_IN_RANGE) return;
        creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#FF7700' } });
    }
};

const BuildBehaviour = {
    /** {Creep} creep **/
    assertBehaviourChange: (creep) => {
        if (creep.store.getFreeCapacity() === 50) {
            creep.memory.behaviour = DEFAULT_BEHAVIOUR;
            Memory.builders -= 1;
            return DefaultBehaviour;
        }
        return BuildBehaviour;
    },
    /** {Creep} creep **/
    run: (creep) => {
        let targets = creep.room.find(FIND_CONSTRUCTION_SITES);

        if (creep.build(targets[0]) !== ERR_NOT_IN_RANGE) return;
        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ff7700'}});
    }
};

const FindNewRoomBehaviour = {
    /** {Creep} creep **/
    assertBehaviourChange: (creep) => {
        let creeps = creep.room.find(FIND_MY_CREEPS, {
            filter: (c) => c.name !== creep.name
        });

        if ((creeps.length - Memory.migrators) > 6) return FindNewRoomBehaviour;

        creep.memory.behaviour = DEFAULT_BEHAVIOUR;
        Memory.migrators -= 1;

        return DefaultBehaviour;
    },
    /** {Creep} creep **/
    run: (creep) => {
        let targets = creep.room.find(FIND_EXIT);
        creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#FF7700' } });
    }
};

const BehaviorSystem = {
    getBehaviours: () => {
        return {
            [DEFAULT_BEHAVIOUR]: DefaultBehaviour,
            [UPGRADE_BEHAVIOUR]: UpgradeBehaviour,
            [BUILD_BEHAVIOUR]: BuildBehaviour,
            [FIND_NEW_ROOM_BEHAVIOUR]: FindNewRoomBehaviour,
            [RETURN_TO_STORE_BEHAVIOUR]: DefaultBehaviour
        }
    },
    run: (creep) => {
        if (!creep.memory.behaviour) {
            creep.memory.behaviour = DEFAULT_BEHAVIOUR;
        }

        if (!Memory.upgraders) Memory.upgraders = 0;
        if (!Memory.builders) Memory.builders = 0;
        if (!Memory.migrators) Memory.migrators = 0;

        const behaviour = (
            BehaviorSystem.getBehaviours()[creep.memory.behaviour]
                .assertBehaviourChange(creep)
        );

        behaviour.run(creep);
    }
};



module.exports = BehaviorSystem;