CT.require("ct.dom");
CSS = {
	"cards": function(scale, imageType) {
		var cCONST = CONSTANTS.card,
			s = scale || 1, t = imageType || "svg",
			dims = cCONST.dims[t],
			x = dims.xStart * s,
			xp = dims.xPadding * s,
			y = dims.yStart * s,
			yp = dims.yPadding * s,
			w = dims.width * s,
			h = dims.height * s,
			cardCss = [{
				".card": {
					"position": "absolute",
					"top": "0",
					"left": "0",
				},
				".cardwrap": {
					"overflow": "hidden",
					"position": "relative",
					"height": (h + "px"),
					"width": (w + "px")
				}
			}];
		//construct list of json objects to define card images
		cCONST.suit.forEach(function(suit, sIndex) {
			cCONST.value.forEach(function(value, vIndex) {
				//rectangular image pixel coordinates: top, right, bottom, left
				//absolute postioned offset coordinates
				var cardClass = {},
					cardClassName = "." + suit + value,
					t = y + sIndex * (h + yp),
					l = x + vIndex * (w + xp),
					b = t + h, r = l + w,
					trbl = [t,r,b,l].map(function(v) {
						return v + "px";
					}).join(","),
					cardPropertyList = {
						"clip": "rect(" + trbl + ")",
						"top": ("-" + t + "px"),
						"left": ("-" + l + "px")
					};
				cardClass[cardClassName] = cardPropertyList;
				cardCss.push(cardClass);
			});
		});
		CT.dom.addStyle(null, null, cardCss);
	}
};
