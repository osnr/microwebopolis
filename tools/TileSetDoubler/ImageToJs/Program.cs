using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Drawing;

namespace ImageToJs
{
	class Program
	{
		static void Help()
		{
			Console.WriteLine(@"
Usage: ImageToJs.exe input_file

This program actually generates a tile set average color from the tiles
in the input file. The tiles are assumed to be 16 by 16 pixels each. The
output is a JavaScript array with all of the tile's colors.
");
		}
		static void Main(string[] args)
		{
			if(args.Length != 1)
			{
				Help();
				return;
			}
			Bitmap input = new Bitmap(args[0]);
			int ix, iy, w = input.Width / 16, h = input.Height / 16;
			for(iy = 0; iy < h; ++iy)
			{
				for(ix = 0; ix < w; ++ix)
				{
					int r = 0, g = 0, b = 0;
					int px, py;
					for(py = iy * 16; py < (iy + 1) * 16; ++py)
					{
						for(px = ix * 16; px < (ix + 1) * 16; ++px)
						{
							Color p = input.GetPixel(px, py);
							r += p.R;
							g += p.G;
							b += p.B;
						}
					}
					r /= 256;
					g /= 256;
					b /= 256;
					Console.Write(r + "," + g + "," + b + ",");
				}
			}
		}
	}
}
