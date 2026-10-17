import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../../components/educator/Navbar'
import Sidebar from '../../components/educator/Sidebar'


const Educator = () => {
  return (
    <div className='text-defaul min-h-screen bg-white'>
      <Navbar/>
      {/* {left side sidebar} */}
      <div className='flex'> 
        <Sidebar/>
           {/* {right side other component} */}
           <div className='flex-1'>
              {<Outlet/>}
           </div>
      </div>
    </div>
  )
}

export default Educator
