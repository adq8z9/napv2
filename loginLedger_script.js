async function selectLedger() {
  console.log("selectLedger called.");
  const val = document.getElementById('naddrInput').value.trim();
  console.log("Input naddr: " + val);
  if (!val.startsWith('naddr1')) { alert('Enter a valid naddr1… address'); return; }
  let liKeypairString = localStorage.getItem("liKeypair");
  if(liKeypairString !== null) {
    try {
      let liKeypair = JSON.parse(liKeypairString);
      let nAddrLedger = val;
      let nAddrLedgerDec = NostrTools.nip19.decode(nAddrLedger);
      let nAddrLedgerShort = nAddrLedger.slice(0,8) + "..." + nAddrLedger.slice(-8);
      console.log("Naddr decoded and shortened: ");
      console.log(nAddrLedgerDec);
      console.log(nAddrLedgerShort);
      let ledgerEvent = await getLedgerEvent(nAddrLedgerDec, liKeypair.sk);
      console.log("Event received: ");
      console.log(ledgerEvent);
      let ledgerEventContent = JSON.parse(ledgerEvent.content);
      console.log("Event content: ");
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
      let liLedger = { naddr: nAddrLedger, id: ledgerEvent.id, naddrShort: nAddrLedgerShort, ledgerName: ledgerEventContent.name};
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
      console.log("Successfully selected ledger naddr.");
    } catch (error) {
      alert('Error loading naddr1… address ' + error); return;
    }
  } else {
    alert('First log in a npub/nsec, before selecting a ledger event.'); return;
  }
  updateStatus();
  updateStatus2();
  showOk('Ledger selected.');
}

async function createExampleLedger() {
  let liKeypairString = localStorage.getItem("liKeypair");
  if(liKeypairString !== null) {
    try {
      //let creationRelay = "ws://umbrel.local:4848";
      let creationRelay = "wss://nos.lol";
      let creationRelays = [ creationRelay ];
      console.log("Creation Relay: " + creationRelays);
      let liKeypair = JSON.parse(liKeypairString);
      let ledgerEventCreated = createExampleLedgerEvent(creationRelays, liKeypair.pk, liKeypair.sk);
      console.log("Example Ledger Event: " + ledgerEventCreated);
      let nAddrC = getAccountingLedgerNaddr(ledgerEventCreated);
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
      console.log("Successfully selected ledger naddr.");
    } catch (error) {
      alert('Error creating example ledger event: ' + error); return;
    }
  } else {
    alert('First log in a npub/nsec, before creating a ledger event.'); return;
  }
  updateStatus();
  updateStatus2();
  showOk('Ledger created and selected.');
}

function createExampleLedgerEvent(cRelays, cPk, cSk) {
  let exampleLedgerEvent = "";
  //Create example ledger
  const d = "spal";
  const relays = cRelays;
  const spalData = {
    tags: [
      ["d", d],
      ["L", "leaccountingnip"],
      ["l", "ledger", "leaccountingnip"],
      ["r", relays[0]],
      ["p", cPk]
    ], 
    content: {
      name: "Simple test ledger", 
      description: "This is a simple test ledger for testing 'le-accounting-nip'.",
      acc_units: ["sats"],
      acc_account_categories: [
        { id: "acc_ac_0", name: "Income" },
        { id: "acc_ac_1", name: "Expense" },
        { id: "acc_ac_2", name: "Asset" }
      ], 
      acc_accounts: [ 
        { id: "acc_a_0001", name: "Incoming Zaps", parent_id: ["acc_c_0"] },
        { id: "acc_a_0002", name: "Incoming Donations", parent_id: ["acc_c_0"] },
        { id: "acc_a_0003", name: "Sales", parent_id: ["acc_c_0"] },
        { id: "acc_a_0004", name: "Remuneration", parent_id: ["acc_c_0"] },
        { id: "acc_a_0005", name: "Own Deposit on Wallet", parent_id: ["acc_c_0"] },
        { id: "acc_a_1001", name: "Outgoing Zaps", parent_id: ["acc_c_1"] },
        { id: "acc_a_1002", name: "Outgoing Donations", parent_id: ["acc_c_1"] },
        { id: "acc_a_1003", name: "Purchases", parent_id: ["acc_c_1"] },
        { id: "acc_a_1004", name: "Payments", parent_id: ["acc_c_1"] },
        { id: "acc_a_1005", name: "Own Withdrawal from Wallet", parent_id: ["acc_c_1"] },
        { id: "acc_a_2001", name: "Wallet Balance", parent_id: ["acc_c_2"] }
      ],
      acc_mvt_type_categories: [
        {id: "acc_mc_0", name: "Ledger movements" }
      ],
      acc_mvt_types: [
        { id: "acc_m_0", name: "Income", parent_id:["acc_mc_0"] },
        { id: "acc_m_1", name: "Expense", parent_id:["acc_mc_0"] }
      ],
      acc_partner_categories: [
        { id: "acc_pc_0", name:"Example partner category" }
      ],
      acc_partners: [
        { id: "acc_p_0", name: "xyz" }
      ],
      acc_accountant_categories: [
        { id: "acc_ac_0", name: "admin" }
      ],
      acc_accountants: [
        { id: "acc_a_0", name: "Le me", parent_id: ["acc_ac_0"], pubkey: [cPk] }
      ],
      acc_rule_categories: [
        { id: "acc_cc_0", name: "Example rule category" }
      ],
      acc_rules:[
        { id: "acc_c_0", name: "admin is allowed to book everything.", parent_id:["acc_cc_0"], "rule":["admin:all"]}
      ]
    }  
  };
  let spal = NostrTools.finalizeEvent({
    kind: 37701,
    created_at: Math.floor(Date.now() / 1000),
    tags: spalData.tags,
    content: JSON.stringify(spalData.content),
  }, cSk);
  console.log(spal);
  exampleLedgerEvent = spal;
  return exampleLedgerEvent;
}
