export class Renderer {

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

  static createBuffer<T extends ArrayBuffer>(device: GPUDevice, usage: number, data: T): GPUBuffer {
    const buffer = device.createBuffer({
      size: data.byteLength,
      usage
    })
    device.queue.writeBuffer(buffer, 0, data)
    return buffer
  }

  static createVertexBuffer<T extends ArrayBuffer>(device: GPUDevice, data: T): GPUBuffer {
    const buffer = device.createBuffer({
      size: data.byteLength,
      usage:  GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    })
    device.queue.writeBuffer(buffer, 0, data)
    return buffer
  }

  static createIndexBuffer<T extends ArrayBuffer>(device: GPUDevice, data: T): GPUBuffer {
    const buffer = device.createBuffer({
      size: data.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
    })
    device.queue.writeBuffer(buffer, 0, data)
    return buffer
  }

  static async createTexture(device: GPUDevice, image: HTMLImageElement)
  : Promise<{texture: GPUTexture, sampler: GPUSampler}> {
    const texture = device.createTexture({
      size: {width: image.width, height: image.height},
      format: 'rgba8unorm',
      usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT
    })
    const data = await createImageBitmap(image)
    device.queue.copyExternalImageToTexture(
      {source: data},
      {texture},
      {width: image.width, height: image.height}
    )
    const sampler = device.createSampler({
      magFilter: 'linear',
      minFilter: 'linear',
    })
    return {texture, sampler}
  }


}

export interface IPipeline {
  initialize(device: GPUDevice): Promise<void>
  draw(passEncoder: GPURenderPassEncoder): void
}