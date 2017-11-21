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
