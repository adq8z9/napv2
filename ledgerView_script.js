function updateStatus2() {
  console.log("updateStatus2 called.");
  let liLedgerEventString = localStorage.getItem("liLedgerEvent");
  console.log("Loaded Ledger Event data: ");
  console.log(liLedgerEventString);
  if (liLedgerEventString) {
    let liLedgerEvent = JSON.parse(liLedgerEventString);
    console.log(liLedgerEvent);
    loadLedger(liLedgerEvent);
  } else {
    console.log("No Ledger Event data found.");
  }
}

function loadLedger(ledgerEv) {
  console.log("loadLedger called.");
  renderLedger(ledgerEv);
}
