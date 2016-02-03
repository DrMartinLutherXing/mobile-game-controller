CT.require("lib.Deck");
lib.Rank = CT.Class({
	_available: 0,
	_string: "",
	_cards: [],
	_ranks: {
		"STRAIGHT_FLUSH": function() {
			var flush, straightFlushs = [],
				cards = this._cards, straight;
			this._is("STRAIGHT", null, function(matches) {
					matches.forEach(function(straight) {
							flush = straight._is("FLUSH", null, function(fmatches) {
									straightFlushs.push(fmatches[0]);
								});
						});
				});
			//fixes reordering by flush check;
			straightFlushs = straightFlushs.map(function(straightFlush) {
				if (straightFlush._cards[0].value == "A" &&
						straightFlush._cards[1].value == "5")
					straightFlush._cards.push(straightFlush._cards.shift());
				return straightFlush;
			});
			//straightFlushs should be sorted properly from STRAIGHT call;
			return straightFlushs;
		},
		"KIND": function(num) {
			var _ = this._, hasValue, kinds = [],
				num = num || 1;
			for (hasValue in _.values) {
				if (num == 1)
					kinds.push(new lib.Rank([_.values[hasValue][0]]));
				else if (_.values[hasValue].length == num)
					kinds.push(new lib.Rank(_.values[hasValue]));
			}

			kinds.sort(function(a, b) {
				return b._cards[0].rank - a._cards[0].rank;
			});
			return kinds;
		},
		"HOUSE": function() {
			var rank = this, newRank, remaining,
				fullHouse, fullHouses = [];
				
			rank._is("KIND", [3], function(matches) {
				matches.forEach(function(three) {
					//may have to copy cards obj
					remaining = rank._filter(three._cards);
					newRank = new lib.Rank(remaining);
					newRank._is("KIND", [2], function(pmatches) {
							fullHouse =
								new lib.Rank(three._cards.concat(pmatches[0]._cards));
							fullHouses.push(fullHouse);
						});
				});
			});
			return fullHouses;
		},
		"FLUSH": function() {
			var _ = this._, hasSuit, flush, flushs = [];
			for (var hasSuit in _.suits) {
				flush = _.suits[hasSuit];
				if (flush.length > 4) {
					flush.sort(function(a, b){
						return b.rank - a.rank;
					});
					flushs = [new lib.Rank(flush.slice(0, 5))];
				}
			}
			return flushs;
		},
		"STRAIGHT": function() {
			var rank = this, index = 0, straight, newStraight,
				straights = [[]], returnStraights = [], straightIndex,
				cardsLength = this._cards.length, card, lastCard,
				lastValue, lastRank, currentCard, currentRank,
				findStraights  = function(low) {
					var conditional = function() {
						if (low) return straightIndex > index;
						else return straightIndex < cardsLength;
					};
					straightIndex = low ? cardsLength - 1 : index + 1;
					while(conditional()) {
						straights.forEach(function(s) {
							lastCard = low ? s[0] : s[s.length-1];
							lastRank = lastCard.rank;
							currentCard = rank._cards[straightIndex];
							currentRank = currentCard.rank;
							if (currentRank == lastRank) {
								newStraight = s.slice(0, s.length - 1);
								newStraight.push(currentCard);
								straights.push(newStraight);
							}else if (s.length < 5) {
								if (low) {
									if (lastCard.value == "A")
										lastRank = -1;
									if (currentRank == lastRank + 1)
										s.unshift(currentCard);
								}else if (currentRank == lastRank - 1)
									s.push(currentCard);
							}
						});
						if (low) --straightIndex;
						else ++straightIndex;
					}
				}, straightener = function(low) {
					card = rank._cards[index];
					straights = [[]];
					straight = straights[0];
					straight.push(card);
					findStraights(low);
					straights.forEach(function(s) {
						if (s.length == 5) {
							returnStraights.push(new lib.Rank(s));
						}
					});
				};
			while (index < 3) {
				straightener();
				card.value == "A" && straightener(true)
				++index;
			}

			//sort straights;
			returnStraights.sort(function(a, b) {
				var aFirstCard = a._cards[0], aSecondCard = a._cards[1],
					bFirstCard = b._cards[0], bSecondCard = b._cards[1],
					aRank = aFirstCard.rank, bRank = bFirstCard.rank;
					if (aFirstCard.value == "A" && aSecondCard.value == "5")
						aRank = aSecondCard.rank;
					if (bFirstCard.value == "A" && bSecondCard.value == "5")
						bRank = bSecondCard.rank;
				return bRank - aRank;
			});
			returnStraights = returnStraights.map(function(straightRank) {
				if (straightRank._cards[0].value == "A" &&
						straightRank._cards[1].value == "5")
					straightRank._cards.push(straightRank._cards.shift());
				return straightRank;
			});
			return returnStraights;
		},
		"2PAIR": function() {
			var rank = this, newRank, remaining,
				pairs, pairses = [];
				
			rank._is("KIND", [2], function(matches) {
				if (matches.length > 1) {
					pairs = matches[0]._cards.concat(matches[1]._cards);
					pairses.push(new lib.Rank(pairs));
				}
			})
			return pairses;
		}
	},
	"_is": function(t, params, success, failure) {
		var matches = this._ranks[t].apply(this, params);
		if (matches && matches.length)
			success && success(matches);
		else
			failure && failure();
	},

	"_fill": function() {
		var rank = this, index = 0;
		rank._is("KIND", [1], function(matches) {
				rank._string += "1KIND";
				while (rank._available > 0 && index < matches.length) {
						rank._available -= 1;
						rank._string += matches[index]._cards[0].value;
						++index;
				}
			});
	},
	"_filter": function(matched) {
		var rank = this;
		return !matched ? this._cards :
			this._cards.filter(function(card) {
				return matched.indexOf(card) == -1;
			});
	},
	"_sub": function(matched) {
		var reducedCards = this._filter(matched),
			newRank = new lib.Rank(reducedCards, this._available);
		newRank._fill();
		this._available = 0;
		this._string += newRank._string;
	},
	"_best": function() {
		var rank = this, reducedCards;
		rank._is("STRAIGHT_FLUSH", null, function(sf) {
				rank._available -= 5;
				rank._string += "STRAIGHT_FLUSH" + sf[0]._cards[0].value;
			}, function() {
				rank._is("KIND", [4], function(k4) {
						rank._available -= 4;
						rank._string += "4KIND" + k4[0]._cards[0].value;
						rank._sub(k4[0]._cards);
					}, function() {
						rank._is("HOUSE", null, function(h) {
								var hvals = h[0]._cards[0] == h[0]._cards[2] ?
									[h[0]._cards[0].value, h[0]._cards[3].value] :
									[h[0]._cards[2].value, h[0]._cards[0].value];
								rank._available -= 5;
								rank._string += "HOUSE" + hvals[0] + hvals[1];
							}, function() {
								rank._is("FLUSH", null, function(f) {
										rank._available -= 5;
										rank._string += "FLUSH";
										f[0]._cards.forEach(function(card) {
											rank._string += card.value;
										});
									}, function() {
										rank._is("STRAIGHT", null, function(strt) {
												rank._available -= 5;
												rank._string +=
													"STRAIGHT" + strt[0]._cards[0].value;
											}, function() {
												rank._is("KIND", [3], function(k3) {
														rank._available -= 3;
														rank._string +=
															"3KIND" + k3[0]._cards[0].value;
														rank._sub(k3[0]._cards);
												 }, function() {
													 rank._is("2PAIR", null, function(k2) {
															rank._available -= 4;
															rank._string +=
																"2PAIR" + k2[0]._cards[0].value
																+ k2[0]._cards[2].value;
															rank._sub(k2[0]._cards);
														}, function() {
															rank._is("KIND", [2], function(k1) {
																	rank._available -= 2;
																	rank._string += "2KIND" + k1[0]._cards[0].value;
																	rank._sub(k1[0]._cards);
																}, rank._sub);
														});
												 });
											});
									});
							});
					});
				});
	},
	"_sort": function() {
		this._cards.sort(function(a, b) {
			return b.rank - a.rank;
		});
	},
	"_build": function() {
		var rank = this;
		rank._ = {};
		rank._.suits = {};
		rank._.values = {};
		rank._string = "";

		rank._sort();
		rank._cards.forEach(function(card) {
				if (card.value in rank._.values)
					rank._.values[card.value].push(card);
				else rank._.values[card.value] = [card];
				if (card.suit in rank._.suits)
					rank._.suits[card.suit].push(card);
				else rank._.suits[card.suit] = [card];
		});
	},
	"compare": function(r) {
		var r1, r2, _r1 = [], _r2 = [], s1, s2, v1, v2,
			order = ["STRAIGHT_FLUSH", "4KIND", "HOUSE", "FLUSH", "STRAIGHT", "2PAIR",
			"2KIND", "1KIND"];
		this._best(); r._best();
		r1 = this._string;
		r2 = r._string;
		order.forEach(function(r) {
				_r1.push(r1.indexOf(r));
				_r2.push(r2.indexOf(r));
			});
		for (var i = 0; i < _r1.length; ++i) {
			if (_r1[i] > _r2[i]) return 1;
			else if (_r2[i] > _r1[i]) return -1;
			else if (_r1[i] == _r2[i] && _r1[i] != -1) {
				s1 = r1.substr(r1.indexOf(order[i]) + order[i].length);
				s2 = r2.substr(r2.indexOf(order[i]) + order[i].length);
				for (var j = 0; j < s1.length; ++j) {
					v1 = this._cards[0]._getRank(s1[j]);
					v2 = this._cards[0]._getRank(s2[j]);
					if (v1 > v2) return 1;
					if (v2 > v1) return -1;
				}
				if (s1.indexOf("1KIND") > -1) {
					s1 = s1.substr(s1.indexOf("1KIND")+5);
					s2 = s1.substr(s1.indexOf("1KIND")+5);
					for (var j = 0; j < s1.length; ++j) {
						v1 = this._cards[0]._getRank(s1[j]);
						v2 = this._cards[0]._getRank(s2[j]);
						if (v1 > v2) return 1;
						if (v2 > v1) return -1;
					}
				}else return 0;
			}
		}
	},
	"init": function(cards, available) {
		this._cards = cards.slice();
		this._available = available || 0;
		this._build();
	}
}, core.Base);
lib.Rank._test = function() {
	var suits = [
		"diamond",
		"heart",
		"spade",
		"club"
	], cards = [];

	/*
	// STRAIGHTT FROM 5
	["6", "9", "8", "7", "T"].forEach(function(v, index) {
		cards.push(new lib.Card(suits[index % 4], v));
	});
	TEST = new lib.Rank(cards, 5);
	TEST._best();
	console.log(TEST);

	// STRAIGHT_FLUSHA FROM 5
	cards = [];
	["T", "J", "Q", "K", "A"].forEach(function(v) {
		cards.push(new lib.Card("club", v));
	});
	TEST = new lib.Rank(cards, 5);
	TEST._best();
	console.log(TEST);
	
	// 4KIND31KIND2 FROM 5
	TEST = new lib.Rank([
			new lib.Card("club", "3"),
			new lib.Card("diamond", "3"),
			new lib.Card("heart", "3"),
			new lib.Card("spade", "3"),
			new lib.Card("spade", "2")
		], 5);
	TEST._best();
	console.log(TEST);

	// HOUSE3K FROM 5
	TEST = new lib.Rank([
			new lib.Card("club", "3"),
			new lib.Card("diamond", "3"),
			new lib.Card("heart", "3"),
			new lib.Card("spade", "K"),
			new lib.Card("club", "K")
		], 5);
	TEST._best();
	console.log(TEST);

	// STRAIGHT7 FROM 7
	["A", "2","3", "4", "5", "6", "7"].forEach(function(v, index) {
		cards.push(new lib.Card(suits[index % 4], v));
	});
	TEST = new lib.Rank(cards, 5);
	TEST._best();
	console.log(TEST);
	

	// STRAIGHT5 FROM 7
	["A", "2","3", "3", "4", "4", "5"].forEach(function(v, index) {
		cards.push(new lib.Card(suits[index % 4], v));
	});
	TEST = new lib.Rank(cards, 5);
	TEST._best();
	console.log(TEST);


	// STRAIGHTT FROM 7
	cards = [];
	["4", "5","6", "9", "8", "7", "T"].forEach(function(v, index) {
		cards.push(new lib.Card(suits[index % 4], v));
	});
	TEST2 = new lib.Rank(cards, 5);
	TEST2._best();
	console.log(TEST2);

	console.log(TEST.compare(TEST2));

	// 3KIND31KINDQT FROM 5
	TEST2 = new lib.Rank([
			new lib.Card("club", "3"),
			new lib.Card("diamond", "3"),
			new lib.Card("heart", "3"),
			new lib.Card("spade", "T"),
			new lib.Card("club", "Q")
		], 5);
	TEST2._best();
	console.log(TEST2);

	console.log(TEST.compare(TEST2));

	// HOUSE3Q FROM 5
	TEST2 = new lib.Rank([
			new lib.Card("club", "3"),
			new lib.Card("diamond", "3"),
			new lib.Card("heart", "3"),
			new lib.Card("spade", "Q"),
			new lib.Card("club", "Q")
		], 5);
	TEST2._best();
	console.log(TEST2);
	

	// 2PAIR321KINDK FROM 5
	TEST2 = new lib.Rank([
			new lib.Card("club", "K"),
			new lib.Card("diamond", "3"),
			new lib.Card("heart", "3"),
			new lib.Card("heart", "2"),
			new lib.Card("spade", "2")
		], 5);
	TEST2._best();
	console.log(TEST2);

	// 1KINDAKQ75 FROM 7
	TEST = new lib.Rank([
			new lib.Card("heart", "7"),
			new lib.Card("heart", "5"),
			new lib.Card("diamond", "Q"),
			new lib.Card("heart", "K"),
			new lib.Card("spade", "2"),
			new lib.Card("heart", "3"),
			new lib.Card("spade", "A")
		], 5);
	TEST._best();
	console.log(TEST._string);

	// 2KINDK1KINDAQT FROM 7
	TEST2 = new lib.Rank([
			new lib.Card("diamond", "K"),
			new lib.Card("spade", "T"),
			new lib.Card("diamond", "Q"),
			new lib.Card("heart", "K"),
			new lib.Card("spade", "2"),
			new lib.Card("heart", "3"),
			new lib.Card("spade", "A")
		], 5);
	TEST2._best();
	console.log(TEST2._string);
	// STRAIGHT5 FROM 7
	TEST2 = new lib.Rank([
			new lib.Card("diamond", "K"),
			new lib.Card("spade", "5"),
			new lib.Card("diamond", "4"),
			new lib.Card("heart", "3"),
			new lib.Card("spade", "2"),
			new lib.Card("heart", "Q"),
			new lib.Card("spade", "A")
		], 5);
	TEST2._best();
	console.log(TEST2);
	*/
	// FLUSHAKQ53 FROM 7
	TEST = new lib.Rank([
			new lib.Card("heart", "4"),
			new lib.Card("spade", "5"),
			new lib.Card("spade", "Q"),
			new lib.Card("spade", "K"),
			new lib.Card("spade", "2"),
			new lib.Card("spade", "3"),
			new lib.Card("spade", "A")
		], 5);
	TEST._best();
	console.log(TEST._string);

	// FLUSHKQ532 FROM 7
	TEST2 = new lib.Rank([
			new lib.Card("heart", "4"),
			new lib.Card("spade", "5"),
			new lib.Card("spade", "Q"),
			new lib.Card("spade", "K"),
			new lib.Card("spade", "2"),
			new lib.Card("spade", "3"),
			new lib.Card("club", "A")
		], 5);
	TEST2._best();
	console.log(TEST2._string);

	console.log(TEST.compare(TEST2));

};
