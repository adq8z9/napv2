function loginWithNsec() {
  console.log("loginWithNsec called.");
  const val = document.getElementById('nsecInput').value.trim();
  console.log("Input nsec: " + val);
  if (!val.startsWith('nsec1')) { alert('Enter a valid nsec1… key'); return; }
  try {
    loginWithNsecBack(val);
  } catch(error) {
    alert(error);
  }
  updateStatus();
  updateStatus2();
  showOk('Logged in.');
 }
 
 function generateAndLogin() {
  let pkT = "";
  try {
    let skDec = NostrTools.generateSecretKey();
    let skHex = NostrTools.utils.bytesToHex(skDec);
    let sk = NostrTools.nip19.nsecEncode(skDec);
    console.log("created nsec in Dec, hex, bech32: ");
    console.log(skDec);
    console.log(skHex);
    console.log(sk);
    loginWithNsecBack(sk);
    let liDataString = localStorage.getItem("liKeypair");
    let liData = JSON.parse(liDataString);
    pkT = liData.npub
  } catch (error) {
    alert(error); 
  }
  updateStatus();
  updateStatus2();
  showOk('Example account created and logged in: ' + pkT + ' -- save the nsec from below if you want to reuse account.');
}
 
function loginWithNsecBack(secK) {
  console.log("loginWithNsec background called.");
  console.log("Input nsec: " + secK);
  if (!secK.startsWith('nsec1')) { throw 'Enter a valid nsec1… key'; }
  try {
    let sk = secK;
    let skDec = NostrTools.nip19.decode(sk);
    let skHex = NostrTools.utils.bytesToHex(skDec.data);
    console.log("nsec decoded and hex: ");
    console.log(skDec);
    console.log(skHex);
    let pkHex = NostrTools.getPublicKey(skDec.data);
    let pk = NostrTools.nip19.npubEncode(pkHex);
    let pkShort = pk.slice(0,8) + "..." + pk.slice(-8);
    console.log("npub hex, bech32 and short: ");
    console.log(pkHex);
    console.log(pk);
    console.log(pkShort);
    //Begin set accountant name
    console.log("Try set accountant name.");
    let accountantName = "";
    const ledgerEvent = localStorage.getItem("liLedgerEvent");
    if (ledgerEvent) {
      let ledgerEventObj = JSON.parse(ledgerEvent);
      let accountant = getAccountantByPubkey(pkHex, ledgerEventObj);
      if (accountant != null) { accountantName = accountant.name; }
      console.log("Got accountant name: " + accountantName);
    } else {}
    console.log("Set accountant name: " + accountantName);
    //End set accountant name
    let keypair = { pk: pkHex, sk: skHex, npub: pk, npubShort: pkShort, nsec: sk, accountantName: accountantName };
    let keypairString = JSON.stringify(keypair);
    localStorage.setItem("liKeypair", keypairString); 
    console.log("Saved keypair: ");
    console.log(keypair);
    console.log(keypairString);
    console.log("Keypair saved.");
    console.log("Successfull log in.");
  } catch (error) {
    throw ("Error login nsec1… key: " + error);
  }
}
