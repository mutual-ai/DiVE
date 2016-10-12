Please cite the software if you are using it in your scientific publication:

[![DOI](https://zenodo.org/badge/69663950.svg)](https://zenodo.org/badge/latestdoi/69663950)


# DiVE   -  Interactive Visualization of Embedded Data

 
DiVE is an interactive 3D web viewer of up to million points on one screen that represent data. It is meant to provide interaction for viewing high-dimensional data that has been previously [embedded](https://en.wikipedia.org/wiki/Nonlinear_dimensionality_reduction) in 3D. For embedding (non-linear dimensionality reduction, or manifold learning) we recommend [LargeVis](http://github.com/sonjageorgievska/LargeVis/) (a new algorithm by Microsoft Research, ) or [tSNE](https://github.com/lvdmaaten/bhtsne) .       

For an online demo click  [here](http://sonjageorgievska.github.io/DiVE/ "online demo"). Or open index.html in Mozzila Firefox to run a demo on your local computer.   


##Installation##

The simplest way is to have the Mozilla Firefox browser installed and to open *index.html* with it.   

If you would like to use Google Chrome or any other browser, you would have to

1. Install *node* server from [http://nodejs.org](http://nodejs.org) 
2. Go to the main folder of *DiVE* with your command line interpreter (where *index.htm*l is)
3. type `node server.js` 
4. open your browser and type `http://localhost:8082/index.html` 

## Data description and functionality ##

* Every point has 3 coordinates and a unique ID.
 
* A point also has  “Properties”:
 
  - “Properties” is a list of real numbers or strings, which can be empty. Each number represents the intensity of a respective property, and each string a certain information. The 		numbers are used in the Coloring section of the UI of the web-page. When the user selects a real-numbered property, and a color, every point is 	  colored with a shade of the selected color. The intensity of the color corresponds to the intensity of the selected 			property for the particular point. When the user selects a string-valued property, a mapping from strings to colors is performed and the points a coloured based on the value of the string. 

## User interaction ##
### Search ###
* A user can search for all points that contain a certain substring in their ids, names or properties, by using the Search section. Then all points that are a match become red, and the rest become grey. One can search also for boolean expressions of regular expressions. An example of a boolean expression is `xx AND yy OR NOT zz`, where xx, yy, and zz are regular expressions and NOT binds more than AND, which binds more than OR. In this case all points that contain in their metadata the regular espressions xx and yy, or that do not contain zz, will be coloured in red. 

* Show only found nodes will show only the nodes that result from the search.
  
* The “Resume colors” button at the bottom return the colors of the points to the previous coloring scheme. 

### Visualization options ###

* Centralize  : will move data back to center of the screen
* Point size attenuation: very useful when the user has zoomed-in enough. When this option is not selected, the points do not get bigger as the camera moves closer to them, so that they can be separated and inspected individually. 
* Show point info in popup : when de-selected, the information about a point whne hovering over it will be displayed at the top left corner of the screen rather than in a pop-up message

### Coloring by intensity of property###

As explained in section "Data description and functionality" .

## Data format ##

- The data is in a JSON (JavaScript Object Notation)  format. (See folder *data* for  examples.)
To obtain *data.js*, first a data structure

		Dictionary<string, Point>

is created in any programming language, where the keys are the id’s of the points and `Point` is an object of the class 
  
		public class Point
		    {
		        public List<double> Coordinates;
		        public List<object> Properties;
		    }

`Coordinates` and `Properties` are as discussed in the previous section.

Next, the dictionary is serialized using JavaScriptSerializer and written in *data.json* (name is flexible). 
Here is an example of an entry of the serialized dictionary in a *data.json* file:

		"3951":{"Coordinates":[0.99860800383893167,0.61276015046241838,0.450976426942296],
			"Properties":["Prototheca cutis","Prototheca cutis", 46.2, "Prototheca", 34.78]}

## From output of LargeVis to input of DiVE ##

The output of LargeVis is a text file - every line has the id of the point, and 3 coordinates (real numbers). Only the first line is an exception: it contains the number of points and the dimension. Here is an example:

		4271 3
		0 -33.729916 17.692684 17.466749
		1 -32.923210 17.249269 18.111458
		2 -33.464798 18.028067 17.385750

This file is combined with a *fasta* - formatted file to obtain the input file of DiVE. The *faste* file contains the properties of the points. Here is an example of two entries in a *fasta* file:
		
		>0|Rhodotorula glutinis|0|4|16098894|0|Rhodotorula glutinis|3|CBS 20|0.998|5|0.998|0|True|0||False|5|0.998|1.3333333335197E-06|True|1|603|0|-1|Rhodotorula||Sporidiobolales|Microbotryomycetes
		aacaaggtttccgtaggtgaacctgcggaaggatcattagtgaatataggccgtccaacttaacttggagtccgaactctcactttctaaccctgtgcatctgttaattggactagtagctcttcggagtgaaccgccattcacttataaacacaaagtctatgaatgtatacaaatttataacaaaacaaaactttcaacaacggatctcttggctctcgcatcgatgaagaacgcagcgaaatgcgatacgtaatgtgaattgcagaattcagtgaatcatcgaatctttgaacgcaccttgcgctccttggtattccgaggagcatgcctgtttgagtgtcatgaaatcttcaacccacctctttcttagtgaatctggtggtgcttggtttctgagcgctgctctgcttcggcttagctcgttcgtaatgcattagcatccgcaaccgaacttcggattgacttggcgtaatagactattcgctgaggattctagtttactagagccgagttgggttaaaggaagctcctaatcctaaagtctattttttgattagatctcaaatcaggtaggactacccgctgaacttaagcatataa
	>0|Rhodotorula glutinis|1|5|12688892|0|Rhodotorula glutinis|3|CBS 20|0.998|5|1|0|True|0||False|5|1|1.3333333335197E-06|True|1|518|0|-1|Rhodotorula||Sporidiobolales|Microbotryomycetes
	gtgaatataggacgtccaacttaacttggagtccgaactctcactttctaaccctgtgcatctgttaattggactagtagctcttcggagtgaaccgccattcacttataaacacaaagtctatgaatgtatacaaatttataacaaaacaaaactttcaacaacggatctcttggctctcgcatcgatgaagaacgcagcgaaatgcgatacgtaatgtgaattgcagaattcagtgaatcatcgaatctttgaacgcaccttgcgctccttggtattccgaggagcatgcctgtttgagtgtcatgaaatcttcaacccacctctttcttagtgaatctggtggtgcttggtttctgagcgctgctctgcttcggcttagctcgttcgtaatgcattagcatccgcaaccgaacttcggattgacttggcgtaatagactattcgctgaggattctagtttactagagccgagttgggttaaaggaagctcctaatcctaaagtctattttttga

The `>` characters denotes a new point data. The number after the second `|` character is the ID of the point. The rest of the strings are properties of the point, two properties being separated by a `|` character. 
The second line of a point (in the example above the line starting with `aacaagg`) is ignored and not included in the properties. 

## Licence ##
The software is released under the Creative Commons Attribution-NoDerivatives licence.
Contact the author if you would like a version with an Apache licence. 

