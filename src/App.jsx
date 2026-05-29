import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DndContext, pointerWithin } from '@dnd-kit/core';
import { useKit } from './context/KitContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HeroRigAnimation from './components/HeroRigAnimation';
import LatestArrivals from './components/LatestArrivals';
import CategoryGrid from './components/CategoryGrid';
import KitBuilderSidebar from './components/KitBuilderSidebar';
import ShopPortal from './components/ShopPortal';
import LiveChat from './components/LiveChat';
import OperationalVideo from './components/OperationalVideo';
import RentalForm from './components/RentalForm';

function Home() {
  return (
    <>
      <HeroRigAnimation />
      <LatestArrivals />
      <CategoryGrid />
      <OperationalVideo />
      <RentalForm />
    </>
  );
}

function App() {
  const { addToKit } = useKit();

  const handleDragEnd = (event) => {
    const { over, active } = event;
    if (over && over.id === 'kit-sidebar') {
      const item = active.data.current;
      if (item) {
        addToKit(item); // addToKit now calls showToast internally
      }
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd} collisionDetection={pointerWithin}>
      <div className="app-container">
        <Navbar />

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<ShopPortal />} />
          </Routes>
        </main>

        <KitBuilderSidebar />
        <LiveChat />
      </div>
    </DndContext>
  );
}

export default App;
