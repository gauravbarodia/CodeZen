# CodeZen 🧘

A personalized training platform for competitive programmers, built with **React.js** and the **Codeforces API**.

CodeZen is a feature-rich web application designed to help competitive programmers accelerate their skill growth. It provides a structured and personalized practice environment by generating tailored challenges and simulating real contest environments, all powered by live data from the Codeforces platform.

[**Live Demo Link Here**](https://codezen17.netlify.app/)

---

## Key Features

* **Personalized Daily Challenges**: Generates unique practice problems based on the user's live Codeforces rating.
* **Advanced Problem Search**: Filter the entire Codeforces problem set by rating and topic to focus on specific areas of improvement.
* **Contest Simulation**: Create custom, timed practice contests to simulate a real competition environment.
* **High-Performance Caching**: An advanced caching system using `localStorage` provides an instant-load experience for returning users and silently updates data in the background.

---

## Tech Stack

* **Frontend**: React.js
* **API**: Codeforces Public API
* **Styling**: CSS
* **API Requests**: Axios

---

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/gauravbarodia/CodeZen.git]
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the development server:**
    ```bash
    npm run dev
    ```