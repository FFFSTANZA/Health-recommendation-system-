// Global variables
let currentQuestionIndex = 1;
const totalQuestions = 5;
let assessmentData = {};

// Start Assessment
function startAssessment() {
    console.log("Starting assessment...");
    showScreen('assessmentScreen');
    updateProgress();
}

// Show specific screen
function showScreen(screenId) {
    console.log("Showing screen:", screenId);
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    } else {
        console.error("Screen not found:", screenId);
    }
}

// Update progress bar
function updateProgress() {
    const progress = (currentQuestionIndex / totalQuestions) * 100;
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        progressFill.style.width = progress + '%';
    }
    const currentQ = document.getElementById('currentQuestion');
    const totalQ = document.getElementById('totalQuestions');
    if (currentQ) currentQ.textContent = currentQuestionIndex;
    if (totalQ) totalQ.textContent = totalQuestions;
}

// Validate current section
function validateCurrentSection() {
    const currentQuestion = document.querySelector(`.question-block[data-question="${currentQuestionIndex}"]`);
    if (!currentQuestion) return true;
    
    const requiredInputs = currentQuestion.querySelectorAll('[required]');
    
    for (let input of requiredInputs) {
        if (input.type === 'radio') {
            const radioGroup = currentQuestion.querySelectorAll(`[name="${input.name}"]`);
            const isChecked = Array.from(radioGroup).some(radio => radio.checked);
            if (!isChecked) {
                alert(`Please answer: ${input.name.replace(/([A-Z])/g, ' $1').trim()}`);
                return false;
            }
        } else if (!input.value) {
            const label = input.previousElementSibling;
            alert(`Please fill in: ${label ? label.textContent : input.name}`);
            input.focus();
            return false;
        }
    }
    return true;
}

// Save current section data
function saveCurrentSection() {
    const currentQuestion = document.querySelector(`.question-block[data-question="${currentQuestionIndex}"]`);
    if (!currentQuestion) return;
    
    const inputs = currentQuestion.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        if (input.type === 'radio' && input.checked) {
            assessmentData[input.name] = parseFloat(input.value);
        } else if (input.type === 'checkbox') {
            assessmentData[input.name] = input.checked ? 1 : 0;
        } else if (input.type === 'number' || input.tagName === 'SELECT') {
            if (input.value) {
                assessmentData[input.name] = input.type === 'number' ? parseFloat(input.value) : input.value;
            }
        }
    });
}

// Navigate to next question
function nextQuestion() {
    if (!validateCurrentSection()) return;
    
    saveCurrentSection();
    
    if (currentQuestionIndex < totalQuestions) {
        const current = document.querySelector(`.question-block[data-question="${currentQuestionIndex}"]`);
        if (current) current.classList.remove('active');
        
        currentQuestionIndex++;
        const next = document.querySelector(`.question-block[data-question="${currentQuestionIndex}"]`);
        if (next) next.classList.add('active');
        
        updateProgress();
        updateNavigationButtons();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Navigate to previous question
function previousQuestion() {
    if (currentQuestionIndex > 1) {
        saveCurrentSection();
        
        const current = document.querySelector(`.question-block[data-question="${currentQuestionIndex}"]`);
        if (current) current.classList.remove('active');
        
        currentQuestionIndex--;
        const prev = document.querySelector(`.question-block[data-question="${currentQuestionIndex}"]`);
        if (prev) prev.classList.add('active');
        
        updateProgress();
        updateNavigationButtons();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Update navigation buttons
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    if (prevBtn) prevBtn.style.display = currentQuestionIndex > 1 ? 'inline-block' : 'none';
    
    if (currentQuestionIndex === totalQuestions) {
        if (nextBtn) nextBtn.style.display = 'none';
        if (submitBtn) submitBtn.style.display = 'inline-block';
    } else {
        if (nextBtn) nextBtn.style.display = 'inline-block';
        if (submitBtn) submitBtn.style.display = 'none';
    }
}

// Submit Assessment
function submitAssessment() {
    if (!validateCurrentSection()) return;
    saveCurrentSection();
    
    // Calculate BMI
    assessmentData.bmi = calculateBMI(assessmentData.weight, assessmentData.height);
    
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.innerHTML = '🤖 Analyzing...';
        submitBtn.disabled = true;
    }
    
    setTimeout(() => {
        try {
            const results = performComprehensiveAnalysis(assessmentData);
            displayResults(results);
            showScreen('resultsScreen');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error("Analysis error:", error);
            alert("An error occurred during analysis. Please check your inputs and try again.");
            if (submitBtn) {
                submitBtn.innerHTML = '🤖 Analyze with AI';
                submitBtn.disabled = false;
            }
        }
    }, 1500);
}

// BMI Calculation
function calculateBMI(weight, height) {
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
}

// BMR Calculation
function calculateBMR(weight, height, age, gender) {
    if (gender === 'male') {
        return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        return 10 * weight + 6.25 * height - 5 * age - 161;
    }
}

// TDEE Calculation
function calculateTDEE(bmr, activityLevel) {
    return bmr * activityLevel;
}

// Ideal Weight Range
function calculateIdealWeightRange(height) {
    const heightInMeters = height / 100;
    const minWeight = 18.5 * (heightInMeters * heightInMeters);
    const maxWeight = 24.9 * (heightInMeters * heightInMeters);
    return { min: minWeight.toFixed(1), max: maxWeight.toFixed(1) };
}

// Body Fat Estimation
function calculateBodyFat(gender, waist, neck, height) {
    if (!waist || !neck) return null;
    
    try {
        if (gender === 'male') {
            const bf = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 
                       0.15456 * Math.log10(height)) - 450;
            return Math.max(5, Math.min(50, bf));
        } else {
            // For female, need hip measurement - estimate if not available
            const bf = 495 / (1.29579 - 0.35004 * Math.log10(waist - neck) + 
                       0.22100 * Math.log10(height)) - 450;
            return Math.max(10, Math.min(50, bf));
        }
    } catch {
        return null;
    }
}

// Macro Calculation
function calculateMacros(tdee, goal) {
    let calories = tdee;
    let proteinRatio = 0.30;
    let carbRatio = 0.40;
    let fatRatio = 0.30;
    
    switch(goal) {
        case 'lose_weight':
            calories = tdee * 0.85;
            proteinRatio = 0.35;
            carbRatio = 0.35;
            fatRatio = 0.30;
            break;
        case 'gain_muscle':
            calories = tdee * 1.10;
            proteinRatio = 0.35;
            carbRatio = 0.45;
            fatRatio = 0.20;
            break;
        case 'maintain':
            calories = tdee;
            break;
        case 'improve_health':
            calories = tdee;
            break;
    }
    
    return {
        calories: Math.round(calories),
        protein: Math.round((calories * proteinRatio) / 4),
        carbs: Math.round((calories * carbRatio) / 4),
        fats: Math.round((calories * fatRatio) / 9)
    };
}

// Comprehensive Analysis
function performComprehensiveAnalysis(data) {
    console.log("Performing analysis with data:", data);
    
    // Use ML model for predictions
    const mlReport = healthModel.generateHealthReport(data);
    
    // Calculate body metrics
    const bmr = calculateBMR(data.weight, data.height, data.age, data.gender);
    const tdee = calculateTDEE(bmr, data.activityLevel);
    const idealWeightRange = calculateIdealWeightRange(data.height);
    const bodyFat = calculateBodyFat(data.gender, data.waist, data.neck, data.height);
    
    // Calculate macros
    const macros = calculateMacros(tdee, data.healthGoal || 'maintain');
    
    // Generate recommendations
    const recommendations = generateRecommendations(data, mlReport);
    
    return {
        mlReport,
        bmi: data.bmi,
        bmr,
        tdee,
        idealWeightRange,
        bodyFat,
        macros,
        recommendations,
        timestamp: new Date()
    };
}

// Generate Recommendations
function generateRecommendations(data, mlReport) {
    const recommendations = {
        nutrition: [],
        exercise: [],
        lifestyle: [],
        priority: []
    };
    
    // Nutrition
    if (data.dietQuality <= 2) {
        recommendations.nutrition.push({
            priority: 'high',
            title: 'Improve Diet Quality',
            description: 'Focus on whole foods: vegetables, fruits, lean proteins, whole grains.',
            actions: [
                'Meal prep on Sundays',
                'Replace processed snacks with fruits',
                'Add vegetables to each meal',
                'Cook at home 5 days/week'
            ]
        });
        recommendations.priority.push('Transform your diet to whole foods');
    }
    
    if (data.waterIntake < 8) {
        recommendations.nutrition.push({
            priority: 'medium',
            title: 'Increase Water Intake',
            description: `Currently drinking ${data.waterIntake} glasses. Aim for 8-10 daily.`,
            actions: [
                'Keep water bottle at desk',
                'Set hourly reminders',
                'Drink before meals'
            ]
        });
    }
    
    // Exercise
    if (data.exerciseFreq < 3) {
        recommendations.exercise.push({
            priority: 'high',
            title: 'Increase Physical Activity',
            description: 'Regular exercise is crucial for health.',
            actions: [
                'Start with 20-min walks 3x/week',
                'Gradually increase to 150 min/week',
                'Find activities you enjoy',
                'Schedule workouts like meetings'
            ]
        });
        recommendations.priority.push('Begin regular exercise - start with 20 minutes, 3 days/week');
    }
    
    // Lifestyle
    if (data.sleep < 7) {
        recommendations.lifestyle.push({
            priority: 'critical',
            title: 'Improve Sleep Duration',
            description: `You're sleeping ${data.sleep} hours. Aim for 7-9 hours.`,
            actions: [
                'Set consistent bedtime',
                'Create bedtime routine',
                'Avoid screens 1hr before bed',
                'Keep bedroom cool and dark'
            ]
        });
        recommendations.priority.push('CRITICAL: Increase sleep to 7-9 hours');
    }
    
    if (data.smoking > 0) {
        recommendations.lifestyle.push({
            priority: 'critical',
            title: 'Smoking Cessation',
            description: 'Quitting is the single best thing for your health.',
            actions: [
                'Consult doctor about cessation',
                'Consider nicotine replacement',
                'Join support group',
                'Avoid triggers'
            ]
        });
        recommendations.priority.unshift('URGENT: Quit smoking - seek professional help');
    }
    
    if (data.stressLevel >= 3) {
        recommendations.lifestyle.push({
            priority: 'high',
            title: 'Stress Management',
            description: 'Chronic stress impacts health significantly.',
            actions: [
                'Practice meditation 10 min daily',
                'Consider therapy',
                'Exercise regularly',
                'Set boundaries'
            ]
        });
        recommendations.priority.push('Implement daily stress management');
    }
    
    if (recommendations.priority.length === 0) {
        recommendations.priority = [
            'Maintain your current healthy habits',
            'Annual health checkups',
            'Share healthy lifestyle with others'
        ];
    }
    
    return recommendations;
}

// Display Results
function displayResults(results) {
    console.log("Displaying results:", results);
    
    const analysisDate = document.getElementById('analysisDate');
    if (analysisDate) {
        analysisDate.textContent = 'Analysis Date: ' + results.timestamp.toLocaleDateString() + 
                                   ' at ' + results.timestamp.toLocaleTimeString();
    }
    
    // Display scores
    animateScore(results.mlReport.overallScore);
    
    const scoreCategory = document.getElementById('scoreCategory');
    if (scoreCategory) {
        scoreCategory.textContent = results.mlReport.category.name;
        scoreCategory.style.color = results.mlReport.category.color;
    }
    
    // Display other sections
    displayBMIAnalysis(results.bmi, assessmentData.gender);
    displayBodyComposition(results);
    displayCalorieBreakdown(results);
    displayAIPredictions(results.mlReport);
    displayRecommendationTabs(results.recommendations, results.mlReport);
    displayGoalPlan(results, assessmentData);
    
    if (assessmentData.bloodPressureSys) {
        displayVitalSigns(assessmentData);
    }
}

// Animate Score
function animateScore(score) {
    const circle = document.getElementById('scoreCircle');
    const scoreNumber = document.getElementById('overallScore');
    if (!circle || !scoreNumber) return;
    
    const circumference = 2 * Math.PI * 65;
    let color = score >= 70 ? '#4CAF50' : score >= 50 ? '#FF9800' : '#f44336';
    circle.style.stroke = color;
    
    let current = 0;
    const interval = setInterval(() => {
        if (current < score) {
            current++;
            scoreNumber.textContent = current;
            const offset = circumference - (current / 100) * circumference;
            circle.style.strokeDashoffset = offset;
        } else {
            clearInterval(interval);
        }
    }, 20);
}

// Display BMI Analysis
function displayBMIAnalysis(bmi, gender) {
    const bmiValue = document.getElementById('bmiValue');
    const bmiCategory = document.getElementById('bmiCategory');
    const bmiDescription = document.getElementById('bmiDescription');
    const bmiScale = document.getElementById('bmiScale');
    
    if (!bmiValue) return;
    
    bmiValue.textContent = bmi.toFixed(1);
    
    let category, color, description;
    if (bmi < 18.5) {
        category = 'Underweight';
        color = '#2196F3';
        description = 'Your BMI suggests underweight. Consider nutritionist consultation.';
    } else if (bmi < 25) {
        category = 'Normal Weight';
        color = '#4CAF50';
        description = 'Excellent! Your BMI is in healthy range.';
    } else if (bmi < 30) {
        category = 'Overweight';
        color = '#FF9800';
        description = 'Your BMI suggests overweight. Focus on gradual weight loss.';
    } else {
        category = 'Obese';
        color = '#f44336';
        description = 'Your BMI indicates obesity. Medical consultation recommended.';
    }
    
    if (bmiCategory) {
        bmiCategory.textContent = category;
        bmiCategory.style.color = color;
    }
    if (bmiDescription) bmiDescription.textContent = description;
    
    if (bmiScale) {
        bmiScale.innerHTML = `
            <div style="display: flex; height: 30px; border-radius: 15px; overflow: hidden;">
                <div style="flex: 18.5; background: #2196F3;"></div>
                <div style="flex: 6.5; background: #4CAF50;"></div>
                <div style="flex: 5; background: #FF9800;"></div>
                <div style="flex: 20; background: #f44336;"></div>
            </div>
            <div style="position: relative; height: 20px;">
                <div style="position: absolute; left: ${Math.min((bmi / 50) * 100, 98)}%; 
                    transform: translateX(-50%); top: -5px;">
                    <div style="width: 0; height: 0; border-left: 8px solid transparent; 
                        border-right: 8px solid transparent; border-bottom: 12px solid ${color};"></div>
                </div>
            </div>
        `;
    }
}

// Display Body Composition
function displayBodyComposition(results) {
    const container = document.getElementById('bodyComposition');
    if (!container) return;
    
    let html = `
        <div class="metric-item" style="margin-bottom: 15px;">
            <strong>Current Weight:</strong> ${assessmentData.weight.toFixed(1)} kg
        </div>
        <div class="metric-item" style="margin-bottom: 15px;">
            <strong>Ideal Weight Range:</strong> ${results.idealWeightRange.min} - ${results.idealWeightRange.max} kg
        </div>
    `;
    
    if (results.bodyFat) {
        html += `
            <div class="metric-item" style="margin-bottom: 15px;">
                <strong>Estimated Body Fat:</strong> ${results.bodyFat.toFixed(1)}%
                <br><small style="color: #666;">US Navy Method</small>
            </div>
        `;
    }
    
    const ageGap = results.mlReport.ageGap;
    html += `
        <div class="metric-item" style="padding: 15px; background: ${
            ageGap <= 0 ? '#e8f5e9' : '#ffebee'
        }; border-radius: 10px; margin-top: 15px;">
            <strong>Biological Age:</strong> ${results.mlReport.biologicalAge} years
            <br>
            <span style="color: ${ageGap <= 0 ? '#4CAF50' : '#f44336'}; font-weight: 600;">
                ${ageGap === 0 ? 'Same as chronological age' :
                  ageGap < 0 ? `${Math.abs(ageGap)} years younger!` :
                  `${ageGap} years older`}
            </span>
        </div>
    `;
    
    container.innerHTML = html;
}

// Display Calorie Breakdown
function displayCalorieBreakdown(results) {
    const container = document.getElementById('calorieBreakdown');
    if (!container) return;
    
    container.innerHTML = `
        <div class="metric-item" style="margin-bottom: 15px;">
            <strong>BMR:</strong> ${Math.round(results.bmr)} cal/day
            <br><small>Calories burned at rest</small>
        </div>
        <div class="metric-item" style="margin-bottom: 15px;">
            <strong>TDEE:</strong> ${Math.round(results.tdee)} cal/day
            <br><small>Including activity</small>
        </div>
        <div style="padding: 20px; background: white; border-radius: 10px; margin-top: 20px;">
            <h4>Recommended Daily Intake</h4>
            <div style="font-size: 1.2em; font-weight: 700; color: #4CAF50; margin: 15px 0;">
                ${results.macros.calories} calories/day
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                <div style="text-align: center; padding: 15px; background: #e3f2fd; border-radius: 8px;">
                    <div style="font-size: 1.5em; font-weight: 700; color: #1976D2;">${results.macros.protein}g</div>
                    <div style="color: #666;">Protein</div>
                </div>
                <div style="text-align: center; padding: 15px; background: #fff3e0; border-radius: 8px;">
                    <div style="font-size: 1.5em; font-weight: 700; color: #F57C00;">${results.macros.carbs}g</div>
                    <div style="color: #666;">Carbs</div>
                </div>
                <div style="text-align: center; padding: 15px; background: #fce4ec; border-radius: 8px;">
                    <div style="font-size: 1.5em; font-weight: 700; color: #C2185B;">${results.macros.fats}g</div>
                    <div style="color: #666;">Fats</div>
                </div>
            </div>
        </div>
    `;
}

// Display AI Predictions
function displayAIPredictions(mlReport) {
    const container = document.getElementById('healthPredictions');
    if (!container) return;
    
    container.innerHTML = `
        <div style="margin-bottom: 20px; padding: 20px; background: white; border-radius: 10px;">
            <h4>❤️ Cardiovascular Risk</h4>
            <div style="font-size: 2em; font-weight: 700; color: ${mlReport.cardiovascularRisk.category.color};">
                ${mlReport.cardiovascularRisk.risk}%
            </div>
            <div>${mlReport.cardiovascularRisk.category.level} Risk</div>
        </div>
        <div style="margin-bottom: 20px; padding: 20px; background: white; border-radius: 10px;">
            <h4>🩸 Diabetes Risk</h4>
            <div style="font-size: 2em; font-weight: 700; color: ${mlReport.diabetesRisk.category.color};">
                ${mlReport.diabetesRisk.risk}%
            </div>
            <div>${mlReport.diabetesRisk.category.level} Risk</div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div style="padding: 15px; background: white; border-radius: 10px; text-align: center;">
                <div style="font-size: 2em; font-weight: 700; color: #4CAF50;">${mlReport.metabolicScore}</div>
                <div>Metabolic Score</div>
            </div>
            <div style="padding: 15px; background: white; border-radius: 10px; text-align: center;">
                <div style="font-size: 2em; font-weight: 700; color: #2196F3;">${mlReport.lifestyleScore}</div>
                <div>Lifestyle Score</div>
            </div>
        </div>
    `;
}

// Display Vital Signs
function displayVitalSigns(data) {
    const card = document.getElementById('vitalSignsCard');
    const container = document.getElementById('vitalSigns');
    if (!card || !container) return;
    
    card.style.display = 'block';
    let html = '';
    
    if (data.bloodPressureSys && data.bloodPressureDia) {
        const status = data.bloodPressureSys < 120 ? 'Normal' : 
                      data.bloodPressureSys < 140 ? 'Elevated' : 'High';
        const color = data.bloodPressureSys < 120 ? '#4CAF50' : 
                     data.bloodPressureSys < 140 ? '#FF9800' : '#f44336';
        
        html += `
            <div style="padding: 15px; background: #f5f5f5; border-radius: 8px; margin-bottom: 15px;">
                <strong>Blood Pressure:</strong> ${data.bloodPressureSys}/${data.bloodPressureDia} mmHg
                <br><span style="color: ${color};">${status}</span>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// Display Recommendation Tabs
function displayRecommendationTabs(recommendations, mlReport) {
    const nutritionTab = document.getElementById('nutritionRecommendations');
    const exerciseTab = document.getElementById('exerciseRecommendations');
    const lifestyleTab = document.getElementById('lifestyleRecommendations');
    
    // Nutrition
    if (nutritionTab) {
        let html = recommendations.nutrition.length > 0 ? '' : '<p style="color: #4CAF50;">Excellent nutrition habits!</p>';
        recommendations.nutrition.forEach((rec, i) => {
            html += `
                <div style="margin-bottom: 25px; padding: 20px; background: white; border-radius: 10px;">
                    <h4>${i + 1}. ${rec.title}</h4>
                    <p>${rec.description}</p>
                    <ul>
                        ${rec.actions.map(a => `<li>${a}</li>`).join('')}
                    </ul>
                </div>
            `;
        });
        nutritionTab.innerHTML = html;
    }
    
    // Exercise
    if (exerciseTab) {
        let html = recommendations.exercise.length > 0 ? '' : '<p style="color: #4CAF50;">Great exercise routine!</p>';
        recommendations.exercise.forEach((rec, i) => {
            html += `
                <div style="margin-bottom: 25px; padding: 20px; background: white; border-radius: 10px;">
                    <h4>${i + 1}. ${rec.title}</h4>
                    <p>${rec.description}</p>
                    <ul>
                        ${rec.actions.map(a => `<li>${a}</li>`).join('')}
                    </ul>
                </div>
            `;
        });
        exerciseTab.innerHTML = html;
    }
    
    // Lifestyle
    if (lifestyleTab) {
        let html = recommendations.lifestyle.length > 0 ? '' : '<p style="color: #4CAF50;">Excellent lifestyle habits!</p>';
        recommendations.lifestyle.forEach((rec, i) => {
            html += `
                <div style="margin-bottom: 25px; padding: 20px; background: white; border-radius: 10px;">
                    <h4>${i + 1}. ${rec.title}</h4>
                    <p>${rec.description}</p>
                    <ul>
                        ${rec.actions.map(a => `<li>${a}</li>`).join('')}
                    </ul>
                </div>
            `;
        });
        lifestyleTab.innerHTML = html;
    }
}

// Display Goal Plan
function displayGoalPlan(results, data) {
    const container = document.getElementById('goalPlan');
    if (!container) return;
    
    let html = `
        <div style="padding: 25px; background: white; border-radius: 15px;">
            <h3>🎯 Your Health Goal Plan</h3>
            <div style="margin-top: 20px; padding: 20px; background: #fff3e0; border-radius: 10px;">
                <h4>Top Priority Actions</h4>
                <ol>
                    ${results.recommendations.priority.map(p => `<li style="margin-bottom: 12px;">${p}</li>`).join('')}
                </ol>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// Tab switching
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    const selectedTab = document.getElementById(tabName + 'Tab');
    if (selectedTab) selectedTab.classList.add('active');
    
    event.target.classList.add('active');
}

// Download Report
function downloadReport() {
    window.print();
}

// Restart Assessment
function restartAssessment() {
    currentQuestionIndex = 1;
    assessmentData = {};
    
    document.getElementById('assessmentForm').reset();
    
    document.querySelectorAll('.question-block').forEach(block => {
        block.classList.remove('active');
    });
    document.querySelector('.question-block[data-question="1"]').classList.add('active');
    
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.innerHTML = '🤖 Analyze with AI';
        submitBtn.disabled = false;
    }
    
    updateNavigationButtons();
    updateProgress();
    showScreen('welcomeScreen');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log("Page loaded and script initialized");
    updateProgress();
    updateNavigationButtons();
});