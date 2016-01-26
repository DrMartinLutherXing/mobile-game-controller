games.holdem.game = new CT.Class({
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
	"_display": null,
	"_players": null,
	"_deck": null,

	"_forEachActive": function(cb) {
		var g = this;
		g._players.forEach(function(p) {
			if (g._data[p].stat == "active") cb(p);
		});
	},
	"_numActive":  function() {
		var g = this, num = 0;
		g._forEachActive(function(){++num;});
		return num;
	},
	"_build": function() {
		var g = this;
		g._deck = new lib.Deck();
		g._data[g._display._id] = {};
		g._players.forEach(function(p) {
			g._data[p] = {
				"stat": "active",
				"cash": games.holdem.constants.start_cash
			};
		});
	},
	"_buildPot": function() {
		var g = this;
		g._forEachActive(function(p) {
			g._pot[p._id] = 0;
		});
	},
	"_nextActivePlayerIndex": function(startIndex) {
		var g = this,
			playerCount = g._players.length,
			playerIndex =
				((startIndex || g._dealer_index) + 1) % playerCount,
			player = g._players[playerIndex];
			if (g._data[player._id].stat != "active")
				g._nextActivePlayerIndex(startIndex);
			else return playerIndex;
	},
	"_setNextDealer": function() {
		var g = this;
		g._dealer_index = g._nextActivePlayerIndex();
	},
	"_updateTableBlinds": function() {
	},
	"_updateUIs": function() {
	},
	"_updatePlayerCard": function(player, card, card_num) {
		var g = this,
			playerData = g._data[player._id],
			cardKey = "card_" + card_num;
		playerData[cardKey] = card;
		//send player update about card
		//may want to pass card object to player update
		//where setCardImage could be attached to the card class instance
		g._host.deal(player, card);
	},
	"_updateDisplayCard": function(card, card_num) {
		var g = this,
			displayData = g._data[g._display._id],
			cardKey = "card_" + card_num;
		displayData[cardKey] = card;
		//send display update about card
		//may want to pass card object to display update
		//where setCardImage could be attached to the card class instance
		g._host.deal(g._display._id, card);
	},
	"_updatePlayersStatus": function() {
		var g = this, playerData;
		g._players.forEach(function(p) {
			playerData = g._data[p];
			if (playerData.stat == "fold")
				playerData.stat = "active";
			if (playerData.cash <= 0)
				playerData.stat = "inactive";
		});
	},
	"_resetRound": function() {
		var g = this,
			blindIncs = g._hand_number / g._blind_increase_interval;
		g._buildPot();
		g._round_bid = 100 * Math.pow(2, Math.floor(blindIncs));
	},
	"_updatePlayerCash": function() {
		
	},
	"_distributePot": function(winners) {
		var g = this, potTotal = 0, splitTotal,
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
		var g = this,
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
		var g = this, highRank,
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
		var g = this;
		g._forEachActive(g._rankHand);
		g._distributePot(g._bestHandRanks());
	},
	
	"_deal": function() {
		var g = this, d =  {
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
				var g = this, card, cardKey;
				//burn a card
				g._deck.draw();
				for (var index = 1; index < 4; ++index) {
					card = g._deck.draw();
					g._updateDisplayCard(card, index);
				}
			},
			"turn": function() {
				var g = this, card;
				//burn a card
				g._deck.draw();
				card = g._deck.draw();
				g._updateDisplayCard(card, 4);
			},
			"river": function() {
				var g = this, card;
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
	"_handlePlayerResponse": function(p, msg) {
		var g = this, data = msg.data.split(" ").reverse(),
			cash = data.length > 1 ? parseInt(data[1]) : 0,
			playerIndex = g._players.indexOf(p),
			nextPlayerIndex = g._nextActivePlayerIndex(playerIndex);
		if (msg.action == "move" && playerIndex == g._activeIndex)
			switch (msg[0]) {
				case "RAISE":
					g._bid_start_index = playerIndex;
					g._round_bid += cash;
					g._pot[p] += g._round_bid;
					g._data[p].cash -= cash;
					g._round_total += cash;
					break;
				case "CALL":
					g._pot[p] += cash;
					g._data[p].cash -= cash;
					g._round_total += cash;
					break;
				case "FOLD":
					g._data[p].stat = "fold";
					break;
				default:
					break;
			}
		g._activeIndex = nextPlayerIndex;
		if (nextPlayerIndex == g._bid_start_index) g._run();
		else g._host.turn(g._players[g._activeIndex]);
	},
	"_bidQuery": function(p) {
		var g = this;
		p.requestResponse(g._round_bid, g._handlePlayerResponse);
	},
	"_bid": function() {
		var g = this, b =  {
			"preflop": function() {
				var smallIndex =  g._nextActivePlayerIndex(),
					bigIndex = g._nextActivePlayerIndex(smallIndex),
					startIndex = g._nextActivePlayerIndex(bigIndex),
					player = g._players[startIndex];
				g._bid_start_index = startIndex;
				g._activeIndex = startIndex;
				g._host.turn(player);
			},
			"flop": function() {
				var index =  g._nextActivePlayerIndex();
				g._host.turn(g._players[index]);
			},
			"turn": function() {
				var index =  g._nextActivePlayerIndex();
				g._host.turn(g._players[index]);
			},
			"river": function() {
				var index =  g._nextActivePlayerIndex();
				g._host.turn(g._players[index]);
			},
			"show": function() {
				g._end();
			}
		};
		g._round_bid = 0;
		b[g._game_stage]();
	},
	"_run": function() {
		var g = this;
		g._game_stage = g._game_stage ?
			g._sequence[g._sequence.indexOf(g._game_stage)+1] :
			g._sequence[0];
		g._deal();
		g._bid();
	},
	"_clean": function() {
		var g = this;
		g._updatePlayersStatus();
		g._updateUIs();
	},
	"_end": function() {
		var g = this;
		g._clean();
		g._setNextDealer();
		g._start();
	},
	"_start": function() {
		var g = this;
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
		this._start();
	},
	"init": function() {
		games._host = core.actor;
		games.holdem._display = {
			_id: "table"
		};
		this._build();
	},
	"load": function(obj) {
		CT.log("games.holdem.game.load: " + JSON.stringify(obj));
		this._players = obj.presence;
	},
	"update": function(obj) {
		CT.log("games.holdem.game.update: " + JSON.stringify(obj));
		if (this._players.indexOf(obj.user) != -1) {
			this._handlePlayerResponse(obj.user, obj.message);
		}
	},
	"join": function(user) {
		CT.log("games.holdem.game.join: " + user);
	},
	"leave": function(user) {
		CT.log("games.holdem.game.leave: " + user);
		this._players.splice(this._player.indexOf(user), 1);
	}
});
