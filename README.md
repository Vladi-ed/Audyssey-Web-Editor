# ADY Web Editor

ADY Web Editor is an independent, open-source web application for inspecting, editing, and exporting `.ady` room-calibration files compatible with Audyssey MultEQ.

## 🎯 Overview


ADY Web Editor is a specialized audio engineering tool built with Angular and Highcharts that enables users to:

- **Edit MultEQ \*.ady files** - Modify Audyssey room correction calibration files
- **Analyze speaker frequency response** - Visualize and understand audio equipment performance
- **Adjust target curves** - Fine-tune audio calibration parameters
- **Process audio data** - Advanced FFT processing and mathematical calculations
- **Export configurations** - Save modified calibration settings

## 🚀 Live Version

Available online at: **https://audyssey.pages.dev**

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/W7W6MK9TT)

## 🛠️ Technology Stack

### Core Framework
- **Angular 22** - Latest Angular framework with modern build system
- **TypeScript 6** - Type-safe development

### UI Components
- **Angular Material** - Material Design components

### Data Visualization
- **Highcharts** - Advanced charting library for frequency response visualization

### Audio Processing
- **FFT.js** - Fast Fourier Transform library for audio signal processing
- **Web Workers** - Background processing for intensive calculations

## 📁 Project Structure

```
src/
├── app/
│   ├── channel-selector/          # Audio channel selection component
│   ├── target-curve-points/       # Target curve management with custom pipes
│   ├── helper-functions/          # Audio processing utilities
│   │   ├── afr-processing.ts      # Audio Frequency Response functions
│   │   ├── audyssey-interface.ts  # Audyssey file format handling
│   │   ├── crossover-processing.ts # Audio crossover calculations
│   │   └── bg-calculator.worker.ts # Web Worker for background processing
│   ├── interfaces/                # TypeScript type definitions
│   └── app.component.*            # Main application component
├── assets/
│   ├── examples/                  # Sample .ady files
│   ├── images/                    # Application images
│   └── preview/                   # Preview content
└── environments/                  # Environment configurations
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v24+)
- **npm** (11+)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   ng serve
   ```

4. **Access the application**
   Navigate to `http://localhost:4200/`

The application will automatically reload when you make changes to source files.

### Available Scripts

```bash
# Development server
npm start
# or
ng serve

# Production build
npm run build
# or
ng build

# Angular CLI commands
npm run ng -- <command>
```

## 🎵 Audio Processing Features

### Supported File Formats
- **MultEQ .ady files** - Audyssey room correction calibration files created by the Android or iOS app
- **Audyssey One .ady files** - Experimental support

### Core Capabilities

#### 1. Channel Processing
- Multi-channel audio analysis
- Channel-specific frequency response visualization
- Individual channel calibration adjustments

#### 2. Frequency Response Analysis
- Real-time FFT processing
- Frequency domain visualization
- Phase and magnitude analysis

#### 3. Target Curve Management
- Custom target curve creation
- Curve point manipulation
- Mathematical curve fitting


## 🔧 Development

### Architecture

The application follows Angular's component-based architecture with:

- **Feature Components** - Modular UI components for specific functionality
- **Helper Functions** - Utility libraries for audio processing
- **Web Workers** - Background processing for intensive calculations
- **Custom Pipes** - Data transformation and formatting
- **TypeScript Interfaces** - Strong typing for audio data models

### Key Components

#### Channel Selector
Manages audio channel selection and routing for multi-channel audio systems.

#### Target Curve Points
Handles target curve data manipulation with custom pipes for audio processing.

#### Helper Functions
- **AFR Processing** - Audio Frequency Response calculations
- **Audyssey Interface** - File format parsing and generation
- **Crossover Processing** - Speaker crossover analysis
- **Background Calculator** - Web Worker for intensive computations

### Build Configuration

The project uses Angular's modern build system with:
- **ESBuild** - Fast JavaScript bundling
- **TypeScript compilation** - Type checking and transpilation
- **SCSS processing** - Styling with Sass
- **Asset optimization** - Image and resource optimization

## 📊 Data Visualization

### Highcharts Integration
- Interactive frequency response charts
- Real-time data updates
- Zoom and pan functionality
- Export capabilities (PNG, SVG, PDF)

### Mathematical Processing
- Fast Fourier Transform (FFT) analysis
- Digital signal processing algorithms
- Statistical analysis of audio data
- Curve fitting and interpolation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

ADY Web Editor is an independent open-source project and is not affiliated with or endorsed by Audyssey Laboratories.
Audyssey and MultEQ are trademarks of Audyssey Laboratories, Inc.

## 👨‍💻 Author

**Vladi Ed** - Audio engineering and web development

