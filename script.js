let isRunning = false
let metronomeInterval
const tempoSlider = document.getElementById('tempoSlider')
const tempoDisplay = document.getElementById('tempoDisplay')
const startStopButton = document.getElementById('startStop')

// Create an instance of AudioContext
const audioContext = new (window.AudioContext || window.webkitAudioContext)()

function playClick() {
  // Create an oscillator node
  const oscillator = audioContext.createOscillator()
  // Create a gain node
  const gainNode = audioContext.createGain()

  oscillator.type = 'sine'
  // Connect the oscillator to the gain node
  oscillator.connect(gainNode)
  // Connect the gain node to the audio context destination (speakers)
  gainNode.connect(audioContext.destination)

  // Set the duration of the click
  gainNode.gain.setValueAtTime(0, audioContext.currentTime)
  gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.001)
  gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1)

  // Start the oscillator
  oscillator.start(audioContext.currentTime)
  // Stop the oscillator after the click's duration
  oscillator.stop(audioContext.currentTime + 0.1)
}

// Function to start or stop the metronome
// Update the toggleMetronome function
function toggleMetronome() {
  if (isRunning) {
    clearInterval(metronomeInterval)
    startStopButton.textContent = 'Start'
  } else {
    // Resume the audio context in case it was suspended
    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }
    const bpm = tempoSlider.value
    const intervalTime = 60000 / bpm
    metronomeInterval = setInterval(playClick, intervalTime)
    startStopButton.textContent = 'Stop'
  }
  isRunning = !isRunning
}

// Event listener for the start/stop button
startStopButton.addEventListener('click', toggleMetronome)

// Event listener for the tempo slider
tempoSlider.addEventListener('input', function () {
  tempoDisplay.textContent = `${this.value} BPM`
  if (isRunning) {
    // Stop and restart the metronome to reflect the updates in the tempo
    toggleMetronome()
    toggleMetronome()
  }
})
