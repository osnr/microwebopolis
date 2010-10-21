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
		$("#toolboxRail")
			.data("tool", "rail")
			.data("iconlow", "img/icrail.png")
			.data("iconhi", "img/icrailhi.png")
			.click(this.toolboxButton);
		$("#toolboxLine")
			.data("tool", "line")
			.data("iconlow", "img/icwire.png")
			.data("iconhi", "img/icwirehi.png")
			.click(this.toolboxButton);
		$("#toolboxCoal")
			.data("tool", "zone4x4")
			.data("param", "coal")
			.data("iconlow", "img/iccoal.png")
			.data("iconhi", "img/iccoalhi.png")
			.click(this.toolboxButton);
		$("#toolboxNuclear")
			.data("tool", "zone4x4")
			.data("param", "nuclear")
			.data("iconlow", "img/icnuc.png")
			.data("iconhi", "img/icnuchi.png")
			.click(this.toolboxButton);
		$("#toolboxSeaport")
			.data("tool", "zone4x4")
			.data("param", "seaport")
			.data("iconlow", "img/icseap.png")
			.data("iconhi", "img/icseaphi.png")
			.click(this.toolboxButton);
		$("#toolboxStadium")
			.data("tool", "zone4x4")
			.data("param", "stadium")
			.data("iconlow", "img/icstad.png")
			.data("iconhi", "img/icstadhi.png")
			.click(this.toolboxButton);
		$("#toolboxAirport")
			.data("tool", "zone6x6")
			.data("param", "airport")
			.data("iconlow", "img/icairp.png")
			.data("iconhi", "img/icairphi.png")
			.click(this.toolboxButton);
		$("#toolboxResidential")
			.data("tool", "zone3x3")
			.data("param", "residential")
			.data("iconlow", "img/icres.png")
			.data("iconhi", "img/icreshi.png")
			.click(this.toolboxButton);
		$("#toolboxCommercial")
			.data("tool", "zone3x3")
			.data("param", "commercial")
			.data("iconlow", "img/iccom.png")
			.data("iconhi", "img/iccomhi.png")
			.click(this.toolboxButton);
		$("#toolboxIndustrial")
			.data("tool", "zone3x3")
			.data("param", "industrial")
			.data("iconlow", "img/icind.png")
			.data("iconhi", "img/icindhi.png")
			.click(this.toolboxButton);
		$("#toolboxPolice")
			.data("tool", "zone3x3")
			.data("param", "police")
			.data("iconlow", "img/icpol.png")
			.data("iconhi", "img/icpolhi.png")
			.click(this.toolboxButton);
		$("#toolboxFire")
			.data("tool", "zone3x3")
			.data("param", "fire")
			.data("iconlow", "img/icfire.png")
			.data("iconhi", "img/icfirehi.png")
			.click(this.toolboxButton);
		$("#toolboxPark")
			.data("tool", "zone1x1")
			.data("param", "park")
			.data("iconlow", "img/icpark.png")
			.data("iconhi", "img/icparkhi.png")
			.click(this.toolboxButton);
		$(".toolbox-icon").each(function()
		{
			$(this).css("background-image", "url('" + $(this).data("iconlow")
				+ "')");
		});
		this.currentTool = this.toolDefs.bulldozer;
		$("#toolboxBulldozer")
			.css("background-image", "url('" +
				$("#toolboxBulldozer").data("iconhi") + "')");
		
		// Other toolbox components
		$("#zoomSlider")
			.slider({
				min: 1,
				max: 5,
				range: "min",
				value: 3,
				slide: this.zoomSlider
			});
		$("#saveButton")
			.button()
			.click(this.saveButton);
		
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
		
		dialog.init();
	},
	saveButton: function(e, ui)
	{
		game.save();
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
		var cost = this.currentTool.doIt(x, y, true);
		var left = x - ((this.currentTool.width / 2) | 0);
		var top = y - ((this.currentTool.height / 2) | 0);
		var screenPos = game.map.mapToScreenLocation(left, top);
		$("#priceOverlay")
			.css("display", "block")
			.css("left", screenPos.x)
			.css("top", screenPos.y - 40)
			.text("$" + cost);
		game.map.highlightRect(left, top, this.currentTool.width,
			this.currentTool.height, this.currentTool.hoverColor);

		if(cost > 0)
			$("#canvas").css("cursor", "pointer");
		else
			$("#canvas").css("cursor", "not-allowed");
	},
	toolBlur: function(x, y)
	{
		var left = x - ((this.currentTool.width / 2) | 0);
		var top = y - ((this.currentTool.height / 2) | 0);
		$("#priceOverlay")
			.css("display", "none");
		game.map.drawRect(left, top, this.currentTool.width,
			this.currentTool.height);
	},
	toolDo: function(x, y)
	{
		this.toolBlur(x, y);
		var cost = this.currentTool.doIt(x, y, false);
		game.state.chargeFunds(cost);
		this.toolHover(x, y);
	},
	toolboxButton: function(e)
	{
		var target = $(e.currentTarget);
		ui.currentTool = ui.toolDefs[target.data("tool")];
		ui.currentTool.param = target.data("param");
		$(".toolbox-icon").each(function()
		{
			$(this).css("background-image", "url('" + $(this).data("iconlow") + "')");
		});			
		target.css("background-image", "url('" + target.data("iconhi") + "')");
	},
	zoomSlider: function(e, ui)
	{
		var zoomLevel = ui.value;
		canvas.zoom(zoomLevel);
		game.redrawEverything();
		if(zoomLevel == 1)
			zoomLevel = "1/4";
		else if(zoomLevel == 2)
			zoomLevel = "1/2";
		else
			zoomLevel -= 2;
		if(zoomLevel == 3)
			zoomLevel++;
		$("#zoomTitle").text("Zoom: " + zoomLevel + "x");
	},
	update: function()
	{
		var zoomLevel = canvas.zoomLevel;
		$("#zoomSlider").slider("option", "value", zoomLevel);
		if(zoomLevel == 1)
			zoomLevel = "1/4";
		else if(zoomLevel == 2)
			zoomLevel = "1/2";
		else
			zoomLevel -= 2;
		if(zoomLevel == 3)
			zoomLevel++;
		$("#zoomTitle").text("Zoom: " + zoomLevel + "x");
	},
	toolDefs:
	{
		bulldozer:
		{
			width: 1,
			height: 1,
			hoverColor: Color.red,
			doIt: function(x, y, pretend)
			{
				return game.map.bulldozeTile(x, y, pretend);;
			}
		},
		road:
		{
			width: 1,
			height: 1,
			hoverColor: Color.gray,
			doIt: function(x, y, pretend)
			{
				return game.map.buildRoad(x, y, pretend);
			}
		},
		rail:
		{
			width: 1,
			height: 1,
			hoverColor: Color.gray,
			doIt: function(x, y, pretend)
			{
				return game.map.buildRail(x, y, pretend);
			}
		},
		line:
		{
			width: 1,
			height: 1,
			hoverColor: Color.gray,
			doIt: function(x, y, pretend)
			{
				return game.map.buildLine(x, y, pretend);
			}
		},
		zone1x1:
		{
			width: 1,
			height: 1,
			hoverColor: Color.orange,
			doIt: function(x, y, pretend)
			{
				return game.map.buildZone(x, y, pretend, this.param);
			}
		},
		zone3x3:
		{
			width: 3,
			height: 3,
			hoverColor: Color.orange,
			doIt: function(x, y, pretend)
			{
				return game.map.buildZone(x, y, pretend, this.param);
			}
		},
		zone4x4:
		{
			width: 4,
			height: 4,
			hoverColor: Color.orange,
			doIt: function(x, y, pretend)
			{
				return game.map.buildZone(x, y, pretend, this.param);
			}
		},
		zone6x6:
		{
			width: 6,
			height: 6,
			hoverColor: Color.orange,
			doIt: function(x, y, pretend)
			{
				return game.map.buildZone(x, y, pretend, this.param);
			}
		}		
	}
};
