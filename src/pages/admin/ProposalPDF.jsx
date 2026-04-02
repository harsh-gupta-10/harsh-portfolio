import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica", color: "#111" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30, backgroundColor: "#0f172a", padding: 40, color: "#fff" },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff", fontFamily: "Helvetica-Bold" },
  subTitle: { fontSize: 13, color: "#cbd5e1", marginTop: 4 },
  brandName: { fontSize: 16, fontWeight: "bold", fontFamily: "Helvetica-Bold", textAlign: "right", color: "#fff" },
  brandSub: { fontSize: 9, color: "#94a3b8", textAlign: "right", marginTop: 2 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontFamily: "Helvetica-Bold", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingBottom: 6, marginBottom: 10 },
  text: { fontSize: 10, lineHeight: 1.5, color: "#4b5563" },
  listItem: { flexDirection: "row", marginBottom: 6 },
  listBullet: { width: 15, fontSize: 10, color: "#2563eb", fontFamily: "Helvetica-Bold" },
  timelineItem: { marginBottom: 8, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: "#e5e7eb" },
  timelineDate: { fontSize: 8, fontFamily: "Helvetica-Bold", textTransform: "uppercase", color: "#2563eb" },
  timelineDesc: { fontSize: 11, color: "#374151", marginTop: 2 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#cbd5e1", paddingBottom: 6, marginBottom: 6 },
  th: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#64748b", textTransform: "uppercase" },
  row: { flexDirection: "row", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  amtCol: { flex: 1, textAlign: "right", fontFamily: "Helvetica-Bold" },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 10, marginTop: 4, borderTopWidth: 2, borderTopColor: "#111" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, textAlign: "center" },
  footerText: { fontSize: 8, color: "#9ca3af" },
});

export default function ProposalPDF({ proposal, client }) {
  const content = proposal.content || {};
  return (
    <Document>
      <Page size="A4" style={{ ...styles.page, padding: 0 }}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>PROPOSAL</Text>
            <Text style={styles.subTitle}>{proposal.title || "Untitled"}</Text>
          </View>
          <View>
            <Text style={styles.brandName}>Harsh Gupta</Text>
            <Text style={styles.brandSub}>Frontend Developer & Designer</Text>
            <Text style={styles.brandSub}>harshgupta24716@gmail.com</Text>
          </View>
        </View>

        <View style={{ padding: "0 40px" }}>
          
          {/* Metadata */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 24, borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingBottom: 16 }}>
            <View>
              <Text style={{ fontSize: 8, color: "#64748b", textTransform: "uppercase", fontFamily: "Helvetica-Bold", marginBottom: 2 }}>Prepared For</Text>
              <Text style={{ fontSize: 14, fontFamily: "Helvetica-Bold" }}>{client?.name || "—"}</Text>
              <Text style={{ fontSize: 10, color: "#64748b" }}>{client?.company || ""}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontSize: 8, color: "#64748b", textTransform: "uppercase", fontFamily: "Helvetica-Bold", marginBottom: 2 }}>Valid Until</Text>
              <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold" }}>{proposal.valid_until ? new Date(proposal.valid_until).toLocaleDateString() : "—"}</Text>
            </View>
          </View>

          {/* Overview */}
          {content.overview && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Executive Summary</Text>
              <Text style={styles.text}>{content.overview}</Text>
            </View>
          )}

          {/* Scope */}
          {content.scope?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Scope of Work</Text>
              {content.scope.map((s, i) => (
                <View key={i} style={styles.listItem}>
                  <Text style={styles.listBullet}>{i + 1}.</Text>
                  <Text style={{ ...styles.text, flex: 1 }}>{s}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Timeline */}
          {content.timeline?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. Project Timeline</Text>
              {content.timeline.map((t, i) => (
                <View key={i} style={styles.timelineItem}>
                  <Text style={styles.timelineDate}>{t.date}</Text>
                  <Text style={styles.timelineDesc}>{t.milestone}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Pricing */}
          {content.pricing?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. Investment</Text>
              <View style={styles.tableHeader}>
                <Text style={{ ...styles.th, flex: 4 }}>Description</Text>
                <Text style={{ ...styles.th, flex: 1, textAlign: "right" }}>Estimated Cost</Text>
              </View>
              {content.pricing.map((p, i) => (
                <View key={i} style={styles.row}>
                  <Text style={{ ...styles.text, flex: 4 }}>{p.desc}</Text>
                  <Text style={styles.amtCol}>Rs.{Number(p.cost).toLocaleString("en-IN")}</Text>
                </View>
              ))}
              <View style={styles.totalsRow}>
                <Text></Text>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontSize: 8, color: "#64748b", textTransform: "uppercase", fontFamily: "Helvetica-Bold" }}>Total Estimate</Text>
                  <Text style={{ fontSize: 16, fontFamily: "Helvetica-Bold", marginTop: 4 }}>Rs.{Number(proposal.total_estimate).toLocaleString("en-IN")}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Terms */}
          {content.terms && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5. Terms & Conditions</Text>
              <Text style={{ ...styles.text, fontSize: 8, color: "#64748b" }}>{content.terms}</Text>
            </View>
          )}

        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for your business! • Harsh Gupta • harshgupta24716@gmail.com</Text>
        </View>
      </Page>
    </Document>
  );
}
