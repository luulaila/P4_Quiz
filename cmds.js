const Sequelize = require('sequelize');

const {log, biglog, errorlog, colorize} = require("./out");
const {models} = require("./model"); //devuelve un objeto sequelize





// FUNCIONES

exports.helpCmd = (socket, rl) => {
	log(socket, '	-- Comandos --');
	log(socket, '		h | help : Muestra la ayuda con los posibles comandos.');
  	log(socket, '		list : Lista los quizzes existentes.');
  	log(socket, '		show <id> : Muestra la pregunta y la respuesta del quiz indicado.');
  	log(socket, '		add : Añade un nuevo quiz interactivamente.');
  	log(socket, '		delete <id> : Borra el quiz indicado.');
  	log(socket, '		edit <id> : Edita el quiz indicado.');
  	log(socket, '		test <id> : Prueba el quiz indicado.');
  	log(socket, '		p | play : Jugar a preguntar aleatoriamente los quizzes.');
  	log(socket, '		credits : Créditos.');
  	log(socket, '		q | quit : Sale del programa.');
  	rl.prompt();
}; 

exports.listCmd = ( socket, rl) => {
	/*
	model.getAll().forEach((quiz, id) => {
		log(`[${colorize(id, 'magenta')}]: ${quiz.question}`);
	});

	rl.prompt();
	*/

	models.quiz.findAll() //Devuelve un array con los quizzes
	.each(quiz => { // Coge todos los quiz que hay dentro del array que devuelve findAll
		log(socket, ` [${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);
	})
	.catch(error => {
		errorlog(socket,  error.message);
	})
	.then(() => {
		rl.prompt();
	})

};

// Valida que se ha introducido un valor para el parametro
// Convierte el parámetro en un numero entero
const validateId = id => {
	
	return new Sequelize.Promise((resolve, reject) => {// Sequilize.Promise - promesas de sequielize
		if (typeof id === "undefined") {
			reject(new Error(`Falta el parametro <id>.`));
		} else {
			id = parseInt(id); //coger la parte entera y descartar lo demás 
			if (Number.isNaN(id)) {
				reject(new Error(`El valor del parámetro <id> no es un número`))
			} else {
				resolve(id); // Se resuelve la promesa con el id
			}
		}
	});
};



exports.showCmd = (socket, rl, id) => {

	validateId(id)
	.then(id => models.quiz.findById(id)) //Del modelo de datos voy al modelo quiz y busco un quiz por id
	.then(quiz => {
		if (!quiz) {
			throw new Error(`No existe un quiz asociado al id=${id}.`);
		}
		log(socket, ` [${colorize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
	})
	.catch(error => {
		errorlog(socket, error.message);
	})
	.then(() => {
		rl.prompt();
	});
};


const makeQuestion = (rl, text) => {
	
	return new Sequelize.Promise((resolve, reject) => {
		rl.question(colorize(text, 'red'), answer => {
			resolve(answer.trim());
		});
	});
};





exports.addCmd = (socket, rl) => {

	makeQuestion(rl, 'Introduzca una pregunta: ') //Hasta que no introduzca una pregunta no finaliza
	.then(q => {
		return makeQuestion(rl, 'Introduce la respuesta: ')
		.then(a => {
			return {question: q, answer: a};
		});
	})
	.then(quiz => {
		return models.quiz.create(quiz);
	})
	.then((quiz) => {
		log(socket, ` ${colorize('Se ha añadido', 'magenta')}: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
	})
	.catch(Sequelize.ValidationError, error => { //Si hay errores de validación
		errorlog(socket, 'El quiz es erroneo: ');
		error.errors.forEach(({message}) => errorlog(message));
	})
	.catch(error => {
		errorlog(socket, error.message);
	})
	.then(() => {
		rl.prompt();
	});
};

exports.deleteCmd = (socket, rl, id) => {

	validateId(id)
	.then(id => models.quiz.destroy({where: {id}})) //Condición: el elemento que quiero destruir es el que tiene como id el valor id
	.catch(error => {
		errorlog(socket, error.message);
	})
	.then(() => {
		rl.prompt();
	});
};

exports.editCmd = (socket, rl, id) => {

	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if (!quiz) {
			throw new Error(`No existe un quiz asociado al id=${id}.`);
		}

		process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);
		return makeQuestion(rl, 'Introduzca la pregunta: ')
		.then(q => {
			process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
			return makeQuestion(rl, 'Introduzca la respuesta: ')
			.then(a => {
				quiz.question = q;
				quiz.answer = a;
				return quiz;
			});
		});	
	}) 
	.then(quiz => {
		return quiz.save();
	})
	.then(quiz => {
		log(socket, `Se ha cambiado el quiz ${colorize(quiz.id, 'magenta')} por: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
	})
	.catch(Sequelize.ValidationError, error => { //Si hay errores de validación
		errorlog(socket, 'El quiz es erroneo: ');
		error.errors.forEach(({message}) => errorlog(message));
	})
	.catch(error => {
		errorlog(socket, error.message);
	})
	.then(() => {
		rl.prompt();
	}); 
};

exports.testCmd = (socket, rl, id) => {

	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if (!quiz) {
			throw new Error(`No existe un quiz asociado al id=${id}.`);
		}

		return makeQuestion(rl, `${quiz.question}?: `)
		.then(answerrr => {
			if((answerrr.toLowerCase()) === ((quiz.answer).toLowerCase().trim())) {
				log(socket, 'CORRECTO', 'green');
			} else {
				log(socket, 'INCORRECTO', 'red')
			}	
		})
	})
	.catch(Sequelize.ValidationError, error => { //Si hay errores de validación
		errorlog(socket, 'El quiz es erroneo: ');
		error.errors.forEach(({message}) => errorlog(message));
	})
	.catch(error => {
		errorlog(socket, error.message);
	})
	.then(() => {
		rl.prompt();
	}); 



};

exports.playCmd = (socket, rl) => {
	
	//PROMESA (se realiza en segundo plano y tarda un tiempo, el codigo sigue ejecutandose)

	let score = 0;
	let toBePlayed = [];

	const playOne = () => {

		return Promise.resolve() // Promesa ya construida, solo tengo que encadenar los then y no hace falta llamar a resolve o reject
		.then (() => {

			if (toBePlayed.length <= 0) {
				//log("Fin del juego");
				return; // Para no continuar y pasar al siguiente then
			}

			let pos = Math.floor(Math.random()*toBePlayed.length);
			let quiz = toBePlayed[pos];
			toBePlayed.splice(pos, 1); // Desde la posición pos, borra 1 elemento

			// Quiero terminar con lo que devuelva esta promesa
			return makeQuestion(rl, `${quiz.question}?: `)
			.then(answer => {					// Funcion que quiero que se ejecute cuando  la promesa anterior ha terminado
				if(answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
					score++;
					log(socket, 'CORRECTO', 'green');
					return playOne(); // Termino la promesa cuando termina playone, sin el return la funcion termina pero el playone 
									  // se ejecuta en segundo plano

				} else {
					log(socket, 'INCORRECTO', 'red')
					log(socket, "Fin del juego");	
				}
			})
		})
	}

	models.quiz.findAll({raw: true})
	.then(quizzes => {
		toBePlayed = quizzes;
	})
	.then(() => {
		return playOne();		//El playOne se ejecuta despues de que termine la promesa de rellenar los quizzes y no antes
								//Con el return espero a que termine para seguir
								//Las promesas que devuelven una promesa se quedan paradas hasta que devuelve el valor

	})
	.catch(e => {
		errorlog(socket, "Error: " + e);
	})
	.then(() => {

		log(socket, `Tu puntuación es: ${score}`);
		rl.prompt();
	})
};



exports.creditsCmd = (socket, rl) => {
	log(socket, "Autor de la práctica:");
	log(socket, "Lourdes Manzano Pérez", 'green');
	rl.prompt();
};

exports.quitCmd = rl => {
	rl.close();
};


