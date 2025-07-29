import { useEffect, useState } from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import ChangePasswordPage from './pages/ChangePasswordPage'
import GuidePage from './pages/GuideManagementPage'
import ImportPage from './pages/ImportPage'
import LoginPage from './pages/LoginPage'
import MainPage from './pages/MainPage'
import QRScanPage from './pages/QRScanPage'
import StatsPage from './pages/StatsPage'
import TourDetails from './pages/TourDetails'

import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

function App() {
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [isAdmin, setIsAdmin] = useState(false)

	console.log('API URL:', process.env.REACT_APP_API_URL)

	const updateUser = async () => {
		try {
			const res = await fetch(`${process.env.REACT_APP_API_URL}/api/Auth/Me`, {
				method: 'GET',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
			})
			if (!res.ok) {
				setIsAuthenticated(false)
				setIsAdmin(false)
				return
			}
			const data = await res.json()
			setIsAuthenticated(true)
			setIsAdmin(data.isAdmin)
		} catch (err) {
			console.error('Error fetching current user:', err)
			setIsAuthenticated(false)
			setIsAdmin(false)
		}
	}

	useEffect(() => {
		updateUser()
	}, [])

	return (
		<Router>
			<Navbar isAuthenticated={isAuthenticated} isAdmin={isAdmin} setIsAuthenticated={setIsAuthenticated} refreshUser={updateUser} />

			<div className='app-content'>
				<Routes>
					<Route path='/' element={<MainPage />} />
					<Route path='/tour/:tourType' element={<TourDetails />} />
					<Route path='/import' element={<ImportPage />} />
					<Route path='/qrscan' element={<QRScanPage />} />
					<Route path='/stats' element={<StatsPage />} />
					<Route path='/guide' element={<GuidePage />} />
					<Route path='/login' element={<LoginPage onLogin={updateUser} />} />
					<Route path='/changepassword' element={<ChangePasswordPage />} />
				</Routes>
			</div>
		</Router>
	)
}

export default App
