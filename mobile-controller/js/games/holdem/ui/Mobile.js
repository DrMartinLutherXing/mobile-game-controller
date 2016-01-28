CT.require("games.holdem.constants");
CT.require("lib.card");
CT.require("lib.Deck");

games.holdem.ui.Mobile = CT.Class({
	consts: games.holdem.constants,
	_vars: {},
	_responses: {
		summary: function(s) {
			CT.log("games.holdem.ui.Mobile._responses.summary: " + JSON.stringify(s));
			this._vars.invested = 0;
			this._setAnte(s.ante);
			this._vars.cash = s.cash[this.acc_name]
			this._setBlinds(s.blinds)
		},
		move: function(m) {
			CT.log("games.holdem.ui.Mobile._responses.move: " + JSON.stringify(m));
			var g = this, move = m.split(" ").reverse(),
				cash = move.length > 1 ? parseInt(move[1]) : 0;
			if (move[0] == "RAISE") g._vars.round_bid += cash;
			CT.log("games.holdem.ui.Mobile._responses.move._vars: " + JSON.stringify(g._vars));
		},
		turn: function(t) {
			CT.log("games.holdem.ui.Mobile._responses.turn: " + t);
			if (t == this.acc_name)
				this.account_name.classList.add("mymove");
			else
				this.account_name.classList.remove("mymove");
		},
		deal: function(d) {
			CT.log("games.holdem.ui.Mobile._responses.deal: " + JSON.stringify(d));
			var card = new lib.Card(d.suit, d.value);
			this._cards.push(card);
			//this["card_" + this._cards.length]._update(card.val());
		}
	},
	_setCash: function(c) {
		this._vars.cash = c || this._vars.cash;
		//this.current_money._update(this._cash);
	},
	_setCurrentBid: function(c) {
		this._vars.current_bid = c || 0;
	},
	_setAnte: function(a) {
		this._vars.ante = this._vars.round_bid = this._vars.next_bid = a;
		//this.next_bid._update(this._min_raise);
	},
	_setBlinds: function(b) {
		// assumes b is a list of player ids in order
		// 0 - dealer, 1 - small, 2 - big
		var btn, blind = 0;
		switch (b.indexOf(this.acc_name)) {
			case 0:
				btn = "dealer";
				break;
			case 1:
				btn = "small_blind";
				blind = this._vars.ante / 2;
				break;
			case 2:
				btn = "big_blind";
				blind = this._vars.ante;
				break;
			default:
				btn = "hidden";
				break;
		}
		this._vars.btn = btn;
		this._vars.invested += blind;
		this._vars.cash -= blind;
		this._vars.current_bid = blind;
		//this.table_btn._update(btn);
	},
	_fold: function() {
	},
	_build: function() {
		this._cards = [];
		if (this.view.isPlayerNode) {
			this.view.appendChild(CT.dom.wrapped([
				this.account_name,
				this.current_money,
				this.current_bid
			]));
		}
		else {
			this.view.appendChild(CT.dom.wrapped([
				CT.dom.wrapped([
					CT.dom.wrapped([
						this.table_btn, this.account_name]),
					this.current_bid
				], "div", "m-holdem_top"),
				CT.dom.wrapped([
					this.card_1,
					this.card_2
				], "div", "m-holdem_cards"),
				CT.dom.wrapped([
					this.current_money,
					CT.dom.wrapped([
						this.next_bid,
						this.allin_button]),
					//this.bid_slider,
					this.raise_button,
					this.call_button,
					this.fold_button
				], "div", "m-holdem_interactions")
			]));
		}
		this._updates();
	},
	_updates: function() {
		var that = this, _updates = {
			"table_btn": function(btn) {
				that.table_btn.className =
					"m-holdem_btn " + (that._vars.btn || "hidden");
			},
			"account_name": function() {
				that.account_name.innerHTML = that.acc_name;
			},
			"current_bid": function() {
				that.current_bid.innerHTML = "$" + that._vars.current_bid;
			},
			"card_1": function() {
				if (that._cards.length == 2)
					lib.card.setCardImage(that.card_1, that._cards[0].val());
			},
			"card_2": function() {
				if (that._cards.length == 2)
					lib.card.setCardImage(that.card_2, that._cards[1].val());
			},
			"current_money": function() {
				that.current_money.innerHTML = "$" + that._vars.cash;
			},
			"next_bid": function() {
				that.next_bid.innerHTML = "$" + that._vars.next_bid;
			},
			"raise_button": function() {
				that.raise_button.innerHTML = "$" + that._vars.next_bid + " RAISE";
			},
			"call_button": function() {
				var toCall = that._vars.round_bid - that._vars.invested;
				if (toCall > 0) {
					that.call_button.className = "m-holdem_button call";
					that.call_button.innerHTML = "$" + toCall + " CALL";
				}else if (toCall == 0) {
					that.call_button.className = "m-holdem_button check";
					that.call_button.innerHTML = "CHECK";
				}
			},
			"fold_button": function() {
				var toCall = that._vars.round_bid - that._vars.invested;
				that.fold_button.innerHTML = toCall > 0 ? "FOLD" : "CHECK / FOLD";
			}
		};
		this._update = function() {
			//this[u]._update = _updates[u];
			for (var u in _updates)
				_updates[u]();
		};
	},
	update: function(u) {
		CT.log("games.holdem.ui.Mobile.update: " + JSON.stringify(u));
		var msg = u.message;
		if (Object.keys(this._responses).indexOf(msg.action) != -1)
			this._responses[msg.action](msg.data);
		this._update();
	},
	load: function(obj) {
		CT.log("games.holdem.ui.Mobile.load: " + JSON.stringify(obj));
	},
	join: function(user) {
		CT.log("games.holdem.ui.Mobile.join: " + user);
	},
	leave: function(user) {
		CT.log("games.holdem.ui.Mobile.leave: " + user);
	},
	"moveCb": function(m) {
		//needs checks for whether player has available money
		var that = this,
			buttonCb = function() {
				var move,
					toCall = that._vars.round_bid - that._vars.invested,
					toRaise = toCall + that._vars.next_bid,
					toAll = that._vars.cash - toCall;
				if (m == "CALL") {
					if (toCall == 0)
						move = "CHECK";
					else if (toCall > 0) {
						move = "$" + toCall + " " + m;
						//that._vars.round_bid += toCall;
						that._vars.invested += toCall;
						that._vars.current_bid += toCall;
						that._vars.cash -= toCall;
					}
				}else if (m == "RAISE") {
					move = "$" + toRaise + " " + m;
					that._vars.round_bid += that._vars.next_bid;
					that._vars.invested += toRaise;
					that._vars.current_bid += toRaise;
					that._vars.cash -= toRaise;
				}else if (m == "ALL-IN") {
					move = "$" + toAll  + " RAISE";
					that._vars.round_bid += toAll;
					that._vars.invested += that._vars.cash;
					that._vars.current_bid += that._vars.cash;
					that._vars.cash = 0;
				}else {
					move = m;
					that._fold();
				}
				that._update();
				core.actor.emit(that.name, "move", move);
			};
		return buttonCb;
	},
	init: function(view) {
		if (view && view.isPlayerNode) {
			this.view = view;
			this.acc_name = this.name;
		} else {
			this.view.classList.add("mobile-background");
			this.acc_name = core.actor.name;
		}
		this.table_btn = CT.dom.node("", "div", "m-holdem_btn dealer");
		this.account_name = CT.dom.node("", "div", "m-holdem_text account_name");
		this.current_bid = CT.dom.node("", "div", "m-holdem_text current_bid");
		this.card_1 = CT.dom.node("", "div", "m-holdem_card");
		this.card_2 = CT.dom.node("", "div", "m-holdem_card");
		this.current_money = CT.dom.node("",
			"div", "m-holdem_text current_money");
		this.next_bid = CT.dom.node("", "div", "m-holdem_next_bid");

		this.allin_button = CT.dom.button("ALL-IN",
			this.moveCb("ALL-IN"), "m-holdem_allin_button");
		//bid_slider: CT.dom.node(),
		this.raise_button = CT.dom.button("$100 RAISE",
			this.moveCb("RAISE"), "m-holdem_button raise");
		this.call_button = CT.dom.button("$100 CALL",
			this.moveCb("CALL"), "m-holdem_button call");
		this.fold_button = CT.dom.button("FOLD",
			this.moveCb("FOLD"), "m-holdem_button fold");

		this._build();
//		setTimeout(this.update, 0, games.holdem.initial);
	}
}, core.UI);
