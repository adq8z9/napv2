function downloadLedgerEventJSON() {
  console.log("downloadLedgerEventJSON called.");
  try {
    let ledgerEventString = localStorage.getItem("liLedgerEvent");
    let ledgerEvent = JSON.parse(ledgerEventString);
    let ledgerEventContent = JSON.parse(ledgerEvent.content);
    ledgerEvent.content = ledgerEventContent;
    console.log("Downloaded Event Data: ");
    console.log(ledgerEvent);
    //const json = JSON.stringify(ledgerEvent, ["tags", "content"], 2);
    const json = JSON.stringify(ledgerEvent, (key, val) => {
      if (key === "" ) return { tags: val.tags, content: val.content }; // root object
      return val; // pass everything else through as-is
    }, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger-event-${ledgerEvent.id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url); // clean up
  } catch (error) {
    alert("Error downloading file: " + error);
  }
}

function uploadLedgerEventJSON() {
  console.log("uploadLedgerEventJSON called.");
  try {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          console.log(e.target.result);
          const event = JSON.parse(e.target.result);
          localStorage.setItem("updatedLedgerEventTemp", e.target.result);
          console.log("Saved updated Ledger Event:");
          console.log(event);
          document.getElementById("file-upload-feedback").textContent = "Updated ledger file uploaded.";
        } catch (err) {
          alert('Invalid JSON:', err);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  } catch (error) {
    alert("Error uploading file: " + error); return;
  }
}

async function publishLedger() {
  console.log("publishLedger called.");
  let naddrPublish = "";
  let liKeypairString = localStorage.getItem("liKeypair");
  if(liKeypairString !== null) {
    try {
      let liKeypair = JSON.parse(liKeypairString);
      let updatedLedgerDataString = localStorage.getItem("updatedLedgerEventTemp");
      if (!updatedLedgerDataString) { alert("No updated Ledger Event uploaded."); return; }
      let updatedLedgerData = JSON.parse(updatedLedgerDataString);
      let updatedLedgerEvent = NostrTools.finalizeEvent({
        kind: 37701,
        created_at: Math.floor(Date.now() / 1000),
        tags: updatedLedgerData.tags,
        content: JSON.stringify(updatedLedgerData.content),
      }, liKeypair.sk);
      console.log("Created updated Ledger Event: ");
      console.log(updatedLedgerEvent);
      let creationRelays = getAccountingLedgerRelays(updatedLedgerEvent);
      console.log("Creation Relays: " + creationRelays);
      let ledgerEventCreated = updatedLedgerEvent;
      let nAddrC = getAccountingLedgerNaddr(ledgerEventCreated);
      naddrPublish = nAddrC;
      let nAddrCShort = nAddrC.slice(0,8) + "..." + nAddrC.slice(-8);
      console.log("Naddr example ledger Event: " + nAddrC);
      console.log("Naddr short: " + nAddrCShort);
      let ledgerEvent = await sendLedgerEvent(ledgerEventCreated, liKeypair.sk, creationRelays);
      console.log("Received ledger event: ");
      console.log(ledgerEvent);
      ledgerEventContent = JSON.parse(ledgerEvent.content);
      console.log(ledgerEventContent);
      //Begin set accountant name
      console.log("Try set accountant name: ");
      let accountantName = "";
      let accountantEv = JSON.parse(liKeypairString);
      console.log(accountantEv);
      let accountant = getAccountantByPubkey(accountantEv.pk, ledgerEvent);
      if (accountant) {accountantName = accountant.name;} else {}
      accountantEv.accountantName = accountantName;
      accountantEvString = JSON.stringify(accountantEv);
      localStorage.setItem("liKeypair", accountantEvString);
      console.log("Got accountant name: " + accountantName);
      //End set accountant name
      let liLedger = { naddr: nAddrC, id: ledgerEvent.id, naddrShort: nAddrCShort, ledgerName: ledgerEventContent.name };
      let liLedgerEvent = ledgerEvent;
      let liLedgerString = JSON.stringify(liLedger);
      let liLedgerEventString = JSON.stringify(liLedgerEvent);
      console.log("Saved ledger Event data: ");
      console.log(liLedger);
      console.log(liLedgerString);
      console.log(liLedgerEvent);
      console.log(liLedgerEventString);
      localStorage.setItem("liLedger", liLedgerString);
      localStorage.setItem("liLedgerEvent", liLedgerEventString);
      console.log("Ledger saved.");
      console.log("Successfully updated ledger naddr.");
    } catch (error) {
      alert('Error publishing updated ledger event: ' + error); return;
    }
  } else {
    alert('First log in a npub/nsec, before updating a ledger event.'); return;
  }
  const el = document.getElementById('publishOk');
  el.textContent = 'Updated ledger succesfully published. New naddr: ' + naddrPublish + ' - Save e.g. in a password manager, if you want to reuse.';
  el.classList.add('show');
  el.scrollIntoView({ behavior:'smooth', block:'nearest' });
}
