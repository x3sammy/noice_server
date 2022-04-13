import conn from '../connect/connect.js';

export const get_user = (req, resp)=>{
    
    let {a} = req.params;
    if(a=='all'){
        a=`SELECT name, email, address FROM profile`;
    }else{
        a=`SELECT name, email, address FROM profile WHERE uniqueid='${a}' LIMIT 1`;
    }
    conn.query(a,(e,r)=>{
        if(e){
            resp.json({'error':e});
        }else{
            if(r==''){
                resp.json({'success':'ok','data':'no record found request'});
            }else{
                resp.json({'success':'ok','data':r});
            }
        }
    })

}

export const get_vehicles = (req, resp) =>{
    let {uid, limit} = req.params;

    if(limit != 0){
        limit = `LIMIT ${limit}`
    }else{
        limit = '';
    }

    conn.query(`SELECT title, brand, price FROM vehicles WHERE owner_uniqueid='${uid}' ${limit}`,(e,r)=>{
        if(e){
            resp.send({'error':e.sqlMessage});
        }else{
            if(r==''){
                resp.json({'success':'ok','data':'no record found request'});
            }else{
                resp.json({'success':'ok','data':r});
            }
        }
    })
}
