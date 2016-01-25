CT.require("CT.all");
CT.require("core.ui");
CT.require("games.game");

onload = function() {
	var agents = { "Mobile": "Player", "Display": "Host" },
		aname = agents[core.ui.platform],
		gamename = "holdem";

	core.ui.setView(document.getElementById("view"));
	CT.require("agent." + aname, true);
	actor = new agent[aname]();
};
