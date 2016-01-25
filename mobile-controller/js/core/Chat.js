core.Chat = CT.Class({
	"init": function(name, data) {
		this._presence = CT.dom.node("", "div", "chat_presence");
		this._out = CT.dom.node("", "div", "chat_out");
		this._in = CT.dom.smartField(this.say, "fullwidth");
		this.name = name;
		this.presence = {};
		data.presence.forEach(this._adduser);
		this.button = CT.dom.button("show chat",
			this.toggle, "chat_button");
		this.node = CT.dom.wrapped([
			this._presence,
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
	"_write": function(msg) {
		this._out.appendChild(CT.dom.node(msg));
		this._out.scrollTop = this._out.scrollHeight;
	},
	"_adduser": function(user) {
		this.presence[user] = CT.dom.node(user);
		this._presence.appendChild(this.presence[user]);
	},
	"_deluser": function(user) {
		this._presence.removeChild(this.presence[user]);
		delete this.presence[user];
	},
	"leave": function(user) {
		this._write("<i><b>" + user + "</b> leaves the table</i>");
		this._deluser(user);
	},
	"join": function(user) {
		this._write("<i><b>" + user + "</b> joins the table</i>");
		this._adduser(user);
	},
	"update": function(d) {
		if (d.user == "Concierge") return; // for now ;)
		this._write("<b>" + d.user + "</b>: " + d.message.data);
	}
});