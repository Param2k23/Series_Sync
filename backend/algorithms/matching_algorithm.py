"""
User Matching Algorithm with Dynamic Attribute Weights
This algorithm matches users based on similarity and updates attribute weights
based on vibe matches to improve future matching.
"""

import json
import numpy as np
from typing import Dict, List, Tuple, Optional
from datetime import datetime
import os


class UserMatchingAlgorithm:
    def __init__(self, database_path: str = "database.json"):
        """Initialize the matching algorithm with database path."""
        self.database_path = database_path
        self.database = self.load_database()
        self.convergence_rate = 0.1  # How fast attributes converge/divergence
        self.min_similarity_threshold = 0.6  # Minimum similarity to suggest match
        
        # Query keywords mapping
        self.query_keywords = {
            'frontend': ['frontend', 'front-end', 'react', 'javascript', 'ui', 'ux', 'design', 'web design'],
            'backend': ['backend', 'back-end', 'server', 'api', 'database', 'python', 'java', 'node'],
            'founder': ['founder', 'entrepreneur', 'startup', 'ceo', 'co-founder', 'business'],
            'designer': ['designer', 'design', 'ui', 'ux', 'figma', 'sketch', 'product design'],
            'developer': ['developer', 'dev', 'programmer', 'coder', 'software engineer', 'engineer'],
            'data': ['data', 'data science', 'ml', 'machine learning', 'ai', 'analytics'],
            'marketing': ['marketing', 'growth', 'strategy', 'content', 'social media']
        }
        
    def load_database(self) -> Dict:
        """Load the JSON database."""
        if os.path.exists(self.database_path):
            with open(self.database_path, 'r') as f:
                return json.load(f)
        else:
            raise FileNotFoundError(f"Database file {self.database_path} not found")
    
    def save_database(self):
        """Save the updated database to JSON file."""
        with open(self.database_path, 'w') as f:
            json.dump(self.database, f, indent=2)
    
    def get_user_by_number(self, number: str) -> Optional[Dict]:
        """Get user by phone number."""
        for user in self.database['users']:
            if user['number'] == number:
                return user
        return None
    
    def get_user_by_name(self, name: str) -> Optional[Dict]:
        """Get user by name."""
        for user in self.database['users']:
            if user['name'].lower() == name.lower():
                return user
        return None
    
    def normalize_vector(self, vector: np.ndarray) -> np.ndarray:
        """Normalize a vector to unit length."""
        norm = np.linalg.norm(vector)
        if norm == 0:
            return vector
        return vector / norm
    
    def get_user_vector(self, user: Dict, attribute_type: str = 'vector_attributes') -> Tuple[np.ndarray, List[str]]:
        """
        Get normalized user vector as dimensions.
        Returns (normalized_vector, attribute_names)
        """
        attrs = user[attribute_type]
        weights_dict = self.database['attribute_weights'][attribute_type]
        
        vec = []
        attr_names = []
        
        for attr in sorted(attrs.keys()):
            weight = weights_dict.get(attr, 1.0)
            vec.append(attrs[attr] * weight)
            attr_names.append(attr)
        
        vec = np.array(vec)
        # Normalize the vector
        vec_normalized = self.normalize_vector(vec)
        
        return vec_normalized, attr_names
    
    def calculate_vector_similarity(self, user1: Dict, user2: Dict) -> float:
        """
        Calculate cosine similarity between two users' vector attributes.
        Uses normalized vectors as dimensions with dynamic weights.
        """
        vec1, _ = self.get_user_vector(user1, 'vector_attributes')
        vec2, _ = self.get_user_vector(user2, 'vector_attributes')
        
        # Cosine similarity of normalized vectors
        similarity = np.dot(vec1, vec2)
        return float(similarity)
    
    def calculate_vibe_similarity(self, user1: Dict, user2: Dict) -> float:
        """Calculate similarity of vibe attributes using normalized vectors."""
        vec1, _ = self.get_user_vector(user1, 'vibe_attributes')
        vec2, _ = self.get_user_vector(user2, 'vibe_attributes')
        
        # Cosine similarity of normalized vectors
        similarity = np.dot(vec1, vec2)
        return float(similarity)
    
    def calculate_overall_similarity(self, user1: Dict, user2: Dict) -> Dict:
        """
        Calculate overall similarity between two users.
        Returns similarity scores and breakdown.
        """
        vector_sim = self.calculate_vector_similarity(user1, user2)
        vibe_sim = self.calculate_vibe_similarity(user1, user2)
        
        # Weighted combination (60% vector, 40% vibe)
        overall_sim = 0.6 * vector_sim + 0.4 * vibe_sim
        
        # Additional factors
        shared_skills = len(set(user1['skills']['technical']) & set(user2['skills']['technical']))
        shared_interests = len(set(user1['attributes']['interests']) & set(user2['attributes']['interests']))
        
        skill_bonus = min(shared_skills / 5.0, 0.1)  # Max 10% bonus
        interest_bonus = min(shared_interests / 5.0, 0.1)  # Max 10% bonus
        
        final_similarity = min(overall_sim + skill_bonus + interest_bonus, 1.0)
        
        return {
            'overall_similarity': final_similarity,
            'vector_similarity': vector_sim,
            'vibe_similarity': vibe_sim,
            'shared_skills': shared_skills,
            'shared_interests': shared_interests,
            'skill_bonus': skill_bonus,
            'interest_bonus': interest_bonus
        }
    
    def print_user_attributes(self, user: Dict, title: str = None):
        """Print user's normalized attribute vectors."""
        if title:
            print(f"\n{'='*60}")
            print(f"{title}")
            print(f"{'='*60}")
        
        print(f"\nUser: {user['name']} ({user['number']})")
        
        # Vector attributes
        vec1, attr_names = self.get_user_vector(user, 'vector_attributes')
        print(f"\n📊 Vector Attributes (Normalized Dimensions):")
        print(f"{'Attribute':<25} {'Raw Value':<12} {'Weight':<10} {'Normalized':<12}")
        print("-" * 60)
        
        weights = self.database['attribute_weights']['vector_attributes']
        for i, attr in enumerate(attr_names):
            raw_val = user['vector_attributes'][attr]
            weight = weights.get(attr, 1.0)
            normalized = vec1[i]
            print(f"{attr:<25} {raw_val:<12.3f} {weight:<10.3f} {normalized:<12.3f}")
        
        # Vibe attributes
        vibe_vec, vibe_attr_names = self.get_user_vector(user, 'vibe_attributes')
        print(f"\n💫 Vibe Attributes (Normalized Dimensions):")
        print(f"{'Attribute':<25} {'Raw Value':<12} {'Weight':<10} {'Normalized':<12}")
        print("-" * 60)
        
        vibe_weights = self.database['attribute_weights']['vibe_attributes']
        for i, attr in enumerate(vibe_attr_names):
            raw_val = user['vibe_attributes'][attr]
            weight = vibe_weights.get(attr, 1.0)
            normalized = vibe_vec[i]
            print(f"{attr:<25} {raw_val:<12.3f} {weight:<10.3f} {normalized:<12.3f}")
    
    def print_match_reasoning(self, user1: Dict, user2: Dict, similarity_details: Dict):
        """Print detailed reasoning for why two users matched."""
        print(f"\n{'='*60}")
        print(f"🔍 Match Analysis: {user1['name']} ↔ {user2['name']}")
        print(f"{'='*60}")
        
        print(f"\n📈 Similarity Scores:")
        print(f"  Overall Similarity: {similarity_details['overall_similarity']:.3f}")
        print(f"  Vector Similarity:  {similarity_details['vector_similarity']:.3f}")
        print(f"  Vibe Similarity:    {similarity_details['vibe_similarity']:.3f}")
        print(f"  Shared Skills:      {similarity_details['shared_skills']}")
        print(f"  Shared Interests:   {similarity_details['shared_interests']}")
        print(f"  Skill Bonus:        +{similarity_details['skill_bonus']:.3f}")
        print(f"  Interest Bonus:     +{similarity_details['interest_bonus']:.3f}")
        
        # Compare vector attributes
        vec1, attr_names = self.get_user_vector(user1, 'vector_attributes')
        vec2, _ = self.get_user_vector(user2, 'vector_attributes')
        
        print(f"\n📊 Top Matching Vector Dimensions:")
        print(f"{'Attribute':<25} {'User1':<12} {'User2':<12} {'Diff':<10} {'Impact':<10}")
        print("-" * 70)
        
        diffs = []
        for i, attr in enumerate(attr_names):
            diff = abs(vec1[i] - vec2[i])
            diffs.append((attr, vec1[i], vec2[i], diff))
        
        # Sort by smallest difference (most similar)
        diffs.sort(key=lambda x: x[3])
        for attr, v1, v2, diff in diffs[:5]:
            impact = "High" if diff < 0.1 else "Medium" if diff < 0.2 else "Low"
            print(f"{attr:<25} {v1:<12.3f} {v2:<12.3f} {diff:<10.3f} {impact:<10}")
        
        # Compare vibe attributes
        vibe_vec1, vibe_attr_names = self.get_user_vector(user1, 'vibe_attributes')
        vibe_vec2, _ = self.get_user_vector(user2, 'vibe_attributes')
        
        print(f"\n💫 Top Matching Vibe Dimensions:")
        print(f"{'Attribute':<25} {'User1':<12} {'User2':<12} {'Diff':<10} {'Impact':<10}")
        print("-" * 70)
        
        vibe_diffs = []
        for i, attr in enumerate(vibe_attr_names):
            diff = abs(vibe_vec1[i] - vibe_vec2[i])
            vibe_diffs.append((attr, vibe_vec1[i], vibe_vec2[i], diff))
        
        vibe_diffs.sort(key=lambda x: x[3])
        for attr, v1, v2, diff in vibe_diffs[:5]:
            impact = "High" if diff < 0.1 else "Medium" if diff < 0.2 else "Low"
            print(f"{attr:<25} {v1:<12.3f} {v2:<12.3f} {diff:<10.3f} {impact:<10}")
        
        # Shared skills and interests
        shared_skills = set(user1['skills']['technical']) & set(user2['skills']['technical'])
        shared_interests = set(user1['attributes']['interests']) & set(user2['attributes']['interests'])
        
        if shared_skills:
            print(f"\n🛠️  Shared Skills: {', '.join(shared_skills)}")
        if shared_interests:
            print(f"🎯 Shared Interests: {', '.join(shared_interests)}")
    
    def print_attribute_changes(self, user1_before: Dict, user1_after: Dict, 
                               user2_before: Dict, user2_after: Dict, vibe_match: bool):
        """Print how attributes changed after vibe match."""
        match_type = "✅ POSITIVE" if vibe_match else "❌ NEGATIVE"
        print(f"\n{'='*60}")
        print(f"{match_type} Vibe Match - Attribute Changes")
        print(f"{'='*60}")
        
        # Vector attributes changes
        print(f"\n📊 Vector Attribute Changes:")
        print(f"{'Attribute':<25} {'Before':<15} {'After':<15} {'Change':<15}")
        print("-" * 70)
        
        for attr in sorted(user1_before['vector_attributes'].keys()):
            before1 = user1_before['vector_attributes'][attr]
            after1 = user1_after['vector_attributes'][attr]
            change1 = after1 - before1
            
            before2 = user2_before['vector_attributes'][attr]
            after2 = user2_after['vector_attributes'][attr]
            change2 = after2 - before2
            
            print(f"\n{attr}:")
            print(f"  {user1_before['name']:<23} {before1:<15.3f} {after1:<15.3f} {change1:+.3f}")
            print(f"  {user2_before['name']:<23} {before2:<15.3f} {after2:<15.3f} {change2:+.3f}")
        
        # Vibe attributes changes
        print(f"\n💫 Vibe Attribute Changes:")
        print(f"{'Attribute':<25} {'Before':<15} {'After':<15} {'Change':<15}")
        print("-" * 70)
        
        for attr in sorted(user1_before['vibe_attributes'].keys()):
            before1 = user1_before['vibe_attributes'][attr]
            after1 = user1_after['vibe_attributes'][attr]
            change1 = after1 - before1
            
            before2 = user2_before['vibe_attributes'][attr]
            after2 = user2_after['vibe_attributes'][attr]
            change2 = after2 - before2
            
            print(f"\n{attr}:")
            print(f"  {user1_before['name']:<23} {before1:<15.3f} {after1:<15.3f} {change1:+.3f}")
            print(f"  {user2_before['name']:<23} {before2:<15.3f} {after2:<15.3f} {change2:+.3f}")
        
        # Weight changes - show current weights (they've been updated)
        print(f"\n⚖️  Current Attribute Weights (after update):")
        print(f"{'Attribute':<25} {'Weight':<15}")
        print("-" * 40)
        
        vector_weights = self.database['attribute_weights']['vector_attributes']
        for attr in sorted(vector_weights.keys()):
            weight = vector_weights[attr]
            print(f"{attr:<25} {weight:<15.3f}")
        
        print(f"\n💫 Current Vibe Attribute Weights:")
        print(f"{'Attribute':<25} {'Weight':<15}")
        print("-" * 40)
        
        vibe_weights = self.database['attribute_weights']['vibe_attributes']
        for attr in sorted(vibe_weights.keys()):
            weight = vibe_weights[attr]
            print(f"{attr:<25} {weight:<15.3f}")
    
    def find_similar_users(self, query_user: Dict, exclude_ids: List[str] = None, limit: int = 5) -> List[Tuple[Dict, Dict]]:
        """
        Find users similar to the query user.
        Returns list of (user, similarity_details) tuples sorted by similarity.
        """
        if exclude_ids is None:
            exclude_ids = []
        
        similarities = []
        
        for user in self.database['users']:
            if user['id'] == query_user['id'] or user['id'] in exclude_ids:
                continue
            
            similarity_details = self.calculate_overall_similarity(query_user, user)
            similarities.append((user, similarity_details))
        
        # Sort by overall similarity (descending)
        similarities.sort(key=lambda x: x[1]['overall_similarity'], reverse=True)
        
        return similarities[:limit]
    
    def update_attribute_weights(self, user1: Dict, user2: Dict, vibe_match: bool):
        """
        Update attribute weights based on vibe match.
        If vibe_match is True: attributes converge (weights increase for similar attributes)
        If vibe_match is False: attributes diverge (weights decrease for similar attributes)
        """
        # Calculate which attributes are similar between users
        vector_attrs = user1['vector_attributes']
        vibe_attrs = user1['vibe_attributes']
        
        # Update vector attribute weights
        for attr in vector_attrs.keys():
            val1 = user1['vector_attributes'][attr]
            val2 = user2['vector_attributes'][attr]
            similarity = 1.0 - abs(val1 - val2)  # How similar these values are
            
            current_weight = self.database['attribute_weights']['vector_attributes'].get(attr, 1.0)
            
            if vibe_match:
                # Positive match: increase weight for similar attributes
                weight_change = self.convergence_rate * similarity
                new_weight = min(current_weight + weight_change, 2.0)  # Cap at 2.0
            else:
                # Negative match: decrease weight for similar attributes
                weight_change = self.convergence_rate * similarity
                new_weight = max(current_weight - weight_change, 0.1)  # Floor at 0.1
            
            self.database['attribute_weights']['vector_attributes'][attr] = new_weight
        
        # Update vibe attribute weights
        for attr in vibe_attrs.keys():
            val1 = user1['vibe_attributes'][attr]
            val2 = user2['vibe_attributes'][attr]
            similarity = 1.0 - abs(val1 - val2)
            
            current_weight = self.database['attribute_weights']['vibe_attributes'].get(attr, 1.0)
            
            if vibe_match:
                weight_change = self.convergence_rate * similarity
                new_weight = min(current_weight + weight_change, 2.0)
            else:
                weight_change = self.convergence_rate * similarity
                new_weight = max(current_weight - weight_change, 0.1)
            
            self.database['attribute_weights']['vibe_attributes'][attr] = new_weight
    
    def update_vector_attributes(self, user1: Dict, user2: Dict, vibe_match: bool):
        """
        Update user vector attributes based on vibe match.
        If vibe_match is True: attributes move closer in vector space
        If vibe_match is False: attributes move away in vector space
        """
        # Update user1's attributes based on user2
        for attr in user1['vector_attributes'].keys():
            val1 = user1['vector_attributes'][attr]
            val2 = user2['vector_attributes'][attr]
            
            if vibe_match:
                # Move closer: interpolate towards user2's value
                new_val = val1 + self.convergence_rate * (val2 - val1)
            else:
                # Move away: extrapolate away from user2's value
                new_val = val1 - self.convergence_rate * (val2 - val1)
            
            # Clamp between 0 and 1
            user1['vector_attributes'][attr] = max(0.0, min(1.0, new_val))
        
        # Update user2's attributes based on user1
        for attr in user2['vector_attributes'].keys():
            val1 = user1['vector_attributes'][attr]
            val2 = user2['vector_attributes'][attr]
            
            if vibe_match:
                new_val = val2 + self.convergence_rate * (val1 - val2)
            else:
                new_val = val2 - self.convergence_rate * (val1 - val2)
            
            user2['vector_attributes'][attr] = max(0.0, min(1.0, new_val))
        
        # Update vibe attributes similarly
        for attr in user1['vibe_attributes'].keys():
            val1 = user1['vibe_attributes'][attr]
            val2 = user2['vibe_attributes'][attr]
            
            if vibe_match:
                new_val = val1 + self.convergence_rate * (val2 - val1)
            else:
                new_val = val1 - self.convergence_rate * (val2 - val1)
            
            user1['vibe_attributes'][attr] = max(0.0, min(1.0, new_val))
        
        for attr in user2['vibe_attributes'].keys():
            val1 = user1['vibe_attributes'][attr]
            val2 = user2['vibe_attributes'][attr]
            
            if vibe_match:
                new_val = val2 + self.convergence_rate * (val1 - val2)
            else:
                new_val = val2 - self.convergence_rate * (val1 - val2)
            
            user2['vibe_attributes'][attr] = max(0.0, min(1.0, new_val))
    
    def record_vibe_match(self, user1_id: str, user2_id: str, vibe_match: bool):
        """Record a vibe match in the database."""
        match_record = {
            'user1_id': user1_id,
            'user2_id': user2_id,
            'vibe_match': vibe_match,
            'timestamp': datetime.now().isoformat()
        }
        self.database['vibe_matches'].append(match_record)
    
    
    def create_group(self, user_ids: List[str], group_name: str = None):
        """Create a group with given user IDs."""
        if len(user_ids) < 2:
            raise ValueError("Group must have at least 2 users")
        
        group_id = f"group-{len(self.database['groups']) + 1}"
        
        if not group_name:
            # Generate group name from first two users
            user1 = next((u for u in self.database['users'] if u['id'] == user_ids[0]), None)
            user2 = next((u for u in self.database['users'] if u['id'] == user_ids[1]), None)
            if user1 and user2:
                group_name = f"{user1['name'].split()[0]} & {user2['name'].split()[0]}"
            else:
                group_name = f"Group {len(self.database['groups']) + 1}"
        
        group = {
            'id': group_id,
            'name': group_name,
            'member_ids': user_ids,
            'created_at': datetime.now().isoformat()
        }
        
        self.database['groups'].append(group)
        
        # Add group to users
        for user_id in user_ids:
            user = next((u for u in self.database['users'] if u['id'] == user_id), None)
            if user:
                if group_id not in user['groups']:
                    user['groups'].append(group_id)
        
        self.save_database()
        return group
    
    def parse_query(self, query: str) -> Dict[str, any]:
        """
        Parse natural language query to extract intent.
        Returns dict with query_type and keywords.
        """
        query_lower = query.lower()
        intent = None
        keywords = []
        
        # Check for query type
        for query_type, keywords_list in self.query_keywords.items():
            for keyword in keywords_list:
                if keyword in query_lower:
                    intent = query_type
                    keywords.append(keyword)
                    break
            if intent:
                break
        
        return {
            'intent': intent,
            'keywords': keywords,
            'original_query': query
        }
    
    def user_matches_query(self, user: Dict, query_intent: Dict) -> bool:
        """Check if a user matches the query intent."""
        if not query_intent['intent']:
            return True  # No specific intent, match all
        
        intent = query_intent['intent']
        user_skills = [s.lower() for s in user['skills']['technical']]
        user_role = user['work']['role'].lower() if user.get('work', {}).get('role') else ''
        user_industry = user['work']['industry'].lower() if user.get('work', {}).get('industry') else ''
        
        # Check based on intent
        if intent == 'frontend':
            frontend_skills = ['react', 'javascript', 'html', 'css', 'frontend', 'ui', 'ux', 'figma', 'sketch']
            return any(skill in ' '.join(user_skills + [user_role]) for skill in frontend_skills)
        
        elif intent == 'backend':
            backend_skills = ['python', 'java', 'node', 'backend', 'api', 'server', 'database', 'sql']
            return any(skill in ' '.join(user_skills + [user_role]) for skill in backend_skills)
        
        elif intent == 'founder':
            founder_keywords = ['founder', 'ceo', 'entrepreneur', 'startup', 'co-founder']
            return any(keyword in ' '.join([user_role, user_industry, user.get('bio', '').lower()]) for keyword in founder_keywords)
        
        elif intent == 'designer':
            design_keywords = ['designer', 'design', 'ui', 'ux', 'figma', 'sketch', 'product design']
            return any(keyword in ' '.join(user_skills + [user_role]) for keyword in design_keywords)
        
        elif intent == 'developer':
            dev_keywords = ['developer', 'engineer', 'programmer', 'software']
            return any(keyword in ' '.join([user_role] + user_skills) for keyword in dev_keywords)
        
        elif intent == 'data':
            data_keywords = ['data', 'ml', 'machine learning', 'ai', 'analytics', 'python', 'tensorflow', 'pytorch']
            return any(keyword in ' '.join(user_skills + [user_role]) for keyword in data_keywords)
        
        elif intent == 'marketing':
            marketing_keywords = ['marketing', 'growth', 'strategy', 'content', 'social media', 'seo']
            return any(keyword in ' '.join([user_role, user_industry] + user_skills) for keyword in marketing_keywords)
        
        return True
    
    def query(self, user_name: str, query_text: str):
        """
        Simple query interface: takes user name and query text.
        Automatically finds matches based on the query.
        
        Example:
            algo.query("Harsh Shah", "I want a frontend developer")
            algo.query("Param Patel", "looking for a founder")
        """
        # Find the user
        query_user = self.get_user_by_name(user_name)
        if not query_user:
            raise ValueError(f"User not found: {user_name}")
        
        # Parse the query
        query_intent = self.parse_query(query_text)
        
        print(f"\n{'='*60}")
        print(f"🔍 Query from {query_user['name']}")
        print(f"📝 Query: \"{query_text}\"")
        if query_intent['intent']:
            print(f"🎯 Detected Intent: {query_intent['intent'].upper()}")
        print(f"{'='*60}")
        
        # Show query user attributes
        self.print_user_attributes(query_user, f"Query User: {query_user['name']}")
        
        # Find similar users
        exclude_ids = [query_user['id']]
        similar_users = self.find_similar_users(query_user, exclude_ids)
        
        # Filter by query intent
        if query_intent['intent']:
            similar_users = [
                (user, sim) for user, sim in similar_users
                if self.user_matches_query(user, query_intent)
            ]
        
        # Filter by minimum similarity threshold
        filtered_matches = [
            (user, sim) for user, sim in similar_users
            if sim['overall_similarity'] >= self.min_similarity_threshold
        ]
        
        # Print results
        if filtered_matches:
            print(f"\n{'='*60}")
            print(f"🎯 Found {len(filtered_matches)} matches")
            print(f"{'='*60}")
            
            for i, (user, sim_details) in enumerate(filtered_matches[:3], 1):
                print(f"\n--- Match #{i} ---")
                self.print_match_reasoning(query_user, user, sim_details)
        else:
            print(f"\n❌ No matches found for your query.")
        
        return {
            'query_user': query_user,
            'query_intent': query_intent,
            'matches': filtered_matches,
            'total_found': len(filtered_matches)
        }
    
    def vibe_match(self, user1_name: str, user2_name: str, match_result: bool, print_changes: bool = True):
        """
        Simplified vibe match: takes user names and match result.
        Automatically handles all updates.
        
        Example:
            algo.vibe_match("Harsh Shah", "Param Patel", False)
        """
        user1 = self.get_user_by_name(user1_name)
        user2 = self.get_user_by_name(user2_name)
        
        if not user1:
            raise ValueError(f"User not found: {user1_name}")
        if not user2:
            raise ValueError(f"User not found: {user2_name}")
        
        # Call the original vibe_match with IDs
        return self._vibe_match_internal(user1['id'], user2['id'], match_result, print_changes)
    
    def _vibe_match_internal(self, user1_id: str, user2_id: str, match_result: bool, print_changes: bool = True):
        """
        Internal vibe match function (original implementation).
        """
        user1 = next((u for u in self.database['users'] if u['id'] == user1_id), None)
        user2 = next((u for u in self.database['users'] if u['id'] == user2_id), None)
        
        if not user1 or not user2:
            raise ValueError(f"One or both users not found: {user1_id}, {user2_id}")
        
        # Save before state for comparison
        import copy
        user1_before = copy.deepcopy(user1)
        user2_before = copy.deepcopy(user2)
        
        # Show current attributes before match
        if print_changes:
            print(f"\n{'='*60}")
            print(f"🔄 Processing Vibe Match: {user1['name']} ↔ {user2['name']}")
            print(f"{'='*60}")
            self.print_user_attributes(user1, f"BEFORE - {user1['name']}")
            self.print_user_attributes(user2, f"BEFORE - {user2['name']}")
        
        # Update attribute weights
        self.update_attribute_weights(user1, user2, match_result)
        
        # Update vector attributes (move closer or further in vector space)
        self.update_vector_attributes(user1, user2, match_result)
        
        # Record the vibe match
        self.record_vibe_match(user1_id, user2_id, match_result)
        
        # Save database
        self.save_database()
        
        # Show changes
        if print_changes:
            self.print_user_attributes(user1, f"AFTER - {user1['name']}")
            self.print_user_attributes(user2, f"AFTER - {user2['name']}")
            self.print_attribute_changes(user1_before, user1, user2_before, user2, match_result)
        
        return {
            'user1_updated': user1,
            'user2_updated': user2,
            'weights_updated': self.database['attribute_weights']
        }


if __name__ == "__main__":
    # Initialize algorithm
    algo = UserMatchingAlgorithm()
    
    # Example 1: Simple query - user wants a frontend developer
    print("\n" + "="*60)
    print("EXAMPLE 1: User query for frontend developer")
    print("="*60)
    results1 = algo.query("Harsh Shah", "I want a frontend developer")
    
    # Example 2: Vibe match - user didn't like the match
    if results1['matches']:
        matched_user = results1['matches'][0][0]
        print("\n" + "="*60)
        print(f"EXAMPLE 2: Vibe match - {results1['query_user']['name']} didn't vibe with {matched_user['name']}")
        print("="*60)
        algo.vibe_match("Harsh Shah", matched_user['name'], False)
        
        # Example 3: Query again after vibe match - should get different results
        print("\n" + "="*60)
        print("EXAMPLE 3: Query again after vibe match")
        print("="*60)
        results2 = algo.query("Harsh Shah", "I want a frontend developer")
    
    # Example 4: Different query - looking for a founder
    print("\n" + "="*60)
    print("EXAMPLE 4: Different query - looking for a founder")
    print("="*60)
    results3 = algo.query("Param Patel", "looking for a founder")

