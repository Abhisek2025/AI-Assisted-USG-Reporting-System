// src/components/USGImageViewer.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  Sun,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Eye,
  Ruler,
  RefreshCw
} from 'lucide-react';

export default function USGImageViewer({ images = [], initialIndex = 0 }) {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [invert, setInvert] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [measurementMode, setMeasurementMode] = useState(false);
  const [measurements, setMeasurements] = useState([]);
  const [currentLine, setCurrentLine] = useState(null);

  const containerRef = useRef(null);

  const currentImage = images[selectedIndex] || {
    file_path: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop&q=80',
    file_name: 'usg_frame.jpg'
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setInvert(false);
    setMeasurements([]);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseDown = (e) => {
    if (!measurementMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentLine({ x1: x, y1: y, x2: x, y2: y });
  };

  const handleMouseMove = (e) => {
    if (!measurementMode || !currentLine) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentLine(prev => ({ ...prev, x2: x, y2: y }));
  };

  const handleMouseUp = () => {
    if (!measurementMode || !currentLine) return;
    const dx = currentLine.x2 - currentLine.x1;
    const dy = currentLine.y2 - currentLine.y1;
    const distPx = Math.sqrt(dx * dx + dy * dy);
    const mmVal = (distPx * 0.12).toFixed(1); // Calibration factor ~ 0.12mm/px

    setMeasurements(prev => [...prev, { ...currentLine, distance: `${mmVal} mm` }]);
    setCurrentLine(null);
  };

  return (
    <div ref={containerRef} className="bg-slate-950 text-slate-100 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full border border-slate-800">
      
      {/* Top Controls Toolbar */}
      <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="flex items-center space-x-1">
          <button onClick={handleZoomIn} title="Zoom In (+)" className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={handleZoomOut} title="Zoom Out (-)" className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono text-slate-400 px-1">{Math.round(zoom * 100)}%</span>
          <button onClick={handleRotate} title="Rotate 90°" className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors ml-2">
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setInvert(!invert)}
            title="Invert Contrast"
            className={`p-1.5 rounded transition-colors ${invert ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMeasurementMode(!measurementMode)}
            title="Caliper Measurement Tool"
            className={`p-1.5 rounded transition-colors ${measurementMode ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            <Ruler className="w-4 h-4" />
          </button>
          <button onClick={handleReset} title="Reset View" className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Sliders */}
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-2">
            <Sun className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="range"
              min="50"
              max="180"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="range"
              min="50"
              max="200"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Fullscreen & Frame Info */}
        <div className="flex items-center space-x-3">
          <span className="text-[11px] text-slate-400 font-mono">
            Frame {selectedIndex + 1} / {images.length || 1}
          </span>
          <button onClick={toggleFullscreen} className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors">
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Canvas / Image Viewing Stage */}
      <div
        className="relative flex-1 bg-black flex items-center justify-center overflow-hidden cursor-crosshair min-h-[360px]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <img
          src={currentImage.file_path}
          alt={currentImage.file_name}
          className="max-h-[500px] max-w-full object-contain transition-transform duration-100 select-none pointer-events-none"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            filter: `brightness(${brightness}%) contrast(${contrast}%) ${invert ? 'invert(100%)' : ''}`
          }}
        />

        {/* On-Image Caliper Overlay Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {measurements.map((m, idx) => (
            <g key={idx}>
              <line x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2} stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
              <circle cx={m.x1} cy={m.y1} r="3" fill="#f59e0b" />
              <circle cx={m.x2} cy={m.y2} r="3" fill="#f59e0b" />
              <text x={(m.x1 + m.x2) / 2 + 5} y={(m.y1 + m.y2) / 2 - 5} fill="#f59e0b" fontSize="11" fontWeight="bold">
                [{idx + 1}] {m.distance}
              </text>
            </g>
          ))}
          {currentLine && (
            <line x1={currentLine.x1} y1={currentLine.y1} x2={currentLine.x2} y2={currentLine.y2} stroke="#3b82f6" strokeWidth="2" />
          )}
        </svg>

        {/* Previous / Next Arrow Controls */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setSelectedIndex(prev => (prev > 0 ? prev - 1 : images.length - 1))}
              className="absolute left-2 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors border border-slate-700"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSelectedIndex(prev => (prev < images.length - 1 ? prev + 1 : 0))}
              className="absolute right-2 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors border border-slate-700"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Active Tool Badge */}
        {measurementMode && (
          <div className="absolute top-3 left-3 bg-amber-500/90 text-slate-950 px-2.5 py-1 rounded text-xs font-bold shadow-md">
            Caliper Active: Click & Drag to measure distance
          </div>
        )}
      </div>

      {/* Thumbnail Navigation Carousel */}
      {images.length > 1 && (
        <div className="bg-slate-900 p-2 border-t border-slate-800 flex items-center space-x-2 overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative rounded-lg overflow-hidden flex-shrink-0 w-16 h-12 border-2 transition-all ${
                selectedIndex === idx ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-slate-800 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img.file_path} alt="" className="w-full h-full object-cover" />
              <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-[9px] text-white px-1 font-mono rounded">
                #{idx + 1}
              </span>
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
