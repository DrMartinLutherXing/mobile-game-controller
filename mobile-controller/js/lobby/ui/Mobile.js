lobby.ui.Mobile = CT.Class({
	"addButton": function(game) {
		this.view.appendChild(CT.dom.button(game, function() {
			core.ui.actor.join(game);
		}, null, game));
	},
	"removeButton": function(game) {
		this.view.removeChild(document.getElementById(game));
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
	}
}, core.UI);