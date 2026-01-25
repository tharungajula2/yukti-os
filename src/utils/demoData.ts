export function loadDemoData() {
    // 1. CLEAR EXISTING DATA
    localStorage.removeItem("yukti_auth_v2");
    localStorage.removeItem("yukti_assessment_data_v2");
    localStorage.removeItem("yukti_history");
    localStorage.removeItem("yukti_latest_summary");
    localStorage.removeItem("yukti_active_meds");
    Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("yukti_med_log_") || key.startsWith("yukti_daily_log_")) {
            localStorage.removeItem(key);
        }
    });

    // 2. SET DEMO AUTH
    localStorage.setItem("yukti_auth_v2", "true");

    // 3. SET PROFILE (High Risk)
    const answers = {
        q1: "70+", // Age
        q2: "Diabetes", // High Blood Sugar
        q3: "Multiple/Severe", // BP/Heart
        q4: "Often", // Breathless
        q5: "No", // Parkinson's
        q6: "Sometimes", // Confusion
        q7: "Once/Minor", // Surgery (Cataract)
        q8: "Severe/Daily", // Joint Pain
        q9: "Once", // Falls
        q10: "No", // Assistance
        q11: "No", // Gut
        q12: "No", // Stress
        q13: "Sometimes", // Sleep
        q14: "Sometimes", // Diet
        q15: "None" // Habits
    };

    const profile = {
        answers: answers, // CRITICAL: This drives the Clinical Engine
        riskScore: 45, // Legacy/Fallback
        riskLevel: "High"
    };
    localStorage.setItem("yukti_assessment_data_v2", JSON.stringify(profile));

    // 4. SET HISTORY (Trend)
    const history = [
        {
            meta: { reportDate: "2025-12-15", reportType: "Doctor Note" }, // Matches SmartReport structure
            summary: "Routine checkup. BP 140/90. Complaints of fatigue. HbA1c: 7.2%. instructed to increase walking.",
            biomarkers: [{ name: "BP", value: "140/90", unit: "mmHg", status: "High" }, { name: "HbA1c", value: "7.2", unit: "%", status: "High" }]
        },
        {
            meta: { reportDate: "2025-01-10", reportType: "Lab Report" },
            summary: "Lab Report Analysis. Slight elevation in Creatinine (1.1). HbA1c risen to 7.8%. Medication review suggested.",
            biomarkers: [{ name: "Creatinine", value: "1.1", unit: "mg/dL", status: "Borderline" }, { name: "HbA1c", value: "7.8", unit: "%", status: "High", trend: "Rising" }]
        }
    ];
    localStorage.setItem("yukti_history", JSON.stringify(history));

    // 4.5 SET HOLISTIC SUMMARY (So Smart Report Tab isn't empty)
    const holisticSummary = {
        isSummary: true,
        title: "Holistic Health Snapshot",
        patientRiskProfile: "High Risk (Diabetes + Fall History)",
        trendAnalysis: "**Worrying Trend:** HbA1c has risen from 7.2% (Dec) to 7.8% (Jan). Blood pressure remains uncontrolled (140/90). Reports indicate worsening metabolic control correlated with reduced mobility.",
        keyFindings: [
            "**Diabetes Unmanaged:** HbA1c 7.8% despite Metformin.",
            "**Fall Risk:** History of fall + 'Occasional Dizziness' reported.",
            "**Renal Watch:** Creatinine 1.1 requires monitoring given the diabetes."
        ],
        recommendation: "Immediate consultation with Dr. Aditi Rao to adjust anti-diabetic dosage. Start 'Fall Prevention Protocol' (Calcium + Home Safety Check).",
        disclaimer: "AI-Generated Summary. Verify with Doctor."
    };
    localStorage.setItem("yukti_latest_summary", JSON.stringify(holisticSummary));

    // 5. SET MEDICINES
    const meds = [
        { name: "Metformin", dosage: "500mg", timing: "After Food", type: "Chronic", status: "Active", slots: ["Morning", "Night"], relationToFood: "After Food" },
        { name: "Telmisartan", dosage: "40mg", timing: "Before Breakfast", type: "Chronic", status: "Active", slots: ["Morning"], relationToFood: "Before Food" },
        { name: "Shelcal 500", dosage: "500mg", timing: "After Lunch", type: "Chronic", status: "Active", slots: ["Afternoon"], relationToFood: "After Food" },
        { name: "Atorvastatin", dosage: "10mg", timing: "Before Sleep", type: "Chronic", status: "Active", slots: ["Night"], relationToFood: "After Food" },
        { name: "Coconut Oil", dosage: "1 tsp", timing: "Before Bath", type: "Chronic", status: "Active", slots: ["Morning"], relationToFood: "Before Food", remarks: "For dry skin application" }
    ];
    localStorage.setItem("yukti_active_meds", JSON.stringify(meds));

    // 6. SET LOGS (Behavior Pattern)
    // Yesterday: Perfect
    const yesterday = "2026-01-21";
    const logYesterday = {
        meds: ["Metformin", "Telmisartan", "Shelcal 500", "Atorvastatin", "Coconut Oil"],
        vitals: { bpSys: 128, bpDia: 82, sugar: 110 }
    };
    localStorage.setItem(`yukti_daily_log_${yesterday}`, JSON.stringify(logYesterday));

    // Day Before: Missed Night Meds
    const dayBefore = "2026-01-20";
    const logDayBefore = {
        meds: ["Metformin", "Telmisartan", "Shelcal 500", "Coconut Oil"], // Missed Atorvastatin & 2nd Metformin
        vitals: { bpSys: 135, bpDia: 88, sugar: 145 }
    };
    localStorage.setItem(`yukti_daily_log_${dayBefore}`, JSON.stringify(logDayBefore));

    alert("Demo Profile Loaded: Mukesh (High Risk) 🚀");
    window.location.reload();
}
