import json
from cantools import pubsub
from cantools.util import log

class Lobby(pubsub.Bot):
	def __init__(self, server, channel, name="Concierge"): # only one Concierge..
		pubsub.Bot.__init__(self, server, channel, name)
		self.games = {}
		self.counter = 0

	def pub(self, message):
		self.server.publish({
			"message": message,
			"channel": "lobby"
		}, self)

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
		usplit = user.split("_")
		message = obj["message"]
		action = message["action"]
		data = message["data"]
		if usplit[0] == "host":
			if action == "create":
				gname = "%s_%s_%s"%(data, usplit[1], self.counter)
				self.counter += 1
				if data not in self.games:
					self.games[data] = []
				self.games[data].append(gname)
				self.server.subscribe(gname, self.server.client(user))
				self.pub({
					"action": "newgame",
					"data": gname
				})
			elif action == "start":
				gtype = data.split("_")[0]
				if gtype in self.games:
					if data in self.games[gtype]:
						self.games[gtype].remove(data)
						self.pub({
							"action": "oldgame",
							"data": data
						})
		else: # player
			pass