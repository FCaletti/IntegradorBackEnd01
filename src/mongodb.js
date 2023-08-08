const dotenv = require('dotenv');
dotenv.config();

const { MongoClient } = require('mongodb');

const URI = process.env.MONGODB_URLSTRING;
const client = new MongoClient(URI);

async function connectToMongoDB() {
    try {
        await client.connect();
//        console.log('Conectado a la base de datos');
        return client;
    } catch(error) {
        console.error('Error al conectarse a la base de datos', error);
        return null;
    }
}

async function disconnectToMongoDB() {
    try {
        await client.close();
//        console.log('Desconectado de la base de datos');
    } catch(error){
        console.error('Error al desconectarse de la base de datos', error);
    }
}

module.exports= { connectToMongoDB, disconnectToMongoDB };