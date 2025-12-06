'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, User, LogOut } from 'lucide-react';
import {
  getCurrentUser,
  getConnectionsForUser,
  logout,
  User as UserType,
  Connection,
} from '@/lib/database';

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard', active: true },
  { icon: User, label: 'Profile', href: '/dashboard/profile' },
];

interface NodeData {
  id: string;
  name: string;
  avatar: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  group?: string;
  groupColor: string;
  connection?: Connection;
  isTemporaryGroup?: boolean;
  groupId?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingUser, setDraggingUser] = useState(false);
  const [userPos, setUserPos] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number>();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from database
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/signup');
      return;
    }

    setCurrentUser(user);

    // Get connections for current user
    const userConnections = getConnectionsForUser(user.id);

    // Generate unique colors for each node
    const colors = [
      '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444',
      '#06b6d4', '#a855f7', '#ec4899', '#14b8a6', '#f97316',
      '#6366f1', '#84cc16', '#f43f5e', '#06b6d4', '#8b5cf6',
      '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7',
    ];

    // Convert to node data
    const nodeData: NodeData[] = userConnections.map((conn, i) => {
      return {
        id: conn.user.id,
        name: conn.user.name,
        avatar: conn.user.name
          .split(' ')
          .map((n) => n[0])
          .join(''),
        x: 100 + Math.random() * (dimensions.width - 200),
        y: 100 + Math.random() * (dimensions.height - 200),
        vx: (Math.random() - 0.5) * 0.1,
        vy: (Math.random() - 0.5) * 0.1,
        group: undefined,
        groupColor: colors[i % colors.length], // Unique color for each node
        connection: conn,
        isTemporaryGroup: false,
        groupId: undefined,
      };
    });

    // Add current user as a node
    const userNode: NodeData = {
      id: user.id,
      name: user.name,
      avatar: user.name
        .split(' ')
        .map((n) => n[0])
        .join(''),
      x: dimensions.width / 2,
      y: dimensions.height / 2,
      vx: 0,
      vy: 0,
      groupColor: '#1f2937',
    };
    setUserPos({ x: dimensions.width / 2, y: dimensions.height / 2 });
    setNodes([userNode, ...nodeData]);
    setIsLoading(false);
  }, [router, dimensions]);

  // Update dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const w = canvasRef.current.offsetWidth;
        const h = canvasRef.current.offsetHeight;
        setDimensions({ width: w, height: h });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Physics simulation
  useEffect(() => {
    const animate = () => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (draggingId === node.id) return node;

          // Repulsion from other nodes
          let fx = 0;
          let fy = 0;

          prevNodes.forEach((other) => {
            if (other.id === node.id) return;
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            // Reduced repulsion to keep nodes closer together and in frame
            const force = 1500 / (dist * dist);
            fx += (dx / dist) * force;
            fy += (dy / dist) * force;
          });

          // Attraction to connected nodes
          if (node.connection) {
            const connectedNode = prevNodes.find(
              (n) => n.id === node.connection?.connectedUserId
            );
            if (connectedNode) {
              const dx = connectedNode.x - node.x;
              const dy = connectedNode.y - node.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              const strength = (node.connection.strength / 100) * 0.5;
              fx += (dx / dist) * strength;
              fy += (dy / dist) * strength;
            }
          }

          // Attraction to user node
          const userNode = prevNodes.find((n) => n.id === currentUser?.id);
          if (userNode && node.id !== currentUser?.id) {
            const dx = userNode.x - node.x;
            const dy = userNode.y - node.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = 0.3;
            fx += (dx / dist) * force;
            fy += (dy / dist) * force;
          }

          // Centering force to keep nodes in frame
          const centerX = dimensions.width / 2;
          const centerY = dimensions.height / 2;
          const distFromCenter = Math.sqrt(
            Math.pow(node.x - centerX, 2) + Math.pow(node.y - centerY, 2)
          );
          const maxDist = Math.min(dimensions.width, dimensions.height) / 2 - 100;
          
          if (distFromCenter > maxDist) {
            const dx = centerX - node.x;
            const dy = centerY - node.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const centeringForce = (distFromCenter - maxDist) * 0.01;
            fx += (dx / dist) * centeringForce;
            fy += (dy / dist) * centeringForce;
          }

          // Update velocity with better damping
          let vx = node.vx * 0.88 + fx * 0.01;
          let vy = node.vy * 0.88 + fy * 0.01;

          // Limit velocity
          const speed = Math.sqrt(vx * vx + vy * vy);
          if (speed > 2) {
            vx = (vx / speed) * 2;
            vy = (vy / speed) * 2;
          }

          // Update position
          let x = node.x + vx;
          let y = node.y + vy;

          // Strong boundary constraints - keep nodes in frame
          const padding = 60;
          const nodeRadius = node.id === currentUser?.id ? 30 : 25;
          
          if (x < padding + nodeRadius) {
            x = padding + nodeRadius;
            vx = -vx * 0.8; // Stronger bounce
          } else if (x > dimensions.width - padding - nodeRadius) {
            x = dimensions.width - padding - nodeRadius;
            vx = -vx * 0.8;
          }
          if (y < padding + nodeRadius) {
            y = padding + nodeRadius;
            vy = -vy * 0.8;
          } else if (y > dimensions.height - padding - nodeRadius) {
            y = dimensions.height - padding - nodeRadius;
            vy = -vy * 0.8;
          }
          
          // Additional constraint: if node is trying to escape, pull it back
          if (x < 0 || x > dimensions.width || y < 0 || y > dimensions.height) {
            x = Math.max(padding + nodeRadius, Math.min(dimensions.width - padding - nodeRadius, x));
            y = Math.max(padding + nodeRadius, Math.min(dimensions.height - padding - nodeRadius, y));
            vx = 0;
            vy = 0;
          }

          return {
            ...node,
            x,
            y,
            vx,
            vy,
          };
        })
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [draggingId, dimensions, currentUser]);

  // Handle mouse drag
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      if (nodeId === currentUser?.id) {
        setDraggingUser(true);
      }
      setDraggingId(nodeId);
    },
    [currentUser]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggingId) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (draggingUser) {
        setUserPos({ x, y });
        setNodes((prev) =>
          prev.map((node) =>
            node.id === currentUser?.id ? { ...node, x, y } : node
          )
        );
      } else {
        setNodes((prev) =>
          prev.map((node) =>
            node.id === draggingId ? { ...node, x, y } : node
          )
        );
      }
    },
    [draggingId, draggingUser, currentUser]
  );

  const handleMouseUp = useCallback(() => {
    setDraggingId(null);
    setDraggingUser(false);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  // Get all connections for rendering edges
  const allConnections: Array<{
    from: NodeData;
    to: NodeData;
    connection: Connection;
  }> = [];

  nodes.forEach((node) => {
    if (node.connection) {
      const connectedNode = nodes.find(
        (n) => n.id === node.connection?.connectedUserId
      );
      if (connectedNode) {
        allConnections.push({
          from: node,
          to: connectedNode,
          connection: node.connection,
        });
      }
    }
  });

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

        <button
          onClick={handleLogout}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
          title="Log out"
        >
          <LogOut className="w-5 h-5" />
        </button>
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

        {/* SVG for edges - highly visible */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {allConnections.map((conn, idx) => {
            const strength = conn.connection.strength / 100;
            // Dark, bold connections - maximum visibility
            const opacity = 1.0; // Full opacity
            // Very thick, bold lines
            const strokeWidth = 6 + (strength * 4); // 6 to 10 based on strength
            
            // Dark, bold color for maximum visibility
            const connectionColor = '#1e293b'; // Dark slate - very visible
            
            return (
              <g key={`${conn.from.id}-${conn.to.id}-${idx}`}>
                {/* Main connection line - dark and bold */}
                <line
                  x1={conn.from.x}
                  y1={conn.from.y}
                  x2={conn.to.x}
                  y2={conn.to.y}
                  stroke={connectionColor}
                  strokeWidth={strokeWidth}
                  opacity={opacity}
                  strokeLinecap="round"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => {
          const isUser = node.id === currentUser.id;
          const isHovered = hoveredNode === node.id;

          return (
            <motion.div
              key={node.id}
              className="absolute z-10 cursor-grab active:cursor-grabbing"
              style={{
                left: node.x - (isUser ? 30 : 25),
                top: node.y - (isUser ? 30 : 25),
              }}
              onMouseDown={(e) => handleMouseDown(e, node.id)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Node */}
              <div
                className={`relative rounded-full flex items-center justify-center font-semibold text-white shadow-lg transition-all ${
                  isUser
                    ? 'w-[60px] h-[60px] bg-slate-900 border-4 border-white'
                    : 'w-[50px] h-[50px] border-2 border-white'
                }`}
                style={{
                  backgroundColor: isUser ? '#1f2937' : node.groupColor,
                  boxShadow: isHovered
                    ? `0 0 24px ${node.groupColor}cc`
                    : `0 4px 16px ${node.groupColor}60`,
                }}
              >
                <span className={isUser ? 'text-lg' : 'text-sm'}>
                  {node.avatar}
                </span>
              </div>

              {/* Name label */}
              {(isHovered || isUser) && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-1/2 -translate-x-1/2 -bottom-8 px-2 py-1 rounded-lg bg-slate-900 text-white text-xs whitespace-nowrap pointer-events-none shadow-lg"
                >
                  {node.name}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </main>
    </div>
  );
}
