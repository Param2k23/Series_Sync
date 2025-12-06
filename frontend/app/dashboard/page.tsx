'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Home,
  User,
  LogOut,
} from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard', active: true },
  { icon: User, label: 'Profile', href: '/dashboard/profile' },
];

interface Connection {
  id: number;
  name: string;
  avatar: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  group: string;
  groupColor: string;
}

interface GroupEdge {
  from: number;
  to: number;
  group: string;
}

const groups = [
  { name: 'Tech Hub', color: '#3b82f6' },
  { name: 'Design Circle', color: '#8b5cf6' },
  { name: 'Startup Squad', color: '#10b981' },
];

const generateConnections = (): Connection[] => {
  const names = [
    'Sarah Chen', 'Alex Rivera', 'Jordan Lee', 'Taylor Kim', 'Morgan Davis',
    'Casey Wilson', 'Riley Brooks', 'Quinn Foster', 'Avery Hart', 'Blake Morgan',
    'Cameron Scott', 'Dakota Ray', 'Ellis Quinn', 'Finley Rose', 'Harper Cole',
  ];

  return names.map((name, i) => {
    const group = groups[i % groups.length];
    return {
      id: i + 1,
      name,
      avatar: name.split(' ').map(n => n[0]).join(''),
      x: 200 + Math.random() * 600,
      y: 150 + Math.random() * 400,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      group: group.name,
      groupColor: group.color,
    };
  });
};

// Generate edges between members of the same group
const generateGroupEdges = (connections: Connection[]): GroupEdge[] => {
  const edges: GroupEdge[] = [];
  const groupMembers: { [key: string]: number[] } = {};
  
  connections.forEach(conn => {
    if (!groupMembers[conn.group]) {
      groupMembers[conn.group] = [];
    }
    groupMembers[conn.group].push(conn.id);
  });
  
  // Connect members within same group
  Object.entries(groupMembers).forEach(([group, members]) => {
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        edges.push({ from: members[i], to: members[j], group });
      }
    }
  });
  
  return edges;
};

export default function DashboardPage() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [groupEdges, setGroupEdges] = useState<GroupEdge[]>([]);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [draggingUser, setDraggingUser] = useState(false);
  const [userPos, setUserPos] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number>();
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  useEffect(() => {
    const conns = generateConnections();
    setConnections(conns);
    setGroupEdges(generateGroupEdges(conns));
    
    const updateDimensions = () => {
      if (canvasRef.current) {
        const w = canvasRef.current.offsetWidth;
        const h = canvasRef.current.offsetHeight;
        setDimensions({ width: w, height: h });
        setUserPos({ x: w / 2, y: h / 2 });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const animate = () => {
      if (draggingId === null && !draggingUser) {
        setConnections(prev => prev.map(conn => {
          let { x, y, vx, vy } = conn;
          
          const padding = 50;
          const maxX = dimensions.width - padding;
          const maxY = dimensions.height - padding;
          
          if (x <= padding || x >= maxX) vx = -vx * 0.8;
          if (y <= padding || y >= maxY) vy = -vy * 0.8;
          
          vx += (Math.random() - 0.5) * 0.008;
          vy += (Math.random() - 0.5) * 0.008;
          vx *= 0.998;
          vy *= 0.998;
          
          const speed = Math.sqrt(vx * vx + vy * vy);
          if (speed > 0.2) {
            vx = (vx / speed) * 0.2;
            vy = (vy / speed) * 0.2;
          }
          
          return {
            ...conn,
            x: Math.max(padding, Math.min(maxX, x + vx)),
            y: Math.max(padding, Math.min(maxY, y + vy)),
            vx,
            vy,
          };
        }));
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [dimensions, draggingId, draggingUser]);

  const handleMouseDown = useCallback((id: number, e: React.MouseEvent) => {
    e.preventDefault();
    setDraggingId(id);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (draggingId !== null) {
      setConnections(prev => prev.map(conn => 
        conn.id === draggingId ? { ...conn, x, y, vx: 0, vy: 0 } : conn
      ));
    }
    if (draggingUser) {
      setUserPos({ x, y });
    }
  }, [draggingId, draggingUser]);

  const handleMouseUp = useCallback(() => {
    setDraggingId(null);
    setDraggingUser(false);
  }, []);

  const handleUserMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDraggingUser(true);
  }, []);

  const getConnById = (id: number) => connections.find(c => c.id === id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-16 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 z-40 flex flex-col items-center py-6 shadow-sm">
        <Link href="/" className="mb-10">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/10">
            <span className="text-white font-bold text-xs">SS</span>
          </div>
        </Link>

        <nav className="flex-1 flex flex-col items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                item.active 
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' 
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
              }`}
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
          title="Log out"
        >
          <LogOut className="w-5 h-5" />
        </Link>
      </aside>

      {/* Canvas */}
      <main 
        ref={canvasRef} 
        className="ml-16 h-screen relative cursor-default select-none overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Subtle grid background */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* SVG for all edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Group edges (connection to connection) */}
          {groupEdges.map((edge, idx) => {
            const from = getConnById(edge.from);
            const to = getConnById(edge.to);
            if (!from || !to) return null;
            
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const sag = Math.min(dist * 0.08, 25);
            
            const isHighlighted = hoveredNode === edge.from || hoveredNode === edge.to;
            
            return (
              <path
                key={`group-${idx}`}
                d={`M ${from.x} ${from.y} Q ${midX} ${midY + sag} ${to.x} ${to.y}`}
                fill="none"
                stroke={from.groupColor}
                strokeWidth={isHighlighted ? 2 : 1.5}
                strokeLinecap="round"
                opacity={isHighlighted ? 0.6 : 0.15}
                style={{ transition: 'opacity 0.2s, stroke-width 0.2s' }}
              />
            );
          })}

          {/* User to connection edges */}
          {connections.map((conn) => {
            const dx = conn.x - userPos.x;
            const dy = conn.y - userPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const sag = Math.min(dist * 0.1, 35);
            const midX = (conn.x + userPos.x) / 2;
            const midY = (conn.y + userPos.y) / 2 + sag;
            
            const isHovered = hoveredNode === conn.id;
            
            return (
              <g key={`edge-${conn.id}`}>
                <path
                  d={`M ${userPos.x} ${userPos.y} Q ${midX} ${midY} ${conn.x} ${conn.y}`}
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  strokeLinecap="round"
                  opacity={isHovered ? 0.5 : 0.12}
                  style={{ transition: 'opacity 0.2s, stroke-width 0.2s' }}
                />
              </g>
            );
          })}
        </svg>

        {/* User node */}
        <motion.div
          className="absolute z-20"
          style={{
            left: userPos.x - 28,
            top: userPos.y - 28,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        >
          <div 
            className={`relative cursor-grab active:cursor-grabbing ${draggingUser ? 'cursor-grabbing' : ''}`}
            onMouseDown={handleUserMouseDown}
          >
            <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center shadow-xl shadow-slate-900/20 hover:scale-105 transition-transform ring-4 ring-white">
              <span className="text-white font-semibold text-sm">You</span>
            </div>
          </div>
        </motion.div>

        {/* Connection nodes */}
        {connections.map((conn, index) => (
          <motion.div
            key={conn.id}
            className="absolute z-10"
            style={{
              left: conn.x - 20,
              top: conn.y - 20,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 + index * 0.015, type: 'spring', stiffness: 300 }}
          >
            <div 
              className={`relative cursor-grab active:cursor-grabbing group ${draggingId === conn.id ? 'cursor-grabbing' : ''}`}
              onMouseDown={(e) => handleMouseDown(conn.id, e)}
              onMouseEnter={() => setHoveredNode(conn.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ring-2 ring-white ${
                  hoveredNode === conn.id ? 'scale-125 shadow-xl' : ''
                }`}
                style={{ 
                  backgroundColor: conn.groupColor,
                }}
              >
                <span className="text-white font-medium text-xs">{conn.avatar}</span>
              </div>

              {/* Tooltip */}
              <div 
                className="absolute left-1/2 -translate-x-1/2 -top-14 px-3 py-2 rounded-xl bg-slate-900 text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none shadow-xl"
              >
                <p className="text-sm font-medium">{conn.name}</p>
                <p className="text-xs text-slate-400">{conn.group}</p>
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-slate-900 rotate-45" />
              </div>
            </div>
          </motion.div>
        ))}

        {/* Connection count - cleaner */}
        <div className="absolute top-6 right-6 px-4 py-2.5 rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-slate-200/60">
          <p className="text-slate-600 text-sm font-medium">
            <span className="font-bold text-slate-900">{connections.length}</span> connections
          </p>
        </div>

        {/* Groups legend */}
        <div className="absolute bottom-6 right-6 px-4 py-3 rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-slate-200/60">
          <p className="text-xs text-slate-500 mb-2 font-medium">Groups</p>
          <div className="flex flex-col gap-1.5">
            {groups.map(group => (
              <div key={group.name} className="flex items-center gap-2">
                <div 
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: group.color }}
                />
                <span className="text-xs text-slate-600">{group.name}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
