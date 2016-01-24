CT.require("CT.pubsub");
CT.require("agent.Actor");
CT.require("core.ui");

agent.Player = CT.Class({
	"init": function() {
		CT.log("player init");
		this.setCbs({
			"pm": this.onPm,
			"message": core.ui.update
		});
		this.name = prompt("name?");
		CT.pubsub.subscribe("lobby");
	},
	"onPm": function(data, user) {
		if (user == "Concierge") { // system messages
			if (data.action == "list")
				this.gamelist(data.data);
			else
				throw "unimplemented lobby private message!";
		} else // regular private message
			CT.log("wassup? pm from whom?");
	},
	"gamelist": function(games) {
		core.ui.load("lobby", games);
	},
	"join": function(channel) {
		// gamename from gamelist (from Concierge)
		CT.log("JOIN " + channel);
		CT.pubsub.subscribe(channel);
		core.ui.load(channel.split("_")[0]);
	}
}, agent.Actor);