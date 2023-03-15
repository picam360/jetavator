module.exports = {
	create_plugin : function(plugin_host) {
		console.log("create jetavator service plugin");
		var {PythonShell} = require('python-shell');

		var pyshell = new PythonShell(__dirname + '/jetavator_service.py');
		pyshell.on('message', function (message) {
			console.log("jetavator_service.py : " + message);
		});
		pyshell.send('init');

		var plugin = {
			name : "jetavator_service",
			command_handler : function(cmd) {
				pyshell.send(cmd);
			}
		};
		return plugin;
	}
};