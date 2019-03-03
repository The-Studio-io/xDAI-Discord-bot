const Sequelize = require("sequelize")
const sequelize = require("../util/database")

const User = sequelize.define("user", {
	id: {
		type: Sequelize.STRING,
		allowNull: false,
		primaryKey: true,
	},
	name: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	depositAddress: {
		type: Sequelize.STRING,
		allowNull: true,
	},
	balance: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 0,
	},
	// Keep track of new deposits
	previousDeposit: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 0,
	},
})

module.exports = User
