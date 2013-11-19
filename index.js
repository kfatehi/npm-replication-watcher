var request = require('request-json'),
    exec = require('child_process').exec,
    config = require(__dirname+'/config.js'),
    replicate = config.couchdb.replicate,
    local = request.newClient(config.couchdb.uri),
    remote = request.newClient(replicate["source"]),
    frequency = config.checkFrequencyInSeconds,
    followup = config.followupFrequencyInHours,
    waitTime = config.waitTimeAfterRetriggerInSeconds,
		restartCount = 0;

function crashRecovery() {
  console.log("CouchDB has crashed.");
  if (typeof(config.couchdb.restart) === "string")
    exec(config.couchdb.restart, function(err,stdout,stderr){
  		if (err !== null)
  			console.log("Could not restart couchdb with command "+config.couchdb.restart);
			else {
				console.log("Restarted CouchDB a total of "+(++restartCount)+" times");
			}
    });
  else
    console.log("Set a command on the key config.couchdb.restart if you'd like it autorestarted");
}

function getLocalDiskSize(cb){
  if (typeof(local) !== "undefined")
		local.get('/registry', function(e,r,b) { 
			if (e)
				crashRecovery();
		  else
				cb(b.disk_size);
		});
	else
		crashRecovery()
}

function getRemoteDiskSize(cb){
  remote.get('', function(e,r,b) { cb(b.disk_size) })
}

function retriggerReplication(cb) {
  local.post('/_replicate', replicate, function(e,r,b) {
    console.log("Retriggered replication");
  });
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
              console.log("Replication has stalled");
              clearInterval(checkInterval);
              retriggerReplication();
              setTimeout(main, waitTime*1000);
            }
          })
        } else {
          var diff = (currentSize - lastDiskSize) / 1024 / 1024;
          var rate = diff / frequency;
          console.log("Downloading at ~"+rate+" MB/s");
        }
        lastDiskSize = currentSize;
      })
    }, frequency*1000);
  })
}

module.exports = main;
