// Mock JSON Database for Series Sync
// In production, this would be replaced with actual API calls

export interface ScrapedAttributes {
  interests: string[];
  skills: string[];
  industries: string[];
  topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  activityLevel: 'high' | 'medium' | 'low';
  lastScraped?: string;
}

export interface SocialProfiles {
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  reddit?: string;
}

export interface User {
  id: string;
  phone: string;
  name: string;
  username: string;
  email?: string;
  dob?: string;
  location?: string;
  occupation?: string;
  bio?: string;
  profileImage?: string;
  socialProfiles: SocialProfiles;
  scrapedAttributes: ScrapedAttributes;
  createdAt: string;
  lastLogin?: string;
}

export interface Connection {
  userId: string;
  connectedUserId: string;
  strength: number; // 0-100 based on shared attributes
  sharedAttributes: string[];
  group?: string;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  color: string;
  memberIds: string[];
  basedOn: string[]; // attributes that define this group
  isTemporary: boolean;
  expiresAt?: string; // ISO timestamp for temporary groups
  upvotes: number;
  upvotedBy: string[]; // user IDs who upvoted
  createdAt: string;
}

export interface Database {
  users: User[];
  connections: Connection[];
  groups: Group[];
}

// Initial mock data
const initialDatabase: Database = {
  users: [
    {
      id: 'user-1',
      phone: '+1234567890',
      name: 'Sarah Chen',
      username: 'sarahchen',
      email: 'sarah@example.com',
      dob: '1992-03-15',
      location: 'San Francisco, CA',
      occupation: 'Product Designer',
      bio: 'Design enthusiast. Love creating beautiful user experiences.',
      socialProfiles: {
        linkedin: 'sarahchen',
        twitter: '@sarahdesigns',
        instagram: '@sarah.designs',
      },
      scrapedAttributes: {
        interests: ['UI/UX', 'Typography', 'Minimalism', 'Tech', 'Startups'],
        skills: ['Figma', 'Sketch', 'Prototyping', 'User Research'],
        industries: ['Technology', 'Design', 'SaaS'],
        topics: ['Design Systems', 'Accessibility', 'Mobile Apps'],
        sentiment: 'positive',
        activityLevel: 'high',
        lastScraped: '2024-01-15',
      },
      createdAt: '2024-01-01',
      lastLogin: '2024-01-20',
    },
    {
      id: 'user-2',
      phone: '+1234567891',
      name: 'Alex Rivera',
      username: 'alexr',
      email: 'alex@example.com',
      dob: '1990-07-22',
      location: 'Austin, TX',
      occupation: 'Full Stack Developer',
      bio: 'Building the future, one line of code at a time.',
      socialProfiles: {
        linkedin: 'alexrivera',
        twitter: '@alexcodes',
        reddit: 'u/alexr_dev',
      },
      scrapedAttributes: {
        interests: ['React', 'Node.js', 'Open Source', 'AI', 'Startups'],
        skills: ['TypeScript', 'Python', 'AWS', 'System Design'],
        industries: ['Technology', 'Fintech', 'SaaS'],
        topics: ['Web3', 'Machine Learning', 'DevOps'],
        sentiment: 'positive',
        activityLevel: 'high',
        lastScraped: '2024-01-14',
      },
      createdAt: '2024-01-02',
      lastLogin: '2024-01-19',
    },
    {
      id: 'user-3',
      phone: '+1234567892',
      name: 'Jordan Lee',
      username: 'jordanl',
      email: 'jordan@example.com',
      dob: '1988-11-30',
      location: 'New York, NY',
      occupation: 'Product Manager',
      bio: 'Turning ideas into products. Ex-Google, Ex-Meta.',
      socialProfiles: {
        linkedin: 'jordanlee',
        twitter: '@jordan_pm',
      },
      scrapedAttributes: {
        interests: [
          'Product Strategy',
          'Growth',
          'Startups',
          'Tech',
          'Leadership',
        ],
        skills: ['Roadmapping', 'Analytics', 'User Research', 'Agile'],
        industries: ['Technology', 'E-commerce', 'SaaS'],
        topics: ['Product-Led Growth', 'OKRs', 'Team Building'],
        sentiment: 'positive',
        activityLevel: 'medium',
        lastScraped: '2024-01-13',
      },
      createdAt: '2024-01-03',
      lastLogin: '2024-01-18',
    },
    {
      id: 'user-4',
      phone: '+1234567893',
      name: 'Taylor Kim',
      username: 'taylork',
      email: 'taylor@example.com',
      dob: '1995-05-18',
      location: 'Seattle, WA',
      occupation: 'Data Scientist',
      bio: 'Making sense of data. ML enthusiast.',
      socialProfiles: {
        linkedin: 'taylorkim',
        twitter: '@taylor_data',
        reddit: 'u/taylor_ml',
      },
      scrapedAttributes: {
        interests: [
          'Machine Learning',
          'Statistics',
          'Python',
          'AI',
          'Research',
        ],
        skills: ['TensorFlow', 'PyTorch', 'SQL', 'Data Visualization'],
        industries: ['Technology', 'Healthcare', 'Finance'],
        topics: ['Deep Learning', 'NLP', 'Computer Vision'],
        sentiment: 'neutral',
        activityLevel: 'medium',
        lastScraped: '2024-01-12',
      },
      createdAt: '2024-01-04',
      lastLogin: '2024-01-17',
    },
    {
      id: 'user-5',
      phone: '+1234567894',
      name: 'Morgan Davis',
      username: 'morgand',
      email: 'morgan@example.com',
      dob: '1993-09-08',
      location: 'Los Angeles, CA',
      occupation: 'Marketing Lead',
      bio: 'Growth hacker. Content creator. Coffee addict.',
      socialProfiles: {
        linkedin: 'morgandavis',
        instagram: '@morgan.marketing',
        twitter: '@morgangrowthhacks',
      },
      scrapedAttributes: {
        interests: [
          'Growth Marketing',
          'Content Strategy',
          'Social Media',
          'Branding',
          'Startups',
        ],
        skills: ['SEO', 'Paid Ads', 'Analytics', 'Copywriting'],
        industries: ['Technology', 'E-commerce', 'Media'],
        topics: [
          'Viral Marketing',
          'Community Building',
          'Influencer Marketing',
        ],
        sentiment: 'positive',
        activityLevel: 'high',
        lastScraped: '2024-01-11',
      },
      createdAt: '2024-01-05',
      lastLogin: '2024-01-16',
    },
    {
      id: 'user-6',
      phone: '+1234567895',
      name: 'Casey Wilson',
      username: 'caseyw',
      email: 'casey@example.com',
      dob: '1991-12-25',
      location: 'Denver, CO',
      occupation: 'Startup Founder',
      bio: 'Building my third startup. Failed twice, learned a lot.',
      socialProfiles: {
        linkedin: 'caseywilson',
        twitter: '@casey_founder',
      },
      scrapedAttributes: {
        interests: [
          'Entrepreneurship',
          'Fundraising',
          'Startups',
          'Tech',
          'Leadership',
        ],
        skills: ['Pitching', 'Team Building', 'Product Strategy', 'Networking'],
        industries: ['Technology', 'SaaS', 'Fintech'],
        topics: ['Venture Capital', 'Bootstrapping', 'Scaling'],
        sentiment: 'positive',
        activityLevel: 'high',
        lastScraped: '2024-01-10',
      },
      createdAt: '2024-01-06',
      lastLogin: '2024-01-15',
    },
    {
      id: 'user-7',
      phone: '+1234567896',
      name: 'Riley Brooks',
      username: 'rileyb',
      email: 'riley@example.com',
      dob: '1994-02-14',
      location: 'Boston, MA',
      occupation: 'UX Researcher',
      bio: 'Understanding users to build better products.',
      socialProfiles: {
        linkedin: 'rileybrooks',
        twitter: '@riley_ux',
      },
      scrapedAttributes: {
        interests: [
          'User Research',
          'Psychology',
          'Design Thinking',
          'Accessibility',
        ],
        skills: ['Interviews', 'Usability Testing', 'Surveys', 'Data Analysis'],
        industries: ['Technology', 'Healthcare', 'Education'],
        topics: [
          'Inclusive Design',
          'Behavioral Psychology',
          'Qualitative Research',
        ],
        sentiment: 'positive',
        activityLevel: 'medium',
        lastScraped: '2024-01-09',
      },
      createdAt: '2024-01-07',
      lastLogin: '2024-01-14',
    },
    {
      id: 'user-8',
      phone: '+1234567897',
      name: 'Quinn Foster',
      username: 'quinnf',
      email: 'quinn@example.com',
      dob: '1989-06-30',
      location: 'Chicago, IL',
      occupation: 'Engineering Manager',
      bio: 'Leading teams to build amazing products.',
      socialProfiles: {
        linkedin: 'quinnfoster',
        twitter: '@quinn_eng',
      },
      scrapedAttributes: {
        interests: [
          'Engineering Management',
          'Leadership',
          'Tech',
          'Mentorship',
        ],
        skills: ['Team Building', 'Architecture', 'Hiring', 'Code Review'],
        industries: ['Technology', 'Fintech', 'Enterprise'],
        topics: ['Engineering Culture', 'Technical Debt', 'Career Growth'],
        sentiment: 'positive',
        activityLevel: 'medium',
        lastScraped: '2024-01-08',
      },
      createdAt: '2024-01-08',
      lastLogin: '2024-01-13',
    },
    {
      id: 'user-9',
      phone: '+1234567898',
      name: 'Avery Hart',
      username: 'averyh',
      email: 'avery@example.com',
      dob: '1996-04-12',
      location: 'Portland, OR',
      occupation: 'Frontend Developer',
      bio: 'Crafting beautiful interfaces with React.',
      socialProfiles: {
        linkedin: 'averyhart',
        twitter: '@avery_frontend',
        reddit: 'u/avery_react',
      },
      scrapedAttributes: {
        interests: [
          'React',
          'CSS',
          'Animation',
          'Design Systems',
          'Open Source',
        ],
        skills: ['TypeScript', 'Next.js', 'Tailwind', 'Framer Motion'],
        industries: ['Technology', 'Design', 'SaaS'],
        topics: ['Web Performance', 'Accessibility', 'Component Libraries'],
        sentiment: 'positive',
        activityLevel: 'high',
        lastScraped: '2024-01-07',
      },
      createdAt: '2024-01-09',
      lastLogin: '2024-01-12',
    },
    {
      id: 'user-10',
      phone: '+1234567899',
      name: 'Blake Morgan',
      username: 'blakem',
      email: 'blake@example.com',
      dob: '1987-08-20',
      location: 'Miami, FL',
      occupation: 'Investor',
      bio: 'Angel investor. Backing the next generation of founders.',
      socialProfiles: {
        linkedin: 'blakemorgan',
        twitter: '@blake_invests',
      },
      scrapedAttributes: {
        interests: ['Investing', 'Startups', 'Fintech', 'Tech', 'Networking'],
        skills: ['Due Diligence', 'Portfolio Management', 'Deal Sourcing'],
        industries: ['Venture Capital', 'Fintech', 'SaaS'],
        topics: ['Seed Investing', 'Startup Valuations', 'Market Trends'],
        sentiment: 'neutral',
        activityLevel: 'medium',
        lastScraped: '2024-01-06',
      },
      createdAt: '2024-01-10',
      lastLogin: '2024-01-11',
    },
  ],
  connections: [],
  groups: [
    {
      id: 'group-1',
      name: 'Tech Builders',
      color: '#3b82f6',
      memberIds: ['user-2', 'user-8', 'user-9'],
      basedOn: ['React', 'TypeScript', 'Engineering'],
      isTemporary: false,
      upvotes: 15,
      upvotedBy: ['user-2', 'user-8', 'user-9'],
      createdAt: '2024-01-01',
    },
    {
      id: 'group-2',
      name: 'Design Crew',
      color: '#8b5cf6',
      memberIds: ['user-1', 'user-7'],
      basedOn: ['UI/UX', 'Design', 'User Research'],
      isTemporary: false,
      upvotes: 12,
      upvotedBy: ['user-1', 'user-7'],
      createdAt: '2024-01-02',
    },
    {
      id: 'group-3',
      name: 'Startup Network',
      color: '#10b981',
      memberIds: ['user-3', 'user-5', 'user-6', 'user-10'],
      basedOn: ['Startups', 'Entrepreneurship', 'Growth'],
      isTemporary: false,
      upvotes: 20,
      upvotedBy: ['user-3', 'user-5', 'user-6', 'user-10'],
      createdAt: '2024-01-03',
    },
    {
      id: 'group-4',
      name: 'Data & AI',
      color: '#f59e0b',
      memberIds: ['user-4'],
      basedOn: ['Machine Learning', 'Data Science', 'AI'],
      isTemporary: false,
      upvotes: 5,
      upvotedBy: ['user-4'],
      createdAt: '2024-01-04',
    },
  ],
};

// Storage key
const STORAGE_KEY = 'series_sync_db';
const CURRENT_USER_KEY = 'series_sync_current_user';

// Migrate groups to ensure they have all required fields
function migrateGroups(groups: Group[]): Group[] {
  return groups.map((group) => ({
    ...group,
    isTemporary: group.isTemporary ?? false,
    upvotes: group.upvotes ?? 0,
    upvotedBy: group.upvotedBy ?? [],
    createdAt: group.createdAt ?? new Date().toISOString(),
  }));
}

// Initialize database
function initDatabase(): Database {
  if (typeof window === 'undefined') return initialDatabase;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const db = JSON.parse(stored);
    // Migrate groups to ensure they have all required fields
    db.groups = migrateGroups(db.groups);
    return db;
  }

  // Generate connections based on shared attributes
  const db = { ...initialDatabase };
  db.connections = generateConnections(db.users);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  return db;
}

// Calculate connection strength based on shared attributes
function calculateConnectionStrength(
  user1: User,
  user2: User
): { strength: number; sharedAttributes: string[] } {
  const allAttributes1 = [
    ...user1.scrapedAttributes.interests,
    ...user1.scrapedAttributes.skills,
    ...user1.scrapedAttributes.industries,
    ...user1.scrapedAttributes.topics,
  ];

  const allAttributes2 = [
    ...user2.scrapedAttributes.interests,
    ...user2.scrapedAttributes.skills,
    ...user2.scrapedAttributes.industries,
    ...user2.scrapedAttributes.topics,
  ];

  const sharedAttributes = allAttributes1.filter((attr) =>
    allAttributes2.some((a) => a.toLowerCase() === attr.toLowerCase())
  );

  const maxPossible = Math.min(allAttributes1.length, allAttributes2.length);
  const strength = Math.round((sharedAttributes.length / maxPossible) * 100);

  return { strength, sharedAttributes };
}

// Generate connections between all users
function generateConnections(users: User[]): Connection[] {
  const connections: Connection[] = [];

  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      const { strength, sharedAttributes } = calculateConnectionStrength(
        users[i],
        users[j]
      );

      if (strength > 10) {
        // Only create connection if there's meaningful overlap
        connections.push({
          userId: users[i].id,
          connectedUserId: users[j].id,
          strength,
          sharedAttributes,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  return connections;
}

// Get database
export function getDatabase(): Database {
  return initDatabase();
}

// Save database
function saveDatabase(db: Database): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }
}

// ============ AUTH FUNCTIONS ============

export function signup(userData: Partial<User>): User {
  const db = getDatabase();

  // Check if phone already exists
  if (db.users.find((u) => u.phone === userData.phone)) {
    throw new Error('Phone number already registered');
  }

  // Check if username already exists
  if (db.users.find((u) => u.username === userData.username)) {
    throw new Error('Username already taken');
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    phone: userData.phone || '',
    name: userData.name || '',
    username: userData.username || '',
    email: userData.email,
    dob: userData.dob,
    location: userData.location,
    occupation: userData.occupation,
    bio: userData.bio,
    profileImage: userData.profileImage,
    socialProfiles: userData.socialProfiles || {},
    scrapedAttributes: userData.scrapedAttributes || {
      interests: [],
      skills: [],
      industries: [],
      topics: [],
      sentiment: 'neutral',
      activityLevel: 'low',
    },
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);

  // Generate connections for new user
  const newConnections = db.users
    .filter((u) => u.id !== newUser.id)
    .map((existingUser) => {
      const { strength, sharedAttributes } = calculateConnectionStrength(
        newUser,
        existingUser
      );
      if (strength > 10) {
        return {
          userId: newUser.id,
          connectedUserId: existingUser.id,
          strength,
          sharedAttributes,
          createdAt: new Date().toISOString(),
        };
      }
      return null;
    })
    .filter(Boolean) as Connection[];

  db.connections.push(...newConnections);
  saveDatabase(db);

  // Set as current user
  setCurrentUser(newUser);

  return newUser;
}

export function login(phone: string): User | null {
  const db = getDatabase();
  const user = db.users.find((u) => u.phone === phone);

  if (user) {
    user.lastLogin = new Date().toISOString();
    saveDatabase(db);
    setCurrentUser(user);
    return user;
  }

  return null;
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(CURRENT_USER_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return null;
}

export function setCurrentUser(user: User): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }
}

// ============ USER FUNCTIONS ============

export function getUserById(id: string): User | null {
  const db = getDatabase();
  return db.users.find((u) => u.id === id) || null;
}

export function getUserByPhone(phone: string): User | null {
  const db = getDatabase();
  return db.users.find((u) => u.phone === phone) || null;
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const db = getDatabase();
  const userIndex = db.users.findIndex((u) => u.id === id);

  if (userIndex === -1) return null;

  db.users[userIndex] = { ...db.users[userIndex], ...updates };

  // If attributes changed, recalculate connections
  if (updates.scrapedAttributes) {
    // Remove old connections for this user
    db.connections = db.connections.filter(
      (c) => c.userId !== id && c.connectedUserId !== id
    );

    // Generate new connections
    const newConnections = db.users
      .filter((u) => u.id !== id)
      .map((existingUser) => {
        const { strength, sharedAttributes } = calculateConnectionStrength(
          db.users[userIndex],
          existingUser
        );
        if (strength > 10) {
          return {
            userId: id,
            connectedUserId: existingUser.id,
            strength,
            sharedAttributes,
            createdAt: new Date().toISOString(),
          };
        }
        return null;
      })
      .filter(Boolean) as Connection[];

    db.connections.push(...newConnections);
  }

  saveDatabase(db);

  // Update current user if it's the same
  const currentUser = getCurrentUser();
  if (currentUser?.id === id) {
    setCurrentUser(db.users[userIndex]);
  }

  return db.users[userIndex];
}

// ============ CONNECTION FUNCTIONS ============

export function getConnectionsForUser(
  userId: string
): Array<{ user: User; connection: Connection }> {
  const db = getDatabase();

  const connections = db.connections.filter(
    (c) => c.userId === userId || c.connectedUserId === userId
  );

  return connections
    .map((conn) => {
      const connectedUserId =
        conn.userId === userId ? conn.connectedUserId : conn.userId;
      const user = db.users.find((u) => u.id === connectedUserId);
      return user ? { user, connection: conn } : null;
    })
    .filter(Boolean) as Array<{ user: User; connection: Connection }>;
}

export function getAllConnections(): Connection[] {
  const db = getDatabase();
  return db.connections;
}

// ============ GROUP FUNCTIONS ============

export function getGroups(): Group[] {
  const db = getDatabase();
  return db.groups;
}

export function getGroupsForUser(userId: string): Group[] {
  const db = getDatabase();
  return db.groups.filter((g) => g.memberIds.includes(userId));
}

export function addUserToGroup(userId: string, groupId: string): void {
  const db = getDatabase();
  const group = db.groups.find((g) => g.id === groupId);

  if (group && !group.memberIds.includes(userId)) {
    group.memberIds.push(userId);
    saveDatabase(db);
  }
}

// ============ TEMPORARY GROUP FUNCTIONS ============

// Algorithm to form temporary groups based on shared attributes
export function formTemporaryGroups(): Group[] {
  const db = getDatabase();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

  // Clean up expired temporary groups
  db.groups = db.groups.filter(
    (g) => !g.isTemporary || (g.expiresAt && new Date(g.expiresAt) > now)
  );

  const newGroups: Group[] = [];
  const processedUsers = new Set<string>();

  // Group formation algorithm:
  // 1. Find users with high attribute overlap (>= 3 shared attributes)
  // 2. Form groups of 3-6 members
  // 3. Name groups based on most common shared attributes

  for (let i = 0; i < db.users.length; i++) {
    if (processedUsers.has(db.users[i].id)) continue;

    const user1 = db.users[i];
    const potentialMembers: Array<{
      user: User;
      sharedCount: number;
      sharedAttrs: string[];
    }> = [];

    // Find users with significant overlap
    for (let j = i + 1; j < db.users.length; j++) {
      if (processedUsers.has(db.users[j].id)) continue;

      const user2 = db.users[j];
      const { sharedAttributes } = calculateConnectionStrength(user1, user2);

      if (sharedAttributes.length >= 3) {
        potentialMembers.push({
          user: user2,
          sharedCount: sharedAttributes.length,
          sharedAttrs: sharedAttributes,
        });
      }
    }

    // Sort by shared attributes count
    potentialMembers.sort((a, b) => b.sharedCount - a.sharedCount);

    // Form groups of 3-6 members
    if (potentialMembers.length >= 2) {
      const groupSize = Math.min(5, potentialMembers.length + 1); // +1 for user1
      const selectedMembers = potentialMembers.slice(0, groupSize - 1);

      // Find most common shared attributes
      const allSharedAttrs = selectedMembers.flatMap((m) => m.sharedAttrs);
      const attrCounts: { [key: string]: number } = {};
      allSharedAttrs.forEach((attr) => {
        attrCounts[attr] = (attrCounts[attr] || 0) + 1;
      });

      const topAttrs = Object.entries(attrCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([attr]) => attr);

      // Generate group name from top attributes
      let groupName = 'New Group';
      if (topAttrs.length > 0) {
        const secondAttr = topAttrs.length > 1 ? ` & ${topAttrs[1]}` : '';
        groupName = `${topAttrs[0]}${secondAttr}`;
      }

      // Generate color based on attributes hash
      const colorHash = topAttrs
        .join('')
        .split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const colors = [
        '#3b82f6',
        '#8b5cf6',
        '#10b981',
        '#f59e0b',
        '#ef4444',
        '#06b6d4',
        '#a855f7',
      ];
      const groupColor = colors[colorHash % colors.length];

      const memberIds = [user1.id, ...selectedMembers.map((m) => m.user.id)];

      const newGroup: Group = {
        id: `temp-group-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 11)}`,
        name: groupName,
        color: groupColor,
        memberIds,
        basedOn: topAttrs,
        isTemporary: true,
        expiresAt: expiresAt.toISOString(),
        upvotes: 0,
        upvotedBy: [],
        createdAt: now.toISOString(),
      };

      newGroups.push(newGroup);
      db.groups.push(newGroup);

      // Mark users as processed
      memberIds.forEach((id) => processedUsers.add(id));
    }
  }

  saveDatabase(db);
  return newGroups;
}

// Upvote a group
export function upvoteGroup(userId: string, groupId: string): Group | null {
  const db = getDatabase();
  const group = db.groups.find((g) => g.id === groupId);

  if (!group) return null;

  // Ensure upvotedBy exists
  if (!group.upvotedBy) {
    group.upvotedBy = [];
  }
  if (group.upvotes === undefined) {
    group.upvotes = 0;
  }

  // Check if user already upvoted
  if (group.upvotedBy.includes(userId)) {
    // Remove upvote
    group.upvotedBy = group.upvotedBy.filter((id) => id !== userId);
    group.upvotes = Math.max(0, group.upvotes - 1);
  } else {
    // Add upvote
    group.upvotedBy.push(userId);
    group.upvotes += 1;
  }

  // Convert to permanent if upvoted by >= 70% of members
  const upvoteThreshold = Math.ceil(group.memberIds.length * 0.7);
  if (group.isTemporary && group.upvotes >= upvoteThreshold) {
    group.isTemporary = false;
    group.expiresAt = undefined;
  }

  saveDatabase(db);
  return group;
}

// Get active temporary groups (not expired)
export function getActiveTemporaryGroups(): Group[] {
  const db = getDatabase();
  const now = new Date();

  return db.groups.filter(
    (g) => g.isTemporary && g.expiresAt && new Date(g.expiresAt) > now
  );
}

// Clean up expired temporary groups
export function cleanupExpiredGroups(): number {
  const db = getDatabase();
  const now = new Date();
  const beforeCount = db.groups.length;

  db.groups = db.groups.filter(
    (g) => !g.isTemporary || (g.expiresAt && new Date(g.expiresAt) > now)
  );

  const removed = beforeCount - db.groups.length;
  if (removed > 0) {
    saveDatabase(db);
  }

  return removed;
}

// ============ SCRAPING SIMULATION ============

export function scrapeUserSocialMedia(
  userId: string,
  profiles: SocialProfiles
): ScrapedAttributes {
  // Simulate scraping based on social profiles provided
  // In production, this would call actual scraping APIs

  const interests: string[] = [];
  const skills: string[] = [];
  const industries: string[] = [];
  const topics: string[] = [];

  // Simulate based on which platforms are connected
  if (profiles.linkedin) {
    industries.push('Technology', 'Business');
    skills.push('Professional Networking', 'Industry Knowledge');
    topics.push('Career Development', 'Business Strategy');
  }

  if (profiles.twitter) {
    interests.push('News', 'Tech Trends', 'Social Media');
    topics.push('Current Events', 'Tech News');
  }

  if (profiles.instagram) {
    interests.push('Visual Content', 'Lifestyle', 'Creative Arts');
    skills.push('Photography', 'Content Creation');
  }

  if (profiles.reddit) {
    interests.push('Community Discussion', 'Niche Interests');
    topics.push('Online Communities', 'Topic Deep-Dives');
  }

  const scrapedData: ScrapedAttributes = {
    interests,
    skills,
    industries,
    topics,
    sentiment: 'positive',
    activityLevel: Object.keys(profiles).length > 2 ? 'high' : 'medium',
    lastScraped: new Date().toISOString(),
  };

  // Update user with scraped data
  const db = getDatabase();
  const user = db.users.find((u) => u.id === userId);
  if (user) {
    user.scrapedAttributes = {
      ...user.scrapedAttributes,
      ...scrapedData,
      interests: [
        ...new Set([...user.scrapedAttributes.interests, ...interests]),
      ],
      skills: [...new Set([...user.scrapedAttributes.skills, ...skills])],
      industries: [
        ...new Set([...user.scrapedAttributes.industries, ...industries]),
      ],
      topics: [...new Set([...user.scrapedAttributes.topics, ...topics])],
    };
    saveDatabase(db);
  }

  return scrapedData;
}

// ============ UTILITY FUNCTIONS ============

export function resetDatabase(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export function getAllUsers(): User[] {
  const db = getDatabase();
  return db.users;
}
