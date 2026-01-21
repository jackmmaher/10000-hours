/**
 * Meditation Band Firmware
 *
 * A wearable meditation timer that syncs with the 10000 Hours app.
 * Squeeze the module sides to start/stop sessions.
 * Haptic feedback confirms actions and signals completion.
 *
 * Hardware:
 * - Seeed XIAO ESP32-C3
 * - 2x TTP223 capacitive touch sensors
 * - WS2812B Mini LED
 * - 8mm coin vibration motor
 * - 100-150mAh LiPo battery
 */

#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <FastLED.h>
#include <ArduinoJson.h>
#include <Preferences.h>

// =============================================================================
// PIN DEFINITIONS
// =============================================================================

#define PIN_TOUCH_LEFT    2   // GPIO2 - Left touch sensor
#define PIN_TOUCH_RIGHT   3   // GPIO3 - Right touch sensor
#define PIN_LED_DATA      4   // GPIO4 - WS2812B data
#define PIN_MOTOR         5   // GPIO5 - Vibration motor (via MOSFET)

// =============================================================================
// CONSTANTS
// =============================================================================

// BLE UUIDs (same as Pi timer for app compatibility)
#define SERVICE_UUID           "10000001-0000-1000-8000-00805f9b34fb"
#define CHAR_HOURS_UUID        "10000002-0000-1000-8000-00805f9b34fb"
#define CHAR_STATUS_UUID       "10000003-0000-1000-8000-00805f9b34fb"
#define CHAR_SESSIONS_UUID     "10000004-0000-1000-8000-00805f9b34fb"
#define CHAR_PLANS_UUID        "10000005-0000-1000-8000-00805f9b34fb"
#define CHAR_ACK_UUID          "10000006-0000-1000-8000-00805f9b34fb"
#define CHAR_TOTAL_UUID        "10000007-0000-1000-8000-00805f9b34fb"

// Timing
#define BREATH_CYCLE_MS        8000   // 8 second breath cycle
#define DEBOUNCE_MS            50     // Touch debounce
#define SQUEEZE_HOLD_MS        200    // How long squeeze must be held
#define MOTOR_PULSE_MS         150    // Single haptic pulse duration
#define MOTOR_PAUSE_MS         200    // Pause between pulses
#define COMPLETION_GLOW_MS     30000  // How long LED glows after completion
#define GOAL_APPROACH_MS       120000 // 2 minutes before goal, start brightening

// LED
#define NUM_LEDS               1
#define LED_BRIGHTNESS_MAX     50     // Max brightness (0-255)
#define LED_BRIGHTNESS_MIN     5      // Min brightness during breath

// Storage
#define MAX_PENDING_SESSIONS   50
#define PREFS_NAMESPACE        "medband"

// =============================================================================
// STATE MACHINE
// =============================================================================

enum class State : uint8_t {
  IDLE = 0,      // Waiting, worn on wrist
  PENDING = 1,   // Squeeze detected, confirming
  ACTIVE = 2,    // Session running
  SETTLING = 3   // Session complete, showing result
};

// =============================================================================
// GLOBAL STATE
// =============================================================================

State currentState = State::IDLE;
uint32_t sessionStartTime = 0;
uint32_t sessionDuration = 0;
uint32_t totalSeconds = 0;
uint32_t goalDuration = 0;          // If > 0, session has a goal
bool goalReached = false;

// Touch state
bool lastSqueezeState = false;
uint32_t squeezeStartTime = 0;

// LED
CRGB leds[NUM_LEDS];
uint32_t lastLedUpdate = 0;

// BLE
BLEServer* pServer = nullptr;
BLECharacteristic* pHoursChar = nullptr;
BLECharacteristic* pStatusChar = nullptr;
BLECharacteristic* pSessionsChar = nullptr;
BLECharacteristic* pPlansChar = nullptr;
BLECharacteristic* pAckChar = nullptr;
BLECharacteristic* pTotalChar = nullptr;
bool deviceConnected = false;

// Storage
Preferences preferences;

// Session storage (simple in-memory + flash)
struct Session {
  char uuid[37];
  uint32_t startTime;
  uint32_t endTime;
  uint32_t durationSeconds;
  bool synced;
};

Session pendingSessions[MAX_PENDING_SESSIONS];
int pendingSessionCount = 0;

// Plan storage
struct Plan {
  uint32_t date;
  uint16_t durationMinutes;
  bool enforceGoal;
  bool active;
};

Plan todaysPlan = {0, 0, false, false};

// =============================================================================
// FORWARD DECLARATIONS
// =============================================================================

void setupBLE();
void setupLED();
void setupPins();
void loadFromFlash();
void saveToFlash();
void handleTouch();
void updateLED();
void updateBLE();
void startSession();
void endSession();
void completeWithGoal();
void pulseMotor(int count);
void breatheLED();
void glowLED();
void offLED();
String generateUUID();
void addPendingSession(uint32_t start, uint32_t end, uint32_t duration);
String getPendingSessionsJSON();
void markSessionsSynced(const char* json);
void storePlans(const char* json);
void storeTotalHours(uint32_t total);

// =============================================================================
// BLE CALLBACKS
// =============================================================================

class ServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
    Serial.println("BLE client connected");
  }

  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
    Serial.println("BLE client disconnected");
    // Restart advertising
    BLEDevice::startAdvertising();
  }
};

class PlansCallback : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* pChar) {
    std::string value = pChar->getValue();
    if (value.length() > 0) {
      storePlans(value.c_str());
    }
  }
};

class AckCallback : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* pChar) {
    std::string value = pChar->getValue();
    if (value.length() > 0) {
      markSessionsSynced(value.c_str());
    }
  }
};

class TotalCallback : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* pChar) {
    std::string value = pChar->getValue();
    if (value.length() >= 4) {
      uint32_t total;
      memcpy(&total, value.data(), 4);
      storeTotalHours(total);
    }
  }
};

// =============================================================================
// SETUP
// =============================================================================

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("Meditation Band starting...");

  setupPins();
  setupLED();
  loadFromFlash();
  setupBLE();

  Serial.println("Ready. Squeeze to start meditation.");
}

void setupPins() {
  pinMode(PIN_TOUCH_LEFT, INPUT);
  pinMode(PIN_TOUCH_RIGHT, INPUT);
  pinMode(PIN_MOTOR, OUTPUT);
  digitalWrite(PIN_MOTOR, LOW);
}

void setupLED() {
  FastLED.addLeds<WS2812B, PIN_LED_DATA, GRB>(leds, NUM_LEDS);
  FastLED.setBrightness(LED_BRIGHTNESS_MAX);
  leds[0] = CRGB::Black;
  FastLED.show();
}

void setupBLE() {
  BLEDevice::init("Meditation Band");
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new ServerCallbacks());

  BLEService* pService = pServer->createService(SERVICE_UUID);

  // Cumulative hours (read)
  pHoursChar = pService->createCharacteristic(
    CHAR_HOURS_UUID,
    BLECharacteristic::PROPERTY_READ
  );

  // Device status (read + notify)
  pStatusChar = pService->createCharacteristic(
    CHAR_STATUS_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
  );
  pStatusChar->addDescriptor(new BLE2902());

  // Pending sessions (read)
  pSessionsChar = pService->createCharacteristic(
    CHAR_SESSIONS_UUID,
    BLECharacteristic::PROPERTY_READ
  );

  // Planned sessions (write)
  pPlansChar = pService->createCharacteristic(
    CHAR_PLANS_UUID,
    BLECharacteristic::PROPERTY_WRITE
  );
  pPlansChar->setCallbacks(new PlansCallback());

  // Sync acknowledgment (write)
  pAckChar = pService->createCharacteristic(
    CHAR_ACK_UUID,
    BLECharacteristic::PROPERTY_WRITE
  );
  pAckChar->setCallbacks(new AckCallback());

  // Total hours update (write)
  pTotalChar = pService->createCharacteristic(
    CHAR_TOTAL_UUID,
    BLECharacteristic::PROPERTY_WRITE
  );
  pTotalChar->setCallbacks(new TotalCallback());

  pService->start();

  // Start advertising
  BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();

  Serial.println("BLE advertising started");
}

// =============================================================================
// MAIN LOOP
// =============================================================================

void loop() {
  handleTouch();
  updateLED();
  updateBLE();

  // Small delay to prevent tight loop
  delay(10);
}

// =============================================================================
// TOUCH HANDLING
// =============================================================================

void handleTouch() {
  bool leftPressed = digitalRead(PIN_TOUCH_LEFT) == HIGH;
  bool rightPressed = digitalRead(PIN_TOUCH_RIGHT) == HIGH;
  bool squeezing = leftPressed && rightPressed;

  // Detect squeeze start
  if (squeezing && !lastSqueezeState) {
    squeezeStartTime = millis();
  }

  // Detect squeeze hold (debounced gesture)
  if (squeezing && lastSqueezeState) {
    uint32_t holdDuration = millis() - squeezeStartTime;

    if (holdDuration >= SQUEEZE_HOLD_MS) {
      // Valid squeeze gesture detected
      switch (currentState) {
        case State::IDLE:
          startSession();
          break;

        case State::ACTIVE:
          endSession();
          break;

        case State::SETTLING:
          // Acknowledge completion, return to idle
          currentState = State::IDLE;
          offLED();
          break;

        default:
          break;
      }

      // Reset to prevent repeat triggers
      squeezeStartTime = millis() + 1000; // Prevent re-trigger for 1s
    }
  }

  lastSqueezeState = squeezing;
}

// =============================================================================
// SESSION CONTROL
// =============================================================================

void startSession() {
  Serial.println("Starting session");

  currentState = State::ACTIVE;
  sessionStartTime = millis();
  sessionDuration = 0;
  goalReached = false;

  // Check if there's a goal from today's plan
  if (todaysPlan.active && todaysPlan.durationMinutes > 0) {
    goalDuration = todaysPlan.durationMinutes * 60 * 1000; // Convert to ms
  } else {
    goalDuration = 0;
  }

  // Single haptic pulse to confirm start
  pulseMotor(1);

  // Brief LED flash
  leds[0] = CRGB::White;
  FastLED.show();
  delay(100);

  // Update BLE status
  uint8_t status = (uint8_t)State::ACTIVE;
  pStatusChar->setValue(&status, 1);
  if (deviceConnected) {
    pStatusChar->notify();
  }
}

void endSession() {
  Serial.println("Ending session");

  uint32_t endTime = millis();
  sessionDuration = endTime - sessionStartTime;

  // Only save if session was at least 10 seconds
  if (sessionDuration >= 10000) {
    uint32_t durationSeconds = sessionDuration / 1000;

    // Add to pending sessions
    addPendingSession(
      sessionStartTime / 1000,  // Unix timestamp approximation
      endTime / 1000,
      durationSeconds
    );

    // Update local total
    totalSeconds += durationSeconds;
    saveToFlash();
  }

  // Three haptic pulses to signal completion
  pulseMotor(3);

  // Enter settling state
  currentState = State::SETTLING;

  // Update BLE status
  uint8_t status = (uint8_t)State::SETTLING;
  pStatusChar->setValue(&status, 1);
  if (deviceConnected) {
    pStatusChar->notify();
  }

  // Start completion glow
  leds[0] = CRGB::White;
  FastLED.setBrightness(LED_BRIGHTNESS_MAX);
  FastLED.show();
}

void completeWithGoal() {
  Serial.println("Goal reached!");
  goalReached = true;

  // Three haptic pulses
  pulseMotor(3);

  // If enforceGoal is true, auto-end the session
  if (todaysPlan.enforceGoal) {
    endSession();
  }
  // Otherwise, just signal and keep running
}

// =============================================================================
// HAPTIC FEEDBACK
// =============================================================================

void pulseMotor(int count) {
  for (int i = 0; i < count; i++) {
    digitalWrite(PIN_MOTOR, HIGH);
    delay(MOTOR_PULSE_MS);
    digitalWrite(PIN_MOTOR, LOW);

    if (i < count - 1) {
      delay(MOTOR_PAUSE_MS);
    }
  }
}

// =============================================================================
// LED CONTROL
// =============================================================================

void updateLED() {
  uint32_t now = millis();

  switch (currentState) {
    case State::IDLE:
      // LED off when idle (worn as bracelet)
      if (leds[0] != CRGB::Black) {
        leds[0] = CRGB::Black;
        FastLED.show();
      }
      break;

    case State::ACTIVE:
      breatheLED();

      // Check for goal approach / completion
      if (goalDuration > 0 && !goalReached) {
        uint32_t elapsed = now - sessionStartTime;

        if (elapsed >= goalDuration) {
          completeWithGoal();
        }
      }
      break;

    case State::SETTLING:
      // Glow for COMPLETION_GLOW_MS, then fade and return to idle
      {
        static uint32_t settlingStart = 0;
        if (settlingStart == 0) {
          settlingStart = now;
        }

        uint32_t elapsed = now - settlingStart;

        if (elapsed < COMPLETION_GLOW_MS) {
          // Steady glow, maybe slight fade toward end
          uint8_t brightness = LED_BRIGHTNESS_MAX;
          if (elapsed > COMPLETION_GLOW_MS - 5000) {
            // Fade in last 5 seconds
            brightness = map(elapsed, COMPLETION_GLOW_MS - 5000, COMPLETION_GLOW_MS,
                           LED_BRIGHTNESS_MAX, 0);
          }
          leds[0] = CRGB::White;
          FastLED.setBrightness(brightness);
          FastLED.show();
        } else {
          // Return to idle
          currentState = State::IDLE;
          settlingStart = 0;
          offLED();

          // Update BLE status
          uint8_t status = (uint8_t)State::IDLE;
          pStatusChar->setValue(&status, 1);
          if (deviceConnected) {
            pStatusChar->notify();
          }
        }
      }
      break;

    default:
      break;
  }
}

void breatheLED() {
  // Sinusoidal breath pattern over BREATH_CYCLE_MS
  uint32_t now = millis();
  uint32_t elapsed = now - sessionStartTime;
  float phase = (float)(elapsed % BREATH_CYCLE_MS) / BREATH_CYCLE_MS;

  // Sine wave: 0 -> 1 -> 0 over one cycle
  float breathValue = (sin(phase * 2 * PI - PI / 2) + 1) / 2;

  // Map to brightness range
  uint8_t brightness = LED_BRIGHTNESS_MIN +
                       (uint8_t)(breathValue * (LED_BRIGHTNESS_MAX - LED_BRIGHTNESS_MIN));

  // If approaching goal, increase base brightness
  if (goalDuration > 0 && !goalReached) {
    uint32_t elapsedMs = now - sessionStartTime;
    if (goalDuration > GOAL_APPROACH_MS && elapsedMs > goalDuration - GOAL_APPROACH_MS) {
      // In the last 2 minutes, gradually increase brightness
      float approachProgress = (float)(elapsedMs - (goalDuration - GOAL_APPROACH_MS)) / GOAL_APPROACH_MS;
      brightness = brightness + (uint8_t)(approachProgress * (255 - brightness) * 0.5);
    }
  }

  // Soft white/warm color
  leds[0] = CRGB(brightness, brightness, (uint8_t)(brightness * 0.9));
  FastLED.setBrightness(255); // Use color values directly
  FastLED.show();
}

void glowLED() {
  leds[0] = CRGB::White;
  FastLED.setBrightness(LED_BRIGHTNESS_MAX);
  FastLED.show();
}

void offLED() {
  leds[0] = CRGB::Black;
  FastLED.show();
}

// =============================================================================
// BLE UPDATES
// =============================================================================

void updateBLE() {
  // Update hours characteristic
  pHoursChar->setValue((uint8_t*)&totalSeconds, 4);

  // Update sessions characteristic
  String sessionsJson = getPendingSessionsJSON();
  pSessionsChar->setValue(sessionsJson.c_str());
}

// =============================================================================
// SESSION STORAGE
// =============================================================================

void addPendingSession(uint32_t start, uint32_t end, uint32_t duration) {
  if (pendingSessionCount >= MAX_PENDING_SESSIONS) {
    // Shift array, dropping oldest
    for (int i = 0; i < MAX_PENDING_SESSIONS - 1; i++) {
      pendingSessions[i] = pendingSessions[i + 1];
    }
    pendingSessionCount = MAX_PENDING_SESSIONS - 1;
  }

  Session& session = pendingSessions[pendingSessionCount];

  // Generate UUID
  String uuid = generateUUID();
  strncpy(session.uuid, uuid.c_str(), 36);
  session.uuid[36] = '\0';

  session.startTime = start;
  session.endTime = end;
  session.durationSeconds = duration;
  session.synced = false;

  pendingSessionCount++;

  Serial.printf("Session added: %s, duration %d seconds\n", session.uuid, duration);

  saveToFlash();
}

String getPendingSessionsJSON() {
  JsonDocument doc;
  JsonArray arr = doc.to<JsonArray>();

  for (int i = 0; i < pendingSessionCount; i++) {
    if (!pendingSessions[i].synced) {
      JsonObject obj = arr.add<JsonObject>();
      obj["uuid"] = pendingSessions[i].uuid;
      obj["startTime"] = (uint64_t)pendingSessions[i].startTime * 1000; // Convert to ms
      obj["endTime"] = (uint64_t)pendingSessions[i].endTime * 1000;
      obj["durationSeconds"] = pendingSessions[i].durationSeconds;
    }
  }

  String output;
  serializeJson(doc, output);
  return output;
}

void markSessionsSynced(const char* json) {
  JsonDocument doc;
  DeserializationError error = deserializeJson(doc, json);

  if (error) {
    Serial.println("Failed to parse sync ack JSON");
    return;
  }

  JsonArray arr = doc.as<JsonArray>();

  for (JsonVariant v : arr) {
    const char* uuid = v.as<const char*>();

    for (int i = 0; i < pendingSessionCount; i++) {
      if (strcmp(pendingSessions[i].uuid, uuid) == 0) {
        pendingSessions[i].synced = true;
        Serial.printf("Session marked synced: %s\n", uuid);
        break;
      }
    }
  }

  // Clean up synced sessions
  int writeIndex = 0;
  for (int i = 0; i < pendingSessionCount; i++) {
    if (!pendingSessions[i].synced) {
      if (writeIndex != i) {
        pendingSessions[writeIndex] = pendingSessions[i];
      }
      writeIndex++;
    }
  }
  pendingSessionCount = writeIndex;

  saveToFlash();
}

// =============================================================================
// PLAN STORAGE
// =============================================================================

void storePlans(const char* json) {
  JsonDocument doc;
  DeserializationError error = deserializeJson(doc, json);

  if (error) {
    Serial.println("Failed to parse plans JSON");
    return;
  }

  JsonArray arr = doc.as<JsonArray>();

  // For simplicity, just take the first plan
  if (arr.size() > 0) {
    JsonObject plan = arr[0];

    todaysPlan.date = plan["date"] | 0;
    todaysPlan.durationMinutes = plan["duration"] | 0;
    todaysPlan.enforceGoal = plan["enforceGoal"] | false;
    todaysPlan.active = true;

    Serial.printf("Plan received: %d minutes, enforce=%d\n",
                  todaysPlan.durationMinutes, todaysPlan.enforceGoal);
  } else {
    todaysPlan.active = false;
  }

  saveToFlash();
}

void storeTotalHours(uint32_t total) {
  totalSeconds = total;
  saveToFlash();
  Serial.printf("Total hours updated: %d seconds\n", total);
}

// =============================================================================
// FLASH STORAGE
// =============================================================================

void loadFromFlash() {
  preferences.begin(PREFS_NAMESPACE, true); // Read-only

  totalSeconds = preferences.getUInt("totalSec", 0);
  pendingSessionCount = preferences.getInt("pendingCnt", 0);

  if (pendingSessionCount > 0 && pendingSessionCount <= MAX_PENDING_SESSIONS) {
    preferences.getBytes("sessions", pendingSessions,
                        sizeof(Session) * pendingSessionCount);
  } else {
    pendingSessionCount = 0;
  }

  preferences.end();

  Serial.printf("Loaded: %d total seconds, %d pending sessions\n",
                totalSeconds, pendingSessionCount);
}

void saveToFlash() {
  preferences.begin(PREFS_NAMESPACE, false); // Read-write

  preferences.putUInt("totalSec", totalSeconds);
  preferences.putInt("pendingCnt", pendingSessionCount);

  if (pendingSessionCount > 0) {
    preferences.putBytes("sessions", pendingSessions,
                        sizeof(Session) * pendingSessionCount);
  }

  preferences.end();
}

// =============================================================================
// UTILITIES
// =============================================================================

String generateUUID() {
  // Simple pseudo-random UUID v4
  // In production, use proper random source
  char uuid[37];

  uint32_t r1 = esp_random();
  uint32_t r2 = esp_random();
  uint32_t r3 = esp_random();
  uint32_t r4 = esp_random();

  snprintf(uuid, sizeof(uuid),
           "%08x-%04x-4%03x-%04x-%012llx",
           r1,
           (uint16_t)(r2 >> 16),
           (uint16_t)(r2 & 0x0FFF),
           (uint16_t)((r3 & 0x3FFF) | 0x8000),
           ((uint64_t)(r3 >> 16) << 32) | r4);

  return String(uuid);
}
