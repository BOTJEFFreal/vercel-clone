import React from 'react';
import PropTypes from 'prop-types';
import './Deployment.css';

const Deployment = ({ status, createdAt, lastUpdate, deploymentUrl, domainLinks }) => {
  return (
    <div className="deployment">
      <div className="deployment-header">Production Deployment</div>
      <div className="deployment-subheading">
        The deployment that is available to your visitors.
      </div>
      <div className="deployment-subsection">
        <div className="deployment-preview"></div>
        <div className="deployment-data">
          <div className="deployment-section">
            <h3>Deployment</h3>
            <div className="deployment-url">
              <a href={`https://${deploymentUrl}`} target="_blank" rel="noopener noreferrer">
                {deploymentUrl}
              </a>
            </div>
          </div>

          <div className="deployment-section">
            <h3>Domains</h3>
            {domainLinks.map((domain, index) => (
              <div key={index} className="domain-link">
                <a href={`https://${domain}`} target="_blank" rel="noopener noreferrer">
                  {domain}
                </a>
                {index === 0 && domainLinks.length > 1 && <span className="badge">+{domainLinks.length - 1}</span>}
              </div>
            ))}
          </div>

          <div className="deployment-sub-sections">
            <div className="deployment-section">
              <h3>Status</h3>
              <div className="status-container">
                <div className="status-indicator">
                  <div
                    className="status-dot"
                    style={{
                      backgroundColor: status === 'Ready' ? 'green' : 'red',
                    }}
                  ></div>
                  <span>{status}</span>
                </div>
              </div>
            </div>
            <div className="deployment-section">
              <h3>Created At</h3>
              <div className="status-container">
                <div className="status-indicator">
                  <span>{createdAt}</span>
                </div>
              </div>
            </div>
            <div className="deployment-section">
              <h3>Last Update</h3>
              <div className="status-container">
                <div className="status-indicator">
                  <span>{lastUpdate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Deployment.propTypes = {
  status: PropTypes.string.isRequired,
  createdAt: PropTypes.string.isRequired,
  lastUpdate: PropTypes.string.isRequired,
  deploymentUrl: PropTypes.string.isRequired,
  domainLinks: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Deployment;
