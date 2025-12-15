# Neuromorphic-Routing-Simulator

> A minimalist, local demo that visualizes and compares **Traditional microservice routing** with a **Neuromorphic (brain-inspired) routing approach** based on spike timing and adaptive learning.

This repository focuses on **concept validation, visualization, and explainability** rather than production deployment.

## 📌 Overview

Modern microservice systems rely on centralized or static routing strategies that can struggle under dynamic load or failures. This project explores an alternative approach inspired by how the human brain routes signals.

Instead of a central decision-maker, services compete to handle requests. The service that responds first is selected, and over time, faster paths are reinforced while slower ones are deprioritized.



## ✨ Key Features

* Side-by-side comparison of **Traditional vs Neuromorphic routing**
* Live request-flow simulation across multiple services
* Winner-takes-all routing based on response timing
* Adaptive learning that reinforces fast service paths
* Real-time metrics and performance graphs
* Clean, minimalist, light-theme dashboard UI



## 🧠 Core Concept

| Traditional Routing                  | Neuromorphic Routing                  |
| ------------------------------------ | ------------------------------------- |
| Centralized or static decision logic | Decentralized, event-driven decisions |
| Even or random request distribution  | Fastest responder wins                |
| No learning over time                | Continuous adaptation and learning    |

Neuromorphic routing uses **timing-based decisions** instead of predefined rules, mimicking how neurons communicate in biological systems.



## 📊 Dashboard Sections

### 1. Live Flow Simulation

* Visual representation of request propagation
* Clear distinction between routing strategies
* Path highlights and thickness indicate routing preference

### 2. Metrics Comparison

Displayed side-by-side for both routing modes:

* Average latency
* P95 latency
* Throughput (requests/sec)
* Success rate

### 3. Performance Analytics

* Latency over time (line chart)
* Throughput comparison (bar chart)
* Routing behavior trends

### 4. Results Summary

* Latency reduction percentage
* Throughput improvement
* Reliability comparison
* Short, human-readable insights



## 🛠 Tech Stack (Minimal)

* **Python** – core simulation and routing logic
* **FastAPI** – simulating independent microservices
* **AsyncIO** – concurrent spike-timing behavior
* **HTTP / REST** – service communication
* **In-memory data structures** – routing weights and state
* **Charting library** – metrics visualization

No Docker, Kubernetes, or external databases are required.



## ⚙️ How Neuromorphic Routing Works

1. A request arrives at the router
2. A signal is broadcast to all candidate services
3. Each service responds after a delay based on its load
4. The fastest responder is selected (winner-takes-all)
5. Fast responses strengthen that routing path
6. Slow or failed responses weaken the path

Learning happens continuously during the simulation.



## 📉 About Accuracy Fluctuations

During early simulation stages, neuromorphic routing may briefly show lower success rates than traditional routing.

This is expected and occurs due to exploration during learning. As the system adapts, performance stabilizes and typically improves.

This behavior reflects real-world adaptive systems and is not a defect.

