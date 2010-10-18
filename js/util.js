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
var dirOfsX = [0, 0, 1, -1, 1, 1, -1, -1];
var dirOfsY = [-1, 1, 0, 0, -1, 1, -1, 1];
