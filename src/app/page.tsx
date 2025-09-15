"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Upload, Download, Move, MousePointer, Minus, RotateCcw, Trash2, Link, Type, Clock } from 'lucide-react';

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

  // Scientific images from public folder
  const scientificImages = [
    { id: 'nasa-logo', path: '/images/NASA_Logo.svg', name: 'NASA Logo' },
    { id: 'iss-logo', path: '/images/ISS.png', name: 'ISS' },
    { id: 'BrownMouse', path: '/images/Brown_mouse.png', name: 'BrMouse' },
    { id: 'MHU', path: '/images/MHU.png', name: 'MHU' },
    { id: 'CellCulture', path: '/images/CellCulture.png', name: 'CellCulture' },
    { id: 'Agar', path: '/images/AgarPlate.png', name: 'Agar' },
    { id: 'UCLA', path: '/images/UCLA.png', name: 'UCLA' },
    { id: 'NASA_KSC', path: '/images/NASAKennedy.png', name: 'NASA_KSC' },
    { id: 'Mouse_Tissue', path: '/images/Mouse_Tissue.png', name: 'Mouse_Tissue' },
    // Add more images here as you add them to the public/images folder
    // { id: 'iss', path: '/images/ISS.svg', name: 'ISS' },
    // { id: 'microscope', path: '/images/microscope.svg', name: 'Microscope' },
    // { id: 'dna-helix', path: '/images/dna_helix.svg', name: 'DNA Helix' },
    // { id: 'petri-dish', path: '/images/petri_dish.svg', name: 'Petri Dish' },
    // { id: 'rocket', path: '/images/rocket.svg', name: 'Rocket' },
    // { id: 'satellite', path: '/images/satellite.svg', name: 'Satellite' },
    // { id: 'astronaut', path: '/images/astronaut.svg', name: 'Astronaut' },
    // { id: 'cell-diagram', path: '/images/cell_diagram.svg', name: 'Cell Diagram' },
    // { id: 'lab-equipment', path: '/images/lab_equipment.svg', name: 'Lab Equipment' },
  ];

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

  const addScientificImage = (imageData, position = null) => {
    const newElement = {
      id: Date.now() + Math.random(),
      type: 'scientific-image',
      content: imageData.path,
      name: imageData.name,
      x: position ? position.x : 100 + elements.length * 20,
      y: position ? position.y : 100 + elements.length * 20,
      width: 80,
      height: 80,
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

  const addTimelineMarker = (x, label) => {
    const lineId = Date.now() + Math.random();
    const textId = lineId + 1;
    
    // Add vertical line
    const line = {
      id: lineId,
      type: 'timeline-line',
      x: x,
      y: 50,
      width: 2,
      height: 350,
      color: '#9CA3AF',
      name: 'Timeline Marker',
    };
    
    // Add label above line
    const text = {
      id: textId,
      type: 'timeline-text',
      content: label,
      name: 'Timeline Label',
      x: x - 30,
      y: 25,
      width: 80,
      height: 25,
      fontSize: 12,
      fontWeight: 'normal',
      textAlign: 'center',
      color: '#4B5563',
      backgroundColor: 'transparent',
      rotation: 0,
      isEditing: false,
      associatedLine: lineId,
    };
    
    return [line, text];
  };

  const addTimeline = () => {
    const canvasWidth = 800; // Approximate canvas width
    const spacing = canvasWidth / 5; // Divide into 5 sections for 4 markers
    const newTimelineElements = [];
    
    for (let i = 1; i <= 4; i++) {
      const x = spacing * i;
      const label = `Week ${i * 10}`;
      newTimelineElements.push(...addTimelineMarker(x, label));
    }
    
    setElements([...elements, ...newTimelineElements]);
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
        
        setUploadedImages(prev => {
          const exists = prev.some(img => img.name === file.name);
          if (!exists) {
            return [...prev, imageData];
          }
          return prev;
        });
        
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
    } else if (tool === 'connect' && element.type !== 'timeline-line' && element.type !== 'timeline-text') {
      if (!connectingFrom) {
        setConnectingFrom(element);
        setSelectedElement(null);
      } else if (connectingFrom.id !== element.id) {
        const newConnection = {
          id: Date.now(),
          from: connectingFrom.id,
          to: element.id,
          type: connectionType,
        };
        setConnections([...connections, newConnection]);
        setConnectingFrom(null);
      } else {
        setConnectingFrom(null);
      }
    }
  };

  const handleElementMouseDown = (e, element) => {
    e.stopPropagation();
    
    if (tool === 'select') {
      setSelectedElement(element);
      setIsDragging(true);
      
      // For timeline lines, adjust drag start for center position
      if (element.type === 'timeline-line') {
        setDragStart({
          x: e.clientX - element.x * zoom,
          y: e.clientY - element.y * zoom,
        });
      } else {
        setDragStart({
          x: e.clientX - element.x * zoom,
          y: e.clientY - element.y * zoom,
        });
      }
    }
  };

  const handleElementDoubleClick = (element) => {
    if (element.type === 'text' || element.type === 'timeline-text') {
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
      
      if (selectedElement.type === 'timeline-line') {
        // For timeline lines, only update X position
        setElements(elements.map(el => {
          if (el.id === selectedElement.id) {
            return { ...el, x: newX };
          }
          // Also move associated text if this is a timeline line
          if (el.type === 'timeline-text' && el.associatedLine === selectedElement.id) {
            return { ...el, x: newX - 30 }; // Center text above line
          }
          return el;
        }));
      } else if (selectedElement.type === 'timeline-text') {
        // When moving timeline text, also move its associated line
        setElements(elements.map(el => {
          if (el.id === selectedElement.id) {
            return { ...el, x: newX, y: newY };
          }
          if (el.type === 'timeline-line' && selectedElement.associatedLine === el.id) {
            return { ...el, x: newX + 30 }; // Adjust line position based on text
          }
          return el;
        }));
      } else {
        // Regular element movement
        setElements(elements.map(el =>
          el.id === selectedElement.id
            ? { ...el, x: newX, y: newY }
            : el
        ));
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasClick = (e) => {
    if (tool === 'connect' && connectingFrom) {
      setConnectingFrom(null);
    } else if (tool === 'select') {
      setSelectedElement(null);
    }
  };

  const deleteElement = (elementId) => {
    const element = elements.find(el => el.id === elementId);
    
    // If deleting a timeline line, also delete its associated text
    if (element && element.type === 'timeline-line') {
      setElements(elements.filter(el =>
        el.id !== elementId && !(el.type === 'timeline-text' && el.associatedLine === elementId)
      ));
    }
    // If deleting timeline text, also delete its associated line
    else if (element && element.type === 'timeline-text' && element.associatedLine) {
      setElements(elements.filter(el =>
        el.id !== elementId && el.id !== element.associatedLine
      ));
    }
    // Regular deletion
    else {
      setElements(elements.filter(el => el.id !== elementId));
    }
    
    setConnections(connections.filter(conn => conn.from !== elementId && conn.to !== elementId));
    setSelectedElement(null);
  };

  const updateElement = (elementId, updates) => {
    setElements(elements.map(el =>
      el.id === elementId ? { ...el, ...updates } : el
    ));
    if (selectedElement && selectedElement.id === elementId) {
      setSelectedElement({ ...selectedElement, ...updates });
    }
  };

  const getElementById = (id) => elements.find(el => el.id === id);

  const getConnectionPath = (connection) => {
    const fromEl = getElementById(connection.from);
    const toEl = getElementById(connection.to);
    if (!fromEl || !toEl) return '';

    const fromCenterX = fromEl.x + fromEl.width / 2;
    const fromCenterY = fromEl.y + fromEl.height / 2;
    const toCenterX = toEl.x + toEl.width / 2;
    const toCenterY = toEl.y + toEl.height / 2;

    const dx = toCenterX - fromCenterX;
    const dy = toCenterY - fromCenterY;
    const angle = Math.atan2(dy, dx);

    const padding = 8;
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

  // Templates with timeline
  const templates = {
    groundRadiation: {
      elements: [
        { id: 1, type: 'text', content: '(Experimental Title)', name: 'Title', x: 300, y: 0, width: 300, height: 40, fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#000' },

        // Timeline markers
        { id: 1001, type: 'timeline-line', x: 250, y: 50, width: 2, height: 350, color: '#9CA3AF', name: 'Timeline Marker' },
        { id: 1002, type: 'timeline-text', content: 'Week 0', name: 'Timeline Label', x: 209, y: 30, width: 80, height: 25, fontSize: 12, fontWeight: 'normal', textAlign: 'center', color: '#4B5563', backgroundColor: 'transparent', rotation: 0, isEditing: false, associatedLine: 1001 },
        
        { id: 1003, type: 'timeline-line', x: 375, y: 50, width: 2, height: 350, color: '#9CA3AF', name: 'Timeline Marker' },
        { id: 1004, type: 'timeline-text', content: 'Week 10', name: 'Timeline Label', x: 334, y: 30, width: 80, height: 25, fontSize: 12, fontWeight: 'normal', textAlign: 'center', color: '#4B5563', backgroundColor: 'transparent', rotation: 0, isEditing: false, associatedLine: 1003 },
        
        { id: 1005, type: 'timeline-line', x: 500, y: 50, width: 2, height: 350, color: '#9CA3AF', name: 'Timeline Marker' },
        { id: 1006, type: 'timeline-text', content: 'Week 20', name: 'Timeline Label', x: 459, y: 30, width: 80, height: 25, fontSize: 12, fontWeight: 'normal', textAlign: 'center', color: '#4B5563', backgroundColor: 'transparent', rotation: 0, isEditing: false, associatedLine: 1005 },
        
        { id: 1007, type: 'timeline-line', x: 625, y: 50, width: 2, height: 350, color: '#9CA3AF', name: 'Timeline Marker' },
        { id: 1008, type: 'timeline-text', content: 'Week 25', name: 'Timeline Label', x: 584, y: 30, width: 80, height: 25, fontSize: 12, fontWeight: 'normal', textAlign: 'center', color: '#4B5563', backgroundColor: 'transparent', rotation: 0, isEditing: false, associatedLine: 1007 },

        // Groups
        { id: 2, type: 'text', content: 'Group 1: Sham', name: 'Sham', x: 50, y: 100, width: 180, height: 30, fontSize: 14, textAlign: 'left', color: '#000' },
        { id: 3, type: 'text', content: 'Group 2: 350 MeV/u Oxygen', name: 'Rad1', x: 50, y: 150, width: 240, height: 30, fontSize: 14, textAlign: 'left', color: '#000' },
        { id: 4, type: 'text', content: 'Group 3: 350 MeV/u Oxygen', name: 'Rad2', x: 50, y: 200, width: 240, height: 30, fontSize: 14, textAlign: 'left', color: '#000' },
        { id: 5, type: 'text', content: 'Group 4: 350 MeV/u Oxygen', name: 'Rad3', x: 50, y: 250, width: 240, height: 30, fontSize: 14, textAlign: 'left', color: '#000' },

        // Icons
        { id: 20, type: 'icon', content: '🧪', name: 'Lab', x: 700, y: 90, width: 50, height: 50, rotation: 0 },
        { id: 21, type: 'icon', content: '🧪', name: 'Lab', x: 700, y: 140, width: 50, height: 50, rotation: 0 },
        { id: 22, type: 'icon', content: '🧪', name: 'Lab', x: 700, y: 190, width: 50, height: 50, rotation: 0 },
        { id: 23, type: 'icon', content: '🧪', name: 'Lab', x: 700, y: 240, width: 50, height: 50, rotation: 0 },
        { id: 7, type: 'icon', content: '🐭', name: 'Mouse', x: 30, y: 320, width: 50, height: 50, rotation: 0 },
        { id: 8, type: 'icon', content: '☢️', name: 'Radiation', x: 30, y: 50, width: 50, height: 40, rotation: 0 },
        
        // Metadata text boxes
        { id: 40, type: 'text', content: 'Irradiation Facility: LBNL', name: 'Facility', x: 50, y: 410, width: 250, height: 25, fontSize: 12, textAlign: 'left', color: '#4B5563' },
        { id: 41, type: 'text', content: 'Space Organization: NASA/CASIS', name: 'Organization', x: 50, y: 445, width: 250, height: 25, fontSize: 12, textAlign: 'left', color: '#4B5563' },
        { id: 42, type: 'text', content: 'Conditions: Radiation, etc', name: 'Conditions', x: 320, y: 410, width: 250, height: 25, fontSize: 12, textAlign: 'left', color: '#4B5563' },
        { id: 43, type: 'text', content: 'Duration: 30 days', name: 'Duration', x: 320, y: 445, width: 250, height: 25, fontSize: 12, textAlign: 'left', color: '#4B5563' },
        
        // Harvest label
        { id: 6, type: 'text', content: 'Tissue Harvest', name: 'Harvest', x: 680, y: 60, width: 120, height: 30, fontSize: 14, fontWeight: 'bold', textAlign: 'left', color: '#000' },
      ],
      connections: [
        { id: 101, from: 2, to: 20, type: 'arrow' },
        { id: 102, from: 3, to: 21, type: 'arrow' },
        { id: 103, from: 4, to: 22, type: 'arrow' },
        { id: 104, from: 5, to: 23, type: 'arrow' },
      ],
    },

    spaceflight: {
      elements: [
        { id: 10, type: 'text', content: '(Enter Title) Rodent Spaceflight Experiment', name: 'Title', x: 250, y: 0, width: 350, height: 40, fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#000' },

        // Timeline markers
        { id: 2001, type: 'timeline-line', x: 250, y: 60, width: 2, height: 350, color: '#9CA3AF', name: 'Timeline Marker' },
        { id: 2002, type: 'timeline-text', content: 'Launch', name: 'Timeline Label', x: 209, y: 35, width: 80, height: 25, fontSize: 12, fontWeight: 'normal', textAlign: 'center', color: '#4B5563', backgroundColor: 'transparent', rotation: 0, isEditing: false, associatedLine: 2001 },
        
        { id: 2003, type: 'timeline-line', x: 350, y: 60, width: 2, height: 350, color: '#9CA3AF', name: 'Timeline Marker' },
        { id: 2004, type: 'timeline-text', content: 'Day 15', name: 'Timeline Label', x: 309, y: 35, width: 80, height: 25, fontSize: 12, fontWeight: 'normal', textAlign: 'center', color: '#4B5563', backgroundColor: 'transparent', rotation: 0, isEditing: false, associatedLine: 2003 },
        
        { id: 2005, type: 'timeline-line', x: 450, y: 60, width: 2, height: 350, color: '#9CA3AF', name: 'Timeline Marker' },
        { id: 2006, type: 'timeline-text', content: 'Day 30', name: 'Timeline Label', x: 409, y: 35, width: 80, height: 25, fontSize: 12, fontWeight: 'normal', textAlign: 'center', color: '#4B5563', backgroundColor: 'transparent', rotation: 0, isEditing: false, associatedLine: 2005 },
        
        { id: 2007, type: 'timeline-line', x: 550, y: 60, width: 2, height: 350, color: '#9CA3AF', name: 'Timeline Marker' },
        { id: 2008, type: 'timeline-text', content: 'Return', name: 'Timeline Label', x: 509, y: 35, width: 80, height: 25, fontSize: 12, fontWeight: 'normal', textAlign: 'center', color: '#4B5563', backgroundColor: 'transparent', rotation: 0, isEditing: false, associatedLine: 2007 },

        // Groups
        { id: 11, type: 'text', content: 'Flight Group (ISS)', name: 'Flight', x: 50, y: 120, width: 200, height: 30, fontSize: 14, textAlign: 'left', color: '#000' },
        { id: 12, type: 'text', content: 'Ground Control', name: 'Ground', x: 50, y: 170, width: 200, height: 30, fontSize: 14, textAlign: 'left', color: '#000' },
        { id: 13, type: 'text', content: 'Basal Control', name: 'Basal', x: 50, y: 220, width: 200, height: 30, fontSize: 14, textAlign: 'left', color: '#000' },
        { id: 16, type: 'text', content: 'Vivarium Control', name: 'Vivarium', x: 50, y: 270, width: 200, height: 30, fontSize: 14, textAlign: 'left', color: '#000' },

        // NASA KSC icons (positioned before lab icons)
        { id: 40, type: 'scientific-image', content: '/images/NASAKennedy.png', name: 'NASA_KSC', x: 560, y: 105, width: 60, height: 60, rotation: 0 },
        { id: 41, type: 'scientific-image', content: '/images/NASAKennedy.png', name: 'NASA_KSC', x: 560, y: 155, width: 60, height: 60, rotation: 0 },

        // Mouse Tissue Icons (positioned after KSC for flight and ground control)
        { id: 30, type: 'scientific-image', content: '/images/Mouse_Tissue.png', name: 'Mouse_Tissue', x: 700, y: 110, width: 50, height: 50, rotation: 0 },
        { id: 31, type: 'scientific-image', content: '/images/Mouse_Tissue.png', name: 'Mouse_Tissue', x: 700, y: 160, width: 50, height: 50, rotation: 0 },
        { id: 32, type: 'scientific-image', content: '/images/Mouse_Tissue.png', name: 'Mouse_Tissue', x: 240, y: 210, width: 50, height: 50, rotation: 0 }, // Basal - early termination
        
        // UCLA icon for Vivarium
        { id: 33, type: 'scientific-image', content: '/images/UCLA.png', name: 'UCLA', x: 400, y: 255, width: 60, height: 60, rotation: 0 },
        { id: 34, type: 'scientific-image', content: '/images/Mouse_Tissue.png', name: 'Mouse_Tissue', x: 500, y: 260, width: 50, height: 50, rotation: 0 }, // Vivarium lab

        // ISS icon
        { id: 15, type: 'scientific-image', content: '/images/ISS.png', name: 'ISS', x: 180, y: 105, width: 60, height: 60, rotation: 0 },
        
        // Mouse icons
        { id: 7, type: 'scientific-image', content: '/images/Brown_mouse.png', name: 'BrMouse', x: 50, y: 320, width: 120, height: 50, rotation: 0 },

        // Metadata text boxes
        { id: 50, type: 'text', content: 'Launch Vehicle: SpaceX Dragon', name: 'Vehicle', x: 50, y: 410, width: 250, height: 25, fontSize: 12, textAlign: 'left', color: '#4B5563' },
        { id: 51, type: 'text', content: 'Space Organization: NASA/CASIS', name: 'Organization', x: 50, y: 445, width: 250, height: 25, fontSize: 12, textAlign: 'left', color: '#4B5563' },
        { id: 52, type: 'text', content: 'Conditions: Microgravity, Radiation', name: 'Conditions', x: 320, y: 410, width: 250, height: 25, fontSize: 12, textAlign: 'left', color: '#4B5563' },
        { id: 53, type: 'text', content: 'Duration: 30 days', name: 'Duration', x: 320, y: 445, width: 250, height: 25, fontSize: 12, textAlign: 'left', color: '#4B5563' },

        // Harvest label
        { id: 14, type: 'text', content: 'Tissue Harvest', name: 'Harvest', x: 680, y: 60, width: 120, height: 30, fontSize: 14, fontWeight: 'bold', textAlign: 'left', color: '#000' },
      ],
      connections: [
        // Flight group: ISS -> KSC -> Lab
        { id: 201, from: 11, to: 40, type: 'arrow' },
        { id: 205, from: 40, to: 30, type: 'arrow' },
        
        // Ground control: -> KSC -> Lab
        { id: 202, from: 12, to: 41, type: 'arrow' },
        { id: 206, from: 41, to: 31, type: 'arrow' },
        
        // Basal: immediate to lab (at launch)
        
        // Vivarium: -> UCLA -> Lab (at day 30)
        { id: 204, from: 16, to: 33, type: 'arrow' },
        { id: 207, from: 33, to: 34, type: 'arrow' },
      ],
    },
  };

  const loadTemplate = (templateName) => {
    const template = templates[templateName];
    if (template) {
      setElements(template.elements);
      setConnections(template.connections);
      setSelectedElement(null);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">SciPad</h1>
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
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
              >
                <Type size={16} />
                Add Text Box
              </button>
              <button
                onClick={addTimeline}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
              >
                <Clock size={16} />
                Add Timeline
              </button>
            </div>
          
          {/* Templates */}
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Templates</h3>
            <div className="space-y-2">
              <button
                onClick={() => loadTemplate('groundRadiation')}
                className="w-full px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
              >
                Ground Radiation Study
              </button>
              <button
                onClick={() => loadTemplate('spaceflight')}
                className="w-full px-3 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
              >
                Spaceflight Experiment
              </button>
            </div>
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

          {/* Icons and Images */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-3">
              {/* Scientific Images */}
              {scientificImages.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Scientific Images</label>
                  <div className="grid grid-cols-3 gap-2">
                    {scientificImages.map((imageData) => (
                      <button
                        key={imageData.id}
                        onClick={() => addScientificImage(imageData)}
                        className="aspect-square bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center overflow-hidden p-2"
                        title={imageData.name}
                      >
                        <img
                          src={imageData.path}
                          alt={imageData.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<span class="text-xs text-gray-400">Image not found</span>';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Add SVG/PNG files to public/images folder</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Quick Icons</label>
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
            <div className="p-4 border-t border-gray-100 max-h-96 overflow-y-auto">
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

                {(selectedElement.type === 'image' || selectedElement.type === 'scientific-image') && (
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

                {selectedElement.type === 'timeline-line' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Line Height</label>
                      <input
                        type="range"
                        min="100"
                        max="500"
                        value={selectedElement.height}
                        onChange={(e) => updateElement(selectedElement.id, {
                          height: parseInt(e.target.value)
                        })}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500 mt-1">{selectedElement.height}px</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Line Color</label>
                      <input
                        type="color"
                        value={selectedElement.color || '#9CA3AF'}
                        onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                        className="w-full h-8 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Line Width</label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={selectedElement.width}
                        onChange={(e) => updateElement(selectedElement.id, {
                          width: parseInt(e.target.value)
                        })}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500 mt-1">{selectedElement.width}px</div>
                    </div>
                  </>
                )}
                
                {(selectedElement.type === 'text' || selectedElement.type === 'timeline-text') && (
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
                
                {selectedElement.type !== 'timeline-line' && selectedElement.type !== 'timeline-text' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Rotation</label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={selectedElement.rotation || 0}
                      onChange={(e) => updateElement(selectedElement.id, { rotation: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">{selectedElement.rotation || 0}°</div>
                  </div>
                )}
                
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
                    : 'Select and drag to move elements. Double-click text to edit.'
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

              {/* Render timeline lines first (behind everything) */}
              {elements.filter(el => el.type === 'timeline-line').map((element) => (
                <rect
                  key={element.id}
                  x={element.x}
                  y={element.y}
                  width={element.width}
                  height={element.height}
                  fill={element.color || '#9CA3AF'}
                  className={`cursor-pointer ${
                    selectedElement?.id === element.id ? 'opacity-80' : 'opacity-50'
                  }`}
                  onClick={(e) => handleElementClick(e, element)}
                  onMouseDown={(e) => handleElementMouseDown(e, element)}
                />
              ))}

              {/* Connections */}
              {connections.map((connection) => (
                <path
                  key={connection.id}
                  d={getConnectionPath(connection)}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  markerEnd={getMarkerEnd(connection.type)}
                  markerStart={getMarkerStart(connection.type)}
                  fill="none"
                />
              ))}

              {/* Elements (excluding timeline lines which are already rendered) */}
              {elements.filter(el => el.type !== 'timeline-line').map((element) => (
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
                  ) : (element.type === 'text' || element.type === 'timeline-text') ? (
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
                            background: element.type === 'timeline-text' ? 'rgba(255,255,255,0.9)' : 'transparent',
                            fontSize: `${element.fontSize || 14}px`,
                            fontWeight: element.fontWeight || 'normal',
                            textAlign: element.textAlign || 'left',
                            color: element.color || '#000000',
                            padding: '2px',
                          }}
                        />
                      </foreignObject>
                    ) : (
                      <text
                        x={element.x + (element.textAlign === 'center' ? element.width / 2 : element.textAlign === 'right' ? element.width : 0)}
                        y={element.y + element.height / 2}
                        textAnchor={element.textAlign === 'center' ? 'middle' : element.textAlign === 'right' ? 'end' : 'start'}
                        dominantBaseline="middle"
                        fontSize={element.fontSize || 14}
                        fontWeight={element.fontWeight || 'normal'}
                        fill={element.color || '#000000'}
                        className={`cursor-pointer select-none ${
                          selectedElement?.id === element.id ? 'opacity-80' : ''
                        }`}
                        transform={`rotate(${element.rotation || 0}, ${element.x + element.width / 2}, ${element.y + element.height / 2})`}
                        onClick={(e) => handleElementClick(e, element)}
                        onMouseDown={(e) => handleElementMouseDown(e, element)}
                        onDoubleClick={() => handleElementDoubleClick(element)}
                      >
                        {element.content}
                      </text>
                    )
                  ) : (element.type === 'image' || element.type === 'scientific-image') ? (
                    <image
                      x={element.x}
                      y={element.y}
                      width={element.width}
                      height={element.height}
                      href={element.content}
                      className={`cursor-pointer ${
                        selectedElement?.id === element.id ? 'opacity-80' : ''
                      }`}
                      transform={`rotate(${element.rotation || 0}, ${element.x + element.width / 2}, ${element.y + element.height / 2})`}
                      onClick={(e) => handleElementClick(e, element)}
                      onMouseDown={(e) => handleElementMouseDown(e, element)}
                      preserveAspectRatio="xMidYMid meet"
                    />
                  ) : null}
                  
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

              {/* Selection indicator for timeline lines */}
              {selectedElement?.type === 'timeline-line' && tool === 'select' && (
                <rect
                  x={selectedElement.x - 5}
                  y={selectedElement.y - 5}
                  width={selectedElement.width + 10}
                  height={selectedElement.height + 10}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  rx="2"
                />
              )}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphicalAbstractEditor;
