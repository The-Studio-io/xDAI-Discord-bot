![Image title](https://cl.ly/6d5b9bbbf689/Screen%20Shot%202019-02-27%20at%201.43.21%20AM.png)

# 🤖xDAI Discord Bot
Let's build a xDAI bot for Discord. Easily send tips to your friends on Discord.
Add this bot to your server: https://discordapp.com/oauth2/authorize?&client_id=513319931018870795&scope=bot&permissions=0

## How to set up the bot
> Create a Bot in Disord >> link here >> https://discordapp.com/developers/applications/ >> more links for guide, how to

> Run xDAI blockchain locally using Parity eth client >> link here >> https://github.com/poanetwork/wiki/wiki/POA-Installation (this is for POA, make sure you change it to xDAI BlockChain)

> Clone this git

> Create local file > config.js in a same folder as main.js and add this code

//Defines that JavaScript code should be executed in "strict mode"
'use strict'
//Config file that holds all the important information
//put inside .gitignore
module.exports={
botToken: "Your_bot_token",
}'

> Inside "xDAI-Discord-bot" folder in command (CLI) > Run >> npm install (this should install all the dependencies)
> run>> node main.js

## Five Simple commands in Discord
It is easy to control the bot.  Simply use these five main commands:

`/Help `
Will show all of the bot commands

`/tip @userName <xDAI_Amount>/penny/nickel/dime/quarter/dollar`
Send xDAI to another Studio member.

`/bal`
Check your balance. You will receive a DM with your balance.

`/deposit`
Check your Deposit Address. You will receive a DM with an address you can send xDAI to.

`/withdraw` [ Coming Soon ]
You can withdraw to external account. Withdrawal fee is a penny.


## Extra credit
`/donate <xDAI_Amount>`
You can even use this donate command to give a bit of xDAI to the Studio Bot and show some support.


## Team

RabTAI - Lead Bot developer (AKA Bot Scientist)

Dave Craige http://www.twitter.com/DaveCraige - project manager / design

Perminder Klair - developer

Yashu Mittal - developer

Johny Crypto - designer and logo work

Samyak - developer

