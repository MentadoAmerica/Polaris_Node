const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let miembros = [];
let eventos = [];

app.get('/api/miembros', (req, res) => {
    res.json(miembros);
});

app.post('/api/miembros', (req, res) => {
    const {
        nombre, apellido_paterno, apellido_materno, correo, telefono,
        fecha_nacimiento, genero, institucion, numero_control, carrera,
        semestre, anio_ingreso, rol
    } = req.body;

    if (!nombre || !apellido_paterno || !correo || !telefono || !fecha_nacimiento || !rol) {
        return res.status(400).json({ mensaje: "Faltan campos obligatorios" });
    }

    const nuevoMiembro = {
        id: Date.now(),
        nombre,
        apellido_paterno,
        apellido_materno: apellido_materno || '',
        correo,
        telefono,
        fecha_nacimiento,
        genero: genero || '',
        institucion: institucion || '',
        numero_control: numero_control || '',
        carrera: carrera || '',
        semestre: semestre || '',
        anio_ingreso: anio_ingreso || '',
        rol
    };

    miembros.push(nuevoMiembro);
    res.status(201).json({ mensaje: "Registro exitoso", miembro: nuevoMiembro });
});

app.put('/api/miembros/:id', (req, res) => {
    const { id } = req.params;
    const {
        nombre, apellido_paterno, apellido_materno, correo, telefono,
        fecha_nacimiento, genero, institucion, numero_control, carrera,
        semestre, anio_ingreso, rol
    } = req.body;

    const index = miembros.findIndex(m => m.id == id);
    if (index === -1) {
        return res.status(404).json({ mensaje: "Miembro no localizado" });
    }

    miembros[index] = {
        id: Number(id),
        nombre,
        apellido_paterno,
        apellido_materno: apellido_materno || '',
        correo,
        telefono,
        fecha_nacimiento,
        genero: genero || '',
        institucion: institucion || '',
        numero_control: numero_control || '',
        carrera: carrera || '',
        semestre: semestre || '',
        anio_ingreso: anio_ingreso || '',
        rol
    };

    res.json({ mensaje: "Datos actualizados", miembro: miembros[index] });
});

app.delete('/api/miembros/:id', (req, res) => {
    const { id } = req.params;
    miembros = miembros.filter(m => m.id != id);
    res.json({ mensaje: "Registro eliminado" });
});

app.get('/api/eventos', (req, res) => {
    res.json(eventos);
});

app.post('/api/eventos', (req, res) => {
    const { nombre, tipo, descripcion, fecha_inicio, fecha_fin, estado, participantes } = req.body;
    
    if (!nombre || !tipo || !fecha_inicio || !fecha_fin || !estado) {
        return res.status(400).json({ mensaje: "Faltan campos obligatorios" });
    }
    
    const nuevoEvento = {
        id: Date.now(),
        nombre,
        tipo,
        descripcion: descripcion || '',
        fecha_inicio,
        fecha_fin,
        estado,
        participantes: participantes || []
    };
    
    eventos.push(nuevoEvento);
    res.status(201).json({ mensaje: "Evento registrado", evento: nuevoEvento });
});

app.get('/api/eventos/:id', (req, res) => {
    const { id } = req.params;
    const evento = eventos.find(e => e.id == id);
    if (evento) {
        res.json(evento);
    } else {
        res.status(404).json({ mensaje: "Evento no encontrado" });
    }
});

app.put('/api/eventos/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, tipo, descripcion, fecha_inicio, fecha_fin, estado, participantes } = req.body;
    
    const index = eventos.findIndex(e => e.id == id);
    if (index === -1) {
        return res.status(404).json({ mensaje: "Evento no encontrado" });
    }
    
    eventos[index] = {
        id: Number(id),
        nombre,
        tipo,
        descripcion: descripcion || '',
        fecha_inicio,
        fecha_fin,
        estado,
        participantes: participantes || []
    };
    
    res.json({ mensaje: "Evento actualizado", evento: eventos[index] });
});

app.delete('/api/eventos/:id', (req, res) => {
    const { id } = req.params;
    const index = eventos.findIndex(e => e.id == id);
    if (index === -1) {
        return res.status(404).json({ mensaje: "Evento no encontrado" });
    }
    eventos.splice(index, 1);
    res.json({ mensaje: "Evento eliminado" });
});

app.listen(PORT, () => {
    console.log(`🚀 Sistema POLARIS activo en http://localhost:${PORT}`);
});