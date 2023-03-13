module.exports = {
	create_plugin : function(plugin_host) {
		console.log("create jetbot service plugin");
		var {PythonShell} = require('python-shell');

		var m_duty = 50;// %
		var pyshell = new PythonShell(__dirname + '/jetbot_service.py');
		pyshell.on('message', function (message) {
			console.log("jetbot_service.py : " + message);
		});
		pyshell.send('init');

		var plugin = {
			name : "jetbot_service",
			command_handler : function(cmd) {
				var split = cmd.split(' ');
				cmd = split[0];
				pyshell.send(cmd);
			}
		};
		return plugin;
	}
};