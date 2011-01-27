function Zone(type, left, top, right, bottom)
{
	this.zoneInfo = data.zoneInfo[type];
	this.left = left;
	this.right = right;
	this.top = top;
	this.bottom = bottom;
	this.population = 0;
	this.powered = true;
}
Zone.prototype =
{
	// Call the update method for this zone, if any
	update: function()
	{
		// Update
		var method = this.updateMethods[this.zoneInfo.name];
		if(method)
			method.call(this);
	},
	// Set all of the graphic tiles of a zone
	setTiles: function()
	{
		var ix, iy, tileOfs = 0;

		// Handle population and land value parameters
		// TODO Handle land values
		if(this.zoneInfo.populationStages)
		{
			// Handle special case for residential zones
			if(this.zoneInfo.name == "residential")
			{
				if(this.population == 1)
				{
					tileOfs = 9;
					// TODO Handle land values
					for(iy = this.top; iy < this.bottom; ++iy)
					{
						for(ix = this.left; ix < this.right; ++ix)
						{
							game.map.getTile(ix, iy)
								.setTile(this.zoneInfo.baseTile + tileOfs +
									rand(3));
						}
					}
					return;
				}
				else if(this.population > 1)
					tileOfs += 12 + 9 * (this.population - 1);
			}
			else
				tileOfs += 9 * this.population;
		}

		for(iy = this.top; iy < this.bottom; ++iy)
		{
			for(ix = this.left; ix < this.right; ++ix)
			{
				game.map.getTile(ix, iy)
					.setTile(this.zoneInfo.baseTile + (tileOfs++));
			}
		}
	},
	// Resets all of the tiles along the edges of the zone
	resetEdges: function()
	{
		// Walk the edges and reset tiles
		var ix, iy, tile;
		for(ix = this.left - 1; ix <= this.right; ++ix)
		{
			tile = game.map.getTile(ix, this.top - 1);
			if(tile)
				tile.resetAllTiles();
			tile = game.map.getTile(ix, this.bottom);
			if(tile)
				tile.resetAllTiles();
		}
		for(iy = this.top; iy < this.bottom; ++iy)
		{
			tile = game.map.getTile(this.left - 1, iy);
			if(tile)
				tile.resetAllTiles();
			tile = game.map.getTile(this.right, iy);
			if(tile)
				tile.resetAllTiles();
		}
	},
	// Redraw the entire zone and it's edges
	redraw: function()
	{
		game.map.drawRect(this.left - 1, this.top - 1,
			(this.right - this.left) + 2, (this.bottom - this.top) + 2);
	},
	// Bulldoze a zone and return the cost
	bulldoze: function(pretend)
	{
		var cost = this.zoneInfo.width * this.zoneInfo.height *
			game.rules.cost.bulldozeZone;
		
		if(!pretend)
		{
			var ix, iy;
			for(iy = this.top; iy < this.bottom; ++iy)
			{
				for(ix = this.left; ix < this.right; ++ix)
				{
					var tile = game.map.getTile(ix, iy);
					tile.makeRubble();
					tile.setZone(null);
				}
			}
			this.redraw();
			game.map.removeZone(this);
		}
		
		return cost;
	},
	// Return the saved state representation of this zone
	getSaveState: function()
	{
		// Once again we are trying to squeeze a lot of data into a small
		// package, and we are doing so with base 36 encoding of binary data.
		// Note that no RLE-compression is attempted as every zone will have
		// some data different, at the very least the positions.
		var ret = this.zoneInfo.zoneIndex & 0xf;
		ret |= (this.left & 0xff) << 4;
		ret |= (this.top & 0xff) << 12;
		ret |= (this.population & 0xf) << 20;
		return ret.toString(36);
	},
	// Load values from a saved state representation
	loadSaveState: function(state)
	{
		state = parseInt(state, 36);
		this.zoneInfo = data.zoneInfo.crossRef[state & 0xf];
		this.left = (state & 0xff0) >> 4;
		this.top = (state & 0xff000) >> 12;
		this.population = (state & 0xf00000) >> 20;
		this.right = this.left + this.zoneInfo.width;
		this.bottom = this.top + this.zoneInfo.height;
		var ix, iy;
		for(iy = this.top; iy < this.bottom; ++iy)
		{
			for(ix = this.left; ix < this.right; ++ix)
			{
				game.map.getTile(ix, iy).setZone(this);
			}
		}
	},
	// Maybe grow a zone based on a demand value
	maybeGrow: function(demand)
	{
		if(this.population < this.zoneInfo.populationStages &&
			Math.random() < (demand / (this.population + 1)))
		{
			++this.population;
			this.setTiles();
		}
	},
	// Update routines for the different zone types
	updateMethods:
	{
		residential: function()
		{
			if(this.population * 8 > rand(36))
			{
				// TODO Traffic to commercial zones
			}
			
			// Try to grow 1/8th of the time
			if(rand(8) == 0)
			{
				// TODO Account for property value and polution
				/*
					    if (traf < 0) {
					        return -3000;
					    }
					
					    value =  landValueMap.worldGet(pos.posX, pos.posY);
					    value -= pollutionDensityMap.worldGet(pos.posX, pos.posY);
					
					    if (value < 0) {
					        value = 0;
					    } else {
					        value = min(value * 32, 6000);
					    }				
    					value = value - 3000;
    			*/
				var value = 200;
				var rate = game.sim.residentialGrowthRate + value;
				if(!this.powered)
					rate = -500;
				
				// Very strange formulas pulled from the origional source
				if(this.population < this.zoneInfo.populationStages &&
					rate > -350 &&
					rate - 26380 > randS16())
				{
					// TODO Make hospitals if needed
					++this.population;
					this.setTiles();
				}
				else if(this.population > 0 &&
					rate < 350 &&
					rate + 26380 > randS16())
				{
					--this.population;
					this.setTiles();					
				}

			}
		},
		commercial: function()
		{
			// TODO Include traffic, polution and crime
			this.maybeGrow(game.sim.commercialGrowthRate);
		},
		industrial: function()
		{
			if(this.population > rand(6))
			{
				// TODO Traffic to residential zones
			}
			
			// Try to grow 1/8th of the time
			if(rand(8) == 0)
			{
				var rate = game.sim.industrialGrowthRate;
				// TODO Set rate to -1000 if we have no road / rail
				if(!this.powered)
					rate = -500;

				// Very strange formulas pulled from the origional source
				if(this.population < this.zoneInfo.populationStages &&
					rate > -350 &&
					rate - 26380 > randS16())
				{
					++this.population;
					this.setTiles();
				}
				else if(this.population > 0 &&
					rate < 350 &&
					rate + 26380 > randS16())
				{
					--this.population;
					this.setTiles();					
				}
			}
		}
	}
};
