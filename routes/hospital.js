var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

// =======================================
// Obtener todos los hospitales
// =======================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, Hospitales) => {
                if (err) {
                    return res.status(500).json({
                        OK: false,
                        message: 'Error cargando los Hospitales',
                        errors: err
                    });
                }

                Hospital.count({}, (err, conteo) => {
                    res.status(200).json({
                        OK: true,
                        Hospitales: Hospitales,
                        total: conteo
                    });
                });


            });
});

// =======================================
// Actualizar un Hospital
// =======================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                OK: false,
                message: 'Error al buscar Hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                OK: false,
                message: 'El Hospital con el id: ' + id + 'no existe',
                errors: { message: 'No existe un Hospital con ese Id' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario_id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    OK: false,
                    message: 'Error al actualizar Hospital',
                    errors: err
                });
            }

            res.status(200).json({
                OK: true,
                Hospital: hospitalGuardado
            });

        });
    });
});

// =======================================
// Crear un Hospital
// =======================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                OK: false,
                message: 'Error al crear Hospital',
                errors: err
            });
        }

        res.status(201).json({
            OK: true,
            hospital: hospitalGuardado
        });
    });
});


// =======================================
// Eliminar un Hospital por el id
// =======================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                OK: false,
                message: 'Error al borrar Hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                OK: false,
                menssage: 'No existe un Hospital con ese id',
                errors: { message: 'No existe un Hospital con ese id' }
            });
        }

        res.status(200).json({
            OK: true,
            Hospital: hospitalBorrado
        });
    });
});

module.exports = app;