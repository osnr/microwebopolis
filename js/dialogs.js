var dialogs =
{
	init: function()
	{
		this.generateMap.init();
	},
	generateMap:
	{
		// Notes on Min and Max Values, Default Values
		// Forest: 0 - 250, 100
		// Lakes: 0 - 30, 5
		// River: 20 - 100, 50
		init: function()
		{
			$("#generateNewMap")
				.dialog({
					autoOpen: true,
					modal: true,
					resizable: false,
					title: "Generate a New Map",
					width: 600,
					buttons: {
						"Generate": this.generate,
						"Randomize": this.randomize,
						"Ok": this.ok
					}
				});
			$("#forestSlider")
				.slider({
					min: 0,
					max: 250,
					range: "min",
					value: 100
				});
			$("#lakesSlider")
				.slider({
					min: 0,
					max: 30,
					range: "min",
					value: 5
				});
			$("#riverSlider")
				.slider({
					min: 20,
					max: 100,
					range: "min",
					value: 50
				});
		},
		generate: function(e)
		{
			game.map.generateMap(
				$("#forestSlider").slider("option", "value"),
				$("#lakesSlider").slider("option", "value"),
				$("#riverSlider").slider("option", "value"),
				false
			);
			canvas.miniMapFlush();
			game.map.draw();
		},
		randomize: function(e)
		{
			$("#forestSlider")
				.slider("option", "value",
					rand($("#forestSlider").slider("option", "max") + 1) +
					$("#forestSlider").slider("option", "min")
				);
			$("#lakesSlider")
				.slider("option", "value",
					rand($("#lakesSlider").slider("option", "max") + 1) +
					$("#lakesSlider").slider("option", "min")
				);
			$("#riverSlider")
				.slider("option", "value",
					rand($("#riverSlider").slider("option", "max") + 1) +
					$("#riverSlider").slider("option", "min")
				);
			dialogs.generateMap.generate(e);
		},
		ok: function(e)
		{
			$(this).dialog("close");
		}
	}
};
