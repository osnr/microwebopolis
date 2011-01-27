function Map(width, height, genParams)
{
	var i, ix, iy, tile;
	
	// !!!ATTENTION!!! SAVESTATE
	// The only supported width and height are 128. If this needs to be
	// changed we have to change the game.init and game.load functions to take
	// into account the size of the new maps, the generateMap dialog to allow
	// us to select a map size, and we will need to modify the Zone object's
	// save state format if the height or width exceed 256.
	this.width = width;
	this.height = height;
	this.tiles = [];
	this.zones = [];
	
	// Generate map
	this.generateMap(100, 5, 50, false);
}
Map.prototype =
{
	viewOffsetX: 0,
	viewOffsetY: 0,
	centerX: 64,
	centerY: 64,
	externalMarket: 0.15,
	internalMarket: 0,
	population: 0,
	jobs: 0,
	unemployment: 0,
	rect:
	{
		x: 0,
		y: 0,
		w: 0,
		h: 0,
		color: null
	},
	panView: function(xOfs, yOfs)
	{
		this.centerX += xOfs;
		this.centerY += yOfs;
		this.draw();
	},
	centerView: function(x, y)
	{
		this.centerX = x;
		this.centerY = y;
		this.draw();
	},
	updateViewOffset: function()
	{
		this.viewOffsetX = (this.centerX - (canvas.tilesWide / 2)) | 0;
		this.viewOffsetY = (this.centerY - (canvas.tilesHigh / 2)) | 0;
		canvas.miniMapUpdateRect(this.viewOffsetX, this.viewOffsetY,
			canvas.tilesWide, canvas.tilesHigh);
	},
	mapToScreenLocation: function(x, y)
	{
		return {
			x: (x - this.viewOffsetX) * canvas.tileWidth,
			y: (y - this.viewOffsetY) * canvas.tileHeight
		};
	},
	screenToMapLocation: function(x, y)
	{
		var ret =
		{
			x: ((x / canvas.tileWidth) + this.viewOffsetX) | 0,
			y: ((y / canvas.tileHeight) + this.viewOffsetY) | 0
		}
		if(ret.x < 0)
			ret.x = 0;
		else if(ret.x >= this.width)
			ret.x = this.width - 1;
		if(ret.y < 0)
			ret.y = 0;
		else if(ret.y >= this.height)
			ret.y = this.height - 1;
		return ret;
	},
	highlightRect: function(x, y, w, h, color)
	{
		if(x !== undefined)
		{
			this.rect.x = x;
			this.rect.y = y;
			this.rect.w = w;
			this.rect.h = h;
			this.rect.color = color;
		}
		if(this.rect.color)
		{
			var left = this.rect.x < 0 ? 0 : this.rect.x;
			var right = this.rect.x + this.rect.w > this.width ? this.width : this.rect.x + this.rect.w;
			var top = this.rect.y < 0 ? 0 : this.rect.y;
			var bottom = this.rect.y + this.rect.h > this.height ? this.height : this.rect.y + this.rect.h;
			canvas.highlightRect(left - this.viewOffsetX, top - this.viewOffsetY,
				right - left, bottom - top, this.rect.color);
		}
	},
	clearHighlight: function()
	{
		this.rect.color = null;
		this.drawRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);
	},
	draw: function()
	{
		this.updateViewOffset();
		var ix, iy, tile, dataOfs;
		var minX = this.viewOffsetX < 0 ? 0 : this.viewOffsetX;
		minX = minX > this.width ? this.width : minX;
		var minY = this.viewOffsetY < 0 ? 0 : this.viewOffsetY;
		minY = minY > this.height ? this.height : minY;
		var maxX = this.viewOffsetX + canvas.tilesWide;
		var maxY = this.viewOffsetY + canvas.tilesHigh;
		maxX = maxX > this.width ? this.width : maxX;
		maxY = maxY > this.height ? this.height : maxY;
		
		canvas.clear();
		for(iy = minY; iy < maxY; ++iy)
		{
			dataOfs = iy * this.width + minX;
			for(ix = minX; ix < maxX; ++ix)
			{
				tile = this.tiles[dataOfs];
				canvas.blitTile(tile.tile, ix - this.viewOffsetX,
					iy - this.viewOffsetY);
				
				// No power icon
				if(game.frameBitTwo && (tile.line || tile.zone) && !tile.powered)
					canvas.blitTile(827, ix - this.viewOffsetX,
						iy - this.viewOffsetY);
				
				++dataOfs;
			}
		}
		this.highlightRect();
	},
	drawTile: function(x, y)
	{
		if(x < 0 ||
			y < 0 ||
			x >= this.width ||
			y >= this.height)
			return;
		var tile = this.tiles[y * this.width + x];
		canvas.blitTile(tile.tile, x - this.viewOffsetX,
			y - this.viewOffsetY);
				
		// No power icon
		if(game.frameBitTwo && (tile.line || tile.zone) && !tile.powered)
			canvas.blitTile(827, x - this.viewOffsetX,
			y - this.viewOffsetY);
	},
	drawRect: function(x, y, w, h)
	{
		var ix, iy, tile, dataOfs;
		var minX = x < 0 ? 0 : x;
		minX = minX > this.width ? this.width : minX;
		var minY = y < 0 ? 0 : y;
		minY = minY > this.height ? this.height : minY;
		var maxX = x + w;
		var maxY = y + h;
		maxX = maxX >= this.width ? this.width : maxX;
		maxY = maxY >= this.height ? this.height : maxY;
		
		for(iy = minY; iy < maxY; ++iy)
		{
			dataOfs = iy * this.width + minX;
			for(ix = minX; ix < maxX; ++ix)
			{
				tile = this.tiles[dataOfs];
				canvas.blitTile(tile.tile, ix - this.viewOffsetX,
					iy - this.viewOffsetY);
				
				// No power icon
				if(game.frameBitTwo && (tile.line || tile.zone) && !tile.powered)
					canvas.blitTile(827, ix - this.viewOffsetX,
						iy - this.viewOffsetY);
				
				++dataOfs;
			}
		}
	},
	getTile: function(x, y)
	{
		if(x < 0 ||
			y < 0 ||
			x >= this.width ||
			y >= this.height)
			return null;
		return this.tiles[y * this.width + x];
	},
	// Returns the number of tiles in the area that have been zoned
	getZoneCount: function(x, y, w, h)
	{
		var ix, iy, tile, count = 0;
		for(iy = y; iy < y + h; ++iy)
		{
			for(ix = x; ix < x + w; ++ix)
			{
				tile = this.tiles[iy * this.width + ix];
				if(tile &&
					tile.zone != "none")
					++count;
			}
		}
		return count;
	},
	// Returns the number of tiles in the area that contain water
	getWaterCount: function(x, y, w, h)
	{
		var ix, iy, tile, count = 0;
		for(iy = y; iy < y + h; ++iy)
		{
			for(ix = x; ix < x + w; ++ix)
			{
				tile = this.tiles[iy * this.width + ix];
				if(tile &&
					tile.groundType == "water")
					++count;
			}
		}
		return count;
	},
	clearMap: function()
	{
		// Create map array
		this.tiles = [];
		for(i = 0; i < this.width * this.height; ++i)
		{
			this.tiles[i] = new Tile(0, "ground");
		}

		// Link map tiles
		var nullTile = new Tile(0, "forest");
		nullTile.isNullTile = true;
		for(iy = 0; iy < this.height; ++iy)
		{
			for(ix = 0; ix < this.width; ++ix)
			{
				tile = this.tiles[iy * this.width + ix];
				tile.x = ix;
				tile.y = iy;
				tile.n = iy > 0 ? this.tiles[(iy - 1) * this.width + ix] : nullTile;
				tile.s = iy < this.height - 1 ? this.tiles[(iy + 1) * this.width + ix] : nullTile;
				tile.w = ix > 0 ? this.tiles[iy * this.width + ix - 1] : nullTile;
				tile.e = ix < this.width - 1 ? this.tiles[iy * this.width + ix + 1] : nullTile;
				tile.setTile();
			}
		}
	},
	generateMap: function(treeLevel, lakeLevel, riverLevel, isIsland)
	{
		var i;
		
		this.clearMap();
		
		// TODO Handle islands
		if(isIsland)
			throw new Error();
		
		// Add rivers
		var riverX = rand(this.width - 80) + 40;
		var riverY = rand(this.height - 80) + 40;
		var riverDir = rand(4);
		this.doRiver(riverX, riverY, riverDir, riverDir, riverLevel, false);
		riverDir = rotateDir(riverDir, 4);
		riverDir = this.doRiver(riverX, riverY, riverDir, riverDir, riverLevel, false);
		this.doRiver(riverX, riverY, rand(4), riverDir, riverLevel, true);
		
		// Add lakes
		var numLakes = lakeLevel / 2 + rand(lakeLevel / 4);
		while(numLakes > 0)
		{
			this.makeLake(rand(this.width), rand(this.height));
			--numLakes;
		}
		
		// Add forest tiles
		for(i = 0; i < treeLevel; ++i)
		{
			this.doTrees(treeLevel);
		}
		
		// Smooth forest tiles
		for(var i = 0; i < this.width * this.height; ++i)
			this.tiles[i].setForestTile();
		for(var i = 0; i < this.width * this.height; ++i)
			this.tiles[i].setForestTile();
		
		// Smooth water tiles
		for(var i = 0; i < this.width * this.height; ++i)
			this.tiles[i].setWaterTile();
		for(var i = 0; i < this.width * this.height; ++i)
			this.tiles[i].setWaterTileGroundType();
	},
	doRiver: function(x, y, riverDir, terrainDir, riverLevel, small)
	{
		var rate1 = riverLevel + 10;
		var rate2 = riverLevel + 100;
		var ofs = small ? 3 : 4;
		

		while(true)
		{
			if(x + ofs < 0 ||
				y + ofs < 0 ||
				x + ofs >= this.width ||
				y + ofs >= this.height)
				break;
			if(small)
				this.smallPuddle(x, y);
			else
				this.largePuddle(x, y);
			if(rand(rate1) < 10)
				terrainDir = riverDir;
			else
			{
				if(rand(rate2) > 90)
					terrainDir = rotateDir(terrainDir, 1);
				if(rand(rate2) > 90)
					terrainDir = rotateDir(terrainDir, 7);
			}
			x += dirOfsX[terrainDir];
			y += dirOfsY[terrainDir];
		}
		return terrainDir;
	},
	makeLake: function(x, y)
	{
		var numPuddles = rand(12) + 2;
		while(numPuddles > 0)
		{
			if(rand(4) != 0)
				this.smallPuddle(x + rand(12) - 6, y + rand(12) - 6);
			else
				this.largePuddle(x + rand(12) - 6, y + rand(12) - 6);
			--numPuddles;
		}
	},
	smallPuddle: function(x, y)
	{
		var minX = x < 0 ? 0 : x;
		var minY = y < 0 ? 0 : y;
		var maxX = x + 6;
		maxX = maxX > this.width ? this.width : maxX;
		var maxY = y + 6;
		maxY = maxY > this.height ? this.height : maxY;
		var ix, iy, dx, dy;
		for(iy = 0; iy < 6; ++iy)
		{
			dy = y + iy;
			if(dy < minY ||
				dy >= maxY)
				continue;
			for(ix = 0; ix < 6; ++ix)
			{
				dx = x + ix;
				if(dx < minX ||
					dx >= maxX)
					continue;
				// This makes the dimond pattern
				if(((iy == 0 || iy == 5) && (ix < 2 || ix > 3)) ||
					((iy == 1 || iy == 4) && (ix < 1 || ix > 4)))
					continue;
				this.tiles[dy * this.width + dx].setWater();
			}
		}
	},
	largePuddle: function(x, y)
	{
		var minX = x < 0 ? 0 : x;
		var minY = y < 0 ? 0 : y;
		var maxX = x + 9;
		maxX = maxX > this.width ? this.width : maxX;
		var maxY = y + 9;
		maxY = maxY > this.height ? this.height : maxY;
		var ix, iy, dx, dy;
		for(iy = 0; iy < 9; ++iy)
		{
			dy = y + iy;
			if(dy < minY ||
				dy >= maxY)
				continue;
			for(ix = 0; ix < 9; ++ix)
			{
				dx = x + ix;
				if(dx < minX ||
					dx >= maxX)
					continue;
				// This makes the dimond pattern
				if(((iy == 0 || iy == 8) && (ix < 3 || ix > 5)) ||
					((iy == 1 || iy == 7) && (ix < 2 || ix > 6)) ||
					((iy == 2 || iy == 6) && (ix < 1 || ix > 7)))
					continue;
				this.tiles[dy * this.width + dx].setWater();
			}
		}
	},
	doTrees: function(treeLevel)
	{
		treeLevel = rand(100 + treeLevel * 2) + 50;
		var dir, tile;
		var x = rand(this.width);
		var y = rand(this.height);
		while(treeLevel > 0)
		{
			dir = rand(8);
			x += dirOfsX[dir];
			y += dirOfsY[dir];
			--treeLevel;

			if(x < 0 ||
				y < 0 ||
				x >= this.width ||
				y >= this.height)
				continue;
			tile = this.tiles[y * this.width + x];
			if(tile.groundType != "ground")
				continue;
			tile.setForest();
		}
	},
	// Removes a zone from the map
	removeZone: function(zone)
	{
		this.zones.splice(this.zones.indexOf(zone), 1);
	},
	// Bulldoze a tile. Returns the cost if any
	bulldozeTile: function(x, y, pretend)
	{
		var cost = 0;
		if(x < 0 ||
			y < 0 ||
			x >= this.width ||
			y >= this.height)
			return cost;	
		var tile = this.tiles[y * this.width + x];
		cost += tile.bulldoze(pretend)
		if(!pretend)
		{
			this.drawTile(x, y);
			this.drawTile(x + 1, y);
			this.drawTile(x - 1, y);
			this.drawTile(x, y + 1);
			this.drawTile(x, y - 1);
		}
		return cost;
	},
	// Build a road on a tile. Returns the cost if any
	buildRoad: function(x, y, pretend)
	{
		var cost = 0;
		if(x < 0 ||
			y < 0 ||
			x >= this.width ||
			y >= this.height)
			return cost;
		
		var tile = this.tiles[y * this.width + x];
		cost += tile.buildRoad(pretend);
		if(!pretend)
		{
			tile.buildRoad();
			this.drawTile(x, y);
			this.drawTile(x + 1, y);
			this.drawTile(x - 1, y);
			this.drawTile(x, y + 1);
			this.drawTile(x, y - 1);
		}
		return cost;
	},
	// Build a rail on a tile. Returns the cost if any
	buildRail: function(x, y, pretend)
	{
		var cost = 0;
		if(x < 0 ||
			y < 0 ||
			x >= this.width ||
			y >= this.height)
			return cost;
		
		var tile = this.tiles[y * this.width + x];
		cost += tile.buildRail(pretend);
		if(!pretend)
		{
			tile.buildRail();
			this.drawTile(x, y);
			this.drawTile(x + 1, y);
			this.drawTile(x - 1, y);
			this.drawTile(x, y + 1);
			this.drawTile(x, y - 1);
		}
		return cost;
	},
	// Build a line on a tile. Returns the cost if any
	buildLine: function(x, y, pretend)
	{
		var cost = 0;
		if(x < 0 ||
			y < 0 ||
			x >= this.width ||
			y >= this.height)
			return cost;
		
		var tile = this.tiles[y * this.width + x];
		cost += tile.buildLine(pretend);
		if(!pretend)
		{
			tile.buildLine();
			this.drawTile(x, y);
			this.drawTile(x + 1, y);
			this.drawTile(x - 1, y);
			this.drawTile(x, y + 1);
			this.drawTile(x, y - 1);
		}
		return cost;
	},
	// Build a zone from a center tile. Returns the cost if any
	buildZone: function(x, y, pretend, zoneType)
	{
		var cost = 0;
		var info = data.zoneInfo[zoneType];
		
		// Bounds check, the entire zone must be on the map
		var left = x + info.ofsLeft;
		var top = y + info.ofsTop;
		var right = left + info.width;
		var bottom = top + info.height;
		if(left < 0 ||
			top < 0 ||
			right > this.width ||
			bottom > this.height)
			return cost;
		
		var zone = new Zone(zoneType, left, top, right, bottom);
		
		// Try to zone off all of the tiles to make sure it will work
		var ix, iy, tile;
		for(iy = top; iy < bottom; ++iy)
		{
			for(ix = left; ix < right; ++ix)
			{
				tile = this.tiles[iy * this.width + ix];
				if(tile.buildZone(zone, true) < 0)
					return cost;
			}
		}
		
		// Actually zone off all of the tiles
		for(iy = top; iy < bottom; ++iy)
		{
			for(ix = left; ix < right; ++ix)
			{
				tile = this.tiles[iy * this.width + ix];
				cost += tile.buildZone(zone, pretend);
			}
		}
		
		// Actually build the zone
		if(!pretend)
		{
			zone.setTiles();
			this.zones.push(zone);
			zone.resetEdges();
			
			// And redraw everything
			this.drawRect(left - 1, top - 1, info.width + 2, info.height + 2);
		}
		
		cost += game.rules.cost.zones[zoneType];
		return cost;
	},
	// Runs all calculations for the power grid
	doPowerGrid: function()
	{
		var i, powerStack = [], stackPointer = 0, powerLeft = 0, zone, tile;
		
		// Clear the power grid
		for(i = 0; i < this.tiles.length; ++i)
		{
			tile = this.tiles[i];
			tile.powered = false;
			tile.scanned = false;
			if(tile.zone)
				tile.zone.powered = false;
		}
		
		// Look for power plant zones and add them to the stack
		for(i = 0; i < this.zones.length; ++i)
		{
			zone = this.zones[i];
			if(zone.zoneInfo.powerType != "none")
			{
				tile = this.tiles[zone.top * this.width + zone.left];
				powerStack.push(tile);
				powerLeft += game.rules.powerGeneration[
					zone.zoneInfo.powerType];
			}
		}
		
		// Process tiles until we run out of power or tiles
		while(stackPointer < powerStack.length &&
			powerLeft > 0)
		{
			tile = powerStack[stackPointer++];
			if(tile.zone)
				--powerLeft;
			tile.powered = true;
			if(tile.zone)
				tile.zone.powered = true;
			if(!tile.n.scanned && (tile.n.line || tile.n.zone) && !tile.n.powered)
				powerStack.push(tile.n);
			if(!tile.s.scanned && (tile.s.line || tile.s.zone) && !tile.s.powered)
				powerStack.push(tile.s);
			if(!tile.e.scanned && (tile.e.line || tile.e.zone) && !tile.e.powered)
				powerStack.push(tile.e);
			if(!tile.w.scanned && (tile.w.line || tile.w.zone) && !tile.w.powered)
				powerStack.push(tile.w);
			tile.scanned = true;
			tile.n.scanned = true;
			tile.s.scanned = true;
			tile.e.scanned = true;
			tile.w.scanned = true;
		}
	},
	// Update all zones
	doZones: function()
	{
		var i;
		
		for(i = 0; i < this.zones.length; ++i)
		{
			this.zones[i].update();
		}
	},
	// Generate an array of values representing the save file representation
	// of this map.
	getSaveState: function()
	{
		var ret = {
			width: this.width,
			height: this.height,
			centerX: this.centerX,
			centerY: this.centerY
		};
		
		// RLE-compressed tile storage
		var tileValues = [];
		var lastTileValue = null;
		var tileRepeatCount = 0;
		for(var i = 0; i < this.width * this.height; ++i)
		{
			var tile = this.tiles[i].getSaveState();
			if(lastTileValue == tile)
				++tileRepeatCount;
			else
			{
				if(lastTileValue != null)
				{
					if(tileRepeatCount == 0)
						tileValues.push(lastTileValue.toString(36));
					else
						tileValues.push((lastTileValue | 0x80000).toString(36), tileRepeatCount.toString(36));
				}
				lastTileValue = tile;
				tileRepeatCount = 0;
			}
		}
		if(tileRepeatCount == 0)
			tileValues.push(lastTileValue.toString(36));
		else
			tileValues.push((lastTileValue | 0x80000).toString(36), tileRepeatCount.toString(36));
		ret.tiles = tileValues.join(",");
		
		// Zones
		var zoneValues = [];
		for(var i = 0; i < this.zones.length; ++i)
		{
			zoneValues.push(this.zones[i].getSaveState());
		}
		ret.zones = zoneValues.join(",");
		
		return ret;
	},
	// Load map data from save file representation array.
	loadSaveState: function(state)
	{
		this.rect.color = null;
		this.width = state.width;
		this.height = state.height;
		this.centerX = state.centerX;
		this.centerY = state.centerY;
		
		// Tiles (RLE-compressed)
		var tileData = state.tiles.split(",");
		var i = 0;
		var outputPointer = 0;
		var tileValue, repeatCount, j;
		while(i < tileData.length)
		{
			tileValue = parseInt(tileData[i++], 36);
			if((tileValue & 0x80000) > 0)
			{
				repeatCount = parseInt(tileData[i++], 36);
				tileValue &= 0x7ffff;
				for(j = 0; j <= repeatCount; ++j)
				{
					this.tiles[outputPointer++].loadSaveState(tileValue);
				}
			}
			else
				this.tiles[outputPointer++].loadSaveState(tileValue);
		}
		
		// Zones
		var zoneData = state.zones.split(",");
		this.zones = [];
		for(i = 0; i < zoneData.length; ++i)
		{
			var zone = new Zone();
			zone.loadSaveState(zoneData[i]);
			this.zones.push(zone);
		}
		
		// Run baseline simulations
		this.doPowerGrid();
		
		this.draw();
	}
};
