import './ModuleSidebar.css';

function ModuleSidebar({ modules, activeModuleIndex, setActiveModuleIndex }) {
  return (
    <div className="module-sidebar">
      <h3>Course Modules</h3>
      <ul className="module-list">
        {modules.map((module, index) => (
          <li 
            key={index} 
            className={index === activeModuleIndex ? 'active' : ''}
            onClick={() => setActiveModuleIndex(index)}
          >
            {module.module_title}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ModuleSidebar;