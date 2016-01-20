CT.require("agent.actor");

agent.host = CT.Class({
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
}, agent.actor);