var create_plugin = (function () {
	var m_plugin_host = null;
	var m_is_init = false;
	var m_crawler_mode = false;

	var VEHICLE_DOMAIN = UPSTREAM_DOMAIN + "jetavator_service.";

	window.addEventListener('gamepadconnected', function (e) {
		active_gamepad = e.gamepad.id;
		console.log("gamepadconnected", active_gamepad);
	}, false);
	window.addEventListener('gamepaddisconnected', function (e) {
		console.log("gamepaddisconnected", active_gamepad);
		active_gamepad = "";
	}, false);

	var m_mode = "JIS";
	var MODE_DEF = {
		"JIS": {
			"LeftHorizon": {
				mod: "yaw",
				dir: 1,
			},
			"LeftVertical": {
				mod: "arm",
				dir: 1,
			},
			"RightHorizon": {
				mod: "bucket",
				dir: 1,
			},
			"RightVertical": {
				mod: "boom",
				dir: 1,
			},
			"LeftBackOpt": {
				cmd: "reverse LeftBack",
			},
			"RightBackOpt": {
				cmd: "reverse RightBack",
			},
			"LeftBack": {
				mod: "left_crawler",
				dir: 1,
			},
			"RightBack": {
				mod: "right_crawler",
				dir: 1,
			},
			"CrawlerMode_LeftVertical": {
				mod: "left_crawler",
				dir: -1,
			},
			"CrawlerMode_RightVertical": {
				mod: "right_crawler",
				dir: -1,
			},
		}
	};

	var push_threshold = 0.5;
	var active_gamepad = "";
	var gamepads = [];
	var gamepad_state = null;
	function handleGamepad() {
		// Iterate over all the gamepads and show their values.
		if (navigator.getGamepads) {
			gamepads = navigator.getGamepads();
		}
		var gamepad = null;
		for (var i = 0 in gamepads) {
			if (gamepads[i] && gamepads[i].id == active_gamepad) {
				gamepad = gamepads[i];
				break;
			}
		}
		if (!gamepad) {
			return;
		}

		var new_state = {}
		for (var i in gamepad.buttons) {
			var key = i + "_BUTTON";
			new_state[key + "_PUSHED"] = gamepad.buttons[i].value > push_threshold;
			new_state[key + "_VALUE"] = gamepad.buttons[i].value;
			new_state[key + "_PERCENT"] = Math.round(gamepad.buttons[i].value * 100);
		}
		for (var i in gamepad.axes) {
			var key = i + "_AXIS";
			new_state[key + "_FORWARD"] = gamepad.axes[i] > push_threshold;
			new_state[key + "_BACKWARD"] = gamepad.axes[i] < -push_threshold;
			new_state[key + "_VALUE"] = gamepad.axes[i];
			new_state[key + "_PERCENT"] = Math.round(gamepad.axes[i] * 100);
		}
		if (!gamepad_state) {
			gamepad_state = new_state;
		}
		for (var key in new_state) {
			if (new_state[key] != gamepad_state[key]) {
				var crawler_mode = (new_state["10_BUTTON_PUSHED"] && new_state["11_BUTTON_PUSHED"]);
				if (crawler_mode != m_crawler_mode) {
					m_crawler_mode = crawler_mode;
					{
						var cmd = VEHICLE_DOMAIN + "reset";
						m_plugin_host.send_command(cmd);
					}
				}

				var table;
				if (m_crawler_mode) {
					//https://gamepad-tester.com/
					table = {
						"1_AXIS_PERCENT": "CrawlerMode_LeftVertical",
						"3_AXIS_PERCENT": "CrawlerMode_RightVertical",
					};
				} else {
					//https://gamepad-tester.com/
					table = {
						"0_AXIS_PERCENT": "LeftHorizon",
						"1_AXIS_PERCENT": "LeftVertical",
						"2_AXIS_PERCENT": "RightHorizon",
						"3_AXIS_PERCENT": "RightVertical",
						"4_BUTTON_PUSHED": "LeftBackOpt",
						"5_BUTTON_PUSHED": "RightBackOpt",
						"6_BUTTON_PERCENT": "LeftBack",
						"7_BUTTON_PERCENT": "RightBack",
					};
				}
				if (table[key] && MODE_DEF[m_mode] && MODE_DEF[m_mode][table[key]]) {
					if (!MODE_DEF[m_mode][table[key]].mod) {
						continue;
					}
					var value = new_state[key].toFixed(0);
					if (MODE_DEF[m_mode][table[key]].dir) {
						value *= MODE_DEF[m_mode][table[key]].dir;
					}
					for (var key2 in new_state) { // execute command
						if (new_state[key2] && table[key2] && MODE_DEF[m_mode] && MODE_DEF[m_mode][table[key2]]) {
							if (!MODE_DEF[m_mode][table[key2]].cmd) {
								continue;
							}
							var params = MODE_DEF[m_mode][table[key2]].cmd.split(' ');
							if (params.length == 2 && params[1] == table[key]) {
								switch (params[0]) {
									case "reverse":
										value *= -1;
										break;
								}
							}
						}
					}
					var cmd = VEHICLE_DOMAIN + MODE_DEF[m_mode][table[key]].mod + " " + value;
					m_plugin_host.send_command(cmd);
					console.log(cmd);
				}
			}
		}
		gamepad_state = new_state;
	}

	function init() {
		setInterval(handleGamepad, 100);
	}

	return function (plugin_host) {
		m_plugin_host = plugin_host;
		if (!m_is_init) {
			m_is_init = true;
			init();
		}
		var plugin = {};
		return plugin;
	}
	return self;
})();