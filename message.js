const userSchema = require("./model/user")

const helpMessage = require("./help")
const donateToBot = require("./donate")
const withdrawMoney = require("./withdraw")

const formatMessage = async message => {
	try {
		//  Remove command initializer
		let fullMessage = message.content.substr(1).toLowerCase()
		let splitMessage = fullMessage.split(" ")
		let primaryCommand = splitMessage[0]
		let messageArgument = splitMessage.slice(1)

		switch (primaryCommand) {
			case "help":
				helpMessage(message)
				break
			case "deposit":
				const depositAddress = "depositAddress"
				message.channel.send(message.author.toString() + ": Check your DM")
				message.author.send("Your deposit address is:")
				message.author.send("`" + depositAddress + "`")
				break
			case "withdraw":
				withdrawMoney(message)
				break
			case "balance":
			case "bal":
				const findUser = await userSchema.findByPk(message.author.id)
				try {
					const userBalance = findUser.dataValues.balance
					message.channel.send(message.author.toString() + ", check your DM")
					message.author.send("Your balance is ||" + userBalance + "|| xDAI")
				} catch (error) {
					message.channel.send(
						"Sorry " +
							message.author.toString() +
							", the bot couldn't get your balance at the moment, try again later."
					)
					console.log(error)
				}
				break
			case "donate":
				donateToBot(message)
				break
			default:
				message.channel.send({
					embed: {
						description:
							"I didn't understand the command. Try running `/help` command.",
					},
				})
		}
	} catch (err) {
		console.log("Problem In Commands: " + err.message)
	}
}

module.exports = formatMessage
