import SwiftUI
import WebKit
import UserNotifications
import AppKit

let appURL = URL(string: "https://cjjdogterom.github.io/investeren/")!

/// Native macOS shell around the Investeren web app (same site as the iPhone app).
@main
struct InvesterenMacApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    @StateObject private var model = WebModel()

    var body: some Scene {
        Window("Investeren", id: "main") {
            ContentView(model: model)
                .frame(minWidth: 420, minHeight: 560)
        }
        .defaultSize(width: 1180, height: 820)
        .windowToolbarStyle(.unifiedCompact(showsTitle: true))
        .commands {
            CommandGroup(replacing: .newItem) {}
            CommandGroup(after: .toolbar) {
                Button("Vernieuw") { model.reload() }.keyboardShortcut("r")
                Button("Vernieuw zonder cache") { model.reload(hard: true) }.keyboardShortcut("r", modifiers: [.command, .shift])
                Divider()
                Button("Druk af…") { model.printPage(title: nil) }.keyboardShortcut("p")
                Divider()
                Button("Ware grootte") { model.zoom(to: 1) }.keyboardShortcut("0")
                Button("Zoom in") { model.zoom(by: 0.1) }.keyboardShortcut("+")
                Button("Zoom uit") { model.zoom(by: -0.1) }.keyboardShortcut("-")
            }
            CommandGroup(replacing: .help) {
                Button("Open in browser") { NSWorkspace.shared.open(model.webView.url ?? appURL) }
            }
        }
    }
}

final class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }
}

struct ContentView: View {
    @ObservedObject var model: WebModel
    @Environment(\.scenePhase) private var scenePhase

    var body: some View {
        ZStack {
            Color("Background").ignoresSafeArea()
            WebContainer(webView: model.webView)
                .opacity(model.hasLoaded ? 1 : 0)
            if model.failed {
                OfflineView(message: model.errorMessage) { model.reload() }
            } else if !model.hasLoaded {
                ProgressView().controlSize(.large)
            }
        }
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button { model.reload() } label: { Label("Vernieuw", systemImage: "arrow.clockwise") }
                    .help("Vernieuw (⌘R)")
            }
        }
        .onChange(of: scenePhase) { _, phase in
            if phase == .active, model.failed { model.reload() }
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
            Button("Opnieuw proberen", action: retry).buttonStyle(.borderedProminent).controlSize(.large)
        }
        .padding(32)
    }
}

/// Meldingen vanuit de web-app (CFD-meldingen): lokale melding via het meldingencentrum.
final class NotifyBridge: NSObject, WKScriptMessageHandler, UNUserNotificationCenterDelegate {
    override init() {
        super.init()
        UNUserNotificationCenter.current().delegate = self
    }
    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let body = message.body as? [String: Any] else { return }
        let center = UNUserNotificationCenter.current()
        if (body["request"] as? Bool) == true {
            center.requestAuthorization(options: [.alert, .sound, .badge]) { _, _ in }
            return
        }
        let title = body["title"] as? String ?? "Investeren"
        let text = body["body"] as? String ?? ""
        let id = body["id"] as? String ?? UUID().uuidString
        center.requestAuthorization(options: [.alert, .sound, .badge]) { ok, _ in
            guard ok else { return }
            let c = UNMutableNotificationContent()
            c.title = title; c.body = text; c.sound = .default
            center.add(UNNotificationRequest(identifier: id, content: c, trigger: nil))
        }
    }
    // Ook tonen als de app open is.
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification,
                                withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .sound, .list])
    }
}

final class PrintBridge: NSObject, WKScriptMessageHandler {
    weak var model: WebModel?
    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        let title = (message.body as? [String: Any])?["title"] as? String
        DispatchQueue.main.async { self.model?.printPage(title: title) }
    }
}

struct WebContainer: NSViewRepresentable {
    let webView: WKWebView
    let notifyBridge: NotifyBridge
    func makeNSView(context: Context) -> WKWebView { webView }
    func updateNSView(_ nsView: WKWebView, context: Context) {}
}

final class WebModel: NSObject, ObservableObject, WKNavigationDelegate, WKUIDelegate {
    @Published var hasLoaded = false
    @Published var failed = false
    @Published var errorMessage = ""
    let webView: WKWebView

    override init() {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()          // persistent localStorage / IndexedDB
        config.preferences.isElementFullscreenEnabled = true
        let bridge = PrintBridge()
        config.userContentController.add(bridge, name: "investerenPrint")   // jaaroverzicht → PDF
        let nb = NotifyBridge()
        notifyBridge = nb
        config.userContentController.add(nb, name: "investerenNotify")   // CFD-meldingen
        webView = WKWebView(frame: .zero, configuration: config)
        super.init()
        bridge.model = self
        webView.underPageBackgroundColor = NSColor(named: "Background")
        webView.setValue(false, forKey: "drawsBackground")
        webView.allowsBackForwardNavigationGestures = true
        webView.allowsMagnification = true
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.load(URLRequest(url: appURL))
        // Refresh when the app comes back to the foreground after a while (data stays current).
        NotificationCenter.default.addObserver(forName: NSApplication.didBecomeActiveNotification, object: nil, queue: .main) { [weak self] _ in
            guard let self else { return }
            if self.failed { self.reload() }
        }
    }

    func reload(hard: Bool = false) {
        failed = false
        if webView.url == nil || webView.url?.absoluteString == "about:blank" {
            webView.load(URLRequest(url: appURL, cachePolicy: .reloadRevalidatingCacheData))
        } else if hard {
            webView.reloadFromOrigin()
        } else {
            webView.reload()
        }
    }

    /// Printvenster van macOS (met 'Bewaar als PDF'); marges komen uit de @page-regels van de pagina.
    func printPage(title: String?) {
        guard let window = webView.window else { return }
        let info = (NSPrintInfo.shared.copy() as? NSPrintInfo) ?? NSPrintInfo()
        info.paperSize = NSSize(width: 595.28, height: 841.89)   // A4
        info.topMargin = 0; info.bottomMargin = 0; info.leftMargin = 0; info.rightMargin = 0
        info.horizontalPagination = .automatic
        info.verticalPagination = .automatic
        info.isHorizontallyCentered = false
        info.isVerticallyCentered = false
        let op = webView.printOperation(with: info)
        op.jobTitle = title ?? "Investeren"
        op.showsPrintPanel = true
        op.showsProgressPanel = true
        op.view?.frame = webView.bounds
        op.runModal(for: window, delegate: nil, didRun: nil, contextInfo: nil)
    }

    func zoom(to value: CGFloat) { webView.pageZoom = value }
    func zoom(by delta: CGFloat) { webView.pageZoom = min(2, max(0.5, webView.pageZoom + delta)) }

    private func isInternal(_ url: URL) -> Bool {
        url.host == appURL.host && url.path.hasPrefix("/investeren")
    }

    // MARK: Navigation

    func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = action.request.url else { return decisionHandler(.allow) }
        let scheme = url.scheme?.lowercased() ?? ""
        if ["about", "blob", "data", "javascript"].contains(scheme) { return decisionHandler(.allow) }
        let isMainFrame = action.targetFrame?.isMainFrame ?? true
        if scheme == "http" || scheme == "https" {
            if !isMainFrame || isInternal(url) { return decisionHandler(.allow) }
        }
        NSWorkspace.shared.open(url)   // external sites, mailto: ...
        decisionHandler(.cancel)
    }

    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
                 for action: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        if let url = action.request.url {
            if isInternal(url) { webView.load(action.request) } else { NSWorkspace.shared.open(url) }
        }
        return nil
    }

    // MARK: JS dialogs (confirm/alert used by the web app)

    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        let alert = NSAlert(); alert.messageText = message; alert.addButton(withTitle: "OK")
        alert.runModal(); completionHandler()
    }

    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        let alert = NSAlert(); alert.messageText = message
        alert.addButton(withTitle: "OK"); alert.addButton(withTitle: "Annuleer")
        completionHandler(alert.runModal() == .alertFirstButtonReturn)
    }

    func webView(_ webView: WKWebView, runJavaScriptTextInputPanelWithPrompt prompt: String, defaultText: String?,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (String?) -> Void) {
        let alert = NSAlert(); alert.messageText = prompt
        let field = NSTextField(frame: NSRect(x: 0, y: 0, width: 260, height: 24)); field.stringValue = defaultText ?? ""
        alert.accessoryView = field
        alert.addButton(withTitle: "OK"); alert.addButton(withTitle: "Annuleer")
        completionHandler(alert.runModal() == .alertFirstButtonReturn ? field.stringValue : nil)
    }

    func webView(_ webView: WKWebView, runOpenPanelWith parameters: WKOpenPanelParameters,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping ([URL]?) -> Void) {
        let panel = NSOpenPanel()
        panel.allowsMultipleSelection = parameters.allowsMultipleSelection
        panel.canChooseDirectories = parameters.allowsDirectories
        completionHandler(panel.runModal() == .OK ? panel.urls : nil)
    }

    // MARK: Loading state

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        failed = false
        if !hasLoaded { DispatchQueue.main.async { withAnimation(.easeOut(duration: 0.2)) { self.hasLoaded = true } } }
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) { handle(error) }
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) { handle(error) }
    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) { webView.reload() }

    private func handle(_ error: Error) {
        let ns = error as NSError
        if ns.domain == NSURLErrorDomain && ns.code == NSURLErrorCancelled { return }
        if ns.domain == "WebKitErrorDomain" && ns.code == 102 { return }
        errorMessage = ns.domain == NSURLErrorDomain
            ? "Controleer je internetverbinding en probeer het opnieuw."
            : ns.localizedDescription
        failed = true
    }
}
