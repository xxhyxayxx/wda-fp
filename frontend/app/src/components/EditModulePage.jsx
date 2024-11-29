// EditModulePage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ModuleForm from './ModuleForm';
import NavBar from './NavBar';
import { fetchFiles } from '../features/course/fileSlice';

const EditModulePage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [module, setModule] = useState(null);
  const [existingFiles, setExistingFiles] = useState([]); // 既存ファイルの状態管理
  const { modules } = useSelector((state) => state.module);

  useEffect(() => {
    const existingModule = modules.find((m) => m.id === parseInt(moduleId, 10));
    if (existingModule) {
      setModule(existingModule);
      dispatch(fetchFiles(moduleId))
        .unwrap()
        .then((files) => setExistingFiles(files))
        .catch((error) => console.error('Failed to fetch files:', error));
    } else {
      navigate('/modules');
    }
  }, [moduleId, modules, dispatch, navigate]);

  return (
    <div>
      <NavBar />
      <div>
        {module ? (
          <ModuleForm 
            module={module} 
            courseId={module.course}  // module の course ID を渡す
            existingFiles={existingFiles} // 既存ファイルを ModuleForm に渡す
          />
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default EditModulePage;
