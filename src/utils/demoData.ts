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

    // 2. SET AUTH & IDENTITY
    localStorage.setItem("yukti_auth_v2", "true");
    localStorage.setItem('yukti_user_name', 'Chaaya');
    localStorage.setItem('yukti_user_gender', 'Female');
    localStorage.setItem('yukti_user_age', '61');

    // 3. CLINICAL ASSESSMENT (Mapped to Engine Format)
    // Using the EXACT answers requested by the user.
    const answers = {
        q1: "56-69",           // Age
        q2: "Diabetes",        // Metabolic
        q3: "No",              // Cardio
        q4: "Often",           // Breathless (Asthma)
        q5: "No",              // Neuro
        q6: "No",              // Neuro
        q7: "No",              // Surgery
        q8: "Severe/Daily",    // Pain (Joint/Back/Knee) - UPDATED
        q9: "No",              // Falls
        q10: "No",             // ADL
        q11: "No",             // Gut
        q12: "Sometimes",      // Mood (Stressed/Anxious) - UPDATED
        q13: "Often/Poor",     // Sleep - UPDATED
        q14: "Sometimes",      // Diet (Unhealthy) - UPDATED
        q15: "One habit"       // Habits (Smoke/Drink/No Exercise) - UPDATED
    };

    // Pre-calculated Scores (Chaaya's Profile)
    // Metabolic(15) + Respiratory/Resilience(20) + Muscular(20) + Emotional(5) + Sleep(10) + Lifestyle(5)
    // Total approx 75 => High Risk
    const scores = {
        total: 75,
        riskLevel: "High Risk: Immediate Action Required",
        categories: [
            { name: "Metabolic", score: 15, max: 15 },
            { name: "Cardiovascular", score: 0, max: 15 },
            { name: "Cognitive", score: 0, max: 20 },
            { name: "Muscular", score: 20, max: 20 },
            { name: "Frailty", score: 0, max: 20 },
            { name: "Digestive", score: 0, max: 10 },
            { name: "Emotional", score: 5, max: 10 },
            { name: "Sleep", score: 10, max: 10 },
            { name: "Lifestyle", score: 5, max: 20 },
            { name: "Resilience", score: 20, max: 35 }
        ]
    };

    localStorage.setItem('yukti_assessment_data_v2', JSON.stringify({
        answers,
        scores,
        riskLevel: "High Risk: Immediate Action Required",
        riskScore: 75
    }));

    // 4. ACTIVE MEDICINES
    const meds = [
        {
            id: 'm1', name: 'Glycomet 0.5mg', type: 'Tablet',
            dosage: '500mg', timing: 'Before Breakfast', slots: ['Morning'], instructions: 'Before Breakfast', relationToFood: 'Before Food',
            status: 'Active', category: 'Chronic'
        },
        {
            id: 'm2', name: 'Levolin Rotacaps', type: 'Inhaler',
            dosage: '100mcg', timing: 'Before Sleep', slots: ['Night'], instructions: 'Daily - Before Sleep', relationToFood: 'After Food',
            status: 'Active', category: 'Chronic'
        },
        {
            id: 'm3', name: 'Combihale FF 100', type: 'Inhaler',
            dosage: '100mg', timing: 'Before Sleep', slots: ['Night'], instructions: 'Daily - Before Sleep', relationToFood: 'After Food',
            status: 'Active', category: 'Chronic'
        },
        {
            id: 'm4', name: 'Teczine', type: 'Tablet',
            dosage: '10mg', timing: 'After 6 PM', slots: ['Evening'], instructions: 'After 6 PM (Alt Days)', relationToFood: 'After Food',
            status: 'Active', category: 'Chronic'
        },
        {
            id: 'm5', name: 'Excela Max / Coconut Oil', type: 'Lotion',
            dosage: 'Apply Generously', timing: 'Morning & Night', slots: ['Morning', 'Night'], instructions: 'For Hand Eczema & Feet', relationToFood: 'Before Food',
            status: 'Active', category: 'Supportive'
        }
    ];
    localStorage.setItem('yukti_active_meds', JSON.stringify(meds));

    // 5. HISTORY & SMART REPORTS
    // Added 'meta' field for compatibility
    const history = [
        {
            meta: { reportDate: '2025-10-12', reportType: 'Consultation' },
            date: '2025-10-12', 
            type: 'Consultation',
            summary: 'Patient reports persistent skin inflammation (Atopic Dermatitis). Asthma triggers noted in winter. HbA1c stable at 6.8%.',
            biomarkers: [
                { name: 'HbA1c', value: '6.8', unit: '%', status: 'Warning', trend: 'Stable' },
                { name: 'Eosinophils', value: 'High', unit: '', status: 'Abnormal' }
            ]
        }
    ];
    localStorage.setItem('yukti_history', JSON.stringify(history));

    // 6. LATEST HOLISTIC SUMMARY (Pre-loaded)
    const holisticSummary = {
        isSummary: true,
        title: "Holistic Health Summary",
        patientRiskProfile: "High Risk Profile: Actively managing **Diabetes** and chronic **inflammatory conditions** (Atopic Dermatitis, Asthma), requiring immediate attention for integrated care.",
        trendAnalysis: "Your reports show you've been **steadily managing your Diabetes**, which is a positive step. However, there's a **clear and ongoing pattern of inflammation and allergic reactions** affecting both your skin and breathing. This continuous internal activity, along with your feelings of stress, suggests that these parts of your health are all connected.",
        keyFindings: [
            "**Diabetes Management**: Your health assessment showed a perfect score for metabolic health (Medicated), but HbA1c is 6.8% (Warning).",
            "**Inflammation and Allergies**: Persistent skin inflammation and Asthma triggers.",
            "**Muscular Health**: Severe joint/back pain reported, impacting mobility."
        ],
        recommendation: "Integrated care plan focusing on anti-inflammatory diet, stress reduction, and strict adherence to Levolin/Combihale. Consult Orthopedist for joint pain.",
        disclaimer: "AI-Generated Summary. Verify with Doctor."
    };
    localStorage.setItem("yukti_latest_summary", JSON.stringify(holisticSummary));

    // 7. DAILY LOGS (Generate some history for the calendar)
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Today: Empty for user interaction
    localStorage.setItem('yukti_daily_log_' + todayStr, JSON.stringify({
        meds: [], 
        vitals: {}  // Clean slate
    }));

    // Yesterday: Empty for user interaction
    const yest = new Date(today); yest.setDate(yest.getDate() - 1);
    const yestStr = yest.toISOString().split('T')[0];
    localStorage.setItem('yukti_daily_log_' + yestStr, JSON.stringify({
        meds: [], 
        vitals: {}
    }));

    alert("Demo Profile Loaded: Chaaya (High Risk / Asthma / Diabetes) 🚀");
    window.location.reload();
};
