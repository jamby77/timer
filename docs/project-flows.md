# Timer Application Project Flows

## 1. Application Architecture Overview

```mermaid
graph TB
    subgraph "Next.js App Structure"
        A[layout.tsx] --> B[TimerProvider]
        A --> C[ThemeProvider]
        A --> D[Navigation]
        A --> E[Main Content]
        
        F[page.tsx] --> G[Body Component]
        H[configure/page.tsx] --> I[Configure Page]
    end
    
    subgraph "Context Layer"
        B --> J[TimerContext]
        J --> K[Timer Registration]
        J --> L[Active Timer State]
    end
    
    subgraph "Core Components"
        G --> M[Timer Display Components]
        I --> N[Configuration Components]
        D --> O[Navigation Logic]
    end
    
    subgraph "Timer Types"
        M --> P[Timer]
        M --> Q[Stopwatch]
        M --> R[Interval]
        M --> S[WorkRest]
        M --> T[ComplexTimer]
    end
    
    subgraph "Hooks & Logic"
        P --> U[useTimer]
        Q --> V[useStopwatch]
        R --> W[useIntervalTimer]
        S --> X[useWorkRestTimer]
        T --> Y[useComplexTimer]
    end
    
    subgraph "Storage Layer"
        N --> Z[localStorage]
        Z --> AA[Timer Configs]
        Z --> BB[Recent Timers]
        Z --> CC[Presets]
    end
```

## 2. User Flow: Timer Creation and Execution

```mermaid
flowchart TD
    A[User Accesses App] --> B{Has Timer ID?}
    B -->|No| C[Redirect to /configure]
    B -->|Yes| D[Load Timer Config]
    
    C --> E[Configure Page]
    E --> F{Select Timer Type}
    F -->|Countdown| G[Countdown Config]
    F -->|Stopwatch| H[Stopwatch Config]
    F -->|Interval| I[Interval Config]
    F -->|WorkRest| J[WorkRest Config]
    F -->|Complex| K[Complex Config Page]
    
    G --> L[Configure Settings]
    H --> L
    I --> L
    J --> L
    K --> L
    
    L --> M[Save Configuration]
    M --> N[Generate Timer ID]
    N --> O[Store in localStorage]
    O --> P[Add to Recent Timers]
    P --> Q[Navigate to /?id={timerId}]
    
    D --> R{Config Found?}
    R -->|No| C
    R -->|Yes| S[Display Timer Component]
    
    S --> T[Timer Component Renders]
    T --> U[Initialize Timer Hook]
    U --> V[Register with TimerContext]
    V --> W[Hide Navigation]
    W --> X[User Can Control Timer]
    
    X --> Y[Timer Actions]
    Y --> Z[Start/Pause/Reset]
    Y --> AA[Timer Updates]
    AA --> BB[State Changes]
    BB --> CC[Context Updates]
    CC --> DD[UI Updates]
```

## 3. Timer State Management Flow

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Running: start()
    Running --> Paused: pause()
    Paused --> Running: start()
    Running --> Completed: timer expires
    Paused --> Completed: timer expires
    Completed --> Idle: reset()
    Running --> Idle: reset()
    Paused --> Idle: reset()
    
    Running --> Running: tick events
    note right of Running
        Updates time display
        Triggers sound effects
        Updates progress indicators
    end note
    
    Completed --> Running: restart()
    note right of Completed
        Shows completion message
        Plays finish sound
        Allows restart
    end note
```

## 4. Component Data Flow

```mermaid
graph LR
    subgraph "Configuration Flow"
        A[TimerTypeSelector] --> B[TimerConfigForm]
        B --> C[Form Validation]
        C --> D[Config Object]
        D --> E[Storage Manager]
        E --> F[localStorage]
    end
    
    subgraph "Display Flow"
        G[URL Params] --> H[Body Component]
        H --> I[Storage Lookup]
        I --> J[Timer Config]
        J --> K[Component Router]
        K --> L[Specific Timer Component]
    end
    
    subgraph "Timer Operation Flow"
        L --> M[Timer Hook]
        M --> N[Timer Class/Manager]
        N --> O[State Updates]
        O --> P[Context Updates]
        P --> Q[UI Re-renders]
    end
    
    subgraph "Context Integration"
        R[TimerContext] --> S[Active Timer Tracking]
        S --> T[Navigation Visibility]
        S --> U[Global State]
    end
    
    F -.-> I
    Q -.-> R
```

## 5. Interval Timer Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Interval Component
    participant H as useIntervalTimer Hook
    participant M as TimerManager
    participant T as Timer Steps
    
    U->>C: Starts interval timer
    C->>H: start()
    H->>M: start()
    
    loop Interval Sequence
        M->>T: Execute current step
        T->>M: Step completed
        M->>H: onStepChange
        H->>C: Update current step
        C->>U: Display step info
        
        M->>H: onTick (every second)
        H->>C: Update time left
        C->>U: Display countdown
    end
    
    M->>H: onSequenceComplete
    H->>C: Timer completed
    C->>U: Show completion
```

## 6. Storage Management Flow

```mermaid
graph TD
    subgraph "Storage Operations"
        A[Timer Config] --> B[Storage Manager]
        B --> C[localStorage API]
        C --> D[Persisted Data]
    end
    
    subgraph "Data Types"
        E[Recent Timers] --> F[recent_timers key]
        G[Timer Configs] --> H[timer_{id} key]
        I[Presets] --> J[preset_{id} key]
    end
    
    subgraph "Data Flow"
        K[User Action] --> L[Create/Update Timer]
        L --> M[Generate ID]
        M --> N[Store Config]
        N --> O[Update Recent List]
        O --> P[Cleanup Old Timers]
    end
    
    subgraph "Retrieval Flow"
        Q[Page Load] --> R[Get Timer ID]
        R --> S[Lookup Config]
        S --> T[Parse & Validate]
        T --> U[Return Config]
    end
    
    F --> C
    H --> C
    J --> C
    D --> S
```

## 7. Complex Timer Phase Flow

```mermaid
flowchart TD
    A[Complex Timer Start] --> B[Phase 1]
    B --> C{Phase Complete?}
    C -->|No| D[Continue Phase]
    C -->|Yes| E{More Phases?}
    
    E -->|Yes| F[Next Phase]
    E -->|No| G[Timer Complete]
    
    F --> H[Phase Setup]
    H --> I[Initialize Phase Timer]
    I --> J[Run Phase Timer]
    J --> K[Phase Complete]
    K --> C
    
    D --> L[Update Phase Display]
    L --> M[Check Phase Status]
    M --> C
    
    G --> N[Show Overall Completion]
    N --> O[Option to Restart]
    
    subgraph "Phase Types"
        P[Countdown Phase]
        Q[Stopwatch Phase]
        R[Interval Phase]
        S[WorkRest Phase]
    end
    
    H --> P
    H --> Q
    H --> R
    H --> S
```

## 8. Navigation and Routing Flow

```mermaid
stateDiagram-v2
    [*] --> Configure: Default route
    Configure --> Timer: Select/create timer
    Timer --> Configure: No timer ID
    Configure --> ComplexConfig: Select complex type
    ComplexConfig --> Configure: Cancel
    ComplexConfig --> Timer: Create complex timer
    
    state Timer {
        [*] --> Running
        Running --> Paused
        Paused --> Running
        Running --> Completed
        Paused --> Completed
        Completed --> Running: Restart
        Completed --> [*]: Navigate away
    }
    
    note right of Timer
        Navigation hidden during
        any timer activity
    end note
```

## 9. Hook Dependencies and Interactions

```mermaid
graph TB
    subgraph "Core Timer Hooks"
        A[useTimer] --> B[Timer Class]
        C[useIntervalTimer] --> D[TimerManager]
        E[useWorkRestTimer] --> D
        F[useComplexTimer] --> G[Phase Management]
    end
    
    subgraph "Utility Hooks"
        H[useTimerContext] --> I[TimerContext]
        J[useSoundManager] --> K[Audio API]
        L[useWakeLock] --> M[Screen Wake Lock]
        N[usePreStartCountdown] --> O[Countdown Logic]
    end
    
    subgraph "UI Hooks"
        P[useMediaQuery] --> Q[Responsive Design]
        R[useTouchDevice] --> S[Touch Interactions]
    end
    
    subgraph "Shared Dependencies"
        I --> T[Global Timer State]
        D --> U[Step Management]
        B --> V[Basic Timer Logic]
        G --> W[Complex Sequencing]
    end
    
    A -.-> H
    C -.-> H
    E -.-> H
    F -.-> H
```

## 10. Error Handling and Edge Cases

```mermaid
flowchart TD
    A[User Action] --> B{Validation}
    B -->|Fail| C[Show Error]
    B -->|Pass| D[Execute Action]
    
    D --> E{Storage Operation}
    E -->|Fail| F[Storage Error]
    E -->|Pass| G[Continue Flow]
    
    G --> H{Timer ID Valid?}
    H -->|No| I[Redirect to Configure]
    H -->|Yes| J[Load Timer]
    
    J --> K{Config Found?}
    K -->|No| I
    K -->|Yes| L[Display Timer]
    
    L --> M{Timer Initialization}
    M -->|Fail| N[Init Error]
    M -->|Pass| O[Timer Ready]
    
    C --> P[User Notification]
    F --> P
    N --> P
    I --> Q[Navigation]
    P --> R[User Recovery]
    R --> A
```

These diagrams provide a comprehensive view of the timer application's architecture, user flows, data management, and component interactions. They can be used for onboarding new developers, understanding the system architecture, and planning future enhancements.
