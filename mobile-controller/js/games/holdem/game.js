games.holdem.game =
{
	"_data": {},
	"_sequence": [
		"preflop", "flop",
		"turn", "river", "show"
	],
	"_round_bid": 0,
	"_game_stage": "",
	"_dealer_index": 0,
	"_hand_number": 0,
	"_round_total": 0,
	"_pot_total": 0,
	"_bid_start_index": 0,
	"_host": null,
	"_display": null,
	"_players": null,
	"_deck": null,
	"_build": function() {
		var g = game.holdem.game;
		g._deck = new Deck();
		g._data[g._display.id] = {};
		g._players.forEach(function(p) {
			g._data[p._id] = {
				"stat": "active",
				"cash": games.holdem.constants.start_cash
			};
		});
	},
	"_getNextDealer": function() {
	},
	"_nextActivePlayerIndex": function(startIndex) {
		var g = games.holdem.game,
			playerCount = g._players.length,
			playerIndex =
				((startIndex || g._dealer_index) + 1) % playerCount,
			player = g._players[playerIndex];
			if (g._data[player._id].stat != "active")
				g._nextActivePlayerIndex(startIndex);
			else return playerIndex;
	},
	"_setTableBlinds": function() {
	},

	"_updatePlayerCard": function(player, card, card_num) {
		var g = games.holdem.game,
			playerData = g._data[player.id],
			cardKey = "card_" + card_num,
			cardVal = card.val(), update = {};
		playerData[cardKey] = card;
		update[cardKey] = cardVal;
		//send player update about card
		//may want to pass card object to player update
		//where setCardImage could be attached to the card class instance
		player.update(update);
	},
	"_updateDisplayCard": function(card, card_num) {
		var g = games.holdem.game,
			displayData = g._data[g._display.id],
			cardKey = "card_" + card_num,
			cardVal = card.val(), update = {};
		displayData[cardKey] = card;
		update[cardKey] = cardVal;
		//send display update about card
		//may want to pass card object to display update
		//where setCardImage could be attached to the card class instance
		g._display.update(update);
	},
	
	"_deal": function() {
		var g = games.holdem.game, d =  {
			"preflop": function() {
				var index = 2, card,
					playerId, playerIndex, playerData, player;
				while (index) {
					playerIndex = g._nextActivePlayerIndex();
					player = g._players[playerIndex];
					playerId = player._id;
					card = g._deck.draw();
					g.updatePlayerCard(player, card, index);
					if (playerId == g._dealer_index)
						--card;
				}
			},
			"flop": function() {
				var g = games.holdem.game, card, cardKey;
				//burn a card
				g._deck.draw();
				for (var index = 1; index < 4; ++index) {
					card = g._deck.draw();
					g._updateDisplayCard(card, index);
				}
			},
			"turn": function() {
				var g = games.holdem.game, card;
				//burn a card
				g._deck.draw();
				card = g._deck.draw();
				g._updateDisplayCard(card, 4);
			},
			"river": function() {
				var g = games.holdem.game, card;
				//burn a card
				g._deck.draw();
				card = g._deck.draw();
				g._updateDisplayCard(card, 5);
			}
		};
		d[g._game_stage]();
	},
	"_handlePlayerResponse": function(p, resp) {
		var g = games.holdem.game, cash,
			playerIndex = g._players.indexOf(p),
			nextPlayerIndex = g._nextActivePlayerIndex(playerIndex);
		switch (resp.type) {
			case "raise":
				cash = resp.raise;
				g._bid_start_index = playerIndex;
				g._round_bid = cash;
				g._data[p._id].cash -= cash;
				g._round_total += cash;
				break;
			case "call":
				cash = g._round_bid;
				g._data[p._id].cash -= cash;
				g._round_total += cash;
				break;
			case "fold":
				g._data[p._id].stat = "fold";
				break;
			default:
				break
		}
		if (nextPlayerIndex == g._bid_start_index)
			g._run();
		else
			g._bidQuery(g._players[nextPlayerIndex]);
	},
	"_bidQuery": function(p) {
		var g = games.holdem.game;
		p.requestResponse(g._round_bid, g._handlePlayerResponse);
	},
	"_bid": function() {
		var g = games.holdem.game, b =  {
			"preflop": function() {
				var smallIndex =  g._nextActivePlayerIndex(),
					bigIndex = g._nextActivePlayerIndex(smallIndex),
					startIndex = g._nextActivePlayerIndex(bigIndex),
					player = g._players[startIndex];
				g._bid_start_index = startIndex;
				g._bidQuery(player);
			},
			"flop": function() {
			},
			"turn": function() {
			},
			"river": function() {
			}
		};
		g._round_bid = 0;
	},
	"_run": function() {
		var g = games.holdem.game;
		g._game_stage = g._game_stage ?
			g._sequence[g._sequence.indexOf(g._game_stage)+1] :
			g._sequence[0];
		g._deal();
		g._bid();
	},
	"_start": function() {
		var g = games.holdem.game;
		g._hand_number++;
		g._setTableBlinds();
		g._run();
	},
	"start": function() {
		games.holdem.game._start();
	},
	"init": function(host, display, players) {
		games.holdem._host = host;
		games.holdem._display = display;
		games.holdem._players = players;
		games.holdem.games._build();
	}
};
