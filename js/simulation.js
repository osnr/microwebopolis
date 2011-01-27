function Simulation()
{
}
Simulation.prototype =
{
	cityName: "Everytown, USA",
	funds: 20000,
	taxLevel: 7,
	gameLevel: 0,
	tick: -1,
	month: 0,
	year: 1900,
	population: 0,
	migration: 0,
	// TODO Factor externalMarket into rules based on game level
	internalMarket: 0.1,
	externalMarket: 0.15,
	employment: 1,
	residentialPopulation: 0,
	commercialPopulation: 0,
	industrialPopulation: 0,
	residentialGrowthRate: 0,
	commercialGrowthRate: 0,
	industrialGrowthRate: 0,
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
			data.monthNames[this.month] + ", " +
			this.year + " - " +
			this.cityName +
			" - Population " + addCommas(this.population) +
			" - $" + addCommas(this.funds)
		);
	},
	// Update the simulation
	update: function()
	{
		// Roll over the tick count
		if(++this.tick >= game.rules.sim.ticksPerMonth)
		{
			this.tick = 0;
			this.month++;
			if(this.month >= game.rules.sim.monthsPerYear)
			{
				this.month = 0;
				this.year++;
			}
		}
		
		// Update values every-other ticket
		if((this.tick & 1) == 0)
			this.updateValues();
	},
	// Update the overall simulation values.
	updateValues: function()
	{
		var rules = game.rules.sim;
		
    	// Population scans
		var i, zone;
		this.residentialPopulation = this.commercialPopulation =
			this.industrialPopulation = 0;
		for(i = 0; i < game.map.zones.length; ++i)
		{
			zone = game.map.zones[i];
			if(zone.zoneInfo.name == "residential")
				this.residentialPopulation += zone.population;
			else if(zone.zoneInfo.name == "commercial")
				this.commercialPopulation += zone.population;
			else if(zone.zoneInfo.name == "industrial")
				this.industrialPopulation += zone.population;
		}
		this.population = this.residentialPopulation +
			this.commercialPopulation + this.industrialPopulation;
		
		// Employment
		if(this.residentialPopulation > 0)
		{
			this.employment = (this.commercialPopulation + this.industrialPopulation) /
				this.residentialPopulation
		}
		else
			this.employment = 1;
			
		// Migration and births
		this.migration = this.residentialPopulation * (this.employment - 1);
		var births = this.residentialPopulation * rules.birthRate;
		var projectedResPop = this.residentialPopulation + this.migration + births;
		
		// Commerical and industrial growth
		var laborBase;
		if(this.commercialPopulation == 0 &&
			this.industrialPopulation == 0)
			laborBase = 1;
		else
			laborBase = this.residentialPopulation /
				(this.commercialPopulation + this.industrialPopulation);
		laborBase = Math.clamp(laborBase, 0, rules.laborBaseMax);
		this.internalMarket = this.population / rules.internalMarketDenom;
		var projectedComPop = this.internalMarket * laborBase;
		var projectedIndPop = this.industrialPopulation * laborBase *
			this.externalMarket;
		projectedIndPop = Math.max(projectedIndPop, rules.projectedIndPopMin);

		// Calculate ratios
    	var resRatio, comRatio, indRatio;
    	if(this.residentialPopulation > 0)
    		resRatio = projectedResPop / this.residentialPopulation;
    	else
    		resRatio = rules.residentialRatioDefault;
    	if(this.commercialPopulation > 0)
    		comRatio = projectedComPop / this.commercialPopulation;
    	else
    		comRatio = projectedComPop;
    	if(this.industrialPopulation > 0)
    		indRatio = projectedIndPop / this.industrialPopulation;
    	else
    		indRatio = projectedIndPop;
    	resRatio = Math.min(resRatio, rules.residentialRatioMax);
    	comRatio = Math.min(comRatio, rules.commercialRatioMax);
    	indRatio = Math.min(indRatio, rules.industrialRatioMax);

    	// Tax and game level effects
    	var taxEffect = Math.min(this.taxLevel + this.gameLevel,
    		rules.taxEffectTable.length - 1);
    	taxEffect = rules.taxEffectTable[taxEffect];
    	resRatio = (resRatio - 1) * rules.taxTableScale + taxEffect;
    	comRatio = (comRatio - 1) * rules.taxTableScale + taxEffect;
    	indRatio = (indRatio - 1) * rules.taxTableScale + taxEffect;
    	
		// Growth rates
		this.residentialGrowthRate = Math.clamp(this.residentialGrowthRate +
			resRatio, rules.residentialGrowthMin, rules.residentialGrowthMax);
		this.commercialGrowthRate = Math.clamp(this.commercialGrowthRate +
			comRatio, rules.commercialGrowthMin, rules.commercialGrowthMax);
		this.industrialGrowthRate = Math.clamp(this.industrialGrowthRate +
			indRatio, rules.industrialGrowthMin, rules.industrialGrowthMax);
		
		$("#debug").text(resRatio);
		
		// TODO Population caps for stadium, seaport and airport
		
		// Update population for display
		this.population *= rules.residentialPopDemon;
		this.population *= rules.populationTotalDemon;
	},
	// Return the saved state representation
	getSaveState: function()
	{
		// TODO Handle loading and saving of all simulation values and history
		return {
			cityName: this.cityName,
			funds: this.funds,
			tick: this.tick,
			month: this.month,
			year: this.year
		};
	},
	// Restore from the saved state representation
	loadSaveState: function(state)
	{
		// Blindly load everything
		for(var o in state)
		{
			this[o] = state[o];
		}
	}
};
