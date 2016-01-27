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
		core.actor.say(this.name, message);
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
		var data = d.message.data;
		if (d.message.action == "newgame")
			data = "<i>game added: " + d.message.data + "</i>";
		else if (d.message.action == "oldgame")
			data = "<i>game removed: " + d.message.data + "</i>";
		else if (d.message.action == "start")
			data = "<i>let the games begin!</i>";
		else if (d.message.action == "move")
			data = "<i>" + d.message.data + "</i>";
		else if (d.message.action == "turn")
			data = "<i>it's <b>" + d.message.data + "</b>'s turn</i>";
		else if (d.message.action == "deal")
			data = "<i>you get a <b>" + data.rank + "</b> of <b>" + data.suit + "</b>s</i>";
		this._write("<b>" + d.user + "</b>: " + data);
	}
});