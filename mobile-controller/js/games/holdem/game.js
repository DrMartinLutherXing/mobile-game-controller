games.holdem.game =
{
	"_data": {},
	"_sequence": [
		"preflop", "flop",
		"turn", "river", "show"
	],
	"_round_bid": 100,
	"_blind_increase_interval": 11,
	"_game_stage": "",
	"_dealer_index": 0,
	"_hand_number": 0,
	"_round_total": 0,
	"_pot": {},
	"_bid_start_index": 0,
	"_host": null,
	"_display": null,
	"_players": null,
	"_deck": null,

	"_forEachActive": function(cb) {
		var g = games.holdem.game;
		g._players.forEach(function(p) {
			if (g._data[p._id].stat == "active") cb(p);
		});
	},
	"_numActive":  function() {
		var g = games.holdem.game, num = 0;
		g._forEachActive(function(){++num;});
		return num;
	},
	"_build": function() {
		var g = games.holdem.game;
		g._deck = new Deck();
		g._data[g._display._id] = {};
		g._players.forEach(function(p) {
			g._data[p._id] = {
				"stat": "active",
				"cash": games.holdem.constants.start_cash
			};
		});
	},
	"_buildPot": function() {
		var g = games.holdem.game;
		g._forEachActive(function(p) {
			g._pot[p._id] = 0;
		});
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
	"_setNextDealer": function() {
		var g = games.holdem.game;
		g._dealer_index = g._nextActivePlayerIndex();
	},
	"_updateTableBlinds": function() {
	},
	"_updateUIs": function() {
	},
	"_updatePlayerCard": function(player, card, card_num) {
		var g = games.holdem.game,
			playerData = g._data[player._id],
			cardKey = "card_" + card_num;
		playerData[cardKey] = card;
		//send player update about card
		//may want to pass card object to player update
		//where setCardImage could be attached to the card class instance
		g._host.deal(player, card);
	},
	"_updateDisplayCard": function(card, card_num) {
		var g = games.holdem.game,
			displayData = g._data[g._display._id],
			cardKey = "card_" + card_num;
		displayData[cardKey] = card;
		//send display update about card
		//may want to pass card object to display update
		//where setCardImage could be attached to the card class instance
		g._host.deal(g._display, card);
	},
	"_updatePlayersStatus": function() {
		var g = games.holdem.game, playerData;
		g._players.forEach(function(p) {
			playerData = g._display[p._id];
			if (playerData.stat == "fold")
				playerData.stat = "active";
			if (playerData.cash <= 0)
				playerData.stat = "inactive";
		});
	},
	"_resetRound": function() {
		var g = games.holdem.game,
			blindIncs = g._hand_number / g._blind_increase_interval;
		g._buildPot();
		g._round_bid = 100 * Math.pow(2, Math.floor(blindIncs));
	},
	"_updatePlayerCash": function() {
		
	},
	"_distributePot": function(winners) {
		var g = games.holdem.game, potTotal = 0, splitTotal,
			winnerBid, winnerTotals, playerLoss, updateValue;
		winners.forEach(function(wpid) {
			winnerTotals[wpid] = 0;
		});
		winners.sort(function(id1, id2) {
			return g._pot[id1] - g._pot[id2];
		});
		//assumes winners in increasing order;
		winners.forEach(function(wpid) {
			winnerBid = g._pot[wpid];
			if (winnerBid > 0) {
				for (var pid in g._pot) {
					if (winners.indexOf(pid) == -1) {
						playerLoss = Math.min(g._pot[pid], g._pot[wpid]);
						potTotal += playerLoss;
						g._pot[pid] -= playerLoss;
					}
				}
				splitTotal = Math.floor(potTotal/winners.length);
				winners.forEach(function(wwpid) {
					if (g._pot[wwpid] > 0) {
						potTotal -= splitTotal;
						winnerTotals[wwpid] += splitTotal + g._pot[wwpid];
						g._pot[wwpid] -= winnerBid;
					}
				});
			}
		});
		for (var pid in g._pot) {
			if (winners.indexOf(pid) != -1)
				updateValue = winnerTotals[wpid];
			else if (g._pot[pid] > 0)
				updateValue = g._pot[pid];
			else
				updateValue = 0;
			g._updatePlayerCash(pid, updateValue);
		}
	},
	"_rankHand": function(player) {
		var g = games.holdem.game,
			d = g._data[g._display._id], pid = player._id,
			p = g._data[pid],
			playerCards = [
				p.card_1, p.card_2,
				d.card_1, d.card_2,
				d.card_3, d.card_4, d.card_5
			];
		g._data[pid].rank = new lib.Rank(playerCards);
	},
	"_bestHandRanks": function() {
		var g = games.holdem.game, highRank,
			winners = [];
		g._forEachActive(function(player) {
			if (winners.length == 0)
				winners.push(player._id);
			else if (winners[0].rank._compare(player.rank) < 0)
				winners = [player._id];
			else if (winners[0].rank._compare(player.rank) == 0)
				winners.push(player._id);
		});
		return winners;
	},
	"_determineWinners": function() {
		var g = games.holdem.game;
		g._forEachActive(g._rankHand);
		g._distributePot(g._bestHandRanks());
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
			},
			"show": function() {
				g._determineWinners();
			}
		};
		d[g._game_stage]();
	},
	"_handlePlayerResponse": function(p, resp) {
		var g = games.holdem.game, cash = resp.cash,
			playerIndex = g._players.indexOf(p),
			nextPlayerIndex = g._nextActivePlayerIndex(playerIndex);
		if (nextPlayerIndex == g._bid_start_index) g._run();
		else {
			switch (resp.type) {
				case "raise":
					g._bid_start_index = playerIndex;
					g._round_bid += cash;
					g._pot[p._id] += g._round_bid;
					g._data[p._id].cash -= cash;
					g._round_total += cash;
					break;
				case "call":
					g._pot[p._id] += cash;
					g._data[p._id].cash -= cash;
					g._round_total += cash;
					break;
				case "fold":
					g._data[p._id].stat = "fold";
					break;
				default:
					break;
			}
			g._bidQuery(g._players[nextPlayerIndex]);
		}
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
				g._bidQuery(g._players[g._nextActivePlayerIndex()]);
			},
			"turn": function() {
				g._bidQuery(g._players[g._nextActivePlayerIndex()]);
			},
			"river": function() {
				g._bidQuery(g._players[g._nextActivePlayerIndex()]);
			},
			"show": function() {
				g._end();
			}
		};
		g._round_bid = 0;
		b[g._game_stage]();
	},
	"_run": function() {
		var g = games.holdem.game;
		g._game_stage = g._game_stage ?
			g._sequence[g._sequence.indexOf(g._game_stage)+1] :
			g._sequence[0];
		g._deal();
		g._bid();
	},
	"_clean": function() {
		var g = games.holdem.game;
		g._updatePlayersStatus();
		g._updateUIs();
	},
	"_end": function() {
		var g = games.holdem.game;
		g._clean();
		g._setNextDealer();
		g._start();
	},
	"_start": function() {
		var g = games.holdem.game;
		g._resetRound();
		if (g._numActive() == 1)
			g._forEachActive(function(player) {
				g._display.setWinner(player);
			});
		else {
			g._hand_number++;
			g._updateTableBlinds();
			g._run();
		}
	},

	"start": function() {
		games.holdem.game._start();
	},
	"init": function(host, display, players) {
		games.holdem._host = host;
		games.holdem._display = display;
		games.holdem._players = players;
		games.holdem.games._build();
	},
	"load": function(obj) {
		CT.log("games.holdem.game.load: " + JSON.stringify(obj));
	},
	"update": function(obj) {
		CT.log("games.holdem.game.update: " + JSON.stringify(obj));
	},
	"join": function(channel, user) {
		CT.log("games.holdem.game.join: " + channel + " " + user);
	},
	"leave": function(channel, user) {
		CT.log("games.holdem.game.leave: " + channel + " " + user);
	}
};
