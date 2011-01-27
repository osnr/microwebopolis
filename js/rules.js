var rules =
{
	base:
	{
		name: "base",
		cost:
		{
			bulldoze: 1,
			bulldozeBridge: 10,
			bulldozeZone: 1,
			road: 10,
			roadBridge: 50,
			rail: 20,
			railBridge: 100,
			line: 5,
			lineBridge: 25,
			zones:
			{
				park: 10,
				residential: 100,
				commercial: 100,
				industrial: 100,
				police: 500,
				fire: 500,
				coal: 3000,
				nuclear: 5000,
				seaport: 5000,
				stadium: 3000,
				airport: 10000
			}
		},
		funding:
		{
			road: 1,
			roadBridge: 4,
			line: 0,
			lineBridge: 0,
			rail: 4,
			railBridge: 10,
			police: 100,
			fire: 100
		},
		powerGeneration:
		{
			coal: 700,
			nuclear: 2000
		},
		sim:
		{
			ticksPerMonth: 10,
			monthsPerYear: 12,
			birthRate: 0.02,
			laborBaseMax: 1.3,
			internalMarketDenom: 3.7,
			projectedIndPopMin: 5,
			residentialPopDemon: 8,
			populationTotalDemon: 20,
			residentialRatioDefault: 1.3,
			residentialRatioMax: 2,
			commercialRatioMax: 2,
			industrialRatioMax: 2,
			residentialGrowthMin: -2000,
			residentialGrowthMax: 2000,
			commercialGrowthMin: -1500,
			commercialGrowthMax: 1500,
			industrialGrowthMin: -1500,
			industrialGrowthMax: 1500,
			resPopCapWithoutStadium: 500,
			comPopCapWithoutAirport: 100,
			indPopCapWithoutSeaport: 70,
			taxTableScale: 600,
			taxEffectTable: [200,150,120,100,80,50,30,0,-10,-40,-100,-150,-200,-250,-300,-350,-400,-450,-500,-550,-600]
		}
	}
};
