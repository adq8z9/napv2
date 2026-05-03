async function getLedgerEvent(naddrLedger, secK) {
  console.log("getLedgerEvent called.");
  const pool = new NostrTools.SimplePool();
  const relays = naddrLedger.data.relays;
  console.log("Naddr relays: " + relays);
  function authF(eventA) {
    console.log("Relay authentication.");
    return NostrTools.finalizeEvent(eventA, secK);
  }
  console.log("Try get event.");
  const event = await pool.get(
    relays,
    {
      kinds: [37701],
      '#d': [naddrLedger.data.identifier],
      authors: [naddrLedger.data.pubkey]
    },
    { onauth : authF }
  );
  console.log('Event from Relay: ', event);
  if (event == null) { 
    throw "Event not found on relay."; 
  } else if (!NostrTools.verifyEvent(event)) {
    throw "Not valid event received from relay.";
  } else if (event.kind != 37701 || event.pubkey != naddrLedger.data.pubkey || getAccountingLedgerIdentifier(event) != naddrLedger.data.identifier) {
    throw "Not correct event received from relay.";
  } else {
    return event; 
  }
}

async function sendLedgerEvent(ledgerEvent, secK, relays) {
  const pool = new NostrTools.SimplePool();
  console.log("Send Ledger event.");
  console.log("Send relays: " + relays);
  function authF(eventA) {
    console.log("Relay authentication.");
    return NostrTools.finalizeEvent(eventA, secK);
  }
  await Promise.any(pool.publish(relays, ledgerEvent, { onauth : authF }));
  await delay(1);
  const event = await pool.get(
    relays,
    {
      ids: [ ledgerEvent.id ],
    },
    { onauth : authF }
  );
  console.log('Event sent from Relay: ', event);
  if(event == null) { 
    throw "Error when saving on relay!"; 
  } else if (!NostrTools.verifyEvent(event)) {
    throw "Not valid event received from relay after saving.";
  } else if (event.id != ledgerEvent.id) {
    throw "Not correct event received from relay after saving.";
  } else {
    return event;
  }
}

async function getNwcInfoEvent(nwcConnection) {
  const pool = new NostrTools.SimplePool();
  const relays = [ nwcConnection.relay ];
  console.log("Get nwc info event.");
  console.log("NWC request relays: " + relays);
  function authF(eventA) {
    console.log("Relay authentication.");
    return NostrTools.finalizeEvent(eventA, nwcConnection.secret);
  }
  const event = await pool.get(
    relays,
    {
      kinds: [13194],
      authors: [nwcConnection.pubkey]
    },
    { onauth : authF }
  );
  console.log('Event from Relay: ', event);
  if (event == null) { 
    throw "Event not found on relay."; 
  } else if (!NostrTools.verifyEvent(event)) {
    throw "Not valid event received from relay.";
  } else if (event.kind != 13194 || event.pubkey != nwcConnection.pubkey) {
    throw "Not correct event received from relay.";
  } else {
    return event; 
  }
}

async function requestNwcEvent(nwcRequestEv, nwcConnection) {
  const pool = new NostrTools.SimplePool();
  const relays = [ nwcConnection.relay ];
  console.log("Send nwc request event.");
  console.log("NWC request relays: " + relays);
  function authF(eventA) {
    console.log("Relay authentication.");
    return NostrTools.finalizeEvent(eventA, nwcConnection.secret);
  }
  await Promise.any(pool.publish(relays, nwcRequestEv, { onauth : authF }));
  /*const requEvent = await pool.get(
    relays,
    {
      ids: [nwcRequestEv.id],
      authors: [nwcRequestEv.pubkey],
      kinds: [13194]
    },
  );
  console.log('Request-Event from Relay: ', requEvent);*/
  /*console.log("Before delay");
  await delay(10);
  console.log("After delay");*/
  console.log("Receive nwc response event.");
  let respEvent = null; 
  await pool.subscribe(
    relays,
    {
      '#p': [nwcRequestEv.pubkey],
      '#e': [nwcRequestEv.id],
    },
    {
    onevent(event) {
      console.log('got event:', event);
      respEvent = event;
    }
    }
  );
  console.log("Before delay");
  await delay(10);
  console.log("After delay");
  let respEvent2 = await pool.get(
    relays,
    {
      '#p': [nwcRequestEv.pubkey],
      '#e': [nwcRequestEv.id],
    },
    { onauth : authF }
  );
  console.log("RespEvent2: " + respEvent2);
  if(respEvent2 != null) { respEvent = respEvent2; }
  console.log('Response-Event from Relay: ', respEvent);
  if(respEvent == null) { 
    throw "Error getting response from relay!"; 
  } else if (!NostrTools.verifyEvent(respEvent)) {
    throw "Not valid event received from relay.";
  } else {
    return respEvent;
  }
}

async function sendLedgerEntryEvent(leEvent, secK, relays) {
  const pool = new NostrTools.SimplePool();
  console.log("Send Ledger Entry event.");
  function authF(eventA) {
    console.log("Relay authentication.");
    return NostrTools.finalizeEvent(eventA, secK);
  }
  await Promise.any(pool.publish(relays, leEvent, { onauth : authF }));
  const event = await pool.get(
    relays,
    {
      ids: [ leEvent.id ],
    },
  );
  console.log('Event from Relay: ', event);
  if(event == null) { 
    throw "Error when saving on relay!"; 
  } else {
    return event;
  }
}

async function getLedgerEntryEvent(ledgerEvent, secK) {
  const pool = new NostrTools.SimplePool();
  console.log("Get Ledger Entry events.");
  function authF(eventA) {
    console.log("Relay authentication.");
    return NostrTools.finalizeEvent(eventA, secK);
  }
  let relays = getAccountingLedgerRelays(ledgerEvent);
  console.log("Relays: " + relays);
  const ledgerCoordinate = "37701:" + ledgerEvent.pubkey + ":" + getAccountingLedgerIdentifier(ledgerEvent);
  console.log("A-filter: " + ledgerCoordinate);
  let entries = [];
  try {
    // kind 7701 events reference their ledger via an "A" tag
    console.log("Query sync.");
    entries = await pool.querySync(relays, {
      kinds: [7701],
      "#A": [ledgerCoordinate],
    });
    console.log("Received from relay: ");
    console.log(entries);
    return entries;
  } finally {
    pool.close(relays);
  }
  //await delay(2);
  /*await Promise.any(pool.publish(relays, leEvent, { onauth : authF }));
  const event = await pool.get(
    relays,
    {
      ids: [ leEvent.id ],
    },
  );
  console.log('Event from Relay: ', event);
  if(event == null) { 
    throw "Error when saving on relay!"; 
  } else {
    return event;
  }*/
}

function delay(n) {
  console.log("delay called.");
  return new Promise(function(resolve) {
    setTimeout(resolve, n * 1000);
  });
}
