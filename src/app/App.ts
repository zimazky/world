import APipeline from 'src/pipelines/APipeline/APipeline'
import { Renderer } from 'src/core/Renderer'
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

  /** Информационный блок */
  divinfo: HTMLElement
  /** Время, когда должен обновиться информационный блок */
  infoRefreshTime = 0
  /** Признак запущенного цикла анимации */
  running: boolean = false

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const width  = window.innerWidth
    const height = window.innerHeight
    this.canvas.width  = width
    this.canvas.height = height
    this.renderer = new Renderer(this.canvas)
    initKeyBuffer()
    const divinfo = document.getElementById('info')
    if(!divinfo) throw new Error('Div element id="info" not found')
    this.divinfo = divinfo
  }

  async initialize() {
    this.renderer = new Renderer(this.canvas)
    await this.renderer.initialize()
    const pipeline = new APipeline(this.renderer.format)
    await this.renderer.addPipelineAsync(pipeline)


    this.startTime = this.currentTime = performance.now()/1000.
  }

  run = () => {
    const lCurrentTime = performance.now()/1000.
    const time = lCurrentTime - this.startTime
    const dt = lCurrentTime - this.currentTime
    this.currentTime = lCurrentTime
    this.frame++

    if(time>this.infoRefreshTime) {
      this.divinfo.innerText = 
        `dt: ${dt.toFixed(2)} fps: ${(1000/dt).toFixed(2)} 
        ${this.canvas.width} x ${this.canvas.height}`
      this.infoRefreshTime = time + 0.5
    }

    this.renderer.render()

    if(this.running) {
        requestAnimationFrame(this.run)
    }
  }
}