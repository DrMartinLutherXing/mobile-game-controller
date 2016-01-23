CT.require("CT.pubsub");
CT.require("agent.Actor");
CT.require("core.ui");

agent.Player = CT.Class({
	"init": function() {
		CT.log("player init");
		this.setCbs({
			"gamelist": this.gamelist
		});
		this.name = prompt("name?");
		CT.pubsub.subscribe("lobby");
	},
	"gamelist": function(games) {
		core.ui.load("lobby", games);
	},
	"join": function(channel) {
		// gamename from gamelist (from Concierge)
		CT.log("JOIN " + channel);
		CT.pubsub.subscribe(channel);
		core.ui.load(channel);
	}
}, agent.Actor);