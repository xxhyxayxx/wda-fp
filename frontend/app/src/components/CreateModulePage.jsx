import React from 'react';
import ModuleForm from './ModuleForm';
import NavBar from './NavBar';
import { useNavigate, useLocation } from 'react-router-dom';

const CreateModulePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const courseId = queryParams.get('courseId');  // クエリパラメータから courseId を取得

  console.log("courseId passed to CreateModulePage:", courseId);  // デバッグ用ログ

  return (
    <div>
      <div>
        <ModuleForm courseId={courseId} onClose={() => navigate('/modules')} />  {/* courseId を ModuleForm に渡す */}
      </div>
    </div>
  );
};

export default CreateModulePage;
