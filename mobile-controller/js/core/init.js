CT.require("core.ui");

onload = function() {
	var view = document.getElementById("view"),
		gamename = "holdem", initial = {
			"table_btn": "big_blind",
			"account_name": "kieran",
			"current_money": 10000,
			"current_bid": 100,
			"next_bid": 100,
			"game_stage": "PREFLOP",
			"pot_total": 2000,
			"round_total": 1000,
			"hand_number": 1,

			"card_0": "spadeT",
			"card_1": "spadeJ",
			"card_2": "spadeQ",
			"card_3": "spadeK",
			"card_4": "spadeA"
		};

	core.ui.load(gamename);	
	view.appendChild(core.ui._ui.view);
	core.ui.init(initial);
};
