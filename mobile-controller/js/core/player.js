CT.require("CT.pubsub");

// events
//  - pubsub: pm|message|subscribe|join|leave|open|close|error|wserror
//  - player (additional): gamelist
// player actions: connect|join
// dealer actions: connect|start

var cpcb = null;
core.player = {
	"_cbs": {},
	"_name": null,
	"_on_open": function() {
		CT.log("OPEN");
		CT.pubsub.subscribe("lobby"); // don't call open cb yet...
	},
	"_on_close": function() {
		CT.log("CLOSE");
		cpcb.close && cpcb.close();
	},
	"_on_wserror": function() {
		CT.log("WEBSOCKET ERROR");
		cpcb.wserror && cpcb.wserror();
	},
	"_on_error": function(message) {
		CT.log("ERROR (non-fatal): " + message);
		cpcb.error && cpcb.error(message);
	},
	"_on_subscribe": function(data) {
		CT.log("SUBSCRIBE " + JSON.stringify(data));
		if (data.channel == "lobby")
			cpcb.open && cpcb.open(data);
		else
			cpcb.subscribe && cpcb.subscribe(data);
	},
	"_on_join": function(channel, user) {
		CT.log("JOIN " + channel + " " + user);
		cpcb.join && cpcb.join(data);
	},
	"_on_leave": function(channel, user) {
		CT.log("LEAVE " + channel + " " + user);
		cpcb.leave && cpcb.leave(data);
	},
	"_on_message": function(data) {
		CT.log("MESSAGE " + JSON.stringify(data));
		cpcb.message && cpcb.message(data);
	},
	"_on_pm": function(data, user) {
		CT.log("PM " + user + ": " + JSON.stringify(data));
		if (user == "lobby") { // system messages
			if (data.type == "list")
				cpcb.gamelist && cpcb.gamelist(data.data);
			else
				throw "unimplemented lobby private message!";
		} else // regular private message
			cpcb.pm && cpcb.pm(data);
	},
	"connect": function(uname, cbs) {
		core.player._name = uname;
		cpcb = core.player._cbs = cbs || {};
		for (var key in CT.pubsub._.cb) // pubsub events
			CT.pubsub.set_cb(key, core.player["_on_" + key]);
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
};