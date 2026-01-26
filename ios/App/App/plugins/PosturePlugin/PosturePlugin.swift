/**
 * PosturePlugin - AirPods Head Motion Tracking for Posture Correction
 *
 * Uses CMHeadphoneMotionManager to track head orientation via AirPods Pro/Max/3rd gen.
 * Emits orientation updates at 10Hz for posture monitoring.
 *
 * Requirements:
 * - iOS 14.0+ for CMHeadphoneMotionManager
 * - AirPods Pro (any gen), AirPods 3rd gen, or AirPods Max
 * - Motion permission (NSMotionUsageDescription in Info.plist)
 */

import Foundation
import Capacitor
import CoreMotion

@objc(PosturePlugin)
public class PosturePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "PosturePlugin"
    public let jsName = "Posture"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isSupported", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isDeviceConnected", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startTracking", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopTracking", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "calibrate", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getCalibration", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearCalibration", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "triggerHaptic", returnType: CAPPluginReturnPromise)
    ]

    private var motionManager: CMHeadphoneMotionManager?
    private var isTracking = false
    private var lastEmitTime: TimeInterval = 0
    private let minEmitInterval: TimeInterval = 1.0 / 10.0 // 10Hz throttle

    // Calibration baseline stored in UserDefaults
    private let calibrationKey = "posture_calibration_baseline"

    // Track device connection state for events
    private var wasConnected = false

    /**
     * Check if headphone motion tracking is supported on this device
     * Requires iOS 14.0+ and CMHeadphoneMotionManager availability
     */
    @objc func isSupported(_ call: CAPPluginCall) {
        if #available(iOS 14.0, *) {
            let supported = CMHeadphoneMotionManager.isDeviceMotionAvailable
            call.resolve(["supported": supported])
        } else {
            call.resolve(["supported": false])
        }
    }

    /**
     * Check if compatible AirPods are currently connected
     */
    @objc func isDeviceConnected(_ call: CAPPluginCall) {
        guard #available(iOS 14.0, *) else {
            call.resolve(["connected": false])
            return
        }

        if motionManager == nil {
            motionManager = CMHeadphoneMotionManager()
        }

        let connected = motionManager?.isDeviceMotionAvailable ?? false
        call.resolve(["connected": connected])
    }

    /**
     * Start tracking head orientation
     * Emits orientationUpdate events at 10Hz with pitch/roll/yaw and deviation from baseline
     */
    @objc func startTracking(_ call: CAPPluginCall) {
        guard #available(iOS 14.0, *) else {
            call.reject("Headphone motion requires iOS 14.0 or later")
            return
        }

        guard CMHeadphoneMotionManager.isDeviceMotionAvailable else {
            call.reject("Headphone motion not supported on this device")
            return
        }

        if isTracking {
            call.resolve(["success": true])
            return
        }

        if motionManager == nil {
            motionManager = CMHeadphoneMotionManager()
        }

        guard let manager = motionManager else {
            call.reject("Failed to create motion manager")
            return
        }

        // Check if AirPods are connected
        guard manager.isDeviceMotionAvailable else {
            call.reject("No compatible AirPods connected")
            return
        }

        // Set up device connection observer
        motionManager?.delegate = self

        // Start motion updates
        manager.startDeviceMotionUpdates(to: .main) { [weak self] motion, error in
            guard let self = self, let motion = motion else {
                if let error = error {
                    print("[PosturePlugin] Motion update error: \(error.localizedDescription)")
                }
                return
            }

            // Throttle to 10Hz
            let now = Date().timeIntervalSince1970
            guard now - self.lastEmitTime >= self.minEmitInterval else { return }
            self.lastEmitTime = now

            // Extract Euler angles (radians)
            let attitude = motion.attitude
            let pitch = attitude.pitch * 180 / .pi // Convert to degrees
            let roll = attitude.roll * 180 / .pi
            let yaw = attitude.yaw * 180 / .pi

            // Calculate deviation from baseline if calibrated
            var deviation: [String: Any] = ["pitch": 0.0, "roll": 0.0, "total": 0.0]
            if let baseline = self.loadCalibration() {
                let pitchDev = pitch - baseline.pitch
                let rollDev = roll - baseline.roll
                let totalDev = sqrt(pitchDev * pitchDev + rollDev * rollDev)
                deviation = [
                    "pitch": pitchDev,
                    "roll": rollDev,
                    "total": totalDev
                ]
            }

            // Emit orientation update
            self.notifyListeners("orientationUpdate", data: [
                "pitch": pitch,
                "roll": roll,
                "yaw": yaw,
                "deviationFromBaseline": deviation,
                "timestamp": now * 1000 // Convert to milliseconds
            ])
        }

        isTracking = true
        wasConnected = true
        print("[PosturePlugin] Started headphone motion tracking")
        call.resolve(["success": true])
    }

    /**
     * Stop tracking head orientation
     */
    @objc func stopTracking(_ call: CAPPluginCall) {
        guard #available(iOS 14.0, *) else {
            call.resolve(["success": true])
            return
        }

        motionManager?.stopDeviceMotionUpdates()
        isTracking = false
        print("[PosturePlugin] Stopped headphone motion tracking")
        call.resolve(["success": true])
    }

    /**
     * Capture current orientation as calibration baseline
     * User should be sitting with good posture when this is called
     */
    @objc func calibrate(_ call: CAPPluginCall) {
        guard #available(iOS 14.0, *) else {
            call.reject("Headphone motion requires iOS 14.0 or later")
            return
        }

        guard let manager = motionManager, let motion = manager.deviceMotion else {
            call.reject("No motion data available. Ensure AirPods are connected and tracking is started.")
            return
        }

        let attitude = motion.attitude
        let pitch = attitude.pitch * 180 / .pi
        let roll = attitude.roll * 180 / .pi
        let yaw = attitude.yaw * 180 / .pi

        // Save calibration to UserDefaults
        let calibration: [String: Any] = [
            "pitch": pitch,
            "roll": roll,
            "yaw": yaw,
            "timestamp": Date().timeIntervalSince1970 * 1000
        ]

        if let data = try? JSONSerialization.data(withJSONObject: calibration),
           let jsonString = String(data: data, encoding: .utf8) {
            UserDefaults.standard.set(jsonString, forKey: calibrationKey)
        }

        print("[PosturePlugin] Calibration saved: pitch=\(pitch), roll=\(roll)")
        call.resolve([
            "success": true,
            "baseline": [
                "pitch": pitch,
                "roll": roll,
                "yaw": yaw
            ]
        ])
    }

    /**
     * Get stored calibration baseline
     */
    @objc func getCalibration(_ call: CAPPluginCall) {
        if let baseline = loadCalibration() {
            call.resolve([
                "isCalibrated": true,
                "baseline": [
                    "pitch": baseline.pitch,
                    "roll": baseline.roll,
                    "yaw": baseline.yaw
                ]
            ])
        } else {
            call.resolve([
                "isCalibrated": false
            ])
        }
    }

    /**
     * Clear stored calibration
     */
    @objc func clearCalibration(_ call: CAPPluginCall) {
        UserDefaults.standard.removeObject(forKey: calibrationKey)
        print("[PosturePlugin] Calibration cleared")
        call.resolve(["success": true])
    }

    /**
     * Trigger haptic feedback on the iPhone
     * Uses UIImpactFeedbackGenerator for tactile alerts
     */
    @objc func triggerHaptic(_ call: CAPPluginCall) {
        let style = call.getString("style") ?? "medium"

        DispatchQueue.main.async {
            let generator: UIImpactFeedbackGenerator

            switch style {
            case "light":
                generator = UIImpactFeedbackGenerator(style: .light)
            case "heavy":
                generator = UIImpactFeedbackGenerator(style: .heavy)
            default:
                generator = UIImpactFeedbackGenerator(style: .medium)
            }

            generator.prepare()
            generator.impactOccurred()
        }

        call.resolve(["success": true])
    }

    // MARK: - Private Helpers

    private struct CalibrationBaseline {
        let pitch: Double
        let roll: Double
        let yaw: Double
    }

    private func loadCalibration() -> CalibrationBaseline? {
        guard let jsonString = UserDefaults.standard.string(forKey: calibrationKey),
              let data = jsonString.data(using: .utf8),
              let dict = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let pitch = dict["pitch"] as? Double,
              let roll = dict["roll"] as? Double,
              let yaw = dict["yaw"] as? Double else {
            return nil
        }
        return CalibrationBaseline(pitch: pitch, roll: roll, yaw: yaw)
    }
}

// MARK: - CMHeadphoneMotionManagerDelegate

@available(iOS 14.0, *)
extension PosturePlugin: CMHeadphoneMotionManagerDelegate {
    public func headphoneMotionManagerDidConnect(_ manager: CMHeadphoneMotionManager) {
        print("[PosturePlugin] AirPods connected")
        wasConnected = true
        notifyListeners("deviceConnected", data: [:])
    }

    public func headphoneMotionManagerDidDisconnect(_ manager: CMHeadphoneMotionManager) {
        print("[PosturePlugin] AirPods disconnected")
        if wasConnected {
            notifyListeners("deviceDisconnected", data: [:])
        }
    }
}
