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
       output_file4x

Creates a double-sized copy of input_file and saves this to output_file. A
copy of input_file with alpha correction is saved to alpha_file. In this
process, any pixel matching the bottom-right pixel will be made transparent.
");
		}
		static int Main(string[] args)
		{
			if(args.Length != 5)
			{
				Help();
				return 1;
			}

			Bitmap input = new Bitmap(args[0]);
			Bitmap output1x = new Bitmap(input.Width, input.Height, PixelFormat.Format32bppArgb);
			Bitmap output2x = new Bitmap(input.Width * 2, input.Height * 2, PixelFormat.Format32bppArgb);
			Bitmap output3x = new Bitmap(input.Width * 3, input.Height * 3, PixelFormat.Format32bppArgb);
			Bitmap output4x = new Bitmap(input.Width * 4, input.Height * 4, PixelFormat.Format32bppArgb);
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

			return 0;
		}
	}
}
