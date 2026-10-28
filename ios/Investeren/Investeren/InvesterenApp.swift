import SwiftUI
import WebKit

let appURL = URL(string: "https://cjjdogterom.github.io/investeren/")!

@main
struct InvesterenApp: App {
    var body: some Scene {
        WindowGroup { ContentView() }
    }
}

struct ContentView: View {
    @StateObject private var model = WebModel()
    @Environment(\.scenePhase) private var scenePhase

    var body: some View {
        ZStack {
            Color("Background").ignoresSafeArea()
            WebContainer(webView: model.webView)
                .ignoresSafeArea()
                .opacity(model.hasLoaded ? 1 : 0)
            if model.failed {
                OfflineView(message: model.errorMessage) { model.retry() }
            } else if !model.hasLoaded {
                ProgressView()
            }
        }
        .onChange(of: scenePhase) { _, phase in
            if phase == .active, model.failed { model.retry() }
        }
    }
}

struct OfflineView: View {
    let message: String
    let retry: () -> Void
    var body: some View {
        VStack(spacing: 14) {
            Image(systemName: "wifi.slash").font(.system(size: 40, weight: .light)).foregroundStyle(.secondary)
            Text("Geen verbinding").font(.title3.weight(.semibold))
            Text(message).font(.subheadline).foregroundStyle(.secondary).multilineTextAlignment(.center)
            Button(action: retry) {
                Text("Opnieuw proberen").font(.body.weight(.semibold)).padding(.horizontal, 22).padding(.vertical, 10)
            }
            .buttonStyle(.borderedProminent).tint(.primary).foregroundStyle(Color("Background"))
        }
        .padding(32)
    }
}

struct WebContainer: UIViewRepresentable {
    let webView: WKWebView
    func makeUIView(context: Context) -> WKWebView { webView }
    func updateUIView(_ uiView: WKWebView, context: Context) {}
}

final class WebModel: NSObject, ObservableObject, WKNavigationDelegate, WKUIDelegate {
    @Published var hasLoaded = false
    @Published var failed = false
    @Published var errorMessage = ""
    let webView: WKWebView

    override init() {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()          // persistent localStorage / IndexedDB
        config.allowsInlineMediaPlayback = true
        webView = WKWebView(frame: .zero, configuration: config)
        super.init()
        let bg = UIColor(named: "Background")
        webView.isOpaque = false
        webView.backgroundColor = bg
        webView.underPageBackgroundColor = bg
        webView.scrollView.backgroundColor = bg
        webView.scrollView.contentInsetAdjustmentBehavior = .never   // web content handles safe areas (viewport-fit=cover)
        webView.allowsBackForwardNavigationGestures = true
        webView.allowsLinkPreview = false
        webView.navigationDelegate = self
        webView.uiDelegate = self
        let refresh = UIRefreshControl()
        refresh.addTarget(self, action: #selector(pullToRefresh(_:)), for: .valueChanged)
        webView.scrollView.refreshControl = refresh
        webView.load(URLRequest(url: appURL))
    }

    @objc private func pullToRefresh(_ sender: UIRefreshControl) {
        retry()
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) { sender.endRefreshing() }
    }

    func retry() {
        failed = false
        if webView.url == nil || webView.url?.absoluteString == "about:blank" {
            webView.load(URLRequest(url: appURL, cachePolicy: .reloadRevalidatingCacheData))
        } else {
            webView.reload()
        }
    }

    private func isInternal(_ url: URL) -> Bool {
        url.host == appURL.host && url.path.hasPrefix("/investeren")
    }

    private func openExternally(_ url: URL) {
        UIApplication.shared.open(url)
    }

    // MARK: Navigation

    func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = action.request.url else { return decisionHandler(.allow) }
        let scheme = url.scheme?.lowercased() ?? ""
        if ["about", "blob", "data", "javascript"].contains(scheme) { return decisionHandler(.allow) }
        let isMainFrame = action.targetFrame?.isMainFrame ?? true
        if (scheme == "http" || scheme == "https") {
            if !isMainFrame || isInternal(url) { return decisionHandler(.allow) }
        }
        openExternally(url)   // external sites, mailto:, tel: ...
        decisionHandler(.cancel)
    }

    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
                 for action: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        if let url = action.request.url {
            if isInternal(url) { webView.load(action.request) } else { openExternally(url) }
        }
        return nil
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        failed = false
        if !hasLoaded { withAnimationIfNeeded { self.hasLoaded = true } }
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        handle(error)
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        handle(error)
    }

    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        webView.reload()
    }

    private func handle(_ error: Error) {
        let ns = error as NSError
        if ns.domain == NSURLErrorDomain && ns.code == NSURLErrorCancelled { return }
        if ns.domain == "WebKitErrorDomain" && ns.code == 102 { return }   // frame load interrupted (policy cancel)
        errorMessage = ns.domain == NSURLErrorDomain
            ? "Controleer je internetverbinding en probeer het opnieuw."
            : ns.localizedDescription
        failed = true
    }

    private func withAnimationIfNeeded(_ body: @escaping () -> Void) {
        DispatchQueue.main.async { withAnimation(.easeOut(duration: 0.2)) { body() } }
    }
}
