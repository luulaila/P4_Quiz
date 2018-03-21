
const readline = require('readline');
const {log, biglog, errorlog, colorize} = require("./out");
const cmds = require("./cmds");

const net = require("net");
net.createServer(socket => {

	console.log("Se ha conectado un cliente desde " + socket.remoteAddress);

	// Mensaje inicial

	biglog(socket, 'CORE Quiz', 'green');


	const rl = readline.createInterface({
	  input: socket,
	  output: socket,
	  prompt: colorize("quiz > ", 'blue'),
	  completer: (line) => {
		  const completions = 'h help add delete edit list test play p credits q quit '.split(' ');
		  const hits = completions.filter((c) => c.startsWith(line));
		  // show all completions if none found
		  return [hits.length ? hits : completions, line];
	  }
	});


	socket
	.on("end" , () => { rl.close(); })			//cierro readline
	.on("error" , () => { rl.close(); });

	rl.prompt();

	rl
	.on('line', (line) => {
	  
		let args = line.split(" ");
		let cmd = args[0].toLowerCase().trim();

		let param = args[1];

	  	switch (cmd) {
		    case '':
		    	rl.prompt();
		    	break;

		    case 'h':
		    case 'help':
		    	cmds.helpCmd(socket, rl);
		      	break;

		    case 'quit':
		    case 'q':
		    	cmds.quitCmd(socket, rl);
		    	break;

		    case 'add':
		    	cmds.addCmd(socket, rl);
		    	break;

		    case 'list':
		    	cmds.listCmd(socket, rl);
		    	break;	

		    case 'show':
		    	cmds.showCmd(socket, rl, param);
		    	break;	

			case 'test':
		    	cmds.testCmd(socket, rl, param);
		    	break;

			case 'p':
			case 'play':
		    	cmds.playCmd(socket, rl);
		    	break;

		    case 'delete':
		    	cmds.deleteCmd(socket, rl, param);
		    	break;

		    case 'edit':
		    	cmds.editCmd(socket, rl, param);
		    	break;

		    case 'credits':
		    	cmds.creditsCmd(socket, rl);
		    	break;


		    default:
		    	log(socket, `El comando '${colorize(cmd, 'red')}' no es conocido.`);
		      	log(socket, `Utilice el comando 'help' para obtener ayuda`)
		      	rl.prompt();
		      	break;
	  }
	})
	.on('close', () => {
	 	log('Adios!');
	  	process.exit(0);
	});



})
.listen(3030);



