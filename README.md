# CryptPay
Devpost Link: https://devpost.com/software/cryptpay

Winning nwHacks 2018 Project. Enables payments on FB Messenger through transactions on the Ethereum blockchain. A secure locally hosted chatbot/wallet hybrid.

## Inspiration
My hackathon team and I wanted to explore the possibilities of managing Cryptocurrency transactions at the tips of our fingers through social media outlets. At the same time, we wanted to tackle the problem of splitting bills when we eat out with friends, through sending Ethereum to settle payments.

## What it does
Our bot has 6 main commands that can be used after setting up with your Facebook account & the public key of your EtherWallet via cryptpay.tech and installing the application to your local computer:
* /send - sends a set amount to designated user.
* /confirm - accepts payment on receiver's end.
* /split - splits bill to number of people in chat.
* /dist - distributes amount per person.
* /receipt - takes picture of receipt and splits bill based on user's prompts.
* /sell - sells amount to market.

We use these commands on the FB chat to facilitate real time transactions.

## How We built it
With security in mind and developing around the spirit of decentralization - a user's wallet/private key never leaves their computer. The architecture of the entire project, as such, was more difficult than your average chatbot.

There are 3 main components to this project:
##### Local Chatbot/Wallet
If we hosted a central chatbot that managed everyone's funds, that would have destroyed the purpose of using cryptocurrency as our medium. As such, we developed a chatbot/wallet hybrid that allows users to have the full functionality of a server-sided bot, right in their hands and in control. We had the user input their wallet details, and by using offline transaction signing, users are not required to run a full Ethereum node but still interact with the blockchain network using Messenger.

##### CryptPay.tech
Lets say `Person A` wants to send a payment of $10 to `Person B` using CryptPay. `Person A` will have to send a transaction to `Person B`'s public key (which can be thought of as their house address). CryptPay.tech allows friends to find each other's public keys, without even asking for them beyond the one-time setup. This means, you don't have to ask for their email address nor their long hexadecimal public key. We do it for you.

##### Receipt Scanning + Other Features
Any user can use the /receipt command to prompt the receipt bill splitting function. CryptPay will ask the user to take a photo of their recent receipt transaction and analyze the purchases. Using the Google Vision API and Tesseract OCR API, we are able to instantaneously identify the total amount of the purchase. The user can then use /split to equally distribute the bill to each member in the chat.

## Challenges We Ran Into
Originally, we contemplated creating a messenger bot for transactions with real money. However, this elicits substantial security issues, since it is not secure for third parties to hold people's private banking information. We spoke with representatives from Scotiabank about our concerns and asked for other possible issues to tackle. After discussion, we decided to use Cryptocurrency transactions because they bypass the Interac debit system and everything is fluid.

## Accomplishments that We're Proud of
* Learning how to use Facebook Messenger API
* Creating a packaging a full node application for end-users
* Learning to architect the project in a unconventional way
* Exploring REST
* Setting up fluid transactions with Ethereum
* Having a fully functional prototype within 24 hours
* Creating something that is easy to use and that everyone can use

## What's next for CryptPay
* Adding more crypto coins 
* Getting a chance to cancel your sending
* Have a command for market research 
