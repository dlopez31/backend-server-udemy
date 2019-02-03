var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

// =======================================
// Obtener todos los medicos
// =======================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        OK: false,
                        message: 'Error cargando los Medicos',
                        errors: err
                    });
                }

                Medico.count({}, (err, conteo) => {
                    res.status(200).json({
                        OK: true,
                        medicos: medicos,
                        total: conteo
                    });
                });


            });
});

// =======================================
// Actualizar un Medico
// =======================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                OK: false,
                message: 'Error al buscar Medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                OK: false,
                message: 'El Medico con el id: ' + id + 'no existe',
                errors: { message: 'No existe un Medico con ese Id' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    OK: false,
                    message: 'Error al actualizar Medico',
                    errors: err
                });
            }

            res.status(200).json({
                OK: true,
                Medico: medicoGuardado
            });

        });
    });
});

// =======================================
// Crear un Medico
// =======================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                OK: false,
                message: 'Error al crear Medico',
                errors: err
            });
        }

        res.status(201).json({
            OK: true,
            hospital: medicoGuardado
        });
    });
});


// =======================================
// Eliminar un Medico por el id
// =======================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                OK: false,
                message: 'Error al borrar Medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                OK: false,
                menssage: 'No existe un Medico con ese id',
                errors: { message: 'No existe un Medico con ese id' }
            });
        }

        res.status(200).json({
            OK: true,
            Medico: medicoBorrado
        });
    });
});

module.exports = app;