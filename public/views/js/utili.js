function readJson(fileName) {
   var contents;
   var xhttp = new XMLHttpRequest();
   xhttp.onreadystatechange = function() {
      if (this.readyState === 4 && this.status === 200) {
         contents = JSON.parse(this.response);
	}
   };
   xhttp.open("GET", fileName, false);
   xhttp.send();
   return contents;
}

function downloadObjectAsJson(exportObj, exportName){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function TemplatePreprocess() {
	var file = "views/template_resample/game3_6.json";
		// Read line by line
	var TemplateOne = readJson(file);
	//console.log(TemplateOne.strokes.length);
	
	TotalWeight=1259;
	TotalHeight=497;
	LeftBias=630;
	scale=91/632;
	Xmin=876-LeftBias;
	Ymin=320;
//X1min=[767 1022 773	1038 989 902];
//Y1min=[374 118 305	58   342 294];
//X1max=[779 1053 790	1046 1008 993];
//Y1max=[396 154	348	65   375 375];

//X2min=[845  1061 924 662  1168 728];
//Y2min=[166  374  40  410  389 377];
//X2max=[860 1091	710	 962  1235 794];
//Y2max=[182 405   73  467  451  440];

//X3min=[762  935   1170 759 1167 876];
//Y3min=[137  302	190  242 136  320];
//X3max=[821  983   1247 845 1229 966 ];
//Y3max=[190  333	254	 327 182  393];
	for(var strokeT = 0; strokeT < TemplateOne.strokes.length; strokeT++){
		for(var pointT = 0; pointT < TemplateOne.strokes[strokeT].points.length; pointT++){
			TemplateOne.strokes[strokeT].points[pointT].x=TemplateOne.strokes[strokeT].points[pointT].x*scale+Xmin;
			TemplateOne.strokes[strokeT].points[pointT].y=TemplateOne.strokes[strokeT].points[pointT].y*scale+Ymin;
		}
	}
	console.log(TemplateOne);
	return TemplateOne;
}