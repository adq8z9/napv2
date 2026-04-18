function loginWithNsec() {
  const val = document.getElementById('nsecInput').value.trim();
  console.log(val);
  if (!val.startsWith('nsec1')) { alert('Enter a valid nsec1… key'); return; }
  try {
    let sk = val;
    let skDec = NostrTools.nip19.decode(val);
    let skHex = NostrTools.utils.bytesToHex(skDec.data);
    console.log(skDec);
    console.log(skHex);
    console.log(sk);
    let pkHex = NostrTools.getPublicKey(skDec.data);
    let pk = NostrTools.nip19.npubEncode(pkHex);
    let pkShort = pk.slice(0,8) + "..." + pk.slice(-8);
    console.log(pkHex);
    console.log(pk);
    console.log(pkShort);
    let keypair = { pk: pkHex, sk: skHex, npub: pk, npubShort: pkShort, nsec: sk };
    let keypairString = JSON.stringify(keypair);
    localStorage.setItem("liKeypair", keypairString); 
    console.log("Keypair saved.");
    console.log("Successfull log in.");
  } catch (error) {
    alert('Enter a valid nsec1… key: ' + error); return;
  }
  updateStatus();
  showOk('Logged in.');
}

function generateAndLogin() {
  let pkT = "";
  try {
    let skDec = NostrTools.generateSecretKey();
    let skHex = NostrTools.utils.bytesToHex(skDec);
    let sk = NostrTools.nip19.nsecEncode(skDec);
    console.log(skDec);
    console.log(skHex);
    console.log(sk);
    let pkHex = NostrTools.getPublicKey(skDec);
    let pk = NostrTools.nip19.npubEncode(pkHex);
    let pkShort = pk.slice(0,8) + "..." + pk.slice(-8);
    pkT = pk;
    console.log(pkHex);
    console.log(pk);
    console.log(pkShort);
    let keypair = { pk: pkHex, sk: skHex, npub: pk, npubShort: pkShort, nsec: sk };
    let keypairString = JSON.stringify(keypair);
    localStorage.setItem("liKeypair", keypairString); 
    console.log("Keypair saved.");
    console.log("Successfull key generation and log in.");
  } catch (error) {
    alert('Error creating nsec1… key: ' + error); return;
  }
  updateStatus();
  showOk('Example account created and logged in: ' + pkT + ' -- save the nsec from below if you want to reuse account.');
}
