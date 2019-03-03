const userSchema = require("./model/user")

const createUser = async msgData => {
	const userData = userSchema.build({
		id: msgData.id,
		name: msgData.username,
	})
	const result = await userData.save()
	return { ...result.dataValues }
}

module.exports = createUser