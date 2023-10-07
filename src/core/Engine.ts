import Camera from 'src/core/Camera'
import { Renderer } from './Renderer'
import IcosahedronRenderPass from 'src/renderpasses/Icosahedron/IcosahedronRenderPass'
import { initKeyBuffer, isKeyPress } from 'src/shared/libs/Keyboard'

const KEY_P = 80

export default class Engine {
  canvas: HTMLCanvasElement
  renderer: Renderer
  renderPasses: IRenderPass[] = []

  /** Время запуска программы */
  startTime: number = 0
  /** Текущее время */
  currentTime: number = 0
  /** Счетчик кадров */
  frame: number = 0
  /** Признак запущенного цикла анимации */
  running: boolean = false
  /** Время, когда должен обновиться информационный блок */
  infoRefreshTime = 0

  /** Информационный блок */
  divinfo: HTMLElement


  constructor(canvas: HTMLCanvasElement, divinfo: HTMLElement) {
    this.canvas = canvas
    const width  = window.innerWidth
    const height = window.innerHeight
    this.canvas.width  = width
    this.canvas.height = height
    this.renderer = new Renderer(this.canvas)
    initKeyBuffer()
    this.divinfo = divinfo
  }

  async addRenderPass(renderPass: IRenderPass) {
    this.renderPasses.push(renderPass)
    await renderPass.initialize(this.renderer)
  }

  async initialize() {
    await this.renderer.initialize()
    const canvas = this.renderer.context.canvas
    const size = {width: canvas.width, height: canvas.height}
    const camera = new Camera(size.width/size.height)
    const renderPass = new IcosahedronRenderPass(camera)
    await this.addRenderPass(renderPass)

    this.startTime = this.currentTime = performance.now()/1000.
  }

  run = () => {
    const lCurrentTime = performance.now()/1000.
    const time = lCurrentTime - this.startTime
    const dt = lCurrentTime - this.currentTime
    this.currentTime = lCurrentTime
    this.frame++

    if(isKeyPress(KEY_P)) this.running = false

    const commandEncoder = this.renderer.device.createCommandEncoder()
    this.renderPasses.forEach(p=>p.render(commandEncoder, time, dt))
    this.renderer.device.queue.submit([commandEncoder.finish()])

    const canvas = this.renderer.context.canvas

    if(time>this.infoRefreshTime) {
      this.divinfo.innerText = 
        `dt: ${dt.toFixed(2)} fps: ${(1000/dt).toFixed(2)} 
        ${canvas.width} x ${canvas.height}`
      this.infoRefreshTime = time + 0.5
    }

    if(this.running) {
        requestAnimationFrame(this.run)
    }
  }
}

export interface IRenderPass {
  initialize(renderer: Renderer): Promise<void>
  render(commandEncoder: GPUCommandEncoder, time: number, timeDelta: number): void
}