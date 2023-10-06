export default interface IPipeline {
  initialize(device: GPUDevice): void
  draw(passEncoder: GPURenderPassEncoder): void
}