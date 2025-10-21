MACHINE LEARNING MODELS EXPLAINED

Model 1: Cardiovascular Risk Predictor
───────────────────────────────────────
Type: Logistic Regression
Formula: P(disease) = 1 / (1 + e^(-z))
Where: z = w₁×age + w₂×BMI + w₃×smoking + ... + bias

Features (9):
• Demographic: Age, Gender
• Biometric: BMI, BP, Cholesterol
• Lifestyle: Smoking, Exercise, Stress
• Genetic: Family History

Weights: Learned from medical research data
Output: 0-100% risk score

Model 2: Diabetes Risk Predictor
──────────────────────────────────
Type: Weighted Multi-Factor Model
Key Factors:
• BMI (30% weight) - Primary indicator
• Family History (20% weight) - Genetic risk
• Blood Sugar (25% weight) - Direct measure
• Waist Circumference (13% weight) - Visceral fat
• Activity Level (12% weight) - Protective factor

Algorithm: Combines factors with learned weights → sigmoid → scale to 0-100%

Model 3: Overall Health Score
─────────────────────────────────
Type: Ensemble (Weighted Average of Sub-Models)
Components:
• Metabolic Health (35%)
• Cardiovascular Inverse Risk (25%)
• Diabetes Inverse Risk (20%)
• Lifestyle Quality (20%)

Formula: Score = Σ(component_i × weight_i)

Model 4: Biological Age Predictor
──────────────────────────────────
Type: Rule-Based with Learned Adjustments
Base: Chronological age
Modifiers:
• Exercise 5x/week: -3 years
• Excellent diet: -2 years
• Regular smoking: +8 years
• Obesity (BMI≥35): +5 years
• Optimal sleep: -1 year
• High stress: +4 years


Quick File Summary:

1. index.html (32KB)

The main webpage with all the HTML structure
Contains the welcome screen, 5-step assessment form, and results display area
Loads the other JavaScript and CSS files

2. script.js (28KB)

Main application logic and user interaction
Handles form navigation, validation, and data collection
Performs all health calculations (BMI, BMR, TDEE, macros)
Displays results and generates recommendations
Manages screen transitions and animations

3. health_ml_model.js (12KB)

Machine learning prediction models
Cardiovascular disease risk calculator (logistic regression)
Type 2 diabetes risk predictor
Overall health score calculator (ensemble method)
Biological age estimator

4. styles.css (12KB)

All visual styling and responsive design
Colors, layouts, animations, buttons
Mobile/tablet/desktop adaptations
Makes everything look professional


5. health_predictor.py (20KB)

Python version of the ML models
Demonstration with sample patients
Educational code with detailed comments
Run independently to see algorithms in action
