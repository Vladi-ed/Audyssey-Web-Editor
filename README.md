# Audyssey Web Editor

Edit your MultEQ *.ady files, analyze speakers frequency response, adjust target curve and many more.

This project was made with [Angular](https://github.com/angular/angular-cli) and [Highcharts](https://editor.highcharts.com/full.html)

## Live version
Available online at https://audyssey.pages.dev

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/W7W6MK9TT)


### Question:
Generate documentation for this project

### Answer:
I'll generate comprehensive documentation for the Audyssey Web Editor project based on the codebase analysis. Here's the documentation:

```markdown
# File: /C:/Users/vonder/Documents/Programming/Angular/Audyssey-Editor/README.md

# Audyssey Web Editor

A sophisticated web application for editing MultEQ *.ady files, analyzing speaker frequency response, and adjusting target curves for audio equipment calibration.

## 🎯 Overview

The Audyssey Web Editor is a specialized audio engineering tool built with Angular and Highcharts that enables users to:

- **Edit MultEQ *.ady files** - Modify Audyssey room correction calibration files
- **Analyze speaker frequency response** - Visualize and understand audio equipment performance
- **Adjust target curves** - Fine-tune audio calibration parameters
- **Process audio data** - Advanced FFT processing and mathematical calculations
- **Export configurations** - Save modified calibration settings

## 🚀 Live Version

Available online at: **https://audyssey.pages.dev**

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/W7W6MK9TT)

## 🛠️ Technology Stack

### Core Framework
- **Angular 20.x** - Latest Angular framework with modern build system
- **TypeScript 5.8.x** - Type-safe development
- **Zone.js** - Change detection and asynchronous operation handling

### UI Components
- **Angular Material 20.x** - Material Design components
- **Angular CDK** - Component development kit for advanced UI patterns

### Data Visualization
- **Highcharts 12.3.x** - Advanced charting library for frequency response visualization
- **Highcharts-Angular** - Angular integration for seamless chart implementation

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
- **Node.js** (v20.19.0+ or v22.12.0+ or v24.0.0+)
- **npm** (v6.11.0+ or v7.5.6+ or v8.0.0+)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Audyssey-Editor
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
- **MultEQ .ady files** - Audyssey room correction calibration files
- **Audio Frequency Response data** - Various audio measurement formats

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

#### 4. Crossover Processing
- Speaker crossover frequency analysis
- Filter response calculations
- Multi-way speaker system optimization

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

### Chart Types
- **Line Charts** - Frequency response curves
- **Scatter Plots** - Measurement data points
- **Area Charts** - Target curve visualization

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

This project is private and not published to npm registry. Please respect the author's intellectual property rights.

## 👨‍💻 Author

**Vladi Ed** - Audio engineering and web development


### Development server

Run `npm install` and `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

<!--
  You can generate this image URL dynamically: https://ogcdn.net/6064b869-74ed-4eb9-b76c-0b701ffe7e6b/v4/{site_text}/{title_text}/{image_url}/og.png
  Replace the variables in the brackets with your own values and use this URL in the image tag below this comment. Ensure values are URL encoded.
  For more information, read: https://www.opengraph.xyz/blog/how-to-implement-dynamic-open-graph-images
-->
