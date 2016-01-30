core.Base = CT.Class({
	"MOD_NAME": "core.Base",
	"init": function(obj, name) {
		this.name = name;
	},
	"log": function() {
		var i, a, pieces = [
			this.MOD_NAME,
			"(" + this.name + "):"
		];
		for (i = 0; i < arguments.length; i++) {
			a = arguments[i];
			pieces.push(typeof a == "string"
				&& a || JSON.stringify(a));
		}
		CT.log(pieces.join(" "));
	},

	// override
	"update": function() {},
	"leave": function() {},
	"join": function() {}
});