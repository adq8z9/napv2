function updateStatus2() {
  console.log("updateStatus2 called.");
  let liLedgerEventString = localStorage.getItem("liLedgerEvent");
  console.log("Loaded Ledger Event data: ");
  console.log(liLedgerEventString);
  if (liLedgerEventString) {
    let liLedgerEvent = JSON.parse(liLedgerEventString);
    console.log(liLedgerEvent);
    fetchReports(liLedgerEvent);
  } else {
    console.log("No Ledger Event data found.");
  }
}

async function fetchReports(ledgerEv) {
  console.log("fetchReports called.");
  /*let naddr = getAccountingLedgerNaddr(ledgerEv);
  allReports = [
    {
      id: 'r1a2b3c4d5e6f7a8',
      pubkey: 'npub1abc123def456abc123def456abc123def456abc123def456abc123def456',
      created_at: ts('2025-04-01'),
      tags: [
        ['name', 'Q1 2025 Summary'],
        ['description', 'Quarterly income and expense overview'],
        ['A', naddr],
        ['L', 'nostr.leaccountingnip'],
        ['l', 'report', 'nostr.leaccountingnip'],
        ['IMETA', 'url https://example.com/reports/q1-2025.pdf mime application/pdf hash abc123'],
        ['x', 'def456abc789', 'data'],
      ],
      content: '{}',
    },
    {
      id: 'r2b3c4d5e6f7a8b9',
      pubkey: 'npub1abc123def456abc123def456abc123def456abc123def456abc123def456',
      created_at: ts('2025-03-01'),
      tags: [
        ['name', 'February Statement'],
        ['description', 'February income and expenses'],
        ['A', naddr],
        ['L', 'nostr.leaccountingnip'],
        ['l', 'report', 'nostr.leaccountingnip'],
        ['E', 'abc123def456abc123', 'report'],
        ['e', 'def456abc789def456', 'data'],
      ],
      content: '{}',
    },
    {
      id: 'r3c4d5e6f7a8b9c0',
      pubkey: 'npub1def456abc789def456abc789def456abc789def456abc789def456abc789',
      created_at: ts('2025-02-01'),
      tags: [
        ['name', 'January Statement'],
        ['description', 'January income and expenses'],
        ['A', naddr],
        ['L', 'nostr.leaccountingnip'],
        ['l', 'report', 'nostr.leaccountingnip'],
      ],
      content: '{}',
    },
  ];*/

  let liKeypairString = localStorage.getItem("liKeypair");
  let liKeypair = JSON.parse(liKeypairString);
  try {
    allReports = await getReportEvent(ledgerEv, liKeypair.sk);
    console.log("Received entries: ");
    console.log(allReports);
    renderSelector();
  } catch(error) { throw error; }
}
