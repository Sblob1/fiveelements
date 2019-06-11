const Z_INDEX = 0;
const FLAME_SPREAD = 40;
const FLAMES_PER_FIRE = 10;
const NUMBER_OF_FIRES = 10;
const MAX_NUMBER_OF_SKELETONS = 1;
const REFRESH_RATE = 50;

const SCREEN_WIDTH = 1280;
const SCREEN_HEIGHT = 720;

const FLAME_DECAY_RATE = 0.98;

const PRELOAD = true;
const VIDEO_SHOW = false;
const VIDEO_AND_POSENET = true;

const BEZIER_RESOLUTION = 10;

const SCENE_LENGTH = 8;

// Create a KNN classifier
const knnClassifier = ml5.KNNClassifier();
let confidenceHistory = [];

let time = 0;
let sceneStart = 0;
let poseNet;
let poses = [];
let poseHistory = [];
let fires = [];
let seas = [];
let trees = [];
let scene = '2';
let speechPlayed = false;
let dataText = '';
let textTimer = 0;
let triggerText = false;

let font;
let img;

let nose;
//let leftWrist;
//let rightWrist;


function preload() {
  if (PRELOAD) {
    console.log('Preload');
    font = loadFont('https://sugarsnap.co.uk/elements/Comfortaa_Regular.ttf');
    loadMyKNN();
  }
}

function processPoses(poses){
  if(poses.length > 0){
    nose = poses[0].pose.keypoints[0].position;

    //console.log(poses[0].pose.keypoints);

    /*leftWrist = poses[0].pose.keypoints[9].position;
    rightWrist = poses[0].pose.keypoints[10].position;

    poseHistory.unshift(rightWrist);

    if(poseHistory.length>4){
      poseHistory.pop();
    }

    let sum = poseHistory.reduce((total, amount) => total = total.add(amount));
    rightWrist = p5.Vector.div(sum, poseHistory.length);*/




  }
}

function textOnScreen() {
  dataText = str(data["spring"][floor(random(0, 23))]);
}

function textOffScreen() {
  dataText = '';
}

function speakNewUtterance(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = window.speechSynthesis.getVoices()[2];
  utterance.rate = 0.6;
  window.speechSynthesis.speak(utterance);
}

// formula from wikipedia for intersection of 2 points in 2d space
function calculateIntersection(p1, p2, p3, p4) {
  let a;
  let b;
  if ((p2.x - p1.x) === 0) {
    a = 'inf';
  } else {
    a = (p2.y - p1.y)/(p2.x - p1.x);
  }
  if ((p4.x - p3.x) === 0) {
    b = 'inf';
  } else {
    b = (p4.y - p3.y)/(p4.x - p3.x);
  }
  
  let c = p1.y - a * p1.x;
  let d = p3.y - b * p3.x;
  
  
  if (false) { // parallel;
   // do what?
  }
  else {
    let intersectionX = (d-c)/(a-b);
    let intersectionY = (a*d-b*c)/(a-b);
    return createVector(intersectionX, intersectionY, (p2.z+p3.z)/2);
  }
}

function GetPointOnBezierCurve(p0, p1, p2, p3, t)
{
  const u = 1.0 - t;
  const t2 = t * t;
  const u2 = u * u;
  const u3 = u2 * u;
  const t3 = t2 * t;
  
  const l1 = p5.Vector.mult(p0, u3);
  const l2 = p5.Vector.mult(p1, 3.0*u2*t);
  const l3 = p5.Vector.mult(p2, 3.0*u*t2);
  const l4 = p5.Vector.mult(p3, t3);
  
  return ((l1.add(l2)).add(l3)).add(l4);
}


function setup() {
  console.log('setup');
  // Tell Chrome to wake up and get the voices.
//window.speechSynthesis.getVoices();
  createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT, WEBGL);
  
  if (VIDEO_AND_POSENET) {
    video = createCapture(VIDEO);
    video.size(width, height);
    if (VIDEO_SHOW) {
      video.show();
    } else {
      video.hide();
    }
  }
  
  if (VIDEO_AND_POSENET) {
    const options = {flipHorizontal: true, maxPoseDetections: 1, minConfidence: 0.8};
    poseNet = ml5.poseNet(video, options, function() {console.log('model ready')});
    poseNet.on('pose', function (results) {
      processPoses(results);
    });
  }
  
  
  for(let i=0; i<MAX_NUMBER_OF_SKELETONS; i++){
    let F = new fire();
    F.create(SCREEN_WIDTH/2, SCREEN_HEIGHT/2);
    fires.unshift(F);
  }
  
  for(let i=0; i<MAX_NUMBER_OF_SKELETONS; i++){
    let S = new sea();
    S.create(SCREEN_WIDTH/2, SCREEN_HEIGHT/2);
    seas.unshift(S);
  }
  
  for(let i=0; i<MAX_NUMBER_OF_SKELETONS; i++){
    let T = new tree();
    T.create(SCREEN_WIDTH/2, SCREEN_HEIGHT/2);
    trees.unshift(T);
  }
  
  window.addEventListener('keypress', function(e) {
    window.speechSynthesis.cancel();
    speechPlayed = false;
    scene = e.key;
  });

  if (PRELOAD) {
    textFont(font);
    textSize(16);
    textAlign(CENTER, CENTER);
  }
  
  /*window.addEventListener('mousedown', function() {
    textOnScreen();
  });
  window.addEventListener('mouseup', function() {
    textOffScreen();
  });*/
}

function draw() {
  
  background(240);

  
  if (PRELOAD){
    /*textFont(font);
    textSize(16);
    textAlign(CENTER, CENTER);*/

    if(poses.length > 0){
      classify();
    }

    if(millis() < (millis() + textTimer)){
    fill(65);
    text(dataText, 0, 0);
    } else {
      textOffScreen();
      textTimer = 0;
    }
  }
  
  
  // draw
  if (scene === '0') {
    /*textSize(16);
    textAlign(CENTER, CENTER);
    fill(65);
    text('Choose a scene', 0, 0);
    if ((mouseX - SCREEN_WIDTH/2 > 500) || (mouseX - SCREEN_WIDTH/2 < -500)) {
      if (mouseX - SCREEN_WIDTH/2 < -500) {
        scene = '1';
      }
      if (mouseX - SCREEN_WIDTH/2 > 500) {
        scene = '2';
      }
      speechPlayed = false;
    }*/
  }
  if (scene === '1') {
    if (!speechPlayed) {
      speakNewUtterance('this is scene one');
      speechPlayed = true;
      sceneStart = millis();
    }
    for(let i=0; i<fires.length; i++){
      fires[i].display();
    }
  }
  if (scene === '2') {
    if (!speechPlayed) {
      speakNewUtterance('this is scene two');
      speechPlayed = true;
      sceneStart = millis();
    }
    for(let i=0; i<seas.length; i++){
      seas[i].display(i);
    }
  }
  if (scene === '3') {
    if (!speechPlayed) {
      speakNewUtterance('this is scene two');
      speechPlayed = true;
      sceneStart = millis();
    }
    for(let i=0; i<trees.length; i++){
      trees[i].display();
    }
  }
  if (scene === '4') {
  }
  if (scene === '5') {
  }
  
  // update
  for(let i=0; i<fires.length; i++){
    fires[i].update(i);
  }
  
  for(let i=0; i<seas.length; i++){
    seas[i].update(i);
  }
  
  for(let i=0; i<trees.length; i++){
    trees[i].update(i);
  }
  
  // new Pose (happens every REFRESH_RATE milliseconds)
  if ((millis() > time) && ((nose)||/* (rightWrist) ||*/ (!VIDEO_AND_POSENET))) {
    if (scene === '1') {
      let F = new fire();
      
      if (VIDEO_AND_POSENET) {
        if (nose) {
          F.create(nose.x - SCREEN_WIDTH/2, nose.y - SCREEN_HEIGHT/2);
        }
        /*if (rightWrist){
          F.create(rightWrist.x - SCREEN_WIDTH/2, rightWrist.y - SCREEN_HEIGHT/2);
        }*/
      } else {
        F.create(mouseX - SCREEN_WIDTH/2, mouseY - SCREEN_HEIGHT/2);
      }
      
      fires.unshift(F);
      
      // Give each flame an angle
      let setAngle = 0;
      if (fires.length > 1) {
        setAngle = atan(
          ((fires[1].fire[0].pos.y - fires[0].fire[0].pos.y)/
            (fires[1].fire[0].pos.x - fires[0].fire[0].pos.x))
        );
      }
      
      for(let i=0; i<fires[0].fire.length; i++){
        fires[0].fire[i].angle = setAngle - PI/2
          + (((fires[1].fire[0].pos.x - fires[0].fire[0].pos.x) > 0) ? PI : 0);
      }
      
      
      if (fires.length > NUMBER_OF_FIRES) {
        fires.pop();
      }
    }
    if (scene === '2') {
      let S = new sea();
  
      if (VIDEO_AND_POSENET) {
        if (nose) {
          S.create(nose.x - SCREEN_WIDTH / 2, nose.y - SCREEN_HEIGHT / 2);
        }
        /*if (rightWrist){
          S.create(rightWrist.x - SCREEN_WIDTH/2, rightWrist.y - SCREEN_HEIGHT/2);
        }*/
      } else {
        S.create(mouseX - SCREEN_WIDTH/2, mouseY - SCREEN_HEIGHT/2);
      }
      seas.unshift(S);
      
      // Give each wave an angle
      let setAngle = 0;
      if (seas.length > 1) {
        setAngle = atan(
          ((seas[1].waves[0].pos.y - seas[0].waves[0].pos.y)/
            (seas[1].waves[0].pos.x - seas[0].waves[0].pos.x))
        );
      }
      
      for(let i=0; i<seas[0].waves.length; i++){
        seas[0].waves[i].angle = setAngle - PI/2
          + (((seas[1].waves[0].pos.x - seas[0].waves[0].pos.x) > 0) ? PI : 0);
      }
      
      
      if (seas.length > NUMBER_OF_FIRES) {
        seas.pop();
      }
    }
    if (scene === '3') {
      let T = new tree();
  
      if (VIDEO_AND_POSENET) {
        if (nose) {
          T.create(nose.x - SCREEN_WIDTH / 2, nose.y - SCREEN_HEIGHT / 2);
        }
        /*if (rightWrist){
          T.create(rightWrist.x - SCREEN_WIDTH/2, rightWrist.y - SCREEN_HEIGHT/2);
        }*/
      } else {
        T.create(mouseX - SCREEN_WIDTH/2, mouseY - SCREEN_HEIGHT/2);
      }
      
      trees.unshift(T);
      
      // Give each wave an angle
      let setAngle = 0;
      if (trees.length > 1) {
        setAngle = atan(
          ((trees[1].tree[0].pos.y - trees[0].tree[0].pos.y)/
            (trees[1].tree[0].pos.x - trees[0].tree[0].pos.x))
        );
      }
      
      for(let i=0; i<trees[0].tree.length; i++){
        trees[0].tree[i].angle = setAngle - PI/2
          + (((trees[1].tree[0].pos.x - trees[0].tree[0].pos.x) > 0) ? PI : 0);
      }
      
      
      if (trees.length > NUMBER_OF_FIRES) {
        trees.pop();
      }
    }
    time = millis() + REFRESH_RATE;
    
  }
  
  // end scene
  /*if (millis() > sceneStart + SCENE_LENGTH * 1000) {
    scene = '0';
    speechPlayed = false;
  }*/
  
  
}

//***KNN CLASSIFIER STARTS***

// Load dataset to the classifier
function loadMyKNN() {
  //knnClassifier.load('http://sugarsnap.co.uk/elements/myKNNDatasetFinal.json', classify);
  knnClassifier.load('http://sugarsnap.co.uk/elements/myKNNDatasetTest.json', updateCounts);
}

// Predict the current frame.
function classify() {
  // Get the total number of labels from knnClassifier
  const numLabels = knnClassifier.getNumLabels();
  if (numLabels <= 0) {
    console.error('There is no examples in any label');
    return;
  }
  // Convert poses results to a 2d array [[score0, x0, y0],...,[score16, x16, y16]]
  const poseArray = poses[0].pose.keypoints.map(p => [p.score, p.position.x, p.position.y]);
  console.log('classifying');
  // Use knnClassifier to classify which label do these features belong to
  // You can pass in a callback function `gotResults` to knnClassifier.classify function
  knnClassifier.classify(poseArray, gotResults);
}

function gotResults(err, result) {
  // Display any error
  if (err) {
    console.error(err);
  }

  // result.label is the label that has the highest confidence
  if (result.confidencesByLabel) {

    console.log('got results');

    const confidences = result.confidencesByLabel;

    if(confidenceHistory.length < 11){
      confidenceHistory.unshift(result.label);
    }
    if(confidenceHistory.length >10){
      confidenceHistory.pop();
    }



    /*if (result.label) {
      select('#result').html(result.label);
      select('#confidence').html(`${confidences[result.label] * 100} %`);
    }
    
    select('#confidenceA').html(`${confidences['A'] ? confidences['A'] * 100 : 0} %`);
    select('#confidenceB').html(`${confidences['B'] ? confidences['B'] * 100 : 0} %`);*/
  }

  let resultA = 0;
  let resultB = 0;
  let newTriggerPose = false;
  if(confidenceHistory.length > 9){
    for(let i=0; i<confidenceHistory.length; i++){
      if(i<5){
        if(confidenceHistory[i] === 'A'){
          resultA++
        }
        if(confidenceHistory[i] === 'B'){
          resultB++
        }
        if(resultB === 5){
          newTriggerPose=true;
        }
      }
      if((i>4) && newTriggerPose === true) {
        resultA++;
        if(resultA === 5) {
          triggerText=true;
          textTimer = 5000;
          //console.log("triggerText=" + triggerText, " textTimer=" + textTimer);
        }
      }
    }
  }

  if(triggerText === true){
    textOnScreen();
  }
  
  classify();
}

// Update the example count for each label
function updateCounts() {
  const counts = knnClassifier.getCountByLabel();

  /*select('#exampleA').html(counts['A'] || 0);
  select('#exampleB').html(counts['B'] || 0);*/
}

//***KNN CLASSIFIER ENDS***

//***FLAME CLASS STARTS***
let flame = function(alpha, posX, posY){
  let trackedPos = createVector(posX, posY, Z_INDEX);
  let offsetPos = createVector(
    random(-1*FLAME_SPREAD, FLAME_SPREAD),
    random(-1*FLAME_SPREAD, FLAME_SPREAD),
    random(-1*FLAME_SPREAD, FLAME_SPREAD)
  );
  
  this.perlinAlpha = alpha;
  this.pos = trackedPos.add(offsetPos);
  
  this.triHeight = random(20, 50);
  this.col = color(random(204,244),random(155,204),random(0,155),255);
  
  this.x1 = 0-(tan(60)*this.triHeight);
  this.y1 = 0 + this.triHeight;
  this.z1 = 0;
  
  this.x2 = tan(60)*this.triHeight;
  this.y2 = 0 + this.triHeight;
  this.z2 = 0;
  
  this.x3 = 0;
  this.y3 = 0 - this.triHeight;
  this.z3 = 0;
  
  this.angle = 0;
  this.velocity = random(10,80);
  
};

flame.prototype.display = function(){
  push();
  translate(this.pos.x, this.pos.y, this.pos.z);
  rotate(this.angle);
  fill(this.col);
  noStroke();
  beginShape();
  vertex(this.x3, this.y3, this.z3);
  curveVertex(this.x2-20, this.y2-110, this.z2);
  curveVertex(this.x2, this.y2, this.z2);
  curveVertex(this.x1, this.y1, this.z1);
  curveVertex(this.x1+20, this.y1-110, this.z1);
  endShape(CLOSE);
  pop();
};
//***FLAME CLASS ENDS***

//***FIRE CLASS STARTS***
let fire = function fire(){
  this.fire = [];
  this.numOfFlames = FLAMES_PER_FIRE;
  this.perlinGap = 0.3;
};

fire.prototype.create = function(posX, posY){
  for(let i=0; i<this.numOfFlames; i++){
    let f = new flame(5, posX, posY);
    f.col = color(red(f.col), green(f.col), blue(f.col), int(noise(f.perlinAlpha)*255));
    this.fire.push(f);
  }
  return this.fire;
};

//fire.prototype.update = function(path, force){
fire.prototype.update = function(index){
  for(let i = 0; i < this.fire.length; i++){
// increment perlinAlpha of each flame to go along perlin curve
    this.fire[i].perlinAlpha = this.fire[i].perlinAlpha + 0.05;
// noise of perlinAlpha value * 255 gives alpha of colour
    this.fire[i].col = color(
      red(this.fire[i].col),
      green(this.fire[i].col),
      blue(this.fire[i].col),
      int(noise(this.fire[i].perlinAlpha)*255)
    );

// left bottom point of flame
    this.fire[i].x1 = 0 - (tan(60)*this.fire[i].triHeight);
    this.fire[i].y1 = this.fire[i].triHeight;
    this.fire[i].z1 = 0;
// right bottom point of flame
    this.fire[i].x2 = tan(60)*this.fire[i].triHeight;
    this.fire[i].y2 = this.fire[i].triHeight;
    this.fire[i].z2 = 0;
// top point of flame
    this.fire[i].x3 = 0;
    this.fire[i].y3 = 0 - this.fire[i].triHeight;
    this.fire[i].z3 = 0;
    
    if(this.fire[i].triHeight>0){
      this.fire[i].triHeight *= FLAME_DECAY_RATE;
    }
    if (index < fires.length - 1) {
      this.fire[i].pos.y += 0.02 * this.fire[i].velocity/30 * (fires[index+1].fire[0].pos.y - this.fire[i].pos.y);
      this.fire[i].pos.x += 0.02 * this.fire[i].velocity/30 * (fires[index+1].fire[0].pos.x - this.fire[i].pos.x);
    }
    if (index === fires.length) {
      this.fire[i-1].pos.y += 0.02 * this.fire[i-1].velocity/30 * (fires[index].fire[0].pos.y - this.fire[i-1].pos.y);
      this.fire[i-1].pos.x += 0.02 * this.fire[i-1].velocity/30 * (fires[index].fire[0].pos.x - this.fire[i-1].pos.x);
    }
  }
  
};

fire.prototype.display = function(){
  for(let i = 0; i < this.fire.length; i++){
    this.fire[i].display();
  }
};
//***FIRE CLASS ENDS***

//***WAVE CLASS STARTS***
let wave = function(posX, posY, index){
  let trackedPos = createVector(posX, posY, Z_INDEX);
  let offsetPos = createVector(
    random(-1*FLAME_SPREAD, FLAME_SPREAD),
    random(-1*FLAME_SPREAD, FLAME_SPREAD),
    random(-1*FLAME_SPREAD, FLAME_SPREAD)
  );
  
  this.alpha = random(32, 160);
  this.pos = trackedPos.add(offsetPos);
  
  this.waveWidth = random(3, 30);
  this.col = color(random(56,66),random(130,235),random(234,244), this.alpha);
  
  this.waveCurve = []; // points on the curve that we are going to draw
  if (seas.length > 2) {
    /*
    intersection = calculateIntersection(
      seas[0].waves[index].pos,
      seas[1].waves[index].pos,
      seas[2].waves[index].pos,
      seas[3].waves[index].pos
    );
    */
    this.waveCurve.push(this.pos);
    this.waveCurve.push(seas[0].waves[index].pos);
    
    // ---------
  
    seas[0].waves[index].waveCurve = [];  // reset
    
    seas[0].waves[index].waveCurve.push(seas[0].waves[index].pos);
    
    /*
    const intersection = calculateIntersection(
      this.pos,
      seas[0].waves[index].pos,
      seas[1].waves[index].pos,
      seas[2].waves[index].pos
    );*/
    
    let mirrorExtension1 = p5.Vector.sub(seas[0].waves[index].pos,this.pos);
    mirrorExtension1 = p5.Vector.mult(mirrorExtension1, 0.2);
    mirrorExtension1 = p5.Vector.add(mirrorExtension1, seas[0].waves[index].pos);
  
    let mirrorExtension2 = p5.Vector.sub(seas[1].waves[index].pos,seas[2].waves[index].pos);
    mirrorExtension2 = p5.Vector.mult(mirrorExtension2, 0.2);
    mirrorExtension2 = p5.Vector.add(mirrorExtension2, seas[1].waves[index].pos);
    
    for(ii=0;ii<BEZIER_RESOLUTION;ii++) {
      seas[0].waves[index].waveCurve.push(
        GetPointOnBezierCurve(
          seas[0].waves[index].pos,
          mirrorExtension1,
          mirrorExtension2,
          seas[1].waves[index].pos,
          ii/BEZIER_RESOLUTION
        )
      );
    }
    seas[0].waves[index].waveCurve.push(seas[1].waves[index].pos);
    
  }
  
  this.x = 0;
  this.y = 0;
  this.z = 0;
  
};

wave.prototype.update = function(index){
};


wave.prototype.display = function(){
  push();
  translate(this.pos.x, this.pos.y, this.pos.z);
  fill(this.col);
  noStroke();
  circle(this.x,this.y,this.waveWidth);
  pop();
};
//***WAVE CLASS ENDS***

//***SEA CLASS STARTS***
let sea = function sea(){
  this.waves = [];
  this.numOfWaves = FLAMES_PER_FIRE; //random(5, 15);
};

sea.prototype.create = function(posX, posY){
  for(let i=0; i<this.numOfWaves; i++){
    let w = new wave(posX, posY, i);
    w.col = color(red(w.col), green(w.col), blue(w.col), w.alpha);
    this.waves.push(w);
  }
  return this.waves;
};

//sea.prototype.update
sea.prototype.update = function(){
  for(let i = 0; i < this.waves.length; i++){
    
    this.waves[i].update();
    //console.log(this.sea[i].waveHistory);
    
    if(this.waves[i].waveWidth>0){
      this.waves[i].waveWidth *= FLAME_DECAY_RATE;
    }
  }
};

sea.prototype.display = function(index){
  for(let i = 0; i < this.waves.length; i++){
    this.waves[i].display();
  }
  
  for(let j = 0; j < seas[index].waves.length; j++) {
    strokeWeight(seas[index].waves[j].waveWidth);
    stroke(seas[index].waves[j].col);
    noFill();
	//fill(seas[index].waves[j].col);
    beginShape();
	//curveVertex(seas[index].waves[j].waveCurve[0].x, seas[index].waves[j].waveCurve[0].y);
    for (let k = 0; k < seas[index].waves[j].waveCurve.length; k++) {
      /*
      line(
        seas[index].waves[j].waveCurve[k].x,
        seas[index].waves[j].waveCurve[k].y,
        seas[index].waves[j].waveCurve[k+1].x,
        seas[index].waves[j].waveCurve[k+1].y,
      );
      */
      curveVertex(seas[index].waves[j].waveCurve[k].x, seas[index].waves[j].waveCurve[k].y);
    }
	//curveVertex(seas[index].waves[j].waveCurve[seas[index].waves[j].waveCurve.length-1].x, seas[index].waves[j].waveCurve[seas[index].waves[j].waveCurve.length-1].y);
    endShape();
    if (seas[index].waves[j].waveCurve.length > 2) {
      fill(seas[index].waves[j].col);
      noStroke();
      circle(
        seas[index].waves[j].waveCurve[0].x,
        seas[index].waves[j].waveCurve[0].y,
        seas[index].waves[j].waveWidth/2
      );
    }
  }
};
//***SEA CLASS ENDS***

//***BRANCH CLASS STARTS***
let branch = function(posX, posY){
  let trackedPos = createVector(posX, posY, Z_INDEX);
  let offsetPos = createVector(
    random(-1*FLAME_SPREAD, FLAME_SPREAD),
    random(-1*FLAME_SPREAD, FLAME_SPREAD),
    random(-1*FLAME_SPREAD, FLAME_SPREAD)
  );
  
  this.alpha = random(32, 160);
  this.pos = trackedPos.add(offsetPos);
  
  this.leafHeight = random(30, 40);
  this.branchWidth = random(3, 7);
  this.col = color(random(101,148),random(155,214),random(26,55), this.alpha);
  this.col1 = color(random(127,165),random(79,108),random(8,23), this.alpha);
  this.branchHistory = [];
  
  this.x = 0;
  this.y = 0;
  this.z = 0;
  
  this.angle = 0;
  this.velocity = random(10,80);
  
};

branch.prototype.update = function(){
  this.pos.x -= random(0,3);
  this.pos.y += random(0,2);
  this.alpha += FLAME_DECAY_RATE;
  
  
};

branch.prototype.display = function(){
  push();
  translate(this.pos.x, this.pos.y, this.pos.z);
  rotate(this.angle);
  fill(this.col);
  noStroke();
  
  beginShape();
  vertex(this.x, this.y-this.leafHeight, this.z);
  curveVertex(this.x, this.y-this.leafHeight, this.z);
  curveVertex(this.x+(this.leafHeight/8), this.y-(0.75*this.leafHeight), this.z);
  curveVertex(this.x+(this.leafHeight/5), this.y-(this.leafHeight/4), this.z);
  curveVertex(this.x, this.y, this.z);
  vertex(this.x, this.y, this.z);
  curveVertex(this.x, this.y, this.z);
  curveVertex(this.x-(this.leafHeight/5), this.y-(this.leafHeight/4), this.z);
  curveVertex(this.x-(this.leafHeight/8), this.y-(0.75*this.leafHeight), this.z);
  curveVertex(this.x, this.y-this.leafHeight, this.z);
  vertex(this.x, this.y-this.leafHeight, this.z);
  endShape(CLOSE);
  
  fill(this.col1);
  circle(this.x, this.y, this.branchWidth);
  pop();
  
  
  /*for (let i = 0; i < this.branchHistory.length; i++) {
    var tFac = this.branchHistory[i];
    push();
    translate(tFac.x, tFac.y, tFac.z);
    //rotate(this.angle);
    fill(this.col);
    noStroke();
    circle(this.x, this.y, this.branchWidth/2);
    pop();
  }*/
  
  
};
//***BRANCH CLASS ENDS***

//***TREE CLASS STARTS***
let tree = function tree(){
  this.tree = [];
  this.numOfBranches = FLAMES_PER_FIRE; //random(5, 15);
};

tree.prototype.create = function(posX, posY){
  for(let i=0; i<this.numOfBranches; i++){
    let b = new branch(posX, posY);
    b.col = color(red(b.col), green(b.col), blue(b.col), b.alpha);
    b.col1 = color(red(b.col1), green(b.col1), blue(b.col1), b.alpha);
    this.tree.push(b);
  }
  return this.tree;
};

//tree.prototype.update
tree.prototype.update = function(index){
  for(let i = 0; i < this.tree.length; i++){
    
    this.tree[i].update();

// draw tree
    this.tree[i].x = 0;
    this.tree[i].y = 0;
    this.tree[i].z = 0;
    
  }
  
  
  
};

tree.prototype.display = function(){
  for(let i = 0; i < this.tree.length; i++){
    this.tree[i].display();
  }
};
//***TREE CLASS ENDS***

//***BEZIER CURVE HELPER FUNCTION***
// from https://denisrizov.com/2016/06/02/bezier-curves-unity-package-included/
