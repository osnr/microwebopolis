function GameState()
{
	this.cityName = "Everytown, USA";
	this.funds = 2000000000;
	this.population = 10000000;
	this.date = new Date(1900, 1, 1);
}
GameState.prototype =
{
	chargeFunds: function(amount)
	{
		this.funds -= amount;
		this.updateUI();
	},
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
	}
};
