export function exportFile(data: unknown, filename?: string, fileType = 'txt') {
  const blob = new Blob([JSON.stringify(data)], {type: 'application/' + fileType});
  const url = URL.createObjectURL(blob) // Create an object URL from blob

  const a = document.createElement('a') // Create "a" element
  a.setAttribute('href', url) // Set "a" element link
  a.setAttribute('download', filename + '_' + new Date().toLocaleDateString() + '.' + fileType) // Set download filename
  a.click() // Start downloading
  URL.revokeObjectURL(url);
}
