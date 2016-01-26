games.game =
{
	"_id": null,
	"_game": null,
	"_games": [],
	"update": function(u) {
		CT.log("games.game.update: " + JSON.stringify(u));
		games.game._games[u.channel].update(u);
	},
	"join": function(channel, user) {
		CT.log("games.game.join: " + channel + " " + user);
		games.game._games[channel].join(user);
	},
	"leave": function(channel, user) {
		CT.log("games.game.leave: " + channel + " " + user);
		games.game._games[channel].leave(user);
	},
	"load": function(obj) {
		CT.log("games.game.load: " + JSON.stringify(obj));
		games.game._game.load(obj);
	},
	"start": function(s) {
		var g = games.game._game;
		g.start && g.start(s);
	},
	"init": function(i) {
		var game, channel = i.game_name,
			name = channel.split("_")[0];
		if (!(channel in games.game._games)) {
			CT.require('games.' + name + ".import");
			games.game._games[channel] =
				new games[name].game();
		}
		games.game._game = games.game._games[channel];
	}
};
