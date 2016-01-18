CT.require("CT.align");
// file called core/ui.js
core.ui = {
	"_ui": null,
	"load": function(gamename) {
		var platform = CT.align.width() < 720 ? "mobile" : "display";
		CT.require("games." + gamename + ".ui." + platform, true);
		core.ui._ui = games[gamename].ui[platform];
	},
	"init": function(initial) {
		core.ui._ui.init(initial);
	}
};
