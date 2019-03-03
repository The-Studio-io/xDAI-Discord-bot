const usCoins = argument => {
	if (argument === "penny") {
		return Number(0.01)
	} else if (argument === "nickel") {
		return Number(0.05)
	} else if (argument === "dime") {
		return Number(0.1)
	} else if (argument === "quarter") {
		return Number(0.25)
	} else if (argument === "dollar") {
		return Number(1)
	}
}

module.exports = usCoins
