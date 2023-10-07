import aShader from 'src/shaders/a.wgsl'
import QuadGeometry from './QuadGeometry'
import { IRenderPass, Renderer } from 'src/core/Renderer'
import { loadImage } from 'src/shared/utils/loadimg'

export default class APipeline {//} implements IPipeline{
  private device!: GPUDevice
  private format: GPUTextureFormat
  private pipeline!: GPURenderPipeline

  private textureBindGroup!: GPUBindGroup

  private positionsBuffer!: GPUBuffer
  private colorsBuffer!: GPUBuffer
  private texCoordsBuffer!: GPUBuffer
  private indexBuffer!: GPUBuffer

  constructor(format: GPUTextureFormat) {
    this.format = format
  }

  async initialize(device: GPUDevice) {
    this.device = device

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

    const {texture, sampler} = await Renderer.createTexture(this.device, await loadImage('assets/cat-head.jpg'))
    this.textureBindGroup = this.device.createBindGroup({
      layout: textureBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: sampler
        },
        {
          binding: 1,
          resource: texture.createView()
        }
      ]
    })

    this.pipeline = await this.device.createRenderPipelineAsync({
      vertex: {
        module: shaderModule,
        entryPoint: 'vertexMain',
        buffers: [
          positionBufferLayout,
          colorBufferLayout,
          textureCoordsLayout
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
      layout: pipelineLayout
    })


    const geometry = new QuadGeometry()

    this.positionsBuffer = Renderer.createVertexBuffer(this.device, new Float32Array(geometry.positions))
    this.colorsBuffer = Renderer.createVertexBuffer(this.device, new Float32Array(geometry.colors))
    this.texCoordsBuffer = Renderer.createVertexBuffer(this.device, new Float32Array(geometry.texCoords))
    this.indexBuffer = Renderer.createIndexBuffer(this.device, new Uint16Array(geometry.indices))
  }

  draw(passEncoder: GPURenderPassEncoder) {
    passEncoder.setPipeline(this.pipeline)
    passEncoder.setIndexBuffer(this.indexBuffer, 'uint16')
    passEncoder.setVertexBuffer(0, this.positionsBuffer)
    passEncoder.setVertexBuffer(1, this.colorsBuffer)
    passEncoder.setVertexBuffer(2, this.texCoordsBuffer)
    passEncoder.setBindGroup(0, this.textureBindGroup)
    passEncoder.drawIndexed(6)
  }

}