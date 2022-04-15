import { EventEmitter } from "events";
import dispatcher from "../dispatcher";

class NCGStore extends EventEmitter {
    constructor() {
        super();
        this.replicants = {};
    }

    getReplicants() {
        return this.replicants;
    }

    handleActions(action) {
        if(action.type == "SET_REPLICANT") {
            this.replicants[action.name] = action.value;
            this.emit("change");
        }
    }
}

const replicate = (name) => {
    const replicant = nodecg.Replicant(name);
    NodeCG.waitForReplicants(replicant).then(() => {
        replicant.on('change', (newValue) => {
            dispatcher.dispatch({
                type: "SET_REPLICANT",
                name: replicant.name,
                value: newValue
            })
        })
    })
}

const setReplicant = (name, value) => {
    const replicant = nodecg.Replicant(name);
    replicant.value = value;
}

const sendMessage = (type, data) => {
    nodecg.sendMessage(type, data);
}

const nodeCGStore = new NCGStore();
dispatcher.register(nodeCGStore.handleActions.bind(nodeCGStore));

export default nodeCGStore
export {replicate, setReplicant, sendMessage}