function GameState()
{
	this.cityName = "Everytown, USA";
	this.funds = 2000000000;
	this.population = 10000000;
	this.date = new Date(1900, 1, 1);
}
GameState.prototype =
{
	// Charge funds to the city
	chargeFunds: function(amount)
	{
		this.funds -= amount;
		this.updateUI();
	},
	// Update the user interface with all relavent game state information
	updateUI: function()
	{
		$("#cityName").text(
			pad((this.date.getMonth() + 1)) + "/" +
			pad(this.date.getDate()) + "/" +
			(this.date.getYear() + 1900) + " - " +
			this.cityName +
			" - Population " + addCommas(this.population) +
			" - $" + addCommas(this.funds)
		);
	},
	// Generate the save state representation of the entire game state.
	getSaveState: function()
	{
		return {
			cityName: this.cityName,
			funds: this.funds,
			population: this.population,
			date: this.date
		};
	},
	// Load values from a save state.
	loadSaveState: function(state)
	{
		this.cityName = state.cityName;
		this.funds = state.funds;
		this.population = state.population;
		this.data = state.data;
	}
};
