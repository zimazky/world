import Renderer from 'src/core/Renderer/Renderer'
import { initKeyBuffer } from 'src/shared/libs/Keyboard'

export default class App {
  canvas: HTMLCanvasElement
  renderer: Renderer
  /** Время запуска программы */
  startTime: number = 0
  /** Текущее время */
  currentTime: number = 0
  /** Счетчик кадров */
  frame: number = 0


  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.renderer = new Renderer(this.canvas)
    initKeyBuffer()
  }

  async initialize() {
    this.renderer = new Renderer(this.canvas)
    await this.renderer.initialize()
    this.startTime = this.currentTime = performance.now()/1000.
  }

  run = () => {
    var running = true

    const lCurrentTime = performance.now()/1000.
    const time = lCurrentTime - this.startTime
    const timeDelta = lCurrentTime - this.currentTime
    this.currentTime = lCurrentTime
    this.frame++

    this.renderer.render()
/*
    if(running) {
        requestAnimationFrame(this.run)
    }
*/
  }
}