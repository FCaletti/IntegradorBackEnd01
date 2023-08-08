const express = require('express');
const { connectToMongoDB, disconnectToMongoDB } = require('./src/mongodb');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors')
const corsOp = {
    inicio : `http://localhost:${PORT}`
}
app.use(cors(corsOp)) //dominio + puerto
app.use(express.json());
app.use(express.urlencoded({ extended: true }))



app.get("/", (req, res) => {
    res.status(200).end("Bienvenidos a la API de Insumos de Computación");
});

app.get("/computacion", async (req, res) => {
    const client = await connectToMongoDB();
    if (!client) {
        res.status(500).json({msjEstado : "No se pudo conectar a la base de datos"});
        return;
    }
    const db = client.db('Integrador');
    const insumos = await db.collection('computacion').find().toArray();

    if (!insumos) {
        res.status(404).json({msjEstado : `No se encontro la coleccion ${insumos}`});
    } else {
        res.status(200).json(insumos);
    }
    await disconnectToMongoDB();
})

app.get("/computacion/id/:id", async (req, res) => {
    const insumoId = parseInt(req.params.id) || 0;
    if(insumoId === undefined || insumoId == 0){
        res.status(400)
        .json({msjEstado : 'Error al acceder al código'})
        return;
    }

    const client = await connectToMongoDB();
    if (!client) {
        res.status(500).json({msjEstado : "No se pudo conectar a la base de datos"});
        return;
    }
    const db = client.db('Integrador');
    const insumo = await db.collection('computacion').findOne({codigo: insumoId });

    if(!insumo){
        res.status(404).json({msjEstado : `No se encontro Insumo con ID ${insumoId}`});
    } else {
        insumo.msjEstado = 'Insumo encontrado satisfactoriamente'
        res.status(200).json(insumo);
    }

    await disconnectToMongoDB();
})

app.get("/computacion/nombre/:nombre", async (req, res) => {
    const nombreInsumo = req.params.nombre || 0;
    const client = await connectToMongoDB();
    if (!client) {
        res.status(500).json({msjEstado : "No se pudo conectar a la base de datos"});
        return;
    }
    const db = client.db("Integrador");
    const insumos = await db.collection('computacion').find({nombre: {$regex : nombreInsumo, $options : 'i' }}).toArray();
    if(!insumos || insumos.length == 0){
        res.status(404).json({msjEstado : `No se encontraron datos con el texto ${nombreInsumo}`})
    } else {
        res.status(200).json(insumos);
    }
    await disconnectToMongoDB();
})

app.post("/computacion/nuevo", async (req, res) => {
    const client = await connectToMongoDB();
    if (!client) {
        res.status(500).json({msjEstado : "No se pudo conectar a la base de datos"});
        return;
    }
    const db = client.db("Integrador");
    const coleccion = db.collection('computacion')
    const ultimoDoc = await coleccion.find().sort({codigo:-1}).limit(1).toArray()
    if(!ultimoDoc){
        res.status(400)
        .json({msjEstado : "Error al crear el código del nuevo insumo"})
        return;
    }

    const nuevoCodigo = (ultimoDoc.length == 0) ? 1 : parseInt(ultimoDoc[0].codigo) + 1
    const nuevoNombre = (req.body.nombre)? req.body.nombre : 'Desconocido'
    const nuevoPrecio = (req.body.precio)? parseFloat(req.body.precio) : 0
    const nuevaCateg = (req.body.categoria)? req.body.categoria : 'Desconocida'

    const nuevoInsumo = {
        "codigo": nuevoCodigo,
        "nombre": nuevoNombre,
        "precio": nuevoPrecio,
        "categoria": nuevaCateg
    }
    
    const crearInsumo = await coleccion.insertOne(nuevoInsumo)
    if (crearInsumo) {
        nuevoInsumo.msjEstado = 'Insumo agregado satisfactoriamente'
        res.status(200).json(nuevoInsumo)
    } else {
        res.status(400).json({msjEstado : `No se pudo crear el nuevo insumo`})
    }

    await disconnectToMongoDB();
})


app.patch("/computacion/reempPrecio/:codigo", async (req, res) => {
    const codigoInsumo = parseInt(req.params.codigo) || undefined;
    if(codigoInsumo === undefined || codigoInsumo == 0){
        res.status(400)
        .json({msjEstado : 'Error al acceder al código'})
        return;
    }

    const nuevoPrecio = parseFloat(req.body.precio) || false
    if (!nuevoPrecio){
        res.status(400).json({msjEstado : "Precio no especificado"})
        return;
    }
    const client = await connectToMongoDB();
    if (!client) {
        res.status(500).json({msjEstado : "No se pudo conectar a la base de datos"});
        return;
    }
    const db = client.db("Integrador");
    const coleccion = db.collection('computacion')
    let verInsumo = await coleccion.findOne({codigo: codigoInsumo })
    if(!verInsumo){
        res.status(404).json({msjEstado : `No se encontró insumo con código ${codigoInsumo}`})
    } else {
        const cambiarInsumo = await coleccion.updateOne({codigo : codigoInsumo}, {$set : {precio : nuevoPrecio}})
        if (cambiarInsumo) {
            verInsumo = await coleccion.findOne({codigo: codigoInsumo})
            verInsumo.msjEstado = 'Precio del insumo actualizado satisfactoriamente'
            res.status(200).json(verInsumo)
        } else {
            res.status(404).json({msjEstado : `No se pudo actualizar el insumo ${codigoInsumo}`})
        }
    }
    await disconnectToMongoDB();
})


app.delete("/computacion/borraCodigo/:codigo", async (req, res) => {
    const codigoInsumo = parseInt(req.params.codigo) || undefined;
    if(codigoInsumo === undefined){
        res.status(400)
        .json({msjEstado : 'Error al acceder al código'})
        return;
    }
    const client = await connectToMongoDB();
    if (!client) {
        res.status(500).json({msjEstado : "No se pudo conectar a la base de datos"});
        return;
    }
    const db = client.db("Integrador");
    const coleccion = db.collection('computacion')
    const verInsumo = await coleccion.findOne({codigo: codigoInsumo })
    if(!verInsumo){
        res.status(404).json({msjEstado : `No se encontró insumo con código ${codigoInsumo}`})
    } else {
        const borrarInsumo = await coleccion.deleteOne({codigo: codigoInsumo })
        if(!borrarInsumo){
            res.status(400).json({msjEstado : `No se pudo eliminar el Insumo ${codigoInsumo}`})
        } else {
            res.status(200).json({msjEstado : `Insumo ${codigoInsumo} eliminado satisfactoriamente`})
        }
    }
    await disconnectToMongoDB();
})

app.all('/*', (req, res)=>{
    res.status(400).json({msjEstado : `URL no identificada`})
})

module.exports = app.listen(PORT, ()=>{
    console.log(`Servidor iniciado en puerto ${PORT}`);
})
