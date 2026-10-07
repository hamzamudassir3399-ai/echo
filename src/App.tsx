/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { Header } from './components/Header';
import { AndroidDeviceFrame } from './components/AndroidDeviceFrame';
import { LegalDisclaimerModal } from './components/LegalDisclaimerModal';
import { StorageDiscoveryModal } from './components/StorageDiscoveryModal';

export default function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
          {/* Top Bar Contract compliant header */}
          <Header />

          {/* Core application body (Pixel 9 Frame or Adaptive Desktop) */}
          <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
            <AndroidDeviceFrame />
          </main>

          {/* Legal & Anti-Piracy Compliance Notice Modal */}
          <LegalDisclaimerModal />

          {/* Permissions-Conscious Local Audio Discovery Modal */}
          <StorageDiscoveryModal />
        </div>
      </PlayerProvider>
    </AuthProvider>
  );
}
