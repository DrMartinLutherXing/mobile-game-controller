import json
from cantools import pubsub
from cantools.util import log

class Billy(pubsub.Bot):
	def on_publish(self, data):
		log("Billy received publish: %s"%(json.dumps(data),))

	def on_subscribe(self, data):
		log("Billy received subscribe: %s"%(json.dumps(data),))