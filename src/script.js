class Metronome {
  constructor(audioContext, startStopButton, tempoSlider, bpmInput) {
    this.audioContext = audioContext
    this.startStopButton = startStopButton
    this.tempoSlider = tempoSlider
    this.bpmInput = bpmInput
    this.isRunning = false
    this.metronomeIntervalId = null
    this.currentBpm = 120 // Default value
    this.setupEventListeners()
  }

  setupEventListeners() {
    this.startStopButton.addEventListener('click', () => this.toggle())
    this.tempoSlider.addEventListener('input', (e) => this.updateBpm(e.target.value))
    this.bpmInput.addEventListener('input', (e) => this.handleBpmInputChange(e.target.value))
    window.addEventListener('keydown', (e) => {
      // if space bar is pressed
      if (e.key == ' ') {
        this.toggle()
      }
    })
  }

  handleBpmInputChange(value) {
    if (this.validateBpm(value)) {
      this.updateBpm(value)
    }
  }

  validateBpm(value) {
    const bpm = parseInt(value, 10)
    return bpm >= 40 && bpm <= 208
  }

  updateBpm(value) {
    this.currentBpm = value
    this.bpmInput.value = value
    this.tempoSlider.value = value
    if (this.isRunning) {
      this.updateInterval()
    }
  }

  updateInterval() {
    clearInterval(this.metronomeIntervalId)
    const intervalTime = 60000 / this.currentBpm
    this.metronomeIntervalId = setInterval(() => this.playClick(), intervalTime)
  }

  toggle() {
    if (this.isRunning) {
      this.stop()
    } else {
      this.start()
    }
  }

  start() {
    this.updateInterval()
    this.startStopButton.textContent = 'Stop'
    this.isRunning = true
  }

  stop() {
    clearInterval(this.metronomeIntervalId)
    this.startStopButton.textContent = 'Start'
    this.isRunning = false
  }

  playClick() {
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.type = 'sine'
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + 0.001)
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.1)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.1)
  }
}

// Initialize the metronome
const audioContext = new (window.AudioContext || window.webkitAudioContext)()
const startStopButton = document.getElementById('startStop')
const tempoSlider = document.getElementById('tempoSlider')
const bpmInput = document.getElementById('bpmInput')
const metronome = new Metronome(audioContext, startStopButton, tempoSlider, bpmInput)
