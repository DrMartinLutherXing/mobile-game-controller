CT.require("CT.pubsub");

// player actions: join
// dealer actions: start

core.player = CT.Class({
	"_": {
		"cb": {
			// application-level callbacks
			//  - override w/ cfg object (2nd constructor argument)

			// websocket events
			"pm": CT.log.getLogger("core.player|pm"),
			"message": CT.log.getLogger("core.player|message"),
			"subscribe": CT.log.getLogger("core.player|subscribe"),
			"join": CT.log.getLogger("core.player|join"),
			"leave": CT.log.getLogger("core.player|leave"),
			"open": CT.log.getLogger("core.player|open"),
			"close": CT.log.getLogger("core.player|close"),
			"error": CT.log.getLogger("core.player|error"),
			"wserror": CT.log.getLogger("core.player|wserror"),

			// player event
			"gamelist": CT.log.getLogger("core.player|gamelist")
		},
		"on": {
			"open": function() {
				CT.log("OPEN");
				CT.pubsub.subscribe("lobby"); // don't call open cb yet...
			},
			"close": function() {
				CT.log("CLOSE");
				this._.cb.close();
			},
			"wserror": function() {
				CT.log("WEBSOCKET ERROR");
				this._.cb.wserror();
			},
			"error": function(message) {
				CT.log("ERROR (non-fatal): " + message);
				this._.cb.error(message);
			},
			"subscribe": function(data) {
				CT.log("SUBSCRIBE " + JSON.stringify(data));
				if (data.channel == "lobby")
					this._.cb.open(data);
				else
					this._.cb.subscribe(data);
			},
			"join": function(channel, user) {
				CT.log("JOIN " + channel + " " + user);
				this._.cb.join(data);
			},
			"leave": function(channel, user) {
				CT.log("LEAVE " + channel + " " + user);
				this._.cb.leave(data);
			},
			"message": function(data) {
				CT.log("MESSAGE " + JSON.stringify(data));
				this._.cb.message(data);
			},
			"pm": function(data, user) {
				CT.log("PM " + user + ": " + JSON.stringify(data));
				if (user == "lobby") { // system messages
					if (data.type == "list")
						this._.cb.gamelist(data.data);
					else
						throw "unimplemented lobby private message!";
				} else // regular private message
					this._.cb.pm(data);
			}
		}
	},
	"name": null,
	"init": function(uname, cbs) {
		this.name = uname;
		this._.cb = CT.merge(cbs, this._.cb);
		for (var key in CT.pubsub._.cb) // pubsub events
			CT.pubsub.set_cb(key, this._.on[key]);
		// TODO: configurize later
		CT.pubsub.connect("localhost", 8888, uname);
	},
	"join": function(gamename) { // gamename from gamelist (from Concierge)
		CT.log("JOIN " + gamename);
		CT.pubsub.subscribe(gamename);
	},

	// questionable below...
	"seek": function(gametype, ongame) {
		CT.log("SEEK " + message);
		CT.pubsub.pm("Concierge", gametype);
	},
	"say": function(channel, message) {
		CT.log("SAY " + message);
		CT.pubsub.publish(channel, message);
	},
	"pm": function(user, message) {
		CT.log("PM " + user + " " + message);
		CT.pubsub.pm(user, message);
	}
});