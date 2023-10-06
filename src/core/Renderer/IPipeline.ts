export default interface IPipeline {
  initialize(): void
  draw(passEncoder: GPURenderPassEncoder): void
}