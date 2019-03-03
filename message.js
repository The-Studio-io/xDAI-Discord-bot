const helpMessage = require("./help")

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
