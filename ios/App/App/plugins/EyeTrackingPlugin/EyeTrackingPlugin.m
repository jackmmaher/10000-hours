/**
 * EyeTrackingPlugin - Objective-C Bridge
 *
 * Registers the Swift plugin methods with Capacitor.
 */

#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(EyeTrackingPlugin, "EyeTracking",
    CAP_PLUGIN_METHOD(isSupported, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(startTracking, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(stopTracking, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getCalibrationStatus, CAPPluginReturnPromise);
)
