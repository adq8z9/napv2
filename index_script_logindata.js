function updateStatus() {
  console.log("updateStatus called.");
  try {
    const loginDataString = localStorage.getItem("liKeypair");
    const loginData = JSON.parse(loginDataString);
    const ledgerDataString = localStorage.getItem("liLedger");
    const ledgerData = JSON.parse(ledgerDataString);
    const aVal = document.getElementById('accountantVal');
    const aDot = document.getElementById('accountantDot');
    if (loginData) {
      console.log("loginData found.");
      if (loginData.accountantName != "") {
        aVal.textContent = loginData.npubShort + " (" + loginData.accountantName + ")";
      } else {
        aVal.textContent = loginData.npubShort;
      }
      aVal.classList.add('active');
      aDot.classList.add('on');
    } else {
      console.log("No loginData found.");
      aVal.textContent = 'not logged in';
      aVal.classList.remove('active');
      aDot.classList.remove('on');
    }
    const lVal = document.getElementById('ledgerVal');
    const lDot = document.getElementById('ledgerDot');
    if (ledgerData) {
      console.log("LedgerData found.");
      lVal.textContent = ledgerData.naddrShort + " (" + ledgerData.ledgerName + ")";
      lVal.classList.add('active');
      lDot.classList.add('on');
    } else {
      console.log("No LedgerData found.");
      lVal.textContent = 'not selected';
      lVal.classList.remove('active');
      lDot.classList.remove('on');
    }
  } catch(e) {}
}
