import shader from 'src/shaders/icosahedron.wgsl'
import { Renderer } from 'src/core/Renderer'
import Icosahedron from './Icosahedron'
import { Mat4, Vec3 } from 'src/shared/libs/Vectors/Vectors'
import Camera from 'src/core/Camera'
import { IRenderPass } from 'src/core/Engine'

export default class IcosahedronRenderPass implements IRenderPass{
  private camera: Camera
  private size!: {width: number, height: number}

  private renderer!: Renderer
  private pipeline!: GPURenderPipeline

  private positionsBuffer!: GPUBuffer
  private colorsBuffer!: GPUBuffer
  private indexBuffer!: GPUBuffer
  private triangles: number = 20
  private mvpMatrix: Mat4 = Mat4.ID
  private uniformBuffer!: GPUBuffer
  private uniformGroup!: GPUBindGroup

  private depthTexture!: GPUTexture

  constructor(camera: Camera) {
    this.camera = camera
  }

  async initialize(renderer: Renderer) {
    this.renderer = renderer
    const canvas = renderer.context.canvas
    this.size = {width: canvas.width, height: canvas.height}

    const device = renderer.device

    const shaderModule = device.createShaderModule({
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

    this.pipeline = await device.createRenderPipelineAsync({
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
          format: this.renderer.format
        }]
      },
      primitive: {
        topology: 'triangle-list',
        cullMode: 'back'
      },
      depthStencil: {
        depthWriteEnabled: false,
        depthCompare: 'less',
        format: 'depth24plus'
      },
      layout: 'auto'
    })
    this.depthTexture = device.createTexture({
      size: this.size, format: 'depth24plus', usage: GPUTextureUsage.RENDER_ATTACHMENT
    })

    const geometry = new Icosahedron()

    this.positionsBuffer = Renderer.createVertexBuffer(device, new Float32Array(geometry.verticies))
    this.colorsBuffer = Renderer.createVertexBuffer(device, new Float32Array(geometry.colors))
    this.indexBuffer = Renderer.createIndexBuffer(device, new Uint16Array(geometry.indicies))

    this.uniformBuffer = Renderer.createUniformBuffer(device, this.mvpMatrix.getFloat32Array())

    this.uniformGroup = device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [{
        binding: 0,
        resource: { buffer: this.uniformBuffer }
      }]
    })

  }

  render(commandEncoder: GPUCommandEncoder, time: number, timeDelta: number) {

    const device = this.renderer.device

    this.mvpMatrix = Mat4.ID
      .translate(new Vec3(0, 0, -3))
      .rotate(Vec3.J, 0.1*time)
      .scale(Vec3.ONE.mulMutable(1))
      .mulMatLeft(this.camera.projectionMatrix)
    device.queue.writeBuffer(this.uniformBuffer, 0, this.mvpMatrix.getFloat32Array())

    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [{
        view: this.renderer.context.getCurrentTexture().createView(),
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