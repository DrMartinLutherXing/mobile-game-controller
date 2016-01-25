CT.require("games.holdem.constants");
CT.require("lib.card");

games.holdem.ui.Mobile = CT.Class({
	consts: games.holdem.constants,
	_build: function() {
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
		var _updates = {
			"table_btn": function(btn) {
				this.table_btn.className = "m-holdem_btn " + (btn || "hidden");
			},
			"account_name": function(name) {
				this.account_name.innerHTML = name;
			},
			"current_bid": function(money) {
				this.current_bid.innerHTML = "$" + money;
			},
			"card_1": function(card) {
				lib.card.setCardImage(this.card_1, card);
			},
			"card_2": function(card) {
				lib.card.setCardImage(this.card_2, card);
			},
			"current_money": function(money) {
				this.current_money.innerHTML = "$" + money;
			},
			"next_bid": function(money) {
				this.next_bid.innerHTML = "$" + money;
			},
			"raise_button": function(money) {
				this.raise_button.innerHTML = "$" + money + " RAISE";
			},
			"call_button": function(money) {
				this.call_button.innerHTML = 
					money ? "$" + money + " CALL" : "CHECK";
			},
			"fold_button": function(fold) {
				this.fold_button.innerHTML = fold ? "FOLD" : "CHECK / FOLD";
			}
		};
		for (var u in _updates)
			this[u]._update = _updates[u];
	},
	update: function(u) {
		for (var value in u)
			if (value in this)
				this[value]._update && this[value]._update(u[value]);
	},
	init: function(initial) {
		this.view = CT.dom.node("", "div", "fullscreen mobile-background");
		this.table_btn = CT.dom.node("", "div", "m-holdem_btn dealer");
		this.account_name = CT.dom.node("", "div", "m-holdem_text account_name");
		this.current_bid = CT.dom.node("", "div", "m-holdem_text current_bid");
		this.card_1 = CT.dom.node("", "div", "m-holdem_card");
		this.card_2 = CT.dom.node("", "div", "m-holdem_card");
		this.current_money = CT.dom.node("",
			"div", "m-holdem_text current_money");
		this.next_bid = CT.dom.node("", "div", "m-holdem_next_bid");
		this.allin_button = CT.dom.button("ALL-IN",
			null, "m-holdem_allin_button");
		//bid_slider: CT.dom.node(),
		this.raise_button = CT.dom.button("$100 RAISE", null,
			"m-holdem_button raise");
		this.call_button = CT.dom.button("$100 CALL", null,
			"m-holdem_button call");
		this.fold_button = CT.dom.button("FOLD", null,
			"m-holdem_button fold");

		this._build();
		setTimeout(this.update, 0, initial || games.holdem.initial);
	}
});