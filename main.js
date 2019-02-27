/*
Program: main.js
Desc: xDAI tip bot for studio
Date: 02/21/2019
Dev: rabTAI
*/

//Defines that JavaScript code should be executed in "strict mode"
'use strict';

//Load the config file to get all the values
//config file hold all the information that is needed for Bot
//this fill will not be pushed to github, so you need to create local config.js file
//It holds discord bot token, you have to have a token to run the bot
var conf = require('./config.js');

//Bluebird is a fully featured promise library
//Promisification converts an existing promise-unaware API to a promise-returning API.
var promise = require("bluebird");

//We wil be using web3 to connect to parity
var Web3 = require('web3');
// create an instance of web3 using the HTTP provider.
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545')); 

//Create Redis: Redis is a fast and efficient in-memory key-value store. It is also known as a data structure server, 
//as the keys can contain strings, lists, sets, hashes and other data structures. 
var redis = require('redis');
var rClient = redis.createClient(); //creates a new Redis client
promise.promisifyAll(require("redis")); //redis will return promise
//If error
rClient.on('error', function(err){
  console.log('Something went wrong ', err)
});
//Connect Redis
rClient.on('connect', function() {
    console.log('Redis Server is connected');
});

//Connect to Discord
const Discord = require('discord.js')
const dClient = new Discord.Client()//Discord Client
//If error in Discord 
dClient.on('error', function(err){
    console.log("Swomething went wrong with Discord Client", err);
});
//
dClient.on('ready', () => {
  console.log(`Discord Logged in as ${dClient.user.tag}!`);
  // Set bot status
  dClient.user.setActivity("tipping people.")
});
//Login to discord using the Discord Token
dClient.login(conf.botToken); //get it from config.js file (not in github, create one locally)

//Event handler for Discord, it will be executed everytime there is a message
dClient.on('message', async msg => {
	// Prevent bot from responding to its own messages
    if (msg.author === dClient.user) {
        return;
    }
    // Check if the bot's user was tagged in the message
    if (msg.content.includes(dClient.user.toString())) {
       // Send acknowledgement message
       msg.reply("Did you call me! Try !help")
       msg.react("❤")
       return;
    }
    if (msg.content.startsWith("!")) {//If the command starts with !, then call the command function
        // check the discord members if exist in database if not then create one
        if (! await rClient.SISMEMBERAsync("registeredUsers", msg.author.id)) {
            await createUser(msg.author.id);//call create user function and pass user's discord ID
        }
        //If the message start with !, call the fuction to process the message
        processCommand(msg)//Call the function to process the command
    }
    return;
});

//Create user in redis database
async function createUser(userId){
    //create deposit address (we are running xDAI chain using Parity eth client)
    const depositAddress= await web3.eth.personal.newAccount("studio");
    //Devine user info to store in database
    const userInfo= {
        'depositAddress': depositAddress,//Deposit address
        'balance':0,//total balance, balance is database controlled, not using wallets address (Main wallet will be used)
        'previousDeposit':0 //this will keep track of new deposit from the users
    };
    const userAdded= await rClient.hmsetAsync(userId, userInfo); //creats the hash in redis using users discord Id
    if(userAdded){//If user successfully added
        await rClient.saddAsync("registeredUsers", userId); //If user added, add that user to registeredUsers set in redis
    }
    return
}
//Function is called when the message start with !
async function processCommand(msg) {
    try{ //catches any error while executing commands
        let fullCommand = msg.content.substr(1).toLowerCase(); // Remove the leading exclamation mark
        let splitCommand = fullCommand.split(" "); // Split the message up in to pieces for each space
        let primaryCommand = splitCommand[0]; // The first word directly after the exclamation is the command
        let argument = splitCommand.slice(1); // All other words are arguments/parameters/options for the command
        //use switch case to handle each command
        switch(primaryCommand){
            case "help": //displays help command
                helpCommand(argument,msg);//calls the function, pass argument, and msg (discord)
                break;
            case "deposit": //let user deposit xDAI
                //Retrives the depositAddrress from Redis hash store in user's discord ID
                const depositAddress= await rClient.hgetAsync(msg.author.id, "depositAddress");
                msg.channel.send(msg.author.toString() + ": Check your DM");
                msg.author.send("Your deposit address is:");
                msg.author.send(depositAddress);
                break;
            case "withdraw"://Let user withdraw xDAI
                //We need to work on it, I had problem withdrawing, Problem: no response from block chain
                msg.channel.send(msg.author.toString() + " StudioBot is in test phase, It will be implemented in the future.");
                //withdrawCommand(argument,msg);
                break;
            case "bal": 
                //retrives balance from Redis
                const userBalance = await rClient.hgetAsync(msg.author.id, "balance");//get the balance of the user
                if(userBalance){ //if balance returns value
                    msg.channel.send(msg.author.toString() + ": Check your DM");
                    const botMessage=await msg.author.send("Your balance is " + userBalance + " xDAI");//send private message
                   
                }else{
                    msg.channel.send("Sorry" + msg.author.toString() + " could not get your balance at this time, try again.")
                }
                break;
            case "tip": 
                //send xDAI to another user
                tipCommand(argument, msg);
                break;
            case "donate"://donate xDAI to tip bot for further development
                donateCommand(argument,msg);
                break;
            default://if command does not match, then send error to users
                msg.channel.send({
                        embed: {
                            description: "I didn't understand the command. Try !help"
                        }
                    });
        }
    }catch(err){//if problem 
        console.log("Problem In Commands: " + err.message);
     }
}

//Donate xDAI to the bot
async function donateCommand(argument,msg){
    //define all the values
    if(argument[0]==="penny"){
      argument[0]=Number(0.01);
    }else if(argument[0]==='nickel'){
      argument[0]=Number(0.05);
    }else if(argument[0]==='dime'){
           argument[0]=Number(0.10);    
    }else if(argument[0]==='quarter'){
        argument[0]=Number(0.25);
    }else if(argument[0]==='dollar'){
        argument[0]=Number(1);
    }
    //If no argument provited, amount is not number,and it is less then 0.01 (has to be at least a penny)
    if(argument.length< 1 || isNaN(argument[0]) || argument[0]<0.01 ){
        await msg.author.send("Not a right format use: **!donate <xDAI_Amount>**");
        return;
    }else{
        //For now, we are using just 2 decimals, but xDAI supports 18 decimals (eth format)
        let xDAIToDonate=Number(argument[0]).toFixed(2);//convert to number, and only 2 digit (XDAI=US$)
        //NOTE: this is not a good practice using Number and parse, but for now it works
        //We should be using bigINT and no FLOAT, decimals should be only for display not for database
        xDAIToDonate=parseFloat(xDAIToDonate) //convert to float
        const userBalance=parseFloat(await rClient.hgetAsync(msg.author.id, "balance"));
        if (userBalance>=argument[0]){ //If user has enough balance
            await rClient.HINCRBYFLOATAsync(msg.author.id, "balance", -xDAIToDonate); //subtract the amount from the balance
            await rClient.HINCRBYFLOATAsync("studioBot","donation", xDAIToDonate);//Give donation to bot
            msg.channel.send("**Thanks:** much appreciated for the donation. :heart:");//Heart emoji :)
        }else{
            //Don't have enough balance
            msg.channel.send("**Low Balance:** You don't have enough Balance.");
            return;
        }
    }
}
//Display help 
async function helpCommand(argument, msg) {
    //sends embeded message
    //we should be using embeded message for all the send out message
    msg.channel.send({
        embed: {
            title: "Commands",
            color: 3447003,
            description: "Available Commands:", 
            fields: [
                        {
                            name: "**!bal**",
                            value: "Check your balance. You will receive a DM."
                        },
                        {
                            name: "**!deposit**",
                            value: "Check your Deposit Address. You will receive a DM."
                        },
                        {
                            name: "**!tip @userName <xDAI_Amount>/penny/nickel/dime/quarter/dollar**",
                            value: "Send xDAI to another studio member."
                        },
                        {
                            name: "**!withdraw** Comming Soon",
                            value: "You can withdraw to external account. Withdrawal fee is a penny."
                        },
                        {
                            name: "**!donate <xDAI_Amount>**",
                            value: "*Donate xDAI to Studio Bot to show some support.*"
                       }
                    ]
        }
    });
}

//Tip other people
async function tipCommand(argument, msg){
    //we should be defining this in array, and loop it and use it for other fucntions so no redundency
	//Define all the US dollars Coin
	if(argument[1]==="penny"){
	  argument[1]=Number(0.01);
	}else if(argument[1]==='nickel'){
	  argument[1]=Number(0.05);
	}else if(argument[1]==='dime'){
	       argument[1]=Number(0.10);    
	}else if(argument[1]==='quarter'){
	    argument[1]=Number(0.25);
	}else if(argument[1]==='dollar'){
	    argument[1]=Number(1);
	}
    //Tagged member should be a Discord member, and should not be bot 
   if(argument.length< 1 || !msg.mentions.members.first() || isNaN(argument[1]) || argument[1]<0.01 || msg.author.toString()==msg.mentions.members.first() || msg.mentions.members.first().bot) {
        //send users message that the argument is wrong
        msg.channel.send("Not a right format/not a user/user is a bot/you can't send yourself, total amount has to be at least .01 xDAI, Use: **!tip @userName <xDAI_Amount>/penny/nickel/dime/quarter/dollar**");
        return;
    }else{ 
        let xDAIToSend=Number(argument[1]).toFixed(2);//convert to number, and only 2 digit (XDAI=US$)
        xDAIToSend=parseFloat(xDAIToSend)
        //Get user's balance from the HexdB and converet it into number
        const userBalance=parseFloat(await rClient.hgetAsync(msg.author.id, "balance"));
        if (userBalance>=xDAIToSend){//check if users have enough to send
            //get the id of mentioned user
            const mentionedMemberID=msg.mentions.members.first().toString().substr(2).slice(0, -1);
            //check if member is already registered, if not then create a member (redis database)
            if (! await rClient.SISMEMBERAsync("registeredUsers", mentionedMemberID)) {
                await createUser(mentionedMemberID);
            }
            //All good, send xDAI to other person
            //add xDAI to receiver
            await rClient.HINCRBYFLOATAsync(mentionedMemberID, "balance", xDAIToSend);
            //Substrack xDAI from sender
            await rClient.HINCRBYFLOATAsync(msg.author.id, "balance", -xDAIToSend);
            const botMessage= await msg.channel.send ("**xDAI Sent:** " + msg.author.username+ " sent " + xDAIToSend + " xDAI to " + dClient.users.get(mentionedMemberID).username);
            botMessage.react("💸")//react with flying money
        }else{
            //error 
            msg.channel.send("**Low Balance:** You don't have enough Balance.");
            return;
        }
    }
}

<<<<<<< HEAD
//Withdraw xDAI to external accounts
async function withdrawCommand(argument,msg){
    //we should be defining this in array, and loop it and use it for other fucntions so no redundency
    //Define all the US dollars Coin
    if(argument[1]==="penny"){
      argument[1]=Number(0.01);
    }else if(argument[1]==='nickel'){
      argument[1]=Number(0.05);
    }else if(argument[1]==='dime'){
           argument[1]=Number(0.10);    
    }else if(argument[1]==='quarter'){
        argument[1]=Number(0.25);
    }else if(argument[1]==='dollar'){
        argument[1]=Number(1);
    }
    //we need to check the format of the xDAI addres before we withdraw xDAI
    //we also need to check if address belongs to user or any other users in studio (can use tip)
    //It has to be external address
    // if(argument[0])==somehing like wrong xDAI address{
    //     await msg.author.send("**Wrong xDAI Address:** Please provide correct xDAI Address.")
    //      return;
    // }
    if(argument.length< 1 || isNaN(argument[1]) || argument[1]<0.01) {
        //send users message that the argument is wrong
        await support.wrongArgument(msg,"Not a right format use: **!withdraw <xDAI_Address> <xDAI_Amount>**");
        return;
    }else{ 
        let xDAIToWithdraw=Number(argument[1]).toFixed(2);//convert to number, and only 2 digit (XDAI=US$)
        xDAIToWithdraw=parseFloat(xDAIToWithdraw+0.01); //Fee is added (a penny)
        //Get user's balance from the HexdB and converet it into number
        const userBalance=parseFloat(await rClient.hgetAsync(msg.author.id, "balance"));
        if (userBalance>=xDAIToWithdraw){//check if users have enough to withdraw
            //Transaction has to be in wei format
            const xDaiToGwi=web3.utils.toWei(xDAIToWithdraw-0.01);//convert the withdraw ammount to Wei before send
            const txId= await web3.eth.sendTransaction({
                from: conf.mainAccount,//save your main account in config.js
                to: argument[0],//address to withdraw
                value: xDaiToGwi
                });
            if(txId){//If transaction is successful then tx will be returned
                msg.author.reply("**Successful Withdraw:** Your Withdrawal tx is " +txId);
            }
        }else{
        //error 
            msg.channel.send("**Low Balance:** You don't have enough Balance.");
            return;
        }
}
//check use's deposit, it will be checked every 1 minute
=======
//Check users deposit, it will be checked every 1 minute
>>>>>>> 3f704e6e89fe946ff65832a3db9862d99ad2504b
async function checkUserDeposit(){
    //get all the members fromt the database
    const members= await rClient.smembersAsync("registeredUsers");
    for await (const member of members){//Loop throught all the members
        //Retrive previous deposit
        let previousDeposit= await rClient.hgetAsync(member, "previousDeposit");
        //check the last xDAI block
        var lastBlock=await web3.eth.getBlockNumber();
        //gets the new deposit of the user on latest Block
        let newDeposit=await web3.eth.getBalance(await rClient.hgetAsync(member, "depositAddress"),lastBlock);//Wait for 6 confirmations
        //xDAI is 18 digits, and we receive deposit in 18 digits(eth) format
        //1 Gwei=1000000000 wei
        newDeposit=Number(newDeposit)/1000000000000000000;//convert that in to US dollar format (most likely 2 digits)
        //convert to float with 2 digits, and remove all zeros after decimal
        newDeposit=parseFloat(newDeposit.toFixed(2));
        //If the currrent deposit on current block is more than previous deposit, then user have new deposit
        if(Number(newDeposit)>Number(previousDeposit)){
            //add that new ammount to old one (total deposit by far - previous depost)=new deposit
            //We could just use hSet the new deposit in database
            await rClient.HINCRBYFLOATAsync(member,"balance", parseFloat(newDeposit-previousDeposit).toFixed(2));
            //previous deposit will be new deposit
            await rClient.hsetAsync(member, "previousDeposit",newDeposit);
            //make sure the users is still in server
            if(typeof (dClient.users.get(member)) != "undefined"){
                //once deposit is received, let user know
                dClient.users.get(member).send({
                        embed: {
                            title: "**Deposit Received**",
                            color: 0XFF6633,
                            description:"Deposit Received: " + (newDeposit-previousDeposit).toFixed(2) + " xDAI. \nNew Balance: " + await rClient.hgetAsync(member, "balance") + " xDAI."
                        }
                });
            }
        }
    }
}        

//Run interval every 1 minutes
setInterval(async () => {
    try{
        //check users deposit every minute
        await checkUserDeposit();
    }catch(err){
        console.log("Problem in deposit: " + err.message);
    }
},60000);//repeat every 1 minute

