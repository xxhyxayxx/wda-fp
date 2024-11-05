import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ModuleForm from './ModuleForm';
import NavBar from './NavBar';

const EditModulePage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [module, setModule] = useState(null);
  const { modules } = useSelector((state) => state.module);

  useEffect(() => {
    const existingModule = modules.find((m) => m.id === parseInt(moduleId, 10));
    if (existingModule) {
      setModule(existingModule);
    } else {
      navigate('/modules');
    }
  }, [moduleId, modules, navigate]);

  return (
    <div>
      <NavBar />
      <div>
        {module ? (
          <ModuleForm 
            module={module} 
            courseId={module.course}  // module の course ID を渡す
          />
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default EditModulePage;
