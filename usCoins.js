const usCoins = argument => {

	switch (argument) {
			
		case "penny":
		case "penni":
		case "penie":
		case "pennie":
			return Number(0.01)
			
		case "nickel":
		case "nicel":
		case "nikel":
		case "nickal":
		case "nickil":
			return Number(0.05)
			
		case "dime":
		case "dim":
		case "diam":
		case "dima":
			return Number(0.1)
		
		case "quarter":
		case "querter":
		case "qarter":
		case "qorter":
		case "qortir":
		case "cuarter":
		case "carter":
		case "cuartor":
			return Number(0.25)
		
		case "dollar":
		case "dolar":
		case "doler":
		case "dolir":
		case "doller":
		case "doll hair":
		case "doll hare":	
			return Number(1)
			
	}
}

module.exports = usCoins
