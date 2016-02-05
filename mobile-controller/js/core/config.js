core.config = {
	"botheads": false,
	"timeout": 30,
	"log": {
		"include": [],
		"exclude": []
	},
	"ws": {
		"host": "localhost",
		"port": 8888,
		"reconnect": false
	}
};

CT.log.grep(core.config.log.include, core.config.log.exclude);