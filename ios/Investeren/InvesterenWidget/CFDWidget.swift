import WidgetKit
import SwiftUI

// Widget "CFD live": de lopende CFD-contracten (Trading 212 CFD) met resultaat, cash, margin en health.
// Leest de ingevoerde stand (portfolio.data.parties → party.cfd, alleen-lezen) en rekent met de actuele koers
// uit de koersen-worker door, precies zoals de web-app (cfdLive in app/data.jsx).

struct CFDPosition: Codable, Equatable, Identifiable {
    var id: String
    var symbol: String
    var name: String
    var dir: String
    var quantity: Double
    var openPrice: Double
    var price: Double          // live (of laatste stand)
    var currency: String
    var pnl: Double            // EUR
}

struct CFDState: Codable, Equatable {
    var accountValue: Double
    var cash: Double
    var margin: Double
    var health: Double?
    var openPnl: Double
    var positions: [CFDPosition]
    var live: Bool
    var asOf: Date

    static let placeholder = CFDState(accountValue: 307.10, cash: 41.90, margin: 265.20, health: 55, openPnl: -61.73,
        positions: [CFDPosition(id: "p", symbol: "NVDA", name: "Nvidia", dir: "buy", quantity: 9.96, openPrice: 152.74, price: 145.99, currency: "USD", pnl: -61.73)],
        live: true, asOf: Date())
}

enum CFDAPI {
    static let partiesEndpoint = URL(string: "https://xlmbpohjlcwjubgiyjaw.supabase.co/rest/v1/portfolio?id=eq.main&select=parties:data->parties")!
    static let quoteBase = "https://koersen.financieel-chris.workers.dev/koers?range=5d&s="

    private struct Row: Decodable { let parties: [Party]? }
    private struct Party: Decodable { let id: String; let cfd: Snap? }
    private struct Snap: Decodable {
        let accountValue: Double?; let cash: Double?; let margin: Double?; let health: Double?
        let positions: [Pos]?
    }
    private struct Pos: Decodable {
        let id: String?; let symbol: String?; let name: String?; let dir: String?
        let quantity: Double?; let openPrice: Double?; let currentPrice: Double?; let currency: String?
        let pnl: Double?; let marginRate: Double?
    }
    private struct QuoteResp: Decodable { let quotes: [String: Quote]? }
    private struct Quote: Decodable { let price: Double?; let priceEur: Double?; let currency: String? }

    private static func get(_ url: URL, supabase: Bool) async throws -> Data {
        var req = URLRequest(url: url, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 15)
        if supabase {
            req.setValue(PortfolioAPI.anonKey, forHTTPHeaderField: "apikey")
            req.setValue("Bearer \(PortfolioAPI.anonKey)", forHTTPHeaderField: "Authorization")
        }
        let (data, resp) = try await URLSession.shared.data(for: req)
        guard let http = resp as? HTTPURLResponse, (200..<300).contains(http.statusCode) else { throw URLError(.badServerResponse) }
        return data
    }

    static func fetch() async throws -> CFDState? {
        let rows = try JSONDecoder().decode([Row].self, from: try await get(partiesEndpoint, supabase: true))
        guard let snap = rows.first?.parties?.first(where: { $0.cfd != nil })?.cfd,
              let acc = snap.accountValue else { return nil }
        let pos = snap.positions ?? []
        let syms = Array(Set(pos.compactMap { $0.symbol?.uppercased() }.filter { !$0.isEmpty }))
        var quotes: [String: Quote] = [:]
        if !syms.isEmpty, let url = URL(string: quoteBase + syms.joined(separator: ",").addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed)!),
           let data = try? await get(url, supabase: false),
           let q = try? JSONDecoder().decode(QuoteResp.self, from: data) {
            quotes = q.quotes ?? [:]
        }
        var delta = 0.0, live = false
        var n0Total = 0.0, n1Total = 0.0, ratedM0 = 0.0, ratedM1 = 0.0, un0 = 0.0, un1 = 0.0
        let out: [CFDPosition] = pos.compactMap { p in
            guard let sym = p.symbol?.uppercased(), let qty = p.quantity, let cur = p.currentPrice else { return nil }
            let ccy = (p.currency ?? "EUR").uppercased()
            var price = cur, pnl = p.pnl ?? 0
            var fx: Double? = ccy == "EUR" ? 1 : nil
            if let q = quotes[sym], let px = q.price, px > 0, let pe = q.priceEur, pe > 0,
               (q.currency ?? ccy).uppercased() == ccy {
                fx = pe / px
                let d = qty * (p.dir == "sell" ? -1 : 1) * (px - cur) * (pe / px)
                delta += d; pnl += d; price = px; live = true
            }
            if let fx {
                let n0 = abs(qty * cur * fx), n1 = abs(qty * price * fx)
                n0Total += n0; n1Total += n1
                if let r = p.marginRate { ratedM0 += n0 * r / 100; ratedM1 += n1 * r / 100 } else { un0 += n0; un1 += n1 }
            }
            return CFDPosition(id: p.id ?? sym, symbol: sym, name: p.name ?? sym, dir: p.dir ?? "buy", quantity: qty,
                               openPrice: p.openPrice ?? cur, price: price, currency: ccy, pnl: pnl)
        }
        let account = acc + delta
        var margin = snap.margin ?? 0
        if let m0 = snap.margin, n0Total > 0 {
            let implied = un0 > 0 ? max(0, m0 - ratedM0) / un0 : 0
            margin = ratedM1 + un1 * implied
        }
        var health = snap.health
        if let h = snap.health, let m0 = snap.margin {
            let base0 = acc - m0 / 2
            if base0 > 0 { health = min(100, max(0, h * (account - margin / 2) / base0)) }
        }
        return CFDState(accountValue: account, cash: account - margin, margin: margin, health: health,
                        openPnl: out.reduce(0) { $0 + $1.pnl }, positions: out, live: live, asOf: Date())
    }
}

enum CFDCache {
    static let key = "cfd-widget-v1"
    static func save(_ s: CFDState) { if let d = try? JSONEncoder().encode(s) { UserDefaults.standard.set(d, forKey: key) } }
    static func load() -> CFDState? { UserDefaults.standard.data(forKey: key).flatMap { try? JSONDecoder().decode(CFDState.self, from: $0) } }
}

struct CFDEntry: TimelineEntry {
    let date: Date
    let state: CFDState?
    let isStale: Bool
}

struct CFDProvider: TimelineProvider {
    func placeholder(in context: Context) -> CFDEntry { CFDEntry(date: Date(), state: .placeholder, isStale: false) }
    func getSnapshot(in context: Context, completion: @escaping (CFDEntry) -> Void) {
        if context.isPreview { return completion(CFDEntry(date: Date(), state: CFDCache.load() ?? .placeholder, isStale: false)) }
        Task { completion(await entry()) }
    }
    func getTimeline(in context: Context, completion: @escaping (Timeline<CFDEntry>) -> Void) {
        Task {
            let e = await entry()
            // iOS bepaalt het echte ritme; we vragen elke 5 minuten om een nieuwe stand.
            completion(Timeline(entries: [e], policy: .after(Date().addingTimeInterval(5 * 60))))
        }
    }
    private func entry() async -> CFDEntry {
        if let s = try? await CFDAPI.fetch() { CFDCache.save(s); return CFDEntry(date: Date(), state: s, isStale: false) }
        return CFDEntry(date: Date(), state: CFDCache.load(), isStale: true)
    }
}

private enum CFDFmt {
    static func price(_ v: Double, _ ccy: String) -> String {
        let f = NumberFormatter(); f.locale = Fmt.nl; f.numberStyle = .decimal
        f.minimumFractionDigits = 2; f.maximumFractionDigits = 2
        let body = f.string(from: NSNumber(value: v)) ?? "–"
        switch ccy { case "USD": return "$" + body; case "EUR": return "€ " + body; case "GBP": return "£" + body; default: return body + " " + ccy }
    }
    static func signed2(_ v: Double) -> String { (v < 0 ? "−" : "+") + Fmt.euro(v, decimals: 2) }
}

struct CFDWidgetView: View {
    @Environment(\.widgetFamily) private var family
    @Environment(\.redactionReasons) private var redaction
    let entry: CFDEntry

    var body: some View {
        Group {
            if redaction.contains(.privacy) {
                VStack(alignment: .leading, spacing: 4) {
                    Label("CFD", systemImage: "lock.fill").font(.system(size: 13, weight: .semibold))
                    Text("Ontgrendel voor je posities").font(.system(size: 12)).foregroundStyle(Palette.muted)
                }.frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            } else if let s = entry.state {
                content(s).privacySensitive()
            } else {
                VStack(alignment: .leading, spacing: 4) {
                    Text("CFD live").font(.system(size: 13, weight: .semibold))
                    Text("Nog geen CFD-stand. Open de app.").font(.system(size: 12)).foregroundStyle(Palette.muted)
                }.frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            }
        }
        .containerBackground(for: .widget) { Palette.bg }
    }

    @ViewBuilder private func content(_ s: CFDState) -> some View {
        switch family {
        case .accessoryRectangular:
            VStack(alignment: .leading, spacing: 1) {
                Text("CFD \(Fmt.euro(s.accountValue))").font(.system(size: 13, weight: .semibold)).widgetAccentable()
                Text(CFDFmt.signed2(s.openPnl)).font(.system(size: 13, weight: .medium)).monospacedDigit()
                if let p = s.positions.first { Text("\(p.symbol) \(CFDFmt.price(p.price, p.currency))").font(.system(size: 12)).monospacedDigit() }
            }
        case .accessoryInline:
            Text("CFD \(CFDFmt.signed2(s.openPnl))").monospacedDigit()
        case .systemMedium:
            HStack(alignment: .top, spacing: 14) {
                header(s).frame(maxWidth: .infinity, alignment: .leading)
                VStack(alignment: .leading, spacing: 6) {
                    ForEach(s.positions.prefix(3)) { p in posRow(p) }
                    Spacer(minLength: 0)
                    HStack(spacing: 10) {
                        stat("Cash", Fmt.euro(s.cash, decimals: 0))
                        stat("Margin", Fmt.euro(s.margin, decimals: 0))
                        if let h = s.health { stat("Health", "\(Int(h.rounded()))%") }
                    }
                }.frame(maxWidth: .infinity, alignment: .leading)
            }
        default:
            VStack(alignment: .leading, spacing: 4) {
                header(s)
                Spacer(minLength: 0)
                if let p = s.positions.first { posRow(p) }
                HStack(spacing: 8) {
                    stat("Cash", Fmt.euro(s.cash, decimals: 0))
                    stat("Margin", Fmt.euro(s.margin, decimals: 0))
                }
            }
        }
    }

    private func header(_ s: CFDState) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack(spacing: 4) {
                Circle().fill(s.live && !entry.isStale ? Palette.gain : Palette.muted).frame(width: 6, height: 6)
                Text("CFD").font(.system(size: 12, weight: .semibold)).foregroundStyle(Palette.muted)
                Text(entry.date, style: .time).font(.system(size: 11)).foregroundStyle(Palette.muted)
            }
            Text(Fmt.euro(s.accountValue, decimals: 2)).font(.system(size: 22, weight: .bold)).monospacedDigit()
                .minimumScaleFactor(0.6).lineLimit(1).foregroundStyle(Palette.fg)
            Text(CFDFmt.signed2(s.openPnl)).font(.system(size: 14, weight: .semibold)).monospacedDigit()
                .foregroundStyle(Palette.tone(s.openPnl))
        }
    }

    private func posRow(_ p: CFDPosition) -> some View {
        HStack(spacing: 6) {
            VStack(alignment: .leading, spacing: 0) {
                Text("\(p.symbol) · \(p.dir == "sell" ? "short" : "long")").font(.system(size: 12, weight: .semibold)).lineLimit(1)
                Text(CFDFmt.price(p.price, p.currency)).font(.system(size: 11)).monospacedDigit().foregroundStyle(Palette.muted)
            }
            Spacer(minLength: 4)
            Text(CFDFmt.signed2(p.pnl)).font(.system(size: 12, weight: .semibold)).monospacedDigit()
                .foregroundStyle(Palette.tone(p.pnl)).lineLimit(1).minimumScaleFactor(0.7)
        }
    }

    private func stat(_ label: String, _ value: String) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            Text(label).font(.system(size: 10)).foregroundStyle(Palette.muted)
            Text(value).font(.system(size: 12, weight: .semibold)).monospacedDigit().lineLimit(1).minimumScaleFactor(0.7)
        }
    }
}

struct CFDWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "InvesterenCFD", provider: CFDProvider()) { entry in
            CFDWidgetView(entry: entry)
        }
        .configurationDisplayName("CFD live")
        .description("Je lopende CFD-contracten: resultaat, cash, margin en health.")
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryRectangular, .accessoryInline])
    }
}
