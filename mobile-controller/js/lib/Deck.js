var consts = {
	suits: [
		"diamond",
		"heart",
		"spade",
		"club"
	],
	values: [
		"2", "3", "4", "5", "6",
		"7", "8", "9", "T", "J",
		"Q", "K", "A"
	]
};

lib.Card = CT.Class({
	MOD_NAME: "lib.Card",
	suit: "",
	value: "",
	rank: "",

	_getRank: function(v) {
		return consts.values.indexOf(v);
	},
	val: function() {
		//maybe define as getter
		return this.suit + this.value;
	},
	init: function(s, v) {
		this.suit = s ||
			consts.suits[Math.floor(Math.random() * consts.suits.length)];
		this.value = v ||
			consts.values[Math.floor(Math.random() * consts.values.length)];
		this.rank = this._getRank(v);
	}
}, core.Base);

lib.Deck = CT.Class({
	MOD_NAME: "lib.Deck",
	_deck: [],

	_build: function() {
		var that = this;
		consts.suits.forEach(function(s) {
			consts.values.forEach(function(v) {
				that._deck.push(new lib.Card(s, v));
			});
		});
	},
	_shuffle: function() {
		var j, x, i = this._deck.length,
			o = this._deck;
		while (i) {
			j = Math.floor(Math.random() * i);
			x = o[--i]; o[i] = o[j]; o[j] = x;
		}
		return o;
	},
	draw: function() {
		return this._deck.shift();
	},
	print: function() {
		var string = "";
		for (var i in this._deck)
			string += this._deck[i].val() + "\n";
		console.log(string);
	},
	init: function() {
		this._build();
		this._shuffle();

	}
}, core.Base);
