CT.require("core.Chat");

core.UI = CT.Class({
	"init": function(obj, name) {
		this.name = name;
		this.view = CT.dom.node("", "div", "fullscreen");
		this.chat = new core.Chat(name);
		this.view.appendChild(this.chat.node);
	},
	"update": function() {} // override
});

core.ui = {
	"_ui": null,
	"view": null,
	"actor": null,
	"platform": CT.align.width() < 720 ? "Mobile" : "Display",
	"setView": function(view) {
		core.ui.view = view;
	},
	"setActor": function(a) {
		core.ui.actor = a;
	},
	"update": function(d) {
		if (d.message.action == "chat")
			core.ui._ui.chat.update(d);
		else
			core.ui._ui.update(d);
	},
	"load": function(gamename, obj) {
		var is_lobby = gamename == "lobby",
			pf = core.ui.platform,
			req_base = is_lobby ? "lobby" : ("games." + gamename);
		core.ui.view.innerHTML = "";
		CT.require(req_base + ".ui." + pf, true);
		core.ui._ui = new (is_lobby ? lobby
			: games[gamename]).ui[pf](obj, gamename);
		core.ui.view.appendChild(core.ui._ui.view);
	}
};
