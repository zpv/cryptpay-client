'use strict';

const login = require("facebook-chat-api");
const fs = require("fs");
const util = require('ethereumjs-util')
const request = require('request');
const moment = require('moment');
var readlineSync = require('readline-sync');
var player = require('play-sound')({})

const EthereumTx = require('ethereumjs-tx');
var Web3 = require('web3');
var web3 = new Web3();
web3.eth.setProvider(new web3.providers.HttpProvider('https://api.myetherapi.com/eth'))
const EthereumWallet = require('ethereumjs-wallet');
const CoinMarketCap = require('coinmarketcap-api');
const client = new CoinMarketCap();

// https://api.etherscan.io/api?module=proxy&action=eth_sendRawTransaction&hex=0xf904808000831cfde080&apikey=YourApiKeyToken

let start = moment();

console.log("/ | \\ CryptoPay Local Listener // | \\");

var username, password, privatekey

let pendingTransactions = {}
if (fs.existsSync('appstate.json')) {
    let appState = JSON.parse(fs.readFileSync('appstate.json', 'utf8'));
    username = appState.username
    password = appState.password
    privatekey = appState.privatekey
} else {
    username = readlineSync.question('Facebook Email: ');
    password = readlineSync.question('Facebook Password: ', {
        hideEchoBack: true // The typed text on screen is hidden by `*` (default). 
    });

    privatekey = readlineSync.question('ETH Private Key: ', {
        hideEchoBack: true // The typed text on screen is hidden by `*` (default). 
    });
}

const pk = Buffer.from(privatekey, 'hex');
const publickey = util.privateToAddress(pk)

function objToArray(obj){
    return Object.keys(obj).map((key) => {
        obj[key]['_key'] = key
        return obj[key]
    });
  }

// login({ appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8')) }, (err, api) => {
login({ email: username, password: password}, (err, api) => {
 
    if (err) {
        fs.unlinkSync('appstate.json')
        return console.error(err)
    };

    fs.writeFileSync('appstate.json', JSON.stringify({username: username, password: password, privatekey: privatekey}));

   api.setOptions({selfListen: true})

    api.listen((err, message) => {
        if (err) return console.error(err);

        message.body = message.body.toLowerCase();

        if(message.body == "/uptime") {
            let uptime = moment.duration(moment().diff(start));

            api.sendMessage(`[ *CryptPay* ] I have been alive for ${uptime.toISOString()}.`, message.threadID)
            return
        }

        if(message.body == "/balance" && message.senderID == api.getCurrentUserID()) {
            web3.eth.getBalance("0x" + publickey.toString('hex')).then((balance) => {
                client.getTicker({limit: 1, currency: 'Ethereum', convert: "CAD"}).then((obj) => {
                    // conversion rate for 1 CAD
                    // console.log(1/(obj[0].price_cad));
                    let ethBalance = web3.utils.fromWei(balance, "ether")
                    //facebook
                    let cadBalance = (obj[0].price_cad)*ethBalance
                    player.play('sounds/Complete.mp3')
                    api.sendMessage(`*[CryptPay]*\nYour wallet balance is CAD$${cadBalance.toFixed(2)} (${Number(ethBalance).toFixed(5)} ETH) `, message.threadID)
                })
                
            })
            return
        }

        if(message.body == "/confirm") {
            let transaction = pendingTransactions[message.senderID]
            if(!transaction) {
                console.log("not found")
                return
            }
            let dest = transaction["dest"]
            let total = transaction["amount"]

            let nonce = web3.eth.getTransactionCount("0x" + publickey.toString('hex'))
            let gasPrice = web3.eth.getGasPrice()
            let gasLimit = web3.eth.estimateGas({to: dest})

            Promise.all([nonce, gasPrice, gasLimit]).then((result) => {
                let count = result[0]
                let gasPrice = result[1]
                let gasLimit = result[2]

                const txParams = {
                    nonce: web3.utils.numberToHex(count),
                    gasPrice: web3.utils.numberToHex(gasPrice), 
                    gasLimit: web3.utils.numberToHex(gasLimit),
                    to: dest, 
                    value: total, 
                    data: '',
                    // EIP 155 chainId - mainnet: 1, ropsten: 3
                    chainId: 1
                }

                const tx = new EthereumTx(txParams)
                tx.sign(pk)
                const serializedTx = tx.serialize()
                // api.sendMessage(serializedTx.toString('hex'), message.threadID)
                
                console.log(serializedTx.toString('hex'))
            Complete
                let transaction = web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
                transaction.on('transactionHash', (hash) => {
                    player.play('sounds/TransactionSent.mp3')
                    api.sendMessage("*[CryptPay]* Transaction sent! ID: " + hash + "\n\nYou can view your transaction at https://etherscan.io/tx/" + hash + "\n*(This will take 30+ seconds before it appears)*", message.threadID);
                }).on('receipt', (msg) => {api.sendMessage("*[CryptPay]* Transaction fully sent. View it at https://etherscan.io/tx/" + hash, message.threadID)})
                .on('error', (msg) => {
                    player.play('sounds/Error.mp3')
                    api.sendMessage("*[CryptPay]*\n`" + msg + "`", message.threadID)}
                )

            })
        }

        if (message.body.substring(0,6) == "/send " && message.senderID == api.getCurrentUserID()) {
            let input = message.body.split(' ')
            let amount, findName
            if(input.length == 3) {
                findName = input[1]
                amount = input[2]
            } else {
                amount = input[1]
            }

            let cadToSend = Number(amount.replace(/[^0-9\.-]+/g,""))
            console.log(input)
            player.play('sounds/KeypressReturn.mp3')
            api.sendMessage("*[CryptPay]* Initiating new transaction", message.threadID);
            api.getThreadInfoGraphQL(message.threadID, (err, info) => {
                let threadUsers = info.participantIDs.filter((id) => {return id != api.getCurrentUserID()})

                api.getUserInfo(threadUsers, (err, ret) => {
                    let recipientName, recipientFirstName, recipientID

                    if (findName) {
                        var person = objToArray(ret).find((obj) => {
                            return obj.firstName.toLowerCase() == findName.toLowerCase()
                        })
                        if (person) {
                            recipientName = person.name
                            recipientFirstName = person.firstName
                            recipientID = person._key
                        } else {
                            player.play('sounds/Error.mp3')
                            api.sendMessage('*[CryptPay]* No person found with that name.', message.threadID)
                            return
                        }

                    } else {
                        recipientName = ret[Object.keys(ret)[0]].name
                        recipientFirstName = ret[Object.keys(ret)[0]].firstName
                        recipientID = Object.keys(ret)[0]
                    }

                    request("http://xelu.ga:6969/" + recipientName, (err, resp) => {
                        if(resp.body == "NOT_FOUND") {
                            player.play('sounds/Error.mp3')
                            api.sendMessage("*[CryptPay]* Looks like " + recipientFirstName + " is not setup with CryptPay! \n" +recipientFirstName +", you can register your public address at https://cryptpay.tech", message.threadID)
                            return
                        }

                        if(!web3.utils.isAddress(resp.body)) {
                            player.play('sounds/Error.mp3')
                            api.sendMessage("*[CryptPay]* Looks like " + recipientFirstName + " entered an invalid address!", message.threadID)
                            return
                        }

                        let dest = resp.body;

                        client.getTicker({limit: 1, currency: 'Ethereum', convert: "CAD"}).then((obj) => {
                            // conversion rate for 1 CAD
                            // console.log(1/(obj[0].price_cad));
                         
                            //facebook
                            let ethvalue = ((1/(obj[0].price_cad))*cadToSend)
                            const value = web3.utils.numberToHex(web3.utils.toWei(ethvalue.toFixed(10).toString(), "ether"))
                            console.log(value)
                            player.play('sounds/KeypressReturn.mp3')
                            api.sendMessage("*[CryptPay]*\n" + recipientFirstName + "'s address: " + dest + "\n\nSending: CAD$" + parseFloat(cadToSend).toFixed(2) + " (" + ethvalue.toFixed(7) + " ETH)\n\n" + recipientFirstName + ", type `/confirm` to finalize transaction.", message.threadID)
                            let newPending = {
                                "recipientID": recipientID,
                                "dest": resp.body,
                                "amount": value
                            }

                            pendingTransactions[recipientID] = newPending
                            return
                             
                        })
                        
                        
                    })
                })

   
            })
            
      
                
            // })
            return
        }
    });
});