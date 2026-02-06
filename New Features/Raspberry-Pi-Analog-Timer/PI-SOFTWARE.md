# Pi Software Architecture

Python application design for the meditation timer device.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Main Application                      │
│                    (Python 3.11+)                        │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │ UI Renderer │  │ Timer Core  │  │ BLE Service     │ │
│  │ (PyGame)    │  │ (asyncio)   │  │ (bleak/bluez)   │ │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘ │
│         │                │                   │          │
│  ┌──────┴──────┐  ┌──────┴──────┐  ┌────────┴────────┐ │
│  │ GPIO Input  │  │ Local DB    │  │ Sync Queue      │ │
│  │ (gpiozero)  │  │ (SQLite)    │  │ (asyncio)       │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Dependencies

```
# requirements.txt
pygame>=2.5.0          # Display rendering
gpiozero>=2.0          # GPIO handling
bleak>=0.21.0          # BLE GATT server (cross-platform)
aiosqlite>=0.19.0      # Async SQLite
RPi.GPIO>=0.7.1        # Low-level GPIO (gpiozero backend)
```

## Project Structure

```
/home/pi/meditation-timer/
├── main.py                 # Entry point
├── requirements.txt
├── config.py               # Hardware pin mappings, settings
├── /core/
│   ├── timer.py            # Timer state machine
│   ├── session.py          # Session data model
│   └── plan.py             # Planned session model
├── /ui/
│   ├── renderer.py         # PyGame display rendering
│   ├── screens/
│   │   ├── idle.py         # Idle screen (hours display)
│   │   ├── active.py       # Active timer screen
│   │   ├── orb.py          # Pulsating orb mode
│   │   └── completion.py   # Session complete screen
│   └── assets/
│       ├── fonts/          # Typography (match app)
│       └── sounds/         # Bowl chime audio
├── /hardware/
│   ├── button.py           # Start/stop button handler
│   ├── encoder.py          # Rotary encoder handler
│   ├── display.py          # Display brightness control
│   └── audio.py            # Speaker/volume control
├── /bluetooth/
│   ├── gatt_server.py      # BLE GATT service
│   └── sync.py             # Sync protocol implementation
├── /storage/
│   ├── database.py         # SQLite operations
│   └── migrations/         # Schema migrations
└── /tests/
    └── ...                 # Unit tests
```

## State Machine

```
                    ┌─────────┐
                    │  IDLE   │◄──────────────────┐
                    │ (shows  │                   │
                    │  hours) │                   │
                    └────┬────┘                   │
                         │ button press           │
                         ▼                        │
                    ┌─────────┐                   │
                    │ PENDING │                   │
                    │ (breath │                   │
                    │  align) │                   │
                    └────┬────┘                   │
                         │ inhale phase starts    │
                         ▼                        │
                    ┌─────────┐                   │
                    │ ACTIVE  │                   │
                    │ (timer  │                   │
                    │ running)│                   │
                    └────┬────┘                   │
                         │ button press           │
                         │ OR goal reached        │
                         ▼                        │
                    ┌─────────┐                   │
                    │SETTLING │───────────────────┘
                    │ (chime, │    (after fade)
                    │  fade)  │
                    └─────────┘
```

## Data Models

```python
# core/session.py
from dataclasses import dataclass
from typing import Optional
import uuid

@dataclass
class Session:
    """A completed meditation session."""
    uuid: str
    start_time: int          # Unix timestamp ms
    end_time: int            # Unix timestamp ms
    duration_seconds: int
    pose: Optional[str] = None
    discipline: Optional[str] = None
    synced: bool = False     # True once sent to app

    @classmethod
    def create(cls, start_time: int, end_time: int) -> "Session":
        return cls(
            uuid=str(uuid.uuid4()),
            start_time=start_time,
            end_time=end_time,
            duration_seconds=(end_time - start_time) // 1000,
        )


# core/plan.py
@dataclass
class PlannedSession:
    """A session planned in the app, synced to device."""
    date: int                    # Day timestamp
    planned_time: Optional[str]  # "HH:MM" format
    duration: Optional[int]      # Minutes
    title: Optional[str]
    discipline: Optional[str]
    enforce_goal: bool = False
```

## Timer Core

```python
# core/timer.py
import asyncio
from enum import Enum
from typing import Callable, Optional
from dataclasses import dataclass
import time

class TimerState(Enum):
    IDLE = "idle"
    PENDING = "pending"
    ACTIVE = "active"
    SETTLING = "settling"

@dataclass
class TimerContext:
    """Current timer state and data."""
    state: TimerState = TimerState.IDLE
    start_time: Optional[int] = None
    elapsed_seconds: int = 0
    goal_seconds: Optional[int] = None
    breath_phase: float = 0.0  # 0-1, for orb animation

class Timer:
    """Core timer logic with state machine."""

    BREATH_CYCLE_SECONDS = 8  # 4s inhale, 4s exhale

    def __init__(
        self,
        on_state_change: Callable[[TimerContext], None],
        on_session_complete: Callable[[Session], None],
    ):
        self.context = TimerContext()
        self.on_state_change = on_state_change
        self.on_session_complete = on_session_complete
        self._task: Optional[asyncio.Task] = None

    def button_pressed(self):
        """Handle main button press."""
        if self.context.state == TimerState.IDLE:
            self._transition_to_pending()
        elif self.context.state == TimerState.ACTIVE:
            self._transition_to_settling()

    def _transition_to_pending(self):
        self.context.state = TimerState.PENDING
        self.on_state_change(self.context)
        # Start breath alignment - transition to active on next inhale
        self._task = asyncio.create_task(self._pending_loop())

    async def _pending_loop(self):
        """Wait for breath alignment then start."""
        # Simulate breath alignment - wait for inhale phase
        await asyncio.sleep(0.5)  # Brief pause
        self._transition_to_active()

    def _transition_to_active(self):
        self.context.state = TimerState.ACTIVE
        self.context.start_time = int(time.time() * 1000)
        self.context.elapsed_seconds = 0
        self.on_state_change(self.context)
        self._task = asyncio.create_task(self._active_loop())

    async def _active_loop(self):
        """Main timer loop - update elapsed time and breath phase."""
        while self.context.state == TimerState.ACTIVE:
            now = int(time.time() * 1000)
            self.context.elapsed_seconds = (now - self.context.start_time) // 1000

            # Calculate breath phase (0-1 over 8 seconds)
            self.context.breath_phase = (
                (self.context.elapsed_seconds % self.BREATH_CYCLE_SECONDS)
                / self.BREATH_CYCLE_SECONDS
            )

            self.on_state_change(self.context)

            # Check goal
            if (self.context.goal_seconds and
                self.context.elapsed_seconds >= self.context.goal_seconds):
                self._transition_to_settling()
                return

            await asyncio.sleep(0.1)  # 10 FPS update

    def _transition_to_settling(self):
        if self._task:
            self._task.cancel()

        end_time = int(time.time() * 1000)
        session = Session.create(self.context.start_time, end_time)

        self.context.state = TimerState.SETTLING
        self.on_state_change(self.context)

        self.on_session_complete(session)
        self._task = asyncio.create_task(self._settling_loop())

    async def _settling_loop(self):
        """Show completion, play chime, fade back to idle."""
        await asyncio.sleep(5)  # Show completion for 5 seconds
        self._transition_to_idle()

    def _transition_to_idle(self):
        self.context = TimerContext()  # Reset
        self.on_state_change(self.context)
```

## Display Rendering

```python
# ui/renderer.py
import pygame
from core.timer import TimerContext, TimerState

class Renderer:
    """PyGame-based display renderer."""

    # Colors (match app theme)
    BG_COLOR = (18, 18, 18)       # Near black
    TEXT_COLOR = (255, 255, 255)  # White
    SUBTLE_COLOR = (128, 128, 128) # Gray

    def __init__(self, width: int = 480, height: int = 320):
        pygame.init()
        self.screen = pygame.display.set_mode((width, height))
        self.width = width
        self.height = height

        # Load fonts (use system fonts or bundle custom)
        self.font_large = pygame.font.Font(None, 120)
        self.font_medium = pygame.font.Font(None, 48)
        self.font_small = pygame.font.Font(None, 32)

        self.brightness = 1.0

    def render(self, context: TimerContext, total_hours: float, plan: dict = None):
        """Render appropriate screen based on state."""
        self.screen.fill(self.BG_COLOR)

        if context.state == TimerState.IDLE:
            self._render_idle(total_hours, plan)
        elif context.state == TimerState.PENDING:
            self._render_pending()
        elif context.state == TimerState.ACTIVE:
            self._render_active(context)
        elif context.state == TimerState.SETTLING:
            self._render_settling(context, total_hours)

        pygame.display.flip()

    def _render_idle(self, total_hours: float, plan: dict = None):
        """Idle screen - show cumulative hours."""
        hours = int(total_hours)
        minutes = int((total_hours - hours) * 60)
        time_text = f"{hours}h {minutes}m"

        # Large centered time
        text_surface = self.font_large.render(time_text, True, self.TEXT_COLOR)
        text_rect = text_surface.get_rect(center=(self.width // 2, self.height // 2 - 20))
        self.screen.blit(text_surface, text_rect)

        # "Press to begin" indicator
        hint_surface = self.font_small.render("Press to begin", True, self.SUBTLE_COLOR)
        hint_rect = hint_surface.get_rect(center=(self.width // 2, self.height // 2 + 60))
        self.screen.blit(hint_surface, hint_rect)

        # Plan indicator if available
        if plan:
            plan_text = f"{plan.get('duration', 25)} min · {plan.get('time', '')}"
            plan_surface = self.font_small.render(plan_text, True, self.SUBTLE_COLOR)
            plan_rect = plan_surface.get_rect(center=(self.width // 2, self.height - 40))
            self.screen.blit(plan_surface, plan_rect)

    def _render_pending(self):
        """Pending screen - breath alignment."""
        text_surface = self.font_medium.render("Breathe in...", True, self.TEXT_COLOR)
        text_rect = text_surface.get_rect(center=(self.width // 2, self.height // 2))
        self.screen.blit(text_surface, text_rect)

    def _render_active(self, context: TimerContext):
        """Active timer - elapsed time or orb."""
        # Format elapsed time
        minutes = context.elapsed_seconds // 60
        seconds = context.elapsed_seconds % 60
        time_text = f"{minutes:02d}:{seconds:02d}"

        text_surface = self.font_large.render(time_text, True, self.TEXT_COLOR)
        text_rect = text_surface.get_rect(center=(self.width // 2, self.height // 2))
        self.screen.blit(text_surface, text_rect)

    def _render_settling(self, context: TimerContext, total_hours: float):
        """Completion screen - show growth."""
        session_hours = context.elapsed_seconds / 3600
        old_hours = total_hours
        new_hours = total_hours + session_hours

        old_h, old_m = int(old_hours), int((old_hours % 1) * 60)
        new_h, new_m = int(new_hours), int((new_hours % 1) * 60)

        growth_text = f"{old_h}h {old_m}m → {new_h}h {new_m}m"

        text_surface = self.font_medium.render(growth_text, True, self.TEXT_COLOR)
        text_rect = text_surface.get_rect(center=(self.width // 2, self.height // 2))
        self.screen.blit(text_surface, text_rect)

    def set_brightness(self, value: float):
        """Set display brightness (0.0 - 1.0)."""
        self.brightness = max(0.0, min(1.0, value))
        # Hardware brightness control would go here
        # For now, could dim the surface
```

## Breath Simulation (Orb Mode)

```python
# ui/screens/orb.py
import pygame
import math

class OrbRenderer:
    """Pulsating orb animation for breath-aligned meditation."""

    def __init__(self, screen: pygame.Surface):
        self.screen = screen
        self.center = (screen.get_width() // 2, screen.get_height() // 2)
        self.min_radius = 40
        self.max_radius = 120
        self.color = (100, 149, 237)  # Cornflower blue

    def render(self, breath_phase: float):
        """
        Render orb at current breath phase.

        breath_phase: 0.0 to 1.0
          0.0 - 0.5: Inhale (orb expands)
          0.5 - 1.0: Exhale (orb contracts)
        """
        # Calculate radius based on breath phase
        if breath_phase < 0.5:
            # Inhale: expand
            t = breath_phase * 2  # 0 to 1
            t = self._ease_in_out(t)
            radius = self.min_radius + (self.max_radius - self.min_radius) * t
        else:
            # Exhale: contract
            t = (breath_phase - 0.5) * 2  # 0 to 1
            t = self._ease_in_out(t)
            radius = self.max_radius - (self.max_radius - self.min_radius) * t

        # Draw with soft edge (multiple circles with decreasing alpha)
        for i in range(10):
            alpha = 255 - (i * 25)
            r = int(radius + i * 3)
            color = (*self.color, alpha)

            # Create surface with alpha
            surf = pygame.Surface((r * 2, r * 2), pygame.SRCALPHA)
            pygame.draw.circle(surf, color, (r, r), r)
            self.screen.blit(surf, (self.center[0] - r, self.center[1] - r))

    def _ease_in_out(self, t: float) -> float:
        """Smooth easing function."""
        return (1 - math.cos(t * math.pi)) / 2
```

## Hardware Input

```python
# hardware/button.py
from gpiozero import Button
from typing import Callable

class StartButton:
    """Main start/stop button handler."""

    def __init__(self, gpio_pin: int = 17):
        self.button = Button(gpio_pin, pull_up=True, bounce_time=0.1)
        self._on_press: Callable = None

    def set_callback(self, callback: Callable):
        self._on_press = callback
        self.button.when_pressed = self._handle_press

    def _handle_press(self):
        if self._on_press:
            self._on_press()


# hardware/encoder.py
from gpiozero import RotaryEncoder
from typing import Callable

class VolumeEncoder:
    """Rotary encoder for volume control."""

    def __init__(self, clk_pin: int = 27, dt_pin: int = 22):
        self.encoder = RotaryEncoder(clk_pin, dt_pin, max_steps=100)
        self.encoder.steps = 50  # Start at 50%
        self._on_change: Callable = None

    def set_callback(self, callback: Callable[[float], None]):
        """Callback receives value 0.0 - 1.0"""
        self._on_change = callback
        self.encoder.when_rotated = self._handle_rotation

    def _handle_rotation(self):
        value = self.encoder.steps / 100.0
        if self._on_change:
            self._on_change(value)

    @property
    def value(self) -> float:
        return self.encoder.steps / 100.0
```

## Local Storage

```python
# storage/database.py
import aiosqlite
from typing import List, Optional
from core.session import Session
from core.plan import PlannedSession

DATABASE_PATH = "/home/pi/meditation-timer/data/sessions.db"

async def init_database():
    """Create tables if they don't exist."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                uuid TEXT PRIMARY KEY,
                start_time INTEGER NOT NULL,
                end_time INTEGER NOT NULL,
                duration_seconds INTEGER NOT NULL,
                pose TEXT,
                discipline TEXT,
                synced INTEGER DEFAULT 0
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS plans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date INTEGER NOT NULL,
                planned_time TEXT,
                duration INTEGER,
                title TEXT,
                discipline TEXT,
                enforce_goal INTEGER DEFAULT 0
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        """)
        await db.commit()

async def save_session(session: Session):
    """Save a completed session."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute(
            """INSERT INTO sessions
               (uuid, start_time, end_time, duration_seconds, pose, discipline, synced)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (session.uuid, session.start_time, session.end_time,
             session.duration_seconds, session.pose, session.discipline, 0)
        )
        await db.commit()

async def get_unsynced_sessions() -> List[Session]:
    """Get all sessions not yet synced to app."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM sessions WHERE synced = 0"
        ) as cursor:
            rows = await cursor.fetchall()
            return [Session(**dict(row)) for row in rows]

async def mark_sessions_synced(uuids: List[str]):
    """Mark sessions as synced after app confirms receipt."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        placeholders = ",".join("?" * len(uuids))
        await db.execute(
            f"UPDATE sessions SET synced = 1 WHERE uuid IN ({placeholders})",
            uuids
        )
        await db.commit()

async def get_total_seconds() -> int:
    """Get total meditation seconds (for display when offline)."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        async with db.execute(
            "SELECT SUM(duration_seconds) FROM sessions"
        ) as cursor:
            result = await cursor.fetchone()
            return result[0] or 0

async def set_total_seconds(seconds: int):
    """Store authoritative total from app."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES ('total_seconds', ?)",
            (str(seconds),)
        )
        await db.commit()
```

## Main Entry Point

```python
# main.py
import asyncio
from core.timer import Timer, TimerContext
from core.session import Session
from ui.renderer import Renderer
from hardware.button import StartButton
from hardware.encoder import VolumeEncoder
from storage import database
from bluetooth.gatt_server import start_gatt_server

class MeditationTimerApp:
    """Main application coordinator."""

    def __init__(self):
        self.renderer = Renderer()
        self.button = StartButton()
        self.volume_encoder = VolumeEncoder()
        self.timer = Timer(
            on_state_change=self._on_state_change,
            on_session_complete=self._on_session_complete
        )
        self.total_hours = 0.0
        self.current_plan = None

    async def run(self):
        """Main application loop."""
        # Initialize database
        await database.init_database()

        # Load total hours
        total_seconds = await database.get_total_seconds()
        self.total_hours = total_seconds / 3600

        # Set up button callback
        self.button.set_callback(self.timer.button_pressed)

        # Set up volume callback
        self.volume_encoder.set_callback(self._on_volume_change)

        # Start BLE server in background
        asyncio.create_task(start_gatt_server(self))

        # Initial render
        self._render()

        # Main loop
        while True:
            await asyncio.sleep(0.016)  # ~60 FPS

    def _on_state_change(self, context: TimerContext):
        self._render()

    def _on_session_complete(self, session: Session):
        # Save to local database
        asyncio.create_task(database.save_session(session))

        # Update local total
        self.total_hours += session.duration_seconds / 3600

    def _on_volume_change(self, value: float):
        # Adjust audio volume
        pass  # Implement with audio subsystem

    def _render(self):
        self.renderer.render(
            self.timer.context,
            self.total_hours,
            self.current_plan
        )

if __name__ == "__main__":
    app = MeditationTimerApp()
    asyncio.run(app.run())
```

## Running on Boot

Create a systemd service to start the timer on boot:

```ini
# /etc/systemd/system/meditation-timer.service
[Unit]
Description=Meditation Timer
After=multi-user.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/meditation-timer
ExecStart=/usr/bin/python3 main.py
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable with:

```bash
sudo systemctl enable meditation-timer
sudo systemctl start meditation-timer
```
