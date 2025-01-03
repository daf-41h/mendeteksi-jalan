let model, webcam, labelContainer, intervalId;
let isRunning = false;

async function init() {
  model = await tmImage.load("models/model.json", "models/metadata.json");

  const videoElement = document.getElementById("webcam-feed");
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  videoElement.srcObject = stream;

  webcam = new tmImage.Webcam(225, 200, true); // For prediction only
  await webcam.setup({ videoElement });
  await webcam.play();

  document.getElementById("webcam-container").classList.remove("hidden");
  document.getElementById("result").classList.remove("hidden");
  labelContainer = document.getElementById("result");
  intervalId = setInterval(predict, 100);
}

// async function predict() {
//   const prediction = await model.predict(webcam.canvas);
//   prediction.forEach((p) => {
//     if (p.probability > 0.5) {
//       labelContainer.innerHTML = p.className;
//       speak(p.className);
//     }
//   });
// }

async function predict() {
    const prediction = await model.predict(webcam.canvas);
    prediction.forEach((p) => {
      console.log(`Class: ${p.className}, Probability: ${p.probability}`);
    });

    // Tampilkan hasil jika probabilitas lebih dari threshold
    const highProbPrediction = prediction.find(p => p.probability > 0.5);
    if (highProbPrediction) {
      labelContainer.innerHTML = highProbPrediction.className;
      speak(highProbPrediction.className);
    }
}

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);
}

function stop() {
  const videoElement = document.getElementById("webcam-feed");
  const stream = videoElement.srcObject;
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    videoElement.srcObject = null;
  }

  if (webcam) webcam.stop();
  if (intervalId) clearInterval(intervalId);
  labelContainer.innerHTML = "";
  window.speechSynthesis.cancel();
  document.getElementById("result").classList.add("hidden");
  document.getElementById("webcam-container").classList.add("hidden");
}

function toggle() {
  const button = document.getElementById("control-button");
  if (isRunning) {
    stop();
    button.textContent = "Mulai";
    button.classList.replace("bg-red-600", "bg-blue-600");
  } else {
    init();
    button.textContent = "Berhenti";
    button.classList.replace("bg-blue-600", "bg-red-600");
  }
  isRunning = !isRunning;
}
