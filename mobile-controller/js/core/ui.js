CT.require("core.Chat");

core.UI = CT.Class({
	"init": function(obj, name) {
		this.name = name;
		this.view = CT.dom.node("", "div", "fullscreen");
		this.chat = new core.Chat(name, obj);
		this.view.appendChild(this.chat.node);
		this.view.appendChild(this.chat.button);
	},

	// override
	"update": function() {},
	"leave": function() {},
	"join": function() {}
});

core.ui = {
	"_uis": [],
	"_ui": null,
	"view": null,
	"platform": CT.align.width() < 720 ? "Mobile" : "Display",
	"setView": function(view) {
		core.ui.view = view;
	},
	"join": function(channel, user) {
		CT.log("core.ui.join " + channel + " " + user);
		core.ui._uis[channel].chat.join(user);
		core.ui._uis[channel].join(user);
	},
	"leave": function(channel, user) {
		CT.log("core.ui.leave " + channel + " " + user);
		core.ui._uis[channel].chat.leave(user);
		core.ui._uis[channel].leave(user);
	},
	"update": function(d) {
		core.ui._uis[d.channel].chat.update(d);
		core.ui._uis[d.channel].update(d);
	},
	"load": function(gamename, obj) {
		if (!(gamename in core.ui._uis)) {
			var is_lobby = gamename == "lobby",
				pf = core.ui.platform,
				gametype = gamename.split("_")[0],
				req_base = is_lobby ? "lobby" : ("games." + gametype);
			core.ui.view.innerHTML = "";
			CT.require(req_base + ".ui." + pf, true);
			core.ui._uis[gamename] = new (is_lobby ? lobby
				: games[gametype]).ui[pf](obj, gamename);
		}
		core.ui._ui = core.ui._uis[gamename];
		core.ui.view.appendChild(core.ui._ui.view);
	}
};
