import { useState } from 'react';
import Dashboard from './components/Dashboard';
import EnterURL from './components/EnterURL/EnterURL';
import './index.css';

const App = () => {
  const [success, setSuccess] = useState(false);
  const [slug, setSlug] = useState('');

  function handleDataFromChild(success,slug) {
    setSuccess(success);
    setSlug(slug);
  }

  return (
    <>
      {!success ? <EnterURL sendDataToParent={handleDataFromChild} /> : <Dashboard slug ={slug} />}
    </>
  );
};

export default App;
