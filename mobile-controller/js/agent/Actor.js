CT.require("CT.pubsub");

// player actions: join
// host actions: create, start

agent.Actor = CT.Class({
	"_": {
		"cb": {
			// application-level callbacks
			//  - override w/ cfg object (init arg)
			"pm": CT.log.getLogger("agent.Actor|pm"),
			"message": CT.log.getLogger("agent.Actor|message"),
			"subscribe": CT.log.getLogger("agent.Actor|subscribe"),
			"join": CT.log.getLogger("agent.Actor|join"),
			"leave": CT.log.getLogger("agent.Actor|leave"),
			"open": CT.log.getLogger("agent.Actor|open"),
			"close": CT.log.getLogger("agent.Actor|close"),
			"error": CT.log.getLogger("agent.Actor|error"),
			"wserror": CT.log.getLogger("agent.Actor|wserror"),
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
				this._.cb.join(channel, user);
			},
			"leave": function(channel, user) {
				CT.log("LEAVE " + channel + " " + user);
				this._.cb.leave(channel, user);
			},
			"message": function(data) {
				CT.log("MESSAGE " + JSON.stringify(data));
				this._.cb.message(data);
			},
			"pm": function(data, user) {
				CT.log("PM " + user + ": " + JSON.stringify(data));
				this._.cb.pm(data, user);
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
		core.actor = this;
		setTimeout(this.postInit);
	},
	"postInit": function() {
		// TODO: configurize later
		CT.pubsub.set_reconnect(false);
		CT.pubsub.connect("localhost", 8888, this.name);
	},
	"join": function(channel) {
		CT.log("JOIN " + channel);
		CT.pubsub.subscribe(channel);
	},
	"emit": function(channel, action, data) {
		CT.log("EMIT " + channel + ", " + action + ", " + data);
		CT.pubsub.publish(channel, {
			"action": action,
			"data": data
		});
	},
	"say": function(channel, message) {
		CT.log("SAY " + message);
		this.emit(channel, "chat", message);
	},
	"pm": function(user, message) {
		CT.log("PM " + user + " " + message);
		CT.pubsub.pm(user, message);
	}
});