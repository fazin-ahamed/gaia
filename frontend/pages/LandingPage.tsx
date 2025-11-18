
import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ShieldCheck, Users, Globe, Cpu, GitMerge } from 'lucide-react';
import Button from '../components/Button';

const FeatureCard: React.FC<{ icon: React.ElementType, title: string, description: string }> = ({ icon: Icon, title, description }) => (
    <div className="bg-gaia-med/50 backdrop-blur-sm p-6 rounded-lg border border-gaia-light text-center transform hover:scale-105 transition-transform duration-300">
        <div className="flex justify-center mb-4">
            <div className="p-3 bg-gaia-accent/20 rounded-full">
                <Icon className="w-8 h-8 text-gaia-accent" />
            </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
    </div>
);

const LandingPage: React.FC = () => {
  return (
    <div className="bg-gaia-dark text-white min-h-screen">
      {/* Header */}
      <header className="py-4 px-8 flex justify-between items-center">
        <div className="flex items-center space-x-2">
           <svg className="w-8 h-8 text-gaia-accent" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93s3.05-7.44 7-7.93v15.86zm2-15.86c1.03.13 2 .45 2.87.93L15 8h-2V4.07zM15 10h2l.87 2.07c.18.42.28.87.31 1.34H15v-3.41zM14 14.59c0 .59-.44 1.2-1 1.4v.01c-.56-.2-1-.81-1-1.4V12h2v2.59zM19.93 11c-.13-1.03-.45-2-.93-2.87L18 10h-2v2h3.41c.09-.31.15-.63.17-.96.02-.17.02-.33.02-.5.0-.17-.01-.33-.03-.49z"/>
            </svg>
            <h1 className="text-2xl font-bold">GAIA</h1>
        </div>
        <nav className="flex space-x-4">
            <Link to="/dashboard">
                <Button variant="primary">Launch Platform</Button>
            </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="text-center py-20 px-4" style={{ backgroundImage: `radial-gradient(circle at 50% 50%, rgba(0, 170, 255, 0.1), transparent 70%)` }}>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight">
              Autonomous AI Anomaly Detection, <span className="text-gaia-accent">Globally.</span>
          </h1>
          <p className="text-lg text-gray-400 mt-4 max-w-3xl mx-auto">
              GAIA provides fully autonomous, multimodal intelligence to identify, analyze, and act on critical anomalies in real-time.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
              <Link to="/dashboard">
                  <Button variant="primary" className="px-8 py-3 text-lg">Live Demo</Button>
              </Link>
              <Link to="/about">
                  <Button variant="secondary" className="px-8 py-3 text-lg">Learn More</Button>
              </Link>
          </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Core Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <FeatureCard icon={Zap} title="Fully Autonomous" description="End-to-end detection and workflow orchestration with zero human intervention required." />
              <FeatureCard icon={ShieldCheck} title="Optional Review" description="Maintain full control with an optional human-in-the-loop process for critical decisions." />
              <FeatureCard icon={Users} title="Multimodal AI" description="Ingest and analyze text, images, video, audio, and sensor data for comprehensive insights." />
              <FeatureCard icon={Globe} title="Real-time Reporting" description="Global monitoring with live dashboards, instant notifications, and detailed incident reports." />
              <FeatureCard icon={Cpu} title="Powered by Gemini" description="Leverages Google's state-of-the-art AI for unparalleled accuracy in detection and reasoning." />
              <FeatureCard icon={GitMerge} title="Orchestrated by Opus" description="Complex response workflows are intelligently managed and executed by our advanced Opus engine." />
          </div>
      </section>

      {/* How It Works Section */}
       <section className="py-20 px-8 bg-gaia-med">
          <h2 className="text-4xl font-bold text-center mb-12">How GAIA Works</h2>
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 md:space-x-8">
              <div className="text-center">
                  <div className="text-5xl font-bold text-gaia-accent">1</div>
                  <h3 className="text-2xl font-semibold mt-2">Ingest</h3>
                  <p className="text-gray-400 mt-1">Data from APIs, sensors, news, images.</p>
              </div>
               <div className="text-2xl text-gray-500">→</div>
              <div className="text-center">
                  <div className="text-5xl font-bold text-gaia-accent">2</div>
                  <h3 className="text-2xl font-semibold mt-2">Analyze</h3>
                  <p className="text-gray-400 mt-1">Gemini detects anomalies and provides reasoning.</p>
              </div>
              <div className="text-2xl text-gray-500">→</div>
              <div className="text-center">
                  <div className="text-5xl font-bold text-gaia-accent">3</div>
                  <h3 className="text-2xl font-semibold mt-2">Orchestrate</h3>
                  <p className="text-gray-400 mt-1">Opus executes autonomous or human-review workflows.</p>
              </div>
              <div className="text-2xl text-gray-500">→</div>
               <div className="text-center">
                  <div className="text-5xl font-bold text-gaia-accent">4</div>
                  <h3 className="text-2xl font-semibold mt-2">Report</h3>
                  <p className="text-gray-400 mt-1">Real-time alerts and detailed audit logs are delivered.</p>
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 border-t border-gaia-light">
          <p className="text-gray-500">&copy; 2024 GAIA Platform. All rights reserved. A conceptual project.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
