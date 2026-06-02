import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { MatrixSearch } from './components/index/MatrixSearch'
import { SkillsMatrix } from './components/colleagueprofile/SkillsMatrix'
import './App.css'
import { SeedData } from './data/SeedData'
import { SeedColleagues } from './data/SeedProfileData'
import { SDTOnlySeedProfileData } from './data/SDTOnlySeedProfileData'

function App() {
  return (
    <Router>
      {/* <SeedData /> */}
      {/* <SeedColleagues /> */}
      {/* <SDTOnlySeedProfileData /> */}
      <Routes>
        <Route path="/" element={<MatrixSearch />} />

        <Route path="/profile/:slug" element={<SkillsMatrix />} />
      </Routes>
    </Router>
  )
}

export default App