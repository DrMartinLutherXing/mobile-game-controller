core.Chat = CT.Class({
	"init": function(name) {
		this.name = name;
		this._out = CT.dom.node();
		this._in = CT.dom.smartField(this.say, "fullwidth");
		this.node = CT.dom.wrapped([
			this._out,
			this._in
		], "div", "chat");
	},
	"say": function(message) {
		core.ui.actor.say(this.name, message);
		this._in.value = "";
	},
	"update": function(data) {
		if (data.user == "Concierge") return; // for now ;)
		this._out.appendChild(CT.dom.node("<b>" + data.user + "</b>: " + data.message.data));
		this._out.scrollTop = this._out.scrollHeight;
	}
});