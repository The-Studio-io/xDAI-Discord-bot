const helpMessage = message => {
	message.channel.send({
		embed: {
			title: "Commands",
			color: 3447003,
			description: "Available Commands",
			fields: [
				{
					name: "**/bal**",
					value: "Check your balance.",
				},
				{
					name: "**/deposit**",
					value: "Check your deposit address.",
				},
				{
					name: "**/withdraw**",
					value:
						"Withdraw to external account. This feature is currently unavaiable.",
				},
				{
					name: "**/donate <xDAI_Amount>**",
					value: "*Donate xDAI to show some support and love.*",
				},
				{
					name:
						"**/tip @userName <xDAI_Amount>/penny/nickel/dime/quarter/dollar**",
					value: "Send xDAI to other person.",
				},
			],
			footer: {
				text:
					"Read the docs to learn more: https://xdai-bot-docs.netlify.com",
			},
		},
	})
}

module.exports = helpMessage
