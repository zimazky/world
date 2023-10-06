export default interface IPipeline {
  initialize(device: GPUDevice): Promise<void>
  draw(passEncoder: GPURenderPassEncoder): void
}