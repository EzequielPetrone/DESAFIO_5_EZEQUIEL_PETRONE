try {
    //Importo clase Contenedor e instancio uno
    const Contenedor = require('./class/class_Contenedor')
    const contenedorProd = new Contenedor('./datos/productos.txt')

    //Importo express y creo server app
    const express = require("express");
    const app = express();

    //Importo y configuro Handlebars
    const handlebars = require('express-handlebars');
    app.engine("hbs", handlebars.engine({
        extname: ".hbs",
        defaultLayout: 'index',
        layoutsDir: __dirname + "/views/layouts",
        partialsDir: __dirname + "/views/partials/"
    }));

    app.set('view engine', 'hbs');
    app.set('views', './views');

    //Configuro Middleware de manejo de errores
    const mwError = (err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({ error: err });
    }
    app.use(mwError)

    //Configuro para poder leer sin problemas los req.body
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    //Variable que uso para setear alertas en el frontend
    let msjAlert = { cond: false, msj: '' }

    // Renderizo main donde tengo el form
    app.get('/', async (req, res) => {
        try {
            res.render('main', msjAlert)

        } catch (error) {
            res.status(500).json({ error: error });
        }
        msjAlert = { cond: false, msj: '' }
    })

    app.get('/productos', async (req, res) => {
        try {
            res.render('productos', { productos: await contenedorProd.getAll() });

        } catch (error) {
            res.status(500).json({ error: error });
        }
    })

    app.post("/productos", async (req, res) => {
        try {
            const prod = {
                title: req.body.productTitle,
                price: req.body.productPrice,
                thumbnail: req.body.productImgUrl,
            }
            let newId = await contenedorProd.save(prod)

            if (newId) {
                msjAlert = { cond: true, msj: 'Nuevo Producto creado con id: ' + newId }
            } else {
                throw 'No se pudo crear el producto'
            }
        } catch (error) {
            msjAlert = { cond: true, msj: error }
        }
        res.redirect('/')
    })

    //Defino puerto y pongo server a escuchar
    const PUERTO = 8080
    const server = app.listen(PUERTO, () => {
        console.log('Servidor HTTP escuchando en puerto:', server.address().port);
    })

    //Server Error handling
    server.on("error", error => {
        console.log('Error en el servidor:', error);
    })

} catch (error) {
    console.log('Error en el hilo principal:', error);
}


