import Foundation
import Capacitor
import FamilyControls
import ManagedSettings
import DeviceActivity

/**
 * MeditationLock Capacitor Plugin
 *
 * Provides Screen Time API integration for blocking apps until meditation is complete.
 * Uses FamilyControls for authorization, FamilyActivityPicker for app selection,
 * and ManagedSettings for blocking.
 *
 * iOS 15.0+ required for FamilyControls API
 */
@objc(MeditationLockPlugin)
public class MeditationLockPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "MeditationLockPlugin"
    public let jsName = "MeditationLock"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "requestAuthorization", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getAuthorizationStatus", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showAppPicker", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "blockApps", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "unblockApps", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getBlockedApps", returnType: CAPPluginReturnPromise),
        // Phase 3: Schedule & Shield methods
        CAPPluginMethod(name: "syncSettings", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setSchedule", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearSchedule", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getLockState", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "sessionStarted", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "sessionCompleted", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "useEmergencySkip", returnType: CAPPluginReturnPromise)
    ]

    // Store for managing app restrictions
    private let store = ManagedSettingsStore()

    // DeviceActivity center for scheduling
    @available(iOS 15.0, *)
    private var activityCenter: DeviceActivityCenter {
        DeviceActivityCenter()
    }

    // Shared container for extension communication
    private let sharedContainer = SharedContainerManager.shared

    // Currently selected apps to block
    private var selectedApps: Set<ApplicationToken> = []

    // Currently selected categories to block
    private var selectedCategories: Set<ActivityCategoryToken> = []

    /**
     * Request FamilyControls authorization
     * Must be called before any other Screen Time operations
     */
    @objc func requestAuthorization(_ call: CAPPluginCall) {
        if #available(iOS 16.0, *) {
            Task {
                do {
                    try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
                    let status = self.mapAuthorizationStatus(AuthorizationCenter.shared.authorizationStatus)
                    call.resolve(["status": status])
                } catch {
                    print("[MeditationLock] Authorization request failed: \(error)")
                    call.resolve(["status": "denied"])
                }
            }
        } else {
            // iOS 15 uses a different API
            if #available(iOS 15.0, *) {
                Task {
                    do {
                        try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
                        let status = self.mapAuthorizationStatus(AuthorizationCenter.shared.authorizationStatus)
                        call.resolve(["status": status])
                    } catch {
                        print("[MeditationLock] Authorization request failed: \(error)")
                        call.resolve(["status": "denied"])
                    }
                }
            } else {
                call.reject("FamilyControls requires iOS 15.0 or later")
            }
        }
    }

    /**
     * Get current authorization status
     */
    @objc func getAuthorizationStatus(_ call: CAPPluginCall) {
        if #available(iOS 15.0, *) {
            let status = mapAuthorizationStatus(AuthorizationCenter.shared.authorizationStatus)
            call.resolve(["status": status])
        } else {
            call.reject("FamilyControls requires iOS 15.0 or later")
        }
    }

    /**
     * Show the FamilyActivityPicker for app selection
     * Returns opaque tokens that can be used with blockApps
     */
    @objc func showAppPicker(_ call: CAPPluginCall) {
        if #available(iOS 15.0, *) {
            // Store the call for later resolution
            self.savedCall = call

            DispatchQueue.main.async {
                // Present the picker from the root view controller
                guard let viewController = self.bridge?.viewController else {
                    call.reject("Unable to get view controller")
                    return
                }

                // Create and present the picker
                let pickerController = FamilyActivityPickerController(
                    selection: self.currentSelection
                )
                pickerController.delegate = self

                viewController.present(pickerController, animated: true)
            }
        } else {
            call.reject("FamilyActivityPicker requires iOS 15.0 or later")
        }
    }

    /**
     * Block the specified apps using ManagedSettings
     */
    @objc func blockApps(_ call: CAPPluginCall) {
        guard let tokenStrings = call.getArray("tokens", String.self) else {
            call.reject("tokens array is required")
            return
        }

        if #available(iOS 15.0, *) {
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

            // Apply the shield
            store.shield.applications = applications.isEmpty ? nil : applications
            store.shield.applicationCategories = categories.isEmpty ? nil : .specific(categories)

            // Store for later reference
            self.selectedApps = applications
            self.selectedCategories = categories

            call.resolve(["success": true])
        } else {
            call.reject("ManagedSettings requires iOS 15.0 or later")
        }
    }

    /**
     * Unblock all currently blocked apps
     */
    @objc func unblockApps(_ call: CAPPluginCall) {
        if #available(iOS 15.0, *) {
            // Clear all shields
            store.shield.applications = nil
            store.shield.applicationCategories = nil

            // Clear stored selections
            selectedApps.removeAll()
            selectedCategories.removeAll()

            call.resolve(["success": true])
        } else {
            call.reject("ManagedSettings requires iOS 15.0 or later")
        }
    }

    /**
     * Get list of currently blocked apps
     */
    @objc func getBlockedApps(_ call: CAPPluginCall) {
        if #available(iOS 15.0, *) {
            var tokens: [String] = []

            // Encode ApplicationTokens
            for appToken in selectedApps {
                if let encoded = try? JSONEncoder().encode(appToken) {
                    tokens.append(encoded.base64EncodedString())
                }
            }

            // Encode CategoryTokens
            for catToken in selectedCategories {
                if let encoded = try? JSONEncoder().encode(catToken) {
                    tokens.append(encoded.base64EncodedString())
                }
            }

            call.resolve(["tokens": tokens])
        } else {
            call.reject("ManagedSettings requires iOS 15.0 or later")
        }
    }

    // MARK: - Phase 3: Schedule & Shield Methods

    /**
     * Sync all settings from JavaScript to the shared container
     * This makes settings available to the DeviceActivity and Shield extensions
     */
    @objc func syncSettings(_ call: CAPPluginCall) {
        guard let settings = call.getObject("settings") else {
            call.reject("settings object is required")
            return
        }

        // Convert JSObject to [String: Any]
        var settingsDict: [String: Any] = [:]
        for (key, value) in settings {
            settingsDict[key] = value
        }

        // Sync to shared container
        sharedContainer.syncFromSettings(settingsDict)

        print("[MeditationLock] Settings synced to shared container")
        call.resolve(["success": true])
    }

    /**
     * Set the DeviceActivity schedule based on settings
     * The DeviceActivityMonitor extension will activate/deactivate the lock based on this schedule
     */
    @objc func setSchedule(_ call: CAPPluginCall) {
        if #available(iOS 15.0, *) {
            // Get schedule windows from shared container
            let windows = sharedContainer.scheduleWindows
            let activeDays = sharedContainer.activeDays

            guard !windows.isEmpty else {
                call.reject("No schedule windows configured")
                return
            }

            // Create DeviceActivitySchedule for each window
            // For simplicity, we'll use the first window as the primary schedule
            let primaryWindow = windows[0]

            // Build schedule components
            var startComponents = DateComponents()
            startComponents.hour = primaryWindow.startHour
            startComponents.minute = primaryWindow.startMinute

            var endComponents = DateComponents()
            endComponents.hour = primaryWindow.endHour
            endComponents.minute = primaryWindow.endMinute

            // Create the schedule (repeating daily)
            let schedule = DeviceActivitySchedule(
                intervalStart: startComponents,
                intervalEnd: endComponents,
                repeats: true
            )

            do {
                // Stop any existing monitoring
                activityCenter.stopMonitoring([.meditationLockSchedule])

                // Start monitoring with the new schedule
                try activityCenter.startMonitoring(
                    .meditationLockSchedule,
                    during: schedule
                )

                print("[MeditationLock] Schedule set: \(primaryWindow.startHour):\(primaryWindow.startMinute) to \(primaryWindow.endHour):\(primaryWindow.endMinute)")
                call.resolve(["success": true])
            } catch {
                print("[MeditationLock] Failed to set schedule: \(error)")
                call.reject("Failed to set schedule: \(error.localizedDescription)")
            }
        } else {
            call.reject("DeviceActivity requires iOS 15.0 or later")
        }
    }

    /**
     * Clear the DeviceActivity schedule
     */
    @objc func clearSchedule(_ call: CAPPluginCall) {
        if #available(iOS 15.0, *) {
            activityCenter.stopMonitoring([.meditationLockSchedule])

            // Also clear any active shields
            store.shield.applications = nil
            store.shield.applicationCategories = nil

            // Update shared container
            sharedContainer.isLockActive = false

            print("[MeditationLock] Schedule cleared")
            call.resolve(["success": true])
        } else {
            call.reject("DeviceActivity requires iOS 15.0 or later")
        }
    }

    /**
     * Get current lock state from shared container
     */
    @objc func getLockState(_ call: CAPPluginCall) {
        let state: [String: Any] = [
            "isLockActive": sharedContainer.isLockActive,
            "isSessionInProgress": sharedContainer.isSessionInProgress,
            "lockActivatedAt": sharedContainer.lockActivatedAt?.timeIntervalSince1970 ?? 0,
            "lastSessionTimestamp": sharedContainer.lastSessionTimestamp?.timeIntervalSince1970 ?? 0,
            "lastSessionDurationSeconds": sharedContainer.lastSessionDurationSeconds,
            "streakFreezesRemaining": sharedContainer.streakFreezesRemaining,
            "streakDays": sharedContainer.streakDays,
            "totalUnlocks": sharedContainer.totalUnlocks
        ]
        call.resolve(state)
    }

    /**
     * Mark a session as started (in progress)
     * Updates shared container so shield shows "Session in progress"
     */
    @objc func sessionStarted(_ call: CAPPluginCall) {
        sharedContainer.isSessionInProgress = true
        sharedContainer.sessionStartedAt = Date()

        print("[MeditationLock] Session started")
        call.resolve(["success": true])
    }

    /**
     * Mark a session as completed
     * Deactivates the lock and updates analytics
     */
    @objc func sessionCompleted(_ call: CAPPluginCall) {
        let durationSeconds = call.getInt("durationSeconds") ?? 0
        let isFallback = call.getBool("isFallback") ?? false

        // Update session tracking
        sharedContainer.isSessionInProgress = false
        sharedContainer.lastSessionTimestamp = Date()
        sharedContainer.lastSessionDurationSeconds = durationSeconds

        // Check if session meets unlock requirement
        let requiredSeconds = (isFallback
            ? sharedContainer.minimumFallbackMinutes
            : sharedContainer.unlockDurationMinutes) * 60

        if durationSeconds >= requiredSeconds {
            // Deactivate lock
            if #available(iOS 15.0, *) {
                store.shield.applications = nil
                store.shield.applicationCategories = nil
            }
            sharedContainer.isLockActive = false
            sharedContainer.totalUnlocks += 1

            // Update streak
            sharedContainer.streakDays += 1

            print("[MeditationLock] Session completed (\(durationSeconds)s), lock deactivated")
            call.resolve([
                "success": true,
                "unlocked": true,
                "streakDays": sharedContainer.streakDays
            ])
        } else {
            // Session too short, lock remains
            print("[MeditationLock] Session too short (\(durationSeconds)s < \(requiredSeconds)s required)")
            call.resolve([
                "success": true,
                "unlocked": false,
                "reason": "Session duration (\(durationSeconds)s) less than required (\(requiredSeconds)s)"
            ])
        }
    }

    /**
     * Use an emergency skip to bypass the lock
     */
    @objc func useEmergencySkip(_ call: CAPPluginCall) {
        let remaining = sharedContainer.streakFreezesRemaining

        if remaining <= 0 {
            call.resolve([
                "success": false,
                "reason": "No emergency skips remaining"
            ])
            return
        }

        // Decrement skip count
        sharedContainer.streakFreezesRemaining = remaining - 1
        sharedContainer.totalSkipsUsed += 1

        // Deactivate lock
        if #available(iOS 15.0, *) {
            store.shield.applications = nil
            store.shield.applicationCategories = nil
        }
        sharedContainer.isLockActive = false
        sharedContainer.isSessionInProgress = false

        print("[MeditationLock] Emergency skip used, \(remaining - 1) remaining")
        call.resolve([
            "success": true,
            "skipsRemaining": remaining - 1
        ])
    }

    // MARK: - Private Helpers

    private var savedCall: CAPPluginCall?

    @available(iOS 15.0, *)
    private var currentSelection: FamilyActivitySelection {
        get {
            var selection = FamilyActivitySelection()
            selection.applicationTokens = selectedApps
            selection.categoryTokens = selectedCategories
            return selection
        }
    }

    @available(iOS 15.0, *)
    private func mapAuthorizationStatus(_ status: AuthorizationStatus) -> String {
        switch status {
        case .approved:
            return "authorized"
        case .denied:
            return "denied"
        case .notDetermined:
            return "notDetermined"
        @unknown default:
            return "notDetermined"
        }
    }
}

// MARK: - FamilyActivityPickerController Delegate

@available(iOS 15.0, *)
extension MeditationLockPlugin {
    // Custom picker controller to handle selection
    class FamilyActivityPickerController: UIViewController {
        var selection: FamilyActivitySelection
        weak var delegate: MeditationLockPlugin?

        private var hostingController: UIViewController?

        init(selection: FamilyActivitySelection) {
            self.selection = selection
            super.init(nibName: nil, bundle: nil)
        }

        required init?(coder: NSCoder) {
            fatalError("init(coder:) has not been implemented")
        }

        override func viewDidLoad() {
            super.viewDidLoad()

            // Create SwiftUI picker view
            let picker = FamilyActivityPickerView(selection: $selection) { newSelection in
                self.selection = newSelection
            }

            // Wrap in hosting controller
            let hostingController = UIHostingController(rootView: picker)
            self.hostingController = hostingController

            addChild(hostingController)
            view.addSubview(hostingController.view)
            hostingController.view.translatesAutoresizingMaskIntoConstraints = false
            NSLayoutConstraint.activate([
                hostingController.view.topAnchor.constraint(equalTo: view.topAnchor),
                hostingController.view.bottomAnchor.constraint(equalTo: view.bottomAnchor),
                hostingController.view.leadingAnchor.constraint(equalTo: view.leadingAnchor),
                hostingController.view.trailingAnchor.constraint(equalTo: view.trailingAnchor)
            ])
            hostingController.didMove(toParent: self)

            // Add done button
            navigationItem.rightBarButtonItem = UIBarButtonItem(
                barButtonSystemItem: .done,
                target: self,
                action: #selector(doneTapped)
            )
        }

        @objc func doneTapped() {
            delegate?.handlePickerSelection(selection)
            dismiss(animated: true)
        }
    }

    func handlePickerSelection(_ selection: FamilyActivitySelection) {
        // Store the selections
        selectedApps = selection.applicationTokens
        selectedCategories = selection.categoryTokens

        // Encode tokens for JavaScript
        var tokens: [String] = []

        for appToken in selection.applicationTokens {
            if let encoded = try? JSONEncoder().encode(appToken) {
                tokens.append(encoded.base64EncodedString())
            }
        }

        for catToken in selection.categoryTokens {
            if let encoded = try? JSONEncoder().encode(catToken) {
                tokens.append(encoded.base64EncodedString())
            }
        }

        savedCall?.resolve(["tokens": tokens])
        savedCall = nil
    }
}

// MARK: - SwiftUI Picker View

import SwiftUI

@available(iOS 15.0, *)
struct FamilyActivityPickerView: View {
    @Binding var selection: FamilyActivitySelection
    var onSelectionChanged: (FamilyActivitySelection) -> Void

    @State private var isPresented = true

    var body: some View {
        VStack {
            Text("Select Apps to Block")
                .font(.headline)
                .padding()

            FamilyActivityPicker(selection: $selection)
                .onChange(of: selection) { newValue in
                    onSelectionChanged(newValue)
                }

            Spacer()
        }
    }
}

// MARK: - DeviceActivityName Extension

@available(iOS 15.0, *)
extension DeviceActivityName {
    /// Main meditation lock schedule activity
    static let meditationLockSchedule = Self("stillhours.meditationlock.schedule")
}
