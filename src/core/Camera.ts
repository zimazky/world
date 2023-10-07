import { isKeyDown } from 'src/shared/libs/Keyboard'
import { Mat3, Mat4, Quaternion, Vec3 } from 'src/shared/libs/Vectors/Vectors'

const KEY_SHIFT = 16;
const KEY_CTRL = 17;
const KEY_ALT = 18;
const KEY_SPACE = 32;
const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_PLUS = 107;
const KEY_MINUS = 109;
const KEY_EQUAL = 187;
const KEY_MINUS2 = 189;
const KEY_W = 87;
const KEY_S = 83;
const KEY_M = 77;
const KEY_N = 78;
const KEY_G = 71;
const KEY_H = 72;
const KEY_L = 76;
const KEY_COMMA = 188;
const KEY_PERIOD = 190;

const GRAVITATION = 0.; //9.8; // ускорение свободного падения м/с2
const THRUST = 11.; // ускорение двигателя м/с2
const AIR_DRAG_FACTOR = 58.; // коэффициент сопротивления воздуха 1/с
const AIR_DRAG = new Vec3(0.01, 0.05, 0.001).mulMutable(AIR_DRAG_FACTOR); // вектор сопротивления по осям
const ANGLE_DELTA = Math.PI/180.;

export default class Camera {
  /** Положение камеры */
  position: Vec3 = Vec3.ZERO
  /** Скорость перемещения камеры в глобальной системе координат */
  velocity: Vec3 = Vec3.ZERO
  /** Скорость вращения в локальной системе координат */
  angularSpeed: Vec3 = Vec3.ZERO
  /** Угол обзора камеры по вертикали в радианах */
  fovy: number = 0.25*Math.PI
  /** Ориентация камеры */
  orientation: Quaternion = Quaternion.ID
  /** Матрица перспективного проектирования */
  projectionMatrix: Mat4
  /** Матрица вида камеры */
  viewMatrix: Mat4 = Mat4.ID


  constructor(aspect: number) {
    this.projectionMatrix = Mat4.perspectiveDx(this.fovy, aspect, 1, 100)
  }

  update(time: number, timeDelta: number): void {

    const acceleration = new Vec3(
      0.,
      0.,
      isKeyDown(KEY_S) - isKeyDown(KEY_W)
    )

    const rotMat = Mat3.fromQuat(this.orientation)

    // ускорение тяги
    // ускорение переводим в глобальную систему координат, т.к. ускорение связано с системой координат камеры
    //    v += a*MV
    this.velocity.addMutable(rotMat.mulVecLeft(acceleration).mulMutable(THRUST*timeDelta))
    // замедление от сопротивления воздуха
    // коэффициенты сопротивления связаны с ориентацией корабля,
    // поэтому скорость сначала переводим к системе координат камеры,
    // а после домножения на коэфф сопр, возвращаем к глобальной системе
    //    v -= (((MV*v)*AIR_DRAG)*MV)
    this.velocity.subMutable(rotMat.mulVecLeft(rotMat.mulVec(this.velocity).mulElMutable(AIR_DRAG)).mulMutable(timeDelta))
    // гравитация
    //this.velocity.y -= GRAVITATION*timeDelta
    // экстренная остановка
    if(isKeyDown(KEY_SPACE) > 0) this.velocity = Vec3.ZERO

    // перемещение
    this.position.addMutable(this.velocity.mul(timeDelta))

    this.viewMatrix = Mat4.cameraViewFromQuatPosition(this.orientation, this.position)

    // вращение
    const angularAcceleration = new Vec3(
      isKeyDown(KEY_DOWN) - isKeyDown(KEY_UP), 
      isKeyDown(KEY_COMMA) - isKeyDown(KEY_PERIOD),
      2.*(isKeyDown(KEY_LEFT) - isKeyDown(KEY_RIGHT))
    )
    // ускорение вращения клавишами
    this.angularSpeed.addMutable(angularAcceleration.mulMutable(ANGLE_DELTA*3.*timeDelta))
    // замедление вращения без клавиш
    this.angularSpeed.subMutable(this.angularSpeed.mul(3.*timeDelta))
    // изменение ориентации (поворот кватерниона)
    const rotDelta = this.angularSpeed.mul(-20.*timeDelta)
    this.orientation = Quaternion.fromYawPitchRoll(rotDelta.x, rotDelta.y, rotDelta.z).qmul(this.orientation)
    this.orientation.normalizeMutable()

    this.fovy += 0.01*(isKeyDown(KEY_MINUS)-isKeyDown(KEY_PLUS))

    //console.log(this.orientation)
  }

}