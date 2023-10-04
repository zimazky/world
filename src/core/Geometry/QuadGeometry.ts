export default class QuadGeometry {
  public positions: number[]
  public colors: number[]
  public texCoords: number[]

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
      0, 0,
      1, 0,
      0, 1,
      1, 1
    ]

  }
}