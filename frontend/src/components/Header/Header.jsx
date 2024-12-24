import './Header.css'
const Header = () => {
  const redirectToGitHub = () => {
    const githubRepoUrl = "https://github.com/your-username/your-repo";
    window.location.href = githubRepoUrl; 
  };
  const redirectToSite = () => {
    const githubRepoUrl = "https://github.com/your-username/your-repo";
    window.location.href = githubRepoUrl; 
  };
  return (
    <div className='header'>
      <h1>crypto-portfolio-app</h1>
      <div className='header-side-buttons'>
      <div className='header-github-button'
        onClick={redirectToGitHub}  >
      GitHub Repo
      </div>
      <div className='header-visit-button'
        onClick={redirectToSite}  >
      Visit
      </div>
      </div>
    </div>
  );
};

export default Header;
