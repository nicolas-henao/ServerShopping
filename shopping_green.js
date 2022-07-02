const express = require('express')
const bcrypt = require('bcrypt')
const app = express()
const sqlite3 = require('sqlite3');
const nodemailer = require('nodemailer');
const db = new sqlite3.Database('./db/register.db');
const url = require('url');
const querystring = require('querystring');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const sessions = require('express-session');
const { name } = require('ejs');
const timeEXp = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: 'nbiocnonltaesylor',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: timeEXp }
}));
const port = 4000
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('pages/index');
})

app.get('/register', (req, res) => {
    res.render('pages/register');
});

app.post('/logicaregister', (req, res) => {
    let name = req.body.name;
    let lastName = req.body.lastName;
    let age = req.body.age;
    let email = req.body.email;
    let password = req.body.password;
    let numTelephone = req.body.numTelephone;

    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);

    db.run(`INSERT INTO register(name, lastName, age, email, password, numTelephone) VALUES(?, ?, ?, ?, ?, ?)`,
        [name, lastName, age, email, hash, numTelephone],
        function (error) {
            if (!error) {
                console.log("Insert OK");
                return res.render('pages/registerok')
            } else {
                console.log("Insert error", error.code);
                if (error.code == "SQLITE_CONSTRAINTS") {
                    return res.send('El usurario ya existe')
                }
                return res.send('Ocurrio algun error');
            }
        }
    );

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: 'shoppingreen7@gmail.com',
            pass: 'bzsqzbwnihjlmnya'
        }
    });

    // send email
    transporter.sendMail({
        from: 'shoppingreen7@gmail.com',
        to: email,
        subject: 'Verificacion de registro',
        text: 'Hello World?',
        html: '<h1>Registro exitoso</h1>'
    })

    res.render('pages/registerok', { name: name, lastName: lastName})
})

app.post('/logicalogin', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    db.get("SELECT email, password FROM register WHERE email=$email", {
        $email: email
    }, (error, row) => {

        if (row) {
            if (bcrypt.compareSync(password, row.password)) {
                session = req.session;
                session.userid = email;
                return res.render('pages/buy');
            }
            return res.send('contraseña o usuario incorrecta');
        }
        return res.send('contraseña o usuario incorrecta');
    })
})

// app.get('/product', (req, res) => {
//     res.render('pages/buy_copy');
// });
// app.post('/product', (req, res) => {
//     res.render('pages/buy_copy');
// });
app.post('/productagregar', (req, res) => {
    res.render('pages/buy_copy');
});
app.post('/productagregar1', (req, res) => {
    let name1 = req.body.name1;
    let price = req.body.price;
    let url = req.body.url;
    let id = req.body.id;

    db.run(`INSERT INTO products(name1, price, url, id) VALUES(?, ?, ?, ?)`,
        [name1, price, url, id],
        function (error) {
            if (!error) {
                console.log("Insert OK");
                return res.send("insertado correctamente")
            } else {
                console.log("Insert error", error);
            }
        });
});

app.get('/product/:iditem', (req, res) => {
    session = req.session;
    if (session.userid) {
        let id = req.params.iditem;
        email = req.session.userid;

        db.run(`INSERT INTO products(name,price,id,url) VALUES (?,?,?,?)`,
            [name, id, price,url],

            function (error) {
                if (!error) {
                    res.render('pages/thanks')
                    // send email
                    transporter.sendMail({
                        from: 'shoppingreen7@gmail.com',
                        to: email,
                        subject: 'Realizacion de Compra',
                        text: 'Hello World?',
                        html: '<h1>Compra exitosa</h1>'
                    }).then((res) => { console.log(res); }).catch((err) => { console.log(err); })
                }
                if (error) {
                    return console.log("error: ", error);
                }
            }
        )

    } else {
        res.render('pages/login');
    }

    res.render('pages/thanks');
})





// app.get ('/logout', (req, res) => {
//     session = req.session;
//     if (session.userid) {
//         res.session.destroy();
//         return res.redirect('/');
//     }
//     return res.send('No tiene session para cerrar');
// })

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})