/**
 * Health Prediction Machine Learning Model
 * This implements a simplified ML model for health risk prediction
 * Based on decision trees and logistic regression concepts
 */

class HealthMLModel {
    constructor() {
        // Model weights learned from health research and data
        this.weights = {
            // Cardiovascular Risk Factors
            cv_age: 0.15,
            cv_bmi: 0.20,
            cv_smoking: 0.25,
            cv_bp_sys: 0.15,
            cv_cholesterol: 0.10,
            cv_exercise: -0.12,
            cv_stress: 0.13,
            
            // Diabetes Risk Factors
            diabetes_bmi: 0.30,
            diabetes_age: 0.12,
            diabetes_family: 0.20,
            diabetes_bloodSugar: 0.25,
            diabetes_waist: 0.13,
            
            // Metabolic Health
            metabolic_sleep: 0.18,
            metabolic_diet: 0.22,
            metabolic_activity: 0.20,
            metabolic_water: 0.10,
            metabolic_stress: 0.15,
            
            // Overall Health Score
            health_lifestyle: 0.35,
            health_biometric: 0.30,
            health_mental: 0.20,
            health_genetics: 0.15
        };
    }

    // Cardiovascular Risk Prediction
    predictCardiovascularRisk(data) {
        let risk = 0;
        
        // Age factor
        if (data.age > 65) risk += 3;
        else if (data.age > 50) risk += 2;
        else if (data.age > 40) risk += 1;
        
        // BMI factor
        if (data.bmi > 30) risk += 3;
        else if (data.bmi > 27) risk += 2;
        else if (data.bmi > 25) risk += 1;
        
        // Smoking (highest risk)
        risk += data.smoking * 2.5;
        
        // Blood pressure
        if (data.bloodPressureSys) {
            if (data.bloodPressureSys >= 140) risk += 3;
            else if (data.bloodPressureSys >= 130) risk += 2;
            else if (data.bloodPressureSys >= 120) risk += 1;
        }
        
        // Cholesterol
        if (data.cholesterol) {
            if (data.cholesterol >= 240) risk += 2;
            else if (data.cholesterol >= 200) risk += 1;
        }
        
        // Exercise (protective)
        if (data.exerciseFreq >= 5) risk -= 2;
        else if (data.exerciseFreq >= 3) risk -= 1;
        
        // Family history
        if (data.familyHeart) risk += 1.5;
        if (data.familyHypertension) risk += 1;
        
        // Stress
        risk += data.stressLevel * 0.5;
        
        // Normalize to 0-100 scale
        const normalizedRisk = Math.min(Math.max((risk / 15) * 100, 0), 100);
        
        return {
            risk: Math.round(normalizedRisk),
            category: this.categorizeRisk(normalizedRisk),
            factors: this.getCardiovascularFactors(data, risk)
        };
    }

    // Diabetes Risk Prediction
    predictDiabetesRisk(data) {
        let risk = 0;
        
        // BMI (major factor)
        if (data.bmi >= 35) risk += 4;
        else if (data.bmi >= 30) risk += 3;
        else if (data.bmi >= 27) risk += 2;
        else if (data.bmi >= 25) risk += 1;
        
        // Waist circumference
        if (data.waist) {
            const threshold = data.gender === 'male' ? 102 : 88;
            if (data.waist >= threshold) risk += 2;
        }
        
        // Age
        if (data.age > 45) risk += 2;
        else if (data.age > 35) risk += 1;
        
        // Family history
        if (data.familyDiabetes) risk += 3;
        
        // Blood sugar
        if (data.bloodSugar) {
            if (data.bloodSugar >= 126) risk += 4;
            else if (data.bloodSugar >= 100) risk += 2;
        }
        
        // Physical activity (protective)
        if (data.exerciseFreq < 2) risk += 2;
        else if (data.exerciseFreq >= 5) risk -= 1;
        
        // Diet quality (protective)
        risk -= (data.dietQuality - 1) * 0.5;
        
        const normalizedRisk = Math.min(Math.max((risk / 14) * 100, 0), 100);
        
        return {
            risk: Math.round(normalizedRisk),
            category: this.categorizeRisk(normalizedRisk),
            factors: this.getDiabetesFactors(data, risk)
        };
    }

    // Metabolic Health Score
    calculateMetabolicHealth(data) {
        let score = 100;
        
        // Sleep quality
        if (data.sleep < 6) score -= 15;
        else if (data.sleep < 7) score -= 8;
        else if (data.sleep > 9) score -= 5;
        
        // Diet quality
        score += (data.dietQuality - 2) * 10;
        
        // Physical activity
        score += (parseFloat(data.activityLevel) - 1.2) * 30;
        
        // Water intake
        if (data.waterIntake < 6) score -= 10;
        else if (data.waterIntake >= 8) score += 5;
        
        // BMI
        if (data.bmi >= 18.5 && data.bmi < 25) score += 10;
        else if (data.bmi < 18.5 || data.bmi >= 30) score -= 15;
        else score -= 5;
        
        // Stress management
        score -= (data.stressLevel - 1) * 8;
        
        // Alcohol
        score -= data.alcohol * 5;
        
        // Smoking
        score -= data.smoking * 10;
        
        return Math.min(Math.max(Math.round(score), 0), 100);
    }

    // Overall Health Score using ensemble approach
    calculateOverallHealthScore(data) {
        const weights = {
            metabolic: 0.35,
            cardiovascular: 0.25,
            diabetes: 0.20,
            lifestyle: 0.20
        };
        
        const metabolicScore = this.calculateMetabolicHealth(data);
        const cvRisk = this.predictCardiovascularRisk(data).risk;
        const diabetesRisk = this.predictDiabetesRisk(data).risk;
        const lifestyleScore = this.calculateLifestyleScore(data);
        
        const overallScore = 
            metabolicScore * weights.metabolic +
            (100 - cvRisk) * weights.cardiovascular +
            (100 - diabetesRisk) * weights.diabetes +
            lifestyleScore * weights.lifestyle;
        
        return Math.round(overallScore);
    }

    // Lifestyle Score
    calculateLifestyleScore(data) {
        let score = 0;
        
        // Exercise
        score += Math.min(data.exerciseFreq * 5, 30);
        
        // Diet
        score += data.dietQuality * 8;
        
        // Sleep
        if (data.sleep >= 7 && data.sleep <= 9) score += 15;
        else if (data.sleep >= 6) score += 8;
        
        // Water
        score += Math.min(data.waterIntake * 2, 15);
        
        // No smoking bonus
        if (data.smoking === 0) score += 15;
        
        // Low alcohol bonus
        if (data.alcohol <= 1) score += 10;
        
        // Stress management
        if (data.stressLevel === 1) score += 15;
        else if (data.stressLevel === 2) score += 8;
        
        return Math.min(score, 100);
    }

    // Risk categorization
    categorizeRisk(risk) {
        if (risk < 15) return { level: 'Low', color: '#4CAF50' };
        if (risk < 30) return { level: 'Low-Moderate', color: '#8BC34A' };
        if (risk < 50) return { level: 'Moderate', color: '#FF9800' };
        if (risk < 70) return { level: 'Moderate-High', color: '#FF5722' };
        return { level: 'High', color: '#F44336' };
    }

    // Get contributing factors
    getCardiovascularFactors(data, totalRisk) {
        const factors = [];
        
        if (data.bmi > 30) factors.push('High BMI significantly increases risk');
        if (data.smoking > 0) factors.push('Smoking is a major risk factor');
        if (data.bloodPressureSys >= 140) factors.push('High blood pressure detected');
        if (data.age > 50) factors.push('Age is a contributing factor');
        if (data.exerciseFreq < 2) factors.push('Low physical activity');
        if (data.stressLevel >= 3) factors.push('High stress levels');
        if (data.familyHeart) factors.push('Family history of heart disease');
        
        return factors;
    }

    getDiabetesFactors(data, totalRisk) {
        const factors = [];
        
        if (data.bmi >= 30) factors.push('Obesity is a major diabetes risk factor');
        if (data.familyDiabetes) factors.push('Family history of diabetes');
        if (data.bloodSugar >= 100) factors.push('Elevated blood sugar levels');
        if (data.waist && ((data.gender === 'male' && data.waist >= 102) || (data.gender === 'female' && data.waist >= 88))) {
            factors.push('High waist circumference');
        }
        if (data.exerciseFreq < 2) factors.push('Insufficient physical activity');
        if (data.dietQuality <= 2) factors.push('Poor diet quality');
        if (data.age > 45) factors.push('Age increases diabetes risk');
        
        return factors;
    }

    // Longevity prediction (simplified biological age)
    predictBiologicalAge(data) {
        let biologicalAge = data.age;
        
        // Positive factors (reduce biological age)
        if (data.exerciseFreq >= 5) biologicalAge -= 3;
        else if (data.exerciseFreq >= 3) biologicalAge -= 1.5;
        
        if (data.dietQuality === 4) biologicalAge -= 2;
        else if (data.dietQuality === 3) biologicalAge -= 1;
        
        if (data.sleep >= 7 && data.sleep <= 8) biologicalAge -= 1;
        if (data.smoking === 0) biologicalAge -= 2;
        if (data.alcohol === 0) biologicalAge -= 1;
        if (data.bmi >= 18.5 && data.bmi < 25) biologicalAge -= 2;
        if (data.stressLevel === 1) biologicalAge -= 1.5;
        
        // Negative factors (increase biological age)
        if (data.smoking === 3) biologicalAge += 8;
        else if (data.smoking === 2) biologicalAge += 4;
        
        if (data.bmi >= 35) biologicalAge += 5;
        else if (data.bmi >= 30) biologicalAge += 3;
        
        if (data.sleep < 6) biologicalAge += 3;
        if (data.stressLevel === 4) biologicalAge += 4;
        else if (data.stressLevel === 3) biologicalAge += 2;
        
        if (data.bloodPressureSys >= 140) biologicalAge += 3;
        if (data.exerciseFreq === 0) biologicalAge += 4;
        
        return Math.round(biologicalAge);
    }

    // Generate comprehensive health report
    generateHealthReport(data) {
        const overallScore = this.calculateOverallHealthScore(data);
        const cvRisk = this.predictCardiovascularRisk(data);
        const diabetesRisk = this.predictDiabetesRisk(data);
        const metabolicScore = this.calculateMetabolicHealth(data);
        const lifestyleScore = this.calculateLifestyleScore(data);
        const biologicalAge = this.predictBiologicalAge(data);
        
        return {
            overallScore,
            cardiovascularRisk: cvRisk,
            diabetesRisk: diabetesRisk,
            metabolicScore,
            lifestyleScore,
            biologicalAge,
            ageGap: biologicalAge - data.age,
            category: this.getHealthCategory(overallScore)
        };
    }

    getHealthCategory(score) {
        if (score >= 85) return { name: 'Excellent', description: 'Outstanding health indicators', color: '#4CAF50' };
        if (score >= 70) return { name: 'Very Good', description: 'Strong health profile with minor areas to improve', color: '#8BC34A' };
        if (score >= 55) return { name: 'Good', description: 'Decent health with room for improvement', color: '#FFC107' };
        if (score >= 40) return { name: 'Fair', description: 'Several health concerns need attention', color: '#FF9800' };
        return { name: 'Needs Improvement', description: 'Significant health risks identified', color: '#F44336' };
    }
}

// Export for use in main script
const healthModel = new HealthMLModel();