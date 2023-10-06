import IPipeline from './IPipeline'

export default class Renderer {

  format: GPUTextureFormat

  private context: GPUCanvasContext
  private device!: GPUDevice
  private pipelines: IPipeline[] = []

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('webgpu')
    if(!context) {
      const msg = 'WebGPU not supported'
      alert(msg)
      throw new Error(msg)
    }
    this.context = context
    this.format = navigator.gpu.getPreferredCanvasFormat()
  }

  async initialize() {
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
    this.context.configure({ device, format: this.format })
    //console.log(adapter)
    //console.log(this.device)
    //adapter.features.forEach(f=>console.log(f))
    this.device = device
  }

  async addPipelineAsync(pipeline: IPipeline) {
    this.pipelines.push(pipeline)
    await pipeline.initialize(this.device)
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
    this.pipelines.forEach(p=>p.draw(passEncoder))
    passEncoder.end()

    this.device.queue.submit([commandEncoder.finish()])
  }
  
}

