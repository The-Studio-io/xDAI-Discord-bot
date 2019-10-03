const Sequelize = require("sequelize")
const sequelize = new Sequelize(
	"xdai-discord-bot",
	process.env.db_username,
	process.env.db_password,
	{
		host: "localhost",
		dialect: "mysql",
		operatorsAliases: false,
	}
)

module.exports = sequelize
