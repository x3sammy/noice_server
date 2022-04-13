import upload from 'express-fileupload';
import express from 'express';
const app = express();

app.use(upload());

app.listen(8000, e=>console.log('running server'));

app.get('/', (req, resp)=>{
    resp.sendFile('/var/www/html/nodetest/fileupload.html','utf8');
});

app.post('/upload', function(req, res) {
    if(req.files){
        let file = req.files.foo;
        console.log(file);
        let fn = file.name;

        fn = fn.split('.').pop();

        const newType = ['text','mp4','mp3','jpg','jpeg','png','mov','MOV'];

        const xa = newType.find((e)=>{
            return e == fn;
        });

        if(xa == undefined){
            res.send('unsupported format');
            return;
        }


        const suptype = ['text/plain','image/jpeg', 'image/jpg', 'audio/mpeg', 'video/mp4','video/quicktime'];

        const da = suptype.find((e)=>{
            return e == file.mimetype;
        })

        if(da == undefined){
            res.status(503).send('unspported file');
            return;
        };

        const newName = Math.round(Math.random()*9999999999)+"_"+Math.round(Math.random()*9999999999);

        file.mv(`./connect/${newName}.${fn}`, (e)=>{
            if(e){
                res.send(e);
            }else{
                res.send('uploaded');
            }
        });
    }
  });