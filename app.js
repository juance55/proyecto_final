

//  Llamamos a express
const express = require('express');
const activo = express();
const morgan = require('morgan');

//(sin urlencoded nos devuelve "undefined") para capturar datos del formulario.
activo.use(express.urlencoded({extended:false}));
activo.use(express.json());

// Invocamos a dotenv
const dotenv = require('dotenv');
dotenv.config({ path: './env/.env'});

// directortio de assets
activo.use('/resources',express.static('public'));
activo.use('/resources', express.static(__dirname + '/public'));

//  motor de plantillas
activo.set('port', process.env.PORT || 3000);
activo.set('view engine','ejs');

// creacion de variable bcrypt para encriptar contraseñas
const bcrypt = require('bcryptjs');

// variables de session
const session = require('express-session');
activo.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(morgan("dev"));
// Conexxion de la base de datos
const connection = require('./database/db');

// Rutas de las paginas del proyecto
    activo.get('/login',(req, res)=>{
		res.render('login');
	})

	activo.get('/register',(req, res)=>{
		res.render('register');
	})

	activo.get('/inicio',(req, res)=>{
		res.render('inicio');
	})

	activo.get('/proceso_reserva',(req, res)=>{
		res.render('proceso_reserva');
	})

	
// Registrarse
activo.post('/register', async (req, res)=>{
	const nombre = req.body.nombre;
	const apellido = req.body.apellido;
    const telefono = req.body.telefono;
	const correo = req.body.correo;
	const contra1= req.body.contra1;
	const contra2= req.body.contra2;
	let encriptado1 = await bcrypt.hash(contra1, 8);
	let encriptado2 = await bcrypt.hash(contra2, 8);

    connection.query('INSERT INTO usuarios SET ?',{nombre:nombre, apellido:apellido, telefono:telefono, correo:correo, contra1:encriptado1, 
		contra2:encriptado2}, async (error, results)=>{
        if(error){
            console.log(error);
        }else{     
			res.render('register', {
				alert: true,
				alertTitle: "Registrarse",
				alertMessage: "¡Registracion exitosa!",
				alertIcon:'success',
				showConfirmButton: false,
				timer: 1500,
				ruta: ''
			});     
        }
	});
})



//Inicion de sesion 
activo.post('/auth', async (req, res)=> {
	const correo = req.body.correo;
	const contra1 = req.body.contra1;    
    let encriptacion = await bcrypt.hash(contra1, 8);
	if (correo && contra1) {
		connection.query('SELECT * FROM usuarios WHERE correo = ?', [correo], async (error, results, fields)=> {
			if( results.length == 0 || !(await bcrypt.compare(contra1, results[0].contra1)) ) {    
				res.render('login', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "El usuario o la contraseña son incorrectas",
                        alertIcon:'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'    
                    });
							
			} else {         
				//Creacion de la variable de inicio de sesion       
				req.session.loggedin = true;                
				req.session.name = results[0].nombre;
				res.render('login', {
					alert: true,
					alertTitle: "Ingreso correcto",
					alertMessage: "¡Inicio de sesion correcto!",
					alertIcon:'success',
					showConfirmButton: false,
					timer: 1500,
					ruta: ''
				});        			
			}			
			res.end();
		});
	} else {	
		res.send('Ingrese su usuario!');
		res.end();
	}
});

//Mensaje
activo.post('/inicio', async (req, res)=>{
	const nombre = req.body.nombre;
	const correo = req.body.correo;
    const asunto = req.body.asunto;
	const mensaje = req.body.mensaje;

    connection.query('INSERT INTO contacto SET ?',{nombre:nombre, correo:correo, asunto:asunto, 
		mensaje:mensaje}, async (error, results)=>{
        if(error){
            console.log(error);
        }else{            
			res.render('inicio', {
				alert: true,
				alertTitle: "Mensaje",
				alertMessage: "Mensaje enviado",
				alertIcon:'success',
				showConfirmButton: false,
				timer: 1500,
				ruta: ''
			});      
        }
	});
})


//Reserva
activo.post('/proceso_reserva', async (req, res)=>{
	const nombre = req.body.nombre;
	const apellido = req.body.apellido;
    const numero_tarjeta = req.body.numero_tarjeta;
	const mes = req.body.mes;
	const anio = req.body.anio;
	const codigo = req.body.codigo;
	let encriptado = await bcrypt.hash(codigo, 8);
    connection.query('INSERT INTO reservar SET ?',{nombre:nombre, apellido:apellido, numero_tarjeta:numero_tarjeta, mes:mes, anio:anio,
		codigo:encriptado}, async (error, results)=>{
        if(error){
            console.log(error);
        }else{            
			res.render('proceso_reserva', {
				alert: true,
				alertTitle: "Reserva",
				alertMessage: "Reservación Exitosa",
				alertIcon:'success',
				showConfirmButton: false,
				timer: 500,
				ruta: ''
			});    
        }
	});
})


//Inicio de sesion de las paginas

activo.get('/', (req, res)=> {
	if (req.session.loggedin) {
		res.render('index',{
			login: true,
			name: req.session.name			
		});		
	} else {
		res.render('index',{
			login:false,
			name:'Registrarse',			
		});				
	}
	res.end();
});

activo.get('/habitaciones', (req, res)=> {
	if (req.session.loggedin) {
		res.render('habitaciones',{
			login: true,
			name: req.session.name			
		});		
	} else {
		res.render('habitaciones',{
			login:false,
			name:'Registrarse',			
		});				
	}
	res.end();
});

activo.get('/reservar', (req, res)=> {
	if (req.session.loggedin) {
		res.render('reservar',{
			login: true,
			name: req.session.name			
		});		
	} else {
		res.render('reservar',{
			login:false,
			name:'Registrarse',			
		});				
	}
	res.end();
});


//limpiar cache
activo.use(function(req, res, next) {
    if (!req.nombre)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

 //Cerrar la sesion del usuario

 activo.get('/logout', function (req, res) {
	req.session.destroy(() => {
	  res.redirect('/') 
	})
});

activo.listen(3000, (req, res)=>{
    console.log('SERVER RUNNING IN http://localhost:3000');
});