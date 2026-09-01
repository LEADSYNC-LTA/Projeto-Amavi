// Converte um arquivo de imagem em uma data URL (base64), para que o produto
// possa ser salvo inteiramente no front-end (localStorage). Quando o back-end
// estiver disponível, substitua por um upload real (multipart/form-data) e
// guarde apenas a URL retornada pelo servidor.
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
    reader.readAsDataURL(file)
  })
}

export async function filesToDataUrls(fileList) {
  const files = Array.from(fileList)
  return Promise.all(files.map(fileToDataUrl))
}
