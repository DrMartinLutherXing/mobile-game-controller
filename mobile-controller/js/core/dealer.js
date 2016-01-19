CT.require("core.actor");

core.dealer = CT.Class({
	"start": function(gametype) { // holdem...
		CT.log("START " + gametype);
		CT.pubsub.pm("Concierge", gametype);
	}
}, core.actor);