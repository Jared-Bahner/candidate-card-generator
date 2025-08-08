# Candidate Card Generator

An AI-powered web application for generating professional candidate cards from resumes using OpenAI's GPT-4 for intelligent parsing and content generation.

## 🚀 Features

- **AI Resume Parsing**: Automatically extract candidate information from PDF resumes
- **Smart Highlight Generation**: Context-aware achievement highlights using AI
- **Professional PDF Export**: Generate high-quality candidate cards in PDF format
- **Recent Cards Management**: Save and manage previously created cards
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Preview**: Live preview of candidate cards as you edit

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **AI Services**: OpenAI GPT-4 API
- **PDF Processing**: PDF.js, @react-pdf/renderer
- **Testing**: Vitest, React Testing Library
- **Deployment**: Vercel (optimized)

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- OpenAI API key

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/candidate-card-generator.git
cd candidate-card-generator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp env.example .env.local
```

Edit `.env.local` and add your OpenAI API key:

```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_APP_NAME=Candidate Card Generator
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🏗️ Build for Production

### Local Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Configure Environment Variables**: Add your environment variables in Vercel dashboard
3. **Deploy**: Vercel will automatically build and deploy your application

Required environment variables for production:
- `VITE_OPENAI_API_KEY`: Your OpenAI API key
- `VITE_APP_NAME`: Application name
- `VITE_APP_VERSION`: Application version
- `VITE_APP_ENV`: Set to "production"

### Other Platforms

The application can be deployed to any platform that supports static site hosting:

- **Netlify**: Use the build command `npm run build` and publish directory `dist`
- **GitHub Pages**: Configure GitHub Actions for automatic deployment
- **AWS S3 + CloudFront**: Upload the `dist` folder to S3 and configure CloudFront

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run tests once
npm run test:run
```

### Test Coverage

The application includes comprehensive tests for:
- Component rendering and interactions
- Form validation and data handling
- AI service integration
- Storage utilities
- Error handling

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ProfileForm.jsx  # Main form component
│   ├── ProfileCard.jsx  # Card preview component
│   ├── PDFProfileCard.jsx # PDF generation component
│   ├── RecentCards.jsx  # Recent cards management
│   └── ErrorBoundary.jsx # Error handling
├── services/           # External service integrations
│   └── aiService.js    # OpenAI API integration
├── utils/              # Utility functions
│   ├── storage.js      # Local storage management
│   └── common.js       # Common utility functions
├── test/               # Test files
├── App.jsx             # Main application component
└── main.jsx            # Application entry point
```

## 🔧 Configuration

### Vite Configuration

The application uses Vite with optimized production settings:
- Code splitting for better performance
- Terser minification
- Asset optimization
- Development server configuration

### Tailwind CSS

Custom styling with Tailwind CSS including:
- Responsive design utilities
- Custom color schemes
- Component-specific styles

## 🛡️ Security

### Environment Variables

- Never commit API keys to version control
- Use environment variables for sensitive data
- Validate environment variables at runtime

### API Security

- OpenAI API calls are made client-side (requires `dangerouslyAllowBrowser: true`)
- Consider implementing a backend proxy for production use
- Rate limiting and error handling implemented

## 📊 Performance

### Optimizations

- **Code Splitting**: Automatic chunk splitting for better loading times
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Automatic image compression and optimization
- **Caching**: Static assets cached with long expiration times
- **Bundle Analysis**: Use `npm run build:analyze` to analyze bundle size

### Monitoring

- Error boundary for graceful error handling
- Console logging for debugging (development only)
- Performance monitoring ready for integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review the test files for usage examples

## 🔄 Changelog

### Version 1.0.0
- Initial release
- AI-powered resume parsing
- PDF export functionality
- Recent cards management
- Responsive design
- Comprehensive testing suite

## 🙏 Acknowledgments

- OpenAI for providing the GPT-4 API
- React team for the amazing framework
- Vite team for the fast build tool
- Tailwind CSS for the utility-first CSS framework
