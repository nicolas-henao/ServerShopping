const express = require('express')
const app = express()
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./db/register.db');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const port = 4000
app.set('view engine', '');

app.post('/register', (req, res) => {
    let name = req.body.name;
    let lastName = req.body.lastName;
    let age = req.body.age;
    let email = req.body.email;
    let password = req.body.password;
    let numTelephone = req.body.numTelephone;

    db.run(`INSERT INTO register(name, lastName, age, email, password, numTelephone) VALUES(?, ?, ?, ?, ?, ?)`,
        [name, lastName, age, email, password, numTelephone],
        function (error) {
            if (!error) {
                console.log("Insert OK");
            } else {
                console.log("Insert error", error);
            }
        }
    );

    res.send(`Ingresar usuario: ${name}, Ingresar Apellidos: ${lastName}, Ingresar edad: ${age}, Ingresar Correo electronico: ${email}, Ingresar Contraseña: ${password}, Ingresar Numero de Telefono: ${numTelephone}`);
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})