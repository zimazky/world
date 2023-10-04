import aShader from 'src/shaders/a.wgsl'
import QuadGeometry from '../Geometry/QuadGeometry'
import Texture from './Texture'

export default class Renderer {
  private context: GPUCanvasContext
  private device!: GPUDevice
  private pipeline!: GPURenderPipeline
  private positionsBuffer!: GPUBuffer
  private colorsBuffer!: GPUBuffer
  private texCoordsBuffer!: GPUBuffer
  private textureBindGroup!: GPUBindGroup

  private testTexture!: Texture

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

    this.testTexture = await Texture.createTextureFromUrl(this.device, 'assets/cat-head.jpg')
    this.prepareModel()

    const geometry = new QuadGeometry()

    this.positionsBuffer = this.createBuffer(new Float32Array(geometry.positions))
    this.colorsBuffer = this.createBuffer(new Float32Array(geometry.colors))
    this.texCoordsBuffer = this.createBuffer(new Float32Array(geometry.texCoords))
  }

  private createBuffer(data: Float32Array): GPUBuffer {
    const buffer = this.device.createBuffer({
      size: data.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true
    })
    new Float32Array(buffer.getMappedRange()).set(data)
    buffer.unmap()
    return buffer
  }

  private prepareModel() {
    const shaderModule = this.device.createShaderModule({
      code: aShader
    })
    const positionBufferLayout: GPUVertexBufferLayout = {
      arrayStride: 2*4, // 2 floats * 4 bytes per float
      attributes: [{
        shaderLocation: 0,
        offset: 0,
        format: 'float32x2' // 2 floats
      }],
      stepMode: 'vertex'
    }
    const colorBufferLayout: GPUVertexBufferLayout = {
      arrayStride: 3*4, // 3 floats * 4 bytes per float
      attributes: [{
        shaderLocation: 1,
        offset: 0,
        format: 'float32x3' // 2 floats
      }],
      stepMode: 'vertex'
    }
    const textureCoordsLayout: GPUVertexBufferLayout = {
      arrayStride: 2*4,
      attributes: [{
        shaderLocation: 2,
        offset: 0,
        format: 'float32x2'
      }],
      stepMode: 'vertex'
    }

    const vertexState: GPUVertexState = {
      module: shaderModule,
      entryPoint: 'vertexMain',
      buffers: [
        positionBufferLayout,
        colorBufferLayout,
        textureCoordsLayout
      ]
    }
    const fragmentState: GPUFragmentState = {
      module: shaderModule,
      entryPoint: 'fragmentMain',
      targets: [{
        format: navigator.gpu.getPreferredCanvasFormat()
      }]
    }

    const textureBindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT,
          sampler: {}
        },
        {
          binding: 1,
          visibility: GPUShaderStage.FRAGMENT,
          texture: {}
        }
      ]
    })

    const pipelineLayout = this.device.createPipelineLayout({
      bindGroupLayouts: [
        textureBindGroupLayout
      ]
    })

    this.textureBindGroup = this.device.createBindGroup({
      layout: textureBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: this.testTexture.sampler
        },
        {
          binding: 1,
          resource: this.testTexture.texture.createView()
        }
      ]
    })

    this.pipeline = this.device.createRenderPipeline({
      vertex: vertexState,
      fragment: fragmentState,
      primitive: {
        topology: 'triangle-strip'
      },
      layout: pipelineLayout
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
    passEncoder.setPipeline(this.pipeline)
    passEncoder.setVertexBuffer(0, this.positionsBuffer)
    passEncoder.setVertexBuffer(1, this.colorsBuffer)
    passEncoder.setVertexBuffer(2, this.texCoordsBuffer)
    passEncoder.setBindGroup(0, this.textureBindGroup)
    passEncoder.draw(4)
    passEncoder.end()

    this.device.queue.submit([commandEncoder.finish()])
  }

}