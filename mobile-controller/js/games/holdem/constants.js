games.holdem.constants = {
	"start_cash": 10000,
	"blind_increase_interval": 11,
	"initial_big_blind": 100,
	"card": {
		"dims": {
			"svg": {
				"xStart": 4109.0,
				"xPadding": 41.80,
				"yStart": 2291.0,
				"yPadding": 41.33,
				"width": 239.0,
				"height": 334.0,
				"imageWidth": 4608.0,
				"imageHeight": 3456.0
			},
			"png": {
				"imageWidth": 600.0
			},
		},
		"suit": [
			"club",
			"heart",
			"spade",
			"diamond"
		],
		"value": [
			"A", "2", "3", "4", "5",
			"6", "7", "8", "9", "T",
			"J", "Q", "K"
		]
	}
};
var i, d = games.holdem.constants.card.dims,
	pngR = d.svg.imageWidth / d.png.imageWidth;
for (i in d.svg)
	if (i != "imageWidth")
		d.png[i] = d.svg[i] / pngR;

games.holdem.initial = {
	"table_btn": "dealer",
	"account_name": "kieran",
	"current_money": 10000,
	"current_bid": 100,
	"next_bid": 100,
	"card_1": "diamondA",
	"card_2": "heartA"
};
