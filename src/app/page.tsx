"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Upload, Download, Move, MousePointer, Minus, RotateCcw, Trash2, Link, Type } from 'lucide-react';

const GraphicalAbstractEditor = () => {
  const [elements, setElements] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [tool, setTool] = useState('select'); // 'select', 'connect', 'text'
  const [connectionType, setConnectionType] = useState('arrow'); // 'line', 'arrow', 'double-arrow'
  const [dragStart, setDragStart] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sample organization-approved icons (including scientific elements)
  const orgIcons = [
    { id: 'dna', icon: '🧬', name: 'DNA' },
    { id: 'cell', icon: '🔬', name: 'Cell' },
    { id: 'molecule', icon: '⚛️', name: 'Molecule' },
    { id: 'virus', icon: '🦠', name: 'Virus' },
    { id: 'lab', icon: '🧪', name: 'Lab' },
    { id: 'brain', icon: '🧠', name: 'Brain' },
    { id: 'heart', icon: '❤️', name: 'Heart' },
    { id: 'pill', icon: '💊', name: 'Medicine' },
    { id: 'mouse', icon: '🐭', name: 'Mouse' },
    { id: 'radiation', icon: '☢️', name: 'Radiation' },
    { id: 'syringe', icon: '💉', name: 'Injection' },
    { id: 'calendar', icon: '📅', name: 'Calendar' },
  ];

  const arrowShapes = [
    { id: 'arrow-right', icon: '→', name: 'Right Arrow' },
    { id: 'arrow-left', icon: '←', name: 'Left Arrow' },
    { id: 'arrow-up', icon: '↑', name: 'Up Arrow' },
    { id: 'arrow-down', icon: '↓', name: 'Down Arrow' },
    { id: 'arrow-double', icon: '↔', name: 'Double Arrow' },
    { id: 'arrow-curved', icon: '↻', name: 'Curved Arrow' },
  ];

  const addElement = (iconData, position = null) => {
    const newElement = {
      id: Date.now() + Math.random(),
      type: 'icon',
      content: iconData.icon,
      name: iconData.name,
      x: position ? position.x : 100 + elements.length * 20,
      y: position ? position.y : 100 + elements.length * 20,
      width: 60,
      height: 60,
      rotation: 0,
    };
    setElements([...elements, newElement]);
  };

  const addTextBox = (position = null) => {
    const newElement = {
      id: Date.now() + Math.random(),
      type: 'text',
      content: 'Double click to edit',
      name: 'Text Box',
      x: position ? position.x : 150 + elements.length * 20,
      y: position ? position.y : 150 + elements.length * 20,
      width: 150,
      height: 30,
      fontSize: 14,
      fontWeight: 'normal',
      textAlign: 'left',
      color: '#000000',
      backgroundColor: 'transparent',
      rotation: 0,
      isEditing: false,
    };
    setElements([...elements, newElement]);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = {
          id: Date.now() + Math.random(),
          content: e.target.result,
          name: file.name,
        };
        
        //# Add to uploaded images library
        setUploadedImages(prev => {
          // Check if this image is already in the library (by name)
          const exists = prev.some(img => img.name === file.name);
          if (!exists) {
            return [...prev, imageData];
          }
          return prev;
        });
        
        //# Also add directly to canvas
        const newElement = {
          ...imageData,
          type: 'image',
          x: 100,
          y: 100,
          width: 80,
          height: 80,
          rotation: 0,
        };
        setElements([...elements, newElement]);
      };
      reader.readAsDataURL(file);
    }
  };

  const addUploadedImage = (imageData) => {
    const newElement = {
      id: Date.now() + Math.random(),
      type: 'image',
      content: imageData.content,
      name: imageData.name,
      x: 100 + elements.length * 20,
      y: 100 + elements.length * 20,
      width: 80,
      height: 80,
      rotation: 0,
    };
    setElements([...elements, newElement]);
  };

  const handleElementClick = (e, element) => {
    e.stopPropagation();
    
    if (tool === 'select') {
      setSelectedElement(element);
    } else if (tool === 'connect') {
      if (!connectingFrom) {
        // First click - select the element to connect from
        setConnectingFrom(element);
        setSelectedElement(null); // Clear selection when connecting
      } else if (connectingFrom.id !== element.id) {
        // Second click - create connection if it's a different element
        const newConnection = {
          id: Date.now(),
          from: connectingFrom.id,
          to: element.id,
          type: connectionType,
        };
        setConnections([...connections, newConnection]);
        setConnectingFrom(null); // Reset after connection
      } else {
        //# Clicked the same element - cancel connection
        setConnectingFrom(null);
      }
    }
  };

  const handleElementMouseDown = (e, element) => {
    e.stopPropagation();
    
    if (tool === 'select') {
      setSelectedElement(element);
      setIsDragging(true);
      setDragStart({
        x: e.clientX - element.x * zoom,
        y: e.clientY - element.y * zoom,
      });
    }
  };

  const handleElementDoubleClick = (element) => {
    if (element.type === 'text') {
      setElements(elements.map(el =>
        el.id === element.id
          ? { ...el, isEditing: true }
          : { ...el, isEditing: false }
      ));
    }
  };

  const handleTextChange = (elementId, newText) => {
    setElements(elements.map(el =>
      el.id === elementId
        ? { ...el, content: newText }
        : el
    ));
  };

  const handleTextBlur = (elementId) => {
    setElements(elements.map(el =>
      el.id === elementId
        ? { ...el, isEditing: false }
        : el
    ));
  };

  const handleMouseMove = (e) => {
    if (isDragging && selectedElement && tool === 'select') {
      const newX = (e.clientX - dragStart.x) / zoom;
      const newY = (e.clientY - dragStart.y) / zoom;
      
      setElements(elements.map(el =>
        el.id === selectedElement.id
          ? { ...el, x: newX, y: newY }
          : el
      ));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasClick = (e) => {
    if (tool === 'connect' && connectingFrom) {
      //# If we're in connect mode and have a source selected, cancel on canvas click
      setConnectingFrom(null);
    } else if (tool === 'select') {
      //## Clear selection when clicking empty canvas in select mode
      setSelectedElement(null);
    }
  };

  const deleteElement = (elementId) => {
    setElements(elements.filter(el => el.id !== elementId));
    setConnections(connections.filter(conn => conn.from !== elementId && conn.to !== elementId));
    setSelectedElement(null);
  };

  const updateElement = (elementId, updates) => {
    setElements(elements.map(el =>
      el.id === elementId ? { ...el, ...updates } : el
    ));
    //# Update selectedElement if it's the one being modified
    if (selectedElement && selectedElement.id === elementId) {
      setSelectedElement({ ...selectedElement, ...updates });
    }
  };

  const getElementById = (id) => elements.find(el => el.id === id);

  const getConnectionPath = (connection) => {
    const fromEl = getElementById(connection.from);
    const toEl = getElementById(connection.to);
    if (!fromEl || !toEl) return '';

    // Calculate centers
    const fromCenterX = fromEl.x + fromEl.width / 2;
    const fromCenterY = fromEl.y + fromEl.height / 2;
    const toCenterX = toEl.x + toEl.width / 2;
    const toCenterY = toEl.y + toEl.height / 2;

    // Calculate angle between centers
    const dx = toCenterX - fromCenterX;
    const dy = toCenterY - fromCenterY;
    const angle = Math.atan2(dy, dx);

    //# Calculate edge points (with padding)
    const padding = 8; // Extra space from edge
    const fromRadius = (fromEl.width / 2) + padding;
    const toRadius = (toEl.width / 2) + padding;

    const fromX = fromCenterX + Math.cos(angle) * fromRadius;
    const fromY = fromCenterY + Math.sin(angle) * fromRadius;
    const toX = toCenterX - Math.cos(angle) * toRadius;
    const toY = toCenterY - Math.sin(angle) * toRadius;

    return `M ${fromX} ${fromY} L ${toX} ${toY}`;
  };

  const getMarkerEnd = (connectionType) => {
    switch (connectionType) {
      case 'arrow':
        return 'url(#arrowhead)';
      case 'double-arrow':
        return 'url(#arrowhead)';
      case 'line':
      default:
        return '';
    }
  };

  const getMarkerStart = (connectionType) => {
    return connectionType === 'double-arrow' ? 'url(#arrowhead-start)' : '';
  };

  const exportCanvas = () => {
    const canvas = canvasRef.current;
    const svg = canvas.querySelector('svg');
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'graphical-abstract.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, selectedElement, dragStart, zoom]);

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Graphical Abstract Editor</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={exportCanvas}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Tools */}
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Tools</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setTool('select');
                  setConnectingFrom(null);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  tool === 'select' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <MousePointer size={16} />
                Select
              </button>
              <button
                onClick={() => {
                  setTool('connect');
                  setSelectedElement(null);
                  setConnectingFrom(null);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  tool === 'connect' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Link size={16} />
                Connect
              </button>
              <button
                onClick={() => addTextBox()}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-green-100 text-green-700 hover:bg-green-200 transition-colors col-span-2"
              >
                <Type size={16} />
                Add Text Box
              </button>
            </div>
            
            {/* Connection Types */}
            {tool === 'connect' && (
              <div className="mt-3">
                <h4 className="text-xs font-medium text-gray-700 mb-2">Connection Type</h4>
                <div className="space-y-1">
                  <button
                    onClick={() => setConnectionType('line')}
                    className={`w-full px-2 py-1 text-xs rounded transition-colors ${
                      connectionType === 'line' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    ── Line
                  </button>
                  <button
                    onClick={() => setConnectionType('arrow')}
                    className={`w-full px-2 py-1 text-xs rounded transition-colors ${
                      connectionType === 'arrow' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    ──▶ Arrow
                  </button>
                  <button
                    onClick={() => setConnectionType('double-arrow')}
                    className={`w-full px-2 py-1 text-xs rounded transition-colors ${
                      connectionType === 'double-arrow' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    ◀──▶ Double Arrow
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Upload */}
          <div className="p-4 border-b border-gray-100">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
            >
              <Upload size={20} />
              Upload Icon
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Organization Icons */}
          <div className="flex-1 p-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Organization Icons</label>
                <div className="grid grid-cols-4 gap-3">
                  {orgIcons.map((iconData) => (
                    <button
                      key={iconData.id}
                      onClick={() => addElement(iconData)}
                      className="aspect-square bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-colors flex items-center justify-center text-2xl"
                      title={iconData.name}
                    >
                      {iconData.icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Arrow Shapes</label>
                <div className="grid grid-cols-3 gap-2">
                  {arrowShapes.map((arrowData) => (
                    <button
                      key={arrowData.id}
                      onClick={() => addElement(arrowData)}
                      className="aspect-square bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-colors flex items-center justify-center text-xl"
                      title={arrowData.name}
                    >
                      {arrowData.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Uploaded Images Library */}
              {uploadedImages.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Uploaded Images</label>
                  <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                    {uploadedImages.map((imageData) => (
                      <button
                        key={imageData.id}
                        onClick={() => addUploadedImage(imageData)}
                        className="aspect-square bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-colors flex items-center justify-center overflow-hidden"
                        title={`Add ${imageData.name}`}
                      >
                        <img
                          src={imageData.content}
                          alt={imageData.name}
                          className="w-full h-full object-cover rounded"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Properties Panel */}
          {selectedElement && (
            <div className="p-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Properties</h3>
              <div className="space-y-3">
                {selectedElement.type === 'icon' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Size</label>
                      <input
                        type="range"
                        min="30"
                        max="150"
                        value={selectedElement.width}
                        onChange={(e) => updateElement(selectedElement.id, {
                          width: parseInt(e.target.value),
                          height: parseInt(e.target.value)
                        })}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500 mt-1">{selectedElement.width}px</div>
                    </div>
                  </>
                )}

                {selectedElement.type === 'image' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Width</label>
                      <input
                        type="range"
                        min="30"
                        max="200"
                        value={selectedElement.width}
                        onChange={(e) => updateElement(selectedElement.id, {
                          width: parseInt(e.target.value)
                        })}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500 mt-1">{selectedElement.width}px</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Height</label>
                      <input
                        type="range"
                        min="30"
                        max="200"
                        value={selectedElement.height}
                        onChange={(e) => updateElement(selectedElement.id, {
                          height: parseInt(e.target.value)
                        })}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500 mt-1">{selectedElement.height}px</div>
                    </div>
                  </>
                )}
                
                {selectedElement.type === 'text' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Font Size</label>
                      <input
                        type="range"
                        min="10"
                        max="48"
                        value={selectedElement.fontSize || 14}
                        onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500 mt-1">{selectedElement.fontSize || 14}px</div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Font Weight</label>
                      <select
                        value={selectedElement.fontWeight || 'normal'}
                        onChange={(e) => updateElement(selectedElement.id, { fontWeight: e.target.value })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      >
                        <option value="normal">Normal</option>
                        <option value="bold">Bold</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Text Align</label>
                      <select
                        value={selectedElement.textAlign || 'left'}
                        onChange={(e) => updateElement(selectedElement.id, { textAlign: e.target.value })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Text Color</label>
                      <input
                        type="color"
                        value={selectedElement.color || '#000000'}
                        onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                        className="w-full h-8 rounded"
                      />
                    </div>
                  </>
                )}
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Rotation</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={selectedElement.rotation}
                    onChange={(e) => updateElement(selectedElement.id, { rotation: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1">{selectedElement.rotation}°</div>
                </div>
                <button
                  onClick={() => deleteElement(selectedElement.id)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Canvas Controls */}
          <div className="bg-white border-b border-gray-200 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {tool === 'connect'
                    ? connectingFrom
                      ? `Click another icon to connect from "${connectingFrom.name}"`
                      : 'Click an icon to start connecting'
                    : 'Select and drag to move icons'
                  }
                </span>
                {connectingFrom && (
                  <button
                    onClick={() => setConnectingFrom(null)}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Cancel Connection
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <Minus size={16} />
                </button>
                <span className="text-sm text-gray-600 min-w-12 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <Plus size={16} />
                </button>
                <button
                  onClick={() => setZoom(1)}
                  className="p-1 rounded hover:bg-gray-100"
                  title="Reset Zoom"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div
            ref={canvasRef}
            className="flex-1 overflow-hidden bg-white relative cursor-crosshair"
            onClick={handleCanvasClick}
          >
            <svg
              width="100%"
              height="100%"
              className="absolute inset-0"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
            >
              {/* Grid Pattern */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                </pattern>
                {/* Arrow markers */}
                <marker id="arrowhead" markerWidth="10" markerHeight="7"
                        refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                </marker>
                <marker id="arrowhead-start" markerWidth="10" markerHeight="7"
                        refX="1" refY="3.5" orient="auto">
                  <polygon points="10 0, 0 3.5, 10 7" fill="#3b82f6" />
                </marker>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Connections */}
              {connections.map((connection) => (
                <path
                  key={connection.id}
                  d={getConnectionPath(connection)}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  markerEnd={getMarkerEnd(connection.type)}
                  markerStart={getMarkerStart(connection.type)}
                />
              ))}

              {/* Elements */}
              {elements.map((element) => (
                <g key={element.id}>
                  {element.type === 'icon' ? (
                    <text
                      x={element.x + element.width / 2}
                      y={element.y + element.height / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={element.width * 0.6}
                      className={`cursor-pointer select-none ${
                        selectedElement?.id === element.id ? 'opacity-80' : ''
                      }`}
                      transform={`rotate(${element.rotation}, ${element.x + element.width / 2}, ${element.y + element.height / 2})`}
                      onClick={(e) => handleElementClick(e, element)}
                      onMouseDown={(e) => handleElementMouseDown(e, element)}
                    >
                      {element.content}
                    </text>
                  ) : element.type === 'text' ? (
                    element.isEditing ? (
                      <foreignObject
                        x={element.x}
                        y={element.y}
                        width={element.width}
                        height={element.height}
                      >
                        <input
                          type="text"
                          value={element.content}
                          onChange={(e) => handleTextChange(element.id, e.target.value)}
                          onBlur={() => handleTextBlur(element.id)}
                          autoFocus
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            outline: 'none',
                            background: 'transparent',
                            fontSize: `${element.fontSize}px`,
                            fontWeight: element.fontWeight,
                            textAlign: element.textAlign,
                            color: element.color,
                          }}
                        />
                      </foreignObject>
                    ) : (
                      <text
                        x={element.x + (element.textAlign === 'center' ? element.width / 2 : element.textAlign === 'right' ? element.width : 0)}
                        y={element.y + element.height / 2}
                        textAnchor={element.textAlign === 'center' ? 'middle' : element.textAlign === 'right' ? 'end' : 'start'}
                        dominantBaseline="middle"
                        fontSize={element.fontSize}
                        fontWeight={element.fontWeight}
                        fill={element.color}
                        className={`cursor-pointer select-none ${
                          selectedElement?.id === element.id ? 'opacity-80' : ''
                        }`}
                        transform={`rotate(${element.rotation}, ${element.x + element.width / 2}, ${element.y + element.height / 2})`}
                        onClick={(e) => handleElementClick(e, element)}
                        onMouseDown={(e) => handleElementMouseDown(e, element)}
                        onDoubleClick={() => handleElementDoubleClick(element)}
                      >
                        {element.content}
                      </text>
                    )
                  ) : (
                    <image
                      x={element.x}
                      y={element.y}
                      width={element.width}
                      height={element.height}
                      href={element.content}
                      className={`cursor-pointer ${
                        selectedElement?.id === element.id ? 'opacity-80' : ''
                      }`}
                      transform={`rotate(${element.rotation}, ${element.x + element.width / 2}, ${element.y + element.height / 2})`}
                      onClick={(e) => handleElementClick(e, element)}
                      onMouseDown={(e) => handleElementMouseDown(e, element)}
                    />
                  )}
                  
                  {/* Selection indicator */}
                  {selectedElement?.id === element.id && tool === 'select' && (
                    <rect
                      x={element.x - 5}
                      y={element.y - 5}
                      width={element.width + 10}
                      height={element.height + 10}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      rx="4"
                    />
                  )}
                  
                  {/* Connection source indicator */}
                  {connectingFrom?.id === element.id && (
                    <rect
                      x={element.x - 5}
                      y={element.y - 5}
                      width={element.width + 10}
                      height={element.height + 10}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      rx="4"
                    />
                  )}
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphicalAbstractEditor;
