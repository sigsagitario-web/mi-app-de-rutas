import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, getDoc, deleteDoc } from 'firebase/firestore';

// Global variables from the environment
const firebaseConfig = process.env.NEXT_PUBLIC_FIREBASE_CONFIG ? JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG) : {
      apiKey: "AIzaSyDaAWwSPXw0ZLM_j2RfIlTzOHhj60kQbJ4",
      authDomain: "mi-app-de-rutas-proyecto.firebaseapp.com",
      projectId: "mi-app-de-rutas-proyecto",
      storageBucket: "mi-app-de-rutas-proyecto.firebasestorage.app",
      messagingSenderId: "458528960775",
      appId: "1:458528960775:web:a15b488612f82d33f195a2"
    };
const initialAuthToken = process.env.NEXT_PUBLIC_INITIAL_AUTH_TOKEN || null;
const appId = firebaseConfig.appId || "default-app";

// Icons (inline SVG)
const svgIcons = {
    clock: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-blue-600">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
        </svg>
    ),
    plus: (
        <svg xmlns="http://www.w3.org/2d0/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    ),
    download: (
        <svg xmlns="http://www.w3.org/2d0/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
        </svg>
    ),
    upload: (
        <svg xmlns="http://www.w3.org/2d0/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
    ),
    alertCircle: (
        <svg xmlns="http://www.w3.org/2d0/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-orange-600">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    ),
    mapPin: (
        <svg xmlns="http://www.w3.org/2d0/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 text-gray-400 mx-auto mb-4">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    ),
    navigation: (
        <svg xmlns="http://www.w3.org/2d0/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-600">
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
        </svg>
    ),
    x: (
        <svg xmlns="http://www.w3.org/2d0/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    ),
    copy: (
        <svg xmlns="http://www.w3.org/2d0/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
    ),
    refresh: (
        <svg xmlns="http://www.w3.org/2d0/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-gray-500 animate-spin mb-4">
            <path d="M21.5 2v6h-6" />
            <path d="M2.5 22v-6h6" />
            <path d="M2.5 16a9 9 0 0 1 16.5-6.5L21.5 8" />
            <path d="M21.5 16a9 9 0 0 1-16.5 6.5L2.5 18" />
        </svg>
    ),
    edit: (
        <svg xmlns="http://www.w3.org/2d0/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
    ),
    trash: (
        <svg xmlns="http://www.w3.org/2d0/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M10 11v6" />
            <path d="M14 11v6" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
    ),
};

// Default event types and options
const defaultEventTypes = {
    despertar: { name: 'Despertar', color: 'bg-yellow-500', icon: '🌅' },
    inicio: { name: 'Inicio de Servicio', color: 'bg-green-500', icon: '🚀' },
    pausa: { name: 'Pausa de Descanso', color: 'bg-blue-500', icon: '☕' },
    llegada: { name: 'Llegada al Destino', color: 'bg-purple-500', icon: '🏁' },
    incidente: { name: 'Incidente', color: 'bg-red-500', icon: '⚠️' },
    mantenimiento: { name: 'Mantenimiento', color: 'bg-orange-500', icon: '🔧' },
    combustible: { name: 'Carga Combustible', color: 'bg-indigo-500', icon: '⛽' },
};

const availableColors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
    'bg-pink-500', 'bg-indigo-500', 'bg-orange-500', 'bg-teal-500', 'bg-cyan-500',
    'bg-lime-500', 'bg-emerald-500', 'bg-violet-500', 'bg-fuchsia-500', 'bg-rose-500'
];

const availableIcons = [
    '🚀', '⚠️', '☕', '🌅', '🏁', '🔧', '⛽', '📍', '🚛', '🚗', '⏰', '📋',
    '✅', '❌', '🔄', '📞', '💼', '🍽️', '🛣️', '🎯', '📊', '🔔', '💡', '🎉'
];

// Helper functions
const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
};

const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const mins = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${mins} ${ampm}`;
};

const calculateRouteMetrics = (events, eventTypes) => {
    if (events.length < 2) return null;

    const firstEvent = events[0];
    const lastEvent = events[events.length - 1];
    const totalDuration = (lastEvent.timestamp - firstEvent.timestamp) / (1000 * 60);

    const firstWake = events.find(e => e.type === 'despertar');
    const firstStart = events.find(e => e.type === 'inicio');
    let wakeToStartDuration = null;
    if (firstWake && firstStart && firstStart.timestamp > firstWake.timestamp) {
        wakeToStartDuration = (firstStart.timestamp - firstWake.timestamp) / (1000 * 60);
    }

    const restHours = 8;
    const nextWakeUpTime = new Date(lastEvent.timestamp + (restHours * 60 * 60 * 1000));
    const suggestedNextWakeUpTime = formatTime(nextWakeUpTime.getTime());

    const alerts = [];
    const descansoEvents = events.filter(e => e.type === 'pausa');
    if (descansoEvents.length === 0) {
        alerts.push({ type: 'warning', message: 'No se registraron pausas de descanso' });
    }

    if (wakeToStartDuration !== null && wakeToStartDuration < 30) {
        alerts.push({ type: 'warning', message: `Descanso previo al servicio muy corto (${formatDuration(wakeToStartDuration)}).` });
    }
    if (wakeToStartDuration !== null && wakeToStartDuration > 120) {
        alerts.push({ type: 'warning', message: `Descanso previo al servicio demasiado largo (${formatDuration(wakeToStartDuration)}).` });
    }

    return {
        totalDuration: Math.round(totalDuration),
        totalEvents: events.length,
        wakeToStartDuration: wakeToStartDuration ? Math.round(wakeToStartDuration) : null,
        nextWakeUpTime: suggestedNextWakeUpTime,
        alerts,
    };
};

const escapeCsv = (val) => {
    if (!val) return '';
    let str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        str = '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
};

// Main App Component
const App = () => {
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [routes, setRoutes] = useState({});
    const [eventTypes, setEventTypes] = useState(defaultEventTypes);
    const [selectedRoute, setSelectedRoute] = useState('');
    const [viewMode, setViewMode] = useState('timeline');
    const [modal, setModal] = useState({ isOpen: false, type: null, data: null });
    const [isAuthReady, setIsAuthReady] = useState(false);

    // Initialize Firebase
useEffect(() => {
  const app = initializeApp(firebaseConfig);
  const authInstance = getAuth(app);
  const dbInstance = getFirestore(app);
  setAuth(authInstance);
  setDb(dbInstance);

  // Autenticación anónima inmediata
  signInAnonymously(authInstance)
    .then((userCredential) => {
      setUserId(userCredential.user.uid);
      setIsAuthReady(true); // Aquí activas los listeners de Firestore
    })
    .catch((error) => {
      console.error('Error en autenticación anónima:', error);
      setIsAuthReady(true); // Evita pantalla negra aunque falle
    });

}, []);



    // Firestore listeners
    useEffect(() => {
        if (!isAuthReady || !db || !userId) return;

        // Listener for event types
        const eventTypesPath = `artifacts/${appId}/users/${userId}/eventTypes`;
        const eventTypesRef = doc(collection(db, eventTypesPath), 'custom_types');
        const unsubscribeEventTypes = onSnapshot(eventTypesRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setEventTypes({ ...defaultEventTypes, ...data });
            } else {
                setEventTypes(defaultEventTypes);
            }
        }, (error) => {
            console.error("Error getting event types:", error);
        });

        // Listener for routes
        const routesPath = `artifacts/${appId}/users/${userId}/routes`;
        const routesRef = collection(db, routesPath);
        const unsubscribeRoutes = onSnapshot(routesRef, (querySnapshot) => {
            const newRoutes = {};
            querySnapshot.forEach((doc) => {
                const routeData = doc.data();
                const sortedEvents = (routeData.events || []).sort((a, b) => a.timestamp - b.timestamp);
                newRoutes[doc.id] = sortedEvents;
            });
            setRoutes(newRoutes);
        }, (error) => {
            console.error("Error getting routes:", error);
        });

        return () => {
            unsubscribeEventTypes();
            unsubscribeRoutes();
        };
    }, [isAuthReady, db, userId]);

    // Modal Handlers
    const openModal = (type, data = null) => {
        setModal({ isOpen: true, type, data });
    };

    const closeModal = () => {
        setModal({ isOpen: false, type: null, data: null });
    };

    // Data Operations
    const addOrUpdateEvent = async (eventId = null) => {
        const routeCode = document.getElementById('route-code').value.toUpperCase().trim();
        const eventType = document.getElementById('event-type').value;
        const time = document.getElementById('event-time').value;
        const observations = document.getElementById('event-observations').value;

        if (!routeCode || !time || !userId) return;

        const routeRef = doc(db, `artifacts/${appId}/users/${userId}/routes`, routeCode);
        const timestamp = new Date(`2024-01-01T${time}`).getTime();
        const newEventData = {
            id: eventId || Date.now(),
            type: eventType,
            name: eventTypes[eventType]?.name,
            time,
            observations,
            timestamp,
        };

        try {
            const docSnap = await getDoc(routeRef);
            let updatedEvents;
            if (docSnap.exists()) {
                const currentEvents = docSnap.data().events || [];
                if (eventId) {
                    updatedEvents = currentEvents.map(event => event.id === eventId ? newEventData : event);
                } else {
                    updatedEvents = [...currentEvents, newEventData];
                }
            } else {
                updatedEvents = [newEventData];
            }
            updatedEvents.sort((a, b) => a.timestamp - b.timestamp);
            await setDoc(routeRef, { events: updatedEvents });
            closeModal();
            setSelectedRoute(routeCode);
        } catch (e) {
            console.error("Error saving event:", e);
        }
    };

    const deleteEvent = async (eventId) => {
        if (!selectedRoute || !userId) return;
        const routeRef = doc(db, `artifacts/${appId}/users/${userId}/routes`, selectedRoute);
        const routeData = routes[selectedRoute];
        if (!routeData) return;
        const updatedEvents = routeData.filter(event => event.id !== eventId);
        try {
            await setDoc(routeRef, { events: updatedEvents });
            closeModal();
        } catch (e) {
            console.error("Error deleting event:", e);
        }
    };

    const addEventType = async () => {
        const key = document.getElementById('type-key').value.toLowerCase().replace(/\s+/g, '_').trim();
        const name = document.getElementById('type-name').value.trim();
        const selectedColorBtn = document.querySelector('.event-color-btn.ring-4');
        const selectedIconBtn = document.querySelector('.event-icon-btn.bg-blue-100');
        const color = selectedColorBtn?.dataset.color || 'bg-blue-500';
        const icon = selectedIconBtn?.dataset.icon || '📍';

        if (!key || !name || !userId || eventTypes[key]) {
            // Handle validation error
            return;
        }

        const eventTypesRef = doc(db, `artifacts/${appId}/users/${userId}/eventTypes`, 'custom_types');
        try {
            await setDoc(eventTypesRef, { [key]: { name, color, icon } }, { merge: true });
            closeModal();
        } catch (e) {
            console.error("Error adding event type:", e);
        }
    };

    const deleteEventType = async (key) => {
        if (defaultEventTypes[key] || !userId) return;
        const eventTypesRef = doc(db, `artifacts/${appId}/users/${userId}/eventTypes`, 'custom_types');
        try {
            const docSnap = await getDoc(eventTypesRef);
            if (docSnap.exists()) {
                const newCustomTypes = { ...docSnap.data() };
                delete newCustomTypes[key];
                await setDoc(eventTypesRef, newCustomTypes);
            }
        } catch (e) {
            console.error("Error deleting event type:", e);
        }
    };

    const updateRouteCode = async () => {
        const newCode = document.getElementById('new-route-code')?.value.toUpperCase().trim();
        if (!newCode || !selectedRoute || newCode === selectedRoute || !userId) {
            closeModal();
            return;
        }

        try {
            const oldRouteRef = doc(db, `artifacts/${appId}/users/${userId}/routes`, selectedRoute);
            const newRouteRef = doc(db, `artifacts/${appId}/users/${userId}/routes`, newCode);
            const docSnap = await getDoc(oldRouteRef);
            if (docSnap.exists()) {
                await setDoc(newRouteRef, docSnap.data());
                await deleteDoc(oldRouteRef);
                setSelectedRoute(newCode);
            }
            closeModal();
        } catch (e) {
            console.error("Error updating route code:", e);
        }
    };

    const deleteRoute = async () => {
        if (!selectedRoute || !userId) return;
        try {
            const routeRef = doc(db, `artifacts/${appId}/users/${userId}/routes`, selectedRoute);
            await deleteDoc(routeRef);
            setSelectedRoute('');
        } catch (e) {
            console.error("Error deleting route:", e);
        }
    };
    
    // CSV Export
    const exportToCsv = () => {
        const routeCode = selectedRoute;
        const routeEvents = routes[routeCode] || [];
        const headers = ["CódigoRuta", "Evento", "Tipo", "Hora", "Observación"];
        
        let csvContent = headers.map(escapeCsv).join(',') + '\n';
        
        routeEvents.forEach(event => {
            const row = [
                routeCode,
                event.name,
                eventTypes[event.type]?.name || event.type,
                event.time,
                event.observations
            ].map(escapeCsv).join(',');
            csvContent += row + '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Ruta_${routeCode}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Render components based on state
    const renderHeader = () => (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {svgIcons.clock}
                Sistema de Gestión de Rutas
            </h1>
            <p className="text-gray-600 mt-2">Gestiona y visualiza las líneas de tiempo de las rutas de conductores.</p>
        </div>
    );

    const renderControls = () => (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-4 items-center">
                    <button
                        onClick={() => openModal('addEvent')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        {svgIcons.plus}
                        Agregar Evento
                    </button>
                    
                    <select
                        value={selectedRoute}
                        onChange={(e) => setSelectedRoute(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[150px]"
                    >
                        <option value="">Seleccionar Ruta</option>
                        {Object.keys(routes).map(routeCode => (
                            <option key={routeCode} value={routeCode}>{routeCode}</option>
                        ))}
                    </select>

                    {selectedRoute && (
                        <button
                            onClick={exportToCsv}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            {svgIcons.download}
                            Exportar CSV
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setViewMode('timeline')}
                        className={`px-3 py-2 rounded-lg ${viewMode === 'timeline' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        Timeline
                    </button>
                    <button
                        onClick={() => setViewMode('analytics')}
                        className={`px-3 py-2 rounded-lg ${viewMode === 'analytics' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        Análisis
                    </button>
                    <button
                        onClick={() => setViewMode('events')}
                        className={`px-3 py-2 rounded-lg ${viewMode === 'events' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        Tipos de Eventos
                    </button>
                </div>
            </div>
        </div>
    );

    const renderUserIdSection = () => (
        <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm font-medium text-gray-600 truncate">
                ID de Usuario: <span className="font-mono text-gray-800">{userId}</span>
            </span>
            <button
                onClick={() => navigator.clipboard.writeText(userId)}
                className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition-colors"
            >
                {svgIcons.copy}
                Copiar ID
            </button>
        </div>
    );

    const renderEmptyState = () => (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            {svgIcons.mapPin}
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay rutas registradas</h3>
            <p className="text-gray-500 mb-6">Agrega un nuevo evento para crear tu primera ruta.</p>
            <button
                onClick={() => openModal('addEvent')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
                Agregar Primer Evento
            </button>
        </div>
    );

    const renderTimeline = (routeCode, events) => (
        <div className="relative p-6 bg-white rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    {svgIcons.navigation}
                    Ruta: {routeCode}
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => openModal('editRoute')}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        {svgIcons.edit}
                        Editar
                    </button>
                    <button
                        onClick={deleteRoute}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        {svgIcons.trash}
                        Eliminar
                    </button>
                </div>
            </div>
            <div className="relative overflow-x-auto pb-6">
                <div className="flex items-center min-w-max relative">
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-300"></div>
                    {events.map((event, index) => {
                        const eventType = eventTypes[event.type] || { color: 'bg-gray-500', name: event.name, icon: '❓' };
                        const prevEvent = index > 0 ? events[index - 1] : null;
                        const duration = prevEvent ? (event.timestamp - prevEvent.timestamp) / (1000 * 60) : 0;
                        return (
                            <div key={event.id} className="relative flex flex-col items-center mr-12 last:mr-0 group" onClick={() => openModal('editEvent', event)}>
                                {prevEvent && (
                                    <>
                                        <div className="duration-line w-12 left-0 -translate-x-full"></div>
                                        <div className="duration-label left-0 -translate-x-1/2 -mt-4">{formatDuration(duration)}</div>
                                    </>
                                )}
                                <div className={`w-4 h-4 rounded-full ${eventType.color} border-4 border-white shadow-lg z-10`}></div>
                                <div className="mt-4 text-center min-w-max">
                                    <div className="text-lg font-bold text-gray-800">{event.time}</div>
                                    <div className="text-sm font-medium text-gray-600 mt-1">{event.name}</div>
                                    <div className="text-xs text-gray-500 mt-1">{eventType.icon}</div>
                                    {event.observations && (
                                        <p className="text-xs text-gray-500 mt-1 max-w-[150px] line-clamp-2">{event.observations}</p>
                                    )}
                                </div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                                    <button onClick={(e) => { e.stopPropagation(); openModal('editEvent', event); }} className="bg-white p-2 rounded-full shadow-md text-blue-500 hover:bg-blue-100">{svgIcons.edit}</button>
                                    <button onClick={(e) => { e.stopPropagation(); deleteEvent(event.id); }} className="bg-white p-2 rounded-full shadow-md text-red-500 hover:bg-red-100">{svgIcons.trash}</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    const renderRouteMetrics = (routeCode, events) => {
        const metrics = calculateRouteMetrics(events, eventTypes);
        if (!metrics) {
            return (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Métricas de Ruta</h3>
                    <p className="text-gray-600">No hay suficientes eventos para calcular métricas.</p>
                </div>
            );
        }

        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    {svgIcons.alertCircle}
                    Análisis de Ruta: {routeCode}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{formatDuration(metrics.totalDuration)}</div>
                        <div className="text-sm text-gray-600">Duración Total</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{metrics.totalEvents}</div>
                        <div className="text-sm text-gray-600">Total Eventos</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{metrics.wakeToStartDuration !== null ? formatDuration(metrics.wakeToStartDuration) : 'N/A'}</div>
                        <div className="text-sm text-gray-600">Descanso Previo</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{metrics.nextWakeUpTime}</div>
                        <div className="text-sm text-gray-600">Próximo Despertar Sugerido</div>
                    </div>
                </div>
                {metrics.alerts.length > 0 && (
                    <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Alertas</h4>
                        {metrics.alerts.map((alert, index) => (
                            <div key={index} className={`p-3 rounded-lg mb-2 ${alert.type === 'danger' ? 'bg-red-50 text-red-800' : 'bg-yellow-50 text-yellow-800'}`}>
                                {svgIcons.alertCircle}
                                {alert.message}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderEventTypesManager = () => (
        <div className="bg-white rounded-xl shadow-lg p-6 w-full lg:w-2/3 mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    {svgIcons.plus}
                    Gestión de Tipos de Eventos
                </h3>
                <button
                    onClick={() => openModal('addEventType')}
                    className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                    {svgIcons.plus}
                    Nuevo Tipo
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(eventTypes).map(([key, eventType]) => {
                    const isDefault = !!defaultEventTypes[key];
                    return (
                        <div key={key} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full ${eventType.color}`}></div>
                                    <span className="text-2xl">{eventType.icon}</span>
                                    <div>
                                        <div className="font-semibold text-gray-800">{eventType.name}</div>
                                        <div className="text-xs text-gray-500">{key}</div>
                                    </div>
                                </div>
                                {!isDefault && (
                                    <button onClick={() => deleteEventType(key)} className="text-red-500 hover:text-red-700 p-1" title="Eliminar tipo de evento">
                                        {svgIcons.x}
                                    </button>
                                )}
                            </div>
                            <div className="text-xs text-gray-600">
                                {isDefault ? 'Tipo por defecto' : 'Tipo personalizado'}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
    
    // Modals
    const renderModalContent = () => {
        if (!modal.isOpen) return null;

        const { type, data } = modal;
        const isEditing = data !== null;

        switch (type) {
            case 'addEvent':
            case 'editEvent':
                const initialEventType = data?.type || Object.keys(eventTypes)[0];
                return (
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">{isEditing ? 'Editar Evento' : 'Agregar Evento'}</h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">{svgIcons.x}</button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Código de Ruta</label>
                                <input type="text" id="route-code" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="RUTA_001" defaultValue={selectedRoute} disabled={isEditing} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Evento</label>
                                <select id="event-type" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" defaultValue={initialEventType}>
                                    {Object.entries(eventTypes).map(([key, type]) => (
                                        <option key={key} value={key}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                                <input type="time" id="event-time" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" defaultValue={data?.time || ''} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                                <textarea id="event-observations" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" rows="3" placeholder="Detalles adicionales..." defaultValue={data?.observations || ''}></textarea>
                            </div>
                            <div className="flex gap-3 pt-4">
                                {isEditing ? (
                                    <>
                                        <button onClick={() => addOrUpdateEvent(data.id)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors">Guardar Cambios</button>
                                        <button onClick={() => deleteEvent(data.id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition-colors">Eliminar</button>
                                    </>
                                ) : (
                                    <button onClick={() => addOrUpdateEvent(null)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors">Guardar Evento</button>
                                )}
                                <button onClick={closeModal} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg font-medium transition-colors">Cancelar</button>
                            </div>
                        </div>
                    </div>
                );
            case 'addEventType':
                return (
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Agregar Tipo de Evento</h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">{svgIcons.x}</button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Clave del Evento</label>
                                <input type="text" id="type-key" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="ej: revision, carga" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Evento</label>
                                <input type="text" id="type-name" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="ej: Revisión Técnica" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                <div className="grid grid-cols-5 gap-2" id="color-picker">
                                    {availableColors.map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={`w-10 h-10 rounded-lg event-color-btn ${color}`}
                                            onClick={(e) => {
                                                document.querySelectorAll('#color-picker button').forEach(b => b.classList.remove('ring-4', 'ring-gray-300'));
                                                e.currentTarget.classList.add('ring-4', 'ring-gray-300');
                                            }}
                                            data-color={color}
                                        ></button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Icono</label>
                                <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto" id="icon-picker">
                                    {availableIcons.map(icon => (
                                        <button
                                            key={icon}
                                            type="button"
                                            className="text-2xl p-2 rounded-lg hover:bg-gray-100 event-icon-btn"
                                            onClick={(e) => {
                                                document.querySelectorAll('#icon-picker button').forEach(b => b.classList.remove('bg-blue-100', 'ring-2', 'ring-blue-500'));
                                                e.currentTarget.classList.add('bg-blue-100', 'ring-2', 'ring-blue-500');
                                            }}
                                            data-icon={icon}
                                        >{icon}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={addEventType} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors">Crear Tipo de Evento</button>
                                <button onClick={closeModal} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg font-medium transition-colors">Cancelar</button>
                            </div>
                        </div>
                    </div>
                );
            case 'editRoute':
                return (
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Editar Ruta</h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">{svgIcons.x}</button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Código de Ruta Actual</label>
                                <input type="text" defaultValue={selectedRoute} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100" disabled />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nuevo Código de Ruta</label>
                                <input type="text" id="new-route-code" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Nuevo código" />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={updateRouteCode} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors">Guardar Cambios</button>
                                <button onClick={closeModal} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg font-medium transition-colors">Cancelar</button>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };
    
    // Main App UI
    if (!isAuthReady) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    {svgIcons.refresh}
                    <p className="text-lg font-semibold text-gray-600">Cargando datos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-8 font-sans">
            <style>
                {`
                    .duration-line {
                        position: absolute;
                        top: 24px;
                        height: 2px;
                        background-color: #d1d5db;
                        z-index: 5;
                    }
                    .duration-label {
                        position: absolute;
                        top: 10px;
                        transform: translateX(-50%);
                        white-space: nowrap;
                        font-size: 0.75rem;
                        color: #4b5563;
                        background-color: #f9fafb;
                        padding: 2px 6px;
                        border-radius: 9999px;
                        border: 1px solid #e5e7eb;
                        z-index: 10;
                    }
                    .modal-overlay {
                        transition: opacity 0.3s ease-in-out;
                    }
                `}
            </style>
            <div className="max-w-7xl mx-auto space-y-6">
                {renderHeader()}
                {renderControls()}
                {userId && renderUserIdSection()}
                {Object.keys(routes).length === 0 ? renderEmptyState() : (
                    <>
                        {viewMode === 'events' ? renderEventTypesManager() : (
                            selectedRoute && routes[selectedRoute] ? (
                                viewMode === 'timeline' ? renderTimeline(selectedRoute, routes[selectedRoute]) : renderRouteMetrics(selectedRoute, routes[selectedRoute])
                            ) : (
                                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Selecciona una ruta</h3>
                                    <p className="text-gray-500">Selecciona una ruta del menú desplegable o agrega un nuevo evento para ver su línea de tiempo.</p>
                                </div>
                            )
                        )}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Resumen de Rutas</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" id="routes-summary">
                                {Object.entries(routes).map(([routeCode, events]) => (
                                    <div
                                        key={routeCode}
                                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${selectedRoute === routeCode ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                                        onClick={() => setSelectedRoute(routeCode)}
                                    >
                                        <div className="font-semibold text-gray-800">{routeCode}</div>
                                        <div className="text-sm text-gray-600 mt-1">{events.length} eventos</div>
                                        <div className="text-xs text-gray-500 mt-2">
                                            {events.length > 0 ? `${formatTime(events[0].timestamp)} - ${formatTime(events[events.length - 1].timestamp)}` : ''}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
            {modal.isOpen && (
                <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    {renderModalContent()}
                </div>
            )}
        </div>
    );
};

export default App;

