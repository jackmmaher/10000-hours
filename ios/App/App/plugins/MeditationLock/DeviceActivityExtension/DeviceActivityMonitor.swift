import DeviceActivity
import ManagedSettings
import FamilyControls
import Foundation

/**
 * DeviceActivityMonitor
 *
 * iOS Extension that monitors device activity and activates/deactivates app blocking
 * based on the scheduled meditation windows.
 *
 * This runs as a separate process from the main app and communicates via App Groups.
 *
 * Entry points:
 * - intervalDidStart: Called when a schedule window begins
 * - intervalDidEnd: Called when a schedule window ends
 * - eventDidReachThreshold: Called when a usage threshold is reached (not used)
 */
@available(iOS 15.0, *)
class MeditationLockMonitor: DeviceActivityMonitor {

    /// ManagedSettings store for applying shields
    private let store = ManagedSettingsStore()

    /// Shared container for settings sync
    private let container = SharedContainerManager.shared

    // MARK: - Schedule Window Start

    override func intervalDidStart(for activity: DeviceActivityName) {
        super.intervalDidStart(for: activity)

        // Only activate if lock is enabled
        guard container.isEnabled else {
            print("[MeditationLockMonitor] Lock not enabled, skipping activation")
            return
        }

        // Check if today is an active day
        guard container.isActiveDay() else {
            print("[MeditationLockMonitor] Today is not an active day, skipping")
            return
        }

        // Early bird check: Did user already complete today's session?
        let gracePlusBuffer = container.gracePeriodMinutes + 60 // Extra buffer for early completion
        if container.hasRecentSession(withinMinutes: gracePlusBuffer) {
            let requiredSeconds = container.unlockDurationMinutes * 60
            if container.lastSessionDurationSeconds >= requiredSeconds {
                print("[MeditationLockMonitor] User already completed today's session, skipping lock")
                return
            }
        }

        // Activate the lock
        activateLock()

        print("[MeditationLockMonitor] Schedule window started, lock activated")
    }

    // MARK: - Schedule Window End

    override func intervalDidEnd(for activity: DeviceActivityName) {
        super.intervalDidEnd(for: activity)

        // Check if safety auto-unlock should trigger
        let safetyHours = container.safetyAutoUnlockHours
        if safetyHours > 0 {
            // Safety unlock happens automatically when window ends
            deactivateLock()
            print("[MeditationLockMonitor] Schedule window ended, safety auto-unlock triggered")
        } else {
            // Hardcore mode: keep lock until meditation completes
            // Only deactivate if session was completed
            if !container.isLockActive {
                print("[MeditationLockMonitor] Lock was already deactivated by session completion")
            } else {
                print("[MeditationLockMonitor] Hardcore mode: lock remains active until meditation")
            }
        }
    }

    // MARK: - Lock Activation/Deactivation

    private func activateLock() {
        // Get blocked app tokens from shared container
        let tokenStrings = container.blockedAppTokens

        // Convert base64 strings back to tokens
        var applications: Set<ApplicationToken> = []
        var categories: Set<ActivityCategoryToken> = []

        for tokenString in tokenStrings {
            if let tokenData = Data(base64Encoded: tokenString) {
                // Try to decode as ApplicationToken
                if let appToken = try? JSONDecoder().decode(ApplicationToken.self, from: tokenData) {
                    applications.insert(appToken)
                }
                // Try to decode as ActivityCategoryToken
                else if let catToken = try? JSONDecoder().decode(ActivityCategoryToken.self, from: tokenData) {
                    categories.insert(catToken)
                }
            }
        }

        // Apply shields
        if !applications.isEmpty {
            store.shield.applications = applications
        }
        if !categories.isEmpty {
            store.shield.applicationCategories = .specific(categories)
        }

        // Update state in shared container
        container.isLockActive = true
        container.lockActivatedAt = Date()

        print("[MeditationLockMonitor] Lock activated - \(applications.count) apps, \(categories.count) categories blocked")
    }

    private func deactivateLock() {
        // Remove all shields
        store.shield.applications = nil
        store.shield.applicationCategories = nil

        // Update state in shared container
        container.isLockActive = false

        // Increment unlock counter
        container.totalUnlocks += 1

        print("[MeditationLockMonitor] Lock deactivated")
    }

    // MARK: - Threshold Events (Optional)

    override func eventDidReachThreshold(_ event: DeviceActivityEvent.Name, activity: DeviceActivityName) {
        super.eventDidReachThreshold(event, activity: activity)

        // Could be used for usage tracking in future
        print("[MeditationLockMonitor] Event threshold reached: \(event)")
    }
}

// MARK: - DeviceActivityName Extension

extension DeviceActivityName {
    /// Main meditation lock schedule activity
    static let meditationLockSchedule = Self("stillhours.meditationlock.schedule")
}

// MARK: - DeviceActivityEvent.Name Extension

extension DeviceActivityEvent.Name {
    /// Event for tracking app usage during lock window
    static let lockWindowUsage = Self("stillhours.meditationlock.usage")
}
