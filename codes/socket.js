import websocket from 'websocket'
const webSocket = websocket.server;
import http from 'http';

websocket.getUniqueID = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' +s4();
};

let conn = '';
const server = http.createServer((req, resp)=>{
    console.log((new Date()) + ' Received request' + req.query.id );
    resp.writeHead(404);
    resp.end();
}).listen(8000, console.log('active....'));


const ws = new webSocket({
    httpServer: server
})

let websocketIds = {};

ws.on('request', (request)=>{

    const {id} = request.resourceURL.query;
    const key = request.key;
    console.log(key);
    var conn = request.accept(null, request.origin);
    
    if(websocketIds[id]!=undefined){
        websocketIds[id][key] = conn;
    }else{
        websocketIds[id] = [];
        websocketIds[id][key] = conn
    }

    conn.send(JSON.stringify({success:'ok'}));
    console.log("connectd " + id + ' in '+Object.getOwnPropertyNames(websocketIds))

    conn.on('open', () => console.log('connection opened!'))
    conn.on('close', (e) => {
        console.log(id, key);
        console.log('deleting '+id,key)
        delete websocketIds[id][key];
        
    })

    conn.on('message', (m) =>{
        //console.log(JSON.parse(m.utf8Data));
        const {to, msg} = JSON.parse(m.utf8Data);
        var touser = websocketIds[to];
        //websocketIds[3].send('hello there');
        if(touser){

            for(var v in touser){
                touser[v].send(JSON.stringify({from:id, msg:msg}));
            }
        };
    })


})