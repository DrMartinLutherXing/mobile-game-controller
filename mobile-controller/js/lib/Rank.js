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
			//sort straightFlushs;
			return straightFlushs;
		},
		"KIND": function(num) {
			var _ = this._, hasValue, kinds = [],
				num = num || 1;
			for (hasValue in _.values)
				if (num == 1)
					kinds.push(new lib.Rank([_.values[hasValue][0]]));
				else if (_.values[hasValue].length == num)
					kinds.push(new lib.Rank(_.values[hasValue]));

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
			return fullHouse;
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
							}else if (low) {
								if (lastCard.value == "A")
									lastRank = -1;
								if (currentRank == lastRank + 1)
									s.unshift(currentCard);
							}else if (currentRank == lastRank - 1)
								s.push(currentCard);
						});
						if (low) --straightIndex;
						else ++straightIndex;
					}
				};
		while (index < 3) {
			straights = [[]];
			card = this._cards[index];
			lowAce = card.value == "A";
			straight = straights[0];
			straight.push(card);
			lastValue = card.value;
			lastRank = card.rank,
			findStraights()
			lowAce && findStraights(lowAce);
			straights.forEach(function(s) {
				if (s.length == 5) {
					returnStraights.push(new lib.Rank(s));
				}
			});
			++index;
		}
			//sort straights;
			return returnStraights;
		},
		"2PAIR": function() {
			var rank = this, newRank, remaining,
				pairs, pairses = [];
				
			rank._is("KIND", [2], function(matches) {
				if (matches.length > 1)
					pairs = matches[0]._cards.concat(matches[1]._cards);
				pairses.push(new lib.Rank(pairs));
			})
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
				console.log(matches);
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
		return this._cards.filter(function(card) {
				return matched.indexOf(card) == -1;
			});
	},
	"_sub": function(matched) {
		var reducedCards = this._filter(matched),
			newRank = new lib.Rank(reducedCards, this._available);
		newRank._fill();
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
								rank.available -= 5;
								rank._string += "HOUSE" + h[0]._cards[0].value
										+ h[0]._cards[3];
							}, function() {
								rank._is("FLUSH", null, function(f) {
										rank.available -= 5;
										rank._string += "FLUSH";
										f[0]._cards.forEach(function(card) {
											rank._string += card.value;
										});
									}, function() {
										rank._is("STRAIGHT", null, function(strt) {
												rank.available -= 5;
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
	"init": function(cards, available) {
		this._cards = cards.slice();
		this._available = available || 0; 
		this._build();
	}
});
lib.Rank._test = function() {
	var suits = [
		"diamond",
		"heart",
		"spade",
		"club"
	], cards = [];


	/*
	// STRAIGHTT FROM
	["6", "9", "8", "7", "T"].forEach(function(v, index) {
		cards.push(new lib.Card(suits[index % 4], v));
	});
	TEST2 = new lib.Rank(cards);
	console.log(TEST2);
	TEST2._best();
	console.log(TEST2);

	// STRAIGHT_FLUSHA FROM 5
	cards = [];
	["T", "J", "Q", "K", "A"].forEach(function(v) {
		cards.push(new lib.Card("club", v));
	});
	TEST = new lib.Rank(cards);
	console.log(TEST);
	TEST._best();
	console.log(TEST);
	*/
	
	// 4KIND FROM 5
	TEST = new lib.Rank([
			new lib.Card("club", "3"),
			new lib.Card("diamond", "3"),
			new lib.Card("heart", "3"),
			new lib.Card("spade", "3"),
			new lib.Card("spade", "2")
		], 5);
	TEST._best();
	console.log(TEST);

	/*
	// 2 PAIR FROM 5
	TEST = new lib.Rank([
			new lib.Card("club", "K"),
			new lib.Card("diamond", "3"),
			new lib.Card("heart", "3"),
			new lib.Card("heart", "2"),
			new lib.Card("spade", "2")
		], 5);
	TEST._best();
	console.log(TEST);
	*/

};
