import WidgetKit
import SwiftUI

struct PortfolioEntry: TimelineEntry {
    let date: Date
    let snapshot: PortfolioSnapshot?
    let isStale: Bool      // showing cached data because the fetch failed
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> PortfolioEntry {
        PortfolioEntry(date: Date(), snapshot: .placeholder, isStale: false)
    }

    func getSnapshot(in context: Context, completion: @escaping (PortfolioEntry) -> Void) {
        if context.isPreview, let cached = SnapshotCache.load() {
            return completion(PortfolioEntry(date: Date(), snapshot: cached, isStale: false))
        }
        Task { completion(await makeEntry(previewFallback: context.isPreview)) }
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PortfolioEntry>) -> Void) {
        Task {
            let entry = await makeEntry(previewFallback: false)
            let minutes = entry.isStale || entry.snapshot == nil ? 15 : 45
            let next = Calendar.current.date(byAdding: .minute, value: minutes, to: Date())!
            completion(Timeline(entries: [entry], policy: .after(next)))
        }
    }

    private func makeEntry(previewFallback: Bool) async -> PortfolioEntry {
        do {
            let snap = try await PortfolioAPI.fetch()
            SnapshotCache.save(snap)
            return PortfolioEntry(date: Date(), snapshot: snap, isStale: false)
        } catch {
            if let cached = SnapshotCache.load() {
                return PortfolioEntry(date: Date(), snapshot: cached, isStale: true)
            }
            return PortfolioEntry(date: Date(), snapshot: previewFallback ? .placeholder : nil, isStale: true)
        }
    }
}

// MARK: - Style

enum Palette {
    static let gain = Color(light: 0x007346, dark: 0x5DDF9D)
    static let loss = Color(light: 0xC32A28, dark: 0xF86E6A)
    static let fg = Color(light: 0x161A1F, dark: 0xECEDEF)
    static let muted = Color(light: 0x656970, dark: 0x8E9299)
    static let bg = Color(light: 0xFFFFFF, dark: 0x14161A)
    static func tone(_ v: Double?) -> Color {
        guard let v else { return muted }
        return v > 0 ? gain : (v < 0 ? loss : muted)
    }
}

extension Color {
    init(light: UInt32, dark: UInt32) {
        func c(_ h: UInt32) -> UIColor {
            UIColor(red: CGFloat((h >> 16) & 0xFF) / 255, green: CGFloat((h >> 8) & 0xFF) / 255,
                    blue: CGFloat(h & 0xFF) / 255, alpha: 1)
        }
        self = Color(UIColor { $0.userInterfaceStyle == .dark ? c(dark) : c(light) })
    }
}

// MARK: - Views

struct Sparkline: View {
    let values: [Double]
    let color: Color
    var body: some View {
        GeometryReader { geo in
            let lo = values.min() ?? 0, hi = values.max() ?? 1
            let span = max(hi - lo, 1)
            let pts: [CGPoint] = values.enumerated().map { i, v in
                CGPoint(x: values.count > 1 ? geo.size.width * CGFloat(i) / CGFloat(values.count - 1) : 0,
                        y: geo.size.height * (1 - CGFloat((v - lo) / span)))
            }
            ZStack {
                Path { p in
                    guard let first = pts.first else { return }
                    p.move(to: CGPoint(x: first.x, y: geo.size.height))
                    pts.forEach { p.addLine(to: $0) }
                    p.addLine(to: CGPoint(x: pts.last!.x, y: geo.size.height))
                    p.closeSubpath()
                }
                .fill(LinearGradient(colors: [color.opacity(0.22), color.opacity(0)], startPoint: .top, endPoint: .bottom))
                Path { p in
                    guard let first = pts.first else { return }
                    p.move(to: first)
                    pts.dropFirst().forEach { p.addLine(to: $0) }
                }
                .stroke(color, style: StrokeStyle(lineWidth: 1.8, lineCap: .round, lineJoin: .round))
            }
        }
    }
}

struct Footer: View {
    let entry: PortfolioEntry
    var body: some View {
        if let s = entry.snapshot {
            HStack(spacing: 3) {
                if entry.isStale { Image(systemName: "icloud.slash") }
                Text("bijgewerkt \(Fmt.time(s.updatedAt))")
                if !s.isLive { Text("· dagwaarde").opacity(0.75) }
            }
            .font(.system(size: 10, weight: .medium))
            .foregroundStyle(Palette.muted)
            .lineLimit(1)
        }
    }
}

struct Caps: View {
    let text: String
    var body: some View {
        Text(text.uppercased())
            .font(.system(size: 10, weight: .semibold))
            .tracking(0.6)
            .foregroundStyle(Palette.muted)
    }
}

struct ChangeLine: View {
    let label: String
    let amount: Double?
    let pct: Double?
    var pctDecimals = 1
    var body: some View {
        HStack(spacing: 4) {
            Text(label).foregroundStyle(Palette.muted)
            Spacer(minLength: 2)
            Text("\(Fmt.signedEuro(amount ?? 0))  \(Fmt.signedPct(pct, decimals: pctDecimals))")
                .foregroundStyle(Palette.tone(amount))
        }
        .font(.system(size: 11, weight: .semibold).monospacedDigit())
        .lineLimit(1)
        .minimumScaleFactor(0.7)
    }
}

struct EmptyStateView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Caps(text: "Totale waarde")
            Text("—").font(.system(size: 26, weight: .semibold))
            Text("Geen verbinding").font(.caption2).foregroundStyle(Palette.muted)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
}

struct SmallView: View {
    let entry: PortfolioEntry
    let s: PortfolioSnapshot
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Caps(text: "Totale waarde")
            Text(Fmt.euro(s.total))
                .font(.system(size: 26, weight: .semibold).monospacedDigit())
                .foregroundStyle(Palette.fg)
                .minimumScaleFactor(0.6).lineLimit(1)
                .padding(.top, 2)
            Spacer(minLength: 4)
            Caps(text: "Winst")
            Text(Fmt.signedEuro(s.profit))
                .font(.system(size: 15, weight: .semibold).monospacedDigit())
                .foregroundStyle(Palette.tone(s.profit))
                .minimumScaleFactor(0.7).lineLimit(1)
            Text(Fmt.signedPct(s.profitPct))
                .font(.system(size: 12, weight: .semibold).monospacedDigit())
                .foregroundStyle(Palette.tone(s.profit))
            Spacer(minLength: 4)
            ChangeLine(label: "Vandaag", amount: s.dayChange, pct: s.dayChangePct, pctDecimals: 2)
            Footer(entry: entry).padding(.top, 2)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
}

struct MediumView: View {
    let entry: PortfolioEntry
    let s: PortfolioSnapshot
    var body: some View {
        HStack(alignment: .top, spacing: 14) {
            VStack(alignment: .leading, spacing: 0) {
                Caps(text: "Totale waarde")
                Text(Fmt.euro(s.total))
                    .font(.system(size: 28, weight: .semibold).monospacedDigit())
                    .foregroundStyle(Palette.fg)
                    .minimumScaleFactor(0.6).lineLimit(1)
                    .padding(.top, 2)
                HStack(spacing: 6) {
                    Text(Fmt.signedEuro(s.profit))
                    Text(Fmt.signedPct(s.profitPct))
                        .padding(.horizontal, 5).padding(.vertical, 1)
                        .background(Palette.tone(s.profit).opacity(0.12), in: RoundedRectangle(cornerRadius: 4))
                }
                .font(.system(size: 12, weight: .semibold).monospacedDigit())
                .foregroundStyle(Palette.tone(s.profit))
                .lineLimit(1).minimumScaleFactor(0.7)
                Text("winst").font(.system(size: 10, weight: .medium)).foregroundStyle(Palette.muted).padding(.top, 1)
                Spacer(minLength: 4)
                ChangeLine(label: "Vandaag", amount: s.dayChange, pct: s.dayChangePct, pctDecimals: 2)
                ChangeLine(label: "30 dagen", amount: s.monthChange, pct: s.monthChangePct)
                    .padding(.top, 2)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            VStack(alignment: .trailing, spacing: 4) {
                Sparkline(values: s.series, color: Palette.tone(s.monthChange ?? s.dayChange))
                    .padding(.top, 6)
                Footer(entry: entry)
            }
            .frame(maxWidth: .infinity)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
}

struct RectangularView: View {
    let entry: PortfolioEntry
    let s: PortfolioSnapshot
    var body: some View {
        VStack(alignment: .leading, spacing: 1) {
            HStack(spacing: 4) {
                Image(systemName: "chart.bar.fill")
                Text("Investeren")
                if entry.isStale { Image(systemName: "icloud.slash") }
            }
            .font(.system(size: 11, weight: .semibold))
            .widgetAccentable()
            Text(Fmt.euro(s.total))
                .font(.system(size: 18, weight: .semibold).monospacedDigit())
            Text("\(Fmt.signedEuro(s.dayChange ?? 0)) vandaag · \(Fmt.signedPct(s.profitPct)) winst")
                .font(.system(size: 11, weight: .medium).monospacedDigit())
                .lineLimit(1).minimumScaleFactor(0.7)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct InvesterenWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let entry: PortfolioEntry

    var body: some View {
        Group {
            if let s = entry.snapshot {
                switch family {
                case .systemMedium: MediumView(entry: entry, s: s)
                case .accessoryRectangular: RectangularView(entry: entry, s: s)
                case .accessoryInline:
                    Text("\(Fmt.euro(s.total)) \(Fmt.signedPct(s.dayChangePct, decimals: 2))")
                        .monospacedDigit()
                default: SmallView(entry: entry, s: s)
                }
            } else {
                switch family {
                case .accessoryInline: Text("Investeren —")
                case .accessoryRectangular: Text("Investeren\nGeen verbinding")
                default: EmptyStateView()
                }
            }
        }
        .containerBackground(for: .widget) { Palette.bg }
    }
}

@main
struct InvesterenWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "InvesterenPortfolio", provider: Provider()) { entry in
            InvesterenWidgetView(entry: entry)
        }
        .configurationDisplayName("Portefeuille")
        .description("Totale waarde, winst en dagverandering.")
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryRectangular, .accessoryInline])
    }
}
