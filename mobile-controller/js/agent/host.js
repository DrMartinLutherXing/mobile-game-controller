CT.require("agent.actor");

agent.host = CT.Class({
	"start": function(gametype) { // holdem...
		CT.log("START " + gametype);
		CT.pubsub.pm("Concierge", gametype);
	}
}, agent.actor);