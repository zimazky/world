import Engine from "src/core/Engine"

export default class App {
  static async main() {
    const canvas = <HTMLCanvasElement> document.getElementById('wgpucanvas')
    if(!canvas) {
      const msg = 'Canvas element id="wgpucanvas" not found'
      alert(msg)
      throw new Error(msg)
    }
    const divinfo = document.getElementById('info')
    if(!divinfo) {
      const msg = 'Div element id="info" not found'
      alert(msg)
      throw new Error(msg)
    }
    const engine = new Engine(canvas, divinfo)
    await engine.initialize()
    engine.run()
  }
}