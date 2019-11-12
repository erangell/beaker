import * as beakerCore from '@beaker/core'
//import { app } from 'electron'
import ms from 'ms'
import natUpnp from 'nat-upnp'
import {DAT_SWARM_PORT} from '@beaker/core/lib/const'

// exported methods
// =

export function setup () {
  setTimeout(openPort, ms('3s'))
}

export function closePort () {
  var client = natUpnp.createClient()
  client.portUnmapping({public: DAT_SWARM_PORT})
}

// internal methods
// =

async function openPort () {
  var opts = {
    public: DAT_SWARM_PORT,
    private: DAT_SWARM_PORT,
    ttl: 1800  // 30 min
  }

  var client = natUpnp.createClient()
  client.portMapping(opts, async (err) => {
    if (!err) {
      // schedule reopening the port every 30 minutes
      var to = setTimeout(openPort, ms('30m'))
      to.unref()
    } else {
      console.log(err)
      // assuming errorCode 725 OnlyPermanentLeasesSupported and retry without a TTL
      opts.ttl = '0'  // string not int
      client.portMapping(opts)
    }
  })
}
