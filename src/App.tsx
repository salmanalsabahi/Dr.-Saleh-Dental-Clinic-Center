/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ScrollToTop } from './components/ScrollToTop';
import { Home } from './pages/Home';
import { Services } from './pages/Services';
import { Doctors } from './pages/Doctors';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Booking } from './pages/Booking';
import { Profile } from './pages/Profile';
import { Auth } from './pages/Auth';
import { Offers } from './pages/Offers';

// Admin Imports
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminAppointments } from './pages/admin/AdminAppointments';
import { AdminDoctors } from './pages/admin/AdminDoctors';
import { AdminServices } from './pages/admin/AdminServices';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminSiteSettings } from './pages/admin/AdminSiteSettings';
import { AdminOffers } from './pages/admin/AdminOffers';
import { AdminBeforeAfter } from './pages/admin/AdminBeforeAfter';
import { AdminOfferBookings } from './pages/admin/AdminOfferBookings';
import { AdminPasswordResets } from './pages/admin/AdminPasswordResets';
import { AdminMessages } from './pages/admin/AdminMessages';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="services" element={<Services />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="offers" element={<Offers />} />
          <Route path="book" element={<Booking />} />
          <Route path="profile" element={<Profile />} />
          <Route path="auth" element={<Auth />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminAppointments />} />
          <Route path="doctors" element={<AdminDoctors />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="site-settings" element={<AdminSiteSettings />} />
          <Route path="offers" element={<AdminOffers />} />
          <Route path="offer-bookings" element={<AdminOfferBookings />} />
          <Route path="password-resets" element={<AdminPasswordResets />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="before-after" element={<AdminBeforeAfter />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}


