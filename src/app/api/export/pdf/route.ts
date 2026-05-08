import { NextResponse } from 'next/server'
import { Survey } from '@/types/survey'

export async function POST(request: Request) {
  const { surveys }: { surveys: Survey[] } = await request.json()

  const { renderToBuffer } = await import('@react-pdf/renderer')
  const { SurveyPdfDocument } = await import('./PdfDocument')
  const React = await import('react')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(SurveyPdfDocument, { surveys }) as any
  const buffer = await renderToBuffer(element)

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="bee-tender-report.pdf"',
    },
  })
}
