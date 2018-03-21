//Modelo de datos

const Sequelize = require('sequelize'); //Carga el módulo Sequelize
const sequelize = new Sequelize("sqlite:quizzes.sqlite", {logging: false}); //Genero una instancia de Sequelize para acceder a una base de datos localizada en el fichero quizzes.sqlite

sequelize.define('quiz', {		//Defino el quiz, que es un modelo de datos
	question: {
		type: Sequelize.STRING,
		unique: {msg: "Ya no existe esta pregunta"}, //Cada pregunta es unica, si se repite me sale ese mensaje
		validate: {notEmpty: {msg: "La pregunta no puede estar vacía"}} //Validación adicional
	},
	answer: {
		type: Sequelize.STRING,
		validate: {notEmpty: {msg: "La respuesta no puede estar vacía"}}
	}
});

sequelize.sync()  //Sincronizar es mirar si en la base de datos tengo las tablas que necesito
.then(() => sequelize.models.quiz.count())	//Cuenta cuantos quizzes hay
.then(count => {
	if (!count) { //Si hay cero quizzes
		return sequelize.models.quiz.bulkCreate([
			{ question: "Capital de Italia", answer: "Roma" },
			{ question: "Capital de Francia", answer: "París" },
			{ question: "Capital de España", answer: "Madrid" },
			{ question: "Capital de Portugal", answer: "Lisboa" }
		]);
	}
})
.catch(error => {
	console.log(error);
});

module.exports = sequelize;



























