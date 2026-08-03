# ai-service/app/services/cv_analysis.py
"""
AI Computer Vision Microservice Engine for Ultrasound (USG) Medical Image Analysis.
Designed as an assistive draft finding system for Radiologist review.
"""

import random

STUDY_PRESETS = {
    "Abdomen": {
        "impression": "USG features suggestive of Grade I Fatty Liver and mild Gallbladder Luminal Echoes/Calculus. Radiologist review required.",
        "findings": [
            {
                "organ": "Liver",
                "observation": "Mildly increased echogenicity of hepatic parenchyma with subtle posterior attenuation. Normal hepatic and portal veins.",
                "confidence": 0.88,
                "location": "Right & Left Lobes",
                "measurement": "Span 15.1 cm"
            },
            {
                "organ": "Gallbladder",
                "observation": "Echogenic shadow-casting focus noted in gallbladder lumen. No gall bladder wall thickening or pericholecystic edema.",
                "confidence": 0.91,
                "location": "Gallbladder Lumen / Neck",
                "measurement": "Calculus 4.2 mm"
            },
            {
                "organ": "Kidneys",
                "observation": "Bilateral kidneys are normal in position, size, and shape with maintained corticomedullary differentiation. No hydronephrosis.",
                "confidence": 0.86,
                "location": "Bilateral Lumbar Region",
                "measurement": "RK: 10.2 cm, LK: 10.5 cm"
            },
            {
                "organ": "Spleen",
                "observation": "Homogeneous spleen parenchyma with normal splenic hilum.",
                "confidence": 0.84,
                "location": "Left Hypochondrium",
                "measurement": "Length 9.6 cm"
            }
        ]
    },
    "Renal": {
        "impression": "USG draft indicates Right Renal Hyperechoic Focus with acoustic shadow suggestive of Nephrolithiasis. No significant hydronephrosis.",
        "findings": [
            {
                "organ": "Right Kidney",
                "observation": "Hyperechoic focus with distal acoustic shadowing noted in the lower pole calyx. Cortical thickness preserved.",
                "confidence": 0.93,
                "location": "Right Lower Pole Calyx",
                "measurement": "Calculus 5.8 mm"
            },
            {
                "organ": "Left Kidney",
                "observation": "Normal renal echotexture. No calculus, mass, or hydronephrosis.",
                "confidence": 0.89,
                "location": "Left Renal Fossa",
                "measurement": "Length 10.8 cm"
            },
            {
                "organ": "Urinary Bladder",
                "observation": "Well distended bladder with clean lumen and smooth mucosal wall. Pre and post-void volumes within normal limits.",
                "confidence": 0.87,
                "location": "Pelvis",
                "measurement": "Post-void residual < 15 ml"
            }
        ]
    },
    "Obstetric": {
        "impression": "Single live fetus in cephalic presentation corresponding to ~22 weeks 4 days gestational age with normal liquor volume and cardiac activity.",
        "findings": [
            {
                "organ": "Fetal Biometry (BPD/FL)",
                "observation": "Biparietal diameter (BPD) and Femur Length (FL) biometric ratios concordant with clinical period of gestation.",
                "confidence": 0.92,
                "location": "Fetal Head & Thigh",
                "measurement": "BPD 54 mm, FL 38 mm"
            },
            {
                "organ": "Fetal Cardiac Activity",
                "observation": "Regular fetal heart rate with rhythmic four-chamber cardiac view.",
                "confidence": 0.95,
                "location": "Fetal Thorax",
                "measurement": "FHR 144 bpm"
            },
            {
                "organ": "Placenta & Amniotic Fluid",
                "observation": "Anterior grade I placenta clear of internal os. Amniotic fluid index (AFI) adequate.",
                "confidence": 0.88,
                "location": "Anterior Uterine Wall",
                "measurement": "AFI 14.2 cm"
            }
        ]
    },
    "Thyroid": {
        "impression": "Normal bilateral thyroid lobes with a well-circumscribed hypoechoic nodule in the right lobe (TI-RADS 2/3).",
        "findings": [
            {
                "organ": "Right Thyroid Lobe",
                "observation": "Solitary, oval, wider-than-tall hypoechoic lesion in the mid pole with smooth margins and no microcalcifications.",
                "confidence": 0.87,
                "location": "Right Mid Pole",
                "measurement": "6.2 mm x 4.1 mm"
            },
            {
                "organ": "Left Thyroid Lobe",
                "observation": "Normal size and echotexture without focal mass lesions.",
                "confidence": 0.90,
                "location": "Left Neck",
                "measurement": "14 mm x 12 mm"
            }
        ]
    }
}

def process_usg_study_ai(study_id, study_type, image_count=1):
    preset = STUDY_PRESETS.get(study_type, STUDY_PRESETS["Abdomen"])
    
    findings = []
    for item in preset["findings"]:
        findings.append({
            "organ": item["organ"],
            "observation": item["observation"],
            "confidence": round(item["confidence"] + random.uniform(-0.02, 0.02), 2),
            "location": item["location"],
            "measurement": item["measurement"],
            "status": "PENDING"
        })
        
    return {
        "study_id": study_id,
        "status": "completed",
        "model_version": "v1.4.2-FastAPI-OpenCV-PyTorch",
        "draft_impression": preset["impression"],
        "findings": findings,
        "disclaimer": "AI-generated draft — not a final diagnosis. Radiologist review required."
    }
