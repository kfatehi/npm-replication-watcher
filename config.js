module.exports = {
  couchdb: {
		restart: "systemctl start couchdb",
    uri: "http://127.0.0.1:5984",
    replicate: {
      "source":"http://isaacs.iriscouch.com/registry/",
      "target":"registry",
      "continuous":true,
      "create_target":true
    }
  },
  checkFrequencyInSeconds: 480,
  followupFrequencyInHours: 6,
  waitTimeAfterRetriggerInSeconds: 120
}
