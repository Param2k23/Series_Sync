import json
import random
import math
import os

# Configuration
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_FILE = os.path.join(BASE_DIR, 'data', 'database.json')
NUM_USERS = 20
DIMENSION = 50

# Predefined special users
SPECIAL_USERS = [
    {
        "id": "user_001",
        "name": "Harsh Shah",
        "phone": "+1 5164341033",
        "role": "Full Stack Developer"
    },
    {
        "id": "user_002",
        "name": "Param Patel",
        "phone": "+1 9342463396",
        "role": "Backend Engineer"
    }
]

ROLES = [
    "Backend Developer", "Frontend Developer", "Data Scientist",
    "DevOps Engineer", "Product Manager", "UI/UX Designer",
    "Mobile Developer", "ML Engineer", "Cloud Architect"
]

SKILLS_POOL = {
    "Backend Developer": ["Python", "Java", "Go", "Node.js", "PostgreSQL", "Redis", "Docker", "AWS"],
    "Frontend Developer": ["React", "Vue", "TypeScript", "CSS", "Next.js", "Tailwind", "Figma"],
    "Data Scientist": ["Python", "TensorFlow", "PyTorch", "SQL", "Pandas", "Statistics", "Spark"],
    "DevOps Engineer": ["Kubernetes", "Docker", "Jenkins", "Terraform", "AWS", "Azure", "Linux"],
}

LOCATIONS = ["Remote", "SF", "NYC", "Austin", "London", "Toronto", "Berlin"]

def normalize_vector(vec):
    norm = math.sqrt(sum(x*x for x in vec))
    if norm == 0:
        return vec
    return [x/norm for x in vec]

def generate_random_vector(dim=DIMENSION):
    # Using random.gauss (Standard Normal Distribution)
    raw_vec = [random.gauss(0, 1) for _ in range(dim)]
    return normalize_vector(raw_vec)

def generate_similar_vector(base_vec, noise_level=0.1):
    raw_vec = [x + random.gauss(0, noise_level) for x in base_vec]
    return normalize_vector(raw_vec)

def generate_user_data(user_idx, specific_user=None, base_vector_for_similarity=None):
    user_id = f"user_{user_idx+1:03d}"
    
    if specific_user:
        name = specific_user["name"]
        phone = specific_user["phone"]
        role = specific_user.get("role", random.choice(ROLES))
    else:
        name = f"User {user_idx+1}"
        phone = f"+1 {random.randint(200, 999)}{random.randint(100, 999)}{random.randint(1000, 9999)}"
        role = random.choice(ROLES)

    # Determine skills
    # Find matching key in SKILLS_POOL based on role string
    matched_key = None
    for k in SKILLS_POOL.keys():
        if k.split()[0] in role:
            matched_key = k
            break
    if not matched_key:
        matched_key = random.choice(list(SKILLS_POOL.keys()))
    
    pool = SKILLS_POOL.get(matched_key, SKILLS_POOL["Backend Developer"])
    num_skills = random.randint(3, 6)
    skills = random.sample(pool, min(num_skills, len(pool)))

    # Vector Generation
    primary_vector = None
    if specific_user and specific_user["name"] == "Harsh Shah":
        primary_vector = generate_random_vector()
    elif specific_user and specific_user["name"] == "Param Patel" and base_vector_for_similarity:
        primary_vector = generate_similar_vector(base_vector_for_similarity, noise_level=0.05)
    else:
        primary_vector = generate_random_vector()

    user_obj = {
        "id": user_id,
        "name": name,
        "phone_number": phone,
        "display_info": {
            "role": role,
            "bio": f"Passionate {role} with a love for building things.",
            "skills": skills,
            "interests": ["Technology", "Coding", "Innovation"],
            "experience_years": random.randint(1, 15),
            "location": random.choice(LOCATIONS)
        },
        "vector_embeddings": {
            "primary": primary_vector
        },
        "metadata": {
            "last_active": "2024-01-20",
            "match_success_rate": round(random.uniform(0.7, 0.99), 2),
            "response_time_hours": round(random.uniform(0.5, 48.0), 1)
        }
    }
    
    return user_obj, primary_vector

def main():
    users = []
    
    # Generate Harsh
    harsh_data, harsh_vector = generate_user_data(0, SPECIAL_USERS[0])
    users.append(harsh_data)
    
    # Generate Param (similar to Harsh)
    param_data, _ = generate_user_data(1, SPECIAL_USERS[1], base_vector_for_similarity=harsh_vector)
    users.append(param_data)
    
    # Generate others
    for i in range(2, NUM_USERS):
        u_data, _ = generate_user_data(i)
        users.append(u_data)

    database = {
        "users": users,
        "vector_config": {
            "dimension": DIMENSION,
            "normalization": "l2",
            "similarity_metric": "cosine"
        }
    }

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

    with open(OUTPUT_FILE, 'w') as f:
        json.dump(database, f, indent=2)
    
    print(f"Successfully generated {len(users)} users in {OUTPUT_FILE}")
    print(f"User 1: {users[0]['name']} ({users[0]['phone_number']})")
    print(f"User 2: {users[1]['name']} ({users[1]['phone_number']})")
    
    # Verify similarity
    v1 = users[0]['vector_embeddings']['primary']
    v2 = users[1]['vector_embeddings']['primary']
    dot_product = sum(a*b for a,b in zip(v1, v2))
    print(f"Similarity between Harsh and Param: {dot_product:.4f}")

if __name__ == "__main__":
    main()
