CT.require("CT.dom");
CT.require("CT.align");
// file called core/ui.js
core.ui = {
	"_ui": null,
	"load": function(gamename) {
		var platform = CT.align.width()  < 720 ? "mobile" : "display";
		CT.require("games." + gamename + "." + platform, True);
		core.ui._ui = games[gamename].ui.[platform];
	},
	"doWhatever": function() {
		core.ui._ui.doWhatever()
	}
};
