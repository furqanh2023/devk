import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Busy from './Busy';
export default function RouteGuard({children,user,authReady,role,adminUid,application,applicationReady}) {
  const location=useLocation();
  if(!authReady)return <Busy/>;
  if(!user)return <Navigate to="/login" replace state={{from:location.pathname}}/>;
  if(role==='student'&&!applicationReady)return <Busy text="Loading your application…"/>;
  if(role==='admin'&&(!adminUid||user.uid!==adminUid))return <Navigate to="/student" replace/>;
  if(role==='student'&&user.uid===adminUid&&adminUid)return <Navigate to="/admin" replace/>;
  if(role==='student'&&!application?.profileCompleted&&!location.pathname.endsWith('/settings'))return <Navigate to="/student/settings" replace/>;
  return children;
}
