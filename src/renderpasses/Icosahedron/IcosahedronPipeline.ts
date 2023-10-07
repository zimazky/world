import shader from 'src/shaders/icosahedron.wgsl'
import { IRenderPass, Renderer } from 'src/core/Renderer'
import Icosahedron from './Icosahedron'
import { Mat4, Vec3 } from 'src/shared/libs/Vectors/Vectors'
import Camera from './Camera'

export default class IcosahedronPipeline implements IRenderPass{
  private camera: Camera
  private size: {width: number, height: number}

  private device!: GPUDevice
  private format: GPUTextureFormat
  private pipeline!: GPURenderPipeline

  private positionsBuffer!: GPUBuffer
  private colorsBuffer!: GPUBuffer
  private indexBuffer!: GPUBuffer
  private triangles: number = 20
  private mvpMatrix: Mat4 = Mat4.ID.mul(0.5)
  private uniformBuffer!: GPUBuffer
  private uniformGroup!: GPUBindGroup

  private depthTexture!: GPUTexture
  private outTexture: GPUTexture | null = null

  constructor(format: GPUTextureFormat, camera: Camera, size: {width: number, height: number}) {
    this.format = format
    this.camera = camera
    this.size = size
  }

  async initialize(device: GPUDevice) {
    this.device = device

    const shaderModule = this.device.createShaderModule({
      code: shader
    })
    const positionBufferLayout: GPUVertexBufferLayout = {
      arrayStride: 3*4, // 3 floats * 4 bytes per float
      attributes: [{
        shaderLocation: 0,
        offset: 0,
        format: 'float32x3' // 3 floats
      }],
      stepMode: 'vertex'
    }
    const colorBufferLayout: GPUVertexBufferLayout = {
      arrayStride: 3*4, // 3 floats * 4 bytes per float
      attributes: [{
        shaderLocation: 1,
        offset: 0,
        format: 'float32x3' // 3 floats
      }],
      stepMode: 'vertex'
    }

    this.pipeline = await this.device.createRenderPipelineAsync({
      vertex: {
        module: shaderModule,
        entryPoint: 'vertexMain',
        buffers: [
          positionBufferLayout,
          colorBufferLayout
        ]
      },
      fragment: {
        module: shaderModule,
        entryPoint: 'fragmentMain',
        targets: [{
          format: this.format
        }]
      },
      primitive: {
        topology: 'triangle-list'
      },
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: 'less',
        format: 'depth24plus'
      },
      layout: 'auto'
    })
    this.depthTexture = device.createTexture({
      size: this.size, format: 'depth24plus', usage: GPUTextureUsage.RENDER_ATTACHMENT
    })

    const geometry = new Icosahedron()

    this.positionsBuffer = Renderer.createVertexBuffer(this.device, new Float32Array(geometry.verticies))
    this.colorsBuffer = Renderer.createVertexBuffer(this.device, new Float32Array(geometry.colors))
    this.indexBuffer = Renderer.createIndexBuffer(this.device, new Uint16Array(geometry.indicies))

    this.mvpMatrix = Mat4.ID
      .translate(new Vec3(0, 0, -3))
      .rotate(Vec3.J, -1.5)
      .scale(Vec3.ONE.mulMutable(1))
      .mulMatLeft(this.camera.projectionMatrix)

    this.uniformBuffer = Renderer.createUniformBuffer(this.device, this.mvpMatrix.getFloat32Array())


    this.uniformGroup = this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: { buffer: this.uniformBuffer }
        }
      ]
    })

  }

  draw(commandEncoder: GPUCommandEncoder, context: GPUCanvasContext, time: number) {

    this.mvpMatrix = Mat4.ID
      .translate(new Vec3(0, 0, -3))
      .rotate(Vec3.J, 0.1*time)
      .scale(Vec3.ONE.mulMutable(1))
      .mulMatLeft(this.camera.projectionMatrix)
    this.device.queue.writeBuffer(this.uniformBuffer, 0, this.mvpMatrix.getFloat32Array())

    let texture = this.outTexture
    if(!texture) texture = context.getCurrentTexture()

    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [{
        view: texture.createView(),
        clearValue: { r: 0, g: 0, b: 0, a: 1},
        loadOp: 'clear',
        storeOp: 'store'
      }],
      depthStencilAttachment: {
        view: this.depthTexture.createView(),
        depthClearValue: 1,
        depthLoadOp: 'clear',
        depthStoreOp: 'store'
      }
    }
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor)
    

    passEncoder.setPipeline(this.pipeline)
    passEncoder.setIndexBuffer(this.indexBuffer, 'uint16')
    passEncoder.setVertexBuffer(0, this.positionsBuffer)
    passEncoder.setVertexBuffer(1, this.colorsBuffer)
    passEncoder.setBindGroup(0, this.uniformGroup)
    passEncoder.drawIndexed(this.triangles*3)

    passEncoder.end()

  }

}