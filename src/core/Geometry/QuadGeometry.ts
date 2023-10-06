export default class QuadGeometry {
  public positions: number[]
  public colors: number[]
  public texCoords: number[]
  public indices: number[]

  constructor() {
    this.positions = [
      -1, -1,
      1, -1,
      -1, 1,
      1, 1
    ]
    this.colors = [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
      1, 1, 0
    ]
    this.texCoords = [
      0, 1,
      1, 1,
      0, 0,
      1, 0
    ]
    this.indices = [
      0, 1, 2,
      1, 2, 3
    ]

  }
}