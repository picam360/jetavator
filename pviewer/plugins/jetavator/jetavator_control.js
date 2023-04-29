var create_plugin = (function () {
	var m_plugin_host = null;
	var m_is_init = false;
	var m_crawler_mode = false;

	var VEHICLE_DOMAIN = UPSTREAM_DOMAIN + "jetavator_service.";

	function button_svg(charactor, bgcolor, charcolor, fontsize, yoffset) {
		charcolor = charcolor || "ffffff";
		fontsize = fontsize || 74;
		yoffset = yoffset || 65;
		var tmp = "%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%20standalone%3D%22no%22%3F%3E%0D%0A%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%0D%0A%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20preserveAspectRatio%3D%22xMidYMid%20meet%22%20viewBox%3D%220%200%20100%20100%22%20width%3D%22100%22%20height%3D%22100%22%3E%3Cdefs%3E%3Cpath%20d%3D%22M100%2050C100%2077.6%2077.6%20100%2050%20100C22.41%20100%200%2077.6%200%2050C0%2022.41%2022.41%200%2050%200C77.6%200%20100%2022.41%20100%2050Z%22%20id%3D%22e2iuzi5oh%22%3E%3C%2Fpath%3E%3Ctext%20id%3D%22d6VhEb28r%22%20x%3D%220%22%20y%3D%220%22%20font-size%3D%22{FONTSIZE}%22%20font-family%3D%22Open%20Sans%22%20font-weight%3D%22700%22%20font-style%3D%22normal%22%20letter-spacing%3D%220%22%20alignment-baseline%3D%22before-edge%22%20transform%3D%22matrix(1%200%200%201%20-9.189412406599615%20-53.60929047562422)%22%20style%3D%22line-height%3A100%25%22%20xml%3Aspace%3D%22preserve%22%20dominant-baseline%3D%22text-before-edge%22%3E%3Ctspan%20x%3D%22{XOFFSET}%22%20dy%3D%22{YOFFSET}%22%20alignment-baseline%3D%22before-edge%22%20dominant-baseline%3D%22text-before-edge%22%20text-anchor%3D%22middle%22%3E{CHARACTOR}%3C%2Ftspan%3E%3C%2Ftext%3E%3C%2Fdefs%3E%3Cg%3E%3Cg%3E%3Cg%3E%3Cuse%20xlink%3Ahref%3D%22%23e2iuzi5oh%22%20opacity%3D%221%22%20fill%3D%22%23{BGCOLOR}%22%20fill-opacity%3D%221%22%3E%3C%2Fuse%3E%3C%2Fg%3E%3Cg%20id%3D%22e2Qw0Jczps%22%3E%3Cuse%20xlink%3Ahref%3D%22%23d6VhEb28r%22%20opacity%3D%221%22%20fill%3D%22%23{CHARCOLOR}%22%20fill-opacity%3D%221%22%3E%3C%2Fuse%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E%0D%0A";
		return tmp.replace("{XOFFSET}", "60").replace("{YOFFSET}", yoffset)
			.replace("{CHARACTOR}", charactor).replace("{BGCOLOR}", bgcolor).replace("{CHARCOLOR}", charcolor)
			.replace("{FONTSIZE}", fontsize);
	}

	var JIS_ICON = "data:image/svg+xml," + button_svg("J", "888888");
	var CAT_ICON = "data:image/svg+xml," + button_svg("C", "ffff00", "000000");
	function create_button(src_normal, src_pushed, callback) {
		var button = document.createElement("div");
		var img = document.createElement("img");
		button.appendChild(img);
		
		button.src_normal = src_normal;
		button.src_pushed = src_pushed;
		img.src = src_normal;

		button.down = false;
		button.last_down = 0;
		button.last_up = 0;
		button.set_src = function(src_normal, src_pushed) {
			button.src_normal = src_normal;
			button.src_pushed = src_pushed;
			img.src = (!button.down ? src_normal : src_pushed);
		}

		//style
		button.style.position = "absolute";
		img.style.position = "relative";
		img.style.top = "0%";
		img.style.left = "0%";
		img.style.width = "100%";
		img.style.height = "100%";

		var mousedownFunc = function(ev) {
			var now = new Date().getTime();
			if(now - button.last_down < 100){
				return;
			}
			if (callback) {
				callback({
					type : "down",
					caller : button,
				});
			}

			img.style.top = "5%";
			img.style.left = "5%";
			img.style.width = "90%";
			img.style.height = "90%";

			button.down = true;
			button.last_down = now;
			if (button.src_pushed) {
				button.src = button.src_pushed;
			}
		}
		button.mouseupFunc = function() {
			var now = new Date().getTime();
			if(now - button.last_up < 100){
				return;
			}
			if (callback) {
				callback({
					type : "up",
					caller : button,
				});
			}

			img.style.top = "0%";
			img.style.left = "0%";
			img.style.width = "100%";
			img.style.height = "100%";

			button.down = false;
			button.last_up = now;
			button.src = button.src_normal;
		}
		button.mousemoveFunc = function(ev) {
			if (ev.type == "touchmove") {
				ev.clientX = ev.pageX;
				ev.clientY = ev.pageY;
				ev.button = 0;
			}
			if (!button.down || ev.button != 0) {
				return;
			}
			ev.preventDefault();
			ev.stopPropagation();
		}
		var preventFunc = function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
		}
		button.addEventListener("touchstart", mousedownFunc);
		button.addEventListener("mousedown", mousedownFunc);
		button.addEventListener("dragstart", preventFunc, {
			passive : false
		});

		var mouseupFunc = function(ev) {
			if (button.down) {
				button.mouseupFunc(ev);
			}
		}
		var mousemoveFunc = function(ev) {
			if (button.down) {
				button.mousemoveFunc(ev);
			}
		}

		// addEventListener spec migration
		var supportsPassive = false;
		try {
			var opts = Object.defineProperty({}, 'passive', {
				get : function() {
					supportsPassive = true;
				}
			});
			window.addEventListener("test", null, opts);
		} catch (e) {
		}
		document.addEventListener("touchend", mouseupFunc);
		document.addEventListener("mouseup", mouseupFunc);
		document.addEventListener("touchmove", mousemoveFunc, supportsPassive
			? {
				passive : false,
				capture : true
			}
			: true);
		document.addEventListener("mousemove", mousemoveFunc, supportsPassive
			? {
				passive : false,
				capture : true
			}
			: true);

		return button;
	}
	{
		var button = create_button(JIS_ICON, JIS_ICON, function(
			e) {
			switch (e.type) {
				case "up" :
					m_mode = "JIS";
					break;
			}
		});
		button.setAttribute("style", `position:absolute; top:33%; right:10px; width:50px; height:50px;`);
		document.body.appendChild(button);
	}
	{
		var button = create_button(CAT_ICON, CAT_ICON, function(
			e) {
			switch (e.type) {
				case "up" :
					m_mode = "CAT";
					break;
			}
		});
		button.setAttribute("style", `position:absolute; top:66%; right:10px; width:50px; height:50px;`);
		document.body.appendChild(button);
	}

	var m_mode = "JIS";
	var MODE_DEF = {
		"JIS": {
			"LeftHorizon": { mod: "yaw", dir: -1 },
			"LeftVertical": { mod: "arm", dir: -1 },
			"RightHorizon": { mod: "bucket", dir: -1 },
			"RightVertical": { mod: "boom", dir: -1 },
			"LeftBackOpt": { cmd: "reverse LeftBack" },
			"RightBackOpt": { cmd: "reverse RightBack" },
			"LeftBack": { mod: "left_crawler", dir: 1 },
			"RightBack": { mod: "right_crawler", dir: 1 },
			"CrawlerMode_LeftVertical": { mod: "left_crawler", dir: -1 },
			"CrawlerMode_RightVertical": { mod: "right_crawler", dir: -1 },
		},
		"CAT": {
			"LeftHorizon": { mod: "arm", dir: -1 },
			"LeftVertical": { mod: "yaw", dir: 1 },
			"RightHorizon": { mod: "bucket", dir: -1 },
			"RightVertical": { mod: "boom", dir: -1 },
			"LeftBackOpt": { cmd: "reverse LeftBack" },
			"RightBackOpt": { cmd: "reverse RightBack" },
			"LeftBack": { mod: "left_crawler", dir: 1 },
			"RightBack": { mod: "right_crawler", dir: 1 },
			"CrawlerMode_LeftVertical": { mod: "left_crawler", dir: -1 },
			"CrawlerMode_RightVertical": { mod: "right_crawler", dir: -1 },
		}
	};

	var PUSH_THRESHOLD = 0.5;
	var m_active_gamepad = "";
	var m_gamepad_state = null;

	if (navigator.getGamepads) {
		var gamepads = navigator.getGamepads();
		if(gamepads.length > 0 && gamepads[0]){
			m_active_gamepad = gamepads[0].id;
		}
	}
	window.addEventListener('gamepadconnected', function (e) {
		m_active_gamepad = e.gamepad.id;
		console.log("gamepadconnected", m_active_gamepad);
	}, false);
	window.addEventListener('gamepaddisconnected', function (e) {
		console.log("gamepaddisconnected", m_active_gamepad);
		m_active_gamepad = "";
	}, false);

	function handleGamepad() {
		var gamepads = [];
		if (navigator.getGamepads) {
			gamepads = navigator.getGamepads();
		}
		var gamepad = null;
		for (var i in gamepads) {
			if (gamepads[i] && gamepads[i].id == m_active_gamepad) {
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
			new_state[key + "_PUSHED"] = gamepad.buttons[i].value > PUSH_THRESHOLD;
			new_state[key + "_VALUE"] = gamepad.buttons[i].value;
			new_state[key + "_PERCENT"] = Math.round(gamepad.buttons[i].value * 100);
		}
		for (var i in gamepad.axes) {
			var key = i + "_AXIS";
			new_state[key + "_FORWARD"] = gamepad.axes[i] > PUSH_THRESHOLD;
			new_state[key + "_BACKWARD"] = gamepad.axes[i] < -PUSH_THRESHOLD;
			new_state[key + "_VALUE"] = gamepad.axes[i];
			new_state[key + "_PERCENT"] = Math.round(gamepad.axes[i] * 100);
		}
		if (!m_gamepad_state) {
			m_gamepad_state = new_state;
		}
		for (var key in new_state) {
			if (new_state[key] != m_gamepad_state[key]) {
				var crawler_mode = (new_state["10_BUTTON_PUSHED"] || new_state["11_BUTTON_PUSHED"]);
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
		m_gamepad_state = new_state;
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