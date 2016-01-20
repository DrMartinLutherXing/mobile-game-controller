games.holdem.game =
{
	"_data": {},
	"_host": null,
	"_display": null,
	"_alive": null,
	"_players": null,
	"_deck": null,
	"_build": function() {
		var g = game.holdem.game;
		g._deck = new Deck();
		g._players.forEach(function(p) {
			g._data[p._id] = {
				"cash": games.holdem.constants.start_cash
			};
		});
	},
	"init": function(host, display, players) {
		games.holdem._host = host;
		games.holdem._display = display;
		games.holdem._players = players;
		games.holdem.games._build();
	}
};
