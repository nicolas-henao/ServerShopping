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
                if (error.code == "SQLITE_CONSTRAINT") {
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
        html: '<img src="https://res.cloudinary.com/servicio-de-aprendizaje-nacional-sena/image/upload/v1659013932/Shopping_green/proyecto/Tarjeta_Cuadrada_Cumplea%C3%B1os_Infantil_Verde_ij4cet.png" alt="Registro Exitoso">'
    })

    res.render('pages/registerok', { name: name, lastName: lastName});
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
                return res.render('pages/thankslogin');
            }
            return res.render('pages/incorrect');
        }
        return res.render('pages/incorrect');
    })
})


app.get('/products', (req, res) => {
    //se pasa una variable sencilla a la vista
    res.render('pages/shopping', {
        products: [
            { producto: "Panel Solar", id: 0, precio: 2500000, url: "https://res.cloudinary.com/servicio-de-aprendizaje-nacional-sena/image/upload/v1656580953/Shopping_green/proyecto/WhatsApp_Image_2022-06-30_at_12.03.04_AM_w3wc2u.jpg" },
            { producto: "Conector", id: 1, precio: 15000, url: "https://res.cloudinary.com/servicio-de-aprendizaje-nacional-sena/image/upload/v1656580953/Shopping_green/proyecto/WhatsApp_Image_2022-06-30_at_12.03.02_AM_1_ywgsuk.jpg" },
            { producto: "Repuesto Adaptador", id: 2, precio: 8000, url: "https://res.cloudinary.com/servicio-de-aprendizaje-nacional-sena/image/upload/v1656580953/Shopping_green/proyecto/WhatsApp_Image_2022-06-30_at_12.03.02_AM_bynebj.jpg" },
            { producto: "Adaptador", id: 3, precio: 50000, url: "https://res.cloudinary.com/servicio-de-aprendizaje-nacional-sena/image/upload/v1656580953/Shopping_green/proyecto/WhatsApp_Image_2022-06-30_at_12.03.01_AM_e1g5wg.jpg" },
            { producto: "Cable Solar Fotovoltaico", id: 4, precio: 4000, url: "https://res.cloudinary.com/servicio-de-aprendizaje-nacional-sena/image/upload/v1659002519/Shopping_green/proyecto/CABLE_b7sbrx.jpg" },
            { producto: "Bateria de Litio", id: 5, precio: 80000, url: "https://res.cloudinary.com/servicio-de-aprendizaje-nacional-sena/image/upload/v1659002528/Shopping_green/proyecto/bateria_de_litio_pjuvss.jpg" }
        ]
    });
})

app.get('/shopping/:idarticle', (req, res) => {

    session = req.session;

    if (session.userid) {
        //recogemos el id del articulo a comprar
        let id = req.params.idarticulo;
        email = req.session.userid;
        //validamos el parametro

        db.run(`INSERT INTO shopping(cod_compra,emailusu,info_product)   VALUES(?,?,?)`,
            [, email, id],

            function (error) {
                if (!error) {
                    res.render("pages/thanks")
                    const transporter = nodemailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 587,
                        auth: {
                            user: 'shoppingreen7@gmail.com',
                            pass: 'bzsqzbwnihjlmnya'
                        }
                    });

                    transporter.sendMail({
                        from: 'shoppingreen7@gmail.com',
                        to: email,
                        subject: 'Compra Exitosa',
                        html: '<img src="https://res.cloudinary.com/servicio-de-aprendizaje-nacional-sena/image/upload/v1659015975/Shopping_green/proyecto/Tarjeta_Cuadrada_Cumplea%C3%B1os_Infantil_Verde_2_cku8rj.png" alt="Compra Exitosa"  >'
                    })//.then((res) =>{console.log(res);}).catch((err) => {console.log(err);})
                }
                if (error) {
                    return console.log("error");
                }
            }
        )
        //enviamos un correo de confirmacion de compra...
        //retornamos un mensaje de compra exitosa
    } else {
        res.render('pages/index' )
    };
})

// app.get ('/logout', (req, res) => {
//     email = req.session.userid;
//     session = req.session;
//     if (session.userid) {
//         res.session.destroy(email);
//         return res.redirect('/');
//     }
//     return res.send('No tiene session para cerrar');
// })

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})