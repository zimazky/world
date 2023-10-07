import { Mat4 } from 'src/shared/libs/Vectors/Vectors'

export default class Camera {
  projectionMatrix: Mat4

  constructor(aspect: number) {
    this.projectionMatrix = Mat4.perspectiveDx(0.5*Math.PI, aspect, 1, 100)
  }
}