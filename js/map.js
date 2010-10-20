function Map(width, height, genParams)
{
	var i, ix, iy, tile;
	
	this.width = width;
	this.height = height;
	this.tiles = [];
	
	// Generate map
	this.generateMap(100, 5, 50, false);
}
Map.prototype =
{
	viewOffsetX: 0,
	viewOffsetY: 0,
	centerX: 64,
	centerY: 64,
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
		var left = x < 0 ? 0 : x;
		var right = x + w > this.width ? this.width : x + w;
		var top = y < 0 ? 0 : y;
		var bottom = y + h > this.height ? this.height : y + h;
		canvas.highlightRect(left - this.viewOffsetX, top - this.viewOffsetY,
			right - left, bottom - top, color);
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
				++dataOfs;
			}
		}
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
	// Auto-bulldoze applicable tiles and return the cost if any
	autoBulldoze: function(x, y, w, h, pretend)
	{
		var ix, iy, tile, cost = 0;
		
		for(iy = y; iy < y + h; ++iy)
		{
			for(ix = x; ix < x + w; ++ix)
			{
				tile = this.tiles[iy * this.width + ix];
				if(!tile ||
					tile.road ||
					tile.rail ||
					tile.zone != "none")
					continue;
				if(tile.groundType == "forest" ||
					tile.line)
				{
					if(tile.bulldoze(pretend))
						cost += game.rules.cost.bulldoze;
				}
			}
		}
		return cost;
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
		
		// Try to zone off all of the tiles to make sure it will work
		var ix, iy, tile;
		for(iy = top; iy < bottom; ++iy)
		{
			for(ix = left; ix < right; ++ix)
			{
				tile = this.tiles[iy * this.width + ix];
				if(tile.buildZone(zoneType, (iy - top) * info.width + (ix - left), true) < 0)
					return cost;
			}
		}
		
		// Actually zone off all of the tiles
		for(iy = top; iy < bottom; ++iy)
		{
			for(ix = left; ix < right; ++ix)
			{
				tile = this.tiles[iy * this.width + ix];
				cost += tile.buildZone(zoneType, (iy - top) * info.width + (ix - left), pretend);
			}
		}
		
		// Walk the edges and reset tiles and redraw the whole area
		if(!pretend)
		{
			for(ix = left - 1; ix <= right; ++ix)
			{
				if(top > 0)
					this.tiles[(top - 1) * this.width + ix].resetAllTiles();
				if(top < this.height - 1)
					this.tiles[(top + 1) * this.width + ix].resetAllTiles();
			}
			for(iy = top; iy < bottom; ++iy)
			{
				if(left > 0)
					this.tiles[top * this.width + ix - 1].resetAllTiles();
				if(left < this.width - 1)
					this.tiles[top * this.width + ix + 1].resetAllTiles();
			}
			this.drawRect(left - 1, top - 1, info.width + 2, info.height + 2);
		}
		
		cost += game.rules.cost.zones[zoneType];
		return cost;
	}
};
