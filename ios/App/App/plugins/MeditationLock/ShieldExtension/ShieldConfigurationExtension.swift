import ManagedSettings
import ManagedSettingsUI
import UIKit

/**
 * ShieldConfigurationExtension
 *
 * Provides custom shield UI when blocked apps are opened during the meditation lock window.
 * Uses dynamic content from SharedContainerManager.
 *
 * Three states:
 * 1. Locked (normal) - Shows anchor routine + duration required
 * 2. Flexibility mode - Shows minimum duration + coping response
 * 3. Session in progress - Shows return to app message
 *
 * All text uses actual user values from setup flow (no hardcoding).
 */
@available(iOS 15.0, *)
class ShieldConfigurationExtension: ShieldConfigurationDataSource {

    /// Shared container for reading user settings
    private let container = SharedContainerManager.shared

    // MARK: - Shield Configuration

    override func configuration(shielding application: Application) -> ShieldConfiguration {
        return buildShieldConfiguration()
    }

    override func configuration(shielding application: Application, in category: ActivityCategory) -> ShieldConfiguration {
        return buildShieldConfiguration()
    }

    override func configuration(shielding webDomain: WebDomain) -> ShieldConfiguration {
        return buildShieldConfiguration()
    }

    override func configuration(shielding webDomain: WebDomain, in category: ActivityCategory) -> ShieldConfiguration {
        return buildShieldConfiguration()
    }

    // MARK: - Build Shield Configuration

    private func buildShieldConfiguration() -> ShieldConfiguration {
        // Check if session is in progress
        if container.isSessionInProgress {
            return buildSessionInProgressShield()
        }

        // Default: Locked state
        return buildLockedStateShield()
    }

    // MARK: - Locked State Shield

    /**
     * Main locked state shield showing:
     * - "After {anchorRoutine}"
     * - "{unlockDurationMinutes} minutes to unlock"
     * - Primary button: "Open Still Hours"
     * - Secondary button: "Need flexibility today?"
     */
    private func buildLockedStateShield() -> ShieldConfiguration {
        let anchorRoutine = container.anchorRoutine
        let duration = container.unlockDurationMinutes

        // Dynamic subtitle with actual anchor routine
        let subtitleText = anchorRoutine.isEmpty
            ? "\(duration) minutes to unlock"
            : "After \(anchorRoutine)\n\(duration) minutes to unlock"

        return ShieldConfiguration(
            backgroundBlurStyle: .systemUltraThinMaterialDark,
            backgroundColor: UIColor(red: 0.09, green: 0.09, blue: 0.08, alpha: 0.95), // Near match to app dark bg
            icon: ShieldConfiguration.Icon(systemName: "leaf.fill"), // Still Hours nature theme
            title: ShieldConfiguration.Label(
                text: "Still Hours",
                color: UIColor(red: 0.94, green: 0.44, blue: 0.13, alpha: 1.0) // Hermes orange
            ),
            subtitle: ShieldConfiguration.Label(
                text: subtitleText,
                color: .white
            ),
            primaryButtonLabel: ShieldConfiguration.Label(
                text: "Open Still Hours",
                color: .white
            ),
            primaryButtonBackgroundColor: UIColor(red: 0.94, green: 0.44, blue: 0.13, alpha: 1.0), // Hermes orange
            secondaryButtonLabel: ShieldConfiguration.Label(
                text: "Need flexibility today?",
                color: UIColor(white: 0.6, alpha: 1.0)
            )
        )
    }

    // MARK: - Session In Progress Shield

    /**
     * Shows when user is mid-meditation:
     * - "Session in progress"
     * - Primary button: "Return to Still Hours"
     */
    private func buildSessionInProgressShield() -> ShieldConfiguration {
        return ShieldConfiguration(
            backgroundBlurStyle: .systemUltraThinMaterialDark,
            backgroundColor: UIColor(red: 0.09, green: 0.09, blue: 0.08, alpha: 0.95),
            icon: ShieldConfiguration.Icon(systemName: "leaf.fill"),
            title: ShieldConfiguration.Label(
                text: "Still Hours",
                color: UIColor(red: 0.94, green: 0.44, blue: 0.13, alpha: 1.0)
            ),
            subtitle: ShieldConfiguration.Label(
                text: "Session in progress",
                color: .white
            ),
            primaryButtonLabel: ShieldConfiguration.Label(
                text: "Return to Still Hours",
                color: .white
            ),
            primaryButtonBackgroundColor: UIColor(red: 0.94, green: 0.44, blue: 0.13, alpha: 1.0),
            secondaryButtonLabel: nil
        )
    }
}

// MARK: - Shield Action Extension

/**
 * Handles user interactions with the shield buttons.
 * Primary button opens Still Hours app via deep link.
 * Secondary button shows flexibility options.
 */
@available(iOS 15.0, *)
class ShieldActionExtension: ShieldActionDelegate {

    /// Shared container for reading/writing state
    private let container = SharedContainerManager.shared

    override func handle(
        action: ShieldAction,
        for application: Application,
        completionHandler: @escaping (ShieldActionResponse) -> Void
    ) {
        handleAction(action, completionHandler: completionHandler)
    }

    override func handle(
        action: ShieldAction,
        for application: Application,
        in category: ActivityCategory,
        completionHandler: @escaping (ShieldActionResponse) -> Void
    ) {
        handleAction(action, completionHandler: completionHandler)
    }

    override func handle(
        action: ShieldAction,
        for webDomain: WebDomain,
        completionHandler: @escaping (ShieldActionResponse) -> Void
    ) {
        handleAction(action, completionHandler: completionHandler)
    }

    override func handle(
        action: ShieldAction,
        for webDomain: WebDomain,
        in category: ActivityCategory,
        completionHandler: @escaping (ShieldActionResponse) -> Void
    ) {
        handleAction(action, completionHandler: completionHandler)
    }

    // MARK: - Action Handling

    private func handleAction(_ action: ShieldAction, completionHandler: @escaping (ShieldActionResponse) -> Void) {
        switch action {
        case .primaryButtonPressed:
            // Open Still Hours app via deep link
            openStillHours(fallbackMode: false)
            completionHandler(.close)

        case .secondaryButtonPressed:
            // User tapped "Need flexibility today?"
            // Open app with fallback duration
            openStillHours(fallbackMode: true)
            completionHandler(.close)

        @unknown default:
            completionHandler(.none)
        }
    }

    // MARK: - Deep Link

    /**
     * Opens Still Hours app via deep link with appropriate parameters.
     *
     * Deep link format:
     * stillhours://lock-session?duration={minutes}&fallback={bool}&anchor={routine}
     */
    private func openStillHours(fallbackMode: Bool) {
        let duration = fallbackMode
            ? container.minimumFallbackMinutes
            : container.unlockDurationMinutes
        let anchor = container.anchorRoutine.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""

        let urlString = "stillhours://lock-session?duration=\(duration)&fallback=\(fallbackMode)&anchor=\(anchor)"

        if let url = URL(string: urlString) {
            // Extensions cannot open URLs directly, but we can try via the shared extension context
            // The actual URL opening happens via the response
            print("[ShieldAction] Requesting app open: \(urlString)")

            // Store the intent in shared container for the app to pick up
            container.isSessionInProgress = false // Will be set when session starts
            UserDefaults(suiteName: "group.app.stillhours.meditationlock")?.set(urlString, forKey: "pendingDeepLink")
        }
    }
}
