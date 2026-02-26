import { useState, useEffect, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import esLocale from "@fullcalendar/core/locales/es";

import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { useAgendaEvents, AgendaEvent, EVENT_LABELS } from "@/services/AgendaService";
import EventModal from "@/components/Agenda/EventModal";

import "./AgendaScreen.css";

const EVENT_TYPE_COLORS: Record<string, string> = {
  GENERAL: "#4ade80",
  PURCHASE: "#60a5fa",
  SALE: "#34d399",
  LIVESTOCK_BIRTH: "#a78bfa",
  LIVESTOCK_MOVE: "#fb923c",
  HEALTH: "#f87171",
  LIVESTOCK_EXPENSE: "#fbbf24",
  VACCINATION: "#22d3ee",
  MAINTENANCE: "#94a3b8",
  HARVEST: "#86efac",
  PLANTING: "#6ee7b7",
};

const EVENT_TYPE_ICONS: Record<string, string> = {
  GENERAL: "📋",
  PURCHASE: "🛒",
  SALE: "💰",
  LIVESTOCK_BIRTH: "🐣",
  LIVESTOCK_MOVE: "🚚",
  HEALTH: "🏥",
  LIVESTOCK_EXPENSE: "💸",
  VACCINATION: "💉",
  MAINTENANCE: "🔧",
  HARVEST: "🌾",
  PLANTING: "🌱",
};

function formatEventDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
}

function formatEventTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

export const AgendaScreen = () => {
  const { data: events } = useAgendaEvents();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [initialDate, setInitialDate] = useState<Date | undefined>(undefined);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDateClick = (arg: any) => {
    setSelectedEvent(null);
    setInitialDate(arg.date);
    setModalOpen(true);
  };

  const handleEventClick = (arg: any) => {
    const eventId = Number(arg.event.id);
    const originalEvent = events?.find((e) => e.id === eventId);
    if (originalEvent) {
      setSelectedEvent(originalEvent);
      setInitialDate(undefined);
      setModalOpen(true);
    }
  };

  const calendarEvents = useMemo(
    () =>
      events?.map((event) => ({
        id: String(event.id),
        title: event.title,
        start: event.start,
        end: event.end,
        backgroundColor: EVENT_TYPE_COLORS[event.eventType] || "#4ade80",
        borderColor: "transparent",
        textColor: "#0f172a",
        extendedProps: {
          description: event.description,
          type: event.eventType,
        },
      })) || [],
    [events]
  );

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return (
      events
        ?.filter((e) => new Date(e.start) >= now)
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
        .slice(0, 6) || []
    );
  }, [events]);

  const totalEvents = events?.length || 0;
  const todayEvents =
    events?.filter((e) => {
      const d = new Date(e.start);
      const now = new Date();
      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    }).length || 0;

  return (
    <CommonLayout contentClassName="agenda-screen-wrapper">
      <div className="agenda-screen">
        {/* Header */}
        <div className="agenda-header">
          <div className="agenda-header-left">
            <h1 className="agenda-title">
              {isMobile ? "Agenda" : "Agenda y Calendario"}
            </h1>
            <p className="agenda-subtitle">Gestioná tus eventos del campo</p>
          </div>
          <button
            className="agenda-new-btn"
            onClick={() => {
              setSelectedEvent(null);
              setInitialDate(new Date());
              setModalOpen(true);
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {isMobile ? "Evento" : "Nuevo Evento"}
          </button>
        </div>

        {/* Stats Row */}
        {!isMobile && (
          <div className="agenda-stats-row">
            <div className="agenda-stat-card">
              <span className="agenda-stat-value">{totalEvents}</span>
              <span className="agenda-stat-label">Total de eventos</span>
            </div>
            <div className="agenda-stat-card">
              <span className="agenda-stat-value agenda-stat-green">{todayEvents}</span>
              <span className="agenda-stat-label">Hoy</span>
            </div>
            <div className="agenda-stat-card">
              <span className="agenda-stat-value agenda-stat-blue">{upcomingEvents.length}</span>
              <span className="agenda-stat-label">Proximos</span>
            </div>
          </div>
        )}

        {/* Main Layout: Calendar + Sidebar */}
        <div className={`agenda-main-layout ${isMobile ? "agenda-main-layout--mobile" : ""}`}>
          {/* Calendar Panel */}
          <div className="agenda-calendar-panel">
            <FullCalendar
              key={isMobile ? "mobile" : "desktop"}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              initialView={isMobile ? "listWeek" : "dayGridMonth"}
              headerToolbar={{
                left: isMobile ? "prev,next" : "prev,next today",
                center: "title",
                right: isMobile ? "dayGridMonth,listWeek" : "dayGridMonth,timeGridWeek,listWeek",
              }}
              locale={esLocale}
              events={calendarEvents}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              height="100%"
              buttonText={{
                today: "Hoy",
                month: "Mes",
                week: "Sem",
                day: "Día",
                list: "Lista",
              }}
              eventContent={(eventInfo) => (
                <div className="fc-custom-event">
                  <span className="fc-custom-event-dot" style={{ background: eventInfo.event.backgroundColor }} />
                  <span className="fc-custom-event-title">{eventInfo.event.title}</span>
                </div>
              )}
            />
          </div>

          {/* Sidebar: Upcoming Events */}
          {!isMobile && (
            <aside className="agenda-sidebar">
              <h2 className="agenda-sidebar-title">Proximos Eventos</h2>
              {upcomingEvents.length === 0 ? (
                <div className="agenda-sidebar-empty">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <p>Sin eventos proximos</p>
                </div>
              ) : (
                <ul className="agenda-sidebar-list">
                  {upcomingEvents.map((event) => {
                    const color = EVENT_TYPE_COLORS[event.eventType] || "#4ade80";
                    const icon = EVENT_TYPE_ICONS[event.eventType] || "📋";
                    return (
                      <li
                        key={event.id}
                        className="agenda-sidebar-item"
                        onClick={() => {
                          setSelectedEvent(event);
                          setInitialDate(undefined);
                          setModalOpen(true);
                        }}
                        style={{ borderLeftColor: color }}
                      >
                        <div className="agenda-sidebar-item-icon">{icon}</div>
                        <div className="agenda-sidebar-item-body">
                          <p className="agenda-sidebar-item-title">{event.title}</p>
                          <p className="agenda-sidebar-item-type">
                            {EVENT_LABELS[event.eventType] || event.eventType}
                          </p>
                          <div className="agenda-sidebar-item-time">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span>{formatEventDate(event.start)} · {formatEventTime(event.start)}</span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </aside>
          )}
        </div>
      </div>

      {modalOpen && (
        <EventModal
          event={selectedEvent}
          initialDate={initialDate}
          onClose={() => setModalOpen(false)}
        />
      )}
    </CommonLayout>
  );
};
