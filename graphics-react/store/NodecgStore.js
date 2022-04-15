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
        } else if(action.type == "MESSAGE_RECEIVED") {
            this.emit("message", {subType: action.subType, data: action.value});
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

const listen = (name) => {
    nodecg.listenFor(name, (value, ack) => {
        dispatcher.dispatch({
            type: "MESSAGE_RECEIVED",
            subType: name,
            value: value
        })
    })
}

const nodeCGStore = new NCGStore();
dispatcher.register(nodeCGStore.handleActions.bind(nodeCGStore));

export default nodeCGStore
export {replicate, listen}