const Discord = require("discord.js")
const promise = require("bluebird")
const Web3 = require("web3")

// NOTE Load the .env file
require("dotenv").config()

const sequelize = require("./util/database")
const userSchema = require("./model/user")
const createUser = require("./user")
const filterMessage = require("./message")

// create an instance of web3 using the HTTP provider.
const web3 = new Web3(new Web3.providers.HttpProvider('http:// localhost:8545')); 

sequelize
	.authenticate()
	.then(() => {
		console.log("Connection has been established successfully.")
		userSchema.sync()
	})
	.catch(err => {
            case "tip": 
                // send xDAI to another user
                tipCommand(argument, msg);
                break;
// Donate xDAI to the bot
async function donateCommand(argument,msg){
    // If no argument provited, amount is not number,and it is less then 0.01 (has to be at least a penny)
    if(argument.length< 1 || isNaN(argument[0]) || argument[0]<0.01 ){
        await msg.author.send("Not a right format use: **!donate <xDAI_Amount>**");
        return;
    }else{
        // For now, we are using just 2 decimals, but xDAI supports 18 decimals (eth format)
        let xDAIToDonate=Number(argument[0]).toFixed(2);// convert to number, and only 2 digit (XDAI=US$)
        // NOTE: this is not a good practice using Number and parse, but for now it works
        // We should be using bigINT and no FLOAT, decimals should be only for display not for database
        xDAIToDonate=parseFloat(xDAIToDonate) // convert to float
        const userBalance=parseFloat(await rClient.hgetAsync(msg.author.id, "balance"));
        if (userBalance>=argument[0]){ // If user has enough balance
            await rClient.HINCRBYFLOATAsync(msg.author.id, "balance", -xDAIToDonate); // subtract the amount from the balance
            await rClient.HINCRBYFLOATAsync("studioBot","donation", xDAIToDonate);// Give donation to bot
            msg.channel.send("**Thanks:** much appreciated for the donation. :heart:");// Heart emoji :)
        }else{
            // Don't have enough balance
            msg.channel.send("**Low Balance:** You don't have enough Balance.");
            return;
        }
    }
}
// Display help 
async function helpCommand(argument, msg) {
    // sends embeded message
    // we should be using embeded message for all the send out message
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
                            value: "Check your deposit address. You will receive a DM.  You can then send xDAI to that address."
                        },
                        {
                            name: "**!tip @userName <xDAI_Amount>/penny/nickel/dime/quarter/dollar**",
                            value: "Send xDAI to another Studio member."
                        },
                        {
                            name: "**!withdraw** Comming Soon",
                            value: "You can use this command to withdraw to external account. Withdrawal fee is a penny."
                        },
                        {
                            name: "**!donate <xDAI_Amount>**",
                            value: "*Donate xDAI to Studio Bot to show some support.*"
                       }
                    ]
        }
    });
}

// Tip other people
async function tipCommand(argument, msg){
    // Tagged member should be a Discord member, and should not be bot 
   if(argument.length< 1 || !msg.mentions.members.first() || isNaN(argument[1]) || argument[1]<0.01 || msg.author.toString()==msg.mentions.members.first() || msg.mentions.members.first().bot) {
        // send users message that the argument is wrong
        msg.channel.send("Not a right format/not a user/user is a bot/you can't send yourself, total amount has to be at least .01 xDAI, Use: **!tip @userName <xDAI_Amount>/penny/nickel/dime/quarter/dollar**");
        return;
    }else{ 
        let xDAIToSend=Number(argument[1]).toFixed(2);// convert to number, and only 2 digit (XDAI=US$)
        xDAIToSend=parseFloat(xDAIToSend)
        // Get user's balance from the HexdB and converet it into number
        const userBalance=parseFloat(await rClient.hgetAsync(msg.author.id, "balance"));
        if (userBalance>=xDAIToSend){// check if users have enough to send
            // get the id of mentioned user
            const mentionedMemberID=msg.mentions.members.first().toString().substr(2).slice(0, -1);
            // check if member is already registered, if not then create a member (redis database)
            if (! await rClient.SISMEMBERAsync("registeredUsers", mentionedMemberID)) {
                await createUser(mentionedMemberID);
            }
            // All good, send xDAI to other person
            // add xDAI to receiver
            await rClient.HINCRBYFLOATAsync(mentionedMemberID, "balance", xDAIToSend);
            // Substrack xDAI from sender
            await rClient.HINCRBYFLOATAsync(msg.author.id, "balance", -xDAIToSend);
            const botMessage= await msg.channel.send ("**xDAI Sent:** " + msg.author.username+ " sent " + xDAIToSend + " xDAI to " + dClient.users.get(mentionedMemberID).username);
            botMessage.react("💸")// react with flying money
        }else{
            // error 
            msg.channel.send("**Low Balance:** You don't have enough Balance.");
            return;
        }
    }
}
		console.error("Unable to connect to the database:", err)
	})

// check use's deposit, it will be checked every 1 minute
async function checkUserDeposit(){
    // get all the members fromt the database
    const members= await rClient.smembersAsync("registeredUsers");
    for await (const member of members){// Loop throught all the members
        // Retrive previous deposit
        let previousDeposit= await rClient.hgetAsync(member, "previousDeposit");
        // check the last xDAI block
        const lastBlock=await web3.eth.getBlockNumber();
        // gets the new deposit of the user on latest Block
        let newDeposit=await web3.eth.getBalance(await rClient.hgetAsync(member, "depositAddress"),lastBlock);// Wait for 6 confirmations
        // xDAI is 18 digits, and we receive deposit in 18 digits(eth) format
        // 1 Gwei=1000000000 wei
        newDeposit=Number(newDeposit)/1000000000000000000;// convert that in to US dollar format (most likely 2 digits)
        // convert to float with 2 digits, and remove all zeros after decimal
        newDeposit=parseFloat(newDeposit.toFixed(2));
        // If the currrent deposit on current block is more than previous deposit, then user have new deposit
        if(Number(newDeposit)>Number(previousDeposit)){
            // add that new ammount to old one (total deposit by far - previous depost)=new deposit
            // We could just use hSet the new deposit in database
            await rClient.HINCRBYFLOATAsync(member,"balance", parseFloat(newDeposit-previousDeposit).toFixed(2));
            // previous deposit will be new deposit
            await rClient.hsetAsync(member, "previousDeposit",newDeposit);
            // make sure the users is still in server
            if(typeof (dClient.users.get(member)) != "undefined"){
                // once deposit is received, let user know
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
const dClient = new Discord.Client()
dClient.on("error", function(err) {
	console.log("Swomething went wrong with Discord Client", err)
})

// Run interval every 1 minutes
setInterval(async () => {
	try {
		// check users deposit every minute
		await checkUserDeposit();
	} catch(err){
		console.log("Problem in deposit: " + err.message);
	}
// repeat every 1 minute
},60000)
dClient.on("ready", () => {
	console.log(`Discord Logged in as ${dClient.user.tag}!`)
	dClient.user.setActivity("/help", {
		type: "LISTENING",
	})
})

dClient.login(process.env.bot_token)

// Execute everytime there is a message
dClient.on("message", async msg => {
	// Prevent from responding own messages
	if (msg.author === dClient.user) {
		return
	}
	// Mentioning the bot
	if (msg.content.includes(dClient.user.toString())) {
		msg.reply("Did you call me! Try using one of these available commands!")
		// REVIEW Do we have to react a message
		msg.react("❤")
		return
	}
	if (msg.content.startsWith("/")) {
		// Does user exist in database
		const userExist = await userSchema.findByPk(msg.author.id)
		try {
			if (userExist ? false : true) {
				createUser(msg.author)
			}
			await filterMessage(msg)
		} catch (error) {
			console.log(error)
		}
	}
	return
})
