CT.require("core.ui");
lib.card = {
	"setCardImage": function(node, card, imageType) {
		var CONST = core.ui._ui.consts.card,
			tp = imageType || "svg",
			dims = CONST.dims[tp],
			strLength = card.length,
			suit = card.substr(0, strLength-1),
			suitIndex = CONST.suit.indexOf(suit),
			value = card[strLength-1],
			valueIndex = CONST.value.indexOf(value),
			nodeStyle = node.style,
			nodeWidth = parseFloat(node.width) ||
				parseFloat(node.style.width) ||
				node.scrollWidth || node.clientWidth,
			scale = nodeWidth / dims.width,
			x = dims.xStart, xp = dims.xPadding,
			y = dims.yStart, yp = dims.yPadding,
			w = dims.width, h = dims.height,
			t = scale * (y - suitIndex * (h + yp)),
			l = scale * (x - valueIndex * (w + xp));
		
		nodeStyle["background-image"] = "url(/img/Color_52_Faces_v.2.0." + tp + ")";
		nodeStyle["background-size"] = (dims.imageWidth * scale) + "px " +
			(dims.imageHeight * scale) + "px";
		nodeStyle["background-position"] = l + "px " + t + "px";
	}
}
