export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image);
    image.onerror = () => {
      const msg = `Failed to load image ${url}`
      alert(msg)
      console.error(msg)
      reject()
    }
    image.src = url
  })
}