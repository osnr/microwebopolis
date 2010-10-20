var rules =
{
	base:
	{
		cost:
		{
			bulldoze: 1,
			bulldozeBridge: 10,
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
			power:
			{
				coal: 50,
				nuclear: 150
			}
		}
	}
};
