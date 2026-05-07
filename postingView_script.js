async function getAllEntries(event) {
  console.log("getAllEntries called.");
  let liKeypairString = localStorage.getItem("liKeypair");
  let liKeypair = JSON.parse(liKeypairString);
  let ledgerEntries = []; 
  try {
    ledgerEntries = await getLedgerEntryEvent(event, liKeypair.sk);
    console.log("Received entries: ");
    console.log(ledgerEntries);
    let ledgerEntriesString = JSON.stringify(ledgerEntries);
    console.log(ledgerEntriesString);
    localStorage.setItem("liEntryEvents", ledgerEntriesString);
  } catch(error) { throw error; }
  return ledgerEntries;
}
