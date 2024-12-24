import React from 'react';
import { useRef } from 'react';
import './Deployment.css';

const Deployment = () => {
  const status = useRef("Ready");
  const createdAt = useRef("94d");
  const lastUpdate = useRef("94d");

  return (
    <div className=' deployment'>
        <div className='deployment-header'>Production Deployment</div>
        <div className='deployment-subheading'>The deployment that is available to your visitors.</div>
    <div className="deployment-subsection">
      <div className="deployment-preview"></div>
      <div className="deployment-data">
        <div className="deployment-section">
          <h3>Deployment</h3>
          <div className="deployment-url">
            crypto-portfolio-geyo6hys8-deepaanmol2002gmailcoms-projects.vercel.app
          </div>
        </div>

        <div className="deployment-section">
          <h3>Domains</h3>
          <div className="domain-link">
            <a href="#">crypto-portfolio-app-azure.vercel.app</a>
            <span className="badge">+1</span>
          </div>
        </div>
        <div className='deployment-sub-sections'>
        <div className="deployment-section">
          <h3>Status</h3>
          <div className="status-container">
            <div className="status-indicator">
              <div className="status-dot"></div>
              <span>{status.current}</span>
            </div>
           
          </div>
        </div>
        <div className="deployment-section">
          <h3>Created At</h3>
          <div className="status-container">
            <div className="status-indicator">
              <span>{createdAt.current}</span>
            </div>
           
          </div>
        </div>
        <div className="deployment-section">
          <h3>Last Update</h3>
          <div className="status-container">
            <div className="status-indicator">
              <span>{lastUpdate.current}</span>
            </div>
           
          </div>
        </div>
        </div>
        

        {/* <div className="deployment-section">
          <h3>Source</h3>
          <div className="source-info">
            <div>→ main</div>
            <div>
              66a6f9a
              <span className="commit-info">pushed old code</span>
            </div>
          </div>
        </div> */}
      </div>
    </div>
    </div>
  );
};

export default Deployment;