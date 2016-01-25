core.Chat = CT.Class({
	"init": function(name) {
		this.name = name;
		this._out = CT.dom.node();
		this._in = CT.dom.smartField(this.say, "fullwidth");
		this.button = CT.dom.button("show chat",
			this.toggle, "chat_button");
		this.node = CT.dom.wrapped([
			this._out,
			this._in
		], "div", "chat minimized");
	},
	"toggle": function() {
		if (this.button.innerHTML == "show chat")
			this.open();
		else
			this.close();
	},
	"open": function() {
		this.button.innerHTML = "hide chat";
		this.node.classList.remove("minimized");
		this._in.focus();
	},
	"close": function() {
		this.button.innerHTML = "show chat";
		this.node.classList.add("minimized");
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