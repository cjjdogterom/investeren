import Foundation

/// Read-only access to the daily portfolio values in Supabase (never writes).
enum PortfolioAPI {
    static let endpoint = URL(string: "https://xlmbpohjlcwjubgiyjaw.supabase.co/rest/v1/portfolio_daily_values?select=date,total_eur,invested_eur&order=date.desc&limit=31")!
    // Public anon key (same as app/main.jsx SUPABASE_DEFAULTS).
    static let anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsbWJwb2hqbGN3anViZ2l5amF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNjIyODksImV4cCI6MjA5MzYzODI4OX0.BXbY5_stirCdFLuXleBHu1VouYm1cguVZd3bjkygHlo"

    struct Row: Decodable {
        let date: String
        let total_eur: Double
        let invested_eur: Double?
    }

    static func fetch() async throws -> PortfolioSnapshot {
        var req = URLRequest(url: endpoint, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 15)
        req.httpMethod = "GET"
        req.setValue(anonKey, forHTTPHeaderField: "apikey")
        req.setValue("Bearer \(anonKey)", forHTTPHeaderField: "Authorization")
        req.setValue("application/json", forHTTPHeaderField: "Accept")
        let (data, resp) = try await URLSession.shared.data(for: req)
        guard let http = resp as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
            throw URLError(.badServerResponse)
        }
        let rows = try JSONDecoder().decode([Row].self, from: data)
        guard let snap = PortfolioSnapshot(rowsNewestFirst: rows, fetchedAt: Date()) else {
            throw URLError(.cannotParseResponse)
        }
        return snap
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

    var profit: Double { total - invested }
    var profitPct: Double? { invested > 0 ? profit / invested : nil }

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
