# Combines HTML, JavaScript and CSS files into a single monolithic document

while(<>)
{
	if(/link.+href\=\"([^\"]+)\"/)
	{
		open(INFILE, "<$1") or die $!;
		my @inLines = <INFILE>;
		my $inText = join('', @inLines);
		print "<style type=\"text/css\">\n$inText</style>\n";
		close(INFILE);
	}
	elsif(/script.+src=\"([^\"]+)\"/)
	{
		open(INFILE, "<$1") or die $!;
		my @inLines = <INFILE>;
		my $inText = join('', @inLines);
		print "<script type=\"text/javascript\">\n$inText</script>\n";
		close(INFILE);
	}
	else
	{
		print;
	}
}
