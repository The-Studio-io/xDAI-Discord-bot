const usCoins = argument => {
	switch (argument) {
		case "penny":
			return Number(0.01)
		case "nickel":
			return Number(0.05)
		case "dime":
			return Number(0.1)
		case "quarter":
			return Number(0.25)
		case "dollar":
			return Number(1)
	}
}

module.exports = usCoins
