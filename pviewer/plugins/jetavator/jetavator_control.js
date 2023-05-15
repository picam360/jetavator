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
	var m_gamepad_id = "";//need to call navigator.getGamepads() dynamically to get live values
	var m_gamepad_state = null;

	function get_last_gamepad_id(){
		if (navigator.getGamepads) {
			var gamepads = navigator.getGamepads();
			for (var i=gamepads.length-1;i>=0;i--) {
				if (gamepads[i]) {
					return gamepads[i].id;
				}
			}
		}
		return "";
	}

	window.addEventListener('gamepadconnected', function (e) {
		console.log("gamepadconnected : ", e.gamepad.id);
		m_gamepad_id = e.gamepad.id;
		console.log("active gamepad id : ", m_gamepad_id);
	}, false);
	window.addEventListener('gamepaddisconnected', function (e) {
		console.log("gamepaddisconnected : ", e.gamepad.id);
		if(e.gamepad.id == m_gamepad_id){
			m_gamepad_id = get_last_gamepad_id();
			console.log("active gamepad id : ", m_gamepad_id);
		}
	}, false);

	function handleGamepad(callback) {
		if(!m_gamepad_id){
			var id = get_last_gamepad_id();
			if(id){
				m_gamepad_id = id;
				console.log("active gamepad id : ", m_gamepad_id);
			}
		}
		var gamepads = [];
		if (navigator.getGamepads) {
			gamepads = navigator.getGamepads();
		}
		var gamepad = null;
		for (var i in gamepads) {
			if (gamepads[i] && gamepads[i].id == m_gamepad_id) {
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
				callback(key, new_state);
			}
		}
		m_gamepad_state = new_state;
	}
	
	function base64encode_binary(data){
		return btoa([...data].map(n => String.fromCharCode(n)).join(""));
	}

	var m_imgs = [
		{
			url : "/img/title.png",
			format : "png",
			tex_id : "title",
			tex : null,
			prepared : false,
		},
	];
	function load_imgs(idx){
		if(idx === undefined){
			idx = 0;
		}else if(idx >= m_imgs.length){
			return;
		}
		var base_url = "plugins/jetavator";
		if(m_imgs[idx].url){
			var getFile = m_plugin_host.getFile;
			if(m_plugin_host.getFileFromUpstream){
				getFile = m_plugin_host.getFileFromUpstream;
			}
			getFile(base_url + m_imgs[idx].url, (data) => {
				if(Array.isArray(data)){
					data = data[0];
				}
				m_imgs[idx].tex = base64encode_binary(data);
				m_imgs[idx].prepared = true;
				load_imgs(idx + 1);
			});
		}else{
			m_imgs[idx].prepared = true;
			load_imgs(idx + 1);
		}
	}

	function upload_imgs(pstcore, pst){
		var tex_json = {
			nodes : [],
		};
		for(var node of m_imgs){
			tex_json.nodes.push({
				format : node.format,
				tex_id : node.tex_id,
				tex : node.tex,
			});
		}
		var tex_json_str = JSON.stringify(tex_json);
		pstcore.pstcore_set_param(pst, "renderer", "overlay_tex", tex_json_str);
	}

	function push_str(nodes, str, x, y, w, coodinate){
		var offset = 0;
		switch(coodinate){
			case "left":
				offset = 0;
				break;
			case "right":
				offset = -w*str.length;
				break;
			case "center":
			default:
				offset = -w*str.length/2;
				break;
		}
		for(var i=0;i<str.length;i++){
			nodes.push({
				width : w,
				height : w*1.25,
				x : x + w*i + offset,
				y : y,
				tex_id : `ascii[${str.charCodeAt(i)}]`,
			});
		}
	}

	var m_wait_play_start_mode = "start";
	function wait_play_start(timeout_callback){
		handleGamepad((key, new_state) => {
			if(!new_state[key]){
				return;
			}
			var cmd = "";
			switch(key){
				case "0_BUTTON_PUSHED":
					cmd = "cancel";
					break;
				case "1_BUTTON_PUSHED":
					cmd = "ok";
					break;
				case "12_BUTTON_PUSHED":
					cmd = "up";
					break;
				case "13_BUTTON_PUSHED":
					cmd = "down";
					break;
				case "14_BUTTON_PUSHED":
					cmd = "left";
					break;
				case "15_BUTTON_PUSHED":
					cmd = "right";
					break;
			}
			switch(m_wait_play_start_mode){
				case "yoko_senkai":
					switch(cmd){
						case "down":
							m_wait_play_start_mode = "tate_senkai";
							break;
						case "ok":
							m_mode = "JIS";
							break;
					}
					break;
				case "tate_senkai":
					switch(cmd){
						case "up":
							m_wait_play_start_mode = "yoko_senkai";
							break;
						case "down":
							m_wait_play_start_mode = "start";
							break;
						case "ok":
							m_mode = "CAT";
							break;
					}
					break;
				case "start":
					switch(cmd){
						case "up":
							m_wait_play_start_mode = "tate_senkai";
							break;
						case "ok":
							m_state_st -= 30000;
							break;
					}
					break;
			}
		});
		var overlay_json = {
			nodes : [
				{
					width : 100,
					height : 25,
					x : 0,
					y : 0,
					tex_id : "title",
				},
			],
		};

		var cur_y = 0;
		push_str(overlay_json.nodes, "CONTROLLER MODE", 50, 60, 4);
		if(m_mode == "JIS"){
			push_str(overlay_json.nodes, "[*]YOKO SENKAI", 50, 65, 4);
			push_str(overlay_json.nodes, "[ ]TATE SENKAI", 50, 70, 4);
		}else{
			push_str(overlay_json.nodes, "[ ]YOKO SENKAI", 50, 65, 4);
			push_str(overlay_json.nodes, "[*]TATE SENKAI", 50, 70, 4);
		}

		push_str(overlay_json.nodes, "START", 50, 80, 4);

		if(m_wait_play_start_mode == "yoko_senkai"){
			cur_y = 65;
		}
		if(m_wait_play_start_mode == "tate_senkai"){
			cur_y = 70;
		}
		if(m_wait_play_start_mode == "start"){
			cur_y = 80;
		}
		if(cur_y > 0){
			push_str(overlay_json.nodes, ">>", 10, cur_y, 4);
			push_str(overlay_json.nodes, "<<", 90, cur_y, 4);
		}

		var now = new Date().getTime();
		var elapsed_sec = (now - m_state_st) / 1e3;
		var remain = 30 - elapsed_sec;
		if(remain > 0){
			push_str(overlay_json.nodes, "TIMEOUT", 50, 40, 4);
			push_str(overlay_json.nodes, remain.toFixed(0), 50, 45, 4);
			m_pstcore.pstcore_set_param(m_pst, "renderer", "overlay", JSON.stringify(overlay_json));
		}else{
			timeout_callback();
		}
	}

	function playing(timeout_callback){
		handleGamepad((key, new_state) => {

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
					return;
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
		});

		var overlay_json = {
			nodes : [],
		};
		var now = new Date().getTime();
		var elapsed_sec = (now - m_state_st) / 1e3;
		var remain = 300 - elapsed_sec;
		var score = 0;
		if(remain > 0){
			push_str(overlay_json.nodes, "Time  : ", 40, 5, 4, "left");
			push_str(overlay_json.nodes, remain.toFixed(0) + "sec", 95, 5, 4, "right");
			push_str(overlay_json.nodes, "Score : ", 40, 10, 4, "left");
			push_str(overlay_json.nodes, score + "pt ", 95, 10, 4, "right");
			m_pstcore.pstcore_set_param(m_pst, "renderer", "overlay", JSON.stringify(overlay_json));
		}else{
			timeout_callback();
		}
	}

	var m_state = "none";
	var m_state_st = 0;
	var m_pst = 0;
	var m_pstcore = null;
	function init() {
		m_state = "load_imgs";
		var state_poling = setInterval(() => {
			switch(m_state){
				case "load_imgs":
					load_imgs();
					m_state = "wait_load_imgs";
					break;
				case "wait_load_imgs":
					if(m_imgs[m_imgs.length - 1].prepared){
						m_state = "wait_pst";
					}
					break;
				case "wait_pst":
					m_pst = app.get_pst();
					if(m_pst){
						m_pstcore = app.get_pstcore();
						upload_imgs(m_pstcore, m_pst);
						m_state_st = new Date().getTime();
						m_state = "wait_play_start";
					}
					break;
				case "wait_play_start":
					wait_play_start(() => {
						m_state_st = new Date().getTime();
						m_state = "start_play";
					});
					break;
				case "start_play":
					m_pstcore.pstcore_set_param(m_pst, "renderer", "overlay", "");
					m_state_st = new Date().getTime();
					m_state = "playing";
					break;
				case "playing":
					playing(() => {
						m_state_st = new Date().getTime();
						m_state = "end_play";
					});
					break;
				case "end_play":
					m_pstcore.pstcore_set_param(m_pst, "renderer", "overlay", "");
					break;
			}
		}, 100);
	}

	return function (plugin_host) {
		m_plugin_host = plugin_host;
		if (!m_is_init) {
			m_is_init = true;
			init();
		}
		var plugin = {
		};
		return plugin;
	}
})();