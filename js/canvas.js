var canvas =
{
	width: 0,
	height: 0,
	canvas: null,
	context: null,
	mmCanvas: null,
	mmContext: null,
	mmImageData: null,
	tileset: null,
	tilesetImages: null,
	tilesetPitch: 16,
	tileWidth: 0,
	tileHeight: 0,
	tileWidthBase: 16,
	tileHeightBase: 16,
	tilesWide: 0,
	tilesHigh: 0,
	zoomLevel: 1,
	miniMapFlushDelayMs: 200,
	miniMapDirty: false,
	miniMapRect:
	{
		x: 0,
		y: 0,
		w: 0,
		h: 0
	},
	init: function()
	{
		// Set up the canvas and complain if we can't do it
		this.canvas = document.getElementById("canvas");
		if(this.canvas &&
			this.canvas.getContext)
			this.context = this.canvas.getContext("2d");
		if(!this.canvas ||
			!this.context)
		{
			alert($("#noCanvasMessage").text());
			return false;
		}
		this.mmCanvas = document.getElementById("mapCanvas");
		if(this.mmCanvas &&
			this.mmCanvas.getContext)
		{
			this.mmContext = this.mmCanvas.getContext("2d");
			if(this.mmContext)
			{
				this.mmImageData = this.mmContext.getImageData(0, 0, 128, 128);
				if(!this.mmImageData)
				{
					alert("Failed to acquire memory of Mini Map canvas. Please report this as a bug.");
				}
			}
			else
			{
				alert("Failed to initialize Mini Map canvas. Please report this as a bug.");
			}
			setTimeout(canvas.miniMapUpdateCheck, canvas.miniMapFlushDelayMs);
		}
		else
		{
			alert("Failed to locate Mini Map canvas. Please report this as a bug.");
		}
		
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this.clear();
		
		// Load the tilesets and set zooim level
		this.tilesetImages = [];
		this.tilesetImages[1] = document.getElementById("tileset1x");
		this.tilesetImages[2] = document.getElementById("tileset2x");
		this.tilesetImages[3] = document.getElementById("tileset3x");
		this.tilesetImages[4] = document.getElementById("tileset4x");
		this.zoom(1);
		
		return this.tilesetImages[1] &&
			this.tilesetImages[2] &&
			this.tilesetImages[4];
	},
	miniMapUpdateRect: function(x, y, w, h)
	{
		this.miniMapRect.x = x;
		this.miniMapRect.y = y;
		this.miniMapRect.w = w;
		this.miniMapRect.h = h;
		this.miniMapDirty = true;
	},
	miniMapUpdateCheck: function()
	{
		if(canvas.miniMapDirty)
			canvas.miniMapFlush();
		canvas.miniMapDirty = false;
		setTimeout(canvas.miniMapUpdateCheck, canvas.miniMapFlushDelayMs);
	},
	miniMapTile: function(tile, x, y)
	{
		var baseOfs = ((y * 128) + x) * 4;
		var color = miniMapColors[tile];
		if(!color)
			return;
		this.mmImageData.data[baseOfs + 0] = color.r;
		this.mmImageData.data[baseOfs + 1] = color.g;
		this.mmImageData.data[baseOfs + 2] = color.b;
		this.mmImageData.data[baseOfs + 3] = 255;
		this.miniMapDirty = true;
	},
	miniMapFlush: function()
	{
		this.mmContext.putImageData(this.mmImageData, 0, 0);
		this.mmContext.strokeStyle = "rgba(255,0,0,1)";
		this.mmContext.strokeRect(this.miniMapRect.x, this.miniMapRect.y,
			this.miniMapRect.w, this.miniMapRect.h);
	},
	resize: function(width, height)
	{
		this.width = width;
		this.height = height;
		this.canvas.width = width;
		this.canvas.height = height;
		this.zoom(this.zoomLevel);
	},
	zoom: function(zoom)
	{
		if(zoom < 1 ||
			zoom > 4)
			throw new Error("Invalid zoom level " + zoom);
		this.zoomLevel = zoom;
		this.tileWidth = this.tileWidthBase * this.zoomLevel;
		this.tileHeight = this.tileHeightBase * this.zoomLevel;
		this.tileset = this.tilesetImages[this.zoomLevel];
		this.tilesWide = (this.width / this.tileWidth) | 0;
		if(this.width % this.tileWidth > 0)
			++this.tilesWide;
		this.tilesHigh = (this.height / this.tileHeight) | 0;
		if(this.height % this.tileHeight > 0)
			++this.tilesHigh;
	},
	clear: function()
	{
		this.context.clearRect(0, 0, this.width, this.height);
	},
	blitTile: function(tile, x, y)
	{
		var sx = ((tile % this.tilesetPitch) | 0) * this.tileWidth;
		var sy = ((tile / this.tilesetPitch) | 0) * this.tileHeight;
		var dx = x * this.tileWidth;
		var dy = y * this.tileHeight;
		this.context.drawImage(this.tileset, sx, sy, this.tileWidth, this.tileHeight,
			dx, dy, this.tileWidth, this.tileHeight);
	},
	highlightRect: function(x, y, w, h, color)
	{
		x *= this.tileWidth;
		y *= this.tileHeight;
		w *= this.tileWidth;
		h *= this.tileHeight;
		this.context.strokeStyle = color.rgbString();
		this.context.fillStyle = color.rgbaString(0.25);
		this.context.fillRect(x, y, w, h);
		this.context.strokeRect(x + 1, y + 1, w - 2, h - 2);
	}
};
