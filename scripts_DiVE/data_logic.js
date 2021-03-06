 /** Initiates the global variables
  */
function InitGlobalDataVariables() {           
            pointsSet = undefined;       
            previousColor = [];
            previoslyhoveredNode = undefined;                                
            selectedPropertyIndex = undefined;//holds the index of the most recently selected numerical property (by the user)
            previousColor = [];//used in resume colors            
            searchExprWellDefined = undefined;
            allNodes = [];
            foundNodes = [];
            labelsForColorsDict = undefined;
            colorsChildrenIds = undefined;
            entriesColor = undefined;            
        }

        

 /** Loads data from file and makes initializations necessary to render data points
      @param {file} file - The file selected by the user
 */
 function LoadDataFromFile(file) {
        var reader = new FileReader();
        reader.readAsText(file);
         dataFileName = file.name;
         dataset = dataFileName.split("_");
         dataset = dataset[0];
         reader.onloadend = function (e) {
             RemoveColorMap();
             var contents = e.target.result;
             InitGlobalDataVariables();
             var data = JSON.parse(contents);
             defineCombo(data);
             InitDrawing(data);
             loadFirstTime = false;
     }
 }
        /** Initializes rendering frame and draws the graph in an initial scene
         * @param {dictionary} data - The dictionary of points as loaded from the json file
         */
 function  InitDrawing(data) {
           
            LoadDataInGraph(data);
            if (loadFirstTime) {
                DefineRenderFrame(frameStartsAt);
            }
            redrawInitialScene(false);
        }
       
       

        /** Loads only the points that result from a search in the graph. At least 15 nodes are loaded, however. */
        function LoadOnlyFoundNodes() {
            RemoveAllNodes();
            for (var i = 0; i < foundNodes.length; i++) {
                graph.addNode(foundNodes[i]);
            }
            var n = graph.getNodes().length;
            //cause it does not work well for a small amount of nodes (problem with the graphics)
            if (n < 15)
            {
                for (var i = 0; i < 15 - n; i++)
                {
                    graph.addNode(allNodes[i]);
                }
            }
        }

        /** Loads all points from the data file in the graph */
        function LoadAllNodes() {
            for (var i = 0; i < allNodes.length; i++) {
                graph.addNode(allNodes[i]);
            }
        }

        /**Initializes the graph */
        function InitializeGraph(size_attenuation, node_size) {
            return G.graph({
                sizeAttenuation: size_attenuation,//whether to change the size of the nodes for a 3D effect or not
                //nodeImage: "imgs/disc.png",
                nodeImageTransparent: true,
                antialias: true,
                bgColor: 'lightgrey',//'lightskyblue',
                nodeSize: node_size,//10,//0.016,//change to 10 if sizeAttenuation = false, otherwise the nodes are too small and not visible
                edgeWidth: 0.005,//change to 1 if sizeAttenuation = false. Update 11/10/2016: This should be programmed. 
                hover: function (node) {//what should happen when a user hovers over a node with the mouse
                    HandleNodeHovering(node);
                }/*,
                mousedown: function (node) {//what should happen when a user clicks on a node. Disabled at the moment
                    HandleNodeClicking(node);
                }*/
            });
        }
      
        /** Defines what happens when a user hovers over a node (point)
         * @param {Graph.node} node - a node from the graph that was hovered over
        */
        function HandleNodeHovering(node) {
            if (previoslyhoveredNode != undefined)//if some node was hovered before, return its color
            { previoslyhoveredNode.setColorHex("#" + previosHoveredcolor); }
            previosHoveredcolor = node.getColor();
            previoslyhoveredNode = node;
            node.setColor("white");//make hovered node white
            redrawSameScene();
            var categories = node._categoriesValues;
            var text = node.getId(); //+ "<br>" + props[0] + "<br>" + props[2] + "<br>" + props[4]            
            //if (node._expandable) { text = "Click to open! <br> " + text; }
            var showInPopup = $('input[name="whatInPopup"]:checked').val();
            if (showInPopup == "image") {
                //$("#label").text("");
                //for (var i = 0; i < categories.length; i++) { text += "<br>" + categories[i]; }
                //$("#label").text("");
                var id = text;
                var baseID = id;
                baseID = baseID.substr(0, baseID.lastIndexOf('.'));
                var imagesFolder = "data/images_" + dataset;
                var fingerprintsFolder = "data/fingerprints_" + dataset;
                image_text = "<img src=\"" + imagesFolder + "/" + baseID + ".jpg" + "\" alt=\"Image cannot be loaded\" style=\"width:304px;height:228px;\">";
                fingerprint_text = "<img src=\"" + fingerprintsFolder + "/" + baseID + ".png" + "\" alt=\"Image not found\" style=\"width:304px;height:228px;\">";
                //text = text + "<br>" + image_text + "<br>" + fingerprint_text;
                text = text + "<br>" + fingerprint_text;
                myPop.attachHTML(text);
                myPop.show(cursorX, cursorY, 0, 0); //params are: x, y, width, height. 3 and 5 are number of pixels relative to the node where the message should appear(you can play with these numbers)
            }
            else {
                if (showInPopup == "text") {
                    $("#label").text("");
                    for (var i = 0; i < categories.length; i++) { text += "<br>" + categories[i]; }
                    myPop.attachHTML(text);
                    myPop.show(cursorX, cursorY, 0, 0); //params are: x, y, width, height. 3 and 5 are number of pixels relative to the node where the message should appear(you can play with these numbers)
                }
            }
            if (showInPopup !== "text") {
                var text = node.getId();
                for (var i = 0; i < categories.length; i++) { text += " ; " + categories[i]; }
                $("#label").text("Point info:  " + text);
            }
        }

        /** Prepares the initial colors of the points based on their coordinates. Optional. 
        * @param {list} coords - The three coordinates of the point 
        */
        function PrepareColorZero(coords) {
            var red = Math.floor((coords[0] * coords[0] * 1643 % 256) + 1);
            var green = Math.floor((coords[1] * coords[1] * 328 % 256) + 1);
            var blue = Math.floor((coords[2] * coords[2] * 487 % 256) + 1);
            return "rgb(" + red + "," + green + "," + blue + ")";
        }
              
        /** Takes a point from data and makes a node of the graph out of it 
         * @param {list} data - a list of points
         * @param {string} key - the id of the point
         * @param {string} colorpoint - the desired color of the point
        */
        function PrepareNodeAndAddIt(data, key, colorPoint) {
            var point = data[key];
            var pointid = key;
            var coords = point.Coordinates;
            if (coords.length == 2)
            {
                coords.unshift(0.1);
            }
            var nodecategories = point.Categories;
            if (point.Categories != undefined && point.Categories != [])
                { nodecategories = point.Categories; }
            else
                { nodecategories = point.Properties; }
            var nodeProperties = point.Properties;
            var node = G.node(coords, {
                id: pointid,
                categoriesValues: nodecategories,
                propertiesValues: nodeProperties,
                color: colorPoint,
            });
            node.addTo(graph);
            var node = graph.getNode(key);
            node.setColor(colorPoint);
        }

        
        /**Loads all data in the graph 
         * @param {dictionary} data - the data as loaded from the json file
        */
        function LoadDataInGraph(data) {
            RemoveAllNodes();
            var maxCoordinate = FindMaxCoordinate(data);

            var level = 0;
            for (var key in data) {
                if (key != "NamesOfProperties") {
                    AddNode(data, key,  maxCoordinate);
                }

            }
            var nodes = graph.getNodes();
            for (var i = 0 ; i < nodes.length; i++)
            {
                allNodes.push(nodes[i]);
            }
        }
        
        function FindMaxCoordinate(data) {
            var maxCoordinate = 0;
            for (var key in data) {
                if (key != "NamesOfProperties") {
                    var point = data[key];
                    var coords = point.Coordinates;
                    for (var i = 0; i < coords.length; i++) {
                        if (Math.abs(coords[i]) > maxCoordinate) {
                            maxCoordinate = Math.abs(coords[i]);
                        }
                    }
                }
            }
            return maxCoordinate;
        }


        /**Adds a node from data into the graph
         * @param {dictionary} data - the data as loaded from the json file
         * @param {string} key - the ID of the node
         */
        function AddNode(data, key, maxCoordinate) {
            var point = data[key];
            var coords = point.Coordinates;
            for (var i = 0; i < coords.length; i++)
            {
                coords[i] /= maxCoordinate;
            }
            var colorNode = PrepareColorZero(coords);
            PrepareNodeAndAddIt(data, key, colorNode);
        }


        /**
         * Removes all nodes from the graph. The graph is empty afterwards
         */
        function RemoveAllNodes() {
            var numberOfNodes = graph.getNodes().length;
            for (var i = 0; i < numberOfNodes; i++) {
                graph.removeLastNode();
            }
        }

        function ColorizeCategoricalOrNumerical(col, indexOfProperty)
        {
            isPropertyCategorical = CheckIfPropertyIsCategorical(indexOfProperty);
            if (isPropertyCategorical){
                ColorizeCategory(indexOfProperty);
            }
            else {
                if (col == undefined) { col = "grey";}
                Colorize(col, indexOfProperty);
            }

        }

        function CheckIfPropertyIsCategorical(indexOfProperty){
            var isCategorical = false;
            for (var i = 0; i < graph._nodes.length; i++) {
                var value = graph._nodes[i]._propertiesValues[indexOfProperty];
                var isNotANumber = isNaN(value);
                if (isNotANumber){
                    isCategorical = true;
                    break;
                }
            }
            return isCategorical;
        }

        function ColorizeCategory(indexOfProperty) {
            colorsDict = [];
            textColorDict = [];
            entriesColor = [];
            var count30 = 0;
            for (var i = 0; i < graph._nodes.length; i++) {
                var node = graph._nodes[i];
                var key = node._propertiesValues[indexOfProperty];
                if (key == "") { key = "No entry" }
                if (key in entriesColor) {
                    entriesColor[key] += 1;
                }
                else {                  
                    entriesColor[key] = 1;                    
                }
            }
            var thirthyth_largest = 0;
            if (Object.keys(entriesColor).length > 5000) {//if number of colors is greater than 5000
                thirthyth_largest = 0.0033 * Object.keys(entriesColor).length;
            }
            else {
                thirthyth_largest = findKthLargest(Object.values(entriesColor), 30);
            }
            var numberOfColors = Object.keys(entriesColor).length;
            var colors = getColors(numberOfColors);
            //var first10colors = ["blue", "green", "red", "yellow", "purple", "orange", "pink", "brown", "tirquize", "magenta"];
            
            // https://www.gavick.com/documentation/joomla/templates/customization/change-background-images 
            var first30colors = [0xFF0000, 0xCCCC99, 0x009999, 0x66CCFF, 0x9933FF, 0xFF6633, 0x00FF00, 0x0066FF, 0xFF99FF, 0x666666,
                                 0xFF9999, 0XCC9900, 0x66FFCC, 0x0000FF, 0x9999FF, 0xFFCC99, 0x99FF99, 0x00FFFF, 0xFF00FF, 0xCCCCCC,
                                 0x660000, 0xFFFF00, 0x336666, 0x000066, 0x660099, 0x663300, 0x006600, 0x003399, 0x990066, 0x333333
            ];
            var count = 0;
            for (var i = 0; i < graph._nodes.length; i++) {
                var node = graph._nodes[i];
                var key = node._propertiesValues[indexOfProperty];
                if (key == "") { key = "No entry" }
                if (key in colorsDict) {
                    var colorPoint = colorsDict[key];
                    ChangeColor(node, colorPoint);
                    //entriesColor[key] += 1;
                }
                else {
                    var colorPoint;
                    if (key == "No entry")
                    { colorPoint = "grey" }
                    else
                    {
                        if (entriesColor[key] >= thirthyth_largest && count30 < 30) {
                            colorPoint = first30colors[count30];
                            count30++;
                        }
                        else {
                            colorPoint = colors[count];
                            count++;
                        }
                    }

                    ChangeColor(node, colorPoint)
                    colorsDict[key] = colorPoint;
                     textColorDict[key] = node.getColor();
                    //entriesColor[key] = 1;
                    //labelsForColorsDict[node.getColor()] = key;
                }
            }
            

            CreateColorMap();
            redrawSameScene();
        }
    
        
        function getColors(noOfColors) {
            var colors = [];          
            var color;
            for (var i = 0; i < noOfColors; ++i) {                
                color = randomColor();
                colors.push(color);
            }
            return colors;
        }

        
       
        function findKthLargestM(nums, k)
        {
            var n = nums.length;
            var k_largest_elems = nums.slice(0, k);
            if (k_largest_elems.length == k) {
                for (i = 0; i < n; i++) {
                    var min_k = minimal(k_largest_elems);
                    if (nums[i] > min_k) {
                        var index = k_largest_elems.indexOf(min_k);
                        k_largest_elems[index] = nums[i];
                    }
                }
            }
            return minimal(k_largest_elems);
        }


        function minimal(array)
        {
            var mini = array[0];
            for (i = 0; i < array.length; i++)
            {
                if (mini > array[i]) { mini = array[i] };
            }
            return mini;
        }

        function findKthLargest(nums, k) {//replace this function, it does not stop for certain inputs.
            if (k < 1 || nums == null || k > nums.length) {
                return 0;
            }            
            return getKth(nums.length - k + 1, nums, 0, nums.length - 1);
        }

        function getKth(k, nums, start, end) {

            var pivot = nums[end];

            var left = start;
            var right = end;

            while (true) {

                while (nums[left] < pivot && left < right) {
                    left++;
                }

                while (nums[right] >= pivot && right > left) {
                    right--;
                }

                if (left >= right) {
                    break;
                }

                swap(nums, left, right);
            }

            swap(nums, left, end);

            if (k == left + 1) {
                return pivot;
            } else if (k < left + 1) {
                return getKth(k, nums, start, left - 1);
            } else {
                return getKth(k, nums, left + 1, end);
            }
        }

        function swap(nums, n1, n2) {
            var tmp = nums[n1];
            nums[n1] = nums[n2];
            nums[n2] = tmp;
        }


        /** Colorizes the nodes in different shades of a certain color based on intensity of a property
         * @param {Three.color} col - the color in which to colorize
         * @param {indexOfProperty} - the index of the property based on which to colorize
         */
        function Colorize(col, indexOfProperty)//colorizes the nodes that are already loaded in the graph. 
        {
            RemoveColorMap();
            // init max and min value of property accross nodes
            var max = graph._nodes[0]._propertiesValues[indexOfProperty];
            var min = max;

            for (var i = 0; i < graph._nodes.length; i++) {
                var value = graph._nodes[i]._propertiesValues[indexOfProperty];
                if (value > max) { max = value; }
                if (value < min) { min = value; }
            }

            var range = max - min;

            //find the max intensity for red or blue or green
            var maxColor = col[1][0];
            if (col[1][1] > maxColor) { maxColor = col[1][1]; }
            if (col[1][2] > maxColor) { maxColor = col[1][2]; }

            //adjust the RGB components
            var redNew = col[1][0];
            var greenNew = col[1][1];

            if (maxColor > 0) {
                var factor = 255 / maxColor;
                redNew = factor * col[1][0];
                greenNew = factor * col[1][1];
                blueNew = factor * col[1][2];
            }

            //colorize the nodes with different shades of the color, according to the selected property intensity
            for (var i = 0; i < graph._nodes.length; i++) {
                var node = graph._nodes[i];
                var value = node._propertiesValues[indexOfProperty];
                var red = col[1][0];
                var green = col[1][1];
                var blue = col[1][2];
                if (range > 0) {
                    red = Math.floor(redNew * (value - min) / range);
                    green = Math.floor(greenNew * (value - min) / range);
                    blue = Math.floor(blueNew * (value - min) / range);
                }
                var color = "rgb(" + red + "," + green + "," + blue + ")";
                ChangeColor(node, color);
            }
            redrawSameScene();
        }
       
       
           /** Changes the color of a node
            * @param {Graph.node} node - the node that changes color
            * @param  {Three.color} color - the new color of the node*/ 
            function ChangeColor(node, color) {
                var id = node.getId();
                previousColor[id] = node.getColor();
                node.setColor(color);
            }

            /** Returns the color of a node to its previous color
             * * @param {Graph.node} node - the node that changes color
             */
            function ReturnPreviousColor(node) {
                var id = node.getId();
                var color = previousColor[id];
                if (color != undefined) {
                    node.setColorHex("#" + color);
                }
            }
             /** Returns the color of all nodes to their previous colors             
             */
            function ReturnAllColors() {
                var nodes = graph.getNodes();
                for (var i = 0; i < nodes.length; i++) {
                    ReturnPreviousColor(nodes[i]);
                }
                redrawSameScene();
            }

            function RemoveColorMap() {
                if (colorsChildrenIds != undefined) {
                    for (var key in colorsChildrenIds) {
                        var idd = colorsChildrenIds[key];
                        var ch = document.getElementById(idd);
                        document.body.removeChild(ch);
                    }
                    var ch_title = document.getElementById("title");                                           
                    if (ch_title != undefined) {document.body.removeChild(ch_title);}                                       
                    colorsChildrenIds = undefined;
                }
            }
            
          
            function CreateColorMap() {
                if (show_color_map.checked) {
                    RemoveColorMap();
                    
                    if (entriesColor !== undefined) {
                        
                        var dict = entriesColor;
                        var thirtythlargest = 0; 
                        if (Object.keys(dict).length > 5000) {
                            thirtythlargest = 0.0033 * Object.keys(dict).length;
                        }
                        else {
                            thirtythlargest = findKthLargest(Object.values(dict), 30);
                        }
                        //// Create items array
                        var itemsall = Object.keys(dict).map(function (key) {
                            return [key, dict[key]];
                        });
                       
                        var items = [];
                        for (var i = 0; i < itemsall.length; i++)
                        {
                            if (itemsall[i][1] >= thirtythlargest && items.length < 30)
                            {
                                items.push(itemsall[i]);
                            }
                        }
                        
                        items.sort(function (first, second) {
                            return second[1] - first[1];
                        });
                        //if (Object.keys(colorsDict).length < 40) {
                        var count = 70;
                        colorsChildrenIds = [];

                        var title = document.createElement('div');
                        title.id = "title";
                        title.style.position = 'absolute';
                        //text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
                        //text2.style.width = 100;
                        title.style.height = 150;
                        title.innerHTML = "The (max) 30 biggest groups:";


                        title.style.fontFamily = "Arial";
                        title.style.top = count + 'px';
                        title.style.left = 305 + 'px';
                        title.style.color = "black";
                        document.body.appendChild(title);
                        count += 30;

                        //for (var propertyValue in colorsDict) {
                        for (var i = 0; i < items.length; i++) {
                            var propertyValue = items[i][0];
                            var text2 = document.createElement('div');
                            text2.id = colorsDict[propertyValue];
                            text2.style.position = 'absolute';
                            //text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
                            //text2.style.width = 100;
                            text2.style.height = 100;
                            text2.innerHTML = propertyValue + ":" + items[i][1];
                            text2.style.color = textColorDict[propertyValue];
                            text2.style.fontWeight = "bold";
                            text2.style.fontFamily = "Arial";
                            text2.style.top = count + 'px';
                            text2.style.left = 305 + 'px';
                            document.body.appendChild(text2);
                            colorsChildrenIds.push(text2.id);
                            count += 20;
                        }
                    }
                }
            }
