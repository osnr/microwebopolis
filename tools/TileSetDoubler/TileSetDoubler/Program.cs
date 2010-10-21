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
Usage: TileSetDoubler input_file output_file1x output_file2x output_file3x
       output_file4x output_file_half output_file_quarter

Resizes a tileset to a bunch of different sizes.
");
		}
		static void HalfReduce(Bitmap input, Bitmap output)
		{
			for(int iy = 0; iy < input.Height; iy += 2)
			{
				for(int ix = 0; ix < input.Width; ix += 2)
				{
					int a, r, g, b, denom;
					denom = a = r = g = b = 0;
					Color c = input.GetPixel(ix, iy);
					a += c.A; if(c.A == 255) { r += c.R; g += c.G; b += c.B; ++denom; }
					c = input.GetPixel(ix + 1, iy);
					a += c.A; if(c.A == 255) { r += c.R; g += c.G; b += c.B; ++denom; }
					c = input.GetPixel(ix, iy + 1);
					a += c.A; if(c.A == 255) { r += c.R; g += c.G; b += c.B; ++denom; }
					c = input.GetPixel(ix + 1, iy + 1);
					a += c.A; if(c.A == 255) { r += c.R; g += c.G; b += c.B; ++denom; }
					if(denom < 1)
						denom = 1;
					output.SetPixel(ix / 2, iy / 2, Color.FromArgb(a / 4, r / denom, g / denom, b / denom));
				}
			}
		}
		static int Main(string[] args)
		{
			if(args.Length != 7)
			{
				Help();
				return 1;
			}

			Bitmap input = new Bitmap(args[0]);
			Bitmap output1x = new Bitmap(input.Width, input.Height, PixelFormat.Format32bppArgb);
			Bitmap output2x = new Bitmap(input.Width * 2, input.Height * 2, PixelFormat.Format32bppArgb);
			Bitmap output3x = new Bitmap(input.Width * 3, input.Height * 3, PixelFormat.Format32bppArgb);
			Bitmap output4x = new Bitmap(input.Width * 4, input.Height * 4, PixelFormat.Format32bppArgb);
			Bitmap outputHalf = new Bitmap(input.Width / 2, input.Height / 2, PixelFormat.Format32bppArgb);
			Bitmap outputQuarter = new Bitmap(input.Width / 4, input.Height / 4, PixelFormat.Format32bppArgb);
			Color transparentPixel = input.GetPixel(input.Width - 1, input.Height - 1);
			
			for(int iy = 0; iy < input.Height; ++iy)
			{
				for(int ix = 0; ix < input.Width; ++ix)
				{
					Color pixel = input.GetPixel(ix, iy);
					if(pixel == transparentPixel)
						pixel = Color.FromArgb(0, pixel);

					output1x.SetPixel(ix, iy, pixel);

					output2x.SetPixel(ix * 2 + 0, iy * 2 + 0, pixel);
					output2x.SetPixel(ix * 2 + 1, iy * 2 + 0, pixel);
					output2x.SetPixel(ix * 2 + 0, iy * 2 + 1, pixel);
					output2x.SetPixel(ix * 2 + 1, iy * 2 + 1, pixel);

					output3x.SetPixel(ix * 3 + 0, iy * 3 + 0, pixel);
					output3x.SetPixel(ix * 3 + 1, iy * 3 + 0, pixel);
					output3x.SetPixel(ix * 3 + 2, iy * 3 + 0, pixel);
					output3x.SetPixel(ix * 3 + 0, iy * 3 + 1, pixel);
					output3x.SetPixel(ix * 3 + 1, iy * 3 + 1, pixel);
					output3x.SetPixel(ix * 3 + 2, iy * 3 + 1, pixel);
					output3x.SetPixel(ix * 3 + 0, iy * 3 + 2, pixel);
					output3x.SetPixel(ix * 3 + 1, iy * 3 + 2, pixel);
					output3x.SetPixel(ix * 3 + 2, iy * 3 + 2, pixel);

					output4x.SetPixel(ix * 4 + 0, iy * 4 + 0, pixel);
					output4x.SetPixel(ix * 4 + 1, iy * 4 + 0, pixel);
					output4x.SetPixel(ix * 4 + 2, iy * 4 + 0, pixel);
					output4x.SetPixel(ix * 4 + 3, iy * 4 + 0, pixel);
					output4x.SetPixel(ix * 4 + 0, iy * 4 + 1, pixel);
					output4x.SetPixel(ix * 4 + 1, iy * 4 + 1, pixel);
					output4x.SetPixel(ix * 4 + 2, iy * 4 + 1, pixel);
					output4x.SetPixel(ix * 4 + 3, iy * 4 + 1, pixel);
					output4x.SetPixel(ix * 4 + 0, iy * 4 + 2, pixel);
					output4x.SetPixel(ix * 4 + 1, iy * 4 + 2, pixel);
					output4x.SetPixel(ix * 4 + 2, iy * 4 + 2, pixel);
					output4x.SetPixel(ix * 4 + 3, iy * 4 + 2, pixel);
					output4x.SetPixel(ix * 4 + 0, iy * 4 + 3, pixel);
					output4x.SetPixel(ix * 4 + 1, iy * 4 + 3, pixel);
					output4x.SetPixel(ix * 4 + 2, iy * 4 + 3, pixel);
					output4x.SetPixel(ix * 4 + 3, iy * 4 + 3, pixel);
				}
			}

			output1x.Save(args[1]);
			output2x.Save(args[2]);
			output3x.Save(args[3]);
			output4x.Save(args[4]);

			HalfReduce(output1x, outputHalf);
			HalfReduce(outputHalf, outputQuarter);
			outputHalf.Save(args[5]);
			outputQuarter.Save(args[6]);

			return 0;
		}
	}
}
