import Foundation

/// Read-only access to Supabase (never writes): the live hero snapshot that the web app
/// publishes in portfolio.data.widgetSnapshot, with the daily values as fallback/sparkline.
enum PortfolioAPI {
    static let snapshotEndpoint = URL(string: "https://xlmbpohjlcwjubgiyjaw.supabase.co/rest/v1/portfolio?id=eq.main&select=snapshot:data->widgetSnapshot")!
    static let endpoint = URL(string: "https://xlmbpohjlcwjubgiyjaw.supabase.co/rest/v1/portfolio_daily_values?select=date,total_eur,invested_eur&order=date.desc&limit=31")!
    // Public anon key (same as app/main.jsx SUPABASE_DEFAULTS).
    static let anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsbWJwb2hqbGN3anViZ2l5amF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNjIyODksImV4cCI6MjA5MzYzODI4OX0.BXbY5_stirCdFLuXleBHu1VouYm1cguVZd3bjkygHlo"

    struct Row: Decodable {
        let date: String
        let total_eur: Double
        let invested_eur: Double?
    }

    /// Same numbers as the web app's Overzicht hero (see buildWidgetSnapshot in app/data.jsx).
    struct AppSnapshot: Decodable {
        let asOf: String
        let total: Double
        let netInvested: Double?
        let totalGain: Double?
        let totalGainPct: Double?   // percent, e.g. 92.68
        let todayGain: Double?
        let todayPct: Double?       // percent
        let series: Series?
        struct Series: Decodable { let dates: [String]?; let values: [Double]? }

        var asOfDate: Date? {
            let f = ISO8601DateFormatter()
            f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            if let d = f.date(from: asOf) { return d }
            f.formatOptions = [.withInternetDateTime]
            return f.date(from: asOf)
        }
    }
    private struct SnapshotRow: Decodable { let snapshot: AppSnapshot? }

    private static func get(_ url: URL) async throws -> Data {
        var req = URLRequest(url: url, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 15)
        req.httpMethod = "GET"
        req.setValue(anonKey, forHTTPHeaderField: "apikey")
        req.setValue("Bearer \(anonKey)", forHTTPHeaderField: "Authorization")
        req.setValue("application/json", forHTTPHeaderField: "Accept")
        let (data, resp) = try await URLSession.shared.data(for: req)
        guard let http = resp as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
            throw URLError(.badServerResponse)
        }
        return data
    }

    static func fetchAppSnapshot() async -> AppSnapshot? {
        guard let data = try? await get(snapshotEndpoint),
              let rows = try? JSONDecoder().decode([SnapshotRow].self, from: data) else { return nil }
        return rows.first?.snapshot
    }

    static func fetchDaily() async throws -> PortfolioSnapshot {
        let rows = try JSONDecoder().decode([Row].self, from: try await get(endpoint))
        guard let snap = PortfolioSnapshot(rowsNewestFirst: rows, fetchedAt: Date()) else {
            throw URLError(.cannotParseResponse)
        }
        return snap
    }

    /// Live app snapshot when present and ≤ 2 days old; otherwise the daily-values computation.
    static func fetch() async throws -> PortfolioSnapshot {
        async let appTask = fetchAppSnapshot()
        async let dailyTask: PortfolioSnapshot? = try? fetchDaily()
        let (app, daily) = await (appTask, dailyTask)
        if let app, let asOf = app.asOfDate, Date().timeIntervalSince(asOf) <= 2 * 86400 {
            return PortfolioSnapshot(app: app, asOf: asOf, daily: daily)
        }
        guard let daily else { throw URLError(.cannotLoadFromNetwork) }
        return daily
    }
}

struct PortfolioSnapshot: Codable, Equatable {
    var date: String            // yyyy-MM-dd of newest row
    var total: Double
    var invested: Double
    var dayChange: Double?
    var dayChangePct: Double?
    var monthChange: Double?
    var monthChangePct: Double?
    var series: [Double]        // oldest -> newest, up to 31 points
    var fetchedAt: Date
    // Set when the numbers come from the web app's live snapshot (nil = daily-values fallback).
    var asOf: Date? = nil
    var appProfit: Double? = nil
    var appProfitPct: Double? = nil   // fraction

    var isLive: Bool { asOf != nil }
    var updatedAt: Date { asOf ?? fetchedAt }
    var profit: Double { appProfit ?? (total - invested) }
    var profitPct: Double? { isLive ? appProfitPct : (invested > 0 ? profit / invested : nil) }

    init(app: PortfolioAPI.AppSnapshot, asOf: Date, daily: PortfolioSnapshot?) {
        total = app.total
        invested = app.netInvested ?? daily?.invested ?? 0
        appProfit = app.totalGain ?? (total - invested)
        appProfitPct = app.totalGainPct.map { $0 / 100 }
        dayChange = app.todayGain
        dayChangePct = app.todayPct.map { $0 / 100 }
        self.asOf = asOf
        fetchedAt = Date()
        date = Self.dayFormatter.string(from: asOf)
        if let vals = app.series?.values, vals.count >= 2 {
            var v = vals
            v[v.count - 1] = app.total
            series = v
            monthChange = app.total - vals[0]
            monthChangePct = vals[0] != 0 ? (app.total - vals[0]) / vals[0] : nil
        } else {
            series = daily?.series ?? [app.total]
            monthChange = daily?.monthChange
            monthChangePct = daily?.monthChangePct
        }
    }

    init?(rowsNewestFirst rows: [PortfolioAPI.Row], fetchedAt: Date) {
        let rows = rows.sorted { $0.date > $1.date }
        guard let latest = rows.first else { return nil }
        date = latest.date
        total = latest.total_eur
        invested = latest.invested_eur ?? 0
        self.fetchedAt = fetchedAt
        series = rows.reversed().map(\.total_eur)
        if rows.count > 1 {
            let prev = rows[1].total_eur
            dayChange = total - prev
            dayChangePct = prev != 0 ? (total - prev) / prev : nil
        }
        // ~30 days ago: newest row on/before (latest - 30d), else the oldest row available.
        if let latestDate = Self.dayFormatter.date(from: latest.date), rows.count > 1 {
            let target = latestDate.addingTimeInterval(-30 * 86400)
            let older = rows.dropFirst()
            let ref = older.first { (Self.dayFormatter.date(from: $0.date) ?? .distantFuture) <= target } ?? older.last!
            monthChange = total - ref.total_eur
            monthChangePct = ref.total_eur != 0 ? (total - ref.total_eur) / ref.total_eur : nil
        }
    }

    static let dayFormatter: DateFormatter = {
        let f = DateFormatter()
        f.locale = Locale(identifier: "en_US_POSIX")
        f.timeZone = TimeZone(identifier: "Europe/Amsterdam")
        f.dateFormat = "yyyy-MM-dd"
        return f
    }()

    static let placeholder: PortfolioSnapshot = {
        let rows = (0..<31).map { i -> PortfolioAPI.Row in
            let d = Date().addingTimeInterval(Double(-i) * 86400)
            let v = 28000 - Double(i) * 30 + sin(Double(i) / 3) * 180
            return PortfolioAPI.Row(date: dayFormatter.string(from: d), total_eur: v, invested_eur: 13300)
        }
        return PortfolioSnapshot(rowsNewestFirst: rows, fetchedAt: Date())!
    }()
}

/// Last good snapshot, kept in the widget extension's own UserDefaults (no App Group needed).
enum SnapshotCache {
    private static let key = "lastSnapshot.v1"
    static func load() -> PortfolioSnapshot? {
        guard let d = UserDefaults.standard.data(forKey: key) else { return nil }
        return try? JSONDecoder().decode(PortfolioSnapshot.self, from: d)
    }
    static func save(_ s: PortfolioSnapshot) {
        if let d = try? JSONEncoder().encode(s) { UserDefaults.standard.set(d, forKey: key) }
    }
}

enum Fmt {
    static let nl = Locale(identifier: "nl_NL")

    /// "€ 28.061"
    static func euro(_ v: Double, decimals: Int = 0) -> String {
        let f = NumberFormatter()
        f.locale = nl
        f.numberStyle = .decimal
        f.minimumFractionDigits = decimals
        f.maximumFractionDigits = decimals
        return "€ " + (f.string(from: NSNumber(value: abs(v))) ?? "0")
    }

    /// "+€ 14.728" / "−€ 3"
    static func signedEuro(_ v: Double) -> String {
        (v < 0 ? "−" : "+") + euro(v)
    }

    /// "+110,5%"
    static func signedPct(_ v: Double?, decimals: Int = 1) -> String {
        guard let v else { return "–" }
        let f = NumberFormatter()
        f.locale = nl
        f.numberStyle = .decimal
        f.minimumFractionDigits = decimals
        f.maximumFractionDigits = decimals
        let s = f.string(from: NSNumber(value: abs(v * 100))) ?? "0"
        return (v < 0 ? "−" : "+") + s + "%"
    }

    static func time(_ d: Date) -> String {
        let f = DateFormatter()
        f.locale = nl
        f.dateFormat = Calendar.current.isDateInToday(d) ? "HH:mm" : "d MMM HH:mm"
        return f.string(from: d)
    }
}
