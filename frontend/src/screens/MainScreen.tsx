import { useState } from "react";
import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { useMyFields, useCreateField, useDeleteField } from "@/services/FieldServices";
import { getFieldPhotoUrl } from "@/utils/field-photos";
import styles from "./MainScreen.module.css";
import { useLocation } from "wouter";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Fix for Leaflet default icon
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition }: { position: { lat: number, lng: number } | null, setPosition: (pos: { lat: number, lng: number }) => void }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  )
}

export const MainScreen = () => {
  const [_, setLocation] = useLocation();
  const { data: fields, isLoading } = useMyFields();
  const { mutateAsync: createField, isPending: isCreating } = useCreateField();
  const { mutateAsync: deleteField, isPending: isDeleting } = useDeleteField();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    hectares: string;
    photo: string;
    imageFile: File | null;
    hasAgriculture: boolean;
    hasLivestock: boolean;
    latitude: number | null;
    longitude: number | null;
  }>({
    name: "",
    hectares: "",
    photo: "",
    imageFile: null,
    hasAgriculture: false,
    hasLivestock: false,
    latitude: null,
    longitude: null,
  });
  const [error, setError] = useState<string | null>(null);

  const handleOpenModal = () => {
    setFormData({ name: "", hectares: "", photo: "", imageFile: null, hasAgriculture: false, hasLivestock: false, latitude: null, longitude: null });
    setError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setDeleteConfirmationId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmationId === null) return;
    try {
      await deleteField(deleteConfirmationId);
      setDeleteConfirmationId(null);
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el campo");
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmationId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const hectaresVal = parseFloat(formData.hectares);
    if (!formData.name.trim()) {
      setError("El nombre es requerido");
      return;
    }
    if (isNaN(hectaresVal) || hectaresVal <= 0) {
      setError("Ingrese un número válido de hectáreas");
      return;
    }

    try {
      await createField({
        name: formData.name,
        hectares: hectaresVal,
        photo: formData.photo || undefined,
        imageFile: formData.imageFile,
        hasAgriculture: formData.hasAgriculture,
        hasLivestock: formData.hasLivestock,
        latitude: formData.latitude ?? undefined,
        longitude: formData.longitude ?? undefined,
      });
      handleCloseModal();
    } catch (err) {
      console.error(err);
      setError("Error al crear el campo. Intente nuevamente.");
    }
  };

  if (isLoading) {
    return (
      <CommonLayout>
        <div className={styles.container}>
          <h2 style={{ color: "white" }}>Cargando campos...</h2>
        </div>
      </CommonLayout>
    );
  }

  return (
    <CommonLayout>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Mis Campos</h1>
          <button className={styles.addButton} onClick={handleOpenModal}>
            + Nuevo Campo
          </button>
        </header>

        <div className={styles.grid}>
          {fields && fields.length > 0 ? (
            fields.map((field) => (
              <div
                key={field.id}
                className={styles.card}
                onClick={() => setLocation(`/fields/${field.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.cardImageWrapper}>
                  <img
                    src={getFieldPhotoUrl(field.photo)}
                    alt={field.name}
                    className={styles.cardImage}
                  />
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{field.name}</h3>
                  <div className={styles.cardSubtitle}>
                    <span>🌱</span>
                    <span>{field.hectares} Hectáreas</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {field.hasAgriculture && (
                      <span style={{ fontSize: '0.8rem', background: '#059669', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        🌾 Agri
                      </span>
                    )}
                    {field.hasLivestock && (
                      <span style={{ fontSize: '0.8rem', background: '#d97706', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        🐄 Gan
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className={styles.cardDeleteButton}
                  onClick={(e) => handleDeleteClick(e, field.id)}
                  title="Eliminar campo"
                >
                  🗑️
                </button>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <h2>No tienes campos aún</h2>
              <p>Crea tu primer campo para comenzar a gestionar tu producción.</p>
            </div>
          )}
        </div>

        {isModalOpen && (
          <div className={styles.modalOverlay} onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}>
            <div className={styles.modalContent}>
              <h2 className={styles.h2}>Nuevo Campo</h2>
              <form onSubmit={handleSubmit}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Nombre del Campo</label>
                  <input
                    className={styles.input}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ej. La Estancia"
                    autoFocus
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Hectáreas</label>
                  <input
                    className={styles.input}
                    type="number"
                    step="0.1"
                    value={formData.hectares}
                    onChange={(e) =>
                      setFormData({ ...formData, hectares: e.target.value })
                    }
                    placeholder="Ej. 150.5"
                  />
                </div>

                <div className={styles.inputGroup} style={{ flexDirection: 'row', gap: '2rem' }}>
                  <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.hasAgriculture}
                      onChange={(e) => setFormData({ ...formData, hasAgriculture: e.target.checked })}
                      style={{ width: '1.2rem', height: '1.2rem', accentColor: '#10b981' }}
                    />
                    Agricultura
                  </label>
                  <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.hasLivestock}
                      onChange={(e) => setFormData({ ...formData, hasLivestock: e.target.checked })}
                      style={{ width: '1.2rem', height: '1.2rem', accentColor: '#10b981' }}
                    />
                    Ganadería
                  </label>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Ubicación (Marque en el mapa)</label>
                  <div style={{ height: '300px', width: '100%', borderRadius: '0.5rem', overflow: 'hidden' }}>
                    <MapContainer center={[-34.6, -58.4]} zoom={5} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <LocationMarker
                        position={formData.latitude !== null && formData.longitude !== null ? { lat: formData.latitude, lng: formData.longitude! } : null}
                        setPosition={(pos) => setFormData({ ...formData, latitude: pos.lat, longitude: pos.lng })}
                      />
                    </MapContainer>
                  </div>
                  {formData.latitude && formData.longitude && (
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                      Lat: {formData.latitude.toFixed(4)}, Lng: {formData.longitude.toFixed(4)}
                    </div>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Foto del Campo (Opcional)</label>

                  {!formData.imageFile ? (
                    <div className={styles.fileUploadContainer}>
                      <div className={styles.fileDropZone}>
                        <div className={styles.uploadIcon}>📷</div>
                        <div>Arrastra tu imagen aquí o haz clic</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.2rem' }}>JPG, PNG, WebP</div>
                        <input
                          className={styles.hiddenInput}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            if (file) setFormData({ ...formData, imageFile: file });
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className={styles.selectedFile}>
                      <span style={{ fontSize: '1.2rem' }}>🖼️</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {formData.imageFile.name}
                      </span>
                      <button
                        type="button"
                        className={styles.removeFile}
                        onClick={() => setFormData({ ...formData, imageFile: null })}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                {error && (
                  <div style={{ color: "#ff6b6b", marginBottom: "1rem" }}>
                    {error}
                  </div>
                )}

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={handleCloseModal}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isCreating}
                  >
                    {isCreating ? "Creando..." : "Crear Campo"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deleteConfirmationId !== null && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent} style={{ maxWidth: '400px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
              <h2 className={styles.h2} style={{ marginBottom: '1rem' }}>¿Eliminar campo?</h2>
              <p style={{ color: '#cbd5e1', marginBottom: '2rem' }}>
                ¿Estás seguro de que deseas eliminar este campo? Esta acción no se puede deshacer.
              </p>
              <div className={styles.modalActions}>
                <button
                  className={styles.cancelButton}
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
                <button
                  className={styles.submitButton}
                  style={{ background: '#ef4444' }}
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CommonLayout >
  );
};
