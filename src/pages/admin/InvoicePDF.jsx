import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica", color: "#111" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30, backgroundColor: "#0f172a", padding: 40, color: "#fff" },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff", fontFamily: "Helvetica-Bold" },
  invoiceNum: { fontSize: 11, color: "#cbd5e1", marginTop: 4 },
  brandName: { fontSize: 16, fontWeight: "bold", fontFamily: "Helvetica-Bold", textAlign: "right", color: "#fff" },
  brandSub: { fontSize: 9, color: "#94a3b8", textAlign: "right", marginTop: 2 },
  section: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  label: { fontSize: 8, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, fontFamily: "Helvetica-Bold", marginBottom: 3 },
  value: { fontSize: 11 },
  clientName: { fontSize: 14, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 2, borderBottomColor: "#e5e7eb", paddingBottom: 8, marginBottom: 4 },
  thText: { fontSize: 8, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, fontFamily: "Helvetica-Bold" },
  row: { flexDirection: "row", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  descCol: { flex: 3 },
  qtyCol: { width: 50, textAlign: "center" },
  rateCol: { width: 80, textAlign: "right" },
  amtCol: { width: 90, textAlign: "right", fontFamily: "Helvetica-Bold" },
  totalsWrap: { alignItems: "flex-end", marginTop: 16 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", width: 200, paddingVertical: 4 },
  totalLabel: { fontSize: 11, color: "#6b7280" },
  totalValue: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  grandRow: { flexDirection: "row", justifyContent: "space-between", width: 200, paddingVertical: 8, borderTopWidth: 2, borderTopColor: "#111", marginTop: 4 },
  grandLabel: { fontSize: 14, fontFamily: "Helvetica-Bold" },
  grandValue: { fontSize: 14, fontFamily: "Helvetica-Bold" },
  notes: { marginTop: 24, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#e5e7eb" },
  notesText: { fontSize: 10, color: "#6b7280", whiteSpace: "pre-wrap" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, textAlign: "center" },
  footerText: { fontSize: 8, color: "#9ca3af" },
});

export default function InvoicePDF({ invoice, items, client, project }) {
  return (
    <Document>
      <Page size="A4" style={{ ...styles.page, padding: 0 }}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.invoiceNum}>{invoice.invoice_number}</Text>
          </View>
          <View>
            <Text style={styles.brandName}>Harsh Gupta</Text>
            <Text style={styles.brandSub}>Frontend Developer & Designer</Text>
            <Text style={styles.brandSub}>harshgupta24716@gmail.com</Text>
          </View>
        </View>
        <View style={{ padding: "0 40px" }}>
          {/* Bill To + Dates */}
          <View style={styles.section}>
          <View>
            <Text style={styles.label}>Bill To</Text>
            <Text style={styles.clientName}>{client?.name || "—"}</Text>
            {client?.company && <Text style={styles.value}>{client.company}</Text>}
            {client?.email && <Text style={{ ...styles.value, color: "#6b7280", fontSize: 10 }}>{client.email}</Text>}
            {client?.city && <Text style={{ ...styles.value, color: "#6b7280", fontSize: 10 }}>{client.city}</Text>}
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.label}>Issue Date</Text>
            <Text style={styles.value}>{invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString("en-IN") : "—"}</Text>
            <Text style={{ ...styles.label, marginTop: 8 }}>Due Date</Text>
            <Text style={styles.value}>{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("en-IN") : "—"}</Text>
            {project && <>
              <Text style={{ ...styles.label, marginTop: 8 }}>Project</Text>
              <Text style={styles.value}>{project.title}</Text>
            </>}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.tableHeader}>
          <Text style={{ ...styles.thText, ...styles.descCol }}>Description</Text>
          <Text style={{ ...styles.thText, ...styles.qtyCol }}>Qty</Text>
          <Text style={{ ...styles.thText, ...styles.rateCol }}>Rate</Text>
          <Text style={{ ...styles.thText, ...styles.amtCol }}>Amount</Text>
        </View>
        {(items || []).map((item, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.descCol}>{item.description}</Text>
            <Text style={styles.qtyCol}>{item.quantity}</Text>
            <Text style={styles.rateCol}>Rs. {Number(item.rate).toLocaleString("en-IN")}</Text>
            <Text style={styles.amtCol}>Rs. {Number(item.amount).toLocaleString("en-IN")}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totalsWrap}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>Rs. {Number(invoice.subtotal || 0).toLocaleString("en-IN")}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>GST ({invoice.tax_percent || 0}%)</Text>
            <Text style={styles.totalValue}>Rs. {Number(invoice.tax_amount || 0).toLocaleString("en-IN")}</Text>
          </View>
          <View style={styles.grandRow}>
            <Text style={styles.grandLabel}>Total</Text>
            <Text style={styles.grandValue}>Rs. {Number(invoice.total || 0).toLocaleString("en-IN")}</Text>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={styles.label}>Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Thank you for your business! • Harsh Gupta • harshgupta24716@gmail.com</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
