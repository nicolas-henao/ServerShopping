const express = require('express')
const app = express()
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const port = 4000

app.post('/login', (req, res) => {
    let name = req.body.name;
    let password = req.body.password;
    res.send(`Ingresar usuario: ${name} Ingresar Contraseña: ${password}`);
})

app.post('/register', (req, res) => {
    let name = req.body.name;
    let lastName = req.body.lastName;
    let email = req.body.email;
    let password = req.body.password;
    let numTelephone = req.body.numTelephone;
    res.send(`Ingresar usuario: ${name}, Ingresar Apellidos: ${lastName}, Ingresar Correo electronico: ${email}, Ingresar Contraseña: ${password}, Ingresar Numero de Telefono: ${numTelephone}`);
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})