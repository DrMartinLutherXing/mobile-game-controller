CT.require("CT.dom");
CT.require("games.holdem.constants");
CT.require("lib.card");

var _d = games.holdem.ui.display = {
	consts: null,
	view: CT.dom.node("", "div", "fullscreen display-background"),
	game_stage: CT.dom.node("", "div", "d-holdem_text vary_title"),
	pot_total: CT.dom.node("", "span", "d-holdem_text vary_text cash"),
	round_total: CT.dom.node("", "span", "d-holdem_text vary_text cash"),
	hand_number: CT.dom.node("", "span", "d-holdem_text vary_text"),
	card: (function(){
		var cards = [];
		while (cards.length < 5)
			cards.push(CT.dom.node("", "div", "d-holdem_card"));
		return cards;
	})(),

	_build: function() {
		_d.view.appendChild(CT.dom.wrapped([
			CT.dom.wrapped([
				CT.dom.node("POT", "div", "d-holdem_text fix_title"),
				CT.dom.wrapped([
						{"TOTAL:&nbsp;&nbsp;": "pot_total"},
						{"BETS:&nbsp;&nbsp;": "round_total"},
						{"HAND:&nbsp;&nbsp;": "hand_number"}
					].map(function(d) {
						var text = Object.keys(d)[0];
						return CT.dom.wrapped([
								CT.dom.node(text, "span", "d-holdem_text fix_text"),
								_d[d[text]]
							], "div", "d-holdem_textwrap");
					}))
			], "div", "d-holdem_left"),
			CT.dom.wrapped([
				_d.game_stage,
				CT.dom.wrapped(_d.card, "div", "d-holdem_cards")
			], "div", "d-holdem_right")
		]));
		_d._updates();
	},
	_updates: function() {
		["game_stage", "pot_total", "round_total",
			"hand_number"].forEach(function(o) {
				_d[o]._update = function(val) {
					_d[o].innerHTML = val;
				}
			});

		_d.card.forEach(function(c) {
			c._update = function(cval) {
				lib.card.setCardImage(c, cval);
			};
		});
	},
	init: function(initial) {
		var update;
		_d.consts = games.holdem.constants;
		_d._build();
		for (var value in initial) {
			if (value in _d)
				_d[value]._update && _d[value]._update(initial[value]);
			else if (value.indexOf("card") != -1) {
					update = _d.card[value[value.length-1]];
					update._update && update._update(initial[value]);
			}
		}
	}

};
