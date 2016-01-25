CT.require("lobby.constants");

lobby.ui.Display = CT.Class({
	"init": function() {
		CT.log("lobby display init");
		lobby.constants.games.forEach(function(gtype) {
			this.view.appendChild(CT.dom.button(gtype, function() {
				core.ui.actor.create(gtype);
			}));
		});
		this.chat.open();
	}
}, core.UI);