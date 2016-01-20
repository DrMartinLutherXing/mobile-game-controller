CT.require("agent.actor");

agent.player = CT.Class({
	"join": function(gamename) {
		// gamename from gamelist (from Concierge)
		CT.log("JOIN " + gamename);
		CT.pubsub.subscribe(gamename);
	},

	// maybe...?
	"seek": function(gametype, ongame) {
		CT.log("SEEK " + message);
		CT.pubsub.pm("Concierge", gametype);
	}
}, agent.actor);