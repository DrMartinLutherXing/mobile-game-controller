CT.require("lobby.constants");

lobby.ui.Display = CT.Class({
	"MOD_NAME": "lobby.ui.Display",
	"_say": function(msg) {
		CT.dom.getDoc(this.iframe).postMessage(msg, "*");
	},
	"leave": function(user) {
		this._say(user + " leaves the room");
	},
	"join": function(user) {
		this._say(user + " joins the room");
	},
	"update": function(d) {
		var data = d.message.data;
		if (d.message.action == "newgame")
			this._say("new game: " + data);
		else if (d.message.action == "oldgame")
			this._say("game removed: " + data);
	},
	"init": function(obj) {
		this.log("init", obj);
		this.iframe = CT.dom.iframe("http://45.79.138.63:8082/game0.html",
			"lobbybot");
		this.view.appendChild(this.iframe);
		lobby.constants.games.forEach(function(gtype) {
			this.view.appendChild(CT.dom.button(gtype, function() {
				core.actor.create(gtype);
			}));
		});
		this.chat.open();
	}
}, core.UI);