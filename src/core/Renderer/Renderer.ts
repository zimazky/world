import Pipeline from './Pipeline'

export default class Renderer {
  private context: GPUCanvasContext
  private device!: GPUDevice
  private pipeline!: Pipeline

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('webgpu')
    if(!context) {
      const msg = 'WebGPU not supported'
      alert(msg)
      throw new Error(msg)
    }
    this.context = context
  }

  async initialize() {
    const {device, format} = await initWebGPU(this.context)
    this.device = device
    this.pipeline = new Pipeline(device, format)
    await this.pipeline.initialize()
  }

  public render() {
    const commandEncoder = this.device.createCommandEncoder()
    const textureView = this.context.getCurrentTexture().createView()
    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [{
        view: textureView,
        clearValue: { r: 0, g: 0, b: 0, a: 1},
        loadOp: 'clear',
        storeOp: 'store'
      }]
    }
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor)
    
    // todo: draw
    this.pipeline.draw(passEncoder)
    passEncoder.end()

    this.device.queue.submit([commandEncoder.finish()])
  }
}

async function initWebGPU(context: GPUCanvasContext): Promise<{device: GPUDevice, format: GPUTextureFormat}> {
  const adapter = await navigator.gpu.requestAdapter({
    powerPreference: 'high-performance'
  })
  if(!adapter) {
    const msg = 'No adapter found'
    alert(msg)
    throw new Error(msg)
  }
  const device = await adapter.requestDevice({
    // можем подключить расширения
    requiredFeatures: [
      //'texture-compression-bc'
    ],
    // можем изменить ограничения
    requiredLimits: {
      //maxStorageBufferBindingSize: adapter.limits.maxStorageBufferBindingSize
    }
  })
  const format = navigator.gpu.getPreferredCanvasFormat()
  context.configure({ device, format })
  //console.log(adapter)
  //console.log(this.device)
  //adapter.features.forEach(f=>console.log(f))
  return {device, format}
}
