#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// This file is required for Capacitor to recognize the Swift plugin.
// The actual implementation is in MeditationLockPlugin.swift

CAP_PLUGIN(MeditationLockPlugin, "MeditationLock",
    CAP_PLUGIN_METHOD(requestAuthorization, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getAuthorizationStatus, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(showAppPicker, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(blockApps, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(unblockApps, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getBlockedApps, CAPPluginReturnPromise);
)
