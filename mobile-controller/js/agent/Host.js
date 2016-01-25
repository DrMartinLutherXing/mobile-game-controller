CT.require("CT.pubsub");
CT.require("agent.Actor");
CT.require("lobby.constants");

agent.Host = CT.Class({
	"init": function() {
		this.name = "host_" + Math.floor((Math.random() * 100000));
		this.setCbs({
			"subscribe": this.onSubscribe,
			"join": this.onJoin
		});
		this.join("lobby");
	},
	"onSubscribe": function(data) {
		CT.log("SUBSCRIBE " + data.channel);
		this.channel = data.channel;
		core.ui.load(data.channel);
	},
	"onJoin": function(pdata) {
		CT.log("host.onJoin: " + pdata);
	},
	"deal": function(player, card) {
		CT.log("DEAL " + player + " " + card);
		CT.pubsub.pm(player, {
			"action": "deal",
			"data": {
				"channel": this.channel,
				"card": card
			}
		});
	},
	"create": function(gametype) { // holdem...
		CT.log("CREATE " + gametype);
		CT.pubsub.pm("Concierge", {
			"action": "create",
			"data": gametype
		});
	},
	"start": function(gamename) { // holdem...
		CT.log("START " + gamename);
		CT.pubsub.pm("Concierge", {
			"action": "start",
			"data": gamename
		});
	}
}, agent.Actor);