import json
import math
import os

class VectorRanker:
    def __init__(self, users):
        self.users = users

    @staticmethod
    def dot_product(vec_a, vec_b):
        return sum(a * b for a, b in zip(vec_a, vec_b))

    @staticmethod
    def magnitude(vec):
        return math.sqrt(sum(x * x for x in vec))

    @staticmethod
    def cosine_similarity(vec_a, vec_b):
        dot = VectorRanker.dot_product(vec_a, vec_b)
        mag_a = VectorRanker.magnitude(vec_a)
        mag_b = VectorRanker.magnitude(vec_b)
        if mag_a == 0 or mag_b == 0:
            return 0.0
        return dot / (mag_a * mag_b)

    def query_to_vector(self, text):
        dim = 50
        query_vec = [0.0] * dim
        lower_text = text.lower()

        # MOCK: Sentence Transformer Logic
        keywords = {
            'backend': {'idx': 0, 'val': 0.8},
            'python': {'idx': 2, 'val': 0.6},
            'java': {'idx': 3, 'val': 0.6},
            'database': {'idx': 5, 'val': 0.7},
            
            'frontend': {'idx': 10, 'val': 0.8},
            'react': {'idx': 12, 'val': 0.7},
            'design': {'idx': 15, 'val': 0.5},
            
            'data': {'idx': 20, 'val': 0.8},
            'machine': {'idx': 22, 'val': 0.7},
            'statistics': {'idx': 25, 'val': 0.6},
            
            'product': {'idx': 30, 'val': 0.8},
            'manager': {'idx': 31, 'val': 0.5},
            'leadership': {'idx': 35, 'val': 0.6},
            'startup': {'idx': 38, 'val': 0.4}
        }

        found_keyword = False
        for word, data in keywords.items():
            if word in lower_text:
                found_keyword = True
                idx = data['idx']
                val = data['val']
                query_vec[idx] += val
                if idx + 1 < dim:
                    query_vec[idx + 1] += val * 0.5
                if idx - 1 >= 0:
                    query_vec[idx - 1] += val * 0.5

        if not found_keyword:
            import random
            return [random.random() * 0.1 for _ in range(dim)]

        # Normalize
        mag = self.magnitude(query_vec)
        if mag == 0:
            return query_vec
        return [x / mag for x in query_vec]

    def rank_users(self, query_text, filters=None, top_k=10):
        if filters is None:
            filters = {}
            
        query_vec = self.query_to_vector(query_text)
        candidates = self.users

        # 1. Pre-filtering
        if 'role' in filters:
            candidates = [u for u in candidates if filters['role'] in u['display_info']['role']]

        scored_users = []
        for user in candidates:
            # A. Base Vector Similarity
            user_vec = user['vector_embeddings']['primary']
            base_sim = self.cosine_similarity(query_vec, user_vec)

            # B. Boost Calculation
            boost = 0.0
            breakdown = []

            # Skill Overlap Boost
            query_words = query_text.lower().split()
            user_skills = [s.lower() for s in user['display_info']['skills']]
            matches = 0
            for s in user_skills:
                for q in query_words:
                    if q in s or s in q:
                        matches += 1
                        break
            
            if matches > 0:
                s_boost = matches * 0.05
                boost += s_boost
                breakdown.append(f"Skills (+{s_boost:.2f})")

            # Experience Boost
            exp = user['display_info'].get('experience_years', 0)
            exp_boost = min(exp * 0.02, 0.15)
            if exp_boost > 0:
                boost += exp_boost
                breakdown.append(f"Exp (+{exp_boost:.2f})")

            # Engagement Boost
            if user['metadata'].get('response_time_hours', 25) < 24:
                boost += 0.05
                breakdown.append("Active (+0.05)")

            final_score = base_sim + boost
            scored_users.append({
                'user': user,
                'score': final_score,
                'base_similarity': base_sim,
                'boost': boost,
                'breakdown': breakdown
            })

        # 2. Sort
        scored_users.sort(key=lambda x: x['score'], reverse=True)

        # 3. Return Top K
        return scored_users[:top_k]

# --- MAIN EXECUTION (No Demo Mode) ---
if __name__ == "__main__":
    # Just load and verify class instantiation for correctness check
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DB_PATH = os.path.join(BASE_DIR, 'data', 'database.json')

    if os.path.exists(DB_PATH):
        with open(DB_PATH, 'r') as f:
            data = json.load(f)
        
        ranker = VectorRanker(data['users'])
        print(f"VectorRanker initialized with {len(data['users'])} users.")
        print("Ready for ranking tasks (interactive demo skipped).")
    else:
        print("Database not found. Please run generate_database.py first.")
