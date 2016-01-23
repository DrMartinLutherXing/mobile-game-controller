lobby.ui.Mobile = CT.Class({
	"init": function(obj) {
		CT.log("lobby mobile init: " + this.gamelist);
		this.gamelist = obj;
		for (var gtype in this.gamelist) {
			this.view.appendChild(CT.dom.node(gtype, "div", "big"));
			this.gamelist[gtype].forEach(function(game) {
				this.view.appendChild(CT.dom.node(game));
			});
		}
	}
}, core.UI);