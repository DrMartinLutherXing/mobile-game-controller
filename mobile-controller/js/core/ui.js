core.UI = CT.Class({
	"init": function() {
		this.view = CT.dom.node();
	}
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
	},
	"load": function(gamename, obj) {
		if (gamename == "lobby") {
			var pf = core.ui.platform;
			CT.require("lobby.ui." + pf, true);
			core.ui._ui = new lobby.ui[pf](obj);
		} else {
			var pf = core.ui.platform.toLowerCase(); // until they're classes
			CT.require("games." + gamename + ".ui." + pf, true);
			CT.require("games." + gamename + ".constants", true);
			core.ui._ui = games[gamename].ui[pf];
			// remove explicit init once classes are set up
			core.ui._ui.init(games[gamename].initial);
		}
		core.ui.view.appendChild(core.ui._ui.view);
	}
};
