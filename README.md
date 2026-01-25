# Yukti OS: The Context-Aware Health OS for the Elderly

**AI-Powered. Privacy-First. Specialist-Supervised.**

Yukti OS is not just another health app. It is a **Digital Twin** for elderly care that uses **Context-Aware AI** to interpret medical data relative to a patient's specific frailty profile, rather than generic averages.

![Yukti OS Cover](https://via.placeholder.com/1200x600?text=Yukti+OS+Dashboard)
*(Replace with actual screenshot after deployment)*

---

## 🚀 The Core Innovation: "Context-Awareness"

Most health apps see a blood sugar level of `160 mg/dL` and flag it as "High".
**Yukti OS** checks the **Clinical Engine** first. It sees:
> *"Patient is 75 years old + has a history of hypoglycemia (low sugar falls)."*

It then intelligently decides:
> *"For this specific patient, 160 is actually a SAFE target to prevent fatal falls. Do not alarm."*

This **System Context** is what separates Yukti from generic LLM wrappers.

---

## 🌟 Key Features

### 1. 🧠 The Clinical Engine (Risk Assessment)
*   A 15-question geriatric assessment (Sleep, Mobility, Frailty).
*   Calculates a **Risk Score (0-100)** to calibrate the AI's sensitivity.
*   *Tech:* Vertical stacking layout for mobile accessibility.

### 2. 📄 Smart Reports (Gemini 2.5 Flash)
*   **Upload & Analyze:** Reads PDFs, handwritten prescriptions, and lab reports.
*   **Deep Linking:** Connects new findings to past history.
*   **Holistic Summary:** Synthesizes 6 months of reports into a 5-line narrative for the family.

### 3. 💊 Daily Wellness Tracker
*   **Medication Management:** Grid-based tracker for chronic & acute meds.
*   **Lifestyle & Habits:** Tracks hydration, activity (walking mins), and diet adherence.
*   **Safety Net:** Auto-triggers a "Simulated Call" if meds are missed.

### 4. 💬 WhatsApp Assistant (Vision Demo)
*   A 'Nani-Bot' interface demonstrating how we meet seniors where they are.
*   No app download required for the end-user (Vision).

---

## 🛠 Tech Stack

*   **Framework:** Next.js 15 (App Router)
*   **Styling:** Tailwind CSS + Framer Motion
*   **AI Model:** Google Gemini 2.5 Flash (via Vercel Serverless Functions)
*   **Database:** `localStorage` (Client-Side Persistence for 100% Privacy)
*   **Icons:** Lucide React

---

## ⚡ How to Run Locally

1.  **Clone the repo:**
    ```bash
    git clone https://github.com/tharungajula2/yukti-os.git
    cd yukti-os
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file in the root:
    ```env
    NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
    ```

4.  **Run the dev server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

---

## 🔐 Privacy & Security
*   **Zero-Knowledge Storage:** Currently, all patient data lives **inside the user's browser** (Local Storage). No medical data is stored on our servers.
*   **Ephemeral Analysis:** Data is sent to the AI only for the duration of the analysis window and is not trained upon.

---

## 🔮 Roadmap
*   [ ] **Cloud Sync:** Supabase integration for multi-device login.
*   [ ] **Voice Interface:** "Yukti, did I take my morning pill?"
*   [ ] **WhatsApp API Integration:** Live connection to the mock demo.

---

*Note: This is a Portfolio Project demonstrating Advanced Agentic Coding & Product Architecture.*
