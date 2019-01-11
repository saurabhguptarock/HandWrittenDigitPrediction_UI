let canvas1 = document.getElementById("chart");
let draw = document.getElementById("draw");
let mychart = canvas1.getContext("2d");
let context = draw.getContext("2d");

var prediction = [];
var model;
var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var paint;

$("#draw").mousedown(function(e) {
  var mouseX = e.pageX - this.offsetLeft;
  var mouseY = e.pageY - this.offsetTop;

  paint = true;
  addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
  redraw();
});

$("#draw").mousemove(function(e) {
  if (paint) {
    addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
    redraw();
  }
});

$("#draw").mouseup(function(e) {
  var img = draw;
  predict(img);
  for (let i = 0; i < prediction.length; i++) {
    prediction[i] = Math.round(prediction[i]);
  }
  let barChart = new Chart(mychart, {
    type: "bar",
    data: {
      labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      datasets: [
        {
          label: "Prediction",
          data: prediction,
          backgroundColor: "rgba(255, 140, 9, 0.6)",
          borderWidth: 1,
          borderColor: "#fff",
          hoverBorderWidth: 2
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: "Predction",
        fontSize: 35,
        fontColor: "#fff"
      },
      legend: {
        display: false
      }
    }
  });
  paint = false;
});
$("#draw").mouseleave(function(e) {
  paint = false;
});

function addClick(x, y, dragging) {
  clickX.push(x);
  clickY.push(y);
  clickDrag.push(dragging);
}
function redraw() {
  context.clearRect(0, 0, draw.width, draw.height); // Clears the canvas

  context.strokeStyle = "white";
  context.lineJoin = "dot";
  context.lineWidth = 1;

  for (var i = 0; i < clickX.length; i++) {
    context.beginPath();
    if (clickDrag[i] && i) {
      context.moveTo(clickX[i - 1], clickY[i - 1]);
    } else {
      context.moveTo(clickX[i] - 1, clickY[i]);
    }
    context.lineTo(clickX[i], clickY[i]);
    context.closePath();
    context.stroke();
  }
}
async function loadModel() {
  model = await tf.loadModel("./assets/model.json");
  console.log("model loaded");
}

async function predict(imageData) {
  const pred = await tf.tidy(() => {
    let img = tf.fromPixels(imageData, 1);
    img = img.reshape([1, 28, 28, 1]);
    img = tf.cast(img, "float32");
    const output = model.predict(img);
    prediction = Array.from(output.dataSync());
  });
}
loadModel();
