import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Stories from './pages/Stories';
import StoryDetail from './pages/StoryDetail';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import YourStories from './pages/YourStories';
import StoryEditor from './pages/StoryEditor';
import AllStories from './pages/AllStories';
import TopicsManage from './pages/TopicsManage';
import TagsManage from './pages/TagsManage';
import MediaLibrary from './pages/MediaLibrary';
import CommentsManage from './pages/CommentsManage';
import MembersManage from './pages/MembersManage';
import Insights from './pages/Insights';
import NotFound from './pages/NotFound';

export const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-canvas text-ink">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/stories" element={<Stories />} />
              <Route path="/story/:slug" element={<StoryDetail />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/sign-up" element={<SignUp />} />

              {/* Writer & Staff routes */}
              <Route
                path="/your-stories"
                element={
                  <ProtectedRoute allowedRoles={['author', 'editor', 'admin']}>
                    <YourStories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/write"
                element={
                  <ProtectedRoute allowedRoles={['author', 'editor', 'admin']}>
                    <StoryEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit/:id"
                element={
                  <ProtectedRoute allowedRoles={['author', 'editor', 'admin']}>
                    <StoryEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/editorial/media"
                element={
                  <ProtectedRoute allowedRoles={['author', 'editor', 'admin']}>
                    <MediaLibrary />
                  </ProtectedRoute>
                }
              />

              {/* Editor & Admin routes */}
              <Route
                path="/all-stories"
                element={
                  <ProtectedRoute allowedRoles={['editor', 'admin']}>
                    <AllStories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/editorial/topics"
                element={
                  <ProtectedRoute allowedRoles={['editor', 'admin']}>
                    <TopicsManage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/editorial/tags"
                element={
                  <ProtectedRoute allowedRoles={['editor', 'admin']}>
                    <TagsManage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/editorial/comments"
                element={
                  <ProtectedRoute allowedRoles={['editor', 'admin']}>
                    <CommentsManage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/insights"
                element={
                  <ProtectedRoute allowedRoles={['editor', 'admin']}>
                    <Insights />
                  </ProtectedRoute>
                }
              />

              {/* Admin only routes */}
              <Route
                path="/members"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <MembersManage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
