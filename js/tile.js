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
	this.zoneTileOffset = 0;
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
		
		// TODO Support Zones
		if(this.zone != "none")
			return cost;
		
		// Support water
		if(this.groundType == "water")
		{
			if(this.road ||
				this.rail ||
				this.line)
				cost += game.rules.cost.bulldozeBridge;
			else
				return cost;
		}
		else if(this.tile != 0)
			cost += game.rules.cost.bulldoze;
		
		if(!pretend)
		{
			if(this.groundType != "water")
			{
				this.groundType = "ground";
				this.setTile(0);
			}
			else
			{
				this.setTile(rand(3) + 2);
			}
			
			this.road = false;
			this.rail = false;
			this.line = false;
			this.hBridge = false;
			this.zone = "none";
			this.n.resetAllTiles();
			this.s.resetAllTiles();
			this.e.resetAllTiles();
			this.w.resetAllTiles();
		}
		return cost;
	},
	resetAllTiles: function()
	{
		this.setRoadTile();
		this.setRailTile();
		this.setLineTile();
		this.setForestTile(true);
	},
	// Attempts to auto-bulldoze a tile, returns the cost
	autoBulldoze: function(pretend, dozeLines)
	{
		var cost = 0;
		if(this.zone != "none" ||
			this.rail ||
			this.road ||
			(this.line && !dozeLines))
			return cost;
		return this.bulldoze(pretend);
	},
	// Build a zone, returns the cost if any, or -1 if unable to build
	buildZone: function(zoneType, tileOffset, pretend)
	{
		var cost = 0;
		
		// If this isn't ground and we can't auto-bulldoze it we can't build
		if(this.tile != 0)
		{
			cost += this.autoBulldoze(pretend, true)
			if(cost <= 0)
				return -1;
		}
		
		if(!pretend)
		{
			this.zone = zoneType;
			this.zoneTileOffset = tileOffset;
			this.setTile(data.zoneInfo[zoneType].baseTile + this.zoneTileOffset);
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
		cost += this.autoBulldoze(pretend);
		if(this.groundType == "water")
			cost += game.rules.cost.roadBridge;
		else
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
				this.setTile(this.roadTiles[16]);
			else
				this.setTile(this.roadTiles[17]);
		}
		else if(this.line)
		{
			if(this.e.road ||
				this.w.road)
				this.setTile(this.roadTiles[18]);
			else
				this.setTile(this.roadTiles[19]);
		}
		else if(this.rail)
		{
			if(this.e.road ||
				this.w.road)
				this.setTile(this.roadTiles[20]);
			else
				this.setTile(this.roadTiles[21]);
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
	// Build a rail
	buildRail: function(pretend)
	{
		var cost = 0;
		var isHBridge = false;

		// We can't build a rail on top of another rail, a zone, or if the
		// tile already has a road and a line.
		if(this.rail ||
			(this.road && this.line) ||
			this.zone != "none")
			return cost;
		
		// Handle bridges
		if(this.groundType == "water")
		{
			// We can't build next to any other bridge type
			if((this.n.groundType == "water" && (this.n.road || this.n.line)) ||
				(this.s.groundType == "water" && (this.s.road || this.s.line)) ||
				(this.e.groundType == "water" && (this.e.road || this.e.line)) ||
				(this.w.groundType == "water" && (this.w.road || this.w.line)))
				return cost;
			
			// There has to be a rail next to us to base the bridge on
			if(this.n.rail ||
				this.s.rail)
				isHBridge = false;
			else if(this.e.rail ||
				this.w.rail)
				isHBridge = true;
			else
				return cost;

			// We can't build next to a bridge of the opposite orientation
			if((isHBridge && (this.n.rail || this.s.rail)) ||
				(!isHBridge && (this.e.rail || this.w.rail)) ||
				(this.n.groundType == "water" && this.n.rail && this.n.hBridge) ||
				(this.s.groundType == "water" && this.s.rail && this.s.hBridge) ||
				(this.e.groundType == "water" && this.e.rail && !this.e.hBridge) ||
				(this.w.groundType == "water" && this.w.rail && !this.w.hBridge))
				return cost;
			}
		
		// Handle auto-bulldozing and cost
		cost += this.autoBulldoze(pretend);
		if(this.groundType == "water")
			cost += game.rules.cost.railBridge;
		else
			cost += game.rules.cost.rail;
		
		if(!pretend)
		{
			this.rail = true;
			this.hBridge = isHBridge;
			this.setRailTile();
			this.n.setRailTile();
			this.s.setRailTile();
			this.e.setRailTile();
			this.w.setRailTile();
		}
		return cost;
	},
	setRailTile: function()
	{
		if(!this.rail)
			return;
		
		// Bridges
		if(this.groundType == "water")
		{
			if(this.hBridge)
				this.setTile(this.railTiles[16]);
			else
				this.setTile(this.railTiles[17]);
		}
		else if(this.line)
		{
			if(this.e.rail ||
				this.w.rail)
				this.setTile(this.railTiles[18]);
			else
				this.setTile(this.railTiles[19]);
		}
		else if(this.road)
		{
			if(this.e.rail ||
				this.w.rail)
				this.setTile(this.railTiles[20]);
			else
				this.setTile(this.railTiles[21]);
		}
		else
		{
			var idx = 0;
			if(this.n.rail)
				idx |= 1;
			if(this.s.rail)
				idx |= 2;
			if(this.e.rail)
				idx |= 4;
			if(this.w.rail)
				idx |= 8;
			this.setTile(this.railTiles[idx]);
		}
	},
	// Build a line
	buildLine: function(pretend)
	{
		var cost = 0;
		var isHBridge = false;

		// We can't build a line on top of another line, a zone, or if the
		// tile already has a road and a rail.
		if(this.line ||
			(this.rail && this.road) ||
			this.zone != "none")
			return cost;
		
		// Handle bridges
		if(this.groundType == "water")
		{
			// We can't build next to any other bridge type
			if((this.n.groundType == "water" && (this.n.road || this.n.rail)) ||
				(this.s.groundType == "water" && (this.s.road || this.s.rail)) ||
				(this.e.groundType == "water" && (this.e.road || this.e.rail)) ||
				(this.w.groundType == "water" && (this.w.road || this.w.rail)))
				return cost;
			
			// There has to be a rail next to us to base the bridge on
			if(this.n.line ||
				this.s.line)
				isHBridge = false;
			else if(this.e.line ||
				this.w.line)
				isHBridge = true;
			else
				return cost;

			// We can't build next to a bridge of the opposite orientation
			if((isHBridge && (this.n.line || this.s.line)) ||
				(!isHBridge && (this.e.line || this.w.line)) ||
				(this.n.groundType == "water" && this.n.line && this.n.hBridge) ||
				(this.s.groundType == "water" && this.s.line && this.s.hBridge) ||
				(this.e.groundType == "water" && this.e.line && !this.e.hBridge) ||
				(this.w.groundType == "water" && this.w.line && !this.w.hBridge))
				return cost;
			}
		
		// Handle auto-bulldozing and cost
		cost += this.autoBulldoze(pretend);
		if(this.groundType == "water")
			cost += game.rules.cost.lineBridge;
		else
			cost += game.rules.cost.line;
		
		if(!pretend)
		{
			this.line = true;
			this.hBridge = isHBridge;
			this.setLineTile();
			this.n.setLineTile();
			this.s.setLineTile();
			this.e.setLineTile();
			this.w.setLineTile();
		}
		return cost;
	},
	setLineTile: function()
	{
		if(!this.line)
			return;
		
		// Bridges
		if(this.groundType == "water")
		{
			if(this.hBridge)
				this.setTile(this.lineTiles[16]);
			else
				this.setTile(this.lineTiles[17]);
		}
		else if(this.rail)
		{
			if(this.e.line ||
				this.w.line)
				this.setTile(this.lineTiles[18]);
			else
				this.setTile(this.lineTiles[19]);
		}
		else if(this.road)
		{
			if(this.e.line ||
				this.w.line)
				this.setTile(this.lineTiles[20]);
			else
				this.setTile(this.lineTiles[21]);
		}
		else
		{
			var idx = 0;
			if(this.n.line ||
				this.n.zone != "none")
				idx |= 1;
			if(this.s.line ||
				this.s.zone != "none")
				idx |= 2;
			if(this.e.line ||
				this.e.zone != "none")
				idx |= 4;
			if(this.w.line ||
				this.w.zone != "none")
				idx |= 8;
			this.setTile(this.lineTiles[idx]);
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
		76,		// WESN
		64,		// hBridge
		65,		// vBridge
		77,		// E/W Line
		78,		// N/S Line
		238,	// E/W Rail
		237		// N/S Rail
	],
	railTiles:
	[
		226,	// xxxx
		227,	// xxxN
		227,	// xxSx
		227,	// xxSN
		226,	// xExx
		228,	// xExN
		229,	// xESx
		233,	// xESN
		226,	// Wxxx
		231,	// WxxN
		230,	// WxSx
		235,	// WxSN
		226,	// WExx
		232,	// WExN
		234,	// WESx
		236,	// WESN
		224,	// hBridge
		225,	// vBridge
		221,	// E/W Line
		222,	// N/S Line
		238,	// E/W Road
		237		// N/S Road
	],
	lineTiles:
	[
		210,	// xxxx
		211,	// xxxN
		211,	// xxSx
		211,	// xxSN
		210,	// xExx
		212,	// xExN
		213,	// xESx
		217,	// xESN
		210,	// Wxxx
		215,	// WxxN
		214,	// WxSx
		219,	// WxSN
		210,	// WExx
		216,	// WExN
		218,	// WESx
		220,	// WESN
		209,	// hBridge
		208,	// vBridge
		222,	// E/W Rail
		221,	// N/S Rail
		78,		// E/W Road
		77		// N/S Road
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
