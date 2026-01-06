import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?
  var securityOverlayView: UIView?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "aitutorpp",
      in: window,
      launchOptions: launchOptions
    )
    
    // Setup screen capture detection
    setupScreenCaptureDetection()

    return true
  }
  
  // MARK: - Screen Capture Detection
  
  private func setupScreenCaptureDetection() {
    // Listen for screen capture changes (iOS 11+)
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(screenCaptureDidChange),
      name: UIScreen.capturedDidChangeNotification,
      object: nil
    )
    
    // Listen for screen recording changes (iOS 11+)
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(screenCaptureDidChange),
      name: UIApplication.userDidTakeScreenshotNotification,
      object: nil
    )
    
    // Check initial state
    checkScreenCaptureStatus()
  }
  
  @objc private func screenCaptureDidChange() {
    checkScreenCaptureStatus()
  }
  
  private func checkScreenCaptureStatus() {
    DispatchQueue.main.async { [weak self] in
      if UIScreen.main.isCaptured {
        self?.showSecurityOverlay()
      } else {
        self?.hideSecurityOverlay()
      }
    }
  }
  
  private func showSecurityOverlay() {
    guard securityOverlayView == nil, let window = self.window else { return }
    
    let overlay = UIView(frame: window.bounds)
    overlay.backgroundColor = UIColor.systemBackground
    overlay.tag = 999
    
    // Create blur effect
    let blurEffect = UIBlurEffect(style: .regular)
    let blurView = UIVisualEffectView(effect: blurEffect)
    blurView.frame = overlay.bounds
    blurView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    overlay.addSubview(blurView)
    
    // Add warning icon and message
    let containerView = UIView()
    containerView.translatesAutoresizingMaskIntoConstraints = false
    overlay.addSubview(containerView)
    
    // Shield icon
    let iconLabel = UILabel()
    iconLabel.translatesAutoresizingMaskIntoConstraints = false
    iconLabel.text = "🛡️"
    iconLabel.font = UIFont.systemFont(ofSize: 64)
    iconLabel.textAlignment = .center
    containerView.addSubview(iconLabel)
    
    // Warning title
    let titleLabel = UILabel()
    titleLabel.translatesAutoresizingMaskIntoConstraints = false
    titleLabel.text = "Screen Recording Detected"
    titleLabel.font = UIFont.boldSystemFont(ofSize: 22)
    titleLabel.textColor = UIColor.label
    titleLabel.textAlignment = .center
    containerView.addSubview(titleLabel)
    
    // Warning message
    let messageLabel = UILabel()
    messageLabel.translatesAutoresizingMaskIntoConstraints = false
    messageLabel.text = "For security reasons, content is hidden while screen recording or screen sharing is active."
    messageLabel.font = UIFont.systemFont(ofSize: 16)
    messageLabel.textColor = UIColor.secondaryLabel
    messageLabel.textAlignment = .center
    messageLabel.numberOfLines = 0
    containerView.addSubview(messageLabel)
    
    // Setup constraints
    NSLayoutConstraint.activate([
      containerView.centerXAnchor.constraint(equalTo: overlay.centerXAnchor),
      containerView.centerYAnchor.constraint(equalTo: overlay.centerYAnchor),
      containerView.leadingAnchor.constraint(equalTo: overlay.leadingAnchor, constant: 40),
      containerView.trailingAnchor.constraint(equalTo: overlay.trailingAnchor, constant: -40),
      
      iconLabel.topAnchor.constraint(equalTo: containerView.topAnchor),
      iconLabel.centerXAnchor.constraint(equalTo: containerView.centerXAnchor),
      
      titleLabel.topAnchor.constraint(equalTo: iconLabel.bottomAnchor, constant: 20),
      titleLabel.leadingAnchor.constraint(equalTo: containerView.leadingAnchor),
      titleLabel.trailingAnchor.constraint(equalTo: containerView.trailingAnchor),
      
      messageLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 12),
      messageLabel.leadingAnchor.constraint(equalTo: containerView.leadingAnchor),
      messageLabel.trailingAnchor.constraint(equalTo: containerView.trailingAnchor),
      messageLabel.bottomAnchor.constraint(equalTo: containerView.bottomAnchor)
    ])
    
    window.addSubview(overlay)
    securityOverlayView = overlay
  }
  
  private func hideSecurityOverlay() {
    securityOverlayView?.removeFromSuperview()
    securityOverlayView = nil
  }
  
  // MARK: - App Lifecycle
  
  func applicationWillResignActive(_ application: UIApplication) {
    // Add blur when app goes to background (prevents screenshot in app switcher)
    addBackgroundSecurityView()
  }
  
  func applicationDidBecomeActive(_ application: UIApplication) {
    // Remove blur when app becomes active
    removeBackgroundSecurityView()
    // Check screen capture status
    checkScreenCaptureStatus()
  }
  
  private func addBackgroundSecurityView() {
    guard let window = self.window else { return }
    
    let blurEffect = UIBlurEffect(style: .regular)
    let blurView = UIVisualEffectView(effect: blurEffect)
    blurView.frame = window.bounds
    blurView.tag = 998
    window.addSubview(blurView)
  }
  
  private func removeBackgroundSecurityView() {
    window?.viewWithTag(998)?.removeFromSuperview()
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
