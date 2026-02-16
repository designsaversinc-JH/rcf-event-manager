import React from 'react';
import { Outlet } from 'react-router-dom';
import BackToTopButton from '../common/BackToTopButton';

const PublicLayout = () => (
  <>
    <Outlet />
    <BackToTopButton />
  </>
);

export default PublicLayout;
