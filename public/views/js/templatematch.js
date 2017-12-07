function TemplateMatch(sketch,TemplateNum) {
	if (!String.format) {
	  String.format = function(format) {
		var args = Array.prototype.slice.call(arguments, 1);
		return format.replace(/{(\d+)}/g, function(match, number) { 
		  return typeof args[number] != 'undefined'
			? args[number] 
			: match
		  ;
		});
	  };
	}
	var file = String.format('views/template/{0}.json',TemplateNum);
	var Template = readJson(file);
	//console.log(Template)
	//Modified Hausdorff
	//Compute Ci
	var Ci=0;
	var Nc=0;
	for(var strokeC = 0; strokeC < sketch.strokes.length; strokeC++){
		for(var pointC = 0; pointC < sketch.strokes[strokeC].length; pointC++){
			//console.log(sketch.strokes[strokeC].length);
			distMin=100000;
			Xc=sketch.strokes[strokeC][pointC].x;
			Yc=sketch.strokes[strokeC][pointC].y;
			Nc=Nc+1;
			for (var strokeT = 0; strokeT < Template.strokes.length; strokeT++){
				for(var pointT = 0; pointT < Template.strokes[strokeT].points.length; pointT++){
					Xt=Template.strokes[strokeT].points[pointT].x;
					Yt=Template.strokes[strokeT].points[pointT].y;
					dist=Math.sqrt(Math.pow(Xc-Xt,2)+Math.pow(Yc-Yt,2));
					if (dist<distMin){
						distMin=dist;
					}
				}
			}
			Ci=Ci+distMin;
		}
	}
	Ci=Ci/Nc;
	//Compute Ti
	var Ti=0;
	var Nt=0;
	for(var strokeT = 0; strokeT < Template.strokes.length; strokeT++){
		for (var pointT = 0; pointT < Template.strokes[strokeT].points.length; pointT++){
			distMin=100000;
			Xt=Template.strokes[strokeT].points[pointT].x;
			Yt=Template.strokes[strokeT].points[pointT].y;
			Nt=Nt+1;
			for (var strokeC = 0; strokeC < sketch.strokes.length; strokeC++){
				for (var pointC = 0; pointC < sketch.strokes[strokeC].length; pointC++){
					Xc=sketch.strokes[strokeC][pointC].x;
					Yc=sketch.strokes[strokeC][pointC].y;
					dist=Math.sqrt(Math.pow(Xt-Xc,2)+Math.pow(Yt-Yc,2));
					if (dist<distMin){
						distMin=dist;
					}
				}
			}
			Ti=Ti+distMin;
		}
	}
	Ti=Ti/Nt;	
	//minimun(Ci,Ti)
	console.log(Ci);
	console.log(Ti);
	if (Ti>Ci){
		return Ti;
	}
	return Ci;
}

function AccuracyMatch(newStrokeSet,imageID){
	if (imageID==1){
		start=1;
	}
	if (imageID==2){
		start=5;
	}
	if (imageID==3){
		start=9;
	}
	for (var i=0;i<newStrokeSet.length;i=i+1){
		newStrokeSet[i].acc=-1;
		if (newStrokeSet[i].position>1){//only do accuracy matching for missing(2,3) and redraw(4,5)
			TemplateNum=start+newStrokeSet[i].position-2;//1+2-2=1,5+2-2=5;
			//console.log(newStrokeSet[i]);
			newStrokeSet[i].hausdorff=TemplateMatch(newStrokeSet[i],TemplateNum);
		}
	}
	return newStrokeSet;
}

function PositionMatch(StrokeSet,imageID){
	var r=630;
	var X1min=[767-r, 1022-r, 773-r, 1038-r, 989-r, 902-r];//redundant, missing, redraw
	var Y1min=[374, 118, 305,	58,   342, 294];
	var X1max=[779-r, 1053-r, 790-r, 1046-r, 1008-r, 993-r];
	var Y1max=[396, 154, 348,	65, 375, 375];

	var X2min=[845-r, 1061-r, 924-r, 662-r,  1168-r, 728-r];
	var Y2min=[166,   374,    40,    410,    389,    377];
	var X2max=[860-r, 1091-r, 962-r, 710-r,  1235-r, 794-r];
	var Y2max=[182,   405 ,   73 ,   467,    451,    440];

	var X3min=[762-r,  935-r ,  1170-r, 759-r, 1167-r, 876-r];
	var Y3min=[137,  302,	190,  242, 136,  320];
	var X3max=[821-r,  983-r,  1247-r, 845-r, 1229-r, 966-r ];
	var Y3max=[190,  333,	254, 327, 182,  393];
	
	if (imageID==1){
		var TXmin=X1min;
		var TXmax=X1max;
		var TYmin=Y1min;
		var TYmax=Y1max;
	}
	if (imageID==2){
		var TXmin=X2min;
		var TXmax=X2max;
		var TYmin=Y2min;
		var TYmax=Y2max;
	}
	if (imageID==3){
		var TXmin=X3min;
		var TXmax=X3max;
		var TYmin=Y3min;
		var TYmax=Y3max;
	}
	console.log(imageID);
	//console.log(TXmax);
	for (var i=0;i<StrokeSet.length;i=i+1){

		Xmin=StrokeSet[i].box[0];
		Ymin=StrokeSet[i].box[1];
		Xmax=StrokeSet[i].box[2];
		Ymax=StrokeSet[i].box[3];
		//redundant objects
		StrokeSet[i].position=-1;
		if (StrokeSet[i].label==1){
			var T0=(!((Xmin>TXmax[0])||(Xmax<TXmin[0])||(Ymin>TYmax[0])||(Ymax<TYmin[0])));
			var T1=(!((Xmin>TXmax[1])||(Xmax<TXmin[1])||(Ymin>TYmax[1])||(Ymax<TYmin[1])));
			if (T0&&T1){
				//Overlapped Area of T0 and stroke
				var aX0=TXmin[0];
				var aY0=TYmin[0];
				var aX1=TXmax[0];
				var aY1=TYmax[0];
				if (Xmin>aX0){ var aX0=Xmin;}
				if (Ymin>aY0){ var aY0=Ymin;}
				if (Xmax<aX1){ var aX1=Xmax;}
				if (Ymax<aY1){ var aY1=Ymax;}
				var areaT0=(aX1-aX0)*(aY1-aY0);	
				//Overlapped Area of T1 and stroke				
				var aX0=TXmin[1];
				var aY0=TYmin[1];
				var aX1=TXmax[1];
				var aY1=TYmax[1];
				if (Xmin>aX0){ var aX0=Xmin;}
				if (Ymin>aY0){ var aY0=Ymin;}
				if (Xmax<aX1){ var aX1=Xmax;}
				if (Ymax<aY1){ var aY1=Ymax;}
				var areaT1=(aX1-aX0)*(aY1-aY0);	
				if (areaT0>areaT1){
					T1=0;
				}
				else{
					T0=0;
				}
			}
			if (T0){
				Tarea=(TXmax[0]-TXmin[0])*(TYmax[0]-TYmin[0]);
				Sarea=(Xmax-Xmin)*(Ymax-Ymin);
				if (Tarea<10*Sarea){
					StrokeSet[i].position=0;
				}
			}
			if (T1){
				Tarea=(TXmax[1]-TXmin[1])*(TYmax[1]-TYmin[1]);
				Sarea=(Xmax-Xmin)*(Ymax-Ymin);
				if (Tarea<10*Sarea){
					StrokeSet[i].position=1;
				}
			}
		}
		else{
			//fill mssing objects
			if(StrokeSet[i].label==2){
				var T0=(!((Xmin>TXmax[2])||(Xmax<TXmin[2])||(Ymin>TYmax[2])||(Ymax<TYmin[2])));
				var T1=(!((Xmin>TXmax[3])||(Xmax<TXmin[3])||(Ymin>TYmax[3])||(Ymax<TYmin[3])));
				if (T0&&T1){
					//Overlapped Area of T0 and stroke
					var aX0=TXmin[2];
					var aY0=TYmin[2];
					var aX1=TXmax[2];
					var aY1=TYmax[2];
					if (Xmin>aX0){ var aX0=Xmin;}
					if (Ymin>aY0){ var aY0=Ymin;}
					if (Xmax<aX1){ var aX1=Xmax;}
					if (Ymax<aY1){ var aY1=Ymax;}
					var areaT0=(aX1-aX0)*(aY1-aY0);	
					//Overlapped Area of T1 and stroke				
					var aX0=TXmin[3];
					var aY0=TYmin[3];
					var aX1=TXmax[3];
					var aY1=TYmax[3];
					if (Xmin>aX0){ var aX0=Xmin;}
					if (Ymin>aY0){ var aY0=Ymin;}
					if (Xmax<aX1){ var aX1=Xmax;}
					if (Ymax<aY1){ var aY1=Ymax;}
					var areaT1=(aX1-aX0)*(aY1-aY0);	
					if (areaT0>areaT1){
						T1=0;
					}
					else{
						T0=0;
					}
				}
				if (T0){
					Tarea=(TXmax[2]-TXmin[2])*(TYmax[2]-TYmin[2]);
					Sarea=(Xmax-Xmin)*(Ymax-Ymin);
					if (Tarea<10*Sarea){
						StrokeSet[i].position=2;
					}
				}
				if (T1){
					Tarea=(TXmax[3]-TXmin[3])*(TYmax[3]-TYmin[3]);
					Sarea=(Xmax-Xmin)*(Ymax-Ymin);
					if (Tarea<10*Sarea){
						StrokeSet[i].position=3;
					}
				}
			}
			//draw correct objects
			if(StrokeSet[i].label==3){
				var T0=(!((Xmin>TXmax[4])||(Xmax<TXmin[4])||(Ymin>TYmax[4])||(Ymax<TYmin[4])));
				var T1=(!((Xmin>TXmax[5])||(Xmax<TXmin[5])||(Ymin>TYmax[5])||(Ymax<TYmin[5])));
				if (T0&&T1){
					//Overlapped Area of T0 and stroke
					var aX0=TXmin[4];
					var aY0=TYmin[4];
					var aX1=TXmax[4];
					var aY1=TYmax[4];
					if (Xmin>aX0){ var aX0=Xmin;}
					if (Ymin>aY0){ var aY0=Ymin;}
					if (Xmax<aX1){ var aX1=Xmax;}
					if (Ymax<aY1){ var aY1=Ymax;}
					var areaT0=(aX1-aX0)*(aY1-aY0);	
					//Overlapped Area of T1 and stroke				
					var aX0=TXmin[5];
					var aY0=TYmin[5];
					var aX1=TXmax[5];
					var aY1=TYmax[5];
					if (Xmin>aX0){ var aX0=Xmin;}
					if (Ymin>aY0){ var aY0=Ymin;}
					if (Xmax<aX1){ var aX1=Xmax;}
					if (Ymax<aY1){ var aY1=Ymax;}
					var areaT1=(aX1-aX0)*(aY1-aY0);	
					if (areaT0>areaT1){
						T1=0;
					}
					else{
						T0=0;
					}
				}
				if (T0){
					Tarea=(TXmax[4]-TXmin[4])*(TYmax[4]-TYmin[4]);
					Sarea=(Xmax-Xmin)*(Ymax-Ymin);
					if (Tarea<10*Sarea){
						StrokeSet[i].position=4;
					}
				}
				if (T1){
					Tarea=(TXmax[5]-TXmin[5])*(TYmax[5]-TYmin[5]);
					Sarea=(Xmax-Xmin)*(Ymax-Ymin);
					if (Tarea<10*Sarea){
						StrokeSet[i].position=5;
					}
				}					
			}
		}	
	}
	return StrokeSet;
}

function ResultF1(newStrokeSet){
	var TP=0;
	var TN=0;
	for (var i=0;i<newStrokeSet.length;i=i+1){
		if (newStrokeSet[i].position!=-1){//only do accuracy matching for missing(2,3) and redraw(4,5)
			TP=TP+1;	
		}
		else{
			TN=TN+1;
		}		
	}
	var FP=6-TP;
	var F1=2*TP/(TN+FP+2*TP);
	return F1;
	
}

function ResultAcc(newStrokeSet){
	var acc=0;
	var num=0;
	console.log(newStrokeSet);
	for (var i=0;i<newStrokeSet.length;i=i+1){
		if (newStrokeSet[i].position>1){//only do accuracy matching for missing(2,3) and redraw(4,5)
			diagonal=Math.sqrt(Math.pow((newStrokeSet[i].box[2]-newStrokeSet[i].box[0]),2)+Math.pow((newStrokeSet[i].box[3]-newStrokeSet[i].box[1]),2))
			console.log(diagonal);
			if (diagonal>0||diagonal<1000){
				//if (1-10*newStrokeSet[i].hausdorff/diagonal>0){
				//	=acc+(1-10*newStrokeSet[i].hausdorff/diagonal);	
				//}
				acc=acc+Math.pow(1.3,-10*newStrokeSet[i].hausdorff/diagonal);
				num=num+1;	
			}				
		}		
	}
	if (acc<=0||acc>=100000000){
		acc=0;
	}
	else{
		if (num==0){
			acc=acc;
		}
		else{
			acc=acc/num
		}
	}
	return acc;		
}

function Evalutate(StrokeSet){
	var path = document.getElementById('backg').attributes["data-image"].value;
	
	if(path.includes("heart")) {
		var imageID = 1;
	  }
	  else if(path.includes("show")) {
		var imageID = 2;
	  }
	  else if(path.includes("bear")) {
		var imageID = 3;
	  }
//Position Matching 
	  var PosStrokeSet=PositionMatch(StrokeSet,imageID);
//Template Matching
	  var AccStrokeSet=AccuracyMatch(PosStrokeSet,imageID);
//Compute a accuracy score.
	  var PosResult=ResultF1(PosStrokeSet);
//Compute a F1 for Position.	  
	  var AccResult=ResultAcc(AccStrokeSet);	 	
	  var result = {F1:PosResult,Accuracy:AccResult};
	  return result;
}
