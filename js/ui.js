var ui =
{
	currentTool: null,
	lastMapX: -1,
	lastMapY: -1,
	doButtonDown: false,
	doButtonNumber: 0,
	panButtonDown: false,
	panButtonNumber: 2,
	mapPanButtonNumber: 0,
	mapPanButtonDown: false,
	init: function()
	{
		// Window events
		$(window).resize(function(){ui.resize();});
	
		// Toolbox buttons
		$("#toolboxBulldozer")
			.data("tool", "bulldozer")
			.data("iconlow", "img/icdozr.png")
			.data("iconhi", "img/icdozrhi.png")
			.click(this.toolboxButton);
		$("#toolboxRoad")
			.data("tool", "road")
			.data("iconlow", "img/icroad.png")
			.data("iconhi", "img/icroadhi.png")
			.click(this.toolboxButton);
		$(".toolbox-icon").each(function()
		{
			$(this).css("background-image", "url('" + $(this).data("iconhi")
				+ "')");
		});
		this.currentTool = this.toolDefs.bulldozer;
		$("#toolboxBulldozer")
			.css("background-image", "url('" +
				$("#toolboxBulldozer").data("iconlow") + "')");
		
		// Other toolbox components
		$("#zoomSlider")
			.slider({
				min: 1,
				max: 4,
				range: "min",
				value: 1,
				slide: this.zoomSlider
			});
		
		// City view canvas
		$("#canvas")
			.mousemove(this.cityViewMouseMove)
			.mousedown(this.cityViewMouseDown)
			.mouseup(this.cityViewMouseUp)
			.mouseout(this.cityViewMouseOut);
		
		// Mini map canvas
		$("#mapCanvas")
			.mousemove(this.mapMouseMove)
			.mousedown(this.mapMouseDown)
			.mouseup(this.mapMouseUp)
			.mouseout(this.mapMouseOut);			
	},
	resize: function()
	{
		$("#toolboxWindow").css("height", window.innerHeight - 156);
		canvas.resize(window.innerWidth - 224, window.innerHeight - 20);
		game.map.draw();
	},
	mapMouseDown: function(e)
	{
		if(e.button == ui.mapPanButtonNumber)
		{
			ui.mapPanButtonDown = true;
			ui.centerViewAt(e.offsetX, e.offsetY);
		}
	},
	mapMouseUp: function(e)
	{
		if(e.button == ui.mapPanButtonNumber)
		{
			ui.mapPanButtonDown = false;
		}
	},
	mapMouseOut: function(e)
	{
		ui.mapPanButtonDown = false;
	},
	mapMouseMove: function(e)
	{
		if(ui.mapPanButtonDown)
			ui.centerViewAt(e.offsetX, e.offsetY);
	},
	centerViewAt: function(x, y)
	{
		game.map.centerView(x, y);
	},
	cityViewMouseDown: function(e)
	{
		if(e.button == ui.doButtonNumber)
		{
			var pos = game.map.screenToMapLocation(e.offsetX, e.offsetY);
			ui.doButtonDown = true;
			ui.lastMapX = pos.x;
			ui.lastMapY = pos.y;
			ui.toolDo(pos.x, pos.y);
		}
		else if(e.button == ui.panButtonNumber)
			ui.panButtonDown = true;
	},
	cityViewMouseUp: function(e)
	{
		if(e.button == ui.doButtonNumber)
			ui.doButtonDown = false;
		else if(e.button == ui.panButtonNumber)
			ui.panButtonDown = false;
	},
	cityViewMouseOut: function(e)
	{
		if(ui.lastMapX >= 0 &&
			ui.lastMapY >= 0)
			ui.toolBlur(ui.lastMapX, ui.lastMapY);
		ui.doButtonDown = false;
		ui.lastMapX = -1;
		ui.lastMapY = -1;
		$("#canvas").css("cursor", "default");
	},
	cityViewMouseMove: function(e)
	{
		var pos = game.map.screenToMapLocation(e.offsetX, e.offsetY);
		if(pos.x != ui.lastMapX ||
			pos.y != ui.lastMapY)
		{
			if(ui.lastMapX >= 0 &&
				ui.lastMapY >= 0)
				ui.toolBlur(ui.lastMapX, ui.lastMapY);
			if(ui.panButtonDown &&
				ui.lastMapX >= 0 &&
				ui.lastMapY >= 0)
			{
				game.map.panView(ui.lastMapX - pos.x, ui.lastMapY - pos.y);
				pos = game.map.screenToMapLocation(e.offsetX, e.offsetY);
				ui.lastMapX = pos.x;
				ui.lastMapY = pos.y;
			}
			else
			{
				if(ui.doButtonDown)
					ui.toolDo(pos.x, pos.y);
				ui.toolHover(pos.x, pos.y);
				ui.lastMapX = pos.x;
				ui.lastMapY = pos.y;
			}
		}
	},
	toolHover: function(x, y)
	{
		var cost = this.currentTool.do(x, y, true);
		if(cost > 0)
		{
			// TODO Add price display
			game.map.highlightRect(x, y, this.currentTool.width,
				this.currentTool.height, this.currentTool.hoverColor);
			$("#canvas").css("cursor", "pointer");
		}
		else
		{
			$("#canvas").css("cursor", "not-allowed");
		}
	},
	toolBlur: function(x, y)
	{
		game.map.drawRect(x, y, this.currentTool.width,
			this.currentTool.height);
	},
	toolDo: function(x, y)
	{
		this.toolBlur(x, y);
		var cost = this.currentTool.do(x, y, false);
		game.state.chargeFunds(cost);
		this.toolHover(x, y);
	},
	toolboxButton: function(e)
	{
		var target = $(e.currentTarget);
		ui.currentTool = ui.toolDefs[target.data("tool")];
		$(".toolbox-icon").each(function()
		{
			$(this).css("background-image", "url('" + $(this).data("iconhi") + "')");
		});			
		target.css("background-image", "url('" + target.data("iconlow") + "')");
	},
	zoomSlider: function(e, ui)
	{
		var zoomLevel = ui.value;
		canvas.zoom(zoomLevel);
		game.redrawEverything();
		$("#zoomTitle").text("Zoom: " + zoomLevel + "x");
	},
	update: function()
	{
		var zoomLevel = canvas.zoomLevel;
		if(zoomLevel >= 4)
			--zoomLevel;
		$("#zoomSlider").slider("option", "value", zoomLevel);
		$("#zoomTitle").text("Zoom: " + zoomLevel + "x");
	},
	toolDefs:
	{
		bulldozer:
		{
			width: 1,
			height: 1,
			hoverColor: Color.red,
			do: function(x, y, pretend)
			{
				return game.map.bulldozeTile(x, y, pretend);;
			}
		},
		road:
		{
			width: 1,
			height: 1,
			hoverColor: Color.gray,
			do: function(x, y, pretend)
			{
				return game.map.buildRoad(x, y, pretend);
			}
		}
	}
};
