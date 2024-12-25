import { useState } from 'react';
import axios from 'axios';
import './EnterURL.css';

const BACKEND_UPLOAD_URL = 'your-backend-url-here';

const EnterURL = () => {
    const [repoUrl, setRepoUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleDeploy = async () => {
        if (!repoUrl) return;
        
        try {
            setError('');
            setUploading(true);
            const res = await axios.post(`${BACKEND_UPLOAD_URL}/deploy`, {
                repoUrl: repoUrl
            });
            console.log('Deployment initiated:', res.data);
        } catch (err) {
            setError('Failed to deploy repository. Please check the URL and try again.');
            console.error('Deployment error:', err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="enterURL">
            <div className="card-header">
                <h2 className="card-title">Deploy your GitHub Repository</h2>
                <p className="card-description">
                    Enter the URL of your GitHub repository to deploy it
                </p>
            </div>
            
            <div className="input-group">
                <label htmlFor="github-url" className="input-label">
                    GitHub Repository URL
                </label>
                <input
                    id="github-url"
                    type="text"
                    className="input-field"
                    placeholder="https://github.com/username/repo"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    disabled={uploading}
                />
            </div>

            {error && <p className="error-message">{error}</p>}

            <button
                className={`submit-button ${uploading ? 'loading' : ''}`}
                onClick={handleDeploy}
                disabled={uploading || !repoUrl}
            >
                {uploading ? 'Deploying...' : 'Deploy Repository'}
            </button>
        </div>
    );
};

export default EnterURL;