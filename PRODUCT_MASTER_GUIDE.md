# Yukti OS: The Complete Product Master Guide
**Version:** 3.1 (Interactive Intelligence & Brand Polish)  
**Date:** February 2, 2026  
**Audience:** Product Managers, QA Engineers, & Developers

---

## 1. Vision & Philosophy

### The "Why"
Health is **contextual**. A blood pressure reading of `140/90` is alarming for a 30-year-old athlete but might be "acceptable control" for a 75-year-old diabetic on medication. 

Most health apps fail the elderly because they are **Context-Blind**. They treat every user as a generic "User ID".

**Yukti OS** flips this model. It builds a "Digital Clinical Twin" of the patient first. It knows their history, their frailty, and their risks *before* it analyzes a single report. It doesn't just "process data"; it "interprets health" relative to that specific person.

---

## 2. Core Modules & Feature Logic

Our system is divided into 5 interactive modules. Each module is designed for **"Passive Collection, Active Intervention"**.

### Module A: Health Assessment (Risk Engine)
**Purpose:** To establish the "Baseline". Without this, the AI is flying blind.
*   **The Design:** A digital intake form mimicking a Geriatrician's first assessment.
*   **The 15-Question Protocol:** Scoring covers Metabolic Health, Frailty, Resilience, and Lifestyle.
*   **Risk Logic (0-175 Score):**
    *   `0 - 20`: **Healthy Baseline** (Green)
    *   `21 - 40`: **Moderate Attention** (Amber)
    *   `> 40`: **High Risk** (Red).
*   **Data Lock:** "Smart Reports" are **disabled** until assessment is complete.

### Module B: Smart Reports (The "Brain")
**Purpose:** To turn unstructured chaos (files) into structured intelligence (JSON).
*   **Technology:** Google Gemini 2.0 Flash.
*   **The Context Prompt:** `[User Profile (Diabetic, 72)]` + `[PDF Data]` → *"Analyze tailored risks."*
*   **Output:** Strict JSON (Biomarkers, Medicines, Clinical Correlation).

### Module C: Medication & Wellness Tracker
**Purpose:** Daily Adherence & device integration.
*   **Three-Tab Architecture:**
    1.  **Daily Care:** The "Today" dashboard.
        *   *Left Column:* Dynamic Checklist of Medicines (Morning/Afternoon/Night).
        *   *Right Column:* Vitals Input, **Connected Devices Hub**, Lifestyle Habits.
    2.  **History (Calendar):** A visual month-view of adherence (Green/Orange/Red dots).
    3.  **Manage Meds:** Inventory control (Edit dosages, Add/Remove meds).
*   **Interactive Features:**
    *   **Device Sync Simulation:** 
        *   *FreeStyle Libre (CGM):* Clicking "Sync" auto-populates Sugar to **110 mg/dL**.
        *   *Apple Watch:* Clicking "Sync" auto-populates Weight (**64.5kg**) & Activity (**45 mins**) + Hydration.
        *   *Feedback:* Instant "Toast" notification confirming data sync.
    *   **Optimistic UI:** Clicking a pill to "Take" it instantly moves it to the taken state (Green Check) with animation.

### Module D: Clinic Hub (Operations)
**Purpose:** Managing the logistics of care (Appointments & Finance).
*   **Wallet System:**
    *   **Balance Tracking:** Real-time wallet balance (Default: ₹1,250).
    *   **Top-Up Simulation:** Clicking "Top Up" triggers a mock payment gateway delay (1.5s), then adds **₹1,000** and updates the UI.
*   **Booking Engine:**
    *   **"Book New" Modal:** An overlay to schedule appointments.
    *   **Specialist Selection:** Dr. Aruna (Geriatric), Dr. Esha (Cardio), Coach Vikram.
    *   **List Management:** Confirmed appointments are added to the schedule **immediately**.
*   **Insurance:** Rebranded to **"Yukti Senior Shield"** (Active Policy).

### Module E: Care Team & Messaging
**Purpose:** Human trust layer.
*   **The Team:** AI + 4 Specialists.
*   **Interactive Team Building:** "Add Member" button simulates inviting a family member via link.
*   **WhatsApp Redirect:** Clicking "Chat" opens the native WhatsApp interface (simulated link) for zero-friction communication.

---

## 3. User Experience & Design Polish

### Work-in-Progress (WIP) Indicators
To properly set expectations for Alpha/Beta testers, aesthetic indicators have been added:
1.  **Login Screen:** Pulsing "Work in Progress" pill under the author credits.
2.  **Sidebar & Header:** "WIP" badge visible globally on the app chrome.
3.  **Dashboard Header:** "System operating at nominal capacity (WIP v2.1)".

### Clean Demo Data Logic
*   **Interaction Model:** When "Load Demo Data" is clicked, it pre-fills the *Clinical Profile* and *Medicine Inventory*.
*   **Default State:** It explicitly **clears** value for "Today's Logs".
*   *Result:* Users see the checklist as **empty** (unticked), inviting them to interact with the UI themselves.

---

## 4. End-to-End Testing Script (QA Guide)

Use this script to validate the "Yukti OS" v2.1 Interactive Build.

### TEST 1: The "Device Sync" Flow
1.  Navigate to **Daily Care** tab.
2.  Scroll to the **"Connected Devices"** card (Right Column).
3.  **Action:** Click "Sync" on the *FreeStyle Libre* card.
    *   *Expected:* A green toast appears: "⚡ Synced 110 mg/dL". 
    *   *Verify:* The "Sugar" input field in the "Vitals" card above it should now show `110`.
4.  **Action:** Click "Sync" on the *Apple Watch* card.
    *   *Expected:* A green toast appears.
    *   *Verify:* The "Weight" input should show `64.5`, and "Activity" (Habits card) should show `45`.

### TEST 2: The "Clinic Wallet" Flow
1.  Navigate to **Clinic Hub**.
2.  Locate the "Health Finance" card (Right Column).
3.  **Verify:** Policy Name is "Yukti Senior Shield".
4.  **Action:** Click the "Top Up" white button.
    *   *Expected:* A blue toast "Processing Secure Payment..." appears.
    *   *Wait:* After 1.5 seconds, a green toast "₹1,000 added" appears.
    *   *Verify:* Balance text animates and changes from `₹ 1,250` to `₹ 2,250`.

### TEST 3: The "Book Appointment" Flow
1.  In **Clinic Hub**, click the black **"+ Book New"** button (Top Right).
2.  **Verify:** A modal overlay opens with a white form.
3.  **Action:** 
    *   Select "Coach Vikram" from dropdown.
    *   Pick any future date and time.
    *   Click "Confirm Booking".
4.  **Verify:**
    *   Modal closes and success toast appears.
    *   A new card for "Coach Vikram" appears at the **top** of the "Your Schedule" list.

---

## 5. Deployment & Constraints

1.  **Environment Variables:** Requires `NEXT_PUBLIC_GEMINI_API_KEY`.
2.  **The "10-Second Rule":** Vercel functions must be optimized. We use "Streaming" where possible.
3.  **Demo Limits:** 
    *   Wallet payments are *simulated* (No real banking API).
    *   Device Sync is *simulated* (No real Bluetooth connection).
    *   These features are designed to demonstrate the **User Experience** to stakeholders and investors.

---

*End of Master Guide.*
