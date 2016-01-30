CT.require("lobby.constants");

lobby.ui.Display = CT.Class({
	"MOD_NAME": "lobby.ui.Display",
	"init": function(obj) {
		this.log("init", obj);
		lobby.constants.games.forEach(function(gtype) {
			this.view.appendChild(CT.dom.button(gtype, function() {
				core.actor.create(gtype);
			}));
		});
		this.chat.open();
	}
}, core.UI);