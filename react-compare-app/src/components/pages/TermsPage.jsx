import React from 'react';
import { Button } from '../ui/Button';

const TermsPage = ({ onBack }) => (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold mb-6 text-slate-900">Terms of Use</h1>
        <div className="prose max-w-none text-slate-700">
            <p><strong>Last Updated:</strong> June 23, 2025</p>
            <p>Welcome to CompareIt! By accessing or using our application, you agree to be bound by these Terms of Use. Please read them carefully.</p>
            
            <h2>1. Acceptable Use Policy</h2>
            <p>CompareIt is a platform for comparing products, services, and concepts. It is not a platform for judging or comparing individuals. To ensure a safe and respectful environment, you agree not to create, share, or engage with any content that:</p>
            <ul>
                <li>Compares individual people based on personal attributes, appearance, beliefs, or any other characteristic.</li>
                <li>Is defamatory, obscene, pornographic, vulgar, offensive, or promotes discrimination, bigotry, racism, hatred, harassment, or harm against any individual or group.</li>
                <li>Is illegal, fraudulent, or promotes illegal activities.</li>
                <li>Infringes on any third party's intellectual property rights, including copyright, trademark, or patent rights.</li>
            </ul>
            <p>We encourage creative and helpful comparisons of things like technology, financial products, travel destinations, and educational resources. Content focused on comparing human beings is strictly prohibited and will be removed.</p>

            <h2>2. User-Generated Content</h2>
            <p>You are solely responsible for the content you create. While we encourage factual and helpful comparisons, CompareIt does not guarantee the accuracy, integrity, or quality of user-generated content. Use the information on this platform at your own risk.</p>

            <h2>3. Our Right to Manage Content</h2>
            <p>We reserve the right, but do not have the obligation, to review, edit, or remove any content that we believe, in our sole discretion, violates these Terms of Use or is otherwise objectionable. We also reserve the right to suspend or terminate your account for any violation of these terms.</p>
            
            <h2>4. Changes to Terms</h2>
            <p>We may modify these terms at any time. We will notify you of any changes by posting the new Terms of Use on this page. Your continued use of the application after such changes constitutes your acceptance of the new terms.</p>
        </div>
        <div className="mt-8 text-center">
             <Button onClick={onBack}>Go Back</Button>
        </div>
    </div>
);

export default TermsPage;