module.exports = {
  couchdb: {
    uri: "http://127.0.0.1:5984",
    replicate: {
      "source":"http://isaacs.iriscouch.com/registry/",
      "target":"registry",
      "continuous":true,
      "create_target":true
    }
  },
  sizeFrequencyInSeconds: 1,
  followupFrequencyInHours: 24,
}
