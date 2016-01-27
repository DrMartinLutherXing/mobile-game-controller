CT.require("games.holdem.constants");
CT.require("lib.card");
CT.require("lib.Deck");

games.holdem.ui.Mobile = CT.Class({
	consts: games.holdem.constants,
	_build: function() {
		this._cards = [];
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
		this._updates();
	},
	_updates: function() {
		var that = this, _updates = {
			"table_btn": function(btn) {
				that.table_btn.className = "m-holdem_btn " + (btn || "hidden");
			},
			"account_name": function(name) {
				that.account_name.innerHTML = name;
			},
			"current_bid": function(money) {
				that.current_bid.innerHTML = "$" + money;
			},
			"card_1": function(card) {
				lib.card.setCardImage(that.card_1, card);
			},
			"card_2": function(card) {
				lib.card.setCardImage(that.card_2, card);
			},
			"current_money": function(money) {
				that.current_money.innerHTML = "$" + money;
			},
			"next_bid": function(money) {
				that.next_bid.innerHTML = "$" + money;
			},
			"raise_button": function(money) {
				that.raise_button.innerHTML = "$" + money + " RAISE";
			},
			"call_button": function(money) {
				that.call_button.innerHTML = 
					money ? "$" + money + " CALL" : "CHECK";
			},
			"fold_button": function(fold) {
				that.fold_button.innerHTML = fold ? "FOLD" : "CHECK / FOLD";
			}
		};
		for (var u in _updates)
			this[u]._update = _updates[u];
	},
	"_deal": function(c) {
		var card = new lib.Card(c.suit, c.value);
		this._cards.push(card);
		this["card_" + this._cards.length]._update(card.val());
	},
	update: function(u) {
		CT.log("games.holdem.ui.Mobile.update: " + JSON.stringify(u));
		var msg = u.message;
		if (msg.action == "deal")
			this._deal(msg.data);
	},
	"_move": function(move) {
		var name = this.name;
		return function() {
			core.actor.emit(name, "move", move);
		};
	},
	init: function() {
		this.view.classList.add("mobile-background");
		this.table_btn = CT.dom.node("", "div", "m-holdem_btn dealer");
		this.account_name = CT.dom.node("", "div", "m-holdem_text account_name");
		this.current_bid = CT.dom.node("", "div", "m-holdem_text current_bid");
		this.card_1 = CT.dom.node("", "div", "m-holdem_card");
		this.card_2 = CT.dom.node("", "div", "m-holdem_card");
		this.current_money = CT.dom.node("",
			"div", "m-holdem_text current_money");
		this.next_bid = CT.dom.node("", "div", "m-holdem_next_bid");

		this.allin_button = CT.dom.button("ALL-IN",
			this._move("ALL-IN"), "m-holdem_allin_button");
		//bid_slider: CT.dom.node(),
		this.raise_button = CT.dom.button("$100 RAISE",
			this._move("$100 RAISE"), "m-holdem_button raise");
		this.call_button = CT.dom.button("$100 CALL",
			this._move("$100 CALL"), "m-holdem_button call");
		this.fold_button = CT.dom.button("FOLD",
			this._move("FOLD"), "m-holdem_button fold");

		this._build();
		setTimeout(this.update, 0, games.holdem.initial);
	}
}, core.UI);
