
import React from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';

const AboutPage: React.FC = () => {
  return (
    <div className="p-8">
      <PageHeader title="About GAIA" subtitle="Our mission, our technology, and our commitment to a safer world." />

      <div className="space-y-8 max-w-4xl mx-auto">
        <Card>
          <h2 className="text-2xl font-bold text-gaia-accent mb-4">Mission Statement</h2>
          <p className="text-gray-300 leading-relaxed">
            GAIA's mission is to create a globally interconnected intelligence network that autonomously detects and mitigates threats to human well-being, ecological stability, and global security. We aim to provide timely, accurate, and actionable insights to humanitarian organizations, governments, and industries, enabling proactive responses to emerging crises.
          </p>
        </Card>

        <Card>
          <h2 className="text-2xl font-bold text-gaia-accent mb-4">Ethical AI by Design</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Autonomy at a global scale carries immense responsibility. GAIA is built on a foundation of ethical AI principles to ensure fairness, transparency, and accountability:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-400">
            <li><strong>Traceability:</strong> Every decision, whether by AI or human, is recorded in an immutable audit log.</li>
            <li><strong>Human Oversight:</strong> Critical decisions are architected to require human-in-the-loop verification, preventing unchecked autonomous actions in sensitive domains.</li>
            <li><strong>Data Privacy:</strong> We employ state-of-the-art encryption and data minimization techniques to protect sensitive information.</li>
            <li><strong>Bias Mitigation:</strong> Our AI models are continuously trained and evaluated against diverse datasets to minimize algorithmic bias.</li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-2xl font-bold text-gaia-accent mb-4">Partnerships & Future Roadmap</h2>
          <p className="text-gray-300 leading-relaxed">
            We partner with leading research institutions, NGOs, and technology providers to advance the field of autonomous anomaly detection. Our roadmap includes expanding our multimodal capabilities to include satellite-based hyperspectral imaging, real-time social media sentiment analysis, and predictive modeling for long-term risk assessment.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;
