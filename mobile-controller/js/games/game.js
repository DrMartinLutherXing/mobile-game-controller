games.game =
{
	"_id": null,
	"_host": null,
	"_game": null,
	"_display": null,
	"_players": [],
	"update": (u) {
		for (var k in u)
			// do something
	},
	"newPlayer": function(p) {
		//verify player isn't already in _players
		if ("_id" in p)
			games.game._players.push(p);
	},
	"start": function(s) {
		var g = games.game._game;
		g.init && g.init(g._host, g._display, g._players);
		g.start && g.start(s);
	},
	"init": function(i) {
		var game, name;
		if ("game_name" in i) {
			name = i.game_name;
			CT.require('games.' + name + ".import");
			games.game._game = games[name].game;
		}
	},
};
