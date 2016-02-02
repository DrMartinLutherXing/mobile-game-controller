games.holdem.ui.Bot = CT.Class({
	"MOD_NAME": "games.holdem.ui.Bot",
	"_say": function(msg) {
		if (core.config.botheads)
			CT.dom.getDoc(this.iframe).postMessage(msg, "*");
	},
	"init": function(view) {
		this.view = view;
		if (core.config.botheads) {
			this.iframe = CT.dom.iframe("http://45.79.138.63:8082/game0.html",
				"minibot");
			this.view.appendChild(this.iframe);
		}
	},
	"leave": function(user) {
		this._say(user + " leaves the table");
	},
	"join": function(user) {
		this._say(user + " joins the table");
	},
	"update": function(d) {
		var data = d.message.data;
		if (d.message.action == "start")
			this._say("let the games begin!");
		else if (d.message.action == "turn")
			this._say("it's " + data + "'s turn");
		else if (d.message.action == "deal")
			this._say("you get a " + data.rank + " of " + data.suit + "s");
		else if (d.message.action == "flip")
			this._say("dealer flips a " + data.rank + " of " + data.suit + "s");
	}
}, core.UI);