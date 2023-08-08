
const request = require('supertest')
const chai = require('chai')
const assert = require('chai').assert
const chaiHttp = require('chai-http')
chai.use(chaiHttp)
const srvApi = require('../server')
const varios = {'nuevoCod':0}

describe('Testeo de API <</computacion/>>', ()=>{

   describe('Testeo de GET <</>>', ()=>{
      it('Debe tirar todos los insumos usando <</>>', (done)=>{
         request(srvApi)
         .get('/computacion/')
         .set('Accept', 'application/json') // indica que cliente acepta formato json
         .set('Content-Type', 'application/json') // indica q el body de la peticion viene en formato json
         .end((err, res) =>{          // analizo el resultado del get /computacion/
            assert.equal(res.status, 200)
            assert.typeOf(res.body, 'array')
            done()
         })
      })
   })

   describe('Testeo de GET <</id/:id>>', ()=>{
      const datoBuscado = [10, 1100, 'aaa']
      it(`Debe encontrar un insumo con el código ${datoBuscado[0]}`, (done)=>{
         request(srvApi)
         .get(`/computacion/id/${datoBuscado[0]}`)
         .set('Accept', 'application/json') // indica que cliente acepta formato json
         .set('Content-Type', 'application/json') // indica q el body de la peticion viene en formato json
         .end((err, res) =>{
            assert.equal(res.status, 200, 'El insumo deberia haber sido encontrado')
            assert.typeOf(res.body, 'object')
            assert.equal(res.body.msjEstado, 'Insumo encontrado satisfactoriamente')
            assert.exists(res.body.codigo)
            assert.exists(res.body.nombre)
            assert.exists(res.body.precio)
            assert.exists(res.body.categoria)
            done()
         })
      })
      it(`No debe encontrar un insumo con el código ${datoBuscado[1]}`, (done)=>{
         request(srvApi)
         .get(`/computacion/id/${datoBuscado[1]}`)
         .set('Accept', 'application/json') // indica que cliente acepta formato json
         .set('Content-Type', 'application/json') // indica q el body de la peticion viene en formato json
         .end((err, res) =>{
            assert.equal(res.status, 404, 'El insumo no deberia existir')
            assert.typeOf(res.body, 'object')
            assert.equal(res.body.msjEstado, `No se encontro Insumo con ID ${datoBuscado[1]}`)
            assert.notExists(res.body.codigo)
            assert.notExists(res.body.nombre)
            assert.notExists(res.body.precio)
            assert.notExists(res.body.categoria)
            done()
         })
      })
      it(`Debe dar error al buscar un insumo con el código ${datoBuscado[2]}`, (done)=>{
         request(srvApi)
         .get(`/computacion/id/${datoBuscado[2]}`)
         .set('Accept', 'application/json') // indica que cliente acepta formato json
         .set('Content-Type', 'application/json') // indica q el body de la peticion viene en formato json
         .end((err, res) =>{
            assert.equal(res.status, 400, 'Deberia dar error de acceso al código')
            assert.typeOf(res.body, 'object')
            assert.equal(res.body.msjEstado, 'Error al acceder al código')
            assert.notExists(res.body.codigo)
            assert.notExists(res.body.nombre)
            assert.notExists(res.body.precio)
            assert.notExists(res.body.categoria)
            done()
         })
      })
   })

   describe('Testeo de GET <</nombre/:texto>>', ()=>{
      const datoBuscado = ['top', 'aaa', '']
      it(`Debe encontrar un insumo que contenga ${datoBuscado[0]}`, (done)=>{
         request(srvApi)
         .get(`/computacion/nombre/${datoBuscado[0]}`)
         .set('Accept', 'application/json') // indica que cliente acepta formato json
         .set('Content-Type', 'application/json') // indica q el body de la peticion viene en formato json
         .end((err, res) =>{
            assert.equal(res.status, 200, 'El insumo deberia haber sido encontrado')
            assert.typeOf(res.body, 'array')
            assert.isNotEmpty(res.body, 'Deberia haber encontado datos')
            res.body.forEach((el) => {
               assert.include(el.nombre,datoBuscado[0],`${el.nombre} no contiene ${datoBuscado[0]}`)
            });
            done()
         })
      })

      it(`No debe encontrar algún insumo que contenga ${datoBuscado[1]}`, (done)=>{
         request(srvApi)
         .get(`/computacion/nombre/${datoBuscado[1]}`)
         .set('Accept', 'application/json') // indica que cliente acepta formato json
         .set('Content-Type', 'application/json') // indica q el body de la peticion viene en formato json
         .end((err, res) =>{
            assert.equal(res.status, 404, 'No deberia haber encontado datos')
            assert.typeOf(res.body, 'object')
            assert.equal(res.body.msjEstado, `No se encontraron datos con el texto ${datoBuscado[1]}`)
            done()
         })
      })
      it(`Debe dar error al buscar un insumo sin ingresar algun texto`, (done)=>{
         request(srvApi)
         .get(`/computacion/nombre/${datoBuscado[2]}`)
         .set('Accept', 'application/json') // indica que cliente acepta formato json
         .set('Content-Type', 'application/json') // indica q el body de la peticion viene en formato json
         .end((err, res) =>{
            assert.equal(res.status, 400, 'Deberia dar error de URL')
            assert.typeOf(res.body, 'object')
            assert.equal(res.body.msjEstado, 'URL no identificada')
            done()
         })
      })
   })

   describe('Testeo de nuevo insumo usando POST <</nuevo>>', ()=>{
      it('Crear nuevo insumo', (done)=>{
         const nuevoArt = {
            "nombre": "Creado en Test",
            "precio": 99.99,
            "categoria": "enTest"
         }
         request(srvApi)
         .post('/computacion/nuevo')
         .set('Accept', 'application/json') // indica que cliente acepta formato json
         .set('Content-Type', 'application/json') // indica q el body de la peticion viene en formato json
         .send(nuevoArt)
         .end((err, res) =>{
            assert.equal(res.status, 200, 'Deberia haberse creado')
            assert.typeOf(res.body, 'object')
            assert.equal(res.body.msjEstado, 'Insumo agregado satisfactoriamente')
            assert.exists(res.body.codigo)
            assert.exists(res.body.nombre)
            assert.exists(res.body.precio)
            assert.exists(res.body.categoria)
            varios.nuevoCod = res.body.codigo   //guardo el codigo del nuevo insumo para cambiar el precio en PATCH y borrarlo en DELETE
            done()
            console.log(`Creado el insumo con el código : ${varios.nuevoCod}`)
         })
      })
   })

   describe('Testeo de modificación usando PATCH', ()=>{
      it('Modificar precio a insumo creado en test', (done)=>{
         const codigoArt = varios.nuevoCod
         const precioArt = 129.99
         const novedad = {
            "nombre": "Tableta Gráfica trucha",
            "precio": precioArt,
            "categoria": "Accesorios baratos"
         }
         request(srvApi)
         .patch(`/computacion/reempPrecio/${codigoArt}`)
         .set('Accept', 'application/json') // indica que cliente acepta formato json
         .set('Content-Type', 'application/json') // indica q el body de la peticion viene en formato json
         .send(novedad)
         .end((err, res) =>{
            assert.equal(res.status, 200, 'Deberia haber encontrado el insumo para modificarlo')
            assert.exists(res.body.msjEstado, 'Error en formato de la respuesta')
            assert.equal(res.body.msjEstado, 'Precio del insumo actualizado satisfactoriamente')
            done()
            console.log(`Actualizado el precio insumo con el código : ${codigoArt}`)
         })
      })

      it('Modificar precio a insumo preexistente (Art 10)', (done)=>{
         const codigoArt = 10
         const precioArt = 139.99
         const novedad = {
            "nombre": "Tableta Gráfica trucha",
            "precio": precioArt,
            "categoria": "Accesorios baratos"
         }
         request(srvApi)
         .patch(`/computacion/reempPrecio/${codigoArt}`)
         .set('Accept', 'application/json') // indica que cliente acepta formato json
         .set('Content-Type', 'application/json') // indica q el body de la peticion viene en formato json
         .send(novedad)
         .end((err, res) =>{
            assert.equal(res.status, 200, 'Deberia haber encontrado el insumo para modificarlo')
            assert.exists(res.body.msjEstado, 'Error en formato de la respuesta')
            assert.equal(res.body.msjEstado, 'Precio del insumo actualizado satisfactoriamente')
            done()
         })
      })
      it('Modificar precio a insumo inexistente (Art 1000)', (done)=>{
         const codigoArt = 1000
         const precioArt = 139.99
         const novedad = {
            "nombre": "Tableta Gráfica trucha",
            "precio": precioArt,
            "categoria": "Accesorios baratos"
         }
         request(srvApi)
         .patch(`/computacion/reempPrecio/${codigoArt}`)
         .set('Accept', 'application/json') // indica que cliente acepta formato json
         .set('Content-Type', 'application/json') // indica q el body de la peticion viene en formato json
         .send(novedad)
         .end((err, res) =>{
            assert.equal(res.status, 404, 'No deberia haber encontrado el insumo para modificarlo')
            assert.exists(res.body.msjEstado, 'Error en formato de la respuesta')
            assert.equal(res.body.msjEstado, `No se encontró insumo con código ${codigoArt}`)
            done()
         })
      })
      it('Modificar precio a insumo 10 sin enviar el precio', (done)=>{
         const codigoArt = 10
         const precioArt = 139.99
         const novedad = {
            "nombre": "Tableta Gráfica trucha",
            "categoria": "Accesorios baratos"
         }
         request(srvApi)
         .patch(`/computacion/reempPrecio/${codigoArt}`)
         .set('Accept', 'application/json') // indica que cliente acepta formato json
         .set('Content-Type', 'application/json') // indica q el body de la peticion viene en formato json
         .send(novedad)
         .end((err, res) =>{
            assert.equal(res.status, 400, 'Deberia haber dado error')
            assert.exists(res.body.msjEstado, 'Error en formato de la respuesta')
            assert.equal(res.body.msjEstado, 'Precio no especificado')
            done()
         })
      })
      it('Modificar precio a insumo inexistente (Art "aa")', (done)=>{
         const codigoArt = 'aa'
         const precioArt = 139.99
         const novedad = {
            "nombre": "Tableta Gráfica trucha",
            "precio": precioArt,
            "categoria": "Accesorios baratos"
         }
         request(srvApi)
         .patch(`/computacion/reempPrecio/${codigoArt}`)
         .set('Accept', 'application/json') // indica que cliente acepta formato json
         .set('Content-Type', 'application/json') // indica q el body de la peticion viene en formato json
         .send(novedad)
         .end((err, res) =>{
            assert.equal(res.status, 400, 'Deberia haber dado error')
            assert.exists(res.body.msjEstado, 'Error en formato de la respuesta')
            assert.equal(res.body.msjEstado, `Error al acceder al código`)
            done()
         })
      })


   })

   describe('Testeo de eliminacion de insumo x codigo usando DELETE', ()=>{
      it(`Eliminar último insumo creado en test`, (done) =>{
         request(srvApi)
         .delete(`/computacion/borraCodigo/${varios.nuevoCod}`)
         .set('Accept', 'application/json') // indica que cliente acepta formato json
         .set('Content-Type', 'application/json') // indica q el body de la peticion viene en formato json
         .end((err,res) =>{
            assert.equal(res.status, 200, 'Deberia haber encontrado el insumo para borrarlo')
            assert.exists(res.body.msjEstado, 'Error en formato de la respuesta')
            assert.equal(res.body.msjEstado, `Insumo ${varios.nuevoCod} eliminado satisfactoriamente`)
            done()
            console.log(`Eliminado insumo con el código : ${varios.nuevoCod}`)
         })
      })
      it(`Eliminar un insumo que no existe (Art. 1000)`, (done) =>{
         const codigoArt = 1000
         request(srvApi)
         .delete(`/computacion/borraCodigo/${codigoArt}`)
         .set('Accept', 'application/json') // indica que cliente acepta formato json
         .set('Content-Type', 'application/json') // indica q el body de la peticion viene en formato json
         .end((err,res) =>{
            assert.equal(res.status, 404, 'No deberia haber encontrado el insumo')
            assert.exists(res.body.msjEstado, 'Error en formato de la respuesta')
            assert.equal(res.body.msjEstado, `No se encontró insumo con código ${codigoArt}`)
            done()
         })
      })
      it(`Eliminar un insumo pasando string al código`, (done) =>{
         const codigoArt = 'aa'
         request(srvApi)
         .delete(`/computacion/borraCodigo/${codigoArt}`)
         .set('Accept', 'application/json') // indica que cliente acepta formato json
         .set('Content-Type', 'application/json') // indica q el body de la peticion viene en formato json
         .end((err,res) =>{
            assert.equal(res.status, 400, 'Deberia haber dado error')
            assert.exists(res.body.msjEstado, 'Error en formato de la respuesta')
            assert.equal(res.body.msjEstado, 'Error al acceder al código')
            done()
         })
      })
   })

})


