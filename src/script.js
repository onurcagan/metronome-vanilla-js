class Metronome {
  constructor(audioContext, startStopButton, tempoSlider, bpmInput, timeSignatureTop, timeSignatureBottom) {
    this.audioContext = audioContext
    this.startStopButton = startStopButton
    this.tempoSlider = tempoSlider
    this.bpmInput = bpmInput
    this.timeSignatureTop = timeSignatureTop
    this.timeSignatureBottom = timeSignatureBottom
    this.isRunning = false
    this.metronomeIntervalId = null
    this.currentBpm = 120
    this.timeSignature = [6, 8]
    this.currentBeat = 1
    this.setupEventListeners()
  }

  setupEventListeners() {
    this.startStopButton.addEventListener('click', () => this.toggle())
    this.tempoSlider.addEventListener('input', (e) => this.updateBpm(e.target.value))
    this.bpmInput.addEventListener('input', (e) => this.handleBpmInputChange(e.target.value))
    this.timeSignatureTop.addEventListener('input', (e) => this.setTimeSignature(Number(e.target.value), this.timeSignature[1]))
    this.timeSignatureBottom.addEventListener('input', (e) => this.setTimeSignature(this.timeSignature[0], Number(e.target.value)))
    window.addEventListener('keydown', (e) => {
      // if space bar is pressed
      if (e.key == ' ') {
        this.toggle()
      }
    })
  }

  setTimeSignature(top, bottom) {
    this.timeSignature = [top, bottom]
    this.currentBeat = 1
    if (this.isRunning) {
      this.updateInterval()
    }
  }

  handleBpmInputChange(value) {
    if (this.validateBpm(value)) {
      this.updateBpm(value)
    }
  }

  validateBpm(value) {
    const bpm = parseInt(value, 10)
    return bpm >= 40 && bpm <= 200
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
    let beatUnit = 60000 / this.currentBpm
    if (this.isCompoundTimeSignature()) {
      // In compound time, BPM is based on dotted quarter notes.
      // There are 3 eighth notes in a dotted quarter note.
      beatUnit /= 3
    }
    this.metronomeIntervalId = setInterval(() => this.playClick(), beatUnit)
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

  isCompoundTimeSignature() {
    return this.timeSignature[1] === 8 && [6, 9, 12].includes(this.timeSignature[0])
  }

  playClick() {
    const isAccentedBeat = this.currentBeat === 1
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(isAccentedBeat ? 1000 : 800, this.audioContext.currentTime)
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(isAccentedBeat ? 1 : 0.7, this.audioContext.currentTime + 0.001)
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.1)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.1)

    if (this.currentBeat >= this.timeSignature[0]) {
      console.log('this.currentBeat', this.currentBeat)
      this.currentBeat = 1
    } else if (this.isCompoundTimeSignature()) {
      console.log('this.currentBeat', this.currentBeat)
      this.currentBeat = this.currentBeat + this.timeSignature[0] / 2
    } else {
      console.log('this.currentBeat', this.currentBeat)
      this.currentBeat++
    }
  }
}

// Initialize the metronome
const audioContext = new (window.AudioContext || window.webkitAudioContext)()
const startStopButton = document.getElementById('startStop')
const tempoSlider = document.getElementById('tempoSlider')
const bpmInput = document.getElementById('bpmInput')
const timeSignatureTop = document.getElementById('timeSignatureTop')
const timeSignatureBottom = document.getElementById('timeSignatureBottom')
const metronome = new Metronome(audioContext, startStopButton, tempoSlider, bpmInput, timeSignatureTop, timeSignatureBottom)
