# Mainframe Dash

A modern, theme-able dashboard application for Raspberry Pi built with React and Vite. Mainframe Dash provides a comprehensive interface for system monitoring, media control, network management, and more with multiple retro and modern theme options.

## 🎨 Features

### System Monitoring & Control
- **System Stats** - Real-time CPU, memory, and disk usage monitoring
- **System Time** - Current time display with timezone support
- **System Control** - Execute system commands and manage system operations

### Network & Connectivity
- **Network Radar** - Visualize connected devices and network topology
- **Bluetooth Manager** - Manage Bluetooth connections and devices
- **Local Devices** - Discover and interact with local network devices

### Information & Entertainment
- **Weather** - Real-time weather information and forecasts
- **Global News** - News feeds from various sources
- **Orbital Tracking** - Track satellites and orbital mechanics (ISS, etc.)
- **Media Deck** - Media player and multimedia management

### Productivity & Planning
- **Agenda Sync** - Calendar and schedule synchronization
- **Shortcuts** - Quick access to frequently used actions

### Data Management
- **Data Vault** - Secure data storage and management interface

### Theme Support
Switch between multiple retro and modern themes:
- 🪟 **Windows 95** - Classic Windows 95 aesthetic
- 🌐 **Cyberpunk** - Futuristic cyberpunk interface
- 🎮 **RobCo Terminal** - Fallout series inspired design
- 🎨 **Material You** - Modern Material Design

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- A backend API server (default configured for Raspberry Pi at `192.168.51.178:5000`)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mainframe-dash
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` by default.

## 📦 Project Structure

```
src/
├── components/          # Dashboard component modules
│   ├── AgendaSync.jsx
│   ├── BluetoothManager.jsx
│   ├── DataVault.jsx
│   ├── GlobalNews.jsx
│   ├── LocalDevices.jsx
│   ├── MediaDeck.jsx
│   ├── NetworkRadar.jsx
│   ├── OrbitalTracking.jsx
│   ├── Shortcuts.jsx
│   ├── SysStats.jsx
│   ├── SystemControl.jsx
│   ├── SysTime.jsx
│   └── Weather.jsx
├── App.jsx              # Main application component
├── App.css              # Application styles
├── ThemeContext.jsx     # Theme provider and context
├── main.jsx             # Entry point
└── index.css            # Global styles
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint to check code quality

## 🔧 Configuration

### Backend API
The application is configured to proxy API requests to a backend server. Edit `vite.config.js` to change the backend URL:

```javascript
proxy: {
  '/api': {
    target: 'http://YOUR_PI_IP:5000',
    changeOrigin: true,
    secure: false,
  }
}
```

### Network Access
The development server is configured to be accessible from other devices on your network. Access it using your machine's IP address instead of localhost.

## 🎯 Theme System

The application uses React Context for theme management. Themes can be switched at runtime using the theme selector dropdown in the top-right corner of the dashboard.

To customize or add new themes, edit `ThemeContext.jsx` and update the corresponding CSS in `App.css`.

## 🔌 API Integration

All components are designed to work with a backend API server. API endpoints should be prefixed with `/api/` to take advantage of the Vite proxy configuration.

## 📱 Responsive Design

The dashboard is designed to work on various screen sizes, from tablets to large desktop displays, making it perfect for different Pi-based installations.

## 🛡️ License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 Notes

- This project is configured for Raspberry Pi deployment
- Backend API integration required for full functionality
- Ensure the backend server is running before launching the dashboard
- Theme selection is persisted in the UI but may need backend support for persistence

## 🐛 Troubleshooting

**Backend connection issues:**
- Verify the backend server is running on the configured IP and port
- Check network connectivity between your device and the Pi
- Review browser console for CORS-related errors

**Theme not loading:**
- Clear browser cache and reload the page
- Check that CSS files are properly bundled in the build

**Component data not showing:**
- Ensure backend API endpoints match component expectations
- Check browser network tab for failed API requests
- Verify API response format matches component requirements
