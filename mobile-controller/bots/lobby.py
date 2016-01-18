import json
from cantools import pubsub
from cantools.util import log

class Lobby(pubsub.Bot):
	def __init__(self, server, channel, name="Concierge"): # only one Concierge..
		pubsub.Bot.__init__(self, server, channel, name)
		self.seeks = {}
		self.games = {}

	def on_publish(self, data):
		log("Concierge received publish: %s"%(json.dumps(data),))

	def on_subscribe(self, data):
		log("Concierge received subscribe: %s"%(json.dumps(data),))
		self.server.pm({
			"user": data["user"],
			"message": {
				"type": "list",
				"data": self.games.keys()
			}
		}, self)

	def on_unsubscribe(self, data):
		log("Concierge received unsubscribe: %s"%(json.dumps(data),))

	def on_pm(self, data):
		log("Concierge received private message: %s"%(json.dumps(data),))
