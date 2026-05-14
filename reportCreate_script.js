function updateStatus2() {
  console.log("updateStatus2 called.");
  let liLedgerEventString = localStorage.getItem("liLedgerEvent");
  console.log("Loaded Ledger Event data: ");
  console.log(liLedgerEventString);
  let liEntryEventsString = localStorage.getItem("liEntryEvents");
  console.log("Loaded Entry Events data: ");
  console.log(liEntryEventsString);
  if (liLedgerEventString) {
    let liLedgerEvent = JSON.parse(liLedgerEventString);
    console.log(liLedgerEvent);
    let liEntryEvents = [];
    if (liEntryEventsString) {
      liEntryEvents = JSON.parse(liEntryEventsString);
      console.log(liEntryEvents);
    }
    loadData(liLedgerEvent, liEntryEvents);
  } else {
    console.log("No Ledger Event data found.");
  }
}

async function publishReport() {
  const nameR    = document.getElementById('repName')?.value.trim()  || '';
  const descR    = document.getElementById('repDesc')?.value.trim()  || '';
  let liLedgerString = localStorage.getItem("liLedger");
  let liLedger = JSON.parse(liLedgerString);
  const ledgerRef  = liLedger.reference || '';
  const from    = document.getElementById('dateFrom')?.value || '';
  const to      = document.getElementById('dateTo')?.value   || '';
  let fromUn = Math.floor(new Date(from).getTime()/1000);
  let toUn = Math.floor(new Date(to).getTime()/1000)
  const reportEvents = filteredEntries.map(n => n.id); 

  if (!nameR) { alert('Enter a report name'); return; }

  const now = Math.floor(Date.now()/1000);

  // Build kind 7702 event template
  const eventTemplate = {
    kind: 7702,
    created_at: now,
    tags: [
      ['A', ledgerRef],
      ['L', 'leaccountingnip'],
      ['l', 'report', 'leaccountingnip'],
      // optional: add ['IMETA', ...] or ['E', ..., 'report'] for file attachment
      // optional: add ['x', ..., 'data'] or ['e', ..., 'data'] for data backup refs
    ],
    content: JSON.stringify({
      name: nameR,
      description: descR,
      ledger: ledgerRef,
      parameter: JSON.stringify( [ { created_at: fromUn }, { created_at: toUn } ] ),
      events: reportEvents
    }),
  };
  console.log('Would publish kind 7702:', eventTemplate);
  
  let liKeypairString = localStorage.getItem("liKeypair");
  if(liKeypairString !== null) {
    try {
      let liKeypair = JSON.parse(liKeypairString);
      let reportEvent = NostrTools.finalizeEvent({
        kind: 7702,
        created_at: eventTemplate.created_at,
        tags: eventTemplate.tags,
        content: eventTemplate.content,
      }, liKeypair.sk);
      console.log("Created report event: ");
      console.log(reportEvent);
      let liLedgerEventString = localStorage.getItem("liLedgerEvent");
      let liLedgerEvent = JSON.parse(liLedgerEventString);
      let publishRelays = getAccountingLedgerRelays(liLedgerEvent);
      console.log("Publish Relays: " + publishRelays);
      let reportEventPublished = await sendReportEvent(reportEvent, liKeypair.sk, publishRelays);
      console.log("Received report event: ");
      console.log(reportEventPublished);
      console.log("Successfully published report event.");
    } catch (error) {
      alert('Error publishing report event: ' + error); return;
    }
  } else {
    alert('First log in a npub/nsec, before publishing a report event.'); return;
  }
  const el = document.getElementById('publishOk');
  el.textContent = 'Report event published succesfully.';
  el.classList.add('show');
  el.scrollIntoView({ behavior:'smooth', block:'nearest' });
}
