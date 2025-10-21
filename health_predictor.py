"""
Advanced Health Prediction System - Python Implementation
This demonstrates REAL machine learning concepts for health prediction
Uses scikit-learn compatible structure (without external dependencies for portability)
"""

import json
import math
from datetime import datetime

class HealthDataProcessor:
    """Processes and normalizes health data for ML model"""
    
    def normalize_bmi(self, bmi):
        """Normalize BMI to 0-1 scale"""
        # BMI typically ranges from 15 to 40
        return max(0, min(1, (bmi - 15) / 25))
    
    def normalize_age(self, age):
        """Normalize age to 0-1 scale"""
        return age / 100
    
    def calculate_bmi(self, weight_kg, height_cm):
        """Calculate Body Mass Index"""
        height_m = height_cm / 100
        return weight_kg / (height_m ** 2)
    
    def calculate_bmr_mifflin(self, weight_kg, height_cm, age, gender):
        """Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation"""
        if gender == 'male':
            return 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
        else:
            return 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
    
    def calculate_tdee(self, bmr, activity_multiplier):
        """Calculate Total Daily Energy Expenditure"""
        return bmr * activity_multiplier
    
    def calculate_body_fat_navy(self, gender, waist_cm, neck_cm, height_cm, hip_cm=None):
        """Calculate body fat percentage using US Navy Method"""
        try:
            if gender == 'male':
                bf = 495 / (1.0324 - 0.19077 * math.log10(waist_cm - neck_cm) + 
                           0.15456 * math.log10(height_cm)) - 450
                return max(5, min(50, bf))
            elif gender == 'female' and hip_cm:
                bf = 495 / (1.29579 - 0.35004 * math.log10(waist_cm + hip_cm - neck_cm) + 
                           0.22100 * math.log10(height_cm)) - 450
                return max(10, min(50, bf))
        except:
            return None
        return None


class CardiovascularRiskPredictor:
    """
    Predicts cardiovascular disease risk using Framingham-inspired model
    Features: age, gender, BMI, smoking, blood pressure, cholesterol, exercise
    """
    
    def __init__(self):
        # Learned weights (simulating trained model)
        self.weights = {
            'age': 0.05,
            'bmi': 0.08,
            'smoking': 0.15,
            'bp_systolic': 0.006,
            'cholesterol': 0.003,
            'hdl_ratio': -0.02,
            'exercise': -0.03,
            'family_history': 0.10,
            'stress': 0.04,
            'gender_male': 0.08
        }
        self.intercept = -12.0
    
    def predict_risk(self, features):
        """
        Predicts 10-year cardiovascular risk percentage
        Returns: risk score (0-100)
        """
        # Extract features
        age = features.get('age', 50)
        bmi = features.get('bmi', 25)
        smoking = features.get('smoking', 0)  # 0-3 scale
        bp_sys = features.get('blood_pressure_systolic', 120)
        cholesterol = features.get('cholesterol', 180)
        exercise_freq = features.get('exercise_frequency', 0)
        family_history = 1 if features.get('family_heart_disease', False) else 0
        stress = features.get('stress_level', 1)  # 1-4 scale
        gender = features.get('gender', 'male')
        
        # Calculate linear combination (logistic regression style)
        z = self.intercept
        z += self.weights['age'] * age
        z += self.weights['bmi'] * (bmi - 25)  # Centered around normal BMI
        z += self.weights['smoking'] * smoking
        z += self.weights['bp_systolic'] * (bp_sys - 120)
        z += self.weights['cholesterol'] * (cholesterol - 200)
        z += self.weights['exercise'] * exercise_freq
        z += self.weights['family_history'] * family_history
        z += self.weights['stress'] * stress
        z += self.weights['gender_male'] * (1 if gender == 'male' else 0)
        
        # Apply sigmoid function for probability
        risk_probability = 1 / (1 + math.exp(-z))
        
        # Scale to 0-100
        risk_score = risk_probability * 100
        
        # Apply additional modifiers for extreme cases
        if smoking == 3 and bmi > 35:
            risk_score = min(risk_score * 1.5, 100)
        if bp_sys > 160 or cholesterol > 280:
            risk_score = min(risk_score * 1.3, 100)
        
        return max(0, min(100, risk_score))
    
    def get_contributing_factors(self, features, risk_score):
        """Identifies which factors contribute most to the risk"""
        factors = []
        
        if features.get('smoking', 0) > 0:
            factors.append(('Smoking', features['smoking'] * self.weights['smoking'] * 100))
        if features.get('bmi', 25) > 30:
            factors.append(('High BMI', (features['bmi'] - 25) * self.weights['bmi'] * 100))
        if features.get('blood_pressure_systolic', 120) > 140:
            factors.append(('Hypertension', (features['blood_pressure_systolic'] - 120) * self.weights['bp_systolic'] * 100))
        if features.get('age', 50) > 55:
            factors.append(('Age', features['age'] * self.weights['age'] * 10))
        if features.get('cholesterol', 180) > 240:
            factors.append(('High Cholesterol', (features['cholesterol'] - 200) * self.weights['cholesterol'] * 100))
        
        # Sort by impact
        factors.sort(key=lambda x: abs(x[1]), reverse=True)
        return [(f[0], abs(f[1])) for f in factors[:5]]


class DiabetesRiskPredictor:
    """
    Predicts Type 2 Diabetes risk using logistic regression approach
    Features: BMI, age, family history, activity level, diet quality
    """
    
    def __init__(self):
        self.weights = {
            'bmi': 0.12,
            'age': 0.04,
            'family_history': 0.20,
            'waist_circumference': 0.05,
            'exercise': -0.08,
            'diet_quality': -0.06,
            'blood_sugar': 0.02
        }
        self.intercept = -15.0
    
    def predict_risk(self, features):
        """
        Predicts diabetes risk percentage
        Returns: risk score (0-100)
        """
        bmi = features.get('bmi', 25)
        age = features.get('age', 50)
        family_diabetes = 1 if features.get('family_diabetes', False) else 0
        waist = features.get('waist_circumference', 80)
        exercise = features.get('exercise_frequency', 0)
        diet = features.get('diet_quality', 2)  # 1-4 scale
        blood_sugar = features.get('fasting_blood_sugar', 90)
        gender = features.get('gender', 'male')
        
        # Gender-specific waist threshold
        waist_threshold = 102 if gender == 'male' else 88
        waist_risk = max(0, waist - waist_threshold)
        
        # Calculate risk score
        z = self.intercept
        z += self.weights['bmi'] * (bmi - 25)
        z += self.weights['age'] * (age - 40)
        z += self.weights['family_history'] * family_diabetes * 5
        z += self.weights['waist_circumference'] * waist_risk
        z += self.weights['exercise'] * exercise
        z += self.weights['diet_quality'] * (diet - 2)
        z += self.weights['blood_sugar'] * (blood_sugar - 90)
        
        # Sigmoid transformation
        risk_probability = 1 / (1 + math.exp(-z))
        risk_score = risk_probability * 100
        
        # Extreme case modifiers
        if blood_sugar >= 126:
            risk_score = max(risk_score, 75)
        if bmi >= 35 and family_diabetes:
            risk_score = min(risk_score * 1.4, 95)
        
        return max(0, min(100, risk_score))


class HealthScoreCalculator:
    """
    Calculates overall health score using weighted ensemble
    Combines multiple health dimensions
    """
    
    def __init__(self):
        self.dimension_weights = {
            'physical_fitness': 0.25,
            'metabolic_health': 0.25,
            'mental_wellbeing': 0.20,
            'lifestyle_habits': 0.20,
            'preventive_care': 0.10
        }
    
    def calculate_physical_fitness_score(self, features):
        """Score based on exercise, BMI, body composition"""
        score = 50
        
        bmi = features.get('bmi', 25)
        if 18.5 <= bmi <= 24.9:
            score += 25
        elif 25 <= bmi <= 29.9:
            score += 10
        elif bmi < 18.5 or bmi >= 35:
            score -= 15
        
        exercise = features.get('exercise_frequency', 0)
        score += min(exercise * 5, 25)
        
        return max(0, min(100, score))
    
    def calculate_metabolic_health_score(self, features):
        """Score based on blood markers, BMI, diet"""
        score = 70
        
        blood_sugar = features.get('fasting_blood_sugar', 90)
        if blood_sugar < 100:
            score += 15
        elif blood_sugar >= 126:
            score -= 30
        else:
            score -= 10
        
        bp_sys = features.get('blood_pressure_systolic', 120)
        if bp_sys < 120:
            score += 10
        elif bp_sys >= 140:
            score -= 20
        else:
            score -= 5
        
        cholesterol = features.get('cholesterol', 180)
        if cholesterol < 200:
            score += 5
        elif cholesterol >= 240:
            score -= 15
        
        return max(0, min(100, score))
    
    def calculate_mental_wellbeing_score(self, features):
        """Score based on stress, sleep, social connections"""
        score = 60
        
        sleep = features.get('sleep_hours', 7)
        if 7 <= sleep <= 9:
            score += 20
        elif sleep < 6:
            score -= 20
        else:
            score += 10
        
        stress = features.get('stress_level', 2)
        score -= (stress - 1) * 10
        
        social = features.get('social_interaction', 2)
        score += social * 5
        
        return max(0, min(100, score))
    
    def calculate_lifestyle_habits_score(self, features):
        """Score based on smoking, alcohol, diet, water"""
        score = 60
        
        if features.get('smoking', 0) == 0:
            score += 20
        elif features.get('smoking', 0) == 3:
            score -= 30
        else:
            score -= 10
        
        diet = features.get('diet_quality', 2)
        score += (diet - 2) * 10
        
        water = features.get('water_intake', 6)
        if water >= 8:
            score += 10
        elif water < 4:
            score -= 10
        
        alcohol = features.get('alcohol_consumption', 1)
        score -= alcohol * 5
        
        return max(0, min(100, score))
    
    def calculate_overall_score(self, features):
        """Calculate weighted overall health score"""
        scores = {
            'physical_fitness': self.calculate_physical_fitness_score(features),
            'metabolic_health': self.calculate_metabolic_health_score(features),
            'mental_wellbeing': self.calculate_mental_wellbeing_score(features),
            'lifestyle_habits': self.calculate_lifestyle_habits_score(features),
            'preventive_care': 70  # Default score for preventive care
        }
        
        overall = sum(
            scores[dim] * self.dimension_weights[dim]
            for dim in scores
        )
        
        return {
            'overall_score': round(overall),
            'dimension_scores': scores,
            'category': self.categorize_score(overall)
        }
    
    def categorize_score(self, score):
        """Categorize health score"""
        if score >= 85:
            return {'name': 'Excellent', 'color': '#4CAF50'}
        elif score >= 70:
            return {'name': 'Good', 'color': '#8BC34A'}
        elif score >= 55:
            return {'name': 'Fair', 'color': '#FFC107'}
        elif score >= 40:
            return {'name': 'Poor', 'color': '#FF9800'}
        else:
            return {'name': 'Critical', 'color': '#F44336'}


class HealthPredictionSystem:
    """Main system that coordinates all predictors"""
    
    def __init__(self):
        self.data_processor = HealthDataProcessor()
        self.cv_predictor = CardiovascularRiskPredictor()
        self.diabetes_predictor = DiabetesRiskPredictor()
        self.health_calculator = HealthScoreCalculator()
    
    def analyze(self, user_data):
        """Perform complete health analysis"""
        
        # Calculate derived metrics
        bmi = self.data_processor.calculate_bmi(
            user_data['weight'], 
            user_data['height']
        )
        user_data['bmi'] = bmi
        
        bmr = self.data_processor.calculate_bmr_mifflin(
            user_data['weight'],
            user_data['height'],
            user_data['age'],
            user_data['gender']
        )
        
        tdee = self.data_processor.calculate_tdee(
            bmr,
            user_data.get('activity_level', 1.2)
        )
        
        # Make predictions
        cv_risk = self.cv_predictor.predict_risk(user_data)
        cv_factors = self.cv_predictor.get_contributing_factors(user_data, cv_risk)
        
        diabetes_risk = self.diabetes_predictor.predict_risk(user_data)
        
        health_scores = self.health_calculator.calculate_overall_score(user_data)
        
        # Generate comprehensive report
        report = {
            'timestamp': datetime.now().isoformat(),
            'user_profile': {
                'age': user_data['age'],
                'gender': user_data['gender'],
                'bmi': round(bmi, 1),
                'bmr': round(bmr),
                'tdee': round(tdee)
            },
            'health_score': health_scores,
            'risk_predictions': {
                'cardiovascular': {
                    'risk_percentage': round(cv_risk, 1),
                    'risk_level': self.categorize_risk(cv_risk),
                    'contributing_factors': cv_factors
                },
                'diabetes': {
                    'risk_percentage': round(diabetes_risk, 1),
                    'risk_level': self.categorize_risk(diabetes_risk)
                }
            },
            'recommendations': self.generate_recommendations(user_data, cv_risk, diabetes_risk, health_scores)
        }
        
        return report
    
    def categorize_risk(self, risk):
        """Categorize risk level"""
        if risk < 15:
            return 'Low'
        elif risk < 30:
            return 'Low-Moderate'
        elif risk < 50:
            return 'Moderate'
        elif risk < 70:
            return 'Moderate-High'
        else:
            return 'High'
    
    def generate_recommendations(self, user_data, cv_risk, diabetes_risk, health_scores):
        """Generate personalized recommendations"""
        recommendations = []
        
        if cv_risk > 50:
            recommendations.append({
                'priority': 'HIGH',
                'category': 'Cardiovascular Health',
                'action': 'Immediate consultation with cardiologist recommended. Start cardiac risk reduction program.'
            })
        
        if diabetes_risk > 50:
            recommendations.append({
                'priority': 'HIGH',
                'category': 'Diabetes Prevention',
                'action': 'High diabetes risk detected. Consult endocrinologist. Implement diabetes prevention program.'
            })
        
        if user_data.get('bmi', 25) > 30:
            recommendations.append({
                'priority': 'MEDIUM',
                'category': 'Weight Management',
                'action': 'Focus on gradual weight loss through calorie deficit and increased physical activity.'
            })
        
        if user_data.get('exercise_frequency', 0) < 3:
            recommendations.append({
                'priority': 'MEDIUM',
                'category': 'Physical Activity',
                'action': 'Increase exercise to at least 150 minutes of moderate activity per week.'
            })
        
        if user_data.get('smoking', 0) > 0:
            recommendations.append({
                'priority': 'CRITICAL',
                'category': 'Smoking Cessation',
                'action': 'Quit smoking immediately. Seek professional cessation program.'
            })
        
        return recommendations


def demonstrate_system():
    """Demonstrate the prediction system with sample data"""
    
    print("=" * 80)
    print("ADVANCED HEALTH PREDICTION SYSTEM - ML DEMONSTRATION")
    print("=" * 80)
    print()
    
    # Create sample patients
    patients = [
        {
            'name': 'Patient A - Low Risk',
            'data': {
                'age': 35,
                'gender': 'male',
                'height': 175,
                'weight': 75,
                'activity_level': 1.55,
                'exercise_frequency': 5,
                'smoking': 0,
                'alcohol_consumption': 0,
                'blood_pressure_systolic': 115,
                'cholesterol': 180,
                'fasting_blood_sugar': 85,
                'diet_quality': 4,
                'water_intake': 8,
                'sleep_hours': 7.5,
                'stress_level': 1,
                'family_heart_disease': False,
                'family_diabetes': False
            }
        },
        {
            'name': 'Patient B - High Risk',
            'data': {
                'age': 55,
                'gender': 'male',
                'height': 175,
                'weight': 105,
                'waist_circumference': 110,
                'activity_level': 1.2,
                'exercise_frequency': 0,
                'smoking': 3,
                'alcohol_consumption': 3,
                'blood_pressure_systolic': 155,
                'cholesterol': 260,
                'fasting_blood_sugar': 115,
                'diet_quality': 1,
                'water_intake': 3,
                'sleep_hours': 5,
                'stress_level': 4,
                'family_heart_disease': True,
                'family_diabetes': True
            }
        }
    ]
    
    system = HealthPredictionSystem()
    
    for patient in patients:
        print(f"\n{'='*80}")
        print(f"ANALYSIS: {patient['name']}")
        print('='*80)
        
        report = system.analyze(patient['data'])
        
        print(f"\n📊 USER PROFILE:")
        print(f"   Age: {report['user_profile']['age']} years")
        print(f"   Gender: {report['user_profile']['gender'].title()}")
        print(f"   BMI: {report['user_profile']['bmi']}")
        print(f"   BMR: {report['user_profile']['bmr']} cal/day")
        print(f"   TDEE: {report['user_profile']['tdee']} cal/day")
        
        print(f"\n🎯 OVERALL HEALTH SCORE: {report['health_score']['overall_score']}/100")
        print(f"   Category: {report['health_score']['category']['name']}")
        
        print(f"\n   Dimension Breakdown:")
        for dim, score in report['health_score']['dimension_scores'].items():
            print(f"   - {dim.replace('_', ' ').title()}: {score}/100")
        
        print(f"\n❤️  CARDIOVASCULAR RISK:")
        cv = report['risk_predictions']['cardiovascular']
        print(f"   Risk Score: {cv['risk_percentage']}%")
        print(f"   Risk Level: {cv['risk_level']}")
        if cv['contributing_factors']:
            print(f"   Top Contributing Factors:")
            for factor, impact in cv['contributing_factors']:
                print(f"   - {factor}: {impact:.1f}% impact")
        
        print(f"\n🩸 DIABETES RISK:")
        db = report['risk_predictions']['diabetes']
        print(f"   Risk Score: {db['risk_percentage']}%")
        print(f"   Risk Level: {db['risk_level']}")
        
        print(f"\n💡 RECOMMENDATIONS:")
        for rec in report['recommendations']:
            print(f"   [{rec['priority']}] {rec['category']}: {rec['action']}")
        
        print()
    
    print("=" * 80)
    print("DEMONSTRATION COMPLETE")
    print("=" * 80)
    print("\nThis system uses real machine learning concepts including:")
    print("- Logistic regression for binary classification")
    print("- Feature engineering and normalization")
    print("- Weighted ensemble methods")
    print("- Risk stratification algorithms")
    print("- Evidence-based medical formulas (Mifflin-St Jeor, US Navy Method)")
    print()


if __name__ == "__main__":
    demonstrate_system()