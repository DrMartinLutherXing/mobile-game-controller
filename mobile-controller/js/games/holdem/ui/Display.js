CT.require("games.holdem.ui.Bot");
CT.require("games.holdem.ui.Mobile");

games.holdem.ui.Display = CT.Class({
	"MOD_NAME": "games.holdem.ui.Display",
	consts: games.holdem.constants,
	_players: {},
	_buildVars: function() {
		this._vars = {
			"game_stage": "",
			"pot_total": "",
			"round_total": "",
			"hand_number": ""
		};
	},
	_buildCards: function() {
		var cards = [];
		while (cards.length < 5)
			cards.push(CT.dom.node("", "div", "d-holdem_card"));
		this.cards = cards;
	},
	_buildText: function(d) {
		var text = Object.keys(d)[0];
		return CT.dom.wrapped([
				CT.dom.node(text, "span", "d-holdem_text fix_text"),
				this[d[text]]
			], "div", "d-holdem_textwrap");
	},
	_build: function() {
		this._buildVars();
		this._buildCards();
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
				CT.dom.wrapped(this.cards, "div", "d-holdem_cards")
			], "div", "d-holdem_right")
		]));
	},
	_update: function() {
		var that = this;
		that.game_stage.innerHTML = that._vars.game_stage;
		that.pot_total.innerHTML = that._vars.pot_total;
		that.round_total.innerHTML = that._vars.round_total;
		that.hand_number.innerHTML = that._vars.hand_number;
		this.cards.forEach(function(c) {
			if (c._card)
				lib.card.setCardImage(c, c._card.val());
			else
				lib.card.setCardImage(c, "");
		});
	},
	_flip: function(c) {
		var index = 0;
		for (;index < 5; ++index) {
			if (!this.cards[index]._card) {
				this.cards[index]._card = new lib.Card(c.suit, c.value);
				break;
			}
		}
	},
	_resetCards: function() {
		this.cards.forEach(function(c) {
			c._card = null;
		});
	},
	update: function(u) {
		this.log("update", u);
		var msg = u.message;
		if (msg.action == "flip")
			this._flip(msg.data);
		else {
			if (msg.action == "summary")
				this._resetCards();
			for (var p in this._players)
				this._players[p].update(u);
		}
		this._update();
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
		for (var p in this._players)
			this._players[p].join(user);
		this._players[user] = new games.holdem.ui[
			user.slice(0, 5) == "host_" ? "Bot"
			: "Mobile"](pnode, user);
	},
	leave: function(user) {
		this.log("leave", user);
		this.players.removeChild(this._players[user].view);
		delete this._players[user];
		for (var p in this._players)
			this._players[p].leave(user);
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
