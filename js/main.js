var game =
{
	map: null,
	state: null,
	rules: null,
	init: function()
	{
		this.rules = rules.base;
		ui.init();
		if(!canvas.init())
			return;
		ui.update();
		this.map = new Map(128, 128, {});
		ui.resize();
		this.redrawEverything();
		this.state = new GameState();
		this.state.updateUI();
	},
	redrawEverything: function()
	{
		this.map.draw();
	}
}

$(window).load(function(){game.init();});
