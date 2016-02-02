CT.require("games.holdem.ui.Mobile");

games.holdem.ui.Display = CT.Class({
	"MOD_NAME": "games.holdem.ui.Display",
	consts: games.holdem.constants,
	_players: {},
	_buildCard: function() {
		var cards = [];
		while (cards.length < 5)
			cards.push(CT.dom.node("", "div", "d-holdem_card"));
		this.card = cards;
	},
	_buildText: function(d) {
		var text = Object.keys(d)[0];
		return CT.dom.wrapped([
				CT.dom.node(text, "span", "d-holdem_text fix_text"),
				this[d[text]]
			], "div", "d-holdem_textwrap");
	},
	_build: function() {
		this._cards = [];
		this._buildCard();
		this.view.appendChild(CT.dom.wrapped([
			this.players,
			CT.dom.wrapped([
				CT.dom.node("POT", "div", "d-holdem_text fix_title"),
				CT.dom.wrapped([
						{"TOTAL:&nbsp;&nbsp;": "pot_total"},
						{"BETS:&nbsp;&nbsp;": "round_total"},
						{"HAND:&nbsp;&nbsp;": "hand_number"}
					].map(this._buildText)),
				this.start_button
			], "div", "d-holdem_left"),
			CT.dom.wrapped([
				this.game_stage,
				CT.dom.wrapped(this.card, "div", "d-holdem_cards")
			], "div", "d-holdem_right")
		]));
		this._updates();
	},
	_updates: function() {
		var that = this;
		["game_stage", "pot_total", "round_total",
			"hand_number"].forEach(function(o) {
				that[o]._update = function(val) {
					that[o].innerHTML = val;
				}
			});

		this.card.forEach(function(c) {
			c._update = function(cval) {
				lib.card.setCardImage(c, cval);
			};
		});
	},
	_flip: function(c) {
		var card = new lib.Card(c.suit, c.value);
		this._cards.push(card);
		this.card[this._cards.length-1]._update(card.val());
	},
	update: function(u) {
		this.log("update", u);
		var msg = u.message;
		if (msg.action == "flip")
			this._flip(msg.data);
		else
			for (var p in this._players)
				this._players[p].update(u);
			/*
		}
		for (var value in u) {
			if (value in this)
				this[value]._update && this[value]._update(u[value]);
			else if (value.indexOf("card") != -1) {
				update = this.card[value[value.length-1]];
				update._update && update._update(u[value]);
			}
		}
		*/
	},
	_start: function() {
		this.start_button.parentNode.removeChild(this.start_button);
		core.actor.start(this.name);
	},
	join: function(user) {
		this.log("join", user);
		var pnode = CT.dom.node();
		pnode.isPlayerNode = true;
		this.players.appendChild(pnode);
		this._players[user] = new games.holdem.ui.Mobile(pnode, user);
	},
	leave: function(user) {
		this.log("leave", user);
		this.players.removeChild(this._players[user].view);
		delete this._players[user];
	},
	init: function(obj) {
		this.view.classList.add("display-background");
		this.game_stage = CT.dom.node("", "div", "d-holdem_text vary_title");
		this.pot_total = CT.dom.node("", "span", "d-holdem_text vary_text cash");
		this.round_total = CT.dom.node("", "span", "d-holdem_text vary_text cash");
		this.hand_number = CT.dom.node("", "span", "d-holdem_text vary_text");
		this.start_button = CT.dom.button("START", this._start);
		this.players = CT.dom.node("", "div", "right downshift bordered padded");
		this._build();
		obj.presence.forEach(this.join);
	}
}, core.UI);
