import shader from 'src/shaders/icosahedron.wgsl'
import { IPipeline, Renderer } from 'src/core/Renderer'
import Icosahedron from './Icosahedron'

export default class IcosahedronPipeline implements IPipeline{
  private device!: GPUDevice
  private format: GPUTextureFormat
  private pipeline!: GPURenderPipeline

  private positionsBuffer!: GPUBuffer
  private colorsBuffer!: GPUBuffer
  private indexBuffer!: GPUBuffer
  private triangles: number = 20

  constructor(format: GPUTextureFormat) {
    this.format = format
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
      layout: 'auto'
    })


    const geometry = new Icosahedron()

    this.positionsBuffer = Renderer.createVertexBuffer(this.device, new Float32Array(geometry.verticies))
    this.colorsBuffer = Renderer.createVertexBuffer(this.device, new Float32Array(geometry.colors))
    this.indexBuffer = Renderer.createIndexBuffer(this.device, new Uint16Array(geometry.indicies))
  }

  draw(passEncoder: GPURenderPassEncoder) {
    passEncoder.setPipeline(this.pipeline)
    passEncoder.setIndexBuffer(this.indexBuffer, 'uint16')
    passEncoder.setVertexBuffer(0, this.positionsBuffer)
    passEncoder.setVertexBuffer(1, this.colorsBuffer)
    passEncoder.drawIndexed(this.triangles*3)
  }

}