export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image);
    image.onerror = () => {
      console.error(`Failed to load image ${url}`)
      reject()
    }
    image.src = url
  })
}