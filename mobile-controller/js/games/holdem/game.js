games.holdem.game = new CT.Class({
	"MOD_NAME": "games.holdem.game",
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
	"_blinds": [],
	"_pot": {},
	"_bid_start_index": 0,
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
	"_initPlayer": function(p) {
		this._data[p] = {
			"stat": "active",
			"cash": games.holdem.constants.start_cash
		};
	},
	"_build": function() {
		this._deck = new lib.Deck();
		this._players.forEach(this._initPlayer);
		this._data[this._host.name] = {};
	},
	"_buildPot": function() {
		var g = this;
		g._forEachActive(function(p) {
			g._pot[p] = 0;
		});
	},
	"_nextActivePlayerIndex": function(startIndex) {
		var g = this,
			playerCount = g._players.length, playerIndex = g._dealer_index;
			if (Number.isInteger(startIndex)) playerIndex = startIndex;
			playerIndex = (playerIndex + 1) % playerCount;
			player = g._players[playerIndex];
			if (g._data[player].stat != "active")
				g._nextActivePlayerIndex(playerIndex);
			else return playerIndex;
	},
	"_setNextDealer": function() {
		var g = this;
		g._dealer_index = g._nextActivePlayerIndex();
	},
	"_updateTableBlinds": function() {
		var actives = this._numActive(),
			smallIndex =  this._nextActivePlayerIndex(),
			bigIndex = this._nextActivePlayerIndex(smallIndex);
		//will need to incorporate using min of player cash and round_bid
		if (actives > 2) {
			this._blinds = [
				this._players[this._dealer_index],
				this._players[smallIndex],
				this._players[bigIndex]
			];
			this._pot[this._players[smallIndex]] += this._round_bid / 2;
			this._data[this._players[smallIndex]].cash -= this._round_bid / 2;
			this._pot[this._players[bigIndex]] += this._round_bid;
			this._data[this._players[bigIndex]].cash -= this._round_bid;
		}else if (actives == 2) {
				this._blinds = [
				this._players[this._dealer_index],
				null,
				this._players[smallIndex]
			];
			this._pot[this._players[smallIndex]] += this._round_bid;
			this._data[this._players[smallIndex]].cash -= this._round_bid;
		}
	},
	"_updatePlayerCard": function(player, card, card_num) {
		var g = this,
			playerData = g._data[player],
			cardKey = "card_" + card_num;
		playerData[cardKey] = card;
		//send player update about card
		g._host.deal(player, card);
	},
	"_updateDisplayCard": function(card, card_num) {
		var g = this,
			displayData = g._data[g._host.name],
			cardKey = "card_" + card_num;
		displayData[cardKey] = card;
		//send display update about card
		g._host.flip(card);
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
		g._game_stage = "";
		g._buildPot();
		g._round_bid = 100 * Math.pow(2, Math.floor(blindIncs));
	},
	"_updatePlayerCash": function(pid, cash) {
		this._data[pid].cash += cash;
	},
	"_distributePot": function(winners) {
		var g = this, potTotal = 0, splitTotal,
			winnerBid, winnerTotals = {}, playerLoss, updateValue;
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
				updateValue = winnerTotals[pid];
			else if (g._pot[pid] > 0)
				updateValue = g._pot[pid];
			else
				updateValue = 0;
			g._updatePlayerCash(pid, updateValue);
		}
	},
	"_rankHand": function(pid) {
		var g = this,
			d = g._data[g._host.name],
			p = g._data[pid],
			playerCards = [
				p.card_1, p.card_2,
				d.card_1, d.card_2,
				d.card_3, d.card_4, d.card_5
			];
		g._data[pid].rank = new lib.Rank(playerCards, 5);
	},
	"_bestHandRanks": function() {
		var g = this, highRank,
			winners = [];
		g._forEachActive(function(player) {
			if (winners.length == 0)
				winners.push(player);
			else if (g._data[winners[0]].rank.compare(g._data[player].rank) < 0)
				winners = [player];
			else if (g._data[winners[0]].rank.compare(g._data[player].rank) == 0)
				winners.push(player);
		});
		console.log("WINNERS: ");
		console.log(winners);

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
				var card, playerId, playerIndex, playerData, player;
				for (var i = 0; i < 2; ++i)
					g._forEachActive(function(player) {
						card = g._deck.draw();
						g._updatePlayerCard(player, card, i+1);
					});
			},
			"flop": function() {
				var card, cardKey;
				//burn a card
				g._deck.draw();
				for (var index = 1; index < 4; ++index) {
					card = g._deck.draw();
					g._updateDisplayCard(card, index);
				}
			},
			"turn": function() {
				var card;
				//burn a card
				g._deck.draw();
				card = g._deck.draw();
				g._updateDisplayCard(card, 4);
			},
			"river": function() {
				var card;
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
	"_handleUpdate": function(p, msg) {
		this.log("_handleUpdate", p, msg);
		var g = this, data, cash,
			playerIndex = g._players.indexOf(p),
			nextPlayerIndex = g._nextActivePlayerIndex(playerIndex);
		if (["turn", "summary", "stage"].indexOf(msg.action) != -1)
			return;
		if (msg.action == "start")
			return this.start();
		if (msg.action == "move" && playerIndex == g._activeIndex) {
			data = msg.data.move.split(" ").reverse();
			cash = data.length > 1 ? parseInt(data[1].substr(1)) : 0;
			switch (data[0]) {
				case "RAISE":
					g._bid_start_index = playerIndex;
					g._round_bid += cash;
					g._pot[p] += (g._round_bid - msg.data.invested);
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
		}
	},
	"_summary": function() {
		var p, that = this, summary = {}, starting_pot = 0;
		summary.hand_number = this._hand_number;
		for (p in that._pot)
			starting_pot += that._pot[p];
		summary.starting_pot = starting_pot;
		summary.ante = this._round_bid;
		summary.blinds = this._blinds;
		summary.cash = {};
		this._players.forEach(function(pid) {
			summary.cash[pid] = that._data[pid].cash;
		});
		core.actor.emit(this._host.channel, "summary", summary);
	},
	"_stage": function() {
		var g = this, stage = {
				"game_stage": g._game_stage
			};
		//stage.pot = g._pot;
		core.actor.emit(this._host.channel, "stage", stage);
	},
	"_bid": function() {
		var g = this, b =  {
			"preflop": function() {
				var actives = g._numActive(),
					smallIndex =  g._nextActivePlayerIndex(),
					bigIndex = g._nextActivePlayerIndex(smallIndex),
					startIndex = g._nextActivePlayerIndex(bigIndex),
					player = g._players[startIndex];
				if (actives > 2) {
					g._host.turn(player);
					g._bid_start_index = startIndex;
					g._activeIndex = startIndex;
				}else if (actives == 2) {
					g._host.turn(g._players[g._dealer_index]);
					g._bid_start_index = g._dealer_index;
					g._activeIndex = g._dealer_index;
				}
			},
			"flop": function() {
				var index =  g._nextActivePlayerIndex();
				g._bid_start_index = index;
				g._activeIndex = index;
				g._host.turn(g._players[index]);
			},
			"turn": function() {
				var index =  g._nextActivePlayerIndex();
				g._bid_start_index = index;
				g._activeIndex = index;
				g._host.turn(g._players[index]);
			},
			"river": function() {
				var index =  g._nextActivePlayerIndex();
				g._bid_start_index = index;
				g._activeIndex = index;
				g._host.turn(g._players[index]);
			},
			"show": function() {
				g._end();
			}
		};
		if (g._numActive() < 2)
			return g._run();
		//g._round_bid = 0;//questionable maybe...
		b[g._game_stage]();
	},
	"_run": function() {
		var g = this, actives = g._numActive();
		g._game_stage = g._game_stage ?
			g._sequence[g._sequence.indexOf(g._game_stage)+1] :
			g._sequence[0];
		if (actives > 1) {
			g._stage();
			g._deal();
			g._bid();
		}else {
			g._distributePot([g._players[g._activeIndex]]);
			g._end();
		}
	},
	"_clean": function() {
		var g = this;
		g._updatePlayersStatus();
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
				this.log("winner", player);
//				g._display.setWinner(player);
			});
		else {
			g._hand_number++;
			g._updateTableBlinds();
			g._summary();
			g._run();
		}
	},

	"start": function() {
		this.log("start", arguments);
		this._start();
	},
	"init": function() {
		this.log("init", arguments);
		this._host = core.actor;
	},
	"load": function(obj) {
		this.log("load", obj);
		this._players = obj.presence.slice();
		CT.data.remove(this._players, this._host.name);
		this._build();
	},
	"update": function(obj) {
		this.log("update", obj);
		this._handleUpdate(obj.user, obj.message);
	},
	"join": function(user) {
		this.log("join", user);
		if (user != this._host.name) {
			this._players.push(user);
			this._initPlayer(user);
		}
	},
	"leave": function(user) {
		this.log("leave", user);
		this._players.splice(this._player.indexOf(user), 1);
	}
}, core.Base);
