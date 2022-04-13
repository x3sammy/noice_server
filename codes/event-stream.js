import express from 'express';
const app = express();
import cors from 'cors';
import EventEmitter from 'events';
const emitter = new EventEmitter();
import http from 'http';

app.get('/:myid/stream/:to', (req, resp) => {

    const myid = req.params.myid;
    const id = req.params.to;
    const msg = req.query.msg;

    resp.writeHead(204, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
    })
    resp.setHeader('Content-Type','text/event-stream');
    
    resp.write('data: sent\n\n');
    emitter.emit('runthis', msg, id, myid);
    resp.end()

})


app.get('/:id/stream', (req, resp)=>{

    const id = req.params.id;

    resp.setHeader('Content-Type','text/event-stream');

    emitter.on('runthis', (a, b, c)=>{
        if(id == b){
            resp.write("data: "+`${c + ' said '+ a}\n\n`);
        }
    })
    
    
    resp.write("data: "+"connected...\n\n");

}).listen(8000);