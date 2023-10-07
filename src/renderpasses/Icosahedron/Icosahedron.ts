export default class Icosahedron {
  verticies: number[]
  indicies: number[]
  colors: number[]
  triangles = 20
  constructor() {


		const t = (1.0 + Math.sqrt(5.0)) / 2.0
		this.verticies = [ 
			-1, t, 0,
      1, t, 0,
      -1, -t, 0,
      1, -t, 0,
			0, -1, t,
      0, 1, t,
      0, -1, -t,
      0, 1, -t,
			t, 0, -1,
      t, 0, 1,
      -t, 0, -1,
      -t, 0, 1
    ]


/*
    const phi = (1.0 + Math.sqrt(5.0)) / 2.0
    const du = 1.0 / Math.sqrt(phi * phi + 1.0)
    const dv = phi * du;
    
    this.verticies = [
      0, +dv, +du,
      0, +dv, -du,
      0, -dv, +du,
      0, -dv, -du,
      +du, 0, +dv,
      -du, 0, +dv,
      +du, 0, -dv,
      -du, 0, -dv,
      +dv, +du, 0,
      +dv, -du, 0,
      -dv, +du, 0,
      -dv, -du, 0,
    ]
    */
    this.colors = this.verticies.map(v => 0.5 * (v + 0))

		this.indicies = [ 
			0, 11, 5,
      0, 5, 1,
      0, 1, 7,
      0, 7, 10,
      0, 10, 11,

			1, 5, 9,
      5, 11, 4,
      11, 10, 2,
      10, 7, 6,
      7, 1, 8,

			3, 9, 4,
      3, 4, 2,
      3, 2, 6,
      3, 6, 8,
      3, 8, 9,

			4, 9, 5,
      2, 4, 11,
      6, 2, 10,
      8, 6, 7,
      9, 8, 1
    ]

  }


}
