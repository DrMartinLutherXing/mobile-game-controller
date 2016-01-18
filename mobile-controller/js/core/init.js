CT.require("core.ui");

onload = function() {
	var view = document.getElementById("view"),
		gamename = "holdem", initial = {
			"table_btn": "dealer",
			"account_name": "kieran",
			"current_money": 10000,
			"current_bid": 100,
			"next_bid": 100,
			"card_1": "diamondA",
			"card_2": "heartA"
		};

	core.ui.load(gamename);	
	view.appendChild(core.ui._ui.view);
	core.ui.init(initial);
};
