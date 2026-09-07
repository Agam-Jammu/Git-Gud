# Git Gud — Project Architecture & Implementation Plan

> **Real-Time Multiplayer Developer Trivia & Buzzer Arena**  
> *Stack: Java 17, Spring Boot 3, WebSockets (STOMP), React 18 (TypeScript), Tailwind CSS, JUnit 5, Docker, GCP Terraform.*

---

## 1. Project Overview & Vision

**Git Gud** is a high-energy, real-time multiplayer developer trivia and buzzer arena designed for software engineers. 

Players can play in **Solo Practice Mode** or create a **1v1 / Multiplayer Room** with a 6-digit code (e.g., `CLASH-482`) to challenge friends or interviewers. The platform serves rapid-fire questions covering **Java & Spring, SQL & Databases, Git & Linux, and Web & Cloud Architecture**, featuring live countdown bars, speed bonuses, streak multipliers, and instant server-side score synchronization.

---

## 2. Why This Project Wins in Technical Interviews

| Typical "NPC" Project | DevClash |
|---|---|
| Static CRUD app (Todo, Blog, E-commerce) | Real-time event-driven multiplayer gaming system |
| Generic HTTP request/response | Bi-directional WebSockets (STOMP) with room topic broadcasting |
| Boring mock data | Engaging developer-oriented trivia with code snippets and timer pressure |
| Interviewer reads code on GitHub | You can literally send the interviewer a 6-digit link and play a 60-second round live |
| No infrastructure code | Full multi-stage Dockerfile, Docker Compose, GCP Terraform, and GitHub Actions CI |

---

## 3. Code Cleanliness & Modularity Principles

> "Code should be simple to read, modular, succinct, and cleanly separated across dedicated files."

- **Single Responsibility Per File**: Every class/component does exactly one job. No 500-line god classes.
- **Succinct & Expressive**: Avoid nested logic, boilerplate wrappers, or convoluted design patterns. Write idiomatic, self-documenting code that any engineer can grasp in 30 seconds.
- **Isolated DTOs & Models**: Every network request/response and domain object has its own dedicated file.
- **Modular Frontend Components**: The React UI is split into clean, single-purpose components (`Lobby`, `WaitingRoom`, `Arena`, `RoundReveal`, `Podium`) with decoupled WebSocket services and TypeScript types.
- **Pure Functions Where Possible**: Business math (like score calculation and streak logic) is isolated into pure, easily unit-tested helper classes.

### Ready-to-Use Resume Bullet Points
- **Architected and deployed DevClash**, a full-stack real-time multiplayer trivia platform using Java 17, Spring Boot 3, React (TypeScript), and WebSockets (STOMP over SockJS).
- **Engineered an event-driven game state machine** on the backend managing concurrent game rooms, synchronized 10-second question countdowns, and server-authoritative scoring with latency compensation.
- **Implemented a dynamic scoring engine** awarding points based on base accuracy, millisecond-level response speed, and consecutive streak multipliers.
- **Designed a responsive, arcade-style UI** in React and Tailwind CSS with real-time opponent score updates, buzzer hotkeys, and celebratory victory podiums.
- **Containerized services and codified cloud infrastructure** using multi-stage Docker builds, Docker Compose, and Terraform for Google Cloud Platform (Cloud Run).

---

## 4. System Architecture & Game Loop

### Architectural Overview

```
 ┌─────────────────────────────────────────────────────────────┐
 │               React 18 + TypeScript + Tailwind              │
 │  - Lobby & Category Selector    - Live Question Arena       │
 │  - 1-Click Room Sharing         - Victory Podium + Confetti │
 └──────────────┬───────────────────────────────▲──────────────┘
                │ REST (Create Room, Categories)│ WebSockets STOMP
                ▼                               │ (Room events, scores)
 ┌──────────────────────────────────────────────┴──────────────┐
 │               Spring Boot 3 Backend (Java 17)               │
 │                                                             │
 │  ┌───────────────────────────────────────────────────────┐  │
 │  │ STOMP WebSocket Message Broker (/ws)                  │  │
 │  │  - /app/room/{code}/join    - /app/room/{code}/answer │  │
 │  │  - /topic/room/{code} (Subscribed by all room players)│  │
 │  └───────────────────────────┬───────────────────────────┘  │
 │                              ▼                              │
 │  ┌───────────────────────────────────────────────────────┐  │
 │  │ RoomManagerService (ConcurrentHashMap<String, Room>)  │  │
 │  │  - Thread-safe room creation and player session map   │  │
 │  └───────────────────────────┬───────────────────────────┘  │
 │                              ▼                              │
 │  ┌───────────────────────────────────────────────────────┐  │
 │  │ GameLoopScheduler (ScheduledExecutorService)          │  │
 │  │  - 3s Match Countdown -> 10s Question -> 3s Reveal   │  │
 │  └───────────────────────────┬───────────────────────────┘  │
 │                              ▼                              │
 │  ┌───────────────────────────────────────────────────────┐  │
 │  │ ScoreCalculator & QuestionService (H2 / PostgreSQL)   │  │
 │  └───────────────────────────────────────────────────────┘  │
 └─────────────────────────────────────────────────────────────┘
```

### Game State Machine

```
[LOBBY] ──(Host starts)──> [3s COUNTDOWN] ──> [QUESTION ACTIVE (10s)]
                                                    │
                                                    ├─ All players answer OR timer expires
                                                    ▼
                                            [ROUND REVEAL (3s)]
                                                    │
                                                    ├─ Next question available?
                                                    ├── YES ──> [QUESTION ACTIVE]
                                                    └── NO  ──> [VICTORY PODIUM]
```

### Server-Side Scoring Formula
To prevent client-side cheating, the backend calculates scores based on server receipt timestamps:
$$\text{Score} = \left( 1000 + \left\lfloor 500 \times \frac{\text{msRemaining}}{10000} \right\rfloor \right) \times \text{StreakMultiplier}$$
- **Correct Answer**: Base 1,000 points.
- **Speed Bonus**: Up to +500 points based on milliseconds remaining.
- **Streak Multiplier**:
  - 1 in a row: $1.0\times$
  - 2 in a row: $1.2\times$
  - 3 in a row: $1.5\times$
  - 4+ in a row: $2.0\times$ ("On Fire!")
- **Incorrect Answer**: 0 points, streak resets to 0.

---

## 5. REST & WebSocket API Specification

### REST Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/rooms` | Creates a new room (returns 6-digit code like `CLASH-891`) |
| `GET` | `/api/v1/rooms/{code}` | Checks room existence and current status |
| `GET` | `/api/v1/categories` | Returns available trivia categories & question counts |
| `GET` | `/api/v1/practice/questions` | Returns 5 randomized questions for Solo Mode |

### WebSocket STOMP Destinations
- **Endpoint**: `/ws` (with SockJS fallback)
- **Client Inbound (`/app`)**:
  - `/app/room/{code}/join` — Payload: `{ "playerName": "Alex" }`
  - `/app/room/{code}/start` — Triggered by host to begin match
  - `/app/room/{code}/answer` — Payload: `{ "questionId": 12, "selectedOption": 2 }`
- **Broker Outbound (`/topic`)**:
  - `/topic/room/{code}` — Broadcasts game events to all players in the room:
    - `PLAYER_JOINED`: Updated player list
    - `COUNTDOWN_TICK`: Countdown value (3, 2, 1)
    - `QUESTION_START`: Question payload (without correct answer), deadline timestamp
    - `PLAYER_ANSWERED`: Real-time notification that a player submitted an answer
    - `ROUND_RESULT`: Correct answer index, explanation, updated scoreboard
    - `GAME_OVER`: Final rankings, accuracy stats, winner celebration

---

## 6. Question Bank Categories (~40 Pre-Seeded Questions)

1. **Java & Spring Boot**:
   - `HashMap` internal bucketing and Java 8 treeification.
   - `@Transactional` self-invocation proxy pitfall.
   - Garbage collector algorithms (G1, ZGC).
   - Java 17 features (Records, Pattern Matching, Sealed Classes).
2. **SQL & Databases**:
   - B-Tree index traversal vs Full Table Scan.
   - ACID transaction isolation levels (Dirty Reads, Phantom Reads).
   - Normalization forms (1NF, 2NF, 3NF).
3. **Git & Linux**:
   - `git rebase` vs `git merge` commit history effects.
   - Unix permissions bitmask (`chmod 755` vs `644`).
   - Standard Unix signals (`SIGTERM 15` vs `SIGKILL 9`).
4. **Web & Cloud Architecture**:
   - HTTP 401 Unauthorized vs 403 Forbidden.
   - HTTP idempotency rules (POST vs PUT vs PATCH).
   - CAP Theorem trade-offs in distributed systems.

---

## 7. Directory Structure

```
/Users/agamdeep/personal/projects/devclash/
├── backend/
│   ├── src/
│   │   ├── main/java/com/devclash/
│   │   │   ├── DevClashApplication.java
│   │   │   ├── config/ (WebSocketConfig, WebMvcConfig, OpenApiConfig)
│   │   │   ├── controller/ (GameWsController, RoomController, QuestionController)
│   │   │   ├── model/ (Question, GameRoom, Player, GameState)
│   │   │   ├── dto/ (JoinRoomRequest, SubmitAnswerMessage, GameEventMessage)
│   │   │   ├── service/ (RoomService, GameEngineService, QuestionService)
│   │   │   └── repository/ (QuestionRepository)
│   │   └── test/java/com/devclash/
│   │       ├── service/ScoreCalculatorTest.java
│   │       └── service/RoomServiceTest.java
│   ├── pom.xml
│   ├── mvnw & mvnw.cmd
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/ (Navbar, Lobby, WaitingRoom, Arena, RoundReview, Podium)
│   │   ├── services/ (api.ts, websocket.ts)
│   │   ├── types/index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── terraform/
│   ├── main.tf (GCP Cloud Run configuration)
│   ├── variables.tf
│   └── outputs.tf
├── .github/workflows/
│   └── ci.yml (Maven build & JUnit test, Frontend build)
├── docker-compose.yml
├── PROJECT_PLAN.md
└── README.md
```

---

## 8. Fast-Track Build & Verification Strategy

1. **Step 1: Backend Foundation (Spring Boot 3 + WebSockets)**
   - Initialize project structure with Maven wrapper.
   - Create models (`GameRoom`, `Player`, `Question`, `GameState`).
   - Implement `RoomService` with `ConcurrentHashMap` for thread-safe room operations.
   - Implement `WebSocketConfig` and `GameWsController` with STOMP messaging.
   - Add pre-seeded question bank repository.
   - Add JUnit tests for score calculation and room joins.

2. **Step 2: Frontend Client (React 18 + Vite + Tailwind CSS)**
   - Initialize Vite React TypeScript project with Tailwind CSS.
   - Build STOMP WebSocket client (`@stomp/stompjs` + `sockjs-client`).
   - Build UI Views:
     - **Lobby**: Nickname input, category picker, Create/Join Room buttons.
     - **Waiting Room**: Live roster, 1-click shareable link, "Start Match" button.
     - **Arena**: Timer bar, code snippet highlight, 4 buzzer buttons (with 1/2/3/4 hotkeys).
     - **Round Reveal**: Correct answer reveal, streak animations.
     - **Podium**: Winner podium, confetti burst, Rematch button.

3. **Step 3: Docker & Cloud IaC**
   - Create multi-stage `Dockerfile` for backend (Java 17 JRE slim) and frontend (Nginx/Vite).
   - Create `docker-compose.yml` for 1-command startup.
   - Create Terraform scripts for Google Cloud Platform (Cloud Run).
   - Create GitHub Actions CI pipeline.

