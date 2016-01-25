CT.require("agent.Actor");

agent.Player = CT.Class({
	"init": function() {
		CT.log("player init");
		this.setCbs({
			"pm": this.onPm
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
		} else if (user.split("_")[0] == "host") {
			if (data.action == "deal") {
				core.ui.update({
					"user": user,
					"channel": data.data.channel,
					"message": {
						"action": "deal",
						"card": data.data.card
					}
				});
			} else
				CT.log("UNIMPLEMENTED PM! " + data.action);
		} else // regular private message
			CT.log("wassup? pm from whom?");
	},
	"gamelist": function(games) {
		core.ui.load("lobby", games);
	}
}, agent.Actor);