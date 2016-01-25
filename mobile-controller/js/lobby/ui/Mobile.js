lobby.ui.Mobile = CT.Class({
	"_buttons": {},
	"addButton": function(game) {
		this._buttons[game] = CT.dom.button(game, function() {
			core.ui.actor.join(game);
		}, null, game);
		this.view.appendChild(this._buttons[game]);
	},
	"removeButton": function(game) {
		this.view.removeChild(this._buttons[game]);
	},
	"update": function(d) {
		if (d.user == "Concierge") { // system messages
			if (d.message.action == "newgame")
				this.addButton(d.message.data);
			else if (d.message.action == "oldgame")
				this.removeButton(d.message.data);
		} else // regular channel messages
			CT.log("message: " + d);
	},
	"init": function(obj) {
		CT.log("lobby mobile init: " + this.gamelist);
		this.gamelist = obj;
		for (var gtype in this.gamelist) {
			this.view.appendChild(CT.dom.node(gtype, "div", "big"));
			this.gamelist[gtype].forEach(this.addButton);
		}
		this.chat.open();
	}
}, core.UI);