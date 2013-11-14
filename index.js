var request = require('request-json'),
    config = require('./config.js'),
    local = request.newClient(config.couchdb.uri),
    remote = request.newClient(config.couchdb.replicate["source"]),
    frequency = config.sizeFrequencyInSeconds,
    followup = config.followupFrequencyInHours;

function getLocalDiskSize(cb){
  local.get('/registry', function(e,r,b) { cb(b.disk_size) })
}

function getRemoteDiskSize(cb){
  remote.get('', function(e,r,b) { cb(b.disk_size) })
}

function main() {
  getLocalDiskSize(function(lastDiskSize) {
    console.log("Current disk size is "+lastDiskSize);
    console.log("Checking every "+frequency+" seconds");
    var checkInterval = setInterval(function() {
      getLocalDiskSize(function(currentSize) {
        if (currentSize === lastDiskSize) {
          // Replication has either completed or has stalled
          // Check target to know if it's a stall or completion
          getRemoteDiskSize(function(targetSize) {
            console.log("Remote disk size is "+targetSize);
            if (currentSize === targetSize) {
              console.log("Database is fully replicated.");
              console.log("Following up in "+followup+" hours.");
              clearInterval(checkInterval);
              setTimeout(main, followup*3600000);
            } else {
              triggerReplication()
            }
          })
        }
        lastDiskSize = currentSize;
      })
    }, frequency*1000);
  })
}

main();
