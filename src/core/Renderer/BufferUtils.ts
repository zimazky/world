export default class BufferUtils {

  static createVertexBuffer(device: GPUDevice, data: Float32Array): GPUBuffer {
    const buffer = device.createBuffer({
      size: data.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true
    })
    new Float32Array(buffer.getMappedRange()).set(data)
    buffer.unmap()
    return buffer
  }

  static createIndexBuffer(device: GPUDevice, data: Uint16Array): GPUBuffer {
    const buffer = device.createBuffer({
      size: data.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true
    })
    new Uint16Array(buffer.getMappedRange()).set(data)
    buffer.unmap()
    return buffer
  }


}