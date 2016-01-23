CT.require("CT.pubsub");

// player actions: join
// host actions: create, start

agent.Actor = CT.Class({
	"_": {
		"cb": {
			// application-level callbacks
			//  - override w/ cfg object (2nd constructor argument)

			// websocket events
			"pm": CT.log.getLogger("agent.Actor|pm"),
			"message": CT.log.getLogger("agent.Actor|message"),
			"subscribe": CT.log.getLogger("agent.Actor|subscribe"),
			"join": CT.log.getLogger("agent.Actor|join"),
			"leave": CT.log.getLogger("agent.Actor|leave"),
			"open": CT.log.getLogger("agent.Actor|open"),
			"close": CT.log.getLogger("agent.Actor|close"),
			"error": CT.log.getLogger("agent.Actor|error"),
			"wserror": CT.log.getLogger("agent.Actor|wserror"),

			// player event
			"gamelist": CT.log.getLogger("agent.actor|gamelist")
		},
		"on": {
			"open": function() {
				CT.log("OPEN");
				this._.cb.open();
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
				if (user == "Concierge") { // system messages
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
	"setCbs": function(cbs) {
		this._.cb = CT.merge(cbs, this._.cb);
	},
	"init": function(cbs) {
		this.setCbs(cbs);
		for (var key in CT.pubsub._.cb) // pubsub events
			CT.pubsub.set_cb(key, this._.on[key]);
		core.ui.setActor(this);
		setTimeout(this.postInit);
	},
	"postInit": function() {
		// TODO: configurize later
		CT.pubsub.connect("localhost", 8888, this.name);
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