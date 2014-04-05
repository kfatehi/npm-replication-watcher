# npm-replication-watcher

## deprecation notice:

don't bother running a couchdb instance, instead use this project: https://github.com/rlidwka/sinopia 

---

This package provides a binary `npm-replication-watcher` that observes your local couchdb instance
while it replicates the official npm repository. It reports your transfer rate but if it detects
a stall (transfer rate is 0 in essence), it will take appropriate action
(determine if we are done, or if we should tell couchdb to keep
replicating).

It is a bit unfortunate that I had to create this, but couchdb would
just stop replicating for me often only after transferring 5-7 GB of
data -- a trivial retrigger of the replication would pick up where it
left off, hence this script.

# Usage

Take a look at the config.js that ships with this package, edit if
necessary. You can look at index.js too -- it's very short.

Ensure that you've already begun replication and then just execute
`npm-replication-watcher` -- it may start replication for you if you
have not already started it yourself... then just leave it running.

I recommend using `forever` to run this program but this is left up to
you as forever has a lot of dependencies and should be installed
globally as opposed to being bundled with this package.
