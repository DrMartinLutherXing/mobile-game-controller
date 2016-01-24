core.Chat = CT.Class({
	"init": function(name) {
		this.name = name;
		this.out = CT.dom.node();
		this.in = CT.dom.smartField(this.say, "fullwidth");
		this.node = CT.dom.wrapped([
			this.out,
			this.in
		], "div", "chat");
	},
	"say": function(message) {
		core.ui.actor.say(this.name, message);
		this.in.value = "";
	},
	"update": function(data) {
		if (data.user == "Concierge") return; // for now ;)
		this.out.appendChild(CT.dom.node("<b>" + data.user + "</b>: " + data.message));
		this.out.scrollTop = this.out.scrollHeight;
	}
});