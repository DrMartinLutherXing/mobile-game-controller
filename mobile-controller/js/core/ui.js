CT.require("core.Chat");

core.UI = CT.Class({
	"init": function(obj, name) {
		this.name = name;
		this.view = CT.dom.node("", "div", "fullscreen");
		this.chat = new core.Chat(name);
		this.view.appendChild(this.chat.node);
	},
	"update": function() {} // override
});

core.ui = {
	"_ui": null,
	"view": null,
	"actor": null,
	"platform": CT.align.width() < 720 ? "Mobile" : "Display",
	"setView": function(view) {
		core.ui.view = view;
	},
	"setActor": function(a) {
		core.ui.actor = a;
	},
	"update": function(d) {
		core.ui._ui.update(d);
		core.ui._ui.chat.update(d);
	},
	"load": function(gamename, obj) {
		core.ui.view.innerHTML = "";
		if (gamename == "lobby") {
			var pf = core.ui.platform;
			CT.require("lobby.ui." + pf, true);
			core.ui._ui = new lobby.ui[pf](obj, "lobby");
		} else {
			var pf = core.ui.platform.toLowerCase(); // until they're classes
			CT.require("games." + gamename + ".ui." + pf, true);
			CT.require("games." + gamename + ".constants", true);
			core.ui._ui = games[gamename].ui[pf];
			// remove explicit init once classes are set up
			core.ui._ui.init(games[gamename].initial, gamename);
		}
		core.ui.view.appendChild(core.ui._ui.view);
	}
};
