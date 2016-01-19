CT.require("CT.pubsub");

// player actions: join
// dealer actions: start

core.player = CT.Class({
	"_cbs": {
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
	"_name": null,
	"_on_open": function() {
		CT.log("OPEN");
		CT.pubsub.subscribe("lobby"); // don't call open cb yet...
	},
	"_on_close": function() {
		CT.log("CLOSE");
		this._cbs.close();
	},
	"_on_wserror": function() {
		CT.log("WEBSOCKET ERROR");
		this._cbs.wserror();
	},
	"_on_error": function(message) {
		CT.log("ERROR (non-fatal): " + message);
		this._cbs.error(message);
	},
	"_on_subscribe": function(data) {
		CT.log("SUBSCRIBE " + JSON.stringify(data));
		if (data.channel == "lobby")
			this._cbs.open(data);
		else
			this._cbs.subscribe(data);
	},
	"_on_join": function(channel, user) {
		CT.log("JOIN " + channel + " " + user);
		this._cbs.join(data);
	},
	"_on_leave": function(channel, user) {
		CT.log("LEAVE " + channel + " " + user);
		this._cbs.leave(data);
	},
	"_on_message": function(data) {
		CT.log("MESSAGE " + JSON.stringify(data));
		this._cbs.message(data);
	},
	"_on_pm": function(data, user) {
		CT.log("PM " + user + ": " + JSON.stringify(data));
		if (user == "lobby") { // system messages
			if (data.type == "list")
				this._cbs.gamelist(data.data);
			else
				throw "unimplemented lobby private message!";
		} else // regular private message
			this._cbs.pm(data);
	},
	"init": function(uname, cbs) {
		this._name = uname;
		this._cbs = CT.merge(cbs, this._cbs);
		for (var key in CT.pubsub._.cb) // pubsub events
			CT.pubsub.set_cb(key, this["_on_" + key]);
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