function escapePdfText(text) {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\r/g, '')
}

function buildPdfDocument(title, headers, rows) {
  const lines = [title, '']
  const headerLine = headers.join(' | ')
  lines.push(headerLine)
  lines.push('-'.repeat(headerLine.length))
  rows.forEach(row => {
    lines.push(headers.map(header => escapePdfText(row[header] ?? '')).join(' | '))
  })

  const textLines = lines.map(line => `(${escapePdfText(line)}) Tj`).join('\n0 -18 Td ')
  const content = `BT /F1 12 Tf 40 760 Td ${textLines} ET`
  const encoder = new TextEncoder()
  const contentBytes = encoder.encode(content)

  const objects = []
  objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`)
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj`)
  objects.push(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj`)
  objects.push(`4 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n${content}\nendstream\nendobj`)
  objects.push(`5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`)

  let xref = 'xref\n0 ' + (objects.length + 1) + '\n0000000000 65535 f \n'
  let offset = 0
  let body = ''
  objects.forEach((obj, index) => {
    const objHeader = `${index + 1} 0 obj\n`
    body += objHeader + obj + '\n'
    xref += `${String(offset).padStart(10, '0')} 00000 n \n`
    offset += objHeader.length + obj.length + 1
  })

  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF`
  const pdf = `%PDF-1.3\n${body}${xref}${trailer}`
  return new Blob([pdf], { type: 'application/pdf' })
}

function buildCsvContent(headers, rows) {
  const escapeCsv = value => `"${String(value ?? '').replace(/"/g, '""')}"`
  const csvRows = [headers.map(escapeCsv).join(',')]
  rows.forEach(row => {
    csvRows.push(headers.map(header => escapeCsv(row[header] ?? '')).join(','))
  })
  return csvRows.join('\r\n')
}

export function downloadExport(filename, headers, rows, format) {
  if (!rows.length) return
  const safeFilename = `${filename}.${format}`

  if (format === 'csv') {
    const csvText = buildCsvContent(headers, rows)
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', safeFilename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(link.href)
    return
  }

  if (format === 'pdf') {
    const blob = buildPdfDocument(filename, headers, rows)
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', safeFilename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(link.href)
  }
}
