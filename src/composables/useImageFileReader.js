/**
 * 统一图片文件读取为 Data URL（点击选择 / 拖拽共用）
 * @param {File} file
 * @returns {Promise<string|null>}
 */
export function readImageFileAsDataURL(file) {
  return new Promise((resolve) => {
    if (!file || !file.type?.startsWith?.('image/')) {
      resolve(null)
      return
    }
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}
