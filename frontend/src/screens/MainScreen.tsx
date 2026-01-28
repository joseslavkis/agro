import { useState } from "react";
import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { useMyFields, useCreateField, useDeleteField } from "@/services/FieldServices";
import { getFieldPhotoUrl } from "@/utils/field-photos";
import styles from "./MainScreen.module.css";

export const MainScreen = () => {
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
  }>({
    name: "",
    hectares: "",
    photo: "",
    imageFile: null,
  });
  const [error, setError] = useState<string | null>(null);

  const handleOpenModal = () => {
    setFormData({ name: "", hectares: "", photo: "", imageFile: null });
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
              <div key={field.id} className={styles.card}>
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
