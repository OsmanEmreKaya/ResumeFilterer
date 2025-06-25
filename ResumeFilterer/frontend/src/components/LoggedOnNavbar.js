import React, { useState } from 'react';
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const LoggedOnNavbar = () => {
  // State to manage the navbar's visibility
  const [nav, setNav] = useState(false);

  // Toggle function to handle the navbar's display
  const handleNav = () => {
    setNav(!nav);
  };

  // Array containing navigation items
  const navItems = [
    { id: 1, text: 'Email', link: '/email'},
    { id: 2, text: 'Upload Resume', link: '/upload-resume' },
    { id: 3, text: 'Resumes', link: '/resumes' },
    { id: 4, text: 'Logout', link: '/logout'},
  ];

  return (
    <div className='bg-black flex justify-between items-center h-24 w-full px-4 text-white'>
      {/* Logo linked to homepage */}
      <Link to="/upload-resume">
        <img src="https://cdn-icons-png.flaticon.com/512/3789/3789854.png" alt="CV Logo" className='w-20' />
      </Link>
      {/* Desktop Navigation */}
      <ul className='hidden md:flex'>
        {navItems.map(item => (
          <li
            key={item.id}
            className='p-4 hover:bg-[#3d85dc] rounded-xl m-2 cursor-pointer duration-300 hover:text-black'
          >
            <Link to={item.link}>{item.text}</Link>
          </li>
        ))}
      </ul>

      {/* Mobile Navigation Icon */}
      <div onClick={handleNav} className='block md:hidden'>
        {nav ? <AiOutlineClose size={20} /> : <AiOutlineMenu size={20} />}
      </div>

      {/* Mobile Navigation Menu */}
      <ul
        className={
          nav
            ? 'fixed md:hidden left-0 top-0 w-[60%] h-full border-r border-r-gray-900 bg-[#000300] ease-in-out duration-500'
            : 'ease-in-out w-[60%] duration-500 fixed top-0 bottom-0 left-[-100%]'
        }
      >
        {/* Mobile Logo */}
        <Link to="/">
          <img src="https://cdn-icons-png.flaticon.com/512/3789/3789854.png" alt="CV Logo" className='w-20 mx-auto m-4' />
        </Link>

        {/* Mobile Navigation Items */}
        {navItems.map(item => (
          <li
            key={item.id}
            className='p-4 border-b rounded-xl hover:bg-[#3d85dc] duration-300 hover:text-black cursor-pointer border-gray-600'
          >
            <Link to={item.link}>{item.text}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LoggedOnNavbar;
