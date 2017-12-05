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
	//console.log(TemplateOne);
	return TemplateOne;
}



function GetCircleData(resampledSketch){
  FindCircle(resampledSketch);
  FindStrokesInside(resampledSketch);
  console.log(Circles);
  return Circles;
}


function FindCircle(sketch){
  for(var i = 0; i < sketch.strokes.length; i++){
    var color = sketch.strokes[i].color;
    if(color === "red"){
      feature1(sketch,0);
      var f1 = feature1(sketch,i);//the distance of the start and end
      var f2 = feature2(sketch,i);//cos of start and end
      var f3 = feature3(sketch,i);//sin of start and end
      var f4 = feature4(sketch,i);//total rotation
      var f5 = feature5(sketch,i);//total abs rotation
      var f6 = feature6(sketch,i);//total pow rotation
      var f8 = feature8(sketch,i)//angle of diagonal
      var f9 = feature9(sketch,i);//length of stroke
      var f11 = feature11(sketch,i);//length of diagonal
      if(f3 <= 0.3 && f1< 10 && f9 > 20){
        circle.push(i);

      }
      else if(f4 <= 10 && f9 - f1 < 5){//removeline
        removeline.push(i);
      }
      else if(f11 < 5){//addnewdot
        addnewdot.push(i);
      }
    }
    else if(color === "black"){
      addnewstrokes.push(i);
    }
  }
}

function FindStrokesInside(sketch){//return an array which contains leftmin,rightmax, downmin and upmax
  var sketch = getSketch();
  for(var i = 0; i < circle.length; i++){
    var tempcircle = Object.create(Circle);
    var index = circle[i];
    var tempbox = feature10(sketch, index);
    //console.log(tempbox);
    tempcircle.box = tempbox;
    //tempcircle.lable = "0";
    //console.log(tempcircle);

    for(var k = 0; k < removeline.length; k++){
      var tempremoveindex = removeline[k];
      var tempremove = sketch.strokes[tempremoveindex];
      for(var j = 0; j < tempremove.points.length; j++){
        if(inside(tempremove.points[j], tempbox)){
          tempcircle.label = "1";
          break;
        }
      }
    }
    //console.log(tempcircle);
    //if(tempcircle.lable == "1") continue;

    var ttemp = [];
    for(var k = 0; k < addnewstrokes.length; k++){
      //console.log("1");
      var tempaddindex = addnewstrokes[k];
      var tempstrokes = sketch.strokes[tempaddindex];
      for(var j = 0; j < tempstrokes.points.length; j++){
        if(inside(tempstrokes.points[j], tempbox)) {
          ttemp.push(tempstrokes.points);
          tempcircle.lable = "0";
          break;
        }
      }
    }

    for(var k = 0; k < ttemp.length; k++){
      tempcircle.strokes = ttemp;
    }
    //console.log(tempcircle);

    console.log(addnewdot);
    for(var k = 0; k < addnewdot.length; k++){
      var tempdotindex = addnewdot[k];
      var tempdot = sketch.strokes[tempdotindex];
      for(var j = 0; j < tempdot.points.length; j++){
        if(inside(tempdot.points[j],tempbox)) {
          tempcircle.label = "2";
          break;
        }
      }
    }

    console.log(tempcircle);
    Circles.push(tempcircle);
  }
}

function inside(dot,box){
  if(dot.x<box[0] || dot.x > box[2]) return false;
  if(dot.y<box[1] || dot.y > box[3]) return false;
  return true;
}

// ##################
// ##### Features #####
// ##################
function feature1(sketch,i) {//the distance of the start and end
  var dis = 0;
  var s = sketch.strokes[i].points[0];
  var w = sketch.strokes[i].points[sketch.strokes[i].points.length - 1];
  var x0 = sketch.strokes[i].points[0].x;
  var y0 = sketch.strokes[i].points[0].y;
  var xn = sketch.strokes[i].points[sketch.strokes[i].points.length - 1].x;
  var yn = sketch.strokes[i].points[sketch.strokes[i].points.length - 1].y;
  dis =  Math.sqrt(Math.pow((yn-y0),2)+Math.pow((xn-x0),2))
  return dis;
}

function feature2(sketch,i) {//cos of start and end
  var cos = 0;
  var s = sketch.strokes[i].points[0];
  var w = sketch.strokes[i].points[sketch.strokes[i].points.length - 1];
  var x0 = sketch.strokes[i].points[0].x;
  var y0 = sketch.strokes[i].points[0].y;
  var xn = sketch.strokes[i].points[sketch.strokes[i].points.length - 1].x;
  var yn = sketch.strokes[i].points[sketch.strokes[i].points.length - 1].y;
  cos =  (xn - x0) / (Math.sqrt(Math.pow((yn-y0),2)+Math.pow((xn-x0),2))+0.0000001);
  return cos;
}

function feature3(sketch,i) {//sin of start and end
  var sin = 0;
  var s = sketch.strokes[i].points[0];
  var w = sketch.strokes[i].points[sketch.strokes[i].points.length - 1];
  var x0 = sketch.strokes[i].points[0].x;
  var y0 = sketch.strokes[i].points[0].y;
  var xn = sketch.strokes[i].points[sketch.strokes[i].points.length - 1].x;
  var yn = sketch.strokes[i].points[sketch.strokes[i].points.length - 1].y;
  sin =  (yn - y0) / (Math.sqrt(Math.pow((yn-y0),2)+Math.pow((xn-x0),2))+0.0000001);
  return sin;
}

function feature4(sketch,i) {//total rotation
  var theta = 0;
  for(var j = 2; j < sketch.strokes[i].points.length; j++){
    var s = sketch.strokes[i].points[j];
    var w = sketch.strokes[i].points[j - 1];
    var sw = sketch.strokes[i].points[j - 2];
    var xj = sketch.strokes[i].points[j].x;
    var yj = sketch.strokes[i].points[j].y;
    var xjminus1 = sketch.strokes[i].points[j - 1].x;
    var yjminus1 = sketch.strokes[i].points[j - 1].y;
    var xjminus2 = sketch.strokes[i].points[j - 2].x;
    var yjminus2 = sketch.strokes[i].points[j - 2].y;
    var delxj = xj - xjminus1;
    var delyj = yj - yjminus1;
    var delxjminus1 = xjminus1 - xjminus2;
    var delyjminus1 = yjminus1 - yjminus2;
    theta = theta + Math.atan((delxj * delxjminus1 - delyj * delyjminus1)/(delxj * delxjminus1 + delyj * delyjminus1 + 0.001));
  }
  return theta;
}

function feature5(sketch,i) {//total abs rotation
  var theta = 0;
  for(var j = 2; j < sketch.strokes[i].points.length; j++){
    var s = sketch.strokes[i].points[j];
    var w = sketch.strokes[i].points[j - 1];
    var sw = sketch.strokes[i].points[j - 2];
    var xj = sketch.strokes[i].points[j].x;
    var yj = sketch.strokes[i].points[j].y;
    var xjminus1 = sketch.strokes[i].points[j - 1].x;
    var yjminus1 = sketch.strokes[i].points[j - 1].y;
    var xjminus2 = sketch.strokes[i].points[j - 2].x;
    var yjminus2 = sketch.strokes[i].points[j - 2].y;
    var delxj = xj - xjminus1;
    var delyj = yj - yjminus1;
    var delxjminus1 = xjminus1 - xjminus2;
    var delyjminus1 = yjminus1 - yjminus2;
    theta = theta + Math.abs(Math.atan((delxj * delxjminus1 - delyj * delyjminus1)/(delxj * delxjminus1 + delyj * delyjminus1 + 0.001)));
  }
  return theta;
}

function feature6(sketch,i) {//total pow rotation
  var theta = 0;
  for(var j = 2; j < sketch.strokes[i].points.length; j++){
    var s = sketch.strokes[i].points[j];
    var w = sketch.strokes[i].points[j - 1];
    var sw = sketch.strokes[i].points[j - 2];
    var xj = sketch.strokes[i].points[j].x;
    var yj = sketch.strokes[i].points[j].y;
    var xjminus1 = sketch.strokes[i].points[j - 1].x;
    var yjminus1 = sketch.strokes[i].points[j - 1].y;
    var xjminus2 = sketch.strokes[i].points[j - 2].x;
    var yjminus2 = sketch.strokes[i].points[j - 2].y;
    var delxj = xj - xjminus1;
    var delyj = yj - yjminus1;
    var delxjminus1 = xjminus1 - xjminus2;
    var delyjminus1 = yjminus1 - yjminus2;
    theta = theta + Math.pow(Math.atan((delxj * delxjminus1 - delyj * delyjminus1)/(delxj * delxjminus1 + delyj * delyjminus1 + 0.001)));
  }
  return theta;
}

function feature8(sketch,i) {//angle of diagonal
  var angle = 0;
  var xmin = sketch.strokes[i].points[0].x;
  var ymin = sketch.strokes[i].points[0].y;
  var xmax = sketch.strokes[i].points[0].x;
  var ymax = sketch.strokes[i].points[0].y;


    for(var j = 1; j < sketch.strokes[i].points.length; j++){
      var x = sketch.strokes[i].points[j].x;
      var y = sketch.strokes[i].points[j].y;
      xmin = Math.min(xmin, x);
      ymin = Math.min(ymin, y);
      xmax = Math.max(xmax, x);
      ymax = Math.max(ymax, y);
    }
  angle = Math.atan((ymax - ymin)/((xmax - xmin)+0.0001));
  return angle;
}

function feature9(sketch,i) { //length of stroke
  var length = 0;
    for(var j = 1; j < sketch.strokes[i].points.length; j++){
      var s = sketch.strokes[i].points[j];
      var w = sketch.strokes[i].points[j - 1];
      var xj = sketch.strokes[i].points[j].x;
      var yj = sketch.strokes[i].points[j].y;
      var xjminus1 = sketch.strokes[i].points[j - 1].x;
      var yjminus1 = sketch.strokes[i].points[j - 1].y;
      length = length + Math.sqrt(Math.pow((xj - xjminus1),2)+Math.pow((yj - yjminus1),2));
    }
  return length;
}

function feature10(sketch,i){//find the bounding box
  var temp = [];
  var xmin = sketch.strokes[i].points[0].x;
  var ymin = sketch.strokes[i].points[0].y;
  var xmax = sketch.strokes[i].points[0].x;
  var ymax = sketch.strokes[i].points[0].y;

    for(var j = 1; j < sketch.strokes[i].points.length; j++){
      var x = sketch.strokes[i].points[j].x;
      var y = sketch.strokes[i].points[j].y;
      xmin = Math.min(xmin, x);
      ymin = Math.min(ymin, y);
      xmax = Math.max(xmax, x);
      ymax = Math.max(ymax, y);
    }
    temp.push(xmin,ymin,xmax,ymax);
    return temp;
}


function feature11(sketch,i) {//length of diagonal
  var angle = 0;
  var xmin = sketch.strokes[i].points[0].x;
  var ymin = sketch.strokes[i].points[0].y;
  var xmax = sketch.strokes[i].points[0].x;
  var ymax = sketch.strokes[i].points[0].y;


    for(var j = 1; j < sketch.strokes[i].points.length; j++){
      var x = sketch.strokes[i].points[j].x;
      var y = sketch.strokes[i].points[j].y;
      xmin = Math.min(xmin, x);
      ymin = Math.min(ymin, y);
      xmax = Math.max(xmax, x);
      ymax = Math.max(ymax, y);
    }
  angle = Math.sqrt((ymax-ymin)*(ymax-ymin)+(xmax-xmin)*(xmax-xmin));
  return angle;
}


var Circle = {
  box:[],
  strokes:[],
  label:[],//1:removelines 2:addnewdot 3:wrong
};

var Circles = new Array();

var circle = new Array();
var removeline = new Array();
var addnewdot = new Array();
var addnewstrokes = new Array();
