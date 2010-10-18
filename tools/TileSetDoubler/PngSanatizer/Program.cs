using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;
using System.Drawing;
using System.Drawing.Imaging;

namespace PngSanatizer
{
	class Program
	{
		static void Main(string[] args)
		{
			string[] pngFiles = Directory.GetFiles(
				System.Environment.CurrentDirectory,
				"*.png", SearchOption.TopDirectoryOnly);
			foreach(string fileName in pngFiles)
			{
				System.Console.WriteLine("Processing file " + fileName);
				FileStream stream = File.OpenRead(fileName);
				Bitmap img = new Bitmap(stream);
				stream.Close();
				img.Save(fileName + ".bmp", ImageFormat.Bmp);
			}
			System.Console.ReadLine();
		}
	}
}
