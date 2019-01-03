import React from 'react'
import {Link} from 'react-router-dom'

function NavBar() {
  return (
    <nav className='navbar navbar-dark bg-primary fixed-top'>
      <Link className='navbar-brand' to='/'>
        Q & A App
      </Link>
    </nav>
  )
}


export default NavBar;
