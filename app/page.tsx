'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, RotateCcw, Settings, Zap, Target, Shield } from 'lucide-react'

// Grid dimensions
const GRID_WIDTH = 40
const GRID_HEIGHT = 30
const CELL_SIZE = 15

// Cell types
const CELL_TYPES = {
  EMPTY: 0,
  OBSTACLE: 1,
  START: 2,
  TARGET: 3,
  PATH: 4,
  AGENT: 5,
  SENSOR_RANGE: 6
}

// A* pathfinding algorithm
class PathFinder {
  constructor(grid) {
    this.grid = grid
    this.width = grid[0].length
    this.height = grid.length
  }

  heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
  }

  getNeighbors(node) {
    const neighbors = []
    const directions = [
      { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 },
      { x: 1, y: -1 }, { x: 1, y: 1 }, { x: -1, y: 1 }, { x: -1, y: -1 }
    ]

    for (const dir of directions) {
      const x = node.x + dir.x
      const y = node.y + dir.y

      if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        if (this.grid[y][x] !== CELL_TYPES.OBSTACLE) {
          neighbors.push({ x, y })
        }
      }
    }

    return neighbors
  }

  findPath(start, target) {
    const openSet = [{ ...start, g: 0, h: this.heuristic(start, target), f: this.heuristic(start, target), parent: null }]
    const closedSet = new Set()

    while (openSet.length > 0) {
      openSet.sort((a, b) => a.f - b.f)
      const current = openSet.shift()

      if (current.x === target.x && current.y === target.y) {
        const path = []
        let node = current
        while (node) {
          path.unshift({ x: node.x, y: node.y })
          node = node.parent
        }
        return path
      }

      closedSet.add(`${current.x},${current.y}`)

      for (const neighbor of this.getNeighbors(current)) {
        const key = `${neighbor.x},${neighbor.y}`
        if (closedSet.has(key)) continue

        const g = current.g + 1
        const h = this.heuristic(neighbor, target)
        const f = g + h

        const existingNode = openSet.find(node => node.x === neighbor.x && node.y === neighbor.y)
        if (!existingNode) {
          openSet.push({ ...neighbor, g, h, f, parent: current })
        } else if (g < existingNode.g) {
          existingNode.g = g
          existingNode.f = f
          existingNode.parent = current
        }
      }
    }

    return []
  }
}

export default function AIObstacleAvoidance() {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  
  const [grid, setGrid] = useState(() => {
    const newGrid = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(CELL_TYPES.EMPTY))
    
    // Add some initial obstacles
    const obstacles = [
      { x: 10, y: 5, width: 3, height: 8 },
      { x: 20, y: 10, width: 5, height: 3 },
      { x: 30, y: 15, width: 2, height: 6 },
      { x: 15, y: 20, width: 8, height: 2 },
      { x: 5, y: 25, width: 4, height: 3 }
    ]
    
    obstacles.forEach(obs => {
      for (let y = obs.y; y < obs.y + obs.height && y < GRID_HEIGHT; y++) {
        for (let x = obs.x; x < obs.x + obs.width && x < GRID_WIDTH; x++) {
          newGrid[y][x] = CELL_TYPES.OBSTACLE
        }
      }
    })
    
    return newGrid
  })
  
  const [agent, setAgent] = useState({ x: 2, y: 2 })
  const [target, setTarget] = useState({ x: 35, y: 25 })
  const [path, setPath] = useState([])
  const [currentPathIndex, setCurrentPathIndex] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [sensorRange, setSensorRange] = useState([3])
  const [speed, setSpeed] = useState([500])
  const [detectedObstacles, setDetectedObstacles] = useState([])
  const [stats, setStats] = useState({
    pathLength: 0,
    obstaclesDetected: 0,
    timeElapsed: 0,
    efficiency: 100
  })

  // Simulate obstacle detection using sensors
  const detectObstacles = useCallback((agentPos, range) => {
    const detected = []
    const rangeValue = range[0]
    
    for (let y = Math.max(0, agentPos.y - rangeValue); y <= Math.min(GRID_HEIGHT - 1, agentPos.y + rangeValue); y++) {
      for (let x = Math.max(0, agentPos.x - rangeValue); x <= Math.min(GRID_WIDTH - 1, agentPos.x + rangeValue); x++) {
        const distance = Math.sqrt((x - agentPos.x) ** 2 + (y - agentPos.y) ** 2)
        if (distance <= rangeValue && grid[y][x] === CELL_TYPES.OBSTACLE) {
          detected.push({ x, y, distance })
        }
      }
    }
    
    return detected
  }, [grid])

  // Calculate path using A* algorithm
  const calculatePath = useCallback(() => {
    const pathFinder = new PathFinder(grid)
    const newPath = pathFinder.findPath(agent, target)
    setPath(newPath)
    setCurrentPathIndex(0)
    
    setStats(prev => ({
      ...prev,
      pathLength: newPath.length,
      efficiency: newPath.length > 0 ? Math.round((Math.abs(target.x - agent.x) + Math.abs(target.y - agent.y)) / newPath.length * 100) : 0
    }))
  }, [agent, target, grid])

  // Move agent along the path
  useEffect(() => {
    if (isRunning && path.length > 0 && currentPathIndex < path.length) {
      const timer = setTimeout(() => {
        const nextPos = path[currentPathIndex]
        setAgent(nextPos)
        
        // Detect obstacles at new position
        const obstacles = detectObstacles(nextPos, sensorRange)
        setDetectedObstacles(obstacles)
        
        setStats(prev => ({
          ...prev,
          obstaclesDetected: obstacles.length,
          timeElapsed: prev.timeElapsed + speed[0] / 1000
        }))
        
        setCurrentPathIndex(prev => prev + 1)
      }, speed[0])

      return () => clearTimeout(timer)
    } else if (currentPathIndex >= path.length) {
      setIsRunning(false)
    }
  }, [isRunning, path, currentPathIndex, speed, detectObstacles, sensorRange])

  // Recalculate path when agent, target, or grid changes
  useEffect(() => {
    calculatePath()
  }, [calculatePath])

  // Draw the grid and visualization
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const cellType = grid[y][x]
        
        ctx.fillStyle = '#f8f9fa'
        if (cellType === CELL_TYPES.OBSTACLE) ctx.fillStyle = '#dc3545'
        
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
        
        // Draw grid lines
        ctx.strokeStyle = '#e9ecef'
        ctx.lineWidth = 0.5
        ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
      }
    }

    // Draw sensor range
    if (sensorRange[0] > 0) {
      ctx.fillStyle = 'rgba(0, 123, 255, 0.1)'
      ctx.beginPath()
      ctx.arc(
        (agent.x + 0.5) * CELL_SIZE,
        (agent.y + 0.5) * CELL_SIZE,
        sensorRange[0] * CELL_SIZE,
        0,
        2 * Math.PI
      )
      ctx.fill()
    }

    // Draw path
    if (path.length > 0) {
      ctx.strokeStyle = '#28a745'
      ctx.lineWidth = 3
      ctx.beginPath()
      
      for (let i = 0; i < path.length - 1; i++) {
        const current = path[i]
        const next = path[i + 1]
        
        if (i === 0) {
          ctx.moveTo((current.x + 0.5) * CELL_SIZE, (current.y + 0.5) * CELL_SIZE)
        }
        ctx.lineTo((next.x + 0.5) * CELL_SIZE, (next.y + 0.5) * CELL_SIZE)
      }
      ctx.stroke()
    }

    // Draw detected obstacles
    detectedObstacles.forEach(obs => {
      ctx.fillStyle = 'rgba(255, 193, 7, 0.6)'
      ctx.fillRect(obs.x * CELL_SIZE, obs.y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
    })

    // Draw target
    ctx.fillStyle = '#dc3545'
    ctx.beginPath()
    ctx.arc(
      (target.x + 0.5) * CELL_SIZE,
      (target.y + 0.5) * CELL_SIZE,
      CELL_SIZE * 0.4,
      0,
      2 * Math.PI
    )
    ctx.fill()

    // Draw agent
    ctx.fillStyle = '#007bff'
    ctx.beginPath()
    ctx.arc(
      (agent.x + 0.5) * CELL_SIZE,
      (agent.y + 0.5) * CELL_SIZE,
      CELL_SIZE * 0.4,
      0,
      2 * Math.PI
    )
    ctx.fill()

    // Draw direction indicator
    if (path.length > currentPathIndex + 1) {
      const nextPos = path[currentPathIndex + 1]
      const dx = nextPos.x - agent.x
      const dy = nextPos.y - agent.y
      const angle = Math.atan2(dy, dx)
      
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo((agent.x + 0.5) * CELL_SIZE, (agent.y + 0.5) * CELL_SIZE)
      ctx.lineTo(
        (agent.x + 0.5) * CELL_SIZE + Math.cos(angle) * CELL_SIZE * 0.3,
        (agent.y + 0.5) * CELL_SIZE + Math.sin(angle) * CELL_SIZE * 0.3
      )
      ctx.stroke()
    }
  }, [grid, agent, target, path, currentPathIndex, sensorRange, detectedObstacles])

  useEffect(() => {
    draw()
  }, [draw])

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE)
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE)

    if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
      if (e.shiftKey) {
        // Set target
        setTarget({ x, y })
      } else if (e.ctrlKey || e.metaKey) {
        // Toggle obstacle
        setGrid(prev => {
          const newGrid = prev.map(row => [...row])
          newGrid[y][x] = newGrid[y][x] === CELL_TYPES.OBSTACLE ? CELL_TYPES.EMPTY : CELL_TYPES.OBSTACLE
          return newGrid
        })
      } else {
        // Set agent position
        setAgent({ x, y })
      }
    }
  }

  const resetSimulation = () => {
    setIsRunning(false)
    setAgent({ x: 2, y: 2 })
    setTarget({ x: 35, y: 25 })
    setCurrentPathIndex(0)
    setDetectedObstacles([])
    setStats({
      pathLength: 0,
      obstaclesDetected: 0,
      timeElapsed: 0,
      efficiency: 100
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Indoor Obstacle Avoidance
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Intelligent navigation system using AI pathfinding algorithms to detect and avoid obstacles in real-time. 
            Watch as the AI agent calculates optimal paths and adapts to environmental changes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Visualization */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  Navigation Environment
                </CardTitle>
                <CardDescription>
                  Click to move agent • Shift+Click to set target • Ctrl+Click to toggle obstacles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 overflow-auto">
                  <canvas
                    ref={canvasRef}
                    width={GRID_WIDTH * CELL_SIZE}
                    height={GRID_HEIGHT * CELL_SIZE}
                    onClick={handleCanvasClick}
                    className="cursor-crosshair border border-gray-300 rounded"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button
                    onClick={() => setIsRunning(!isRunning)}
                    disabled={path.length === 0}
                    className="flex items-center gap-2"
                  >
                    {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isRunning ? 'Pause' : 'Start'} Navigation
                  </Button>
                  
                  <Button onClick={resetSimulation} variant="outline" className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                  
                  <Button onClick={calculatePath} variant="outline" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Recalculate Path
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls and Stats */}
          <div className="space-y-6">
            {/* Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Sensor Range: {sensorRange[0]} cells
                  </label>
                  <Slider
                    value={sensorRange}
                    onValueChange={setSensorRange}
                    max={8}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Speed: {speed[0]}ms per step
                  </label>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    max={1000}
                    min={100}
                    step={50}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Performance Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Path Length:</span>
                  <Badge variant="secondary">{stats.pathLength} steps</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Obstacles Detected:</span>
                  <Badge variant={stats.obstaclesDetected > 0 ? "destructive" : "secondary"}>
                    {stats.obstaclesDetected}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Time Elapsed:</span>
                  <Badge variant="outline">{stats.timeElapsed.toFixed(1)}s</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Path Efficiency:</span>
                  <Badge variant={stats.efficiency > 80 ? "default" : "secondary"}>
                    {stats.efficiency}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span>AI Agent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span>Target</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500"></div>
                  <span>Obstacles</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500"></div>
                  <span>Calculated Path</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded-full"></div>
                  <span>Sensor Range</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-400 opacity-60"></div>
                  <span>Detected Obstacles</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">A* Pathfinding</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Advanced A* algorithm calculates optimal paths while considering obstacles and terrain complexity.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Real-time Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Simulated sensors continuously monitor the environment for obstacles within configurable range.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Adaptive Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Dynamic path recalculation ensures optimal navigation even when obstacles change during movement.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
