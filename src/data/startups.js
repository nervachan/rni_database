export const cohorts = [
  { id: 1, name: 'Cohort 1', value: 4 },
  { id: 2, name: 'Cohort 2', value: 5 },
  { id: 3, name: 'Cohort 3', value: 5 },
]

export const genres = [
  { label: 'HealthTech', value: 6 },
  { label: 'FinTech',    value: 3 },
  { label: 'EdTech',     value: 2 },
  { label: 'AgriTech',   value: 3 },
]

export const startups = [
  { id: 1,  name: 'HealSync',    cohortId: 1, genre: 'HealthTech', supporting: 'Wearable health monitoring device',          description: 'HealSync develops wearable devices that continuously monitor patient vitals and sync data to healthcare providers in real time, reducing emergency response times.' },
  { id: 2,  name: 'TeleDoc',     cohortId: 1, genre: 'HealthTech', supporting: 'Teleconsultation platform',                   description: 'TeleDoc connects patients to licensed physicians via video call, enabling remote diagnosis and prescription in underserved areas.' },
  { id: 3,  name: 'MedAlert',    cohortId: 1, genre: 'HealthTech', supporting: 'Emergency response mobile app',               description: 'MedAlert is a mobile application that detects medical emergencies via sensor data and automatically dispatches nearby responders.' },
  { id: 4,  name: 'NutriTrack',  cohortId: 1, genre: 'HealthTech', supporting: 'AI-powered meal planning tool',               description: 'NutriTrack uses AI to generate personalized meal plans based on user health goals, dietary restrictions, and local food availability.' },
  { id: 5,  name: 'PayEasy',     cohortId: 2, genre: 'FinTech',    supporting: 'QR-based payment terminal',                   description: 'PayEasy provides small merchants with affordable QR-based payment terminals that work offline and sync transactions when connectivity is restored.' },
  { id: 6,  name: 'FinSafe',     cohortId: 2, genre: 'FinTech',    supporting: 'Secure mobile wallet',                        description: 'FinSafe is a mobile wallet with biometric authentication and end-to-end encryption, targeting unbanked populations in rural areas.' },
  { id: 7,  name: 'SecureVault', cohortId: 2, genre: 'FinTech',    supporting: 'Encryption library for financial apps',       description: 'SecureVault is an open-source encryption library designed for fintech developers to implement zero-knowledge security in their applications.' },
  { id: 8,  name: 'EduLearn',    cohortId: 2, genre: 'EdTech',     supporting: 'Adaptive e-learning platform',                description: 'EduLearn delivers adaptive courseware that adjusts difficulty based on student performance, improving completion rates in online education.' },
  { id: 9,  name: 'LearnBot',    cohortId: 2, genre: 'EdTech',     supporting: 'AI tutoring chatbot',                         description: 'LearnBot is a conversational AI tutor that answers student questions, explains concepts, and tracks learning progress across subjects.' },
  { id: 10, name: 'SmartClass',  cohortId: 3, genre: 'EdTech',     supporting: 'Automated attendance system',                 description: 'SmartClass uses facial recognition to automate classroom attendance, freeing instructors to focus on teaching.' },
  { id: 11, name: 'AgriBot',     cohortId: 3, genre: 'AgriTech',   supporting: 'Autonomous crop monitoring drone',            description: 'AgriBot deploys autonomous drones to scan farmland, detect crop diseases early, and recommend targeted interventions to reduce pesticide use.' },
  { id: 12, name: 'SoilSense',   cohortId: 3, genre: 'AgriTech',   supporting: 'IoT soil quality monitoring kit',             description: 'SoilSense provides farmers with IoT sensors that measure soil moisture, pH, and nutrient levels, sending alerts when conditions fall outside optimal ranges.' },
  { id: 13, name: 'CropYield',   cohortId: 3, genre: 'AgriTech',   supporting: 'ML-based harvest prediction model',           description: 'CropYield uses machine learning trained on weather and soil data to predict harvest yields, helping farmers plan logistics and reduce waste.' },
  { id: 14, name: 'HealthSync',  cohortId: 3, genre: 'HealthTech', supporting: 'Patient data integration portal',             description: 'HealthSync aggregates patient records from multiple hospital systems into a single unified portal accessible by authorized medical staff.' },
]