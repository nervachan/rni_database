function escapePdfText(text) {
  // Escapes characters that are structurally significant to PDF's own
  // string-literal syntax (backslash and parentheses delimit a PDF
  // string). This must run exactly ONCE per piece of text, right before
  // it's written into the file — never on text that's already been
  // through this function once, or the escaping doubles up and mangles
  // the output.
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\r/g, '')
}

// Page layout constants for the PDF export. Matches a standard US
// Letter page (612 x 792pt): text starts 760pt from the bottom, drops
// 18pt per line, and stops 40pt from the bottom edge. Used both to lay
// out each page's content stream and to work out how many lines fit on
// one page before a second page is needed.
const PDF_TOP_MARGIN = 760
const PDF_BOTTOM_MARGIN = 40
const PDF_LINE_HEIGHT = 18
const PDF_LINES_PER_PAGE = Math.floor((PDF_TOP_MARGIN - PDF_BOTTOM_MARGIN) / PDF_LINE_HEIGHT) + 1

// Splits an array into chunks of at most `size` items — used below to
// break a long table into one PDF page per chunk of lines, instead of
// writing every line onto a single page that runs off the bottom edge.
function chunk(array, size) {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

function buildPdfDocument(title, headers, rows) {
  // Build the plain-text lines first, with NO escaping yet — escaping
  // happens exactly once, later, in buildContentStream() below. The old
  // version escaped each cell here AND escaped the whole joined line
  // again further down, corrupting any value containing a parenthesis
  // or backslash.
  const headerLine = headers.join(' | ')
  const lines = [
    title,
    '',
    headerLine,
    '-'.repeat(headerLine.length),
    ...rows.map(row => headers.map(header => String(row[header] ?? '')).join(' | ')),
  ]

  const pages = chunk(lines, PDF_LINES_PER_PAGE)
  const encoder = new TextEncoder()

  // Builds the actual visible-text stream for one page's worth of
  // lines. This is the one and only place escapePdfText() runs on a
  // full line.
  function buildContentStream(pageLines) {
    const textCommands = pageLines
      .map(line => `(${escapePdfText(line)}) Tj`)
      .join(`\n0 -${PDF_LINE_HEIGHT} Td `)
    return `BT /F1 12 Tf 40 ${PDF_TOP_MARGIN} Td ${textCommands} ET`
  }

  // --- Assemble PDF objects ---
  // Object 1: Catalog. Object 2: Pages (parent of every page below).
  // Then, for each page, one Page object plus one Contents stream
  // object. Finally, one Font object every page's Resources shares.
  // Object numbers are computed instead of hardcoded, so this works
  // correctly no matter how many pages the table needs.
  const pageObjectNumbers = pages.map((_, i) => 3 + i * 2)
  const contentObjectNumbers = pages.map((_, i) => 4 + i * 2)
  const fontObjectNumber = 3 + pages.length * 2

  // Each entry here is just the object's BODY (what goes between
  // "N 0 obj" and "endobj") — not the full wrapper. The old version put
  // the "N 0 obj...endobj" wrapper INSIDE each pushed string, and then
  // the assembly loop further down added ANOTHER copy of that same
  // wrapper around it, so every object in the file was written out with
  // its header duplicated. Keeping bare object bodies here and adding
  // the wrapper exactly once, below, avoids that.
  const objects = []
  objects.push(`<< /Type /Catalog /Pages 2 0 R >>`)
  objects.push(`<< /Type /Pages /Kids [${pageObjectNumbers.map(n => `${n} 0 R`).join(' ')}] /Count ${pages.length} >>`)

  pages.forEach((pageLines, i) => {
    const pageObj = pageObjectNumbers[i]
    const contentObj = contentObjectNumbers[i]
    objects[pageObj - 1] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentObj} 0 R /Resources << /Font << /F1 ${fontObjectNumber} 0 R >> >> >>`

    const content = buildContentStream(pageLines)
    const contentBytes = encoder.encode(content)
    objects[contentObj - 1] = `<< /Length ${contentBytes.length} >>\nstream\n${content}\nendstream`
  })

  objects[fontObjectNumber - 1] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`

  // --- Assemble the file bytes and the xref table ---
  // PDF's xref table stores each object's byte offset from the very
  // START of the file — including the "%PDF-1.3\n" header. The old
  // version started counting from 0 at the first object instead, so
  // every offset was short by the header's length. It also measured
  // offsets with JS string .length (UTF-16 code units) rather than real
  // encoded byte length, which would drift further for any non-ASCII
  // character (e.g. an accented name). Both are fixed by encoding
  // everything to actual bytes and starting the running offset at the
  // header's own byte length.
  const header = '%PDF-1.3\n'
  let offset = encoder.encode(header).length
  let body = ''
  const xrefEntries = []

  objects.forEach((obj, index) => {
    const objText = `${index + 1} 0 obj\n${obj}\nendobj\n`
    body += objText
    xrefEntries.push(`${String(offset).padStart(10, '0')} 00000 n \n`)
    offset += encoder.encode(objText).length
  })

  const xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${xrefEntries.join('')}`
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF`

  const pdf = `${header}${body}${xref}${trailer}`
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
