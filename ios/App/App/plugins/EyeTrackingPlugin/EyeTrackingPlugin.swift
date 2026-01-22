/**
 * EyeTrackingPlugin - ARKit Face Tracking for Eye Gaze Detection
 *
 * Uses ARFaceTrackingConfiguration to track eye position and convert
 * lookAtPoint to screen coordinates. Emits gaze updates at ~30fps.
 *
 * Requirements:
 * - iPhone X or later (TrueDepth camera)
 * - iOS 11.0+ for ARKit face tracking
 */

import Foundation
import Capacitor
import ARKit
import UIKit

@objc(EyeTrackingPlugin)
public class EyeTrackingPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "EyeTrackingPlugin"
    public let jsName = "EyeTracking"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isSupported", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startTracking", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopTracking", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getCalibrationStatus", returnType: CAPPluginReturnPromise)
    ]

    private var arSession: ARSession?
    private var lastEmitTime: TimeInterval = 0
    private let minEmitInterval: TimeInterval = 1.0 / 30.0 // 30fps throttle

    // Screen dimensions for coordinate conversion
    private var screenWidth: CGFloat = 0
    private var screenHeight: CGFloat = 0

    // Smoothing filter for gaze position
    private var smoothedGazeX: CGFloat = 0
    private var smoothedGazeY: CGFloat = 0
    private let smoothingFactor: CGFloat = 0.3 // Lower = more smoothing

    /**
     * Check if face tracking is supported on this device
     */
    @objc func isSupported(_ call: CAPPluginCall) {
        if #available(iOS 11.0, *) {
            let supported = ARFaceTrackingConfiguration.isSupported
            call.resolve(["supported": supported])
        } else {
            call.resolve(["supported": false])
        }
    }

    /**
     * Start ARKit face tracking session
     */
    @objc func startTracking(_ call: CAPPluginCall) {
        guard #available(iOS 11.0, *) else {
            call.reject("ARKit requires iOS 11.0 or later")
            return
        }

        guard ARFaceTrackingConfiguration.isSupported else {
            call.reject("Face tracking not supported on this device")
            return
        }

        DispatchQueue.main.async {
            // Get screen dimensions
            self.screenWidth = UIScreen.main.bounds.width
            self.screenHeight = UIScreen.main.bounds.height

            // Initialize smoothed position to center
            self.smoothedGazeX = self.screenWidth / 2
            self.smoothedGazeY = self.screenHeight / 2

            // Create ARKit configuration
            let config = ARFaceTrackingConfiguration()
            config.isLightEstimationEnabled = false // Battery optimization
            if #available(iOS 13.0, *) {
                config.maximumNumberOfTrackedFaces = 1 // Only track one face
            }

            // Create and configure session
            self.arSession = ARSession()
            self.arSession?.delegate = self

            // Run session
            self.arSession?.run(config)

            print("[EyeTracking] Started face tracking session")
            call.resolve(["success": true])
        }
    }

    /**
     * Stop ARKit face tracking session
     */
    @objc func stopTracking(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.arSession?.pause()
            self.arSession = nil

            print("[EyeTracking] Stopped face tracking session")
            call.resolve(["success": true])
        }
    }

    /**
     * Get calibration status (placeholder for future calibration feature)
     */
    @objc func getCalibrationStatus(_ call: CAPPluginCall) {
        call.resolve([
            "isCalibrated": true, // Auto-calibrated via ARKit
            "accuracy": "standard"
        ])
    }

    // MARK: - Coordinate Conversion

    /**
     * Convert ARKit lookAtPoint to screen coordinates
     *
     * The lookAtPoint is in the face coordinate space, pointing from
     * between the eyes toward where the user is looking.
     */
    private func convertLookAtPointToScreen(
        lookAtPoint: simd_float3,
        faceTransform: simd_float4x4
    ) -> CGPoint {
        // The lookAtPoint gives a direction vector in face-local coordinates
        // We need to estimate where on the screen the user is looking

        // Extract the look direction (normalized)
        let lookDirection = simd_normalize(lookAtPoint)

        // The x component corresponds to horizontal gaze (-1 = far left, +1 = far right)
        // The y component corresponds to vertical gaze (-1 = down, +1 = up)
        // Note: ARKit face coordinate system has +x to the left of the face

        // Map look direction to screen coordinates
        // Typical range for lookAtPoint.x is roughly -0.5 to 0.5 for comfortable viewing
        let gazeRangeX: Float = 0.3 // Adjustable: smaller = more sensitive
        let gazeRangeY: Float = 0.2

        // Clamp and normalize to 0-1 range
        let normalizedX = ((-lookDirection.x / gazeRangeX) + 1) / 2
        let normalizedY = ((-lookDirection.y / gazeRangeY) + 1) / 2

        // Convert to screen coordinates
        let screenX = CGFloat(normalizedX) * screenWidth
        let screenY = CGFloat(normalizedY) * screenHeight

        // Clamp to screen bounds
        return CGPoint(
            x: max(0, min(screenWidth, screenX)),
            y: max(0, min(screenHeight, screenY))
        )
    }

    /**
     * Apply exponential smoothing to gaze position
     */
    private func smoothGazePosition(_ rawPoint: CGPoint) -> CGPoint {
        smoothedGazeX = smoothedGazeX + smoothingFactor * (rawPoint.x - smoothedGazeX)
        smoothedGazeY = smoothedGazeY + smoothingFactor * (rawPoint.y - smoothedGazeY)
        return CGPoint(x: smoothedGazeX, y: smoothedGazeY)
    }
}

// MARK: - ARSessionDelegate

@available(iOS 11.0, *)
extension EyeTrackingPlugin: ARSessionDelegate {

    public func session(_ session: ARSession, didUpdate anchors: [ARAnchor]) {
        // Throttle to ~30fps
        let now = Date().timeIntervalSince1970
        guard now - lastEmitTime >= minEmitInterval else { return }
        lastEmitTime = now

        // Find face anchor
        guard let faceAnchor = anchors.first(where: { $0 is ARFaceAnchor }) as? ARFaceAnchor else {
            return
        }

        // Get the look at point (where eyes are focused)
        let lookAtPoint = faceAnchor.lookAtPoint

        // Convert to screen coordinates
        let rawScreenPoint = convertLookAtPointToScreen(
            lookAtPoint: lookAtPoint,
            faceTransform: faceAnchor.transform
        )

        // Apply smoothing
        let smoothedPoint = smoothGazePosition(rawScreenPoint)

        // Calculate tracking quality based on face visibility
        let blendShapes = faceAnchor.blendShapes
        let leftEyeBlink = blendShapes[.eyeBlinkLeft]?.floatValue ?? 0
        let rightEyeBlink = blendShapes[.eyeBlinkRight]?.floatValue ?? 0
        let avgBlink = (leftEyeBlink + rightEyeBlink) / 2

        // Quality decreases when eyes are closed
        let trackingQuality = 1.0 - Double(avgBlink)

        // Emit gaze update to JavaScript
        notifyListeners("gazeUpdate", data: [
            "x": smoothedPoint.x,
            "y": smoothedPoint.y,
            "timestamp": now * 1000, // Convert to milliseconds
            "quality": trackingQuality,
            "rawX": rawScreenPoint.x,
            "rawY": rawScreenPoint.y
        ])
    }

    public func session(_ session: ARSession, didFailWithError error: Error) {
        print("[EyeTracking] Session failed: \(error.localizedDescription)")
        notifyListeners("trackingError", data: [
            "error": error.localizedDescription
        ])
    }

    public func sessionWasInterrupted(_ session: ARSession) {
        print("[EyeTracking] Session interrupted")
        notifyListeners("trackingInterrupted", data: [:])
    }

    public func sessionInterruptionEnded(_ session: ARSession) {
        print("[EyeTracking] Session interruption ended")
        notifyListeners("trackingResumed", data: [:])
    }
}
