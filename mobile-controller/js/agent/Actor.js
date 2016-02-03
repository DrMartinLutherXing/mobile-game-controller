CT.require("CT.pubsub");

// player actions: join
// host actions: create, start

agent.Actor = CT.Class({
	"MOD_NAME": "agent.Actor",
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
				this.log("on.open");
				this._.cb.open();
			},
			"close": function() {
				this.log("on.close");
				this._.cb.close();
			},
			"wserror": function() {
				this.log("on.wserror");
				this._.cb.wserror();
			},
			"error": function(message) {
				this.log("on.error", "(non-fatal)", message);
				this._.cb.error(message);
			},
			"subscribe": function(data) {
				this.log("on.subscribe", data);
				this._.cb.subscribe(data);
			},
			"join": function(channel, user) {
				this.log("on.join", channel, user);
				this._.cb.join(channel, user);
			},
			"leave": function(channel, user) {
				this.log("on.leave", channel, user);
				this._.cb.leave(channel, user);
			},
			"message": function(data) {
				this.log("on.message", data);
				this._.cb.message(data);
			},
			"pm": function(data, user) {
				this.log("on.pm", user, data);
				this._.cb.pm(data, user);
			}
		}
	},
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
		CT.pubsub.set_reconnect(core.config.ws.reconnect);
		CT.pubsub.connect(core.config.ws.host, core.config.ws.port, this.name);
	},
	"join": function(channel) {
		this.log("join", channel);
		CT.pubsub.subscribe(channel);
	},
	"emit": function(channel, action, data) {
		this.log("emit", channel, action, data);
		CT.pubsub.publish(channel, {
			"action": action,
			"data": data
		});
	},
	"say": function(channel, message) {
		this.log("say", channel, message);
		this.emit(channel, "chat", message);
	},
	"pm": function(user, message) {
		this.log("pm", user, message);
		CT.pubsub.pm(user, message);
	}
}, core.Base);