var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/Usuario');

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioBD) => {

        if (err) {
            return res.status(500).json({
                OK: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioBD) {
            return res.status(400).json({
                OK: false,
                mensaje: 'Credaenciales incorrectas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
            return res.status(400).json({
                OK: false,
                mensaje: 'Credaenciales incorrectas - password',
                errors: err
            });
        }

        // Crear un token!!
        usuarioBD.password = ':)';
        var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // 4 horas

        res.status(200).json({
            OK: true,
            usuario: usuarioBD,
            token: token,
            id: usuarioBD._id
        });
    });
});

module.exports = app;