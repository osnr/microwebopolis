function addCommas(nStr)
{
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}
function pad(n)
{

	return n<10 ? '0'+n : n
}
function rand(exclusiveMax)
{
	return (Math.random() * exclusiveMax) | 0;
}
function randS16()
{
	return (Math.random() * 65536 - 32768) | 0;
}
var dirOfsX = [0, 0, 1, -1, 1, 1, -1, -1];
var dirOfsY = [-1, 1, 0, 0, -1, 1, -1, 1];
function rotateDir(dir, steps)
{
	var i = 0;
	for(i = 0; i < steps; ++i)
	{
		switch(dir)
		{
			case 0: dir = 4; break;
			case 1: dir = 7; break;
			case 2: dir = 5; break;
			case 3: dir = 6; break;
			case 4: dir = 2; break;
			case 5: dir = 1; break;
			case 6: dir = 0; break;
			case 7: dir = 3; break;
			default:
				throw new Error("Invalid direction number");
				break;
		}
	}
	return dir;
}
Math.clamp = function(x, y, z)
{
	return x < y ? y : x > z ? z : x;
}
