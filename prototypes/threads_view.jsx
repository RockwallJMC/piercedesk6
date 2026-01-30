import React, { useState, useMemo, useCallback } from 'react';

// PCB-Style Thread Intelligence Visualization
// With animated flowing traces for cascade depth visualization

const ProjectThreadsPCB = () => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredConnection, setHoveredConnection] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    technician: true,
    meeting: true,
    issue: true,
    milestone: true,
    dependency: true,
    change: true
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Project data
  const projectData = useMemo(() => ({
    project: {
      name: "Meridian Corporate Campus",
      client: "Meridian Holdings LLC", 
      projectNumber: "PRJ-2024-0847",
      startDate: "2024-03-15",
      status: "In Progress"
    },
    threads: [
      { id: 'th-milestone', name: 'Milestones', color: '#2ed573', icon: '◆', shortName: 'MLSTN' },
      { id: 'th-meeting', name: 'Meetings', color: '#a55eea', icon: '◉', shortName: 'MEET' },
      { id: 'th-tech', name: 'Technician', color: '#00d4ff', icon: '⚡', shortName: 'TECH' },
      { id: 'th-issue', name: 'Issues', color: '#ff4757', icon: '⚠', shortName: 'ISSUE' },
      { id: 'th-dependency', name: 'Dependencies', color: '#ffa502', icon: '⬡', shortName: 'DEPS' },
      { id: 'th-change', name: 'Change Orders', color: '#ff6b81', icon: '⟲', shortName: 'CO' }
    ],
    // Define root nodes (entry points)
    rootNodes: ['n1'],
    nodes: [
      // Week 1 - ROOT
      { id: 'n1', thread: 'th-milestone', date: '2024-03-15', time: '09:00',
        title: 'Project Kickoff', tech: null,
        content: 'Initial kickoff meeting with Meridian facilities team. Scope: 847 cameras, 124 access points, building-wide intercom.',
        connections: [{ to: 'n2', label: 'initiates' }, { to: 'n3', label: 'initiates' }], intensity: 0.9 },
      
      // PRIMARY (depth 1)
      { id: 'n2', thread: 'th-meeting', date: '2024-03-15', time: '14:00',
        title: 'Site Walk - Building A', tech: 'Marcus Chen',
        content: 'Walked Building A with facilities. Identified potential conduit issues in server room corridor.',
        connections: [{ to: 'n5', label: 'discovers' }], intensity: 0.6 },
      
      { id: 'n3', thread: 'th-tech', date: '2024-03-16', time: '08:30',
        title: 'Initial Survey - East Wing', tech: 'Sarah Martinez',
        content: 'Completed camera placement survey for east wing. 47 locations marked. Found 3 locations with insufficient power.',
        connections: [{ to: 'n6', label: 'raises' }], intensity: 0.5 },

      // Week 2
      { id: 'n4', thread: 'th-dependency', date: '2024-03-18', time: '10:15',
        title: 'GC Coordination Required', tech: null,
        content: 'General contractor needs to complete ceiling grid in zones 4-7 before camera mounting. Est. 2 week delay.',
        connections: [{ to: 'n7', label: 'schedules' }], intensity: 0.7 },
      
      // SECONDARY (depth 2)
      { id: 'n5', thread: 'th-issue', date: '2024-03-19', time: '11:00',
        title: 'Conduit Obstruction', tech: 'Marcus Chen',
        content: 'HVAC ductwork installed after design phase blocks planned conduit run. Need reroute design.',
        connections: [{ to: 'n8', label: 'triggers' }, { to: 'n13', label: 'cascades' }], intensity: 0.95 },
      
      { id: 'n6', thread: 'th-issue', date: '2024-03-19', time: '14:30',
        title: 'Power Access Gaps', tech: 'Sarah Martinez',
        content: '3 camera locations lack nearby power. Options: PoE+ switches, electrical add, or relocate.',
        connections: [{ to: 'n9', label: 'explores' }], intensity: 0.7 },

      // Week 3
      { id: 'n7', thread: 'th-meeting', date: '2024-03-22', time: '09:00',
        title: 'GC Coordination Call', tech: null,
        content: 'Ceiling grid now pushed to 4/8. Can start Building B immediately as workaround.',
        connections: [{ to: 'n10', label: 'enables' }], intensity: 0.6 },
      
      // TERTIARY (depth 3)
      { id: 'n8', thread: 'th-change', date: '2024-03-23', time: '16:00',
        title: 'CO-001: Conduit Reroute', tech: null,
        content: 'Change order submitted for server corridor reroute. $12,400 additional. 3 day impact.',
        connections: [{ to: 'n12', label: 'awaits' }], intensity: 0.85 },
      
      { id: 'n9', thread: 'th-tech', date: '2024-03-25', time: '08:00',
        title: 'PoE+ Switch Spec', tech: 'Sarah Martinez',
        content: 'Recommending Cisco Catalyst 9200 with 60W PoE++ for problem locations. Cost neutral.',
        connections: [{ to: 'n11', label: 'proposes' }], intensity: 0.5 },

      // Week 4
      { id: 'n10', thread: 'th-tech', date: '2024-03-28', time: '07:30',
        title: 'Building B Rough-In', tech: 'Marcus Chen',
        content: 'Started conduit rough-in Building B per revised schedule. Running ahead of plan.',
        connections: [{ to: 'n19', label: 'continues' }], intensity: 0.6 },
      
      { id: 'n11', thread: 'th-milestone', date: '2024-03-29', time: '15:00',
        title: 'East Wing Approved', tech: null,
        content: 'Client approved PoE++ solution for east wing cameras. PO issued.',
        connections: [{ to: 'n14', label: 'authorizes' }], intensity: 0.7 },
      
      { id: 'n12', thread: 'th-meeting', date: '2024-04-01', time: '10:00',
        title: 'CO Review - Client', tech: null,
        content: 'CO-001 approved verbally, formal PO expected 4/3. Authorized to proceed.',
        connections: [{ to: 'n13', label: 'approves' }], intensity: 0.6 },

      // Week 5 - Critical Issue (QUATERNARY depth 4)
      { id: 'n13', thread: 'th-tech', date: '2024-04-02', time: '09:00',
        title: 'Reroute Day 1', tech: 'Marcus Chen',
        content: 'Started reroute work. Discovered additional HVAC conflict not visible in plans.',
        connections: [{ to: 'n15', label: 'discovers' }], intensity: 0.7 },
      
      { id: 'n14', thread: 'th-tech', date: '2024-04-03', time: '08:00',
        title: 'Switch Install - East', tech: 'Sarah Martinez',
        content: 'Installed first Catalyst 9200 in east wing IDF. Tested PoE++ - all green.',
        connections: [], intensity: 0.5 },
      
      // DEPTH 5 - Critical cascade
      { id: 'n15', thread: 'th-issue', date: '2024-04-03', time: '14:45',
        title: 'CRITICAL: Fire Barrier', tech: 'Marcus Chen',
        content: 'STOP WORK: New reroute path requires fire barrier penetration not in scope. Fire marshal sign-off required.',
        connections: [{ to: 'n16', label: 'escalates' }, { to: 'n17', label: 'requires' }, { to: 'n18', label: 'triggers' }], intensity: 1.0 },

      // Week 6 - Crisis (DEPTH 6)
      { id: 'n16', thread: 'th-meeting', date: '2024-04-04', time: '08:00',
        title: 'Emergency Call', tech: null,
        content: 'All-hands call with GC, client, fire protection. GC claims HVAC change was client-directed.',
        connections: [{ to: 'n20', label: 'schedules' }], intensity: 0.9 },
      
      { id: 'n17', thread: 'th-dependency', date: '2024-04-04', time: '11:30',
        title: 'Fire Marshal Review', tech: null,
        content: 'Submitted penetration request to fire marshal. Standard: 5-7 days. Expedite available.',
        connections: [{ to: 'n21', label: 'awaits' }], intensity: 0.85 },
      
      { id: 'n18', thread: 'th-change', date: '2024-04-05', time: '09:00',
        title: 'CO-002: Fire Barrier', tech: null,
        content: 'Draft CO-002 for fire barrier work: $14,900 total. Responsibility TBD.',
        connections: [{ to: 'n20', label: 'negotiates' }], intensity: 0.8 },

      // Week 7 - Resolution (DEPTH 7)
      { id: 'n19', thread: 'th-tech', date: '2024-04-08', time: '10:00',
        title: 'Building B Complete', tech: 'Marcus Chen',
        content: 'Completed all Building B rough-in while awaiting Building A resolution. 156 pulls done.',
        connections: [], intensity: 0.6 },
      
      { id: 'n20', thread: 'th-meeting', date: '2024-04-09', time: '14:00',
        title: 'Executive Resolution', tech: null,
        content: 'VP-level meeting resolved: Client 60% ($8,940), GC 40% ($5,960). Expedite approved.',
        connections: [{ to: 'n21', label: 'funds' }], intensity: 0.85 },
      
      { id: 'n21', thread: 'th-milestone', date: '2024-04-12', time: '11:00',
        title: 'Fire Marshal Approved', tech: null,
        content: 'Expedited approval received. Can proceed with penetration work Monday 4/15.',
        connections: [{ to: 'n22', label: 'enables' }], intensity: 0.9 },

      // Week 8 - Recovery (DEPTH 8)
      { id: 'n22', thread: 'th-tech', date: '2024-04-15', time: '07:00',
        title: 'Fire Barrier Work', tech: 'Marcus Chen',
        content: 'Fire protection sub on-site. Penetration work in progress.',
        connections: [{ to: 'n23', label: 'completes' }], intensity: 0.7 },
      
      { id: 'n23', thread: 'th-tech', date: '2024-04-16', time: '16:30',
        title: 'Corridor COMPLETE', tech: 'Marcus Chen',
        content: 'Server corridor reroute 100% complete. All cables pulled. Fire barrier sealed.',
        connections: [{ to: 'n24', label: 'closes' }], intensity: 0.8 },
      
      { id: 'n24', thread: 'th-milestone', date: '2024-04-17', time: '09:00',
        title: 'Building A Resumed', tech: null,
        content: 'Building A work resumed. Running 8 days behind. Recovery plan targets 5 days.',
        connections: [], intensity: 0.75 }
    ]
  }), []);

  // Calculate connection depths using BFS from root nodes
  const nodeDepths = useMemo(() => {
    const depths = {};
    const queue = [];
    
    // Initialize root nodes at depth 0
    projectData.rootNodes.forEach(rootId => {
      depths[rootId] = 0;
      queue.push(rootId);
    });
    
    // BFS to calculate depths
    while (queue.length > 0) {
      const nodeId = queue.shift();
      const node = projectData.nodes.find(n => n.id === nodeId);
      if (!node) continue;
      
      (node.connections || []).forEach(conn => {
        if (depths[conn.to] === undefined) {
          depths[conn.to] = depths[nodeId] + 1;
          queue.push(conn.to);
        }
      });
    }
    
    // Assign default depth for disconnected nodes
    projectData.nodes.forEach(node => {
      if (depths[node.id] === undefined) {
        depths[node.id] = 0;
      }
    });
    
    return depths;
  }, [projectData]);

  // Calculate unique dates for x-axis
  const dateScale = useMemo(() => {
    const dates = [...new Set(projectData.nodes.map(n => n.date))].sort();
    return dates.map((date, idx) => ({
      date,
      x: 280 + (idx * 120),
      label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
  }, [projectData.nodes]);

  // Calculate thread positions for y-axis
  const threadScale = useMemo(() => {
    return projectData.threads.map((thread, idx) => ({
      ...thread,
      y: 100 + (idx * 80)
    }));
  }, [projectData.threads]);

  // Position nodes on the grid
  const positionedNodes = useMemo(() => {
    return projectData.nodes.map(node => {
      const dateInfo = dateScale.find(d => d.date === node.date);
      const threadInfo = threadScale.find(t => t.id === node.thread);
      return {
        ...node,
        x: dateInfo?.x || 0,
        y: threadInfo?.y || 0,
        threadColor: threadInfo?.color || '#fff',
        threadIcon: threadInfo?.icon || '•',
        depth: nodeDepths[node.id] || 0
      };
    });
  }, [projectData.nodes, dateScale, threadScale, nodeDepths]);

  // Filter nodes
  const filteredNodes = useMemo(() => {
    return positionedNodes.filter(node => {
      const threadType = node.thread.replace('th-', '');
      if (!activeFilters[threadType]) return false;
      if (searchQuery && !node.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !node.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [positionedNodes, activeFilters, searchQuery]);

  // PCB-style orthogonal routing algorithm
  const calculateRoute = useCallback((startNode, endNode, allConnections, connectionIndex) => {
    const bendRadius = 8;
    const startX = startNode.x + 12;
    const startY = startNode.y;
    const endX = endNode.x - 12;
    const endY = endNode.y;
    
    // Calculate channel offset to avoid overlapping parallel routes
    const channelOffset = (connectionIndex % 5) * 8 - 16;
    
    const points = [];
    points.push({ x: startX, y: startY });
    
    if (Math.abs(startY - endY) < 5) {
      // Same lane - direct horizontal
      points.push({ x: endX, y: endY });
    } else {
      // Different lanes - need orthogonal routing
      const midX = startX + (endX - startX) * 0.3 + channelOffset;
      
      // Go right from start
      points.push({ x: midX - bendRadius, y: startY });
      
      // Bend down/up
      if (endY > startY) {
        points.push({ x: midX, y: startY + bendRadius });
        points.push({ x: midX, y: endY - bendRadius });
        points.push({ x: midX + bendRadius, y: endY });
      } else {
        points.push({ x: midX, y: startY - bendRadius });
        points.push({ x: midX, y: endY + bendRadius });
        points.push({ x: midX + bendRadius, y: endY });
      }
      
      // Continue to end
      points.push({ x: endX, y: endY });
    }
    
    return points;
  }, []);

  // Generate SVG path with rounded corners
  const generatePath = useCallback((points, bendRadius = 8) => {
    if (points.length < 2) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      
      // Direction vectors
      const dx1 = curr.x - prev.x;
      const dy1 = curr.y - prev.y;
      const dx2 = next.x - curr.x;
      const dy2 = next.y - curr.y;
      
      // Check if there's a turn
      if ((dx1 !== 0 && dy2 !== 0) || (dy1 !== 0 && dx2 !== 0)) {
        // Calculate corner points
        const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
        const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        
        const r = Math.min(bendRadius, len1 / 2, len2 / 2);
        
        const cornerStart = {
          x: curr.x - (dx1 / len1) * r,
          y: curr.y - (dy1 / len1) * r
        };
        const cornerEnd = {
          x: curr.x + (dx2 / len2) * r,
          y: curr.y + (dy2 / len2) * r
        };
        
        path += ` L ${cornerStart.x} ${cornerStart.y}`;
        path += ` Q ${curr.x} ${curr.y} ${cornerEnd.x} ${cornerEnd.y}`;
      } else {
        path += ` L ${curr.x} ${curr.y}`;
      }
    }
    
    path += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`;
    return path;
  }, []);

  // Connection depth colors - cascading from primary to deep
  const getDepthStyle = useCallback((fromDepth) => {
    if (fromDepth <= 1) {
      // Primary connections - solid, source color
      return { 
        type: 'primary', 
        animated: false,
        dashArray: 'none',
        opacity: 1,
        strokeWidth: 3
      };
    } else if (fromDepth === 2) {
      // Secondary - animated cyan flow
      return { 
        type: 'secondary', 
        animated: true,
        flowColor: '#00ffff',
        dashArray: '8,6',
        opacity: 0.9,
        strokeWidth: 2.5,
        animationDuration: '1.5s'
      };
    } else if (fromDepth === 3) {
      // Tertiary - faster animated magenta flow
      return { 
        type: 'tertiary', 
        animated: true,
        flowColor: '#ff00ff',
        dashArray: '6,8',
        opacity: 0.85,
        strokeWidth: 2,
        animationDuration: '1.2s'
      };
    } else if (fromDepth === 4) {
      // Quaternary - electric yellow flow
      return { 
        type: 'quaternary', 
        animated: true,
        flowColor: '#ffff00',
        dashArray: '4,6',
        opacity: 0.8,
        strokeWidth: 2,
        animationDuration: '1s'
      };
    } else {
      // Deep cascade - rapid orange pulse
      return { 
        type: 'deep', 
        animated: true,
        flowColor: '#ff8800',
        dashArray: '3,5',
        opacity: 0.75,
        strokeWidth: 1.5,
        animationDuration: '0.8s'
      };
    }
  }, []);

  // Generate all connection paths with depth info
  const connectionPaths = useMemo(() => {
    const paths = [];
    let globalIndex = 0;
    
    filteredNodes.forEach(node => {
      (node.connections || []).forEach(conn => {
        const targetNode = filteredNodes.find(n => n.id === conn.to);
        if (!targetNode) return;
        
        const routePoints = calculateRoute(node, targetNode, paths, globalIndex);
        const pathD = generatePath(routePoints);
        const depthStyle = getDepthStyle(node.depth);
        
        paths.push({
          id: `${node.id}-${conn.to}`,
          from: node,
          to: targetNode,
          label: conn.label,
          path: pathD,
          color: node.threadColor,
          fromDepth: node.depth,
          toDepth: targetNode.depth,
          depthStyle
        });
        
        globalIndex++;
      });
    });
    
    return paths;
  }, [filteredNodes, calculateRoute, generatePath, getDepthStyle]);

  // Get highlighted connections
  const highlightedConnections = useMemo(() => {
    const activeNode = hoveredNode || selectedNode;
    if (!activeNode) return new Set();
    
    const connected = new Set();
    connectionPaths.forEach(conn => {
      if (conn.from.id === activeNode.id || conn.to.id === activeNode.id) {
        connected.add(conn.id);
      }
    });
    return connected;
  }, [hoveredNode, selectedNode, connectionPaths]);

  const toggleFilter = (filterKey) => {
    setActiveFilters(prev => ({ ...prev, [filterKey]: !prev[filterKey] }));
  };

  const canvasWidth = Math.max(1400, dateScale.length * 120 + 400);
  const canvasHeight = threadScale.length * 80 + 200;

  // Depth legend data
  const depthLegend = [
    { depth: 0, label: 'Root', color: '#ffffff', type: 'solid' },
    { depth: 1, label: 'Primary', color: '#ffffff', type: 'solid' },
    { depth: 2, label: 'Secondary', color: '#00ffff', type: 'flow' },
    { depth: 3, label: 'Tertiary', color: '#ff00ff', type: 'flow' },
    { depth: 4, label: 'Quaternary', color: '#ffff00', type: 'flow' },
    { depth: 5, label: 'Deep', color: '#ff8800', type: 'flow' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050709',
      color: '#c9d1d9',
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Grid background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        pointerEvents: 'none'
      }} />

      {/* Header */}
      <header style={{
        borderBottom: '1px solid rgba(0,212,255,0.15)',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(5,7,9,0.95)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #0a1628 0%, #0d1117 100%)',
              border: '2px solid #00d4ff',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              boxShadow: '0 0 20px rgba(0,212,255,0.3), inset 0 0 20px rgba(0,212,255,0.1)'
            }}>⬡</div>
            <div>
              <div style={{ 
                fontSize: '10px', 
                color: '#00d4ff', 
                letterSpacing: '2px',
                textTransform: 'uppercase'
              }}>CIRCUIT TRACE</div>
              <div style={{ 
                fontSize: '15px', 
                fontWeight: 600,
                color: '#e6edf3',
                letterSpacing: '0.5px'
              }}>{projectData.project.name}</div>
            </div>
          </div>
          
          <div style={{
            height: '32px',
            width: '1px',
            background: 'rgba(0,212,255,0.2)'
          }} />
          
          <div style={{
            padding: '6px 14px',
            background: 'rgba(0,212,255,0.08)',
            border: '1px solid rgba(0,212,255,0.3)',
            borderRadius: '2px',
            fontSize: '12px',
            color: '#00d4ff',
            fontFamily: 'monospace'
          }}>{projectData.project.projectNumber}</div>
        </div>

        {/* Depth Legend */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          padding: '6px 16px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '4px'
        }}>
          <span style={{ fontSize: '9px', color: '#6e7681', textTransform: 'uppercase', letterSpacing: '1px' }}>Cascade Depth:</span>
          {depthLegend.slice(1).map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '20px',
                height: '3px',
                background: item.type === 'flow' 
                  ? `linear-gradient(90deg, ${item.color}, transparent, ${item.color})`
                  : item.color,
                borderRadius: '2px',
                opacity: item.type === 'flow' ? 0.8 : 0.5
              }} />
              <span style={{ fontSize: '9px', color: item.color }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Thread filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {projectData.threads.map(thread => {
            const threadType = thread.id.replace('th-', '');
            const isActive = activeFilters[threadType];
            return (
              <button
                key={thread.id}
                onClick={() => toggleFilter(threadType)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  background: isActive ? `${thread.color}15` : 'transparent',
                  border: `1px solid ${isActive ? thread.color : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '2px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isActive ? 1 : 0.4
                }}
              >
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: thread.color,
                  boxShadow: isActive ? `0 0 8px ${thread.color}` : 'none'
                }} />
                <span style={{ 
                  fontSize: '10px', 
                  color: isActive ? thread.color : '#6e7681',
                  letterSpacing: '0.5px'
                }}>{thread.shortName}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(0,212,255,0.05)',
          border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: '2px',
          padding: '8px 14px',
          width: '200px'
        }}>
          <span style={{ color: '#00d4ff', fontSize: '12px' }}>⌕</span>
          <input
            type="text"
            placeholder="Search traces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#c9d1d9',
              fontSize: '12px',
              width: '100%',
              fontFamily: 'inherit'
            }}
          />
        </div>
      </header>

      <div style={{ display: 'flex', height: 'calc(100vh - 69px)' }}>
        {/* Main visualization area */}
        <main style={{ 
          flex: 1, 
          overflow: 'auto',
          position: 'relative'
        }}>
          <svg
            width={canvasWidth}
            height={canvasHeight}
            style={{ display: 'block' }}
          >
            <defs>
              {/* Glow filters */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              
              <filter id="strongGlow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>

              <filter id="flowGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>

              {/* Arrow markers for each thread */}
              {projectData.threads.map(thread => (
                <marker
                  key={`arrow-${thread.id}`}
                  id={`arrow-${thread.id}`}
                  markerWidth="8"
                  markerHeight="6"
                  refX="7"
                  refY="3"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 8 3, 0 6"
                    fill={thread.color}
                  />
                </marker>
              ))}

              {/* Flow arrow markers */}
              <marker id="arrow-flow-cyan" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#00ffff" />
              </marker>
              <marker id="arrow-flow-magenta" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#ff00ff" />
              </marker>
              <marker id="arrow-flow-yellow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#ffff00" />
              </marker>
              <marker id="arrow-flow-orange" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#ff8800" />
              </marker>
            </defs>

            {/* Y-axis: Thread lane labels */}
            <g>
              {threadScale.map(thread => {
                const threadType = thread.id.replace('th-', '');
                if (!activeFilters[threadType]) return null;
                
                return (
                  <g key={thread.id}>
                    {/* Lane background */}
                    <rect
                      x={0}
                      y={thread.y - 30}
                      width={canvasWidth}
                      height={60}
                      fill={`${thread.color}03`}
                    />
                    
                    {/* Lane border lines */}
                    <line
                      x1={260}
                      y1={thread.y}
                      x2={canvasWidth - 20}
                      y2={thread.y}
                      stroke={`${thread.color}15`}
                      strokeWidth="1"
                      strokeDasharray="4,8"
                    />
                    
                    {/* Lane label */}
                    <g transform={`translate(20, ${thread.y})`}>
                      <rect
                        x={0}
                        y={-14}
                        width={220}
                        height={28}
                        fill={`${thread.color}08`}
                        stroke={`${thread.color}30`}
                        strokeWidth="1"
                        rx="2"
                      />
                      <circle
                        cx={20}
                        cy={0}
                        r={10}
                        fill={`${thread.color}20`}
                        stroke={thread.color}
                        strokeWidth="2"
                      />
                      <text
                        x={20}
                        y={4}
                        textAnchor="middle"
                        fill={thread.color}
                        fontSize="10"
                      >{thread.icon}</text>
                      <text
                        x={42}
                        y={4}
                        fill={thread.color}
                        fontSize="11"
                        fontFamily="JetBrains Mono"
                        letterSpacing="0.5"
                      >{thread.name}</text>
                      <text
                        x={200}
                        y={4}
                        textAnchor="end"
                        fill={`${thread.color}60`}
                        fontSize="10"
                        fontFamily="JetBrains Mono"
                      >{filteredNodes.filter(n => n.thread === thread.id).length}</text>
                    </g>
                  </g>
                );
              })}
            </g>

            {/* X-axis: Date markers */}
            <g>
              {dateScale.map((dateInfo, idx) => (
                <g key={dateInfo.date}>
                  {/* Vertical date line */}
                  <line
                    x1={dateInfo.x}
                    y1={50}
                    x2={dateInfo.x}
                    y2={canvasHeight - 50}
                    stroke="rgba(0,212,255,0.08)"
                    strokeWidth="1"
                  />
                  
                  {/* Date label */}
                  <g transform={`translate(${dateInfo.x}, 35)`}>
                    <text
                      textAnchor="middle"
                      fill="#6e7681"
                      fontSize="10"
                      fontFamily="JetBrains Mono"
                    >{dateInfo.label}</text>
                    
                    {/* Week marker */}
                    {idx % 5 === 0 && (
                      <text
                        y={-12}
                        textAnchor="middle"
                        fill="#00d4ff"
                        fontSize="9"
                        fontFamily="JetBrains Mono"
                        opacity="0.6"
                      >W{Math.floor(idx / 5) + 1}</text>
                    )}
                  </g>
                </g>
              ))}
            </g>

            {/* Connection traces - PRIMARY (solid) */}
            <g>
              {connectionPaths.filter(c => !c.depthStyle.animated).map(conn => {
                const isHighlighted = highlightedConnections.has(conn.id);
                const isHoveredConn = hoveredConnection === conn.id;
                
                return (
                  <g key={conn.id}>
                    {/* Trace glow */}
                    {(isHighlighted || isHoveredConn) && (
                      <path
                        d={conn.path}
                        fill="none"
                        stroke={conn.color}
                        strokeWidth="8"
                        opacity="0.3"
                        filter="url(#strongGlow)"
                      />
                    )}
                    
                    {/* Main trace */}
                    <path
                      d={conn.path}
                      fill="none"
                      stroke={isHighlighted || isHoveredConn ? conn.color : `${conn.color}60`}
                      strokeWidth={conn.depthStyle.strokeWidth}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      markerEnd={`url(#arrow-${conn.from.thread})`}
                      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                      onMouseEnter={() => setHoveredConnection(conn.id)}
                      onMouseLeave={() => setHoveredConnection(null)}
                    />
                    
                    {/* Connection label on hover */}
                    {isHoveredConn && (
                      <g>
                        <rect
                          x={(conn.from.x + conn.to.x) / 2 - 35}
                          y={(conn.from.y + conn.to.y) / 2 - 12}
                          width={70}
                          height={24}
                          fill="#0a0e14"
                          stroke={conn.color}
                          strokeWidth="1"
                          rx="2"
                        />
                        <text
                          x={(conn.from.x + conn.to.x) / 2}
                          y={(conn.from.y + conn.to.y) / 2 + 4}
                          textAnchor="middle"
                          fill={conn.color}
                          fontSize="10"
                          fontFamily="JetBrains Mono"
                        >{conn.label}</text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>

            {/* Connection traces - ANIMATED FLOW (secondary+) */}
            <g>
              {connectionPaths.filter(c => c.depthStyle.animated).map(conn => {
                const isHighlighted = highlightedConnections.has(conn.id);
                const isHoveredConn = hoveredConnection === conn.id;
                const style = conn.depthStyle;
                
                // Get flow color based on depth
                const flowColor = style.flowColor;
                const arrowId = style.flowColor === '#00ffff' ? 'arrow-flow-cyan' 
                  : style.flowColor === '#ff00ff' ? 'arrow-flow-magenta'
                  : style.flowColor === '#ffff00' ? 'arrow-flow-yellow'
                  : 'arrow-flow-orange';
                
                return (
                  <g key={conn.id}>
                    {/* Background trace (dim source color) */}
                    <path
                      d={conn.path}
                      fill="none"
                      stroke={`${conn.color}30`}
                      strokeWidth={style.strokeWidth + 1}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    
                    {/* Glow layer for highlighted */}
                    {(isHighlighted || isHoveredConn) && (
                      <path
                        d={conn.path}
                        fill="none"
                        stroke={flowColor}
                        strokeWidth="6"
                        opacity="0.4"
                        filter="url(#flowGlow)"
                      />
                    )}
                    
                    {/* Animated flow trace */}
                    <path
                      d={conn.path}
                      fill="none"
                      stroke={flowColor}
                      strokeWidth={style.strokeWidth}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray={style.dashArray}
                      markerEnd={`url(#${arrowId})`}
                      opacity={isHighlighted || isHoveredConn ? 1 : style.opacity}
                      filter={isHighlighted || isHoveredConn ? 'url(#flowGlow)' : 'none'}
                      style={{ 
                        cursor: 'pointer',
                        animation: `flowAnimation ${style.animationDuration} linear infinite`
                      }}
                      onMouseEnter={() => setHoveredConnection(conn.id)}
                      onMouseLeave={() => setHoveredConnection(null)}
                    />
                    
                    {/* Secondary glow particles (for extra effect) */}
                    <path
                      d={conn.path}
                      fill="none"
                      stroke={flowColor}
                      strokeWidth={1}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="2,20"
                      opacity={0.6}
                      style={{ 
                        animation: `flowAnimationFast ${parseFloat(style.animationDuration) * 0.7}s linear infinite`
                      }}
                    />
                    
                    {/* Connection label on hover */}
                    {isHoveredConn && (
                      <g>
                        <rect
                          x={(conn.from.x + conn.to.x) / 2 - 35}
                          y={(conn.from.y + conn.to.y) / 2 - 12}
                          width={70}
                          height={24}
                          fill="#0a0e14"
                          stroke={flowColor}
                          strokeWidth="1"
                          rx="2"
                        />
                        <text
                          x={(conn.from.x + conn.to.x) / 2}
                          y={(conn.from.y + conn.to.y) / 2 + 4}
                          textAnchor="middle"
                          fill={flowColor}
                          fontSize="10"
                          fontFamily="JetBrains Mono"
                        >{conn.label}</text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>

            {/* Event nodes */}
            <g>
              {filteredNodes.map(node => {
                const isSelected = selectedNode?.id === node.id;
                const isHovered = hoveredNode?.id === node.id;
                const isConnected = highlightedConnections.size > 0 && 
                  connectionPaths.some(c => 
                    highlightedConnections.has(c.id) && 
                    (c.from.id === node.id || c.to.id === node.id)
                  );
                const isActive = isSelected || isHovered;
                
                // Depth indicator color
                const depthColor = node.depth <= 1 ? '#ffffff' 
                  : node.depth === 2 ? '#00ffff'
                  : node.depth === 3 ? '#ff00ff'
                  : node.depth === 4 ? '#ffff00'
                  : '#ff8800';
                
                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedNode(isSelected ? null : node)}
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    {/* Node glow */}
                    {(isActive || isConnected) && (
                      <circle
                        r={isActive ? 22 : 18}
                        fill={node.threadColor}
                        opacity={isActive ? 0.3 : 0.15}
                        filter="url(#glow)"
                      />
                    )}
                    
                    {/* Depth ring (outer) */}
                    <circle
                      r={16}
                      fill="none"
                      stroke={depthColor}
                      strokeWidth={node.depth > 1 ? 2 : 1}
                      opacity={node.depth > 1 ? 0.6 : 0.3}
                      strokeDasharray={node.depth > 1 ? '3,3' : 'none'}
                    />
                    
                    {/* Outer ring */}
                    <circle
                      r={12}
                      fill="none"
                      stroke={node.threadColor}
                      strokeWidth={isActive ? 3 : 2}
                      opacity={isActive || isConnected ? 1 : 0.6}
                    />
                    
                    {/* Inner fill */}
                    <circle
                      r={9}
                      fill={isActive ? node.threadColor : `${node.threadColor}30`}
                      stroke={node.threadColor}
                      strokeWidth="1"
                    />
                    
                    {/* Icon */}
                    <text
                      textAnchor="middle"
                      y={3}
                      fill={isActive ? '#0a0e14' : node.threadColor}
                      fontSize="9"
                    >{node.threadIcon}</text>
                    
                    {/* Intensity indicator */}
                    <rect
                      x={-14}
                      y={20}
                      width={28}
                      height={3}
                      fill="rgba(255,255,255,0.1)"
                      rx="1.5"
                    />
                    <rect
                      x={-14}
                      y={20}
                      width={28 * node.intensity}
                      height={3}
                      fill={node.intensity > 0.8 ? '#ff4757' : node.intensity > 0.5 ? '#ffa502' : '#2ed573'}
                      rx="1.5"
                    />
                    
                    {/* Node ID + Depth label */}
                    <text
                      y={-22}
                      textAnchor="middle"
                      fill={isActive ? node.threadColor : '#6e7681'}
                      fontSize="8"
                      fontFamily="JetBrains Mono"
                      opacity={isActive ? 1 : 0.7}
                    >{node.id.toUpperCase()}</text>
                    
                    {/* Depth badge */}
                    {node.depth > 1 && (
                      <g transform="translate(14, -10)">
                        <circle r={6} fill="#0a0e14" stroke={depthColor} strokeWidth="1" />
                        <text
                          textAnchor="middle"
                          y={3}
                          fill={depthColor}
                          fontSize="7"
                          fontFamily="JetBrains Mono"
                        >{node.depth}</text>
                      </g>
                    )}
                    
                    {/* Title on hover */}
                    {isActive && (
                      <g transform="translate(0, 38)">
                        <rect
                          x={-85}
                          y={-10}
                          width={170}
                          height={28}
                          fill="rgba(10,14,20,0.95)"
                          stroke={node.threadColor}
                          strokeWidth="1"
                          rx="2"
                        />
                        <text
                          textAnchor="middle"
                          y={6}
                          fill="#e6edf3"
                          fontSize="10"
                          fontFamily="JetBrains Mono"
                        >{node.title.length > 24 ? node.title.slice(0, 24) + '...' : node.title}</text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </main>

        {/* Detail panel */}
        <aside style={{
          width: selectedNode ? '360px' : '0',
          borderLeft: selectedNode ? '1px solid rgba(0,212,255,0.15)' : 'none',
          background: 'rgba(5,7,9,0.95)',
          overflow: 'hidden',
          transition: 'width 0.3s ease'
        }}>
          {selectedNode && (
            <div style={{ padding: '24px', height: '100%', overflowY: 'auto' }}>
              {/* Close */}
              <button
                onClick={() => setSelectedNode(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#6e7681',
                  fontSize: '16px',
                  cursor: 'pointer',
                  padding: '4px 10px',
                  borderRadius: '2px'
                }}
              >×</button>

              {/* Depth indicator */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px'
              }}>
                <div style={{
                  padding: '4px 10px',
                  background: selectedNode.depth <= 1 ? 'rgba(255,255,255,0.05)' 
                    : selectedNode.depth === 2 ? 'rgba(0,255,255,0.1)'
                    : selectedNode.depth === 3 ? 'rgba(255,0,255,0.1)'
                    : selectedNode.depth === 4 ? 'rgba(255,255,0,0.1)'
                    : 'rgba(255,136,0,0.1)',
                  border: `1px solid ${selectedNode.depth <= 1 ? 'rgba(255,255,255,0.2)' 
                    : selectedNode.depth === 2 ? '#00ffff'
                    : selectedNode.depth === 3 ? '#ff00ff'
                    : selectedNode.depth === 4 ? '#ffff00'
                    : '#ff8800'}40`,
                  borderRadius: '2px',
                  fontSize: '9px',
                  color: selectedNode.depth <= 1 ? '#ffffff' 
                    : selectedNode.depth === 2 ? '#00ffff'
                    : selectedNode.depth === 3 ? '#ff00ff'
                    : selectedNode.depth === 4 ? '#ffff00'
                    : '#ff8800',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Depth {selectedNode.depth} • {selectedNode.depth === 0 ? 'Root' : selectedNode.depth === 1 ? 'Primary' : selectedNode.depth === 2 ? 'Secondary' : selectedNode.depth === 3 ? 'Tertiary' : selectedNode.depth === 4 ? 'Quaternary' : 'Deep Cascade'}
                </div>
              </div>

              {/* Thread badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                background: `${selectedNode.threadColor}10`,
                border: `1px solid ${selectedNode.threadColor}40`,
                borderRadius: '2px',
                marginBottom: '16px'
              }}>
                <span style={{ fontSize: '14px' }}>{selectedNode.threadIcon}</span>
                <span style={{ 
                  fontSize: '10px', 
                  color: selectedNode.threadColor,
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  {projectData.threads.find(t => t.id === selectedNode.thread)?.name}
                </span>
              </div>

              {/* Node ID */}
              <div style={{
                fontSize: '10px',
                color: '#6e7681',
                fontFamily: 'monospace',
                marginBottom: '8px'
              }}>NODE: {selectedNode.id.toUpperCase()}</div>

              {/* Title */}
              <h2 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#e6edf3',
                marginBottom: '12px',
                lineHeight: '1.4'
              }}>{selectedNode.title}</h2>

              {/* Meta */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                marginBottom: '20px',
                padding: '12px',
                background: 'rgba(0,212,255,0.03)',
                border: '1px solid rgba(0,212,255,0.1)',
                borderRadius: '4px'
              }}>
                <div>
                  <div style={{ fontSize: '9px', color: '#6e7681', marginBottom: '2px' }}>DATE</div>
                  <div style={{ fontSize: '12px', color: '#c9d1d9' }}>
                    {new Date(selectedNode.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '9px', color: '#6e7681', marginBottom: '2px' }}>TIME</div>
                  <div style={{ fontSize: '12px', color: '#c9d1d9' }}>{selectedNode.time}</div>
                </div>
                {selectedNode.tech && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '9px', color: '#6e7681', marginBottom: '2px' }}>TECHNICIAN</div>
                    <div style={{ fontSize: '12px', color: '#00d4ff' }}>{selectedNode.tech}</div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '4px',
                padding: '14px',
                fontSize: '12px',
                lineHeight: '1.7',
                color: '#c9d1d9',
                marginBottom: '20px'
              }}>
                {selectedNode.content}
              </div>

              {/* Intensity */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ 
                  fontSize: '9px', 
                  color: '#6e7681', 
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>Signal Intensity</div>
                <div style={{
                  height: '6px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${selectedNode.intensity * 100}%`,
                    height: '100%',
                    background: selectedNode.intensity > 0.8 
                      ? 'linear-gradient(90deg, #ff4757, #ff6b81)'
                      : selectedNode.intensity > 0.5
                        ? 'linear-gradient(90deg, #ffa502, #ffb733)'
                        : 'linear-gradient(90deg, #2ed573, #7bed9f)',
                    borderRadius: '3px'
                  }} />
                </div>
                <div style={{ 
                  fontSize: '10px', 
                  color: selectedNode.intensity > 0.8 ? '#ff4757' : selectedNode.intensity > 0.5 ? '#ffa502' : '#2ed573',
                  marginTop: '4px'
                }}>
                  {Math.round(selectedNode.intensity * 100)}% • {selectedNode.intensity > 0.8 ? 'CRITICAL' : selectedNode.intensity > 0.5 ? 'ELEVATED' : 'NOMINAL'}
                </div>
              </div>

              {/* Outgoing connections */}
              {selectedNode.connections?.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ 
                    fontSize: '9px', 
                    color: '#6e7681', 
                    marginBottom: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>Outgoing Traces ({selectedNode.connections.length})</div>
                  
                  {selectedNode.connections.map(conn => {
                    const target = positionedNodes.find(n => n.id === conn.to);
                    if (!target) return null;
                    
                    const flowColor = selectedNode.depth <= 1 ? target.threadColor 
                      : selectedNode.depth === 2 ? '#00ffff'
                      : selectedNode.depth === 3 ? '#ff00ff'
                      : selectedNode.depth === 4 ? '#ffff00'
                      : '#ff8800';
                    
                    return (
                      <button
                        key={conn.to}
                        onClick={() => setSelectedNode(target)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          width: '100%',
                          padding: '10px 12px',
                          marginBottom: '6px',
                          background: `${flowColor}08`,
                          border: `1px solid ${flowColor}30`,
                          borderRadius: '2px',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: `${target.threadColor}20`,
                          border: `2px solid ${target.threadColor}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px'
                        }}>
                          {target.threadIcon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '11px', color: '#e6edf3' }}>{target.title}</div>
                          <div style={{ fontSize: '9px', color: flowColor }}>{conn.label} →</div>
                        </div>
                        <div style={{ 
                          fontSize: '9px', 
                          color: '#6e7681',
                          fontFamily: 'monospace'
                        }}>{target.id.toUpperCase()}</div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Incoming connections */}
              {(() => {
                const incoming = positionedNodes.filter(n => 
                  n.connections?.some(c => c.to === selectedNode.id)
                );
                if (incoming.length === 0) return null;
                
                return (
                  <div>
                    <div style={{ 
                      fontSize: '9px', 
                      color: '#6e7681', 
                      marginBottom: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>Incoming Traces ({incoming.length})</div>
                    
                    {incoming.map(source => {
                      const conn = source.connections?.find(c => c.to === selectedNode.id);
                      const flowColor = source.depth <= 1 ? source.threadColor 
                        : source.depth === 2 ? '#00ffff'
                        : source.depth === 3 ? '#ff00ff'
                        : source.depth === 4 ? '#ffff00'
                        : '#ff8800';
                      
                      return (
                        <button
                          key={source.id}
                          onClick={() => setSelectedNode(source)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            width: '100%',
                            padding: '10px 12px',
                            marginBottom: '6px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '2px',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <div style={{ 
                            fontSize: '9px', 
                            color: '#6e7681',
                            fontFamily: 'monospace'
                          }}>{source.id.toUpperCase()}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '11px', color: '#e6edf3' }}>{source.title}</div>
                            <div style={{ fontSize: '9px', color: flowColor }}>← {conn?.label}</div>
                          </div>
                          <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: `${source.threadColor}20`,
                            border: `2px solid ${source.threadColor}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px'
                          }}>
                            {source.threadIcon}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
        </aside>
      </div>

      {/* Status bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '28px',
        background: 'rgba(5,7,9,0.98)',
        borderTop: '1px solid rgba(0,212,255,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        fontSize: '10px',
        color: '#6e7681',
        fontFamily: 'JetBrains Mono',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span>NODES: <span style={{ color: '#00d4ff' }}>{filteredNodes.length}</span></span>
          <span>PRIMARY: <span style={{ color: '#ffffff' }}>{connectionPaths.filter(c => !c.depthStyle.animated).length}</span></span>
          <span>CASCADES: <span style={{ color: '#ff00ff' }}>{connectionPaths.filter(c => c.depthStyle.animated).length}</span></span>
          <span>CRITICAL: <span style={{ color: '#ff4757' }}>{filteredNodes.filter(n => n.intensity > 0.8).length}</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>MAX DEPTH: <span style={{ color: '#ff8800' }}>{Math.max(...filteredNodes.map(n => n.depth))}</span></span>
          <span>TIMELINE: Mar 15 → Apr 17, 2024</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#2ed573',
              boxShadow: '0 0 8px #2ed573',
              animation: 'pulse 2s infinite'
            }} />
            <span style={{ color: '#2ed573' }}>LIVE</span>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        @keyframes flowAnimation {
          0% { stroke-dashoffset: 28; }
          100% { stroke-dashoffset: 0; }
        }
        
        @keyframes flowAnimationFast {
          0% { stroke-dashoffset: 44; }
          100% { stroke-dashoffset: 0; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: rgba(0,212,255,0.03); }
        ::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.2); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,212,255,0.3); }
        
        button:hover {
          background: rgba(0,212,255,0.08) !important;
          border-color: rgba(0,212,255,0.3) !important;
        }
      `}</style>
    </div>
  );
};

export default ProjectThreadsPCB;
