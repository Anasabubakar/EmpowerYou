# ✨ EmpowerYou: Your Personal AI Companion for Growth & Well-being

EmpowerYou is a holistic, private, and AI-enhanced application designed to be a sanctuary for your thoughts, goals, and personal well-being. It's a comprehensive tool for promoting self-awareness, organization, and growth, with all data stored securely and privately on your own device.

## 核心功能 (Core Features)

- **Dashboard Overview**: A central hub providing a snapshot of your day, including wants & needs, menstrual cycle status, tasks, and key health metrics.
- **Wants & Needs Tracker**: Log and categorize your desires and necessities, turning them into actionable goals with progress tracking.
- **Menstrual Cycle Tracker**: Log period dates and symptoms to understand your body and predict future cycles.
- **Task Manager**: A simple and effective to-do list to organize your daily responsibilities.
- **Health Metrics Logger**: Track your mood, energy levels, and more, with beautiful charts to visualize trends over time.
- **Daily Diary & Reflection**: A private space to write down your thoughts and feelings, with AI-powered summaries to help you reflect.
- **AI Companion**: A supportive, empathetic AI friend available to chat anytime, providing a safe space to talk and feel heard.
- **Personalized Insights**: Generate reports that aggregate your data, using AI to provide trend analysis, visual summaries, and actionable advice.

## 🚀 技术栈 (Technology Stack)

This application is a modern, client-side web application built with a focus on performance and user experience.

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **UI Library**: [React](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **AI Integration**: [Genkit by Firebase](https://firebase.google.com/docs/genkit)
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)
- **Charts**: [Recharts](https://recharts.org/)

## 🔒 Data Privacy & Persistence

Your privacy is paramount. **All data you enter into EmpowerYou is stored exclusively on your own device** using your browser's `localStorage`. It is never sent to or stored on a central server. This ensures that your personal reflections, health data, and goals remain completely private and under your control.

## ⚙️ Getting Started

To run this project locally, follow these steps:

1.  **Install Dependencies**:
    The necessary packages are listed in `package.json`. If running locally, you would typically run:
    ```bash
    npm install
    ```

2.  **Run the Development Server**:
    To start the application in development mode, run:
    ```bash
    npm run dev
    ```

    Open [http://localhost:9002](http://localhost:9002) (or the specified port) with your browser to see the result.

3.  **Genkit AI Flows**:
    The AI features are powered by Genkit. To run the Genkit flows for local development and testing, you can use:
    ```bash
    npm run genkit:watch
    ```
    This will start the Genkit development server and watch for changes in your flow files located in `src/ai/flows/`.

---
