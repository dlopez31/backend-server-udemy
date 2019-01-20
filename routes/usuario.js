var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/Usuario');

// =======================================
// Obtener todos los usuarios
// =======================================
app.get('/', (req, res, next) => {

    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        OK: false,
                        message: 'Error cargando usuario',
                        errors: err
                    });
                }

                res.status(200).json({
                    OK: true,
                    usuarios: usuarios
                });
            });
});


// =======================================
// Crear un usuario
// =======================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                OK: false,
                message: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            OK: true,
            suuario: usuarioGuardado,
            usuariotoken: req.usuario
        });
    });
});

// =======================================
// Actualizar un usuario
// =======================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                OK: false,
                message: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                OK: false,
                message: 'El usuario con el id: ' + id + 'no existe',
                errors: { message: 'No existe un usuario con ese Id' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.rol = body.rol;

        usuario.save((err, usuariGuardado) => {
            if (err) {
                return res.status(400).json({
                    OK: false,
                    message: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuariGuardado.password = ':)';

            res.status(200).json({
                OK: true,
                usuario: usuariGuardado
            });

        });
    });
});

// =======================================
// Eliminar un usuario por el id
// =======================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                OK: false,
                message: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                OK: false,
                menssage: 'No existe un usuario con ese id',
                errors: { message: 'No existe un usuario con ese id' }
            });
        }

        res.status(200).json({
            OK: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;