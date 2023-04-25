var create_plugin = (function () {
	var m_plugin_host = null;
	var m_is_init = false;
	var m_wheel_mode = false;

	var VEHICLE_DOMAIN = UPSTREAM_DOMAIN + "jetavator_service.";

	window.addEventListener('gamepadconnected', function (e) {
		active_gamepad = e.gamepad.id;
		console.log("gamepadconnected", active_gamepad);
	}, false);
	window.addEventListener('gamepaddisconnected', function (e) {
		console.log("gamepaddisconnected", active_gamepad);
		active_gamepad = "";
	}, false);

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
			new_state[key] = gamepad.buttons[i].value > push_threshold;
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
				var wheel_mode = (new_state["4_BUTTON"] && new_state["5_BUTTON"]);
				if (wheel_mode != m_wheel_mode) {
					m_wheel_mode = wheel_mode;
					{
						var cmd = VEHICLE_DOMAIN + "reset";
						m_plugin_host.send_command(cmd);
					}
				}
				
				if (m_wheel_mode) {
					switch (key) {
						case "1_AXIS_PERCENT":
							{
								var value = (new_state[key] * -1).toFixed(0);
								var cmd = VEHICLE_DOMAIN + "left_wheel " + value;
								m_plugin_host.send_command(cmd);
							}
							break;
						case "3_AXIS_PERCENT":
							{
								var value = (new_state[key] * -1).toFixed(0);
								var cmd = VEHICLE_DOMAIN + "right_wheel " + value;
								m_plugin_host.send_command(cmd);
							}
							break;
					}
				} else {
					switch (key) {
						case "0_AXIS_PERCENT":
							{
								var value = (new_state[key] * -1).toFixed(0);
								var cmd = VEHICLE_DOMAIN + "boom " + value;
								m_plugin_host.send_command(cmd);
							}
							break;
						case "1_AXIS_PERCENT":
							{
								var value = (new_state[key] * -1).toFixed(0);
								var cmd = VEHICLE_DOMAIN + "arm " + value;
								m_plugin_host.send_command(cmd);
							}
							break;
						case "2_AXIS_PERCENT":
							{
								var value = (new_state[key] * -1).toFixed(0);
								var cmd = VEHICLE_DOMAIN + "yaw " + value;
								m_plugin_host.send_command(cmd);
							}
							break;
						case "3_AXIS_PERCENT":
							{
								var value = (new_state[key] * -1).toFixed(0);
								var cmd = VEHICLE_DOMAIN + "bucket " + value;
								m_plugin_host.send_command(cmd);
							}
							break;
					}
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