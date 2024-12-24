import Header from "./Header/Header";
import Deployment from "./Deployment/Deployment"
import Logs from "./Logs/Logs";
const Dashboard = () => {

  return (
    <div className="dashboard">
      <Header/>
      <Deployment/>
      <Logs/>
       
    </div>
  );
};

export default Dashboard;
