import json
from cantools import pubsub
from cantools.util import log

class Lobby(pubsub.Bot):
	def __init__(self, server, channel, name="Concierge"): # only one Concierge..
		pubsub.Bot.__init__(self, server, channel, name)
		self.games = {}
		self.counter = 0

	def on_publish(self, data):
		log("Concierge received publish: %s"%(json.dumps(data),))

	def on_subscribe(self, data):
		log("Concierge received subscribe: %s"%(json.dumps(data),))
		self.server.pm({
			"user": data["user"],
			"message": {
				"action": "list",
				"data": self.games
			}
		}, self)

	def on_unsubscribe(self, data):
		log("Concierge received unsubscribe: %s"%(json.dumps(data),))

	def on_pm(self, obj):
		log("Concierge received private message: %s"%(json.dumps(obj),))
		user = obj["user"]
		message = obj["message"]
		action = message["action"]
		data = message["data"]
		if action == "create":
			gname = "%s_%s_%s"%(data, user, self.counter)
			self.counter += 1
			if data not in self.games:
				self.games[data] = set()
			self.games[data].add(gname)
			self.server.subscribe(gname, self.server.client(user))
		elif action == "start":
			gtype = data.split("_")[0]
			if gtype in self.games:
				if data in self.games[gtype]:
					self.games[gtype].remove(data)
