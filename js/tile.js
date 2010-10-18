function Tile(tile, groundType)
{
	this.tile = tile;
	this.groundType = groundType;
	this.road = false;
	this.rail = false;
	this.line = false;
	this.zone = "none";
	this.hBridge = false;
	this.n = null;
	this.s = null;
	this.e = null;
	this.w = null;
}
Tile.prototype =
{
	// Set the tile graphic of a tile, automatically updates the mini-map
	setTile: function(tile)
	{
		if(tile !== undefined)
			this.tile = tile;
		if(!this.isNullTile)
			canvas.miniMapTile(this.tile, this.x, this.y);
	},
	// Bulldoze a tile, returns the cost
	bulldoze: function(pretend)
	{
		var cost = 0;
		
		// TODO Integrate structures
		
		// TODO Support water
		if(this.groundType == "water")
			return cost;
		
		if(this.tile != 0)
			cost = game.rules.cost.bulldoze;
		if(!pretend)
		{
			this.setTile(0);
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
		return cost;
	},
	// Build a road
	buildRoad: function(pretend)
	{
		var cost = 0;
		var isHBridge = false;

		// We can't build a road on top of another road, a zone, or if the
		// tile already has a rail and a line.
		if(this.road ||
			(this.rail && this.line) ||
			this.zone != "none")
			return cost;
		
		// Handle bridges
		if(this.groundType == "water")
		{
			// We can't build next to any other bridge type
			if((this.n.groundType == "water" && (this.n.rail || this.n.line)) ||
				(this.s.groundType == "water" && (this.s.rail || this.s.line)) ||
				(this.e.groundType == "water" && (this.e.rail || this.e.line)) ||
				(this.w.groundType == "water" && (this.w.rail || this.w.line)))
				return cost;
			
			// There has to be a road next to us to base the bridge on
			if(this.n.road ||
				this.s.road)
				isHBridge = false;
			else if(this.e.road ||
				this.w.road)
				isHBridge = true;
			else
				return cost;

			// We can't build next to a bridge of the opposite orientation
			if((isHBridge && (this.n.road || this.s.road)) ||
				(!isHBridge && (this.e.road || this.w.road)) ||
				(this.n.groundType == "water" && this.n.road && this.n.hBridge) ||
				(this.s.groundType == "water" && this.s.road && this.s.hBridge) ||
				(this.e.groundType == "water" && this.e.road && !this.e.hBridge) ||
				(this.w.groundType == "water" && this.w.road && !this.w.hBridge))
				return cost;
			}
		
		// Handle auto-bulldozing and cost
		cost += this.bulldoze(pretend);
		cost += game.rules.cost.road;
		
		if(!pretend)
		{
			this.road = true;
			this.hBridge = isHBridge;
			this.setRoadTile();
			this.n.setRoadTile();
			this.s.setRoadTile();
			this.e.setRoadTile();
			this.w.setRoadTile();
		}
		return cost;
	},
	setRoadTile: function()
	{
		if(!this.road)
			return;
		
		// Bridges
		if(this.groundType == "water")
		{
			if(this.hBridge)
				this.setTile(64);
			else
				this.setTile(65);
		}
		else
		{
			var roadIdx = 0;
			if(this.n.road)
				roadIdx |= 1;
			if(this.s.road)
				roadIdx |= 2;
			if(this.e.road)
				roadIdx |= 4;
			if(this.w.road)
				roadIdx |= 8;
			this.setTile(this.roadTiles[roadIdx]);
		}
	},
	// Attempt to set this tile as a water tile, returns true if it worked
	setWater: function()
	{
		this.groundType = "water";
		this.setTile(rand(3) + 2);
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
		if(this.n.groundType == "water" ||
			this.n.isNullTile)
			idx |= 1;
		if(this.s.groundType == "water" ||
			this.s.isNullTile)
			idx |= 2;
		if(this.e.groundType == "water" ||
			this.e.isNullTile)
			idx |= 4;
		if(this.w.groundType == "water" ||
			this.w.isNullTile)
			idx |= 8;
		var temp = this.waterTiles[idx];
		if(temp == 2)
		{
			temp += rand(3);
		}
		else if(rand(2) > 0)
			temp -= 1;
		this.setTile(temp);
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
		this.setTile(temp);
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
