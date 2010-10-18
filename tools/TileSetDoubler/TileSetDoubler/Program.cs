using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

namespace TileSetDoubler
{
	class Program
	{
		static void Help()
		{
			System.Console.WriteLine(@"
Usage: TileSetDoubler input_file output_file alpha_file

Creates a double-sized copy of input_file and saves this to output_file. A
copy of input_file with alpha correction is saved to alpha_file. In this
process, any pixel matching the bottom-right pixel will be made transparent.
");
		}
		static int Main(string[] args)
		{
			if(args.Length != 3)
			{
				Help();
				return 1;
			}

			Bitmap input = new Bitmap(args[0]);
			Bitmap output = new Bitmap(input.Width * 2, input.Height * 2, PixelFormat.Format32bppArgb);
			Bitmap outputAlpha = new Bitmap(input.Width, input.Height, PixelFormat.Format32bppArgb);
			Color transparentPixel = input.GetPixel(input.Width - 1, input.Height - 1);
			
			for(int iy = 0; iy < input.Height; ++iy)
			{
				for(int ix = 0; ix < input.Width; ++ix)
				{
					Color pixel = input.GetPixel(ix, iy);
					output.SetPixel(ix * 2 + 0, iy * 2 + 0, pixel);
					output.SetPixel(ix * 2 + 1, iy * 2 + 0, pixel);
					output.SetPixel(ix * 2 + 0, iy * 2 + 1, pixel);
					output.SetPixel(ix * 2 + 1, iy * 2 + 1, pixel);
					if(pixel == transparentPixel)
						outputAlpha.SetPixel(ix, iy, Color.FromArgb(0, pixel));
					else
						outputAlpha.SetPixel(ix, iy, pixel);
				}
			}
			output.Save(args[1]);
			outputAlpha.Save(args[2]);

			return 0;
		}
	}
}
