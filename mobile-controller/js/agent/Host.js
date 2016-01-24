CT.require("CT.pubsub");
CT.require("agent.Actor");
CT.require("lobby.constants");

agent.Host = CT.Class({
	"init": function() {
		this.name = "host_" + Math.floor((Math.random() * 100000));
		this.setCbs({
			"join": this.onPlayer
		});
		this.join("lobby");
	},
	"onPlayer": function(pdata) {
		CT.log("host.onPlayer: " + pdata);
	},
	"create": function(gametype) { // holdem...
		CT.log("CREATE " + gametype);
		CT.pubsub.pm("Concierge", {
			"action": "create",
			"data": gametype
		});
		core.ui.load(gametype);
	},
	"start": function(gamename) { // holdem...
		CT.log("START " + gamename);
		CT.pubsub.pm("Concierge", {
			"action": "start",
			"data": gamename
		});
	}
}, agent.Actor);