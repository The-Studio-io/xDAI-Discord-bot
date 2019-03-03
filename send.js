const convertUSCoins = require("./usCoins")
const userSchema = require("./model/user")

const tip = async (argument, message) => {
	let sendMoneyValue
	if (isNaN(argument[1])) {
		sendMoneyValue = convertUSCoins(argument[1])
	} else {
		sendMoneyValue = argument[1]
	}

	let senderDiscordData = message.author
	let receiverDiscordData = message.mentions.members.first().user

	if (senderDiscordData.id === receiverDiscordData.id) {
		message.channel.send("You cannot send money to yourself")
	}

	// REVIEW Test this condition
	if (receiverDiscordData.bot) {
		message.channel.send("Bots are free birds and doesn't need money.")
	}

	const userData = await userSchema.findByPk(receiverDiscordData.id)
	if (!userData) {
		message.channel.send(
			receiverDiscordData + " doesn't have a wallet to store xDAI."
		)
	}

	if (sendMoneyValue === undefined) {
		message.channel.send(
			"You can only use: **<xDAI_Amount>/penny/nickel/dime/quarter/dollar**"
		)
	}

	if (parseInt(sendMoneyValue) <= 0.01) {
		message.channel.send("You cannot send xDAI less than 0.01")
	}

	const userBalance = (await userSchema.findByPk(senderDiscordData.id)).balance
	if (userBalance >= sendMoneyValue) {
		let receiverDBData = await userSchema.findOne({
			where: { id: receiverDiscordData.id },
		})
		try {
			receiverDBData.update({
				balance: receiverDBData.dataValues.balance + sendMoneyValue,
			})
		} catch (error) {
			console.log(error)
		}

		let senderDBData = await userSchema.findOne({
			where: { id: senderDiscordData.id },
		})
		try {
			senderDBData.update({
				balance: senderDBData.dataValues.balance - sendMoneyValue,
			})
		} catch (error) {
			console.log(error)
		}

		await message.channel.send(
			"**xDAI Sent:** " +
				senderDiscordData +
				" sent " +
				sendMoneyValue +
				" xDAI to " +
				receiverDiscordData
		)
	} else {
		message.channel.send("**Low Balance:** You don't have enough xDAI.")
	}
}

module.exports = tip
