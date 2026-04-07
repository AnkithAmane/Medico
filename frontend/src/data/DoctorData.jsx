const hospitalData = {
  "hospital_staff": [
    {
      "name": "Dr. Arjun Reddy",
      "department": "Cardiology",
      "age": 45,
      "image": "",
      "location": "Hyderabad",
      "experience": 18,
      "qualification": "MBBS, MD (General Medicine), DM (Cardiology)",
      "description": "Specializes in interventional cardiology and advanced heart failure management."
    },
    {
      "name": "Dr. Kavitha Rao",
      "department": "Cardiology",
      "age": 38,
      "image": "",
      "location": "Chennai",
      "experience": 11,
      "qualification": "MBBS, MD (General Medicine), DNB (Cardiology)",
      "description": "Expert in non-invasive diagnostic techniques and preventive cardiac care."
    },
    {
      "name": "Dr. Vikram Seth",
      "department": "Cardiology",
      "age": 52,
      "image": "",
      "location": "Bangalore",
      "experience": 25,
      "qualification": "MBBS, MD, DM (Cardiology), Fellowship in Pediatric Cardiology",
      "description": "Senior consultant focusing on pediatric heart conditions and complex surgeries."
    },
    {
      "name": "Dr. Ananya Iyer",
      "department": "Cardiology",
      "age": 41,
      "image": "",
      "location": "Mumbai",
      "experience": 14,
      "qualification": "MBBS, MD, DM (Cardiology)",
      "description": "Dedicated to electrophysiology and managing heart rhythm disorders."
    },
    {
      "name": "Dr. Sanjay Dutt",
      "department": "Cardiology",
      "age": 55,
      "image": "",
      "location": "Hyderabad",
      "experience": 28,
      "qualification": "MBBS, MD, DM (Cardiology), FACC",
      "description": "Renowned for cardiac rehabilitation and lifestyle-based heart health programs."
    },
    {
      "name": "Dr. Meera Krishnan",
      "department": "Neurology",
      "age": 35,
      "image": "",
      "location": "Chennai",
      "experience": 8,
      "qualification": "MBBS, MD, DM (Neurology)",
      "description": "Focuses on neuro-muscular disorders and modern migraine treatments."
    },
    {
      "name": "Dr. Rohan Varma",
      "department": "Neurology",
      "age": 49,
      "image": "",
      "location": "Bangalore",
      "experience": 22,
      "qualification": "MBBS, MD, DM (Neurology), PhD (Neuroscience)",
      "description": "Specialist in neurodegenerative diseases like Parkinson's and Alzheimer's."
    },
    {
      "name": "Dr. Sneha Patil",
      "department": "Neurology",
      "age": 43,
      "image": "",
      "location": "Mumbai",
      "experience": 16,
      "qualification": "MBBS, MD, DM (Neurology)",
      "description": "Expert in epilepsy management and clinical neurophysiology."
    },
    {
      "name": "Dr. Karthik Raja",
      "department": "Neurology",
      "age": 47,
      "image": "",
      "location": "Hyderabad",
      "experience": 20,
      "qualification": "MBBS, MD, DM (Neurology)",
      "description": "Dedicated to stroke recovery and advanced brain imaging interpretation."
    },
    {
      "name": "Dr. Aditi Sharma",
      "department": "Neurology",
      "age": 39,
      "image": "",
      "location": "Chennai",
      "experience": 12,
      "qualification": "MBBS, MD, DM (Neurology)",
      "description": "Specializes in pediatric neurology and neuro-developmental assessments."
    },
    {
      "name": "Dr. Rajesh Khanna",
      "department": "Pediatrics",
      "age": 61,
      "image": "",
      "location": "Bangalore",
      "experience": 35,
      "qualification": "MBBS, MD (Pediatrics), DCH",
      "description": "Veteran pediatrician known for neonatal intensive care and infant nutrition."
    },
    {
      "name": "Dr. Lakshmi Menon",
      "department": "Pediatrics",
      "age": 34,
      "image": "",
      "location": "Mumbai",
      "experience": 7,
      "qualification": "MBBS, MD (Pediatrics)",
      "description": "Passionate about childhood immunization and adolescent wellness programs."
    },
    {
      "name": "Dr. Vijay Mallya",
      "department": "Pediatrics",
      "age": 50,
      "image": "",
      "location": "Hyderabad",
      "experience": 23,
      "qualification": "MBBS, MD (Pediatrics), Fellowship in Neonatology",
      "description": "Specializes in pediatric allergies and respiratory health management."
    },
    {
      "name": "Dr. Deepa Nair",
      "department": "Pediatrics",
      "age": 42,
      "image": "",
      "location": "Chennai",
      "experience": 15,
      "qualification": "MBBS, MD (Pediatrics)",
      "description": "Expert in pediatric endocrinology and growth monitoring."
    },
    {
      "name": "Dr. Suresh Raina",
      "department": "Pediatrics",
      "age": 53,
      "image": "",
      "location": "Bangalore",
      "experience": 26,
      "qualification": "MBBS, MD (Pediatrics)",
      "description": "Focused on pediatric emergency medicine and acute care trauma."
    },
    {
      "name": "Dr. Priyanka Bose",
      "department": "Orthopedics",
      "age": 37,
      "image": "",
      "location": "Mumbai",
      "experience": 10,
      "qualification": "MBBS, MS (Orthopedics)",
      "description": "Specialist in sports medicine and minimally invasive arthroscopic surgeries."
    },
    {
      "name": "Dr. Rahul Dravid",
      "department": "Orthopedics",
      "age": 44,
      "image": "",
      "location": "Hyderabad",
      "experience": 17,
      "qualification": "MBBS, MS (Orthopedics), MCh (Ortho)",
      "description": "Expert in joint replacements and corrective spinal surgeries."
    },
    {
      "name": "Dr. Shalini Singh",
      "department": "Orthopedics",
      "age": 40,
      "image": "",
      "location": "Chennai",
      "experience": 13,
      "qualification": "MBBS, MS (Orthopedics)",
      "description": "Focuses on hand surgery and microsurgical limb reconstruction."
    },
    {
      "name": "Dr. Amit Shah",
      "department": "Orthopedics",
      "age": 46,
      "image": "",
      "location": "Bangalore",
      "experience": 19,
      "qualification": "MBBS, MS (Orthopedics)",
      "description": "Specializes in geriatric orthopedics and osteoporosis management."
    },
    {
      "name": "Dr. Pooja Hegde",
      "department": "Orthopedics",
      "age": 33,
      "image": "",
      "location": "Mumbai",
      "experience": 6,
      "qualification": "MBBS, MS (Orthopedics)",
      "description": "Dedicated to pediatric orthopedics and congenital bone deformity correction."
    },
    {
      "name": "Dr. Manish Pandey",
      "department": "Dermatology",
      "age": 58,
      "image": "",
      "location": "Hyderabad",
      "experience": 31,
      "qualification": "MBBS, MD (Dermatology, Venereology & Leprosy)",
      "description": "Expert in clinical dermatology and treatment of chronic skin conditions."
    },
    {
      "name": "Dr. Swati Deshmukh",
      "department": "Dermatology",
      "age": 41,
      "image": "",
      "location": "Chennai",
      "experience": 14,
      "qualification": "MBBS, MD (Dermatology)",
      "description": "Specializes in aesthetic dermatology and advanced laser treatments."
    },
    {
      "name": "Dr. Naveen Kumar",
      "department": "Dermatology",
      "age": 56,
      "image": "",
      "location": "Bangalore",
      "experience": 29,
      "qualification": "MBBS, MD (Dermatology), DNB",
      "description": "Focuses on dermatopathology and skin cancer diagnosis."
    },
    {
      "name": "Dr. Rekha Vedavyas",
      "department": "Dermatology",
      "age": 48,
      "image": "",
      "location": "Mumbai",
      "experience": 21,
      "qualification": "MBBS, MD (Dermatology)",
      "description": "Expert in pediatric dermatology and autoimmune skin disorders."
    },
    {
      "name": "Dr. Harsha Bhogle",
      "department": "Dermatology",
      "age": 51,
      "image": "",
      "location": "Hyderabad",
      "experience": 24,
      "qualification": "MBBS, MD (Dermatology)",
      "description": "Known for trichology and modern hair restoration techniques."
    },
    {
      "name": "Dr. Gautham Vasudev",
      "department": "Oncology",
      "age": 36,
      "image": "",
      "location": "Chennai",
      "experience": 9,
      "qualification": "MBBS, MD, DM (Medical Oncology)",
      "description": "Focuses on medical oncology and precision medicine therapies."
    },
    {
      "name": "Dr. Shruti Haasan",
      "department": "Oncology",
      "age": 59,
      "image": "",
      "location": "Bangalore",
      "experience": 32,
      "qualification": "MBBS, MD, DM (Medical Oncology), DNB",
      "description": "Veteran radiation oncologist specializing in targeted tumor therapies."
    },
    {
      "name": "Dr. Anil Kapoor",
      "department": "Oncology",
      "age": 32,
      "image": "",
      "location": "Mumbai",
      "experience": 5,
      "qualification": "MBBS, MD (Medicine), DM (Oncology)",
      "description": "Specialist in hematological malignancies and bone marrow transplants."
    },
    {
      "name": "Dr. Jyothi Lakshmi",
      "department": "Oncology",
      "age": 44,
      "image": "",
      "location": "Hyderabad",
      "experience": 17,
      "qualification": "MBBS, MS, MCh (Surgical Oncology)",
      "description": "Expert in surgical oncology focusing on breast and gynecological cancers."
    },
    {
      "name": "Dr. MS Dhoni",
      "department": "Oncology",
      "age": 42,
      "image": "",
      "location": "Chennai",
      "experience": 15,
      "qualification": "MBBS, MD, Fellowship in Palliative Medicine",
      "description": "Dedicated to palliative oncology and patient-centered supportive care."
    }
  ]
};

export default hospitalData;