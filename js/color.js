function Color(r, g, b)
{
	this.r = r;
	this.g = g;
	this.b = b;
}
Color.prototype =
{
	rgbaString: function(a)
	{
		return "rgba(" + this.r + "," + this.g + "," + this.b + "," + a + ")";
	},
	rgbString: function()
	{
		return "rgb(" + this.r + "," + this.g + "," + this.b + ")";
	}
};
Color.red = new Color(255, 0, 0);
Color.green = new Color(0, 255, 0);
Color.blue = new Color(0, 0, 255);
Color.yellow = new Color(255, 255, 0);
Color.purple = new Color(255, 0, 255);
Color.teal = new Color(0, 255, 255);
Color.white = new Color(255, 255, 255);
Color.gray = new Color(127, 127, 127);
Color.orange = new Color(255, 127, 0);
