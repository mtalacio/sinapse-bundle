var {WebSocketServer} = require('ws');

function makeId(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

module.exports = nodecg => {
    const wss = new WebSocketServer({
        port: 3000,
        perMessageDeflate: false
    })

    nodecg.log.error("Server started");
    wss.on('connection', onConnection);

    nodecgReference = nodecg;
    const testReplicant = nodecg.Replicant("teste", {defaultValue: "default"});

    let connections = [null, null, null, null];

    let users = [];

    for(let i = 0; i < 4; i++) {
        users.push({
            id: i,
            name: "",
            pass: "",
            token: "",
            locked: false,
            points: 0
        })
    }

    const usersReplicant = nodecg.Replicant("users", {defaultValue: users});
    const questionsReplicant = nodecg.Replicant("questions", {defaultValue: []});
    const currentQuestion = nodecg.Replicant("currentQuestion", {defaultValue: {question: "", answer: ""}});
    const timer = nodecg.Replicant("timer", {defaultValue: 0});
    const buzzingList = nodecg.Replicant("buzzers", {defaultValue: []});

    function onError(ws, err) {
        nodecg.log.error(err);
    }
    
    function onMessage(ws, data) {
        console.log(data.toString());
        const message = JSON.parse(data.toString());
        switch(message.action) {
            case "login":
                processLogin(ws, message.pass);
                break;
            case "buzz":
                processBuzzer(message.token);
                break;
        }
    }

    function processBuzzer(token) {
        let users = nodecg.readReplicant("users");
        const index = users.findIndex((x) => x.token === token);

        if(index === -1) 
            return;

        let userCopy = [...users];
        userCopy[index].locked = true;
        usersReplicant.value = userCopy;

        connections[index].send(JSON.stringify({
            action: "lock"
        }));

        let buzzers = nodecg.readReplicant("buzzers");

        if(buzzers.length === 0) {
            nodecg.sendMessage("select", index);
        }

        buzzers.push(users[index].name);
        buzzingList.value = buzzers;
    }
    
    function processLogin(ws, pass) {
        let users = nodecg.readReplicant("users");
        let userCopy = [...users];
        const index = userCopy.findIndex((x) => x.pass === pass);
        
        if(index === -1) 
            return;

        const token = makeId(10);
        userCopy[index].token = token;
        connections[index] = ws;
        users.value = userCopy;

        ws.send(JSON.stringify({
            result: "success",
            token: token,
            locked: userCopy[index].locked
        }))
    }

    nodecg.listenFor("lockAll", () => {
        console.log("Locking Buzzers")
        connections.forEach((con) => {
            if(con !== null)
                con.send(JSON.stringify({
                    action: "lock"
                }))
        })

        let users = nodecg.readReplicant("users");
        let userCopy = [...users];

        for(let i = 0; i < 4; i++) {
            userCopy[i].locked = true;
        }

        usersReplicant.value = userCopy;
    })

    nodecg.listenFor("unlockAll", () => {
        console.log("Unlocking Buzzers")
        connections.forEach((con) => {
            if(con !== null)
                con.send(JSON.stringify({
                    action: "unlock"
                }))
        })

        let users = nodecg.readReplicant("users");
        let userCopy = [...users];

        for(let i = 0; i < 4; i++) {
            userCopy[i].locked = false;
        }
        console.log(userCopy);
        usersReplicant.value = userCopy;
    })

    nodecg.listenFor("timerUp", () => {
        console.log("Timer up!")
        connections.forEach((con) => {
            if(con !== null)
                con.send(JSON.stringify({
                    action: "lock"
                }))
        })

        let users = nodecg.readReplicant("users");
        let userCopy = [...users];

        for(let i = 0; i < 4; i++) {
            userCopy[i].locked = true;
        }
        console.log(userCopy);
        usersReplicant.value = userCopy;
    })
    
    function onConnection(ws, req) {
        ws.on('message', data => onMessage(ws, data));
        ws.on('error', error => onError(ws, error))
        ws.on('close', () => onDisconnect(ws))
    }
    
    function onDisconnect(ws) {
    
    }
}