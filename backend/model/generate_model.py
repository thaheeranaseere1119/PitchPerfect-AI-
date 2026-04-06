"""
generate_model.py
Trains a Decision Tree Classifier that mimics the notebook's approach:
  - 13 MFCC features
  - 2 classes: 0 = "nervous/short", 1 = "confident/long"
Exports model.pkl + scaler.pkl to the same directory.
"""
import os
import pickle
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

np.random.seed(42)

N = 400  # number of synthetic samples

# Class 0: nervous/short speech — lower energy MFCCs, more variance
X_nervous = np.random.randn(N // 2, 13) * 1.5 + np.array(
    [-20, 10, -5, 3, -2, 1, -1, 0.5, -0.5, 0.3, -0.2, 0.1, -0.1]
)

# Class 1: confident/long speech — higher energy MFCCs, more stable
X_confident = np.random.randn(N // 2, 13) * 0.8 + np.array(
    [-10, 5, 2, 1, 0.5, -0.5, 0.3, -0.2, 0.1, -0.1, 0.05, -0.05, 0.02]
)

X = np.vstack([X_nervous, X_confident])
y = np.array([0] * (N // 2) + [1] * (N // 2))

# Shuffle
idx = np.random.permutation(N)
X, y = X[idx], y[idx]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scale
scaler = StandardScaler()
X_train_sc = scaler.fit_transform(X_train)
X_test_sc = scaler.transform(X_test)

# Train
clf = DecisionTreeClassifier(criterion="entropy", max_depth=5, random_state=42)
clf.fit(X_train_sc, y_train)

acc = clf.score(X_test_sc, y_test)
print(f"Decision Tree Accuracy: {acc * 100:.1f}%")

# Export
out_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(out_dir, "model.pkl")
scaler_path = os.path.join(out_dir, "scaler.pkl")

with open(model_path, "wb") as f:
    pickle.dump(clf, f)

with open(scaler_path, "wb") as f:
    pickle.dump(scaler, f)

print(f"Saved model  → {model_path}")
print(f"Saved scaler → {scaler_path}")
