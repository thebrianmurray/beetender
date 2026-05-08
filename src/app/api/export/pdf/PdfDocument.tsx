import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { Survey } from '@/types/survey'
import { isoToDisplay } from '@/lib/survey-utils'

const styles = StyleSheet.create({
  page: { padding: 32, fontFamily: 'Helvetica', fontSize: 8 },
  title: { fontSize: 18, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  subtitle: { fontSize: 9, color: '#888888', marginBottom: 16 },
  table: { width: '100%' },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#F5A623',
    borderRadius: 3,
    marginBottom: 1,
  },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  rowAlt: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', backgroundColor: '#FAFAFA' },
  headerCell: { padding: 4, fontFamily: 'Helvetica-Bold', color: '#FFFFFF', fontSize: 7 },
  cell: { padding: 4, color: '#333333' },
  speciesCell: { fontFamily: 'Helvetica-Oblique' },
})

const COLS = [
  { key: 'date' as keyof Survey, label: 'Date', flex: 1.2, transform: (v: string) => isoToDisplay(v) },
  { key: 'site_id' as keyof Survey, label: 'Site', flex: 1 },
  { key: 'survey_method' as keyof Survey, label: 'Method', flex: 1.2 },
  { key: 'pollinator_group' as keyof Survey, label: 'Group', flex: 1.3 },
  { key: 'species_name' as keyof Survey, label: 'Species', flex: 2, italic: true },
  { key: 'caste' as keyof Survey, label: 'Caste', flex: 1 },
  { key: 'surveyor_initials' as keyof Survey, label: 'Surv.', flex: 0.7 },
  { key: 'id_code' as keyof Survey, label: 'ID', flex: 0.8 },
]

export function SurveyPdfDocument({ surveys }: { surveys: Survey[] }) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>Bee Tender — Survey Report</Text>
        <Text style={styles.subtitle}>
          Generated {new Date().toLocaleDateString('en-GB')} · {surveys.length} records
        </Text>
        <View style={styles.table}>
          <View style={styles.headerRow}>
            {COLS.map((col) => (
              <View key={String(col.key)} style={{ flex: col.flex }}>
                <Text style={styles.headerCell}>{col.label}</Text>
              </View>
            ))}
          </View>
          {surveys.map((s, i) => (
            <View key={s.id} style={i % 2 === 0 ? styles.row : styles.rowAlt}>
              {COLS.map((col) => {
                const raw = (s[col.key] as string) ?? ''
                const val = col.transform ? col.transform(raw) : raw
                return (
                  <View key={String(col.key)} style={{ flex: col.flex }}>
                    <Text style={[styles.cell, col.italic ? styles.speciesCell : {}]}>{val}</Text>
                  </View>
                )
              })}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  )
}
