var express = require('express')
var app = express()
var sql = require("mssql");
var cors = require('cors')



var Ordcount = 0;
app.use(express.json())
app.use(cors())

var port = process.env.PORT || 3000;

app.get('/', function (req, res) {
    res.send('hello world')
  })


  app.post('/getContacts', function (req, res) {
    console.log("getContacts");
    var config = {
        user: req.body.user,
        password: req.body.password,
        server: req.body.server,
        database: req.body.database,
        encrypt: true
    };

  new sql.ConnectionPool(config).connect().then(pool => {
        console.log("Connected ")
        return pool.request()
            .query("SELECT NAMN, AVDELN, ADR1, POSTKOD, POSTADR, ID, BESADRESS, TELEFON, EMAILADR, LAND, KUNDNR, ORGNR, WEB, REGDAT, ANVID, GRUPPID FROM FTG ");
    }).then(result => {
        res.send(result.recordsets[0])
        sql.close();
    }).catch(err => {
        res.send(err)
        sql.close();
        // ... error checks
    })

});

// app.get('/',function (req, res) {
//     res.send("HTTPS Working")
// })

app.post('/getDef', function (req, res) {
    console.log("getDef");
    var config = {
        user: req.body.user,
        password: req.body.password,
        server: req.body.server,
        database: req.body.database,
        encrypt: true
    };
    new sql.ConnectionPool(config).connect().then(pool => {
        console.log("Connected ")
        return pool.request()
            .query("select distinct katdef from def where rubrik='HndTyp'")
    }).then(result => {
        sql.close();
        res.send(result.recordsets[0])
    }).catch(err => {
        sql.close();
        res.send(err)
        // ... error checks
    })
});

app.post('/getDef/pri', function (req, res) {
    console.log("/getDef/pri");
    var config = {
        user: req.body.user,
        password: req.body.password,
        server: req.body.server,
        database: req.body.database,
        encrypt: true
    };
    new sql.ConnectionPool(config).connect().then(pool => {
        console.log("Connected ")
        return pool.request()
            .query("SELECT KATDEF FROM DEF WHERE RUBRIK='Prioritet'")
    }).then(result => {
        sql.close();
        res.send(result.recordsets[0])
    }).catch(err => {
        sql.close();
        res.send(err)
        // ... error checks
    })

});

app.post('/getHnd', function (req, res) {
    console.log("getHnd ")
    var config = {
        user: req.body.user,
        password: req.body.password,
        server: req.body.server,
        database: req.body.database,
        encrypt: true
    };
    var months = parseInt(req.body.months)
    console.log("Months",months)
    new sql.ConnectionPool(config).connect().then(pool => {
        console.log("Connected ")
        // Stored procedure
        //var user = 
        return pool.request()
            .query("SELECT DATUM , TID, RUBRIK, FTG, TYP, KLART, ID, PRIOR, TILL, EREF, ANVID, GRUPPID, BEVDATUM, FTGID, PERSID, REGDAT, NOTERING FROM HND where DATUM>getdate()-("+months+"*31) order by datum desc")
    }).then(result => {
        sql.close();
        res.send(result.recordsets[0])
    }).catch(err => {
        sql.close();
        res.send(err)
        // ... error checks
    })

});

app.post('/getPerson', function (req, res) {
    console.log("getPerson ")
    var config = {
        user: req.body.user,
        password: req.body.password,
        server: req.body.server,
        database: req.body.database,
        encrypt: true
    };

    new sql.ConnectionPool(config).connect().then(pool => {
        console.log("Connected ")
        return pool.request()
            .query("SELECT PERS.ENAMN, PERS.FNAMN, PERS.TITEL, PERS.DIRTEL, PERS.ID, PERS.BILTEL, PERS.EMAIL, PERS.PRIVAT, PERS.HKONT , PERS.FTGID, PERS.REGDAT, PERS.ANVID, PERS.GRUPPID,FTG.NAMN FROM PERS,FTG WHERE PERS.FTGID=FTG.ID")
    }).then(result => {
        sql.close();
        res.send(result.recordsets[0])
    }).catch(err => {
        sql.close();
        res.send(err)
        // ... error checks
    })

});

app.post('/getTrail', function (req, res) {
    console.log("getTrail ")
    var config = {
        user: req.body.user,
        password: req.body.password,
        server: req.body.server,
        database: req.body.database,
        username : req.body.username,
        months : req.body.months,
        encrypt: true
    };
    new sql.ConnectionPool(config).connect().then(pool => {
        console.log("Connected ")
        // Stored procedure
        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        today = date;
        console.log(today)
        var user = config.username;
        return pool.request()
            .query("SELECT DATUM , TID, RUBRIK, FTG, TYP, KLART, ID, PRIOR, TILL, EREF, ANVID, GRUPPID, BEVDATUM, FTGID, PERSID, REGDAT, NOTERING FROM HND where DATUM in (select DATUM from hnd where DATUM>getdate()-("+config.months+"*31)) and ((DATUM< = '"+today+"' AND KLART is NULL) OR (BEVDATUM <= '"+today+"')) AND ANVID ='"+user+"' order by datum desc")
    }).then(result => {
        sql.close();
        res.send(result.recordsets[0])
    }).catch(err => {
        sql.close();
        res.send(err)
        // ... error checks
    })

});

function verifyContactNull(contact) {
console.log("contact values : ", contact);

    var contactQuery = "insert into ftg (id";
    var values = ") values('" + contact.ID + "'";
    var end = ")";
    console.log(contact.ID);

    console.log("Name field Exists : ", contact.NAMN != undefined) 
    if (contact.NAMN != undefined) {
        contactQuery = contactQuery + ",NAMN";
        values = values + ",'" + contact.NAMN + "'";
    }

    if (contact.AVDELN != undefined) {
        contactQuery = contactQuery + ",AVDELN";
        values = values + ",'" + contact.AVDELN + "'";
    }

    if (contact.ADR1 != undefined) {
        contactQuery = contactQuery + ",ADR1";
        values = values + ",'" + contact.ADR1 + "'";
    }

    if (contact.POSTKOD != undefined) {
        contactQuery = contactQuery + ",POSTKOD";
        values = values + ",'" + contact.POSTKOD + "'";
    }

    if (contact.POSTADR != undefined) {
        contactQuery = contactQuery + ",POSTADR";
        values = values + ",'" + contact.POSTADR + "'";
    }

    if (contact.BESADRESS != undefined) {
        contactQuery = contactQuery + ",BESADRESS";
        values = values + ",'" + contact.BESADRESS + "'";
    }

    if (contact.TELEFON != undefined) {
        contactQuery = contactQuery + ",TELEFON";
        values = values + ",'" + contact.TELEFON + "'";
    }

    if (contact.EMAILADR != undefined) {
        contactQuery = contactQuery + ",EMAILADR";
        values = values + ",'" + contact.EMAILADR + "'";
    }

    if (contact.LAND != undefined) {
        contactQuery = contactQuery + ",LAND";
        values = values + ",'" + contact.LAND + "'";
    }

    if (contact.KUNDNR != undefined) {
        contactQuery = contactQuery + ",KUNDNR";
        values = values + ",'" + contact.KUNDNR + "'";
    }

    if (contact.ORGNR != undefined) {
        contactQuery = contactQuery + ",ORGNR";
        values = values + ",'" + contact.ORGNR + "'";
    }

    if (contact.WEB != undefined) {
        contactQuery = contactQuery + ",WEB";
        values = values + ",'" + contact.WEB + "'";
    }

    if (contact.REGDAT != undefined) {
        contactQuery = contactQuery + ",REGDAT";
        values = values + ",'" + contact.REGDAT + "'";
    }

    if (contact.ANVID != undefined) {
        contactQuery = contactQuery + ",ANVID";
        values = values + ",'" + contact.ANVID + "'";
    }

    if (contact.GRUPPID != undefined) {
        contactQuery = contactQuery + ",GRUPPID";
        values = values + ",'" + contact.GRUPPID+ "'";
    }

    var finalQuery = contactQuery + values + end;
    console.log(finalQuery)
    return finalQuery;
}
app.post("/putContacts", async function (req, res) {

    // config for your database
    var config = {
        user: req.body.user,
        password: req.body.password,
        server: req.body.server,
        database: req.body.database,
        encrypt: true
    };
    console.log("Before Connection");

    console.log("Post Body : ", req.body)

    console.log("Length : " + req.body.contact.length);
    var counter = 0;
    var d = new Date();
    var today = d.getFullYear() + '' + ("0" + (d.getMonth() + 1)).slice(-2) + '' + ("0" + d.getDate()).slice(-2) + '' + ("0" + d.getHours()).slice(-2) + '' + ("0" + d.getMinutes()).slice(-2) + '' + ("0" + d.getSeconds()).slice(-2);
    // procedure
    for (var i = 0; i < req.body.contact.length; i++) {
        console.log("Connection " + i);
        await new sql.ConnectionPool(config).connect().then(async pool => {
            console.log("Connected " + i)
            console.log("Contact "+i,req.body.contact[i]);
            var queryString = await verifyContactNull(req.body.contact[i]);//"INSERT INTO ftg (NAMN, AVDELN, ADR1, POSTKOD, POSTADR, ID, BESADRESS, TELEFON, EMAILADR, LAND, KUNDNR, ORGNR, WEB, REGDAT, ANVID, GRUPPID) VALUES ("+ "'" +req.body.contact[i].NAMN+ "'," + "'" +req.body.contact[i].AVDELN+ "'," + "'" +req.body.contact[i].ADR1+ "'," + "'" +req.body.contact[i].POSTKOD+ "'," + "'" +req.body.contact[i].POSTADR+ "'," + "'" +req.body.contact[i].ID+ "'," + "'" +req.body.contact[i].BESADRESS+ "'," + "'" +req.body.contact[i].TELEFON+ "'," + "'" +req.body.contact[i].EMAILADR+ "'," + "'" +req.body.contact[i].LAND+ "'," + "'" +req.body.contact[i].KUNDNR+ "'," + "'" +req.body.contact[i].ORGNR+ "'," + "'" +req.body.contact[i].WEB+ "'," + "'" +req.body.contact[i].REGDAT+ "'," + "'" +req.body.contact[i].ANVID+ "'," + "'" +req.body.contact[i].GRUPPID+ "'" + ")"
            
            console.log(" Query " + i + " " + queryString)
            return pool.request()
                .query(queryString);
        }).then(async result => {
            console.log("Contact Result "+i,result)
            sql.close();
            
            await new sql.ConnectionPool(config).connect().then(async pool => {
                console.log("Connected " + i)
                var queryString = "INSERT INTO trail (ID,TblName,FldName,CrtDate,UserID,GroupID,Type,BefValue,AftValue,Ordcnt) VALUES (" + "'" + req.body.contact[i].ID + "'," + "'FTG'" + "," + "NULL" + "," + "'" + req.body.contact[i].REGDAT + "'," + "'" + req.body.contact[i].ANVID + "'," + "'" + req.body.contact[i].GRUPPID + "'," + "1" + "," + "NULL" + "," + "NULL" + "," + req.body.contact[i].ORDER + ")"
                console.log(Ordcount)
                console.log(" Query " + i + " " + queryString)
                return pool.request()
                    .query(queryString);
            }).then(result => {
                console.log("Trail Contact Result "+i,result)
                sql.close();
                counter++;
            }).catch(err => {
                sql.close();
                console.log(err)
                // ... error checks

            })
            counter++;

        }).catch(err => {
            sql.close();
            console.log(err)
            // ... error checks
        })
    }
    clen = req.body.contact.length;
    res.send({
        status : counter + " Rows Affected"
    })
});

function verifyPersonNull(person) {

    var personQuery = "insert into pers (ID"
    var values = ") values('" + person.ID + "'";
    var end = "')";

    if (person.ENAMN != undefined) {
        personQuery = personQuery + ",ENAMN";
        values = values + ",'" + person.ENAMN + "'";
    }

    if (person.FNAMN != undefined) {
        personQuery = personQuery + ",FNAMN";
        values = values + ",'" + person.FNAMN + "'";
    }

    if (person.TITEL != undefined) {
        personQuery = personQuery + ",TITEL";
        values = values + ",'" + person.TITEL + "'";
    }

    if (person.DIRTEL != undefined) {
        personQuery = personQuery + ",DIRTEL";
        values = values + ",'" + person.DIRTEL + "'";
    }

    if (person.BILTEL != undefined) {
        personQuery = personQuery + ",BILTEL";
        values = values + ",'" + person.BILTEL + "'";
    }

    if (person.PRIVAT != undefined) {
        personQuery = personQuery + ",PRIVAT";
        values = values + ",'" + person.PRIVAT + "'";
    }

    if (person.HKONT != undefined) {
        personQuery = personQuery + ",HKONT";
        values = values + ",'" + person.HKONT + "'";
    }

    if (person.FTGID != undefined) {
        personQuery = personQuery + ",FTGID";
        values = values + ",'" + person.FTGID + "'";
    }

    if (person.REGDAT != undefined) {
        personQuery = personQuery + ",REGDAT";
        values = values + ",'" + person.REGDAT + "'";
    }

    if (person.ANVID != undefined) {
        personQuery = personQuery + ",ANVID";
        values = values + ",'" + person.ANVID + "'";
    }

    if (person.GRUPPID != undefined) {
        personQuery = personQuery + ",GRUPPID";
        values = values + ",'" + person.GRUPPID;
    }

    var finalQuery = personQuery + values + end;
    return finalQuery;

}
app.post("/putPerson", async function (req, res) {

    // config for your database
    var config = {
        user: req.body.user,
        password: req.body.password,
        server: req.body.server,
        database: req.body.database,
        encrypt: true
    };
    console.log("Before Connection")
    console.log("Length : " + req.body.person.length);
    var counter = 0;
    var d = new Date();
    today = d.getFullYear() + '' + ("0" + (d.getMonth() + 1)).slice(-2) + '' + ("0" + d.getDate()).slice(-2) + '' + ("0" + d.getHours()).slice(-2) + '' + ("0" + d.getMinutes()).slice(-2) + '' + ("0" + d.getSeconds()).slice(-2);
    

    // Stored procedure
    for (var i = 0; i < req.body.person.length; i++) {
        console.log("Connection " + i);
        await new sql.ConnectionPool(config).connect().then(async pool => {
            var queryString = verifyPersonNull(req.body.person[i]);//"insert into pers(ENAMN,FNAMN,TITEL,DIRTEL,ID,BILTEL,PRIVAT,HKONT,FTGID,REGDAT,ANVID,GRUPPID) values("+ "'" +req.body.contact[i].ENAMN+ "'," + "'" +req.body.contact[i].FNAMN+ "'," + "'" +req.body.contact[i]. TITEL+ "'," + "'" +req.body.contact[i].DIRTEL+ "'," + "'" +req.body.contact[i].ID+ "'," + "'" +req.body.contact[i].BILTEL+ "'," + "'" +req.body.contact[i].PRIVAT+ "'," + "'" +req.body.contact[i].HKONT+ "'," + "'" +req.body.contact[i].FTGID+ "'," + "'" +req.body.contact[i].REGDAT+ "'," + "'" +req.body.contact[i].ANVID+ "'," + "'" +req.body.contact[i].GRUPPID + "'" +")"

            console.log(" Query " + i + " " + queryString)
            return pool.request()
                .query(queryString);
        }).then(async result => {
            console.log("Person Result "+i,result)
            sql.close();
            
            await new sql.ConnectionPool(config).connect().then(async pool => {
                console.log("Connected " + i)
                var queryString = "INSERT INTO trail (ID,TblName,FldName,CrtDate,UserID,GroupID,Type,BefValue,AftValue,Ordcnt) VALUES (" + "'" + req.body.person[i].ID + "'," + "'PERS'" + "," + "NULL" + "," + "'" + req.body.person[i].REGDAT + "'," + "'" + req.body.person[i].ANVID + "'," + "'" + req.body.person[i].GRUPPID + "'," + "1" + "," + "NULL" + "," + "NULL" + "," + req.body.person[i].ORDER + ")"
                console.log(Ordcount)
                console.log(" Query " + i + " " + queryString)
                return pool.request()
                    .query(queryString);
            }).then(result => {
                console.log("Trail Person Result "+i,result)
                sql.close();
                counter++;
            }).catch(err => {
                sql.close();
                console.log(err)
                // ... error checks

            })

            counter++;
        }).catch(err => {
            sql.close();
            console.log(err)
            // ... error checks
        })
    }
    plen = clen + req.body.person.length;
    res.send({
        status : counter + " Rows Affected"
    })
});


function verifyEventsNull(event) {

    var eventQuery = "insert into hnd (ID"
    var values = ") values('" + event.ID + "'";
    var end = "')";

    if (event.DATUM != undefined) {
        eventQuery = eventQuery + ",DATUM";
        values = values + ",'" + event.DATUM + "'";
    }

    if (event.TID != undefined) {
        eventQuery = eventQuery + ",TID";
        values = values + ",'" + event.TID + "'";
    }

    if (event.RUBRIK != undefined) {
        eventQuery = eventQuery + ",RUBRIK";
        values = values + ",'" + event.RUBRIK + "'";
    }

    if (event.FTG != undefined) {
        eventQuery = eventQuery + ",FTG";
        values = values + ",'" + event.FTG + "'";
    }

    if (event.TYP != undefined) {
        eventQuery = eventQuery + ",TYP";
        values = values + ",'" + event.TYP + "'";
    }

    if (event.KLART != undefined) {
        eventQuery = eventQuery + ",KLART";
        values = values + ",'" + event.KLART + "'";
    }

    if (event.PRIOR != undefined) {
        eventQuery = eventQuery + ",PRIOR";
        values = values + ",'" + event.PRIOR + "'";
    }

    if (event.TILL != undefined) {
        eventQuery = eventQuery + ",TILL";
        values = values + ",'" + event.TILL + "'";
    }

    if (event.EREF != undefined) {
        eventQuery = eventQuery + ",EREF";
        values = values + ",'" + event.EREF + "'";
    }

    if (event.ANVID != undefined) {
        eventQuery = eventQuery + ",ANVID";
        values = values + ",'" + event.ANVID + "'";
    }


    if (event.BEVDATUM != undefined) {
        eventQuery = eventQuery + ",BEVDATUM";
        values = values + ",'" + event.BEVDATUM + "'";
    }

    if (event.FTGID != undefined) {
        eventQuery = eventQuery + ",FTGID";
        values = values + ",'" + event.FTGID + "'";
    }

    if (event.PERSID != undefined) {
        eventQuery = eventQuery + ",PERSID";
        values = values + ",'" + event.PERSID + "'";
    }

    if (event.REGDAT != undefined) {
        eventQuery = eventQuery + ",REGDAT";
        values = values + ",'" + event.REGDAT + "'";
    }

    if (event.NOTERING != undefined) {
        eventQuery = eventQuery + ",NOTERING";
        values = values + ",'" + event.NOTERING + "'";
    }

    if (event.GRUPPID != undefined) {
        eventQuery = eventQuery + ",GRUPPID";
        values = values + ",'" + event.GRUPPID;
    }

    var finalQuery = eventQuery + values + end;
    return finalQuery;

}
app.post("/putHnd", async function (req, res) {

    // config for your database
    var config = {
        user: req.body.user,
        password: req.body.password,
        server: req.body.server,
        database: req.body.database,
        encrypt: true
    };
    console.log("Before Connection")
    console.log("Length : " + req.body.event.length);
    var counter = 0;
    var d = new Date();
    today = d.getFullYear() + '' + ("0" + (d.getMonth() + 1)).slice(-2) + '' + ("0" + d.getDate()).slice(-2) + '' + ("0" + d.getHours()).slice(-2) + '' + ("0" + d.getMinutes()).slice(-2) + '' + ("0" + d.getSeconds()).slice(-2);
    // Stored procedure
    for (var i = 0; i < req.body.event.length; i++) {
        console.log("Connection " + i);
        await new sql.ConnectionPool(config).connect().then(async pool => {
            console.log("Connected " + i)
            var queryString = verifyEventsNull(req.body.event[i]);//"insert into hnd(DATUM, TID, RUBRIK, FTG, TYP, KLART, ID, PRIOR, TILL, EREF, ANVID,BEVDATUM,GRUPPID, FTGID, PERSID, REGDAT, NOTERING) values("+ "'" +req.body.event[i].DATUM+ "'," + "'" +req.body.event[i].TID+ "'," + "'" +req.body.event[i]. RUBRIK+ "'," + "'" +req.body.event[i].FTG+ "'," + "'" +req.body.event[i].TYP+ "'," + "'" +req.body.event[i].KLART+ "'," + "'" +req.body.event[i].ID+ "'," + "'" +req.body.event[i].PRIOR+ "'," + "'" +req.body.event[i].TILL+ "'," + "'" +req.body.event[i].EREF+ "'," + "'" +req.body.event[i].ANVID+ "'," + "'" +req.body.event[i].BEVDATUM+ "'," + "'" +req.body.event[i].GRUPPID+ "'," + "'" +req.body.event[i].FTGID+ "'," + "'" +req.body.event[i].PERSID+ "'," + "'" +req.body.event[i].REGDAT+ "'," + "'" +req.body.event[i].NOTERING+ "'" + ")"

            console.log(" Query " + i + " " + queryString)
            return pool.request()
                .query(queryString);
        }).then(async result => {
            console.log(result)
            sql.close();
            
            await new sql.ConnectionPool(config).connect().then(async pool => {
                console.log("Connected " + i)
                var queryString = "INSERT INTO trail (ID,TblName,FldName,CrtDate,UserID,GroupID,Type,BefValue,AftValue,Ordcnt) VALUES (" + "'" + req.body.event[i].ID + "'," + "'HND'" + "," + "NULL" + "," + "'" + req.body.event[i].REGDAT + "'," + "'" + req.body.event[i].ANVID + "'," + "'" + req.body.event[i].GRUPPID + "'," + "1" + "," + "NULL" + "," + "NULL" + "," + req.body.event[i].ORDER + ")"
                console.log(Ordcount)
                console.log(" Query " + i + " " + queryString)
                return pool.request()
                    .query(queryString);
            }).then(result => {
                console.log(result)
                sql.close();
                counter++;
            }).catch(err => {
                sql.close();
                console.log(err)
                // ... error checks
            })

            counter++;
        }).catch(err => {
            sql.close();
            console.log(err)
            // ... error checks
        })
    }
    res.send({
        status : counter + " Rows Affected"
    })
});



app.post('/sync', function (req, res) {

    var config = {
        user: req.body.user,
        password: req.body.password,
        server: req.body.server,
        database: req.body.database,
        encrypt: true
    };

    sql.connect(config).then(pool => {
        console.log("Connected ")
        // Stored procedure 
        return pool.request()
            .query("select DATUM,TID,RUBRIK,FTG,TYP,KLART,ID,PRIOR,TILL,EREF,ANVID,GRUPPID,BEVDATUM,FTGID,PERSID,REGDAT,NOTERING from hnd where DATUM>getdate()-(6*31)");
    }).then(result => {
        console.log(result)
        sql.close();
        res.send(result.recordsets[0])
    }).catch(err => {
        sql.close();
        res.send(err)
        // ... error checks
    })

});

app.post('/testConnection',function (req, res){
    var config = {
        user: req.body.user,
        password: req.body.password,
        server: req.body.server,
        database: req.body.database,
        encrypt: true
    };
    new sql.ConnectionPool(config).connect().then(pool => {
        console.log("Connected ")
        res.status(200).send({ confirmed : 1 , msg : "Connection Successful" } );
        sql.close();
    }).catch(err => {
        sql.close();
        console.log("Error" , err)

        switch(err.code){
            case "ESOCKET" : 
                            res.status(400).send({ confirmed : -1 , msg : "Connection Error, Please Verify Database URL" } );
                            break;
            case "ELOGIN" : res.status(400).send( { confirmed : -2 , msg : "Login Error, Verify DB Username, Password or DB Name" });
                            break;
            default : res.status(400).send( { confirmed : -3 , msg : "Something Went Wrong! Try Again Later" });
        }
    })
})

app.post('/verifyUser', function (req, res) {

    var config = {
        user: req.body.user,
        password: req.body.password,
        server: req.body.server,
        database: req.body.database,
        encrypt: true
    };
    //Ordcount = 0;

    new sql.ConnectionPool(config).connect().then(pool => {
        console.log("Connected ")
        // Stored procedure
        return pool.request()
            .query("select rubrik from def where typ='user' and rubrik='" + req.body.username + "'");
    }).then(result => {
        console.log(result)
        sql.close();
        console.log(result.rowsAffected[0])
        if (result.rowsAffected[0] >= 1) {
            var str = req.body.username.toLowerCase();
            var str1 = result.recordset[0].rubrik.toLowerCase();
            if (str == str1)
                res.send({ confirmed: 0, msg: "user exist" })
        }
        else
            res.send({ confirmed: 1, msg: "user doesn't exist" })
        }).catch(err => {
        sql.close();
        console.log("Error" , err)
        switch(err.code){
            case "ESOCKET" : 
                            res.status(400).send({ confirmed : -1 , msg : "Connection Error, Please Verify Database URL" } );
                            break;
            case "ELOGIN" : res.status(400).send( { confirmed : -2 , msg : "Login Error, Verify DB Username, Password or DB Name" });
                            break;
        }
        // ... error checks
    })

});
  
  app.listen(port , function(){
    console.log("Listening to port ", port)
  })
  