String.prototype.paddingLeft = function (paddingValue) {
   return String(paddingValue + this).slice(-paddingValue.length);
};

function MergeObjRecursive(obj1, obj2) {
  var obj3 = {};
  for(p in obj1) {
    obj3[p] = obj1[p];
  }
  for(p in obj2) {
    if(Object.keys(obj3).indexOf(p)<0){
      obj3[p] = obj2[p];
    }
    else {
      obj3[p] = obj3[p] + obj2[p];
    }
  }
  return obj3;
}

if(Array.prototype.equals)
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});


var Interceptor = {
  prevTotalCount :0,
  totalCount : 0,
  currentColor : 'white',
  bgColor : 'white',
  canvasDetails : {
    width : 0,
    height: 0
  },
  setupObject : {
    objectArray : [],
    objectCount : 0,
    objectTypeCount : {}
  },
  drawObject : {
    objectArray : [],
    objectCount : 0,
    objectTypeCount : {}
  },
  isCleared : false,
  noRows: 5,
  noCols: 5,
  createShadowDOMElement : function() {

    // var c = document.getElementsByTagName('canvas')[0];
    var c = document.getElementById('canvas-sub');
    c.setAttribute("tabIndex","0");
    c.setAttribute("role","region");

    var section = document.createElement('section');
    section.id = "shadowDOM-content";
    section.className = "shadowDOM-content";
    c.appendChild(section);

    var summary = document.createElement('div');
    summary.setAttribute("tabIndex","0");
    summary.setAttribute("role","region");
    summary.id = "shadowDOM-content-summary";
    summary.className = "shadowDOM-content-summary";
    section.appendChild(summary);

    var details = document.createElement('div');
    details.setAttribute("tabIndex","0");
    details.setAttribute("role","region");
    details.id = "shadowDOM-content-details";
    details.className = "shadowDOM-content-details";
    section.appendChild(details);

    var contentTable = document.createElement('table');
    contentTable.id="shadowDOM-content-table";
    contentTable.className ="shadowDOM-content-table";
    contentTable.setAttribute('summary','details of object in the canvas');

    for(var i=0; i<this.noRows; i++) {
      var row = document.createElement('tr');

      for(var j=0; j<this.noCols; j++) {
        var col = document.createElement('td');
        col.className = "shadowDOM-cell-content";
        col.innerHTML = 'test';
        row.appendChild(col);
      }
      contentTable.appendChild(row);
    }
    details.appendChild(contentTable);
    shadowDOMElement = document.getElementById('shadowDOM-content');
  },
  getColorName : function(arguments) {
    if(arguments.length==3) {
      //assuming that we are doing RGB - convert RGB values to a name
      var color = '#' + arguments[0].toString(16).paddingLeft("00") + arguments[1].toString(16).paddingLeft("00") + arguments[2].toString(16).paddingLeft("00");
      var n_match  = ntc.name(color);
      return n_match[1];
    }
    else if(arguments.length==1) {
      if(!(typeof(arguments[0])).localeCompare("number")) {
        //assuming that we are doing RGB - this would be a grayscale number
        if(arguments[0]<10) {
          return 'black';
        }
        else if(arguments[0]>240) {
          return 'white';
        }
        else {
          return 'grey';
        }
      }
      else if(!(typeof(arguments[0])).localeCompare("string")) {
        if(!arguments[0].charAt(0).localeCompare('#')) {
          //if user has entered a hex color
          var n_match = ntc.name(arguments[0]);
          return n_match[1];
        }
        else {
          return arguments[0];
        }
      }
    }
  },
  canvasLocator : function(arguments,canvasX,canvasY){
    var x, y;
    var locX, locY;
    var isNum1 = false;
    var isNum2 = false;
    for(var i=0;i<arguments.length;i++) {
      a = arguments[i];
      if(!isNum1 && !isNum2 && !(typeof(a)).localeCompare('number')) {
        x = a;
        isNum1 = true;
      } else if (isNum1 && !isNum2 && !(typeof(a)).localeCompare('number')) {
        y = a;
        isNum2 = true;
      }
    }

    if(x<=0.2*canvasX) {
      locX = 0;
    }
    else if(x<=0.4*canvasX) {
      locX = 1;
    }
    else if(x<=0.6*canvasX) {
      locX = 2;
    }
    else if(x<=0.8*canvasX) {
      locX = 3;
    }
    else {
      locX = 4;
    }

    if(x<=0.2*canvasY) {
      locY = 0;
    }
    else if(x<=0.4*canvasY) {
      locY = 1;
    }
    else if(x<=0.6*canvasY) {
      locY = 2;
    }
    else if(x<=0.8*canvasY) {
      locY = 3;
    }
    else {
      locY = 4;
    }

    return({
      locX: locX,
      locY: locY
    })

  },
  clearVariables : function(object) {
    object.objectTypeCount = {};
    object.objectCount = 0;
    this.isCleared = true;
    return object;
  },
  populateObject : function(x,arguments, object ,table, isDraw) {
    objectCount = object.objectCount;
    objectArray = object.objectArray;
    objectTypeCount = object.objectTypeCount;
    if(!isDraw) {
      //check for special function in setup -> createCanvas
      if(!x.name.localeCompare('createCanvas')) {
        this.canvasDetails.width = arguments[0];
        this.canvasDetails.height = arguments[1];
      }
    }
    //check for speacial functions in general -> background/fill
    if(!x.name.localeCompare('fill')) {
      this.currentColor = this.getColorName(arguments);
    }
    else if(!x.name.localeCompare('background')) {
      this.bgColor = this.getColorName(arguments);
    }
    else if(!x.module.localeCompare('Shape') || !x.module.localeCompare('Typography') &&((!x.submodule)||(x.submodule.localeCompare('Attributes')!=0)) ){

    var canvasLocation = this.canvasLocator(arguments ,width,height);

    objectArray[objectCount] = {
        'type' : x.name,
        'location': canvasLocation,
        'colour': this.currentColor
      };
      //add the object(shape/text) parameters in objectArray
      for(var i=0;i<arguments.length;i++) {
        if(!(typeof(arguments[i])).localeCompare('number')){
          arguments[i] = round(arguments[i]);
        }
        objectArray[objectCount][x.params[i].description]=arguments[i];
      }
      if(objectTypeCount[x.name]) {
        objectTypeCount[x.name]++;
      }
      else {
        objectTypeCount[x.name]=1;
      }
      //creating the table to contain the object(shape/text) details

      objectCount++;
    }
    return ({
      objectCount : objectCount,
      objectArray : objectArray,
      objectTypeCount : objectTypeCount
    });
  },
  populateTable : function(table, objectArray) {
    if(this.totalCount<100) {
      for(var i=0;i<objectArray.length;i++) {
        var cellLoc = objectArray[i].location.locY*this.noRows + objectArray[i].location.locX;
        document.getElementsByClassName('shadowDOM-cell-content')[cellLoc].innerHTML += objectArray[i].colour + ' ' + objectArray[i].type;
      }

    }
  },
  getSummary : function(object1, object2, element) {
    this.prevTotalCount = this.totalCount;
    this.totalCount = object1.objectCount + object2.objectCount;
    element.innerHTML = '';
    element.innerHTML += 'Canvas size is ' + this.canvasDetails.width + ' by ' + this.canvasDetails.height + ' pixels ';
    element.innerHTML += ' and has a background colour of ' + this.bgColor + '. ';
    element.innerHTML += 'This canvas contains ' + this.totalCount;
    if(this.totalCount > 1 ) {
      element.innerHTML += ' objects. The objects are ';
    }
    else {
      element.innerHTML += ' object. The object is ';
    }

    if(object2.objectCount>0 || object1.objectCount>0 ) {

      totObjectTypeCount = MergeObjRecursive(object1.objectTypeCount, object2.objectTypeCount);
      var keys = Object.keys(totObjectTypeCount);
      for(var i=0;i<keys.length;i++) {
        element.innerHTML += totObjectTypeCount[keys[i]] + ' ' + keys[i] + ' ';
      }

      element.innerHTML += "<br>";
      if(this.totalCount<100){
        for(var i=0; i <object1.objectArray.length; i++) {
          var objKeys = Object.keys(object1.objectArray[i]);
          for(var j=0;j<objKeys.length;j++) {
            element.innerHTML += objKeys[j] + ' is ' + object1.objectArray[i][objKeys[j]] + ' ';
          }
        }
        for(var i=0; i <object2.objectArray.length; i++) {
          var objKeys = Object.keys(object2.objectArray[i]);
          for(var j=0;j<objKeys.length;j++) {
            element.innerHTML += objKeys[j] + ' is ' + object2.objectArray[i][objKeys[j]] + ' ';
          }
        }
      }

    }
  }
};