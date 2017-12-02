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
	console.log(Template)
	//Modified Hausdorff
	//Compute Ci
	var Ci=0;
	var Nc=0;
	for(var strokeC = 0; strokeC < sketch.strokes.length; strokeC++){
		for(var pointC = 0; pointC < sketch.strokes[strokeC].points.length; pointC++){
			distMin=100000;
			Xc=sketch.strokes[strokeC].points[pointC].x;
			Yc=sketch.strokes[strokeC].points[pointC].y;
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
				for (var pointC = 0; pointC < sketch.strokes[strokeC].points.length; pointC++){
					Xc=sketch.strokes[strokeC].points[pointC].x;
					Yc=sketch.strokes[strokeC].points[pointC].y;
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