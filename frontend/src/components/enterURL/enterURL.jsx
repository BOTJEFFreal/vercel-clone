import { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';  
import './EnterURL.css';

const BACKEND_UPLOAD_URL = 'http://localhost:9000/api/';

const EnterURL = ({ sendDataToParent }) => {
    const [repoUrl, setRepoUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleDeploy = async () => {
        if (!repoUrl) return;

        try {
            setError('');
            setSuccessMessage('');
            setUploading(true);

            const data = JSON.stringify({
                gitURL: repoUrl,
                userID: "DUMMY1"
            });

            const config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `${BACKEND_UPLOAD_URL}/project/`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: data,
            };

            const response = await axios.request(config);
            setSuccessMessage('Deployment initiated successfully!');
            sendDataToParent(true,response.data.projectSlug);  
            console.log('Deployment initiated:', response.data);
        } catch (error) {
            if (error.response) {
                if (error.response.status === 400) {
                    setError('Invalid repository URL. Please check and try again.');
                } else if (error.response.status === 500) {
                    setError('Internal server error. Please try again later.');
                } else {
                    setError('Failed to deploy repository. Please check the URL and try again.');
                }
            } else if (error.request) {
                setError('No response from server. Please check your network or backend server.');
            } else {
                setError('An unexpected error occurred.');
            }
            console.error('Deployment error:', error);
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
            {successMessage && <p className="success-message">{successMessage}</p>}

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
EnterURL.propTypes = {
    sendDataToParent: PropTypes.func.isRequired, 
};

export default EnterURL;
