module.exports = {
	create_plugin: function (plugin_host) {
		var m_options = {};
		var m_pstcore = null;
		var m_pst = 0;

		console.log("create jetavator service plugin");
		var { PythonShell } = require('python-shell');

		var pyshell = new PythonShell(__dirname + '/jetavator_service.py');
		pyshell.on('message', function (message) {
			console.log("jetavator_service.py : " + message);
		});
		pyshell.send('init');

		var i2c_buf = require("i2c-bus");
		var Pca9685Driver = require("pca9685").Pca9685Driver;
		var pwm_options = {
			i2c: i2c_buf.openSync(1),
			address: 0x40,
			frequency: 50,
			debug: false
		};
		var options = {
			BOOM_PINS: [0, 1],
			ARM_PINS: [2, 3],
			BUCKET_PINS: [4, 5],
			YAW_PINS: [6, 7],
			ATTACHMENT_PINS: [8, 9],
			PINS: [],
		};
		options.PINS = options.PINS.concat(options.BOOM_PINS, options.ARM_PINS, options.BUCKET_PINS, options.YAW_PINS, options.ATTACHMENT_PINS);
		var pwm = new Pca9685Driver(pwm_options, function (err) {
			if (err) {
				console.error("Error initializing PCA9685");
				process.exit(-1);
			}

			reset_pins();

			process.on('SIGINT', function () {
				reset_pins();
				process.exit();
			});

			console.log("Initialization done");
		});

		function reset_pins() {
			for (var idx in options.PINS) {
				pwm.setPulseLength(options.PINS[idx], 0);
			}
		}

		const http = require('http');
		setInterval(() => {
			if(!m_options[plugin.name] || !m_options[plugin.name]["weight_url"]){
				return;
			}
			http.get(m_options[plugin.name]["weight_url"], (res) => {
				let data = '';

				res.on('data', (chunk) => {
					data += chunk;
				});

				res.on('end', () => {
					try {
						const obj = JSON.parse(data);
						if(m_pst){
							var score = obj.weight.toFixed(0);
							m_pstcore.pstcore_set_param(m_pst, plugin.name, "score", score);
							return;
						}
					} catch (e) {
						console.error(e.message);
					}
				});

			}).on('error', (err) => {
				console.error('Error: ' + err.message);
			});
		}, 1000);

		var plugin = {
			name: "jetavator_service",
            init_options: function (options) {
                m_options = options;
            },
            pst_started: function (pstcore, pst) {
				if(m_pst){
					return;
				}

				m_pstcore = pstcore;
				m_pst = pst;
            },
            pst_stopped: function (pstcore, pst) {
				if(pst == m_pst){
					m_pst = 0;
				}
            },
			command_handler: function (cmd) {
				var params = cmd.split(' ');
				switch (params[0]) {
					case "reset":
						reset_pins();
						//through
					case "left_crawler":
					case "right_crawler":
						pyshell.send(cmd);
						break;
					case "boom":
						{
							var value = Math.abs(params[1]) / 100 * 10000;
							var pin0 = options.BOOM_PINS[0];
							var pin1 = options.BOOM_PINS[1];
							if (value < 2000) {
								pwm.setPulseLength(pin0, 0);
								pwm.setPulseLength(pin1, 0);
							} else if (params[1] < 0) {
								pwm.setPulseLength(pin0, value);
								pwm.setPulseLength(pin1, 0);
							} else {
								pwm.setPulseLength(pin0, 0);
								pwm.setPulseLength(pin1, value);
							}
						}
						break;
					case "arm":
						{
							var value = Math.abs(params[1]) / 100 * 10000;
							var pin0 = options.ARM_PINS[0];
							var pin1 = options.ARM_PINS[1];
							if (value < 2000) {
								pwm.setPulseLength(pin0, 0);
								pwm.setPulseLength(pin1, 0);
							} else if (params[1] < 0) {
								pwm.setPulseLength(pin0, value);
								pwm.setPulseLength(pin1, 0);
							} else {
								pwm.setPulseLength(pin0, 0);
								pwm.setPulseLength(pin1, value);
							}
						}
						break;
					case "yaw":
						{
							var value = Math.abs(params[1]) / 100 * 10000;
							var pin0 = options.YAW_PINS[0];
							var pin1 = options.YAW_PINS[1];
							if (value < 2000) {
								pwm.setPulseLength(pin0, 0);
								pwm.setPulseLength(pin1, 0);
							} else if (params[1] < 0) {
								pwm.setPulseLength(pin0, value);
								pwm.setPulseLength(pin1, 0);
							} else {
								pwm.setPulseLength(pin0, 0);
								pwm.setPulseLength(pin1, value);
							}
						}
						break;
					case "bucket":
						{
							var value = Math.abs(params[1]) / 100 * 10000;
							var pin0 = options.BUCKET_PINS[0];
							var pin1 = options.BUCKET_PINS[1];
							if (value < 2000) {
								pwm.setPulseLength(pin0, 0);
								pwm.setPulseLength(pin1, 0);
							} else if (params[1] < 0) {
								pwm.setPulseLength(pin0, value);
								pwm.setPulseLength(pin1, 0);
							} else {
								pwm.setPulseLength(pin0, 0);
								pwm.setPulseLength(pin1, value);
							}
						}
						break;
				}
			}
		};
		return plugin;
	}
};