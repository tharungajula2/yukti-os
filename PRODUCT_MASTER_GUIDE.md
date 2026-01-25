# Yukti OS: The Complete Product Master Guide
**Version:** 2.0 (Deep Dive Edition)  
**Date:** January 25, 2026  
**Audience:** Product Managers, Engineering Leads, & Stakeholders

---

## 1. Vision & Philosophy

### The "Why"
Health is **contextual**. A blood pressure reading of `140/90` is alarming for a 30-year-old athlete but might be "acceptable control" for a 75-year-old diabetic on medication. 

Most health apps fail the elderly because they are **Context-Blind**. They treat every user as a generic "User ID".

**Yukti OS** flips this model. It builds a "Digital Clinical Twin" of the patient first. It knows their history, their frailty, and their risks *before* it analyzes a single report. It doesn't just "process data"; it "interprets health" relative to that specific person.

---

## 2. A Day in the Life: User Journey
To understand the product, let's walk through a typical day with our target persona: **Mukesh (72, Diabetic, History of Falls)**.

### Morning: The "Passive" Safety Net
*   Mukesh wakes up. He checks Yukti on his phone.
*   **Medication Tracker:** He sees his morning pills (Metformin, Telmisartan). He taps "Taken".
*   **The System:** Validates he took them. If he misses, the **Call Overlay** (Simulated Call) would trigger at 10 AM to remind him.

### Afternoon: The "Active" Intervention
*   Mukesh visits a clinic and gets a physical prescription.
*   **Smart Report:** He photos the prescription and uploads it to Yukti.
*   **The "Brain":** 
    1.  Yukti reads the scribbled note: *"Add Atorvastatin 10mg"*.
    2.  **Context Check:** It knows Mukesh is already taking 4 meds.
    3.  **Conflict Scan:** It checks if Atorvastatin conflicts with his existing list (Future Roadmap).
    4.  **Action:** It auto-adds the new med to his daily tracker.

### Evening: The "Holistic" View
*   Mukesh's daughter visits. She doesn't want to read 50 loose papers.
*   **Holistic Summary:** She taps one button. Yukti synthesizes the last 6 months of reports into one paragraph: *"Mukesh's sugar control has worsened (HbA1c up 0.5%) since his fall last month. Recommended: Increase mobility safely."*
*   **Value:** Instant clarity from chaos.

---

## 3. Product Pillars: Deep Dive

We have 4 modules that work together. Here is the deep engineering and product logic behind them.

### Module A: The Clinical Engine (Risk Engine)
**Purpose:** To establish the "Baseline". Without this, the AI is flying blind.

*   **The Design:** A digital intake form mimicking a Geriatrician's first assessment.
*   **The Questions:** We ask **15 calibrated questions** covering 10 domains:
    *   *Metabolic* (Diabetes/BP) - Highest Weightage
    *   *Frailty* (Falls/Hospitalization)
    *   *Resilience* (Age/Recovery speed)
    *   *Lifestyle* (Sleep/Diet)
*   **The Algorithm (How we score):**
    *   Each answer has a weighted score (0, 5, 10, or 15).
    *   **Max Score:** 175.
    *   **Risk Logic:**
        *   `0 - 20`: **Healthy Baseline** (Green)
        *   `21 - 40`: **Moderate Attention** (Amber)
        *   `> 40`: **High Risk** (Red) - *Example: Mukesh is 45.*
*   **Safety Lock:** The "Smart Reports" module is **LOCKED** until this assessment is done. We refuse to give medical advice without knowing who the patient is.

### Module B: Smart Reports (The "Brain")
**Purpose:** To turn unstructured chaos (files) into structured intelligence (JSON).

*   **Technology:** Google Gemini 2.5 Flash (chosen for speed/cost).
*   **The "Context Prompt":**
    *   We don't just send the PDF to the AI.
    *   We send: `[The User Profile (Diabetic, 72)]` + `[The PDF Data]`.
    *   The Prompt instruction is: *"Analyze this PDF. Highlight findings that are dangerous SPECIFICALLY for a user with this profile."*
*   **The Output (JSON Schema):**
    *   We force the AI to return strict JSON:
        ```json
        {
          "biomarkers": [{ "name": "Creatinine", "value": "1.1", "status": "High" }],
          "medicines": [{ "name": "Aspirin", "type": "Chronic", "duration": "Ongoing" }],
          "clinicalCorrelation": "Creatinine is high. Given user's Diabetes, screen for Kidney Disease."
        }
        ```
*   **Fallback System:** If the primary AI model fails or times out, we auto-retry with "Flash-Lite".

### Module C: Medication Tracker
**Purpose:** Adherence.

*   **Visual Design:**
    *   **Grid Layout:** Easy to tap cards.
    *   **Color Coding:** Red (Missed), Green (Taken), Grey (Upcoming).
*   **Data Model:**
    *   We store "Active Meds" and "Daily Logs" separately in `localStorage`.
    *   This allows us to track history: *"Did he take meds last Tuesday?"*

### Module D: Care Team & System Reset
**Purpose:** Trust & Control.

*   **The "Care Squad":** A humanized UI showing the AI as just one member of a team (Doctor, Care Manager, AI). This reduces "AI Fear" for elderly users.
*   **System Reset:**
    *   We built a "Nuclear Option" to wipe the brain.
    *   **Safety:** Requires **Two Confirmations** (Double Modal). "Are you sure?" -> "Really sure?".
    *   Why? Because wiping the context destroys the personalization.

---

## 4. Technical Architecture (For PMs)

You don't need to code, but you must understand the **Infrastructure**.

### 1. The "Engine": Next.js (App Router)
*   **What it is:** The framework running the website.
*   **Why:** It allows for "Serverless Functions" (our API) and fast UI rendering.

### 2. The "Brain": Serverless Edge Functions
*   **Location:** `src/app/api/analyze/route.ts`
*   **How it works:** 
    *   When a user uploads a file, it goes to this function.
    *   The function runs for only **10–60 seconds** (Vercel Limit).
    *   It talks to Google, gets the JSON, and shuts down.
    *   *Constraint:* Large files (>10MB) or massive books will fail because the function will "time out" before reading them.

### 3. The "Memory": Local Storage (Client-Side)
*   **Privacy First:** All data (Profile, Reports, Meds) lives **inside the user's Chrome browser**.
*   **Pros:** 100% Privacy. Zero Server Cost. Instant Loading.
*   **Cons:** If they clear cache or switch from Phone to Laptop, the data is gone.
*   **Roadmap Fix:** We will need a Cloud Database (Supabase) in Phase 3.

---

## 5. Deployment Guide (Vercel)

We use Vercel for hosting. It's stable, fast, and free for hobby usage.

### Critical Constraints
1.  **Environment Variables:** The app is a "blank slate" without keys. You MUST add `NEXT_PUBLIC_GEMINI_API_KEY` in Vercel settings.
2.  **The "10-Second Rule":** On the free plan, if the AI thinks for more than 10 seconds, Vercel cuts the line.
    *   *Solution:* We optimized code to request 60s, but it's not guaranteed.
    *   *PM Note:* Always demo with 1-2 page PDFs. Do not upload a 50-page hospital bill in a demo.

---

## 6. Design System & UX Choices

*   **Color Psychology:** 
    *   **Orange (Primary):** Warmth, Alertness (Yukti Brand).
    *   **Emerald (Secondary):** Success, Safety, "All Good".
    *   **Slate (Text):** High contrast for elderly readability (Pure black is too harsh).
*   **Typography:**
    *   **Mobile-First:** We use large text (`text-xl` headers) but keep it proportional. We explicitly tested size 30px and rejected it for being too aggressive on small screens.

---

## 7. Future Roadmap (The Backlog)

1.  **WhatsApp Integration (High Priority):**
    *   Elderly users live on WhatsApp.
    *   *Feature:* Send the daily "Holistic Summary" as a WhatsApp message to the daughter.
2.  **Voice Interaction:**
    *   Typing is hard for shaky hands.
    *   *Feature:* "Yukti, did I take my morning pill?" (Voice-to-Text).
3.  **Cloud Sync:**
    *   Enable login so data persists across devices.

---
*End of Deep Dive Guide.*
