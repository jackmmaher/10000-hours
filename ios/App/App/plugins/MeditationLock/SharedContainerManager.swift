import Foundation

/**
 * SharedContainerManager
 *
 * Manages data sync between the main app and Screen Time extensions via App Groups.
 * Uses UserDefaults in a shared container for cross-process communication.
 *
 * App Group identifier: group.app.stillhours.meditationlock
 */
public class SharedContainerManager {

    /// Shared instance
    public static let shared = SharedContainerManager()

    /// App Group identifier - must match entitlements
    private let appGroupIdentifier = "group.app.stillhours.meditationlock"

    /// UserDefaults for shared container
    private var sharedDefaults: UserDefaults? {
        return UserDefaults(suiteName: appGroupIdentifier)
    }

    // MARK: - Keys

    private enum Keys {
        // Lock settings from setup flow
        static let enabled = "lock_enabled"
        static let anchorRoutine = "anchor_routine"
        static let anchorLocation = "anchor_location"
        static let anchorTimeHour = "anchor_time_hour"
        static let anchorTimeMinute = "anchor_time_minute"
        static let unlockDurationMinutes = "unlock_duration_minutes"
        static let minimumFallbackMinutes = "minimum_fallback_minutes"
        static let celebrationRitual = "celebration_ritual"
        static let identityStatement = "identity_statement"

        // Obstacles for flexibility mode
        static let obstacles = "obstacles" // JSON encoded array

        // Schedule
        static let scheduleWindowsJson = "schedule_windows_json"
        static let activeDays = "active_days" // [Bool] encoded

        // Forgiveness
        static let streakFreezesRemaining = "streak_freezes_remaining"
        static let streakFreezesPerMonth = "streak_freezes_per_month"
        static let gracePeriodMinutes = "grace_period_minutes"
        static let safetyAutoUnlockHours = "safety_auto_unlock_hours"

        // State
        static let isLockActive = "is_lock_active"
        static let lockActivatedAt = "lock_activated_at"
        static let isSessionInProgress = "is_session_in_progress"
        static let sessionStartedAt = "session_started_at"
        static let lastSessionTimestamp = "last_session_timestamp"
        static let lastSessionDurationSeconds = "last_session_duration_seconds"

        // App tokens (base64 encoded)
        static let blockedAppTokens = "blocked_app_tokens"

        // Analytics
        static let streakDays = "streak_days"
        static let totalUnlocks = "total_unlocks"
        static let totalSkipsUsed = "total_skips_used"
    }

    // MARK: - Lock Settings (Written by App, Read by Extensions)

    public var isEnabled: Bool {
        get { sharedDefaults?.bool(forKey: Keys.enabled) ?? false }
        set { sharedDefaults?.set(newValue, forKey: Keys.enabled) }
    }

    public var anchorRoutine: String {
        get { sharedDefaults?.string(forKey: Keys.anchorRoutine) ?? "" }
        set { sharedDefaults?.set(newValue, forKey: Keys.anchorRoutine) }
    }

    public var anchorLocation: String {
        get { sharedDefaults?.string(forKey: Keys.anchorLocation) ?? "" }
        set { sharedDefaults?.set(newValue, forKey: Keys.anchorLocation) }
    }

    public var anchorTimeHour: Int {
        get { sharedDefaults?.integer(forKey: Keys.anchorTimeHour) ?? 7 }
        set { sharedDefaults?.set(newValue, forKey: Keys.anchorTimeHour) }
    }

    public var anchorTimeMinute: Int {
        get { sharedDefaults?.integer(forKey: Keys.anchorTimeMinute) ?? 0 }
        set { sharedDefaults?.set(newValue, forKey: Keys.anchorTimeMinute) }
    }

    public var unlockDurationMinutes: Int {
        get { sharedDefaults?.integer(forKey: Keys.unlockDurationMinutes) ?? 10 }
        set { sharedDefaults?.set(newValue, forKey: Keys.unlockDurationMinutes) }
    }

    public var minimumFallbackMinutes: Int {
        get { sharedDefaults?.integer(forKey: Keys.minimumFallbackMinutes) ?? 2 }
        set { sharedDefaults?.set(newValue, forKey: Keys.minimumFallbackMinutes) }
    }

    public var celebrationRitual: String {
        get { sharedDefaults?.string(forKey: Keys.celebrationRitual) ?? "" }
        set { sharedDefaults?.set(newValue, forKey: Keys.celebrationRitual) }
    }

    public var identityStatement: String {
        get { sharedDefaults?.string(forKey: Keys.identityStatement) ?? "" }
        set { sharedDefaults?.set(newValue, forKey: Keys.identityStatement) }
    }

    // MARK: - Obstacles

    public struct Obstacle: Codable {
        public let obstacle: String
        public let copingResponse: String

        public init(obstacle: String, copingResponse: String) {
            self.obstacle = obstacle
            self.copingResponse = copingResponse
        }
    }

    public var obstacles: [Obstacle] {
        get {
            guard let data = sharedDefaults?.data(forKey: Keys.obstacles),
                  let decoded = try? JSONDecoder().decode([Obstacle].self, from: data) else {
                return []
            }
            return decoded
        }
        set {
            if let encoded = try? JSONEncoder().encode(newValue) {
                sharedDefaults?.set(encoded, forKey: Keys.obstacles)
            }
        }
    }

    /// Get first obstacle for display in flexibility mode
    public var firstObstacle: Obstacle? {
        return obstacles.first
    }

    // MARK: - Schedule

    public struct ScheduleWindow: Codable {
        public let startHour: Int
        public let startMinute: Int
        public let endHour: Int
        public let endMinute: Int

        public init(startHour: Int, startMinute: Int, endHour: Int, endMinute: Int) {
            self.startHour = startHour
            self.startMinute = startMinute
            self.endHour = endHour
            self.endMinute = endMinute
        }
    }

    public var scheduleWindows: [ScheduleWindow] {
        get {
            guard let data = sharedDefaults?.data(forKey: Keys.scheduleWindowsJson),
                  let decoded = try? JSONDecoder().decode([ScheduleWindow].self, from: data) else {
                return [ScheduleWindow(startHour: 7, startMinute: 0, endHour: 9, endMinute: 0)]
            }
            return decoded
        }
        set {
            if let encoded = try? JSONEncoder().encode(newValue) {
                sharedDefaults?.set(encoded, forKey: Keys.scheduleWindowsJson)
            }
        }
    }

    /// Days of week active [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
    public var activeDays: [Bool] {
        get {
            guard let data = sharedDefaults?.data(forKey: Keys.activeDays),
                  let decoded = try? JSONDecoder().decode([Bool].self, from: data) else {
                // Default: Monday-Friday
                return [false, true, true, true, true, true, false]
            }
            return decoded
        }
        set {
            if let encoded = try? JSONEncoder().encode(newValue) {
                sharedDefaults?.set(encoded, forKey: Keys.activeDays)
            }
        }
    }

    // MARK: - Forgiveness Settings

    public var streakFreezesRemaining: Int {
        get { sharedDefaults?.integer(forKey: Keys.streakFreezesRemaining) ?? 3 }
        set { sharedDefaults?.set(newValue, forKey: Keys.streakFreezesRemaining) }
    }

    public var streakFreezesPerMonth: Int {
        get { sharedDefaults?.integer(forKey: Keys.streakFreezesPerMonth) ?? 3 }
        set { sharedDefaults?.set(newValue, forKey: Keys.streakFreezesPerMonth) }
    }

    public var gracePeriodMinutes: Int {
        get { sharedDefaults?.integer(forKey: Keys.gracePeriodMinutes) ?? 30 }
        set { sharedDefaults?.set(newValue, forKey: Keys.gracePeriodMinutes) }
    }

    public var safetyAutoUnlockHours: Int {
        get { sharedDefaults?.integer(forKey: Keys.safetyAutoUnlockHours) ?? 2 }
        set { sharedDefaults?.set(newValue, forKey: Keys.safetyAutoUnlockHours) }
    }

    // MARK: - Lock State (Read/Write by both App and Extensions)

    public var isLockActive: Bool {
        get { sharedDefaults?.bool(forKey: Keys.isLockActive) ?? false }
        set { sharedDefaults?.set(newValue, forKey: Keys.isLockActive) }
    }

    public var lockActivatedAt: Date? {
        get {
            guard let timestamp = sharedDefaults?.double(forKey: Keys.lockActivatedAt), timestamp > 0 else {
                return nil
            }
            return Date(timeIntervalSince1970: timestamp)
        }
        set {
            sharedDefaults?.set(newValue?.timeIntervalSince1970 ?? 0, forKey: Keys.lockActivatedAt)
        }
    }

    public var isSessionInProgress: Bool {
        get { sharedDefaults?.bool(forKey: Keys.isSessionInProgress) ?? false }
        set { sharedDefaults?.set(newValue, forKey: Keys.isSessionInProgress) }
    }

    public var sessionStartedAt: Date? {
        get {
            guard let timestamp = sharedDefaults?.double(forKey: Keys.sessionStartedAt), timestamp > 0 else {
                return nil
            }
            return Date(timeIntervalSince1970: timestamp)
        }
        set {
            sharedDefaults?.set(newValue?.timeIntervalSince1970 ?? 0, forKey: Keys.sessionStartedAt)
        }
    }

    public var lastSessionTimestamp: Date? {
        get {
            guard let timestamp = sharedDefaults?.double(forKey: Keys.lastSessionTimestamp), timestamp > 0 else {
                return nil
            }
            return Date(timeIntervalSince1970: timestamp)
        }
        set {
            sharedDefaults?.set(newValue?.timeIntervalSince1970 ?? 0, forKey: Keys.lastSessionTimestamp)
        }
    }

    public var lastSessionDurationSeconds: Int {
        get { sharedDefaults?.integer(forKey: Keys.lastSessionDurationSeconds) ?? 0 }
        set { sharedDefaults?.set(newValue, forKey: Keys.lastSessionDurationSeconds) }
    }

    // MARK: - App Tokens

    public var blockedAppTokens: [String] {
        get { sharedDefaults?.stringArray(forKey: Keys.blockedAppTokens) ?? [] }
        set { sharedDefaults?.set(newValue, forKey: Keys.blockedAppTokens) }
    }

    // MARK: - Analytics

    public var streakDays: Int {
        get { sharedDefaults?.integer(forKey: Keys.streakDays) ?? 0 }
        set { sharedDefaults?.set(newValue, forKey: Keys.streakDays) }
    }

    public var totalUnlocks: Int {
        get { sharedDefaults?.integer(forKey: Keys.totalUnlocks) ?? 0 }
        set { sharedDefaults?.set(newValue, forKey: Keys.totalUnlocks) }
    }

    public var totalSkipsUsed: Int {
        get { sharedDefaults?.integer(forKey: Keys.totalSkipsUsed) ?? 0 }
        set { sharedDefaults?.set(newValue, forKey: Keys.totalSkipsUsed) }
    }

    // MARK: - Convenience Methods

    /// Check if current day is an active day
    public func isActiveDay(_ date: Date = Date()) -> Bool {
        let calendar = Calendar.current
        let weekday = calendar.component(.weekday, from: date) - 1 // 0 = Sunday
        guard weekday >= 0 && weekday < activeDays.count else { return false }
        return activeDays[weekday]
    }

    /// Check if we're currently within a schedule window
    public func isWithinScheduleWindow(_ date: Date = Date()) -> Bool {
        let calendar = Calendar.current
        let hour = calendar.component(.hour, from: date)
        let minute = calendar.component(.minute, from: date)
        let currentMinutes = hour * 60 + minute

        for window in scheduleWindows {
            let startMinutes = window.startHour * 60 + window.startMinute
            let endMinutes = window.endHour * 60 + window.endMinute

            if currentMinutes >= startMinutes && currentMinutes < endMinutes {
                return true
            }
        }
        return false
    }

    /// Get formatted anchor time string (e.g., "7:00 AM")
    public func formattedAnchorTime() -> String {
        let hour = anchorTimeHour
        let minute = anchorTimeMinute
        let period = hour >= 12 ? "PM" : "AM"
        let displayHour = hour > 12 ? hour - 12 : (hour == 0 ? 12 : hour)
        return String(format: "%d:%02d %@", displayHour, minute, period)
    }

    /// Check if user completed a session recently (for early bird check)
    public func hasRecentSession(withinMinutes: Int) -> Bool {
        guard let lastSession = lastSessionTimestamp else { return false }
        let cutoff = Date().addingTimeInterval(-Double(withinMinutes * 60))
        return lastSession > cutoff
    }

    /// Sync all settings from JavaScript/Capacitor call
    public func syncFromSettings(_ settings: [String: Any]) {
        if let enabled = settings["enabled"] as? Bool {
            isEnabled = enabled
        }
        if let routine = settings["anchorRoutine"] as? String {
            anchorRoutine = routine
        }
        if let location = settings["anchorLocation"] as? String {
            anchorLocation = location
        }
        if let hour = settings["anchorTimeHour"] as? Int {
            anchorTimeHour = hour
        }
        if let minute = settings["anchorTimeMinute"] as? Int {
            anchorTimeMinute = minute
        }
        if let duration = settings["unlockDurationMinutes"] as? Int {
            unlockDurationMinutes = duration
        }
        if let minimum = settings["minimumFallbackMinutes"] as? Int {
            minimumFallbackMinutes = minimum
        }
        if let ritual = settings["celebrationRitual"] as? String {
            celebrationRitual = ritual
        }
        if let identity = settings["identityStatement"] as? String {
            identityStatement = identity
        }
        if let freezes = settings["streakFreezesRemaining"] as? Int {
            streakFreezesRemaining = freezes
        }
        if let freezesPerMonth = settings["streakFreezesPerMonth"] as? Int {
            streakFreezesPerMonth = freezesPerMonth
        }
        if let grace = settings["gracePeriodMinutes"] as? Int {
            gracePeriodMinutes = grace
        }
        if let safety = settings["safetyAutoUnlockHours"] as? Int {
            safetyAutoUnlockHours = safety
        }
        if let tokens = settings["blockedAppTokens"] as? [String] {
            blockedAppTokens = tokens
        }

        // Parse obstacles array
        if let obstaclesArray = settings["obstacles"] as? [[String: String]] {
            obstacles = obstaclesArray.compactMap { dict in
                guard let obstacle = dict["obstacle"],
                      let response = dict["copingResponse"] else { return nil }
                return Obstacle(obstacle: obstacle, copingResponse: response)
            }
        }

        // Parse schedule windows
        if let windowsArray = settings["scheduleWindows"] as? [[String: Int]] {
            scheduleWindows = windowsArray.compactMap { dict in
                guard let startHour = dict["startHour"],
                      let startMinute = dict["startMinute"],
                      let endHour = dict["endHour"],
                      let endMinute = dict["endMinute"] else { return nil }
                return ScheduleWindow(startHour: startHour, startMinute: startMinute,
                                     endHour: endHour, endMinute: endMinute)
            }
        }

        // Parse active days
        if let days = settings["activeDays"] as? [Bool] {
            activeDays = days
        }
    }
}
