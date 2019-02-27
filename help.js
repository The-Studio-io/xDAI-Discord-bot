const helpCommand = (argument, msg) => {
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

export default helpCommand