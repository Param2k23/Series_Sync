'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, User, LogOut, ThumbsUp, Clock } from 'lucide-react';
import {
  getCurrentUser,
  getConnectionsForUser,
  getGroups,
  logout,
  formTemporaryGroups,
  upvoteGroup,
  cleanupExpiredGroups,
  User as UserType,
  Connection,
  Group,
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
  const [groups, setGroups] = useState<Group[]>([]);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingUser, setDraggingUser] = useState(false);
  const [userPos, setUserPos] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number>();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [upvotedGroups, setUpvotedGroups] = useState<Set<string>>(new Set());

  // Fetch data from database
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/signup');
      return;
    }

    setCurrentUser(user);

    // Clean up expired groups
    cleanupExpiredGroups();

    // Form new temporary groups
    formTemporaryGroups();

    // Get connections for current user
    const userConnections = getConnectionsForUser(user.id);
    // Get groups after forming temporary ones
    const dbGroups = getGroups();
    setGroups(dbGroups);

    // Convert to node data
    const nodeData: NodeData[] = userConnections.map((conn, i) => {
      // Find which group this user belongs to (prefer permanent groups)
      const permanentGroup = dbGroups.find(
        (g) => !g.isTemporary && g.memberIds.includes(conn.user.id)
      );
      const tempGroup = dbGroups.find(
        (g) => g.isTemporary && g.memberIds.includes(conn.user.id)
      );
      const userGroup = permanentGroup || tempGroup;

      return {
        id: conn.user.id,
        name: conn.user.name,
        avatar: conn.user.name
          .split(' ')
          .map((n) => n[0])
          .join(''),
        x: 200 + Math.random() * 600,
        y: 150 + Math.random() * 400,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        group: userGroup?.name,
        groupColor: userGroup?.color || '#64748b',
        connection: conn.connection,
        isTemporaryGroup: userGroup?.isTemporary || false,
        groupId: userGroup?.id,
      };
    });

    setNodes(nodeData);

    // Initialize upvoted groups
    const userUpvoted = new Set(
      dbGroups
        .filter((g) => g.upvotedBy && g.upvotedBy.includes(user.id))
        .map((g) => g.id)
    );
    setUpvotedGroups(userUpvoted);

    setIsLoading(false);
  }, [router]);

  // Update dimensions
  useEffect(() => {
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

  // Floating animation
  useEffect(() => {
    const animate = () => {
      if (draggingId === null && !draggingUser) {
        setNodes((prev) =>
          prev.map((node) => {
            let { x, y, vx, vy } = node;

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
              ...node,
              x: Math.max(padding, Math.min(maxX, x + vx)),
              y: Math.max(padding, Math.min(maxY, y + vy)),
              vx,
              vy,
            };
          })
        );
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [dimensions, draggingId, draggingUser]);

  const handleMouseDown = useCallback((id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setDraggingId(id);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (draggingId !== null) {
        setNodes((prev) =>
          prev.map((node) =>
            node.id === draggingId ? { ...node, x, y, vx: 0, vy: 0 } : node
          )
        );
      }
      if (draggingUser) {
        setUserPos({ x, y });
      }
    },
    [draggingId, draggingUser]
  );

  const handleMouseUp = useCallback(() => {
    setDraggingId(null);
    setDraggingUser(false);
  }, []);

  const handleUserMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDraggingUser(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getNodeById = (id: string) => nodes.find((n) => n.id === id);

  // Generate group edges (connections between same group members)
  const groupEdges: Array<{
    from: string;
    to: string;
    groupColor: string;
    isTemporary: boolean;
    groupId: string;
  }> = [];
  groups.forEach((group) => {
    const membersInView = nodes.filter((n) => n.groupId === group.id);
    for (let i = 0; i < membersInView.length; i++) {
      for (let j = i + 1; j < membersInView.length; j++) {
        groupEdges.push({
          from: membersInView[i].id,
          to: membersInView[j].id,
          groupColor: group.color,
          isTemporary: group.isTemporary,
          groupId: group.id,
        });
      }
    }
  });

  const handleUpvote = (groupId: string) => {
    if (!currentUser) return;
    const updatedGroup = upvoteGroup(currentUser.id, groupId);
    if (updatedGroup) {
      // Refresh groups
      const dbGroups = getGroups();
      setGroups(dbGroups);

      // Update upvoted state
      if (updatedGroup.upvotedBy.includes(currentUser.id)) {
        setUpvotedGroups((prev) => new Set(prev).add(groupId));
      } else {
        setUpvotedGroups((prev) => {
          const newSet = new Set(prev);
          newSet.delete(groupId);
          return newSet;
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-slate-500">Loading your network...</div>
      </div>
    );
  }

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

        {/* SVG for edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            {/* Animation for temporary group edges */}
            <style>
              {`
                @keyframes pulse-dash {
                  0% { stroke-dashoffset: 0; }
                  100% { stroke-dashoffset: 20; }
                }
                .temp-edge {
                  animation: pulse-dash 2s linear infinite;
                }
              `}
            </style>
          </defs>

          {/* Group edges */}
          {groupEdges.map((edge, idx) => {
            const from = getNodeById(edge.from);
            const to = getNodeById(edge.to);
            if (!from || !to) return null;

            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const sag = Math.min(dist * 0.08, 25);

            const isHighlighted =
              hoveredNode === edge.from || hoveredNode === edge.to;

            return (
              <path
                key={`group-${idx}`}
                d={`M ${from.x} ${from.y} Q ${midX} ${midY + sag} ${to.x} ${
                  to.y
                }`}
                fill="none"
                stroke={edge.groupColor}
                strokeWidth={isHighlighted ? 3.5 : edge.isTemporary ? 2.5 : 3}
                strokeLinecap="round"
                strokeDasharray={edge.isTemporary ? '8 4' : 'none'}
                className={edge.isTemporary ? 'temp-edge' : ''}
                opacity={
                  isHighlighted
                    ? edge.isTemporary
                      ? 0.8
                      : 0.9
                    : edge.isTemporary
                    ? 0.5
                    : 0.7
                }
                style={{ transition: 'opacity 0.2s, stroke-width 0.2s' }}
              />
            );
          })}

          {/* User to node edges - much more visible */}
          {nodes.map((node) => {
            const dx = node.x - userPos.x;
            const dy = node.y - userPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const sag = Math.min(dist * 0.1, 35);
            const midX = (node.x + userPos.x) / 2;
            const midY = (node.y + userPos.y) / 2 + sag;

            const isHovered = hoveredNode === node.id;
            // Much thicker and more visible lines
            const baseWidth = node.connection
              ? Math.max(2.5, node.connection.strength / 30 + 2)
              : 2.5;

            return (
              <g key={`edge-${node.id}`}>
                <path
                  d={`M ${userPos.x} ${userPos.y} Q ${midX} ${midY} ${node.x} ${node.y}`}
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth={isHovered ? baseWidth + 1.5 : baseWidth}
                  strokeLinecap="round"
                  opacity={isHovered ? 0.7 : 0.4}
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
            className={`relative cursor-grab active:cursor-grabbing ${
              draggingUser ? 'cursor-grabbing' : ''
            }`}
            onMouseDown={handleUserMouseDown}
          >
            <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center shadow-xl shadow-slate-900/20 hover:scale-105 transition-transform ring-4 ring-white">
              <span className="text-white font-semibold text-sm">
                {currentUser?.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('') || 'You'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Connection nodes */}
        {nodes.map((node, index) => (
          <motion.div
            key={node.id}
            className="absolute z-10"
            style={{
              left: node.x - 20,
              top: node.y - 20,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.1 + index * 0.015,
              type: 'spring',
              stiffness: 300,
            }}
          >
            <div
              className={`relative cursor-grab active:cursor-grabbing group ${
                draggingId === node.id ? 'cursor-grabbing' : ''
              }`}
              onMouseDown={(e) => handleMouseDown(node.id, e)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <div className="relative">
                {/* Pulsing ring for temporary groups */}
                {node.isTemporaryGroup && (
                  <div
                    className="absolute inset-[-4px] rounded-full animate-ping opacity-30"
                    style={{ backgroundColor: node.groupColor }}
                  />
                )}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${
                    node.isTemporaryGroup
                      ? 'ring-2 ring-dashed'
                      : 'ring-2 ring-white'
                  } ${hoveredNode === node.id ? 'scale-125 shadow-xl' : ''}`}
                  style={{
                    backgroundColor: node.groupColor,
                    borderStyle: node.isTemporaryGroup ? 'dashed' : 'solid',
                    borderWidth: node.isTemporaryGroup ? '2px' : '0',
                    borderColor: node.isTemporaryGroup
                      ? node.groupColor
                      : 'transparent',
                  }}
                >
                  <span className="text-white font-medium text-xs">
                    {node.avatar}
                  </span>
                </div>
              </div>

              {/* Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-20 px-3 py-2 rounded-xl bg-slate-900 text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none shadow-xl min-w-[140px]">
                <p className="text-sm font-medium">{node.name}</p>
                {node.group && (
                  <p className="text-xs text-slate-400">{node.group}</p>
                )}
                {node.connection && (
                  <p className="text-xs text-slate-500 mt-1">
                    {node.connection.strength}% match ·{' '}
                    {node.connection.sharedAttributes.length} shared
                  </p>
                )}
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-slate-900 rotate-45" />
              </div>
            </div>
          </motion.div>
        ))}

        {/* Connection count */}
        <div className="absolute top-6 right-6 px-4 py-2.5 rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-slate-200/60">
          <p className="text-slate-600 text-sm font-medium">
            <span className="font-bold text-slate-900">{nodes.length}</span>{' '}
            connections
          </p>
        </div>

        {/* Groups legend */}
        {groups.length > 0 && (
          <div className="absolute bottom-6 right-6 px-4 py-3 rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-slate-200/60 max-w-xs">
            <p className="text-xs text-slate-500 mb-2 font-medium">Groups</p>
            <div className="flex flex-col gap-2">
              {groups.map((group) => {
                const memberCount = nodes.filter(
                  (n) => n.groupId === group.id
                ).length;
                if (memberCount === 0) return null;
                const isUpvoted = upvotedGroups.has(group.id);
                const upvoteThreshold = Math.ceil(group.memberIds.length * 0.7);
                const upvotes = group.upvotes || 0;
                const progress = (upvotes / upvoteThreshold) * 100;

                return (
                  <div
                    key={group.id}
                    className={`p-2 rounded-lg border transition-all ${
                      group.isTemporary
                        ? 'bg-amber-50/50 border-amber-200'
                        : 'bg-slate-50/50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="relative">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            group.isTemporary ? 'animate-pulse' : ''
                          }`}
                          style={{ backgroundColor: group.color }}
                        />
                        {group.isTemporary && (
                          <Clock className="absolute -top-1 -right-1 w-2.5 h-2.5 text-amber-600" />
                        )}
                      </div>
                      <span className="text-xs font-medium text-slate-700 flex-1">
                        {group.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({memberCount})
                      </span>
                    </div>

                    {group.isTemporary && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <button
                            onClick={() => handleUpvote(group.id)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-all ${
                              isUpvoted
                                ? 'bg-amber-200 text-amber-800'
                                : 'bg-slate-100 text-slate-600 hover:bg-amber-100'
                            }`}
                          >
                            <ThumbsUp
                              className={`w-3 h-3 ${
                                isUpvoted ? 'fill-current' : ''
                              }`}
                            />
                            <span>{upvotes}</span>
                          </button>
                          <span className="text-xs text-slate-500">
                            {Math.ceil(progress)}% to keep
                          </span>
                        </div>
                        <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 transition-all duration-300"
                            style={{ width: `${Math.min(100, progress)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* User info */}
        <div className="absolute top-6 left-6 px-4 py-2.5 rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-slate-200/60">
          <p className="text-slate-900 text-sm font-medium">
            {currentUser?.name}
          </p>
          <p className="text-slate-500 text-xs">@{currentUser?.username}</p>
        </div>
      </main>
    </div>
  );
}
