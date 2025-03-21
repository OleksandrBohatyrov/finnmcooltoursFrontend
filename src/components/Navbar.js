import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/cropped-Finn_Logo-2-1-260x49.png'
import '../styles/Navbar.css'

function NavbarBootstrap({ token, setToken }) {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	const navRef = useRef(null)

	const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen)

	const handleLogout = () => {
		setToken(null)
	}

	const handleDocClick = e => {
		if (mobileMenuOpen && navRef.current && !navRef.current.contains(e.target)) {
			setMobileMenuOpen(false)
		}
	}

	useEffect(() => {
		document.addEventListener('mousedown', handleDocClick)
		return () => {
			document.removeEventListener('mousedown', handleDocClick)
		}
	}, [mobileMenuOpen])

	const handleLinkClick = () => {
		setMobileMenuOpen(false)
	}

	return (
		<nav className='navbar navbar-expand-lg navbar-dark bg-dark' ref={navRef}>
			<div className='container-fluid'>
				{/* Logo on the left */}
				<Link className='navbar-brand d-flex align-items-center' to='/' onClick={handleLinkClick}>
					<img src={logo} alt='Company Logo' style={{ height: '40px', width: 'auto', marginRight: '8px' }} />
				</Link>

				{/* Burger menu button for mobile*/}
				<button
					className='navbar-toggler'
					type='button'
					onClick={toggleMenu}
					aria-controls='navbarSupportedContent'
					aria-expanded={mobileMenuOpen ? 'true' : 'false'}
					aria-label='Toggle navigation'
				>
					<span className='navbar-toggler-icon'></span>
				</button>

				<div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`} id='navbarSupportedContent'>
					<ul className='navbar-nav ms-auto mb-2 mb-lg-0'>
						<li className='nav-item'>
							<Link className='nav-link' to='/' onClick={handleLinkClick}>
								Home
							</Link>
						</li>
						<li className='nav-item'>
							<Link className='nav-link' to='/import' onClick={handleLinkClick}>
								Import Excel
							</Link>
						</li>
						<li className='nav-item'>
							<Link className='nav-link' to='/stats' onClick={handleLinkClick}>
								Stats
							</Link>
						</li>

						{token ? (
							<>
								<li className='nav-item'>
									<Link className='nav-link' to='/changepassword' onClick={handleLinkClick}>
										Change Password
									</Link>
								</li>
								<li className='nav-item'>
									<button
										className='btn nav-link'
										style={{ color: '#fff' }}
										onClick={() => {
											handleLogout()
											handleLinkClick()
										}}
									>
										Logout
									</button>
								</li>
							</>
						) : (
							<li className='nav-item'>
								<Link className='nav-link' to='/login' onClick={handleLinkClick}>
									Login
								</Link>
							</li>
						)}
					</ul>
				</div>
			</div>
		</nav>
	)
}

export default NavbarBootstrap
