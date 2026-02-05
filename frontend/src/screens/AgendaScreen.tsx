import { useState, useEffect } from "react";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';

import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { useAgendaEvents, AgendaEvent } from "@/services/AgendaService";
import { EventModal } from "@/components/Agenda/EventModal";

export const AgendaScreen = () => {
    const { data: events } = useAgendaEvents();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
    const [initialDate, setInitialDate] = useState<Date | undefined>(undefined);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleDateClick = (arg: any) => {
        setSelectedEvent(null);
        setInitialDate(arg.date);
        setModalOpen(true);
    };

    const handleEventClick = (arg: any) => {
        const eventId = Number(arg.event.id);
        const originalEvent = events?.find(e => e.id === eventId);

        if (originalEvent) {
            setSelectedEvent(originalEvent);
            setInitialDate(undefined);
            setModalOpen(true);
        }
    };

    const calendarEvents = events?.map(event => ({
        id: String(event.id),
        title: event.title,
        start: event.start,
        end: event.end,
        backgroundColor: event.color || '#3b82f6',
        borderColor: event.color || '#3b82f6',
        extendedProps: {
            description: event.description,
            type: event.eventType
        }
    })) || [];

    return (
        <CommonLayout contentClassName="agenda-screen">
            <div style={{ padding: isMobile ? "80px 10px 20px" : "80px 20px 20px", maxWidth: "1200px", margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h1 style={{ fontSize: isMobile ? "1.5rem" : "2rem", fontWeight: "bold", color: "white" }}>
                        {isMobile ? "Agenda" : "Agenda y Calendario"}
                    </h1>
                    <button
                        onClick={() => { setSelectedEvent(null); setInitialDate(new Date()); setModalOpen(true); }}
                        style={{
                            backgroundColor: "#3b82f6",
                            color: "white",
                            padding: isMobile ? "0.5rem 1rem" : "0.75rem 1.5rem",
                            borderRadius: "0.5rem",
                            fontWeight: "bold",
                            border: "none",
                            cursor: "pointer",
                            fontSize: isMobile ? "0.9rem" : "1rem",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                        }}
                    >
                        {isMobile ? "+ Evento" : "+ Nuevo Evento"}
                    </button>
                </div>

                <div style={{ padding: "0.5rem", backgroundColor: "white", borderRadius: "0.75rem", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", height: "80vh", display: "flex", flexDirection: "column" }}>
                    <FullCalendar
                        key={isMobile ? 'mobile' : 'desktop'} // Force re-render on view change
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                        initialView={isMobile ? "listWeek" : "dayGridMonth"}
                        headerToolbar={{
                            left: isMobile ? 'prev,next' : 'prev,next today',
                            center: 'title',
                            right: isMobile ? 'dayGridMonth,listWeek' : 'dayGridMonth,timeGridWeek,listWeek'
                        }}
                        locale={esLocale}
                        events={calendarEvents}
                        dateClick={handleDateClick}
                        eventClick={handleEventClick}
                        height="100%"
                        buttonText={{
                            today: 'Hoy',
                            month: 'Mes',
                            week: 'Sem',
                            day: 'Día',
                            list: 'Lista'
                        }}
                    />
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
