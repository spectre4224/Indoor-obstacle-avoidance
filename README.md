# AI-Powered Indoor Obstacle Avoidance

An intelligent navigation system that uses AI pathfinding algorithms to detect and avoid obstacles in real-time indoor environments. This system demonstrates how autonomous robots, drones, and smart devices can navigate confined spaces safely and efficiently.

## 🚀 Features

- **Advanced A* Pathfinding**: Calculates optimal paths while considering obstacles and terrain complexity
- **Real-time Obstacle Detection**: Simulated sensors continuously monitor the environment within configurable range
- **Interactive Environment**: Click-based controls to position agents, set targets, and modify obstacles dynamically
- **Performance Analytics**: Real-time statistics tracking path efficiency, obstacle detection, and navigation performance
- **Adaptive Navigation**: Dynamic path recalculation ensures optimal navigation even when obstacles change during movement

## 🎮 How to Use

### Interactive Controls
- **Click**: Move the AI agent to a new position
- **Shift + Click**: Set a new target destination  
- **Ctrl + Click**: Toggle obstacles on/off
- **Sensor Range Slider**: Adjust detection range (1-8 cells)
- **Speed Control**: Modify navigation speed (100-1000ms per step)

### Navigation Controls
- **Start/Pause**: Begin or pause the navigation simulation
- **Reset**: Return to initial state
- **Recalculate Path**: Force path recalculation with current settings

## 🛠️ Technology Stack

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Canvas API**: Real-time visualization
- **Radix UI**: Accessible component primitives

## 🧠 AI Algorithm

The system implements the **A* (A-star) pathfinding algorithm**, which:

1. **Heuristic Search**: Uses Manhattan distance to estimate path costs
2. **Optimal Pathfinding**: Guarantees the shortest path when one exists
3. **Dynamic Adaptation**: Recalculates paths when obstacles change
4. **8-Directional Movement**: Supports diagonal movement for more natural navigation

## 📊 Performance Metrics

The system tracks several key performance indicators:

- **Path Length**: Total steps required to reach the target
- **Path Efficiency**: Ratio of optimal distance to actual path length
- **Obstacles Detected**: Number of obstacles within sensor range
- **Time Elapsed**: Total navigation time

## 🎯 Applications

This technology is applicable to:

- **Warehouse Automation**: Autonomous robots navigating storage facilities
- **Home Robotics**: Smart vacuum cleaners and service robots
- **Indoor Drone Delivery**: Package delivery in confined spaces
- **Assistive Technology**: Navigation aids for mobility devices
- **Gaming AI**: Intelligent NPC movement in video games

## 🚀 Getting Started

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/your-username/indoor-obstacle-avoidance.git
   cd indoor-obstacle-avoidance
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open your browser**
   Navigate to `http://localhost:3000` to see the application

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🔮 Future Enhancements

- [ ] 3D visualization with Three.js
- [ ] Machine learning for dynamic obstacle prediction
- [ ] Multi-agent system with collision avoidance
- [ ] Real sensor integration (camera/lidar)
- [ ] Export functionality for navigation data
- [ ] WebGL acceleration for larger environments
