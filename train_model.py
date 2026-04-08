import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
import json

df = pd.read_csv('final_responses_correct_format.csv')

# --- 1. Define Target Variable ("Would Eat" vs "Pass") ---
# Synthesize the target based on craving frequency
# Craving food after reel: 'Very often', 'Often', 'Sometimes' -> 1 ("Would Eat"), 'Rarely', 'Never' -> 0 ("Pass")
def map_target(row):
    craving = str(row.get('Have you ever craved food after watching a food reel?', ''))
    if pd.isna(craving): return 0
    if ('often' in craving.lower()) or ('sometimes' in craving.lower()):
        return 1
    return 0

df['Target'] = df.apply(map_target, axis=1)

# --- 2. Select and Clean Features ---
# Keep it lightweight
features = [
    'Age Group', 
    'Average daily social media usage',
    'Do you usually check nutritional information before eating?',
    'Do you think social media promotes unhealthy eating habits?',
    'Dietary Preference'
]

X = df[features].copy()

# Ordinal Encoding 
age_map = {'Below 18': 1, '18-22': 2, '23-30': 3, '31-40': 4, 'Above 40': 5}
sm_map = {'Less than 1 hour': 1, '1-2 hours': 2, '3-4 hours': 3, 'More than 4 hours': 4}
nut_map = {'Never': 1, 'Rarely': 2, 'Sometimes': 3, 'Always': 4}
unhealthy_map = {'Disagree': 1, 'Neutral': 2, 'Agree': 3}

X['Age Group'] = X['Age Group'].map(age_map).fillna(2)
X['Average daily social media usage'] = X['Average daily social media usage'].map(sm_map).fillna(2)
X['Do you usually check nutritional information before eating?'] = X['Do you usually check nutritional information before eating?'].map(nut_map).fillna(2)
X['Do you think social media promotes unhealthy eating habits?'] = X['Do you think social media promotes unhealthy eating habits?'].map(unhealthy_map).fillna(2)

# One-hot encode Dietary Preference
X = pd.get_dummies(X, columns=['Dietary Preference'], drop_first=True)
# Convert boolean to int
X = X.astype(int)

y = df['Target']

# --- 3. Split Data & Train Model ---
# Standard 80/20 split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

clf = LogisticRegression(max_iter=1000)
clf.fit(X_train, y_train)

# --- 4. Evaluate ---
y_pred = clf.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"Model Accuracy (Test): {acc:.2f}\n")

# --- 5. Export Logic for JS ---
coefs = clf.coef_[0]
intercept = clf.intercept_[0]
feature_names = X.columns.tolist()

print("Feature Importance (Weights):")
for feat, weight in zip(feature_names, coefs):
    print(f"  {feat}: {weight:.4f}")
print(f"  Intercept: {intercept:.4f}\n")

js_code = f"""
// --- Auto-Generated Model Logic for Frontend JS ---
// Accuracy on test set: {acc:.2f}

function predictWouldEat(features) {{
    // features should be an object with the required numerical values
    // Example: {{ ageGroup: 2, smUsage: 3, checkNutrition: 2, socialUnhealthy: 3, isNonVeg: 1, isVegan: 0 }}
    
    let logOdds = {intercept:.4f};
"""

for feat, weight in zip(feature_names, coefs):
    js_var = feat.replace(' ', '_').replace('?', '').replace('-', '_').lower()
    js_code += f"\n    logOdds += (features.{js_var} || 0) * {weight:.4f};"

js_code += """

    // Sigmoid function to get probability
    const probability = 1 / (1 + Math.exp(-logOdds));
    
    // Return prediction (1 = Would Eat, 0 = Pass) along with probability
    return {
        prediction: probability >= 0.5 ? "Would Eat" : "Pass",
        probability: probability
    };
}
"""

print(js_code)

with open('model_export.js', 'w') as f:
    f.write(js_code)

print("\nModel saved to model_export.js!")
