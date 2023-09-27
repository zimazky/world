export default class Renderer {
  private context: GPUCanvasContext
  private device!: GPUDevice

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('webgpu')
    if(!context) {
      const msg = 'WebGPU not supported'
      alert(msg)
      throw new Error(msg)
    }
    this.context = context
  }

  public async initialize() {
    const adapter = await navigator.gpu.requestAdapter({
      powerPreference: 'high-performance'
    })
    if(!adapter) {
      const msg = 'No adapter found'
      alert(msg)
      throw new Error(msg)
    }
    this.device = await adapter.requestDevice()
    this.context.configure({
      device: this.device,
      format: navigator.gpu.getPreferredCanvasFormat()
    })
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

    passEncoder.end()
    this.device.queue.submit([commandEncoder.finish()])
  }

}