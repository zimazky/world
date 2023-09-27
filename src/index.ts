import App from 'src/app/App'

const canvas = <HTMLCanvasElement> document.getElementById('wgpucanvas')
const app = new App(canvas)
app.initialize().then(app.run)