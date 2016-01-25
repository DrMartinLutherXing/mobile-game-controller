CT.require("CT.pubsub");
CT.require("agent.Actor");
CT.require("lobby.constants");

agent.Host = CT.Class({
	"init": function() {
		this.name = "host_" + Math.floor((Math.random() * 100000));
		this.setCbs({
			"subscribe": this.onSubscribe,
			"join": this.onJoin,
			"leave": this.onLeave,
			"message": this.onMessage
		});
		this.join("lobby");
	},
	"onMessage": function(msg) {
		CT.log("Host.onMessage: " + JSON.stringify(msg));
		core.ui.update(msg);
		if (msg.channel != "lobby")
			games.game.update(msg);
	},
	"onSubscribe": function(data) {
		CT.log("Host.onSubscribe: " + data.channel);
		this.channel = data.channel;
		if (data.channel != "lobby") {
			games.game.init({
				"game_name": data.channel.split("_")[0]
			});
		}
		core.ui.load(data.channel, data);
	},
	"onJoin": function(channel, user) {
		CT.log("Host.onJoin: " + channel + " " + user);
		core.ui.join(channel, user);
		if (channel != "lobby")
			games.game.join(channel, user);
	},
	"onLeave": function(channel, user) {
		CT.log("Host.onLeave: " + channel + " " + user);
		core.ui.leave(channel, user);
		if (channel != "lobby")
			games.game.leave(channel, user);
	},
	"deal": function(player, card) {
		CT.log("Host.deal: " + player + " " + card);
		CT.pubsub.pm(player, {
			"action": "deal",
			"data": {
				"channel": this.channel,
				"card": card
			}
		});
	},
	"create": function(gametype) { // holdem...
		CT.log("CREATE " + gametype);
		CT.pubsub.pm("Concierge", {
			"action": "create",
			"data": gametype
		});
	},
	"start": function(gamename) {
		CT.log("START " + gamename);
		CT.pubsub.pm("Concierge", {
			"action": "start",
			"data": gamename
		});
		CT.pubsub.publish(gamename, {
			"action": "start"
		});
	}
}, agent.Actor);