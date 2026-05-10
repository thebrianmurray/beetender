import { NextResponse } from 'next/server'
import {
  Document,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Packer,
  WidthType,
  ShadingType,
} from 'docx'
import { Survey } from '@/types/survey'
import { isoToDisplay } from '@/lib/survey-utils'

export async function POST(request: Request) {
  const { surveys }: { surveys: Survey[] } = await request.json()

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      'Date', 'Site', 'Method', 'Group', 'Species Name', 'Caste', 'Sex', 'Surveyor', 'ID Code',
    ].map(
      (text) =>
        new TableCell({
          shading: { type: ShadingType.CLEAR, fill: 'F5A623' },
          children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 18 })] })],
        })
    ),
  })

  const dataRows = surveys.map(
    (s) =>
      new TableRow({
        children: [
          isoToDisplay(s.date),
          s.site_id,
          s.survey_method,
          s.pollinator_group,
          s.species_name,
          s.caste,
          s.sex,
          s.surveyor_initials,
          s.id_code,
        ].map(
          (text) =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: text ?? '', size: 16 })] })],
            })
        ),
      })
  )

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: 'Bee Tender — Survey Report',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.LEFT,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Generated: ${new Date().toLocaleDateString('en-GB')}  ·  ${surveys.length} records`,
                color: '888888',
                size: 20,
              }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [headerRow, ...dataRows],
          }),
        ],
      },
    ],
  })

  const buffer = await Packer.toBuffer(doc)

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': 'attachment; filename="bee-tender-report.docx"',
    },
  })
}
