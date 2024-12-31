import PropTypes from "prop-types";
import Header from "./Header/Header";
import Deployment from "./Deployment/Deployment";
import Logs from "./Logs/Logs";
import axios from "axios";
import { useEffect, useState } from "react";

const Dashboard = ({ slug }) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/project/${slug}`);
        setProject(response.data);
      } catch (err) {
        console.error("Error fetching project data:", err);
        setError("Failed to load project data.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProjectData();
    }
  }, [slug]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!project) {
    return <div>No project data available</div>;
  }

  return (
    <div className="dashboard">
      <Header />
      <Deployment project={project} />
      <Logs project={project} />
    </div>
  );
};

Dashboard.propTypes = {
  slug: PropTypes.string.isRequired, 
};

export default Dashboard;
