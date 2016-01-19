CT.require("CT.dom");
CT.require("games.holdem.constants");
CT.require("lib.card");

var _m = games.holdem.ui.mobile = {
	consts: null,
	view: CT.dom.node("", "div", "fullscreen mobile-background"),
	table_btn: CT.dom.node("", "div", "m-holdem_btn dealer"),
	account_name: CT.dom.node("", "div", "m-holdem_text account_name"),
	current_bid: CT.dom.node("", "div", "m-holdem_text current_bid"),
	card_1: CT.dom.node("", "div", "m-holdem_card"),
	card_2: CT.dom.node("", "div", "m-holdem_card"),
	current_money: CT.dom.node("", "div", "m-holdem_text current_money"),
	next_bid: CT.dom.node("", "div", "m-holdem_next_bid"),
	allin_button: CT.dom.button("ALL-IN", null, "m-holdem_allin_button"),
	//bid_slider: CT.dom.node(),
	raise_button: CT.dom.button("$100 RAISE", null,
		"m-holdem_button raise"),
	call_button: CT.dom.button("$100 CALL", null,
		"m-holdem_button call"),
	fold_button: CT.dom.button("FOLD", null,
		"m-holdem_button fold"),
	_build: function() {
		_m.view.appendChild(CT.dom.wrapped([
			CT.dom.wrapped([
				CT.dom.wrapped([
					_m.table_btn, _m.account_name]),
				_m.current_bid
			], "div", "m-holdem_top"),
			CT.dom.wrapped([
				_m.card_1,
				_m.card_2
			], "div", "m-holdem_cards"),
			CT.dom.wrapped([
				_m.current_money,
				CT.dom.wrapped([
					_m.next_bid,
					_m.allin_button]),
				//_m.bid_slider,
				_m.raise_button,
				_m.call_button,
				_m.fold_button
			], "div", "m-holdem_interactions")
		]));
		_m._updates();
	},
	_updates: function() {
		var _updates = {
			"table_btn": function(btn) {
				_m.table_btn.className = "m-holdem_btn " + (btn || "hidden");
			},
			"account_name": function(name) {
				_m.account_name.innerHTML = name;
			},
			"current_bid": function(money) {
				_m.current_bid.innerHTML = "$" + money;
			},
			"card_1": function(card) {
				lib.card.setCardImage(_m.card_1, card);
			},
			"card_2": function(card) {
				lib.card.setCardImage(_m.card_2, card);
			},
			"current_money": function(money) {
				_m.current_money.innerHTML = "$" + money;
			},
			"next_bid": function(money) {
				_m.next_bid.innerHTML = "$" + money;
			},
			"raise_button": function(money) {
				_m.raise_button.innerHTML = "$" + money + " RAISE";
			},
			"call_button": function(money) {
				_m.call_button.innerHTML = 
					money ? "$" + money + " CALL" : "CHECK";
			},
			"fold_button": function(fold) {
				_m.fold_button.innerHTML = fold ? "FOLD" : "CHECK / FOLD";
			},
		};
		for (var u in _updates)
			_m[u]._update = _updates[u];
	},
	init: function(initial) {
		_m.consts = games.holdem.constants;
		_m._build();
		for (var value in initial)
			if (value in _m)
				_m[value]._update && _m[value]._update(initial[value]);
	},
};
