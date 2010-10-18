function Tile(tile, groundType)
{
	this.tile = tile;
	this.groundType = groundType;
	this.road = false;
	this.rail = false;
	this.line = false;
	this.zone = "none";
	this.n = null;
	this.s = null;
	this.e = null;
	this.w = null;
}
Tile.prototype =
{
	// Bulldoze a tile, returns true if something actually changed
	bulldoze: function(pretend)
	{
		var ret = false;
		
		// TODO Integrate structures
		
		// Can't bulldoze water
		if(this.groundType == "water")
			return ret;
		if(this.tile != 0)
			ret = true;
		if(!pretend)
		{
			this.tile = 0;
			if(this.groundType == "forest")
				this.groundType = "ground";
			this.road = false;
			this.rail = false;
			this.line = false;
			this.zone = "none";
			this.n.setRoadTile();
			this.s.setRoadTile();
			this.e.setRoadTile();
			this.w.setRoadTile();
			this.n.setForestTile(true);
			this.s.setForestTile(true);
			this.e.setForestTile(true);
			this.w.setForestTile(true);
		}
		return ret;
	},
	// Build a road
	buildRoad: function()
	{
		this.road = true;
		this.setRoadTile();
		this.n.setRoadTile();
		this.s.setRoadTile();
		this.e.setRoadTile();
		this.w.setRoadTile();
	},
	setRoadTile: function()
	{
		if(!this.road)
			return;
		var roadIdx = 0;
		if(this.n.road)
			roadIdx |= 1;
		if(this.s.road)
			roadIdx |= 2;
		if(this.e.road)
			roadIdx |= 4;
		if(this.w.road)
			roadIdx |= 8;
		this.tile = this.roadTiles[roadIdx];
	},
	// Attempt to set this tile as a water tile, returns true if it worked
	setWater: function()
	{
		this.groundType = "water";
		this.tile = rand(3) + 2;
		return true;
	},
	setWaterTile: function()
	{
		if(this.groundType != "water" ||
			(this.n.groundType == "water" &&
			this.s.groundType == "water" &&
			this.e.groundType == "water" &&
			this.w.groundType == "water"))
			return;
		var idx = 0;
		if(this.n.groundType == "water")
			idx |= 1;
		if(this.s.groundType == "water")
			idx |= 2;
		if(this.e.groundType == "water")
			idx |= 4;
		if(this.w.groundType == "water")
			idx |= 8;
		var temp = this.waterTiles[idx];
		if(temp == 2)
		{
			temp += rand(3);
		}
		else if(rand(2) > 0)
			temp -= 1;
		this.tile = temp;
	},
	setWaterTileGroundType: function()
	{
		if(this.groundType != "water")
			return;
		if(this.tile > 4)
			this.groundType = "ground";
	},
	// Attempt to set this tile as a forest tile, returns true if it worked
	setForest: function()
	{
		if(this.groundType != "ground" ||
			this.n.groundType == "water" ||
			this.s.groundType == "water" ||
			this.e.groundType == "water" ||
			this.w.groundType == "water")
			return false;
		this.groundType = "forest";
		this.forestTiles[15];
		return true;
	},
	setForestTile: function(preserve)
	{
		if(this.groundType != "forest" ||
			this.isNullTile)
			return;
		var idx = 0;
		if(this.n.groundType == "forest")
			idx |= 1;
		if(this.s.groundType == "forest")
			idx |= 2;
		if(this.e.groundType == "forest")
			idx |= 4;
		if(this.w.groundType == "forest")
			idx |= 8;
		var temp = this.forestTiles[idx];
		if(temp != 0)
		{
			if(temp != 37 &&
				rand(2) > 0)
				temp -= 8;
		}
		else if(preserve)
		{
			return;
		}
		this.tile = temp;
		if(this.tile == 0)
			this.groundType = "ground";
	},
	roadTiles:
	[
		66,		// xxxx
		67,		// xxxN
		67,		// xxSx
		67,		// xxSN
		66,		// xExx
		68,		// xExN
		69,		// xESx
		73,		// xESN
		66,		// Wxxx
		71,		// WxxN
		70,		// WxSx
		75,		// WxSN
		66,		// WExx
		72,		// WExN
		74,		// WESx
		76		// WESN
	],
	forestTiles:
	[
		0,		// xxxx
		0,		// xxxN
		0,		// xxSx
		0,		// xxSN
		0,		// xExx
		34,		// xExN
		36,		// xESx
		35,		// xESN
		0,		// Wxxx
		32,		// WxxN
		30,		// WxSx
		31,		// WxSN
		0,		// WExx
		33,		// WExN
		29,		// WESx
		37		// WESN
	],
	waterTiles:
	[
		14,		// xxxx
		14,		// xxxN
		6,		// xxSx
		2,		// xxSN
		18,		// xExx
		16,		// xExN
		20,		// xESx
		18,		// xESN
		10,		// Wxxx
		12,		// WxxN
		8,		// WxSx
		10,		// WxSN
		2,		// WExx
		14,		// WExN
		6,		// WESx
		2		// WESN
	]	
};
/*
			// WSEN
      0,	// xxxx
      0,	// xxxN
      0,	// xxEx
      34,	// xxEN
      0,	// xSxx
      0,	// xSxN
      36,	// xSEx
      35,	// xSEN
      0,	// Wxxx
      32,	// WxxN
      0,	// WxEx
      33,	// WxEN
      30,	// WSxx
      31,	// WSxN
      29,	// WSEx
      37,	// WSEN
      */
