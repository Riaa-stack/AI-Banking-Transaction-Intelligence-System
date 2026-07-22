import joblib

model = joblib.load("app/ai/fraud_detection_model.pkl")

print(type(model))
print(model)