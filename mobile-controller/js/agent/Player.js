CT.require("agent.Actor");

agent.Player = CT.Class({
	"join": function(gamename) {
		// gamename from gamelist (from Concierge)
		CT.log("JOIN " + gamename);
		CT.pubsub.subscribe(gamename);
	}
}, agent.Actor);