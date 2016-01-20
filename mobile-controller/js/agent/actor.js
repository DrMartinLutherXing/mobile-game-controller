CT.require("CT.pubsub");

// player actions: join
// host actions: create, start

agent.actor = CT.Class({
	"_": {
		"cb": {
			// application-level callbacks
			//  - override w/ cfg object (2nd constructor argument)

			// websocket events
			"pm": CT.log.getLogger("agent.actor|pm"),
			"message": CT.log.getLogger("agent.actor|message"),
			"subscribe": CT.log.getLogger("agent.actor|subscribe"),
			"join": CT.log.getLogger("agent.actor|join"),
			"leave": CT.log.getLogger("agent.actor|leave"),
			"open": CT.log.getLogger("agent.actor|open"),
			"close": CT.log.getLogger("agent.actor|close"),
			"error": CT.log.getLogger("agent.actor|error"),
			"wserror": CT.log.getLogger("agent.actor|wserror"),

			// player event
			"gamelist": CT.log.getLogger("agent.actor|gamelist")
		},
		"on": {
			"open": function() {
				CT.log("OPEN");
				// don't call open cb yet...
				CT.pubsub.subscribe("lobby");
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
					if (data.action == "list")
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
	"say": function(channel, message) {
		CT.log("SAY " + message);
		CT.pubsub.publish(channel, message);
	},
	"pm": function(user, message) {
		CT.log("PM " + user + " " + message);
		CT.pubsub.pm(user, message);
	}
});